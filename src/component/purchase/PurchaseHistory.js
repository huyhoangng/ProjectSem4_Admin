import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';
import { BsCalendarRange } from 'react-icons/bs'; // Icon cho khoảng ngày

// --- CÁC HÀM TRỢ GIÚP GIỮ NGUYÊN ---
const formatStatus = (status) => {
  const upperStatus = status?.toUpperCase();
  switch (upperStatus) {
    case 'PENDING':
      return <span className="badge bg-warning text-dark">Đang chờ</span>;
    case 'COMPLETED':
    case 'SUCCESS':
      return <span className="badge bg-success">Thành công</span>;
    case 'FAILED':
      return <span className="badge bg-danger">Thất bại</span>;
    case 'CANCELLED':
      return <span className="badge bg-secondary">Đã hủy</span>;
    default:
      return <span className="badge bg-light text-dark">{status || 'N/A'}</span>;
  }
};

const formatType = (type, points) => {
   const upperType = type?.toUpperCase();
   if (upperType === 'EARN') return <span className="text-success fw-bold">Nạp/Nhận điểm</span>;
   if (upperType === 'SPEND') return <span className="text-danger fw-bold">Sử dụng điểm</span>;
   if (upperType === 'PURCHASE') return <span className="text-primary fw-bold">Mua hàng</span>;
   if (typeof points === 'number') {
        if (points > 0 && upperType !== 'EARN') return <span className="text-success">Tăng điểm</span>;
        if (points < 0 && upperType !== 'SPEND') return <span className="text-danger">Giảm điểm</span>;
   }
   return type || 'N/A';
}

