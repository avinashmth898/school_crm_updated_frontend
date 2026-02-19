import "./AnnualFeePage.css";
import { useState } from "react";

export default function AnnualFeePage() {
  const [feeName, setFeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [fees, setFees] = useState([]);

  const addFee = () => {
    if (!feeName || !amount) return;
    setFees([...fees, { feeName, amount }]);
    setFeeName("");
    setAmount("");
  };

  const removeFee = (index) => {
    setFees(fees.filter((_, i) => i !== index));
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">

        <h2>Annual Fee Setup</h2>

        <div className="fee-input-row">
          <input
            placeholder="Fee Name"
            value={feeName}
            onChange={(e) => setFeeName(e.target.value)}
          />

          <input
            placeholder="Amount"
            value={amount}
            type="number"
            onChange={(e) => setAmount(e.target.value)}
          />

          <button onClick={addFee}>+ Add</button>
        </div>

        <table className="fee-table">
          <thead>
            <tr>
              <th>Fee Name</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {fees.map((fee, i) => (
              <tr key={i}>
                <td>{fee.feeName}</td>
                <td>₹ {fee.amount}</td>
                <td>
                  <button onClick={() => removeFee(i)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}
