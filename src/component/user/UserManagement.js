import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', package: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🟢 Lấy danh sách người dùng từ API kèm token
  const fetchUsers = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("Không tìm thấy token!");
      return;
    }

    try {
      const response = await axios.get('http://54.251.220.228:8080/trainingSouls/users', {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
    }
  };

  // 🟡 Khi nhấn nút "Chỉnh sửa"
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, package: user.package });
    setShowEditModal(true);
  };

  // 🔵 Lưu thay đổi khi chỉnh sửa user
  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token!");
      return;
    }

    try {
      await axios.put(
        `http://54.251.220.228:8080/trainingSouls/users/${selectedUser.userID}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      setShowEditModal(false);
      fetchUsers(); // Cập nhật danh sách người dùng sau khi chỉnh sửa
    } catch (error) {
      console.error('Lỗi khi cập nhật user:', error.response?.data || error);
    }
  };

  // 🔴 Xóa user
  const handleDelete = async (userID) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token!");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      await axios.delete(
        `http://54.251.220.228:8080/trainingSouls/users/${userID}`,
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );
      fetchUsers(); // Cập nhật danh sách người dùng sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa user:', error.response?.data || error);
    }
  };

  // 🟢 Mở modal thêm user
  const handleAddUser = () => {
    setFormData({ name: '', email: '', package: '' });
    setShowAddModal(true);
  };

  // 🟡 Thêm user mới
  const handleCreateUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Không tìm thấy token!");
      return;
    }

    if (!formData.name || !formData.email || !formData.package) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      await axios.post(
        `http://54.251.220.228:8080/trainingSouls/users`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      setShowAddModal(false);
      fetchUsers(); // Cập nhật danh sách người dùng sau khi thêm
    } catch (error) {
      console.error('Lỗi khi thêm user:', error.response?.data || error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Quản lý tài khoản người dùng</h2>
      {/* <Button variant="success" className="mb-3" onClick={handleAddUser}>+ Thêm người dùng</Button> */}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Gói đăng ký</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.package}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEditClick(user)}>Chỉnh sửa</Button>{' '}
                  {/* <Button variant="danger" onClick={() => handleDelete(user.userID)}>Xóa</Button> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal chỉnh sửa tài khoản */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Chỉnh sửa tài khoản</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group><Form.Label>Tên</Form.Label><Form.Control type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></Form.Group>
            <Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></Form.Group>
            <Form.Group><Form.Label>Gói đăng ký</Form.Label><Form.Control as="select" value={formData.package} onChange={(e) => setFormData({ ...formData, package: e.target.value })}>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </Form.Control></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Lưu</Button>
        </Modal.Footer>
      </Modal>
        {/* 🔝 Nút quay lên đầu trang */}
        <button
  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
  title="Lên đầu trang"
  style={{
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    border: 'none',
    background: 'transparent',
    fontSize: '2rem',
    cursor: 'pointer'
  }}
>
  ⬆️
</button>

    </div>
  );
};

export default UserManagement;
