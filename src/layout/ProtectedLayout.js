import React from "react";
import { Outlet, useLocation } from "react-router-dom";
// import { Topbar } from "../component/common/TopBar"; // Bỏ comment nếu bạn có Topbar
import Sidebar from "../component/common/SideBar";    // Đảm bảo đường dẫn đúng
import Footer from "../component/common/Footer";      // Đảm bảo đường dẫn đúng
import "../layout/ProtectedLayout.css"; // Import file CSS

const ProtectedLayout = () => {
  const location = useLocation();
  const hideLayoutPages = ["/login", "/register", "/forgotpass"]; // Các trang không dùng layout này
  const shouldHideLayout = hideLayoutPages.some((path) =>
    location.pathname.startsWith(path)
  );

  // --- Cấu hình kích thước (có thể đặt trong biến hoặc lấy từ theme/config) ---
  const topbarHeight = 0; // Đặt là 60 (ví dụ) nếu bạn có Topbar fixed, nếu không thì 0
  const sidebarWidth = 250; // Phải khớp với CSS width của .sidebar
  const footerHeight = 50;  // Chiều cao Footer (ước lượng hoặc lấy từ CSS)

  if (shouldHideLayout) {
    return <Outlet />; // Chỉ render nội dung của trang login, register, v.v.
  }

  return (
    <div className="layout-container">
      {/*
        <Topbar className="topbar" style={{ height: `${topbarHeight}px` }} />
      */}

      <div className="layout-content-wrapper"> {/* Thêm một wrapper nếu cần cho topbar */}
        <Sidebar
          className="sidebar"
          style={{
            width: `${sidebarWidth}px`,
            top: `${topbarHeight}px`, // Sidebar bắt đầu từ dưới Topbar
          }}
        />
        <main
          className="main-content"
          style={{
            marginLeft: `${sidebarWidth}px`,
            paddingTop: `${topbarHeight + 20}px`, // +20 là padding mong muốn
            paddingBottom: `${footerHeight + 20}px`, // +20 là padding mong muốn
          }}
        >
          <Outlet /> {/* Đây là nơi nội dung của các trang con sẽ được render */}
        </main>
      </div>

      <Footer
        className="site-footer"
        style={{
          height: `${footerHeight}px`,
          marginLeft: `${sidebarWidth}px`, // Footer cũng bắt đầu từ sau Sidebar
        }}
      />
    </div>
  );
};

export default ProtectedLayout;