// Spread onto a clickable <div> that acts like a button (the "tile"
// pattern used across Dashboard/Command Centre/EdNuvo) so it's reachable
// by Tab and activatable with Enter/Space, not just a mouse click.
export const tileProps = (onClick) => ({
  role: "button",
  tabIndex: 0,
  onClick,
  onKeyDown: (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e);
    }
  },
});
