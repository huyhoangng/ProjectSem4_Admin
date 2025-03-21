import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
    const [showAlerts, setShowAlerts] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".dropdown-menu") && !event.target.closest(".nav-link")) {
                setShowAlerts(false);
                setShowMessages(false);
                setShowUserMenu(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Xử lý logout
    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/trainingSouls/auth/logout", {}, { withCredentials: true });
            alert("Đăng xuất thành công!");
            navigate("/login"); // Chuyển hướng về trang đăng nhập
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            alert("Đăng xuất thất bại!");
        }
    };

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow ml-0 mr-0">


            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                <i className="fa fa-bars"></i>
            </button>

            <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                <div className="input-group">
                    <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="button">
                            <i className="fas fa-search fa-sm"></i>
                        </button>
                    </div>
                </div>
            </form>

            <ul className="navbar-nav ml-auto">
                {/* Alerts Dropdown */}
                <li className="nav-item dropdown no-arrow mx-1">
                    <a className="nav-link dropdown-toggle" href="#" onClick={(e) => { e.preventDefault(); setShowAlerts(!showAlerts); }}>
                        <i className="fas fa-bell fa-fw"></i>
                        <span className="badge badge-danger badge-counter">3+</span>
                    </a>
                    {showAlerts && (
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show" style={{ position: "absolute", zIndex: 1000 }}>
                            <h6 className="dropdown-header">Alerts Center</h6>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="mr-3">
                                    <div className="icon-circle bg-primary">
                                        <i className="fas fa-file-alt text-white"></i>
                                    </div>
                                </div>
                                <div>
                                    <div className="small text-gray-500">December 12, 2019</div>
                                    A new monthly report is ready to download!
                                </div>
                            </a>
                        </div>
                    )}
                </li>

                {/* Messages Dropdown */}
                <li className="nav-item dropdown no-arrow mx-1">
                    <a className="nav-link dropdown-toggle" href="#" onClick={(e) => { e.preventDefault(); setShowMessages(!showMessages); }}>
                        <i className="fas fa-envelope fa-fw"></i>
                        <span className="badge badge-danger badge-counter">7</span>
                    </a>
                    {showMessages && (
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show" style={{ position: "absolute", zIndex: 1000 }}>
                            <h6 className="dropdown-header">Message Center</h6>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="dropdown-list-image mr-3">
                                    <img className="rounded-circle" src="img/undraw_profile_1.svg" alt="profile" />
                                    <div className="status-indicator bg-success"></div>
                                </div>
                                <div>
                                    <div className="text-truncate">Hi there! I need some help.</div>
                                    <div className="small text-gray-500">Emily Fowler · 58m</div>
                                </div>
                            </a>
                        </div>
                    )}
                </li>

                <div className="topbar-divider d-none d-sm-block"></div>

                {/* User Dropdown */}
                <li className="nav-item dropdown no-arrow">
                    <a className="nav-link dropdown-toggle" href="#" onClick={(e) => { e.preventDefault(); setShowUserMenu(!showUserMenu); }}>
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin1</span>
                        <img className="img-profile rounded-circle" src="img/undraw_profile.svg" alt="profile" />
                    </a>
                    {showUserMenu && (
                        <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show" style={{ position: "absolute", zIndex: 1000 }}>
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                Profile
                            </a>
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                                Settings
                            </a>
                            <a className="dropdown-item" href="#">
                                <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                                Activity Log
                            </a>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                Logout
                            </button>
                        </div>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export { Topbar };
