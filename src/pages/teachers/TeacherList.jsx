import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await apiClient.get("/teachers");
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card">

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Teachers</h2>

          <button
            className="primary-btn"
            style={{ padding: "8px 14px", width: "auto" }}
            onClick={() => navigate("/teachers/new")}
          >
            + Add Teacher
          </button>
        </div>

        {/* TABLE */}
        <table style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Level</th>
            </tr>
          </thead>

          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map(t => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/teachers/${t.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", overflow: "hidden",
                      background: "#f1f5f9", border: "1px solid #e2e8f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "#94a3b8", fontWeight: 700,
                    }}>
                      {t.photoPath
                        ? <img
                            src={`/api/teachers/${t.id}/photo`}
                            alt={t.name}
                            onError={(e) => { e.target.style.display = "none"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        : t.name?.charAt(0)}
                    </div>
                  </td>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.department}</td>
                  <td>{t.level}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default TeacherList;