import { useEffect, useRef, useState } from "react";
import { THEMES, useTheme } from "./ThemeContext";
import "./ThemeSwitcher.css";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = THEMES.find(t => t.code === theme) || THEMES[0];

  return (
    <div className="theme-switcher" ref={boxRef}>
      <button
        type="button"
        className="theme-switcher-btn"
        title="Theme"
        onClick={() => setOpen(o => !o)}
      >
        <span className="theme-switcher-icon">{current.icon}</span>
        <span className="theme-switcher-current">{current.label}</span>
      </button>

      {open && (
        <div className="theme-switcher-list">
          {THEMES.map(th => (
            <div
              key={th.code}
              className={`theme-switcher-item${th.code === theme ? " active" : ""}`}
              onClick={() => { setTheme(th.code); setOpen(false); }}
            >
              <span className="theme-switcher-item-icon">{th.icon}</span>
              <span className="theme-switcher-item-label">{th.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
