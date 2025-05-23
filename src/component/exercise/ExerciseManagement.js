import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    Container, Table, Card, Spinner, Alert, Button, Modal, Form, InputGroup
} from 'react-bootstrap';
import {
    FaExclamationTriangle,
    FaCheckCircle,
    FaEdit,
    FaTrashAlt,
    FaSave,
    FaTimes,
    FaPlus, // Giữ lại nếu muốn thêm nút "Thêm mới" sau
    FaImage,
    FaLink,
    FaThList,
    FaInfoCircle
} from 'react-icons/fa';

// API Endpoints
const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/exercises";
const API_GET_ALL_EXERCISES = API_BASE_URL; // GET
const API_UPDATE_EXERCISE_BASE = API_BASE_URL; // PUT /{id}
const API_DELETE_EXERCISE_BASE = API_BASE_URL; // DELETE /{id}


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

const WorkoutManagement = () => {
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    // const [showCreateModal, setShowCreateModal] = useState(false); // Nếu có chức năng tạo
    const [selectedExercise, setSelectedExercise] = useState(null);

    const initialExerciseData = { id: null, name: '', img: '', icon: '', description: '' };
    const [formData, setFormData] = useState(initialExerciseData);
    // const [newExerciseData, setNewExerciseData] = useState(initialExerciseData); // Nếu có chức năng tạo

    useEffect(() => {
        fetchExercises();
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

    const fetchExercises = async () => {
        clearMessages();
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn.");
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get(API_GET_ALL_EXERCISES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data && Array.isArray(response.data)) {
                // Sắp xếp theo tên hoặc ID nếu muốn
                setExercises(response.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
            } else {
                console.warn("API /notifications/exercises không trả về mảng:", response.data);
                setExercises([]);
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Không thể tải danh sách bài tập."));
            setExercises([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowEditModal = (exercise) => {
        clearMessages();
        setSelectedExercise(exercise);
        setFormData({
            id: exercise.id,
            name: exercise.name || '',
            img: exercise.img || '',
            icon: exercise.icon || '',
            description: exercise.description || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateExercise = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!formData.name.trim()) {
            setError("Tên bài tập không được để trống.");
            return;
        }
        if (!selectedExercise?.id) {
            setError("Không xác định được ID bài tập để cập nhật.");
            return;
        }
        setIsLoading(true);
        const token = sessionStorage.getItem("token");

        const payload = {
            name: formData.name.trim(),
            description: formData.description.trim() || null
        };

        try {
            await axios.put(`${API_UPDATE_EXERCISE_BASE}/${selectedExercise.id}`, payload, {
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
            });
            setSuccessMessage(`Thông tin bài tập "${payload.name}" đã được cập nhật.`);
            setShowEditModal(false);
            fetchExercises();
        } catch (err) {
            setError(getApiErrorMessage(err, "Lỗi khi cập nhật thông tin bài tập."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteExercise = async (exerciseId, exerciseName) => {
        clearMessages();
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${exerciseName}" (ID: ${exerciseId})?`)) {
            setIsLoading(true);
            const token = sessionStorage.getItem("token");
            try {
                await axios.delete(`${API_DELETE_EXERCISE_BASE}/${exerciseId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                setSuccessMessage(`Bài tập "${exerciseName}" (ID: ${exerciseId}) đã được xóa.`);
                fetchExercises();
            } catch (err) {
                setError(getApiErrorMessage(err, `Lỗi khi xóa bài tập "${exerciseName}".`));
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- Nếu có chức năng tạo mới ---
    // const handleShowCreateModal = () => {
    //     clearMessages();
    //     setNewExerciseData(initialExerciseData);
    //     setShowCreateModal(true);
    // };
    // const handleCreateExercise = async (e) => {
    //     e.preventDefault();
    //     // ... (logic tương tự handleUpdateExercise nhưng dùng POST và API_CREATE_EXERCISE)
    // };


    if (isLoading && exercises.length === 0) {
        return (
            <Container className="mt-5 text-center" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 fs-5 text-muted">Đang tải danh sách bài tập...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h2 className="mb-0 fw-bold text-primary">
                    <FaThList className="me-2" /> Quản lý Bài Tập (Notifications)
                </h2>
                {/* <Button variant="success" onClick={handleShowCreateModal} disabled={isLoading}>
                    <FaPlus className="me-2" /> Thêm bài tập mới
                </Button> */}
            </div>

            {error && <Alert variant="danger" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaExclamationTriangle className="me-2"/>{error}</Alert>}
            {successMessage && <Alert variant="success" onClose={clearMessages} dismissible className="d-flex align-items-center mb-3"><FaCheckCircle className="me-2"/>{successMessage}</Alert>}
            {isLoading && exercises.length > 0 && <div className="text-center my-2"><Spinner size="sm"/> Đang cập nhật...</div>}

            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light d-flex justify-content-between align-items-center">
                    <span>Danh sách Bài Tập ({exercises.length})</span>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover responsive="lg" borderless align-middle className="mb-0">
                            <thead className="table-primary text-white">
                                <tr>
                                    <th className="py-3 fw-semibold text-center" style={{width: '5%'}}>ID</th>
                                    <th className="py-3 fw-semibold ps-3" style={{width: '20%'}}>Tên Bài Tập</th>
                                    <th className="py-3 fw-semibold ps-3" style={{width: '30%'}}>Mô tả</th>
                                    <th className="py-3 fw-semibold text-center pe-3" style={{width: '15%'}}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exercises.length > 0 ? (
                                    exercises.map((exercise) => (
                                        <tr key={exercise.id}>
                                            <td className="text-center"><code>{exercise.id}</code></td>
                                            <td className="ps-3 fw-medium">
                                                {exercise.name || <span className="text-muted fst-italic">N/A</span>}
                                            </td>
                                           
                                            <td className="ps-3" style={{whiteSpace: 'pre-line', fontSize: '0.9em'}}>
                                                {exercise.description || <span className="text-muted fst-italic">N/A</span>}
                                            </td>
                                            <td className="text-center pe-3">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    className="me-2"
                                                    title="Sửa bài tập"
                                                    onClick={() => handleShowEditModal(exercise)}
                                                    disabled={isLoading}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    title="Xóa bài tập"
                                                    onClick={() => handleDeleteExercise(exercise.id, exercise.name)}
                                                    disabled={isLoading}
                                                >
                                                    <FaTrashAlt />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-5"> {/* Cập nhật colSpan */}
                                            <FaInfoCircle size="2.5em" className="text-muted mb-2" />
                                            <p className="mb-0 fs-5 text-muted">
                                                {isLoading ? "Đang tải..." : (error ? "Không thể tải dữ liệu." : "Hiện không có bài tập nào.")}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Modal Sửa Bài Tập */}
            <Modal show={showEditModal} onHide={() => {setShowEditModal(false); clearMessages();}} backdrop="static" centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaEdit className="me-2"/>Sửa Thông Tin Bài Tập (ID: {selectedExercise?.id})</Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handleUpdateExercise}>
                    <Modal.Body>
                        {error && showEditModal && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
                        <Form.Group className="mb-3" controlId="editExName">
                            <Form.Label>Tên Bài Tập <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text" placeholder="Nhập tên bài tập"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="editExImg">
                            <Form.Label>URL Ảnh Minh Họa</Form.Label>
                            <InputGroup>
                                <InputGroup.Text><FaImage /></InputGroup.Text>
                                <Form.Control
                                    type="url" placeholder="https://example.com/image.jpg"
                                    value={formData.img}
                                    onChange={(e) => setFormData(prev => ({ ...prev, img: e.target.value }))}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="editExIcon">
                            <Form.Label>URL Icon</Form.Label>
                             <InputGroup>
                                <InputGroup.Text><FaLink /></InputGroup.Text>
                                <Form.Control
                                    type="url" placeholder="https://example.com/icon.png"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="editExDesc">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea" rows={4} placeholder="Mô tả chi tiết về bài tập..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {setShowEditModal(false); clearMessages();}} disabled={isLoading}>
                             <FaTimes className="me-1"/> Hủy
                        </Button>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" size="sm" className="me-1"/> : <FaSave className="me-1"/>}
                            Lưu thay đổi
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

             {/* Modal Tạo Bài Tập Mới - Bỏ comment nếu có API */}
            {/*
            <Modal show={showCreateModal} onHide={() => {setShowCreateModal(false); clearMessages();}} backdrop="static" centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title><FaPlus className="me-2"/>Thêm Bài Tập Mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateExercise}>
                    <Modal.Body>
                        {error && showCreateModal && <Alert variant="danger" onClose={clearMessages} dismissible>{error}</Alert>}
                        <Form.Group className="mb-3" controlId="newExName">
                            <Form.Label>Tên Bài Tập <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="text" placeholder="Nhập tên bài tập" value={newExerciseData.name} onChange={(e) => setNewExerciseData(prev => ({...prev, name: e.target.value}))} required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="newExImg">
                            <Form.Label>URL Ảnh Minh Họa</Form.Label>
                            <Form.Control type="url" placeholder="https://example.com/image.jpg" value={newExerciseData.img} onChange={(e) => setNewExerciseData(prev => ({...prev, img: e.target.value}))} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="newExIcon">
                            <Form.Label>URL Icon</Form.Label>
                            <Form.Control type="url" placeholder="https://example.com/icon.png" value={newExerciseData.icon} onChange={(e) => setNewExerciseData(prev => ({...prev, icon: e.target.value}))} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="newExDesc">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control as="textarea" rows={4} placeholder="Mô tả chi tiết..." value={newExerciseData.description} onChange={(e) => setNewExerciseData(prev => ({...prev, description: e.target.value}))} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {setShowCreateModal(false); clearMessages();}} disabled={isLoading}>Hủy</Button>
                        <Button variant="success" type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner as="span" size="sm" className="me-1"/> : <FaSave className="me-1"/>} Thêm Bài Tập
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            */}

        </Container>
    );
};

export default WorkoutManagement;