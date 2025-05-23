import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Card, Spinner, Alert, Badge, Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import {
    FaUserTie,
    FaExclamationTriangle,
    FaInfoCircle,
    FaPlus,
    FaEdit,
    FaTrashAlt,
    FaSave,
    // FaTimes, // Sẽ dùng BsXCircleFill
    FaCheckCircle,
    FaKey,
    FaUserTag
} from 'react-icons/fa';
import { BsXCircleFill } from 'react-icons/bs';


// API Endpoints
const API_GET_ALL_COACHES = "http://54.251.220.228:8080/trainingSouls/coach/getAllCoach";
const API_USERS_BASE_URL = "http://54.251.220.228:8080/trainingSouls/users";
const API_CREATE_USER = `${API_USERS_BASE_URL}/create-user`;
const API_USER_DETAILS = API_USERS_BASE_URL;
const API_UPDATE_USER = API_USERS_BASE_URL;
const API_DELETE_USER = API_USERS_BASE_URL;


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

const formatRoles = (rolesData) => {
    let rolesArray = [];
    if (Array.isArray(rolesData)) {
        rolesArray = rolesData;
    } else if (typeof rolesData === 'string' && rolesData.trim() !== '') {
        rolesArray = rolesData.split(',').map(r => r.trim()).filter(r => r);
    }

    if (rolesArray.length === 0) {
        return <Badge bg="light" text="dark" pill>Không có</Badge>;
    }

    return rolesArray.map((roleItem, index) => {
        let roleName = '';
        if (typeof roleItem === 'string') {
            roleName = roleItem.trim().toUpperCase();
        } else if (roleItem && typeof roleItem.name === 'string') {
            roleName = roleItem.name.trim().toUpperCase();
        } else if (roleItem && typeof roleItem.authority === 'string') {
             roleName = roleItem.authority.trim().toUpperCase();
        } else {
            console.warn("Phần tử vai trò không hợp lệ trong mảng roles:", roleItem);
            return <Badge key={`invalid-item-${index}`} bg="danger" pill>Lỗi vai trò</Badge>;
        }
        if (!roleName) return <Badge key={`empty-role-${index}`} bg="light" text="dark" pill>Trống</Badge>;

        let variant = "secondary";
        if (roleName === "ADMIN") variant = "danger";
        else if (roleName === "COACH") variant = "warning";
        else if (roleName === "USER") variant = "info";
        return <Badge key={`${roleName}-${index}`} bg={variant} pill className="me-1">{roleName}</Badge>;
    });
};

const MANAGED_ROLES = ["USER", "COACH"];


