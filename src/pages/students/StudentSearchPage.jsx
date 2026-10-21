import "./student.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getAllStudents } from "../../services/studentService";
import EmptyState from "../../ui/EmptyState";
import Icon from "../../ui/icons";

export default function StudentSearchPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({
    regNo: "",
    name: "",
    className: "",
    status: "ACTIVE",
  });

  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    getAllStudents(filters.status).then(res => setStudents(res.data));
  }, [filters.status]);

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
            {classes.map(c => (
              <option key={c.id} value={c.className}>{c.className}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="GRADUATED">Graduated</option>
            <option value="ALL">All</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="table-card wide">
          <table>
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Admission No</th>
                <th>Name</th>
                <th>Father’s Name</th>
                <th>Class</th>
                <th>Mobile</th>
                <th>Status</th>
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
                  <td>{student.admissionNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.fatherName}</td>
                  <td>{student.currentClass}</td>
                  <td>{student.mobileNumber || "-"}</td>
                  <td>{student.status || "ACTIVE"}</td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-row">
                    <EmptyState icon={Icon.Search} message="No students found. Try a different name, class, or filter." />
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
