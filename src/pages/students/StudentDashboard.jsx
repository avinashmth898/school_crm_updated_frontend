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
  const [selectedRoute, setSelectedRoute] = useState("");
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [ledger, setLedger] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // 🔹 Initial load
  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
    fetchTransport();
    fetchRoutes();
    fetchLedger();
  }, [regNo]);
  useEffect(() => {
    console.log("Routes state:", routes);
  }, [routes]);

  // 🔹 Fetch transport info
  const fetchTransport = async () => {
    try {
      const res = await apiClient.get(`/student-transportation/${regNo}`);
      setTransport(res.data);
    } catch {
      setTransport(null);
    }
  };

  // 🔹 Fetch available routes
  const fetchRoutes = async () => {
    try {
      const res = await apiClient.get("/config/transport");
      setRoutes(res.data || []);
    } catch (err) {
      console.error("Failed to load routes", err);
      setRoutes([]);
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await apiClient.get(`/ledger/${regNo}`);
      setLedger(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Ledger load failed", err);
      setLedger([]);
    }
  };

  // 🔹 Toggle transport
  const handleTransportToggle = async () => {
    const confirmMsg = transport
      ? "Stop transport service for this student?"
      : "Start transport service for this student?";

    if (!window.confirm(confirmMsg)) return;

    setLoadingTransport(true);

    try {
      if (transport) {
        // 🛑 Stop transport
        await apiClient.post("/student-transportation/stop", null, {
          params: { regNo }
        });
        setTransport(null);
      } else {
        // 🚌 Assign transport (default route must exist)
        const defaultRouteId = routes.length ? routes[0].transportFeeId : 2;

        await apiClient.post("/student-transportation/assign", null, {
          params: { regNo, transportFeeId: defaultRouteId }
        });

        await fetchTransport();
      }
    } catch (err) {
      console.error("Transport toggle error:", err);
      alert("Failed to update transport service");
    } finally {
      setLoadingTransport(false);
    }
  };

  // 🔹 Change route
  const handleRouteChange = async (routeId) => {
        if (!routeId || !transport) return;

        try {
          await apiClient.put("/student-transportation/change-route", null, {
            params: { regNo, transportFeeId: routeId }
          });

          await fetchTransport(); // refresh silently
        } catch (err) {
          console.error("Route change failed", err);
          alert("Failed to change route");
        }
      };

  if (!student) return <p className="loading">Loading...</p>;

  // 🔹 Fee timeline logic
  // 🔹 Fee Timeline Months
  const feeMonths = [

    { month: "July", year: 2025 },
    { month: "August", year: 2025 },
    { month: "September", year: 2025 },
    { month: "October", year: 2025 },
    { month: "November", year: 2025 },
    { month: "December", year: 2025 },
    { month: "January", year: 2026 },
    { month: "February", year: 2026 },
    { month: "March", year: 2026 },
    { month: "April", year: 2026 },
    { month: "May", year: 2026 },
    { month: "June", year: 2026 },
    { month: "July", year: 2026 },
    { month: "August", year: 2026 },
    { month: "September", year: 2026 },
    { month: "October", year: 2026 },
    { month: "November", year: 2026 },
    { month: "December", year: 2026 },
    { month: "January", year: 2027 },
    { month: "February", year: 2027 },
    { month: "March", year: 2027 }
  ];
const today = new Date();
const currentMonthIndex = today.getMonth();
const currentYear = today.getFullYear();

const getMonthStatus = (month, year) => {
  const monthIndex = new Date(`${month} 1`).getMonth();

  // 🔹 Future months → no color
  if (year > currentYear || (year === currentYear && monthIndex > currentMonthIndex)) {
    return "future-box";
  }

  const entry = ledger.find(
    l =>
      String(l.month).toLowerCase() === month.toLowerCase() &&
      Number(l.year) === Number(year)
  );

  if (!entry) return "unpaid-box";
  if (entry.status === "PAID") return "paid-box";
  if (entry.status === "PARTIAL") return "partial-box";
  return "unpaid-box";
};

//         const today = new Date();
//         const currentMonth = today.toLocaleString("default", { month: "short" });
//         const currentYear = today.getFullYear();


  return (
    <div className="student-bg">
      <div className="dashboard-card printable">

        {/* HEADER */}
        <header className="dashboard-header">
          <h1>{student.name}</h1>
          <p>
            Reg No: {student.registrationNumber} | Class: {student.currentClass}
          </p>
        </header>

        {/* PROFILE */}
        <div className="section">
          <h2>👤 Student Details</h2>
          <div className="info-grid">
            <p><b>Date of Birth:</b> {student.dob || "Not set"}</p>
            <p><b>Gender:</b> {student.gender || "Not set"}</p>
            <p><b>Father:</b> {student.fatherName}</p>
            <p><b>Mother:</b> {student.motherName}</p>
            <p><b>Mobile:</b> {student.mobileNumber}</p>
            <p><b>Aadhar:</b> {student.aadharNumber}</p>
          </div>
        </div>

        {/* ACADEMIC */}
        <div className="section">
          <h2>📘 Academic Info</h2>
          <div className="info-grid">
            <p><b>Class:</b> {student.currentClass}</p>
            <p><b>Section:</b> {student.section || "A"}</p>
            <p><b>Roll No:</b> {student.rollNumber || "—"}</p>
            <p><b>Admission Date:</b> {student.admissionDate}</p>
          </div>
        </div>

        {/* 🚌 TRANSPORT */}
        <div className="section">
          <h2>🚌 Transport</h2>

          <div className="transport-row">
            <span>
              <b>Uses Transport:</b>{" "}
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
            <>
              <div className="info-grid" style={{ marginTop: "10px" }}>
                <p><b>Route ID:</b> {transport.transportFeeId}</p>
                <p><b>Start Date:</b> {transport.startDate}</p>
              </div>
                {routes.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
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
                  </div>
                )}

            </>

          )}
        </div>

        {/* ADDRESS */}
        <div className="section">
          <h2>📍 Address</h2>
          <p>{student.address}</p>
          <p><b>Pin Code:</b> {student.pinCode}</p>
        </div>

        {/* FEE SUMMARY */}
        <div className="section">
          <h2>💰 Fee Summary</h2>
          <div className="fee-summary">
            <p>Total Fee: ₹{student.totalFeeDue}</p>
            <p className="paid">Paid: ₹{student.totalFeePaid}</p>
            <p className="due">Balance: ₹{student.totalFeeDue - student.totalFeePaid}</p>
          </div>
        </div>

        {/* ATTENDANCE */}
        <div className="section">
          <h2>📊 Attendance</h2>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${student.attendancePercentage}%` }}
            />
          </div>
          <p>{student.attendancePercentage}%</p>
        </div>

        {/* TIMELINE */}
        <div className="section">
          <h2>📅 Fee Timeline</h2>

          <div className="months">
            {feeMonths.map(({ month, year }) => {
              const entry = ledger.find(
                l =>
                  String(l.month).toLowerCase() === month.toLowerCase() &&
                  Number(l.year) === Number(year)
              );

              const today = new Date();
              const isCurrentMonth =
                today.toLocaleString("default", { month: "long" }) === month &&
                today.getFullYear() === year;

              return (
               <div
                 key={`${month}-${year}`}
                 className={`month ${getMonthStatus(month, year)} ${
                   isCurrentMonth ? "current-month" : ""
                 }`}
                 title={
                   entry
                     ? `Paid: ₹${entry.paidAmount} / ₹${entry.totalAmount}`
                     : "No record"
                 }
                 onClick={() => entry && setSelectedReceipt(entry)}
               >
                 {month} {year}
               </div>
              );
            })}
          </div>

        </div>


        {selectedReceipt && (
          <div className="receipt-modal">
            <div className="receipt-card printable">

              <div className="print-bar">
                <button onClick={() => window.print()}>🖨 Print</button>
                <button onClick={() => setSelectedReceipt(null)}>✖ Close</button>
              </div>

              <h2>School Name</h2>
              <h3>Fee Receipt</h3>

              <p><b>Student:</b> {student.name}</p>
              <p><b>Reg No:</b> {student.registrationNumber}</p>
              <p><b>Class:</b> {student.currentClass}</p>

              <hr />

              <table className="receipt-table">
                <tbody>
                  <tr>
                    <td>Month</td>
                    <td>{selectedReceipt.month} {selectedReceipt.year}</td>
                  </tr>
                  <tr>
                    <td>Tuition Fee</td>
                    <td>₹{selectedReceipt.tuitionFee}</td>
                  </tr>
                  <tr>
                    <td>Transport Fee</td>
                    <td>₹{selectedReceipt.transportFee}</td>
                  </tr>
                  <tr>
                    <td>Annual Fee</td>
                    <td>₹{selectedReceipt.annualFee}</td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>₹{selectedReceipt.totalAmount}</td>
                  </tr>
                  <tr>
                    <td>Paid</td>
                    <td>₹{selectedReceipt.paidAmount}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{selectedReceipt.status}</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="actions no-print">
          <button onClick={() => window.print()}>🖨 Print</button>

          <button
            className="pay-fee-btn"
            onClick={() =>
              window.location.href = `/students/${student.registrationNumber}/pay-fee`
            }
          >
            💳 Pay Fee
          </button>
        </div>
      </div>
    </div>
  );
}