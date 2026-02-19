import axios from "axios";
import { getToken } from "../auth/authStorage";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api", // 👈 MUST be /api
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;