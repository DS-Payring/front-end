import React, { useEffect, useState } from "react";
import axios from "axios";
import icon from "../img/Magnifying.png";

// ✅ 쿠키에서 token 가져오는 함수
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

const TotalPending = () => {
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchTotalPendingAmount = async () => {
      try {
        const token = getCookie("token"); // ✅ 쿠키에서 token 가져오기
        if (!token) {
          console.error("❌ 로그인 필요: token 없음");
          return;
        }

        // ✅ Axios 기본 설정 (Authorization 헤더 추가)
        const axiosInstance = axios.create({
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, // 쿠키 포함 요청
        });

        // 1. 모든 방의 목록 가져오기
        const roomsResponse = await axiosInstance.get("https://storyteller-backend.site/api/rooms");
        if (roomsResponse.data.status !== 200) throw new Error("방 목록 조회 실패");

        const roomIds = roomsResponse.data.data.map((room) => room.roomId);

        // 2. 각 방의 미정산 금액 조회 요청 병렬 처리
        const requests = roomIds.map((roomId) =>
          axiosInstance.get(`https://storyteller-backend.site/api/rooms/${roomId}/transfers/send`)
        );

        const responses = await Promise.all(requests);

        // 3. 모든 방에서 `notSents`의 `amount` 합산
        const total = responses.reduce((sum, response) => {
          if (response.data.status === 200) {
            const notSents = response.data.data.notSents;
            return sum + notSents.reduce((acc, item) => acc + item.amount, 0);
          }
          return sum;
        }, 0);

        setTotalAmount(total);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchTotalPendingAmount();
  }, []);

  return (
    <section className="unsettlement">
      <h2>
        <img src={icon} alt="icon" /> 미정산 금액 한눈에 보기
      </h2>
      <div className="unsettled-box">
        <p>정산 완료까지 <strong>{totalAmount.toLocaleString()}원</strong> 남음</p>
      </div>
    </section>
  );  
};

export default TotalPending;
