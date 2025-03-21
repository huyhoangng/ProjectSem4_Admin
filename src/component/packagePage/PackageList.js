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
    try {
      if (isEditing) {
        await axios.put(`http://54.251.220.228:8080/trainingSouls/update-item/${id}`, packageData, { headers });
      } else {
        await axios.post("http://54.251.220.228:8080/trainingSouls/create-item", packageData, { headers });
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
                      <tr key={pkg.id} className="align-middle">
                        <td>{pkg.id}</td>
                        <td className="fw-semibold">{pkg.name}</td>
                        <td>{pkg.price ? pkg.price.toLocaleString() + " VNĐ" : "Chưa có giá"}</td>
                        <td>{pkg.duration} ngày</td>
                        <td className="d-flex justify-content-center">
                          <button
                            className="btn btn-warning me-2 d-flex align-items-center"
                            onClick={() => navigate(`/admin/training-packages/edit/${pkg.id}`)}
                          >
                            <FaEdit className="me-1" /> Sửa
                          </button>
                          <button
                            className="btn btn-danger d-flex align-items-center"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <FaTrash className="me-1" /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">Không có gói tập nào 😞</td>
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
