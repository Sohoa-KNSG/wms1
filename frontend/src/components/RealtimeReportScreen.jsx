import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, BarChart2, List, Search, Download, MapPin, ShieldOff, WifiOff } from 'lucide-react';
import { reportsApi } from '../features/reports/api/reportsApi.js';
import StockTypeChangeModal from './StockTypeChangeModal.jsx';

export default function RealtimeReportScreen({ onBack }) {
  const [view, setView] = useState('macro'); // 'macro', 'micro', or 'location'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Filters for both views
  const [search, setSearch] = useState('');

  // Location drill-down state
  const [selectedAisle, setSelectedAisle] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);

  // Additional filters for micro view
  const [productCode, setProductCode] = useState('');
  const [status, setStatus] = useState('');
  const [stockType, setStockType] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (view === 'macro') {
        res = await reportsApi.getMacroReport(search);
      } else if (view === 'location') {
        res = await reportsApi.getLocationReport(search);
      } else {
        const params = {};
        if (search) params.search = search;
        if (productCode) params.product_code = productCode;
        if (status) params.status = status;
        if (stockType) params.stock_type = stockType;
        res = await reportsApi.getMicroReport(params);
      }
      // Parse standard response envelope { status, data: [...] }
      const listData = res?.data !== undefined ? res.data : res;
      setData(Array.isArray(listData) ? listData : []);
    } catch (err) {
      // Phân biệt 403 Forbidden vs lỗi khác
      const statusCode = err?.statusCode || 0;
      const traceId = err?.traceId || null;
      if (statusCode === 403) {
        setError({ type: 'forbidden', message: 'Bạn không có quyền xem báo cáo tồn kho. Liên hệ quản trị viên.', traceId });
      } else {
        setError({ type: 'error', message: err.message || 'Không thể tải dữ liệu báo cáo tồn kho từ máy chủ.', traceId });
      }
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [view, search, productCode, status, stockType]);

  useEffect(() => {
    fetchData();
  }, [view, fetchData]);

  const sumQty = data.reduce((sum, row) => sum + (Number(row.total_qty || row.TongSoLuong || row.qty) || 0), 0);
  const sumVirtual = data.reduce((sum, row) => sum + (Number(row.count_thung_ao || row.ThungAo) || 0), 0);
  const sumLoose = data.reduce((sum, row) => sum + (Number(row.count_thung_60_roi || row.ThungRoi) || 0), 0);
  const sum360 = data.reduce((sum, row) => sum + (Number(row.count_kien_360 || row.Kien360) || 0), 0);

  const handleExport = () => {
    const params = new URLSearchParams();
    params.append('view', view);
    if (search) params.append('search', search);
    if (productCode) params.append('product_code', productCode);
    if (status) params.append('status', status);
    if (stockType) params.append('stock_type', stockType);

    const exportUrl = `/api/v1/reports/inventory/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={18} /> Quay lại
              </button>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Báo cáo Tồn kho Tức thời (UC22.1)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsStockModalOpen(true)}
              style={{
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                backgroundColor: '#dc2626', color: '#fff', border: 'none',
                fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              🔒 Khóa Tồn Kho (UC13)
            </button>
            <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={16} /> Tải lại
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1rem' }}>
            <button 
              className={`btn ${view === 'macro' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: view === 'macro' ? '#1e3a8a' : 'transparent', color: view === 'macro' ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              onClick={() => setView('macro')}
            >
              <BarChart2 size={16} /> TỔNG HỢP (MACRO)
            </button>
            <button 
              className={`btn ${view === 'location' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: view === 'location' ? '#1e3a8a' : 'transparent', color: view === 'location' ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              onClick={() => setView('location')}
            >
              <MapPin size={16} /> VỊ TRÍ (LOCATION)
            </button>
            <button 
              className={`btn ${view === 'micro' ? 'btn-primary' : ''}`}
              style={{ flex: 1, backgroundColor: view === 'micro' ? '#1e3a8a' : 'transparent', color: view === 'micro' ? 'white' : '#64748b', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
              onClick={() => setView('micro')}
            >
              <List size={16} /> CHI TIẾT (MICRO)
            </button>
          </div>

          {/* Active Filter Indicator */}
          {productCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>Đang lọc theo SKU: <strong>{productCode}</strong></span>
              <button 
                onClick={() => setProductCode('')} 
                style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: 'auto' }}
              >
                ✕ Xóa lọc SKU
              </button>
            </div>
          )}

          {/* Search & Export Header */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Tìm sản phẩm, vị trí..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', height: '40px', paddingLeft: '2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button onClick={fetchData} className="btn btn-primary" style={{ padding: '0 1rem', height: '40px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Tìm kiếm
            </button>
            <button onClick={handleExport} className="btn btn-secondary" style={{ padding: '0 1rem', height: '40px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Download size={18} /> Xuất Excel
            </button>
          </div>

          {/* KPI Summary Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>TỔNG SỐ LƯỢNG TỒN</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a', marginTop: '4px' }}>{sumQty.toLocaleString()}</div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>SỐ KIỆN 360</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#14532d', marginTop: '4px' }}>{sum360.toLocaleString()}</div>
            </div>
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>THÙNG 60 RỜI</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c2d12', marginTop: '4px' }}>{sumLoose.toLocaleString()}</div>
            </div>
            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b21a8', fontWeight: 600 }}>THÙNG ẢO</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#581c87', marginTop: '4px' }}>{sumVirtual.toLocaleString()}</div>
            </div>
          </div>

          {/* Error / Forbidden State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
              <div>Đang tải dữ liệu báo cáo tồn kho...</div>
            </div>
          )}
          {!loading && error && error.type === 'forbidden' && (
            <div style={{ padding: '1.5rem', color: '#92400e', background: '#fef3c7', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <ShieldOff size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Không đủ quyền truy cập</div>
                <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>{error.message}</div>
                {error.traceId && <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#78350f' }}>Trace ID: {error.traceId}</div>}
              </div>
            </div>
          )}
          {!loading && error && error.type === 'error' && (
            <div style={{ padding: '1.5rem', color: '#991b1b', background: '#fee2e2', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <WifiOff size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Lỗi tải dữ liệu</div>
                <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>{error.message}</div>
                {error.traceId && <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#7f1d1d' }}>Trace ID: {error.traceId}</div>}
              </div>
            </div>
          )}

          {!loading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    {view === 'macro' && (
                      <>
                        <th style={{ padding: '12px' }}>MÃ SẢN PHẨM (SKU)</th>
                        <th style={{ padding: '12px' }}>KHÁCH HÀNG</th>
                        <th style={{ padding: '12px' }}>ĐƠN HÀNG</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>TỔNG TỒN</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>KIỆN 360</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>THÙNG RỜI</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>THÙNG ẢO</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>THAO TÁC</th>
                      </>
                    )}
                    {view === 'micro' && (
                      <>
                        <th style={{ padding: '12px' }}>MÃ KIỆN / THÙNG</th>
                        <th style={{ padding: '12px' }}>LOẠI KIỆN</th>
                        <th style={{ padding: '12px' }}>SKU</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>SL TỒN</th>
                        <th style={{ padding: '12px' }}>VỊ TRÍ (KỆ)</th>
                        <th style={{ padding: '12px' }}>KHÁCH HÀNG</th>
                        <th style={{ padding: '12px' }}>ĐƠN HÀNG</th>
                        <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                      </>
                    )}
                    {view === 'location' && (
                      <>
                        <th style={{ padding: '12px' }}>VỊ TRÍ (KỆ)</th>
                        <th style={{ padding: '12px' }}>MÃ SẢN PHẨM (SKU)</th>
                        <th style={{ padding: '12px' }}>KHÁCH HÀNG</th>
                        <th style={{ padding: '12px' }}>ĐƠN HÀNG</th>
                        <th style={{ padding: '12px' }}>TRẠNG THÁI</th>
                        <th style={{ padding: '12px' }}>LOẠI PHẨM CHẤT</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>SỐ LƯỢNG</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={view === 'macro' ? 8 : 8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        <BarChart2 size={32} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                        <div style={{ fontWeight: 600 }}>Không có dữ liệu tồn kho</div>
                        <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Không có bản ghi phù hợp với điều kiện lọc hiện tại.</div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {view === 'macro' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 600 }}>
                              <button
                                onClick={() => {
                                  setProductCode(row.product_code || row.MaSanPham);
                                  setView('micro');
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#2563eb',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  padding: 0
                                }}
                                title="Bấm để xem chi tiết các thùng hàng"
                              >
                                {row.product_code || row.MaSanPham || 'N/A'}
                              </button>
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.customer_code || '-'}</td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.current_oem_order_no || '-'}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                              {(Number(row.total_qty || row.TongSoLuong || row.qty) || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{(Number(row.count_kien_360 || row.Kien360) || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{(Number(row.count_thung_60_roi || row.ThungRoi) || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>{(Number(row.count_thung_ao || row.ThungAo) || 0).toLocaleString()}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => {
                                    setProductCode(row.product_code || row.MaSanPham);
                                    setView('micro');
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Xem danh sách chi tiết thùng"
                                >
                                  <List size={13} /> Thùng
                                </button>
                                <button
                                  onClick={() => {
                                    setProductCode(row.product_code || row.MaSanPham);
                                    setView('location');
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                    color: '#334155',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Xem danh sách kệ lưu trữ"
                                >
                                  <MapPin size={13} /> Kệ
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {view === 'micro' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b' }}>
                              {row.package_id || row.MaThung || row.id_60 || '-'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: (row.package_type || '').includes('360') ? '#dcfce7' : '#f1f5f9',
                                color: (row.package_type || '').includes('360') ? '#15803d' : '#475569'
                              }}>
                                {row.package_type || (row.current_pack360_id ? 'THÙNG 360' : 'THÙNG 60')}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#2563eb' }}>
                              {row.product_code || row.MaSanPham || '-'}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                              {(Number(row.current_qty || row.qty || 0)).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#0369a1' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                                <MapPin size={12} /> {row.current_location_code || 'CHƯA LÊN KỆ'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.customer_code || '-'}</td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.current_oem_order_no || '-'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: row.status === 'AVAILABLE' ? '#dcfce7' : row.status === 'LOCKED' ? '#fee2e2' : '#fef3c7',
                                color: row.status === 'AVAILABLE' ? '#166534' : row.status === 'LOCKED' ? '#991b1b' : '#92400e'
                              }}>
                                {row.status || 'AVAILABLE'}
                              </span>
                            </td>
                          </>
                        )}
                        {view === 'location' && (
                          <>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#0369a1' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                                <MapPin size={12} /> {row.current_location_code || 'CHƯA LÊN KỆ'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#2563eb' }}>
                              {row.product_code || row.MaSanPham || '-'}
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.customer_code || '-'}</td>
                            <td style={{ padding: '12px', color: '#475569' }}>{row.current_oem_order_no || '-'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: row.status === 'AVAILABLE' ? '#dcfce7' : '#fef3c7',
                                color: row.status === 'AVAILABLE' ? '#166534' : '#92400e'
                              }}>
                                {row.status || 'AVAILABLE'}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>{row.stock_type || 'NVB'}</td>
                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                              {(Number(row.total_qty || row.current_qty || 0)).toLocaleString()}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <StockTypeChangeModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
