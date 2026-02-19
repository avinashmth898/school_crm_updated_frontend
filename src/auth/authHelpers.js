/**
 * authHelpers.js
 * ----------------
 * Read-only helper utilities.
 * No mutation here.
 */

import { getToken } from "./authStorage";

/* Check if user is logged in */
export const isLoggedIn = () => {
  const token = getToken();
  return !!token;
};

/* Optional: decode role later */
export const getUserRole = () => {
  // future use: decode JWT
  return null;
};
