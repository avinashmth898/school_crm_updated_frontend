/**
 * Input.jsx
 * ---------
 * Generic input component.
 */

const Input = ({ label, type = "text", value, onChange }) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label>
        {label}
        <br />
        <input
          type={type}
          value={value}
          onChange={onChange}
          style={{
            padding: "6px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </label>
    </div>
  );
};

export default Input;
