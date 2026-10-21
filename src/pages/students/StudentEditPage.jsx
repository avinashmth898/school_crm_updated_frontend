import "./StudentRegistrationPage.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getStudentProfile, updateStudent } from "../../services/studentService";
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

export default function StudentEditPage() {
  const { regNo } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    getStudentProfile(regNo).then(res => {
      const s = res.data;
      setFormData({
        name: s.name || "",
        fatherName: s.fatherName || "",
        motherName: s.motherName || "",
        address: s.address || "",
        pinCode: s.pinCode || "",
        classId: "", // resolved below once classes load, matched by name
        currentClassName: s.currentClass,
        mobileNumber: s.mobileNumber || "",
        aadharNumber: s.aadharNumber || "",
        dateOfBirth: s.dateOfBirth || "",
        bloodGroup: s.bloodGroup || "",
        emergencyContact: s.emergencyContact || "",
        aadharSubmitted: !!s.aadharSubmitted,
        fatherAadharSubmitted: !!s.fatherAadharSubmitted,
        motherAadharSubmitted: !!s.motherAadharSubmitted,
        transferCertificateSubmitted: !!s.transferCertificateSubmitted,
        birthCertificateSubmitted: !!s.birthCertificateSubmitted,
        photosSubmitted: !!s.photosSubmitted,
        parentConsent: !!s.parentConsent,
      });
      if (s.photoPath) setPhotoPreview(`/api/students/${regNo}/photo`);
    }).catch(err => {
      console.error(err);
      setError("Failed to load student");
    });
  }, [regNo]);

  // Match the student's current class name to a real classId once both are loaded
  useEffect(() => {
    if (!formData || classes.length === 0 || formData.classId) return;
    const match = classes.find(c => c.className === formData.currentClassName);
    if (match) setFormData(prev => ({ ...prev, classId: match.id }));
  }, [classes, formData]);

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
        dateOfBirth: formData.dateOfBirth || null,
      };
      delete payload.currentClassName;

      await updateStudent(regNo, payload);

      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append("file", photoFile);
        try {
          await apiClient.post(`/students/${regNo}/photo`, photoForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (photoErr) {
          console.error(photoErr);
          toast.error("Details saved, but the photo upload failed.");
        }
      }

      navigate(`/students/${regNo}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!formData) return <div className="student-bg"><div className="profile-card">Loading…</div></div>;

  return (
    <div className="student-bg">
      <div className="profile-card">
        <h2>Edit Student</h2>

        {error && (
          <div style={{
            background: "var(--red-50)", border: "1px solid var(--red-100)",
            color: "var(--red-600)", padding: "10px 14px", borderRadius: 10, marginBottom: 16, fontSize: 13
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">

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
            <input name="pinCode" placeholder="Pin Code (6 digits)" value={formData.pinCode} onChange={handleChange} maxLength={6} required />
            <select name="classId" value={formData.classId} onChange={handleChange} required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>

          <div className="row">
            <input name="mobileNumber" placeholder="Mobile Number (10 digits)" value={formData.mobileNumber} onChange={handleChange} maxLength={10} required />
            <input name="aadharNumber" placeholder="Aadhaar Number (optional)" value={formData.aadharNumber} onChange={handleChange} maxLength={12} />
          </div>

          <div className="row">
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleChange} />
            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
              <option value="">Blood Group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <input name="emergencyContact" placeholder="Emergency Contact Number" value={formData.emergencyContact} onChange={handleChange} />

          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Documents On File
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
              {DOCUMENTS.map(doc => (
                <label key={doc.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" name={doc.key} checked={formData[doc.key]} onChange={handleChange} />
                  {doc.label}
                </label>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginTop: 10 }}>
              <input type="checkbox" name="parentConsent" checked={formData.parentConsent} onChange={handleChange} />
              Parent Consent for Digital Records
            </label>
          </div>

          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
