import React, { useState, useEffect } from 'react';
import { Package, Scan, ArrowRightLeft, XCircle, CheckCircle, ArrowLeft, Search, ChevronDown, ChevronUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { palletsApi } from '../features/pallets/api/palletsApi.js';

export default function PalletScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('palletize'); // palletize | depalletize | transfer | inquiry | putaway | letdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States for Palletize (Wizard)
  const [palletizeStep, setPalletizeStep] = useState(1); // 1: Init, 2: Scan Units
  const [palletId, setPalletId] = useState('');
  
  // Shared
  const [unitId, setUnitId] = useState('');
  const [unitType, setUnitType] = useState('THUNG60'); // THUNG60 | PACK360

  // States for Transfer (Wizard)
  const [transferStep, setTransferStep] = useState(1); // 1: Scan Units, 2: Dest Pallet
  const [newPalletId, setNewPalletId] = useState('');
  const [transferUnits, setTransferUnits] = useState([]);

  // States for Inquiry (UC06.2)
  const [inquiryPalletId, setInquiryPalletId] = useState('');
  const [palletInfo, setPalletInfo] = useState(null);
  const [palletSummary, setPalletSummary] = useState([]);
  const [palletDetails, setPalletDetails] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  // States for Shelving (Putaway & Letdown) - UC11
  const [shelfPalletId, setShelfPalletId] = useState('');
  const [shelfLocationCode, setShelfLocationCode] = useState('');

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Reset state on tab change
  useEffect(() => {
    clearMessages();
    setPalletizeStep(1);
    setPalletId('');
    setUnitId('');
    setTransferStep(1);
    setNewPalletId('');
    setTransferUnits([]);
    setInquiryPalletId('');
    setPalletInfo(null);
    setPalletSummary([]);
    setPalletDetails([]);
    setExpandedGroups({});
    setShelfPalletId('');
    setShelfLocationCode('');
  }, [activeTab]);

  // ===============================
  // TAB 1: PALLETIZE
  // ===============================
  const handleInitPallet = async () => {
    if (!palletId) {
      setError('Vui lòng nhập Mã Pallet');
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      const res = await palletsApi.initPallet({ palletId });
      setSuccess(res?.message || `Khởi tạo Pallet [${palletId}] thành công`);
      setPalletizeStep(2);
    } catch (err) {
      setError(err.message || 'Lỗi khởi tạo Pallet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async () => {
    if (!unitId) return;
    setLoading(true);
    clearMessages();
    try {
      await palletsApi.addUnit(palletId, { unitId, unitType });
      setSuccess(`Thêm thành công: ${unitId}`);
      setUnitId('');
    } catch (err) {
      setError(err.message || 'Lỗi xếp kiện lên Pallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePallet = async () => {
    setLoading(true);
    clearMessages();
    try {
      const res = await palletsApi.completePallet(palletId);
      setSuccess(res?.message || `Hoàn tất đóng Pallet [${palletId}]`);
      setPalletId('');
      setUnitId('');
      setPalletizeStep(1);
    } catch (err) {
      setError(err.message || 'Lỗi hoàn tất Pallet');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TAB 2: DEPALLETIZE
  // ===============================
  const handleRemoveUnit = async () => {
    if (!unitId) return;
    setLoading(true);
    clearMessages();
    try {
      await palletsApi.removeUnit({ unitId, unitType });
      setSuccess(`Đã gỡ thành công: ${unitId}`);
      setUnitId('');
    } catch (err) {
      setError(err.message || 'Lỗi dỡ kiện khỏi Pallet');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TAB 3: TRANSFER
  // ===============================
  const handleAddTransferUnit = () => {
    if (!unitId) return;
    setTransferUnits(prev => [...prev, { unitId, unitType }]);
    setUnitId('');
  };

  const handleConfirmTransferList = () => {
    if (transferUnits.length === 0) {
      setError('Vui lòng quét ít nhất 1 mã hàng để chuyển');
      return;
    }
    clearMessages();
    setTransferStep(2);
  };

  const handleTransferBatch = async () => {
    if (!newPalletId) {
      setError('Vui lòng quét Mã Pallet Đích');
      return;
    }
    setLoading(true);
    clearMessages();
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of transferUnits) {
      try {
        await palletsApi.transferUnit({
          newPalletId,
          unitId: item.unitId,
          unitType: item.unitType
        });
        successCount++;
      } catch (err) {
        failCount++;
        console.error('Lỗi khi chuyển mã:', item.unitId, err);
      }
    }
    
    setLoading(false);
    if (failCount === 0) {
      setSuccess(`Đã luân chuyển ${successCount} kiện sang Pallet [${newPalletId}] thành công!`);
      setTransferUnits([]);
      setNewPalletId('');
      setTransferStep(1);
    } else {
      setError(`Thành công: ${successCount}, Thất bại: ${failCount}. Vui lòng kiểm tra lại.`);
    }
  };

  // ===============================
  // TAB 4: INQUIRY (TRA CỨU)
  // ===============================
  const handleInquiry = async () => {
    if (!inquiryPalletId) {
      setError('Vui lòng quét Mã Pallet cần tra cứu');
      return;
    }
    setLoading(true);
    clearMessages();
    setPalletInfo(null);
    setPalletSummary([]);
    setPalletDetails([]);
    setExpandedGroups({});

    try {
      const res = await palletsApi.getPalletInfo(inquiryPalletId);
      const dataObj = res?.data || res;
      setPalletInfo(dataObj?.pallet || dataObj);
      setPalletSummary(dataObj?.summary || []);
      setPalletDetails(dataObj?.details || []);
    } catch (err) {
      setError(err.message || 'Lỗi tra cứu Pallet');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TAB 5: PUTAWAY (LÊN KỆ)
  // ===============================
  const handlePutaway = async () => {
    if (!shelfPalletId || !shelfLocationCode) {
      setError('Vui lòng quét đủ Mã Pallet và Mã Kệ');
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      await palletsApi.putawayPallet(shelfPalletId, { locationCode: shelfLocationCode });
      setSuccess(`Lên kệ thành công: Pallet [${shelfPalletId}] đã được cất vào vị trí [${shelfLocationCode}]`);
      setShelfPalletId('');
      setShelfLocationCode('');
    } catch (err) {
      setError(err.message || 'Lỗi cất Pallet lên kệ');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TAB 6: LETDOWN (XUỐNG KỆ)
  // ===============================
  const handleLetdown = async () => {
    if (!shelfPalletId) {
      setError('Vui lòng quét Mã Pallet');
      return;
    }
    setLoading(true);
    clearMessages();
    try {
      await palletsApi.letdownPallet(shelfPalletId);
      setSuccess(`Lấy hàng xuống kệ thành công: Pallet [${shelfPalletId}] đã hạ khỏi kệ.`);
      setShelfPalletId('');
    } catch (err) {
      setError(err.message || 'Lỗi lấy Pallet xuống kệ');
    } finally {
      setLoading(false);
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Quản Lý Pallet & Lưu Kho (UC06 & UC11)</h2>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto' }}>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'palletize' ? '3px solid #2563eb' : 'none', color: activeTab === 'palletize' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'palletize' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('palletize')}
          >
            <Package size={18} /> Xếp Pallet
          </button>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'depalletize' ? '3px solid #2563eb' : 'none', color: activeTab === 'depalletize' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'depalletize' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('depalletize')}
          >
            <XCircle size={18} /> Dỡ Pallet
          </button>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'transfer' ? '3px solid #2563eb' : 'none', color: activeTab === 'transfer' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'transfer' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('transfer')}
          >
            <ArrowRightLeft size={18} /> Chuyển Pallet
          </button>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'inquiry' ? '3px solid #2563eb' : 'none', color: activeTab === 'inquiry' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'inquiry' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('inquiry')}
          >
            <Search size={18} /> Tra Cứu Pallet
          </button>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'putaway' ? '3px solid #2563eb' : 'none', color: activeTab === 'putaway' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'putaway' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('putaway')}
          >
            <ArrowUpCircle size={18} /> Cất Lên Kệ
          </button>
          <button
            style={{ padding: '10px 16px', border: 'none', background: 'none', borderBottom: activeTab === 'letdown' ? '3px solid #2563eb' : 'none', color: activeTab === 'letdown' ? '#2563eb' : '#64748b', fontWeight: activeTab === 'letdown' ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('letdown')}
          >
            <ArrowDownCircle size={18} /> Hạ Xuống Kệ
          </button>
        </div>

        {/* Notifications */}
        {error && <div style={{ padding: '12px', color: '#dc2626', background: '#fee2e2', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ padding: '12px', color: '#15803d', background: '#dcfce7', borderRadius: '6px', marginBottom: '1rem' }}>{success}</div>}

        {/* TAB 1: PALLETIZE */}
        {activeTab === 'palletize' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {palletizeStep === 1 ? (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Bước 1: Quét/Nhập Mã Pallet Đích</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>MÃ PALLET (PLT-...)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Quét tem mã vạch Pallet..."
                    value={palletId}
                    onChange={(e) => setPalletId(e.target.value.toUpperCase())}
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                  />
                </div>
                <button
                  onClick={handleInitPallet}
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', height: '44px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {loading ? 'Đang khởi tạo...' : 'Xác nhận tạo/mở Pallet'}
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Bước 2: Quét Kiện Hàng Vào Pallet [{palletId}]</h3>
                  <button onClick={() => setPalletizeStep(1)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Đổi Pallet</button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="unitType" value="THUNG60" checked={unitType === 'THUNG60'} onChange={() => setUnitType('THUNG60')} />
                    <span>Thùng 60 Rời</span>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="unitType" value="PACK360" checked={unitType === 'PACK360'} onChange={() => setUnitType('PACK360')} />
                    <span>Kiện 360</span>
                  </label>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`Quét mã QR ${unitType === 'THUNG60' ? 'Thùng 60' : 'Kiện 360'}...`}
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAddUnit} className="btn btn-secondary" style={{ flex: 1, height: '42px' }}>+ Thêm Kiện</button>
                  <button onClick={handleCompletePallet} className="btn btn-primary" style={{ flex: 1, height: '42px', background: '#166534' }}>✓ Hoàn tất Pallet</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INQUIRY */}
        {activeTab === 'inquiry' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Quét/Nhập Mã Pallet cần tra cứu (PLT-...)"
                value={inquiryPalletId}
                onChange={(e) => setInquiryPalletId(e.target.value.toUpperCase())}
                style={{ flex: 1, height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
              <button onClick={handleInquiry} className="btn btn-primary" style={{ padding: '0 1.5rem', height: '42px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}>
                Tra Cứu
              </button>
            </div>

            {palletInfo && (
              <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                  Thông tin Pallet: <span style={{ color: '#2563eb' }}>{palletInfo.pallet_id || inquiryPalletId}</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>Trạng thái: <strong>{palletInfo.status || 'ACTIVE'}</strong></div>
                  <div>Vị trí Kệ: <strong>{palletInfo.location_code || 'Chưa lên kệ'}</strong></div>
                  <div>Tổng Kiện: <strong>{palletInfo.total_units || palletDetails.length}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PUTAWAY */}
        {activeTab === 'putaway' && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Cất Pallet Lên Kệ (Putaway - UC11)</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>MÃ PALLET</label>
              <input type="text" className="input-field" value={shelfPalletId} onChange={(e) => setShelfPalletId(e.target.value.toUpperCase())} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>MÃ VỊ TRÍ KỆ (LOCATION)</label>
              <input type="text" className="input-field" value={shelfLocationCode} onChange={(e) => setShelfLocationCode(e.target.value.toUpperCase())} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={handlePutaway} className="btn btn-primary" style={{ width: '100%', height: '44px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}>Xác Nhận Cất Lên Kệ</button>
          </div>
        )}

        {/* TAB 6: LETDOWN */}
        {activeTab === 'letdown' && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Lấy Pallet Xuống Kệ (Letdown - UC11)</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>MÃ PALLET CẦN HẠ KỆ</label>
              <input type="text" className="input-field" value={shelfPalletId} onChange={(e) => setShelfPalletId(e.target.value.toUpperCase())} style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <button onClick={handleLetdown} className="btn btn-primary" style={{ width: '100%', height: '44px', background: '#166534', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}>Xác Nhận Hạ Khỏi Kệ</button>
          </div>
        )}
      </div>
    </div>
  );
}
