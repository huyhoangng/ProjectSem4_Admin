import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

// --- CSS cơ bản cho SB Admin 2 (Nếu chưa có, bạn có thể cần thêm) ---
// Thông thường, template SB Admin 2 đã có sẵn CSS cho .bg-login-image
// nhưng chúng ta sẽ ghi đè nó bằng inline style.
// Bạn cũng có thể tạo file CSS riêng (ví dụ: LoginAdmin.css) và import vào đây.
// import './LoginAdmin.css'; // Nếu dùng file CSS riêng

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Bắt đầu loading
    console.log("Đang gửi:", email, password);

    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và password!");
      setLoading(false); // Dừng loading
      return;
    }

    try {
      const response = await axios.post(
        "http://54.251.220.228:8080/trainingSouls/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Phản hồi từ server:", response.data);

      if (response.status === 200 && response.data?.result?.token) { // Kiểm tra kỹ hơn response
        const token = response.data.result.token;
        sessionStorage.setItem("token", token);
        console.log("Token đã lưu:", token);
        alert("Đăng nhập thành công!");
        navigate("/dashboard"); // Chuyển hướng sau khi đăng nhập thành công
      } else {
         // Xử lý trường hợp response thành công nhưng không có token hoặc cấu trúc không đúng
         console.error("Lỗi đăng nhập: Dữ liệu trả về không hợp lệ", response.data);
         alert("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error(
        "Lỗi đăng nhập:",
        error.response?.data || error.message || error // Log chi tiết hơn
      );
      // Hiển thị thông báo lỗi cụ thể hơn nếu có từ server
      const errorMessage = error.response?.data?.message || "Email hoặc mật khẩu không đúng!";
      alert(errorMessage);
    } finally {
       setLoading(false); // Dừng loading dù thành công hay thất bại
    }
  };


  // --- URL hình ảnh ví dụ (thay thế bằng URL của bạn) ---
  // Ví dụ từ Unsplash:
  const gymImageUrl = 'https://thethaodonga.com/wp-content/uploads/2022/01/anh-gym-nghe-thuat-9.jpg';
  // Hoặc nếu bạn đặt ảnh vào thư mục public:
  // const gymImageUrl = '/images/your-gym-image.jpg'; // Giả sử có thư mục public/images

  return (
    // Thêm class 'vh-100' để đảm bảo chiều cao tối thiểu là 100% viewport height
    <div className="bg-gradient-primary min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  {/* --- Cột chứa hình ảnh --- */}
                  <div
                    className="col-lg-6 d-none d-lg-block"
                    style={{
                      backgroundImage: `url(${gymImageUrl})`, // Đặt background image
                      backgroundPosition: 'center',        // Căn giữa ảnh
                      backgroundSize: 'cover'             // Phủ kín div
                    }}
                  ></div>
                  {/* --- Cột chứa form đăng nhập --- */}
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>
                      <form className="user" onSubmit={handleLogin}>
                        <div className="form-group mb-3"> {/* Thêm margin bottom */}
                          <input
                            type="text" // Nên dùng type="email" cho email
                            className="form-control form-control-user"
                            placeholder="Enter Email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            aria-label="Email Address" // Thêm aria-label cho accessibility
                          />
                        </div>
                        <div className="form-group mb-3"> {/* Thêm margin bottom */}
                          <input
                            type="password"
                            className="form-control form-control-user"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            aria-label="Password" // Thêm aria-label
                          />
                        </div>
                        <div className="form-group mb-3"> {/* Thêm margin bottom */}
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
                        <button type="button" className="btn btn-google btn-user btn-block mb-2"> {/* Thêm margin */}
                          <FaGoogle className="me-2" /> Login with Google {/* Sử dụng me-2 thay mr-2 trong Bootstrap 5 */}
                        </button>
                        <button type="button" className="btn btn-facebook btn-user btn-block">
                          <FaFacebookF className="me-2" /> Login with Facebook {/* Sử dụng me-2 */}
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