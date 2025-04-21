import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaLaughWink, FaTachometerAlt, FaCog, FaWrench, FaFolder, FaChartArea, FaTable, FaDumbbell, FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { GiMuscleUp } from "react-icons/gi";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Giả lập trạng thái đăng nhập
  const [showUserMenu, setShowUserMenu] = useState(false);
  const adminName = "Admin1"; // Giả lập tên admin

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Thêm logic logout nếu cần
  };

  return (
    <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${collapsed ? "toggled" : ""}`} id="accordionSidebar">
      {/* Sidebar - Brand */}
      <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
        <div className="sidebar-brand-icon rotate-n-15">
          <GiMuscleUp /> {/* Icon tay cơ bắp */}
        </div>
        <div className="sidebar-brand-text mx-3">Training Soul</div>
      </Link>

      <hr className="sidebar-divider my-0" />

      {/* Dashboard */}
      <li className="nav-item active">
        <Link className="nav-link" to="/dashboard">
          <FaTachometerAlt />
          <span> Dashboard</span>
        </Link>
      </li>

      <hr className="sidebar-divider" />

      {/* Components Menu */}
      <li className="nav-item">
        <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseComponents">
          <FaCog />
          <span> User Management</span>
        </a>
        <div id="collapseComponents" className="collapse">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Custom User:</h6>
            <Link className="collapse-item" to="/usermanagement">Account User</Link>
            <Link className="collapse-item" to="/cards">Cards</Link>
          </div>
        </div>
      </li>

      {/* Utilities Menu */}
      <li className="nav-item">
        <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities">
          <FaWrench />
          <span> Packages</span>
        </a>
        <div id="collapseUtilities" className="collapse">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Custom package:</h6>
            <Link className="collapse-item" to="/packages">PackageList</Link>
            <Link className="collapse-item" to="/utilities-border">Challenger</Link>
          </div>
        </div>
      </li>

      <hr className="sidebar-divider" />

      {/* Pages Menu */}
      <li className="nav-item">
        <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapsePages">
          <FaFolder />
          <span> Pages</span>
        </a>
        <div id="collapsePages" className="collapse">
          <div className="bg-white py-2 collapse-inner rounded">
            <h6 className="collapse-header">Posts Screens:</h6>
            <Link className="collapse-item" to="/posts">All Post</Link>
            <Link className="collapse-item" to="/register">Classes</Link>
          </div>
        </div>
      </li>

      {/* Charts */}
      <li className="nav-item">
        <Link className="nav-link" to="/yourRank">
          <FaChartArea />
          <span> Rank </span>
        </Link>
      </li>

      {/* Workout */}
      <li className="nav-item">
        <Link className="nav-link" to="/exercise">
          <FaDumbbell /> {/* Icon Workout */}
          <span> Workout </span>
        </Link>
      </li>

      {/* Admin Management */}
      <li className="nav-item">
        <Link className="nav-link" to="/adminmanager">
          <FaTable />
          <span> Admin Management</span>
        </Link>
      </li>


           {/* User Profile & Logout/Login */}
     
      <hr className="sidebar-divider" />
{isLoggedIn ? (
  <li className="nav-item">
    <a
      className="nav-link collapsed text-light d-flex align-items-center justify-content-center"
      href="#"
      data-toggle="collapse"
      data-target="#collapseUserMenu"
      aria-expanded="false"
      aria-controls="collapseUserMenu"
    >
      <img
        className="img-profile rounded-circle"
        src="img/undraw_profile.svg"
        alt="profile"
        style={{ width: "40px", height: "40px" }}
      />
    </a>
    <div id="collapseUserMenu" className="collapse">
      <div className="bg-white py-2 collapse-inner rounded">
        <button className="collapse-item btn btn-link text-dark w-100 text-left" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
          Logout
        </button>
      </div>
    </div>
  </li>
) : (
  <li className="nav-item">
    <Link className="nav-link text-light d-flex align-items-center justify-content-center" to="/login">
      <FaSignInAlt />
    </Link>
  </li>
)}



      <hr className="sidebar-divider d-none d-md-block" />

      {/* Toggle Sidebar Button */}
      <div className="text-center d-none d-md-inline">
        <button className="rounded-circle border-0" onClick={() => setCollapsed(!collapsed)}>
          <i className={`fas ${collapsed ? "fa-arrow-right" : "fa-arrow-left"}`}></i>
        </button>
      </div>

 
     
    </ul>
  );
};

export default Sidebar;
