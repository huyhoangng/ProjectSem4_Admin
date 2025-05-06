import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

// --- API Endpoint Constants ---
const API_ITEMS_BASE_URL = "http://54.251.220.228:8080/trainingSouls/items";
const API_CREATE_URL = "http://54.251.220.228:8080/trainingSouls/create-item";
const API_UPDATE_URL_BASE = "http://54.251.220.228:8080/trainingSouls/update-item";

// Lấy token từ sessionStorage
const token = sessionStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// Initial state for a new package
const initialPackageData = {
  name: "",
  price: "",
  durationInDays: "",
  pointsRequired: "",
  quantity: "",
  description: "",
  itemType: "SUBSCRIPTION"
};


const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [packageData, setPackageData] = useState(initialPackageData);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  useEffect(() => {
    fetchPackages();

    const isNewPath = location.pathname === "/admin/training-packages/new";
    const hasId = !!id;

    if (isNewPath) {
      setIsEditing(false);
      setPackageData(initialPackageData);
      setErrorMessage("");
    } else if (hasId) {
       // Avoid refetching if already editing the same item
       if (!isEditing || packageData.itemId?.toString() !== id) {
          getPackageById(id);
          setIsEditing(true);
          setErrorMessage("");
       }
    } else {
      // Reset form state if navigating back to the list view
      if (isEditing) {
          setIsEditing(false);
          setPackageData(initialPackageData);
      }
    }
  }, [id, location.pathname]); // Dependencies: fetch/reset based on ID and path

    const fetchPackages = async () => {
        try {
        const timestamp = Date.now(); // Cache buster
        const response = await axios.get(`${API_ITEMS_BASE_URL}?_=${timestamp}`, { headers });
        setPackages(response.data || []);
        } catch (error) {
        console.error("Lỗi khi lấy danh sách gói tập:", error);
        setErrorMessage("Không thể tải danh sách gói tập.");
        }
    };

  const getPackageById = async (packageId) => {
    if (!packageId) return;
    try {
      const response = await axios.get(`${API_ITEMS_BASE_URL}/${packageId}`, { headers });
      setPackageData({
          ...initialPackageData, // Ensure all fields are present
          ...response.data
      });
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói tập ID ${packageId}:`, error);
      setErrorMessage(`Không thể tải thông tin chi tiết gói tập ID ${packageId}.`);
      navigate("/admin/training-packages"); // Redirect if item not found
    }
  };

  const handleDelete = async (packageId) => {
    if (!packageId) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa gói tập ID ${packageId}?`)) {
      try {
        await axios.delete(`${API_ITEMS_BASE_URL}/${packageId}`, { headers });
        setErrorMessage(""); // Clear previous error
        // Refetch packages *after* successful deletion
        await fetchPackages();
        // If the deleted item was the one being edited, navigate back
        if (isEditing && id === packageId.toString()) {
            navigate("/admin/training-packages");
        }
      } catch (error) {
        console.error(`Lỗi khi xóa gói tập ID ${packageId}:`, error);
        const backendError = error.response?.data?.message || "Xóa gói tập thất bại.";
        setErrorMessage(backendError);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Destructure for easier validation access
    const { name, price, durationInDays, pointsRequired, quantity } = packageData;

    // Validation checks
    if (!name || !price || !durationInDays || !pointsRequired || !quantity) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc: Tên, Giá, Thời gian, Điểm yêu cầu, Số lượng.");
      return;
    }
    if (Number(price) < 0 || Number(durationInDays) <= 0 || Number(pointsRequired) < 0 || Number(quantity) < 0) {
        setErrorMessage("Giá, Thời gian, Điểm yêu cầu, và Số lượng không được là số âm. Thời gian phải lớn hơn 0.");
        return;
    }
    setErrorMessage(""); // Clear error message if validation passes

    // Prepare payload, ensure numeric types
    const payload = {
        ...packageData,
        price: Number(price),
        durationInDays: Number(durationInDays),
        pointsRequired: Number(pointsRequired),
        quantity: Number(quantity),
        itemType: packageData.itemType || "SUBSCRIPTION" // Ensure itemType
    };

    // Remove itemId for CREATE operation
    if (!isEditing) {
        delete payload.itemId;
    }

    try {
        // Determine API call based on mode (editing vs. creating)
        if (isEditing && id) {
            await axios.put(`${API_UPDATE_URL_BASE}/${id}`, payload, { headers });
        } else {
            await axios.post(API_CREATE_URL, payload, { headers });
        }
        // On success: fetch updated list and navigate back
        await fetchPackages();
        navigate("/admin/training-packages");

    } catch (error) {
        console.error("Lỗi khi lưu gói tập:", error.response || error);
        let specificError = "Lưu gói tập thất bại. Vui lòng thử lại.";
        // Extract backend error message if available
        if (error.response && error.response.data) {
            if (typeof error.response.data.message === 'string') {
                specificError = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                 specificError = error.response.data;
            } else if (error.response.status === 400) {
                 specificError = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
            } else if (error.response.status === 401 || error.response.status === 403) {
                 specificError = "Bạn không có quyền thực hiện hành động này.";
            }
        } else if (error.request) {
             specificError = "Không nhận được phản hồi từ máy chủ.";
        } else if (error.message) {
            specificError = error.message;
        }
        setErrorMessage(specificError);
    }
  };

  // --- Render Logic ---

  const renderForm = () => (
    // Form styling remains the same
    <div className="card shadow-sm border-0 p-lg-5 p-4">
      <h2 className="text-primary text-center fw-bold mb-4">
        {isEditing ? "✏️ Chỉnh sửa Gói Tập" : "➕ Thêm Gói Tập Mới"}
      </h2>
      {errorMessage && <div className="alert alert-danger alert-dismissible fade show" role="alert">
         {errorMessage}
         <button type="button" className="btn-close" onClick={() => setErrorMessage("")} aria-label="Close"></button>
        </div>}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {/* Floating Labels for Inputs/Selects */}
        <div className="form-floating">
            <input type="text" className="form-control" id="packageName" placeholder="Tên gói" value={packageData.name} onChange={(e) => setPackageData({ ...packageData, name: e.target.value })} required />
            <label htmlFor="packageName">Tên gói *</label>
        </div>
         <div className="form-floating">
            <select className="form-select" id="packagePrice" value={packageData.price} onChange={(e) => setPackageData({ ...packageData, price: e.target.value })} required>
                <option value="" disabled>Chọn giá...</option>
                <option value="500000">500,000 VNĐ</option>
                <option value="1000000">1,000,000 VNĐ</option>
                <option value="1500000">1,500,000 VNĐ</option>
                <option value="2000000">2,000,000 VNĐ</option>
                {/* Dynamic option for existing non-standard price */}
                {isEditing && packageData.price && ![500000, 1000000, 1500000, 2000000].includes(Number(packageData.price)) && (
                    <option value={packageData.price}>{Number(packageData.price).toLocaleString('vi-VN')} VNĐ (Hiện tại)</option>
                )}
            </select>
             <label htmlFor="packagePrice">Giá *</label>
        </div>
        <div className="form-floating">
            <select className="form-select" id="packageDuration" value={packageData.durationInDays} onChange={(e) => setPackageData({ ...packageData, durationInDays: e.target.value })} required >
                <option value="" disabled>Chọn thời gian...</option>
                <option value="30">30 ngày</option>
                <option value="60">60 ngày</option>
                <option value="90">90 ngày</option>
                <option value="180">180 ngày</option>
                 {/* Dynamic option for existing non-standard duration */}
                {isEditing && packageData.durationInDays && ![30, 60, 90, 180].includes(Number(packageData.durationInDays)) && (
                    <option value={packageData.durationInDays}>{packageData.durationInDays} ngày (Hiện tại)</option>
                )}
            </select>
            <label htmlFor="packageDuration">Thời gian (ngày) *</label>
        </div>
        <div className="form-floating">
            <input type="number" className="form-control" id="packagePoints" placeholder="Điểm yêu cầu" value={packageData.pointsRequired} onChange={(e) => setPackageData({ ...packageData, pointsRequired: e.target.value })} required min="0" />
            <label htmlFor="packagePoints">Điểm yêu cầu *</label>
        </div>
        <div className="form-floating">
            <input type="number" className="form-control" id="packageQuantity" placeholder="Số lượng" value={packageData.quantity} onChange={(e) => setPackageData({ ...packageData, quantity: e.target.value })} required min="0" />
            <label htmlFor="packageQuantity">Số lượng *</label>
        </div>
        <div className="form-floating">
            <textarea className="form-control" id="packageDescription" placeholder="Mô tả" value={packageData.description || ''} onChange={(e) => setPackageData({ ...packageData, description: e.target.value })} rows="4" style={{ height: '100px' }} />
            <label htmlFor="packageDescription">Mô tả (tùy chọn)</label>
        </div>
        {/* Action Buttons */}
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-end mt-3">
             <button type="button" className="btn btn-outline-secondary fw-bold px-4" onClick={() => navigate("/admin/training-packages")}> Hủy bỏ </button>
            <button type="submit" className="btn btn-primary fw-bold px-4"> {isEditing ? "✅ Cập nhật" : "➕ Thêm mới"} </button>
        </div>
      </form>
    </div>
  );

  // Table View (listing packages) - UPDATED HEADER STYLING
  const renderTable = () => (
    <div>
      {/* Header section: Title and Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="text-primary fw-bold mb-0">📦 Quản lý Gói Tập</h2>
        <button
          className="btn btn-primary d-flex align-items-center shadow-sm"
          onClick={() => navigate("/admin/training-packages/new")}
        >
          <FaPlus className="me-2" /> Thêm gói mới
        </button>
      </div>
      {/* Error message display */}
       {errorMessage && <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage("")} aria-label="Close"></button>
        </div>}
      {/* Card container for the table */}
      <div className="card shadow-sm border-light rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              {/* Table Header: Light blue background, centered, bold, larger text */}
              <thead style={{ backgroundColor: '#e7f1ff' }}> {/* Light blue background */}
                <tr>
                  {/* Header Cells (<th>): Centered, Semibold, Padded, Larger Font */}
                  <th scope="col" className="text-center fw-semibold py-3 fs-6">ID</th>
                  <th scope="col" className="text-center fw-semibold py-3 fs-6">Tên</th> {/* Centered */}
                  <th scope="col" className="text-center text-nowrap fw-semibold py-3 fs-6">Giá (VNĐ)</th>
                  <th scope="col" className="text-center fw-semibold py-3 fs-6">Thời gian (ngày)</th>
                  <th scope="col" className="text-center fw-semibold py-3 fs-6">Số lượng</th>
                  <th scope="col" className="text-center fw-semibold py-3 fs-6">Điểm yêu cầu</th>
                  <th scope="col" className="text-center fw-semibold py-3 fs-6" style={{minWidth: '120px'}}>Mô tả</th> {/* Centered */}
                  <th scope="col" className="text-center fw-semibold py-3 fs-6" style={{minWidth: '100px'}}>Hành động</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {packages.length > 0 ? (
                  // Map through packages to create rows
                  packages.map((pkg) => (
                    <tr key={pkg.itemId}>
                      {/* Data Cells (<td>) - Align with header or as appropriate */}
                      <td className="text-center">{pkg.itemId}</td>
                      <td className="text-start">{pkg.name || "-"}</td> {/* Keep name left-aligned */}
                      <td className="text-center text-nowrap">
                        {(pkg.price ?? 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="text-center">{pkg.durationInDays ?? "-"}</td>
                      <td className="text-center">{pkg.quantity ?? "-"}</td>
                      <td className="text-center">{pkg.pointsRequired ?? "-"}</td>
                       {/* Keep description left-aligned with ellipsis */}
                      <td className="text-start" title={pkg.description || ''}>
                          <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pkg.description || "-"}
                          </div>
                      </td>
                      {/* Action buttons cell */}
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                            {/* Edit Button */}
                            <button
                                className="btn btn-sm btn-outline-primary border-0" // Borderless outline
                                onClick={() => navigate(`/admin/training-packages/edit/${pkg.itemId}`)}
                                title="Sửa gói tập"
                            >
                            <FaEdit />
                            </button>
                            {/* Delete Button */}
                            <button
                                className="btn btn-sm btn-outline-danger border-0" // Borderless outline
                                onClick={() => handleDelete(pkg.itemId)}
                                title="Xóa gói tập"
                            >
                            <FaTrash />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Row displayed when no packages are found
                  <tr>
                    <td colSpan="8" className="text-center text-muted p-4">
                      Chưa có gói tập nào.
                       {/* Link to add new package */}
                       <a href="#" onClick={(e) => {e.preventDefault(); navigate("/admin/training-packages/new");}} className="ms-2 link-primary">Thêm gói mới?</a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );

  // Main component return: Render either Form or Table based on state/route
  return (
    <div className="container my-4">
        {location.pathname === "/admin/training-packages/new" || isEditing ? renderForm() : renderTable()}
    </div>
  );
};

export default PackageManagement;