import "./emptyState.css";

// A consistent "nothing here" placeholder — an icon, a one-line message,
// and an optional action — used instead of a bare blank area or a plain
// line of text wherever a list/table can come back with zero results.
const EmptyState = ({ icon: IconComp, message, action }) => (
  <div className="empty-state">
    {IconComp && (
      <div className="empty-state-icon">
        <IconComp size={26} />
      </div>
    )}
    <p className="empty-state-message">{message}</p>
    {action}
  </div>
);

export default EmptyState;
