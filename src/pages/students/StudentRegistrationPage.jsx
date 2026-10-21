import "./StudentRegistrationPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { registerStudent } from "../../services/studentService";
import { getTransportFees } from "../../services/transportService";
import { useToast } from "../../ui/ToastContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DOCUMENTS = [
  { key: "aadharSubmitted", label: "Student's Aadhaar Card" },
  { key: "fatherAadharSubmitted", label: "Father's Aadhaar Card" },
  { key: "motherAadharSubmitted", label: "Mother's Aadhaar Card" },
  { key: "transferCertificateSubmitted", label: "Previous School Transfer Certificate" },
  { key: "birthCertificateSubmitted", label: "Birth Certificate" },
  { key: "photosSubmitted", label: "Passport-size Photographs" },
];

const EMPTY_FORM = {
  name: "",
  fatherName: "",
  motherName: "",
  address: "",
  pinCode: "",
  classId: "",
  mobileNumber: "",
  aadharNumber: "",
  dateOfBirth: "",
  bloodGroup: "",
  emergencyContact: "",
  aadharSubmitted: false,
  fatherAadharSubmitted: false,
  motherAadharSubmitted: false,
  transferCertificateSubmitted: false,
  birthCertificateSubmitted: false,
  photosSubmitted: false,
  parentConsent: false,
  usesTransport: "false",
  transportFeeId: "",
};

export default function StudentRegistrationPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [transportFees, setTransportFees] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Load the REAL class list (same source Class Setup and promotion use)
  // instead of a hardcoded string list that can silently drift out of sync.
  useEffect(() => {
    apiClient.get("/classes")
      .then(res => setClasses(res.data || []))
      .catch(err => console.error("Failed to load classes", err));
  }, []);

  useEffect(() => {
    getTransportFees()
      .then(res => setTransportFees(res.data || []))
      .catch(err => console.error("Failed to load transport fees", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.classId) {
      setError("Please select a class.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        classId: Number(formData.classId),
        usesTransport: formData.usesTransport === "true",
        transportFeeId: formData.transportFeeId ? Number(formData.transportFeeId) : null,
        dateOfBirth: formData.dateOfBirth || null,
      };

      // ✅ One request — registration + transport assignment happen together
      // on the server, in the same transaction. No more "registered but
      // transport silently failed to attach" scenario.
      const res = await registerStudent(payload);
      const regNo = res.data.registrationNumber;

      // Photo is a secondary step after the student record exists — upload
      // failure here doesn't roll back the registration itself.
      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append("file", photoFile);
        try {
          await apiClient.post(`/students/${regNo}/photo`, photoForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (photoErr) {
          console.error(photoErr);
          toast.error("Student registered, but the photo upload failed. You can add it later from the profile.");
        }
      }

      navigate(`/students/${regNo}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card">
        <h2>New Student Registration</h2>

        {error && (
          <div style={{
            background: "var(--red-50)", border: "1px solid var(--red-100)",
            color: "var(--red-600)", padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">

          {/* PHOTO */}
          <div className="row" style={{ alignItems: "center" }}>
            <div style={{
              width: 90, height: 110, borderRadius: 8, overflow: "hidden",
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8"
            }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "No Photo"}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Passport Photo
              </label>
              <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
            </div>
          </div>

          <input name="name" placeholder="Student Name" value={formData.name} onChange={handleChange} required />
          <input name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} required />
          <input name="motherName" placeholder="Mother Name" value={formData.motherName} onChange={handleChange} />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

          <div className="row">
            <input
              name="pinCode" placeholder="Pin Code (6 digits)" value={formData.pinCode}
              onChange={handleChange} maxLength={6} required
            />
            <select name="classId" value={formData.classId} onChange={handleChange} required>
              <option value="">Select Class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.className}</option>
              ))}
            </select>
          </div>

          <div className="row">
            <input
              name="mobileNumber" placeholder="Mobile Number (10 digits)" value={formData.mobileNumber}
              onChange={handleChange} maxLength={10} required
            />
            <input
              name="aadharNumber" placeholder="Aadhaar Number (optional, 12 digits)" value={formData.aadharNumber}
              onChange={handleChange} maxLength={12}
            />
          </div>

          <div className="row">
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
              <option value="">Blood Group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <input
            name="emergencyContact" placeholder="Emergency Contact Number"
            value={formData.emergencyContact} onChange={handleChange}
          />

          {/* TRANSPORT */}
          <div className="row">
            <select
              name="usesTransport"
              value={formData.usesTransport}
              onChange={(e) => setFormData(prev => ({ ...prev, usesTransport: e.target.value, transportFeeId: "" }))}
            >
              <option value="false">Transport Required? — No</option>
              <option value="true">Transport Required? — Yes</option>
            </select>
          </div>

          {formData.usesTransport === "true" && (
            <select name="transportFeeId" value={formData.transportFeeId} onChange={handleChange} required>
              <option value="">Select Route</option>
              {transportFees.map((t) => (
                <option key={t.transportFeeId} value={t.transportFeeId}>
                  {t.routeName} — ₹{t.amount}
                </option>
              ))}
            </select>
          )}

          {/* DOCUMENT CHECKLIST */}
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Documents Collected At Admission
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {DOCUMENTS.map(doc => (
                <label key={doc.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox" name={doc.key}
                    checked={formData[doc.key]} onChange={handleChange}
                  />
                  {doc.label}
                </label>
              ))}
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 10 }}>
              <input
                type="checkbox" name="parentConsent"
                checked={formData.parentConsent} onChange={handleChange}
              />
              Parent Consent for Digital Records
            </label>
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Registering…" : "Register Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
