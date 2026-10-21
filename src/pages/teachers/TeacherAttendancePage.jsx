import { useEffect, useState } from "react";
import "./TeacherAttendance.css";
import { fetchTeachers } from "../../services/teacherService";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";

export default function TeacherAttendancePage() {
  const toast = useToast();

  const [teachers, setTeachers] = useState([]);
  const [attendance, setAttendance] = useState({});

  const today = new Date().toISOString().split("T")[0];

  // Load teachers + today's attendance
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const tRes = await fetchTeachers();
    const teachersList = tRes.data;

    const aRes = await apiClient.get(`/teacher-attendance/date?date=${today}`);
    const attendanceList = aRes.data;

    // Convert attendance to map
    const map = {};
    attendanceList.forEach(a => {
      map[a.teacherId] = a.status;
    });

    setTeachers(teachersList);
    setAttendance(map);
  };

  const handleChange = (teacherId, value) => {
    setAttendance({
      ...attendance,
      [teacherId]: value
    });
  };

  const handleSubmit = async () => {

    const payload = teachers.map(t => ({
      teacherId: t.id,
      status: attendance[t.id] || "PRESENT"
    }));

    try {
      await apiClient.post("/teacher-attendance/bulk", payload);
      toast.success("Attendance saved");
    } catch (err) {
      toast.error(err.response?.data || "Error saving attendance");
    }
  };

  return (
    <div className="student-bg">
      <div className="attendance-container">

        <h2 className="attendance-title">Teacher Attendance</h2>

        <table className="attendance-table">
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.department}</td>
                <td>
                  <select
                    value={attendance[t.id] || "PRESENT"}
                    onChange={(e) => handleChange(t.id, e.target.value)}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="primary-btn" onClick={handleSubmit}>
          Save Attendance
        </button>

      </div>
    </div>
  );
}