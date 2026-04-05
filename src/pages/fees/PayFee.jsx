import "./PayFee.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function PayFee() {
  const { regNo } = useParams();
  const navigate = useNavigate();

  // 🔹 LIST STATE
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [regSearch, setRegSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // 🔹 CHECKOUT STATE
  const [student, setStudent] = useState(null);
  const [transportFee, setTransportFee] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");

  // ================================
  // 🔹 LOAD STUDENTS FOR LIST VIEW
  // ================================
  useEffect(() => {
    apiClient.get("/students")
      .then(res => {
        setStudents(res.data);
        setFiltered(res.data.slice(0, 5));

        // If regNo present → find selected student
        if (regNo) {
          const found = res.data.find(
            s => s.registrationNumber.toString() === regNo
          );
          setStudent(found);
        }
      })
      .catch(console.error);
  }, [regNo]);

  // ================================
  // 🔹 FILTER LOGIC
  // ================================
  useEffect(() => {
    let result = students;

    if (regSearch) {
      result = result.filter(s =>
        s.registrationNumber.toString().includes(regSearch)
      );
    }

    if (nameSearch) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    if (classFilter) {
      result = result.filter(s => s.currentClass === classFilter);
    }

    setFiltered(result.slice(0, 5));
  }, [regSearch, nameSearch, classFilter, students]);

  // ================================
  // 🔹 LOAD TRANSPORT FEE
  // ================================
  useEffect(() => {
    if (!regNo) return;

    apiClient.get(`/student-transportation/${regNo}`)
      .then(res => {
        if (res.data) {
          return apiClient.get(`/config/transport/${res.data.transportFeeId}`);
        }
      })
      .then(res => {
        if (res) setTransportFee(res.data.amount);
      })
      .catch(() => setTransportFee(0));
  }, [regNo]);

  // ================================
  // 🔹 PAYMENT
  // ================================
  const handlePayment = async () => {
    if (!amountPaid) {
      alert("Enter amount");
      return;
    }

    try {
      await apiClient.post("/fees/pay", {
        registrationNumber: regNo,
        amount: amountPaid,
      });

      alert("Payment successful");
      setAmountPaid("");
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  // ================================
  // 🔹 LIST VIEW (NO regNo)
  // ================================
  if (!regNo) {
    return (
      <div className="student-bg">
        <div className="profile-card wide">
          <h2>Pay Fee</h2>

          {/* 🔍 Search */}
          <div className="filter-row">
            <input
              placeholder="Search by Registration Number"
              value={regSearch}
              onChange={(e) => setRegSearch(e.target.value)}
            />
            <input
              placeholder="Search by Name"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {["Nursery","LKG","UKG","1st","2nd","3rd","4th","5th","6th","7th","8th"]
                .map(cls => <option key={cls}>{cls}</option>)}
            </select>
          </div>

          {/* 📋 Student List */}
          <table className="fee-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Class</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(student => (
                <tr
                  key={student.registrationNumber}
                  onClick={() =>
                    navigate(`/students/${student.registrationNumber}/pay-fee`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{student.registrationNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.currentClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ================================
  // 🔹 CHECKOUT VIEW
  // ================================
  if (!student) return <p>Loading student...</p>;

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Fee Checkout</h2>

        <div className="checkout-box">
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Class:</strong> {student.currentClass}</p>
          <p><strong>Registration No:</strong> {student.registrationNumber}</p>

          <hr />

          <p><strong>Pending Fee:</strong> ₹{student.totalFeeDue}</p>
          <p><strong>Transport Fee:</strong> ₹{transportFee}</p>

          <h3>Total Payable: ₹{student.totalFeeDue + transportFee}</h3>

          <input
            type="number"
            placeholder="Enter Amount"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
          />

          <button className="primary-btn" onClick={handlePayment}>
            Pay Fee
          </button>

          <br /><br />

          <button onClick={() => navigate("/pay-fee")}>
            ← Back to List
          </button>
        </div>
      </div>
    </div>
  );
}