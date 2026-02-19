import "./FeeChargeManagement.css";
import { useNavigate } from "react-router-dom";

export default function FeeChargeManagement() {
  const navigate = useNavigate();

  return (
    <div className="command-bg">
      <h1 className="command-title">Fee & Charge Management</h1>
      <p className="command-subtitle">Configure all school fee systems</p>

      <div className="command-tiles-grid">

        <div className="command-tile" onClick={() => navigate("/command-centre/fee-charges/fees-annual")}
>
          <div className="icon">📅</div>
          <h3>Annual Fee</h3>
          <p>April charges & readmission setup</p>
        </div>

        <div className="command-tile" onClick={() => navigate("/command-centre/fee-charges/transport")}>
          <div className="icon">🚌</div>
          <h3>Transport</h3>
          <p>Manage transport fee rules</p>
        </div>

        <div className="command-tile" onClick={() => navigate("/command-centre/fee-charges/tuition")}>
          <div className="icon">💵</div>
          <h3>Tuition Fee</h3>
          <p>Set class-wise tuition fee</p>
        </div>

        <div className="command-tile" onClick={() => navigate("/fees/routes")}>
          <div className="icon">🗺️</div>
          <h3>Routes</h3>
          <p>Configure transport routes & pricing</p>
        </div>

        <div className="command-tile disabled">
          <div className="icon">➕</div>
          <h3>Coming Soon</h3>
        </div>

        <div className="command-tile disabled">
          <div className="icon">➕</div>
          <h3>Coming Soon</h3>
        </div>

      </div>
    </div>
  );
}
