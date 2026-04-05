import "./StudentDashboard.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentProfile } from "../../services/studentService";
import apiClient from "../../services/apiClient";

export default function StudentDashboard() {
  const { regNo } = useParams();

  const [student, setStudent] = useState(null);
  const [transport, setTransport] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [ledger, setLedger] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [printFullPage, setPrintFullPage] = useState(false);

  // 🔹 Load data
  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
    fetchTransport();
    fetchRoutes();
    fetchLedger();
  }, [regNo]);

  const fetchTransport = async () => {
    try {
      const res = await apiClient.get(`/student-transportation/${regNo}`);
      setTransport(res.data);
    } catch {
      setTransport(null);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await apiClient.get("/config/transport");
      setRoutes(res.data || []);
    } catch {
      setRoutes([]);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await apiClient.get(`/ledger/${regNo}`);
      setLedger(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLedger([]);
    }
  };

  // 🔹 Generate next 6 months
  const getNextSixMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i + 1);

      months.push({
        month: date.toLocaleString("default", { month: "long" }),
        year: date.getFullYear()
      });
    }

    return months;
  };

  const feeMonths = getNextSixMonths();

  // 🔹 Transport toggle
  const handleTransportToggle = async () => {
    const confirmMsg = transport
      ? "Stop transport service?"
      : "Start transport service?";

    if (!window.confirm(confirmMsg)) return;

    setLoadingTransport(true);

    try {
      if (transport) {
        await apiClient.post("/student-transportation/stop", null, {
          params: { regNo }
        });
        setTransport(null);
      } else {
        const defaultRouteId = routes.length ? routes[0].transportFeeId : 2;

        await apiClient.post("/student-transportation/assign", null, {
          params: { regNo, transportFeeId: defaultRouteId }
        });

        await fetchTransport();
      }
    } catch {
      alert("Transport update failed");
    } finally {
      setLoadingTransport(false);
    }
  };

  const handleRouteChange = async (routeId) => {
    if (!routeId || !transport) return;

    try {
      await apiClient.put("/student-transportation/change-route", null, {
        params: { regNo, transportFeeId: routeId }
      });
      await fetchTransport();
    } catch {
      alert("Route change failed");
    }
  };

  if (!student) return <p>Loading...</p>;

  return (
    <div className="student-bg">
      <div className={`dashboard-card ${printFullPage ? "print-full" : ""}`}>

        {/* HEADER */}
        <header className="dashboard-header">
          <h1>{student.name}</h1>
          <p>Reg No: {student.registrationNumber} | Class: {student.currentClass}</p>
        </header>

        {/* STUDENT DETAILS */}
        <div className="section">
          <h2>👤 Student Details</h2>
          <div className="info-grid">
            <p><b>Father:</b> {student.fatherName}</p>
            <p><b>Mother:</b> {student.motherName}</p>
            <p><b>Mobile:</b> {student.mobileNumber}</p>
          </div>
        </div>

        {/* TRANSPORT */}
        <div className="section">
          <h2>🚌 Transport</h2>

          <div className="transport-row">
            <span>
              Uses Transport:{" "}
              <span style={{ color: transport ? "#00e676" : "#ff5252" }}>
                {transport ? "Yes" : "No"}
              </span>
            </span>

            <label className="switch">
              <input
                type="checkbox"
                checked={!!transport}
                onChange={handleTransportToggle}
                disabled={loadingTransport}
              />
              <span className="slider"></span>
            </label>
          </div>

          {transport && (
            <select
              defaultValue={transport.transportFeeId}
              onChange={(e) => handleRouteChange(Number(e.target.value))}
            >
              {routes.map(route => (
                <option key={route.transportFeeId} value={route.transportFeeId}>
                  {route.routeName} — ₹{route.amount}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="section">
          <h2>📅 Fee Timeline</h2>

          <div className="months">

            {/* 🔵 PAST + CURRENT (FROM LEDGER) */}
            {ledger.map((entry, i) => (
              <div
                key={`past-${i}`}
                className={`month
                  ${entry.status === "PAID" ? "paid-box" : ""}
                  ${entry.status === "PARTIAL" ? "partial-box" : ""}
                  ${entry.status === "DUE" ? "unpaid-box" : ""}
                `}
                onClick={() =>
                  entry.status === "PAID" && setSelectedReceipt(entry)
                }
              >
                {entry.month} {entry.year}
              </div>
            ))}

            {/* ⚪ FUTURE 6 MONTHS */}
            {feeMonths.map((m, i) => (
              <div key={`future-${i}`} className="month future-tile">
                {m.month} {m.year}
              </div>
            ))}

          </div>
        </div>

        {/* RECEIPT MODAL */}
        {selectedReceipt && (
          <div className="receipt-modal">
            <div className="receipt-card">

              <div className="print-bar">
                <button onClick={() => window.print()}>🖨 Print</button>
                <button onClick={() => setSelectedReceipt(null)}>✖ Close</button>
              </div>

              <h2>Fee Receipt</h2>

              <table className="receipt-table">
                <tbody>
                  <tr><td>Month</td><td>{selectedReceipt.month}</td></tr>
                  <tr><td>Transport</td><td>₹{selectedReceipt.transportFee || 0}</td></tr>
                  <tr><td>Paid</td><td>₹{selectedReceipt.paidAmount}</td></tr>
                  <tr>
                    <td>Time</td>
                    <td>
                      {selectedReceipt.timestamp
                        ? new Date(selectedReceipt.timestamp).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        )}

        {/* PRINT BUTTON */}
        <div className="actions">
          <button
            onClick={() => {
              setPrintFullPage(true);
              setTimeout(() => {
                window.print();
                setPrintFullPage(false);
              }, 100);
            }}
          >
            🖨 Print Full Page
          </button>
        </div>

      </div>
    </div>
  );
}