import "./TransportFeePage.css";
import { useState } from "react";

export default function TransportFeePage() {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ route: "", amount: "" });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addRoute = () => {
    if (!form.route || !form.amount) return;

    setRoutes([...routes, { ...form }]);
    setForm({ route: "", amount: "" });
  };

  const updateRoute = (index) => {
    const updated = [...routes];
    updated[index] = { ...form };
    setRoutes(updated);
    setEditIndex(null);
    setForm({ route: "", amount: "" });
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setForm(routes[index]);
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Transport Fee Setup</h2>

        {/* INPUT ROW */}
        <div className="fee-input-row">
          <input
            name="route"
            value={form.route}
            onChange={handleChange}
            placeholder="Route Name"
          />

          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            type="number"
          />

          {editIndex === null ? (
            <button onClick={addRoute}>+ Add</button>
          ) : (
            <button onClick={() => updateRoute(editIndex)}>Save</button>
          )}
        </div>

        {/* ROUTE TABLE */}
        <table className="fee-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Amount</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {routes.length === 0 && (
              <tr>
                <td colSpan="3" className="empty-row">
                  No routes configured yet
                </td>
              </tr>
            )}

            {routes.map((r, i) => (
              <tr key={i}>
                <td>{r.route}</td>
                <td>₹ {r.amount}</td>
                <td>
                  <button className="edit-btn" onClick={() => startEdit(i)}>
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
