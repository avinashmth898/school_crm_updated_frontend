import "../command/CommandCentre.css";
import { useNavigate, Outlet } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// EdNuvo groups the app's existing pages into four familiar systems
// (EMS/FMS/SMS/TMS) as a second, simpler entry point alongside the
// existing sidebar and Command Centre — nothing underneath moves or
// changes, this just links out to it.
const EdNuvoHubPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <h1 className="dashboard-title">EdNuvo</h1>
      <p className="dashboard-subtitle">Everything in one place, grouped by system</p>

      <div className="tiles-grid">
        <div className="tile" {...tileProps(() => navigate("ems"))}>
          <div className="icon"><Icon.FileEdit size={22} /></div>
          <h3>Exam Management System</h3>
          <p>Exams, marks, grading, report &amp; admit cards</p>
        </div>

        <div className="tile fees" {...tileProps(() => navigate("fms"))}>
          <div className="icon"><Icon.Wallet size={22} /></div>
          <h3>Fee Management System</h3>
          <p>Charges, payments, defaulters, finance reports</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("sms"))}>
          <div className="icon"><Icon.GraduationCap size={22} /></div>
          <h3>Student Management System</h3>
          <p>Admission, search, promotion, documents</p>
        </div>

        <div className="tile" {...tileProps(() => navigate("tms"))}>
          <div className="icon"><Icon.Teacher size={22} /></div>
          <h3>Teacher Management System</h3>
          <p>Registration, directory, attendance</p>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default EdNuvoHubPage;
