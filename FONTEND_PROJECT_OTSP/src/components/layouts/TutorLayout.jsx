import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext';
import tutorApi from '../../api/tutorApi';

export default function TutorLayout() {
  const { user, isTutor } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [tutorStatus, setTutorStatus] = useState(user?.verificationStatus || 'Pending');

  useEffect(() => {
    const isTutorUser = isTutor ||
      user?.role === 'Tutor' ||
      user?.roles?.some((r) => String(r).toLowerCase() === 'tutor');

    if (isTutorUser) {
      tutorApi.getProfile()
        .then((res) => {
          const status = res.data?.profile?.verificationStatus || res.data?.verificationStatus;
          if (status) setTutorStatus(status);
        })
        .catch(() => {});
    }
  }, [user, location.pathname, isTutor]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 992);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('student-sidebar-open', sidebarOpen);
    document.body.classList.toggle('student-sidebar-collapsed', !sidebarOpen && window.innerWidth >= 992);
  }, [sidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <>
      <Header />

      <div className="student-dashboard-shell tutor-dashboard-shell">
        <aside className="student-sidebar" id="studentSidebar" aria-label="Thanh điều hướng gia sư">
          <div className="student-sidebar-user" id="studentSidebarUser">
            {user?.avatarUrl ? (
              <img
                className="student-sidebar-avatar"
                style={{ width: '40px', height: '40px', maxWidth: '40px', maxHeight: '40px', objectFit: 'cover', borderRadius: '50%' }}
                src={user.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="student-sidebar-avatar">
                <i className="bi bi-person-fill" aria-hidden="true"></i>
              </span>
            )}
            <div className="student-sidebar-user-info">
              <strong>{user?.fullName || user?.email || 'Gia sư'}</strong>
              {tutorStatus === 'Approved' ? (
                <small className="text-success fw-semibold">
                  <i className="bi bi-patch-check-fill me-1"></i>Gia sư · Đã xác minh
                </small>
              ) : tutorStatus === 'Rejected' ? (
                <small className="text-danger fw-semibold">
                  <i className="bi bi-x-octagon-fill me-1"></i>Gia sư · Bị từ chối
                </small>
              ) : (
                <small className="text-warning fw-semibold" style={{ color: '#d97706' }}>
                  <i className="bi bi-hourglass-split me-1"></i>Gia sư · Chờ xác nhận
                </small>
              )}
            </div>
          </div>

          <nav className="student-sidebar-nav">
            <span className="student-sidebar-heading">TỔNG QUAN</span>
            <NavLink
              to="/tutor/profile"
              end
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-grid" aria-hidden="true"></i>
              <span>Tổng quan</span>
            </NavLink>

            <span className="student-sidebar-heading">GIẢNG DẠY</span>
            <NavLink
              to="/tutor/schedule"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-calendar3" aria-hidden="true"></i>
              <span>Lịch dạy</span>
            </NavLink>
            <NavLink
              to="/tutor/connection-requests"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-person-plus" aria-hidden="true"></i>
              <span>Yêu cầu kết nối</span>
            </NavLink>
            <NavLink
              to="/tutor/classrooms"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-easel" aria-hidden="true"></i>
              <span>Lớp đang dạy</span>
            </NavLink>
            <NavLink
              to="/tutor/availability"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-clock-history" aria-hidden="true"></i>
              <span>Lịch rảnh</span>
            </NavLink>
            <NavLink
              to="/tutor/students"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-people" aria-hidden="true"></i>
              <span>Học viên của tôi</span>
            </NavLink>
            <NavLink
              to="/tutor/subjects"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-book" aria-hidden="true"></i>
              <span>Môn học</span>
            </NavLink>
            <NavLink
              to="/tutor/documents"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-folder2-open" aria-hidden="true"></i>
              <span>Tài liệu</span>
            </NavLink>

            <span className="student-sidebar-heading">TƯƠNG TÁC</span>
            <NavLink
              to="/tutor/reviews"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-star" aria-hidden="true"></i>
              <span>Đánh giá</span>
            </NavLink>
            <NavLink
              to="/tutor/chat"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-chat-dots" aria-hidden="true"></i>
              <span>Tin nhắn</span>
            </NavLink>
            <NavLink
              to="/tutor/notifications"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-bell" aria-hidden="true"></i>
              <span>Thông báo</span>
            </NavLink>

            <span className="student-sidebar-heading">TÀI CHÍNH</span>
            <span className="student-sidebar-link is-disabled" aria-disabled="true">
              <i className="bi bi-credit-card" aria-hidden="true"></i>
              <span>Thu nhập</span>
            </span>

            <span className="student-sidebar-heading">TÀI KHOẢN</span>
            <NavLink
              to="/tutor/profile"
              className={({ isActive }) => `student-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className="bi bi-person-vcard" aria-hidden="true"></i>
              <span>Hồ sơ</span>
            </NavLink>
          </nav>
        </aside>

        <button
          type="button"
          className="student-menu-toggle d-lg-none"
          id="studentMenuToggle"
          aria-label="Thu gọn thanh điều hướng"
          aria-controls="studentSidebar"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className="student-sidebar-backdrop"
          id="studentSidebarBackdrop"
          aria-label="Đóng thanh điều hướng"
          onClick={() => setSidebarOpen(false)}
        ></button>

        <main id="tutorPageContent" role="main" className="student-dashboard-main tutor-dashboard-main pb-3">
          <Outlet />
        </main>
      </div>

      <Footer />
    </>
  );
}
