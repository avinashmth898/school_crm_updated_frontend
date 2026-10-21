import "../command/CommandCentre.css";
import { useNavigate } from "react-router-dom";
import Icon from "../../ui/icons";
import { tileProps } from "../../ui/a11y";

// TMS — Teacher Management System. Pure navigation, grouping existing pages.
const TmsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="tiles-grid" style={{ marginTop: 24 }}>
      <div className="tile" {...tileProps(() => navigate("/teachers"))}>
        <div className="icon"><Icon.Teacher size={22} /></div>
        <h3>Teacher Directory</h3>
        <p>Browse and search all registered teachers</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/teachers/new"))}>
        <div className="icon"><Icon.Plus size={22} /></div>
        <h3>Register Teacher</h3>
        <p>Add a new teacher</p>
      </div>

      <div className="tile" {...tileProps(() => navigate("/teacher-attendance"))}>
        <div className="icon"><Icon.ClipboardList size={22} /></div>
        <h3>Teacher Attendance</h3>
        <p>Mark and review daily teacher attendance</p>
      </div>
    </div>
  );
};

export default TmsPage;
