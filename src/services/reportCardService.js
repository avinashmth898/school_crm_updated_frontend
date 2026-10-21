import apiClient from "./apiClient";

// ===== Marks entry (class-wise grid) =====
export const getExamMarksGrid = (examId, classId) =>
  apiClient.get("/exam-marks/grid", { params: { examId, classId } });

export const saveExamMarksGrid = (payload) =>
  apiClient.put("/exam-marks/grid", payload);

// ===== Grading scale =====
export const getGradeBands = () =>
  apiClient.get("/grade-bands");

export const saveGradeBands = (bands) =>
  apiClient.put("/grade-bands", bands);

export const resetGradeBandsToCbse = () =>
  apiClient.post("/grade-bands/reset-cbse");

// ===== Report cards =====
export const getExamsForClass = (classId) =>
  apiClient.get("/report-cards/exams-for-class", { params: { classId } });

export const generateReportCards = (payload) =>
  apiClient.post("/report-cards/generate", payload);

export const getStudentExamHistory = (registrationNumber) =>
  apiClient.get(`/report-cards/student/${registrationNumber}`);

export const getAdmitCards = (classId, examId) =>
  apiClient.get("/report-cards/admit-cards", { params: { classId, examId } });

// ===== Per-student remarks + attendance (carried into every report run
// for that class/student until edited again) =====
export const getReportCardNotes = (classId) =>
  apiClient.get("/report-cards/notes", { params: { classId } });

export const saveReportCardNote = (note) =>
  apiClient.put("/report-cards/notes", note);

// ===== Exam CRUD (create/edit/delete) =====
export const getExamById = (examId) =>
  apiClient.get(`/exams/${examId}`);

export const createExam = (payload) =>
  apiClient.post("/exams", payload);

export const updateExam = (examId, payload) =>
  apiClient.put(`/exams/${examId}`, payload);

export const deleteExam = (examId) =>
  apiClient.delete(`/exams/${examId}`);
