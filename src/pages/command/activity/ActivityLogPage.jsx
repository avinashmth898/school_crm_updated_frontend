import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import "../access/access.css";

const PAGE_SIZE = 50;

export default function ActivityLogPage() {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(0); }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = async (targetPage) => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/activity-log", {
        params: { page: targetPage, size: PAGE_SIZE, username: username.trim() || undefined },
      });
      setEntries(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setPage(targetPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString() : "—";
  const isOk = (status) => status != null && status >= 200 && status < 300;

  return (
    <div className="ch-page">
      <h2 className="ch-title">Activity Log</h2>
      <p className="ch-subtitle">
        Every action that changed something in the app — who did it, what endpoint
        they hit, and whether it succeeded. Page views and searches aren't recorded here.
      </p>
      {error && <p className="access-error">{error}</p>}

      <div className="ch-card access-form-card">
        <label>
          Filter by username
          <input
            type="text"
            placeholder="e.g. admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>

      <div className="ch-card">
        {loading ? <p>Loading…</p> : (
          <table className="ch-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{fmt(e.performedOn)}</td>
                  <td>{e.username}</td>
                  <td>{e.method} {e.path}</td>
                  <td>
                    <span className={`access-badge ${isOk(e.status) ? "access-badge-ok" : "access-badge-off"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={4}>No activity recorded{username ? ` for "${username}"` : ""} yet.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="access-row-actions" style={{ marginTop: 14 }}>
            <button className="ch-btn" disabled={page <= 0} onClick={() => load(page - 1)}>Previous</button>
            <span className="access-muted" style={{ alignSelf: "center" }}>Page {page + 1} of {totalPages}</span>
            <button className="ch-btn" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
