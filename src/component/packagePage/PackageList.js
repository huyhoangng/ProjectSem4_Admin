import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert, Spinner } from "react-bootstrap"; // Thêm Alert và Spinner từ react-bootstrap

// --- API Endpoint Constants ---
const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls";
const API_ITEMS_URL = `${API_BASE_URL}/items`;
const API_CREATE_ITEM_URL = `${API_BASE_URL}/items/create-item`;
const API_UPDATE_ITEM_URL_BASE = `${API_BASE_URL}/update-item`;

const getToken = () => sessionStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

// Initial state - Bỏ durationInDays
const initialItemData = {
  name: "",
  price: "",
  pointsRequired: "",
  quantity: "",
  description: "",
  itemType: "SUBSCRIPTION", // Bạn có thể đổi mặc định nếu muốn, ví dụ OTHER_TYPE
  itemId: null,
};


const PackageManagement = () => {
  const [items, setItems] = useState([]);
  const [itemData, setItemData] = useState(initialItemData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    clearMessages();
    const currentPath = location.pathname;
    const isNewPath = currentPath.endsWith("/new");
    const editPathMatch = currentPath.match(/\/edit\/(\d+)$/);
    const editId = editPathMatch ? editPathMatch[1] : null;

    if (isNewPath) {
      setIsEditing(false);
      setItemData(initialItemData);
    } else if (editId) {
      if (!isEditing || itemData.itemId?.toString() !== editId) {
        getItemById(editId);
      }
    } else {
      fetchItems();
      if (isEditing) {
          setIsEditing(false);
          setItemData(initialItemData);
      }
    }
  }, [location.pathname, isEditing]);


  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const timestamp = Date.now();
      const response = await axios.get(`${API_ITEMS_URL}?_=${timestamp}`, { headers: getHeaders() });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói:", error);
      setErrorMessage("Không thể tải danh sách gói. " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = async (itemId) => {
    if (!itemId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_ITEMS_URL}/${itemId}`, { headers: getHeaders() });
      if (response.data) {
        setItemData({ // Không còn durationInDays ở đây
          ...initialItemData,
          ...response.data,
          price: response.data.price?.toString() || "",
          pointsRequired: response.data.pointsRequired?.toString() || "",
          quantity: response.data.quantity?.toString() || "",
        });
        setIsEditing(true);
      } else {
        throw new Error("Không tìm thấy dữ liệu gói.");
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói ID ${itemId}:`, error);
      setErrorMessage(`Không thể tải thông tin gói ID ${itemId}. ` + (error.response?.data?.message || error.message));
      navigate("/admin/training-packages");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    clearMessages();
    if (!itemId) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa gói ID ${itemId}?`)) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_ITEMS_URL}/${itemId}`, { headers: getHeaders() });
        setSuccessMessage(`Gói ID ${itemId} đã được xóa thành công.`);
        await fetchItems();
        if (isEditing && itemData.itemId?.toString() === itemId.toString()) {
            navigate("/admin/training-packages");
        }
      } catch (error) {
        console.error(`Lỗi khi xóa gói ID ${itemId}:`, error);
        setErrorMessage(`Xóa gói thất bại. ` + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    // Bỏ durationInDays khỏi destructure
    const { name, price, pointsRequired, quantity, itemType } = itemData;

    // Cập nhật validation
    if (!name.trim() || !price || !pointsRequired || !quantity) {
      setErrorMessage("Vui lòng điền Tên, Giá, Điểm yêu cầu, và Số lượng.");
      return;
    }

    const numPrice = Number(price);
    const numPoints = Number(pointsRequired);
    const numQuantity = Number(quantity);

    // Cập nhật validation số
    if (isNaN(numPrice) || numPrice < 0 ||
        isNaN(numPoints) || numPoints < 0 ||
        isNaN(numQuantity) || numQuantity < 0 ) {
        setErrorMessage("Giá, Điểm yêu cầu, và Số lượng phải là số hợp lệ và không được âm.");
        return;
    }

    setIsLoading(true);

    // Bỏ durationInDays khỏi payload
    const payload = {
        name: name.trim(),
        price: numPrice,
        pointsRequired: numPoints,
        quantity: numQuantity,
        description: itemData.description?.trim() || null,
        itemType: itemType,
    };

    // Không cần logic xử lý durationInDays nữa

    try {
      if (isEditing && itemData.itemId) {
        await axios.put(`${API_UPDATE_ITEM_URL_BASE}/${itemData.itemId}`, payload, { headers: getHeaders() });
        setSuccessMessage("Gói đã được cập nhật thành công!");
      } else {
        await axios.post(API_CREATE_ITEM_URL, payload, { headers: getHeaders() });
        setSuccessMessage("Gói mới đã được tạo thành công!");
      }
      setTimeout(() => {
        navigate("/admin/training-packages");
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi lưu gói:", error.response || error);
      let specificError = "Lưu gói thất bại. Vui lòng thử lại.";
      if (error.response && error.response.data) {
        specificError = error.response.data.message || (typeof error.response.data === 'string' ? error.response.data : (error.response.data.error || specificError) );
      } else if (error.message) {
        specificError = error.message;
      }
      setErrorMessage(specificError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItemData(prev => ({ ...prev, [name]: value }));
  };


  const renderForm = () => (
    <div className="card shadow-sm border-0 p-lg-5 p-4">
      <h2 className="text-primary text-center fw-bold mb-4">
        {isEditing ? "✏️ Chỉnh sửa Gói/Sản phẩm" : "➕ Thêm Gói/Sản phẩm Mới"}
      </h2>
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="form-floating">
            <input type="text" className="form-control" id="itemName" name="name" placeholder="Tên gói/sản phẩm" value={itemData.name} onChange={handleInputChange} required />
            <label htmlFor="itemName">Tên gói/sản phẩm *</label>
        </div>
         <div className="form-floating">
            <input type="number" className="form-control" id="itemPrice" name="price" placeholder="Giá (số)" value={itemData.price} onChange={handleInputChange} required min="0" step="1000"/>
            <label htmlFor="itemPrice">Giá (ví dụ: 50000) *</label>
        </div>

        <div className="form-floating">
            <select className="form-select" id="itemType" name="itemType" value={itemData.itemType} onChange={handleInputChange} required>
                <option value="SUBSCRIPTION">Gói Đăng Ký (Subscription)</option>
                <option value="AVATAR">Avatar</option>
                <option value="OTHER_TYPE">Loại Khác (Other)</option>
            </select>
            <label htmlFor="itemType">Loại Item *</label>
        </div>

        {/* XÓA HOÀN TOÀN TRƯỜNG durationInDays KHỎI FORM */}

        <div className="form-floating">
            <input type="number" className="form-control" id="itemPoints" name="pointsRequired" placeholder="Điểm yêu cầu" value={itemData.pointsRequired} onChange={handleInputChange} required min="0" />
            <label htmlFor="itemPoints">Điểm yêu cầu để mua *</label>
        </div>
        <div className="form-floating">
            <input type="number" className="form-control" id="itemQuantity" name="quantity" placeholder="Số lượng" value={itemData.quantity} onChange={handleInputChange} required min="0" />
            <label htmlFor="itemQuantity">Số lượng tồn kho *</label>
        </div>
        <div className="form-floating">
            <textarea className="form-control" id="itemDescription" name="description" placeholder="Mô tả" value={itemData.description || ''} onChange={handleInputChange} rows="3" style={{ minHeight: '100px' }} />
            <label htmlFor="itemDescription">Mô tả</label>
        </div>

        <div className="d-grid gap-2 d-sm-flex justify-content-sm-end mt-3">
            <button type="button" className="btn btn-outline-secondary fw-bold px-4" onClick={() => navigate("/admin/training-packages")} disabled={isLoading}> Hủy bỏ </button>
            <button type="submit" className="btn btn-primary fw-bold px-4" disabled={isLoading}>
                {isLoading ? (
                    <><Spinner as="span" size="sm" className="me-2" /> Đang {isEditing ? "cập nhật..." : "thêm..."}</>
                ) : (isEditing ? "✅ Cập nhật" : "➕ Thêm mới")}
            </button>
        </div>
      </form>
    </div>
  );


  const renderTable = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="text-primary fw-bold mb-0">📦 Quản lý Gói & Sản phẩm</h2>
        <button
          className="btn btn-primary d-flex align-items-center shadow-sm"
          onClick={() => navigate("/admin/training-packages/new")}
          disabled={isLoading}
        >
          <FaPlus className="me-2" /> Thêm mới
        </button>
      </div>
       {errorMessage && !isEditing && (
        <Alert variant="danger" onClose={() => setErrorMessage("")} dismissible>
          {errorMessage}
        </Alert>
       )}
       {successMessage && !isEditing && (
         <Alert variant="success" onClose={() => setSuccessMessage("")} dismissible>
            {successMessage}
         </Alert>
       )}

      {isLoading && items.length === 0 && (
        <div className="text-center my-5"><Spinner animation="border" variant="primary" /><p className="mt-2">Đang tải...</p></div>
      )}
      {!isLoading && items.length === 0 && (
        <Alert variant="info" className="text-center">Chưa có gói/sản phẩm nào.
          <a href="#" onClick={(e) => {e.preventDefault(); navigate("/admin/training-packages/new");}} className="ms-2 link-primary">Thêm mới?</a>
        </Alert>
      )}
      {items.length > 0 && (
          <div className="card shadow-sm border-light rounded-3 overflow-hidden">
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#e7f1ff' }}>
                    <tr>
                    <th className="text-center fw-semibold py-3">ID</th>
                    <th className="text-start fw-semibold py-3">Tên</th>
                    <th className="text-center fw-semibold py-3">Giá</th>
                    <th className="text-center fw-semibold py-3">Loại</th>
                    {/* XÓA CỘT THỜI GIAN (NGÀY) */}
                    <th className="text-center fw-semibold py-3">Số lượng</th>
                    <th className="text-center fw-semibold py-3">Điểm yêu cầu</th>
                    <th className="text-start fw-semibold py-3" style={{minWidth: '150px'}}>Mô tả</th>
                    <th className="text-center fw-semibold py-3" style={{minWidth: '100px'}}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                    <tr key={item.itemId}>
                        <td className="text-center">{item.itemId}</td>
                        <td className="text-start">{item.name || "-"}</td>
                        <td className="text-center text-nowrap">
                            {(item.price ?? 0).toLocaleString('vi-VN')} đ
                        </td>
                         <td className="text-center">
                            <span className={`badge ${
                                item.itemType === 'SUBSCRIPTION' ? 'bg-info text-dark' :
                                item.itemType === 'AVATAR' ? 'bg-success' :
                                item.itemType === 'OTHER_TYPE' ? 'bg-secondary' : 'bg-light text-dark'
                            }`}>
                                {item.itemType || "N/A"}
                            </span>
                        </td>
                        {/* XÓA CỘT THỜI GIAN (NGÀY) */}
                        <td className="text-center">{item.quantity ?? "-"}</td>
                        <td className="text-center">{item.pointsRequired ?? "-"}</td>
                        <td className="text-start" title={item.description || ''}>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description || "-"}
                            </div>
                        </td>
                        <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                            <button
                                className="btn btn-sm btn-outline-warning border-0"
                                onClick={() => navigate(`/admin/training-packages/edit/${item.itemId}`)}
                                title="Sửa"
                                disabled={isLoading}
                            >
                            <FaEdit />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger border-0"
                                onClick={() => handleDelete(item.itemId)}
                                title="Xóa"
                                disabled={isLoading}
                            >
                            <FaTrash />
                            </button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );

  const currentPath = location.pathname;
  const showForm = currentPath.endsWith("/new") || currentPath.includes("/edit/");

  return (
    <div className="container my-4">
        {showForm ? renderForm() : renderTable()}
    </div>
  );
};

export default PackageManagement;