import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSchoolInfo } from "../../services/schoolInfoService";
import { getAllStudents } from "../../services/studentService";
import { useLanguage } from "../../i18n/LanguageContext";
import LanguageSwitcher from "../../i18n/LanguageSwitcher";
import ThemeSwitcher from "../../theme/ThemeSwitcher";
import Icon from "../../ui/icons";
import DESTINATIONS from "./destinations";
import useDebouncedValue from "../../ui/useDebouncedValue";

export default function TopBar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 180);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    getSchoolInfo().then(res => setSchoolInfo(res.data)).catch(() => {});
    getAllStudents("ACTIVE").then(res => setStudents(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return { pages: DESTINATIONS.slice(0, 6), people: [] };

    const pages = DESTINATIONS.filter(d =>
      d.label.toLowerCase().includes(q) || (d.keywords || "").includes(q)
    );

    const people = students
      .filter(s =>
        (s.name || "").toLowerCase().includes(q) ||
        String(s.registrationNumber).includes(q)
      )
      .slice(0, 5);

    return { pages, people };
  }, [debouncedQuery, students]);

  const go = (path) => {
    setQuery("");
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="topbar">
      <div className="topbar-brand" onClick={() => navigate("/")}>
        {schoolInfo?.logoBase64 ? (
          <>
            <img src={schoolInfo.logoBase64} alt="School logo" className="topbar-logo" style={{ objectFit: "contain" }} />
            <div>
              <p className="topbar-school">{schoolInfo.schoolName}</p>
              <p className="topbar-tagline">{t("topbar.tagline")}</p>
            </div>
          </>
        ) : (
          <div>
            <img
              src="/ednuvo_wordmark.png"
              srcSet="/ednuvo_wordmark.png 1x, /ednuvo_wordmark@2x.png 2x"
              alt="EdNuvo"
              style={{ height: 24, display: "block" }}
            />
            <p className="topbar-tagline">{t("topbar.tagline")}</p>
          </div>
        )}
      </div>

      <div className="topbar-search" ref={boxRef}>
        <span className="topbar-search-icon"><Icon.Search size={16} /></span>
        <input
          type="text"
          placeholder={t("topbar.searchPlaceholder")}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <span className="topbar-search-kbd">⌘K</span>

        {open && (
          <div className="topbar-results">
            {results.people.length > 0 && (
              <div className="topbar-results-group">
                <p className="topbar-results-label">Students</p>
                {results.people.map(s => (
                  <div key={s.registrationNumber} className="topbar-result-row" onClick={() => go(`/students/${s.registrationNumber}`)}>
                    <span className="topbar-result-icon"><Icon.GraduationCap size={16} /></span>
                    <div>
                      <p className="topbar-result-title">{s.name}</p>
                      <p className="topbar-result-sub">Reg {s.registrationNumber} • {s.currentClass}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="topbar-results-group">
              {results.people.length > 0 && <p className="topbar-results-label">Pages</p>}
              {results.pages.length === 0 && results.people.length === 0 && (
                <p className="topbar-empty">No matches. Try a student name or reg no.</p>
              )}
              {results.pages.map(d => {
                const DIcon = d.icon;
                return (
                  <div key={d.path} className="topbar-result-row" onClick={() => go(d.path)}>
                    <span className="topbar-result-icon"><DIcon size={16} /></span>
                    <p className="topbar-result-title">{d.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ThemeSwitcher />
      <LanguageSwitcher />

      <div className="topbar-user" title="Admin">A</div>
    </div>
  );
}
