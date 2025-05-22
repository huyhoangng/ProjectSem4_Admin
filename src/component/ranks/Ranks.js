import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Card, Form, InputGroup, Spinner, Alert, Badge,Row, Col } from "react-bootstrap";
import {
    FaSearch,
    FaTrophy,
    FaHeartbeat,
    FaRunning,
    FaShieldAlt,
    FaSkullCrossbones,
    FaSortAmountDown,
    FaSortAmountUp,
    FaExclamationTriangle // <<< THÊM ICON NÀY
} from "react-icons/fa";

const API_RANKS = "http://54.251.220.228:8080/trainingSouls/ranks";

// Define season colors (giữ nguyên)
const seasonColors = {
    Spring: "#28a745",
    Summer: "#fd7e14",
    Autumn: "#ffc107",
    Winter: "#0d6efd",
};

const Ranks = () => {
    const [allRanks, setAllRanks] = useState([]); // Dữ liệu gốc từ API
    const [filteredRanks, setFilteredRanks] = useState([]); // Dữ liệu đã lọc để hiển thị
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSeason, setCurrentSeason] = useState({ name: "", color: "#6c757d" });
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'totalScore', direction: 'descending' });


    const determineSeason = () => { /* ... (giữ nguyên) ... */
        const month = new Date().getMonth();
        if (month >= 0 && month <= 2) return { name: "Xuân", color: seasonColors.Spring };
        else if (month >= 3 && month <= 5) return { name: "Hạ", color: seasonColors.Summer };
        else if (month >= 6 && month <= 8) return { name: "Thu", color: seasonColors.Autumn };
        else return { name: "Đông", color: seasonColors.Winter };
    };

    useEffect(() => {
        fetchRanks();
        setCurrentSeason(determineSeason());
    }, []);

    // Effect để lọc và sắp xếp khi searchTerm hoặc allRanks hoặc sortConfig thay đổi
    useEffect(() => {
        let processedRanks = [...allRanks]; // Tạo bản sao để không thay đổi allRanks gốc

        // Lọc theo searchTerm
        if (searchTerm.trim()) {
            const lowercasedFilter = searchTerm.trim().toLowerCase();
            processedRanks = processedRanks.filter(rank =>
                rank.userName?.toLowerCase().includes(lowercasedFilter)
            );
        }

        // Sắp xếp
        if (sortConfig.key) {
            processedRanks.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Xử lý trường hợp giá trị là null hoặc undefined để tránh lỗi
                valA = valA === null || valA === undefined ? -Infinity : valA;
                valB = valB === null || valB === undefined ? -Infinity : valB;


                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        setFilteredRanks(processedRanks);
    }, [searchTerm, allRanks, sortConfig]);


    const fetchRanks = async () => {
        setIsLoading(true);
        setError(null);
        const token = sessionStorage.getItem("token");

        if (!token) {
            setError("Vui lòng đăng nhập để xem bảng xếp hạng.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(API_RANKS, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json", // Thường không cần cho GET
                }
            });
            // API trả về mảng trực tiếp, không cần response.data.sort nữa vì sẽ sort trong useEffect
            setAllRanks(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách rank:", err);
            if (err.response) {
                 setError(err.response.data?.message || `Không thể tải bảng xếp hạng (Lỗi: ${err.response.status})`);
            } else if (err.request) {
                setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.");
            } else {
                setError("Đã xảy ra lỗi không xác định khi tải bảng xếp hạng.");
            }
            setAllRanks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getRankDisplay = (rankValue, index) => {
        // Ưu tiên hiển thị rank từ API nếu có, nếu không thì dùng index
        const displayRank = rankValue !== null && rankValue !== undefined ? rankValue : index + 1;
        const medalStyle = { fontSize: "1.75rem", verticalAlign: 'middle' };

        if (displayRank === 1) return <span style={medalStyle}>🥇</span>;
        if (displayRank === 2) return <span style={medalStyle}>🥈</span>;
        if (displayRank === 3) return <span style={medalStyle}>🥉</span>;
        return <Badge pill bg="secondary" className="px-2 py-1 fs-6">{displayRank}</Badge>;
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            // Optional: Xóa sắp xếp nếu nhấp lại cột đang sắp xếp giảm dần
            // direction = null;
            // key = null;
            // Hoặc quay lại ascending
             direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'ascending' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />;
        }
        return null;
    };


    return (
        <Container className="mt-4 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h2 className="mb-0 text-primary fw-bold">
                    <FaTrophy className="me-2" /> Bảng Xếp Hạng Người Dùng
                </h2>
                {currentSeason.name && (
                    <div
                        className="season-indicator px-3 py-2"
                        style={{ backgroundColor: currentSeason.color }}
                    >
                        Mùa: <strong>{currentSeason.name}</strong>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
                    <p className="mt-3 fs-5 text-muted">Đang tải bảng xếp hạng...</p>
                </div>
            )}
            {error && <Alert variant="danger" className="d-flex align-items-center"><FaExclamationTriangle className="me-2"/> {error}</Alert>}

            {!isLoading && !error && (
                <Card className="shadow-sm">
                    <Card.Header className="bg-light p-3">
                        <Form>
                            <Row className="g-2">
                                <Col>
                                    <InputGroup>
                                        <InputGroup.Text><FaSearch /></InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm kiếm theo tên người dùng..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Header>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table striped bordered hover responsive className="table-rank align-middle mb-0">
                                <thead className="table-dark">
                                    <tr className="text-center">
                                        <th onClick={() => requestSort('rank')} style={{cursor: 'pointer', width: '8%'}}>
                                            Hạng {getSortIndicator('rank')}
                                        </th>
                                        <th onClick={() => requestSort('userName')} style={{cursor: 'pointer', width: '25%'}} className="text-start ps-3">
                                            Người dùng {getSortIndicator('userName')}
                                        </th>
                                        <th onClick={() => requestSort('totalScore')} style={{cursor: 'pointer', width: '12%'}}>
                                            Tổng Điểm {getSortIndicator('totalScore')}
                                        </th>
                                        <th onClick={() => requestSort('strengthScore')} style={{cursor: 'pointer', width: '12%'}}>
                                            Sức mạnh {getSortIndicator('strengthScore')}
                                        </th>
                                        <th onClick={() => requestSort('enduranceScore')} style={{cursor: 'pointer', width: '12%'}}>
                                            Sức bền {getSortIndicator('enduranceScore')}
                                        </th>
                                        <th onClick={() => requestSort('healthScore')} style={{cursor: 'pointer', width: '12%'}}>
                                            Sức khỏe {getSortIndicator('healthScore')}
                                        </th>
                                        <th onClick={() => requestSort('agilityScore')} style={{cursor: 'pointer', width: '12%'}}>
                                            Nhanh nhẹn {getSortIndicator('agilityScore')}
                                        </th>
                                        {/* <th onClick={() => requestSort('deathpoints')} style={{cursor: 'pointer', width: '10%'}}>
                                            Death Points {getSortIndicator('deathpoints')}
                                        </th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRanks.length > 0 ? (
                                        filteredRanks.map((rankItem, index) => (
                                            <tr key={rankItem.id || rankItem.userId || `rank-${index}`} className="text-center">
                                                <td className="fw-bold">{getRankDisplay(rankItem.rank, index)}</td>
                                                <td className="text-start ps-3 fw-medium">{rankItem.userName || <span className="text-muted fst-italic">N/A</span>}</td>
                                                <td className="fw-bolder text-primary">{rankItem.totalScore?.toFixed(1) ?? 'N/A'}</td>
                                                <td>{rankItem.strengthScore ?? '-'}</td>
                                                <td>{rankItem.enduranceScore ?? '-'}</td>
                                                <td>{rankItem.healthScore ?? '-'}</td>
                                                <td>{rankItem.agilityScore ?? '-'}</td>
                                                {/* <td>{rankItem.deathpoints ?? '-'}</td> */}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4"> {/* Cập nhật colSpan */}
                                                {searchTerm ? "Không tìm thấy người dùng nào khớp." : "Hiện không có dữ liệu xếp hạng."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            <style>
                {`
                .season-indicator {
                    color: #fff;
                    padding: 8px 16px; /* Tăng padding */
                    border-radius: 20px; /* Bo tròn hơn */
                    font-weight: 500; /* Điều chỉnh độ đậm */
                    font-size: 1em; /* Tăng kích thước chữ */
                    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.2);
                    text-align: center;
                    transition: background-color 0.5s ease-in-out;
                }
                .table-rank thead {
                    /* background-color: #343a40; */ /* Dark header */
                    /* color: white; */
                    font-weight: 600; /* Đậm hơn chút */
                }
                .table-rank td, .table-rank th {
                     vertical-align: middle;
                }
                .table-rank th[style*="cursor:pointer"]:hover {
                    background-color: #495057; /* Màu khi hover header có thể sort */
                    color: white;
                }
                `}
            </style>
        </Container>
    );
};

export default Ranks;