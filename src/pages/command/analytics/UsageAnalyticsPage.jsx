import { useEffect, useState } from "react";
import { getAnalyticsSummary, setAnalyticsEnabled } from "../../../services/analyticsService";
import { useToast } from "../../../ui/ToastContext";
import "./UsageAnalyticsPage.css";

// Fully disclosed usage analytics: this page is the ONLY place this
// data is shown, the toggle here is the real switch (not cosmetic —
// turning it off stops collection immediately), and everything
// collected is a count, never a name, amount, or record.
const UsageAnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const toast = useToast();

  const load = () => {
    getAnalyticsSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError("Could not load analytics. Is the backend running?"));
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = () => {
    if (!summary) return;
    setToggling(true);
    setAnalyticsEnabled(!summary.enabled)
      .then(() => load())
      .catch((err) => toast.error(err.response?.data?.message || "Failed to update analytics setting"))
      .finally(() => setToggling(false));
  };

  if (error) {
    return (
      <div className="ua-page">
        <div className="ua-card">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="ua-page">
        <div className="ua-card">Loading…</div>
      </div>
    );
  }

  const resourceEntries = Object.entries(summary.topEndpointsToday || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="ua-page">
      <div className="ua-card">
        <div className="ua-toggle-row">
          <label>Usage analytics</label>
          <label className="ua-switch">
            <input type="checkbox" checked={summary.enabled} onChange={handleToggle} disabled={toggling} />
            <span className="ua-slider" />
          </label>
        </div>
        <p className="ua-note">
          When on, this counts how many requests each part of the app gets, per day — purely to help plan future
          improvements. It never records student names, fee amounts, marks, or any other content — only counts.
          You can turn this off at any time; doing so stops collection immediately.
        </p>
      </div>

      <div className="ua-card">
        <div className="ua-stat-grid">
          <div className="ua-stat">
            <div className="num">{summary.totalRequestsToday}</div>
            <div className="label">Requests today</div>
          </div>
          <div className="ua-stat">
            <div className="num">{summary.last30Days?.length || 0}</div>
            <div className="label">Days of history</div>
          </div>
        </div>

        {resourceEntries.length > 0 && (
          <div className="ua-resource-list">
            <strong>Today, by feature:</strong>
            {resourceEntries.map(([resource, count]) => (
              <div className="ua-resource-row" key={resource}>
                <span>{resource}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageAnalyticsPage;
