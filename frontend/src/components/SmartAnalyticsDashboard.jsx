import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, RefreshCw, BarChart2, Layers, MapPin, Activity, 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, ShieldCheck, Download 
} from 'lucide-react';
import { reportsApi } from '../features/reports/api/reportsApi.js';
import RealtimeReportScreen from './RealtimeReportScreen.jsx';
import LedgerReportScreen from './LedgerReportScreen.jsx';

export default function SmartAnalyticsDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('uc22_1'); // uc22_1 | uc22_2 | uc22_3 | uc22_4 | uc22_5_6

  // UC22.3 ABC/XYZ & Heatmap state
  const [abcData, setAbcData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loadingAbc, setLoadingAbc] = useState(false);

  // UC22.4 Picking KPI state
  const [kpiData, setKpiData] = useState([]);
  const [loadingKpi, setLoadingKpi] = useState(false);

  // UC22.5 & UC22.6 Aging & Recon state
  const [agingData, setAgingData] = useState([]);
  const [reconData, setReconData] = useState([]);
  const [loadingAging, setLoadingAging] = useState(false);

  useEffect(() => {
    if (activeTab === 'uc22_3') {
      fetchAbcAndHeatmap();
    } else if (activeTab === 'uc22_4') {
      fetchPickingKpi();
    } else if (activeTab === 'uc22_5_6') {
      fetchAgingAndRecon();
    }
  }, [activeTab]);

  const fetchAbcAndHeatmap = async () => {
    setLoadingAbc(true);
    try {
      const [abcRes, heatRes] = await Promise.all([
        reportsApi.getAbcXyzReport(),
        reportsApi.getHeatmapReport()
      ]);
      setAbcData(abcRes?.data || []);
      setHeatmapData(heatRes?.data || []);
    } catch (err) {
      console.error('Error fetching ABC/Heatmap:', err);
    } finally {
      setLoadingAbc(false);
    }
  };

  const fetchPickingKpi = async () => {
    setLoadingKpi(true);
    try {
      const res = await reportsApi.getPickingKpiReport();
      setKpiData(res?.data || []);
    } catch (err) {
      console.error('Error fetching KPI data:', err);
    } finally {
      setLoadingKpi(false);
    }
  };

  const fetchAgingAndRecon = async () => {
    setLoadingAging(true);
    try {
      const [agingRes, reconRes] = await Promise.all([
        reportsApi.getAgingReport(),
        reportsApi.getReconciliationReport()
      ]);
      setAgingData(agingRes?.data || []);
      setReconData(reconRes?.data || []);
    } catch (err) {
      console.error('Error fetching Aging/Recon:', err);
    } finally {
      setLoadingAging(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        backgroundColor: '#fff', padding: '1.25rem 1.5rem', borderRadius: '10px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.25rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn btn-secondary" style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Trung Tâm Báo Cáo Thông Minh (WMS Smart BI & Analytics)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Hệ thống tổng hợp báo cáo đa chiều gán mã Use Case chuẩn (UC22.1 - UC22.6)
            </p>
          </div>
        </div>
        <div>
          <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#15803d', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={16} /> Data Source: SQL Server WMS1 Live
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          onClick={() => setActiveTab('uc22_1')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'uc22_1' ? '#1e3a8a' : '#fff',
            color: activeTab === 'uc22_1' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Layers size={18} /> UC22.1 Tồn Kho Multi-Tier
        </button>

        <button
          onClick={() => setActiveTab('uc22_2')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'uc22_2' ? '#1e3a8a' : '#fff',
            color: activeTab === 'uc22_2' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Activity size={18} /> UC22.2 Sổ Cái Kép
        </button>

        <button
          onClick={() => setActiveTab('uc22_3')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'uc22_3' ? '#1e3a8a' : '#fff',
            color: activeTab === 'uc22_3' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <MapPin size={18} /> UC22.3 ABC/XYZ & Heatmap
        </button>

        <button
          onClick={() => setActiveTab('uc22_4')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'uc22_4' ? '#1e3a8a' : '#fff',
            color: activeTab === 'uc22_4' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Clock size={18} /> UC22.4 Hiệu Suất Soạn Hàng
        </button>

        <button
          onClick={() => setActiveTab('uc22_5_6')}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            backgroundColor: activeTab === 'uc22_5_6' ? '#1e3a8a' : '#fff',
            color: activeTab === 'uc22_5_6' ? '#fff' : '#475569',
            fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <AlertTriangle size={18} /> UC22.5/22.6 Tuổi Hàng & Đối Soát
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'uc22_1' && <RealtimeReportScreen />}
      {activeTab === 'uc22_2' && <LedgerReportScreen />}

      {/* Tab 3: UC22.3 ABC/XYZ & Heatmap */}
      {activeTab === 'uc22_3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Heatmap Section */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📍 Trực Quan Hóa Mật Độ Tồn Kho (Warehouse Heatmap)
            </h3>
            {loadingAbc ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang quét vị trí không gian kho...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {heatmapData.map((loc, idx) => {
                  const bg = loc.heat_level === 'VERY_HIGH' ? '#fee2e2' : loc.heat_level === 'HIGH' ? '#ffedd5' : loc.heat_level === 'MEDIUM' ? '#fef9c3' : '#f0fdf4';
                  const border = loc.heat_level === 'VERY_HIGH' ? '#fca5a5' : loc.heat_level === 'HIGH' ? '#fdba74' : loc.heat_level === 'MEDIUM' ? '#fde047' : '#86efac';
                  const textColor = loc.heat_level === 'VERY_HIGH' ? '#991b1b' : loc.heat_level === 'HIGH' ? '#9a3412' : loc.heat_level === 'MEDIUM' ? '#854d0e' : '#166534';
                  return (
                    <div key={idx} style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: textColor, fontSize: '1rem' }}>{loc.location_code}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>Tổ hợp: {loc.distinct_skus} SKUs</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: textColor, marginTop: '6px' }}>
                        {loc.total_cartons} thùng ({(Number(loc.total_qty) || 0).toLocaleString()} SP)
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ABC/XYZ Table */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
              📊 Phân Loại Tồn Kho ABC/XYZ (Inventory ABC/XYZ Classification)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Mã SKU</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tồn Hiện Tại</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Số Thùng</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tần Suất Xuất Kho</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Nhóm ABC (Sản Lượng)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Nhóm XYZ (Độ Biến Động)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Phân Loại Hợp Nhất</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{row.product_code}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600 }}>{(Number(row.current_stock_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{row.total_boxes}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{row.dispatch_frequency} lần</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: row.abc_class === 'A' ? '#dcfce7' : row.abc_class === 'B' ? '#fef3c7' : '#fee2e2', color: row.abc_class === 'A' ? '#15803d' : row.abc_class === 'B' ? '#b45309' : '#b91c1c' }}>
                        Nhóm {row.abc_class}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
                        Nhóm {row.xyz_class}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 800, color: '#1e3a8a' }}>
                      {row.abc_xyz_category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab 4: UC22.4 Picking Performance KPI */}
      {activeTab === 'uc22_4' && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
            ⏱️ Báo Cáo Phân Tích Hiệu Suất Soạn Hàng & Xử Lý Đơn (Picking KPI & SLA)
          </h3>
          {loadingKpi ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tính toán chỉ số KPI...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Mã Phiếu Xuất</th>
                  <th style={{ padding: '10px' }}>Khách Hàng</th>
                  <th style={{ padding: '10px' }}>Biển Số Xe</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Số Dòng Hàng</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>SL Yêu Cầu</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>SL Đã Quét</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Thời Gian Soạn (Phút)</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#d97706' }}>{row.delivery_note_no}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{row.customer_name || 'KNSG GT'}</td>
                    <td style={{ padding: '10px' }}>{row.license_plate || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{row.total_lines}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{(Number(row.total_requested_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{(Number(row.total_scanned_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: row.picking_duration_minutes > 60 ? '#dc2626' : '#2563eb' }}>
                      {row.picking_duration_minutes} phút
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: UC22.5 & UC22.6 Aging & Recon */}
      {activeTab === 'uc22_5_6' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Aging Section */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
              ⚠️ UC22.5 Báo Cáo Tuổi Hàng & Cảnh Báo Tồn Kho Chậm Luân Chuyển (Aging Stock)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Mã Sản Phẩm (SKU)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tổng Số Thùng</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tổng SL Tồn</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tuổi Hàng Lớn Nhất (Ngày)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tuổi Hàng Trung Bình</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Mức Độ Cảnh Báo</th>
                </tr>
              </thead>
              <tbody>
                {agingData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{row.product_code}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{row.total_boxes}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{(Number(row.current_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: row.max_aging_days > 180 ? '#dc2626' : '#0f172a' }}>
                      {row.max_aging_days} ngày
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{row.avg_aging_days} ngày</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem',
                        background: row.aging_category === 'CRITICAL_SLOW' ? '#fee2e2' : row.aging_category === 'WARNING_SLOW' ? '#ffedd5' : '#dcfce7',
                        color: row.aging_category === 'CRITICAL_SLOW' ? '#991b1b' : row.aging_category === 'WARNING_SLOW' ? '#9a3412' : '#15803d'
                      }}>
                        {row.aging_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reconciliation Section */}
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>
              🛡️ UC22.6 Đối Soát Chênh Lệch Tồn Kho Vật Lý Vs Sổ Cái Kép (Automatic Reconciliation)
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Mã SKU</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tồn Vật Lý (tbl_thung60_kho)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Tồn Sổ Cái (inventory_ledger)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Chênh Lệch (Variance)</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>Trạng Thái Đối Soát</th>
                </tr>
              </thead>
              <tbody>
                {reconData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{row.product_code}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{(Number(row.physical_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{(Number(row.ledger_qty) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: row.variance_qty !== 0 ? '#dc2626' : '#15803d' }}>
                      {row.variance_qty}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem',
                        background: row.recon_status === 'MATCHED' ? '#dcfce7' : '#fee2e2',
                        color: row.recon_status === 'MATCHED' ? '#15803d' : '#b91c1c'
                      }}>
                        {row.recon_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
