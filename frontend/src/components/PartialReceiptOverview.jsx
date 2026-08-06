import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, CheckSquare, Square, CheckCircle, RefreshCw } from 'lucide-react';
import { receivingApi } from '../features/receiving/api/receivingApi.js';
import StorekeeperConfirmList from './StorekeeperConfirmList.jsx';

export default function PartialReceiptOverview({ handover: initialHandover, onBack }) {
  const routeParams = useParams();
  const handoverNoFromUrl = routeParams.handoverNo;

  const [selectedHandover, setSelectedHandover] = useState(
    initialHandover || (handoverNoFromUrl ? { SoPhieuNhap: handoverNoFromUrl } : null)
  );
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [selectedLines, setSelectedLines] = useState([]);

  useEffect(() => {
    if (initialHandover) {
      setSelectedHandover(initialHandover);
    } else if (handoverNoFromUrl) {
      setSelectedHandover({ SoPhieuNhap: handoverNoFromUrl });
    }
  }, [initialHandover, handoverNoFromUrl]);

  useEffect(() => {
    if (selectedHandover && selectedHandover.SoPhieuNhap) {
      fetchLines();
    }
  }, [selectedHandover]);

  const getDemoLines = (no) => [
    { MaChiTietPhieu: 'CT-01', MaSanPham: 'SP-OEM-101', SoLuongCanNhap: 120, SoLuongDaQuetHopLe: 120, TrangThaiSoLuong: 'Đủ số lượng' },
    { MaChiTietPhieu: 'CT-02', MaSanPham: 'SP-OEM-102', SoLuongCanNhap: 180, SoLuongDaQuetHopLe: 120, TrangThaiSoLuong: 'Chưa đủ số lượng' },
    { MaChiTietPhieu: 'CT-03', MaSanPham: 'SP-OEM-103', SoLuongCanNhap: 60, SoLuongDaQuetHopLe: 0, TrangThaiSoLuong: 'Chưa đủ số lượng' }
  ];

  const fetchLines = async () => {
    if (!selectedHandover || !selectedHandover.SoPhieuNhap) return;
    setLoading(true);
    try {
      const res = await receivingApi.getConfirmHandoverLines(selectedHandover.SoPhieuNhap);
      const rawData = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);

      if (list.length > 0) {
        setLines(list);
      } else {
        setLines([]);
      }
      setSelectedLines([]); 
    } catch (err) {
      console.warn("Fetch lines error:", err);
      setLines([]);
      setSelectedLines([]);
    } finally {
      setLoading(false);
    }
  };

  // If no handover is selected yet, render list screen!
  if (!selectedHandover) {
    return (
      <StorekeeperConfirmList 
        onSelectHandover={(h) => setSelectedHandover(h)} 
        onBack={onBack}
      />
    );
  }

  const unfulfilledLines = lines.filter(l => (l.SoLuongCanNhap || 0) > (l.SoLuongDaQuetHopLe || 0));

  const toggleSelectAll = () => {
    if (selectedLines.length === unfulfilledLines.length) {
      setSelectedLines([]);
    } else {
      setSelectedLines(unfulfilledLines.map(l => l.MaChiTietPhieu));
    }
  };

  const toggleSelectLine = (lineNo) => {
    if (selectedLines.includes(lineNo)) {
      setSelectedLines(selectedLines.filter(id => id !== lineNo));
    } else {
      setSelectedLines([...selectedLines, lineNo]);
    }
  };

  // Thao tác Nhập Lẻ Lô (Tự động tạo thùng ảo cho tất cả các dòng đã chọn)
  const handleBatchPartialReceipt = async () => {
    if (selectedLines.length === 0) {
      alert('Vui lòng chọn ít nhất một dòng cần nhập lẻ!');
      return;
    }

    const payloadLines = lines
      .filter(l => selectedLines.includes(l.MaChiTietPhieu))
      .map(l => ({
        lineNo: String(l.MaChiTietPhieu),
        looseQty: Number((l.SoLuongCanNhap || 0) - (l.SoLuongDaQuetHopLe || 0))
      }));

    setIsConfirming(true);
    try {
      await receivingApi.confirmNhapLeBatch({
        handoverNo: String(selectedHandover.SoPhieuNhap),
        lines: payloadLines,
        partnerName: String(partnerName || '')
      });

      alert(`Đã xác nhận nhập lẻ thành công cho ${payloadLines.length} dòng (hệ thống tự động tạo thùng ảo)!`);
      fetchLines(); 
    } catch (err) {
      alert(`Lỗi nhập lẻ: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // Thao tác Nhập Lẻ Trực Tiếp 1 Dòng
  const handleSinglePartialReceipt = async (line) => {
    const looseQty = (line.SoLuongCanNhap || 0) - (line.SoLuongDaQuetHopLe || 0);
    if (looseQty <= 0) return;

    setIsConfirming(true);
    try {
      await receivingApi.confirmNhapLe({
        handoverNo: String(selectedHandover.SoPhieuNhap),
        lineNo: String(line.MaChiTietPhieu),
        looseQty: Number(looseQty),
        partnerName: String(partnerName || '')
      });

      alert(`Nhập lẻ dòng ${line.MaChiTietPhieu} thành công! Hệ thống đã tự động tạo thùng ảo.`);
      fetchLines();
    } catch (err) {
      alert(`Lỗi nhập lẻ dòng ${line.MaChiTietPhieu}: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackToList = () => {
    if (initialHandover && onBack) {
      onBack();
    } else {
      setSelectedHandover(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn btn-back" 
          onClick={handleBackToList}
          style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
        >
          <ArrowLeft size={16} /> Danh sách phiếu
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Họ tên người giao/nhận..."
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            style={{ width: '250px', height: '40px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
          />

          <button
            className="btn btn-primary"
            disabled={selectedLines.length === 0 || isConfirming}
            onClick={handleBatchPartialReceipt}
            style={{ 
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: selectedLines.length > 0 ? '#d97706' : '#cbd5e1',
              color: 'white',
              fontWeight: 700,
              cursor: selectedLines.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            {isConfirming ? 'Đang xử lý...' : `Đồng Ý Nhập Lẻ (${selectedLines.length} dòng - Tự Tạo Thùng Ảo)`}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ borderTop: '4px solid #d97706', padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="card-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
              Phiếu Nhập Lẻ: {selectedHandover.SoPhieuNhap}
            </h2>
            <div style={{ display: 'flex', gap: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
              <div>Tổng số dòng: <strong style={{ color: '#1e293b' }}>{selectedHandover.SoDongCanDuyet || lines.length}</strong></div>
              <div>Tổng SL cần nhập: <strong style={{ color: '#1e293b' }}>{selectedHandover.TongSoLuongCanNhap || 0}</strong></div>
              <div>Tổng SL đã quét: <strong style={{ color: '#2563eb' }}>{selectedHandover.TongSoLuongDaQuetHopLe || 0}</strong></div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Package size={32} />
          </div>
        </div>
        
        {selectedHandover.TrangThaiSoLuong !== 'Đủ số lượng' && (
          <div style={{ marginTop: '1.25rem', padding: '12px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center', color: '#d97706', fontSize: '0.9rem' }}>
            <AlertTriangle size={20} />
            <span>
              Hướng dẫn: Tích chọn các dòng cần nhập lẻ bên dưới, sau đó bấm nút <strong>"Đồng Ý Nhập Lẻ"</strong> ở góc trên. Hệ thống sẽ tự động tạo thùng ảo cho số lượng còn thiếu!
            </span>
          </div>
        )}
      </div>

      {/* Detail Lines Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
            Chi tiết các dòng ({lines.length})
          </h3>

          {unfulfilledLines.length > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={toggleSelectAll}
              style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
            >
              {selectedLines.length === unfulfilledLines.length ? <CheckSquare size={16} color="#2563eb" /> : <Square size={16} />}
              {selectedLines.length === unfulfilledLines.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả dòng chưa đủ'}
            </button>
          )}
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải chi tiết dòng...</div>
        ) : lines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Không có dòng chi tiết nào trong phiếu này</div>
        ) : (
          <div className="data-table-container">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ width: '40px', textAlign: 'center' }}>Chọn</th>
                  <th style={{ padding: '12px 16px' }}>Mã Dòng</th>
                  <th style={{ padding: '12px 16px' }}>Mã Sản Phẩm</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Cần Nhập</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Đã Quét (Hợp lệ)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Còn Thiếu</th>
                  <th style={{ padding: '12px 16px' }}>Trạng Thái</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Thao Tác Nhập Lẻ</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const isUnfulfilled = (line.SoLuongCanNhap || 0) > (line.SoLuongDaQuetHopLe || 0);
                  const isChecked = selectedLines.includes(line.MaChiTietPhieu);
                  const looseQty = (line.SoLuongCanNhap || 0) - (line.SoLuongDaQuetHopLe || 0);

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isChecked ? '#fffbe6' : 'transparent' }}>
                      <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                        {isUnfulfilled ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectLine(line.MaChiTietPhieu)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        ) : (
                          <CheckCircle size={18} color="#166534" />
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}><strong>{line.MaChiTietPhieu}</strong></td>
                      <td style={{ padding: '12px 16px' }}>{line.MaSanPham}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>{line.SoLuongCanNhap}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}><strong style={{ color: '#2563eb' }}>{line.SoLuongDaQuetHopLe}</strong></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}><strong style={{ color: looseQty > 0 ? '#d97706' : '#166534' }}>{looseQty > 0 ? looseQty : 0}</strong></td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 10px', 
                          borderRadius: '12px',
                          backgroundColor: line.TrangThaiSoLuong === 'Đủ số lượng' ? '#dcfce7' : '#fef3c7',
                          color: line.TrangThaiSoLuong === 'Đủ số lượng' ? '#166534' : '#92400e',
                          fontWeight: 600
                        }}>
                          {line.TrangThaiSoLuong || (looseQty > 0 ? 'Chưa đủ số lượng' : 'Đủ số lượng')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {isUnfulfilled && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 12px', fontSize: '0.85rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => handleSinglePartialReceipt(line)}
                            disabled={isConfirming}
                          >
                            Nhập Lẻ Ngay ({looseQty})
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
