import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import "../../styles/MoneyRecordDetail.css";

const API_BASE_URL = "https://storyteller-backend.site";

// 쿠키에서 특정 값을 가져오는 함수 정의
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : null;
};

const MoneyRecordDetail = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [paymentDetail, setPaymentDetail] = useState(null);

    useEffect(() => {
        const fetchPaymentDetail = async () => {
            try {
                const token = getCookie("token");
                if (!token) return;

                const response = await axios.get(`${API_BASE_URL}/api/rooms/payments/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setPaymentDetail(response.data.data);
            } catch (error) {
                console.error("🚨 정산 요청 상세 조회 실패:", error);
            }
        };

        fetchPaymentDetail();
    }, [paymentId]);

    if (!paymentDetail) return <div>로딩 중...</div>;

    return (
        <div className="mobile-container">
            <div className="header-wrapper">
                <Header />
            </div>
            <div className="content-wrapper">
                <div className="container">
                    <h1 className="money-record-title-input">{paymentDetail.title}</h1>
                    <p className="money-record-amount">{paymentDetail.amount.toLocaleString()}원</p>

                    {/* 메모 컨테이너 안에 이미지 포함 */}
                    <div className="memo-container">
                        {paymentDetail.paymentImage && (
                            <img 
                                src={paymentDetail.paymentImage} 
                                alt="결제 이미지" 
                                className="image-preview"
                            />
                        )}
                        <p className="money-record-memo">{paymentDetail.memo || "메모 없음"}</p>
                    </div>

                    <button className="back-button" onClick={() => navigate(-1)}>뒤로가기</button>
                </div>
            </div>
        </div>
    );
};

export default MoneyRecordDetail;
