import "./StudentRegistrationPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../../services/studentService";
import { getTransportFees } from "../../services/transportService";
import { assignTransport } from "../../services/studentTransportationService";

export default function StudentRegistrationPage() {
  const navigate = useNavigate();

  const [transportFees, setTransportFees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    address: "",
    pinCode: "",
    currentClass: "",
    mobileNumber: "",
    aadharNumber: "",
    usesTransport: "false", // ✅ string
    transportFeeId: "",
  });

  // ✅ Load routes
  useEffect(() => {
    const loadFees = async () => {
      try {
        const res = await getTransportFees();
        setTransportFees(res.data || []);
      } catch (err) {
        console.error("Failed to load transport fees", err);
      }
    };

    loadFees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await registerStudent(formData);
      const regNo = res.data.registrationNumber;

      // ✅ assign transport
      if (formData.usesTransport === "true" && formData.transportFeeId) {
        await assignTransport(regNo, formData.transportFeeId);
      }

      navigate(`/students/${regNo}`);
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card">
        <h2>New Student Registration</h2>

        <form onSubmit={handleSubmit} className="student-form">
          <input
            name="name"
            placeholder="Student Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            name="fatherName"
            placeholder="Father Name"
            value={formData.fatherName}
            onChange={handleChange}
            required
          />

          <input
            name="motherName"
            placeholder="Mother Name"
            value={formData.motherName}
            onChange={handleChange}
            required
          />

          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <div className="row">
            <input
              name="pinCode"
              placeholder="Pin Code"
              value={formData.pinCode}
              onChange={handleChange}
              required
            />

            <select
              name="currentClass"
              value={formData.currentClass}
              onChange={handleChange}
              required
            >
              <option value="">Select Class</option>
              <option>Nursery</option>
              <option>LKG</option>
              <option>UKG</option>
              <option>1st</option>
              <option>2nd</option>
              <option>3rd</option>
              <option>4th</option>
              <option>5th</option>
              <option>6th</option>
              <option>7th</option>
              <option>8th</option>
            </select>
          </div>

          <div className="row">
            <input
              name="mobileNumber"
              placeholder="Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />

            <input
              name="aadharNumber"
              placeholder="Aadhaar Number"
              value={formData.aadharNumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Transport Toggle */}
          <div className="row">
            <select
              name="usesTransport"
              value={formData.usesTransport}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usesTransport: e.target.value,
                  transportFeeId: "",
                })
              }
            >
              <option value="false">Transport Required? — No</option>
              <option value="true">Transport Required? — Yes</option>
            </select>
          </div>

          {/* Transport dropdown */}
          {formData.usesTransport === "true" && (
            <select
              name="transportFeeId"
              value={formData.transportFeeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Route</option>
              {transportFees.map((t) => (
                <option key={t.id} value={t.transportFeeId}>
                  {t.routeName} — ₹{t.amount}
                </option>
              ))}
            </select>
          )}



          <button type="submit" className="primary-btn">
            Register Student
          </button>
        </form>
      </div>
    </div>
  );
}