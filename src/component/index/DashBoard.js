import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2"; // Using Bar chart
import { Chart, registerables } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/DashBoard.css"; // Keep your custom styles if needed

Chart.register(...registerables);

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [rawItemsData, setRawItemsData] = useState([]); // State to hold raw items
  const [packageUserCount, setPackageUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [annualRevenue, setAnnualRevenue] = useState([]);
  const [error, setError] = useState(null); // State to hold any fetch error

  const token = sessionStorage.getItem("token");

  // fetchData function to get data from API
  const fetchData = async (url, setState) => {
    // Clear previous error before a new fetch attempt (optional, depends on desired behavior)
    // setError(null); 
    if (!token) {
      setError("Không tìm thấy token, vui lòng đăng nhập lại!");
      return null;
    }
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Throw an error that includes the status and URL for better debugging
        throw new Error(`Lỗi HTTP ${response.status} khi truy cập ${url}`);
      }

      const data = await response.json();
      setState(data);
      return data;
    } catch (err) {
      // Catch fetch errors (like network issues, CORS, etc.) or errors thrown above
      console.error("Lỗi khi gọi API:", err);
      // Set the error state with the error message
      setError(err.message || "Đã xảy ra lỗi không xác định khi tải dữ liệu."); 
      return null;
    }
  };

  // Initial data fetching on component mount
  useEffect(() => {
    Promise.allSettled([
        fetchData("http://54.251.220.228:8080/trainingSouls/users", (data) => {
          setUserCount(data?.length ?? 0);
          const premiumUsers = data?.filter(user => user.accountType?.toLowerCase() === 'premium').length ?? 0;
          setPackageUserCount(premiumUsers);
        }),
        fetchData("http://54.251.220.228:8080/trainingSouls/items", setRawItemsData),
        fetchData(
          "http://54.251.220.228:8080/trainingSouls/posts/getAllPost",
          (data) => setPostCount(data?.length ?? 0)
        ),
        // Update revenue fetching
        fetchData("http://54.251.220.228:8080/trainingSouls/PurchaseTransaction", (data) => {
          if (Array.isArray(data)) {
            // Calculate monthly revenue (current month)
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            
            const monthlyTransactions = data.filter(transaction => {
              const transactionDate = new Date(transaction.transactionTime);
              return transactionDate.getMonth() === currentMonth && 
                     transactionDate.getFullYear() === currentYear &&
                     transaction.status?.toUpperCase() === 'SUCCESS';
            });
            
            const monthlyTotal = monthlyTransactions.reduce((sum, transaction) => 
              sum + (transaction.amount || 0), 0);
            setMonthlyRevenue(monthlyTotal);

            // Calculate annual revenue (last 12 months)
            const annualData = Array.from({ length: 12 }, (_, i) => {
              const month = (currentMonth - i + 12) % 12;
              const year = currentYear - Math.floor((currentMonth - i) / 12);
              
              const monthTransactions = data.filter(transaction => {
                const transactionDate = new Date(transaction.transactionTime);
                return transactionDate.getMonth() === month && 
                       transactionDate.getFullYear() === year &&
                       transaction.status?.toUpperCase() === 'SUCCESS';
              });
              
              const monthTotal = monthTransactions.reduce((sum, transaction) => 
                sum + (transaction.amount || 0), 0);
              
              return {
                month: new Date(year, month).toLocaleString('vi-VN', { month: 'long' }),
                revenue: monthTotal
              };
            }).reverse();

            setAnnualRevenue(annualData);
          }
        })
    ]).then(results => {
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.warn(`API call ${index} failed:`, result.reason);
            }
        });
    });
  }, []); // Empty dependency array: runs once on mount

  // --- Chart Data Configurations ---

  // User & Post Growth Chart (Bar Chart) Data
  const userChartData = {
    labels: ["Tổng số người dùng", "Người dùng Premium", "Tổng số bài viết"],
    datasets: [
      {
        label: "Số lượng",
        data: [userCount, packageUserCount, postCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Blue
          'rgba(75, 192, 192, 0.6)', // Green
          'rgba(255, 159, 64, 0.6)'  // Orange
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Revenue Chart (Bar Chart) Data
  const revenueChartData = {
    labels: annualRevenue.map(data => data.month),
    datasets: [
      {
        label: "Doanh thu hàng tháng",
        data: annualRevenue.map(data => data.revenue),
        borderColor: "#ffc107",
        backgroundColor: "rgba(255, 193, 7, 0.5)",
        borderWidth: 1,
      },
    ],
  };

  // Helper to format currency
  const formatCurrency = (amount) => {
     const value = amount ?? 0;
     return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // --- Component Return (JSX) ---
  return (
    <div className="container mt-4">
      <div className="bg-primary-subtle p-4 mb-4 rounded-3 text-center">
  {/* h2 and p elements are now inside this div */}
  <h1 className="mb-2">Training Soul DashBoard</h1>
  <p className="mb-0 text-muted">Đây là những gì đang diễn ra tại doanh nghiệp của chúng ta! </p>
</div>

      {/* --- Improved Error Display --- */}
      {/* Shows a warning with potential causes if the 'error' state is set */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Không thể tải đầy đủ dữ liệu cho bảng điều khiển!</strong>
          <br />
          Một số thông tin có thể không được hiển thị hoặc hiển thị không chính xác. Nguyên nhân có thể là:
          <ul>
            <li>Kết nối mạng của bạn không ổn định.</li>
            <li>Máy chủ dữ liệu (API) đang tạm thời không phản hồi hoặc đang bảo trì.</li>
            <li>
              Lỗi cấu hình CORS trên máy chủ API (Nhấn F12, mở tab "Console"
              để xem chi tiết lỗi kỹ thuật nếu có).
            </li>
          </ul>
          Vui lòng thử tải lại trang sau ít phút. Nếu vấn đề vẫn tiếp diễn, hãy liên hệ bộ phận kỹ thuật.
          <br />
          <small><i>Chi tiết lỗi: {error}</i></small> {/* Show technical error subtly */}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button> {/* Allow dismissing the error */}
        </div>
      )}

      {/* --- Monthly Statistics Cards --- */}
      <h3 className="mb-3">Thống kê trong tháng</h3>
      <div className="row mb-4">
        {/* Card 1: Total Users */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Tổng số người dùng</h5>
              <p className="card-text fs-4 fw-bold">{userCount}</p>
              <p className="card-text text-success small">🔼 +30% (so với tháng trước)</p> {/* Placeholder % */}
            </div>
          </div>
        </div>
        {/* Card 2: Package Subscribers */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Người dùng Premium</h5>
              <p className="card-text fs-4 fw-bold">{packageUserCount}</p>
              <p className="card-text text-success small">🔼 +15% (người dùng trả phí)</p>
            </div>
          </div>
        </div>
        {/* Card 3: Total Posts */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Tổng số bài viết</h5>
              <p className="card-text fs-4 fw-bold">{postCount}</p>
              <p className="card-text text-danger small">🔽 -10% (hoạt động nội dung)</p> {/* Placeholder % */}
            </div>
          </div>
        </div>
        {/* Card 4: Monthly Revenue */}
        <div className="col-md-6 col-lg-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">Doanh thu tháng</h5>
              <p className="card-text fs-4 fw-bold">{formatCurrency(monthlyRevenue)}</p>
              <p className="card-text text-success small">🔼 +20% (doanh thu gộp)</p> {/* Placeholder % */}
            </div>
          </div>
        </div>
      </div>

      {/* --- Annual Revenue Table (Optional) --- */}



      {/* --- Charts Row --- */}
      <div className="row">
        {/* User & Post Growth Chart (Bar) */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Tăng trưởng Người dùng & Bài viết</h5>
              <p className="card-text small text-muted">Tổng quan về người dùng, người đăng ký gói và bài viết.</p>
               {/* Conditionally render chart only if no error or data exists */}
              {!error || userCount > 0 || packageUserCount > 0 || postCount > 0 ? (
                <Bar data={userChartData} options={{ responsive: true, maintainAspectRatio: true }}/>
              ) : (
                <p className="text-center text-muted mt-3">Không có dữ liệu để vẽ biểu đồ.</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Over 12 Months Chart (Bar) */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Doanh thu 12 tháng</h5>
              <p className="card-text small text-muted">Xu hướng doanh thu hàng tháng.</p>
              {/* Conditionally render chart only if no error or data exists */}
               {!error || annualRevenue.length > 0 ? (
                 <Bar data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true }}/>
               ) : (
                 <p className="text-center text-muted mt-3">Không có dữ liệu để vẽ biểu đồ.</p>
               )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;