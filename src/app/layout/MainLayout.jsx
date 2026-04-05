import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      <Sidebar />

      <div style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </div>

    </div>
  );
};

export default MainLayout;
