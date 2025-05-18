import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Card, Spinner, Alert } from 'react-bootstrap';
import { FaPlusSquare, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// API Endpoint (CHỈ CÓ API GENERATE)
const API_WORKOUT_GENERATE = "http://54.251.220.228:8080/trainingSouls/workout/generate"; // POST

const WorkoutManagement = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

    // Tạo lịch tập tự động cho người dùng hiện tại
    const generateNewWorkout = async () => {
        clearMessages();
        setIsLoading(true);
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            setIsLoading(false);
            return;
        }

        try {
            // API này không yêu cầu payload trong body
            const response = await axios.post(
                API_WORKOUT_GENERATE,
                {}, // Body rỗng
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra xem API có trả về thông báo thành công cụ thể không
            // Hoặc chỉ dựa vào status 200/201
            if (response.status === 200 || response.status === 201 || response.status === 204) {
                setSuccessMessage(response.data?.message || "✅ Lịch tập mới đã được yêu cầu tạo thành công!");
                // Không có gì để fetch lại và hiển thị ở đây
            } else {
                 // Trường hợp status code khác nhưng không phải lỗi mạng
                setError(response.data?.message || `Yêu cầu tạo lịch tập không thành công (Status: ${response.status})`);
            }

        } catch (err) {
            console.error("Lỗi khi tạo lịch tập:", err);
            let errMsg = "❌ Không thể gửi yêu cầu tạo lịch tập!";
            if (err.response) {
                errMsg = err.response.data?.message || err.response.data?.error || `Lỗi từ server: ${err.response.status}`;
            } else if (err.request) {
                errMsg = "Không nhận được phản hồi từ máy chủ.";
            }
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="mt-4 mb-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Card className="p-4 shadow-sm text-center" style={{ maxWidth: '500px', width: '100%' }}>
                <Card.Body>
                    <Card.Title as="h2" className="mb-4">📅 Tạo Lịch Tập Mới</Card.Title>
                    <Card.Text className="mb-4">
                        Nhấn nút bên dưới để hệ thống tự động tạo một lịch tập mới cho bạn.
                    </Card.Text>

                    {isLoading && (
                        <div className="my-3">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 text-muted">Đang xử lý yêu cầu...</p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <Alert variant="danger" onClose={() => setError(null)} dismissible className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-2"/> {error}
                        </Alert>
                    )}
                    {!isLoading && successMessage && (
                        <Alert variant="success" onClose={() => setSuccessMessage(null)} dismissible className="d-flex align-items-center">
                            <FaCheckCircle className="me-2"/> {successMessage}
                        </Alert>
                    )}

                    <div className="d-grid">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={generateNewWorkout}
                            disabled={isLoading}
                            className="d-flex align-items-center justify-content-center"
                        >
                            <FaPlusSquare className="me-2" /> Tạo Lịch Tập
                        </Button>
                    </div>
                </Card.Body>
                 <Card.Footer className="text-muted">
                    Sau khi tạo, bạn có thể xem lịch tập ở mục "Lịch tập của tôi" (nếu có).
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default WorkoutManagement;