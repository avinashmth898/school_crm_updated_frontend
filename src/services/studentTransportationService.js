import apiClient from "./apiClient";

export const assignTransport = (regNo, transportFeeId) =>
  apiClient.post("/student-transportation/assign", null, {
    params: { regNo, transportFeeId },
  });