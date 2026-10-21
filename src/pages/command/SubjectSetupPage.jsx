import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";
import "./SubjectSetupPage.css";

export default function SubjectSetupPage() {
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [subjectBank, setSubjectBank] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [c, s] = await Promise.all([
        apiClient.get("/classes"),
        apiClient.get("/subjects")
      ]);

      setClasses(c.data || []);
      setSubjectBank(s.data || []);

    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (classId, subjectId) => {
    setSelected(prev => ({ ...prev, [classId]: subjectId }));
  };

  const handleAdd = async (classId) => {
    const subjectId = selected[classId];
    if (!subjectId) return toast.error("Select a subject");

    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    if (cls.subjects?.some(s => s.id === Number(subjectId))) {
      return toast.error("Subject already added");
    }

    const updatedSubjects = [
      ...(cls.subjects || []).map(s => s.id),
      Number(subjectId)
    ];

    try {
      setLoading(true);

      await apiClient.post("/classes/assign-subjects", {
        classId,
        subjectIds: updatedSubjects
      });

      await loadData();

    } catch {
      toast.error("Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId, subjectId) => {

    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    const updatedSubjects = (cls.subjects || [])
      .filter(s => s.id !== subjectId)
      .map(s => s.id);

    try {
      setLoading(true);

      await apiClient.post("/classes/assign-subjects", {
        classId,
        subjectIds: updatedSubjects
      });

      await loadData();

    } catch {
      toast.error("Failed to remove subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subject-setup-container">

      <div className="subject-setup-card">

        {/* HEADER */}
        <div className="card-header">
          <h2>📚 Subject Setup</h2>
          <p>Assign subjects to each class</p>
        </div>

        {loading && <p className="loading">Loading...</p>}

        <div className="class-grid">

          {classes.map(c => (
            <div key={c.id} className="class-card">

              <div className="class-title">{c.className}</div>

              {/* SUBJECTS */}
              <div className="chip-container">

                {(c.subjects || []).length === 0 && (
                  <p className="empty-text">No subjects assigned</p>
                )}

                {(c.subjects || []).map(s => (
                  <div key={s.id} className="chip">
                    {s.name}
                    <span
                      className="chip-remove"
                      onClick={() => handleDelete(c.id, s.id)}
                    >
                      ✕
                    </span>
                  </div>
                ))}

              </div>

              {/* ACTION */}
              <div className="action-row">

                <select
                  value={selected[c.id] || ""}
                  onChange={(e) => handleSelect(c.id, e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjectBank.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button onClick={() => handleAdd(c.id)}>
                  Add
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}