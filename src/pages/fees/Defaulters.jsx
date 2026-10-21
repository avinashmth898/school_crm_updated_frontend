import "./Defaulters.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useLanguage } from "../../i18n/LanguageContext";
import EmptyState from "../../ui/EmptyState";
import Icon from "../../ui/icons";
import { useToast } from "../../ui/ToastContext";

export default function Defaulters() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  const classOrder = [
    "Nursery","LKG","UKG",
    "1st","2nd","3rd","4th","5th","6th","7th","8th"
  ];

  // 🔹 Fetch Defaulters
  useEffect(() => {
    fetchDefaulters();
  }, []);

  const fetchDefaulters = async (cls = "") => {
    try {
      setLoading(true);

      const url = cls
        ? `/defaulters?className=${cls}`
        : "/defaulters";

      const res = await apiClient.get(url);
      setStudents(res.data);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load defaulters list");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Filter
  const handleFilterChange = (cls) => {
    setClassFilter(cls);
    fetchDefaulters(cls);
  };

  // 🔹 Expand Row
  const toggleExpand = (regNo) => {
    setExpanded(expanded === regNo ? null : regNo);
  };

  return (
    <div className="defaulter-page">
      <div className="defaulter-card">

        <h2>🚨 {t("defaulters.heading")}</h2>

        {/* 🔍 Filter */}
        <div className="filter-row">
          <select
            value={classFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">{t("common.allClasses")}</option>
            {classOrder.map(cls => (
              <option key={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* ⏳ Loading */}
        {loading && <p className="loading">{t("defaulters.loading")}</p>}

        {/* 📋 Table */}
        {!loading && students.length > 0 && (
          <div className="table-wrapper">
            <table className="defaulter-table">
              <thead>
                <tr>
                  <th>{t("defaulters.regNo")}</th>
                  <th>{t("defaulters.name")}</th>
                  <th>{t("defaulters.class")}</th>
                  <th>{t("defaulters.mobile")}</th>
                  <th>{t("defaulters.dueMonths")}</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s) => (
                  <>
                    {/* MAIN ROW */}
                    <tr
                      key={s.registrationNumber}
                      className="clickable-row"
                      onClick={() => toggleExpand(s.registrationNumber)}
                    >
                      <td>{s.registrationNumber}</td>
                      <td>{s.name}</td>
                      <td>{s.currentClass}</td>
                      <td>{s.mobileNumber}</td>
                      <td className="due">
                        🔴 {s.dueCount} {t("defaulters.months")}
                      </td>
                      <td>
                        <button
                          className="defaulter-pay-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/students/${s.registrationNumber}/pay-fee`);
                          }}
                        >
                          💳 Pay
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROW */}
                    {expanded === s.registrationNumber && (
                      <tr className="expanded-row">
                        <td colSpan="6">
                          <div className="expanded-content">

                            <p><strong>{t("defaulters.dueMonths")}:</strong></p>

                            <div className="months-list">
                              {s.dueMonths.map((m, i) => (
                                <span key={i} className="month-chip">
                                  {m}
                                </span>
                              ))}
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty */}
        {!loading && students.length === 0 && (
          <EmptyState icon={Icon.ClipboardList} message={t("defaulters.empty")} />
        )}

      </div>
    </div>
  );
}