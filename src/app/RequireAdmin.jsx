import { Navigate } from "react-router-dom";
import { isAdmin } from "../auth/authStorage";

// UI-layer convenience only — the real boundary is SecurityConfig on the
// backend (ROLE_ADMIN required on /api/admin/**). This just stops a
// non-admin from landing on a page that would only show them failed API
// calls, and redirects them somewhere useful instead.
const RequireAdmin = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RequireAdmin;
