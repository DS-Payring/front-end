import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://storyteller-backend.site";

// ✅ 쿠키에서 토큰을 가져오는 함수
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

// ✅ CSS 스타일을 객체로 정의
const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        width: "320px",
        maxWidth: "90%",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "30px",
        fontSize: "14px",
        marginBottom: "10px",
        boxSizing: "border-box",
    },
    inviteButton: {
        width: "100%",
        padding: "12px",
        marginTop: "5px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        fontSize: "14px",
        backgroundColor: "#08313F",
        color: "white",
        transition: "background-color 0.3s ease-in-out",
    },
    closeButton: {
        width: "100%",
        padding: "12px",
        marginTop: "5px",
        border: "none",
        borderRadius: "30px",
        cursor: "pointer",
        fontSize: "14px",
        backgroundColor: "#efefef",
        color: "black",
        transition: "background-color 0.3s ease-in-out",
    },
};

// ✅ React의 이벤트 핸들링 방식으로 Hover 효과 적용
const hoverEffect = (element, isHover) => {
    if (isHover) {
        if (element === "invite") {
            return { backgroundColor: "#D5EDD2", color: "#08313F" };
        } else {
            return { backgroundColor: "#aaa" };
        }
    }
    return {};
};

function InviteModal({ roomId, onClose, onInvite }) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hovered, setHovered] = useState(null);

    const handleInvite = async () => {
        if (!email.trim()) {
            alert("초대할 이메일을 입력해주세요.");
            return;
        }
    
        setIsLoading(true);
    
        try {
            const token = getCookie("token"); // ✅ 쿠키에서 accessToken 가져오기
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }
    
            // ✅ 모든 사용자가 초대할 수 있도록 강제 실행 (권한 체크 제거)
            const response = await axios.post(
                `${API_BASE_URL}/api/rooms/invite`,
                { 
                    roomId: Number(roomId),  // ✅ roomId를 숫자로 변환하여 API 요청
                    email: email
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    withCredentials: true, // ✅ 쿠키 기반 인증 사용
                }
            );
    
            console.log("✅ 초대 요청 성공:", response.data);
            alert("초대가 성공적으로 전송되었습니다.");
    
            setEmail("");
            onInvite(); // 팀원 목록 갱신
            onClose();
        } catch (error) {
            console.error("🚨 초대 요청 실패:", error);
    
            if (error.response) {
                alert(`초대 요청 실패: ${error.response.status} 오류`);
            } else {
                alert("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>팀원 초대</h2>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="초대할 이메일 입력"
                    style={styles.input}
                />
                <button
                    onClick={handleInvite}
                    disabled={isLoading}
                    style={{
                        ...styles.inviteButton,
                        ...(hovered === "invite" ? hoverEffect("invite", true) : {}),
                    }}
                    onMouseEnter={() => setHovered("invite")}
                    onMouseLeave={() => setHovered(null)}
                >
                    {isLoading ? "초대 중..." : "초대 보내기"}
                </button>
                <button
                    onClick={onClose}
                    style={{
                        ...styles.closeButton,
                        ...(hovered === "close" ? hoverEffect("close", true) : {}),
                    }}
                    onMouseEnter={() => setHovered("close")}
                    onMouseLeave={() => setHovered(null)}
                >
                    닫기
                </button>
            </div>
        </div>
    );
}

export default InviteModal;
