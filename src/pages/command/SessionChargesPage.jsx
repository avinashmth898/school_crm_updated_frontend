import "./AnnualFeePage.css";
import { useState, useEffect } from "react";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";

const CLASS_OPTIONS = [
  "ALL", "Nursery", "LKG", "UKG",
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"
];

const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SessionChargesPage() {
  const [chargeName, setChargeName] = useState("");
  const [className, setClassName] = useState("ALL");
  const [billingMonth, setBillingMonth] = useState("April");
  const [amount, setAmount] = useState("");
  const [charges, setCharges] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      const res = await apiClient.get("/config/session-charges");
      setCharges(res.data);
    } catch (err) {
      console.error("Load failed:", err);
    }
  };

  const handleAdd = async () => {
    if (!chargeName || !amount) return;

    try {
      const res = await apiClient.post("/config/session-charges", {
        chargeName,
        className,
        billingMonth,
        amount: Number(amount),
      });

      setCharges(prev => [...prev, res.data]);

      setChargeName("");
      setAmount("");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.response?.data?.message || "Failed to save session charge");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/config/session-charges/${id}`);
      setCharges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete session charge");
    }
  };

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>Additional Charges</h2>
        <p style={{ opacity: 0.7, fontSize: 13, marginTop: -10, marginBottom: 20 }}>
          One-time or recurring charges beyond tuition and transport — Admission Fee, Exam Fee,
          Books, Uniform, etc. Pick which class ("ALL" for every class) and which month each
          charge is billed in; it's added automatically to that month's fee for matching students.
        </p>

        {/* Form */}
        <div className="fee-form">
          <input
            placeholder="Charge Name (e.g. Admission Fee)"
            value={chargeName}
            onChange={e => setChargeName(e.target.value)}
          />
          <select value={className} onChange={e => setClassName(e.target.value)}>
            {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={billingMonth} onChange={e => setBillingMonth(e.target.value)}>
            {MONTH_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
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
              <th>Charge Name</th>
              <th>Class</th>
              <th>Billed In</th>
              <th>Amount</th>
              <th>Remove</th>
            </tr>
          </thead>

          <tbody>
            {charges.map(charge => (
              <tr key={charge.id}>
                <td>{charge.chargeName}</td>
                <td>{charge.className}</td>
                <td>{charge.billingMonth || "April"}</td>
                <td>₹ {charge.amount}</td>
                <td>
                  <button
                    className="remove-btn"
                    onClick={() => handleDelete(charge.id)}
                    aria-label={`Remove ${charge.chargeName} charge`}
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
