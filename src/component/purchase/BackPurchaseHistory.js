import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Container, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { BsSearch, BsXCircleFill, BsCalendarRange, BsTrashFill, BsInfoCircleFill, BsPersonFill, BsBoxFill } from 'react-icons/bs';

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

// Helper function to format payment method
const formatPaymentMethod = (method) => {
    const upperMethod = method?.toUpperCase();
    switch (upperMethod) {
        case 'VNPAY':
            return <Badge bg="primary">VNPAY</Badge>;
        case 'BANK_TRANSFER':
            return <Badge bg="info">Chuyển khoản</Badge>;
        case 'CREDIT_CARD':
            return <Badge bg="info">Thẻ tín dụng</Badge>;
        case 'DEBIT_CARD':
            return <Badge bg="info">Thẻ ghi nợ</Badge>;
        default:
            return <Badge bg="secondary">{method || 'N/A'}</Badge>;
    }
};

const BankPurchaseHistory = () => {
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

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        const token = sessionStorage.getItem('token');

        if (!token) {
            setError('Không tìm thấy token xác thực.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                'http://54.251.220.228:8080/trainingSouls/PurchaseTransaction',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const transactions = Array.isArray(response.data) ? response.data : [];
            const sortedTransactions = transactions.sort((a, b) => {
                const dateA = new Date(a.transactionTime || 0);
                const dateB = new Date(b.transactionTime || 0);
                return dateB - dateA;
            });

            setAllTransactions(sortedTransactions);
            setFilteredTransactions(sortedTransactions);
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử giao dịch:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải lịch sử giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    // Delete transaction
    const handleDeleteTransaction = async (transactionId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa giao dịch ID: ${transactionId}?`)) {
            return;
        }

        setDeleting(true);
        const token = sessionStorage.getItem('token');

        try {
            await axios.delete(
                `http://54.251.220.228:8080/trainingSouls/PurchaseTransaction/${transactionId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            await fetchTransactions(); // Refresh the list
        } catch (err) {
            console.error('Lỗi khi xóa giao dịch:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi xóa giao dịch.');
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
    }, [searchTermId, searchStartDate, searchEndDate, searchUser, allTransactions]);

    // Initial fetch
    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleResetSearch = () => {
        setSearchTermId('');
        setSearchStartDate('');
        setSearchEndDate('');
        setSearchUser('');
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
            <h2 className="mb-4">Lịch Sử Giao Dịch Ngân Hàng</h2>

            {/* Search Bar */}
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <h5 className="card-title mb-3"><BsSearch className="me-2"/>Bộ lọc tìm kiếm</h5>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <Form.Label htmlFor="searchTermIdInput">Theo ID Giao dịch</Form.Label>
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
                        <div className="col-md-4">
                            <Form.Label htmlFor="searchStartDateInput">Khoảng thời gian</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type="date"
                                    id="searchStartDateInput"
                                    value={searchStartDate}
                                    onChange={(e) => setSearchStartDate(e.target.value)}
                                />
                                <span className="align-self-center">đến</span>
                                <Form.Control
                                    type="date"
                                    id="searchEndDateInput"
                                    value={searchEndDate}
                                    onChange={(e) => setSearchEndDate(e.target.value)}
                                    min={searchStartDate || undefined}
                                />
                            </div>
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
                                    <th className="py-3 fw-semibold">Người mua</th>
                                    <th className="py-3 fw-semibold">Sản phẩm</th>
                                    <th className="py-3 fw-semibold text-center">Ngày</th>
                                    <th className="py-3 fw-semibold text-center">Phương thức</th>
                                    <th className="py-3 fw-semibold text-end">Số tiền</th>
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
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <BsBoxFill className="text-success me-2" />
                                                    <div>
                                                        <div className="fw-bold">{transaction.item?.name || 'N/A'}</div>
                                                        <small className="text-muted">ID: {transaction.item?.itemId || 'N/A'}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {transaction.transactionTime
                                                    ? new Date(transaction.transactionTime).toLocaleString('vi-VN', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : 'N/A'}
                                            </td>
                                            <td className="text-center">
                                                {formatPaymentMethod(transaction.paymentMethod)}
                                            </td>
                                            <td className="text-end fw-bold">
                                                {transaction.amount?.toLocaleString('vi-VN')} VNĐ
                                            </td>
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
                                                    <BsTrashFill size="1.2em" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center p-5">
                                            <BsInfoCircleFill size="2em" className="text-muted mb-2" />
                                            <p className="mb-0 text-muted">
                                                {(searchTermId || searchStartDate || searchEndDate || searchUser)
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

export default BankPurchaseHistory; 