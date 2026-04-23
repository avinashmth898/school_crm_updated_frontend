import axios from "axios";
import { getToken } from "../auth/authStorage";

export const registerStudent = (data) => {
  return axios.post(
    "https://edschoolak.onrender.com/api/students",
    data,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    }
  );
};

export const getStudentProfile = (regNo) => {
  return axios.get(
    `http://localhost:8080/api/students/${regNo}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
};

/* ✅ THIS WAS MISSING */
export const getAllStudents = () => {
  return axios.get(
    "http://localhost:8080/api/students",
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
};
