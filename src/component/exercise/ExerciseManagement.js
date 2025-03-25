import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Container, Card } from "react-bootstrap";

const API_WORKOUT_GENERATE = "http://54.251.220.228:8080/trainingSouls/workout/generate";
const API_WORKOUT_LIST = "http://54.251.220.228:8080/trainingSouls/workout";

const WorkoutManagement = () => {
    const [workouts, setWorkouts] = useState([]);

    useEffect(() => {
        fetchWorkouts();
    }, []);

    // 📅 Lấy danh sách lịch tập
    const fetchWorkouts = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        try {
            const response = await axios.get(API_WORKOUT_LIST, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkouts(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch tập:", error);
            alert("Không thể lấy danh sách lịch tập!");
        }
    };

    // 🏋️ Tạo danh sách bài tập (Workout)
    const generateWorkout = async () => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
            return;
        }

        try {
            await axios.post(
                API_WORKOUT_GENERATE,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("✅ Danh sách bài tập đã được tạo!");
            fetchWorkouts();
        } catch (error) {
            console.error("Lỗi khi tạo danh sách bài tập:", error);
            alert("❌ Không thể tạo danh sách bài tập!");
        }
    };

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4">🏋️ Quản lý Lịch tập</h2>

            <Card className="p-3 shadow-sm">
                <div className="d-flex justify-content-between mb-3">
                    <Button variant="success" onClick={generateWorkout}>
                        🏋️ Tạo danh sách bài tập
                    </Button>
                    <Button variant="info" onClick={fetchWorkouts}>
                        📅 Lấy danh sách lịch tập
                    </Button>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề</th>
                                <th>Mô tả</th>
                                <th>Video hướng dẫn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workouts.length > 0 ? (
                                workouts.map((workout) => (
                                    <tr key={workout.id}>
                                        <td>{workout.id}</td>
                                        <td>{workout.title}</td>
                                        <td>{workout.description}</td>
                                        <td>
                                            <a href={workout.videoUrl} target="_blank" rel="noopener noreferrer">
                                                🎥 Xem video
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">🚀 Không có lịch tập nào</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default WorkoutManagement;





// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button, Table, Modal, Form, Container, Card } from "react-bootstrap";

// const API_BASE_URL = "http://54.251.220.228:8080/trainingSouls/exercises";
// const API_WORKOUT_GENERATE = "http://54.251.220.228:8080/trainingSouls/workout/generate";
// const API_WORKOUT_LIST = "http://54.251.220.228:8080/trainingSouls/workout";

// const ExerciseManagement = () => {
//     const [exercises, setExercises] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [selectedExercise, setSelectedExercise] = useState(null);
//     const [formData, setFormData] = useState({ title: "", description: "", videoUrl: "" });
//     const [newExercise, setNewExercise] = useState({ title: "", description: "", videoUrl: "" });

//     useEffect(() => {
//         fetchExercises();
//     }, []);

//     // 📌 Lấy danh sách bài tập
//     const fetchExercises = async () => {
//         try {
//             const response = await axios.get(${API_BASE_URL}/getAllExercises);
//             setExercises(response.data);
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách bài tập:", error);
//         }
//     };

//     // 🗑 Xóa bài tập
//     const deleteExercise = async (exerciseId) => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
//             return;
//         }

//         if (window.confirm("Bạn có chắc chắn muốn xóa bài tập này?")) {
//             try {
//                 await axios.delete(${API_BASE_URL}/delete-exercise/${exerciseId}, {
//                     headers: { Authorization: Bearer ${token} },
//                 });
//                 alert("Bài tập đã được xóa");
//                 fetchExercises();
//             } catch (error) {
//                 console.error("Lỗi khi xóa bài tập:", error);
//                 alert("Lỗi khi xóa bài tập! Kiểm tra quyền hạn.");
//             }
//         }
//     };

//     // ✏ Chỉnh sửa bài tập
//     const handleEdit = (exercise) => {
//         setSelectedExercise(exercise);
//         setFormData({
//             title: exercise.title,
//             description: exercise.description,
//             videoUrl: exercise.videoUrl,
//         });
//         setShowModal(true);
//     };

//     // 💾 Lưu bài tập sau khi chỉnh sửa
//     const handleSaveChanges = async () => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
//             return;
//         }

//         try {
//             const updatedExercise = {
//                 title: formData.title,
//                 description: formData.description,
//                 videoUrl: formData.videoUrl,
//             };

//             await axios.post(
//                 ${API_BASE_URL}/update-exercise/${selectedExercise.id},
//                 updatedExercise,
//                 {
//                     headers: {
//                         Authorization: Bearer ${token},
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             alert("✅ Bài tập đã được cập nhật thành công!");
//             setShowModal(false);
//             fetchExercises();
//         } catch (error) {
//             console.error("Lỗi khi cập nhật bài tập:", error);
//             alert("❌ Cập nhật thất bại! Hãy kiểm tra lại quyền hạn và token.");
//         }
//     };

//     // ➕ Thêm bài tập mới
//     const handleCreateExercise = async () => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
//             return;
//         }

//         try {
//             const newExerciseData = {
//                 title: newExercise.title,
//                 description: newExercise.description,
//                 videoUrl: newExercise.videoUrl,
//             };

//             await axios.post(${API_BASE_URL}/create-exercise, newExerciseData, {
//                 headers: {
//                     Authorization: Bearer ${token},
//                     "Content-Type": "application/json",
//                 },
//             });

//             alert("✅ Bài tập mới đã được thêm!");
//             setShowCreateModal(false);
//             fetchExercises();
//         } catch (error) {
//             console.error("Lỗi khi thêm bài tập:", error);
//             alert("❌ Thêm bài tập thất bại!");
//         }
//     };

//     // 📅 Lấy danh sách lịch tập
//     const fetchWorkouts = async () => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
//             return;
//         }

//         try {
//             const response = await axios.get(API_WORKOUT_LIST, {
//                 headers: { Authorization: Bearer ${token} },
//             });
//             console.log("Danh sách lịch tập:", response.data);
//             alert("✅ Lịch tập đã được cập nhật!");
//         } catch (error) {
//             console.error("Lỗi khi lấy danh sách lịch tập:", error);
//         }
//     };

//     // 🏋️ Tạo danh sách bài tập (Workout)
//     const generateWorkout = async () => {
//         const token = sessionStorage.getItem("token");
//         if (!token) {
//             alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
//             return;
//         }

//         try {
//             await axios.post(
//                 API_WORKOUT_GENERATE,
//                 {},
//                 { headers: { Authorization: Bearer ${token} } }
//             );
//             alert("✅ Danh sách bài tập đã được tạo!");
//             fetchExercises();
//         } catch (error) {
//             console.error("Lỗi khi tạo danh sách bài tập:", error);
//             alert("❌ Không thể tạo danh sách bài tập!");
//         }
//     };

//     return (
//         <Container className="mt-4">
//             <h2 className="text-center mb-4">🏋️ Quản lý bài tập</h2>

//             <Card className="p-3 shadow-sm">
//                 <div className="d-flex justify-content-between mb-3">
//                     <Button variant="primary" onClick={() => setShowCreateModal(true)}>
//                         ➕ Thêm bài tập
//                     </Button>
//                     <Button variant="info" onClick={fetchWorkouts}>
//                         📅 Lấy lịch tập
//                     </Button>
//                     <Button variant="success" onClick={generateWorkout}>
//                         🏋️ Tạo danh sách bài tập
//                     </Button>
//                 </div>

//                 <div style={{ overflowX: "auto" }}>
//                     <Table striped bordered hover responsive className="table-custom">
//                         <thead>
//                             <tr>
//                                 <th>ID</th>
//                                 <th>Tiêu đề</th>
//                                 <th>Mô tả</th>
//                                 <th>Video hướng dẫn</th>
//                                 <th>Hành động</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {exercises.length > 0 ? (
//                                 exercises.map((exercise) => (
//                                     <tr key={exercise.id}>
//                                         <td>{exercise.id}</td>
//                                         <td>{exercise.title}</td>
//                                         <td>{exercise.description}</td>
//                                         <td>
//                                             <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
//                                                 🎥 Xem video
//                                             </a>
//                                         </td>
//                                         <td>
//                                             <Button variant="warning" className="me-2" onClick={() => handleEdit(exercise)}>
//                                                 ✏ Chỉnh sửa
//                                             </Button>
//                                             <Button variant="danger" onClick={() => deleteExercise(exercise.id)}>
//                                                 🗑 Xóa
//                                             </Button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="5" className="text-center">🚀 Không có bài tập nào</td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </Table>
//                 </div>
//             </Card>
//         </Container>
//     );
// };

// export default ExerciseManagement;