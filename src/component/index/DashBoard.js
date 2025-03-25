import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/DashBoard.css";

Chart.register(...registerables);

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [packageUserCount, setPackageUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [annualRevenue, setAnnualRevenue] = useState([]);
  const [error, setError] = useState(null);

  const token = sessionStorage.getItem("token");

  const fetchData = async (url, setState, isCount = false) => {
    if (!token) {
      setError("Không tìm thấy token, vui lòng đăng nhập lại!");
      return;
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
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const data = await response.json();
      setState(isCount ? data.length : data);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchData("http://54.251.220.228:8080/trainingSouls/users", setUserCount, true);
    fetchData("http://54.251.220.228:8080/trainingSouls/items", setPackageUserCount, (data) =>
      data.filter((pkg) => pkg.subscribedUsers?.length > 0).length
    );
    fetchData("http://54.251.220.228:8080/trainingSouls/posts/getAllPost", setPostCount, true);
    fetchData("http://54.251.220.228:8080/api/revenue/monthly", setMonthlyRevenue);
    fetchData("http://54.251.220.228:8080/api/revenue/annual", setAnnualRevenue);
  }, []);

  const userChartData = {
    labels: ["Người dùng", "User đăng ký gói", "Bài post"],
    datasets: [
      {
        label: "Thống kê",
        data: [userCount, packageUserCount, postCount],
        borderColor: "#28a745",
        backgroundColor: "rgba(40, 167, 69, 0.2)",
        fill: true,
      },
    ],
  };

  const revenueChartData = {
    labels: annualRevenue.map((data) => data.month),
    datasets: [
      {
        label: "Doanh thu",
        data: annualRevenue.map((data) => data.revenue),
        borderColor: "#ffc107",
        backgroundColor: "rgba(255, 193, 7, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Training Soul Dashboard</h2>
      <p>Here's what’s going on at your business </p>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Bảng thống kê trong 1 tháng */}
      <div className="card p-3 mt-4 dashboard-table-container">
  <h3>Statistics This Month</h3>
  <table className="dashboard-table">
    <thead>
      <tr>
        <th>Thông số</th>
        <th>Số lượng</th>
        <th>Thay đổi</th>
        <th>Ghi chú</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Người dùng mới</td>
        <td>{userCount}</td>
        <td>🔼 +30%</td>
        <td>So với tháng trước</td>
      </tr>
      <tr>
        <td>User đăng ký gói</td>
        <td>{packageUserCount}</td>
        <td>🔼 +15%</td>
        <td>Khách hàng trả phí</td>
      </tr>
      <tr>
        <td>Bài post mới</td>
        <td>{postCount}</td>
        <td>🔽 -10%</td>
        <td>Hoạt động nội dung</td>
      </tr>
      <tr>
        <td>Doanh thu tháng</td>
        <td>${monthlyRevenue}</td>
        <td>🔼 +20%</td>
        <td>Tổng doanh thu</td>
      </tr>
    </tbody>
  </table>
</div>
      {/* Bảng thống kê theo 12 tháng */}
      <div className="card p-3 mt-4">
        <h3>Statistics in 12 Months</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {annualRevenue.map((data, index) => (
              <tr key={index}>
                <td>{data.month}</td>
                <td>${data.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Biểu đồ người dùng */}
      <div className="card mt-4 p-3">
        <h3>User & Post Growth</h3>
        <p>Number of users, package subscribers, and posts</p>
        <Line data={userChartData} />
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="card mt-4 p-3">
        <h3>Revenue Over 12 Months</h3>
        <p>Monthly revenue trends</p>
        <Line data={revenueChartData} />
      </div>
    </div>
  );
};

export default Dashboard;
