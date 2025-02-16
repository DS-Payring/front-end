import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import '../../styles/styles.css';
import '../../styles/MoneyRecord.css';

const API_BASE_URL = "https://storyteller-backend.site";

// ✅ 쿠키에서 특정 쿠키 값을 가져오는 함수
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

function MoneyRecord() {
    const navigate = useNavigate();
    const { id: roomId } = useParams();

    useEffect(() => {
        console.log("🔍 useParams()에서 가져온 roomId:", roomId);
        if (!roomId) {
            alert("잘못된 접근입니다.");
            navigate("/"); // ✅ roomId가 없으면 홈으로 이동
        }
    }, [roomId]);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [memo, setMemo] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ✅ 이미지 업로드 핸들러
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ✅ 정산 등록 API 호출 (req JSON + 이미지 모두 FormData로 전송)
    const submitRecord = async () => {
        const token = getCookie("token");
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/");
            return;
        }

        const parsedRoomId = roomId && !isNaN(roomId) ? parseInt(roomId, 10) : null;
        if (!parsedRoomId) {
            alert("잘못된 방 ID입니다.");
            return;
        }

        const formData = new FormData();
        const reqData = {
            roomId: parsedRoomId,
            amount: parseInt(amount, 10),
            title,
            memo,
        };

        formData.append("req", new Blob([JSON.stringify(reqData)], { type: "application/json" }));

        if (image) {
            formData.append("image", image);
        }

        try {
            console.log("🚀 API 요청 시작:", `${API_BASE_URL}/api/rooms/payments`);
            console.log("🔍 요청 데이터:", reqData);
            console.log("🔍 쿠키에서 가져온 token:", token);

            const response = await axios.post(
                `${API_BASE_URL}/api/rooms/payments`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            alert("정산이 등록되었습니다!");
            console.log("✅ 정산 등록 성공:", response.data);
            navigate(`/room-detail/${roomId}`);

        } catch (error) {
            console.error("❌ 정산 등록 실패:", error);

            if (error.response) {
                alert(`정산 등록에 실패했습니다: ${error.response.data?.message || "알 수 없는 오류"}`);
            } else {
                alert("정산 등록 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="content-wrapper">
                <div className="container">
                    <h2 className="money-record-title">정산 등록하기</h2>

                    <input
                        className="money-record-title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요."
                    />

                    <div className="amount-container">
                        <span className="currency-symbol">₩</span>
                        <input
                            className="money-record-amount-input"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="정산 금액을 입력해 주세요"
                        />
                    </div>

                    {/* ✅ 이미지 업로드 버튼 */}
                    <div className="image-upload-container">
                        <label className="image-upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="image-upload-input"
                            />
                            <span className="image-upload-button">🖼️ 이미지 추가</span>
                        </label>
                    </div>

                    {/* ✅ 이미지 미리보기 */}
                    {imagePreview && (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="미리보기" className="image-preview" />
                        </div>
                    )}

                    <div className="memo-container">
                        <textarea
                            className="memo-field"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="메모 입력"
                        />
                    </div>

                    <button className="register-button" onClick={submitRecord}>등록하기</button>
                </div>
            </div>
        </div>
    );
}

export default MoneyRecord;
