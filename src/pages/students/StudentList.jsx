import { useEffect, useState } from "react";
import { fetchStudents } from "../../services/studentService";
import { useNavigate } from "react-router-dom";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents().then(res => setStudents(res.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Reg No</th>
          <th>Name</th>
          <th>Class</th>
        </tr>
      </thead>
      <tbody>
        {students.map(s => (
          <tr
            key={s.registrationNumber}
            onClick={() => navigate(`/students/${s.registrationNumber}`)}
          >
            <td>{s.registrationNumber}</td>
            <td>{s.name}</td>
            <td>{s.currentClass}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentList;
