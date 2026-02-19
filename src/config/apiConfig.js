/**
 * apiConfig.js
 * -------------
 * Central place for ALL backend-related configuration.
 * If backend URL changes, update ONLY this file.
 */

/* Base URL of Spring Boot backend */
export const API_BASE_URL = "http://localhost:8080";

/* Common API paths */
export const API_PATHS = {
  AUTH: "/api/auth",
  USERS: "/api/users",
  STUDENTS: "/api/students",
  TEACHERS: "/api/teachers",
  DASHBOARD: "/api/dashboard",
};
