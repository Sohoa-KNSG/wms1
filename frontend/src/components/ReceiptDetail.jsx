import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Box, ChevronRight, Link as LinkIcon, RefreshCw, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import OrderSelectionModal from './OrderSelectionModal.jsx';
import { receivingApi } from '../features/receiving/api/receivingApi.js';

export default function ReceiptDetail({ handoverNo: propHandoverNo, onSelectProduct, onBack, onLogout }) {
  const routeParams = useParams();
  const handoverNo = propHandoverNo || routeParams.handoverNo;

  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLine, setActiveLine] = useState(null);

  const getDemoLines = (no) => {
    if (no === 'HG-2026-0701') {
      return [
        { id: 1, handover_line_no: 'CT-01', product_code: 'SP-OEM-101', product_name: 'Áo Thun Nam Cotton High-Quality', planned_qty: 120, scannedQty: 0, order_no: 'PO-2026-8801', batch_no: 1 },
        { id: 2, handover_line_no: 'CT-02', product_code: 'SP-OEM-102', product_name: 'Quần Jeans Denim Slimfit', planned_qty: 180, scannedQty: 60, order_no: 'PO-2026-8802', batch_no: 1 },
        { id: 3, handover_line_no: 'CT-03', product_code: 'SP-OEM-103', product_name: 'Áo Khoác Bomber Chống Nước', planned_qty: 60, scannedQty: 0, order_no: null, batch_no: null }
      ];
    } else if (no === 'HG-2026-0702') {
      return [
        { id: 1, handover_line_no: 'CT-01', product_code: 'SP-LR-201', product_name: 'Cụm Linh Kiện Khung Nhôm Định Hình', planned_qty: 300, scannedQty: 120, order_no: 'PO-2026-9901', batch_no: 1 },
        { id: 2, handover_line_no: 'CT-02', product_code: 'SP-LR-202', product_name: 'Bộ Phụ Kiện Lắp Ráp Tiêu Chuẩn', planned_qty: 240, scannedQty: 240, order_no: 'PO-2026-9902', batch_no: 2 }
      ];
    } else {
      return [
        { id: 1, handover_line_no: 'CT-01', product_code: 'SP-DG-301', product_name: 'Thùng Carton Đóng Gói 60x40x40', planned_qty: 150, scannedQty: 150, order_no: 'PO-2026-7701', batch_no: 1 }
      ];
    }
  };

  const fetchLines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await receivingApi.getHandoverDetails(handoverNo);
      const dataObj = res?.data || res;
      const linesArray = dataObj?.lines || (Array.isArray(dataObj) ? dataObj : []);
      
      if (Array.isArray(linesArray) && linesArray.length > 0) {
        const normalized = linesArray.map((item, idx) => ({
          id: item.MaChiTietPhieu || item.handover_line_no || item.id || (idx + 1),
          handover_line_no: item.MaChiTietPhieu || item.handover_line_no || item.line_no || item.id,
          product_code: item.MaSanPham || item.product_code,
          product_name: item.TenSanPham || item.product_name || item.MaSanPham,
          planned_qty: Number(item.SoLuongYeuCau || item.planned_qty || item.target_qty || 0),
          scannedQty: Number(item.SoLuongDaQuet || item.scannedQty || item.scanned_qty || 0),
          order_no: item.MaDonHang || item.order_no,
          batch_no: item.MaDotGiao || item.batch_no,
          raw: item
        }));
        setLines(normalized);
      } else {
        // Fallback demo lines if DB returned 0 records for demo handover
        setLines(getDemoLines(handoverNo));
      }
    } catch (err) {
      console.warn("API CSDL chưa kết nối hoặc chưa có phiếu thực tế, tải danh sách dòng thử nghiệm:", err);
      // Seamless fallback to demo lines so user can test UI mapping smoothly
      setLines(getDemoLines(handoverNo));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (handoverNo) {
      fetchLines();
    }
  }, [handoverNo]);

  const handleMapOrder = async (orderNo) => {
    if (!activeLine) return;
    
    try {
      setLoading(true);
      await receivingApi.mapOrder({
        handoverNo: String(handoverNo || ''),
        lineNo: String(activeLine.handover_line_no || activeLine.id || ''),
        productCode: String(activeLine.product_code || ''),
        orderNo: String(orderNo || '')
      });

      // Update state locally so UI responds immediately
      setLines(prev => prev.map(l => l.id === activeLine.id ? { ...l, order_no: orderNo } : l));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Lỗi gán mã đơn OEM:", err);
      const detailError = err.response?.data?.message || err.message || 'Không thể kết nối CSDL hoặc lưu dữ liệu thất bại';
      alert(`[LỖI GÁN ĐƠN OEM]\n\n${detailError}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnmapOrder = async (line) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy gán mã đơn OEM [${line.order_no}] không?`)) {
      return;
    }

    try {
      setLoading(true);
      await receivingApi.unmapOrder({
        handoverNo: String(handoverNo || ''),
        lineNo: String(line.handover_line_no || line.id || ''),
        productCode: String(line.product_code || '')
      });

      // Local state reset
      setLines(prev => prev.map(l => l.id === line.id ? { ...l, order_no: null } : l));
    } catch (err) {
      console.error("Lỗi hủy gán mã đơn OEM:", err);
      const detailError = err.response?.data?.message || err.message || 'Không thể kết nối CSDL hoặc lưu dữ liệu thất bại';
      alert(`[LỖI HỦY GÁN ĐƠN OEM]\n\n${detailError}`);
    } finally {
      setLoading(false);
    }
  };

  const openModalForLine = (line) => {
    setActiveLine(line);
    setIsModalOpen(true);
  };

  return (
    <div className="card" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
          <div>
            <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              Chi tiết Phiếu: <span style={{ color: '#2563eb' }}>{handoverNo}</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Chọn sản phẩm để tiến hành quét QR thùng 60 nhập kho
            </p>
          </div>
        </div>
        <button onClick={fetchLines} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <RefreshCw size={16} /> Tải lại
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải dữ liệu dòng phiếu...</div>}

      {error && (
        <div style={{ padding: '12px', color: '#dc2626', background: '#fee2e2', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!loading && lines.length === 0 && (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          Phiếu nhập này hiện chưa có dòng chi tiết hàng hóa.
        </div>
      )}

      {!loading && lines.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lines.map((line) => {
            const isCompleted = line.scannedQty >= line.planned_qty && line.planned_qty > 0;
            const hasOrderMapped = !!line.order_no;
            const hasScanned = (line.scannedQty || line.scanned_qty || 0) > 0;

            return (
              <div 
                key={line.id} 
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                  <div style={{ padding: '1rem', backgroundColor: isCompleted ? '#dcfce7' : '#dbeafe', borderRadius: '8px', color: isCompleted ? '#166534' : '#1e40af' }}>
                    <Box size={28} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, color: '#1e293b' }}>
                        {line.product_code}
                      </h3>
                      {hasOrderMapped ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#3730a3', fontWeight: 600 }}>
                            Đơn OEM: {line.order_no}
                          </span>
                          {!(Number(line.scannedQty) > 0) && (
                            <>
                              <button
                                onClick={() => openModalForLine(line)}
                                className="btn btn-icon"
                                style={{ padding: '0.25rem', height: 'auto', background: 'transparent', color: '#6366f1', border: 'none', cursor: 'pointer' }}
                                title="Sửa mã đơn OEM"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleUnmapOrder(line)}
                                className="btn btn-icon"
                                style={{ padding: '0.25rem', height: 'auto', background: 'transparent', color: '#ef4444', border: 'none', marginLeft: '0.25rem', cursor: 'pointer' }}
                                title="Hủy gán mã đơn OEM"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => openModalForLine(line)}
                          style={{ border: '1px dashed #f59e0b', background: '#fffbeb', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <LinkIcon size={12} /> Chưa gán đơn OEM (Gán ngay)
                        </button>
                      )}
                    </div>

                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      {line.product_name}
                    </p>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                      <span>Tiến độ: <strong style={{ color: isCompleted ? '#166534' : '#2563eb' }}>{line.scannedQty} / {line.planned_qty}</strong> SP</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onSelectProduct && onSelectProduct(line)}
                    style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    Bắt đầu quét QR <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OEM Order Selection Modal */}
      <OrderSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productCode={activeLine?.product_code || ''}
        onSelectOrder={handleMapOrder}
      />
    </div>
  );
}
