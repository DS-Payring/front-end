import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // useParams를 임포트
import "../../styles/transfersend.css";
import "../../styles/styles.css";
import Header from "../../components/Header";

// 토큰을 쿠키에서 가져오는 함수 (예시)
const getToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
};

const TransferSend = () => {
  const { roomId } = useParams(); // useParams로 roomId를 가져옵니다.
  const [notSents, setNotSents] = useState([]); // 보내야 할 정산
  const [sents, setSents] = useState([]); // 내가 보낸 정산

  useEffect(() => {
    fetchTransfers();
  }, [roomId]); // roomId가 변경될 때마다 데이터를 다시 가져옵니다.

  // 송금 내역을 가져오는 함수
  const fetchTransfers = async () => {
    try {
      const token = getToken(); // 토큰 가져오기
      const response = await fetch(`/api/rooms/${roomId}/transfers/send`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();

      // notSents와 sents 배열을 상태에 저장
      if (data && data.data) {
        setNotSents(data.data.notSents);
        setSents(data.data.sents);
      } else {
        console.error("잘못된 데이터 형식입니다.");
      }
    } catch (error) {
      console.error("Error fetching transfer data", error);
    }
  };

  // 송금 독촉 보내는 함수
  const sendReminder = async (transferId) => {
    try {
      const token = getToken(); // 토큰 가져오기
      const response = await fetch(`/api/rooms/transfers/${transferId}/send-remind`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("송금 요청을 보냈습니다.");
      } else {
        throw new Error("송금 요청을 보내는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending reminder", error);
      alert("송금 요청을 보내는 데 실패했습니다.");
    }
  };

  return (
    <div className="mobile-container">
      <div className="header-wrapper">
        <Header />
      </div>
      <div className="transfer-status-container">
        <h2>{`방 이름`}</h2>

        {/* 보내야 할 정산 */}
        {notSents.length > 0 ? (
          <>
            <h3>아직 정산을 보내지 않았어요!</h3>
            {notSents.map((transfer) => (
              <div key={transfer.transferId} className="pending-transfer">
                <span>{transfer.receiverName}</span>
                <span>{transfer.amount.toLocaleString()}원</span>
                <button onClick={() => sendReminder(transfer.transferId)}>정산 보내기</button>
              </div>
            ))}
          </>
        ) : (
          <h3>모든 정산을 이미 보내셨어요!</h3>
        )}

        {/* 내가 보낸 정산 */}
        {sents.length > 0 ? (
          <>
            <h3>정산 완료한 내역</h3>
            {sents.map((transfer) => (
              <div key={transfer.transferId} className="sent-transfer">
                <div className="profile-section">
                  <img
                    src={transfer.receiverImage}
                    alt={transfer.receiverName}
                    className="profile-image"
                  />
                  <span>{transfer.receiverName}</span>
                </div>
                <div className="transfer-message">
                  <p>{transfer.receiverName}님에게</p>
                  <p>{transfer.amount.toLocaleString()}원을 송금했어요</p>
                  {transfer.transferImage && (
                    <img src={transfer.transferImage} alt="송금 이미지" className="transfer-image" />
                  )}
                </div>
              </div>
            ))}
          </>
        ) : (
          <h3>아직 송금한 내역이 없습니다.</h3>
        )}
      </div>
    </div>
  );
};

export default TransferSend;