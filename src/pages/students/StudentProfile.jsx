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

          <div className="student-hero">
            <div>
              <h1>{student.name}</h1>
              <p>Reg No: {student.registrationNumber}</p>
            </div>
            <span className="class-badge">{student.currentClass}</span>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h4>👨‍👩‍👧 Parents</h4>
              <p>Father: {student.fatherName}</p>
              <p>Mother: {student.motherName}</p>
              <p>Mobile: {student.mobileNumber}</p>
            </div>

            <div className="info-card">
              <h4>📍 Address</h4>
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

          <div className="actions">
            <button
              className="primary-btn wide"
              onClick={() => navigate(`/students/${regNo}?print=1`)}
            >
              🧾 View Admission Confirmation
            </button>

            <button
              className="primary-btn"
              onClick={() =>
                navigate(`/students/${student.registrationNumber}/dashboard`)
              }
            >
              📘 Open Extended Dashboard
            </button>
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

            {/* ===== PROFESSIONAL HEADER ===== */}
            <div className="admission-header">
              <h1>Rashtra Bharti Public School</h1>
              <p>Survey No. 12, Station Road, Motihari – 845401</p>
              <p>East Champaran, Bihar</p>
              <p><strong>Affiliation No:</strong> RBPS/EDU/CBSE/2025/104</p>
              <p>Official Admission Confirmation</p>
            </div>

            <hr />

            {/* ===== BODY ===== */}
            <div className="admission-body">
              <p>
                This is to formally certify that <strong>{student.name}</strong>,
                son/daughter of <strong>{student.fatherName}</strong> and
                <strong> {student.motherName}</strong>, has been granted admission
                to <strong>Rashtra Bharti Public School</strong> for the academic
                session <strong>2025–2026</strong>, subject to the rules,
                regulations, and policies of the institution.
              </p>

              <div className="info-grid">
                <div><label>Registration Number</label><span>{student.registrationNumber}</span></div>
                <div><label>Class Admitted</label><span>{student.currentClass}</span></div>
                <div><label>Date of Admission</label><span>{student.admissionDate}</span></div>
                <div><label>Mobile Number</label><span>{student.mobileNumber}</span></div>
                <div><label>Residential Address</label><span>{student.address}</span></div>
              </div>

              <div className="status-grid">
                <div><label>Attendance Record</label><span>{student.attendancePercentage}%</span></div>
                <div><label>Total Fee Paid</label><span>₹ {student.totalFeePaid}</span></div>
                <div><label>Outstanding Fee</label><span>₹ {student.totalFeeDue}</span></div>
              </div>

              <p className="note">
                <strong>Terms & Conditions:</strong><br />
                Admission is granted based on the information and documents submitted by
                the parent or guardian. The school reserves the right to revoke or cancel
                the admission if any information is found to be false, incomplete, or
                misleading, or if institutional guidelines are not followed.
              </p>

              <p className="note">
                This admission confirmation is valid only for the current academic session
                and is subject to renewal in the subsequent session as per school policy.
              </p>
            </div>

            {/* ===== SIGNATURE ===== */}
            <div className="signature-section">
              <div>
                <p>________________________</p>
                <span>Authorized Signatory</span>
              </div>

              <div>
                <p>Date: {student.admissionDate}</p>
                <span>School Seal</span>
              </div>
            </div>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px" }}>
              * This is a computer-generated document and does not require a physical signature.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
