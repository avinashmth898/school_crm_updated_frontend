import apiClient from "./apiClient";

export const getLicenseStatus = () =>
  apiClient.get("/license/status");

export const getDeviceId = () =>
  apiClient.get("/license/device-id");

export const uploadLicense = (licenseFileContent) =>
  apiClient.post("/license/upload", { licenseFileContent });