const PurchaseHistory = () => {
  const [allPurchaseHistory, setAllPurchaseHistory] = useState([]);
  const [filteredPurchaseHistory, setFilteredPurchaseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate hiện tại không được dùng trong useEffect, có thể bỏ dependency

  // --- STATE CHO TÌM KIẾM ---
  const [searchTermId, setSearchTermId] = useState('');
  const [searchStartDate, setSearchStartDate] = useState(''); // Đổi tên từ searchDate
  const [searchEndDate, setSearchEndDate] = useState('');   // Thêm state cho ngày kết thúc

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('token');

      if (!token) {
        setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          'http://54.251.220.228:8080/trainingSouls/PointsTransaction',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        let historyData = [];
        if (Array.isArray(response.data)) {
             historyData = response.data;
        } else if (response.data && Array.isArray(response.data.result)) {
            historyData = response.data.result;
        } else {
          console.warn("Cấu trúc dữ liệu từ PointsTransaction không mong đợi:", response.data);
          setError("Không thể lấy dữ liệu lịch sử giao dịch hoặc định dạng không đúng.");
          setAllPurchaseHistory([]);
          setFilteredPurchaseHistory([]);
          setLoading(false);
          return;
        }

        historyData.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB - dateA;
        });
        setAllPurchaseHistory(historyData);
        setFilteredPurchaseHistory(historyData);

      } catch (err) {
        console.error("Lỗi khi lấy lịch sử giao dịch (PointsTransaction):", err);
        let errorMessage = "Đã xảy ra lỗi khi tải lịch sử giao dịch.";
        if (err.response) {
           errorMessage += ` (Lỗi ${err.response.status})`;
           if (err.response.status === 401 || err.response.status === 403) {
               errorMessage = "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.";
           } else if (err.response.data && (err.response.data.message || err.response.data.error)) {
               errorMessage = err.response.data.message || err.response.data.error;
           }
        } else if (err.request) {
          errorMessage = "Không thể kết nối đến máy chủ.";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []); // Bỏ navigate nếu không dùng, hoặc thêm nếu logic thực sự phụ thuộc vào nó

  // --- EFFECT ĐỂ LỌC KHI TERM THAY ĐỔI ---
  useEffect(() => {
    let filteredData = allPurchaseHistory;

    // Lọc theo ID
    if (searchTermId.trim()) { // Chỉ lọc nếu có giá trị, trim() để loại bỏ khoảng trắng
      filteredData = filteredData.filter(item =>
        item.transactionId.toString().includes(searchTermId.trim())
      );
    }

    // Lọc theo Khoảng Ngày
    if (searchStartDate || searchEndDate) {
      filteredData = filteredData.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0); // Chuẩn hóa itemDate về đầu ngày để so sánh chỉ ngày

        let match = true;
        if (searchStartDate) {
          const startDate = new Date(searchStartDate);
          startDate.setHours(0,0,0,0); // Chuẩn hóa
          match = match && itemDate >= startDate;
        }
        if (searchEndDate) {
          const endDate = new Date(searchEndDate);
          endDate.setHours(23,59,59,999); // Chuẩn hóa endDate về cuối ngày
          match = match && itemDate <= endDate;
        }
        return match;
      });
    }
    setFilteredPurchaseHistory(filteredData);
  }, [searchTermId, searchStartDate, searchEndDate, allPurchaseHistory]);


  const handleResetSearch = () => {
    setSearchTermId('');
    setSearchStartDate('');
    setSearchEndDate('');
  };

  // --- PHẦN RENDER ---
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <strong>Lỗi:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <h2 className="mb-0">Lịch Sử Giao Dịch</h2>
      </div>

      {/* --- THANH TÌM KIẾM --- */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4"> {/* Giảm độ rộng cột ID */}
              <label htmlFor="searchTermIdInput" className="form-label">Tìm theo ID Giao dịch</label>
              <div className="input-group">
                <span className="input-group-text"><FaSearch /></span>
                <input
                  type="text"
                  className="form-control"
                  id="searchTermIdInput"
                  placeholder="Nhập ID..."
                  value={searchTermId}
                  onChange={(e) => setSearchTermId(e.target.value)}
                />
              </div>
            </div>
            {/* --- Ô TÌM KIẾM KHOẢNG NGÀY --- */}
            <div className="col-md-6"> {/* Tăng độ rộng cột ngày */}
              <label htmlFor="searchStartDateInput" className="form-label">Tìm theo Khoảng Ngày</label>
              <div className="input-group">
                <span className="input-group-text"><BsCalendarRange /></span>
                <input
                  type="date"
                  className="form-control"
                  id="searchStartDateInput"
                  value={searchStartDate}
                  onChange={(e) => setSearchStartDate(e.target.value)}
                  aria-label="Ngày bắt đầu"
                />
                <span className="input-group-text">đến</span>
                <input
                  type="date"
                  className="form-control"
                  id="searchEndDateInput"
                  value={searchEndDate}
                  onChange={(e) => setSearchEndDate(e.target.value)}
                  min={searchStartDate || undefined} // Ngày kết thúc không được trước ngày bắt đầu
                  aria-label="Ngày kết thúc"
                />
              </div>
            </div>
            {/* --- KẾT THÚC Ô TÌM KIẾM KHOẢNG NGÀY --- */}
            <div className="col-md-2 d-grid">
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                onClick={handleResetSearch}
                title="Xóa bộ lọc"
              >
                <FaTimesCircle className="me-2" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>


      {filteredPurchaseHistory.length === 0 && !loading ? (
        <div className="alert alert-info text-center" role="alert">
          {(searchTermId || searchStartDate || searchEndDate) // Kiểm tra cả ba term
            ? "Không tìm thấy giao dịch nào khớp với tiêu chí tìm kiếm."
            : "Bạn chưa có giao dịch nào."
          }
        </div>
      ) : (
        <div className="card shadow-sm">
           <div className="card-body p-0">
              <div className="table-responsive">
                 <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="text-center py-3">ID Giao dịch</th>
                      <th scope="col" className="py-3">Mô tả</th>
                      <th scope="col" className="text-center py-3">Ngày</th>
                      <th scope="col" className="text-center py-3">Loại</th>
                      <th scope="col" className="text-end py-3 pe-3">Điểm</th>
                      <th scope="col" className="text-center py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchaseHistory.map((item) => (
                      <tr key={item.transactionId}>
                        <td className="text-center"><code>{item.transactionId}</code></td>
                        <td>{item.description || 'N/A'}</td>
                        <td className="text-center">
                          {item.date
                            ? new Date(item.date).toLocaleString('vi-VN', {
                                year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                              })
                            : 'N/A'}
                        </td>
                         <td className="text-center">{formatType(item.type, item.points)}</td>
                        <td className={`text-end fw-bold pe-3 ${item.points >= 0 ? 'text-success' : 'text-danger'}`}>
                           {item.type === 'SPEND' && item.points > 0 ? '-' : (item.points > 0 && item.type !== 'SPEND' ? '+' : '')}
                           {Math.abs(item.points)?.toLocaleString('vi-VN') || '0'}
                        </td>
                        <td className="text-center">
                          {formatStatus(item.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;