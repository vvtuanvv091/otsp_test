import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import studentApi from '../../api/studentApi';

const formatMoney = (val) =>
  new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';

export default function StudentPaymentsPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    isMinor: false,
    guardianName: '',
    pendingPayments: [],
    historyPayments: []
  });
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 5;

  const statusSuccess = searchParams.get('status') === 'success';

  useEffect(() => {
    let isMounted = true;
    async function loadPayments() {
      try {
        setLoading(true);
        const res = await studentApi.getPayments();
        if (isMounted && res.data) {
          setData({
            isMinor: !!res.data.isMinor,
            guardianName: res.data.guardianName || '',
            pendingPayments: res.data.pendingPayments || [],
            historyPayments: res.data.historyPayments || []
          });
        }
      } catch (err) {
        console.warn('API getPayments error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPayments();
    return () => {
      isMounted = false;
    };
  }, []);

  const pendingPayments = data?.pendingPayments || [];
  const historyPayments = data?.historyPayments || [];

  const totalHistoryPages = Math.ceil(historyPayments.length / pageSize) || 1;
  const pagedHistory = useMemo(() => {
    const start = (historyPage - 1) * pageSize;
    return historyPayments.slice(start, start + pageSize);
  }, [historyPayments, historyPage, pageSize]);

  return (
    <div className="container-fluid py-3 px-1 px-md-3" style={{ width: '100%' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="h4 fw-bold mb-1 text-body">Học phí &amp; thanh toán</h1>
        <p className="text-secondary small mb-0">
          Khu tài chính &amp; theo dõi giao dịch học phí của học viên / phụ huynh
        </p>
      </div>

      {statusSuccess && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-check-circle-fill me-2 fs-5"></i>
          <div>Giao dịch thanh toán của bạn đã hoàn tất thành công!</div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Đóng"></button>
        </div>
      )}

      {/* Minor under 18 alert banner */}
      {data?.isMinor && (
        <div className="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis d-flex align-items-center mb-4 rounded-3">
          <i className="bi bi-shield-lock-fill fs-4 me-3 text-warning"></i>
          <div>
            <strong>Học viên dưới 18 tuổi:</strong> Học phí và các khoản thanh toán được quản lý bởi người giám hộ{' '}
            {data.guardianName ? `(${data.guardianName})` : ''}.
          </div>
        </div>
      )}

      {/* Bảng 1: Các khoản học phí cần thanh toán */}
      <div className="card border shadow-sm rounded-3 mb-4 overflow-hidden bg-body">
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-body">
          <h2 className="h6 fw-bold mb-0 text-danger">
            <i className="bi bi-hourglass-split me-1"></i> Các khoản học phí cần thanh toán ({pendingPayments.length})
          </h2>
          <span className="badge bg-danger-subtle text-danger border">
            Cần đóng học phí để vào học
          </span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Lớp học</th>
                <th>Môn / Cấp học</th>
                <th>Gia sư</th>
                <th>Loại lớp</th>
                <th>Học phí</th>
                <th>Trạng thái</th>
                <th className="text-end pe-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary small">
                    <span className="spinner-border spinner-border-sm text-danger me-2" role="status"></span>
                    Đang tải dữ liệu học phí...
                  </td>
                </tr>
              ) : pendingPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <i className="bi bi-check2-circle fs-3 text-success d-block mb-1"></i>
                    Bạn không có khoản học phí nào cần thanh toán. Tất cả các lớp đã hoàn tất!
                  </td>
                </tr>
              ) : (
                pendingPayments.map((item) => (
                  <tr key={item.paymentId}>
                    <td className="ps-3 fw-semibold text-body">{item.classroomName}</td>
                    <td className="small text-secondary">
                      {item.subjectName} - {item.gradeLevelName}
                    </td>
                    <td className="small text-body">{item.tutorName}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {item.classroomType === 'OneToOne' || item.classroomType === 0 ? 'Lớp 1-1' : 'Lớp nhóm'}
                      </span>
                    </td>
                    <td className="text-danger fw-bold fs-6">{formatMoney(item.amount)}</td>
                    <td>
                      <span className="badge bg-warning text-dark px-2.5 py-1 rounded-pill">
                        Chờ thanh toán
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      <Link
                        to={`/student/payments/${item.paymentId}/checkout`}
                        className="btn btn-sm btn-danger fw-semibold px-3 py-1.5"
                      >
                        <i className="bi bi-qr-code-scan me-1"></i> Thanh toán
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng 2: Lịch sử thanh toán & Hóa đơn */}
      <div className="card border shadow-sm rounded-3 overflow-hidden bg-body">
        <div className="p-3 border-bottom bg-body">
          <h2 className="h6 fw-bold mb-0 text-body">
            <i className="bi bi-receipt me-1 text-danger"></i> Lịch sử thanh toán &amp; Hóa đơn ({historyPayments.length})
          </h2>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Mã GD</th>
                <th>Lớp học</th>
                <th>Gia sư</th>
                <th>Số tiền</th>
                <th>Thời gian thanh toán</th>
                <th>Mã hóa đơn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-secondary small">
                    <span className="spinner-border spinner-border-sm text-secondary me-2" role="status"></span>
                    Đang tải lịch sử giao dịch...
                  </td>
                </tr>
              ) : pagedHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted small">
                    Chưa có lịch sử giao dịch nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                pagedHistory.map((item) => (
                  <tr key={item.paymentId}>
                    <td className="ps-3 fw-semibold text-secondary small">#PAY-{item.paymentId}</td>
                    <td className="fw-medium text-body">{item.classroomName}</td>
                    <td className="small text-secondary">{item.tutorName}</td>
                    <td className="text-success fw-bold">{formatMoney(item.amount)}</td>
                    <td className="small text-secondary">
                      {item.paidAt ? new Date(item.paidAt).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        <i className="bi bi-file-earmark-check me-1 text-success"></i>
                        HD-{item.invoiceId || item.paymentId}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill">
                        <i className="bi bi-check-lg me-1"></i>Đã thanh toán
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalHistoryPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <span className="small text-secondary">Trang {historyPage} / {totalHistoryPages}</span>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={historyPage <= 1}
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
              >
                ‹ Trước
              </button>
              {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${p === historyPage ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setHistoryPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={historyPage >= totalHistoryPages}
                onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
