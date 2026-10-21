import { useState } from "react";
import { login } from "../../services/authService";
import { setSession } from "../../auth/authStorage";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../ui/ToastContext";
import "./Login.css";

const LoginContainer = () => {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(username, password);
      setSession(res);
      try {
        new Audio("/login-chime.mp3").play().catch(() => {});
      } catch {
        // ignore — audio is a nice-to-have, never block login on it
      }
      navigate("/");
    } catch (err) {
      // Show the backend's actual reason (wrong password, device pending
      // approval, account disabled, etc.) instead of a generic message —
      // these mean very different things to the person logging in.
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <img
          src="/ednuvo_wordmark.png"
          srcSet="/ednuvo_wordmark.png 1x, /ednuvo_wordmark@2x.png 2x"
          alt="EdNuvo"
          style={{ height: 40, display: "block", margin: "0 auto 12px" }}
        />

        <p className="subtitle">Admin Portal</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <span className="footer-text">Secure • Fast • Reliable</span>
      </div>
    </div>
  );
};

export default LoginContainer;
