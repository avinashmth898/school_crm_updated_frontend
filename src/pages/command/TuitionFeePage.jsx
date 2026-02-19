import "./TuitionFeePage.css";
import { useEffect, useState } from "react";
import { getTuitionFees, updateTuitionFee } from "../../services/feeService";

export default function TuitionFeePage() {

  const [fees, setFees] = useState([]);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = () => {
    getTuitionFees().then(res => setFees(res.data));
  };

  const handleEdit = async (cls, currentAmount) => {
    const updated = prompt(`Enter new fee for ${cls}`, currentAmount);
    if (!updated) return;

    await updateTuitionFee(cls, updated);
    loadFees(); // refresh from DB
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">

        <h2>Tuition Fee Setup</h2>

        <table className="fee-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Amount</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {fees.map(row => (
              <tr key={row.className}>
                <td>{row.className}</td>
                <td>₹ {row.amount}</td>
                <td>
                  <button
                    onClick={() =>
                      handleEdit(row.className, row.amount)
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
}
