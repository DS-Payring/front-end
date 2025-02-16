import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import Header from "../../components/Header";
import "../../styles/CreateRoom.css";
import "../../styles/styles.css";
import addimg from "../../img/addimg.png";

const API_BASE_URL = "https://storyteller-backend.site";

// ✅ 쿠키에서 token 값 가져오기
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

const getToken = () => {
    return getCookie("token");  
};

function CreateRoom() {
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState("");
    const [teamEmails, setTeamEmails] = useState([]); // 🔹 초대할 이메일 리스트
    const [email, setEmail] = useState("");
    const [roomImage, setRoomImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [roomId, setRoomId] = useState(null);

    // 🔹 파일 선택 시 미리보기 설정 및 파일 저장
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setRoomImage(URL.createObjectURL(file));
        }
    };

    // 🔹 이메일을 리스트(해시태그)로 추가하는 함수
    const addEmailToList = () => {
        if (!email.trim()) {
            alert("이메일을 입력하세요.");
            return;
        }

        if (teamEmails.includes(email)) {
            alert("이미 추가된 이메일입니다.");
            return;
        }

        setTeamEmails([...teamEmails, email]); // 🔹 이메일 리스트에 추가
        setEmail("");
    };

    // 🔹 이메일 리스트에서 제거하는 함수
    const removeEmail = (emailToRemove) => {
        setTeamEmails(teamEmails.filter((email) => email !== emailToRemove));
    };

    // ✅ 팀원 초대 API 연동
    const inviteTeamMembers = async (newRoomId) => {
        const token = getToken();

        if (!token) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (!newRoomId) {
            console.error("🚨 초대 오류: roomId가 없습니다.");
            return;
        }

        try {
            // ✅ 모든 팀원 이메일을 한 번에 초대
            await Promise.all(
                teamEmails.map(async (inviteEmail) => {
                    const response = await fetch(`${API_BASE_URL}/api/rooms/invite`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            roomId: Number(newRoomId),
                            email: inviteEmail,
                        }),
                    });

                    if (!response.ok) {
                        console.error(`❌ 초대 실패: ${inviteEmail}, 상태코드 ${response.status}`);
                    }
                })
            );

            console.log("✅ 모든 팀원 초대 완료");
        } catch (error) {
            console.error("🚨 팀원 초대 오류:", error);
        }
    };

    // ✅ 방 생성 API 호출 후 초대 API 호출
    const createRoom = async () => {
        if (!roomName.trim()) {
            alert("방 이름을 입력하세요.");
            return;
        }

        const token = getToken();
        if (!token) {
            alert("로그인이 필요합니다.");
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/rooms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ roomName, roomImage: imageFile ? imageFile.name : "" }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("❌ 방 생성 실패:", data);
                alert(`방 생성 실패: ${data.message || "알 수 없는 오류"}`);
                return;
            }

            console.log("✅ 방 생성 성공:", data);
            const newRoomId = data.data.roomId;
            setRoomId(newRoomId);

            // ✅ 방 생성 후 팀원 초대 API 호출
            if (teamEmails.length > 0) {
                await inviteTeamMembers(newRoomId);
            }

            alert("방이 성공적으로 생성되었습니다!");
            navigate(`/room-detail/${newRoomId}`, { state: { teamEmails } });

        } catch (error) {
            console.error("❌ 방 생성 오류:", error);
            alert("방 생성에 실패했습니다.");
        }
    };

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="content-wrapper">
                <div className="container">
                    <h2 className="section-title">방 이름</h2>
                    <input
                        className="input-field"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="방 이름을 입력하세요"
                    />

                    {/* 🔹 이미지 등록 UI */}
                    <h2 className="section-title">방 이미지 등록</h2>
                    <div className="file-upload" onClick={() => document.getElementById("fileInput").click()}>
                        {roomImage ? <img src={roomImage} alt="Room Preview" /> : <img src={addimg} alt="Default" />}
                        <input type="file" accept="image/*" id="fileInput" hidden onChange={handleFileChange} />
                    </div>

                    <h2 className="section-title">팀원 추가</h2>
                    <div className="email-container">
                        <input
                            className="input-field email-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                        />
                        <Search className="search-icon" size={20} onClick={addEmailToList} />
                    </div>

                    {/* 🔹 추가된 이메일 리스트 */}
                    <div className="email-list">
                        {teamEmails.map((email, index) => (
                            <div key={index} className="email-item">
                                {email}
                                <X className="delete-icon" size={20} onClick={() => removeEmail(email)} />
                            </div>
                        ))}
                    </div>

                    <button className="primary-button" onClick={createRoom}>방 생성하기</button>
                </div>
            </div>
        </div>
    );
}

export default CreateRoom;
