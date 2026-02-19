import "./fees.css";

const months = [
  "Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025","Nov 2025","Dec 2025",
  "Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026",
  "Jun 2026","Jul 2026","Aug 2026","Sep 2026","Oct 2026","Nov 2026","Dec 2026",
  "Jan 2027","Feb 2027","Mar 2027"
];

// TEMP mock
const paidMonths = [
  "Jun 2025","Jul 2025","Aug 2025","Sep 2025","Oct 2025"
];

export default function CheckFee() {
  return (
    <div className="fee-page">

      <div className="fee-card">
        <h2>📊 Check Fee Status</h2>

        <label>Student</label>
        <select>
          <option>Avinash Kumar (UKG)</option>
        </select>

        <label>Fee Timeline</label>
        <div className="months">
          {months.map((m) => (
            <div
              key={m}
              className={`month ${paidMonths.includes(m) ? "paid" : "unpaid"}`}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      <div className="fee-summary">
        <h3>Fee Summary</h3>
        <p><strong>Total Months:</strong> {months.length}</p>
        <p className="paid"><strong>Paid:</strong> {paidMonths.length}</p>
        <p className="due"><strong>Due:</strong> {months.length - paidMonths.length}</p>
      </div>

    </div>
  );
}
