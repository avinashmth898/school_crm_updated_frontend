import { useState } from "react";
import "./fees.css";

export default function PayFee() {
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);

  const isUPI = paymentMode === "UPI";
  const isValid = amount && (!isUPI || utr.length > 4);

  const receiptNo = "RCPT-" + Math.floor(Math.random() * 100000);

  return (
    <div className="fee-page">

      {/* PAY FORM */}
      {!showReceipt && (
        <div className="fee-card">
          <h2>💰 Pay Fee</h2>

          <label>Student</label>
          <select>
            <option>Avinash Kumar (UKG)</option>
            <option>Abhijeet Kumar (UKG)</option>
            <option>Ravi Kumar (UKG)</option>
          </select>

          <label>Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />

          <label>Payment Mode</label>
          <div className="payment-toggle">
            <button
              className={paymentMode === "CASH" ? "active" : ""}
              onClick={() => setPaymentMode("CASH")}
            >
              Cash
            </button>
            <button
              className={paymentMode === "UPI" ? "active" : ""}
              onClick={() => setPaymentMode("UPI")}
            >
              UPI
            </button>
          </div>

          {isUPI && (
            <>
              <label>UPI UTR Code</label>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="Enter UTR"
              />
            </>
          )}

          <button
            className="pay-btn"
            disabled={!isValid}
            onClick={() => setShowReceipt(true)}
          >
            Pay & Generate Receipt
          </button>
        </div>
      )}

      {/* RECEIPT */}
      {showReceipt && (
        <div className="receipt-wrapper">

          <div className="print-bar">
            <button className="icon-btn" onClick={() => window.print()}>
              ⬇ Download / Print Receipt
            </button>
          </div>

          <div className="receipt-card" id="print-area">

            <div className="receipt-header">
              <h1>Rashtra Bharti Public School</h1>
              <p>Official Fee Receipt</p>
            </div>

            <hr />

            <div className="receipt-info">
              <p><strong>Receipt No:</strong> {receiptNo}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>

            <div className="receipt-body">
              <p><strong>Student Name:</strong> Avinash Kumar</p>
              <p><strong>Class:</strong> UKG</p>
              <p><strong>Payment Mode:</strong> {paymentMode}</p>
              {isUPI && <p><strong>UTR:</strong> {utr}</p>}
              <p className="amount"><strong>Amount Paid:</strong> ₹ {amount}</p>
            </div>

            <div className="receipt-footer">
              <div>
                <p>____________________</p>
                <span>Authorized Signatory</span>
              </div>

              <div>
                <p>School Seal</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
