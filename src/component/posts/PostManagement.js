import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Modal, Form, Container, Card } from "react-bootstrap";

const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/posts";

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [formData, setFormData] = useState({ title: "", content: "", imgUrl: "", videoUrl: "" });
    const [newPost, setNewPost] = useState({ title: "", content: "", imgUrl: "", videoUrl: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/getAllPost`);
            setPosts(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách bài viết:", error);
        }
    };

    const deletePost = async (postId) => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            try {
                await axios.delete(`${API_BASE_URL}/delete-post/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Bài viết đã được xóa");
                fetchPosts();
            } catch (error) {
                console.error("Lỗi khi xóa bài viết:", error);
                alert("Lỗi khi xóa bài viết! Kiểm tra quyền hạn.");
            }
        }
    };

    const handleEdit = (post) => {
        setSelectedPost(post);
        setFormData({
            title: post.title,
            content: post.content.join("\n"),
            imgUrl: post.imgUrl.join("\n"),
            videoUrl: post.videoUrl.join("\n"),
        });
        setShowModal(true);
    };
    const handleCreatePost = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        try {
            const newPostData = {
                title: newPost.title,
                content: newPost.content.split("\n"),
                imgUrl: newPost.imgUrl.split("\n"),
                videoUrl: newPost.videoUrl.split("\n"),
            };

            await axios.post(`${API_BASE_URL}/create-post`, newPostData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            alert("✅ Bài viết mới đã được thêm!");
            setShowCreateModal(false);
            fetchPosts();
        } catch (error) {
            console.error("Lỗi khi thêm bài viết:", error);
            alert("❌ Thêm bài viết thất bại!");
        }
    };

    const handleSaveChanges = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        try {
            const updatedPost = {
                title: formData.title,
                content: formData.content.split("\n"),
                imgUrl: formData.imgUrl.split("\n"),
                videoUrl: formData.videoUrl.split("\n"),
            };

            await axios.post(
                `${API_BASE_URL}/update-post/${selectedPost.id}`,
                updatedPost,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            alert("✅ Bài viết đã được cập nhật thành công!");
            setShowModal(false);
            fetchPosts();
        } catch (error) {
            console.error("Lỗi khi cập nhật bài viết:", error);
            alert("❌ Cập nhật thất bại! Hãy kiểm tra lại quyền hạn và token.");
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">🎯 Quản lý bài viết</h2>

            <Card className="p-3 shadow-sm">
            <div className="d-flex justify-content-between mb-3">
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        ➕ Thêm bài viết
                    </Button>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive className="table-custom">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Nội dung</th>
                                <th>Hình ảnh</th>
                                <th>Video</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>{post.id}</td>
                                        <td>{post.title}</td>
                                        <td style={{ whiteSpace: "pre-line" }}>
                                            {post.content.join("\n")}
                                        </td>
                                        <td>
                                            {post.imgUrl.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img}
                                                    alt="Post"
                                                    style={{ width: "100px", height: "auto", marginRight: "5px" }}
                                                />
                                            ))}
                                        </td>
                                        <td>
                                            {post.videoUrl.map((video, index) => (
                                                <a key={index} href={video} target="_blank" rel="noopener noreferrer">
                                                    🔗 Video {index + 1}
                                                </a>
                                            ))}
                                        </td>
                                        <td>
                                            <Button variant="warning" className="me-2" onClick={() => handleEdit(post)}>
                                                ✏ Chỉnh sửa
                                            </Button>
                                            <Button variant="danger" onClick={() => deletePost(post.id)}>
                                                🗑 Xóa
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        🚀 Không có bài viết nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Modal Chỉnh Sửa Bài Viết */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>✏ Chỉnh sửa bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="title">
                            <Form.Label>📝 Tiêu đề</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="content" className="mt-2">
                            <Form.Label>📖 Nội dung</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="imgUrl" className="mt-2">
                            <Form.Label>🖼 Ảnh (mỗi link trên một dòng)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.imgUrl}
                                onChange={(e) => setFormData({ ...formData, imgUrl: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="videoUrl" className="mt-2">
                            <Form.Label>🎥 Video (mỗi link trên một dòng)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>❌ Hủy</Button>
                    <Button variant="success" onClick={handleSaveChanges}>💾 Lưu thay đổi</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Thêm Bài Viết */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>➕ Thêm bài viết</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="newTitle">
                            <Form.Label>📝 Tiêu đề</Form.Label>
                            <Form.Control type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="newContent" className="mt-2">
                            <Form.Label>📖 Nội dung</Form.Label>
                            <Form.Control as="textarea" rows={4} value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="newImgUrl" className="mt-2">
                            <Form.Label>🖼 Ảnh (mỗi link trên một dòng)</Form.Label>
                            <Form.Control as="textarea" rows={2} value={newPost.imgUrl} onChange={(e) => setNewPost({ ...newPost, imgUrl: e.target.value })} />
                        </Form.Group>
                        <Form.Group controlId="newVideoUrl" className="mt-2">
                            <Form.Label>🎥 Video (mỗi link trên một dòng)</Form.Label>
                            <Form.Control as="textarea" rows={2} value={newPost.videoUrl} onChange={(e) => setNewPost({ ...newPost, videoUrl: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>❌ Hủy</Button>
                    <Button variant="success" onClick={handleCreatePost}>💾 Thêm bài viết</Button>
                </Modal.Footer>
            </Modal>

            {/* CSS Custom */}
            <style>
                {`
                .table-custom thead {
                    background-color: #003366;
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
                `}
            </style>
        </Container>
    );
};

export default PostManagement;
