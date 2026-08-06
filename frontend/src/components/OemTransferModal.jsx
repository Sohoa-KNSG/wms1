import React, { useState, useEffect } from 'react';
import { X, RefreshCw, QrCode, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { oemApi } from '../features/oem/api/oemApi.js';
import { packingApi } from '../features/packing/api/packingApi.js';

export default function OemTransferModal({ isOpen, onClose, onSuccess }) {
  const [pack360Id, setPack360Id] = useState('');
  const [targetOemOrderNo, setTargetOemOrderNo] = useState('');
  const [targetOemBatchNo, setTargetOemBatchNo] = useState('1');
  const [reason, setReason] = useState('');
  
  const [packInfo, setPackInfo] = useState(null);
  const [oemOrders, setOemOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (isOpen) {
      fetchOemOrders();
      setPack360Id('');
      setTargetOemOrderNo('');
      setReason('');
      setPackInfo(null);
      setMsg({ text: '', type: '' });
    }
  }, [isOpen]);

  const fetchOemOrders = async () => {
    try {
      const res = await oemApi.getOrders();
      const data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data)) {
        setOemOrders(data);
      }
    } catch (e) {
      console.error('Error loading OEM orders:', e);
    }
  };

  const handleCheckPack = async () => {
    if (!pack360Id.trim()) {
      setMsg({ text: 'Vui lòng nhập Mã QR / ID Kiện 360.', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg({ text: '', type: '' });
    try {
      const res = await packingApi.getPackInfo(pack360Id.trim());
      const data = res?.data !== undefined ? res.data : res;
      setPackInfo(data);
      setMsg({ 
        text: `Đã tìm thấy Kiện ${data.pack360_id || pack360Id} (Đơn hiện tại: ${data.oem_order_no || 'Chưa gán'}, Trạng thái: ${data.status || 'ACTIVE'})`, 
        type: 'success' 
      });
    } catch (err) {
      setPackInfo(null);
      setMsg({ text: err.message || 'Không tìm thấy Kiện 360.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pack360Id.trim() || !targetOemOrderNo.trim()) {
      setMsg({ text: 'Vui lòng nhập đầy đủ Mã Kiện 360 và Mã Đơn OEM Mới.', type: 'error' });
      return;
    }

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const res = await packingApi.transferOrder({
        pack360_id: pack360Id.trim(),
        target_oem_order_no: targetOemOrderNo.trim(),
        target_oem_batch_no: parseInt(targetOemBatchNo) || 1,
        reason: reason.trim()
      });

      const message = res?.message || 'Chuyển đơn hàng OEM thành công.';
      setMsg({ text: message, type: 'success' });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setMsg({ text: err.message || 'Lỗi chuyển đơn OEM.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: '520px', backgroundColor: '#fff',
        borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden', padding: '0'
      }}>
        {/* Header Modal */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0284c7',
          color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RefreshCw size={22} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Chuyển Đơn OEM Cho Kiện Pack360</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          
          {msg.text && (
            <div style={{
              marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: msg.type === 'error' ? '#991b1b' : '#166534',
              border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`
            }}>
              {msg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Step 1: Input Pack360 */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155', fontSize: '0.875rem' }}>
              1. Mã QR / ID Kiện 360 Cần Chuyển:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <QrCode size={18} style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Quét hoặc nhập mã Pack360..."
                  value={pack360Id}
                  onChange={(e) => setPack360Id(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={handleCheckPack}
                disabled={loading}
                className="btn btn-secondary"
                style={{ flex: 'none', backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
              >
                Kiểm Tra
              </button>
            </div>
          </div>

          {/* Pack Info Card */}
          {packInfo && (
            <div style={{
              padding: '0.875rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
              marginBottom: '1.25rem', fontSize: '0.875rem'
            }}>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Kiện: {packInfo.pack360.pack360_id}</div>
              <div>Đơn hiện tại: <strong>{packInfo.pack360.oem_order_no || 'Chưa gán đơn'}</strong></div>
              <div>Trạng thái vật lý: <span style={{ color: '#0284c7', fontWeight: 600 }}>{packInfo.pack360.status}</span></div>
              <div>Số lượng thùng 60 thành phần: <strong>{packInfo.units ? packInfo.units.length : 0} thùng</strong></div>
            </div>
          )}

          {/* Step 2: Target OEM Order */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155', fontSize: '0.875rem' }}>
              2. Chọn Đơn Hàng OEM Mới:
            </label>
            <select
              className="input-field"
              value={targetOemOrderNo}
              onChange={(e) => setTargetOemOrderNo(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              <option value="">-- Chọn đơn OEM khả dụng --</option>
              {oemOrders.map((ord, idx) => (
                <option key={idx} value={ord.oem_order_no}>
                  {ord.oem_order_no} | SP: {ord.product_code} (KH: {ord.customer_name || 'N/A'})
                </option>
              ))}
            </select>
            <input
              type="text"
              className="input-field"
              placeholder="Hoặc nhập mã đơn OEM mới thủ công..."
              value={targetOemOrderNo}
              onChange={(e) => setTargetOemOrderNo(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Step 3: Reason */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155', fontSize: '0.875rem' }}>
              3. Lý Do Chuyển Đơn OEM:
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Nhập lý do (ví dụ: Chuyển đơn theo yêu cầu Kế hoạch)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowRight size={18} /> {loading ? 'Đang xử lý...' : 'Xác Nhận Chuyển Đơn OEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
