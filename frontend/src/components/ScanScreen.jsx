import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Trash2, Zap } from 'lucide-react';
import { receivingApi } from '../features/receiving/api/receivingApi.js';

// Web Audio & Haptic Feedback helper for PDA
const playAudioFeedback = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'VALID') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    }
  } catch (e) {
    console.warn("Audio feedback error:", e);
  }

  // Haptic feedback (Vibration) for Android PDA devices
  try {
    if (navigator.vibrate) {
      if (type === 'VALID') {
        navigator.vibrate(80); // Short pulse
      } else {
        navigator.vibrate([150, 100, 150]); // Error double pulse
      }
    }
  } catch (e) {
    // Ignore vibration errors
  }
};

export default function ScanScreen({ handoverNo: propHandoverNo, lineNo: propLineNo, productCode: propProductCode, onBack }) {
  const routeParams = useParams();
  const [searchParams] = useSearchParams();

  const handoverNo = propHandoverNo || routeParams.handoverNo || searchParams.get('handoverNo');
  const lineNo = propLineNo || routeParams.lineNo || searchParams.get('lineNo');
  const productCode = propProductCode || searchParams.get('productCode') || routeParams.productCode;

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanLogs, setScanLogs] = useState([]); 
  const [isScanning, setIsScanning] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const inputRef = useRef(null);

  const fetchProgress = async () => {
    if (!handoverNo) return;
    setLoading(true);
    try {
      const res = await receivingApi.getHandoverDetails(handoverNo);
      const dataObj = res?.data || res;
      const linesArray = dataObj?.lines || (Array.isArray(dataObj) ? dataObj : []);
      const matchedLine = linesArray.find(l => (l.MaChiTietPhieu || l.handover_line_no || l.id) == lineNo) || linesArray[0];

      if (matchedLine) {
        setProgress({
          SoPhieuNhap: handoverNo,
          MaChiTietPhieu: lineNo,
          MaSanPham: productCode || matchedLine.MaSanPham || matchedLine.product_code,
          SoLuongYeuCau: Number(matchedLine.SoLuongYeuCau || matchedLine.planned_qty || 0),
          SoLuongDaQuet: Number(matchedLine.SoLuongDaQuet || matchedLine.scanned_qty || 0)
        });
      }
    } catch (err) {
      console.error("Lỗi lấy tiến độ quét:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Focus Guard: Giữ con trỏ luôn ở ô nhập mã QR để bóp cò súng quét liên tục
  useEffect(() => {
    if (handoverNo) {
      fetchProgress();
    }
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };
    focusInput();

    // Re-focus on window click to prevent losing focus
    window.addEventListener('click', focusInput);
    return () => {
      window.removeEventListener('click', focusInput);
    };
  }, [handoverNo, lineNo, productCode]);

  useEffect(() => {
    if (!isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  const handleScan = async (qr60) => {
    if (!qr60) return;
    const cleanQr = qr60.trim();
    if (!cleanQr) return;

    setIsScanning(true);
    setInputValue(''); // Reset rỗng ngay lập tức để súng quét không bị dính chữ

    try {
      const res = await receivingApi.scanThung60({ 
        handoverNo: String(handoverNo), 
        lineNo: String(lineNo), 
        productCode: String(productCode), 
        qr60: cleanQr 
      });
      const dataObj = res?.data || res;
      const status = dataObj?.TrangThaiScan || 'VALID';
      const message = dataObj?.KetQuaKiemTra || 'Quét thùng 60 hợp lệ';
      const scanLogId = dataObj?.ScanLogID || dataObj?.scanLogId;

      playAudioFeedback(status);
      
      const newLog = {
        scanLogId,
        qr: cleanQr,
        status: status,
        message: message,
        time: new Date().toLocaleTimeString('vi-VN')
      };
      
      setScanLogs(prev => [newLog, ...prev]);

      // Optimistic update tiến độ
      if (status === 'VALID') {
        setProgress(prev => prev ? { ...prev, SoLuongDaQuet: prev.SoLuongDaQuet + 1 } : prev);
      }
      fetchProgress();
    } catch (err) {
      playAudioFeedback('INVALID');
      const errorLog = {
        qr: cleanQr,
        status: 'INVALID',
        message: err.message || 'Lỗi quét mã thùng 60',
        time: new Date().toLocaleTimeString('vi-VN')
      };
      setScanLogs(prev => [errorLog, ...prev]);
    } finally {
      setIsScanning(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleCancelScan = async (logItem) => {
    if (!logItem.scanLogId) {
      setScanLogs(prev => prev.filter(l => l !== logItem));
      return;
    }
    const reason = window.prompt(`Bạn có chắc muốn Hủy Quét mã thùng ${logItem.qr}?\nVui lòng nhập lý do hủy:`, 'Hủy quét sai thùng');
    if (reason === null) return; // User clicked Cancel

    setCancellingId(logItem.scanLogId);
    try {
      await receivingApi.cancelScan({ scanLogId: logItem.scanLogId, reason: reason });
      setScanLogs(prev => prev.map(l => l.scanLogId === logItem.scanLogId ? { ...l, status: 'CANCELLED', message: `Đã hủy: ${reason}` } : l));
      fetchProgress();
    } catch (err) {
      alert("Lỗi khi hủy quét: " + (err.message || 'Không thể kết nối'));
    } finally {
      setCancellingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(inputValue);
    }
  };

  const percentComplete = progress?.SoLuongYeuCau 
    ? Math.min(100, Math.round(((progress?.SoLuongDaQuet || 0) / progress.SoLuongYeuCau) * 100)) 
    : 0;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}>
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
              Quét QR Thùng 60: <span style={{ color: '#2563eb' }}>{productCode}</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Phiếu: {handoverNo} | Dòng: {lineNo}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#10b981', background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <Zap size={14} /> Chế độ Súng Quét Tự Động
          </span>
          <button onClick={fetchProgress} className="btn-secondary" style={{ padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={16} /> Tải lại
          </button>
        </div>
      </div>

      {/* Progress Box & Visual Progress Bar */}
      <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>TIẾN ĐỘ NHẬP KHO STAGING</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginTop: '2px' }}>
              {progress?.SoLuongDaQuet || 0} / {progress?.SoLuongYeuCau || 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>SP</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>HOÀN THÀNH</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: percentComplete === 100 ? '#10b981' : '#2563eb', marginTop: '2px' }}>
              {percentComplete}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${percentComplete}%`, 
              height: '100%', 
              backgroundColor: percentComplete === 100 ? '#10b981' : '#2563eb',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>
      </div>

      {/* QR Input - 100% Automated Hands-Free Pistol Scanning (Option 2) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
          <span>BÓP CÒ SÚNG QUÉT QR THÙNG 60</span>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
            ⚡ Tự động xử lý 100% khi bóp cò
          </span>
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder={isScanning ? "Đang xử lý dữ liệu..." : "Hướng súng quét vào tem thùng 60 và bóp cò..."}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isScanning}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            style={{ 
              width: '100%', 
              height: '52px', 
              padding: '0 16px', 
              borderRadius: '8px', 
              border: isScanning ? '2px solid #eab308' : '2px solid #2563eb', 
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1e293b',
              outline: 'none',
              boxShadow: isScanning ? '0 0 0 4px rgba(234, 179, 8, 0.2)' : '0 0 0 4px rgba(37, 99, 235, 0.15)',
              backgroundColor: isScanning ? '#fefce8' : '#ffffff',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* Recent Scan History */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem' }}>Nhật Ký Quét Tem Vừa Thực Hiện</h4>
        {scanLogs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '6px' }}>
            Hướng súng quét vào tem thùng 60 và bóp cò để nhập hàng liên tục.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scanLogs.map((log, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  backgroundColor: log.status === 'VALID' ? '#dcfce7' : log.status === 'CANCELLED' ? '#f1f5f9' : '#fee2e2', 
                  color: log.status === 'VALID' ? '#166534' : log.status === 'CANCELLED' ? '#64748b' : '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  {log.status === 'VALID' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{log.qr}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>({log.time})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 500 }}>{log.message}</span>
                  {log.status === 'VALID' && (
                    <button
                      onClick={() => handleCancelScan(log)}
                      disabled={cancellingId === log.scanLogId}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                      title="Hủy lượt quét này"
                    >
                      <Trash2 size={12} /> Hủy Quét
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
