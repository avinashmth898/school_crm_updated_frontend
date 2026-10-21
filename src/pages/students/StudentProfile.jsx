import "./StudentProfile.css";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { getStudentProfile, updateStudent, updateStudentStatus } from "../../services/studentService";
import { getSchoolInfo } from "../../services/schoolInfoService";
import { useToast } from "../../ui/ToastContext";
import { useConfirm, usePrompt } from "../../ui/ConfirmContext";

const DOCUMENTS = [
  { key: "aadharSubmitted", label: "Student's Aadhaar Card" },
  { key: "fatherAadharSubmitted", label: "Father's Aadhaar Card" },
  { key: "motherAadharSubmitted", label: "Mother's Aadhaar Card" },
  { key: "transferCertificateSubmitted", label: "Previous School Transfer Certificate" },
  { key: "birthCertificateSubmitted", label: "Birth Certificate" },
  { key: "photosSubmitted", label: "Passport-size Photographs" },
];

export default function StudentProfile() {
const { regNo } = useParams();
const [student, setStudent] = useState(null);
const [classes, setClasses] = useState([]);
const [schoolInfo, setSchoolInfo] = useState(null);
const [photoOk, setPhotoOk] = useState(true);
const [searchParams] = useSearchParams();
const navigate = useNavigate();
const toast = useToast();
const confirm = useConfirm();
const prompt = usePrompt();

const isPrint = searchParams.get("print") === "1";

useEffect(() => {
  getStudentProfile(regNo).then(res => setStudent(res.data));
  apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(console.error);
}, [regNo]);

useEffect(() => {
  setPhotoOk(true);
}, [student?.photoPath]);

if (!student) return <div>Loading...</div>;

const toggleConsent = async (field) => {
  const classMatch = classes.find(c => c.className === student.currentClass);
  if (!classMatch) {
    toast.error("Could not resolve this student's class. Please use Edit instead.");
    return;
  }
  try {
    const updatedValue = !student[field];
    const payload = {
      name: student.name,
      fatherName: student.fatherName,
      motherName: student.motherName,
      address: student.address,
      pinCode: student.pinCode,
      classId: classMatch.id,
      mobileNumber: student.mobileNumber,
      aadharNumber: student.aadharNumber,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup,
      emergencyContact: student.emergencyContact,
      aadharSubmitted: student.aadharSubmitted,
      fatherAadharSubmitted: student.fatherAadharSubmitted,
      motherAadharSubmitted: student.motherAadharSubmitted,
      transferCertificateSubmitted: student.transferCertificateSubmitted,
      birthCertificateSubmitted: student.birthCertificateSubmitted,
      photosSubmitted: student.photosSubmitted,
      parentConsent: student.parentConsent,
      [field]: updatedValue,
    };

    await updateStudent(regNo, payload);
    setStudent(prev => ({ ...prev, [field]: updatedValue }));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to update");
  }
};

const changeClass = async (direction) => {
  const label = direction === "UP" ? "promote" : "send back";
  const reason = await prompt({
    message: `Reason for this ${label === "promote" ? "promotion" : "demotion"} (optional):`,
    required: false,
  });
  if (reason === null) return; // cancelled

  const ok = await confirm({
    message: `${label === "promote" ? "Promote" : "Send back"} ${student.name} from ${student.currentClass}?`,
    confirmLabel: label === "promote" ? "Promote" : "Send back",
  });
  if (!ok) return;

  try {
    const res = await apiClient.post("/promotion/change-class", {
      regNo: student.registrationNumber,
      direction,
      reason,
    });
    setStudent(prev => ({ ...prev, currentClass: res.data.toClass }));
    toast.success(`${student.name} moved to ${res.data.toClass}`);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to change class");
  }
};

const changeStatus = async (status) => {
  const label = status === "WITHDRAWN" ? "withdraw" : status === "GRADUATED" ? "mark as graduated" : "reactivate";
  const reason = await prompt({ message: `Reason to ${label} ${student.name} (optional):`, required: false });
  if (reason === null) return;

  const ok = await confirm({
    message: `${label.charAt(0).toUpperCase() + label.slice(1)} ${student.name}?`,
    confirmLabel: label.charAt(0).toUpperCase() + label.slice(1),
    danger: status === "WITHDRAWN",
  });
  if (!ok) return;

  try {
    await updateStudentStatus(regNo, status, reason);
    setStudent(prev => ({ ...prev, status }));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to update status");
  }
};

const photoUrl = `/api/students/${regNo}/photo`;

return ( <div className="student-bg">


  {/* ================= DASHBOARD VIEW ================= */}
  {!isPrint && (
    <div className="dashboard-container">

      {/* HERO */}
      <div className="student-hero">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 70, height: 88, borderRadius: 8, overflow: "hidden", flexShrink: 0,
            background: "#f1f5f9", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#94a3b8"
          }}>
            {student.photoPath && photoOk
              ? <img src={photoUrl} alt={student.name} onError={() => setPhotoOk(false)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "No Photo"}
          </div>
          <div>
            <h1>{student.name}</h1>
            <p>Reg No: {student.registrationNumber}</p>
            <p>Admission No: {student.admissionNumber}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className={`status-badge status-${(student.status || "ACTIVE").toLowerCase()}`}>
              {student.status || "ACTIVE"}
            </span>
            <span className="class-badge">
              {student.currentClass}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={() => navigate(`/students/${student.registrationNumber}/edit`)}
            >
              ✎ Edit
            </button>
            <button
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={() => changeClass("DOWN")}
              title="Send back to the junior class"
            >
              ↓ Send Back
            </button>
            <button
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={() => changeClass("UP")}
              title="Promote to the next class"
            >
              ↑ Promote
            </button>
            {(student.status || "ACTIVE") === "ACTIVE" ? (
              <>
                <button style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => changeStatus("WITHDRAWN")}>
                  Withdraw
                </button>
                <button style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => changeStatus("GRADUATED")}>
                  Mark Graduated
                </button>
              </>
            ) : (
              <button style={{ fontSize: 12, padding: "4px 8px" }} onClick={() => changeStatus("ACTIVE")}>
                Reactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BUTTONS */}

      <div className="actions-row">
      <button onClick={() =>
        navigate(`/students/${student.registrationNumber}/pay-fee`)
      }>
        💳 Pay Fee
      </button>

        <button onClick={() =>
          navigate(`/students/${student.registrationNumber}/dashboard`)
        }>
          📘 Dashboard
        </button>

        <button onClick={() =>
          navigate(`/students/${student.registrationNumber}/fee-history`)
        }>
          💰 Fees History
        </button>

</div>
      {/* INFO CARDS */}
      <div className="info-cards">

        {/* 1. Parents */}
        <div className="info-card">
          <h4>👨‍👩‍👧 Parents</h4>
          <p>Father: {student.fatherName}</p>
          <p>Mother: {student.motherName}</p>

          <h4>📍 Address</h4>
          <p>Mobile: {student.mobileNumber}</p>
          <p>{student.address}</p>
          <p><b>Pin:</b> {student.pinCode}</p>
        </div>

        {/* 2. Identity */}
        <div className="info-card identity-card">
          <h4>🆔 Identity Details</h4>

          <div className="identity-grid">
            <div className="emergency-box">
              <label>Emergency Contact</label>
              <p className="emergency-number">
                {student.emergencyContact || "Not Available"}
              </p>
            </div>

            <div>
              <label>Date of Birth</label>
              <p>{student.dateOfBirth || "Not Available"}</p>
            </div>

            <div>
              <label>Blood Group</label>
              <p>{student.bloodGroup || "Not Available"}</p>
            </div>

            <div>
              <label>Aadhaar Number</label>
              <p>{student.aadharNumber || "Not Available"}</p>
            </div>

            <div>
              <label>Academic Session</label>
              <p>{student.academicSession || "Not Available"}</p>
            </div>
          </div>
        </div>

        {/* 3. Consents & Documents */}
        <div className="info-card consent-card">
          <h4>📋 Consents & Documents</h4>

          {DOCUMENTS.map(doc => (
            <div className="consent-item" key={doc.key}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={student[doc.key] || false}
                  onChange={() => toggleConsent(doc.key)}
                />
                <span className="checkmark"></span>
                {doc.label}
              </label>
            </div>
          ))}

          <div className="consent-item">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={student.parentConsent || false}
                onChange={() => toggleConsent("parentConsent")}
              />
              <span className="checkmark"></span>
              Parent Consent for Digital Records
            </label>
          </div>
        </div>

        {/* 4. Fee & Transport */}
        <div
          className="info-card exam-tile"
          onClick={() => navigate(`/students/${student.registrationNumber}/dashboard`)}
        >
          <div className="tile-content">
            <div className="tile-icon">💳</div>
            <div>
              <h4>Fee & Transport Service</h4>
              <p>Manage fees, transport & services</p>
            </div>
          </div>
          <span className="tile-arrow">→</span>
        </div>

        {/* 5. Exam */}
        <div
          className="info-card exam-tile"
          onClick={() =>
            navigate(`/students/${student.registrationNumber}/exams`)
          }
        >
          <div className="tile-content">
            <div className="tile-icon">📊</div>
            <div>
              <h4>Exam Management</h4>
              <p>View results, marks & performance</p>
            </div>
          </div>
          <span className="tile-arrow">→</span>
        </div>

        {/* 6. Admission */}
        <div
          className="info-card exam-tile"
          onClick={() =>
            navigate(`/students/${student.registrationNumber}/admission-confirmation`)
          }
        >
          <div className="tile-content">
            <div className="tile-icon doc-icon">📄</div>

            <div>
              <h4>Admission Confirmation</h4>
              <p>Official admission document</p>
            </div>

          </div>

          <span className="tile-arrow">→</span>
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
          {student.photoPath && (
            <img
              src={photoUrl}
              alt={student.name}
              style={{ width: 70, height: 88, objectFit: "cover", borderRadius: 4, float: "right" }}
            />
          )}
          <h1>{schoolInfo?.schoolName || "School Name Not Set"}</h1>
          <p>{schoolInfo?.address || ""}</p>
          <p>Official Admission Confirmation</p>
        </div>

        <hr />

        <div className="admission-body">
          <p>
            This is to certify that <strong>{student.name}</strong>,
            child of <strong>{student.fatherName}</strong> and{" "}
            <strong>{student.motherName}</strong>, has been admitted for the
            academic session <strong>{student.academicSession}</strong>.
          </p>

          <div className="info-grid">
            <div><label>Reg No</label><span>{student.registrationNumber}</span></div>
            <div><label>Admission No</label><span>{student.admissionNumber}</span></div>
            <div><label>Class</label><span>{student.currentClass}</span></div>
            <div><label>Date</label><span>{student.admissionDate}</span></div>
            <div><label>Date of Birth</label><span>{student.dateOfBirth || "—"}</span></div>
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
