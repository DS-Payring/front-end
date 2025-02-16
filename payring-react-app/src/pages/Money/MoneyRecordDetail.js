import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import "../../styles/MoneyRecord.css";
import "../../styles/MoneyRecordDetail.css";

const API_BASE_URL = "https://storyteller-backend.site";

function MoneyRecordDetail() {
    const { paymentId } = useParams(); // ✅ URL에서 paymentId 가져오기
    const navigate = useNavigate();
    const [record, setRecord] = useState(null); // ✅ API에서 받은 데이터를 저장할 상태
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ 쿠키에서 토큰 가져오는 함수
    const getTokenFromCookies = () => {
        const cookies = document.cookie.split("; ");
        const tokenCookie = cookies.find(row => row.startsWith("accessToken="));
        return tokenCookie ? tokenCookie.split("=")[1] : null;
    };

    useEffect(() => {
        console.log("✅ 상세보기 페이지 진입 | paymentId:", paymentId);

        if (!paymentId || paymentId === "undefined") {
            console.error("🚨 paymentId가 없습니다.");
            setError("잘못된 요청입니다. paymentId가 제공되지 않았습니다.");
            setLoading(false);
            return;
        }

        const fetchPaymentDetail = async () => {
            try {
                const token = getTokenFromCookies();
                if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                }

                console.log("🚀 API 요청 시작:", `${API_BASE_URL}/api/rooms/payments/${paymentId}`);

                const response = await axios.get(`${API_BASE_URL}/api/rooms/payments/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("✅ API 응답 데이터:", response.data);

                if (response.data && response.data.data) {
                    setRecord(response.data.data);
                } else {
                    console.error("🚨 API 응답 데이터 구조가 예상과 다릅니다.");
                    setError("데이터를 불러올 수 없습니다.");
                }
            } catch (error) {
                console.error("❌ 상세보기 데이터 조회 실패:", error);
                setError("데이터를 불러오지 못했습니다. 다시 시도해 주세요.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetail();
    }, [paymentId, navigate]);

    if (loading) {
        return <div className="loading">⏳ 로딩 중...</div>;
    }

    if (error) {
        return (
            <div className="error-message">
                ❌ {error}
                <button className="back-button" onClick={() => navigate(-1)}>뒤로 가기</button>
            </div>
        );
    }

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="container">
                <h2 className="money-record-title">정산 상세보기</h2>

                {/* ✅ 제목 */}
                <div className="money-record-title-input">
                    {record?.title || "제목 없음"}
                </div>

                {/* ✅ 정산 금액 */}
                <div className="amount-container">
                    <span className="currency-symbol">₩</span>
                    <span className="money-record-amount-input">
                        {record?.amount?.toLocaleString() || 0}
                    </span>
                </div>

                {/* ✅ 이미지 표시 */}
                {record?.paymentImage && (
                    <div className="image-preview">
                        <img src={record.paymentImage} alt="Uploaded" className="record-image" />
                    </div>
                )}

                {/* ✅ 메모 */}
                <div className="memo-container">
                    <p className="memo-field">{record?.memo || "메모 없음"}</p>
                </div>

                {/* ✅ 뒤로 가기 버튼 */}
                <button className="back-button" onClick={() => navigate(-1)}>
                    뒤로 가기
                </button>
            </div>
        </div>
    );
}

export default MoneyRecordDetail;
