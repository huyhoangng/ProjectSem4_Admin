import React, { useState } from "react";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([
    { id: 1, firstName: "John", lastName: "Doe", email: "john@example.com" },
    { id: 2, firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
  ]);

  // Trạng thái cho chỉnh sửa
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

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

  // Lưu cập nhật
  const handleSave = () => {
    setAdmins((prevAdmins) =>
      prevAdmins.map((admin) =>
        admin.id === editingAdminId ? { ...editFormData } : admin
      )
    );
    setEditingAdminId(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Admin Account Management</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
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
