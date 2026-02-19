/**
 * StudentsPage.jsx
 * -----------------
 * Displays student-related information.
 */

import { useEffect, useState } from "react";
import { getAllStudents } from "../../services/studentService";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllStudents()
      .then(setStudents)
      .catch(() => setError("Failed to load students"));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Students</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} ({student.rollNo})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentsPage;
