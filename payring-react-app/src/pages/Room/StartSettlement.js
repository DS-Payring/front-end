import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import "../../styles/styles.css";
import "../../styles/StartSettlement.css";
import clearImage from "../../img/clear.png";
import profile from "../../img/defaultImage.png";
import ReminderModal from "../../components/ReminderModal";
import BottonNav from "../../components/BottonNav";


// ✅ 쿠키에서 특정 값을 가져오는 함수
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

function StartSettlement() {
    const navigate = useNavigate();
    const { roomId } = useParams();
    
    const [userName, setUserName] = useState("");
    const [moneyRecords, setMoneyRecords] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completedMembers, setCompletedMembers] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [teamMembers, setTeamMembers] = useState([]); // ✅ 정산방 팀원 목록 상태

    const getUserName = (userId) => {
        if (!teamMembers.length) return "알 수 없음";
        const member = teamMembers.find(member => member.userId === userId || member.teamMemberId === userId);
        return member ? member.userName : "알 수 없음";
    };
    
    const [selectedReminder, setSelectedReminder] = useState(null); // 🔹 선택된 멤버 저장 (모달용)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleReminderClick = (member) => {
        if (member.receiverInfos.length > 0) {
            setSelectedReminder(member);
            setIsModalOpen(true);
        } else {
            alert("독촉할 대상이 없습니다.");
        }
    };

    useEffect(() => {
        const fetchInProgressPayments = async () => {
            try {
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/payments/in-progress`);
                setPendingMembers(response.data.data.map(member => ({
                    userId: member.userId,
                    userName: member.userName,
                    profile: member.profileImage || "default-profile.png",
                    totalAmount: member.totalLeftAmount,
                    receiverInfos: member.receiverInfos || [],
                })));
            } catch (error) {
                console.error("🚨 Error fetching in-progress payments:", error);
            }
        };

        fetchInProgressPayments();
    }, []);

    console.log("📌 useParams() roomId:", roomId);
    console.log("현재 URL:", window.location.pathname);

    useEffect(() => {
        if (!roomId || isNaN(roomId)) {
            console.error("🚨 유효하지 않은 roomId:", roomId);
            alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
            navigate("/");
            return;
        }

        const token = getCookie("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/login");
            return;
        }

        const fetchUserName = async () => {
            try {
                const response = await axios.get(`https://storyteller-backend.site/api/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("📌 사용자 정보 응답:", response.data);
                setUserName(response.data.data?.userName || "알 수 없음");
            } catch (error) {
                console.error("Error fetching user info:", error);
                if (error.response) console.error("📌 서버 응답:", error.response.data);
            }
        };

        const fetchPaymentStatus = async () => {
            try {
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/payments/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const { notReceived, notSent } = response.data.data;
                setPendingPayments(notSent.map(item => ({ user: item.receiver, amount: item.amount })));
                setMoneyRecords(notReceived.map(item => ({ user: item.sender, amount: item.amount })));
            } catch (error) {
                console.error("Error fetching payment status:", error);
                if (error.response) console.error("📌 서버 응답:", error.response.data);
            } finally {
                setLoading(false);
            }
        };
        const fetchFinishedPayments = async () => {
            try {
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/payments/finish`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCompletedMembers(response.data.data.map(member => ({
                    user: member.userName,
                    profile: member.profileImage || profile, // 기본 이미지 대체
                })));
            } catch (error) {
                console.error("Error fetching finished payments:", error);
            }
        };

        
        const fetchInProgressPayments = async () => {
            try {
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/payments/in-progress`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                console.log("📌 정산 진행 중 데이터:", response.data);
        
                // API 응답을 UI에 맞게 변환
                const formattedPendingMembers = response.data.data.map(member => ({
                    userId: member.userId,
                    userName: member.userName,
                    profile: member.profileImage || profile,  // 기본 이미지 설정
                    totalAmount: member.totalLeftAmount,  // 총 미정산 금액
                    receiverInfos: member.receiverInfos || []  // 송금해야 하는 리스트
                }));
        
                setPendingMembers(formattedPendingMembers);
            } catch (error) {
                console.error("🚨 Error fetching in-progress payments:", error);
            }
        };
        
        
        const fetchPayments = async () => {
            try {
                console.log(`🚀 GET 요청: /api/rooms/${roomId}/payments`);
        
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/payments`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                console.log("📌 정산 요청 응답 데이터:", response.data); // ✅ 응답 데이터 확인
        
                if (response.data && response.data.data) {
                    setTotalAmount(response.data.data.totalAmount || 0); // ✅ 총 정산 금액 설정
                    setPayments(response.data.data.payments || []); // ✅ payments 리스트 저장
                } else {
                    console.warn("⚠️ 정산 요청 응답에 'data' 필드가 없음:", response.data);
                    setPayments([]); // 데이터가 없을 경우 빈 배열 설정
                    setTotalAmount(0);
                }
            } catch (error) {
                console.error("🚨 정산 요청 목록 조회 실패:", error);
                if (error.response) {
                    console.error("📌 서버 응답:", error.response.data);
                }
            }
        };
        
        fetchUserName();
        fetchPaymentStatus();
        fetchFinishedPayments();
        fetchInProgressPayments();
        fetchPayments(); 
 

    }, [roomId, navigate]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const token = getCookie("token");
                if (!token) return;
    
                const response = await axios.get(`https://storyteller-backend.site/api/rooms/${roomId}/members`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                console.log("📌 팀 멤버 목록 응답 데이터:", response.data);
                setTeamMembers(response.data.data || []); // ✅ 팀 멤버 목록 상태 업데이트
            } catch (error) {
                console.error("🚨 팀 멤버 조회 실패:", error);
            }
        };
    
        fetchTeamMembers();
    }, [roomId]); // ✅ roomId 변경 시 실행
    
    

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="content-wrapper">
                <div className="container">
                    <h4 className="page-title">{userName}<span>님의 남은 정산 금액</span></h4>
                    <div className="start-settlement-list">
                        {pendingPayments.length > 0 ? (
                            pendingPayments.map((record, index) => (
                                <div key={index} className="start-settlement-item">
                                    <div className="ss-settlement-content">
                                        <span className="settlemnet-user-name">{record.user}</span>
                                        <span className="list-amount">{record.amount.toLocaleString()}원</span>
                                    </div>
                                    <button className="start-settlement-button">정산 보내기</button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message-container">
                                <p className="empty-message">모든 정산을 완료했어요.</p>
                                <img src={clearImage} alt="정산 완료" className="empty-message-image" />
                                <p className="empty-message">정산 할 금액이 없습니다.</p>
                            </div>
                        )}
                    </div>
                    <span className="text-button">전체 송금 내역 확인하기</span>

                    <h2 className="page-title">{userName}<span>님에게 아직 송금하지 않았어요</span></h2>
                    <p className="total-amount">
                        총 <span className="highlight-amount">{moneyRecords.reduce((sum, rec) => sum + rec.amount, 0).toLocaleString()}원</span>
                    </p>

                    <div className="start-settlement-list">
                        {moneyRecords.length > 0 ? (
                            moneyRecords.map((record, index) => (
                                <div key={index} className="start-settlement-item">
                                    <div className="start-settlement-content">
                                        <span className="settlement-user-name">{record.user}</span>
                                        <span className="list-amount">{record.amount.toLocaleString()}원</span>
                                    </div>
                                    <button className="start-reminder-button">
                                        독촉하기
                                    </button>
                                               
                                </div>
                            ))
                        ) :  (
                            <div className="empty-message-container">
                                <p className="empty-message">모든 팀원이 나에게 정산을 완료했어요.</p>
                                <img src={clearImage} alt="정산 완료" className="empty-message-image" />
                                <p className="empty-message">송금받지 못한 금액이 없습니다.</p>
                            </div>
                        )}
                    </div>
                    <span className="text-button">전체 송금 현황 확인하기</span>
                    {/* 🔹 정산 완료한 팀원 */}
                    <h4 className="team-list-title">정산 완료한 팀원</h4>
                    <div className="completed-members">
                        {completedMembers.length > 0 ? (
                            completedMembers.map((member, index) => (
                                <div key={index} className="profile-container">
                                    <img src={member.profile} alt="프로필" className="profile-image" />
                                    <span className="settlement-user-name">{member.user}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message-container">
                                <p className="empty-message">아직 정산을 완료한 팀원이 없습니다.</p>
                            </div>
                        )}
                    </div>

                    {/* 🔹 정산 중인 팀원 */}
                    <h2 className="team-list-title">정산 중인 팀원</h2>
                    <div className="pending-members">
                    {pendingMembers.length > 0 ? (
                        pendingMembers.map((member) => (
                            <div key={member.userId} className="profile-container">
                                {/* ✅ 프로필 클릭 시 alert 표시 */}
                                <img 
                                    src={member.profile} 
                                    alt="프로필" 
                                    className="profile-image"
                                    onClick={() => {
                                        if (member.receiverInfos.length > 0) {
                                            const message = member.receiverInfos
                                                .map(receiver => `${receiver.receiverName} → ${receiver.amount.toLocaleString()}원`)
                                                .join("\n");
                                            alert(`📌 ${member.userName}님의 정산 정보:\n\n${message}`);
                                        } else {
                                            alert(`${member.userName}님은 송금해야 할 내역이 없습니다.`);
                                        }
                                    }}
                                    style={{ cursor: "pointer" }}
                                />

                                {/* ✅ 유저 이름 */}
                                <span className="settlement-user-name">{member.userName}</span>

                                {/* ✅ 총 미정산 금액 표시 */}
                                <span className="amount">{(member.totalAmount || 0).toLocaleString()}원</span> 

                                {/* ✅ 독촉하기 버튼 (모달 열기) */}
                                {member.receiverInfos.some(receiver => receiver.isSenderForMe) && (
                                    <button className="reminder-button" onClick={() => handleReminderClick(member)}>
                                        독촉하기
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-message-container">
                            <p className="empty-message">현재 정산 중인 팀원이 없습니다.</p>
                        </div>
                    )}

                    {/* ✅ 모달 추가 */}
                    {isModalOpen && <ReminderModal member={selectedReminder} roomId={roomId} onClose={() => setIsModalOpen(false)} />}
                </div>

                    {/* 🔹 정산 요청 내역 */}
                    <h4 className="team-list-title">정산 요청 내역</h4>
                    
                    {/* 🔹 총 정산 요청 금액 표시 */}
                    <h2 className="total-amount">
                        총 <span className="highlight-amount">{totalAmount.toLocaleString()}원</span>
                    </h2>

                    <div className="ss-settlement-list">
                        {payments.length > 0 ? (
                            payments.map((item) => (
                                <div key={item.id} className="settlement-item">
                                    <p className="settlement-user"><strong>{getUserName(item.userId)}</strong> {/* ✅ 등록한 유저의 이름 출력 */}
                                    </p>
                                    <div className="settlement-info">
                                        <p className="settlement-amount">{item.amount.toLocaleString()}원 요청</p>
                                        <p className="settlement-title">{item.title || "제목 없음"}</p> {/* ✅ title 필드 추가 */}
                                    </div>
                                    <div className="settlement-actions">

                                    <button className="detail-button" onClick={() => {console.log("🛠️ 이동할 URL:", `/money-record-detail/${item.id}`); navigate(`/money-record-detail/${item.id}`)}}>
                                        상세 보기
                                    </button>     
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-message-container">
                                <p className="empty-message">현재 등록된 정산 요청이 없습니다.</p>
                            </div>
                        )}
                    </div>
                </div>
                <BottonNav />
            </div>
        </div>
    );
}

export default StartSettlement;