const CoachManagement = () => {
    const [coaches, setCoaches] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);

    const initialNewUserData = { name: '', email: '' };
    const [newUserData, setNewUserData] = useState(initialNewUserData);
    const [editUserData, setEditUserData] = useState({ userID: null, name: '', emailForDisplay: '', roles: ['USER'] });

    useEffect(() => {
        fetchCoaches();
    }, []);

    const clearMessages = (isModal = false) => {
        if (isModal) setModalError(null);
        else setError(null);
        setSuccessMessage('');
    };

    const fetchCoaches = async () => {
        clearMessages();
        setIsLoadingList(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn.");
            setIsLoadingList(false);
            return;
        }
        try {
            const response = await axios.get(API_GET_ALL_COACHES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data && Array.isArray(response.data)) {
                setCoaches(response.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
            } else {
                console.warn("API /getAllCoach không trả về mảng:", response.data);
                setCoaches([]);
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể tải danh sách huấn luyện viên."));
            setCoaches([]);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleShowCreateModal = () => {
        clearMessages(true);
        setNewUserData(initialNewUserData);
        setShowCreateModal(true);
    };

    const handleRoleChange = (roleValue, formType) => {
        const updater = formType === 'edit' ? setEditUserData : setNewUserData;
        updater(prevData => {
            let currentRoles = Array.isArray(prevData.roles) ? [...prevData.roles] : [];
            let updatedRoles;

            if (currentRoles.includes(roleValue)) {
                updatedRoles = currentRoles.filter(r => r !== roleValue);
            } else {
                updatedRoles = [...currentRoles, roleValue];
            }
            if ((updatedRoles.includes("COACH") || updatedRoles.includes("ADMIN")) && !updatedRoles.includes("USER")) {
                updatedRoles.push("USER");
            }
            if (updatedRoles.length === 0) {
                updatedRoles.push("USER");
            }
            return { ...prevData, roles: [...new Set(updatedRoles)] };
        });
    };

    const handleCreateUserAsCoach = async (e) => {
        e.preventDefault();
        clearMessages(true);
        if (!newUserData.name.trim() || !newUserData.email.trim()) {
            setModalError("Tên và Email không được để trống khi tạo tài khoản Coach.");
            return;
        }
        setIsSubmitting(true);
        const token = sessionStorage.getItem("token");
        const payload = {
            name: newUserData.name.trim(),
            email: newUserData.email.trim(),
            roles: ["USER", "COACH"]
        };
        try {
            await axios.post(API_CREATE_USER, payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            setSuccessMessage(`Tài khoản Coach "${payload.name}" đã được tạo. Mật khẩu sẽ được hệ thống xử lý.`);
            setShowCreateModal(false);
            fetchCoaches();
        } catch (err) {
            setModalError(getApiErrorMessage(err, "Lỗi khi tạo tài khoản Coach."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowEditModal = async (coachFromList) => {
        clearMessages(true);
        setSelectedUserForEdit(coachFromList);
        setIsSubmitting(true);
        const token = sessionStorage.getItem("token");
        let userDataForForm = {
            userID: coachFromList.userID,
            name: coachFromList.name || '',
            emailForDisplay: coachFromList.email || '',
            roles: ['USER']
        };
        if (token && coachFromList.userID) {
            try {
                const response = await axios.get(`${API_USER_DETAILS}/${coachFromList.userID}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.data) {
                    const userDetails = response.data;
                    userDataForForm.name = userDetails.name || coachFromList.name || '';
                    userDataForForm.emailForDisplay = userDetails.email || coachFromList.email || '';
                    let currentRoles = ['USER'];
                    if (userDetails.roles && Array.isArray(userDetails.roles)) {
                        currentRoles = userDetails.roles.map(r => typeof r === 'string' ? r.toUpperCase() : '').filter(Boolean);
                    } else if (typeof userDetails.roles === 'string') {
                        currentRoles = userDetails.roles.split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
                    }
                    if (currentRoles.length === 0) currentRoles = ['USER'];
                    userDataForForm.roles = [...new Set(currentRoles)];
                }
            } catch (err) {
                console.error(`Lỗi khi lấy chi tiết user ${coachFromList.userID} để sửa:`, err);
                setModalError(`Không thể lấy đầy đủ thông tin vai trò cho ${coachFromList.name}.`);
                 if (coachFromList.roles && Array.isArray(coachFromList.roles)) {
                     userDataForForm.roles = coachFromList.roles.map(r => typeof r === 'string' ? r.toUpperCase() : '').filter(Boolean);
                     if (userDataForForm.roles.length === 0) userDataForForm.roles = ['USER'];
                }
            }
        }
        setEditUserData(userDataForForm);
        setShowEditModal(true);
        setIsSubmitting(false);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        clearMessages(true);
        if (!editUserData.name.trim()) {
            setModalError("Tên Coach không được để trống.");
            return;
        }
        if (!selectedUserForEdit?.userID) {
            setModalError("Không xác định được ID Coach để cập nhật.");
            return;
        }
        let finalRoles = Array.isArray(editUserData.roles) ? [...new Set(editUserData.roles)] : [];
        if (finalRoles.length === 0 || !finalRoles.includes("USER")) {
            if (!finalRoles.includes("USER")) finalRoles.push("USER");
            finalRoles = [...new Set(finalRoles)];
        }
        setIsSubmitting(true);
        const token = sessionStorage.getItem("token");
        const payload = {
            name: editUserData.name.trim(),
            roles: finalRoles
        };
        try {
            await axios.put(`${API_UPDATE_USER}/${selectedUserForEdit.userID}`, payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            setSuccessMessage(`Thông tin Coach ID ${selectedUserForEdit.userID} đã được cập nhật.`);
            setShowEditModal(false);
            fetchCoaches();
        } catch (err) {
            setModalError(getApiErrorMessage(err, "Lỗi khi cập nhật thông tin Coach."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        clearMessages();
        if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${userName}" (ID: ${userId})?`)) {
            setIsSubmitting(true);
            const token = sessionStorage.getItem("token");
            try {
                await axios.delete(`${API_DELETE_USER}/${userId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setSuccessMessage(`Tài khoản "${userName}" (ID: ${userId}) đã được xóa.`);
                fetchCoaches();
                 if (selectedUserForEdit && selectedUserForEdit.userID === userId) {
                    setShowEditModal(false);
                }
            } catch (err) {
                setError(getApiErrorMessage(err, `Lỗi khi xóa tài khoản "${userName}".`));
            } finally {
                setIsSubmitting(false);
            }
        }
    };


    if (isLoadingList && coaches.length === 0) {
        return (
            <Container className="mt-5 text-center" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 fs-5 text-muted">Đang tải danh sách Coach...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 className="mb-0 fw-bold text-primary">
                    <FaUserTie className="me-2" /> Quản lý Tài khoản Coach
                </h2>
                
            </div>

            {error && <Alert variant="danger" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaExclamationTriangle className="me-2"/>{error}</Alert>}
            {successMessage && <Alert variant="success" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaCheckCircle className="me-2"/>{successMessage}</Alert>}
            {(isLoadingList && coaches.length > 0) && <div className="text-center my-2"><Spinner size="sm"/> Đang làm mới...</div>}

            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light d-flex justify-content-between align-items-center">
                    <span>Danh sách Coach ({coaches.length})</span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover responsive="lg" borderless align-middle className="mb-0">
                            <thead className="table-primary text-white">
                                <tr>
                                    <th className="py-3 fw-semibold text-center" style={{width: '15%'}}>User ID</th>
                                    <th className="py-3 fw-semibold text-center" style={{width: '30%'}}>Tên</th>
                                    <th className="py-3 fw-semibold ps-3" style={{width: '30%'}}>Email</th>
                                    {coaches.length > 0 && coaches.some(c => c.hasOwnProperty('roles')) &&
                                      <th className="py-3 fw-semibold text-center" style={{width: '10%'}}>Vai trò</th>
                                    }
                                    <th className="py-3 fw-semibold text-center pe-3" style={{width: '15%'}}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.userID}>
                                            <td className="text-center"><code>{coach.userID}</code></td>
                                            <td className="text-center fw-medium">
                                                {coach.name || <span className="text-muted fst-italic">N/A</span>}
                                            </td>
                                            <td className="ps-3">{coach.email || <span className="text-muted fst-italic">N/A</span>}</td>
                                            {coach.hasOwnProperty('roles') &&
                                                <td className="text-center">{formatRoles(coach.roles)}</td>
                                            }
                                            <td className="text-center pe-3">
                                                <Button
                                                    variant="outline-warning" size="sm" className="me-2"
                                                    title="Sửa thông tin"
                                                    onClick={() => handleShowEditModal(coach)}
                                                    disabled={isSubmitting || isLoadingList}
                                                > <FaEdit /> </Button>
                                                <Button
                                                    variant="outline-danger" size="sm"
                                                    title="Xóa tài khoản"
                                                    onClick={() => handleDeleteUser(coach.userID, coach.name)}
                                                    disabled={isSubmitting || isLoadingList}
                                                > <FaTrashAlt /> </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={coaches.length > 0 && coaches.some(c => c.hasOwnProperty('roles')) ? "5" : "4"} className="text-center p-5">
                                            <FaInfoCircle size="2.5em" className="text-muted mb-2" />
                                            <p className="mb-0 fs-5 text-muted">
                                                {isLoadingList ? "Đang tải..." : (error ? "Không thể tải dữ liệu." : "Hiện không có Coach nào.")}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

          
            {/* Modal Sửa Thông Tin User (Coach) */}
            <Modal show={showEditModal} onHide={() => {setShowEditModal(false); clearMessages(true);}} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaEdit className="me-2"/>Sửa Thông Tin Coach (ID: {selectedUserForEdit?.userID})</Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handleUpdateUser}>
                    <Modal.Body>
                        {modalError && showEditModal && <Alert variant="danger" onClose={() => clearMessages(true)} dismissible>{modalError}</Alert>}
                        <Form.Group className="mb-3" controlId="editCoachNameForm">
                            <Form.Label>Tên Coach <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên"
                                value={editUserData.name}
                                // SỬA Ở ĐÂY: Không gọi handleFormChangeEdit nữa
                                onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="editUserEmailForm">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={editUserData.emailForDisplay}
                                readOnly
                                disabled
                                style={{cursor: 'not-allowed', backgroundColor: '#e9ecef'}}
                            />
                            <Form.Text muted>Email không thể thay đổi từ giao diện này.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="editUserRolesForm">
                            <Form.Label>Vai trò</Form.Label>
                            <div>
                                {MANAGED_ROLES.map(role => (
                                    <Form.Check
                                        inline type="checkbox" key={`edit-${role}`} id={`edit-role-${role}`}
                                        label={role} value={role}
                                        checked={editUserData.roles.includes(role.toUpperCase())}
                                        onChange={() => handleRoleChange(role.toUpperCase(), 'edit')}
                                    />
                                ))}
                                {/* Hiển thị các roles khác (nếu có) */}
                                {editUserData.roles.filter(r => !MANAGED_ROLES.includes(r.toUpperCase())).length > 0 && (
                                    <div className="mt-2">
                                        <small className="text-muted">Vai trò khác (không quản lý ở đây): </small>
                                        {editUserData.roles.filter(r => !MANAGED_ROLES.includes(r.toUpperCase())).map((otherRole, i) => (
                                            <Badge key={`other-${otherRole}-${i}`} bg="secondary" pill className="me-1">{otherRole}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                             <Form.Text muted>Chọn USER và/hoặc COACH.</Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {setShowEditModal(false); clearMessages(true);}} disabled={isSubmitting}>
                             <BsXCircleFill className="me-1"/> Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner as="span" size="sm" className="me-1"/> : <FaSave className="me-1"/>}
                            Lưu thay đổi
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default CoachManagement;