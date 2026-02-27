import "./TuitionFeePage.css";
import { useEffect, useState } from "react";
import {
  getTuitionFees,
  createTuitionFee,
  updateTuitionFee,
} from "../../services/tuitionService";

/* 🔹 Fixed class order */
const CLASS_ORDER = [
  "Nursery",
  "LKG",
  "UKG",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
];

export default function TuitionFeePage() {
  const [className, setClassName] = useState("");
  const [amount, setAmount] = useState("");
  const [fees, setFees] = useState([]);

  /* 🔹 Load from backend */
  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    const res = await getTuitionFees();
    setFees(res.data);
  };

  /* 🔹 Add OR Update fee */
  const handleAdd = async () => {
    if (!className || !amount) return;

    const exists = fees.find(f => f.className === className);

    if (exists) {
      // 🔹 Update instead of duplicate
      await updateTuitionFee(className, { amount: Number(amount) });
    } else {
      // 🔹 Create new
      await createTuitionFee({
        className,
        amount: Number(amount),
      });
    }

    setClassName("");
    setAmount("");
    loadFees();
  };

  /* 🔹 Edit fee */
  const handleEdit = async (cls, currentAmount) => {
    const updated = prompt(`Enter new fee for ${cls}`, currentAmount);
    if (!updated) return;

    await updateTuitionFee(cls, { amount: Number(updated) });
    loadFees();
  };

  /* 🔹 ORDERED + COMPLETE VIEW */
  const orderedFees = CLASS_ORDER.map(cls => {
    const found = fees.find(f => f.className === cls);
    return found || { className: cls, amount: 0 };
  });

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Tuition Fee Setup</h2>

        {/* 🔹 Form */}
        <div className="fee-form">
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          >
            <option value="">Select Class</option>
            {CLASS_ORDER.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button className="add-btn" onClick={handleAdd}>
            Save
          </button>
        </div>

        {/* 🔹 Table */}
        <table className="fee-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Amount</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {orderedFees.map((row) => (
              <tr key={row.className}>
                <td>{row.className}</td>
                <td>
                  {row.amount ? `₹ ${row.amount}` : <span style={{opacity:0.5}}>Not Set</span>}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(row.className, row.amount)}
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
