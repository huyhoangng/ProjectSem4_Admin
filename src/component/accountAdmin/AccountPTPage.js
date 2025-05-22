import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Card, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap'; // Thêm Button, Modal, Form
import {
    FaUsers,
    FaUserTie,
    FaExclamationTriangle,
    FaInfoCircle,
    FaPlus,     // Icon cho nút Thêm
    FaEdit,     // Icon cho nút Sửa
    FaTrashAlt, // Icon cho nút Xóa
    FaSave,
    FaTimes,
    FaCheckCircle
} from 'react-icons/fa';

const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/coach"; // Base URL cho coach
const API_GET_ALL_COACHES = `${API_BASE_URL}/getAllCoach`;
// GIẢ SỬ CÁC API ENDPOINTS SAU (BẠN CẦN THAY THẾ BẰNG API THỰC TẾ)
const API_CREATE_COACH = `${API_BASE_URL}/create`; // Ví dụ: POST
const API_UPDATE_COACH_BASE = `${API_BASE_URL}/update`; // Ví dụ: PUT /{coachId}
const API_DELETE_COACH_BASE = `${API_BASE_URL}/delete`; // Ví dụ: DELETE /{coachId}


const CoachManagement = () => {
    const [coaches, setCoaches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(''); // Để hiển thị thông báo thành công

    // State cho Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null); // PT đang được sửa

    // State cho form dữ liệu
    const [newCoachData, setNewCoachData] = useState({ name: '', email: '' /* Thêm các trường khác nếu cần */ });
    const [editCoachData, setEditCoachData] = useState({ userID: null, name: '', email: '' });

    useEffect(() => {
        fetchCoaches();
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

    const fetchCoaches = async () => {
        clearMessages();
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get(API_GET_ALL_COACHES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data && Array.isArray(response.data)) {
                setCoaches(response.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
            } else {
                setCoaches([]);
            }
        } catch (err) {
            handleApiError(err, "Không thể tải danh sách huấn luyện viên.");
            setCoaches([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý lỗi API chung
    const handleApiError = (err, defaultMessage) => {
        console.error("Lỗi API:", err);
        if (err.response) {
            setError(err.response.data?.message || err.response.data?.error || `${defaultMessage} (Lỗi: ${err.response.status})`);
        } else if (err.request) {
            setError(`${defaultMessage} (Không thể kết nối đến máy chủ.)`);
        } else {
            setError(`${defaultMessage} (Lỗi không xác định: ${err.message})`);
        }
    };


    // --- Xử lý cho nút Thêm PT ---
    const handleShowCreateModal = () => {
        clearMessages();
        setNewCoachData({ name: '', email: '' }); // Reset form
        setShowCreateModal(true);
    };

    const handleCreateCoach = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!newCoachData.name.trim() || !newCoachData.email.trim()) {
            setError("Tên và Email của huấn luyện viên không được để trống.");
            return;
        }
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        try {
            // ---- THAY THẾ BẰNG LOGIC GỌI API CREATE COACH CỦA BẠN ----
            // Ví dụ:
            // await axios.post(API_CREATE_COACH, newCoachData, {
            //     headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            // });
            console.log("Đang tạo PT mới:", newCoachData); // Log dữ liệu
            alert("Chức năng Tạo PT chưa được kết nối API thực tế."); // Thông báo tạm
            // Giả sử thành công để test UI
            setSuccessMessage(`Huấn luyện viên "${newCoachData.name}" đã được thêm (DEMO).`);
            // ---- KẾT THÚC PHẦN THAY THẾ ----

            setShowCreateModal(false);
            // fetchCoaches(); // Tải lại danh sách sau khi thêm thành công
        } catch (err) {
            handleApiError(err, "Lỗi khi thêm huấn luyện viên.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Xử lý cho nút Sửa PT ---
    const handleShowEditModal = (coach) => {
        clearMessages();
        setSelectedCoach(coach);
        setEditCoachData({ userID: coach.userID, name: coach.name || '', email: coach.email || '' });
        setShowEditModal(true);
    };

    const handleUpdateCoach = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!editCoachData.name.trim() || !editCoachData.email.trim()) {
            setError("Tên và Email của huấn luyện viên không được để trống.");
            return;
        }
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        try {
            // ---- THAY THẾ BẰNG LOGIC GỌI API UPDATE COACH CỦA BẠN ----
            // Ví dụ:
            // await axios.put(`${API_UPDATE_COACH_BASE}/${selectedCoach.userID}`, editCoachData, {
            //     headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            // });
            console.log("Đang cập nhật PT:", selectedCoach.userID, editCoachData); // Log dữ liệu
            alert("Chức năng Cập nhật PT chưa được kết nối API thực tế."); // Thông báo tạm
            // Giả sử thành công để test UI
            setSuccessMessage(`Thông tin huấn luyện viên ID ${selectedCoach.userID} đã được cập nhật (DEMO).`);
            // ---- KẾT THÚC PHẦN THAY THẾ ----

            setShowEditModal(false);
            // fetchCoaches(); // Tải lại danh sách
        } catch (err) {
            handleApiError(err, "Lỗi khi cập nhật thông tin huấn luyện viên.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Xử lý cho nút Xóa PT ---
    const handleDeleteCoach = async (coachId, coachName) => {
        clearMessages();
        if (window.confirm(`Bạn có chắc chắn muốn xóa huấn luyện viên "${coachName}" (ID: ${coachId})?`)) {
            setIsLoading(true);
            const token = sessionStorage.getItem("token");
            try {
                // ---- THAY THẾ BẰNG LOGIC GỌI API DELETE COACH CỦA BẠN ----
                // Ví dụ:
                // await axios.delete(`${API_DELETE_COACH_BASE}/${coachId}`, {
                //     headers: { "Authorization": `Bearer ${token}` }
                // });
                console.log("Đang xóa PT ID:", coachId); // Log dữ liệu
                alert("Chức năng Xóa PT chưa được kết nối API thực tế."); // Thông báo tạm
                // Giả sử thành công để test UI
                setSuccessMessage(`Huấn luyện viên "${coachName}" đã được xóa (DEMO).`);
                // ---- KẾT THÚC PHẦN THAY THẾ ----

                // fetchCoaches(); // Tải lại danh sách
            } catch (err) {
                handleApiError(err, `Lỗi khi xóa huấn luyện viên "${coachName}".`);
            } finally {
                setIsLoading(false);
            }
        }
    };


    if (isLoading && coaches.length === 0) { // Chỉ hiển thị loading chính khi fetch lần đầu
        return (
            <Container className="mt-5 text-center" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 fs-5 text-muted">Đang tải danh sách Huấn luyện viên...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 className="mb-0 fw-bold text-primary">
                    <FaUserTie className="me-2" /> Quản lý Huấn Luyện Viên (PT)
                </h2>
                <Button variant="success" onClick={handleShowCreateModal} disabled={isLoading}>
                    <FaPlus className="me-2" /> Thêm PT mới
                </Button>
            </div>

            {/* Thông báo lỗi và thành công chung */}
            {error && <Alert variant="danger" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaExclamationTriangle className="me-2"/>{error}</Alert>}
            {successMessage && <Alert variant="success" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaCheckCircle className="me-2"/>{successMessage}</Alert>}
            {isLoading && coaches.length > 0 && <div className="text-center my-2"><Spinner size="sm"/> Đang cập nhật...</div>}


            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light d-flex justify-content-between align-items-center">
                    <span>Danh sách PT ({coaches.length})</span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover responsive="lg" borderless align-middle className="mb-0">
                            <thead className="table-primary text-white" style={{ backgroundColor: '#0d6efd' }}>
                                <tr>
                                    <th className="py-3 fw-semibold text-center" style={{width: '15%'}}>User ID</th>
                                    <th className="py-3 fw-semibold text-center" style={{width: '35%'}}>Tên Huấn Luyện Viên</th> {/* Sửa: text-center */}
                                    <th className="py-3 fw-semibold ps-3" style={{width: '30%'}}>Email</th>
                                    <th className="py-3 fw-semibold text-center pe-3" style={{width: '20%'}}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.userID}>
                                            <td className="text-center"><code>{coach.userID}</code></td>
                                            <td className="text-center fw-medium"> {/* Sửa: text-center */}
                                                {coach.name || <span className="text-muted fst-italic">N/A</span>}
                                            </td>
                                            <td className="ps-3">{coach.email || <span className="text-muted fst-italic">N/A</span>}</td>
                                            <td className="text-center pe-3">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    title="Sửa thông tin PT"
                                                    onClick={() => handleShowEditModal(coach)}
                                                    disabled={isLoading}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Xóa PT"
                                                    onClick={() => handleDeleteCoach(coach.userID, coach.name)}
                                                    disabled={isLoading}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center p-5"> {/* Cập nhật colSpan */}
                                            <FaInfoCircle size="2.5em" className="text-muted mb-2" />
                                            <p className="mb-0 fs-5 text-muted">
                                                {isLoading ? "Đang tải..." : (error ? "Không thể tải dữ liệu." : "Hiện không có huấn luyện viên nào.")}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Thêm PT Mới */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaPlus className="me-2"/>Thêm Huấn Luyện Viên Mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateCoach}>
                    <Modal.Body>
                        {error && showCreateModal && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
                        <Form.Group className="mb-3" controlId="newCoachName">
                            <Form.Label>Tên Huấn Luyện Viên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên PT"
                                value={newCoachData.name}
                                onChange={(e) => setNewCoachData({ ...newCoachData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="newCoachEmail">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email PT"
                                value={newCoachData.email}
                                onChange={(e) => setNewCoachData({ ...newCoachData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        {/* Thêm các trường khác ở đây nếu API create yêu cầu */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={isLoading}>
                            <FaTimes className="me-1"/> Hủy
                        </Button>
                        <Button variant="success" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" size="sm" className="me-1"/> : <FaSave className="me-1"/>}
                            Thêm PT
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal Sửa Thông Tin PT */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static" centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaEdit className="me-2"/>Sửa Thông Tin Huấn Luyện Viên (ID: {selectedCoach?.userID})</Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handleUpdateCoach}>
                    <Modal.Body>
                        {error && showEditModal && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
                        <Form.Group className="mb-3" controlId="editCoachName">
                            <Form.Label>Tên Huấn Luyện Viên <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên PT"
                                value={editCoachData.name}
                                onChange={(e) => setEditCoachData({ ...editCoachData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="editCoachEmail">
                            <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email PT"
                                value={editCoachData.email}
                                onChange={(e) => setEditCoachData({ ...editCoachData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        {/* Thêm các trường khác ở đây nếu API update cho phép */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isLoading}>
                             <FaTimes className="me-1"/> Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" size="sm" className="me-1"/> : <FaSave className="me-1"/>}
                            Lưu thay đổi
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default CoachManagement;