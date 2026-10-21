import { useEffect, useState } from "react";
import { getLicenseStatus, uploadLicense } from "../../../services/licenseService";
import pkg from "../../../../package.json";
import "./LicenseStatusPage.css";

// Fully visible license status + renewal page. Nothing here happens
// behind the admin's back: the device ID, the exact dates being used,
// whether the online time check reached the internet, and the result
// of every license upload are all shown directly on this page.
const LicenseStatusPage = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const loadStatus = () => {
    getLicenseStatus()
      .then((res) => setStatus(res.data))
      .catch(() => setError("Could not reach the license service. Is the backend running?"));
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFileContent(ev.target.result);
    reader.readAsText(file);
  };

  const handleUpload = () => {
    if (!fileContent.trim()) return;
    setUploading(true);
    setUploadResult(null);
    uploadLicense(fileContent)
      .then((res) => {
        setUploadResult({ success: true, message: res.data.message });
        setStatus(res.data.status);
      })
      .catch((err) => {
        const data = err.response?.data;
        setUploadResult({ success: false, message: data?.message || "Upload failed." });
      })
      .finally(() => setUploading(false));
  };

  if (error) {
    return (
      <div className="lic-page">
        <div className="lic-card">{error}</div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="lic-page">
        <div className="lic-card">Loading license status…</div>
      </div>
    );
  }

  return (
    <div className="lic-page">
      <div className="lic-card">
        <span className={`lic-badge ${status.status}`}>{status.status}</span>
        <div className="lic-message">{status.message}</div>

        <div className="lic-grid">
          <div>
            <label>Device ID (this installation)</label>
            <span>{status.deviceId}</span>
          </div>
          <div>
            <label>School ID</label>
            <span>{status.schoolId || "—"}</span>
          </div>
          <div>
            <label>Student cap</label>
            <span>{status.studentCap ?? "—"}</span>
          </div>
          <div>
            <label>Issued</label>
            <span>{status.issuedAt || "—"}</span>
          </div>
          <div>
            <label>Expires</label>
            <span>{status.expiresAt || "—"}</span>
          </div>
          <div>
            <label>Days remaining</label>
            <span>{status.daysRemaining}</span>
          </div>
          <div>
            <label>App version</label>
            <span>EdNuvo v{pkg.version}</span>
          </div>
        </div>

        <div className="lic-online">
          Last confirmed date used for this check: <strong>{status.lastSeenDate}</strong>{" "}
          (internet time check {status.onlineTimeReachable ? "reached" : "could not reach"} the internet
          just now — the local system date is only trusted as a fallback, and the confirmed date never moves backward).
        </div>
      </div>

      <div className="lic-card lic-upload">
        <h3>Renew / upload a license file</h3>
        <p className="lic-note">
          Upload the <code>.lic</code> file sent to you for this device. It only works on this specific
          installation (the Device ID above must match what it was issued for).
        </p>
        <input type="file" accept=".lic,.json,.txt" onChange={handleFileChange} />
        <textarea
          placeholder="…or paste the license file contents here"
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
        />
        <br />
        <button onClick={handleUpload} disabled={uploading || !fileContent.trim()}>
          {uploading ? "Applying…" : "Apply license"}
        </button>

        {uploadResult && (
          <div className={`lic-upload-result ${uploadResult.success ? "success" : "error"}`}>
            {uploadResult.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseStatusPage;
