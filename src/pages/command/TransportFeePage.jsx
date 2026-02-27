import "./TransportFeePage.css";
import { useEffect, useState } from "react";
import {
  getTransportFees,
  createTransportFee,
  deleteTransportFee
} from "../../services/transportService";

export default function TransportFeePage() {
  const [routeName, setRouteName] = useState("");
  const [amount, setAmount] = useState("");
  const [routes, setRoutes] = useState([]);

  // 🔄 Load from backend
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const res = await getTransportFees();
    setRoutes(res.data);
  };

  // ➕ Add route
  const handleAdd = async () => {
    if (!routeName || !amount) return;

    await createTransportFee({
      routeName,
      amount
    });

    setRouteName("");
    setAmount("");
    loadRoutes(); // refresh
  };

  // ❌ Delete route
  const handleDelete = async (id) => {
    await deleteTransportFee(id);
    loadRoutes();
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">

        <h2>Transport Fee Setup</h2>

        {/* Form */}
        <div className="fee-form">
          <input
            placeholder="Route Name"
            value={routeName}
            onChange={e => setRouteName(e.target.value)}
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
              <th>Route</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {routes.map(route => (
              <tr key={route.transportFeeId}>
                <td>{route.routeName}</td>
                <td>₹ {route.amount}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(route.transportFeeId)}
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
