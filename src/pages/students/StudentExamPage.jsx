import "./StudentExamPage.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { getStudentExamHistory } from "../../services/reportCardService";

export default function StudentExamPage() {
  const { regNo } = useParams();

  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get(`/students/${regNo}`)
      .then(res => setStudent(res.data))
      .catch(err => {
        console.error("Failed to fetch student", err);
        setError("Could not load this student.");
      });
  }, [regNo]);

  useEffect(() => {
    getStudentExamHistory(regNo)
      .then(res => setHistory(res.data))
      .catch(err => {
        console.error("Failed to fetch exam history", err);
        setError(err?.response?.data?.message || "Could not load exam history for this student.");
      });
  }, [regNo]);

  if (error) return <p className="exam-page-error">{error}</p>;
  if (!student || !history) return <p>Loading...</p>;

  // Union of every subject that appears across any exam, in first-seen
  // order, so the table has one stable row per subject even if different
  // exams were mapped to slightly different subject lists.
  const subjectOrder = [];
  const subjectSeen = new Set();
  history.exams.forEach(exam => {
    exam.subjects.forEach(s => {
      if (!subjectSeen.has(s.subjectId)) {
        subjectSeen.add(s.subjectId);
        subjectOrder.push({ subjectId: s.subjectId, name: s.subjectName });
      }
    });
  });

  const cellFor = (exam, subjectId) => exam.subjects.find(s => s.subjectId === subjectId);

  return (
    <div className="exam-page">

      <div className="student-header">
        <h2>{student.name}</h2>
        <p>
          Reg No: {student.registrationNumber} | Class: {student.currentClass}
        </p>
      </div>

      {history.exams.length === 0 ? (
        <p className="exam-page-empty">No exams have been recorded for this class yet.</p>
      ) : subjectOrder.length === 0 ? (
        <p className="exam-page-empty">The exams created for this class have no subjects configured.</p>
      ) : (
        <div className="exam-table-container">
          <table className="exam-table">
            <thead>
              <tr>
                <th>Subject</th>
                {history.exams.map(exam => (
                  <th key={exam.examId}>
                    {exam.examName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjectOrder.map(subject => (
                <tr key={subject.subjectId}>
                  <td className="subject-cell">{subject.name}</td>
                  {history.exams.map(exam => {
                    const cell = cellFor(exam, subject.subjectId);
                    if (!cell) return <td key={exam.examId}>—</td>;
                    if (cell.absent) return <td key={exam.examId} className="exam-absent">AB</td>;
                    if (cell.marksObtained === null || cell.marksObtained === undefined) {
                      return <td key={exam.examId}>—</td>;
                    }
                    return <td key={exam.examId}>{cell.marksObtained} / {cell.maxMarks}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
