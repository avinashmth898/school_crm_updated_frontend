import "../command/CommandCentre.css";
import { useNavigate } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// EMS — Exam Management System. Pure navigation: every tile here links
// to a page that already exists elsewhere in the app (Command Centre or
// Exam Management) — this just groups them under one name.
const EmsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="tiles-grid" style={{ marginTop: 24 }}>
      <div className="tile" {...tileProps(() => navigate("/command-centre/exams"))}>
        <div className="icon"><Icon.FileEdit size={22} /></div>
        <h3>Create Exam</h3>
        <p>Set up a new exam and its class/subject mapping</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/exam-structure"))}>
        <div className="icon"><Icon.BarChart size={22} /></div>
        <h3>Exam Management</h3>
        <p>Edit or delete existing exams</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/marks-entry"))}>
        <div className="icon"><Icon.ClipboardList size={22} /></div>
        <h3>Marks Entry</h3>
        <p>Class-wise grid entry for each exam, including the exam schedule</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/grading-scale"))}>
        <div className="icon"><Icon.Target size={22} /></div>
        <h3>Grading Scale</h3>
        <p>Grade labels, score ranges &amp; pass/fail threshold</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/report-cards"))}>
        <div className="icon"><Icon.Award size={22} /></div>
        <h3>Report Cards</h3>
        <p>Per exam or per session, single class or bulk across classes</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/admit-cards"))}>
        <div className="icon"><Icon.Ticket size={22} /></div>
        <h3>Admit Cards</h3>
        <p>Bulk print admit cards, 4 per page</p>
      </div>
    </div>
  );
};

export default EmsPage;
