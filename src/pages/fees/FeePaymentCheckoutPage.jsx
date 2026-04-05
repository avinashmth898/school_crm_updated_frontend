import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import "./FeePaymentCheckoutPage.css";

export default function FeePaymentCheckoutPage() {
  const { regNo } = useParams();

  const [student, setStudent] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [receiptData, setReceiptData] = useState(null);

  // ============================
  // 🔹 Load Data
  // ============================
  useEffect(() => {
    fetchStudent();
    fetchLedger();
  }, [regNo]);

  const fetchStudent = async () => {
    const res = await apiClient.get(`/students/${regNo}`);
    setStudent(res.data);
  };


  const fetchLedger = async () => {
    const res = await apiClient.get(`/ledger/${regNo}`);
    setLedger(res.data || []);
  };

  // ============================
  // 🔹 Academic Months (July → Current)
  // ============================
  const getAcademicMonths = () => {
    const months = [];
    const today = new Date();

    const startYear =
      today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1;

    let current = new Date(startYear, 6); // July
    const end = new Date(today.getFullYear(), today.getMonth());

    while (current <= end) {
      const monthName = current.toLocaleString("default", { month: "long" });
      months.push({ month: monthName, year: current.getFullYear() });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const academicMonths = getAcademicMonths();

  // ============================
  // 🔹 Merge Ledger + Missing Months
  // ============================
  const getMonthData = (month, year) => {
    const entry = ledger.find(
      l => l.month === month && l.year === year
    );

    if (entry) return entry;

    return {
      id: `${month}-${year}`,
      month,
      year,
      totalAmount: student?.monthlyFee || 0,
      paidAmount: 0,
      status: "DUE"
    };
  };

  // ============================
  // 🔹 Toggle Selection
  // ============================
  const toggleMonth = (entry) => {
    // 🔥 If PAID → show receipt
    if (entry.status === "PAID") {
      fetchReceipt(entry);
      return;
    }

    // ✅ Else toggle selection
    setSelectedMonths(prev =>
      prev.find(m => m.id === entry.id)
        ? prev.filter(m => m.id !== entry.id)
        : [...prev, entry]
    );
  };

  // ============================
  // 🔹 Calculations
  // ============================
  const totalSelected = selectedMonths.reduce(
    (sum, m) => sum + Number(m.totalAmount - m.paidAmount),
    0
  );

  const totalDue = academicMonths.reduce((sum, { month, year }) => {
    const entry = getMonthData(month, year);
    return sum + Number(entry.totalAmount - entry.paidAmount);
  }, 0);

  // ============================
  // 🔹 Handle Payment + Receipt
  // ============================
  const handlePayment = async () => {
    if (!selectedMonths.length) {
      alert("Select at least one month");
      return;
    }

    try {
      let paidMonths = [];

      for (const m of selectedMonths) {
        const dueAmount = m.totalAmount - m.paidAmount;

        await apiClient.post("/fees/pay", {
          regNo: Number(regNo),
          month: m.month,
          year: m.year,
          amount: dueAmount,
          paymentMode: paymentMode
        });

        paidMonths.push(m);
      }

      // ✅ Generate Receipt
      const receipt = {
        receiptNo: "RCPT-" + Date.now(),
        date: new Date().toLocaleString(),
        student: student,
        months: paidMonths,
        total: totalSelected,
        mode: paymentMode
      };

      setReceiptData(receipt);

      await fetchLedger();
      setSelectedMonths([]);

      alert("Payment successful ✅");

    } catch (err) {
      console.error(err);
      alert("Payment failed ❌");
    }
  };const fetchReceipt = async (entry) => {
      try {
        const res = await apiClient.get(
          `/fees/receipt?regNo=${regNo}&month=${entry.month}&year=${entry.year}`
        );

        const data = res.data;

        const formattedReceipt = {
          receiptNo: data.receiptNo,
          date: new Date(data.timestamp).toLocaleString(),
          student: data.student,
          months: data.months,
          total: data.total,
          mode: data.mode
        };

        setReceiptData(formattedReceipt);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch receipt ❌");
      }
    };

  if (!student) return <p>Loading...</p>;

  return (
    <div className="payfee-page">
      <div className="payfee-container">
        <div className="payfee-content">

          {/* STUDENT INFO */}
          <div className="card">
            <h2>💳 Pay Fee</h2>
            <p><b>{student.name}</b></p>
            <p>Reg No: {student.registrationNumber}</p>
            <p>Class: {student.currentClass}</p>
          </div>

          {/* SUMMARY */}
          <div className="card summary">
            <h3>Fee Summary</h3>
            <p>Total Due: ₹{totalDue}</p>
            <p>Selected Total: ₹{totalSelected}</p>
          </div>

          {/* MONTHS */}
          <div className="card">
            <h3>Select Months</h3>
            <div className="months-grid">
              {academicMonths.map(({ month, year }) => {
                const entry = getMonthData(month, year);
                const due = entry.totalAmount - entry.paidAmount;
                const selected = selectedMonths.find(m => m.id === entry.id);

                return (
                  <div
                    key={entry.id}
                    className={`month-card
                      ${entry.status === "PAID" ? "paid" : ""}
                      ${selected ? "selected" : ""}
                    `}
                    onClick={() => toggleMonth(entry)}
                  >
                    <h4>{month} {year}</h4>
                    <p>Due: ₹{due}</p>
                    <span>{entry.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PAYMENT MODE */}
          <div className="card">
            <h3>Payment Mode</h3>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK">Bank Transfer</option>
            </select>
          </div>

          {/* PAY BUTTON */}
          <button className="pay-btn" onClick={handlePayment}>
            Pay ₹{totalSelected}
          </button>

          {/* RECEIPT */}
          {receiptData && (
            <div className="receipt printable">
              <h2>School Name</h2>
              <h3>Fee Receipt</h3>
              <p>Receipt No: {receiptData.receiptNo}</p>
              <p>Date: {receiptData.date}</p>

              <hr />

              <p><b>Student:</b> {receiptData.student.name}</p>
              <p><b>Reg No:</b> {receiptData.student.registrationNumber}</p>

              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.months.map(m => (
                    <tr key={m.id}>
                      <td>{m.month} {m.year}</td>
                      <td>₹{m.totalAmount - m.paidAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>Total: ₹{receiptData.total}</h3>
              <p>Mode: {receiptData.mode}</p>

              <button onClick={() => window.print()}>
                🖨 Print Receipt
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}