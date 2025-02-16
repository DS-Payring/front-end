import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../styles/editpage.css";
import "../../styles/styles.css";
import Header from "../../components/Header";

const EditPage = () => {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(null); // 사용자 정보
    const [editedInfo, setEditedInfo] = useState({ userName: '', payUrl: '' }); // 수정된 사용자 정보
    const [loading, setLoading] = useState(true); // 로딩 상태

    const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
            return match[2];
        }
        return null;
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = getCookie('token');
            if (!token) {
                alert('로그인 상태가 아닙니다.');
                navigate('/'); // 로그인 페이지로 리디렉션
                return;
            }

            try {
                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched User Info:', data); // 사용자 정보를 출력하여 확인
                    setUserInfo(data.data);  // 사용자 정보 상태 업데이트
                    setEditedInfo({
                        userName: data.data.userName || '',  // 초기값 빈 문자열
                        payUrl: data.data.payUrl || '',      // 초기값 빈 문자열
                    });
                    setLoading(false);
                } else {
                    setLoading(false);
                    alert('사용자 정보를 가져오는 데 실패했습니다.');
                }
            } catch (err) {
                setLoading(false);
                alert('서버 오류가 발생했습니다.');
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        const token = getCookie('token');
        if (!token) {
            alert('로그인 상태가 아닙니다.');
            navigate('/');
            return;
        }

        // 값이 없으면 저장 안 되도록 처리
        if (!editedInfo.userName || editedInfo.userName.trim() === '') {
            alert('사용자명을 입력하세요.');
            return;
        }

        if (!editedInfo.payUrl || editedInfo.payUrl.trim() === '') {
            alert('카카오페이 URL을 입력하세요.');
            return;
        }

        try {
            const response = await fetch('/api/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(editedInfo),
            });

            const data = await response.json();
            if (response.ok && data.code === 'SUCCESS_UPDATE_USERINFO') {
                alert(data.message);
                setUserInfo(data.data);
                navigate('/mypage');  // 수정 후 'mypage'로 이동
            } else {
                alert(`정보 수정에 실패했습니다: ${data.message}`);
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleFocus = (e) => {
        // 입력란이 포커스 될 때 기존 값을 지웁니다.
        const { name } = e.target;
        setEditedInfo((prev) => ({ ...prev, [name]: '' }));
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (!userInfo) {
        return <div>사용자 정보를 불러오는 데 실패했습니다.</div>;
    }

    return (
        <div className='mobile-container'>
            <div className="header-wrapper">
                <Header />
            </div>
            <div className='content-wrapper'>
                <div className="edit-page-container">
                    <div className='userInfo'>
                        <div className="profile-image">
                            {userInfo.profileImage ? (
                                <img className="profile-img" src={userInfo.profileImage} alt="Profile" />
                            ) : (
                                <div className="no-profile-image">프로필 사진 없음</div>
                            )}
                        </div>

                        <div className="user-name">
                            <label>사용자명</label>
                            <input
                                type="text"
                                name="userName"
                                value={editedInfo.userName || ''} // 수정된 사용자명 표시
                                onChange={handleInputChange}
                                onFocus={handleFocus} // 입력란 클릭 시 값 지우기
                            />
                        </div>

                        <div className="edit-info">
                            <label>이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                readOnly
                            />
                            <label>은행</label>
                            <input
                                type="text"
                                name="bankName"
                                value={userInfo.bankName || '등록 안 됨'}
                                readOnly
                            />
                            <label>계좌번호</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={userInfo.accountNumber || '등록 안 됨'}
                                readOnly
                            />
                            <label>카카오페이 URL</label>
                            <input
                                type="url"
                                name="payUrl"
                                value={editedInfo.payUrl || ''} // 수정된 카카오페이 URL 표시
                                onChange={handleInputChange}
                                onFocus={handleFocus} // 입력란 클릭 시 값 지우기
                            />
                        </div>
                    </div>

                    {/* 저장 버튼을 container 밖으로 꺼내서 위치 설정 */}
                    <div className="save-btn-wrapper">
                        <button onClick={handleSaveClick}>저장</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPage;