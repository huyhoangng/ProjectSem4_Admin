import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Import Badge if used elsewhere, otherwise optional
import { Table, Button, Form, Container, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { BsPencilSquare, BsArrowUpCircleFill, BsInfoCircleFill, BsCheckCircleFill, BsExclamationTriangleFill } from "react-icons/bs";

// --- Ensure react-icons is installed and Bootstrap Icons CSS is included ---

const UserManagement = () => {
    // === State (remains the same) ===
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '',
    });
    const [loadingList, setLoadingList] = useState(true);
    const [loadingEditData, setLoadingEditData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // === Effects (remains the same) ===
    useEffect(() => { fetchUsers(); }, []);
    useEffect(() => {
        if (editingUserId !== null) {
            fetchUserDataForEdit(editingUserId);
        } else {
            setFormData({ name: '', email: '', phoneNumber: '' });
            setEditError(null);
            setSaveSuccess(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingUserId]);

    // === API Functions (remains the same) ===
    const fetchUsers = async () => {
        setLoadingList(true); setError(null);
        const token = sessionStorage.getItem("token");
        if (!token) { setError("Không tìm thấy token xác thực."); setLoadingList(false); return; }
        try {
            const response = await axios.get('http://54.251.220.228:8080/trainingSouls/users', { headers: { "Authorization": `Bearer ${token}` } });
            setUsers(response.data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || b.userID - a.userID));
        } catch (err) { console.error('Lỗi:', err); setError(err.response?.data?.message || err.message || 'Lỗi tải danh sách.'); }
        finally { setLoadingList(false); }
    };

    const fetchUserDataForEdit = async (userId) => {
        setLoadingEditData(true); setEditError(null); setSaveSuccess(false);
        const token = sessionStorage.getItem("token");
        if (!token) { setEditError("Không tìm thấy token xác thực."); setLoadingEditData(false); return; }
        try {
            const response = await axios.get(`http://54.251.220.228:8080/trainingSouls/users/${userId}`, { headers: { "Authorization": `Bearer ${token}` } });
            const { name, email, phoneNumber } = response.data;
            setFormData({ name, email, phoneNumber: phoneNumber || '' });
        } catch (err) { console.error(`Lỗi user ${userId}:`, err); setEditError(err.response?.data?.message || err.message || `Lỗi tải user ID: ${userId}.`); }
        finally { setLoadingEditData(false); }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault(); if (!editingUserId) return;
        setSaving(true); setEditError(null); setSaveSuccess(false);
        const token = sessionStorage.getItem("token");
        if (!token) { setEditError("Hết hạn phiên làm việc."); setSaving(false); return; }
        try {
            await axios.put(`http://54.251.220.228:8080/trainingSouls/users/${editingUserId}`, formData, { headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } });
            setSaveSuccess(true); await fetchUsers();
            setTimeout(() => { setEditingUserId(null); }, 1500);
        } catch (err) { console.error('Lỗi cập nhật:', err); setEditError(err.response?.data?.message || err.message || 'Lỗi khi lưu.'); }
        finally { setSaving(false); }
     };

    // === Helper Functions (remains the same) ===
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return format(new Date(dateString), 'dd/MM/yyyy HH:mm'); }
        catch (e) { return dateString; }
     };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
     };

    // === Render Logic ===

    // --- Render Form Chỉnh Sửa (remains the same) ---
    const renderEditForm = () => {
        if (loadingEditData) { return ( <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Đang tải dữ liệu...</p></div> ); }
        return (
          <Card className="shadow-sm"> {/* Default Card border */}
            <Card.Header className="bg-primary text-white">
              <Card.Title as="h5" className="mb-0 d-flex align-items-center">
                <BsPencilSquare className="me-2" />
                Chỉnh sửa thông tin người dùng (ID: {editingUserId})
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {editError && <Alert variant="danger" className="d-flex align-items-center"><BsExclamationTriangleFill className="me-2"/>{editError}</Alert>}
              {saveSuccess && <Alert variant="success" className="d-flex align-items-center"><BsCheckCircleFill className="me-2"/>Đã lưu thành công!</Alert>}
              <Form onSubmit={handleSaveChanges}>
                <Form.Floating className="mb-3">
                  <Form.Control type="text" id="formEditUserName" placeholder="Tên người dùng" name="name" value={formData.name} onChange={handleFormChange} required />
                  <label htmlFor="formEditUserName">Tên</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                  <Form.Control type="email" id="formEditUserEmail" placeholder="Email" name="email" value={formData.email} onChange={handleFormChange} required />
                   <label htmlFor="formEditUserEmail">Email</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                   <Form.Control type="tel" id="formEditUserPhone" placeholder="Số điện thoại" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} />
                   <label htmlFor="formEditUserPhone">Số điện thoại</label>
                </Form.Floating>
                <div className="d-flex justify-content-end border-top pt-3 mt-4">
                  <Button variant="outline-secondary" onClick={() => setEditingUserId(null)} className="me-2 px-4" disabled={saving}>Hủy</Button>
                  <Button variant="primary" type="submit" disabled={saving || loadingEditData} className="px-4">
                    {saving ? <><Spinner as="span" size="sm" className="me-2" /> Đang lưu...</> : 'Lưu thay đổi'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        );
      };


    // --- Render Bảng Danh Sách User (HOVER EFFECT UPDATED) ---
    const renderUserList = () => {
        if (loadingList) { return ( <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Đang tải danh sách...</p></div> ); }

        return (
          <>
            <h3 className="mb-3 fw-bold">Danh sách người dùng</h3>
            <Card className="shadow-sm rounded-3 overflow-hidden">
              <Card.Body className="p-0">
                {error && !editingUserId && <Alert variant="danger" className="d-flex align-items-center m-3"><BsExclamationTriangleFill className="me-2"/>{error}</Alert>}
                <div className="table-responsive">
                  <Table striped hover responsive table-bordered align-middle className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 fw-semibold text-center">Tên</th>
                        <th className="py-3 fw-semibold text-center">Email</th>
                        <th className="py-3 fw-semibold text-center">Điện thoại</th>
                        <th className="py-3 fw-semibold text-center">Ngày tạo</th>
                        <th className="py-3 fw-semibold text-center">Cập nhật lần cuối</th>
                        <th className="py-3 fw-semibold text-center pe-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.userID}>
                            <td className="text-start ps-3">{user.name || <span className='text-muted fst-italic'>Chưa có</span>}</td>
                            <td className="text-start">{user.email || <span className='text-muted fst-italic'>Chưa có</span>}</td>
                            <td className="text-center">{user.phoneNumber || <span className='text-muted'>-</span>}</td>
                            <td className="text-center">{formatDate(user.createdAt)}</td>
                            <td className="text-center">{formatDate(user.updatedAt)}</td>
                            <td className="text-center pe-3">
                              {/* --- BUTTON MODIFIED FOR HOVER EFFECT --- */}
                              <Button
                                variant="outline-warning" // Use warning variant for orange theme
                                size="sm"
                                onClick={() => setEditingUserId(user.userID)}
                                title="Chỉnh sửa người dùng"
                                // Removed border-0, outline variant handles it
                                className="d-inline-flex align-items-center justify-content-center p-1"
                              >
                                {/* Keep initial Orange color */}
                                <BsPencilSquare size="1.3em" color='Orange'/>
                              </Button>
                              {/* --- END OF BUTTON MODIFICATION --- */}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center p-5">
                              <BsInfoCircleFill size="2em" className="text-muted mb-2" />
                              <p className="mb-0 text-muted">Không tìm thấy người dùng nào.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        );
      };

    // === Main Return (Scroll-to-top button remains the same) ===
    return (
        <Container className="mt-4 mb-5">
            {editingUserId !== null ? renderEditForm() : renderUserList()}
            <Button
                variant="dark"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Lên đầu trang"
                className="rounded-circle shadow position-fixed p-0 d-flex align-items-center justify-content-center"
                style={{ bottom: '30px', right: '30px', zIndex: 1000, width: '45px', height: '45px' }}
            >
                <BsArrowUpCircleFill size="1.5em" color="white"/>
            </Button>
        </Container>
    );
};

export default UserManagement;