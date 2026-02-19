/**
 * PageLayout.jsx
 * ---------------
 * Common layout for pages.
 */

const PageLayout = ({ title, children }) => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>{title}</h1>
      <hr />
      <div>{children}</div>
    </div>
  );
};

export default PageLayout;
