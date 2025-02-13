import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./common/SideBar";
import Footer from "./common/Footer";
import { Topbar } from "./common/TopBar";

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col h-screen bg-gray-100">
     
      {!isLoginPage && <Topbar className="w-full bg-white shadow-md p-4 flex items-center justify-between z-10" />}
    
      <div className="d-flex">
  {!isLoginPage && <Sidebar />}
  <div className="flex-grow-1 p-4">{children}</div>
</div>

      {!isLoginPage && <Footer className="bg-white p-4 shadow-md text-center" />}
    </div>
  );
};

export default Layout;
