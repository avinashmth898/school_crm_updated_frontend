import "./StudentProfile.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStudentProfile } from "../../services/studentService";

export default function StudentProfile() {
  const { regNo } = useParams();
  const [student, setStudent] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isPrint = searchParams.get("print") === "1";

  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
  }, [regNo]);

  if (!student) return null;

  return (
    <div className="student-bg">

      {/* ================= DASHBOARD VIEW ================= */}
      {!isPrint && (
        <div className="dashboard-container">

          {/* HERO */}
          <div className="student-hero">
            <div>
              <h1>{student.name}</h1>
              <p>Reg No: {student.registrationNumber}</p>
            </div>

            <span className="class-badge">
              {student.currentClass}
            </span>
          </div>

          {/* ✅ BUTTONS BELOW PROFILE */}
          <div className="actions-row">
            <button onClick={() => navigate(`/students/${regNo}?print=1`)}>
              🧾 Admission
            </button>

            <button onClick={() =>
              navigate(`/students/${student.registrationNumber}/dashboard`)
            }>
              📘 Dashboard
            </button>

            <button onClick={() =>
              navigate(`/students/${student.registrationNumber}/fee-history`)
            }>
              💰 Fees
            </button>
          </div>

          {/* INFO CARDS */}
          <div className="info-cards">

            <div className="info-card">
              <h4>👨‍👩‍👧 Parents</h4>
              <p>Father: {student.fatherName}</p>
              <p>Mother: {student.motherName}</p>
            </div>

            <div className="info-card">
              <h4>📍 Address</h4>
              <p>Mobile: {student.mobileNumber}</p>
              <p>{student.address}</p>
              <p><b>Pin:</b> {student.pinCode}</p>
            </div>
            <div className="info-card">
                          <h4>📍 Address</h4>
                          <p>Mobile: {student.mobileNumber}</p>
                          <p>{student.address}</p>
                          <p><b>Pin:</b> {student.pinCode}</p>
                        </div>

                        <div className="info-card">
                                      <h4>📍 Address</h4>
                                      <p>Mobile: {student.mobileNumber}</p>
                                      <p>{student.address}</p>
                                      <p><b>Pin:</b> {student.pinCode}</p>
                                    </div>

                                    <div className="info-card">
                                                  <h4>📍 Address</h4>
                                                  <p>Mobile: {student.mobileNumber}</p>
                                                  <p>{student.address}</p>
                                                  <p><b>Pin:</b> {student.pinCode}</p>
                                                </div>

            <div className="info-card">
              <h4>📊 Attendance</h4>
              <div className="progress-bar">
                <div style={{ width: `${student.attendancePercentage}%` }} />
              </div>
              <p>{student.attendancePercentage}%</p>
            </div>

            <div className="info-card">
              <h4>💰 Fee Summary</h4>
              <p className="paid">Paid: ₹ {student.totalFeePaid}</p>
              <p className="due">Due: ₹ {student.totalFeeDue}</p>
            </div>



          </div>

        </div>
      )}

      {/* ================= PRINT VIEW ================= */}
      {isPrint && (
        <div className="admission-wrapper">

          <div className="print-bar">
            <button className="icon-btn" onClick={() => window.print()}>
              ⬇ Download / Print
            </button>
          </div>

          <div className="admission-card" id="print-area">

            <div className="admission-header">
              <h1>Rashtra Bharti Public School</h1>
              <p>Motihari, Bihar</p>
              <p>Official Admission Confirmation</p>
            </div>

            <hr />

            <div className="admission-body">
              <p>
                This is to certify that <strong>{student.name}</strong>,
                child of <strong>{student.fatherName}</strong> and{" "}
                <strong>{student.motherName}</strong>, has been admitted.
              </p>

              <div className="info-grid">
                <div><label>Reg No</label><span>{student.registrationNumber}</span></div>
                <div><label>Class</label><span>{student.currentClass}</span></div>
                <div><label>Date</label><span>{student.admissionDate}</span></div>
                <div><label>Mobile</label><span>{student.mobileNumber}</span></div>
                <div><label>Address</label><span>{student.address}</span></div>
              </div>

              <div className="status-grid">
                <div><label>Attendance</label><span>{student.attendancePercentage}%</span></div>
                <div><label>Paid</label><span>₹ {student.totalFeePaid}</span></div>
                <div><label>Due</label><span>₹ {student.totalFeeDue}</span></div>
              </div>

            </div>

            <div className="signature-section">
              <div>
                <p>__________________</p>
                <span>Authorized Sign</span>
              </div>

              <div>
                <p>Date: {student.admissionDate}</p>
                <span>Seal</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}