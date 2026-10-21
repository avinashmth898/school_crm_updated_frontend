import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CommandPalette from "./CommandPalette";
import { Outlet, useLocation } from "react-router-dom";
import "./sidebar.css";

const MainLayout = () => {
  const location = useLocation();
  // Key on the top-level section only (e.g. "fees", "students"), not the
  // full path — several pages (like Fees) read a sub-tab straight from
  // deeper path segments and expect to stay mounted across those, so
  // keying on the full pathname would force an unwanted remount on every
  // in-page tab click instead of only on an actual section change.
  const section = location.pathname.split("/")[1] || "home";

  return (
    <div className="shell">
      <TopBar />
      <CommandPalette />

      <div className="shell-body">
        <Sidebar />

        <div className="main-content">
          <div className="page-container">
            {/* Keying on the path remounts this wrapper on every route
                change, which restarts the CSS fade-in below — a light
                transition instead of the page just snapping into place. */}
            <div className="page-fade" key={section}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
