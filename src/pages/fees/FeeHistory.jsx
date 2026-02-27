import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./FeeHistory.css";
import { getStudentProfile } from "../../services/studentService";

export default function FeeHistory() {
  const { regNo } = useParams();
  const printRef = useRef();

  const [ledger, setLedger] = useState([]);
  const [student, setStudent] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  /* 🔹 Load student profile */
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
      {
        id: 3,
        month: "April",
        year: 2026,
        tuitionFee: 2000,
        transportFee: 800,
        annualFee: 7500,
        totalAmount: 10300,
        paidAmount: 0,
        status: "DUE",
        paymentTimestamp: null,
      },
    ]);
  }, []);

  const filteredLedger = ledger.filter(
    (item) => !filterStatus || item.status === filterStatus
  );

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const totalAmount = ledger.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalPaid = ledger.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalDue = ledger.reduce(
    (sum, l) => sum + (l.totalAmount - l.paidAmount),
    0
  );

  /* 🖨️ Print function */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fee-history-page">
      <div className="fee-history-container" ref={printRef}>

        {/* 🔹 HEADER WITH PRINT BUTTON */}
        <div className="fee-history-header">
          <h2 className="fee-history-title">
            Fee History : {student?.name}
          </h2>

          <button className="print-btn" onClick={handlePrint}>
            🖨 Print
          </button>
        </div>

        {/* 🔹 PROFILE */}
        {student && (
          <div className="student-profile-card">
            <p><strong>Class:</strong> {student.currentClass}</p>
            <p><strong>Reg No:</strong> {student.registrationNumber}</p>
            <p><strong>Father:</strong> {student.fatherName}</p>
            <p><strong>Mobile:</strong> {student.mobileNumber}</p>
            <p><strong>Admission:</strong> {student.admissionDate}</p>
          </div>
        )}

        {/* 🔹 Filter */}
        <div className="filter-section no-print">
          <select onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="DUE">Due</option>
          </select>
        </div>

        {/* 🔹 Summary */}
        <div className="summary-cards">
          <div className="summary-card">
            <span>Total</span>
            <b>₹{totalAmount}</b>
          </div>
          <div className="summary-card">
            <span>Paid</span>
            <b className="paid">₹{totalPaid}</b>
          </div>
          <div className="summary-card">
            <span>Due</span>
            <b className="due">₹{totalDue}</b>
          </div>
        </div>

        {/* 🔹 TABLE */}
        <table className="fee-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Tuition</th>
              <th>Transport</th>
              <th>Annual</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Payment Time</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.map((entry) => (
              <>
                <tr
                  key={entry.id}
                  className={`clickable-row ${
                    entry.status === "DUE" ? "due-row" : ""
                  }`}
                  onClick={() => toggleRow(entry.id)}
                >
                  <td>{entry.month} {entry.year}</td>
                  <td>₹{entry.tuitionFee}</td>
                  <td>₹{entry.transportFee}</td>
                  <td>₹{entry.annualFee}</td>
                  <td className="total">₹{entry.totalAmount}</td>
                  <td>₹{entry.paidAmount}</td>
                  <td className={`status ${entry.status.toLowerCase()}`}>
                    {entry.status}
                  </td>
                  <td>{entry.paymentTimestamp || "--"}</td>
                  <td>
                    {entry.paidAmount > 0 ? (
                      <button className="receipt-btn">Print</button>
                    ) : "--"}
                  </td>
                </tr>

                {expandedRow === entry.id && (
                  <tr className="expanded-row">
                    <td colSpan="9">
                      <div className="expanded-content">
                        <strong>Breakdown</strong>
                        <p>Tuition: ₹{entry.tuitionFee}</p>
                        <p>Transport: ₹{entry.transportFee}</p>
                        <p>Annual: ₹{entry.annualFee}</p>
                        <p>
                          Balance: ₹
                          {entry.totalAmount - entry.paidAmount}
                        </p>
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
  );
}
