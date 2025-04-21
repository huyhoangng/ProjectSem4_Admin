import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Card } from "react-bootstrap";

const API_RANKS = "http://54.251.220.228:8080/trainingSouls/ranks";

const Ranks = () => {
    const [ranks, setRanks] = useState([]);

    useEffect(() => {
        fetchRanks();
    }, []);

    const fetchRanks = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            console.error("Không tìm thấy token!");
            return;
        }

        try {
            const response = await axios.get(API_RANKS, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            setRanks(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách rank:", error);
            alert("Không thể tải bảng xếp hạng!");
        }
    };

    const getMedal = (index) => {
        const medalStyle = {
            fontSize: "1.75rem", // 👈 chỉnh to nhỏ tùy thích
        };

        switch (index) {
            case 0:
                return <span style={medalStyle}>🥇</span>;
            case 1:
                return <span style={medalStyle}>🥈</span>;
            case 2:
                return <span style={medalStyle}>🥉</span>;
            default:
                return <span style={medalStyle}>{index + 1}</span>;
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">🏆 Bảng xếp hạng người dùng</h2>
            <Card className="p-3 shadow-sm">
                <div style={{ overflowX: "auto" }}>
                    <Table striped bordered hover responsive className="table-rank">
                        <thead>
                            <tr className="text-center">
                                <th>Hạng</th>
                                <th>Người dùng</th>
                                <th>Điểm số</th>
                            </tr>
                        </thead>
                        <tbody>
  {ranks.length > 0 ? (
    ranks.map((rank, index) => (
      <tr key={rank.id} className="text-center">
        <td>{getMedal(index)}</td>
        <td>{rank.userName}</td>
        <td>{rank.totalScore}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" className="text-center">Không có dữ liệu xếp hạng</td>
    </tr>
  )}
</tbody>
                    </Table>
                </div>
            </Card>
        </Container>
    );
};

export default Ranks;
