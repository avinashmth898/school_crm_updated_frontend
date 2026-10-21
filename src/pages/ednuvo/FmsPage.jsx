import "../command/CommandCentre.css";
import { useNavigate } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// FMS — Fee Management System. Pure navigation, grouping existing pages.
const FmsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="tiles-grid" style={{ marginTop: 24 }}>
      <div className="tile fees" {...tileProps(() => navigate("/command-centre/fee-charges"))}>
        <div className="icon"><Icon.Wallet size={22} /></div>
        <h3>Fee &amp; Charge Management</h3>
        <p>Configure tuition, transport &amp; additional charges</p>
      </div>

      <div className="tile fees" {...tileProps(() => navigate("/fees"))}>
        <div className="icon"><Icon.Receipt size={22} /></div>
        <h3>Pay / Check Fees</h3>
        <p>Collect payments, check a student's fee status, see defaulters</p>
      </div>

      <div className="tile fees" {...tileProps(() => navigate("/reports"))}>
        <div className="icon"><Icon.FileText size={22} /></div>
        <h3>Finance Reports</h3>
        <p>Daily, monthly &amp; yearly collection reports</p>
      </div>
    </div>
  );
};

export default FmsPage;
