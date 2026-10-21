import { useEffect, useState } from "react";

// Returns `value`, but only after it has stopped changing for `delayMs`.
// Used for search inputs that filter an in-memory list on every
// keystroke — harmless today, but worth smoothing out before a school's
// student list grows large enough for it to matter.
export default function useDebouncedValue(value, delayMs = 180) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
