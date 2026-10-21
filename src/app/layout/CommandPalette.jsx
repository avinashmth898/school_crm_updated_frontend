import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStudents } from "../../services/studentService";
import DESTINATIONS from "./destinations";
import Icon from "../../ui/icons";
import useDebouncedValue from "../../ui/useDebouncedValue";
import "./commandPalette.css";

// Global Cmd/Ctrl+K launcher. Reuses the same destination list and
// student lookup as the top bar's inline search, just promoted to a
// keyboard shortcut so navigation doesn't require reaching for the mouse
// or scrolling up to the top bar first.
const CommandPalette = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);
  const [activeIndex, setActiveIndex] = useState(0);
  const [students, setStudents] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      getAllStudents("ACTIVE").then((res) => setStudents(res.data || [])).catch(() => {});
      setQuery("");
      setActiveIndex(0);
      // Focus after the overlay has actually mounted.
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const pages = !q
      ? DESTINATIONS.slice(0, 8)
      : DESTINATIONS.filter(
          (d) => d.label.toLowerCase().includes(q) || (d.keywords || "").includes(q)
        );
    const people = !q
      ? []
      : students
          .filter(
            (s) =>
              (s.name || "").toLowerCase().includes(q) ||
              String(s.registrationNumber).includes(q)
          )
          .slice(0, 5);
    return { pages, people };
  }, [debouncedQuery, students]);

  const flatItems = useMemo(() => {
    const peopleItems = results.people.map((s) => ({
      type: "student",
      key: `s-${s.registrationNumber}`,
      label: s.name,
      sub: `Reg ${s.registrationNumber} · ${s.currentClass}`,
      go: () => navigate(`/students/${s.registrationNumber}`),
    }));
    const pageItems = results.pages.map((d) => ({
      type: "page",
      key: `p-${d.path}`,
      label: d.label,
      icon: d.icon,
      go: () => navigate(d.path),
    }));
    return [...peopleItems, ...pageItems];
  }, [results, navigate]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const close = () => setOpen(false);

  const go = (item) => {
    if (!item) return;
    item.go();
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flatItems[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onMouseDown={close}>
      <div className="cmdk-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <Icon.Search size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, or jump to a page…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <span className="cmdk-hint">Esc</span>
        </div>

        <div className="cmdk-results">
          {flatItems.length === 0 && (
            <p className="cmdk-empty">No matches. Try a student name, reg no, or a page.</p>
          )}

          {results.people.length > 0 && <p className="cmdk-group-label">Students</p>}
          {flatItems.map((item, i) => (
            <div
              key={item.key}
              className={`cmdk-row ${i === activeIndex ? "active" : ""}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => go(item)}
            >
              <span className="cmdk-row-icon">
                {item.icon ? <item.icon size={16} /> : <Icon.GraduationCap size={16} />}
              </span>
              <div>
                <p className="cmdk-row-title">{item.label}</p>
                {item.sub && <p className="cmdk-row-sub">{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="cmdk-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
