import React, { useState, useEffect } from 'react';
import tutorApi from '../../api/tutorApi';

export default function TutorReviewsPage() {
  const [reviewsData, setReviewsData] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = (curPage = page) => {
    setLoading(true);
    tutorApi.getReviews({ page: curPage, pageSize: 10 })
      .then((res) => {
        setReviewsData(res.data);
        setPage(res.data?.page || 1);
        setTotalPages(res.data?.totalPages || 1);
      })
      .catch(() => {
        setError('Không tải được danh sách đánh giá.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const avgRating = reviewsData?.averageRating || 5.0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const rating5 = reviewsData?.rating5Percent ?? (totalReviews > 0 ? 100 : 0);
  const rating4 = reviewsData?.rating4Percent ?? 0;
  const rating3 = reviewsData?.rating3Percent ?? 0;
  const rating2 = reviewsData?.rating2Percent ?? 0;
  const rating1 = reviewsData?.rating1Percent ?? 0;
  const reviewsList = reviewsData?.reviews || [];

  return (
    <>
      <style>{`
        .review-score-big {
          font-size: 3.75rem;
          font-weight: 800;
          line-height: 1;
          color: #C12026;
          letter-spacing: -1.5px;
        }
        .star-gold i {
          color: #F59E0B !important;
          font-size: 1.15rem;
        }
        .star-gold i.star-muted {
          color: #E2E8F0 !important;
        }
        .rate-bar-track {
          height: 6px;
          background-color: #E2E8F0;
          border-radius: 999px;
          overflow: hidden;
          flex-grow: 1;
        }
        .rate-bar-fill {
          height: 100%;
          background-color: #E85B0F;
          border-radius: 999px;
        }
        .review-item-card {
          transition: all 0.2s ease;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
        }
        .review-item-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="tutor-page-container review-page py-3">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1 text-dark">Đánh Giá &amp; Nhận Xét Từ Học Viên</h1>
          <p className="text-secondary small mb-0">Xem toàn bộ đánh giá 5 sao và phản hồi từ phụ huynh, học viên sau các buổi học.</p>
        </div>

        {error && (
          <div className="alert alert-warning py-2 small mb-3">{error}</div>
        )}

        {/* Khối Thống Kê Tổng Quan */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-white">
          <div className="row g-4 align-items-center">
            {/* Cột trái: Điểm trung bình */}
            <div className="col-12 col-md-4 text-center border-end-md">
              <div className="small fw-semibold text-secondary text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                ĐIỂM TRUNG BÌNH
              </div>
              <div className="review-score-big mb-2">{avgRating.toFixed(1)}</div>
              <div className="star-gold mb-2 d-flex justify-content-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi bi-star-fill ${star <= Math.round(avgRating) ? '' : 'star-muted'}`}
                  ></i>
                ))}
              </div>
              <div className="text-secondary small">
                Dựa trên <b>{totalReviews}</b> lượt đánh giá thực tế
              </div>
            </div>

            {/* Cột phải: Thanh Tỷ Lệ Đánh Giá */}
            <div className="col-12 col-md-8 ps-md-4">
              <div className="fw-bold text-dark mb-3">Tỷ Lệ Đánh Giá</div>
              <div className="d-flex flex-column gap-2.5">
                {/* 5 sao */}
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary text-nowrap" style={{ width: 48 }}>5 sao</span>
                  <div className="rate-bar-track">
                    <div className="rate-bar-fill" style={{ width: `${rating5}%` }}></div>
                  </div>
                  <span className="small fw-semibold text-dark text-end" style={{ width: 40 }}>{rating5}%</span>
                </div>

                {/* 4 sao */}
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary text-nowrap" style={{ width: 48 }}>4 sao</span>
                  <div className="rate-bar-track">
                    <div className="rate-bar-fill" style={{ width: `${rating4}%` }}></div>
                  </div>
                  <span className="small fw-semibold text-dark text-end" style={{ width: 40 }}>{rating4}%</span>
                </div>

                {/* 3 sao */}
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary text-nowrap" style={{ width: 48 }}>3 sao</span>
                  <div className="rate-bar-track">
                    <div className="rate-bar-fill" style={{ width: `${rating3}%` }}></div>
                  </div>
                  <span className="small fw-semibold text-dark text-end" style={{ width: 40 }}>{rating3}%</span>
                </div>

                {/* 2 sao */}
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary text-nowrap" style={{ width: 48 }}>2 sao</span>
                  <div className="rate-bar-track">
                    <div className="rate-bar-fill" style={{ width: `${rating2}%` }}></div>
                  </div>
                  <span className="small fw-semibold text-dark text-end" style={{ width: 40 }}>{rating2}%</span>
                </div>

                {/* 1 sao */}
                <div className="d-flex align-items-center gap-3">
                  <span className="small text-secondary text-nowrap" style={{ width: 48 }}>1 sao</span>
                  <div className="rate-bar-track">
                    <div className="rate-bar-fill" style={{ width: `${rating1}%` }}></div>
                  </div>
                  <span className="small fw-semibold text-dark text-end" style={{ width: 40 }}>{rating1}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danh Sách Đánh Giá */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h2 className="h5 fw-bold mb-3">Nhận xét chi tiết từ học viên</h2>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status"></div>
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="text-center py-5 text-secondary">
              <i className="bi bi-star fs-1 text-muted d-block mb-2"></i>
              <p className="mb-0">Chưa có đánh giá hoặc nhận xét nào từ học viên.</p>
            </div>
          ) : (
            <>
              <div className="d-flex flex-column gap-3">
                {reviewsList.map((r) => (
                  <div key={r.id} className="review-item-card rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2.5">
                        <div
                          className="student-avatar-circle"
                          style={{
                            width: 40,
                            height: 40,
                            fontSize: 14,
                            borderRadius: '50%',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {!r.studentName ? 'H' : r.studentName.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{r.studentName}</div>
                          <div className="star-gold d-flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i
                                key={s}
                                className={`bi bi-star-fill ${s <= r.score ? '' : 'star-muted'}`}
                                style={{ fontSize: '0.85rem' }}
                              ></i>
                            ))}
                          </div>
                        </div>
                      </div>

                      <small className="text-muted">
                        {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString('vi-VN') : ''}
                      </small>
                    </div>

                    <p className="text-secondary small mb-0 ps-1">
                      {r.comment || 'Học viên không để lại lời nhận xét chi tiết.'}
                    </p>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-1 mt-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </button>
                  <span className="btn btn-sm btn-light border disabled">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
