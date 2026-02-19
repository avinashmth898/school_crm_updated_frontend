import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-bg">
      <h1 className="dashboard-title">(Name Goes Here) Dashboard</h1>
      <p className="dashboard-subtitle">Admin Control Center</p>

      <div className="tiles-grid">
        <div
          className="tile students"
          onClick={() => navigate("/students")}
        >
          <div className="icon">🎓</div>
          <h3>Students</h3>
          <p>Manage student records</p>
        </div>

        <div
          className="tile fees"
          onClick={() => navigate("/fees")}
        >
          <div className="icon">💰</div>
          <h3>Fees</h3>
          <p>Track & manage payments</p>
        </div>

        <div
          className="tile attendance"
          onClick={() => navigate("/attendance")}
        >
          <div className="icon">📊</div>
          <h3>Attendance</h3>
          <p>Daily attendance overview</p>
        </div>

        <div
          className="tile promotion"
          onClick={() => navigate("/promotions")}
        >
          <div className="icon">🚀</div>
          <h3>Promotions</h3>
          <p>Class & grade promotions</p>
        </div>
        <div
          className="tile command"
          onClick={() => navigate("/command-centre")}
        >
          <div className="icon">⚙️</div>
          <h3>Command Centre</h3>
          <p>Admin controls & settings</p>
        </div>

        <div
          className="tile documents"
          onClick={() => navigate("/documents")}
        >
          <div className="icon">📂</div>
          <h3>Forms & Documents</h3>
          <p>Certificates & stored files</p>
        </div>

        <div
          className="tile exams"
          onClick={() => navigate("/exams")}
        >
          <div className="icon">📝</div>
          <h3>Exam Management</h3>
          <p>Exams, marks & results</p>
        </div>

        <div
          className="tile reports"
          onClick={() => navigate("/reports")}
        >
          <div className="icon">📑</div>
          <h3>Reports</h3>
          <p>Finance & performance analytics</p>
        </div>



      </div>
    </div>
  );
};

export default DashboardPage;
