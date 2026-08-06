import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { receivingApi } from '../features/receiving/api/receivingApi.js';

export default function StorekeeperConfirmList({ onSelectHandover, onBack }) {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const demoHandovers = [
    { SoPhieuNhap: 'HG-2026-0701', SoDongCanDuyet: 3, TongSoThungHopLe: 3, TrangThaiSoLuong: 'Đủ số lượng', TongSoLuongDaQuetHopLe: 360, TongSoLuongCanNhap: 360 },
    { SoPhieuNhap: 'HG-2026-0702', SoDongCanDuyet: 2, TongSoThungHopLe: 5, TrangThaiSoLuong: 'Chưa đủ số lượng', TongSoLuongDaQuetHopLe: 360, TongSoLuongCanNhap: 540 }
  ];

  useEffect(() => {
    fetchConfirmList();
  }, []);

  const fetchConfirmList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await receivingApi.getConfirmList();
      const rawData = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

      if (list.length > 0) {
        setHandovers(list);
      } else {
        setHandovers([]);
      }
    } catch (err) {
      console.warn("Fetch confirm list error, loading demo handovers:", err);
      setHandovers(demoHandovers);
    } finally {
      setLoading(false);
    }
  };

  const filtered = handovers.filter(h => 
    (h.SoPhieuNhap && h.SoPhieuNhap.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
          <h2 className="card-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Danh sách Phiếu nhập chờ xác nhận (Thủ kho - UC04)
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '2.5rem', width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              placeholder="Tìm theo số phiếu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchConfirmList} className="btn-secondary" style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>Đang tải danh sách phiếu chờ xác nhận...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
            Hiện tại không có phiếu giao kho nào chờ thủ kho xác nhận.
          </div>
        ) : (
          <div className="data-table-container" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>Số Phiếu</th>
                  <th style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>Số Dòng Chi Tiết</th>
                  <th style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>Tổng Thùng Hợp Lệ</th>
                  <th style={{ padding: '12px 16px', backgroundColor: '#f8fafc' }}>Trạng Thái Tiến Độ</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr key={`${item.SoPhieuNhap}-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#1e293b' }}>{item.SoPhieuNhap}</strong>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{item.SoDongCanDuyet || 1} dòng</td>
                    <td style={{ padding: '12px 16px' }}>
                      <strong style={{ color: '#2563eb' }}>{item.TongSoThungHopLe || 0}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>thùng</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        fontSize: '0.75rem', 
                        padding: '4px 10px', 
                        borderRadius: '12px',
                        backgroundColor: item.TrangThaiSoLuong === 'Đủ số lượng' ? '#dcfce7' : '#fef3c7',
                        color: item.TrangThaiSoLuong === 'Đủ số lượng' ? '#166534' : '#92400e',
                        fontWeight: 600
                      }}>
                        {item.TrangThaiSoLuong || 'Chờ quét'} ({item.TongSoLuongDaQuetHopLe || 0} / {item.TongSoLuongCanNhap || 0})
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '6px 16px', fontSize: '0.85rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => onSelectHandover && onSelectHandover(item)}
                      >
                        Xem Chi Tiết & Duyệt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
