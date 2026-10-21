import apiClient from "./apiClient";

export const getAnalyticsSummary = () =>
  apiClient.get("/analytics/summary");

export const setAnalyticsEnabled = (enabled) =>
  apiClient.post("/analytics/settings", { enabled });
