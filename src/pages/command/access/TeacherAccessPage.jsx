import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import { useToast } from "../../../ui/ToastContext";
import "./access.css";

export default function TeacherAccessPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [grants, setGrants] = useState([]); // [{id, classCategoryId, subjectId, enabled}]
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    apiClient.get("/teachers").then(res => setTeachers(res.data || [])).catch(() => {});
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!teacherId) { setGrants([]); return; }
    loadGrants();
  }, [teacherId]);

  const loadGrants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/teacher-access", { params: { teacherId } });
      setGrants(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load teacher access grants");
    } finally {
      setLoading(false);
    }
  };

  const grantFor = (classId, subjectId) =>
    grants.find(g => g.classCategoryId === classId && g.subjectId === subjectId && g.enabled);

  const toggle = async (classId, subjectId) => {
    const existing = grantFor(classId, subjectId);
    try {
      if (existing) {
        await apiClient.delete(`/admin/teacher-access/${existing.id}`);
      } else {
        await apiClient.post("/admin/teacher-access", {
          teacherId: Number(teacherId),
          classCategoryId: classId,
          subjectId,
        });
      }
      await loadGrants();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update subject access");
    }
  };

  return (
    <div className="ch-page">
      <h2 className="ch-title">Teacher Subject Access</h2>
      <p className="ch-subtitle">
        Grant a teacher access to marks entry for specific class + subject combinations.
        Teachers only see and can edit marks for subjects checked here.
      </p>

      <div className="ch-card access-form-card">
        <label>
          Teacher
          <select value={teacherId} onChange={e => setTeacherId(e.target.value)}>
            <option value="">Select a teacher…</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.employeeId || "no ID"})</option>
            ))}
          </select>
        </label>
      </div>

      {teacherId && (
        <div className="ch-card">
          <h3>Grant access</h3>
          {loading ? <p>Loading…</p> : (
            <table className="ch-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Subjects (click to grant/revoke)</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id}>
                    <td>{cls.className}</td>
                    <td className="access-subject-chips">
                      {(cls.subjects || []).map(s => {
                        const granted = !!grantFor(cls.id, s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            className={`access-chip ${granted ? "access-chip-on" : ""}`}
                            onClick={() => toggle(cls.id, s.id)}
                          >
                            {granted ? "✓ " : ""}{s.name}
                          </button>
                        );
                      })}
                      {(!cls.subjects || cls.subjects.length === 0) && <span className="access-muted">No subjects set for this class</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
