import "../command/CommandCentre.css";
import { useNavigate } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// SMS — Student Management System. Pure navigation, grouping existing pages.
const SmsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="tiles-grid" style={{ marginTop: 24 }}>
      <div className="tile" {...tileProps(() => navigate("/students"))}>
        <div className="icon"><Icon.Search size={22} /></div>
        <h3>Student Search</h3>
        <p>Find a student by name, admission number or father's name</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/students/new"))}>
        <div className="icon"><Icon.Plus size={22} /></div>
        <h3>New Admission</h3>
        <p>Register a new student</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/promotion"))}>
        <div className="icon"><Icon.ArrowUp size={22} /></div>
        <h3>Promotion</h3>
        <p>Promote a class to the next academic year</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/command-centre/documents"))}>
        <div className="icon"><Icon.FileText size={22} /></div>
        <h3>Documents</h3>
        <p>Generate admission &amp; other student documents</p>
      </div>
    </div>
  );
};

export default SmsPage;
