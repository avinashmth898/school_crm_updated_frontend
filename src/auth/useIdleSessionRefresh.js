import { useEffect, useRef } from "react";
import apiClient from "../services/apiClient";
import { setSession } from "./authStorage";

// Implements the "10-minute idle timeout" product rule without cutting off
// an actively-working user: the backend's JWT itself expires after 10
// minutes (jwt.expiration, see application.properties), and this hook
// silently calls POST /api/auth/refresh — which only succeeds against an
// already-valid, unexpired token — every couple of minutes AS LONG AS the
// user has actually interacted with the page since the last check. Someone
// who walks away gets no more refresh calls, so their token simply expires
// on schedule and apiClient's 401 interceptor redirects them to /login.
//
// Mount this once, inside the authenticated part of the app only (see
// MainLayout.jsx) — it has no effect and does nothing while logged out.
const CHECK_INTERVAL_MS = 2 * 60 * 1000; // well under the 10-minute window
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

export default function useIdleSessionRefresh() {
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
    };
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, markActive, { passive: true })
    );

    const interval = setInterval(async () => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= CHECK_INTERVAL_MS) {
        // No activity since the last check — deliberately do NOT refresh.
        // Letting the token expire naturally is what makes this an idle
        // timeout rather than an unconditional "stay logged in forever."
        return;
      }
      try {
        const res = await apiClient.post("/auth/refresh");
        setSession(res.data);
      } catch {
        // Token was already expired/invalid by the time this ran — the
        // apiClient response interceptor already handles redirecting to
        // /login on the 401, nothing extra to do here.
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, markActive));
      clearInterval(interval);
    };
  }, []);
}
