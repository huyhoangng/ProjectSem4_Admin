import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { BsSearch, BsXCircleFill, BsCalendarRange, BsTrashFill, BsInfoCircleFill, BsPersonFill, BsArrowUpCircleFill, BsArrowDownCircleFill } from 'react-icons/bs';

// Helper function to format transaction status
const formatStatus = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
        case 'PENDING':
            return <Badge bg="warning" text="dark">Đang chờ</Badge>;
        case 'COMPLETED':
        case 'SUCCESS':
            return <Badge bg="success">Thành công</Badge>;
        case 'FAILED':
            return <Badge bg="danger">Thất bại</Badge>;
        case 'CANCELLED':
            return <Badge bg="secondary">Đã hủy</Badge>;
        default:
            return <Badge bg="light" text="dark">{status || 'N/A'}</Badge>;
    }
};

// Helper function to format transaction type
const formatTransactionType = (type) => {
    const upperType = type?.toUpperCase();
    switch (upperType) {
        case 'EARN':
            return <Badge bg="success"><BsArrowUpCircleFill className="me-1" />Nhận điểm</Badge>;
        case 'SPEND':
            return <Badge bg="danger"><BsArrowDownCircleFill className="me-1" />Tiêu điểm</Badge>;
        default:
            return <Badge bg="secondary">{type || 'N/A'}</Badge>;
    }
};

