/**
 * LoginPage.jsx
 * --------------
 * Presentational component.
 */
import EdNuvoLogo from "../../ui/EdNuvoLogo";

const LoginPage = ({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}) => {
  return (
    <div style={{ maxWidth: "400px", margin: "100px auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <EdNuvoLogo size={36} />
        <h2 style={{ margin: 0 }}>EdNuvo Login</h2>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label><br />
          <input
            type="text"
            value={username}
            onChange={onUsernameChange}
          />
        </div>

        <br />

        <div>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={onPasswordChange}
          />
        </div>

        <br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
