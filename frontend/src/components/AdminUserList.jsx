import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Plus, UserCheck, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { adminApi } from '../features/administration/api/adminApi.js';
import './ChangePasswordScreen.css';

const AVAILABLE_ROLES = [
  { id: 'IT_ADMIN', name: 'Quản trị hệ thống' },
  { id: 'THU_KHO', name: 'Thủ kho' },
  { id: 'NHAN_VIEN', name: 'Nhân viên kho' }
];

export default function AdminUserList({ onBack }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // States for Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // States for Create User Form
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRoles, setNewRoles] = useState([]);

  // States for Update Role Form
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers();
      const listData = res?.data !== undefined ? res.data : res;

      if (Array.isArray(listData)) {
        setUsers(listData);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng:", err);
      setError(err.message || 'Không thể đọc danh sách người dùng từ máy chủ.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername || !newFullName) {
      setError('Vui lòng nhập đầy đủ tài khoản và họ tên.');
      return;
    }
    try {
      setLoading(true);
      await adminApi.createUser({
        username: newUsername,
        fullName: newFullName,
        roles: newRoles
      });
      setSuccess(`Tạo tài khoản ${newUsername} thành công! Mật khẩu mặc định: 123456`);
      setShowCreateModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewRoles([]);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo người dùng.');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminApi.updateUserStatus(userId, { is_active: !currentStatus });
      setSuccess('Cập nhật trạng thái người dùng thành công.');
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái.');
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUserId(user.user_id || user.id);
    setSelectedRoles(user.roles || []);
    setShowRoleModal(true);
  };

  const handleUpdateRoles = async () => {
    try {
      await adminApi.updateUserRoles(selectedUserId, { roles: selectedRoles });
      setSuccess('Phân quyền người dùng thành công.');
      setShowRoleModal(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật phân quyền.');
    }
  };

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`Xác nhận reset mật khẩu người dùng ${username} về mặc định 123456?`)) return;
    try {
      await adminApi.resetPassword({ userId });
      setSuccess(`Reset mật khẩu cho ${username} thành công. Mật khẩu mới: 123456`);
    } catch (err) {
      setError(err.message || 'Lỗi reset mật khẩu.');
    }
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={18} /> Quay lại
              </button>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Quản Lý Người Dùng & Phân Quyền (UC23)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={fetchUsers} className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={16} /> Tải lại
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Tạo người dùng
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px', color: '#dc2626', background: '#fee2e2', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '12px', color: '#15803d', background: '#dcfce7', borderRadius: '6px', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải danh sách tài khoản người dùng...</div>}

        {!loading && (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>TÀI KHOẢN</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>HỌ VÀ TÊN</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>VAI TRÒ (ROLES)</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '12px', textAlign: 'right', backgroundColor: '#f8fafc' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      Chưa có tài khoản người dùng nào được tạo.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id || u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b' }}>{u.username}</td>
                      <td style={{ padding: '12px', color: '#475569' }}>{u.full_name || u.fullName || u.username}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(u.roles || []).map((r, idx) => (
                            <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: '#e0e7ff', color: '#3730a3' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: u.is_active ? '#dcfce7' : '#fee2e2', color: u.is_active ? '#15803d' : '#b91c1c' }}>
                          {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button onClick={() => handleOpenRoleModal(u)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                            Phân quyền
                          </button>
                          <button onClick={() => handleToggleStatus(u.user_id || u.id, u.is_active)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}>
                            {u.is_active ? 'Khóa' : 'Mở khóa'}
                          </button>
                          <button onClick={() => handleResetPassword(u.user_id || u.id, u.username)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', color: '#b91c1c' }}>
                            Reset MK
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tạo Người Dùng */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', width: '420px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Tạo Người Dùng Mới</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>TÀI KHOẢN (USERNAME)</label>
              <input type="text" className="input-field" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>HỌ VÀ TÊN</label>
              <input type="text" className="input-field" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleCreateUser} style={{ padding: '8px 16px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Tạo người dùng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Phân Quyền */}
      {showRoleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', width: '420px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Phân Quyền Vai Trò</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {AVAILABLE_ROLES.map((r) => (
                <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRoles([...selectedRoles, r.id]);
                      else setSelectedRoles(selectedRoles.filter(role => role !== r.id));
                    }}
                  />
                  <span>{r.name} ({r.id})</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setShowRoleModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleUpdateRoles} style={{ padding: '8px 16px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Lưu vai trò</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
