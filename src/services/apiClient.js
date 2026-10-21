import axios from "axios";
import { getToken, clearToken } from "../auth/authStorage";
import { getDeviceId } from "../auth/deviceId";

// Use an environment variable, or fall back to localhost for development
const BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
});


apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Identifies this browser so the backend's device-approval check (see
  // AuthService.login) can recognize it on every request, not just login.
  config.headers["X-Device-Id"] = getDeviceId();
  // 💡 ADD THIS LINE to bypass Ngrok's warning page for API calls
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

// If the backend now rejects an existing token — session expired, or an
// Admin disabled this account/device since the token was issued — bounce
// straight to the login screen instead of leaving the user staring at a
// page full of failed requests and cryptic error toasts. Skip this for the
// login call itself (a wrong password is a 401 too, but should just show
// an inline error, not redirect away from the login page).
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const isLoginCall = error.config?.url?.includes("/auth/login");
    if (status === 401 && !isLoginCall) {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;