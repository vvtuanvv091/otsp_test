import React, { useEffect, useMemo, useState } from 'react';
import adminApi from '../../api/adminApi';
import { AdminFeedback, AdminPageHeader } from './AdminPageShared';

const emptyForm = { id: null, code: '', name: '', description: '' };

export default function AdminCatalogPage() {
  const [tab, setTab] = useState('subjects');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const request = tab === 'subjects' ? adminApi.getSubjects() : adminApi.getGradeLevels();
    request.then((response) => { if (active) setItems(response.data || []); })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Không tải được danh mục.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, reload]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('vi');
    if (!term) return items;
    return items.filter((item) => `${item.code} ${item.name} ${item.description || ''}`.toLocaleLowerCase('vi').includes(term));
  }, [items, search]);

  const resetForm = () => setForm(emptyForm);
  const startEdit = (item) => {
    setForm({ id: item.id, code: item.code, name: item.name, description: item.description || '' });
    setError('');
    setMessage('');
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = { code: form.code.trim(), name: form.name.trim(), description: form.description.trim() || null };
    if (!payload.code || !payload.name) { setError('Nhập mã và tên danh mục.'); return; }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (tab === 'subjects') {
        if (form.id) await adminApi.updateSubject(form.id, payload);
        else await adminApi.createSubject(payload);
      } else if (form.id) await adminApi.updateGradeLevel(form.id, payload);
      else await adminApi.createGradeLevel(payload);
      setMessage(form.id ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
      resetForm();
      setReload((value) => value + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể lưu danh mục.');
    } finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Xóa ${tab === 'subjects' ? 'môn học' : 'cấp học'} “${item.name}”? Thao tác này chỉ thực hiện khi danh mục chưa được sử dụng.`)) return;
    setDeletingId(item.id);
    setError('');
    setMessage('');
    try {
      if (tab === 'subjects') await adminApi.deleteSubject(item.id);
      else await adminApi.deleteGradeLevel(item.id);
      setMessage('Đã xóa danh mục.');
      if (form.id === item.id) resetForm();
      setReload((value) => value + 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không thể xóa danh mục.');
    } finally { setDeletingId(null); }
  };

  const label = tab === 'subjects' ? 'môn học' : 'cấp học';

  return (
    <div className="admin-page">
      <AdminPageHeader title="Môn học / Cấp học" description="Quản lý danh mục dùng chung cho hồ sơ gia sư, yêu cầu kết nối, lớp học và tài liệu." />
      <AdminFeedback error={error} message={message} onDismiss={() => { setError(''); setMessage(''); }} />

      <div className="admin-catalog-tabs" role="tablist" aria-label="Loại danh mục">
        <button type="button" role="tab" aria-selected={tab === 'subjects'} className={tab === 'subjects' ? 'active' : ''} onClick={() => { setTab('subjects'); resetForm(); }}>Môn học</button>
        <button type="button" role="tab" aria-selected={tab === 'grades'} className={tab === 'grades' ? 'active' : ''} onClick={() => { setTab('grades'); resetForm(); }}>Cấp học</button>
      </div>

      <form className="admin-catalog-editor" onSubmit={save}>
        <div className="admin-catalog-editor-heading"><strong>{form.id ? `Sửa ${label}` : `Thêm ${label}`}</strong>{form.id && <button type="button" className="admin-text-button" onClick={resetForm}>Hủy sửa</button>}</div>
        <div className="admin-catalog-form-grid">
          <label>Mã danh mục<input required minLength="2" maxLength="20" value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder={tab === 'subjects' ? 'Ví dụ: TOAN' : 'Ví dụ: THCS'} /></label>
          <label>Tên hiển thị<input required minLength="2" maxLength="100" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={`Tên ${label}`} /></label>
          {tab === 'subjects' && <label className="admin-catalog-description">Mô tả<textarea maxLength="1000" rows="2" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả tùy chọn" /></label>}
          <button className="admin-action is-approve admin-save-button" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : form.id ? 'Lưu thay đổi' : `Thêm ${label}`}</button>
        </div>
      </form>

      <div className="admin-toolbar admin-catalog-toolbar">
        <label className="admin-search"><i className="bi bi-search" aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Tìm ${label} theo mã hoặc tên…`} /></label>
        <span className="admin-catalog-total">{filteredItems.length} mục</span>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">Danh sách {label} <span className="admin-count">{items.length}</span></div>
        <div className="admin-table-scroll"><table className="admin-table">
          <thead><tr><th>Mã</th><th>Tên</th>{tab === 'subjects' && <th>Mô tả</th>}<th>Đang được dùng</th><th>Thao tác</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={tab === 'subjects' ? 5 : 4} className="admin-table-state">Đang tải danh mục…</td></tr> : filteredItems.length === 0 ? <tr><td colSpan={tab === 'subjects' ? 5 : 4} className="admin-table-state">Không có danh mục phù hợp.</td></tr> : filteredItems.map((item) => (
              <tr key={item.id}>
                <td><code>{item.code}</code></td>
                <td><span className="admin-table-primary">{item.name}</span></td>
                {tab === 'subjects' && <td className="admin-catalog-description-cell">{item.description || '—'}</td>}
                <td>{item.usageCount}</td>
                <td><div className="admin-actions-inline"><button type="button" className="admin-action" onClick={() => startEdit(item)}>Sửa</button><button type="button" className="admin-action" disabled={deletingId === item.id} onClick={() => remove(item)}>{deletingId === item.id ? 'Đang xóa…' : 'Xóa'}</button></div></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </section>

      <aside className="admin-note is-warning"><i className="bi bi-shield-check" aria-hidden="true" /><div><strong>Giữ an toàn dữ liệu</strong>Danh mục đang được hồ sơ, yêu cầu, lớp học hoặc tài liệu sử dụng sẽ không thể xóa. Có thể sửa tên/mã để dữ liệu lịch sử vẫn giữ liên kết.</div></aside>
    </div>
  );
}
