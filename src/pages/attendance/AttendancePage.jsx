/**
 * AttendancePage.jsx
 * -------------------
 * Handles attendance overview.
 */

import { useEffect, useState } from "react";
import { getAttendance } from "../../services/attendanceService";

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAttendance()
      .then(setAttendance)
      .catch(() => setError("Failed to load attendance"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Attendance</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {attendance.map((record) => (
          <li key={record.id}>
            {record.studentName} - {record.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendancePage;
