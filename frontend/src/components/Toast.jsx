import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';

export default function Toast({ type = 'info', message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { bg: '#ecfdf5', border: '#10b981', color: '#065f46', icon: <CheckCircle2 size={20} color="#10b981" /> };
      case 'error':
        return { bg: '#fef2f2', border: '#ef4444', color: '#991b1b', icon: <AlertCircle size={20} color="#ef4444" /> };
      case 'warning':
        return { bg: '#fffbe6', border: '#f59e0b', color: '#92400e', icon: <AlertTriangle size={20} color="#f59e0b" /> };
      default:
        return { bg: '#eff6ff', border: '#3b82f6', color: '#1e40af', icon: <CheckCircle2 size={20} color="#3b82f6" /> };
    }
  };

  const style = getToastStyle();

  return (
    <div 
      role="status"
      aria-live="polite"
      style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1.25rem',
      backgroundColor: style.bg,
      borderLeft: `4px solid ${style.border}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      color: style.color,
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {style.icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{message}</span>
      <button 
        onClick={onClose}
        aria-label="Đóng"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          color: style.color,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
