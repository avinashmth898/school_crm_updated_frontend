import { NavLink } from "react-router-dom";
import Icon from "../../ui/icons";
import { isAdmin } from "../../auth/authStorage";

const RAIL_ITEMS = [
  { to: "/", label: "Dashboard", icon: Icon.Home, end: true },
  { to: "/ednuvo", label: "EdNuvo", icon: Icon.Grid },
  { to: "/students", label: "Students", icon: Icon.GraduationCap },
  { to: "/teachers", label: "Teachers", icon: Icon.Teacher },
  { to: "/fees", label: "Fees", icon: Icon.Wallet },
  { to: "/command-centre", label: "Command centre", icon: Icon.Settings },
  { to: "/reports", label: "Reports", icon: Icon.FileText },
  { to: "/admin-panel", label: "Admin panel", icon: Icon.Lock, adminOnly: true },
];

const Sidebar = () => {
  const admin = isAdmin();
  return (
    <nav className="rail">
      {RAIL_ITEMS.filter(item => !item.adminOnly || admin).map(item => {
        const IconComp = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) => `rail-item ${isActive ? "active" : ""}`}
          >
            <span className="rail-icon"><IconComp size={19} /></span>
            <span className="rail-label">{item.label}</span>
          </NavLink>
        );
      })}

      <div className="rail-brand" title="EdNuvo">
        <img src="/logo.svg" alt="EdNuvo logo" width={20} height={20} />
      </div>
    </nav>
  );
};

export default Sidebar;
