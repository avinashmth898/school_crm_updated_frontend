import { useState } from "react";
import { login } from "../../services/authService";
import { setToken } from "../../auth/authStorage";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LoginContainer = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(username, password);
      setToken(res.token);
      navigate("/");
    } catch (err) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="title">School name goes here</h2>

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
