import "./FinanceReportsPage.css";
import axios from "axios";
import { useEffect, useState } from "react";

export default function FinanceReportsPage() {

  const [daily, setDaily] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchDailyReport();
    fetchTransactions();
  }, []);

  // =========================
  // DAILY REPORT
  // =========================

  const fetchDailyReport = async () => {
    try {

      const res = await axios.get(
        "/api/fee-reports/daily-collection"
      );

      setDaily(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // TRANSACTIONS
  // =========================

  const fetchTransactions = async () => {
    try {

      const res = await axios.get(
        "/api/fee-reports/transactions"
      );

      setTransactions(res.data || []);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="finance-page">

      {/* HEADER */}
      <div className="finance-header">

        <div>
          <h1>💰 Finance Reports</h1>
          <p>
            Daily collections, transactions &
            accounting insights
          </p>
        </div>

      </div>

      {/* METRIC CARDS */}
      {daily && (
        <div className="metrics-grid">

          <div className="metric-card total">
            <span>Total Collection</span>
            <h2>₹ {daily.totalCollection}</h2>
          </div>

          <div className="metric-card">
            <span>Cash</span>
            <h2>₹ {daily.cashCollection}</h2>
          </div>

          <div className="metric-card">
            <span>UPI</span>
            <h2>₹ {daily.upiCollection}</h2>
          </div>

          <div className="metric-card">
            <span>Card</span>
            <h2>₹ {daily.cardCollection}</h2>
          </div>

          <div className="metric-card">
            <span>Transactions</span>
            <h2>{daily.totalTransactions}</h2>
          </div>

        </div>
      )}

      {/* TRANSACTION TABLE */}
      <div className="transaction-card">

        <div className="table-header">
          <h3>📜 Recent Transactions</h3>
        </div>

        <div className="transaction-table">

          <div className="table-head">

            <span>Receipt</span>
            <span>Student</span>
            <span>Amount</span>
            <span>Mode</span>
            <span>Collector</span>
            <span>Time</span>

          </div>

          {transactions.map((txn, i) => (

            <div className="table-row" key={i}>

              <span className="receipt">
                {txn.receiptNumber}
              </span>

              <span>
                {txn.studentName}
              </span>

              <span>
                ₹ {txn.amountPaid}
              </span>

              <span>
                <div className={`mode ${txn.paymentMode?.toLowerCase()}`}>
                  {txn.paymentMode}
                </div>
              </span>

              <span>
                {txn.collectedBy}
              </span>

              <span className="time">
                {txn.paymentTimestamp
                  ?.replace("T", " ")
                  ?.substring(0, 16)}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}