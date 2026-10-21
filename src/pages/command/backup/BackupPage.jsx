import { useState } from "react";
import apiClient from "../../../services/apiClient";
import { useToast } from "../../../ui/ToastContext";
import { useConfirm, usePrompt } from "../../../ui/ConfirmContext";
import Icon from "../../../ui/icons";
import "./backup.css";

// One-click export/import of the WHOLE school's data (database + uploaded
// photos), wrapping the same deploy/export-school.sh and
// deploy/import-school.sh scripts ops already use over SSH — just
// reachable from inside the app for an admin, no shell access needed.
//
// Only works on a real deployed install (Docker Compose + MySQL per
// DEPLOYMENT.md); on a local dev machine the backend returns a clear
// "scripts not found" error instead of this silently doing nothing.
export default function BackupPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [freshLicense, setFreshLicense] = useState(false);
  const [lastImportLog, setLastImportLog] = useState("");

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await apiClient.get("/admin/backup/export", { responseType: "blob" });

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : `schoolcrm-export-${Date.now()}.tar.gz`;

      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export downloaded: " + filename);
    } catch (err) {
      console.error(err);
      // With responseType: "blob", axios hands back error bodies as a Blob
      // too, not parsed JSON — err.response.data.message is always
      // undefined in that case, so every real backend error (missing
      // scripts, disk full, permission errors) used to get silently
      // replaced by the generic fallback below. Read the Blob as text and
      // parse it ourselves so the actual error reaches the toast.
      let msg = err.response?.data?.message;
      if (!msg && err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          msg = JSON.parse(text)?.message;
        } catch {
          // Blob wasn't JSON (e.g. a network-level error with an HTML
          // body) — fall through to the generic message below.
        }
      }
      toast.error(msg || "Export failed. This feature only works on a deployed install, not local dev.");
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Choose a .tar.gz export/backup file first.");
      return;
    }
    if (!file.name.endsWith(".tar.gz")) {
      toast.error("Expected a .tar.gz export/backup file.");
      return;
    }

    const ok = await confirm({
      message: `This will OVERWRITE ALL current data (students, fees, exams, everything) with the contents of "${file.name}". This cannot be undone. Are you absolutely sure?`,
      confirmLabel: "Continue",
      danger: true,
    });
    if (!ok) return;

    // Extra friction on top of the dialog above, on purpose — this is as
    // destructive as it gets, same spirit as the shell script requiring
    // you to type "restore" by hand.
    const typed = await prompt('Type IMPORT (all caps) to confirm overwriting all current data:');
    if (typed !== "IMPORT") {
      toast.error("Import cancelled — confirmation text didn't match.");
      return;
    }

    setImporting(true);
    setLastImportLog("");
    try {
      const res = await apiClient.post(
        "/admin/backup/import",
        file,
        {
          headers: { "Content-Type": file.type || "application/octet-stream" },
          params: { confirm: true, freshLicense },
        }
      );
      toast.success(res.data?.message || "Import complete.");
      setLastImportLog(res.data?.log || "");
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Import failed. " + (err.response?.data?.message || ""));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="backup-page">
      <h2>Backup &amp; Restore</h2>
      <p className="backup-sub">
        Export this school's entire database and uploaded photos into one file, or restore from
        a previous export. Available only on a deployed install — not while running locally.
      </p>

      <div className="backup-card">
        <div className="backup-card-icon"><Icon.Download size={22} /></div>
        <div className="backup-card-body">
          <h3>Export all data</h3>
          <p>Downloads one file containing the full database and every uploaded photo.</p>
        </div>
        <button className="primary-btn backup-btn" onClick={handleExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export Now"}
        </button>
      </div>

      <div className="backup-card backup-card-danger">
        <div className="backup-card-icon"><Icon.Upload size={22} /></div>
        <div className="backup-card-body">
          <h3>Import / Restore data</h3>
          <p>Overwrites ALL current data with the contents of an export/backup file. Cannot be undone.</p>

          <input type="file" accept=".tar.gz,.gz" onChange={handleFileChange} />

          <label className="backup-checkbox">
            <input
              type="checkbox"
              checked={freshLicense}
              onChange={(e) => setFreshLicense(e.target.checked)}
            />
            This export is from a different school — clear its license after import
          </label>
        </div>
        <button
          className="primary-btn backup-btn backup-btn-danger"
          onClick={handleImport}
          disabled={importing || !file}
        >
          {importing ? "Importing…" : "Import & Overwrite"}
        </button>
      </div>

      {lastImportLog && (
        <details className="backup-log">
          <summary>Import log</summary>
          <pre>{lastImportLog}</pre>
        </details>
      )}
    </div>
  );
}
