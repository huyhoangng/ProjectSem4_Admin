import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Card } from "react-bootstrap";

const API_RANKS = "http://54.251.220.228:8080/trainingSouls/ranks";

// Define season colors (adjust hex codes if needed)
const seasonColors = {
    Spring: "#28a745", // Green (Bootstrap success color)
    Summer: "#fd7e14", // Orange (Bootstrap orange color)
    Autumn: "#ffc107", // Yellow (Bootstrap warning color)
    Winter: "#0d6efd", // Blue (Bootstrap primary color)
};

const Ranks = () => {
    const [ranks, setRanks] = useState([]);
    // State for the current season name and color
    const [currentSeason, setCurrentSeason] = useState({ name: "", color: "#6c757d" }); // Default grey

    // Function to determine the current season based on month (Northern Hemisphere approx.)
    const determineSeason = () => {
        const month = new Date().getMonth(); // 0 = January, 11 = December
    
        // Mùa Xuân: Tháng 1, 2, 3 (index 0, 1, 2)
        if (month >= 0 && month <= 2) {
            return { name: "Xuân", color: seasonColors.Spring };
        }
        // Mùa Hạ: Tháng 4, 5, 6 (index 3, 4, 5)
        else if (month >= 3 && month <= 5) {
            return { name: "Hạ", color: seasonColors.Summer };
        }
        // Mùa Thu: Tháng 7, 8, 9 (index 6, 7, 8)
        else if (month >= 6 && month <= 8) {
            return { name: "Thu", color: seasonColors.Autumn };
        }
        // Mùa Đông: Tháng 10, 11, 12 (index 9, 10, 11)
        else { // Các tháng còn lại (9, 10, 11)
            return { name: "Đông", color: seasonColors.Winter };
        }
    };

    useEffect(() => {
        fetchRanks();
        // Determine and set the current season on component mount
        const seasonInfo = determineSeason();
        setCurrentSeason(seasonInfo);
    }, []); // Empty dependency array means this runs once on mount

    const fetchRanks = async () => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            console.error("Không tìm thấy token!");
            // Optionally, show an alert or message to the user
            // alert("Vui lòng đăng nhập để xem bảng xếp hạng.");
            return;
        }

        try {
            const response = await axios.get(API_RANKS, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            // Sort ranks by totalScore descending before setting state
            const sortedRanks = response.data.sort((a, b) => b.totalScore - a.totalScore);
            setRanks(sortedRanks);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách rank:", error);
            alert("Không thể tải bảng xếp hạng!");
        }
    };

    const getMedal = (index) => {
        const medalStyle = {
            fontSize: "1.75rem",
        };

        switch (index) {
            case 0:
                return <span style={medalStyle}>🥇</span>;
            case 1:
                return <span style={medalStyle}>🥈</span>;
            case 2:
                return <span style={medalStyle}>🥉</span>;
            default:
                // Display rank number for others
                return <span style={{ fontWeight: 'bold' }}>{index + 1}</span>;
        }
    };

    return (
        <Container className="mt-5">
            {/* Header section with Title and Season Indicator */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">🏆 Bảng xếp hạng người dùng</h2>
                {currentSeason.name && ( // Render only if season name is available
                    <div
                        className="season-indicator" // Use class for base styles
                        style={{ backgroundColor: currentSeason.color }} // Apply dynamic color
                    >
                        Mùa: {currentSeason.name}
                    </div>
                )}
            </div>

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
                                    // Assuming the API response has a unique 'id' or similar for keys
                                    // If not, use a combination or index (less ideal)
                                    <tr key={rank.userId || `rank-${index}`} className="text-center">
                                        <td>{getMedal(index)}</td>
                                        {/* Make sure 'userName' field exists in your API response */}
                                        <td>{rank.userName || 'N/A'}</td>
                                        <td>{rank.totalScore}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">Đang tải hoặc không có dữ liệu xếp hạng...</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {/* Add CSS for the season indicator */}
            <style>
                {`
                .season-indicator {
                    color: #fff; /* White text */
                    padding: 6px 14px;
                    border-radius: 15px; /* Rounded corners */
                    font-weight: bold;
                    font-size: 0.9em;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15); /* Subtle shadow */
                    text-align: center;
                    transition: background-color 0.5s ease-in-out; /* Smooth color transition */
                }

                .table-rank thead {
                    background-color: #f8f9fa; /* Light grey header */
                    font-weight: bold;
                }

                .table-rank td, .table-rank th {
                     vertical-align: middle; /* Center content vertically */
                }
                `}
            </style>
        </Container>
    );
};

export default Ranks;