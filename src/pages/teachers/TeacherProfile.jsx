import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";
import "./TeacherProfile.css";

export default function TeacherProfile() {
  const { id } = useParams();
  const toast = useToast();

  const [teacher, setTeacher] = useState(null);
  const [status, setStatus] = useState("PRESENT");
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setPhotoOk(true);
  }, [teacher?.photoPath]);

  const loadData = async () => {
    try {
      const t = await apiClient.get(`/teachers/${id}`);
      setTeacher(t.data);

      const a = await apiClient.get(`/teacher-attendance/date?date=${today}`);
      const existing = a.data.find(x => x.teacherId === Number(id));

      if (existing) {
        setStatus(existing.status);
        setAlreadyMarked(true);
      }

      const now = new Date();
      const s = await apiClient.get(
        `/api/teacher-attendance/summary/${id}?month=${now.getMonth()+1}&year=${now.getFullYear()}`
      );
      setSummary(s.data);

      // Attendance history
      const h = await apiClient.get(`/teacher-attendance/teacher/${id}`);
      setHistory(h.data.reverse().slice(0, 10)); // latest 10

    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.post("/teacher-attendance", {
        teacherId: Number(id),
        status
      });

      setAlreadyMarked(true);
      toast.success("Saved");

    } catch (err) {
      toast.error(err.response?.data || "Error");
    }
  };

  if (!teacher) return null;

  const photoUrl = `/api/teachers/${id}/photo`;

  return (
    <div className="student-bg">

      <div className="profile-layout">

        {/* LEFT SIDE */}
        <div className="profile-main">

          {/* HEADER */}
          <div className="profile-header">
            <div className="avatar">
              {teacher.photoPath && photoOk
                ? <img
                    src={photoUrl}
                    alt={teacher.name}
                    onError={() => setPhotoOk(false)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                : teacher.name?.charAt(0)}
            </div>

            <div>
              <h2>{teacher.name}</h2>
              <span>{teacher.department} • {teacher.level}</span>
            </div>

            <button className="edit-btn">Edit</button>
          </div>

          {/* PERSONAL */}
          <div className="info-card">
            <h3>Personal</h3>
            <div className="info-grid">
              <p><b>Father:</b> {teacher.fatherName || "-"}</p>
              <p><b>Mobile:</b> {teacher.mobile || "-"}</p>
              <p><b>Email:</b> {teacher.email || "-"}</p>
              <p><b>Address:</b> {teacher.address || "-"}</p>
            </div>
          </div>

          {/* PROFESSIONAL */}
          <div className="info-card">
            <h3>Professional</h3>
            <div className="info-grid">
              <p><b>Qualification:</b> {teacher.qualification || "-"}</p>
              <p><b>Experience:</b> {teacher.experience || "-"} yrs</p>
              <p><b>Subjects:</b> {teacher.subjects || "-"}</p>
              <p><b>Employee ID:</b> {teacher.employeeId || "-"}</p>
            </div>
          </div>

          {/* SUMMARY */}
          {summary && (
            <div className="summary-row">
              <div className="card"><span>Present</span><b>{summary.present}</b></div>
              <div className="card"><span>Absent</span><b>{summary.absent}</b></div>
              <div className="card"><span>Late</span><b>{summary.late}</b></div>
              <div className="card"><span>Half Day</span><b>{summary.halfDay}</b></div>
            </div>
          )}

          {/* ATTENDANCE */}
          <div className="attendance-box">
            <label>Today's Attendance</label>

            <select
              value={status}
              disabled={alreadyMarked}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
            </select>

            <button
              className="primary-btn"
              disabled={alreadyMarked}
              onClick={handleSave}
            >
              {alreadyMarked ? "Already Marked" : "Save"}
            </button>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="profile-side">

          <div className="history-card">
            <h3>Attendance History</h3>

            {history.length === 0 ? (
              <p>No records</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="history-row">
                  <span>{h.date}</span>
                  <span className={`status ${h.status.toLowerCase()}`}>
                    {h.status}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}