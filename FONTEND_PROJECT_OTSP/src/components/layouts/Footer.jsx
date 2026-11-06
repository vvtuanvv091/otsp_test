import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="footer position-relative">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <Link to="/" className="logo d-flex align-items-center text-decoration-none">
              <span className="sitename text-danger fw-bold fs-3">OTSP</span>
            </Link>
            <p className="pt-3">
              Nền tảng kết nối gia sư và học viên trực tuyến hàng đầu. Đội ngũ gia sư được kiểm định bằng cấp nghiêm ngặt,
              học phí minh bạch và hỗ trợ học thử linh hoạt.
            </p>
            <div className="footer-contact pt-2">
              <p>
                <i className="bi bi-telephone-fill me-2 text-danger"></i>
                <strong>Hotline:</strong> <span>(+84) 984 391 940</span>
              </p>
              <p>
                <i className="bi bi-envelope-fill me-2 text-danger"></i>
                <strong>Email:</strong> <span>tongngoctuan09@gmail.com</span>
              </p>
            </div>
            <div className="social-links d-flex gap-2 mt-4">
              <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
              <a href="#" aria-label="TikTok"><i className="bi bi-tiktok"></i></a>
            </div>
          </div>

          <div className="col-6 col-lg-2 col-md-3 footer-links">
            <h4>Khám phá</h4>
            <ul className="list-unstyled">
              <li><Link to="/search">Danh mục gia sư</Link></li>
              <li><Link to="/search">Lớp học đang mở</Link></li>
              <li><Link to="/register">Đăng ký làm gia sư</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2 col-md-3 footer-links">
            <h4>Thông tin</h4>
            <ul className="list-unstyled">
              <li><Link to="/about">Về OTSP</Link></li>
              <li><Link to="/guide">Hướng dẫn sử dụng</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/contact">Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-12 footer-newsletter">
            <h4>Nhận bản tin giáo dục</h4>
            <p>Đăng ký email để nhận thông tin ưu đãi học tập và các mẹo ôn thi hữu ích.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận tin!'); }} className="php-email-form">
              <div className="newsletter-form d-flex">
                <input type="email" name="email" placeholder="Nhập địa chỉ email của bạn" className="form-control rounded-pill me-2" required />
                <button type="submit" className="btn btn-danger rounded-pill px-4">Đăng ký</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">OTSP</strong> <span>All Rights Reserved</span></p>
      </div>
    </footer>
  );
}

