import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

// --- API Endpoint Constants ---
// Đã được cập nhật theo yêu cầu mới của bạn
const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls";
const API_ITEMS_URL = `${API_BASE_URL}/items`; // GET ALL, GET BY ID, DELETE
const API_CREATE_ITEM_URL = `${API_BASE_URL}/create-item`; // POST - Tạo mới
const API_UPDATE_ITEM_URL_BASE = `${API_BASE_URL}/update-item`; // PUT - Cập nhật


// Lấy token từ sessionStorage một lần khi component được định nghĩa
// Lưu ý: Nếu token thay đổi sau khi component mount, headers này sẽ không cập nhật.
// Nếu token có thể thay đổi trong phiên làm việc, cần lấy token mới nhất trước mỗi request.
const getToken = () => sessionStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const initialItemData = {
  name: "",
  price: "", // Sẽ được chuyển thành number trước khi gửi
  durationInDays: "", // Sẽ được chuyển thành number
  pointsRequired: "", // Sẽ được chuyển thành number
  quantity: "", // Sẽ được chuyển thành number
  description: "",
  itemType: "SUBSCRIPTION", // Mặc định là SUBSCRIPTION
  itemId: null, // Để phân biệt item mới và item đang chỉnh sửa
};


const PackageManagement = () => {
  const [items, setItems] = useState([]);
  const [itemData, setItemData] = useState(initialItemData);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL
  const location = useLocation();

  // Fetch all items or a specific item based on URL
  useEffect(() => {
    const currentPath = location.pathname;
    const isNewPath = currentPath.endsWith("/new");
    const editPathMatch = currentPath.match(/\/edit\/(\d+)$/); // Lấy ID từ /edit/:id
    const editId = editPathMatch ? editPathMatch[1] : null;

    if (isNewPath) {
      setIsEditing(false);
      setItemData(initialItemData);
      setErrorMessage("");
    } else if (editId) {
      // Chỉ fetch nếu ID thay đổi hoặc chưa ở chế độ chỉnh sửa cho ID đó
      if (!isEditing || itemData.itemId?.toString() !== editId) {
        getItemById(editId); // Fetch item để chỉnh sửa
        setIsEditing(true);
      }
    } else {
      // Trang danh sách chính
      fetchItems();
      if (isEditing) { // Reset form nếu từ trang edit/new quay lại
          setIsEditing(false);
          setItemData(initialItemData);
      }
    }
  }, [location.pathname]); // Re-run khi URL thay đổi


  const fetchItems = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const timestamp = Date.now(); // Cache buster
      const response = await axios.get(`${API_ITEMS_URL}?_=${timestamp}`, { headers: getHeaders() });
      // API trả về mảng các items trực tiếp
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói tập:", error);
      setErrorMessage("Không thể tải danh sách gói tập. " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getItemById = async (itemId) => {
    if (!itemId) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(`${API_ITEMS_URL}/${itemId}`, { headers: getHeaders() });
      // API trả về một object item
      if (response.data) {
        setItemData({
          ...initialItemData, // Đảm bảo tất cả các trường đều có
          ...response.data, // Ghi đè với dữ liệu từ API
          // Chuyển đổi số về chuỗi cho input, API có thể trả về số
          price: response.data.price?.toString() || "",
          durationInDays: response.data.durationInDays?.toString() || "",
          pointsRequired: response.data.pointsRequired?.toString() || "",
          quantity: response.data.quantity?.toString() || "",
        });
        setIsEditing(true); // Chắc chắn đang ở chế độ edit
      } else {
        throw new Error("Không tìm thấy dữ liệu gói tập.");
      }
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói tập ID ${itemId}:`, error);
      setErrorMessage(`Không thể tải thông tin chi tiết gói tập ID ${itemId}. ` + (error.response?.data?.message || error.message));
      navigate("/admin/training-packages"); // Chuyển hướng nếu không tìm thấy
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!itemId) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa gói tập ID ${itemId}? Thao tác này không thể hoàn tác.`)) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        // API DELETE sử dụng URL: /items/{id}
        await axios.delete(`${API_ITEMS_URL}/${itemId}`, { headers: getHeaders() });
        await fetchItems(); // Tải lại danh sách sau khi xóa
        // Nếu item đang được edit bị xóa, quay lại trang danh sách
        if (isEditing && itemData.itemId?.toString() === itemId.toString()) {
            navigate("/admin/training-packages");
        }
      } catch (error) {
        console.error(`Lỗi khi xóa gói tập ID ${itemId}:`, error);
        setErrorMessage(`Xóa gói tập thất bại. ` + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, price, durationInDays, pointsRequired, quantity, itemType } = itemData;

    // Validation
    if (!name.trim() || !price || !durationInDays || !pointsRequired || !quantity) {
      setErrorMessage("Vui lòng điền đầy đủ các trường bắt buộc: Tên, Giá, Thời gian, Điểm yêu cầu, Số lượng.");
      return;
    }
    const numPrice = Number(price);
    const numDuration = Number(durationInDays);
    const numPoints = Number(pointsRequired);
    const numQuantity = Number(quantity);

    if (isNaN(numPrice) || numPrice < 0 || isNaN(numDuration) || numDuration <= 0 || isNaN(numPoints) || numPoints < 0 || isNaN(numQuantity) || numQuantity < 0) {
        setErrorMessage("Giá, Thời gian, Điểm yêu cầu, và Số lượng phải là số hợp lệ. Thời gian phải lớn hơn 0. Các giá trị khác không được âm.");
        return;
    }
    setErrorMessage("");
    setIsLoading(true);

    const payload = {
        name: name.trim(),
        price: numPrice,
        durationInDays: numDuration,
        pointsRequired: numPoints,
        quantity: numQuantity,
        description: itemData.description?.trim() || "", // Đảm bảo description là chuỗi
        itemType: itemType || "SUBSCRIPTION", // Mặc định itemType
    };

    try {
      if (isEditing && itemData.itemId) {
        // API UPDATE sử dụng URL: /update-item/{id}
        await axios.put(`${API_UPDATE_ITEM_URL_BASE}/${itemData.itemId}`, payload, { headers: getHeaders() });
      } else {
        // API CREATE sử dụng URL: /create-item
        // Không cần truyền ID cho API create-item này
        await axios.post(API_CREATE_ITEM_URL, payload, { headers: getHeaders() });
      }
      // await fetchItems(); // Không cần fetch lại nếu navigate ngay
      navigate("/admin/training-packages"); // Chuyển về trang danh sách
    } catch (error) {
      console.error("Lỗi khi lưu gói tập:", error.response || error);
      let specificError = "Lưu gói tập thất bại. Vui lòng thử lại.";
      if (error.response && error.response.data) {
        specificError = error.response.data.message || (typeof error.response.data === 'string' ? error.response.data : specificError);
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
        {isEditing ? "✏️ Chỉnh sửa Gói Tập" : "➕ Thêm Gói Tập Mới"}
      </h2>
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage("")} aria-label="Close"></button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="form-floating">
            <input type="text" className="form-control" id="itemName" name="name" placeholder="Tên gói" value={itemData.name} onChange={handleInputChange} required />
            <label htmlFor="itemName">Tên gói *</label>
        </div>
         <div className="form-floating">
            <input type="number" className="form-control" id="itemPrice" name="price" placeholder="Giá ($)" value={itemData.price} onChange={handleInputChange} required min="0" />
            <label htmlFor="itemPrice">Giá (USD) *</label>
        </div>
        <div className="form-floating">
            <input type="number" className="form-control" id="itemDuration" name="durationInDays" placeholder="Thời gian (ngày)" value={itemData.durationInDays} onChange={handleInputChange} required min="null" />
            <label htmlFor="itemDuration">Thời gian (ngày) *</label>
        </div>
        <div className="form-floating">
            <input type="number" className="form-control" id="itemPoints" name="pointsRequired" placeholder="Điểm yêu cầu" value={itemData.pointsRequired} onChange={handleInputChange} required min="0" />
            <label htmlFor="itemPoints">Điểm yêu cầu *</label>
        </div>
        {/* <div className="form-floating">
            <input type="number" className="form-control" id="itemQuantity" name="quantity" placeholder="Số lượng" value={itemData.quantity} onChange={handleInputChange} required min="0" />
            <label htmlFor="itemQuantity">Số lượng *</label>
        </div> */}
        <div className="form-floating">
            <textarea className="form-control" id="itemDescription" name="description" placeholder="Mô tả" value={itemData.description || ''} onChange={handleInputChange} rows="4" style={{ height: '100px' }} />
            <label htmlFor="itemDescription">Mô tả (tùy chọn)</label>
        </div>
        <div className="form-floating">
            <select className="form-select" id="itemType" name="itemType" value={itemData.itemType} onChange={handleInputChange} required>
                <option value="SUBSCRIPTION">Gói Đăng Ký (Subscription)</option>
                <option value="PRODUCT">Sản Phẩm (Product)</option>
           
            </select>
            <label htmlFor="itemType">Loại Item *</label>
        </div>

        <div className="d-grid gap-2 d-sm-flex justify-content-sm-end mt-3">
            <button type="button" className="btn btn-outline-secondary fw-bold px-4" onClick={() => navigate("/admin/training-packages")} disabled={isLoading}> Hủy bỏ </button>
            <button type="submit" className="btn btn-primary fw-bold px-4" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang {isEditing ? "cập nhật..." : "thêm..."}
                    </>
                ) : (isEditing ? "✅ Cập nhật" : "➕ Thêm mới")}
            </button>
        </div>
      </form>
    </div>
  );


  const renderTable = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="text-primary fw-bold mb-0">📦 Quản lý Gói Tập</h2>
        <button
          className="btn btn-primary d-flex align-items-center shadow-sm"
          onClick={() => navigate("/admin/training-packages/new")}
          disabled={isLoading}
        >
          <FaPlus className="me-2" /> Thêm gói mới
        </button>
      </div>
       {errorMessage && !isEditing && ( // Chỉ hiển thị lỗi của bảng nếu không ở form
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage("")} aria-label="Close"></button>
        </div>
       )}
      {isLoading && items.length === 0 && ( // Hiển thị loading khi đang fetch và chưa có data
        <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}
      {!isLoading && items.length === 0 && ( // Hiển thị khi không loading và không có data
        <div className="alert alert-info text-center">
          Chưa có gói tập nào.
          <a href="#" onClick={(e) => {e.preventDefault(); navigate("/admin/training-packages/new");}} className="ms-2 link-primary">Thêm gói mới?</a>
        </div>
      )}
      {items.length > 0 && (
          <div className="card shadow-sm border-light rounded-3 overflow-hidden">
            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle mb-0">
                <thead style={{ backgroundColor: '#e7f1ff' }}>
                    <tr>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6">ID</th>
                    <th scope="col" className="text-start fw-semibold py-3 fs-6">Tên</th>
                    <th scope="col" className="text-center text-nowrap fw-semibold py-3 fs-6">Giá ($)</th>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6">Thời gian (ngày)</th>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6">Số lượng</th>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6">Điểm yêu cầu</th>
                    <th scope="col" className="text-start fw-semibold py-3 fs-6" style={{minWidth: '150px'}}>Mô tả</th>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6">Loại</th>
                    <th scope="col" className="text-center fw-semibold py-3 fs-6" style={{minWidth: '100px'}}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                    <tr key={item.itemId}>
                        <td className="text-center">{item.itemId}</td>
                        <td className="text-start">{item.name || "-"}</td>
                        <td className="text-center text-nowrap">
                        {(item.price ?? 0).toLocaleString('vi-VN')}
                        </td>
                        <td className="text-center">{item.durationInDays ?? "-"}</td>
                        <td className="text-center">{item.quantity ?? "-"}</td>
                        <td className="text-center">{item.pointsRequired ?? "-"}</td>
                        <td className="text-start" title={item.description || ''}>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description || "-"}
                            </div>
                        </td>
                        <td className="text-center">
                            <span className={`badge ${item.itemType === 'SUBSCRIPTION' ? 'bg-info' : 'bg-secondary'}`}>
                                {item.itemType || "N/A"}
                            </span>
                        </td>
                        <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                            <button
                                className="btn btn-sm btn-outline-warningA border-0"
                                onClick={() => navigate(`/admin/training-packages/edit/${item.itemId}`)}
                                title="Sửa gói tập"
                                disabled={isLoading}
                            >
                            <FaEdit />
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger border-0"
                                onClick={() => handleDelete(item.itemId)}
                                title="Xóa gói tập"
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

  // Determine view based on URL path (new, edit, or list)
  const currentPath = location.pathname;
  const showForm = currentPath.endsWith("/new") || currentPath.includes("/edit/");

  return (
    <div className="container my-4">
        {showForm ? renderForm() : renderTable()}
    </div>
  );
};

export default PackageManagement;