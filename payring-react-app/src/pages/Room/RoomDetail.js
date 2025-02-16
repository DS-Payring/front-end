import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import axios from "axios";
import Header from "../../components/Header";
import InviteModal from "../../components/InviteModal"; // ✅ 팀원 초대 모달
import DeleteConfirmModal from "../../components/DeleteConfirmModal"; // ✅ 삭제 확인 모달
import "../../styles/RoomDetail.css";
import "../../styles/Modal.css";
import defaultImage from "../../img/defaultImage.png";
import invite from "../../img/invite.png";

const API_BASE_URL = "https://storyteller-backend.site";

// ✅ 쿠키에서 특정 쿠키 값을 가져오는 함수
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

console.log("🔎 현재 토큰 값:", getCookie("token"));

function RoomDetail() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    useEffect(() => {
        const token = getCookie("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [navigate]);

    // ✅ 팀원 목록 가져오기
    const fetchTeamMembers = async () => {
        if (!roomId) return;

        try {
            const token = getCookie("token");
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ 팀원 목록 조회 성공:", response.data);
            setTeamMembers(response.data.data || []);
        } catch (error) {
            console.error("🚨 팀원 목록 조회 실패:", error);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, [roomId]);

    // ✅ 방 이름 가져오기
    useEffect(() => {
        if (!roomId) return;

        const fetchRoomName = async () => {
            try {
                const token = getCookie("token");
                if (!token) return;

                const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setRoomName(response.data.data.roomName || "정산방");
            } catch (error) {
                console.error("🚨 방 정보 조회 실패:", error);
            }
        };

        fetchRoomName();
    }, [roomId]);

    // ✅ 정산 요청 금액 조회
    const fetchPayments = async () => {
        if (!roomId || isFetching) return;
        setIsFetching(true);

        try {
            const token = getCookie("token");
            if (!token) return;

            const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/payments`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ 정산 요청 내역 응답:", response.data);
            setTotalAmount(response.data.data.totalAmount || 0);
            setPayments(Array.isArray(response.data.data.payments) ? response.data.data.payments : []);
        } catch (error) {
            console.error("🚨 정산 요청 내역 조회 실패:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (teamMembers.length > 0) {
            fetchPayments();
        }
    }, [teamMembers]);

    // ✅ userId 기반으로 userName 찾기
    const getUserName = (userId) => {
        if (!teamMembers.length) return "알 수 없음";
        const member = teamMembers.find(member => member.userId === userId || member.teamMemberId === userId);
        return member ? member.userName : "알 수 없음";
    };

    // ✅ 정산 요청 삭제 모달 열기
    const openDeleteModal = (paymentId) => {
        setDeleteTargetId(paymentId);
        setIsModalOpen(true);
    };

    // ✅ 정산 요청 삭제 기능
    const handleConfirmDelete = async () => {
        if (!deleteTargetId) return;

        try {
            const token = getCookie("token");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            console.log(`🚀 DELETE 요청: ${API_BASE_URL}/api/rooms/payments/${deleteTargetId}`);

            await axios.delete(`${API_BASE_URL}/api/rooms/payments/${deleteTargetId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ 정산 요청 삭제 성공");
            fetchPayments();
        } catch (error) {
            console.error("❌ 정산 요청 삭제 실패:", error);
            alert("정산 요청 삭제에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setIsModalOpen(false);
            setDeleteTargetId(null);
        }
    };

    const startSettlement = async () => {
        if (!roomId) {
            alert("정산방 정보가 없습니다. 다시 시도해 주세요.");
            return;
        }

        try {
            const token = getCookie("token");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await axios.post(`${API_BASE_URL}/api/rooms/${roomId}/payments/start`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("✅ 정산 시작 성공:", response.data);
            navigate(`/start-settlement/${roomId}`); // ✅ state 제거
        } catch (error) {
            console.error("🚨 정산 시작 요청 실패:", error);
            alert("정산 시작 요청에 실패했습니다.");
        }
    };

    const handleInviteSuccess = () => {
        console.log("✅ 초대 성공 후 팀원 목록 갱신");
        fetchTeamMembers(); // 팀원 목록 다시 불러오기
    };

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="content-wrapper">
                <div className="container">
                    <div className="room-header">
                        <h1 className="room-title">{roomName}의 정산방</h1>
                        <button
                            className="settlement-button"
                            onClick={startSettlement} // ✅ 기존 navigate에서 startSettlement로 변경
                        >
                            정산하기
                        </button>
                    </div>

                    <h3 className="team-title">{roomName}’s 팀원</h3>
                    <div className="team-list">
                        {teamMembers.map((member) => (
                            <div key={member.teamMemberId} className="team-member">
                                <img src={member.profileImage || defaultImage} alt="팀원 이미지" />
                                <p>{member.userName} ({member.email})</p>
                            </div>
                        ))}
                        <div className="team-member add-member">
                            <button className="add-member-button" onClick={() => setIsInviteModalOpen(true)}>
                                <img src={invite} alt="팀원 초대 버튼"></img>
                                <p>팀원 초대</p>
                            </button>
                        </div>
                    </div>

                    <h4 className="small-title">{roomName}’s 정산 요청 금액</h4>
                    <p className="total-amount">
                        총 <strong>{totalAmount.toLocaleString()}원</strong>
                    </p>

                    <div className="settlement-list">
                        {payments.map((item) => (
                            <div key={item.id} className="settlement-item">
                                <p className="settlement-user"><strong>{getUserName(item.userId)}</strong></p>
                                <div className="settlement-info">
                                    <p className="settlement-amount">{item.amount.toLocaleString()}원 요청</p>
                                    <p className="settlement-title">{item.title}</p>
                                </div>
                                <div className="settlement-actions">
                                    {item.isWriter && (
                                        <X className="delete-icon" onClick={() => openDeleteModal(item.id)} />
                                    )}
                                    <button className="detail-button" onClick={() => {console.log("🛠️ 이동할 URL:", `/money-record-detail/${item.id}`); navigate(`/money-record-detail/${item.id}`)}}>
                                        상세 보기
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="add-settlement-button" onClick={() => navigate(`/money-record/${roomId}`)}>
                        정산 추가하기
                    </button>

                    {/* ✅ 삭제 확인 모달 */}
                    <DeleteConfirmModal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        onConfirm={handleConfirmDelete} 
                    />
                    
                    {/* ✅ 팀원 초대 모달 */}
                    {isInviteModalOpen && (
                        <InviteModal 
                            onClose={() => setIsInviteModalOpen(false)} 
                            onSuccess={handleInviteSuccess} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default RoomDetail;