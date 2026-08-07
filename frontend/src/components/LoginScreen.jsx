import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../app/auth/AuthContext.jsx';
import { ROUTES } from '../shared/constants/routes.js';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    try {
      const response = await login(cleanUsername, password);
      const resData = response.data || response;
      if (resData.user && resData.user.must_change_password) {
        navigate(ROUTES.CHANGE_PASSWORD);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      // SEC-03: Không dùng demo fallback. Hiển thị lỗi thật từ API.
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '1rem'
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.webp" alt="WMS Logo" className="logo-img" style={{ maxHeight: '64px', marginBottom: '0.5rem' }} />
          <h2 style={{ marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            ĐĂNG NHẬP WMS
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Hệ thống kho thành phẩm v5.0</p>
        </div>

        {error && (
          <div className="status-msg status-error" style={{ marginBottom: '1.5rem', color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              TÀI KHOẢN
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                style={{ width: '100%', paddingLeft: '3rem', height: '44px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              MẬT KHẨU
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={20}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="123456"
                style={{ width: '100%', paddingLeft: '3rem', height: '44px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', height: '46px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem' }}
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
          Liên hệ quản trị viên nếu quên mật khẩu.
        </div>
      </div>
    </div>
  );
}
