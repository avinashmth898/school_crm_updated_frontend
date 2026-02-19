import "./CommandCentre.css";
import { useNavigate, Outlet } from "react-router-dom";

const CommandCentrePage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <h1 className="dashboard-title">Command Centre</h1>
      <p className="dashboard-subtitle">Administrative Controls</p>

      <div className="tiles-grid">

        <div
          className="tile fees"
          onClick={() => navigate("fee-charges")}
        >
          <div className="icon">💰</div>
          <h3>Fee & Charge Management</h3>
          <p>Configure tuition & extra charges</p>
        </div>

        <div className="tile placeholder">
          <div className="icon">⏳</div>
          <h3>Module Coming Soon</h3>
          <p>Future feature will appear here</p>
        </div>

        <div className="tile placeholder">
          <div className="icon">⏳</div>
          <h3>Module Coming Soon</h3>
          <p>Future feature will appear here</p>
        </div>

      </div>

      {/* 👇 THIS SHOWS THE CHILD ROUTE */}
      <Outlet />

    </div>
  );
};

export default CommandCentrePage;
