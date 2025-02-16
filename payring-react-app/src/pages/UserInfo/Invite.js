import React, { useState, useEffect } from 'react';
import '../../styles/invite.css';
import "../../styles/styles.css";
import Header from "../../components/Header";

const Invite = () => {
    const [invites, setInvites] = useState([]);
    const [error, setError] = useState(null);

    // 쿠키에서 token을 가져오는 함수
    const getCookie = (name) => {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1] || null;
    };

    // 초대 목록 불러오기
    const fetchInvites = async () => {
        try {
            const token = getCookie('token');
            if (!token) {
                setError('로그인이 필요합니다.');
                return;
            }

            const response = await fetch('/api/rooms/invitations', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('초대 목록을 불러오는 데 실패했습니다.');
            }

            const data = await response.json();
            setInvites(data.data || []);
        } catch (err) {
            setError(err.message || '서버에 연결할 수 없습니다.');
        }
    };

    // 초대 수락 API 호출
    const handleAccept = async (id) => {
        try {
            const token = getCookie('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            const invite = invites.find(invite => invite.id === id);
            if (!invite?.roomId) {
                alert('초대 정보를 찾을 수 없습니다.');
                return;
            }

            const response = await fetch(`/api/rooms/${invite.roomId}/accept`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // 초대 수락 후, 전체 초대 목록을 다시 불러옵니다
                fetchInvites();  // 다시 목록을 불러오는 함수 호출
                alert('초대를 수락했습니다.');
            } else {
                alert(data.message || '초대 수락에 실패했습니다.');
            }
        } catch (err) {
            alert('서버에 연결할 수 없습니다.');
        }
    };

    // 초대 거절 API 호출
    const handleReject = async (id) => {
        try {
            const token = getCookie('token');
            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            const invite = invites.find(invite => invite.id === id);
            if (!invite?.roomId) {
                alert('초대 정보를 찾을 수 없습니다.');
                return;
            }

            const response = await fetch(`/api/rooms/${invite.roomId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // 초대 거절 후, 전체 초대 목록을 다시 불러옵니다
                fetchInvites();  // 다시 목록을 불러오는 함수 호출
                alert('초대를 거절했습니다.');
            } else {
                alert(data.message || '초대 거절에 실패했습니다.');
            }
        } catch (err) {
            alert('서버에 연결할 수 없습니다.');
        }
    };

    // 페이지가 처음 로드될 때 초대 목록을 불러옵니다
    useEffect(() => {
        fetchInvites();
    }, []);

    return (
        <div className='mobile-container'>
            <div className="header-wrapper">
                <Header />
            </div>
            <div className='content-wrapper'>
                <div className="invite-container">
                    <h2>방 초대 내역</h2>

                    {error && <p className="error-message">{error}</p>}

                    {invites.length === 0 ? (
                        <p className="no-invites">받은 초대가 없습니다.</p>
                    ) : (
                        invites.map((invite, index) => (
                            <div key={invite.id || `invite-${index}`} className="invite-card">
                                <div className="invite-info">
                                    <p className="room-name"><strong>{invite.roomName}</strong></p>
                                    <p className="member-count">참여 인원 {invite.members}명</p>
                                </div>
                                <div className="invite-buttons">
                                    <button className="accept-btn" onClick={() => handleAccept(invite.id)}>수락</button>
                                    <button className="reject-btn" onClick={() => handleReject(invite.id)}>거절</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Invite;