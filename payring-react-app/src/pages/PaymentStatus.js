/*PaymentStatus.js*/
import React, { useState, useEffect } from "react";
import "../styles/paymentstatus.css";
import "../styles/styles.css";
import Header from "../components/Header";
import cover1 from "../img/cover1.png";
import cover2 from "../img/cover2.png";
import cover3 from "../img/cover3.png";
import cover4 from "../img/cover4.png";

const PaymentStatus = () => {
  const [period, setPeriod] = useState(1);
  const [payments, setPayments] = useState([]);
  const [totalSettledAmount, setTotalSettledAmount] = useState(0);
  const [unSettledAmount, setUnSettledAmount] = useState(0);

  // 쿠키에서 토큰 가져오기
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  useEffect(() => {
    fetchPayments();
  }, [period]);

  // 정산 상태 조회 API 호출
  const fetchPayments = async () => {
    const token = getCookie("token");
    try {
      const response = await fetch(`/api/rooms/status?period=${period}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();

      if (data && data.data) {
        setTotalSettledAmount(data.data.totalSettledAmount);
        setUnSettledAmount(data.data.unSettledAmount);
        setPayments(data.data.roomInfos);
      } else {
        console.error("응답 데이터가 예상과 다릅니다.", data);
      }
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error);
    }
  };

  // 랜덤으로 cover 이미지 선택
  const getRandomCoverImage = () => {
    const covers = [cover1, cover2, cover3, cover4];
    const randomIndex = Math.floor(Math.random() * covers.length);
    return covers[randomIndex];
  };

  return (
    <div className="mobile-container">
      <div className="header-wrapper">
        <Header />
      </div>
      <div className="payment-status-page">
        <div className="content-wrapper">
          <div className="amount-container">
            <div className="settled-container">
              <p>정산 금액</p>
              <p>
                <strong className="money">
                  {totalSettledAmount.toLocaleString()} 원
                </strong>
              </p>
            </div>
            <div className="unsettled-container">
              <p>미정산 금액</p>
              <div className="unsettled-bottom">
                <p>
                  <strong className="money">
                    {unSettledAmount.toLocaleString()} 원
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <hr className="line" />
        <div className="content-wrapper">
          <div className="filter-container">
            <select
              className="drop-down"
              name="dropdown"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={1}>1주일</option>
              <option value={4}>1개월</option>
              <option value={12}>3개월</option>
              <option value={0}>전체</option>
            </select>
          </div>
          <ul className="room-list">
            {payments.map((room) => (
              <li key={room.roomId} className="room-item">
                {/* 랜덤으로 선택된 이미지 */}
                <img
                  src={room.roomImage || getRandomCoverImage()}
                  alt={room.roomName}
                  className="room-image"
                />
                {/* 정산이 완료되지 않은 경우 notification-dot 표시 */}
                {room.roomStatus !== "SETTLED" && <div className="notification-dot"></div>}
                <div className="payment-info">
                  <span className="room-name">{room.roomName}</span>
                  <span className="total-amount">
                    총 {room.totalAmount.toLocaleString()} 원
                  </span>
                </div>
                {room.roomStatus === "SETTLED" ? (
                  <span className="status-check">✔</span>
                ) : (
                  <span className="status-x">❌</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;