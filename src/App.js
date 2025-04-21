import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import "../src/assets/css/sb-admin-2.css";
import "../src/assets/css/sb-admin-2.min.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPage from "./pages/ForgotPage";
import Admin from "./pages/Admin";
import ProtectedLayout from "./layout/ProtectedLayout";
import PackagePage from "./pages/PackagePage";
import PostPage from "./pages/PostPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import PackageManagement from "./component/packagePage/PackageList";
import ExercisePage from "./pages/ExercisePage";
import IndexPage from "./pages/IndexPage";
import RankPage from "./pages/RankPage";

const RedirectToLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login"); // Chuyển hướng đến login khi trang load
  }, [navigate]);

  return null;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RedirectToLogin />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpass" element={<ForgotPage />} />

        {/* Các trang có layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/adminmanager" element={<Admin />} />
          <Route path="/packages" element={<PackagePage />} />
          <Route path="/posts" element={<PostPage />} />
          <Route path="/usermanagement" element={<UsersManagementPage />} />
          <Route path="/admin/training-packages" element={<PackageManagement/>} />
<Route path="/admin/training-packages/new" element={<PackageManagement />} />
<Route path="/admin/training-packages/edit/:id" element={<PackageManagement />} />
<Route path="/exercise" element={<ExercisePage/>}/>
<Route path="/dashboard" element={<IndexPage/>}/>
<Route path="/yourRank" element={<RankPage/>}/>

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
