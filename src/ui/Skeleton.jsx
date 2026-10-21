import "./skeleton.css";

// A single shimmering placeholder bar/block. Pass `width`/`height` as
// CSS values ("100%", "24px", ...) and an optional `circle` for avatars.
const Skeleton = ({ width = "100%", height = "14px", circle = false, style, className = "" }) => (
  <span
    className={`skeleton ${circle ? "skeleton-circle" : ""} ${className}`}
    style={{ width, height, ...style }}
  />
);

export default Skeleton;
