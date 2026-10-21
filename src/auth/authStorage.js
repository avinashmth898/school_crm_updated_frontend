const TOKEN_KEY = "schoolcrm_token";
const ROLE_KEY = "schoolcrm_role";
const USERNAME_KEY = "schoolcrm_username";

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

// Stored directly from the login response (see authService.js) rather
// than decoded from the JWT — one less thing the frontend needs a JWT
// library for. Used to gate admin-only nav/routes client-side; the real
// boundary is still enforced server-side by SecurityConfig.
export const setSession = ({ token, role, username }) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (role) localStorage.setItem(ROLE_KEY, role);
  if (username) localStorage.setItem(USERNAME_KEY, username);
};

export const getRole = () => localStorage.getItem(ROLE_KEY);
export const getUsername = () => localStorage.getItem(USERNAME_KEY);
export const isAdmin = () => getRole() === "ADMIN";
