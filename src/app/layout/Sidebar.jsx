import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div style={sidebarStyle}>
      <h3 style={{ marginBottom: "20px" }}>School CRM</h3>

      <nav>
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/students" label="Students" />
        <NavItem to="/teachers" label="Teachers" />
      </nav>
    </div>
  );
};

const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      end
      style={({ isActive }) => ({
        display: "block",
        padding: "10px 12px",
        marginBottom: "6px",
        borderRadius: "6px",
        textDecoration: "none",
        color: isActive ? "#1e293b" : "#e5e7eb",
        background: isActive ? "#e5e7eb" : "transparent",
        fontWeight: isActive ? "600" : "400",
      })}
    >
      {label}
    </NavLink>
  );
};

const sidebarStyle = {
  width: "220px",
  background: "#1e293b",
  color: "#fff",
  padding: "20px",
};

export default Sidebar;
