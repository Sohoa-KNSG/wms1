import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { httpClient } from '../api/httpClient.js';
import { useAuth } from '../app/auth/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../shared/constants/routes.js';

export default function ChangePasswordScreen({ onBack, isForced = false }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePasswordSuccess, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    try {
      // API-01: Dùng httpClient — không gọi fetch(port 3001) trực tiếp
      const response = await httpClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      const data = response.data || response;
      setSuccessMsg(data.message || 'Đổi mật khẩu thành công!');
      // ROUTE-02: Cập nhật auth state, không logout ngay
      changePasswordSuccess();
      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary-glow)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Lock size={32} color="var(--primary-color)" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Đổi mật khẩu</h2>
          {isForced && (
            <p style={{ color: 'var(--warning-color)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Bạn phải đổi mật khẩu trước khi tiếp tục sử dụng hệ thống.
            </p>
          )}
        </div>

        {error && (
          <div className="status-msg status-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {successMsg && (
          <div className="status-msg status-success" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Mật khẩu hiện tại</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={loading || successMsg !== ''}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={loading || successMsg !== ''}
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Xác nhận mật khẩu mới</label>
            <div style={{ position: 'relative' }}>
              <CheckCircle2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="input-field" 
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                style={{ paddingLeft: '2.5rem' }}
                required
                disabled={loading || successMsg !== ''}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {!isForced && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
                onClick={onBack}
                disabled={loading || successMsg !== ''}
              >
                Hủy bỏ
              </button>
            )}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 2 }}
              disabled={loading || successMsg !== ''}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
