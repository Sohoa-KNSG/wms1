import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Plus, AlertCircle, Calendar, Edit2, Clock, RefreshCw, ArrowLeft, FileSpreadsheet, History, Repeat, CheckCircle, AlertTriangle } from 'lucide-react';
import OemOrderImportModal from './OemOrderImportModal.jsx';
import OemOrderFormModal from './OemOrderFormModal.jsx';
import OemOrderHistoryModal from './OemOrderHistoryModal.jsx';
import OemTransferModal from './OemTransferModal.jsx';
import { oemApi } from '../features/oem/api/oemApi.js';

export default function OemOrderList({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'All') params.status = statusFilter;
      
      const res = await oemApi.getOrders(params);
      const listData = res?.data !== undefined ? res.data : res;

      if (Array.isArray(listData)) {
        setOrders(listData);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu đơn hàng OEM:", err);
      setError(err.message || 'Không thể tải danh sách đơn hàng OEM từ CSDL');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateNew = () => {
    setSelectedOrder(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsFormModalOpen(true);
  };

  const handleViewHistory = (order) => {
    setSelectedOrder(order);
    setIsHistoryModalOpen(true);
  };

  const getStatusBadge = (stt) => {
    const statusUpper = (stt || 'NEW').toUpperCase();
    if (statusUpper === 'COMPLETED') {
      return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>🟢 COMPLETED</span>;
    }
    if (statusUpper === 'PROCESSING') {
      return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' }}>🟡 PROCESSING</span>;
    }
    if (statusUpper === 'HOLD') {
      return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>🔘 HOLD</span>;
    }
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>🔵 NEW</span>;
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={18} /> Quay lại
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Quản Lý Đơn Hàng OEM (UC07)
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Khai báo chỉ tiêu, theo dõi tiến độ sản xuất và quản lý chuyển đơn OEM
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={16} /> Tải lại
            </button>
            <button onClick={() => setIsTransferModalOpen(true)} className="btn btn-secondary" style={{ padding: '8px 12px', borderRadius: '6px', background: '#fff', border: '1px solid #f59e0b', color: '#d97706', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Repeat size={16} /> 🔀 Chuyển Dư Đơn OEM
            </button>
            <button onClick={handleCreateNew} className="btn btn-secondary" style={{ padding: '8px 14px', borderRadius: '6px', background: '#fff', border: '1px solid #2563eb', color: '#2563eb', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Tạo Đơn Mới
            </button>
            <button onClick={() => setIsImportModalOpen(true)} className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: '6px', background: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSpreadsheet size={18} /> Import Excel
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo Mã Đơn, Mã SP, Tên Khách Hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: '38px', paddingLeft: '2.5rem', paddingRight: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Trạng thái:</span>
            {['All', 'NEW', 'PROCESSING', 'COMPLETED', 'HOLD'].map((stt) => (
              <button
                key={stt}
                onClick={() => setStatusFilter(stt)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
                  border: statusFilter === stt ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: statusFilter === stt ? '#eff6ff' : '#fff',
                  color: statusFilter === stt ? '#1d4ed8' : '#475569'
                }}
              >
                {stt === 'All' ? 'Tất Cả' : stt}
              </button>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải danh sách đơn hàng OEM...</div>}
        {error && <div style={{ padding: '12px', color: '#dc2626', background: '#fee2e2', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>MÃ ĐƠN OEM</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>MÃ SP</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>ĐỢT GIAO</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>KHÁCH HÀNG</th>
                  <th style={{ padding: '12px', width: '200px', backgroundColor: '#f8fafc' }}>TIẾN ĐỘ THỰC NHẬP</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>HẠN GIAO (DUE DATE)</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>TRẠNG THÁI</th>
                  <th style={{ padding: '12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      Chưa có đơn hàng OEM nào khớp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  orders.map((o, idx) => {
                    const targetQty = Number(o.target_qty || o.order_qty) || 0;
                    const actualQty = Number(o.actual_qty || o.received_qty) || 0;
                    const percent = targetQty > 0 ? Math.min(Math.round((actualQty / targetQty) * 100), 100) : 0;
                    const dueDateStr = o.due_date ? new Date(o.due_date).toLocaleDateString('vi-VN') : 'N/A';

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{o.oem_order_no || o.MaDonHang}</td>
                        <td style={{ padding: '12px', color: '#2563eb', fontWeight: 700 }}>{o.product_code || o.MaHang}</td>
                        <td style={{ padding: '12px' }}>Đợt {o.batch_no || 1}</td>
                        <td style={{ padding: '12px', color: '#475569' }}>{o.customer_name || o.customer_code || 'Khách OEM'}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                            <span>{actualQty.toLocaleString()} / {targetQty.toLocaleString()}</span>
                            <span style={{ color: percent >= 100 ? '#16a34a' : '#2563eb' }}>{percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percent >= 100 ? '#16a34a' : '#2563eb', transition: 'width 0.3s' }} />
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#64748b' }}>{dueDateStr}</td>
                        <td style={{ padding: '12px' }}>{getStatusBadge(o.status)}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleEdit(o)}
                              title="Sửa thông tin đơn hàng"
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#2563eb' }}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleViewHistory(o)}
                              title="Xem nhật ký lịch sử đơn hàng"
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', color: '#64748b' }}
                            >
                              <History size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <OemOrderImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={fetchOrders} />
      <OemOrderFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} initialData={selectedOrder} onSaved={fetchOrders} />
      <OemOrderHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} order={selectedOrder} />
      <OemTransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} onSuccess={fetchOrders} />
    </div>
  );
}
