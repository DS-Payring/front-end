import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import "../../styles/styles.css";
import "../../styles/StartSettlement.css";
import clearImage from "../../img/clear.png";
import profile from "../../img/defaultImage.png";

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


    console.log("📌 useParams() roomId:", roomId);
    console.log("현재 URL:", window.location.pathname);

    useEffect(() => {
        if (!roomId || isNaN(roomId)) {
            console.error("🚨 유효하지 않은 roomId:", roomId);
            alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
            navigate("/");
            return;
        }

        const token = getCookie("accessToken");
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
                    user: member.name,
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
                setPendingMembers(response.data.data.map(member => ({
                    user: member.name,
                    profile: member.profileImage || profile, // 기본 이미지 대체
                    amount: member.amount,
                    pending: true, // 정산 중 여부 추가
                })));
            } catch (error) {
                console.error("Error fetching in-progress payments:", error);
            }
        };
        

        fetchUserName();
        fetchPaymentStatus();
        fetchFinishedPayments();
        fetchInProgressPayments();

    }, [roomId, navigate]);

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
                    <h4 className="page-title">{userName}의 남은 정산 금액</h4>
                    <div className="start-settlement-list">
                        {pendingPayments.length > 0 ? (
                            pendingPayments.map((record, index) => (
                                <div key={index} className="start-settlement-item">
                                    <div className="start-settlement-content">
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
                    
                    <h2 className="page-title">{userName}에게 아직 송금하지 않았어요</h2>
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
                                    <button className="start-reminder-button">독촉하기</button>
                                   
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
                                    <span className="user-name">{member.user}</span>
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
                            pendingMembers.map((member, index) => (
                                <div key={index} className="profile-container">
                                    <img src={member.profile} alt="프로필" className="profile-image" />
                                    <span className="user-name">{member.user}</span>
                                    <span className="amount">{(member.amount || 0).toLocaleString()}원</span> 
                                    {member.pending && <button className="reminder-button">독촉하기</button>}
                                </div>
                            ))
                        ) : (
                            <div className="empty-message-container">
                                <p className="empty-message">현재 정산 중인 팀원이 없습니다.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default StartSettlement;
