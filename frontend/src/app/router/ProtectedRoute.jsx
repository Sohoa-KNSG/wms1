import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROUTES } from '../../shared/constants/routes.js';

export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, mustChangePassword, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Đang tải thông tin hệ thống WMS...</p>
      </div>
    );
  }

  // 1. Not Authenticated -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 2. Forced Password Change Protection (P0 Security)
  if (mustChangePassword && location.pathname !== ROUTES.CHANGE_PASSWORD) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }

  // 3. Permission / Capability Protection
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>403 - TRUY CẬP BỊ TỪ CHỐI</h2>
        <p>Tài khoản của bạn không có quyền truy cập vào chức năng này ({requiredPermission}).</p>
        <button
          onClick={() => window.history.back()}
          style={{ padding: '8px 16px', marginTop: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return children;
};
