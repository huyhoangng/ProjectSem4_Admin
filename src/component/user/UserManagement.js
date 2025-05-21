import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Card, Alert, Spinner, Badge } from 'react-bootstrap';
// import { format } from 'date-fns'; // Không dùng trong code này nữa nếu không có cột ngày tháng
import { BsPencilSquare, BsTrashFill, BsArrowUpCircleFill, BsInfoCircleFill, BsCheckCircleFill, BsExclamationTriangleFill, BsSearch, BsXCircleFill } from "react-icons/bs";

const formatAccountType = (type) => {
    // ... (giữ nguyên)
    if (!type) return <Badge bg="secondary">N/A</Badge>;
    switch (type.toLowerCase()) {
        case 'basic':
            return <Badge bg="info">Basic</Badge>;
        case 'premium':
            return <Badge bg="success">Premium</Badge>;
        case 'admin': // Vẫn giữ lại nếu có admin, nhưng không hiển thị trong bảng riêng
            return <Badge bg="danger">Admin</Badge>;
        default:
            return <Badge bg="dark">{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
    }
};


const UserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // Đây vẫn là danh sách đã lọc theo search terms
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '',
        accountType: 'basic', points: 0, level: 1, streak: 0,
    });
    const [loadingList, setLoadingList] = useState(true);
    const [loadingEditData, setLoadingEditData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [searchTermId, setSearchTermId] = useState('');
    const [searchTermName, setSearchTermName] = useState('');
    const [searchTermEmail, setSearchTermEmail] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        if (editingUserId !== null) {
            fetchUserDataForEdit(editingUserId);
        } else {
            setFormData({
                name: '', email: '', phoneNumber: '',
                accountType: 'basic', points: 0, level: 1, streak: 0
            });
            setEditError(null);
            setSaveSuccess(false);
        }
    }, [editingUserId]);

    useEffect(() => {
        let filtered = allUsers;
        if (searchTermId.trim()) {
            filtered = filtered.filter(user => user.userID.toString().includes(searchTermId.trim()));
        }
        if (searchTermName.trim()) {
            filtered = filtered.filter(user => user.name?.toLowerCase().includes(searchTermName.trim().toLowerCase()));
        }
        if (searchTermEmail.trim()) {
            filtered = filtered.filter(user => user.email?.toLowerCase().includes(searchTermEmail.trim().toLowerCase()));
        }
        setFilteredUsers(filtered);
    }, [searchTermId, searchTermName, searchTermEmail, allUsers]);

    const fetchUsers = async () => { /* ... (giữ nguyên) ... */
        setLoadingList(true); setError(null);
        const token = sessionStorage.getItem("token");
        if (!token) { setError("Không tìm thấy token xác thực."); setLoadingList(false); return; }
        try {
            const response = await axios.get('http://54.251.220.228:8080/trainingSouls/users', { headers: { "Authorization": `Bearer ${token}` } });
            const sortedUsers = response.data.sort((a, b) => (b.userID || 0) - (a.userID || 0));
            setAllUsers(sortedUsers);
        } catch (err) {
            console.error('Lỗi tải danh sách người dùng:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi tải danh sách người dùng.');
        } finally {
            setLoadingList(false);
        }
    };
    const fetchUserDataForEdit = async (userId) => { /* ... (giữ nguyên) ... */
        setLoadingEditData(true); setEditError(null); setSaveSuccess(false);
        const token = sessionStorage.getItem("token");
        if (!token) { setEditError("Không tìm thấy token xác thực."); setLoadingEditData(false); return; }
        try {
            const response = await axios.get(`http://54.251.220.228:8080/trainingSouls/users/${userId}`, { headers: { "Authorization": `Bearer ${token}` } });
            const { name, email, phoneNumber, accountType, points, level, streak } = response.data;
            setFormData({
                name: name || '', email: email || '', phoneNumber: phoneNumber || '',
                accountType: accountType || 'basic', points: points || 0,
                level: level || 1, streak: streak || 0,
            });
        } catch (err) {
            console.error(`Lỗi tải dữ liệu người dùng ${userId}:`, err);
            setEditError(err.response?.data?.message || err.message || `Lỗi tải dữ liệu người dùng ID: ${userId}.`);
        } finally {
            setLoadingEditData(false);
        }
    };
    const handleSaveChanges = async (e) => { /* ... (giữ nguyên) ... */
        e.preventDefault(); if (!editingUserId) return;
        setSaving(true); setEditError(null); setSaveSuccess(false);
        const token = sessionStorage.getItem("token");
        if (!token) { setEditError("Hết hạn phiên làm việc."); setSaving(false); return; }

        const payload = {
            name: formData.name,
            email: formData.email,
            accountType: formData.accountType,
            points: Number(formData.points),
            level: Number(formData.level),
            streak: Number(formData.streak)
        };
        if (formData.phoneNumber) {
            payload.phoneNumber = formData.phoneNumber;
        }

        try {
            await axios.put(`http://54.251.220.228:8080/trainingSouls/users/${editingUserId}`, payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            setSaveSuccess(true);
            await fetchUsers();
            setTimeout(() => { setEditingUserId(null); }, 1500);
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            setEditError(err.response?.data?.message || err.message || 'Lỗi khi lưu.');
        } finally {
            setSaving(false);
        }
    };
    const handleDeleteUser = async (userIdToDelete) => { /* ... (giữ nguyên) ... */
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userIdToDelete}? Thao tác này không thể hoàn tác.`)) {
            setDeleting(true);
            setError(null);
            const token = sessionStorage.getItem("token");
            if (!token) {
                setError("Hết hạn phiên làm việc. Vui lòng đăng nhập lại.");
                setDeleting(false);
                return;
            }
            try {
                await axios.delete(`http://54.251.220.228:8080/trainingSouls/users/${userIdToDelete}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                await fetchUsers();
                if (editingUserId === userIdToDelete) {
                    setEditingUserId(null);
                }
            } catch (err) {
                console.error(`Lỗi khi xóa người dùng ID ${userIdToDelete}:`, err);
                setError(err.response?.data?.message || err.message || `Xóa người dùng ID ${userIdToDelete} thất bại.`);
            } finally {
                setDeleting(false);
            }
        }
    };
    // const formatDate = (dateString) => { /* ... (giữ nguyên nếu dùng) ... */ };
    const handleFormChange = (e) => { /* ... (giữ nguyên) ... */
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
     };
    const handleResetSearch = () => { /* ... (giữ nguyên) ... */
        setSearchTermId('');
        setSearchTermName('');
        setSearchTermEmail('');
    };
    const renderEditForm = () => { /* ... (giữ nguyên) ... */
        if (loadingEditData) { return ( <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Đang tải dữ liệu...</p></div> ); }
        return (
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <Card.Title as="h5" className="mb-0 d-flex align-items-center">
                <BsPencilSquare className="me-2" />
                Chỉnh sửa người dùng (ID: {editingUserId})
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
                   <Form.Control type="tel" id="formEditUserPhone" placeholder="Số điện thoại" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleFormChange} />
                   <label htmlFor="formEditUserPhone">Số điện thoại (tùy chọn)</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                    <Form.Select id="formEditUserAccountType" name="accountType" value={formData.accountType} onChange={handleFormChange} required>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                    </Form.Select>
                    <label htmlFor="formEditUserAccountType">Loại tài khoản</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                   <Form.Control type="number" id="formEditUserPoints" placeholder="Điểm" name="points" value={formData.points} onChange={handleFormChange} min="0" />
                   <label htmlFor="formEditUserPoints">Điểm</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                   <Form.Control type="number" id="formEditUserLevel" placeholder="Cấp độ" name="level" value={formData.level} onChange={handleFormChange} min="1" />
                   <label htmlFor="formEditUserLevel">Cấp độ</label>
                </Form.Floating>
                <Form.Floating className="mb-3">
                   <Form.Control type="number" id="formEditUserStreak" placeholder="Streak" name="streak" value={formData.streak} onChange={handleFormChange} min="0" />
                   <label htmlFor="formEditUserStreak">Streak</label>
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

    // --- HÀM RENDER BẢNG CON ---
    const renderUserTable = (usersToDisplay, title, tableVariant = "light") => {
        return (
            <Card className="shadow-sm rounded-3 overflow-hidden mt-4">
                <Card.Header className={`bg-${tableVariant === "light" ? "secondary" : tableVariant} text-white`}>
                    <h4 className="mb-0">{title} ({usersToDisplay.length})</h4>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover responsive="lg" borderless align-middle className="mb-0">
                            <thead className={`table-${tableVariant}`} style={{ borderBottom: '2px solid #dee2e6' }}>
                                <tr>
                                    <th className="py-3 fw-semibold text-center text-nowrap">User ID</th>
                                    <th className="py-3 fw-semibold text-start ps-3 text-nowrap">Tên</th>
                                    <th className="py-3 fw-semibold text-start text-nowrap">Email</th>
                                    <th className="py-3 fw-semibold text-center text-nowrap">SĐT</th>
                                    {/* Bỏ cột Loại TK vì đã phân loại theo bảng */}
                                    <th className="py-3 fw-semibold text-center text-nowrap">Điểm</th>
                                    <th className="py-3 fw-semibold text-center text-nowrap">Cấp</th>
                                    <th className="py-3 fw-semibold text-center text-nowrap">Streak</th>
                                    <th className="py-3 fw-semibold text-center pe-3 text-nowrap">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersToDisplay.length > 0 ? (
                                    usersToDisplay.map((user) => (
                                        <tr key={user.userID}>
                                            <td className="text-center"><code>{user.userID}</code></td>
                                            <td className="text-start ps-3">{user.name || <span className='text-muted fst-italic'>Chưa có</span>}</td>
                                            <td className="text-start">{user.email || <span className='text-muted fst-italic'>Chưa có</span>}</td>
                                            <td className="text-center">{user.phoneNumber || <span className='text-muted'>-</span>}</td>
                                            {/* <td className="text-center">{formatAccountType(user.accountType)}</td> */}
                                            <td className="text-center">{user.points ?? <span className='text-muted'>0</span>}</td>
                                            <td className="text-center">{user.level ?? <span className='text-muted'>1</span>}</td>
                                            <td className="text-center">{user.streak ?? <span className='text-muted'>0</span>}</td>
                                            <td className="text-center pe-3">
                                                <Button
                                                    variant="outline-warning" size="sm"
                                                    onClick={() => setEditingUserId(user.userID)}
                                                    title="Chỉnh sửa người dùng"
                                                    className="d-inline-flex align-items-center justify-content-center p-1 me-1"
                                                    disabled={deleting}
                                                >
                                                    <BsPencilSquare size="1.2em" />
                                                </Button>
                                                <Button
                                                    variant="outline-danger" size="sm"
                                                    onClick={() => handleDeleteUser(user.userID)}
                                                    title="Xóa người dùng"
                                                    className="d-inline-flex align-items-center justify-content-center p-1"
                                                    disabled={deleting || user.userID === editingUserId}
                                                >
                                                    <BsTrashFill size="1.2em" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center p-5"> {/* Cập nhật colSpan */}
                                            <BsInfoCircleFill size="2em" className="text-muted mb-2" />
                                            <p className="mb-0 text-muted">
                                                {(searchTermId || searchTermName || searchTermEmail)
                                                    ? "Không tìm thấy người dùng nào khớp với tiêu chí tìm kiếm trong nhóm này."
                                                    : `Không có người dùng ${title.toLowerCase().includes('premium') ? 'Premium' : 'Basic'} nào.`
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
        );
    };


    const renderUserList = () => {
        if (loadingList) { return ( <div className="text-center mt-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Đang tải danh sách...</p></div> ); }

        // Lọc user thành các nhóm
        const premiumUsers = filteredUsers.filter(user => user.accountType?.toLowerCase() === 'premium');
        const basicUsers = filteredUsers.filter(user => user.accountType?.toLowerCase() === 'basic');
        // const adminUsers = filteredUsers.filter(user => user.accountType?.toLowerCase() === 'admin'); // Nếu muốn hiển thị admin riêng

        return (
            <>
                {/* Thanh tìm kiếm giữ nguyên */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-3"><BsSearch className="me-2"/>Bộ lọc tìm kiếm</h5>
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3">
                                <Form.Label htmlFor="searchTermIdInput">Theo User ID</Form.Label>
                                <Form.Control type="text" id="searchTermIdInput" placeholder="Nhập ID..." value={searchTermId} onChange={(e) => setSearchTermId(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <Form.Label htmlFor="searchTermNameInput">Theo Tên</Form.Label>
                                <Form.Control type="text" id="searchTermNameInput" placeholder="Nhập tên..." value={searchTermName} onChange={(e) => setSearchTermName(e.target.value)} />
                            </div>
                            <div className="col-md-4">
                                <Form.Label htmlFor="searchTermEmailInput">Theo Email</Form.Label>
                                <Form.Control type="email" id="searchTermEmailInput" placeholder="Nhập email..." value={searchTermEmail} onChange={(e) => setSearchTermEmail(e.target.value)} />
                            </div>
                            <div className="col-md-2 d-grid">
                                <Button variant="outline-secondary" onClick={handleResetSearch} className="d-flex align-items-center justify-content-center">
                                    <BsXCircleFill className="me-2" /> Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hiển thị lỗi chung và thông báo xóa */}
                {error && !editingUserId && <Alert variant="danger" className="d-flex align-items-center m-3"><BsExclamationTriangleFill className="me-2"/>{error}</Alert>}
                {deleting && <Alert variant="info" className="d-flex align-items-center m-3"><Spinner as="span" size="sm" className="me-2" /> Đang xóa người dùng...</Alert>}

                {/* Render bảng Premium Users */}
                {renderUserTable(premiumUsers, "Người dùng Premium", "success")}

                {/* Render bảng Basic Users */}
                {renderUserTable(basicUsers, "Người dùng Basic", "info")}

                {/* Có thể render bảng Admin Users nếu muốn */}
                {/* {renderUserTable(adminUsers, "Quản trị viên", "danger")} */}

                {/* Thông báo nếu không có user nào sau khi lọc tổng thể */}
                {!loadingList && filteredUsers.length === 0 && (searchTermId || searchTermName || searchTermEmail) && (
                     <Alert variant="warning" className="text-center mt-4">
                        Không tìm thấy người dùng nào khớp với tất cả các tiêu chí tìm kiếm.
                    </Alert>
                )}
                 {!loadingList && allUsers.length === 0 && !(searchTermId || searchTermName || searchTermEmail) && (
                     <Alert variant="info" className="text-center mt-4">
                        Hiện tại không có người dùng nào trong hệ thống.
                    </Alert>
                )}
            </>
        );
    };

    return (
        <Container className="mt-4 mb-5">
            {editingUserId !== null ? renderEditForm() : renderUserList()}
            {/* Nút Scroll to Top */}
            {!editingUserId && ( // Chỉ hiển thị nút scroll khi ở danh sách
                 <Button
                    variant="dark"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="Lên đầu trang"
                    className="rounded-circle shadow position-fixed p-0 d-flex align-items-center justify-content-center"
                    style={{ bottom: '30px', right: '30px', zIndex: 1000, width: '45px', height: '45px' }}
                >
                    <BsArrowUpCircleFill size="1.5em" color="white"/>
                </Button>
            )}
        </Container>
    );
};

export default UserManagement;