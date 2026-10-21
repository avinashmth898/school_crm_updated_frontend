import "./CommandCentre.css";
import { useNavigate, Outlet } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

const CommandCentrePage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <h1 className="dashboard-title">Command Centre</h1>
      <p className="dashboard-subtitle">Administrative Controls</p>

      <div className="tiles-grid">

        <div
          className="tile fees"
          {...tileProps(() => navigate("fee-charges"))}
        >
          <div className="icon"><Icon.Wallet size={22} /></div>
          <h3>Fee & Charge Management</h3>
          <p>Configure tuition & extra charges</p>
        </div>

        <div
          className="tile"
          {...tileProps(() => navigate("school-info"))}
        >
          <div className="icon"><Icon.Building size={22} /></div>
          <h3>School Profile</h3>
          <p>School details, affiliation & facilities</p>
        </div>
<div
  className="tile"
  {...tileProps(() => navigate("subject-master"))}
>
  <div className="icon"><Icon.BookOpen size={22} /></div>
  <h3>Subject Master</h3>
  <p>Create, edit and delete subjects</p>
</div>
        {/* SUBJECT SETUP */}
          <div
            className="tile"
            {...tileProps(() => navigate("subjects-setup"))}
          >
            <div className="icon"><Icon.BookOpen size={22} /></div>
            <h3>Subject Setup</h3>
            <p>Assign subjects to each class</p>
          </div>

          {/* EXAM SETUP */}
          <div
            className="tile"
            {...tileProps(() => navigate("exams"))}
          >
            <div className="icon"><Icon.FileEdit size={22} /></div>
            <h3>Exam Setup</h3>
            <p>Create & manage exams per class</p>
          </div>

          {/* MARKS ENTRY */}
          <div
            className="tile"
            {...tileProps(() => navigate("marks-entry"))}
          >
            <div className="icon"><Icon.ClipboardList size={22} /></div>
            <h3>Marks Entry</h3>
            <p>Class-wise grid entry for each exam</p>
          </div>

          {/* GRADING SCALE */}
          <div
            className="tile"
            {...tileProps(() => navigate("grading-scale"))}
          >
            <div className="icon"><Icon.Target size={22} /></div>
            <h3>Grading Scale</h3>
            <p>Define grade labels & score ranges</p>
          </div>

          {/* REPORT CARDS */}
          <div
            className="tile"
            {...tileProps(() => navigate("report-cards"))}
          >
            <div className="icon"><Icon.Award size={22} /></div>
            <h3>Report Cards</h3>
            <p>Weight exams, rank & print report cards</p>
          </div>

          {/* ADMIT CARDS */}
          <div
            className="tile"
            {...tileProps(() => navigate("admit-cards"))}
          >
            <div className="icon"><Icon.Ticket size={22} /></div>
            <h3>Admit Cards</h3>
            <p>Bulk print admit cards, 4 per page</p>
          </div>

          {/* USAGE ANALYTICS */}
          <div
            className="tile"
            {...tileProps(() => navigate("usage-analytics"))}
          >
            <div className="icon"><Icon.BarChart size={22} /></div>
            <h3>Usage Analytics</h3>
            <p>Aggregate usage counts & on/off toggle</p>
          </div>

      </div>

      {/* 👇 THIS SHOWS THE CHILD ROUTE */}
      <Outlet />

    </div>
  );
};

export default CommandCentrePage;
