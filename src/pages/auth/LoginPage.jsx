/**
 * LoginPage.jsx
 * --------------
 * Presentational component.
 */

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
      <h2>School CRM Login</h2>

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
