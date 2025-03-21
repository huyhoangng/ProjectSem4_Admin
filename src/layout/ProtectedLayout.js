import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Topbar } from "../component/common/TopBar";  
import Sidebar from "../component/common/SideBar";
import Footer from "../component/common/Footer";

const ProtectedLayout = () => {
  const location = useLocation();
  const hideLayoutPages = ["/login", "/register", "/forgotpass"];

  // Kiểm tra nếu pathname bắt đầu bằng trang không cần layout
  const shouldHideLayout = hideLayoutPages.some((path) => location.pathname.startsWith(path));

  return shouldHideLayout ? (
    <Outlet />
  ) : (
    <div className="layout-container">
      <Topbar />
      <div className="layout-content">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProtectedLayout;
