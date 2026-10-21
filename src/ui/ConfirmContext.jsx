import { createContext, useCallback, useContext, useRef, useState } from "react";
import "./confirm.css";

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  // { message, confirmLabel, cancelLabel, danger, input: null | { placeholder, defaultValue, type, required } }
  const [state, setState] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const resolver = useRef(null);

  const confirm = useCallback((options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    setState({
      message: opts.message,
      confirmLabel: opts.confirmLabel || "Confirm",
      cancelLabel: opts.cancelLabel || "Cancel",
      danger: !!opts.danger,
      input: null,
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  // Text-input variant of confirm() — replaces window.prompt(). Resolves
  // with the typed string, or null if cancelled (same null-means-cancelled
  // contract window.prompt had, so call sites barely had to change).
  const prompt = useCallback((options) => {
    const opts = typeof options === "string" ? { message: options } : options;
    setInputValue(opts.defaultValue || "");
    setState({
      message: opts.message,
      confirmLabel: opts.confirmLabel || "OK",
      cancelLabel: opts.cancelLabel || "Cancel",
      danger: !!opts.danger,
      input: {
        placeholder: opts.placeholder || "",
        type: opts.type || "text",
        required: opts.required !== false, // by default, empty input can't be submitted
      },
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value) => {
    setState(null);
    if (resolver.current) {
      resolver.current(value);
      resolver.current = null;
    }
  };

  const submitPrompt = () => {
    if (state?.input?.required && !inputValue.trim()) return;
    settle(inputValue);
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt }}>
      {children}
      {state && (
        <div className="confirm-overlay" onMouseDown={() => settle(state.input ? null : false)}>
          <div className="confirm-panel" onMouseDown={(e) => e.stopPropagation()}>
            <p className="confirm-message">{state.message}</p>

            {state.input && (
              <input
                className="confirm-input"
                type={state.input.type}
                placeholder={state.input.placeholder}
                value={inputValue}
                autoFocus
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitPrompt();
                  if (e.key === "Escape") settle(null);
                }}
              />
            )}

            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={() => settle(state.input ? null : false)}
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                className={state.danger ? "confirm-btn-danger" : "confirm-btn-primary"}
                onClick={() => (state.input ? submitPrompt() : settle(true))}
                autoFocus={!state.input}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

// Returns an async function: `const ok = await confirm("Delete this exam?")`
// or `await confirm({ message, confirmLabel: "Delete", danger: true })`.
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    // Outside the provider, fall back to the native confirm rather than
    // silently always-true/always-false, which could let a destructive
    // action through unconfirmed.
    return (options) => {
      const msg = typeof options === "string" ? options : options.message;
      return Promise.resolve(window.confirm(msg));
    };
  }
  return ctx.confirm;
};

// Text-input replacement for window.prompt(): `const v = await prompt("New password:")`
// or `await prompt({ message, placeholder, defaultValue })`. Resolves to the
// typed string, or null if cancelled.
export const usePrompt = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return (options) => {
      const msg = typeof options === "string" ? options : options.message;
      const defaultValue = typeof options === "string" ? undefined : options.defaultValue;
      return Promise.resolve(window.prompt(msg, defaultValue));
    };
  }
  return ctx.prompt;
};
