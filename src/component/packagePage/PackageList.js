import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/items";

// Lấy token từ sessionStorage
const token = sessionStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [packageData, setPackageData] = useState({ name: "", price: "", duration: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error messages
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    fetchPackages();
    if (location.pathname === "/admin/training-packages/new") {
      setIsEditing(false);
      setPackageData({ name: "", price: "", duration: "" });
    } else if (id) {
      getPackageById(id);
      setIsEditing(true);
    }
  }, [id, location.pathname]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(API_BASE_URL, { headers });
      setPackages(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói tập:", error);
    }
  };

  const getPackageById = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, { headers });
      setPackageData(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin gói tập:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await axios.delete(`${API_BASE_URL}/${id}`, { headers });
        fetchPackages();
      } catch (error) {
        console.error("Lỗi khi xóa gói tập:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!packageData.name || !packageData.price || !packageData.duration) {
      setErrorMessage("Tất cả các trường đều phải được điền đầy đủ!");
      return;
    }
    setErrorMessage(""); // Clear error message if form is valid
    try {
      if (isEditing) {
        await axios.put(`http://54.251.220.228:8080/trainingSouls/update-item/${id}`, packageData, { headers });
      } else {
        await axios.post(`http://54.251.220.228:8080/trainingSouls/create-item`, packageData, { headers });
      }
      navigate("/admin/training-packages");
    } catch (error) {
      console.error("Lỗi khi lưu gói tập:", error);
    }
  };

  return (
    <div className="container mt-4">
      {location.pathname === "/admin/training-packages/new" || isEditing ? (
        <div className="card shadow p-4">
          <h2 className="text-primary text-center fw-bold">
            {isEditing ? "✏️ Chỉnh sửa" : "➕ Thêm mới"} Gói Tập
          </h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Error message */}
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
  {/* Nhập tên gói */}
  <input
    type="text"
    className="form-control p-3"
    placeholder="Tên gói"
    value={packageData.name}
    onChange={(e) => setPackageData({ ...packageData, name: e.target.value })}
    required
  />

  {/* Dropdown chọn giá */}
  <select
    className="form-control p-3"
    value={packageData.price}
    onChange={(e) => setPackageData({ ...packageData, price: e.target.value })}
    required
  >
    <option value="">Chọn giá</option>
    <option value="500000">500,000 VNĐ</option>
    <option value="1000000">1,000,000 VNĐ</option>
    <option value="1500000">1,500,000 VNĐ</option>
    <option value="2000000">2,000,000 VNĐ</option>
  </select>

  {/* Dropdown chọn thời gian */}
  <select
    className="form-control p-3"
    value={packageData.duration}
    onChange={(e) => setPackageData({ ...packageData, duration: e.target.value })}
    required
  >
    <option value="">Chọn thời gian</option>
    <option value="30">30 ngày</option>
    <option value="60">60 ngày</option>
    <option value="90">90 ngày</option>
    <option value="180">180 ngày</option>
  </select>

  {/* Điểm yêu cầu */}
  <input
    type="number"
    className="form-control p-3"
    placeholder="Điểm yêu cầu"
    value={packageData.pointsRequired}
    onChange={(e) => setPackageData({ ...packageData, pointsRequired: e.target.value })}
    required
  />

  {/* Số lượng */}
  <input
    type="number"
    className="form-control p-3"
    placeholder="Số lượng"
    value={packageData.quantity}
    onChange={(e) => setPackageData({ ...packageData, quantity: e.target.value })}
    required
  />

  {/* Mô tả */}
  <textarea
    className="form-control p-3"
    placeholder="Mô tả (tùy chọn)"
    value={packageData.description}
    onChange={(e) => setPackageData({ ...packageData, description: e.target.value })}
    rows="3"
  />

  <button type="submit" className="btn btn-primary fw-bold">
    {isEditing ? "✅ Cập nhật" : "📌 Thêm mới"}
  </button>
</form>

        </div>
      ) : (
        <div>
          <h2 className="text-primary fw-bold">📦 Quản lý Gói Tập</h2>
          <button
            className="btn btn-success mb-3 d-flex align-items-center"
            onClick={() => navigate("/admin/training-packages/new")}
          >
            <FaPlus className="me-1" /> Thêm mới
          </button>
          <div className="card shadow-lg rounded-3">
            <div className="card-body">
              <table className="table table-hover text-center">
                <thead className="bg-primary text-white">
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Giá (VNĐ)</th>
                    <th>Thời gian</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <tr key={pkg.itemId}>
                        <td>{pkg.itemId}</td>
                        <td>{pkg.name}</td>
                        <td>{pkg.price.toLocaleString()} VNĐ</td>
                        <td>{pkg.durationInDays} ngày</td>
                        <td>{pkg.quantity}</td>
                        <td>{pkg.pointsRequired}</td>
                        <td>
                          <button className="btn btn-warning me-2" onClick={() => navigate(`/admin/training-packages/edit/${pkg.itemId}`)}>
                            <FaEdit /> Sửa
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(pkg.itemId)}>
                            <FaTrash /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-muted">Không có gói tập nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;
