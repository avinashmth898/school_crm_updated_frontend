/**
 * attendanceService.js
 * ---------------------
 * Handles attendance APIs.
 */

import apiClient from "./apiClient";
import { API_PATHS } from "../config/apiConfig";

export const getAttendance = async () => {
  const response = await apiClient.get(`${API_PATHS.ATTENDANCE}`);
  return response.data;
};

export const markAttendance = async (payload) => {
  const response = await apiClient.post(`${API_PATHS.ATTENDANCE}`, payload);
  return response.data;
};
