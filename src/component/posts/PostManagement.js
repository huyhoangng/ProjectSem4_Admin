import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Container, Card, Spinner, Alert } from "react-bootstrap";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSave,
    FaTimes,
    FaPlayCircle,
    FaExclamationTriangle,
    FaCheckCircle
} from "react-icons/fa";

const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/posts";

// Hàm trợ giúp để lấy thông báo lỗi dạng chuỗi (QUAN TRỌNG)
const getStructuredErrorMessage = (error, defaultMessage) => {
    if (typeof error === 'string') { // Nếu lỗi đã là chuỗi thì trả về luôn
        return error;
    }
    if (error && error.response) {
        // Ưu tiên message từ server nếu có và là chuỗi
        if (typeof error.response.data?.message === 'string') {
            return error.response.data.message;
        }
        if (typeof error.response.data?.error === 'string') { // Một số API dùng trường 'error'
            return error.response.data.error;
        }
        // Nếu response.data là một chuỗi (ví dụ: lỗi HTML từ proxy, hoặc thông báo lỗi đơn giản)
        if (typeof error.response.data === 'string' && error.response.data.length < 250 && !error.response.data.startsWith('<')) { // Giới hạn độ dài và kiểm tra không phải HTML
            return error.response.data;
        }
        // Thông báo chung dựa trên status code
        return `${defaultMessage} (Lỗi Server: ${error.response.status} - ${error.response.statusText})`;
    } else if (error && error.request) {
        // Request đã được gửi nhưng không nhận được phản hồi
        return `${defaultMessage} (Không nhận được phản hồi từ máy chủ. Kiểm tra kết nối mạng.)`;
    } else if (error && error.message) {
        // Lỗi xảy ra khi thiết lập request hoặc lỗi JS khác
        return `${defaultMessage} (Lỗi: ${error.message})`;
    }
    return defaultMessage; // Trả về thông báo mặc định nếu không xác định được lỗi cụ thể
};


