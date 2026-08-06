import React, { useState, useEffect } from 'react';
import { PackageOpen, ArrowRight, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { receivingApi } from '../features/receiving/api/receivingApi.js';
import ReceiptDetail from './ReceiptDetail.jsx';
import ScanScreen from './ScanScreen.jsx';

export default function ReceiptList({ onSelect, onLogout, onBack }) {
  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Drilldown Navigation
  const [selectedHandoverNo, setSelectedHandoverNo] = useState(null);
  const [selectedProductLine, setSelectedProductLine] = useState(null);

  const fetchHandovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await receivingApi.getAllHandovers();
      const rawData = res?.data !== undefined ? res.data : res;

      if (Array.isArray(rawData)) {
        const normalized = rawData.map((item) => ({
          handover_no: item.SoPhieuNhap || item.handover_no || item.SoPhieu || 'PN-N/A',
          handover_date: item.NgayNhap ? String(item.NgayNhap).split('T')[0] : item.NgayTao ? String(item.NgayTao).split('T')[0] : (item.handover_date || item.NgayGiao || 'Hôm nay'),
          status: item.TrangThaiPhieu || item.TrangThai || item.status || 'NEW',
          production_area: item.DonViNguon || item.PhanXuong || item.production_area || item.XuongSanXuat || 'Phân Xưởng Sản Xuất',
          items_count: Number(item.SoDongChiTiet || item.TongSoDong || item.items_count || item.SoDong || 1),
          total_qty: Number(item.TongSoLuongNhap || item.total_qty || 0),
          raw: item
        }));
        setHandovers(normalized);
      } else {
        setHandovers([]);
      }
    } catch (err) {
      console.error("Lỗi đọc dữ liệu phiếu nhập từ View [vw_WMS_PhieuNhapKhoTP_Tong]:", err);
      setError(err.message || "Không thể tải danh sách phiếu giao kho từ CSDL ERP [vw_WMS_PhieuNhapKhoTP_Tong]");
      setHandovers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandovers();
  }, [onLogout]);

  const handleSelectHandover = (handoverNo) => {
    if (onSelect) {
      onSelect(handoverNo);
    }
    setSelectedHandoverNo(handoverNo);
  };

  // If scanning screen is active:
  if (selectedHandoverNo && selectedProductLine) {
    return (
      <ScanScreen
        handoverNo={selectedHandoverNo}
        lineNo={selectedProductLine.handover_line_no || selectedProductLine.id}
        productCode={selectedProductLine.product_code}
        onBack={() => setSelectedProductLine(null)}
      />
    );
  }

  // If detail screen is active:
  if (selectedHandoverNo) {
    return (
      <ReceiptDetail
        handoverNo={selectedHandoverNo}
        onBack={() => setSelectedHandoverNo(null)}
        onSelectProduct={(line) => setSelectedProductLine(line)}
      />
    );
  }

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
          <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.25rem', fontWeight: 700 }}>
            Danh sách phiếu giao kho (UC02) - CSDL ERP [vw_WMS_PhieuNhapKhoTP_Tong]
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={fetchHandovers} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={16} /> Tải lại
          </button>
          <span className="badge badge-new" style={{ background: '#2563eb', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
            {handovers.length} Phiếu
          </span>
        </div>
      </div>
      
      <p className="card-text" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
        Dữ liệu được nạp trực tiếp từ CSDL ERP [WMS1].[dbo].[vw_WMS_PhieuNhapKhoTP_Tong]. Chọn phiếu giao kho để xem chi tiết và gán đơn OEM.
      </p>
      
      {loading && <div className="text-center mt-4" style={{ padding: '2rem', color: '#64748b' }}>Đang nạp dữ liệu phiếu nhập từ CSDL [vw_WMS_PhieuNhapKhoTP_Tong]...</div>}
      
      {error && (
        <div className="status-msg status-error mt-4" style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Tìm mã phiếu giao kho (ví dụ: HG-2026 hoặc PN-)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '0 1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {handovers.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                Chưa có bản ghi phiếu giao kho nào trong CSDL [WMS1].[dbo].[vw_WMS_PhieuNhapKhoTP_Tong].
              </div>
            ) : (
              handovers
                .filter(item => (item.handover_no || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, idx) => (
                <div 
                  key={item.handover_no || idx} 
                  className="card" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '1.25rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => handleSelectHandover(item.handover_no)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.875rem', backgroundColor: '#dbeafe', borderRadius: '8px', color: '#2563eb' }}>
                      <PackageOpen size={28} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, color: '#1e293b' }}>{item.handover_no}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        {item.production_area || 'Phân Xưởng Sản Xuất'} • {item.items_count || 1} dòng chi tiết • Ngày: {item.handover_date || 'Hôm nay'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="badge" style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: item.status === 'COMPLETED' ? '#dcfce7' : item.status === 'IN_PROGRESS' ? '#fef3c7' : '#e0f2fe',
                      color: item.status === 'COMPLETED' ? '#15803d' : item.status === 'IN_PROGRESS' ? '#b45309' : '#0369a1'
                    }}>
                      {item.status || 'NEW'}
                    </span>
                    <ArrowRight size={20} color="#2563eb" />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
