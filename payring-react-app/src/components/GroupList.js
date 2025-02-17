import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../img/Hourglass.png";
import cover1 from "../img/cover1.png";
import cover2 from "../img/cover2.png";
import cover3 from "../img/cover3.png";
import cover4 from "../img/cover4.png";

const covers = [cover1, cover2, cover3, cover4];

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeGroups, setActiveGroups] = useState({});
    const navigate = useNavigate();

    const getCookie = (name) => {
        const cookieString = document.cookie;
        const cookies = cookieString.split("; ").reduce((acc, cookie) => {
            const [key, value] = cookie.split("=");
            acc[key] = value;
            return acc;
        }, {});
        return cookies[name] || null;
    };


    const fetchRoomDetails = async (roomId) => {
        try {
            const token = getCookie("token");
            if (!token) {
                console.error("🚨 토큰 없음. 로그인 필요.");
                return;
            }
    
            console.log(`🔍 방 정보 요청 (roomId: ${roomId}) - 토큰:`, token);
    
            const response = await fetch(`https://storyteller-backend.site/api/rooms/${roomId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (response.status === 403) {
                throw new Error(`🚨 방 정보 요청 실패 (403): 접근 권한 없음`);
            }
    
            if (!response.ok) {
                throw new Error(`🚨 API 요청 실패: ${response.statusText}`);
            }
    
            const data = await response.json();
            return data.data || null;
        } catch (err) {
           /*  console.error(`🚨 방 정보 조회 실패 (roomId: ${roomId}):`, err.message); */
            return null;
        }
    };
    
    

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = getCookie("token");
                if (!token) {
                    throw new Error("로그인 정보가 필요합니다.");
                }
        
                console.log("🔍 현재 저장된 토큰:", token);
        
                const response = await fetch("https://storyteller-backend.site/api/rooms", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
        
                if (response.status === 403) {
                    throw new Error("🚨 권한이 없습니다. 로그인 상태를 확인하세요.");
                }
        
                if (!response.ok) {
                    throw new Error(`API 요청 실패: ${response.statusText}`);
                }
        
                const text = await response.text();
                if (!text) {
                    console.warn("⚠️ 방 목록 응답이 비어 있음");
                    return;
                }
        
                const data = JSON.parse(text);
                if (data.status !== 200) {
                    throw new Error("데이터를 불러오는 데 실패했습니다.");
                }
        
                const roomData = data.data;
                console.log("✅ 방 목록 조회 성공:", roomData);
        
                // ✅ 상세 정보 가져오기 (403 Forbidden 방 필터링)
                const detailedGroups = await Promise.all(
                    roomData.map(async (group) => {
                        const roomDetails = await fetchRoomDetails(group.roomId);
                        if (roomDetails) {
                            return { ...group, ...roomDetails };
                        } else {
                            /* console.warn(`⚠️ 접근 권한이 없는 방 제외 (roomId: ${group.roomId})`); */
                            return null;
                        }
                    })
                );
        
                const filteredGroups = detailedGroups.filter((group) => group !== null);
                setGroups(filteredGroups);
        
            } catch (err) {
                console.error("🚨 Error during fetch:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
    
        fetchGroups();
    }, []);
    
    const deleteRoom = async (roomId) => {
        const token = getCookie("token");
    
        if (!token) {
            alert("🚨 로그인 상태를 확인해주세요.");
            return;
        }
    
        try {
            console.log(`🗑️ 방 삭제 요청: ID ${roomId}`);
    
            // ✅ 방 상태 확인 (삭제 가능 여부 체크)
            const roomDetails = await fetchRoomDetails(roomId);
            if (!roomDetails) {
                alert("🚨 방 정보를 불러올 수 없습니다.");
                return;
            }
    
            // ✅ 콘솔에 정산 상태 출력
            console.log(`📌 방 ID: ${roomId}, 현재 정산 상태: ${roomDetails.roomStatus}`);
    
            // ✅ 삭제 가능 상태: NOT_STARTED(정산 시작 전), COLLECTING(정산 모금 중), COMPLETED(정산 완료)
            if (!["NOT_STARTED", "COLLECTING", "COMPLETED"].includes(roomDetails.roomStatus)) {
                alert("🚨 정산이 진행 중인 방은 삭제할 수 없습니다.");
                return;
            }
    
            const response = await fetch(`https://storyteller-backend.site/api/rooms/${roomId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (response.status === 403) {
                alert(`🚨 방 삭제 실패: 정산이 진행 중인 방은 삭제할 수 없습니다. (ID: ${roomId})`);
                return;
            }
    
            if (response.status === 204) {
                console.log(`✅ 방 삭제 성공 (No Content 응답)`);
                setGroups((prevGroups) => prevGroups.filter((group) => group.roomId !== roomId));
                alert(`✅ 방 삭제 성공: ${roomId}`);
            } else {
                const result = await response.json();
                if (result.status !== 200) {
                    throw new Error(result.message || "방 삭제 실패");
                }
                console.log(`✅ 방 삭제 성공: ${roomId}`);
                setGroups((prevGroups) => prevGroups.filter((group) => group.roomId !== roomId));
                alert(`✅ 방 삭제 성공: ${roomId}`);
            }
        } catch (error) {
            console.error(`❌ 방 삭제 실패 (ID: ${roomId}):`, error.message);
            alert(`❌ 방 삭제 실패: ${error.message}`);
        }
    };
    
    
    
    // ✅ 삭제 가능 여부를 먼저 체크한 후, deleteRoom 실행
    const toggleGroup = (roomId, roomStatus, event) => {
        event.preventDefault(); // ✅ 기본 동작 방지
        event.stopPropagation(); // ✅ 이벤트 전파 방지
    
        console.log(`🔍 삭제 버튼 클릭됨: ${roomId}, 상태: ${roomStatus}`);
    
        if (!["NOT_STARTED", "COMPLETED", "COLLECTING"].includes(roomStatus)) {
            alert("🚨 정산이 진행 중인 방은 삭제할 수 없습니다.");
            return;
        }
    
        deleteRoom(roomId); // ✅ 삭제 가능하면 deleteRoom 호출 (중복 체크 제거)
    };
    

    
        

    const handleGroupClick = async (roomId) => {
        const token = getCookie("token");
    
        if (!token) {
            alert("🚨 로그인 상태가 필요합니다.");
            return;
        }
    
        try {
            console.log(`🔍 방 상태 확인 요청: ID ${roomId}`);
    
            const response = await fetch(`https://storyteller-backend.site/api/rooms/${roomId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
    
            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.statusText}`);
            }
    
            const roomDetails = await response.json();
            console.log("🔍 방 상세 정보 응답:", roomDetails);
    
            if (!roomDetails.data) {
                throw new Error("방 정보를 가져올 수 없습니다.");
            }
    
            const roomStatus = roomDetails.data.roomStatus; // ✅ roomStatus 값 가져오기
            console.log(`✅ 방 ${roomId}의 상태: ${roomStatus}`);
    
            // ✅ roomStatus에 따라 이동할 페이지 결정
            if (roomStatus === "SETTLING") {
                console.log(`✅ 정산 진행 중인 방: ${roomId} → /start-settlement/${roomId}`);
                navigate(`/start-settlement/${roomId}`);
            } else {
                console.log(`✅ 정산 시작되지 않은 방: ${roomId} → /room-detail/${roomId}`);
                navigate(`/room-detail/${roomId}`);
            }
        } catch (err) {
            console.error("🚨 방 상세 정보 조회 실패:", err.message);
            alert("🚨 방 정보를 불러오는 데 실패했습니다.");
        }
    };
        

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>에러 발생: {error}</p>;

    return (
        <section className="grouplist">
            <h2>
                <img src={icon} alt="icon" /> 정산 할 모임 목록
            </h2>
            <div>
                {groups.length === 0 ? (
                    <p>참여 중인 방이 없습니다.</p>
                ) : (
                    groups.map((group, index) => (
                        <div
                            key={group.roomId}
                            className="group-item"
                            onClick={() => handleGroupClick(group.roomId)} // ✅ 클릭 이벤트 수정
                            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        >
                            <div className="group-info" style={{ display: "flex", alignItems: "center" }}>
                            <img
                                src={group.roomImage 
                                    ? `https://storyteller-backend.site/api/rooms/${group.roomImage}` 
                                    : covers[index % covers.length]
                                }
                                alt={`cover ${group.roomId}`}
                                style={{
                                    objectFit: "cover",
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "8px",
                                    marginRight: "15px",
                                }}
                            />

                                <div className="group-text">
                                    <p>{group.roomName} ({group.teamMembers.length}명)</p>
                                    <p>
                                        {group.teamMembers.length > 0
                                            ? group.teamMembers.map((member) => member.userName).join(", ")
                                            : "참여자 없음"}
                                    </p>
                                </div>
                            </div>

                            <button 
                                className="delete-button"
                                onClick={(e) => toggleGroup(group.roomId, group.roomStatus, e)}
                            >
                                삭제
                            </button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

export default GroupList;
