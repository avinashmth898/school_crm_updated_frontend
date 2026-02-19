import "./student.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "../../services/studentService";

export default function StudentSearchPage() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    regNo: "",
    name: "",
    className: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    getAllStudents().then(res => setStudents(res.data));
  }, []);

  const filteredStudents = students.filter(s => {
    return (
      (filters.regNo === "" ||
        String(s.registrationNumber).includes(filters.regNo)) &&
      (filters.name === "" ||
        s.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.className === "" ||
        s.currentClass === filters.className)
    );
  });

  return (
    <div className="student-bg">
      <div className="list-wrapper full-width">

        {/* Header */}
        <div className="students-topbar">
          <h2> </h2>

          <button
                className="create-btn"
                onClick={() => navigate("/students/new")}
              >
                + New Student
              </button>
        </div>

        <div className="list-header">
          <h2>Students</h2>
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="search-row">
          <input
            type="text"
            placeholder="Search by Registration Number"
            value={filters.regNo}
            onChange={(e) =>
              setFilters({ ...filters, regNo: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Search by Name"
            value={filters.name}
            onChange={(e) =>
              setFilters({ ...filters, name: e.target.value })
            }
          />

          <select
            value={filters.className}
            onChange={(e) =>
              setFilters({ ...filters, className: e.target.value })
            }
          >
            <option value="">All Classes</option>
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

        {/* TABLE */}
        <div className="table-card wide">
          <table>
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Father’s Name</th>
                <th>Class</th>
                <th>Mobile</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map(student => (
                <tr
                  key={student.registrationNumber}
                  onClick={() =>
                    navigate(`/students/${student.registrationNumber}`)
                  }
                >
                  <td>{student.registrationNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.fatherName}</td>
                  <td>{student.currentClass}</td>
                  <td>{student.mobileNumber || "-"}</td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
