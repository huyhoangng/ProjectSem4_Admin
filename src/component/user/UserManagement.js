import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Card, Alert, Spinner, Badge, Modal, Row, Col, InputGroup } from 'react-bootstrap';
import {
    BsPencilSquare,
    BsTrashFill,
    BsArrowUpCircleFill,
    BsInfoCircleFill,
    BsCheckCircleFill,
    BsExclamationTriangleFill,
    BsSearch,
    BsXCircleFill,
    BsPersonBadge,
    BsShieldLock,
    BsSave
} from "react-icons/bs"; // Đã import BsSave

// Helper function to format Account Type (có thể không cần nếu chỉ dựa vào roles)
const formatAccountType = (type) => {
    if (!type) return <Badge bg="secondary" pill>N/A</Badge>;
    switch (type.toLowerCase()) {
        case 'basic':
            return <Badge bg="info" pill>Basic</Badge>;
        case 'premium':
            return <Badge bg="success" pill>Premium</Badge>;
        case 'admin':
            return <Badge bg="danger" pill>Admin</Badge>;
        default:
            return <Badge bg="dark" pill>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
    }
};

// Helper function để hiển thị roles đẹp hơn và an toàn hơn
const formatRoles = (rolesData) => {
    let rolesToProcess = [];
    if (Array.isArray(rolesData)) {
        rolesToProcess = rolesData;
    } else if (typeof rolesData === 'string' && rolesData.trim() !== '') {
        rolesToProcess = rolesData.split(',').map(r => r.trim()).filter(r => r);
    } else if (rolesData) {
        console.warn("formatRoles nhận được dữ liệu roles không mong đợi:", rolesData, "Kiểu:", typeof rolesData);
        return <Badge bg="dark" pill>Dữ liệu vai trò không hợp lệ</Badge>;
    }

    if (rolesToProcess.length === 0) {
        return <Badge bg="light" text="dark" pill>Không có vai trò</Badge>;
    }

    return rolesToProcess.map((roleItem, index) => {
        let roleName = '';
        if (typeof roleItem === 'string') {
            roleName = roleItem.trim().toUpperCase();
        } else if (roleItem && typeof roleItem.name === 'string') {
            roleName = roleItem.name.trim().toUpperCase();
        } else if (roleItem && typeof roleItem.authority === 'string') {
             roleName = roleItem.authority.trim().toUpperCase();
        } else {
            console.warn("Phần tử vai trò không hợp lệ trong mảng roles:", roleItem);
            return <Badge key={`invalid-item-${index}`} bg="danger" pill>Vai trò lỗi</Badge>;
        }

        if (!roleName) {
             return <Badge key={`empty-role-${index}`} bg="light" text="dark" pill>Vai trò trống</Badge>;
        }

        let variant = "secondary";
        if (roleName === "ADMIN") variant = "danger";
        else if (roleName === "COACH") variant = "warning";
        else if (roleName === "USER") variant = "info";

        return <Badge key={`${roleName}-${index}`} bg={variant} pill className="me-1">{roleName}</Badge>;
    });
};


const UserManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        userID: null, name: '', email: '', roles: '',
    });
    const [loadingList, setLoadingList] = useState(true);
    const [loadingEditSubmit, setLoadingEditSubmit] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [editModalError, setEditModalError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [searchTermId, setSearchTermId] = useState('');
    const [searchTermName, setSearchTermName] = useState('');
    const [searchTermEmail, setSearchTermEmail] = useState('');

    const API_BASE_URL_USERS = "http://54.251.220.228:8080/trainingSouls/users";
    const API_GET_ALL_USERS = API_BASE_URL_USERS;

    const getApiErrorMessage = (err, defaultMessage) => {
        if (err.response) {
            if (typeof err.response.data?.message === 'string') return err.response.data.message;
            if (typeof err.response.data?.error === 'string') return err.response.data.error;
            if (typeof err.response.data === 'string' && err.response.data.length < 250 && !err.response.data.startsWith('<')) return err.response.data;
            return `${defaultMessage} (Lỗi Server: ${err.response.status} - ${err.response.statusText || 'Unknown Error'})`;
        } else if (err.request) {
            return `${defaultMessage} (Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối mạng.)`;
        }
        return `${defaultMessage} (Lỗi: ${err.message || 'Không xác định'})`;
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        if (editingUser) {
            let rolesString = 'USER';
            if (Array.isArray(editingUser.roles)) {
                rolesString = editingUser.roles
                    .map(role => (typeof role === 'string' ? role.trim() : (role && typeof role.name === 'string' ? role.name.trim() : (role && typeof role.authority === 'string' ? role.authority.trim() : ''))))
                    .filter(Boolean)
                    .join(',');
                if (!rolesString) rolesString = 'USER';
            } else if (typeof editingUser.roles === 'string') {
                rolesString = editingUser.roles;
            }

            setEditFormData({
                userID: editingUser.userID,
                name: editingUser.name || '',
                email: editingUser.email || '',
                roles: rolesString.toUpperCase(),
            });
            setEditModalError(null);
            setSuccessMessage('');
        } else {
            // Reset form data khi không có user nào được chọn để sửa
            setEditFormData({ userID: null, name: '', email: '', roles: '' });
        }
    }, [editingUser]);

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

    const fetchUsers = async () => {
        setLoadingList(true); setError(null); setSuccessMessage('');
        const token = sessionStorage.getItem("token");
        if (!token) { setError("Không tìm thấy token xác thực."); setLoadingList(false); return; }
        try {
            const response = await axios.get(API_GET_ALL_USERS, { headers: { "Authorization": `Bearer ${token}` } });
            if (response.data && Array.isArray(response.data)) {
                // Log để kiểm tra cấu trúc roles từ API
                // response.data.forEach(user => {
                //     console.log(`User ID: ${user.userID}, Roles from API:`, user.roles, `Type: ${typeof user.roles}`);
                // });
                const sortedUsers = response.data.sort((a, b) => (b.userID || 0) - (a.userID || 0));
                setAllUsers(sortedUsers);
            } else {
                console.warn("API /users không trả về mảng hoặc không có dữ liệu:", response.data);
                setError(getApiErrorMessage({ response }, 'Dữ liệu người dùng trả về không hợp lệ.'));
                setAllUsers([]);
            }
        } catch (err) {
            setError(getApiErrorMessage(err, 'Lỗi tải danh sách người dùng.'));
            setAllUsers([]);
        } finally {
            setLoadingList(false);
        }
    };

    const handleShowEditModal = (user) => {
        setEditingUser(user);
    };

    const handleFormChangeEdit = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
     };

    const handleUpdateUserRoles = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        setLoadingEditSubmit(true); setEditModalError(null); setSuccessMessage('');
        const token = sessionStorage.getItem("token");
        if (!token) { setEditModalError("Hết hạn phiên làm việc."); setLoadingEditSubmit(false); return; }

        if (!editFormData.name.trim()) {
            setEditModalError("Tên người dùng không được để trống.");
            setLoadingEditSubmit(false);
            return;
        }

        const rolesArray = editFormData.roles
            .split(',')
            .map(role => role.trim().toUpperCase())
            .filter(role => role !== "");
        if (rolesArray.length === 0) { // Đảm bảo luôn có ít nhất một vai trò
             rolesArray.push("USER");
        }
        // Tùy chọn: luôn đảm bảo có vai trò USER
        // if (!rolesArray.includes("USER")) {
        //    rolesArray.unshift("USER");
        // }


        const payload = {
            name: editFormData.name.trim(),
            roles: [...new Set(rolesArray)]
        };

        try {
            await axios.put(`${API_BASE_URL_USERS}/${editingUser.userID}`, payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            setSuccessMessage(`Thông tin của người dùng ${editingUser.name} (ID: ${editingUser.userID}) đã được cập nhật.`);
            setEditingUser(null); // Đóng modal
            await fetchUsers();
        } catch (err) {
            setEditModalError(getApiErrorMessage(err, 'Lỗi khi cập nhật thông tin người dùng.'));
        } finally {
            setLoadingEditSubmit(false);
        }
    };

    const handleDeleteUser = async (userIdToDelete, userName) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}" (ID: ${userIdToDelete})?`)) {
            setDeleting(true); setError(null); setSuccessMessage('');
            const token = sessionStorage.getItem("token");
            if (!token) { setError("Hết hạn phiên làm việc."); setDeleting(false); return; }
            try {
                await axios.delete(`${API_BASE_URL_USERS}/${userIdToDelete}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setSuccessMessage(`Người dùng "${userName}" đã được xóa thành công.`);
                await fetchUsers();
                if (editingUser && editingUser.userID === userIdToDelete) {
                    setEditingUser(null);
                }
            } catch (err) {
                setError(getApiErrorMessage(err, `Xóa người dùng "${userName}" thất bại.`));
            } finally {
                setDeleting(false);
            }
        }
    };

    const handleResetSearch = () => {
        setSearchTermId('');
        setSearchTermName('');
        setSearchTermEmail('');
    };

    const renderUserTable = (usersToDisplay, title, tableVariant = "light", showAccountTypeCol = true) => {
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
                                    {showAccountTypeCol && <th className="py-3 fw-semibold text-center text-nowrap">Loại TK</th>}
                                    <th className="py-3 fw-semibold text-center text-nowrap">Vai trò</th>
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
                                            {showAccountTypeCol && <td className="text-center">{formatAccountType(user.accountType)}</td>}
                                            <td className="text-center">{formatRoles(user.roles)}</td>
                                            <td className="text-center">{user.points ?? <span className='text-muted'>0</span>}</td>
                                            <td className="text-center">{user.level ?? <span className='text-muted'>1</span>}</td>
                                            <td className="text-center">{user.streak ?? <span className='text-muted'>0</span>}</td>
                                            <td className="text-center pe-3">
                                                <Button
                                                    variant="outline-warning" size="sm"
                                                    onClick={() => handleShowEditModal(user)}
                                                    title="Sửa người dùng"
                                                    className="d-inline-flex align-items-center justify-content-center p-1 me-1"
                                                    disabled={deleting || loadingEditSubmit}
                                                >
                                                    <BsPencilSquare size="1.2em" />
                                                </Button>
                                                <Button
                                                    variant="outline-danger" size="sm"
                                                    onClick={() => handleDeleteUser(user.userID, user.name)}
                                                    title="Xóa người dùng"
                                                    className="d-inline-flex align-items-center justify-content-center p-1"
                                                    disabled={deleting || loadingEditSubmit || (editingUser && user.userID === editingUser.userID)}
                                                >
                                                    <BsTrashFill size="1.2em" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={showAccountTypeCol ? "9" : "8"} className="text-center p-5">
                                            <BsInfoCircleFill size="2em" className="text-muted mb-2" />
                                            <p className="mb-0 text-muted">
                                                {(searchTermId || searchTermName || searchTermEmail)
                                                    ? "Không tìm thấy người dùng nào khớp với tiêu chí tìm kiếm trong nhóm này."
                                                    : `Không có người dùng ${title.toLowerCase().includes('premium') ? 'Premium' : (title.toLowerCase().includes('basic') ? 'Basic' : 'thuộc nhóm này')}.`
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
        if (loadingList && allUsers.length === 0) { return ( <div className="text-center mt-5" style={{minHeight: '50vh', display:'flex', flexDirection:'column', justifyContent:'center'}}><Spinner animation="border" variant="primary" style={{width:'3rem', height:'3rem'}} /><p className="mt-2 text-muted fs-5">Đang tải danh sách người dùng...</p></div> ); }

        const premiumUsers = filteredUsers.filter(user => user.accountType?.toLowerCase() === 'premium');
        const basicUsers = filteredUsers.filter(user => user.accountType?.toLowerCase() === 'basic');
        const otherUsers = filteredUsers.filter(user =>
            user.accountType?.toLowerCase() !== 'premium' &&
            user.accountType?.toLowerCase() !== 'basic'
        );

        return (
            <>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5" className="bg-light"><BsSearch className="me-2"/>Bộ lọc tìm kiếm</Card.Header>
                    <Card.Body>
                        <Form>
                        <Row className="g-3 align-items-end">
                            <Col md={3} sm={6}>
                                <Form.Group controlId="searchTermIdInput">
                                    <Form.Label>Theo User ID</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập ID..." value={searchTermId} onChange={(e) => setSearchTermId(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={3} sm={6}>
                                 <Form.Group controlId="searchTermNameInput">
                                    <Form.Label>Theo Tên</Form.Label>
                                    <Form.Control type="text" placeholder="Nhập tên..." value={searchTermName} onChange={(e) => setSearchTermName(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={4} sm={6}>
                                <Form.Group controlId="searchTermEmailInput">
                                    <Form.Label>Theo Email</Form.Label>
                                    <Form.Control type="email" placeholder="Nhập email..." value={searchTermEmail} onChange={(e) => setSearchTermEmail(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={2} sm={6} className="d-flex align-items-end">
                                <Button variant="outline-secondary" onClick={handleResetSearch} className="w-100 d-flex align-items-center justify-content-center">
                                    <BsXCircleFill className="me-2" /> Reset
                                </Button>
                            </Col>
                        </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible className="d-flex align-items-center mb-3"><BsExclamationTriangleFill className="me-2"/>{error}</Alert>}
                {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible className="d-flex align-items-center mb-3"><BsCheckCircleFill className="me-2"/>{successMessage}</Alert>}
                {deleting && <Alert variant="info" className="d-flex align-items-center m-3"><Spinner as="span" size="sm" className="me-2" /> Đang xóa người dùng...</Alert>}
                {loadingList && allUsers.length > 0 && <div className="text-center my-2"><Spinner size="sm"/> Đang làm mới danh sách...</div>}

                {renderUserTable(premiumUsers, "Người dùng Premium", "success")}
                {renderUserTable(basicUsers, "Người dùng Basic", "info")}
                {otherUsers.length > 0 && renderUserTable(otherUsers, "Tài khoản khác (Admin, etc.)", "secondary", false)}

                {!loadingList && allUsers.length === 0 && !error && (
                     <Alert variant="info" className="text-center mt-4">
                        <BsInfoCircleFill size="1.5em" className="me-2"/> Hiện tại không có người dùng nào trong hệ thống.
                    </Alert>
                )}
                {!loadingList && filteredUsers.length === 0 && allUsers.length > 0 && (searchTermId || searchTermName || searchTermEmail) && (
                     <Alert variant="warning" className="text-center mt-4">
                        <BsSearch size="1.5em" className="me-2"/> Không tìm thấy người dùng nào khớp với tất cả các tiêu chí tìm kiếm.
                    </Alert>
                )}
            </>
        );
    };

    function renderEditFormModal() {
        return (
          <Modal show={!!editingUser} onHide={() => setEditingUser(null)} backdrop="static" centered>
            <Modal.Header closeButton>
              <Modal.Title><BsPencilSquare className="me-2" />Sửa Thông Tin Người Dùng (ID: {editingUser?.userID})</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateUserRoles}>
                <Modal.Body>
                  {editModalError && <Alert variant="danger" onClose={() => setEditModalError(null)} dismissible>{editModalError}</Alert>}
                  <Form.Group className="mb-3" controlId="formEditUserName">
                    <Form.Label>Tên Người Dùng <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="text" placeholder="Nhập tên"
                        name="name"
                        value={editFormData.name}
                        onChange={handleFormChangeEdit}
                        required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEditUserEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={editFormData.email}
                        readOnly
                        disabled
                        style={{cursor: 'not-allowed', backgroundColor: '#e9ecef'}}
                    />
                     <Form.Text muted>Email không thể thay đổi tại đây.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formEditUserRoles">
                    <Form.Label>Vai trò (cách nhau bằng dấu phẩy, VD: USER,COACH)</Form.Label>
                    <InputGroup>
                        <InputGroup.Text><BsPersonBadge /></InputGroup.Text>
                        <Form.Control
                            type="text" placeholder="VD: USER,COACH,ADMIN"
                            name="roles"
                            value={editFormData.roles}
                            onChange={handleFormChangeEdit}
                        />
                    </InputGroup>
                    <Form.Text muted>Đảm bảo vai trò hợp lệ. Ví dụ: USER, COACH, ADMIN.</Form.Text>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setEditingUser(null)} disabled={loadingEditSubmit}>
                    <BsXCircleFill className="me-1"/> Hủy
                  </Button>
                  <Button variant="primary" type="submit" disabled={loadingEditSubmit}>
                    {loadingEditSubmit ? <><Spinner as="span" size="sm" className="me-2" /> Đang lưu...</> : <><BsSave className="me-1"/> Lưu thay đổi</>}
                  </Button>
                </Modal.Footer>
            </Form>
          </Modal>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <h2 className="mb-4 fw-bold text-primary">
                <BsShieldLock className="me-2" /> Quản lý Tài khoản Người dùng
            </h2>
            {editingUser ? renderEditFormModal() : renderUserList()}

            {!editingUser && (
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