import "../command/CommandCentre.css";
import { useNavigate, Outlet } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// Holds everything that's about controlling who can get into the app and
// protecting its data — access control, licensing, and backup/restore —
// split out of Command Centre (which is really about day-to-day school
// configuration: fees, subjects, exams) so the two don't get muddled
// together. The route itself is wrapped in RequireAdmin in Router.jsx, so
// a non-admin can't land here at all; no extra admin check needed in this
// component.
const AdminPanelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <h1 className="dashboard-title">Admin Panel</h1>
      <p className="dashboard-subtitle">Access, license &amp; backup controls</p>

      <div className="tiles-grid">

        <div className="tile" {...tileProps(() => navigate("users"))}>
          <div className="icon"><Icon.User size={22} /></div>
          <h3>Staff Accounts</h3>
          <p>Create logins, enable/disable, reset passwords</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("devices"))}>
          <div className="icon"><Icon.Smartphone size={22} /></div>
          <h3>Devices</h3>
          <p>Approve, disable or revoke device access</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("teacher-access"))}>
          <div className="icon"><Icon.Lock size={22} /></div>
          <h3>Teacher Subject Access</h3>
          <p>Grant marks-entry access per class &amp; subject</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("license"))}>
          <div className="icon"><Icon.Key size={22} /></div>
          <h3>License Status</h3>
          <p>Device ID, renewal &amp; expiry status</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("backup"))}>
          <div className="icon"><Icon.Download size={22} /></div>
          <h3>Backup &amp; Restore</h3>
          <p>One-click export/import of all school data</p>
        </div>

      </div>

      {/* 👇 THIS SHOWS THE CHILD ROUTE */}
      <Outlet />

    </div>
  );
};

export default AdminPanelPage;
