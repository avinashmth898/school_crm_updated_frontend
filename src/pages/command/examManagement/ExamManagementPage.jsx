import "./ExamManagementPage.css";
import apiClient from "../../../services/apiClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../ui/ToastContext";
import { useConfirm } from "../../../ui/ConfirmContext";

export default function ExamManagementPage() {

const navigate = useNavigate();
const toast = useToast();
const confirm = useConfirm();

const [exams, setExams] = useState([]);
const [loading, setLoading] = useState(true);

// FETCH EXAMS FROM BACKEND
useEffect(() => {
fetchExams();
}, []);

const fetchExams = async () => {
try {
const res = await apiClient.get("/exams");

  const examsWithState = (res.data || []).map(e => ({
    ...e,
    isOpen: false
  }));

  setExams(examsWithState);
} catch (err) {
  console.error("Failed to load exams", err);
} finally {
  setLoading(false);
}
};

// DELETE EXAM — the backend already restricts this to Admin accounts
// (SecurityConfig), so the old "type the admin password" prompt was only
// a frontend speed bump, and one that printed the password in plain text
// on screen. A plain confirmation is all that's needed now.
const handleDelete = async (examId) => {

  const confirmed = await confirm({
    message: "Delete this exam? Any marks already entered for it will be removed too. This can't be undone.",
    confirmLabel: "Delete",
    danger: true,
  });
  if (!confirmed) return;

  try {
    await apiClient.delete(`/exams/${examId}`);
    toast.success("Exam deleted successfully");
    fetchExams();
  } catch (err) {
    toast.error(err?.response?.data?.message || "Delete failed");
  }
};

// TOGGLE EXPAND
const toggleExam = (index) => {
const updated = [...exams];
updated[index].isOpen = !updated[index].isOpen;
setExams(updated);
};

return (
<div className="exam-page">

  <h2>📊 Exam Management</h2>

  {loading && <p>Loading exams...</p>}

  {!loading && exams.length === 0 && (
    <p>No exams created yet</p>
  )}

  {!loading && exams.map((exam, i) => (
    <div key={i} className="exam-tile">

      <div
        className="exam-header"
        onClick={() => toggleExam(i)}
      >
        <div>
          <h3>{exam.examName}</h3>
          <p>{exam.examDate}</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          {/* EDIT BUTTON */}
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/command-centre/exams/${exam.examId}/edit`);
            }}
            title="Edit exam"
            aria-label={`Edit exam ${exam.examName}`}
          >
            ✏️
          </button>

          {/* DELETE BUTTON */}
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(exam.examId);
            }}
            aria-label={`Delete exam ${exam.examName}`}
          >
            🗑
          </button>

          <span className="arrow">
            {exam.isOpen ? "▼" : "▶"}
          </span>

        </div>
      </div>

      {exam.isOpen && (
        <div className="class-list">

          {exam.classes && exam.classes.map((cls, j) => (
            <div key={j} className="class-item">

              <div className="class-name">
                {cls.className}
              </div>

              <div className="subjects">
                {cls.subjects && cls.subjects.length > 0
                  ? cls.subjects.join(", ")
                  : "No subjects"}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  ))}

</div>
);
}