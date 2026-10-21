import "./fees.css";
import { useLocation, useNavigate } from "react-router-dom";
import PayFee from "./PayFee";
import CheckFee from "./CheckFee";
import Defaulters from "./Defaulters";
import { useLanguage } from "../../i18n/LanguageContext";

// The tab shown here is driven by the URL (/fees/pay, /fees/check,
// /fees/defaulters) rather than local component state. That was the bug:
// with local state, this page always rendered "pay" no matter which URL
// you landed on, so deep links like the dashboard's "Check fee status"
// and "Defaulters" tiles opened this page but silently showed Pay Fee
// instead. Reading the tab from the URL means every link, refresh, and
// browser back/forward action lands on the right tab.
export default function FeesDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const activeTab = location.pathname.endsWith("/check")
    ? "check"
    : location.pathname.endsWith("/defaulters")
    ? "defaulters"
    : "pay";

  const renderContent = () => {
    switch (activeTab) {
      case "pay":
        return <PayFee />;
      case "check":
        return <CheckFee />;
      case "defaulters":
        return <Defaulters />;
      default:
        return <PayFee />;
    }
  };

  return (
    <div className="student-bg">
      <div className="fees-wrapper">

        <h1 className="fees-title">{t("fees.pageTitle")}</h1>
        <p className="fees-sub">{t("fees.pageSubtitle")}</p>

        {/* Tabs */}
        <div className="fees-actions">
          <button
            className={activeTab === "pay" ? "active-tab" : ""}
            onClick={() => navigate("/fees/pay")}
          >
            💰 {t("fees.tabPay")}
          </button>

          <button
            className={activeTab === "check" ? "active-tab" : ""}
            onClick={() => navigate("/fees/check")}
          >
            📄 {t("fees.tabCheck")}
          </button>

          <button
            className={activeTab === "defaulters" ? "active-tab" : ""}
            onClick={() => navigate("/fees/defaulters")}
          >
            ⚠️ {t("fees.tabDefaulters")}
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className={`fees-content ${activeTab === "defaulters" ? "full-width" : "fee-card"}`}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
