import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import tutorApi from '../../api/tutorApi';
import { repairMojibake } from '../../utils/repairMojibake';

export default function TutorDocumentsPage() {
  const [searchParams] = useSearchParams();
  const classroomIdFilter = searchParams.get('classroomId');

  const [documents, setDocuments] = useState([]);
  const [activeClassrooms, setActiveClassrooms] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Upload form state
  const [scope, setScope] = useState('classroom'); // 'classroom' or 'public'
  const [title, setTitle] = useState('');
  const [classroomId, setClassroomId] = useState(classroomIdFilter || '');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = (curPage = page) => {
    setLoading(true);
    const params = { page: curPage, pageSize: 10 };
    if (classroomIdFilter) params.classroomId = classroomIdFilter;

    tutorApi.getDocuments(params)
      .then((res) => {
        if (res.data) {
          setDocuments(res.data.documents || res.data.items || []);
          setTotalItems(res.data.totalItems || 0);
          setTotalPages(res.data.totalPages || 1);
          setPage(res.data.page || 1);
        }
      })
      .catch(() => {
        setError('Không tải được danh sách tài liệu.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchClassrooms = () => {
    tutorApi.getClassrooms({ status: 'Active' })
      .then((res) => {
        const cls = res.data?.items || [];
        setActiveClassrooms(cls);
        if (cls.length > 0 && !classroomId) {
          setClassroomId(classroomIdFilter || cls[0].id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchDocuments(page);
    fetchClassrooms();
  }, [page, classroomIdFilter]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError('Vui lòng nhập tên tài liệu và chọn tệp đính kèm.');
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('scope', scope === 'classroom' ? 'Classroom' : 'Public');
    if (scope === 'classroom' && classroomId) {
      formData.append('classroomId', classroomId);
      const selectedCls = activeClassrooms.find((c) => String(c.id) === String(classroomId));
      if (selectedCls) {
        if (selectedCls.subjectId) formData.append('subjectId', selectedCls.subjectId);
        if (selectedCls.gradeLevelId) formData.append('gradeLevelId', selectedCls.gradeLevelId);
      }
    }
    formData.append('description', description || '');
    formData.append('file', file);

    try {
      const res = await tutorApi.uploadDocument(formData);
      setMessage(res.data?.message || 'Tải lên tài liệu ôn tập thành công!');
      setTitle('');
      setDescription('');
      setFile(null);
      fetchDocuments(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải lên tài liệu.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    setMessage('');
    setError('');

    try {
      const res = await tutorApi.deleteDocument(id);
      setMessage(res.data?.message || 'Đã xóa tài liệu thành công.');
      fetchDocuments(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tài liệu.');
    }
  };

  return (
    <>
      <style>{`
        .scope-card {
          cursor: pointer;
          background-color: #ffffff !important;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 12px 16px;
          transition: border-color 0.15s ease-in-out;
        }
        .scope-card:hover {
          border-color: #adb5bd;
        }
        .scope-card.is-active {
          border: 2px solid #198754 !important;
          background-color: #ffffff !important;
        }
        .table-docs th {
          font-weight: 600;
          font-size: 0.88rem;
          background-color: #ffffff;
          color: #212529;
          border-bottom: 2px solid #dee2e6;
          vertical-align: middle;
        }
        .table-docs td {
          vertical-align: middle;
          font-size: 0.9rem;
        }
      `}</style>

      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h3 mb-1">Tài liệu ôn tập</h1>
            <p className="text-body-secondary mb-0">Quản lý và phân phối tài liệu ôn tập theo lớp học hoặc công khai cho cộng đồng.</p>
          </div>
          <div>
            <span className="badge border border-success text-success bg-transparent rounded-pill px-3 py-2 fs-6">
              <i className="bi bi-folder2-open me-1"></i>{totalItems} tài liệu
            </span>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
            <i className="bi bi-check-circle me-2"></i>{message}
            <button type="button" className="btn-close" onClick={() => setMessage('')} aria-label="Đóng"></button>
          </div>
        )}

        {error && (
          <div className="alert alert-warning alert-dismissible fade show shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>{error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Đóng"></button>
          </div>
        )}

        {/* Upload form card */}
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-3"><i className="bi bi-cloud-arrow-up me-2 text-success"></i>Tải lên tài liệu mới</h2>

            <form onSubmit={handleUpload}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div
                    className={`scope-card ${scope === 'classroom' ? 'is-active' : ''}`}
                    onClick={() => setScope('classroom')}
                  >
                    <div className="fw-bold text-dark"><i className="bi bi-easel me-2 text-success"></i>Theo lớp học cụ thể</div>
                    <small className="text-secondary">Chỉ học viên trong lớp mới có thể xem và tải tài liệu này.</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div
                    className={`scope-card ${scope === 'public' ? 'is-active' : ''}`}
                    onClick={() => setScope('public')}
                  >
                    <div className="fw-bold text-dark"><i className="bi bi-globe me-2 text-primary"></i>Công khai cho học viên</div>
                    <small className="text-secondary">Tất cả học viên và phụ huynh quan tâm đều có thể tham khảo.</small>
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tên tài liệu / Bài giảng <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Đề cương ôn tập Toán giữa kỳ 1"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {scope === 'classroom' && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Chọn lớp học áp dụng</label>
                    <select
                      className="form-select"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                    >
                      <option value="">-- Tất cả lớp đang dạy --</option>
                      {activeClassrooms.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.subjectName})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Chọn tệp (PDF, Word, PPTX, Excel; tối đa 20 MB) <span className="text-danger">*</span></label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Ghi chú thêm</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Hướng dẫn làm bài, hạn nộp..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success px-4" disabled={uploading}>
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>Đang tải lên...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1"></i> Tải lên tài liệu
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* Documents table section */}
        <section className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-3">Danh sách tài liệu đã đăng</h2>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-folder-x fs-1 text-muted d-block mb-2"></i>
                <p className="mb-0">Bạn chưa tải lên tài liệu nào.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-docs align-middle mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '6%' }}>#</th>
                        <th style={{ width: '40%' }}>Tài liệu</th>
                        <th style={{ width: '25%' }}>Phạm vi / Lớp học</th>
                        <th style={{ width: '15%' }}>Ngày tải</th>
                        <th style={{ width: '14%', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc, idx) => (
                        <tr key={doc.id}>
                          <td className="text-muted small">{(page - 1) * 10 + idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-file-earmark-text text-danger fs-4"></i>
                              <div>
                                <div className="fw-semibold text-dark">{repairMojibake(doc.title)}</div>
                                {doc.fileName && (
                                  <small className="text-muted">{doc.fileName}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {doc.classroomName ? (
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-easel me-1 text-danger"></i>{doc.classroomName}
                              </span>
                            ) : (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                <i className="bi bi-globe me-1"></i>Công khai
                              </span>
                            )}
                          </td>
                          <td className="text-muted small">
                            {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('vi-VN') : ''}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="d-flex justify-content-end align-items-center gap-1">
                              {doc.fileUrl && (
                                <a
                                  href={`/api/tutor/documents/${doc.id}/download`}
                                  className="btn btn-sm btn-outline-success"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <i className="bi bi-download"></i>
                                </a>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(doc.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
        </section>
      </div>
    </>
  );
}
