import apiClient from "./apiClient";

/**
 * FETCH ALL STUDENTS
 * We export it as 'fetchStudents' AND 'getAllStudents'
 * so all your components work without errors.
 *
 * status: "ACTIVE" | "WITHDRAWN" | "GRADUATED" | "ALL" (defaults to ACTIVE
 * so withdrawn/graduated students don't clutter the day-to-day list).
 */
export const fetchStudents = (status = "ACTIVE") => {
  return apiClient.get("/students", { params: { status } });
};

// Add this line to satisfy StudentSearchPage.jsx
export const getAllStudents = fetchStudents;

/**
 * GET SINGLE STUDENT PROFILE
 */
export const getStudentProfile = (regNo) => {
  return apiClient.get(`/students/${regNo}`);
};

/**
 * REGISTER A NEW STUDENT
 */
export const registerStudent = (data) => {
  return apiClient.post("/students", data);
};

/**
 * EDIT AN EXISTING STUDENT
 */
export const updateStudent = (regNo, data) => {
  return apiClient.put(`/students/${regNo}`, data);
};

/**
 * WITHDRAW / GRADUATE / REACTIVATE
 */
export const updateStudentStatus = (regNo, status, reason) => {
  return apiClient.put(`/students/${regNo}/status`, { status, reason });
};