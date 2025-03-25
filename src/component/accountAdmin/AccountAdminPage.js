import React, { useState } from "react";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([
    { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com", role: "Super Admin" },
    { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "Moderator" },
  ]);

  // Trạng thái cho chỉnh sửa
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Trạng thái cho thêm admin
  const [newAdmin, setNewAdmin] = useState({ firstName: "", lastName: "", email: "", role: "Editor" });

  // Xử lý xóa admin
  const handleDelete = (id) => {
    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.id !== id));
  };

  // Xử lý khi nhấn "Edit"
  const handleEdit = (admin) => {
    setEditingAdminId(admin.id);
    setEditFormData({ ...admin }); // Tạo một bản sao để chỉnh sửa
  };

  // Xử lý thay đổi input trong form chỉnh sửa
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Lưu cập nhật admin
  const handleSave = () => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) =>
        admin.id === editingAdminId ? { ...editFormData } : admin
      )
    );
    setEditingAdminId(null);
  };

  // Xử lý thay đổi input trong form thêm admin
  const handleNewAdminChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Xử lý thêm admin mới
  const handleAddAdmin = () => {
    if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.email) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const newId = admins.length > 0 ? admins[admins.length - 1].id + 1 : 1;
    setAdmins([...admins, { id: newId, ...newAdmin }]);

    // Reset form sau khi thêm
    setNewAdmin({ firstName: "", lastName: "", email: "", role: "Editor" });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Account Management</h2>

      {/* Form Thêm Admin */}
      <div className="card p-3 mb-4 shadow-sm">
        <h4>➕ Add New Admin</h4>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="firstName"
              placeholder="First Name"
              value={newAdmin.firstName}
              onChange={handleNewAdminChange}
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="lastName"
              placeholder="Last Name"
              value={newAdmin.lastName}
              onChange={handleNewAdminChange}
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={handleNewAdminChange}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-control"
              name="role"
              value={newAdmin.role}
              onChange={handleNewAdminChange}
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Moderator">Moderator</option>
              <option value="Editor">Editor</option>
            </select>
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary w-100" onClick={handleAddAdmin}>
              ➕ Add
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách Admin */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin, index) => (
            <tr key={admin.id}>
              <td>{index + 1}</td>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={editFormData?.firstName || ""}
                    onChange={handleChange}
                  />
                ) : (
                  admin.firstName
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={editFormData?.lastName || ""}
                    onChange={handleChange}
                  />
                ) : (
                  admin.lastName
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={editFormData?.email || ""}
                    onChange={handleChange}
                  />
                ) : (
                  admin.email
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <select
                    className="form-control"
                    name="role"
                    value={editFormData?.role || ""}
                    onChange={handleChange}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Editor">Editor</option>
                  </select>
                ) : (
                  admin.role
                )}
              </td>
              <td>
                {editingAdminId === admin.id ? (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={handleSave}>Save</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingAdminId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(admin)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(admin.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminManagement;
