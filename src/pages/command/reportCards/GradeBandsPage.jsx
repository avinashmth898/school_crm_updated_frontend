import "./ReportCardTools.css";
import { useEffect, useState } from "react";
import { getGradeBands, saveGradeBands, resetGradeBandsToCbse } from "../../../services/reportCardService";
import { getSchoolInfo, saveSchoolInfo } from "../../../services/schoolInfoService";

const blankBand = () => ({ label: "", minPercent: "", maxPercent: "", remark: "" });

const asDraft = (bands) =>
  (bands || []).map(b => ({
    ...b,
    minPercent: b.minPercent === null || b.minPercent === undefined ? "" : String(b.minPercent),
    maxPercent: b.maxPercent === null || b.maxPercent === undefined ? "" : String(b.maxPercent),
  }));

// Admin-editable grading scale — seeded from the CBSE 9-point scale the
// first time it's loaded, but every label and range here can be changed
// or replaced outright so a school isn't locked into one grading style.
export default function GradeBandsPage() {
  const [bands, setBands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [schoolInfo, setSchoolInfo] = useState(null);
  const [passThreshold, setPassThreshold] = useState("33");
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGradeBands()
      .then(res => setBands(asDraft(res.data)))
      .catch(() => setStatus({ type: "error", text: "Could not load the grading scale." }))
      .finally(() => setLoading(false));

    getSchoolInfo()
      .then(res => {
        setSchoolInfo(res.data);
        setPassThreshold(String(res.data?.passPercentThreshold ?? 33));
      })
      .catch(() => {});
  }, []);

  const handleSaveThreshold = async () => {
    setSavingThreshold(true);
    setStatus(null);
    try {
      const res = await saveSchoolInfo({ ...(schoolInfo || {}), passPercentThreshold: Number(passThreshold) || 33 });
      setSchoolInfo(res.data);
      setStatus({ type: "success", text: "Pass threshold saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Could not save the pass threshold." });
    } finally {
      setSavingThreshold(false);
    }
  };

  const updateBand = (idx, field, value) => {
    setBands(prev => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const addBand = () => setBands(prev => [...prev, blankBand()]);
  const removeBand = (idx) => setBands(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload = bands.map(b => ({
        label: b.label,
        minPercent: Number(b.minPercent),
        maxPercent: Number(b.maxPercent),
        remark: b.remark || "",
      }));
      const res = await saveGradeBands(payload);
      setBands(asDraft(res.data));
      setStatus({ type: "success", text: "Grading scale saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.response?.data?.message || "Could not save the grading scale." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await resetGradeBandsToCbse();
      setBands(asDraft(res.data));
      setStatus({ type: "success", text: "Reset to the CBSE 9-point scale." });
    } catch {
      setStatus({ type: "error", text: "Could not reset the grading scale." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rc-page">
      <div className="rc-tool-card">
        <h2>🎯 Grading Scale</h2>
        <p className="rc-tool-sub">
          Define the grade labels and percentage ranges used on report cards. Starts from the CBSE
          9-point scale — edit freely to match your school.
        </p>

        {status && <p className={`rc-status rc-status-${status.type}`}>{status.text}</p>}

        <div className="rc-section-title">Pass / fail threshold</div>
        <p className="rc-hint">
          The minimum percentage (per subject and overall) counted as a pass on report cards. Students
          below this show a "Fail" badge instead of "Pass".
        </p>
        <div className="rc-pass-threshold-row">
          <input
            type="number"
            min="0"
            max="100"
            value={passThreshold}
            onChange={e => setPassThreshold(e.target.value)}
          />
          <span>%</span>
          <button className="ch-btn ch-btn-primary" onClick={handleSaveThreshold} disabled={savingThreshold}>
            {savingThreshold ? "Saving…" : "Save threshold"}
          </button>
        </div>

        {loading ? (
          <p className="rc-hint">Loading…</p>
        ) : (
          <>
            <div className="rc-band-table">
              <div className="rc-band-row rc-band-header">
                <span>Grade</span>
                <span>Min %</span>
                <span>Max %</span>
                <span>Remark</span>
                <span></span>
              </div>
              {bands.map((b, idx) => (
                <div className="rc-band-row" key={idx}>
                  <input value={b.label} onChange={e => updateBand(idx, "label", e.target.value)} placeholder="A1" />
                  <input type="number" value={b.minPercent} onChange={e => updateBand(idx, "minPercent", e.target.value)} placeholder="91" />
                  <input type="number" value={b.maxPercent} onChange={e => updateBand(idx, "maxPercent", e.target.value)} placeholder="100" />
                  <input value={b.remark || ""} onChange={e => updateBand(idx, "remark", e.target.value)} placeholder="Outstanding" />
                  <button className="rc-band-remove" onClick={() => removeBand(idx)} title="Remove" aria-label={`Remove grade band ${b.label || idx + 1}`}>✕</button>
                </div>
              ))}
              {bands.length === 0 && <p className="rc-hint">No grade bands yet — add one below.</p>}
            </div>

            <div className="rc-band-actions">
              <button className="ch-btn" onClick={addBand}>+ Add grade band</button>
              <button className="ch-btn" onClick={handleReset} disabled={saving}>Reset to CBSE default</button>
              <button className="ch-btn ch-btn-primary" onClick={handleSave} disabled={saving || bands.length === 0}>
                {saving ? "Saving…" : "Save grading scale"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