const PurchaseHistory = () => {
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Search states
    const [searchTermId, setSearchTermId] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [searchType, setSearchType] = useState('');

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem('token');

        if (!token) {
            setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                'http://54.251.220.228:8080/trainingSouls/PointsTransaction',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.status === 404) {
                setError('Không tìm thấy dữ liệu giao dịch điểm.');
                setAllTransactions([]);
                setFilteredTransactions([]);
                return;
            }

            const transactions = Array.isArray(response.data) ? response.data : [];
            const sortedTransactions = transactions.sort((a, b) => {
                const dateA = new Date(a.transactionTime || 0);
                const dateB = new Date(b.transactionTime || 0);
                return dateB - dateA;
            });

            setAllTransactions(sortedTransactions);
            setFilteredTransactions(sortedTransactions);
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử giao dịch điểm:', err);
            if (err.response) {
                switch (err.response.status) {
                    case 404:
                        setError('Không tìm thấy dữ liệu giao dịch điểm.');
                        break;
                    case 401:
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        break;
                    case 403:
                        setError('Bạn không có quyền truy cập dữ liệu này.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Lỗi khi tải lịch sử giao dịch điểm.');
                }
            } else if (err.request) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Đã xảy ra lỗi không xác định.');
            }
            setAllTransactions([]);
            setFilteredTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // Delete transaction
    const handleDeleteTransaction = async (transactionId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa giao dịch điểm ID: ${transactionId}?`)) {
            return;
        }

        setDeleting(true);
        const token = sessionStorage.getItem('token');

        try {
            const response = await axios.delete(
                `http://54.251.220.228:8080/trainingSouls/PointsTransaction/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.status === 404) {
                setError('Không tìm thấy giao dịch điểm cần xóa.');
                return;
            }

            await fetchTransactions(); // Refresh the list
        } catch (err) {
            console.error('Lỗi khi xóa giao dịch điểm:', err);
            if (err.response) {
                switch (err.response.status) {
                    case 404:
                        setError('Không tìm thấy giao dịch điểm cần xóa.');
                        break;
                    case 401:
                        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        break;
                    case 403:
                        setError('Bạn không có quyền xóa giao dịch điểm này.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Lỗi khi xóa giao dịch điểm.');
                }
            } else if (err.request) {
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError('Đã xảy ra lỗi không xác định.');
            }
        } finally {
            setDeleting(false);
        }
    };

    // Filter effect
    useEffect(() => {
        let filtered = allTransactions;

        if (searchTermId.trim()) {
            filtered = filtered.filter(item =>
                item.transactionId?.toString().includes(searchTermId.trim())
            );
        }

        if (searchUser.trim()) {
            filtered = filtered.filter(item =>
                item.user?.name?.toLowerCase().includes(searchUser.trim().toLowerCase()) ||
                item.user?.email?.toLowerCase().includes(searchUser.trim().toLowerCase())
            );
        }

        if (searchType) {
            filtered = filtered.filter(item =>
                item.type?.toUpperCase() === searchType.toUpperCase()
            );
        }

        if (searchStartDate || searchEndDate) {
            filtered = filtered.filter(item => {
                if (!item.transactionTime) return false;
                const itemDate = new Date(item.transactionTime);
                itemDate.setHours(0, 0, 0, 0);

                let match = true;
                if (searchStartDate) {
                    const startDate = new Date(searchStartDate);
                    startDate.setHours(0, 0, 0, 0);
                    match = match && itemDate >= startDate;
                }
                if (searchEndDate) {
                    const endDate = new Date(searchEndDate);
                    endDate.setHours(23, 59, 59, 999);
                    match = match && itemDate <= endDate;
                }
                return match;
            });
        }

        setFilteredTransactions(filtered);
    }, [searchTermId, searchStartDate, searchEndDate, searchUser, searchType, allTransactions]);

    // Initial fetch
    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleResetSearch = () => {
        setSearchTermId('');
        setSearchStartDate('');
        setSearchEndDate('');
        setSearchUser('');
        setSearchType('');
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2 text-muted">Đang tải lịch sử giao dịch...</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <h2 className="mb-4">Lịch Sử Giao Dịch</h2>

            {/* Search Bar */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <h5 className="card-title mb-3"><BsSearch className="me-2"/>Bộ lọc tìm kiếm</h5>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <Form.Label htmlFor="searchTermIdInput">Theo ID</Form.Label>
                            <Form.Control
                                type="text"
                                id="searchTermIdInput"
                                placeholder="Nhập ID..."
                                value={searchTermId}
                                onChange={(e) => setSearchTermId(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <Form.Label htmlFor="searchUserInput">Tìm theo người dùng</Form.Label>
                            <Form.Control
                                type="text"
                                id="searchUserInput"
                                placeholder="Tên hoặc email..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <Form.Label htmlFor="searchTypeInput">Loại giao dịch</Form.Label>
                            <Form.Select
                                id="searchTypeInput"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="EARN">Nhận điểm</option>
                                <option value="SPEND">Tiêu điểm</option>
                            </Form.Select>
                        </div>
                    
                        <div className="col-md-2 d-grid">
                            <Button
                                variant="outline-secondary"
                                onClick={handleResetSearch}
                                className="d-flex align-items-center justify-content-center"
                            >
                                <BsXCircleFill className="me-2" /> Reset
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    <BsInfoCircleFill className="me-2" />
                    {error}
                </Alert>
            )}

            {/* Transactions Table */}
            <Card className="shadow-sm">
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table striped hover responsive="lg" borderless align-middle className="mb-0">
                            <thead className="table-light" style={{ borderBottom: '2px solid #dee2e6' }}>
                                <tr>
                                    <th className="py-3 fw-semibold text-center">ID</th>
                                    <th className="py-3 fw-semibold">Người dùng</th>
                                    <th className="py-3 fw-semibold text-center">Loại</th>
                                    <th className="py-3 fw-semibold text-center">Điểm</th>
                                    <th className="py-3 fw-semibold">Mô tả</th>
                                    <th className="py-3 fw-semibold text-center">Trạng thái</th>
                                    <th className="py-3 fw-semibold text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction.transactionId}>
                                            <td className="text-center"><code>{transaction.transactionId}</code></td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <BsPersonFill className="text-primary me-2" />
                                                    <div>
                                                        <div className="fw-bold">{transaction.user?.name || 'N/A'}</div>
                                                        <small className="text-muted">{transaction.user?.email || 'N/A'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {formatTransactionType(transaction.type)}
                                            </td>
                                            <td className="text-center fw-bold">
                                                {transaction.type === 'EARN' ? '+' : '-'}
                                                {transaction.points?.toLocaleString('vi-VN')}
                                            </td>
                                            <td>{transaction.description || 'N/A'}</td>
                                            {/* <td className="text-center">
                                                {transaction.transactionTime
                                                    ? new Date(transaction.transactionTime).toLocaleString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : 'N/A'}
                                            </td> */}
                                            <td className="text-center">
                                                {formatStatus(transaction.status)}
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteTransaction(transaction.transactionId)}
                                                    disabled={deleting}
                                                    className="d-inline-flex align-items-center justify-content-center p-1"
                                                >
                                                    <BsTrashFill size="1.5em" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center p-5">
                                            <BsInfoCircleFill size="2em" className="text-muted mb-2" />
                                            <p className="mb-0 text-muted">
                                                {(searchTermId || searchStartDate || searchEndDate || searchUser || searchType)
                                                    ? "Không tìm thấy giao dịch nào khớp với tiêu chí tìm kiếm."
                                                    : "Không có giao dịch nào."
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
        </Container>
    );
};

export default PurchaseHistory;