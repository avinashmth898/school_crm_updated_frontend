import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "./languages";
import { useLanguage } from "./LanguageContext";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="lang-switcher" ref={boxRef}>
      <button
        type="button"
        className="lang-switcher-btn"
        title={t("topbar.language")}
        onClick={() => setOpen(o => !o)}
      >
        <span className="lang-switcher-icon">🌐</span>
        <span className="lang-switcher-current">{current.native}</span>
      </button>

      {open && (
        <div className="lang-switcher-list">
          {LANGUAGES.map(l => (
            <div
              key={l.code}
              className={`lang-switcher-item${l.code === language ? " active" : ""}`}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
            >
              <span className="lang-switcher-native">{l.native}</span>
              <span className="lang-switcher-english">{l.english}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
