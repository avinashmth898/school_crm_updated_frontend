import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import { useToast } from "../../../ui/ToastContext";
import { usePrompt } from "../../../ui/ConfirmContext";
import "./access.css";

export default function UsersPage() {
  const toast = useToast();
  const prompt = usePrompt();
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STAFF");
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    load();
    apiClient.get("/teachers").then(res => setTeachers(res.data || [])).catch(() => {});
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post("/admin/users", {
        username,
        password,
        role,
        teacherId: role === "TEACHER" ? Number(teacherId) : null,
      });
      setUsername(""); setPassword(""); setTeacherId(""); setRole("STAFF");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    }
  };

  const toggleEnabled = async (user) => {
    await apiClient.patch(`/admin/users/${user.id}/enabled`, { enabled: !user.enabled });
    await load();
  };

  const resetPassword = async (user) => {
    const newPassword = await prompt(`New password for "${user.username}" (min 6 characters):`);
    if (!newPassword) return;
    try {
      await apiClient.post(`/admin/users/${user.id}/reset-password`, { newPassword });
      toast.success("Password reset.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="ch-page">
      <h2 className="ch-title">Staff Accounts</h2>
      <p className="ch-subtitle">
        Create logins for Admin, Staff/Accountant, or Teacher roles. New devices for any
        account still need approval on the Devices page before that account can actually sign in.
      </p>

      <div className="ch-card access-form-card">
        <h3>Create account</h3>
        <form onSubmit={createUser} className="access-form">
          <label>
            Username
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Temporary password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
          </label>
          <label>
            Role
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="ADMIN">Admin — full access</option>
              <option value="STAFF">Staff / Accountant — accounts, fees &amp; admission</option>
              <option value="TEACHER">Teacher — marks upload for granted subjects only</option>
            </select>
          </label>
          {role === "TEACHER" && (
            <label>
              Linked teacher record
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required>
                <option value="">Select a teacher…</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.employeeId || "no ID"})</option>
                ))}
              </select>
            </label>
          )}
          <button type="submit" className="ch-btn ch-btn-primary">Create account</button>
        </form>
        {error && <p className="access-error">{error}</p>}
      </div>

      <div className="ch-card">
        <h3>All accounts</h3>
        {loading ? <p>Loading…</p> : (
          <table className="ch-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Teacher link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`access-badge ${u.enabled ? "access-badge-ok" : "access-badge-off"}`}>
                      {u.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td>{u.teacherId || "—"}</td>
                  <td className="access-row-actions">
                    <button className="ch-btn" onClick={() => toggleEnabled(u)}>
                      {u.enabled ? "Disable" : "Enable"}
                    </button>
                    <button className="ch-btn" onClick={() => resetPassword(u)}>Reset password</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5}>No accounts yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
