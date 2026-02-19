import "./fees.css";
import { useNavigate } from "react-router-dom";

const mockDefaulters = [
  {
    regNo: "1001",
    name: "Avinash Kumar",
    class: "UKG",
    total: 24000,
    paid: 8000
  },
  {
    regNo: "1002",
    name: "Rahul Sharma",
    class: "2nd",
    total: 30000,
    paid: 12000
  },
  {
    regNo: "1003",
    name: "Priya Singh",
    class: "5th",
    total: 36000,
    paid: 18000
  }
];

export default function Defaulters() {
  const navigate = useNavigate();

  return (
    <div className="fee-page">

      <div className="fee-card">
        <h2>🚨 Fee Defaulters</h2>

        <div className="filter-row">
          <select>
            <option>All Classes</option>
            <option>UKG</option>
            <option>1st</option>
            <option>2nd</option>
            <option>3rd</option>
          </select>
        </div>

        <table className="fee-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {mockDefaulters.map((s) => {
              const due = s.total - s.paid;
              return (
                <tr
                  key={s.regNo}
                  onClick={() => navigate(`/students/${s.regNo}`)}
                >
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  <td>₹ {s.total}</td>
                  <td className="paid">₹ {s.paid}</td>
                  <td className="due">₹ {due}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
