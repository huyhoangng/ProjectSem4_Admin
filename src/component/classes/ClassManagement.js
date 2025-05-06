import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Container, Card } from "react-bootstrap";

// --- Assume API endpoint for classes ---
const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/classes"; // Changed endpoint

const ClassManagement = () => {
    const [classes, setClasses] = useState([]); // Renamed state
    const [showEditModal, setShowEditModal] = useState(false); // Renamed state
    const [selectedClass, setSelectedClass] = useState(null); // Renamed state
    // Form data for editing - adjust fields based on your Class model
    const [editFormData, setEditFormData] = useState({ name: "", description: "", instructor: "", schedule: "" });
    // State for the new class form - adjust fields
    const [newClassData, setNewClassData] = useState({ name: "", description: "", instructor: "", schedule: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchClasses(); // Call fetchClasses on mount
    }, []);

    // --- Fetch Classes ---
    const fetchClasses = async () => {
        try {
            // Use the assumed getAllClasses endpoint
            const response = await axios.get(`${API_BASE_URL}/getAllClasses`);
            setClasses(response.data); // Update state with fetched classes
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp học:", error);
            alert("Không thể tải danh sách lớp học.");
        }
    };

    // --- Delete Class ---
    const deleteClass = async (classId) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
            try {
                // Use the assumed delete-class endpoint
                await axios.delete(`${API_BASE_URL}/delete-class/${classId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Lớp học đã được xóa");
                fetchClasses(); // Refresh the list
            } catch (error) {
                console.error("Lỗi khi xóa lớp học:", error);
                alert("Lỗi khi xóa lớp học! Kiểm tra quyền hạn.");
            }
        }
    };

    // --- Handle Edit Button Click ---
    const handleEdit = (classItem) => {
        setSelectedClass(classItem); // Set the class to be edited
        // Populate the edit form with the selected class's data
        setEditFormData({
            name: classItem.name || "", // Use default empty string if undefined
            description: classItem.description || "",
            instructor: classItem.instructor || "",
            schedule: classItem.schedule || "",
        });
        setShowEditModal(true); // Show the edit modal
    };

    // --- Handle Create Class ---
    const handleCreateClass = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        // Basic validation (optional but recommended)
        if (!newClassData.name || !newClassData.instructor) {
             alert("Tên lớp và Giáo viên là bắt buộc!");
             return;
        }

        try {
            // Use the assumed create-class endpoint
            // Send the newClassData (no need to split strings like before unless API expects arrays)
            await axios.post(`${API_BASE_URL}/create-class`, newClassData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            alert("✅ Lớp học mới đã được thêm!");
            setShowCreateModal(false); // Hide modal
            setNewClassData({ name: "", description: "", instructor: "", schedule: "" }); // Reset form
            fetchClasses(); // Refresh the list
        } catch (error) {
            console.error("Lỗi khi thêm lớp học:", error);
            alert("❌ Thêm lớp học thất bại!");
        }
    };

    // --- Handle Save Changes (Update) ---
    const handleSaveChanges = async () => {
        const token = sessionStorage.getItem("token");
        if (!token || !selectedClass) {
            alert("Bạn chưa đăng nhập, token đã hết hạn hoặc chưa chọn lớp học!");
            return;
        }

        try {
            // Prepare the updated data from the edit form
            const updatedClassData = {
                name: editFormData.name,
                description: editFormData.description,
                instructor: editFormData.instructor,
                schedule: editFormData.schedule,
            };

            // Use the assumed update-class endpoint
            await axios.post( // Or PUT, depending on your API
                `${API_BASE_URL}/update-class/${selectedClass.id}`,
                updatedClassData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            alert("✅ Lớp học đã được cập nhật thành công!");
            setShowEditModal(false); // Hide modal
            fetchClasses(); // Refresh the list
        } catch (error) {
            console.error("Lỗi khi cập nhật lớp học:", error);
            alert("❌ Cập nhật thất bại! Hãy kiểm tra lại quyền hạn và token.");
        }
    };

    // --- Handle Input Change for Edit Form ---
     const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // --- Handle Input Change for Create Form ---
    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setNewClassData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };


    return (
        <Container className="mt-4">
            {/* Changed Title */}
            <h2 className="text-center mb-4">📚 Quản lý Lớp học</h2>

            <Card className="p-3 shadow-sm">
            <div className="d-flex justify-content-between mb-3">
                    {/* Changed Button Text */}
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        ➕ Thêm Lớp học
                    </Button>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive className="table-custom">
                        <thead>
                            <tr>
                                {/* Updated Table Headers */}
                                <th>ID</th>
                                <th>Tên Lớp</th>
                                <th>Mô tả</th>
                                <th>Giáo viên</th>
                                <th>Lịch học</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.length > 0 ? (
                                // Map over classes state
                                classes.map((classItem) => (
                                    <tr key={classItem.id}>
                                        {/* Display class data */}
                                        <td>{classItem.id}</td>
                                        <td>{classItem.name}</td>
                                        {/* Use pre-line if description can have line breaks */}
                                        <td style={{ whiteSpace: "pre-line" }}>{classItem.description}</td>
                                        <td>{classItem.instructor}</td>
                                        <td>{classItem.schedule}</td>
                                        <td>
                                            {/* Pass classItem to handleEdit */}
                                            <Button variant="warning" className="me-2" onClick={() => handleEdit(classItem)}>
                                                ✏ Chỉnh sửa
                                            </Button>
                                            {/* Pass classItem.id to deleteClass */}
                                            <Button variant="danger" onClick={() => deleteClass(classItem.id)}>
                                                🗑 Xóa
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* Updated Empty State Message */}
                                    <td colSpan="6" className="text-center">
                                        🚀 Không có lớp học nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Modal Chỉnh Sửa Lớp Học */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    {/* Updated Modal Title */}
                    <Modal.Title>✏ Chỉnh sửa lớp học</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Updated Form Fields for Editing */}
                        <Form.Group controlId="editName">
                            <Form.Label>🏷 Tên Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="name" // Add name attribute
                                value={editFormData.name}
                                onChange={handleEditFormChange} // Use handler
                            />
                        </Form.Group>
                        <Form.Group controlId="editDescription" className="mt-2">
                            <Form.Label>📖 Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description" // Add name attribute
                                value={editFormData.description}
                                onChange={handleEditFormChange} // Use handler
                            />
                        </Form.Group>
                        <Form.Group controlId="editInstructor" className="mt-2">
                            <Form.Label>👩‍🏫 Giáo viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="instructor" // Add name attribute
                                value={editFormData.instructor}
                                onChange={handleEditFormChange} // Use handler
                            />
                        </Form.Group>
                        <Form.Group controlId="editSchedule" className="mt-2">
                            <Form.Label>🗓 Lịch học</Form.Label>
                            <Form.Control
                                type="text" // Or perhaps a date/time picker later
                                name="schedule" // Add name attribute
                                value={editFormData.schedule}
                                onChange={handleEditFormChange} // Use handler
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>❌ Hủy</Button>
                    <Button variant="success" onClick={handleSaveChanges}>💾 Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Thêm Lớp Học */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                     {/* Updated Modal Title */}
                    <Modal.Title>➕ Thêm lớp học mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                         {/* Updated Form Fields for Creating */}
                        <Form.Group controlId="createName">
                            <Form.Label>🏷 Tên Lớp</Form.Label>
                            <Form.Control
                                type="text"
                                name="name" // Add name attribute
                                value={newClassData.name}
                                onChange={handleCreateFormChange} // Use handler
                                required // Add basic HTML validation
                            />
                        </Form.Group>
                        <Form.Group controlId="createDescription" className="mt-2">
                            <Form.Label>📖 Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description" // Add name attribute
                                value={newClassData.description}
                                onChange={handleCreateFormChange} // Use handler
                            />
                        </Form.Group>
                        <Form.Group controlId="createInstructor" className="mt-2">
                            <Form.Label>👩‍🏫 Giáo viên</Form.Label>
                            <Form.Control
                                type="text"
                                name="instructor" // Add name attribute
                                value={newClassData.instructor}
                                onChange={handleCreateFormChange} // Use handler
                                required // Add basic HTML validation
                            />
                        </Form.Group>
                        <Form.Group controlId="createSchedule" className="mt-2">
                            <Form.Label>🗓 Lịch học</Form.Label>
                            <Form.Control
                                type="text"
                                name="schedule" // Add name attribute
                                value={newClassData.schedule}
                                onChange={handleCreateFormChange} // Use handler
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>❌ Hủy</Button>
                    {/* Updated Button Text */}
                    <Button variant="success" onClick={handleCreateClass}>💾 Thêm Lớp học</Button>
                </Modal.Footer>
            </Modal>

            {/* CSS Custom (can remain the same) */}
            <style>
                {`
                .table-custom thead {
                    background-color: #003366; /* Or your preferred header color */
                    color: white;
                    text-align: center;
                }
                .table-custom td, .table-custom th {
                    text-align: center;
                    vertical-align: middle;
                }
                .btn:hover {
                    transform: scale(1.05);
                }
                /* Ensure textareas are reasonably sized */
                textarea.form-control {
                    min-height: 60px;
                }
                `}
            </style>
        </Container>
    );
};

// Export the renamed component
export default ClassManagement;