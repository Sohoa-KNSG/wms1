import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, X, Lock, Unlock } from 'lucide-react';

export default function StockTypeChangeModal({ isOpen, onClose, onSuccess, initialCartons = [] }) {
  const [changeType, setChangeType] = useState('BLOCK'); // 'BLOCK' or 'RELEASE'
  const [reasonCode, setReasonCode] = useState('QUALITY_ISSUE');
  const [cartonIdsInput, setCartonIdsInput] = useState(initialCartons.join('\n'));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const cartonList = cartonIdsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (cartonList.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập ít nhất 1 mã thùng 60 / kiện 360.' });
      setLoading(false);
      return;
    }

    const payload = {
      changeType: changeType,
      newStockType: changeType === 'BLOCK' ? 'BLOCKED' : 'UNRESTRICTED',
      reasonCode: changeType === 'BLOCK' ? reasonCode : 'RELEASE_APPROVED',
      items: cartonList.map((id) => ({ id60: id })),
    };

    const requestId = `REQ-STC-${Date.now()}`;

    try {
      const res = await fetch('/api/v1/stock-type-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || json.status === 'ERROR') {
        throw new Error(json.message || 'Chuyển stock type thất bại.');
      }

      setMessage({ type: 'success', text: json.message || 'Khóa/chuyển stock type thành công.' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '90%', maxWidth: '520px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: changeType === 'BLOCK' ? '#991b1b' : '#047857',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {changeType === 'BLOCK' ? <Lock size={22} /> : <Unlock size={22} />}
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
              {changeType === 'BLOCK' ? 'KHÓA TỒN KHO (UC13 - BLOCK STOCK)' : 'GIẢI KHÓA TỒN (RELEASE STOCK)'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {message && (
            <div style={{
              marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px',
              backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: message.type === 'error' ? '#991b1b' : '#166534',
              border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
              display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'
            }}>
              {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Type Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Hành động thực hiện:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setChangeType('BLOCK')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                  border: changeType === 'BLOCK' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  backgroundColor: changeType === 'BLOCK' ? '#fef2f2' : '#fff',
                  color: changeType === 'BLOCK' ? '#991b1b' : '#475569'
                }}
              >
                🔒 Khóa Tồn (BLOCKED)
              </button>
              <button
                type="button"
                onClick={() => setChangeType('RELEASE')}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
                  border: changeType === 'RELEASE' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  backgroundColor: changeType === 'RELEASE' ? '#f0fdf4' : '#fff',
                  color: changeType === 'RELEASE' ? '#166534' : '#475569'
                }}
              >
                🔓 Giải Khóa (UNRESTRICTED)
              </button>
            </div>
          </div>

          {/* Reason Code Dropdown */}
          {changeType === 'BLOCK' && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Lý do khóa tồn (Reason Code):
              </label>
              <select
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                  fontSize: '0.9rem', outline: 'none'
                }}
              >
                <option value="QUALITY_ISSUE">⚠️ QUALITY_ISSUE - Có sự cố/vấn đề về chất lượng</option>
                <option value="OEM_SURPLUS">📦 OEM_SURPLUS - Dư thừa đơn OEM / dư kế hoạch</option>
                <option value="PARTIAL_REMAINING">✂️ PARTIAL_REMAINING - Thùng lẻ còn lại sau xuất</option>
                <option value="DATA_EXCEPTION">🔍 DATA_EXCEPTION - Sai lệch dữ liệu nghi ngờ</option>
                <option value="WAITING_DECISION">⏳ WAITING_DECISION - Chờ quyết định quản lý</option>
              </select>
            </div>
          )}

          {/* Carton List Input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
              Danh sách Mã Thùng 60 / Mã Kiện 360 (Mỗi dòng 1 mã):
            </label>
            <textarea
              rows={4}
              value={cartonIdsInput}
              onChange={(e) => setCartonIdsInput(e.target.value)}
              placeholder="VD: K07/1/D.555/MT/11/151&#10;K07/1/D.555/GT/L4/21"
              style={{
                width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1',
                fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none',
                backgroundColor: changeType === 'BLOCK' ? '#dc2626' : '#16a34a',
                color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Đang xử lý...' : changeType === 'BLOCK' ? '🔒 Xác Nhận Khóa Tồn' : '🔓 Xác Nhận Giải Khóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
