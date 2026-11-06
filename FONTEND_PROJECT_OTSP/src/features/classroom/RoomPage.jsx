import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hubUrl, API_BASE_URL } from '../../api/config';
import { useParams, useNavigate } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import classroomApi from '../../api/classroomApi';
import { useAuth } from '../../context/AuthContext';

/**
 * Trang điều khiển phòng học trực tuyến.
 *
 * Vì máy chủ công cộng meet.jit.si giới hạn 5 phút đối với video nhúng (iframe) trên website bên thứ ba,
 * buổi học được mở ở TAB RIÊNG (https://meet.jit.si/{roomName}) để học không giới hạn thời gian.
 * Trang này giữ vai trò "bảng điều khiển": thông tin lớp, mở/vào lại phòng họp,
 * Gia sư bấm "Kết thúc buổi học", Học viên bấm "Rời lớp", và nhận thông báo realtime khi buổi học kết thúc.
 */
export default function RoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, isTutor } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetingOpened, setMeetingOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [ending, setEnding] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const meetingWindowRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const endedRef = useRef(false);

  const backUrl = isTutor ? '/tutor/schedule' : '/student/schedule';
  const roomName = session?.roomName || `otsp-room-${sessionId}`;
  const displayName = user?.fullName || session?.displayName || (isTutor ? 'Gia sư' : 'Học viên');

  const meetingUrl = (() => {
    const hash = [
      'config.prejoinPageEnabled=true',
      'config.startWithAudioMuted=true',
      'config.startWithVideoMuted=true',
      'config.disableDeepLinking=true',
      'config.defaultLanguage="vi"',
      `userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}`,
    ].join('&');
    return `https://meet.jit.si/${encodeURIComponent(roomName)}#${hash}`;
  })();

  // 1. Tham gia buổi học & tải thông tin phòng
  useEffect(() => {
    let active = true;
    const loadRoom = async () => {
      try {
        const joinResponse = await classroomApi.joinSession(sessionId);
        const joined = joinResponse.data;
        if (!joined?.success) {
          if (joined?.requiresPayment && joined.paymentRedirectUrl) {
            navigate(joined.paymentRedirectUrl, { replace: true });
            return;
          }
          throw new Error(joined?.message || 'Không thể tham gia buổi học này.');
        }

        const roomResponse = await classroomApi.getSessionRoom(sessionId);
        const roomInfo = roomResponse.data?.data || roomResponse.data;
        if (active) {
          setSession({
            ...roomInfo,
            roomName: joined.roomName || roomInfo?.roomName,
            displayName: joined.displayName || roomInfo?.displayName,
          });
        }
      } catch (requestError) {
        if (active) {
          const data = requestError.response?.data;
          if (requestError.response?.status === 402 && data?.paymentRedirectUrl) {
            navigate(data.paymentRedirectUrl, { replace: true });
            return;
          }
          setError(data?.message || requestError.message || 'Không tải được thông tin phòng học trực tuyến.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (sessionId) loadRoom();
    else {
      setError('Thiếu mã buổi học để mở phòng.');
      setLoading(false);
    }
    return () => { active = false; };
  }, [sessionId, navigate]);

  // 2. Mở phòng họp ở tab riêng
  const openMeeting = useCallback(() => {
    const win = window.open(meetingUrl, `otsp-meeting-${sessionId}`);
    if (!win) {
      setPopupBlocked(true);
      return;
    }
    setPopupBlocked(false);
    meetingWindowRef.current = win;
    setMeetingOpened(true);
    try { win.focus(); } catch { /* ignore */ }
  }, [meetingUrl, sessionId]);

  // 3. Xử lý khi buổi học kết thúc
  const triggerSessionEnded = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setSessionEnded(true);
    // Đóng tab họp nếu do chính trang này mở (có thể bị trình duyệt từ chối đối với domain khác)
    try { meetingWindowRef.current?.close(); } catch { /* ignore */ }

    let sec = 10;
    setCountdown(sec);
    countdownTimerRef.current = setInterval(() => {
      sec -= 1;
      setCountdown(sec);
      if (sec <= 0) {
        clearInterval(countdownTimerRef.current);
        navigate(backUrl);
      }
    }, 1000);
  }, [backUrl, navigate]);

  // 4. SignalR: nhận thông báo buổi học kết thúc theo thời gian thực
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('otsp_token');
    if (!token) return undefined;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl('/hubs/connection-requests'), { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.on('ClassSessionEnded', (data) => {
      const id = data?.sessionId ?? data?.classSessionId;
      if (id === Number(sessionId)) triggerSessionEnded();
    });

    connection.on('ClassSessionStatusChanged', (data) => {
      const id = data?.sessionId ?? data?.classSessionId;
      if (id === Number(sessionId) && (data?.status === 'Done' || data?.status === 'Completed')) {
        triggerSessionEnded();
      }
    });

    connection.start().catch((err) => { console.warn('SignalR error:', err); });
    return () => { connection.stop(); };
  }, [sessionId, triggerSessionEnded]);

  // 5. Dự phòng khi SignalR mất kết nối: hỏi trạng thái buổi học mỗi 30 giây
  useEffect(() => {
    if (!session) return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await classroomApi.getSessionRoom(sessionId);
        const info = res.data?.data || res.data;
        if (info?.status === 'Done' || info?.status === 'Completed') triggerSessionEnded();
      } catch { /* bỏ qua lỗi mạng tạm thời */ }
    }, 30000);
    return () => clearInterval(timer);
  }, [session, sessionId, triggerSessionEnded]);

  // Dọn dẹp bộ đếm
  useEffect(() => () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, []);

  // 6. Ghi nhận rời phòng khi đóng tab / chuyển trang
  useEffect(() => {
    if (!session) return undefined;
    const sendLeave = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('otsp_token');
      if (!token) return;
      try {
        fetch(`${API_BASE_URL}/sessions/${sessionId}/leave`, {
          method: 'POST',
          keepalive: true,
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore */ }
    };
    window.addEventListener('pagehide', sendLeave);
    return () => window.removeEventListener('pagehide', sendLeave);
  }, [session, sessionId]);

  const handleEndSession = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn kết thúc buổi học này? Thao tác này sẽ đánh dấu hoàn thành buổi học cho tất cả thành viên.')) return;
    setEnding(true);
    try {
      await classroomApi.endSession(sessionId);
      triggerSessionEnded();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể kết thúc buổi học.');
    } finally {
      setEnding(false);
    }
  };

  const handleLeaveRoom = async () => {
    try { await classroomApi.leaveSession(sessionId); } catch { /* ignore */ }
    try { meetingWindowRef.current?.close(); } catch { /* ignore */ }
    navigate(backUrl);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-3 text-secondary">Đang kết nối vào phòng học trực tuyến...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
          <h5>Không thể vào phòng học</h5>
          <p className="mb-3">{error}</p>
          <button type="button" className="btn btn-outline-danger rounded-pill px-4" onClick={() => navigate(backUrl)}>
            Quay lại lịch học
          </button>
        </div>
      </div>
    );
  }

  const scheduledText = session?.scheduledAtUtc || session?.scheduledAt
    ? new Date(session.scheduledAtUtc || session.scheduledAt).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Hiện tại';

  return (
    <div id="class-room-page" className="container py-3 py-md-4" style={{ maxWidth: 820 }}>
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-white border-bottom py-3 px-3 px-md-4 d-flex justify-content-between align-items-center gap-2">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge ${isTutor ? 'bg-primary' : 'bg-success'} px-2 py-1 flex-shrink-0`}>
                <i className={`bi ${isTutor ? 'bi-mortarboard' : 'bi-person'} me-1`}></i>
                {isTutor ? 'Gia sư' : 'Học viên'}
              </span>
              <h1 className="h5 mb-0 fw-bold text-dark text-truncate" title={session?.classroomName}>
                {session?.classroomName || 'Phòng học trực tuyến'}
              </h1>
            </div>
            <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
              <span><i className="bi bi-book me-1"></i>{session?.subjectName || 'Môn học'}</span>
              <span>•</span>
              <span><i className="bi bi-clock me-1"></i>{scheduledText}</span>
              {session?.activeParticipantCount != null && (
                <>
                  <span>•</span>
                  <span><i className="bi bi-people me-1"></i>{session.activeParticipantCount} người đã vào</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center flex-shrink-0"
            onClick={() => navigate(backUrl)}
            title="Quay về lịch học"
          >
            <i className="bi bi-calendar3"></i>
            <span className="d-none d-sm-inline ms-1">Lịch học</span>
          </button>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5 text-center position-relative">
          {!sessionEnded ? (
            <>
              <div className="mb-3">
                <span className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger">
                  <i className="bi bi-camera-video-fill" style={{ fontSize: '2.4rem' }}></i>
                </span>
              </div>
              <h2 className="h4 fw-bold mb-2">
                {meetingOpened ? 'Phòng học đang mở ở tab riêng' : 'Sẵn sàng vào phòng học'}
              </h2>
              <p className="text-muted mb-4">
                {meetingOpened
                  ? 'Hãy chuyển sang tab họp để học. Nếu lỡ đóng tab, bấm nút bên dưới để vào lại.'
                  : 'Phòng học sẽ mở ở tab mới để bạn học liên tục, không bị giới hạn thời gian. Bạn có thể kiểm tra camera và mic trước khi vào.'}
              </p>

              {popupBlocked && (
                <div className="alert alert-warning small text-start mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  Trình duyệt đã chặn cửa sổ mới. Hãy cho phép pop-up cho trang này hoặc mở trực tiếp:{' '}
                  <a href={meetingUrl} target="_blank" rel="noreferrer" className="fw-semibold">Mở phòng học</a>
                </div>
              )}

              <button
                type="button"
                className="btn btn-danger btn-lg px-5 rounded-pill shadow-sm fw-semibold"
                style={{ backgroundColor: '#DB303A', borderColor: '#DB303A' }}
                onClick={openMeeting}
              >
                <i className="bi bi-box-arrow-up-right me-2"></i>
                {meetingOpened ? 'Vào lại phòng học' : 'Vào phòng học ngay'}
              </button>

              <div className="mt-4 small text-muted text-start mx-auto" style={{ maxWidth: 520 }}>
                <div className="fw-semibold text-dark mb-1"><i className="bi bi-info-circle me-1"></i>Lưu ý</div>
                <ul className="mb-0 ps-3">
                  <li>Cho phép trình duyệt dùng <b>Camera</b> và <b>Microphone</b> khi được hỏi.</li>
                  <li>
                    {isTutor
                      ? <>Khi học xong, hãy quay lại trang này và bấm <b>"Kết thúc buổi học"</b> để hoàn thành buổi cho cả lớp.</>
                      : <>Khi học xong, bạn có thể đóng tab họp và bấm <b>"Rời lớp"</b>. Buổi học sẽ do gia sư kết thúc.</>}
                  </li>
                  <li>Bạn có thể vào phòng sớm trước giờ học tối đa 60 phút. Học viên vào trước sẽ chờ gia sư.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <span className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success">
                  <i className="bi bi-check-circle" style={{ fontSize: '2.5rem' }}></i>
                </span>
              </div>
              <h2 className="h4 fw-bold mb-2">Buổi học đã hoàn thành!</h2>
              <p className="text-muted mb-3">
                Buổi học đã kết thúc. Nếu tab họp vẫn còn mở, hãy đóng nó lại. Cảm ơn bạn đã tham gia.
              </p>
              <div className="alert alert-info py-2 small mb-4 d-inline-block">
                Tự động chuyển về lịch học sau <b>{countdown}</b> giây...
              </div>
              <div>
                <button type="button" className="btn btn-success px-4 py-2" onClick={() => navigate(backUrl)}>
                  <i className="bi bi-calendar3 me-1"></i>Về lịch học ngay
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!sessionEnded && (
          <div className="card-footer bg-white border-top py-3 px-3 px-md-4 d-flex justify-content-between align-items-center gap-2">
            <span className="small text-muted">
              <i className="bi bi-link-45deg me-1"></i>
              Mã phòng: <code>{roomName}</code>
            </span>
            <div className="d-flex align-items-center gap-2 ms-auto">
              {isTutor && (
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleEndSession}
                  disabled={ending}
                >
                  <i className="bi bi-stop-circle me-1"></i>
                  {ending ? 'Đang kết thúc...' : 'Kết thúc buổi học'}
                </button>
              )}
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleLeaveRoom}>
                <i className="bi bi-box-arrow-right me-1"></i>Rời lớp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
