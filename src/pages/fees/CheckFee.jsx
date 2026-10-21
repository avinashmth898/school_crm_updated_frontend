import "./fees.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getAllStudents } from "../../services/studentService";
import { useLanguage } from "../../i18n/LanguageContext";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Academic session months, July → June, up to (and a little past) today —
// same window logic as the Fee Ledger page, so the two agree.
function academicMonths() {
  const months = [];
  const today = new Date();
  const startYear = today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1;
  let cursor = new Date(startYear, 6, 1); // July
  const end = new Date(startYear + 1, 5, 1); // next June
  while (cursor <= end) {
    months.push({
      month: cursor.toLocaleString("default", { month: "long" }),
      year: cursor.getFullYear(),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
}

export default function CheckFee() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllStudents("ACTIVE").then(res => setStudents(res.data || [])).catch(console.error);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q) ||
        (s.admissionNumber || "").toLowerCase().includes(q) ||
        String(s.registrationNumber).includes(q)
      )
      .slice(0, 8);
  }, [query, students]);

  const selectStudent = (student) => {
    setSelected(student);
    setQuery("");
    setLoading(true);
    apiClient.get(`/ledger/${student.registrationNumber}`)
      .then(res => setLedger(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const months = useMemo(() => academicMonths(), []);

  const timeline = useMemo(() => {
    return months.map(({ month, year }) => {
      const entry = ledger.find(l => l.month === month && l.year === year);
      return entry || { month, year, status: "NOT_GENERATED", totalAmount: 0, paidAmount: 0 };
    });
  }, [ledger, months]);

  const paidCount = timeline.filter(m => m.status === "PAID").length;
  const partialCount = timeline.filter(m => m.status === "PARTIAL").length;
  const dueCount = timeline.filter(m => m.status === "DUE").length;
  const totalDue = timeline.reduce((sum, m) => sum + (m.totalAmount - m.paidAmount), 0);

  const statusClass = (s) => {
    if (s === "PAID") return "paid";
    if (s === "PARTIAL") return "partial";
    if (s === "DUE") return "due";
    return "not-generated";
  };

  return (
    <div className="fee-page">

      <div className="fee-card" style={{ position: "relative" }}>
        <h2>📊 {t("checkfee.heading")}</h2>

        <label>{t("checkfee.studentLabel")}</label>
        <input
          type="text"
          placeholder="Search by student name, father's name, admission no. or reg no."
          title="Searches student name, father's name, admission number and registration number"
          value={selected ? `${selected.name} (${selected.registrationNumber})` : query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
        />

        {matches.length > 0 && !selected && (
          <div className="dropdown-list">
            {matches.map(s => (
              <div key={s.registrationNumber} className="dropdown-item" onClick={() => selectStudent(s)}>
                {s.name} (father: {s.fatherName || "—"}) — Reg {s.registrationNumber} · {s.currentClass}
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="selected-student">
            {selected.name} · {selected.currentClass} · Reg {selected.registrationNumber}
          </div>
        )}

        {!selected && (
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>
            {t("checkfee.noStudentHint")}
          </p>
        )}

        {selected && loading && (
          <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>{t("checkfee.loadingTimeline")}</p>
        )}

        {selected && !loading && (
          <>
            <label style={{ marginTop: 20 }}>{t("checkfee.feeTimeline")} ({months[0]?.year}–{months[months.length - 1]?.year})</label>
            <div className="months">
              {timeline.map(m => (
                <div key={`${m.month}-${m.year}`} className={`month ${statusClass(m.status)}`}>
                  {m.month.slice(0, 3)} {m.year}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="ch-btn" onClick={() => navigate(`/students/${selected.registrationNumber}/fee-history`)}>
                {t("checkfee.viewFullLedger")}
              </button>
              <button className="ch-btn ch-btn-primary" onClick={() => navigate(`/students/${selected.registrationNumber}/pay-fee`)}>
                {t("checkfee.collectFee")}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="fee-summary">
        <h3>{t("checkfee.summaryTitle")}</h3>
        {!selected ? (
          <p className="summary-empty">{t("checkfee.noStudentSelected")}</p>
        ) : (
          <>
            <div className="summary-stat-grid">
              <div className="summary-stat">
                <span>{t("checkfee.totalMonths")}</span>
                <b>{timeline.length}</b>
              </div>
              <div className="summary-stat is-paid">
                <span>{t("checkfee.paid")}</span>
                <b>{paidCount}</b>
              </div>
              <div className="summary-stat is-partial">
                <span>{t("checkfee.partial")}</span>
                <b>{partialCount}</b>
              </div>
              <div className="summary-stat is-due">
                <span>{t("checkfee.due")}</span>
                <b>{dueCount}</b>
              </div>
            </div>

            <div className="summary-balance">
              <span>{t("checkfee.outstandingBalance")}</span>
              <b>{fmt(totalDue)}</b>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
