// A persistent, opaque ID for THIS browser profile, generated once and
// kept in localStorage. Sent on every request (see apiClient.js) so the
// backend can tell "same device logging in again" from "brand new
// device" — new devices need Admin approval (see AuthService.login on
// the backend, and the Admin > Devices page on the frontend).
//
// This is deliberately simple (not a hardware fingerprint): clearing site
// data / using a different browser creates a "new" device that needs
// re-approval, which is the intended behavior, not a bug.

const DEVICE_ID_KEY = "schoolcrm_device_id";

function generateId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // Fallback for older browsers without crypto.randomUUID.
  return "dev-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// Rough, human-readable guess shown to Admins in the Devices panel —
// doesn't need to be precise, just enough to tell devices apart.
export function getDeviceLabel() {
  const ua = navigator.userAgent || "";

  let browser = "Unknown browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "Unknown OS";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
}
