import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import { useConfirm } from "../../../ui/ConfirmContext";
import "./access.css";

export default function DevicesPage() {
  const confirm = useConfirm();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/devices");
      setDevices(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  };

  const setEnabled = async (device, enabled) => {
    await apiClient.patch(`/admin/devices/${device.id}/enabled`, { enabled });
    await load();
  };

  const revoke = async (device) => {
    const ok = await confirm({
      message: `Revoke this device for "${device.username}"? They'll need to log in again and get re-approved.`,
      confirmLabel: "Revoke",
      danger: true,
    });
    if (!ok) return;
    await apiClient.delete(`/admin/devices/${device.id}`);
    await load();
  };

  const fmt = (d) => d ? new Date(d).toLocaleString() : "—";
  const pending = devices.filter(d => !d.enabled);
  const approved = devices.filter(d => d.enabled);

  return (
    <div className="ch-page">
      <h2 className="ch-title">Devices</h2>
      <p className="ch-subtitle">
        A brand new device for any account is blocked from logging in until approved here —
        except each account's very first device, which is auto-approved so a new account
        isn't locked out before anyone can approve it.
      </p>
      {error && <p className="access-error">{error}</p>}

      <div className="ch-card">
        <h3>Pending approval ({pending.length})</h3>
        {loading ? <p>Loading…</p> : (
          <table className="ch-table">
            <thead>
              <tr><th>Username</th><th>Device</th><th>First seen</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pending.map(d => (
                <tr key={d.id}>
                  <td>{d.username || `user #${d.userId}`}</td>
                  <td>{d.deviceLabel || "Unknown device"}</td>
                  <td>{fmt(d.firstSeenAt)}</td>
                  <td className="access-row-actions">
                    <button className="ch-btn ch-btn-primary" onClick={() => setEnabled(d, true)}>Approve</button>
                    <button className="ch-btn" onClick={() => revoke(d)}>Reject</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={4}>Nothing waiting on approval.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className="ch-card">
        <h3>Approved devices ({approved.length})</h3>
        {!loading && (
          <table className="ch-table">
            <thead>
              <tr><th>Username</th><th>Device</th><th>Last used</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {approved.map(d => (
                <tr key={d.id}>
                  <td>{d.username || `user #${d.userId}`}</td>
                  <td>{d.deviceLabel || "Unknown device"}</td>
                  <td>{fmt(d.lastUsedAt)}</td>
                  <td className="access-row-actions">
                    <button className="ch-btn" onClick={() => setEnabled(d, false)}>Disable</button>
                    <button className="ch-btn" onClick={() => revoke(d)}>Revoke</button>
                  </td>
                </tr>
              ))}
              {approved.length === 0 && <tr><td colSpan={4}>No approved devices yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
