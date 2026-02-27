import "./fees.css";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

export default function PayFee() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [regSearch, setRegSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  // 🔹 Fetch students (limit 5)
  useEffect(() => {
    apiClient.get("/students")
      .then(res => {
        setStudents(res.data);
        setFiltered(res.data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  // 🔹 Filter logic
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

  const handleSelect = (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Pay Fee</h2>

        {/* 🔍 Search Bar */}
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

        {/* 👇 Selected Student */}
        {selectedStudent && (
          <div className="selected-student">
            Selected: {selectedStudent.name} ({selectedStudent.currentClass})
          </div>
        )}

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
                onClick={() => handleSelect(student)}
                className={
                  selectedStudent?.registrationNumber === student.registrationNumber
                    ? "row-selected"
                    : ""
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
