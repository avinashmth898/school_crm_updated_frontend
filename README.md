# 🎓 School CRM – Frontend

A modern and clean frontend for managing student data, fees, and dashboards.

---

## 🚀 Features

- 📊 Student Profile Dashboard
- 💰 Fee Management System
- 🧾 Fee Ledger (Month-wise tracking)
- 📄 Admission Confirmation (Printable)
- ⚠️ Defaulters Tracking
- 🔍 Fee Status (Paid / Partial / Due)
- 🖨️ Print Support

---

## 🧩 Modules

### 👨‍🎓 Student Profile
- View student details
- Attendance tracking
- Fee summary
- Navigation to dashboard & fee history

---

### 💰 Fee Management

#### 1. Pay Fee
- Select student
- Pay tuition / transport / annual fee
- Auto status update

#### 2. Check Fee
- View payment history
- Month-wise breakdown
- Payment timestamp

#### 3. Defaulters
- List of unpaid students
- Quick tracking of dues

---

### 📊 Fee Ledger

- Dynamic months (past + future)
- Auto calculation:
    - Total Amount
    - Paid Amount
    - Balance Due
- Status:
    - ✅ Paid
    - ⚠️ Partial
    - ❌ Due

---

## 🖥️ UI Highlights

- Clean ledger-style table (like Excel)
- Fixed column widths
- Compact rows for better visibility
- Dark + Light contrast for readability
- Minimal and distraction-free design

---

## ⚙️ Tech Stack

- React.js
- React Router
- CSS (Custom styling)
- Axios (API calls)

---


---

## 📌 Key Concepts

- Single source of truth from backend
- Dynamic rendering based on API data
- Reusable components
- Centralized status logic

---

## 🧠 Status Logic

PAID → paidAmount === totalAmount

PARTIAL → paidAmount < totalAmount

DUE → paidAmount === 0



---

## 🖨️ Print Support

- Admission confirmation printable
- Fee records printable
- Clean print layout

---

## 🚀 Future Improvements

- 📱 Mobile App (Android)
- 📊 Analytics Dashboard
- 💳 Online Payment Integration
- 📥 Export to Excel / PDF
- 🔔 Notifications

---

## 👨‍💻 Developer Notes

- Keep UI simple and data-focused
- Avoid unnecessary styling
- Maintain consistent column alignment
- Always validate API data before rendering

---

## 📌 Conclusion

This frontend provides a **clean, professional, and scalable interface** for managing school operations efficiently.

---