import { useEffect, useState } from "react";
import { getSchoolInfo, saveSchoolInfo } from "../../services/schoolInfoService";
import Icon from "../../ui/icons";
import "./SchoolInfoPage.css";

const EMPTY_FORM = {
  schoolName: "",
  affiliationNumber: "",
  boardAffiliation: "",
  numberOfStudents: "",
  establishedYear: "",
  address: "",
  principalName: "",
  contactPhone: "",
  contactEmail: "",
  transportAvailable: false,
  hostelAvailable: false,
  libraryAvailable: false,
  playgroundAvailable: false,
  computerLabAvailable: false,
  otherInfo: "",
  logoBase64: "",
};

const MAX_LOGO_BYTES = 500 * 1024; // keep the stored data URL small — this
// is inlined directly into SchoolInfo rather than uploaded as a file.

const FACILITIES = [
  { key: "transportAvailable", label: "Transport Service" },
  { key: "hostelAvailable", label: "Hostel" },
  { key: "libraryAvailable", label: "Library" },
  { key: "playgroundAvailable", label: "Playground / Sports" },
  { key: "computerLabAvailable", label: "Computer Lab" },
];

export default function SchoolInfoPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text: "" }

  useEffect(() => {
    getSchoolInfo()
      .then((res) => {
        const data = res.data || {};
        setForm({
          ...EMPTY_FORM,
          ...data,
          numberOfStudents: data.numberOfStudents ?? "",
          establishedYear: data.establishedYear ?? "",
        });
      })
      .catch((err) => {
        console.error(err);
        setStatus({ type: "error", text: "Could not load existing school profile." });
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const [logoError, setLogoError] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Logo image is too large — please use one under 500KB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateField("logoBase64", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const toggleFacility = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!form.schoolName.trim()) {
      setStatus({ type: "error", text: "School name is required." });
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        ...form,
        numberOfStudents: form.numberOfStudents === "" ? null : Number(form.numberOfStudents),
        establishedYear: form.establishedYear === "" ? null : Number(form.establishedYear),
      };

      const res = await saveSchoolInfo(payload);
      setForm({
        ...EMPTY_FORM,
        ...res.data,
        numberOfStudents: res.data.numberOfStudents ?? "",
        establishedYear: res.data.establishedYear ?? "",
      });
      setStatus({ type: "success", text: "School profile saved." });
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Failed to save school profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="school-info-bg">
        <div className="school-info-card">Loading school profile…</div>
      </div>
    );
  }

  return (
    <div className="school-info-bg">
      <div className="school-info-card school-info-form">
        <h2>School Profile</h2>
        <p className="subtitle">
          Basic details about the school. This information is saved once and can be updated anytime.
        </p>

        {/* BASIC INFO */}
        <div className="school-info-section-title">Basic Information</div>

        <label className="field">
          <span className="field-label">Name of School *</span>
          <input
            type="text"
            value={form.schoolName}
            onChange={(e) => updateField("schoolName", e.target.value)}
            placeholder="e.g. Sunrise Public School"
          />
        </label>

        <label className="field">
          <span className="field-label">School Logo</span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0,
              background: "var(--ink-50)",
              border: form.logoBase64 ? "1px solid var(--border)" : "1px dashed var(--border-strong)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)"
            }}>
              {form.logoBase64
                ? <img
                    src={form.logoBase64}
                    alt="School logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
                  />
                : <Icon.Building size={22} />}
            </div>
            <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} />
            {form.logoBase64 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => updateField("logoBase64", "")}
              >
                Remove
              </button>
            )}
          </div>
          {logoError && <span className="field-error">{logoError}</span>}
          <span className="field-hint">Shown on printed/PDF report cards. PNG or JPG, under 500KB.</span>
        </label>

        <div className="school-info-row">
          <label className="field">
            <span className="field-label">Affiliation Number</span>
            <input
              type="text"
              value={form.affiliationNumber}
              onChange={(e) => updateField("affiliationNumber", e.target.value)}
              placeholder="e.g. CBSE/1234/56"
            />
          </label>

          <label className="field">
            <span className="field-label">Board Affiliation</span>
            <select
              value={form.boardAffiliation}
              onChange={(e) => updateField("boardAffiliation", e.target.value)}
            >
              <option value="">Select board</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State Board">State Board</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </div>

        <div className="school-info-row">
          <label className="field">
            <span className="field-label">Number of Students</span>
            <input
              type="number"
              min="0"
              value={form.numberOfStudents}
              onChange={(e) => updateField("numberOfStudents", e.target.value)}
              placeholder="e.g. 450"
            />
          </label>

          <label className="field">
            <span className="field-label">Established Year</span>
            <input
              type="number"
              min="1800"
              max="2100"
              value={form.establishedYear}
              onChange={(e) => updateField("establishedYear", e.target.value)}
              placeholder="e.g. 1998"
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">School Address</span>
          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Full postal address"
          />
        </label>

        {/* FACILITIES */}
        <div className="school-info-section-title">Facilities Available</div>
        <p className="subtitle" style={{ marginTop: -8 }}>
          Leave unchecked for facilities the school does not offer.
        </p>

        <div className="facility-grid">
          {FACILITIES.map((f) => (
            <label
              key={f.key}
              className={`facility-item ${form[f.key] ? "checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={!!form[f.key]}
                onChange={() => toggleFacility(f.key)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>

        {/* CONTACT & OTHER INFO */}
        <div className="school-info-section-title">Contact & Other Information</div>

        <div className="school-info-row">
          <label className="field">
            <span className="field-label">Principal Name</span>
            <input
              type="text"
              value={form.principalName}
              onChange={(e) => updateField("principalName", e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Contact Phone</span>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => updateField("contactPhone", e.target.value)}
            />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Contact Email</span>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
          />
        </label>

        <label className="field">
          <span className="field-label">Other Information</span>
          <textarea
            value={form.otherInfo}
            onChange={(e) => updateField("otherInfo", e.target.value)}
            placeholder="Anything else worth noting about the school"
          />
        </label>

        <button className="primary-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save School Profile"}
        </button>

        {status && (
          <div className={`status-msg ${status.type}`}>{status.text}</div>
        )}
      </div>
    </div>
  );
}
