import "./TeacherRegistrationPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";

export default function TeacherRegistrationPage() {

  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    mobile: "",
    email: "",
    address: "",
    aadhar: "",
    pan: "",
    qualification: "",
    experience: "",
    subjects: "",
    level: "",
    employeeId: "",
    department: "",
    salary: "",
    bankAccount: "",
    ifsc: "",
    joiningDate: "",
    isClassTeacher: "false",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        experience: Number(formData.experience),
        salary: Number(formData.salary),
        isClassTeacher: formData.isClassTeacher === "true",
      };

      const res = await apiClient.post("/teachers", payload);

      if (photoFile) {
        const photoForm = new FormData();
        photoForm.append("file", photoFile);
        try {
          await apiClient.post(`/teachers/${res.data.id}/photo`, photoForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (photoErr) {
          console.error(photoErr);
          toast.error("Teacher registered, but the photo upload failed.");
        }
      }

      toast.success("Teacher registered successfully");

      // Navigate to profile
      navigate(`/teachers/${res.data.id}`);

    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card">
        <h2>Teacher Registration</h2>

        <form className="student-form" onSubmit={handleSubmit}>

          {/* PHOTO */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
              background: "#f1f5f9", border: "1px solid #e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94a3b8"
            }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "No Photo"}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                Profile Photo
              </label>
              <input type="file" accept="image/png, image/jpeg" onChange={handlePhotoChange} />
            </div>
          </div>

          {/* PERSONAL */}
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input name="fatherName" placeholder="Father Name" value={formData.fatherName} onChange={handleChange} />

          <div className="row">
            <input name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required />
            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>

          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

          {/* IDENTITY */}
          <div className="row">
            <input name="aadhar" placeholder="Aadhar Number" value={formData.aadhar} onChange={handleChange} />
            <input name="pan" placeholder="PAN Number" value={formData.pan} onChange={handleChange} />
          </div>

          {/* PROFESSIONAL */}
          <input name="qualification" placeholder="Qualification (B.Ed, M.Ed...)" value={formData.qualification} onChange={handleChange} />
          <input name="experience" placeholder="Experience (Years)" value={formData.experience} onChange={handleChange} />

          <input name="subjects" placeholder="Subjects (e.g. Math, Physics)" value={formData.subjects} onChange={handleChange} />

          <select name="level" value={formData.level} onChange={handleChange} required>
            <option value="">Select Level</option>
            <option value="PRT">PRT</option>
            <option value="TGT">TGT</option>
            <option value="PGT">PGT</option>
          </select>

          {/* SYSTEM */}
          <div className="row">
            <input name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} />
            <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
          </div>

          <select name="isClassTeacher" value={formData.isClassTeacher} onChange={handleChange}>
            <option value="false">Class Teacher? — No</option>
            <option value="true">Class Teacher? — Yes</option>
          </select>

          {/* PAYROLL */}
          <div className="row">
            <input name="salary" placeholder="Salary" value={formData.salary} onChange={handleChange} />
            <input name="bankAccount" placeholder="Bank Account Number" value={formData.bankAccount} onChange={handleChange} />
          </div>

          <input name="ifsc" placeholder="IFSC Code" value={formData.ifsc} onChange={handleChange} />

          <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />

          <button type="submit" className="primary-btn">
            Register Teacher
          </button>

        </form>
      </div>
    </div>
  );
}