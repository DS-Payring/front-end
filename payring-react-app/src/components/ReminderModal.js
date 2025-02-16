import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ReminderModal.css"; // 스타일 파일 분리

const ReminderModal = ({ member, roomId, onClose }) => {  // ✅ roomId 추가
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // 🔍 member 데이터 콘솔 출력 (디버깅)
    useEffect(() => {
        console.log("member 데이터 확인:", member);
    }, [member]);

    // ✅ roomId를 기반으로 transferId 조회
    const fetchTransferIdByRoom = async (roomId, member) => {
        try {
            const response = await axios.get(
                `https://storyteller-backend.site/api/rooms/${roomId}/transfers/receive`
            );

            if (response.data.status === 200) {
                const transfers = response.data.data.notReceived; // 아직 받지 않은 송금 목록
                const matchedTransfer = transfers.find(t => t.sender === member.userName);

                if (matchedTransfer) {
                    return matchedTransfer.transferId;
                }
            }

            return null;
        } catch (error) {
            console.error("🚨 Transfer ID 가져오기 실패:", error);
            return null;
        }
    };

    // ✅ 독촉 요청 함수 (중복 제거 후 통합)
    const onSendReminder = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!member || !roomId) {
            setError("⚠️ 유효한 멤버 정보 또는 방 정보가 없습니다.");
            setLoading(false);
            return;
        }

        let transferId = member.transferId;

        // ✅ transferId가 없다면, roomId를 이용해 추가 조회
        if (!transferId) {
            transferId = await fetchTransferIdByRoom(roomId, member);
        }

        if (!transferId) {
            setError("⚠️ 유효한 송금 정보가 없습니다.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `https://storyteller-backend.site/api/rooms/transfers/${transferId}/send-remind`
            );

            if (response.data.status === 200) {
                setSuccessMessage("📩 독촉 메일이 성공적으로 전송되었습니다.");
            } else {
                throw new Error(response.data.message || "알 수 없는 오류 발생");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return !member ? null : (
        <div className="modal-overlay">
            <div className="modal-content">
            📢 {member.userName}님에게 독촉하기 메일을 성공적으로 보냈습니다.
            <button className="close-button" onClick={onClose}>
                    닫기
            </button>

{/*                 <h3>📢 {member.userName}님에게 독촉하기</h3>


                {successMessage && <p className="success-message">{successMessage}</p>}


                <button 
                    className="remind-button" 
                    onClick={onSendReminder} 
                    disabled={loading}
                >
                    {loading ? "전송 중..." : "독촉 메일 보내기"}
                </button>


                <button className="close-button" onClick={onClose}>
                    닫기
                </button>

                {error && <p className="error-message">⚠️ {error}</p>} */}
            </div>
        </div>
    );
};

export default ReminderModal;
