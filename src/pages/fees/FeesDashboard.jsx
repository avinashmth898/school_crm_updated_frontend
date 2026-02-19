import "./fees.css";
import { useState } from "react";
import PayFee from "./PayFee";
import CheckFee from "./CheckFee";
import Defaulters from "./Defaulters";

export default function FeesDashboard() {
  const [active, setActive] = useState(null);

  return (
    <div className="student-bg">
      <div className="fees-wrapper">

        <h1 className="fees-title">Fee Management</h1>
        <p className="fees-sub">Cash & UPI Collection</p>

        {/* Action Buttons */}
        <div className="fees-actions">
          <button onClick={() => setActive("pay")}>💰 Pay Fee</button>
          <button onClick={() => setActive("check")}>📄 Check Fee</button>
          <button onClick={() => setActive("defaulters")}>⚠️ Defaulters</button>
        </div>

        {/* Sections */}
        <div className="fees-content">
          {active === "pay" && <PayFee />}
          {active === "check" && <CheckFee />}
          {active === "defaulters" && <Defaulters />}
        </div>

      </div>
    </div>
  );
}
