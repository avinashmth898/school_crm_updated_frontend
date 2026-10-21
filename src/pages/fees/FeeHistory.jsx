import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./FeeHistory.css";
import { getStudentProfile } from "../../services/studentService";
import { getSchoolInfo } from "../../services/schoolInfoService";
import apiClient from "../../services/apiClient";
import { useToast } from "../../ui/ToastContext";
import { useConfirm, usePrompt } from "../../ui/ConfirmContext";
import { isAdmin } from "../../auth/authStorage";

export default function FeeHistory() {
  const { regNo } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  const toast = useToast();
  const confirm = useConfirm();
  const prompt = usePrompt();

  const [ledger, setLedger] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [student, setStudent] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [showAudit, setShowAudit] = useState(false);

  /* Load student, school letterhead info */
  useEffect(() => {
    getStudentProfile(regNo).then(res => setStudent(res.data));
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(console.error);
  }, [regNo]);

  /* Real ledger (auto-generates missing months from July → today) */
  useEffect(() => {
    apiClient.get(`/ledger/${regNo}`)
      .then(res => setLedger(res.data || []))
      .catch(console.error);
  }, [regNo]);

  /* Real payment history — every individual transaction, timestamped */
  const fetchPayments = () => {
    apiClient.get(`/fees/history/${regNo}`)
      .then(res => setPayments(res.data || []))
      .catch(console.error);
  };
  useEffect(() => { fetchPayments(); }, [regNo]);

  /* Refunds issued against this student's payments */
  const fetchRefunds = () => {
    apiClient.get(`/fees/refunds/${regNo}`)
      .then(res => setRefunds(res.data || []))
      .catch(console.error);
  };
  useEffect(() => { fetchRefunds(); }, [regNo]);

  /* Audit trail — who collected/refunded what, and when the system
     auto-applied a late fine. Loaded lazily the first time it's opened. */
  const fetchAuditLog = () => {
    apiClient.get(`/fees/audit/${regNo}`)
      .then(res => setAuditLog(res.data || []))
      .catch(console.error);
  };

  const refundsByPaymentId = {};
  refunds.forEach(r => {
    const key = r.originalPaymentId;
    refundsByPaymentId[key] = (refundsByPaymentId[key] || []).concat(r);
  });

  const refetchLedgerAndHistory = () => {
    apiClient.get(`/ledger/${regNo}`).then(res => setLedger(res.data || [])).catch(console.error);
    fetchPayments();
    fetchRefunds();
    if (showAudit) fetchAuditLog();
  };

  const handleRefund = async (payment) => {
    const alreadyRefunded = Number(payment.refundedAmount) || 0;
    const maxRefundable = Number(payment.amountPaid) - alreadyRefunded;
    if (maxRefundable <= 0) {
      toast.error("This payment has already been fully refunded.");
      return;
    }

    const amountStr = await prompt({
      message: `Refund amount for receipt ${payment.receiptNumber} (max ₹${maxRefundable.toLocaleString("en-IN")}):`,
      defaultValue: String(maxRefundable),
    });
    if (amountStr === null) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0 || amount > maxRefundable) {
      toast.error("Enter a valid refund amount (greater than 0, up to the amount paid).");
      return;
    }

    const reason = await prompt({ message: "Reason for this refund:", required: false });
    if (reason === null) return;

    const ok = await confirm({
      message: `Refund ₹${amount.toLocaleString("en-IN")} against receipt ${payment.receiptNumber}? This will reduce the student's recorded payment for ${payment.month} ${payment.year}.`,
      confirmLabel: "Issue Refund",
      danger: true,
    });
    if (!ok) return;

    try {
      await apiClient.post("/fees/refund", { paymentId: payment.id, amount, reason });
      toast.success("Refund issued.");
      refetchLedgerAndHistory();
    } catch (err) {
      console.error(err);
      toast.error("Refund failed. " + (err.response?.data?.message || ""));
    }
  };

  /* Dynamic Months (Past 6 → Next 6) */
  const generateMonths = () => {
    const months = [];
    const today = new Date();
    for (let i = -6; i <= 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      months.push({ month, year });
    }
    return months;
  };

  const dynamicMonths = generateMonths();

  /* Merge with real ledger — months not yet generated (future months)
     show as "Not generated yet" rather than a fabricated amount */
  const fullLedger = dynamicMonths.map(({ month, year }) => {
    const existing = ledger.find(l => l.month === month && l.year === year);
    return (
      existing || {
        id: `${month}-${year}`,
        month,
        year,
        tuitionFee: 0,
        transportFee: 0,
        annualFee: 0,
        totalAmount: 0,
        paidAmount: 0,
        status: "NOT_GENERATED",
      }
    );
  });

  /* Sort */
  fullLedger.sort((a, b) => {
    const dateA = new Date(`${a.month} 1, ${a.year}`);
    const dateB = new Date(`${b.month} 1, ${b.year}`);
    return dateA - dateB;
  });

  /* Filter */
  const filteredLedger = fullLedger.filter(
    item => !filterStatus || item.status === filterStatus
  );

  /* Expand row */
  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  /* Summary */
  const totalAmount = fullLedger.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalPaid   = fullLedger.reduce((sum, l) => sum + l.paidAmount, 0);
  const totalDue    = fullLedger.reduce((sum, l) => sum + (l.totalAmount - l.paidAmount), 0);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const statusLabel = (s) => s === "NOT_GENERATED" ? "—" : s.charAt(0) + s.slice(1).toLowerCase();

  /* Latest payment timestamp per month/year — pulled from the real payment
     history so the ledger table can show "Paid On" without a DB change. */
  const latestPaymentByMonth = {};
  payments.forEach(p => {
    const key = `${p.month}-${p.year}`;
    const ts = p.paymentTimestamp ? new Date(p.paymentTimestamp) : null;
    if (ts && (!latestPaymentByMonth[key] || ts > latestPaymentByMonth[key])) {
      latestPaymentByMonth[key] = ts;
    }
  });
  const paidOnFor = (entry) => {
    const ts = latestPaymentByMonth[`${entry.month}-${entry.year}`];
    return ts ? ts.toLocaleString() : "—";
  };

  return (
    <div className="fee-history-page">
      <div className="fee-history-container" id="print-area" ref={printRef}>

        {/* LETTERHEAD */}
        <div className="ledger-letterhead">
          <div>
            <h1 className="school-name">{schoolInfo?.schoolName || "School Name Not Set"}</h1>
            <p className="school-address">{schoolInfo?.address || ""}</p>
            <p className="doc-kicker">Fee Ledger &amp; Payment Statement</p>
          </div>
          <button className="print-btn no-print" onClick={() => window.print()}>
            🖨 Print Statement
          </button>
        </div>

        <div className="ledger-divider" />

        {/* PROFILE */}
        {student && (
          <div className="student-detail-grid">
            <div><label>Student Name</label><span>{student.name}</span></div>
            <div><label>Registration No.</label><span>{student.registrationNumber}</span></div>
            <div><label>Admission No.</label><span>{student.admissionNumber}</span></div>
            <div><label>Class</label><span>{student.currentClass}</span></div>
            <div><label>Father's Name</label><span>{student.fatherName}</span></div>
            <div><label>Mobile</label><span>{student.mobileNumber}</span></div>
            <div><label>Admission Date</label><span>{student.admissionDate}</span></div>
          </div>
        )}

        {/* SUMMARY */}
        <div className="summary-cards">
          <div className="summary-card accent-blue">
            <span>Total Charged</span>
            <b>{fmt(totalAmount)}</b>
          </div>
          <div className="summary-card accent-green">
            <span>Total Paid</span>
            <b>{fmt(totalPaid)}</b>
          </div>
          <div className="summary-card accent-red">
            <span>Balance Due</span>
            <b>{fmt(totalDue)}</b>
          </div>
        </div>

        {/* SECTION: LEDGER */}
        <div className="section-heading-row no-print">
          <h3>Monthly Fee Ledger</h3>
          <div className="filter-section">
            <label>Status</label>
            <select onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="DUE">Due</option>
            </select>
          </div>
        </div>

        <div className="fee-table-wrapper">
          <table className="fee-table">
            <thead>
              <tr>
                <th className="col-month">Month</th>
                <th className="col-money">Tuition</th>
                <th className="col-money">Transport</th>
                <th className="col-money">Annual</th>
                <th className="col-money col-strong">Total</th>
                <th className="col-money">Paid</th>
                <th className="col-status">Status</th>
                <th className="col-month">Paid On</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLedger.map(entry => (
                <>
                  <tr
                    key={entry.id}
                    className={`clickable-row ${entry.status === "DUE" ? "due-row" : ""}`}
                    onClick={() => toggleRow(entry.id)}
                  >
                    <td className="col-month">{entry.month} {entry.year}</td>
                    <td className="col-money">{fmt(entry.tuitionFee)}</td>
                    <td className="col-money">{fmt(entry.transportFee)}</td>
                    <td className="col-money">{fmt(entry.annualFee)}</td>
                    <td className="col-money col-strong">{fmt(entry.totalAmount)}</td>
                    <td className="col-money">{fmt(entry.paidAmount)}</td>

                    <td className="col-status">
                      <span className={`status-pill ${entry.status.toLowerCase()}`}>
                        {statusLabel(entry.status)}
                      </span>
                    </td>

                    <td className="col-month">
                      {(entry.status === "PAID" || entry.status === "PARTIAL") ? paidOnFor(entry) : "—"}
                    </td>

                    <td className="col-action">
                      {entry.status === "PAID" ? (
                        <span
                          className="table-link"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/students/${regNo}/pay-fee`);
                          }}
                        >
                          Receipt
                        </span>
                      ) : entry.status === "NOT_GENERATED" ? (
                        "—"
                      ) : (
                        <span
                          className="table-link pay"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/students/${regNo}/pay-fee`);
                          }}
                        >
                          Pay
                        </span>
                      )}
                    </td>
                  </tr>

                  {expandedRow === entry.id && (
                    <tr className="expanded-row" key={`${entry.id}-exp`}>
                      <td colSpan="9">
                        <div className="expanded-content">
                          <div>
                            <strong>Breakdown</strong>
                            <p>Tuition: {fmt(entry.tuitionFee)}</p>
                            <p>Transport: {fmt(entry.transportFee)}</p>
                            <p>Additional Charges: {fmt(entry.annualFee)}</p>
                          </div>
                          <div>
                            <strong>Balance</strong>
                            <p>Paid: {fmt(entry.paidAmount)}</p>
                            <p>Due: {fmt(entry.totalAmount - entry.paidAmount)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>

            <tfoot>
              <tr className="totals-row">
                <td className="col-month">Total</td>
                <td className="col-money">{fmt(fullLedger.reduce((s, l) => s + l.tuitionFee, 0))}</td>
                <td className="col-money">{fmt(fullLedger.reduce((s, l) => s + l.transportFee, 0))}</td>
                <td className="col-money">{fmt(fullLedger.reduce((s, l) => s + l.annualFee, 0))}</td>
                <td className="col-money col-strong">{fmt(totalAmount)}</td>
                <td className="col-money">{fmt(totalPaid)}</td>
                <td className="col-status">—</td>
                <td className="col-month">—</td>
                <td className="col-action">—</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* SECTION: PAYMENT HISTORY */}
        <div className="section-heading-row" style={{ marginTop: 28 }}>
          <h3>Payment History</h3>
        </div>

        <div className="fee-history-tiles-wrapper">
          {payments.length === 0 ? (
            <p className="empty-note">No payments recorded yet.</p>
          ) : (
            <div className="fee-history-tiles">
              {payments.map(p => {
                const refundedSoFar = Number(p.refundedAmount) || 0;
                const isFullyRefunded = p.status === "REFUNDED";
                const isPartiallyRefunded = p.status === "PARTIALLY_REFUNDED";
                const refundsForThis = refundsByPaymentId[p.id] || [];

                return (
                  <div key={p.id} className="fee-history-tile">
                    <div className="fht-row fht-top">
                      <span className="receipt-code">{p.receiptNumber || "—"}</span>
                      <span className={`fht-mode fht-mode-${(p.paymentMode || "").toLowerCase()}`}>{p.paymentMode || "—"}</span>
                    </div>

                    <div className="fht-amount">{fmt(p.amountPaid)}</div>
                    <div className="fht-month">{p.month} {p.year}</div>

                    <div className="fht-row fht-meta">
                      <span>📅 {p.paymentTimestamp ? new Date(p.paymentTimestamp).toLocaleDateString() : "—"}</span>
                      <span>🕒 {p.paymentTimestamp ? new Date(p.paymentTimestamp).toLocaleTimeString() : "—"}</span>
                    </div>

                    {p.collectedBy && (
                      <div className="fht-collected-by">Collected by {p.collectedBy}</div>
                    )}

                    {(p.fineAmount > 0 || p.discountAmount > 0 || p.extraChargeAmount > 0) && (
                      <div className="fht-adjustments">
                        {p.fineAmount > 0 && <span className="fht-chip fht-fine">Fine {fmt(p.fineAmount)}</span>}
                        {p.extraChargeAmount > 0 && <span className="fht-chip fht-extra">{p.extraChargeName || "Extra"} {fmt(p.extraChargeAmount)}</span>}
                        {p.discountAmount > 0 && <span className="fht-chip fht-discount">Discount {fmt(p.discountAmount)}</span>}
                      </div>
                    )}

                    {(isFullyRefunded || isPartiallyRefunded) && (
                      <div className="fht-adjustments">
                        <span className="fht-chip fht-refunded">
                          {isFullyRefunded ? "Refunded" : "Partially Refunded"} {fmt(refundedSoFar)}
                        </span>
                      </div>
                    )}

                    {refundsForThis.map(r => (
                      <div key={r.id} className="fht-refund-note">
                        {r.refundReceiptNumber}: {fmt(r.refundAmount)} by {r.refundedBy}
                        {r.reason ? ` — ${r.reason}` : ""}
                      </div>
                    ))}

                    <div className="fht-row fht-foot">
                      <span>Payable: {fmt(p.totalPayable)}</span>
                      <span className={p.remainingAmount > 0 ? "fht-due" : "fht-clear"}>
                        {p.remainingAmount > 0 ? `Due: ${fmt(p.remainingAmount)}` : "Cleared"}
                      </span>
                    </div>

                    {isAdmin() && !isFullyRefunded && (
                      <button
                        type="button"
                        className="fht-refund-btn no-print"
                        onClick={() => handleRefund(p)}
                      >
                        Refund
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION: AUDIT TRAIL — who collected/refunded what, and when the
            system auto-applied a late fine. Collapsed by default, loaded
            on demand so it doesn't cost an extra request on every visit. */}
        <div className="section-heading-row no-print" style={{ marginTop: 28 }}>
          <h3>Audit Trail</h3>
          <button
            type="button"
            className="chip-btn chip-btn-ghost"
            onClick={() => {
              const next = !showAudit;
              setShowAudit(next);
              if (next && auditLog.length === 0) fetchAuditLog();
            }}
          >
            {showAudit ? "Hide" : "Show"}
          </button>
        </div>

        {showAudit && (
          <div className="audit-log-list no-print">
            {auditLog.length === 0 ? (
              <p className="empty-note">No recorded actions yet.</p>
            ) : (
              auditLog.map(a => (
                <div key={a.id} className="audit-log-row">
                  <span className={`audit-action audit-action-${(a.action || "").toLowerCase()}`}>{a.action}</span>
                  <span className="audit-details">{a.details}</span>
                  <span className="audit-meta">
                    {a.performedBy} · {a.performedOn ? new Date(a.performedOn).toLocaleString() : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        <p className="ledger-footnote no-print">
          This is a system-generated statement. For an official signed receipt of a specific
          payment, use the Receipt link against a paid month above.
        </p>

      </div>
    </div>
  );
}
