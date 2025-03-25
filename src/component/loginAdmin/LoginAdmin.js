import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // Đúng
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Trạng thái loading

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Đang gửi:", email, password); // Kiểm tra dữ liệu nhập vào

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và password!");
      return;
    }

    try {
      const response = await axios.post(
        "http://54.251.220.228:8080/trainingSouls/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Phản hồi từ server:", response.data);
      alert("Đăng nhập thành công!");
      if (response.status === 200) {
        const token = response.data.result.token;
        sessionStorage.setItem("token", token);
        console.log("Token đã lưu:", token);
        alert("Đăng nhập thành công!");

        navigate("/dashboard"); // Kiểm tra nếu trang không đổi
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response?.data || error);
      alert("Email hoặc mật khẩu không đúng!");
    }
  };




  return (
    <div className="bg-gradient-primary min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>
                      <form className="user" onSubmit={handleLogin}>
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control form-control-user"
                            placeholder="Enter Email..." // Cập nhật placeholder cho đúng
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} // Đúng
                            required
                          />

                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Đảm bảo cập nhật đúng state
                            required
                          />

                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input type="checkbox" className="custom-control-input" id="customCheck" />
                            <label className="custom-control-label" htmlFor="customCheck">
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-user btn-block" disabled={loading}>
                          {loading ? "Logging in..." : "Login"}
                        </button>
                        <hr />
                        <button type="button" className="btn btn-google btn-user btn-block">
                          <FaGoogle className="mr-2" /> Login with Google
                        </button>
                        <button type="button" className="btn btn-facebook btn-user btn-block">
                          <FaFacebookF className="mr-2" /> Login with Facebook
                        </button>
                      </form>
                      <hr />
                      <div className="text-center">
                        <a className="small" href="/forgotpass">
                          Forgot Password?
                        </a>
                      </div>
                      <div className="text-center">
                        <a className="small" href="/register">
                          Create an Account!
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
