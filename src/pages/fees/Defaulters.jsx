import "./Defaulters.css";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";

export default function Defaulters() {
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const classOrder = [
    "Nursery","LKG","UKG",
    "1st","2nd","3rd","4th","5th","6th","7th","8th"
  ];

  // 🔹 Fetch Defaulters
  useEffect(() => {
    fetchDefaulters();
  }, []);

  const fetchDefaulters = async (cls = "") => {
    try {
      setLoading(true);

      const url = cls
        ? `/defaulters?className=${cls}`
        : "/defaulters";

      const res = await apiClient.get(url);
      setStudents(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Filter
  const handleFilterChange = (cls) => {
    setClassFilter(cls);
    fetchDefaulters(cls);
  };

  // 🔹 Expand Row
  const toggleExpand = (regNo) => {
    setExpanded(expanded === regNo ? null : regNo);
  };

  return (
    <div className="defaulter-page">
      <div className="defaulter-card">

        <h2>🚨 Fee Defaulters</h2>

        {/* 🔍 Filter */}
        <div className="filter-row">
          <select
            value={classFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Classes</option>
            {classOrder.map(cls => (
              <option key={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* ⏳ Loading */}
        {loading && <p className="loading">Loading defaulters...</p>}

        {/* 📋 Table */}
        {!loading && students.length > 0 && (
          <div className="table-wrapper">
            <table className="defaulter-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Mobile</th>
                  <th>Due Months</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <>
                    {/* MAIN ROW */}
                    <tr
                      key={s.registrationNumber}
                      className="clickable-row"
                      onClick={() => toggleExpand(s.registrationNumber)}
                    >
                      <td>{s.registrationNumber}</td>
                      <td>{s.name}</td>
                      <td>{s.currentClass}</td>
                      <td>{s.mobileNumber}</td>
                      <td className="due">
                        🔴 {s.dueCount} months
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expanded === s.registrationNumber && (
                      <tr className="expanded-row">
                        <td colSpan="5">
                          <div className="expanded-content">

                            <p><strong>Due Months:</strong></p>

                            <div className="months-list">
                              {s.dueMonths.map((m, i) => (
                                <span key={i} className="month-chip">
                                  {m}
                                </span>
                              ))}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ❌ Empty */}
        {!loading && students.length === 0 && (
          <p className="empty">No defaulters found.</p>
        )}

      </div>
    </div>
  );
}