const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [formData, setFormData] = useState({ id: null, title: "", content: "", imgUrl: "", videoUrl: "" });
    const [newPost, setNewPost] = useState({ title: "", content: "", imgUrl: "", videoUrl: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); // Sẽ luôn là string hoặc null
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    }

    const fetchPosts = async () => {
        clearMessages();
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/getAllPost`);
            setPosts((response.data || []).sort((a, b) => (b.id || 0) - (a.id || 0)));
        } catch (err) { // 'err' ở đây là đối tượng lỗi đầy đủ
            console.error("Lỗi khi lấy danh sách bài viết:", err);
            setError(getStructuredErrorMessage(err, "Không thể tải danh sách bài viết."));
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const deletePost = async (postId) => {
        clearMessages();
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết ID: ${postId}?`)) {
            setIsLoading(true);
            try {
                await axios.delete(`${API_BASE_URL}/delete-post/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuccessMessage(`Bài viết ID: ${postId} đã được xóa thành công.`);
                fetchPosts();
            } catch (err) {
                console.error("Lỗi khi xóa bài viết:", err);
                setError(getStructuredErrorMessage(err, "Lỗi khi xóa bài viết! Kiểm tra quyền hạn."));
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleShowEditModal = (post) => {
        clearMessages();
        setSelectedPost(post);
        setFormData({
            id: post.id,
            title: post.title || "",
            content: Array.isArray(post.content) ? post.content.join("\n") : (post.content || ""),
            imgUrl: Array.isArray(post.imgUrl) ? post.imgUrl.join("\n") : (post.imgUrl || ""),
            videoUrl: Array.isArray(post.videoUrl) ? post.videoUrl.join("\n") : (post.videoUrl || ""),
        });
        setShowEditModal(true);
    };

    const handleShowCreateModal = () => {
        clearMessages();
        setNewPost({ title: "", content: "", imgUrl: "", videoUrl: "" });
        setShowCreateModal(true);
    };

    const handleCreatePost = async () => {
        clearMessages();
        const token = sessionStorage.getItem("token");
        if (!token) {
            setError("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }
        if (!newPost.title.trim()) {
            setError("Tiêu đề không được để trống!");
            return;
        }

        setIsLoading(true);
        try {
            const newPostData = {
                title: newPost.title.trim(),
                content: newPost.content ? newPost.content.split("\n").filter(line => line.trim() !== "") : [],
                imgUrl: newPost.imgUrl ? newPost.imgUrl.split("\n").filter(line => line.trim() !== "") : [],
                videoUrl: newPost.videoUrl ? newPost.videoUrl.split("\n").filter(line => line.trim() !== "") : [],
            };
            await axios.post(`${API_BASE_URL}/create-post`, newPostData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setSuccessMessage("✅ Bài viết mới đã được thêm thành công!");
            setShowCreateModal(false);
            setNewPost({ title: "", content: "", imgUrl: "", videoUrl: "" });
            fetchPosts();
        } catch (err) {
            console.error("Lỗi khi thêm bài viết:", err);
            setError(getStructuredErrorMessage(err, "❌ Thêm bài viết thất bại!"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveChanges = async () => {
    clearMessages();
    const token = sessionStorage.getItem("token");
    if (!token) {
        setError("Bạn chưa đăng nhập hoặc token đã hết hạn!");
        return;
    }
    if (!formData.title.trim()) {
        setError("Tiêu đề không được để trống!");
        return;
    }

    setIsLoading(true);
    try {
        const updatedPostPayload = {
            title: formData.title.trim(),
            content: formData.content ? formData.content.split("\n").filter(line => line.trim() !== "") : [],
            imgUrl: formData.imgUrl ? formData.imgUrl.split("\n").filter(line => line.trim() !== "") : [],
            videoUrl: formData.videoUrl ? formData.videoUrl.split("\n").filter(line => line.trim() !== "") : [],
        };

        // --- THAY ĐỔI Ở ĐÂY ---
        // Nếu API backend yêu cầu POST để update, hãy đổi axios.put thành axios.post
        await axios.post( // <<<< SỬA TỪ .put THÀNH .post NẾU API YÊU CẦU
            `${API_BASE_URL}/update-post/${selectedPost.id}`,
            updatedPostPayload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        // --- KẾT THÚC THAY ĐỔI ---

        setSuccessMessage("✅ Bài viết đã được cập nhật thành công!");
        setShowEditModal(false);
        fetchPosts(); // Tải lại danh sách
    } catch (err) { // err ở đây là đối tượng lỗi đầy đủ
        console.error("Lỗi khi cập nhật bài viết:", err);
        setError(getStructuredErrorMessage(err, "❌ Cập nhật thất bại! Hãy kiểm tra lại."));
    } finally {
        setIsLoading(false);
    }
};

    // --- Hàm render nội dung (giữ nguyên) ---
    const renderContent = (contentArray) => {
        if (!Array.isArray(contentArray) || contentArray.length === 0) {
            return <span className="text-muted fst-italic">Không có nội dung</span>;
        }
        return contentArray.map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < contentArray.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    const renderImageLinks = (imgUrls) => {
        if (!Array.isArray(imgUrls) || imgUrls.length === 0) {
            return <span className="text-muted fst-italic">Không có ảnh</span>;
        }
        return imgUrls.map((img, index) => (
            img.trim() ?
            <a key={index} href={img} target="_blank" rel="noopener noreferrer" className="me-2 mb-2 d-inline-block">
                <img
                    src={img}
                    alt={`Post image ${index + 1}`}
                    style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid #ddd", borderRadius: "4px" }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
            </a> : null
        ));
    };

    const renderVideoLinks = (videoUrls) => {
        if (!Array.isArray(videoUrls) || videoUrls.length === 0) {
            return <span className="text-muted fst-italic">Không có video</span>;
        }
        return videoUrls.map((video, index) => (
            video.trim() ?
            <a key={index} href={video} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm me-2 mb-2">
                <FaPlayCircle className="me-1"/> Video {index + 1}
            </a> : null
        ));
    };

    // --- Phần JSX render giữ nguyên như code bạn đã cung cấp ---
    return (
        <Container className="mt-4 mb-5">
            <h2 className="text-center mb-4">🎯 Quản lý Bài Viết</h2>

            {isLoading && (
                <div className="text-center my-3">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Đang xử lý...</p>
                </div>
            )}
            {!isLoading && error && !showEditModal && !showCreateModal && (
                <Alert variant="danger" onClose={clearMessages} dismissible className="d-flex align-items-center">
                    <FaExclamationTriangle className="me-2 flex-shrink-0" size="1.3em"/> {error} {/* Error ở đây giờ đã là string */}
                </Alert>
            )}
            {!isLoading && successMessage && !showEditModal && !showCreateModal && (
                <Alert variant="success" onClose={clearMessages} dismissible className="d-flex align-items-center">
                    <FaCheckCircle className="me-2 flex-shrink-0" size="1.3em"/> {successMessage}
                </Alert>
            )}

            <Card className="p-3 shadow-sm">
                <div className="d-flex justify-content-end mb-3">
                    <Button variant="primary" onClick={handleShowCreateModal} disabled={isLoading}>
                        <FaPlus className="me-2" /> Thêm bài viết mới
                    </Button>
                </div>
                <div className="table-responsive">
                    <Table striped bordered hover responsive className="table-custom align-middle">
                        <thead>
                            <tr>
                                <th style={{width: '5%'}}>ID</th>
                                <th style={{width: '20%'}}>Tiêu đề</th>
                                <th style={{width: '30%'}}>Nội dung (một phần)</th>
                                <th style={{width: '20%'}}>Hình ảnh</th>
                                <th style={{width: '15%'}}>Video</th>
                                <th style={{width: '10%'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.id}</td>
                                        <td className="text-start">{post.title || <span className="text-muted fst-italic">Không có tiêu đề</span>}</td>
                                        <td className="text-start" style={{ whiteSpace: "pre-line", maxHeight: '100px', overflowY: 'auto' }}>
                                            {Array.isArray(post.content) ?
                                                (post.content.join("\n").substring(0, 150) + (post.content.join("\n").length > 150 ? "..." : ""))
                                                : <span className="text-muted fst-italic">Không có nội dung</span>
                                            }
                                        </td>
                                        <td>
                                            {renderImageLinks(post.imgUrl)}
                                        </td>
                                        <td>
                                            {renderVideoLinks(post.videoUrl)}
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                                                <Button variant="warning" size="sm" className="d-flex align-items-center justify-content-center" onClick={() => handleShowEditModal(post)} disabled={isLoading}>
                                                    <FaEdit className="me-1" /> Sửa
                                                </Button>
                                                <Button variant="danger" size="sm" className="d-flex align-items-center justify-content-center" onClick={() => deletePost(post.id)} disabled={isLoading}>
                                                    <FaTrash className="me-1" /> Xóa
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-4">
                                        {isLoading ? "Đang tải..." : "🚀 Không có bài viết nào. Hãy thêm bài viết mới!"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Modal Chỉnh Sửa Bài Viết */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); clearMessages(); }} backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaEdit className="me-2"/>Chỉnh sửa bài viết (ID: {selectedPost?.id})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && showEditModal && ( // Chỉ hiển thị lỗi này khi edit modal đang mở
                        <Alert variant="danger" onClose={clearMessages} dismissible>
                           <FaExclamationTriangle className="me-2"/> {error} {/* Error ở đây giờ đã là string */}
                        </Alert>
                    )}
                    <Form>
                        <Form.Group controlId="editTitle" className="mb-3">
                            <Form.Label>📝 Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tiêu đề bài viết"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editContent" className="mb-3">
                            <Form.Label>📖 Nội dung (mỗi đoạn trên một dòng)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                placeholder="Nhập nội dung bài viết..."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="editImgUrl" className="mb-3">
                            <Form.Label>🖼 Link Hình ảnh (mỗi link trên một dòng)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="https://example.com/image1.jpg
https://example.com/image2.png"
                                value={formData.imgUrl}
                                onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="editVideoUrl" className="mb-3">
                            <Form.Label>🎥 Link Video (mỗi link trên một dòng)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="https://youtube.com/watch?v=video1
https://vimeo.com/video2"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowEditModal(false); clearMessages(); }} disabled={isLoading}>
                        <FaTimes className="me-1"/> Hủy
                    </Button>
                    <Button variant="success" onClick={handleSaveChanges} disabled={isLoading}>
                        {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/> : <FaSave className="me-1"/>}
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Thêm Bài Viết Mới */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); clearMessages(); }} backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton>
                    <Modal.Title><FaPlus className="me-2"/>Thêm bài viết mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                     {error && showCreateModal && ( // Chỉ hiển thị lỗi này khi create modal đang mở
                        <Alert variant="danger" onClose={clearMessages} dismissible>
                           <FaExclamationTriangle className="me-2"/> {error} {/* Error ở đây giờ đã là string */}
                        </Alert>
                    )}
                    <Form>
                        <Form.Group controlId="newTitle" className="mb-3">
                            <Form.Label>📝 Tiêu đề</Form.Label>
                            <Form.Control type="text" placeholder="Nhập tiêu đề bài viết" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} required />
                        </Form.Group>
                        <Form.Group controlId="newContent" className="mb-3">
                            <Form.Label>📖 Nội dung (mỗi đoạn trên một dòng)</Form.Label>
                            <Form.Control as="textarea" rows={5} placeholder="Nhập nội dung bài viết..." value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="newImgUrl" className="mb-3">
                            <Form.Label>🖼 Link Hình ảnh (mỗi link trên một dòng)</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="https://example.com/image1.jpg
https://example.com/image2.png" value={newPost.imgUrl} onChange={(e) => setNewPost({ ...newPost, imgUrl: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="newVideoUrl" className="mb-3">
                            <Form.Label>🎥 Link Video (mỗi link trên một dòng)</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="https://youtube.com/watch?v=video1
https://vimeo.com/video2" value={newPost.videoUrl} onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowCreateModal(false); clearMessages(); }} disabled={isLoading}>
                        <FaTimes className="me-1"/> Hủy
                    </Button>
                    <Button variant="success" onClick={handleCreatePost} disabled={isLoading}>
                         {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/> : <FaSave className="me-1"/>}
                        Thêm bài viết
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* CSS Custom (giữ nguyên) */}
            <style>
                {`
                .table-custom thead {
                    text-align: center;
                }
                .table-custom td, .table-custom th {
                    vertical-align: middle;
                }
                .table-custom img {
                    transition: transform 0.2s ease-in-out;
                }
                .table-custom img:hover {
                    transform: scale(1.1);
                }
                `}
            </style>
        </Container>
    );
};

export default PostManagement;