import "./StudentDashboard.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentProfile } from "../../services/studentService";

export default function StudentDashboard() {
  const { regNo } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
  }, [regNo]);

  if (!student) return <p className="loading">Loading...</p>;

  const feeMonths = [
    "Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025",
    "Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026",
    "Jul 2026","Aug 2026","Sep 2026","Oct 2026","Nov 2026","Dec 2026",
    "Jan 2027","Feb 2027","Mar 2027"
  ];

  const paidUntilIndex = Math.floor((student.totalFeePaid / student.totalFeeDue) * feeMonths.length);

  return (
    <div className="student-bg">
      <div className="dashboard-card printable">

        <header className="dashboard-header">
          <h1>{student.name}</h1>
          <p>Reg No: {student.registrationNumber} | Class: {student.currentClass}</p>
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

        {/* TRANSPORT */}
        <div className="section">
          <h2>🚌 Transport</h2>
          <div className="info-grid">
            <p><b>Uses Transport:</b> {student.usesTransport ? "Yes" : "No"}</p>
            {student.usesTransport && (
              <>
                <p><b>Route:</b> {student.transportRoute}</p>
                <p><b>Monthly Charge:</b> ₹{student.transportFee}</p>
              </>
            )}
          </div>
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
            <div className="progress-fill" style={{ width: `${student.attendancePercentage}%` }} />
          </div>
          <p>{student.attendancePercentage}%</p>
        </div>

        {/* TIMELINE */}
        <div className="section">
          <h2>📅 Fee Timeline</h2>
          <div className="months">
            {feeMonths.map((m, i) => (
              <div key={m} className={`month ${i < paidUntilIndex ? "paid-box" : "unpaid-box"}`}>
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="actions no-print">
          <button onClick={() => window.print()}>🖨 Print</button>
        </div>

      </div>
    </div>
  );
}
