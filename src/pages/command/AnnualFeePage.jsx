import "./AnnualFeePage.css";
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";

export default function AnnualFeePage() {
  const [feeName, setFeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [fees, setFees] = useState([]);

  // 🔹 Load from backend
  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const res = await apiClient.get("/config/annual");
      setFees(res.data);
    } catch (err) {
      console.error("Load failed:", err);
    }
  };

  // 🔹 Add fee
  const handleAdd = async () => {
    if (!feeName || !amount) return;

    try {
      const res = await apiClient.post("/config/annual", {
        feeName,
        amount: Number(amount),
      });

      // Update UI instantly
      setFees(prev => [...prev, res.data]);

      setFeeName("");
      setAmount("");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // 🔹 Delete fee
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/config/annual/${id}`);
      setFees(prev => prev.filter(f => f.annualFeeId !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Annual Fee Setup</h2>

        {/* Form */}
        <div className="fee-form">
          <input
            placeholder="Fee Name"
            value={feeName}
            onChange={e => setFeeName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <button className="add-btn" onClick={handleAdd}>+ Add</button>
        </div>

        {/* Table */}
        <table className="fee-table">
          <thead>
            <tr>
              <th>Fee Name</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {fees.map(fee => (
              <tr key={fee.annualFeeId}>
                <td>{fee.feeName}</td>
                <td>₹ {fee.amount}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(fee.annualFeeId)}
                  >
                    ✖
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
