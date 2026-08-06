import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Lock, Unlock, ShieldAlert, CheckCircle, Search, Filter, AlertTriangle } from 'lucide-react';
import { reportsApi } from '../features/reports/api/reportsApi.js';
import StockTypeChangeModal from './StockTypeChangeModal.jsx';

export default function StockManagementScreen({ onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [stockTypeFilter, setStockTypeFilter] = useState('ALL'); // 'ALL', 'BLOCKED', 'UNRESTRICTED'
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialCartons, setModalInitialCartons] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (stockTypeFilter !== 'ALL') params.stock_type = stockTypeFilter;

      const res = await reportsApi.getMicroReport(params);
      const listData = res?.data !== undefined ? res.data : res;
      setData(Array.isArray(listData) ? listData : []);
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thùng kho từ máy chủ.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [search, stockTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(data.map((row) => row.package_id || row.id_60));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openModalWithSelected = (initialList = []) => {
    setModalInitialCartons(initialList);
    setIsModalOpen(true);
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={18} /> Quay lại
              </button>
            )}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Quản Lý & Release Tồn Kho (UC13 - UC14)
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Khóa tồn kho (BLOCKED) và mở khóa giải phóng tồn (UNRESTRICTED)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => openModalWithSelected(selectedIds)}
              style={{
                padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                backgroundColor: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Lock size={16} /> 🔒 Khóa / Giải Khóa ({selectedIds.length})
            </button>
            <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={16} /> Tải lại
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo Mã Thùng / Mã SP / Mã Đơn OEM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setStockTypeFilter('ALL')}
              style={{
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                border: stockTypeFilter === 'ALL' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: stockTypeFilter === 'ALL' ? '#eff6ff' : '#fff',
                color: stockTypeFilter === 'ALL' ? '#1d4ed8' : '#475569'
              }}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setStockTypeFilter('BLOCKED')}
              style={{
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                border: stockTypeFilter === 'BLOCKED' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                backgroundColor: stockTypeFilter === 'BLOCKED' ? '#fef2f2' : '#fff',
                color: stockTypeFilter === 'BLOCKED' ? '#991b1b' : '#475569'
              }}
            >
              🔒 BLOCKED (Bị Khóa)
            </button>
            <button
              onClick={() => setStockTypeFilter('UNRESTRICTED')}
              style={{
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                border: stockTypeFilter === 'UNRESTRICTED' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                backgroundColor: stockTypeFilter === 'UNRESTRICTED' ? '#f0fdf4' : '#fff',
                color: stockTypeFilter === 'UNRESTRICTED' ? '#166534' : '#475569'
              }}
            >
              🔓 UNRESTRICTED (Khả Dụng)
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px', width: '40px', backgroundColor: '#f8fafc' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={data.length > 0 && selectedIds.length === data.length} />
                </th>
                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc' }}>Mã Kiện / Mã Thùng</th>
                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc' }}>Mã Sản Phẩm</th>
                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc' }}>📍 Kệ Kho</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', backgroundColor: '#f8fafc' }}>Số Lượng</th>
                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc' }}>Trạng Thái</th>
                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc' }}>Stock Type</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', backgroundColor: '#f8fafc' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    Đang tải dữ liệu tồn kho...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Không tìm thấy bản ghi tồn kho nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const pkgId = row.package_id || row.id_60;
                  const isBlocked = (row.stock_type || '').toUpperCase() === 'BLOCKED';
                  const isChecked = selectedIds.includes(pkgId);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isChecked ? '#f0f9ff' : 'transparent' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <input type="checkbox" checked={isChecked} onChange={() => handleSelectOne(pkgId)} />
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                        {pkgId}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {row.product_code}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: 700
                        }}>
                          📍 {row.current_location_code || 'K07/1'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                        {(Number(row.current_qty) || 0).toLocaleString()} {row.uom || 'SP'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px',
                          fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {row.status || 'AVAILABLE'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          backgroundColor: isBlocked ? '#fef2f2' : '#f0fdf4',
                          color: isBlocked ? '#dc2626' : '#16a34a',
                          border: `1px solid ${isBlocked ? '#fecaca' : '#bbf7d0'}`,
                          padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}>
                          {isBlocked ? <Lock size={12} /> : <Unlock size={12} />}
                          {row.stock_type || (isBlocked ? 'BLOCKED' : 'UNRESTRICTED')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <button
                          onClick={() => openModalWithSelected([pkgId])}
                          style={{
                            padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: isBlocked ? '#16a34a' : '#dc2626',
                            color: '#fff'
                          }}
                        >
                          {isBlocked ? '🔓 Release' : '🔒 Block'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockTypeChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setSelectedIds([]);
          fetchData();
        }}
        initialCartons={modalInitialCartons}
      />
    </div>
  );
}
