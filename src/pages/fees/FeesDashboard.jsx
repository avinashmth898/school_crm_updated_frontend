import "./fees.css";
import { useState } from "react";
import PayFee from "./PayFee";
import CheckFee from "./CheckFee";
import Defaulters from "./Defaulters";

export default function FeesDashboard() {
  const [activeTab, setActiveTab] = useState("pay");

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

        <h1 className="fees-title">Fee Management</h1>
        <p className="fees-sub">Cash & UPI Collection</p>

        {/* Tabs */}
        <div className="fees-actions">
          <button
            className={activeTab === "pay" ? "active-tab" : ""}
            onClick={() => setActiveTab("pay")}
          >
            💰 Pay Fee
          </button>

          <button
            className={activeTab === "check" ? "active-tab" : ""}
            onClick={() => setActiveTab("check")}
          >
            📄 Check Fee
          </button>

          <button
            className={activeTab === "defaulters" ? "active-tab" : ""}
            onClick={() => setActiveTab("defaulters")}
          >
            ⚠️ Defaulters
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="fees-content fee-card">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
