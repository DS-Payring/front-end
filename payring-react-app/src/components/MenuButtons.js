import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/mainpage.css";

import btn1 from "../img/btn-newchat.png";
import btn2 from "../img/btn-search.png";
import btn3 from "../img/btn-mypage.png";

const MenuButtons = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  return (
    <div className="main-move-menu">
      <div className="title">다른 메뉴로 이동하기</div>
      <div className="main-menu-container">
        
        <button 
          className="main-menu-button" 
          onClick={() => navigate("/create-room")} // 페이지 이동
        >
          <img src={btn1} alt="새로운 정산방" />
          <span>새로운 정산방 만들기</span>
        </button>

        <button 
          className="main-menu-button" 
          onClick={() => navigate("/payment-status")} // 페이지 이동
        >
          <img src={btn2} alt="기간별 정산" />
          <span>기간별 정산<br />현황 조회하기</span>
        </button>

        <button 
          className="main-menu-button" 
          onClick={() => navigate("/mypage")} // 페이지 이동
        >
          <img src={btn3} alt="마이페이지" />
          <span>마이 페이지로 이동하기</span>
        </button>

      </div>
    </div>
  );
};

export default MenuButtons;
