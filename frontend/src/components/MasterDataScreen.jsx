import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Plus, Trash2, X, AlertCircle, RefreshCw, ShieldOff, WifiOff } from 'lucide-react';
import { masterDataApi } from '../features/masterData/api/masterDataApi.js';
import { useAuth } from '../app/auth/AuthContext.jsx';

export default function MasterDataScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('trucks');
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [guards, setGuards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const { hasPermission } = useAuth();
  const canManage = hasPermission('MasterData.Manage');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const parseArray = (res) => {
    if (!res) return [];
    const list = res.data !== undefined ? res.data : res;
    return Array.isArray(list) ? list : [];
  };

  const fetchMasterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, dRes, gRes, cRes] = await Promise.all([
        masterDataApi.getTrucks(),
        masterDataApi.getDrivers(),
        masterDataApi.getGuards(),
        masterDataApi.getCustomers()
      ]);

      setTrucks(parseArray(tRes));
      setDrivers(parseArray(dRes));
      setGuards(parseArray(gRes));
      setCustomers(parseArray(cRes));
    } catch (e) {
      console.error("Lỗi tải danh mục Master Data:", e);
      const statusCode = e?.statusCode || 0;
      const traceId = e?.traceId || null;
      if (statusCode === 403) {
        setError({ type: 'forbidden', message: 'Bạn không có quyền xem thông tin Master Data.', traceId });
      } else {
        setError({ type: 'error', message: e.message || 'Lỗi kết nối máy chủ khi đọc danh mục Master Data', traceId });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleOpenModal = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    alert("Chức năng tạo mới danh mục đang được bảo vệ bởi quyền hạn hệ thống.");
    setShowModal(false);
  };

  const renderModal = () => {
    if (!showModal) return null;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="card" style={{ padding: '2rem', width: '400px', backgroundColor: 'white', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
              Thêm mới {activeTab === 'trucks' ? 'Xe tải' : activeTab === 'drivers' ? 'Tài xế' : activeTab === 'guards' ? 'Bảo vệ' : 'Khách hàng'}
            </h3>
            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSave}>
            {activeTab === 'trucks' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Biển số xe</label>
                  <input type="text" className="input-field" required value={formData.license_plate || ''} onChange={e => setFormData({...formData, license_plate: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tải trọng (kg)</label>
                  <input type="number" className="input-field" required value={formData.max_weight_kg || ''} onChange={e => setFormData({...formData, max_weight_kg: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </>
            )}

            {activeTab === 'drivers' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tên tài xế</label>
                  <input type="text" className="input-field" required value={formData.driver_name || ''} onChange={e => setFormData({...formData, driver_name: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Số điện thoại</label>
                  <input type="text" className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Lưu thông tin</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'trucks': return trucks;
      case 'drivers': return drivers;
      case 'guards': return guards;
      case 'customers': return customers;
      default: return [];
    }
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onBack && (
              <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={18} /> Quay lại
              </button>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Quản Lý Danh Mục Gốc (Master Data)</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={fetchMasterData} className="btn btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={16} /> Tải lại
            </button>
            {canManage && (
              <button onClick={handleOpenModal} className="btn btn-primary" style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={18} /> Thêm mới
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <button
            style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'trucks' ? '3px solid #2563eb' : 'none', color: activeTab === 'trucks' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'trucks' ? 700 : 500, cursor: 'pointer' }}
            onClick={() => setActiveTab('trucks')}
          >
            Danh sách Xe Tải ({trucks.length})
          </button>
          <button
            style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'drivers' ? '3px solid #2563eb' : 'none', color: activeTab === 'drivers' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'drivers' ? 700 : 500, cursor: 'pointer' }}
            onClick={() => setActiveTab('drivers')}
          >
            Danh sách Tài Xế ({drivers.length})
          </button>
          <button
            style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'guards' ? '3px solid #2563eb' : 'none', color: activeTab === 'guards' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'guards' ? 700 : 500, cursor: 'pointer' }}
            onClick={() => setActiveTab('guards')}
          >
            Danh sách Bảo Vệ ({guards.length})
          </button>
          <button
            style={{ padding: '10px 20px', border: 'none', background: 'none', borderBottom: activeTab === 'customers' ? '3px solid #2563eb' : 'none', color: activeTab === 'customers' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'customers' ? 700 : 500, cursor: 'pointer' }}
            onClick={() => setActiveTab('customers')}
          >
            Danh sách Khách Hàng ({customers.length})
          </button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang đọc dữ liệu danh mục Master Data từ máy chủ...</div>}
        
        {error && (
          <div style={{ padding: '12px 16px', color: error.type === 'forbidden' ? '#92400e' : '#dc2626', background: error.type === 'forbidden' ? '#fef3c7' : '#fee2e2', borderRadius: '6px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {error.type === 'forbidden' ? <ShieldOff size={20} /> : <WifiOff size={20} />}
            <div>
              <span style={{ fontWeight: 600 }}>{typeof error === 'string' ? error : error.message}</span>
              {error?.traceId && <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Trace ID: {error.traceId}</div>}
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>STT</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>THÔNG TIN ĐỊNH DANH</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>THÔNG TIN CHI TIẾT</th>
                  <th style={{ padding: '12px', backgroundColor: '#f8fafc' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {getActiveData().length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                      Chưa có bản ghi danh mục nào trong CSDL.
                    </td>
                  </tr>
                ) : (
                  getActiveData().map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                        {item.license_plate || item.driver_name || item.guard_name || item.customer_name || item.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', color: '#475569' }}>
                        {item.max_weight_kg ? `Tải trọng: ${item.max_weight_kg} kg` : item.phone ? `SĐT: ${item.phone}` : item.code ? `Mã: ${item.code}` : 'Hợp lệ'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#15803d' }}>
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {renderModal()}
    </div>
  );
}
