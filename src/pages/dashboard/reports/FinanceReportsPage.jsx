import "./FinanceReportsPage.css";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../services/apiClient";
import { getAllStudents } from "../../../services/studentService";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const pad2 = (n) => String(n).padStart(2, "0");

function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export default function FinanceReportsPage() {

  const today = new Date();

  // ---- Org overview ----
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teacherCount, setTeacherCount] = useState(0);

  // ---- Period filter (Day / Month / Year) driving the collection cards + transaction table ----
  const [filterMode, setFilterMode] = useState("DAY");
  const [selectedDate, setSelectedDate] = useState(toDateStr(today));
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${pad2(today.getMonth() + 1)}`);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [monthOptions, setMonthOptions] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);

  const [collection, setCollection] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // ---- Load once: org overview + filter option lists + all transactions ----
  useEffect(() => {
    getAllStudents("ACTIVE").then(res => setStudents(res.data || [])).catch(console.error);
    apiClient.get("/classes").then(res => setClasses(res.data || [])).catch(console.error);
    apiClient.get("/teachers").then(res => setTeacherCount((res.data || []).length)).catch(console.error);
    apiClient.get("/fee-reports/transactions").then(res => setTransactions(res.data || [])).catch(console.error);

    apiClient.get("/fee-reports/monthly-collection").then(res => setMonthOptions(res.data || [])).catch(console.error);
    apiClient.get("/fee-reports/yearly-collection").then(res => setYearOptions(res.data || [])).catch(console.error);
  }, []);

  // ---- Fetch the collection summary whenever the period filter changes ----
  useEffect(() => {
    const { from, to } = getRange();
    apiClient.get("/fee-reports/collection", { params: { from, to } })
      .then(res => setCollection(res.data))
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, selectedDate, selectedMonth, selectedYear]);

  function getRange() {
    if (filterMode === "DAY") {
      return { from: selectedDate, to: selectedDate };
    }
    if (filterMode === "MONTH") {
      const [y, m] = selectedMonth.split("-").map(Number);
      const from = `${y}-${pad2(m)}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const to = `${y}-${pad2(m)}-${pad2(lastDay)}`;
      return { from, to };
    }
    // YEAR
    return { from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` };
  }

  // ---- Students grouped by class, in class order (includes empty classes) ----
  const classBreakdown = useMemo(() => {
    return classes.map(c => ({
      id: c.id,
      className: c.className,
      count: students.filter(s => s.currentClass === c.className).length,
    }));
  }, [classes, students]);

  // ---- Transactions filtered to the same period as the summary cards ----
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.paymentTimestamp) return false;
      const d = new Date(t.paymentTimestamp);
      const y = d.getFullYear();
      const m = pad2(d.getMonth() + 1);
      const day = pad2(d.getDate());

      if (filterMode === "DAY") return `${y}-${m}-${day}` === selectedDate;
      if (filterMode === "MONTH") return `${y}-${m}` === selectedMonth;
      return String(y) === String(selectedYear);
    });
  }, [transactions, filterMode, selectedDate, selectedMonth, selectedYear]);

  // Merge fetched month options with the current month so the dropdown
  // always has something sensible to show, even before any payment exists.
  const monthSelectOptions = useMemo(() => {
    const map = new Map();
    monthOptions.forEach(o => map.set(`${o.year}-${pad2(o.month)}`, `${o.monthName} ${o.year}`));
    if (!map.has(selectedMonth)) {
      const [y, m] = selectedMonth.split("-").map(Number);
      map.set(selectedMonth, `${new Date(y, m - 1, 1).toLocaleString("default", { month: "long" })} ${y}`);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthOptions, selectedMonth]);

  const yearSelectOptions = useMemo(() => {
    const set = new Set(yearOptions.map(o => o.year));
    set.add(selectedYear);
    return [...set].sort((a, b) => b - a);
  }, [yearOptions, selectedYear]);

  return (
    <div className="finance-page">

      {/* HEADER */}
      <div className="finance-header">
        <div>
          <h1>Reports</h1>
          <p>Enrollment, staffing & fee collection overview</p>
        </div>
      </div>

      {/* ORG OVERVIEW */}
      <div className="overview-grid">
        <div className="overview-card">
          <span>Total Students</span>
          <h2>{students.length}</h2>
          <p className="overview-note">Active enrollment</p>
        </div>
        <div className="overview-card">
          <span>Total Teachers</span>
          <h2>{teacherCount}</h2>
          <p className="overview-note">Teaching staff</p>
        </div>
        <div className="overview-card">
          <span>Classes in Use</span>
          <h2>{classBreakdown.filter(c => c.count > 0).length} / {classBreakdown.length}</h2>
          <p className="overview-note">Have at least one student</p>
        </div>
      </div>

      {/* STUDENTS BY CLASS */}
      <div className="section-card">
        <div className="section-title-row">
          <h3>Students by Class</h3>
        </div>
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th className="col-left">Class</th>
                <th className="col-num">Students</th>
              </tr>
            </thead>
            <tbody>
              {classBreakdown.map(c => (
                <tr key={c.id}>
                  <td className="col-left">{c.className}</td>
                  <td className="col-num">{c.count}</td>
                </tr>
              ))}
              {classBreakdown.length === 0 && (
                <tr><td colSpan="2" className="empty-note">No classes set up yet.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td className="col-left">Total</td>
                <td className="col-num">{students.length}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* FEE COLLECTION — DAY / MONTH / YEAR FILTER */}
      <div className="section-card">
        <div className="section-title-row">
          <h3>Fee Collection</h3>

          <div className="period-filter">
            <div className="filter-tabs">
              {["DAY", "MONTH", "YEAR"].map(mode => (
                <button
                  key={mode}
                  className={`filter-tab ${filterMode === mode ? "active" : ""}`}
                  onClick={() => setFilterMode(mode)}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {filterMode === "DAY" && (
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
              />
            )}

            {filterMode === "MONTH" && (
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                {monthSelectOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            )}

            {filterMode === "YEAR" && (
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {yearSelectOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {collection && (
          <div className="metrics-grid">
            <div className="metric-card total">
              <span>Total Collection</span>
              <h2>{fmt(collection.totalCollection)}</h2>
            </div>
            <div className="metric-card">
              <span>Cash</span>
              <h2>{fmt(collection.cashCollection)}</h2>
            </div>
            <div className="metric-card">
              <span>UPI</span>
              <h2>{fmt(collection.upiCollection)}</h2>
            </div>
            <div className="metric-card">
              <span>Card</span>
              <h2>{fmt(collection.cardCollection)}</h2>
            </div>
            <div className="metric-card">
              <span>Cheque</span>
              <h2>{fmt(collection.chequeCollection)}</h2>
            </div>
            <div className="metric-card">
              <span>Transactions</span>
              <h2>{collection.totalTransactions}</h2>
            </div>
          </div>
        )}
      </div>

      {/* TRANSACTION TABLE — scoped to the same period as above */}
      <div className="section-card">
        <div className="section-title-row">
          <h3>Transactions ({filteredTransactions.length})</h3>
        </div>

        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th className="col-left">Receipt</th>
                <th className="col-left">Student</th>
                <th className="col-left">Month</th>
                <th className="col-num">Amount</th>
                <th className="col-center">Mode</th>
                <th className="col-left">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn, i) => (
                <tr key={txn.paymentId ?? i}>
                  <td className="col-left"><span className="receipt-code">{txn.receiptNumber || "N/A"}</span></td>
                  <td className="col-left">
                    <div className="student-name">{txn.studentName || `Student-${txn.studentRegNo}`}</div>
                    <div className="student-meta">
                      ({txn.studentRegNo}){txn.currentClass && ` • ${txn.currentClass}`}
                    </div>
                  </td>
                  <td className="col-left">{txn.month} {txn.year}</td>
                  <td className="col-num">{fmt(txn.amountPaid)}</td>
                  <td className="col-center">
                    <span className={`mode-pill ${(txn.paymentMode || "").toLowerCase()}`}>
                      {txn.paymentMode || "N/A"}
                    </span>
                  </td>
                  <td className="col-left">
                    {txn.paymentTimestamp ? new Date(txn.paymentTimestamp).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr><td colSpan="6" className="empty-note">No transactions in this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
