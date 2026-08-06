import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Box, Scissors } from 'lucide-react';
import { packingApi } from '../features/packing/api/packingApi.js';

export default function DetachCartonsScreen({ onBack }) {
  const [detachPackId, setDetachPackId] = useState('');
  const [detachUnits, setDetachUnits] = useState([]);
  const [selectedDetachUnitIds, setSelectedDetachUnitIds] = useState([]);
  const [detachReason, setDetachReason] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchDetachPack = async (e) => {
    e.preventDefault();
    if (!detachPackId.trim()) return;

    try {
      setStatusMsg({ text: 'Đang tải thông tin kiện...', type: 'info' });
      const res = await packingApi.getPackInfo(detachPackId.trim());
      const data = res?.data !== undefined ? res.data : res;
      
      if (data.status && data.status !== 'COMPLETED') {
        setDetachUnits([]);
        setSelectedDetachUnitIds([]);
        setStatusMsg({ text: `Kiện 360 đang ở trạng thái ${data.status}. Chỉ có thể tách thùng từ kiện COMPLETED.`, type: 'error' });
      } else {
        setDetachUnits(data.units || []);
        setSelectedDetachUnitIds([]);
        setStatusMsg({ text: `Đã tải thông tin kiện. Chọn các thùng cần tách.`, type: 'success' });
      }
    } catch (error) {
      setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
      setDetachUnits([]);
    }
  };

  const toggleDetachUnit = (id_60) => {
    setSelectedDetachUnitIds(prev => 
      prev.includes(id_60) ? prev.filter(id => id !== id_60) : [...prev, id_60]
    );
  };

  const handleDetachSubmit = async () => {
    if (selectedDetachUnitIds.length === 0) {
      setStatusMsg({ text: 'Vui lòng chọn ít nhất 1 thùng để tách.', type: 'error' });
      return;
    }
    if (!detachReason.trim()) {
      setStatusMsg({ text: 'Vui lòng nhập lý do tách thùng.', type: 'error' });
      return;
    }

    try {
      setStatusMsg({ text: 'Đang tách thùng...', type: 'info' });
      
      const res = await packingApi.detachUnits({
        pack360_id: detachPackId.trim(),
        unit_ids: selectedDetachUnitIds,
        reason: detachReason.trim()
      });

      setStatusMsg({ text: res?.message || 'Tách thùng 60 khỏi Kiện 360 thành công.', type: 'success' });
      setDetachUnits([]);
      setSelectedDetachUnitIds([]);
      setDetachReason('');
      setDetachPackId('');
      inputRef.current?.focus();
    } catch (error) {
      setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', color: '#64748b', backgroundColor: '#f1f5f9' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontSize: '1.5rem', fontWeight: 600 }}>
          <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <Scissors size={24} color="#ef4444" />
          </div>
          Tách Thùng 60 (UC09)
        </h2>
      </div>

      {/* Search Form */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <form onSubmit={fetchDetachPack} style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Box size={20} style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Quét mã QR hoặc nhập ID Pack360 (Vd: P360-xxxx)..."
              value={detachPackId}
              onChange={(e) => setDetachPackId(e.target.value)}
              style={{ width: '100%', padding: '14px 14px 14px 48px', fontSize: '1rem', border: '2px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
          <button type="submit" style={{ padding: '0 24px', fontSize: '1rem', fontWeight: 600, background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => e.target.style.background = '#334155'}
            onMouseLeave={(e) => e.target.style.background = '#1e293b'}
          >
            TÌM KIỆN
          </button>
        </form>
      </div>

      {/* Status Message */}
      {statusMsg.text && (
        <div style={{ 
          padding: '16px', marginBottom: '24px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 500,
          background: statusMsg.type === 'error' ? '#fef2f2' : statusMsg.type === 'success' ? '#f0fdf4' : statusMsg.type === 'warning' ? '#fffbeb' : '#f0f9ff', 
          color: statusMsg.type === 'error' ? '#991b1b' : statusMsg.type === 'success' ? '#166534' : statusMsg.type === 'warning' ? '#92400e' : '#075985', 
          border: `1px solid ${statusMsg.type === 'error' ? '#fecaca' : statusMsg.type === 'success' ? '#bbf7d0' : statusMsg.type === 'warning' ? '#fde68a' : '#bae6fd'}` 
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Detach Form */}
      {detachUnits.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#334155', fontSize: '1.1rem' }}>Chọn các thùng cần tách khỏi kiện</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            {detachUnits.map(unit => (
              <label key={unit.id_60} style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', 
                background: selectedDetachUnitIds.includes(unit.id_60) ? '#eff6ff' : '#fff', 
                borderRadius: '8px', 
                border: selectedDetachUnitIds.includes(unit.id_60) ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="checkbox" 
                  checked={selectedDetachUnitIds.includes(unit.id_60)} 
                  onChange={() => toggleDetachUnit(unit.id_60)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3b82f6' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 600, color: '#1e293b' }}>{unit.qr_60 || unit.id_60}</span>
                  {unit.target_oem_order_no && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>OEM: {unit.target_oem_order_no}</span>}
                </div>
              </label>
            ))}
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>Lý do tách thùng (Bắt buộc):</label>
            <input
              type="text"
              placeholder="Ghi rõ lý do (VD: Hàng lỗi, sai mã, rách bao bì...)"
              value={detachReason}
              onChange={(e) => setDetachReason(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', border: '2px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#ef4444'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>

          <button 
            type="button" 
            onClick={handleDetachSubmit}
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 700, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
            onMouseLeave={(e) => e.target.style.background = '#ef4444'}
          >
            <Scissors size={20} />
            XÁC NHẬN TÁCH THÙNG
          </button>
        </div>
      )}
    </div>
  );
}
