import apiClient from "./apiClient";
import { getDeviceId, getDeviceLabel } from "../auth/deviceId";

export const login = async (username, password) => {
  const response = await apiClient.post("/auth/login", {
    username,
    password,
    deviceId: getDeviceId(),
    deviceLabel: getDeviceLabel(),
  });
  return response.data; // { token, username, role }
};
