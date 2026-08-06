import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle, Truck, Package, FileText, UserCheck, 
  ArrowLeft, Search, RefreshCw, AlertCircle, Key, Lock, FileSpreadsheet, Eye
} from 'lucide-react';
import { outboundApi } from '../features/outbound/api/outboundApi.js';
import Toast from './Toast';

export default function ExportGateApprovalScreen({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('STOREKEEPER'); // STOREKEEPER (Chờ Thủ Kho Duyệt) | GATE (Chờ Bảo Vệ Kiểm Cổng) | SHIPPED (Lịch Sử Xuất)
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  
  // Selected Note & Modal States
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteDetails, setNoteDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Storekeeper Approval Modal State
  const [showStorekeeperModal, setShowStorekeeperModal] = useState(false);
  const [storekeeperNote, setStorekeeperNote] = useState('');

  // Gate Security Inspection Modal State
  const [showGateModal, setShowGateModal] = useState(false);
  const [driverName, setDriverName] = useState('');
  const [sealNo, setSealNo] = useState('');
  const [gateNote, setGateNote] = useState('');
  const [checkPlate, setCheckPlate] = useState(true);
  const [checkQty, setCheckQty] = useState(true);
  const [checkSeal, setCheckSeal] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Fetch Delivery Notes
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await outboundApi.getDeliveryNotes();
      const data = res?.data !== undefined ? res.data : res;
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách phiếu', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch Note Details when selected
  const handleSelectNote = async (note, actionType) => {
    setSelectedNote(note);
    setLoadingDetails(true);
    try {
      const res = await outboundApi.getDeliveryNoteDetails(note.delivery_note_no);
      const data = res?.data !== undefined ? res.data : res;
      setNoteDetails(data);
    } catch (err) {
      console.error('Lỗi lấy chi tiết phiếu', err);
    } finally {
      setLoadingDetails(false);
    }

    if (actionType === 'STOREKEEPER') {
      setShowStorekeeperModal(true);
    } else if (actionType === 'GATE') {
      setDriverName('');
      setSealNo('');
      setGateNote('');
      setShowGateModal(true);
    }
  };

  // Submit Storekeeper Approval
  const handleStorekeeperApprove = async () => {
    if (!selectedNote) return;
    setIsProcessing(true);
    try {
      const res = await outboundApi.stageDeliveryNote({
        DeliveryNoteNo: selectedNote.delivery_note_no,
        Note: storekeeperNote || 'Thủ kho đối soát đủ hàng và ký duyệt cho phép tập kết xuất kho.'
      });
      showToast('success', res?.message || 'Ký duyệt xuất kho thành công!');
      setShowStorekeeperModal(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      showToast('error', 'Lỗi: ' + (err.message || 'Thất bại'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Gate Security Check & Exit Release
  const handleGateCheckRelease = async () => {
    if (!selectedNote) return;
    if (!checkPlate || !checkQty || !checkSeal) {
      showToast('warning', 'Bảo vệ vui lòng tích xác nhận đầy đủ các bước kiểm soát cổng!');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await outboundApi.gateOutDeliveryNote({
        DeliveryNoteNo: selectedNote.delivery_note_no,
        DriverName: driverName || 'Tài xế giao hàng',
        SealNo: sealNo || 'SEAL-' + Math.floor(100000 + Math.random() * 900000),
        GateNote: gateNote || 'Bảo vệ cổng đã kiểm đếm đúng và kẹp niêm phong cho xe xuất bến.'
      });
      showToast('success', res?.message || 'Xác nhận cho xe xuất bến thành công!');
      setShowGateModal(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      showToast('error', 'Lỗi: ' + (err.message || 'Thất bại'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    const matchSearch = (n.delivery_note_no || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (n.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (n.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (activeTab === 'STOREKEEPER') return n.status === 'PICKED';
    if (activeTab === 'GATE') return n.status === 'STAGED';
    if (activeTab === 'SHIPPED') return n.status === 'SHIPPED';
    return true;
  });

  const countPicked = notes.filter(n => n.status === 'PICKED').length;
  const countStaged = notes.filter(n => n.status === 'STAGED').length;
  const countShipped = notes.filter(n => n.status === 'SHIPPED').length;

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button onClick={onBack} className="btn-icon" title="Quay về trang chủ">
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={32} color="#0284c7" /> TRẠM DUYỆT XUẤT & KIỂM CỔNG BẢO VỆ
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
              Giao diện dành riêng cho Thủ Kho ký duyệt xuất kho & Bảo vệ cổng kiểm soát xe xuất bến (UC16)
            </p>
          </div>
        </div>

        <button className="btn btn-outline" onClick={fetchNotes} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Làm Mới
        </button>
      </div>

      {/* Thống kê chỉ số nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #0284c7', backgroundColor: '#f0f9ff' }}>
          <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>1. CHỜ THỦ KHO DUYỆT</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>{countPicked} Phiếu</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đã soạn hàng xong (PICKED)</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #f59e0b', backgroundColor: '#fef3c7' }}>
          <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>2. CHỜ BẢO VỆ KIỂM CỔNG</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{countStaged} Chuyến Xe</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Đang ở bãi xuất (STAGED)</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '5px solid #10b981', backgroundColor: '#f0fdf4' }}>
          <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>3. ĐÃ XUẤT BẾN HÔM NAY</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>{countShipped} Chuyến Xe</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hoàn tất xuất bến (SHIPPED)</span>
        </div>
      </div>

      {/* Tabs Chức Năng & Thanh Tìm Kiếm */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${activeTab === 'STOREKEEPER' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('STOREKEEPER')}
              style={{ backgroundColor: activeTab === 'STOREKEEPER' ? '#0284c7' : 'transparent', borderColor: '#0284c7', color: activeTab === 'STOREKEEPER' ? '#fff' : '#0284c7', fontWeight: 700 }}
            >
              <Key size={18} style={{ marginRight: 6 }} /> 🔑 1. Thủ Kho Duyệt Xuất Kho ({countPicked})
            </button>

            <button 
              className={`btn ${activeTab === 'GATE' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('GATE')}
              style={{ backgroundColor: activeTab === 'GATE' ? '#d97706' : 'transparent', borderColor: '#d97706', color: activeTab === 'GATE' ? '#fff' : '#d97706', fontWeight: 700 }}
            >
              <ShieldCheck size={18} style={{ marginRight: 6 }} /> 🛡️ 2. Bảo Vệ Kiểm Cổng Xuất Bến ({countStaged})
            </button>

            <button 
              className={`btn ${activeTab === 'SHIPPED' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('SHIPPED')}
              style={{ backgroundColor: activeTab === 'SHIPPED' ? '#16a34a' : 'transparent', borderColor: '#16a34a', color: activeTab === 'SHIPPED' ? '#fff' : '#16a34a', fontWeight: 700 }}
            >
              <Truck size={18} style={{ marginRight: 6 }} /> 🚛 3. Lịch Sử Xe Đã Xuất Bến ({countShipped})
            </button>
          </div>

          {/* Ô Tìm Kiếm */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Tìm số phiếu, biển số xe..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem', width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Danh Sách Phiếu Xuất */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <RefreshCw className="animate-spin" size={36} color="var(--primary)" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3>Không có phiếu xuất nào thuộc mục này</h3>
          <p style={{ fontSize: '0.9rem' }}>Vui lòng chọn tab khác hoặc cập nhật lại bộ lọc tìm kiếm.</p>
        </div>
      ) : (
        <div className="table-container" style={{ maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table className="data-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <tr>
                <th style={{ backgroundColor: '#f8fafc' }}>STT</th>
                <th style={{ backgroundColor: '#f8fafc' }}>Số Phiếu Xuất</th>
                <th style={{ backgroundColor: '#f8fafc' }}>Biển Số Xe Tải</th>
                <th style={{ backgroundColor: '#f8fafc' }}>Khách Hàng</th>
                <th style={{ textAlign: 'right', backgroundColor: '#f8fafc' }}>Tổng Số Lượng</th>
                <th style={{ backgroundColor: '#f8fafc' }}>Trạng Thái</th>
                <th style={{ backgroundColor: '#f8fafc' }}>Nhật Ký Ký Duyệt & Kiểm Cổng</th>
                <th style={{ textAlign: 'center', backgroundColor: '#f8fafc' }}>Thao Tác Ký Duyệt</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note, idx) => (
                <tr key={idx} style={{ backgroundColor: note.status === 'STAGED' ? '#fffbeb' : note.status === 'SHIPPED' ? '#f0fdf4' : 'transparent' }}>
                  <td>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{note.delivery_note_no}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      🚛 {note.license_plate}
                    </span>
                  </td>
                  <td>{note.customer_name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {Math.round(note.total_qty || 0).toLocaleString('vi-VN')} SP
                  </td>
                  <td>
                    <span className={`badge ${
                      note.status === 'PICKED' ? 'badge-warning' :
                      note.status === 'STAGED' ? 'badge-info' :
                      note.status === 'SHIPPED' ? 'badge-success' : 'badge-neutral'
                    }`}>
                      {note.status === 'PICKED' ? 'CHỜ THỦ KHO DUYỆT' :
                       note.status === 'STAGED' ? 'CHỜ BẢO VỆ KIỂM CỔNG' :
                       note.status === 'SHIPPED' ? 'ĐÃ XUẤT BẾN' : note.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {note.approved_by && (
                      <div style={{ color: '#0369a1' }}>
                        🔑 <strong>Thủ Kho:</strong> {note.approved_by} ({new Date(note.approved_at).toLocaleTimeString('vi-VN')})
                      </div>
                    )}
                    {note.security_checked_by && (
                      <div style={{ color: '#15803d', marginTop: '0.2rem' }}>
                        🛡️ <strong>Bảo Vệ:</strong> {note.security_checked_by} | Lái xe: {note.driver_name} | Niêm phong: {note.seal_no}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {note.status === 'PICKED' && (
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                        onClick={() => handleSelectNote(note, 'STOREKEEPER')}
                      >
                        🔑 Thủ Kho Ký Duyệt
                      </button>
                    )}

                    {note.status === 'STAGED' && (
                      <button 
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#d97706', borderColor: '#d97706' }}
                        onClick={() => handleSelectNote(note, 'GATE')}
                      >
                        🛡️ Bảo Vệ Kiểm Cổng
                      </button>
                    )}

                    {note.status === 'SHIPPED' && (
                      <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>
                        ✅ Đã Xuất Bến
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: THỦ KHO KÝ DUYỆT XÁC NHẬN XUẤT KHO */}
      {showStorekeeperModal && selectedNote && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Key size={30} color="#0284c7" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    BẢNG KÝ DUYỆT XUẤT KHO CỦA THỦ KHO
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Đổi soát số lượng thực tế đã soạn và xác nhận cho phép xuất bến
                  </span>
                </div>
              </div>
              <button onClick={() => setShowStorekeeperModal(false)} className="btn-icon">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Thống kê phiếu */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #0284c7' }}>
                <div>Số Phiếu: <strong style={{ color: 'var(--primary-color)' }}>{selectedNote.delivery_note_no}</strong></div>
                <div>Xe Tải: <strong style={{ color: '#0369a1' }}>{selectedNote.license_plate}</strong></div>
                <div>Khách Hàng: <strong>{selectedNote.customer_name}</strong></div>
              </div>

              {/* Bảng chi tiết mặt hàng */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  📋 Bảng Danh Sách Sản Phẩm Đã Soạn Đủ:
                </h4>
                {loadingDetails ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}><RefreshCw className="animate-spin" size={24} /></div>
                ) : (
                  <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Mã Sản Phẩm</th>
                          <th>Kênh</th>
                          <th style={{ textAlign: 'right' }}>SL Yêu Cầu</th>
                          <th style={{ textAlign: 'right' }}>SL Thực Xuất</th>
                          <th style={{ textAlign: 'center' }}>Đổi Soát</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(noteDetails?.details || []).map((item, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 700 }}>{item.product_code}</td>
                            <td>{item.channel_code}</td>
                            <td style={{ textAlign: 'right' }}>{Math.round(item.qty).toLocaleString('vi-VN')}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{Math.round(item.picked_qty).toLocaleString('vi-VN')}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                ✅ ĐỦ 100%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Nhập ghi chú chữ ký Thủ kho */}
              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Ghi Chú Ký Duyệt Của Thủ Kho:</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="Nhập ghi chú đối soát hoặc xác nhận của Thủ Kho..."
                  value={storekeeperNote}
                  onChange={(e) => setStorekeeperNote(e.target.value)}
                  style={{ padding: '0.75rem', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowStorekeeperModal(false)}>Hủy Bỏ</button>
                <button 
                  className="btn btn-primary"
                  disabled={isProcessing}
                  onClick={handleStorekeeperApprove}
                  style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                >
                  <CheckCircle size={18} style={{ marginRight: 6 }} /> {isProcessing ? 'Đang ký duyệt...' : '✅ KÝ DUYỆT XÁC NHẬN XUẤT KHO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BẢO VỆ KIỂM CỔNG XUẤT BẾN */}
      {showGateModal && selectedNote && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #d97706', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={32} color="#d97706" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    BẢO VỆ KIỂM CỔNG XUẤT BẾN (GATE RELEASE)
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Kiểm tra niêm phong xe tải, tài xế và chốt cho xe xuất bến
                  </span>
                </div>
              </div>
              <button onClick={() => setShowGateModal(false)} className="btn-icon">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Thống kê chuyến xe */}
              <div style={{ backgroundColor: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <div>Biển Số Xe Tải: <strong style={{ color: '#d97706', fontSize: '1.1rem' }}>🚛 {selectedNote.license_plate}</strong></div>
                  <div>Mã Phiếu Xuất: <strong>{selectedNote.delivery_note_no}</strong></div>
                  <div>Khách Hàng: <strong>{selectedNote.customer_name}</strong></div>
                  <div>Tổng Số Lượng: <strong style={{ color: '#16a34a' }}>{Math.round(selectedNote.total_qty || 0)} SP</strong></div>
                </div>
              </div>

              {/* Danh mục Bảo vệ kiểm đếm */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  🛡️ Danh Mục Bảo Vệ Kiểm Cổng:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkPlate} onChange={(e) => setCheckPlate(e.target.checked)} />
                    <span>1. Đối soát khớp biển số xe tải <strong>{selectedNote.license_plate}</strong></span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkQty} onChange={(e) => setCheckQty(e.target.checked)} />
                    <span>2. Kiểm đếm đủ số lượng kiện/thùng xếp trên thùng xe</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkSeal} onChange={(e) => setCheckSeal(e.target.checked)} />
                    <span>3. Đã kẹp niêm phong chì chốt cửa xe an toàn</span>
                  </label>
                </div>
              </div>

              {/* Thông tin Tài Xế & Niêm Phong */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Tên Tài Xế / Lái Xe:</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Mã Niêm Phong / Seal Xe:</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ví dụ: SEAL-998811"
                    value={sealNo}
                    onChange={(e) => setSealNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Ghi Chú Kiểm Cổng Của Bảo Vệ:</label>
                <textarea 
                  className="form-control" 
                  rows="2" 
                  placeholder="Ghi chú thêm của bảo vệ cổng (nếu có)..."
                  value={gateNote}
                  onChange={(e) => setGateNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowGateModal(false)}>Hủy Bỏ</button>
                <button 
                  className="btn btn-primary"
                  disabled={isProcessing}
                  onClick={handleGateCheckRelease}
                  style={{ backgroundColor: '#d97706', borderColor: '#d97706', padding: '0.6rem 1.25rem', fontWeight: 700 }}
                >
                  <ShieldCheck size={18} style={{ marginRight: 6 }} /> {isProcessing ? 'Đang xử lý...' : '🛡️ BẢO VỆ XÁC NHẬN CHO XE XUẤT BẾN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
