import { createContext, useCallback, useContext, useRef, useState } from "react";
import Icon from "./icons";
import "./toast.css";

const ToastContext = createContext(null);

let idSeq = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback((message, type = "info", duration = 4000) => {
    const id = ++idSeq;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => remove(id), duration);
    return id;
  }, [remove]);

  const api = {
    success: (msg, duration) => push(msg, "success", duration),
    error: (msg, duration) => push(msg, "error", duration),
    info: (msg, duration) => push(msg, "info", duration),
  };

  const ICONS = {
    success: Icon.ClipboardList,
    error: Icon.AlertTriangle,
    info: Icon.Bell,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => {
          const TIcon = ICONS[t.type] || Icon.Bell;
          return (
            <div key={t.id} className={`toast toast-${t.type}`} role="status">
              <span className="toast-icon"><TIcon size={16} /></span>
              <p className="toast-message">{t.message}</p>
              <button
                type="button"
                className="toast-close"
                aria-label="Dismiss"
                onClick={() => remove(t.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// Falls back to a no-op-safe console logger if used outside the provider
// (e.g. a stray import during refactors) instead of throwing — a toast
// failing silently is far better than crashing the page it's reporting on.
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: (m) => console.log("[toast:success]", m),
      error: (m) => console.error("[toast:error]", m),
      info: (m) => console.log("[toast:info]", m),
    };
  }
  return ctx;
};
