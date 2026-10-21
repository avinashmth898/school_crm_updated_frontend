import "./PayFee.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { getAllStudents } from "../../services/studentService";
import { useLanguage } from "../../i18n/LanguageContext";

// Browse/search students, then hand off to the real checkout screen
// (FeePaymentCheckoutPage, mounted at /students/:regNo/pay-fee) which
// handles month selection, batch payment, and receipts.
export default function PayFee() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [classes, setClasses] = useState([]);

  const [regSearch, setRegSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  useEffect(() => {
    // Real, active roster — same source every other page uses.
    getAllStudents("ACTIVE")
      .then(res => {
        setStudents(res.data || []);
        setFiltered(res.data || []);
      })
      .catch(console.error);

    // Real class list — same source Class Setup uses — instead of a
    // hardcoded list that can silently drift out of sync.
    apiClient.get("/classes")
      .then(res => setClasses(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    let result = students;

    if (regSearch) {
      result = result.filter(s =>
        s.registrationNumber.toString().includes(regSearch)
      );
    }

    if (nameSearch) {
      const q = nameSearch.toLowerCase();
      result = result.filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.fatherName || "").toLowerCase().includes(q)
      );
    }

    if (classFilter) {
      result = result.filter(s => s.currentClass === classFilter);
    }

    setFiltered(result);
  }, [regSearch, nameSearch, classFilter, students]);

  return (
    <div className="student-bg">
      <div className="profile-card wide">
        <h2>{t("fees.tabPay")}</h2>

        {/* 🔍 Search */}
        <div className="filter-row">
          <input
            placeholder={t("fees.searchRegNo")}
            value={regSearch}
            onChange={(e) => setRegSearch(e.target.value)}
          />
          <input
            placeholder="Student or father's name"
            title="Searches both the student's name and father's name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="">{t("common.allClasses")}</option>
            {classes.map(c => (
              <option key={c.id} value={c.className}>{c.className}</option>
            ))}
          </select>
        </div>

        {/* 📋 Student List — the full active roster (filtered by the
            search/class controls above), not just the first few rows. */}
        <p className="fee-table-count">
          {filtered.length} student{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="fee-table-scroll">
          <table className="fee-table">
            <thead>
              <tr>
                <th>{t("fees.regNo")}</th>
                <th>{t("fees.name")}</th>
                <th>{t("fees.class")}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(student => (
                <tr
                  key={student.registrationNumber}
                  onClick={() =>
                    navigate(`/students/${student.registrationNumber}/pay-fee`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{student.registrationNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.currentClass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
