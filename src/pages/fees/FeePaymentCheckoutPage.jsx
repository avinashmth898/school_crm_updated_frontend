import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getSchoolInfo } from "../../services/schoolInfoService";
import { useToast } from "../../ui/ToastContext";
import "./FeePaymentCheckoutPage.css";

// Simple Indian-numbering (lakh/crore) amount-in-words converter —
// used on the printed receipt, same convention as physical fee receipts.
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
}
function threeDigits(n) {
  if (n < 100) return twoDigits(n);
  return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + twoDigits(n % 100) : "");
}
function amountInWords(amount) {
  let n = Math.round(Number(amount) || 0);
  if (n === 0) return "Zero Rupees Only";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const hundred = n;
  let parts = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));
  return parts.join(" ") + " Rupees Only";
}

export default function FeePaymentCheckoutPage() {
  const { regNo } = useParams();
  const receiptRef = useRef(null);
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [receiptData, setReceiptData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Fine / discount / additional charge — optional, always shown inline —
  // applied to the first selected month
  const [fine, setFine] = useState("");
  const [discount, setDiscount] = useState("");
  const [extraCharges, setExtraCharges] = useState([]);
  const [extraChargeId, setExtraChargeId] = useState("");
  const [extraChargeAmount, setExtraChargeAmount] = useState("");

  // Amount to pay — one manually-editable field. Whether this counts as a
  // full or partial payment is simply read off whether it's less than the
  // full payable amount, instead of a separate "partial" switch.
  const [amountToPay, setAmountToPay] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);

  // ============================
  // 🔹 Load Data
  // ============================
  useEffect(() => {
    fetchStudent();
    fetchLedger();
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(console.error);
    apiClient.get("/config/session-charges").then(res => setExtraCharges(res.data || [])).catch(console.error);
  }, [regNo]);

  const fetchStudent = async () => {
    const res = await apiClient.get(`/students/${regNo}`);
    setStudent(res.data);
  };


  const fetchLedger = async () => {
    const res = await apiClient.get(`/ledger/${regNo}`);
    setLedger(res.data || []);
  };

  // Additional Charges relevant to this student's class (or "ALL")
  const applicableCharges = extraCharges.filter(
    c => c.className === "ALL" || c.className === student?.currentClass
  );

  const handleExtraChargeSelect = (id) => {
    setExtraChargeId(id);
    const match = applicableCharges.find(c => String(c.id) === String(id));
    setExtraChargeAmount(match ? String(match.amount) : "");
  };

  // ============================
  // 🔹 Academic Months (July → Current + a few months ahead)
  //
  // Fees can be deposited for upcoming months too (e.g. a parent paying a
  // few months in advance) — the backend already pre-generates ledger rows
  // a few months ahead (see /api/ledger/{regNo}?aheadMonths=), so the month
  // picker here just needs to extend past "today" to let staff select them.
  // ============================
  const ADVANCE_MONTHS_AHEAD = 6;

  const getAcademicMonths = () => {
    const months = [];
    const today = new Date();

    const startYear =
      today.getMonth() + 1 >= 7 ? today.getFullYear() : today.getFullYear() - 1;

    let current = new Date(startYear, 6); // July
    const end = new Date(today.getFullYear(), today.getMonth() + ADVANCE_MONTHS_AHEAD);

    while (current <= end) {
      const monthName = current.toLocaleString("default", { month: "long" });
      const isAdvance = current > new Date(today.getFullYear(), today.getMonth());
      months.push({ month: monthName, year: current.getFullYear(), isAdvance });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const academicMonths = getAcademicMonths();

  // Sortable key so months can be compared chronologically regardless of
  // the order they were clicked/selected in — "March 2026" < "April 2026".
  const monthKey = (month, year) => new Date(`${month} 1, ${year}`).getTime();
  const sortChronological = (arr) => [...arr].sort((a, b) => monthKey(a.month, a.year) - monthKey(b.month, b.year));

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
  //
  // Fees must be cleared oldest-first: a later month can't be selected on
  // its own while an earlier month still has a due — the earlier one has
  // to be selected too (paid together) before the later one is allowed.
  // ============================
  const toggleMonth = (entry) => {
    // 🔥 If PAID → show receipt
    if (entry.status === "PAID") {
      fetchReceipt(entry);
      return;
    }

    const isCurrentlySelected = selectedMonths.find(m => m.id === entry.id);

    if (!isCurrentlySelected) {
      // Selecting: block if an earlier month is still unpaid and not
      // already part of the selection.
      const earlierUnpaid = academicMonths
        .map(({ month, year }) => getMonthData(month, year))
        .filter(m => m.status !== "PAID" && monthKey(m.month, m.year) < monthKey(entry.month, entry.year))
        .filter(m => !selectedMonths.find(sel => sel.id === m.id));

      if (earlierUnpaid.length > 0) {
        const earliest = sortChronological(earlierUnpaid)[0];
        toast.error(`Clear the due for ${earliest.month} ${earliest.year} first (or select it too to pay both together).`);
        return;
      }
    } else {
      // Deselecting: block if a LATER month is still selected — can't
      // un-pick March while April stays picked, that would reorder things.
      const laterSelected = selectedMonths.filter(
        m => m.id !== entry.id && monthKey(m.month, m.year) > monthKey(entry.month, entry.year)
      );
      if (laterSelected.length > 0) {
        const latest = sortChronological(laterSelected).slice(-1)[0];
        toast.error(`Deselect ${latest.month} ${latest.year} (and any later months) first.`);
        return;
      }
    }

    // ✅ Else toggle selection
    setSelectedMonths(prev =>
      prev.find(m => m.id === entry.id)
        ? prev.filter(m => m.id !== entry.id)
        : [...prev, entry]
    );
  };

  const selectAllDue = () => {
    const due = academicMonths
      .map(({ month, year }) => getMonthData(month, year))
      .filter(entry => entry.status !== "PAID");
    setSelectedMonths(due);
  };

  const clearSelection = () => setSelectedMonths([]);

  const closeReceipt = () => setReceiptData(null);

  // ============================
  // 🔹 Calculations
  // ============================
  const dueTotalSelected = selectedMonths.reduce(
    (sum, m) => sum + Number(m.totalAmount - m.paidAmount),
    0
  );
  const fineNum = Number(fine) || 0;
  const discountNum = Number(discount) || 0;
  const extraNum = Number(extraChargeAmount) || 0;
  const adjustedTotalSelected = Math.max(0, dueTotalSelected + fineNum + extraNum - discountNum);

  // The "Amount to Pay" box defaults to the full payable amount whenever the
  // month selection changes, but once the user edits it manually we leave
  // it alone — whether that counts as partial or full is just read off by
  // comparing it to the full payable amount, no separate toggle needed.
  useEffect(() => {
    if (!amountTouched) {
      setAmountToPay(adjustedTotalSelected > 0 ? String(adjustedTotalSelected) : "");
    }
  }, [adjustedTotalSelected, amountTouched]);

  useEffect(() => {
    setAmountTouched(false);
  }, [selectedMonths]);

  const totalSelected = Math.max(0, Number(amountToPay) || 0);
  const isPartial = selectedMonths.length > 0 && totalSelected > 0 && totalSelected < adjustedTotalSelected;

  // Paying MORE than what's due for the selected months doesn't vanish —
  // it automatically rolls forward as an advance payment toward the next
  // unpaid month(s) in order, the same months already offered for advance
  // payment in the picker above.
  const overpaidAmount = Math.max(0, totalSelected - adjustedTotalSelected);
  const isOverpaid = selectedMonths.length > 0 && overpaidAmount > 0;

  // Unpaid months AFTER the last selected one, in order — where an
  // overpayment can land. Only relevant once something is overpaid.
  const overflowCandidates = (() => {
    if (!selectedMonths.length) return [];
    const lastSelected = sortChronological(selectedMonths).slice(-1)[0];
    return academicMonths
      .map(({ month, year }) => getMonthData(month, year))
      .filter(m => m.status !== "PAID")
      .filter(m => monthKey(m.month, m.year) > monthKey(lastSelected.month, lastSelected.year))
      .sort((a, b) => monthKey(a.month, a.year) - monthKey(b.month, b.year));
  })();

  // Walks the overflow candidates to see exactly which month(s) the extra
  // amount would land on, and how much — used both for the live preview
  // text and, at submit time, for the actual payload.
  const planOverflow = (amount, candidates) => {
    let remaining = amount;
    const applied = [];
    for (const m of candidates) {
      if (remaining <= 0) break;
      const due = Number(m.totalAmount - m.paidAmount);
      const amt = Math.min(due, remaining);
      if (amt > 0) {
        applied.push({ ...m, overflowAmount: amt });
        remaining -= amt;
      }
    }
    return { applied, unallocated: remaining };
  };

  const { applied: overflowPreview, unallocated: overflowUnallocated } =
    isOverpaid ? planOverflow(overpaidAmount, overflowCandidates) : { applied: [], unallocated: 0 };

  const totalDue = academicMonths.reduce((sum, { month, year }) => {
    const entry = getMonthData(month, year);
    return sum + Number(entry.totalAmount - entry.paidAmount);
  }, 0);

  // ============================
  // 🔹 Handle Payment + Receipt
  // ============================
  const handlePayment = async () => {
    if (!selectedMonths.length) {
      toast.error("Select at least one month");
      return;
    }
    if (totalSelected <= 0) {
      toast.error("Enter the amount to pay");
      return;
    }
    if (isOverpaid && overflowUnallocated > 0) {
      toast.error(
        `₹${overflowUnallocated.toLocaleString("en-IN")} doesn't fit into any month that's been generated yet — ` +
        `reduce the amount, or open the ledger again once more months are generated.`
      );
      return;
    }

    // Build the per-month amounts, OLDEST MONTH FIRST: first the months
    // actually selected, then — if the entered amount is MORE than what's
    // due for those — roll the extra forward automatically as an advance
    // payment into the next unpaid month(s) in order (overflowPreview,
    // computed above). e.g. ₹1000 against a single ₹600-due month puts
    // ₹600 there and the remaining ₹400 toward the very next month.
    const orderedMonths = [
      ...sortChronological(selectedMonths),
      ...overflowPreview,
    ];
    let remaining = totalSelected;
    const monthsPayload = [];

    orderedMonths.forEach((m, idx) => {
      const due = Number(m.totalAmount - m.paidAmount);
      const amountForMonth = Math.min(due, Math.max(0, remaining));
      remaining -= amountForMonth;

      if (amountForMonth <= 0) return;

      const item = { month: m.month, year: m.year, amount: amountForMonth };
      if (idx === 0) {
        if (fineNum > 0) item.fine = fineNum;
        if (discountNum > 0) item.discount = discountNum;
        if (extraChargeId) {
          item.extraChargeId = Number(extraChargeId);
          item.extraChargeAmount = extraNum;
        }
      }
      if (isPartial) item.partial = true;

      monthsPayload.push(item);
    });

    if (!monthsPayload.length) {
      toast.error("Nothing to pay — check the amount entered");
      return;
    }

    try {
      const res = await apiClient.post("/fees/pay-batch", {
        regNo: Number(regNo),
        paymentMode: paymentMode,
        months: monthsPayload,
      });

      setReceiptData(formatReceipt(res.data));

      await fetchLedger();
      setSelectedMonths([]);
      setFine("");
      setDiscount("");
      setExtraChargeId("");
      setExtraChargeAmount("");
      setAmountToPay("");
      setAmountTouched(false);

      toast.success("Payment successful");

    } catch (err) {
      console.error(err);
      toast.error("Payment failed. " + (err.response?.data?.message || ""));
    }
  };

  const formatReceipt = (data) => ({
    receiptNo: data.receiptNumber,
    date: new Date(data.timestamp).toLocaleString(),
    student: {
      name: data.studentName,
      registrationNumber: data.studentRegNo,
      admissionNumber: data.admissionNumber,
    },
    months: (data.lines || []).map((l, i) => ({
      id: `${l.month}-${l.year}-${i}`,
      month: l.month,
      year: l.year,
      amountPaid: l.amountPaid,
      totalPayable: l.totalPayable,
      fineAmount: l.fineAmount,
      discountAmount: l.discountAmount,
      extraChargeName: l.extraChargeName,
      extraChargeAmount: l.extraChargeAmount,
      remainingAmount: l.remainingAmount,
    })),
    total: data.totalAmount,
    totalPayable: data.totalPayable,
    totalFine: data.totalFine,
    totalDiscount: data.totalDiscount,
    totalExtraCharges: data.totalExtraCharges,
    totalDueAfter: data.totalDueAfter,
    previousBackDue: data.previousBackDue,
    mode: data.paymentMode,
  });

  const fetchReceipt = async (entry) => {
    try {
      const res = await apiClient.get(
        `/fees/receipt?regNo=${regNo}&month=${entry.month}&year=${entry.year}`
      );

      setReceiptData(formatReceipt(res.data));

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch receipt");
    }
  };

  // ============================
  // 🔹 Download receipt as PDF (html2pdf.js, loaded globally in index.html)
  // ============================
  const handleDownloadPdf = () => {
    if (!receiptRef.current || !window.html2pdf) {
      toast.error("PDF engine still loading — please try again in a moment.");
      return;
    }
    setDownloading(true);
    window.html2pdf()
      .set({
        margin: 0,
        filename: `Receipt-${receiptData?.receiptNo || "fee"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: "avoid-all" },
      })
      .from(receiptRef.current)
      .save()
      .finally(() => setDownloading(false));
  };

  if (!student) return <p>Loading...</p>;

  return (
    <div className="payfee-page">
      <div className="payfee-shell">

        {/* HEADER — just who's paying and how much, nothing else */}
        <div className="payfee-header no-print">
          <div className="payfee-header-student">
            <span className="payfee-avatar">{student.name?.[0] || "S"}</span>
            <div>
              <h2>{student.name}</h2>
              <p>{student.currentClass} · Reg {student.registrationNumber}</p>
            </div>
          </div>
          <div className="payfee-stat payfee-stat-payable">
            <label>{isPartial ? "Paying now (partial)" : "Payable now"}</label>
            <span>₹{totalSelected.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* MAIN DASHBOARD — months on the left, a short list of controls on
            the right. Both panels manage their own overflow so the outer
            page never needs to scroll. */}
        <div className="payfee-body no-print">

          <section className="payfee-months-panel">
            <div className="payfee-panel-head">
              <h3>Select Months</h3>
              <div className="payfee-quick-actions">
                <button type="button" className="chip-btn" onClick={selectAllDue}>Select All Due</button>
                <button type="button" className="chip-btn chip-btn-ghost" onClick={clearSelection}>Clear</button>
              </div>
            </div>

            <div className="months-grid">
              {academicMonths.map(({ month, year, isAdvance }) => {
                const entry = getMonthData(month, year);
                const due = entry.totalAmount - entry.paidAmount;
                const selected = selectedMonths.find(m => m.id === entry.id);
                const fineApplied = entry.fineApplied && Number(entry.lateFineAmount) > 0;

                return (
                  <div
                    key={entry.id}
                    className={`month-card
                      ${entry.status === "PAID" ? "paid" : ""}
                      ${entry.status === "PARTIAL" ? "partial" : ""}
                      ${entry.status === "DUE" ? "due" : ""}
                      ${selected ? "selected" : ""}
                    `}
                    onClick={() => toggleMonth(entry)}
                    title={entry.dueDate ? `Due by ${entry.dueDate}` : undefined}
                  >
                    {selected && <span className="month-check">✓</span>}
                    {isAdvance && entry.status !== "PAID" && (
                      <span className="month-advance-badge">Advance</span>
                    )}
                    <h4>{month.slice(0, 3)} {year}</h4>
                    <p>₹{due.toLocaleString("en-IN")}</p>
                    <span>{entry.status}</span>
                    {fineApplied && <span className="month-fine-badge">+₹{Number(entry.lateFineAmount)} fine</span>}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="payfee-sidebar">

            <div className="sidebar-card">
              <h3>Summary</h3>
              <div className="summary-line"><span>Selected months</span><b>{selectedMonths.length}</b></div>
              <div className="summary-line"><span>Amount due</span><b>₹{dueTotalSelected.toLocaleString("en-IN")}</b></div>

              {/* Fine / Discount / Additional charge — all optional, so they
                  sit in one row with their own box, always available, no
                  show/hide toggle needed. */}
              <div className="inline-adjustments-row">
                <label>
                  Fine
                  <input type="number" min="0" placeholder="₹0" value={fine} onChange={e => setFine(e.target.value)} />
                </label>
                <label>
                  Discount
                  <input type="number" min="0" placeholder="₹0" value={discount} onChange={e => setDiscount(e.target.value)} />
                </label>
                <label>
                  Charge
                  <select value={extraChargeId} onChange={e => handleExtraChargeSelect(e.target.value)}>
                    <option value="">None</option>
                    {applicableCharges.map(c => (
                      <option key={c.id} value={c.id}>{c.chargeName} (₹{c.amount})</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="summary-line summary-line-total"><span>Payable</span><b>₹{adjustedTotalSelected.toLocaleString("en-IN")}</b></div>

              {/* Amount to Pay — typed manually. Paying less than the full
                  payable amount is automatically treated as a partial
                  payment, no separate toggle needed. */}
              <label className={`amount-to-pay-box ${isPartial ? "is-partial" : ""} ${isOverpaid ? "is-overpaid" : ""}`}>
                Amount to Pay
                <input
                  type="number"
                  min="0"
                  value={amountToPay}
                  onChange={e => {
                    setAmountTouched(true);
                    setAmountToPay(e.target.value);
                  }}
                />
              </label>
              {isPartial && (
                <p className="partial-remaining">
                  Partial payment — ₹{Math.max(0, adjustedTotalSelected - totalSelected).toLocaleString("en-IN")} will remain due.
                </p>
              )}
              {isOverpaid && overflowPreview.length > 0 && (
                <p className="overpaid-note">
                  ₹{overpaidAmount.toLocaleString("en-IN")} extra will be applied as an advance toward{" "}
                  {overflowPreview.map((o, i) => (
                    <span key={`${o.month}-${o.year}`}>
                      {i > 0 && ", "}₹{o.overflowAmount.toLocaleString("en-IN")} to {o.month} {o.year}
                    </span>
                  ))}.
                </p>
              )}
              {isOverpaid && overflowUnallocated > 0 && (
                <p className="overpaid-warning">
                  ₹{overflowUnallocated.toLocaleString("en-IN")} of that doesn't fit into any month generated
                  yet — reduce the amount, or it won't be recorded.
                </p>
              )}
            </div>

            <div className="sidebar-card">
              <h3>Payment Mode</h3>
              <select className="simple-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>

            <button
              className={`pay-btn ${isPartial ? "pay-btn-partial" : ""} ${isOverpaid && overflowUnallocated > 0 ? "pay-btn-overpaid" : ""}`}
              onClick={handlePayment}
              disabled={isOverpaid && overflowUnallocated > 0}
            >
              {isOverpaid && overflowUnallocated > 0
                ? `₹${overflowUnallocated.toLocaleString("en-IN")} too much — fix amount`
                : isPartial
                ? `Pay ₹${totalSelected.toLocaleString("en-IN")} (Partial)`
                : `Pay ₹${totalSelected.toLocaleString("en-IN")}`}
            </button>
          </aside>
        </div>

        {/* RECEIPT — opens as an overlay on top of the dashboard rather than
            pushing it out of view, so the payment screen never needs to
            scroll just because a receipt was generated. */}
        {receiptData && (
          <div className="receipt-overlay" onClick={closeReceipt}>
            <div className="receipt printable" id="receipt-print-area" ref={receiptRef} onClick={e => e.stopPropagation()}>
              <button type="button" className="receipt-close no-print" onClick={closeReceipt} aria-label="Close receipt">✕</button>

              <div className="receipt-letterhead">
                <h1 className="receipt-school-name">{schoolInfo?.schoolName || "School Name Not Set"}</h1>
                <p className="receipt-school-address">
                  {[schoolInfo?.address, schoolInfo?.contactPhone && `Ph: ${schoolInfo.contactPhone}`]
                    .filter(Boolean)
                    .join("   •   ")}
                </p>
                <div className="receipt-badge">FEE RECEIPT</div>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-details">
                <div className="receipt-meta-row">
                  <div><label>Receipt No.</label><span className="receipt-code">{receiptData.receiptNo}</span></div>
                  <div><label>Date &amp; Time</label><span>{receiptData.date}</span></div>
                  <div><label>Payment Mode</label><span>{receiptData.mode}</span></div>
                </div>

                <div className="receipt-details-divider" />

                <div className="receipt-student-grid">
                  <div><label>Student Name</label><span>{receiptData.student.name}</span></div>
                  <div><label>Registration No.</label><span>{receiptData.student.registrationNumber}</span></div>
                  <div><label>Admission No.</label><span>{receiptData.student.admissionNumber || "—"}</span></div>
                  <div><label>Class</label><span>{student?.currentClass || "—"}</span></div>
                  <div><label>Father's Name</label><span>{student?.fatherName || "—"}</span></div>
                  <div><label>Mobile</label><span>{student?.mobileNumber || "—"}</span></div>
                </div>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th className="col-sr">#</th>
                    <th>Fee For Month</th>
                    <th className="col-money">Payable</th>
                    <th className="col-money">Fine</th>
                    <th>Extra Charge</th>
                    <th className="col-money">Discount</th>
                    <th className="col-money">Paid</th>
                    <th className="col-money">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.months.map((m, i) => (
                    <tr key={m.id}>
                      <td className="col-sr">{i + 1}</td>
                      <td>{m.month} {m.year}</td>
                      <td className="col-money">₹{Number(m.totalPayable || 0).toLocaleString("en-IN")}</td>
                      <td className="col-money">{m.fineAmount > 0 ? `₹${Number(m.fineAmount).toLocaleString("en-IN")}` : "—"}</td>
                      <td>{m.extraChargeAmount > 0 ? `${m.extraChargeName || "Charge"} (₹${Number(m.extraChargeAmount).toLocaleString("en-IN")})` : "—"}</td>
                      <td className="col-money">{m.discountAmount > 0 ? `₹${Number(m.discountAmount).toLocaleString("en-IN")}` : "—"}</td>
                      <td className="col-money">₹{Number(m.amountPaid).toLocaleString("en-IN")}</td>
                      <td className="col-money">{m.remainingAmount > 0 ? `₹${Number(m.remainingAmount).toLocaleString("en-IN")}` : "₹0"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="receipt-total-row">
                    <td colSpan={6}>Total Paid (this receipt)</td>
                    <td className="col-money" colSpan={2}>₹{Number(receiptData.total).toLocaleString("en-IN")}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="receipt-breakdown-summary">
                <div><label>Total Payable (this receipt)</label><span>₹{Number(receiptData.totalPayable || 0).toLocaleString("en-IN")}</span></div>
                <div><label>Amount Paid</label><span>₹{Number(receiptData.total || 0).toLocaleString("en-IN")}</span></div>
                <div><label>Amount Due (these months)</label><span>₹{Number(receiptData.totalDueAfter || 0).toLocaleString("en-IN")}</span></div>
                <div><label>Back Due (other months)</label><span>₹{Number(receiptData.previousBackDue || 0).toLocaleString("en-IN")}</span></div>
              </div>

              <p className="receipt-words">
                <label>Amount in Words:</label> {amountInWords(receiptData.total)}
              </p>

              <div className="receipt-signature-row">
                <div className="signature-box">
                  <div className="signature-line" />
                  <span>Received By</span>
                </div>
                <div className="signature-box">
                  <div className="signature-line" />
                  <span>Authorized Signatory / Stamp</span>
                </div>
              </div>

              <p className="receipt-footnote">
                This is a computer-generated receipt and does not require a physical signature to be valid.
              </p>

              <div className="receipt-actions no-print">
                <button className="ch-btn" onClick={() => window.print()}>
                  🖨 Print Receipt
                </button>
                <button className="ch-btn ch-btn-primary" onClick={handleDownloadPdf} disabled={downloading}>
                  {downloading ? "Preparing…" : "⬇ Download PDF"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}