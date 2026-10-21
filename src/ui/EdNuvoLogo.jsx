/**
 * EdNuvoLogo.jsx
 * --------------
 * Minimal EdNuvo brandmark as inline SVG (so it inherits theme colors
 * and renders crisply at any size). `size` is in px; defaults to 40.
 */
const EdNuvoLogo = ({ size = 40, style, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
    {...rest}
  >
    <rect width="48" height="48" rx="12" fill="var(--accent-600, #185FA5)" />
    <text
      x="24"
      y="33"
      textAnchor="middle"
      fontFamily="Helvetica, Arial, sans-serif"
      fontWeight="700"
      fontSize="24"
      fill="#FFFFFF"
    >
      e
    </text>
    <circle cx="36" cy="12" r="5" fill="var(--teal-400, #1D9E75)" />
  </svg>
);

export default EdNuvoLogo;
