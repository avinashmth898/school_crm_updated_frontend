import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FeeHistory.css";
import { getStudentProfile } from "../../services/studentService";

export default function FeeHistory() {
  const { regNo } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [ledger, setLedger] = useState([]);
  const [student, setStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  /* 🔹 Load student */
  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
  }, [regNo]);

  /* 🔹 Mock ledger */
  useEffect(() => {
    setLedger([
      {
        id: 1,
        month: "January",
        year: 2026,
        tuitionFee: 2000,
        transportFee: 800,
        annualFee: 0,
        totalAmount: 2800,
        paidAmount: 2800,
        status: "PAID",
        paymentTimestamp: "2026-01-05 10:30 AM",
      },
      {
        id: 2,
        month: "February",
        year: 2026,
        tuitionFee: 2000,
        transportFee: 800,
        annualFee: 0,
        totalAmount: 2800,
        paidAmount: 1500,
        status: "PARTIAL",
        paymentTimestamp: "2026-02-10 02:15 PM",
      },
    ]);
  }, []);

  /* 🔥 Dynamic Months (Past 6 → Next 6) */
  const generateMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      months.push({ month, year });
    }
    return months;
  };

  const dynamicMonths = generateMonths();

  /* 🔥 Merge with ledger */
  const fullLedger = dynamicMonths.map(({ month, year }) => {
    const existing = ledger.find(l => l.month === month && l.year === year);
    return (
      existing || {
        id: `${month}-${year}`,
        month,
        year,
        tuitionFee: 2000,
        transportFee: 800,
        annualFee: month === "April" ? 7500 : 0,
        totalAmount: month === "April" ? 10300 : 2800,
        paidAmount: 0,
        status: "DUE",
        paymentTimestamp: null,
      }
    );
  });

  /* Sort */
  fullLedger.sort((a, b) => {
    const dateA = new Date(`${a.month} 1, ${a.year}`);
    const dateB = new Date(`${b.month} 1, ${b.year}`);
    return dateA - dateB;
  });

  /* Filter */
  const filteredLedger = fullLedger.filter(
    item => !filterStatus || item.status === filterStatus
  );

  /* Expand row */
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  /* Summary */
  const totalAmount = fullLedger.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalPaid   = fullLedger.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalDue    = fullLedger.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);

  return (
    <div className="fee-history-page">
      <div className="fee-history-container" ref={printRef}>

        {/* HEADER */}
        <div className="fee-history-header">
          <h2 className="fee-history-title">
            Fee Ledger
            {student && <span>— {student.name}</span>}
          </h2>
          <button className="print-btn no-print" onClick={() => window.print()}>
            🖨 Print
          </button>
        </div>

        {/* PROFILE */}
        {student && (
          <div className="student-profile-card">
            <p><strong>Class:</strong> {student.currentClass}</p>
            <p><strong>Reg No:</strong> {student.registrationNumber}</p>
            <p><strong>Father:</strong> {student.fatherName}</p>
            <p><strong>Mobile:</strong> {student.mobileNumber}</p>
            <p><strong>Admission:</strong> {student.admissionDate}</p>
          </div>
        )}

        {/* FILTER */}
        <div className="filter-section no-print">
          <label>Status</label>
          <select onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="DUE">Due</option>
          </select>
        </div>

        {/* SUMMARY */}
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total Charged</span>
            <b>₹{totalAmount.toLocaleString()}</b>
          </div>
          <div className="summary-card">
            <span>Total Paid</span>
            <b className="paid">₹{totalPaid.toLocaleString()}</b>
          </div>
          <div className="summary-card">
            <span>Balance Due</span>
            <b className="due">₹{totalDue.toLocaleString()}</b>
          </div>
        </div>

        {/* TABLE */}
        <div className="fee-table-wrapper">
          <table className="fee-table">
            <thead>
              <tr>
                <th style={{textAlign:'left'}}>Month</th>
                <th>Tuition</th>
                <th>Transport</th>
                <th>Annual</th>
                <th>Total</th>
                <th>Paid</th>
                <th style={{textAlign:'center'}}>Status</th>
                <th style={{textAlign:'center'}}>Payment Time</th>
                <th style={{textAlign:'center'}}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLedger.map(entry => (
                <>
                  <tr
                    key={entry.id}
                    className={`clickable-row ${entry.status === "DUE" ? "due-row" : ""}`}
                    onClick={() => toggleRow(entry.id)}
                  >
                    <td>{entry.month} {entry.year}</td>
                    <td>₹{entry.tuitionFee.toLocaleString()}</td>
                    <td>₹{entry.transportFee.toLocaleString()}</td>
                    <td>₹{entry.annualFee.toLocaleString()}</td>
                    <td className="total">₹{entry.totalAmount.toLocaleString()}</td>
                    <td>₹{entry.paidAmount.toLocaleString()}</td>

                    <td style={{textAlign:'center'}}>
                      <span className={`status ${entry.status.toLowerCase()}`}>
                        {entry.status}
                      </span>
                    </td>

                    <td style={{textAlign:'center', color:'var(--text-secondary)'}}>
                      {entry.paymentTimestamp || "—"}
                    </td>

                    <td style={{textAlign:'center'}}>
                      {entry.status !== "PAID" ? (
                        <span
                          className="pay-link"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/students/${regNo}/pay-fee`, { state: entry });
                          }}
                        >
                          Pay
                        </span>
                      ) : (
                        <button className="receipt-btn">Receipt</button>
                      )}
                    </td>
                  </tr>

                  {expandedRow === entry.id && (
                    <tr className="expanded-row" key={`${entry.id}-exp`}>
                      <td colSpan="9">
                        <div className="expanded-content">
                          <div>
                            <strong>Breakdown</strong>
                            <p>Tuition: ₹{entry.tuitionFee.toLocaleString()}</p>
                            <p>Transport: ₹{entry.transportFee.toLocaleString()}</p>
                            <p>Annual: ₹{entry.annualFee.toLocaleString()}</p>
                          </div>
                          <div>
                            <strong>Balance</strong>
                            <p>Paid: ₹{entry.paidAmount.toLocaleString()}</p>
                            <p>Due: ₹{(entry.totalAmount - entry.paidAmount).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
