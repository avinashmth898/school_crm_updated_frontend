/**
 * Button.jsx
 * ----------
 * Generic button used across the app.
 */

const Button = ({ label, onClick, type = "button", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 16px",
        cursor: "pointer",
        backgroundColor: "#1976d2",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
      }}
    >
      {label}
    </button>
  );
};

export default Button;
