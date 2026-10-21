import "./Dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchoolInfo } from "../../services/schoolInfoService";
import { getAllStudents } from "../../services/studentService";
import apiClient from "../../services/apiClient";
import { useLanguage } from "../../i18n/LanguageContext";
import { isAdmin } from "../../auth/authStorage";
import Icon from "../../ui/icons";
import Skeleton from "../../ui/Skeleton";
import EmptyState from "../../ui/EmptyState";
import { tileProps } from "../../ui/a11y";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Returns a translation key (dashboard.greetingMorning etc.) rather than
// literal text, since this runs outside the component and has no
// access to the current language.
function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 17) return "greetingAfternoon";
  return "greetingEvening";
}

// Ordered by priority — most-used, highest-value actions first, so the
// grid reads left-to-right, top-to-bottom in the order a front office
// actually reaches for them through the day.
const ACTIONS = [
  { to: "/fees/pay", icon: Icon.CreditCard, titleKey: "collectFeeTitle", subtitleKey: "collectFeeSubtitle" },
  { to: "/students/new", icon: Icon.FileEdit, titleKey: "newAdmissionTitle", subtitleKey: "newAdmissionSubtitle" },
  { to: "/students", icon: Icon.GraduationCap, titleKey: "studentsTitle", subtitleKey: "studentsSubtitle" },
  { to: "/fees/check", icon: Icon.FileText, titleKey: "checkFeeTitle", subtitleKey: "checkFeeSubtitle" },
  { to: "/fees/defaulters", icon: Icon.AlertTriangle, titleKey: "defaultersTitle", subtitleKey: "defaultersSubtitle" },
  { to: "/command-centre/promotion", icon: Icon.Rocket, titleKey: "promotionsTitle", subtitleKey: "promotionsSubtitle" },
  { to: "/teachers", icon: Icon.Teacher, titleKey: "teachersTitle", subtitleKey: "teachersSubtitle" },
  { to: "/reports", icon: Icon.TrendingUp, titleKey: "reportsTitle", subtitleKey: "reportsSubtitle" },
  { to: "/exam-structure", icon: Icon.Receipt, titleKey: "examTitle", subtitleKey: "examSubtitle" },
  { to: "/command-centre/documents", icon: Icon.Folder, titleKey: "documentsTitle", subtitleKey: "documentsSubtitle" },
  { to: "/command-centre", icon: Icon.Settings, titleKey: "commandCentreTitle", subtitleKey: "commandCentreSubtitle" },
  // Admin-only — the route itself is also gated by RequireAdmin, so this
  // is just keeping a non-admin from seeing a tile that would redirect
  // them straight back here.
  { to: "/admin-panel", icon: Icon.Lock, titleKey: "adminPanelTitle", subtitleKey: "adminPanelSubtitle", adminOnly: true },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [studentCount, setStudentCount] = useState(null);
  const [teacherCount, setTeacherCount] = useState(null);
  const [todayCollection, setTodayCollection] = useState(null);
  const [defaulterCount, setDefaulterCount] = useState(null);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(console.error);
    getAllStudents("ACTIVE").then(res => setStudentCount((res.data || []).length)).catch(console.error);
    apiClient.get("/teachers").then(res => setTeacherCount((res.data || []).length)).catch(console.error);
    apiClient.get("/fee-reports/daily-collection").then(res => setTodayCollection(res.data)).catch(console.error);
    apiClient.get("/defaulters").then(res => setDefaulterCount((res.data || []).length)).catch(console.error);
    apiClient.get("/fee-reports/transactions")
      .then(res => setRecent((res.data || []).slice(0, 6)))
      .catch(console.error)
      .finally(() => setRecentLoading(false));
  }, []);

  return (
    <div className="ch-page dashboard-bg">

      <div className="dashboard-header">
        <div>
          <h1 className="ch-title">{t(`dashboard.${greetingKey()}`)}</h1>
          <p className="ch-subtitle">{schoolInfo?.schoolName || "School name not set"} {t("dashboard.subtitleSuffix")}</p>
        </div>
      </div>

      {/* LIVE STATS */}
      <div className="stat-row">
        <div className="stat-card">
          <span>{t("dashboard.statActiveStudents")}</span>
          {studentCount === null ? <Skeleton width="48px" height="26px" style={{ marginTop: 8 }} /> : <h2>{studentCount}</h2>}
        </div>
        <div className="stat-card">
          <span>{t("dashboard.statTeachingStaff")}</span>
          {teacherCount === null ? <Skeleton width="48px" height="26px" style={{ marginTop: 8 }} /> : <h2>{teacherCount}</h2>}
        </div>
        <div className="stat-card accent">
          <span>{t("dashboard.statCollectedToday")}</span>
          {todayCollection === null ? <Skeleton width="80px" height="26px" style={{ marginTop: 8 }} /> : <h2>{fmt(todayCollection.totalCollection)}</h2>}
        </div>
        <div className="stat-card warn">
          <span>{t("dashboard.statFeeDefaulters")}</span>
          {defaulterCount === null ? <Skeleton width="48px" height="26px" style={{ marginTop: 8 }} /> : <h2>{defaulterCount}</h2>}
        </div>
      </div>

      <div className="dashboard-columns">

        {/* ACTIONS */}
        <div>
          <p className="section-label">{t("dashboard.quickActions")}</p>
          <div className="tiles-grid">
            {ACTIONS.filter(a => !a.adminOnly || isAdmin()).map(a => {
              const AIcon = a.icon;
              return (
                <div key={a.to} className="tile" {...tileProps(() => navigate(a.to))}>
                  <div className="icon"><AIcon size={22} /></div>
                  <h3>{t(`action.${a.titleKey}`)}</h3>
                  <p>{t(`action.${a.subtitleKey}`)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="activity-panel">
          <p className="section-label">{t("dashboard.recentActivity")}</p>
          <div className="ch-card activity-card">
            {recentLoading && Array.from({ length: 4 }).map((_, i) => (
              <div className="activity-row" key={`sk-${i}`}>
                <Skeleton width="26px" height="26px" circle />
                <div className="activity-text" style={{ flex: 1 }}>
                  <Skeleton width="70%" height="12px" style={{ marginBottom: 6 }} />
                  <Skeleton width="40%" height="10px" />
                </div>
              </div>
            ))}
            {!recentLoading && recent.length === 0 && (
              <EmptyState icon={Icon.Wallet} message={t("dashboard.noPayments")} />
            )}
            {!recentLoading && recent.map((txn, i) => (
              <div className="activity-row" key={txn.paymentId ?? i}>
                <span className="activity-icon"><Icon.Wallet size={16} /></span>
                <div className="activity-text">
                  <p className="activity-title">{txn.studentName || `Student ${txn.studentRegNo}`} paid {fmt(txn.amountPaid)}</p>
                  <p className="activity-meta">{txn.month} {txn.year} · {txn.paymentMode || "—"}</p>
                </div>
              </div>
            ))}
            {recent.length > 0 && (
              <button className="ch-btn activity-more" onClick={() => navigate("/reports")}>
                {t("dashboard.viewAllReports")}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
