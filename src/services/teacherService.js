import apiClient from "./apiClient";

export const fetchTeachers = () => apiClient.get("/teachers");