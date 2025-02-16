import axios from "axios";

const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const fetchUserData = async () => {
    const token = getCookie("token");
    if (!token) {
        console.error("❌ 토큰 없음. 로그인 필요.");
        return;
    }

    try {
        const response = await axios.get("https://storyteller-backend.site/api/user/me", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        console.log("✅ 사용자 데이터:", response.data);
    } catch (error) {
        console.error("❌ 사용자 데이터 요청 실패:", error);
    }
};

// 실행
fetchUserData();
