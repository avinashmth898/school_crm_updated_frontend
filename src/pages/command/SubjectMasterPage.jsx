import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { useConfirm } from "../../ui/ConfirmContext";
import "./subjectMaster.css";

export default function SubjectMasterPage() {
  const confirm = useConfirm();
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("1");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await apiClient.get("/subjects");
      setSubjects(res.data || []);
    } catch (err) {
      setError("Failed to load subjects. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    // Validation
    if (!name.trim()) {
      setError("Please enter a subject name");
      return;
    }

    try {
      setError("");
      const creditWeight = Number(weight) > 0 ? Number(weight) : 1;

      if (editingId) {
        await apiClient.put(`/subjects/${editingId}`, { name: name.trim(), creditWeight });
      } else {
        await apiClient.post("/subjects", { name: name.trim(), creditWeight });
      }

      // Reset form
      setName("");
      setWeight("1");
      setEditingId(null);

      // Reload data
      await loadSubjects();
    } catch (err) {
      setError(editingId ? "Failed to update subject" : "Failed to add subject");
      console.error(err);
    }
  };

  const handleEdit = (subject) => {
    setName(subject.name);
    setWeight(String(subject.creditWeight ?? 1));
    setEditingId(subject.id);
    setError("");
  };

  const handleCancelEdit = () => {
    setName("");
    setWeight("1");
    setEditingId(null);
    setError("");
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      message: "Are you sure you want to delete this subject?",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) {
      return;
    }

    try {
      setError("");
      await apiClient.delete(`/subjects/${id}`);
      await loadSubjects();
    } catch (err) {
      setError("Failed to delete subject");
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddOrUpdate();
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className="subject-master-container">
      <div className="subject-master-card">

        {/* Header */}
        <div className="card-header">
          <h2>📚 Subject Master</h2>
          <p className="card-subtitle">Manage all subjects in the system</p>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="subject-input">
              {editingId ? "Edit Subject" : "Add New Subject"}
            </label>

            <div className="input-wrapper">
              <input
                id="subject-input"
                type="text"
                className="subject-input"
                placeholder="Enter subject name (e.g., Mathematics, Physics)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyPress}
                autoComplete="off"
              />

              <input
                id="subject-weight-input"
                type="number"
                min="0.1"
                step="0.1"
                className="subject-input"
                style={{ maxWidth: 100 }}
                title="Relative weight of this subject in the overall report card percentage (default 1)"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={handleKeyPress}
              />

              <div className="button-group">
                <button
                  className="btn-primary"
                  onClick={handleAddOrUpdate}
                  disabled={!name.trim()}
                >
                  {editingId ? "✓ Update" : "+ Add"}
                </button>

                {editingId && (
                  <button
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    ✕ Cancel
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="table-header">
            <h3>All Subjects ({subjects.length})</h3>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading subjects...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="subject-table">
                <thead>
                  <tr>
                    <th className="col-number">#</th>
                    <th className="col-name">Subject Name</th>
                    <th className="col-number">Weight</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {subjects.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">
                        <div className="empty-state">
                          <div className="empty-icon">📖</div>
                          <p>No subjects added yet</p>
                          <span>Add your first subject using the form above</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    subjects.map((subject, index) => (
                      <tr
                        key={subject.id}
                        className={editingId === subject.id ? "editing-row" : ""}
                      >
                        <td className="col-number">{index + 1}</td>
                        <td className="col-name">
                          <span className="subject-name">{subject.name}</span>
                        </td>
                        <td className="col-number">{subject.creditWeight ?? 1}</td>
                        <td className="col-actions">
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEdit(subject)}
                              title="Edit subject"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(subject.id)}
                              title="Delete subject"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}