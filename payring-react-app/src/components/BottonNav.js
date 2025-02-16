import React from "react";
import { useNavigate } from "react-router-dom";

import home from "../img/nav-home.png";
import newchat from "../img/nav-newchat.png";
import search from "../img/nav-search.png";
import mypage from "../img/nav-mypage.png";

const BottonNav = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅 사용

  return (
    <nav className="bottom-nav">
      <button className="nav-button" onClick={() => navigate("/main")}>
        <img src={home} alt="home icon" />
      </button>
      <button className="nav-button" onClick={() => navigate("/create-room")}>
        <img src={newchat} alt="newchat icon" />
      </button>
      <button className="nav-button" onClick={() => navigate("/payment-status")}>
        <img src={search} alt="search icon" />
      </button>
      <button className="nav-button" onClick={() => navigate("/mypage")}>
        <img src={mypage} alt="mypage icon" />
      </button>
    </nav>
  );
};

export default BottonNav;
