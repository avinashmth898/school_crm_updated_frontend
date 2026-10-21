import apiClient from "./apiClient";

// GET the school profile (single record)
export const getSchoolInfo = () =>
  apiClient.get("/school-info");

// CREATE or UPDATE the school profile (upsert)
export const saveSchoolInfo = (data) =>
  apiClient.put("/school-info", data);
