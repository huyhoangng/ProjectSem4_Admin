import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../src/assets/css/sb-admin-2.css";
import "../src/assets/css/sb-admin-2.min.css";
import Layout from "./Layout";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPage from "./pages/ForgotPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgotpass" element={<ForgotPage/>}/>
        <Route path="/" element={<Layout><IndexPage /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
