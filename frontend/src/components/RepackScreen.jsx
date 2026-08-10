import React, { useState, useRef, useEffect } from 'react';
import { QrCode, ArrowLeft, Printer, RefreshCcw } from 'lucide-react';
import { packingApi } from '../features/packing/api/packingApi.js';
import { printService } from '../integrations/deviceAgent/printService.js';
import { scaleService } from '../integrations/deviceAgent/scaleService.js';

export default function RepackScreen({ onBack }) {
  const [packType, setPackType] = useState('TRADITIONAL'); 
  const [pack360Id, setPack360Id] = useState(null);
  const [scannedUnits, setScannedUnits] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [weight, setWeight] = useState(null);
  const [printData, setPrintData] = useState(null); 
  const [isManualWeight, setIsManualWeight] = useState(false);
  const [manualWeightValue, setManualWeightValue] = useState(''); 
  const [oemOrderNo, setOemOrderNo] = useState('');
  const [releaseReason, setReleaseReason] = useState('');
  const [releaseInput, setReleaseInput] = useState('');
  const [detachPackId, setDetachPackId] = useState('');
  const [detachUnits, setDetachUnits] = useState([]);
  const [selectedDetachUnitIds, setSelectedDetachUnitIds] = useState([]);
  const [detachReason, setDetachReason] = useState('');

  const scanInputRef = useRef(null);

  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      setStatusMsg({ text: 'Đang xử lý...', type: 'info' });
      
      const res = await packingApi.scanUnit({
        pack360_id: pack360Id,
        qr_60: scanInput.trim(),
        packing_standard_type: 'TRADITIONAL',
        is_repack: true
      });

      const data = res?.data !== undefined ? res.data : res;
      if (!pack360Id && data.pack360_id) setPack360Id(data.pack360_id);
      
      setScannedUnits(prev => [{ qr: scanInput.trim(), time: new Date().toLocaleTimeString() }, ...prev]);
      setStatusMsg({ text: `Thành công. Đã quét ${data.actual_unit_count || scannedUnits.length + 1} thùng.`, type: 'success' });
    } catch (error) {
      setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
    } finally {
      setScanInput('');
      scanInputRef.current?.focus();
    }
  };

  const getWeightFromScale = async () => {
    try {
      setStatusMsg({ text: 'Đang kết nối cân...', type: 'info' });
      const data = await scaleService.readWeight();
      const scaleWeight = data.weight || 0;
      setWeight(scaleWeight);
      if (data.stale || !data.isStable) {
        setStatusMsg({ text: 'Dữ liệu cân chưa ổn định hoặc đã cũ.', type: 'error' });
        return null;
      }
      setStatusMsg({ text: `Đã lấy cân nặng: ${scaleWeight} kg`, type: 'success' });
      return scaleWeight;
    } catch (error) {
      setStatusMsg({ text: 'Lỗi kết nối cân IoT. Vui lòng kiểm tra Local Bridge.', type: 'error' });
      return null;
    }
  };

  const generateTSPL = (data) => {
    if (data.label_tspl || data.label_data) return data.label_tspl || data.label_data;

    const { pack360_qr, weight, units } = data;
    
    let tspl = `SIZE 78 mm,40 mm\nGAP 2 mm,0\nDIRECTION 1\nCLS\n`;
    tspl += `TEXT 320,24,"2",0,1,1,"ID:"\nBOX 385,9,460,58,3\nTEXT 395,30,"2",0,1,1,"5567"\nTEXT 500,30,"2",0,1,1,"PASSED"\n`;
    tspl += `TEXT 155,65,"2",0,1,1,"Weight (Kg) :"\nTEXT 200,100,"5",0,1,1,"${weight}"\nTEXT 170,160,"4",0,1,1,"000/26XK"\n`;
    tspl += `TEXT 5,250,"3",0,1,1,"${pack360_qr}"\nQRCODE 20,60,M,5,A,0,"${pack360_qr}"\nQRCODE 480,60,M,5,A,0,"${pack360_qr}"\nPRINT 1\n`;

    tspl += `SIZE 78 mm,40 mm\nGAP 2 mm,0\nDIRECTION 1\nCLS\n`;
    tspl += `TEXT 320,24,"2",0,1,1,"ID:"\nBOX 385,24,470,50,2\nTEXT 395,30,"2",0,1,1,"5567"\nTEXT 500,30,"2",0,1,1,"PASSED"\n`;

    let y = 65;
    units.slice(0, 6).forEach(u => {
      tspl += `TEXT 145,${y},"3",0,1,1,"${u}"\n`;
      y += 35;
    });

    tspl += `QRCODE 20,60,M,4,A,0,"${pack360_qr}"\nPRINT 1\n`;
    return tspl;
  };

  const handlePrint = async (dataToPrint) => {
    try {
      const tsplCommand = generateTSPL(dataToPrint);
      await printService.printLabel(tsplCommand, 'DEFAULT_PRINTER', dataToPrint?.print_job_id);
      setStatusMsg({ text: 'Đã gửi lệnh in 2 tem thành công.', type: 'success' });
    } catch (error) {
      setStatusMsg({ text: 'Gửi lệnh in thất bại. Đảm bảo Local Bridge đang chạy.', type: 'error' });
    }
  };

  const handleComplete = async () => {
    if (!pack360Id) return;
    
    let scaleWeight = null;
    let weightSource = 'SCALE';
    let manualReason = '';
    
    if (isManualWeight) {
      scaleWeight = parseFloat(manualWeightValue);
      if (isNaN(scaleWeight) || scaleWeight <= 0) {
        setStatusMsg({ text: 'Vui lòng nhập trọng lượng hợp lệ!', type: 'error' });
        return;
      }
      weightSource = 'MANUAL';
      manualReason = window.prompt('Vui lòng nhập lý do nhập tay trọng lượng:') || '';
      if (!manualReason.trim()) {
        setStatusMsg({ text: 'Bắt buộc nhập lý do khi cân thủ công!', type: 'error' });
        return;
      }
    } else {
      scaleWeight = await getWeightFromScale();
      if (scaleWeight === null) {
        setStatusMsg({ text: 'Không lấy được cân IoT. Vui lòng chuyển sang NHẬP THỦ CÔNG.', type: 'warning' });
        return;
      }
    }

    try {
      setStatusMsg({ text: 'Đang chốt thùng...', type: 'info' });

      const res = await packingApi.completeRepack({
        pack360_id: pack360Id,
        weight: scaleWeight,
        weight_source: weightSource,
        manual_weight_reason: manualReason
      });

      const payload = res?.data !== undefined ? res.data : res;
      setPrintData(payload);
      await handlePrint(payload);
      
      setPack360Id(null);
      setScannedUnits([]);
      setWeight(null);
    } catch (error) {
      setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
    }
  };

  const handleReset = async () => {
    if (pack360Id) {
      const confirmReset = window.confirm('Bạn có chắc chắn muốn hủy phiên đóng gói này và giải phóng các thùng đã quét không?');
      if (!confirmReset) return;

      try {
        setStatusMsg({ text: 'Đang hủy thao tác...', type: 'info' });
        await packingApi.cancelPack({
          pack360_id: pack360Id
        });
        setStatusMsg({ text: 'Đã hủy thao tác thành công.', type: 'success' });
      } catch (error) {
        setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
        return;
      }
    }
    
    setPack360Id(null);
    setScannedUnits([]);
    setWeight(null);
    setPrintData(null);
    setOemOrderNo('');
    setReleaseReason('');
    setReleaseInput('');
    setDetachPackId('');
    setDetachUnits([]);
    setSelectedDetachUnitIds([]);
    setDetachReason('');
    if (!pack360Id) {
      setStatusMsg({ text: 'Đã làm mới màn hình.', type: 'success' });
    }
    scanInputRef.current?.focus();
  };

  const handleRelease = async (e) => {
    e.preventDefault();
    if (!releaseInput.trim() || !releaseReason.trim()) {
      setStatusMsg({ text: 'Vui lòng nhập mã Pack360 và lý do giải phóng.', type: 'error' });
      return;
    }

    const confirmMsg = "CẢNH BÁO: Vui lòng gạch bỏ hoặc bóc tem mã vạch Pack360 cũ trước khi xác nhận. Bạn đã thực hiện việc này chưa?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setStatusMsg({ text: 'Đang giải phóng...', type: 'info' });

      const res = await packingApi.releasePack({
        pack360_id: releaseInput.trim(),
        reason: releaseReason.trim()
      });

      setStatusMsg({ text: res?.message || 'Giải phóng Kiện 360 thành công.', type: 'success' });
      setReleaseInput('');
      setReleaseReason('');
    } catch (error) {
      setStatusMsg({ text: `Lỗi: ${error.message}`, type: 'error' });
    }
  };

  const fetchDetachPack = async (e) => {
    e.preventDefault();
    if (!detachPackId.trim()) return;
    try {
      setStatusMsg({ text: 'Đang tải thông tin kiện...', type: 'info' });
      const res = await axios.get(`/api/pack360/${encodeURIComponent(detachPackId.trim())}`);
      if (res.data.status === 'SUCCESS') {
        const pack = res.data.pack360;
        if (pack.status !== 'COMPLETED') {
           setStatusMsg({ text: `Kiện 360 đang ở trạng thái ${pack.status}. Chỉ có thể tách thùng từ kiện COMPLETED.`, type: 'error' });
           setDetachUnits([]);
           return;
        }
        setDetachUnits(res.data.units);
        setSelectedDetachUnitIds([]);
        setStatusMsg({ text: `Đã tải thông tin kiện. Chọn các thùng cần tách.`, type: 'success' });
      } else {
        setStatusMsg({ text: res.data.message, type: 'error' });
      }
    } catch (error) {
        setStatusMsg({ text: `Lỗi: ${error.response?.data?.message || error.message}`, type: 'error' });
    }
  }

  const handleDetachSubmit = async () => {
    if (selectedDetachUnitIds.length === 0) {
      setStatusMsg({ text: 'Vui lòng chọn ít nhất 1 thùng để tách.', type: 'error' });
      return;
    }
    if (!detachReason.trim()) {
      setStatusMsg({ text: 'Vui lòng nhập lý do tách thùng.', type: 'error' });
      return;
    }

    try {
      setStatusMsg({ text: 'Đang tách thùng...', type: 'info' });
      const user = JSON.parse(localStorage.getItem('wms_user')) || { username: 'testuser' };
      
      const res = await axios.post('/api/pack360/detach-units', {
        pack360_id: detachPackId.trim(),
        unit_ids: selectedDetachUnitIds,
        reason: detachReason.trim(),
        user_code: user.username
      });

      if (res.data.status === 'SUCCESS') {
        setStatusMsg({ text: res.data.message, type: 'success' });
        setDetachUnits([]);
        setSelectedDetachUnitIds([]);
        setDetachReason('');
        setDetachPackId('');
      } else {
        setStatusMsg({ text: res.data.message, type: 'error' });
      }
    } catch (error) {
        setStatusMsg({ text: `Lỗi: ${error.response?.data?.message || error.message}`, type: 'error' });
    }
  };

  const toggleDetachUnit = (id_60) => {
    setSelectedDetachUnitIds(prev => 
      prev.includes(id_60) ? prev.filter(id => id !== id_60) : [...prev, id_60]
    );
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 100px)', background: '#fff', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-color)', color: '#fff', padding: '15px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={24} />
            </button>
          )}
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Khu Vực Đóng Gói Lại (REPACK BIN)</h2>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, padding: '20px', gap: '20px' }}>
        
        {/* LỚP TRÁI: ĐIỀU KHIỂN & THÔNG TIN */}
        <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: '15px' }}>

              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#495057', fontSize: '16px' }}>Nhập mã QR Thùng 60</h3>
                <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <QrCode size={20} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6c757d' }} />
                    <input
                      ref={scanInputRef}
                      type="text"
                      value={scanInput}
                      onChange={(e) => setScanInput(e.target.value)}
                      placeholder="Quét mã vạch..."
                      style={{ width: '100%', padding: '12px 12px 12px 40px', fontSize: '16px', border: '2px solid #ced4da', borderRadius: '6px', outline: 'none' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    style={{ padding: '0 25px', fontSize: '16px', fontWeight: 600, background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Quét
                  </button>
                </form>
                
                {statusMsg.text && (
                  <div style={{ marginTop: '15px', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
                    background: statusMsg.type === 'error' ? '#f8d7da' : statusMsg.type === 'warning' ? '#fff3cd' : '#d1e7dd',
                    color: statusMsg.type === 'error' ? '#842029' : statusMsg.type === 'warning' ? '#856404' : '#0f5132',
                    border: `1px solid ${statusMsg.type === 'error' ? '#f5c2c7' : statusMsg.type === 'warning' ? '#ffeeba' : '#badbcc'}`
                  }}>
                    {statusMsg.text}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', textAlign: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Trọng Lượng</div>
                     <button 
                       onClick={() => setIsManualWeight(!isManualWeight)}
                       style={{ background: 'transparent', border: '1px solid #ced4da', padding: '2px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer', color: '#495057' }}
                     >
                       {isManualWeight ? 'Dùng Cân IoT' : 'Nhập Thủ Công'}
                     </button>
                  </div>
                  
                  {isManualWeight ? (
                    <div style={{ marginTop: '10px' }}>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={manualWeightValue}
                        onChange={(e) => setManualWeightValue(e.target.value)}
                        placeholder="0.00"
                        style={{ width: '120px', fontSize: '24px', fontWeight: 700, color: 'var(--primary-color)', textAlign: 'center', padding: '5px', border: '2px solid var(--warning-color)', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '16px', color: '#adb5bd', marginLeft: '5px' }}>kg</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--primary-color)', marginTop: '5px' }}>
                      {weight !== null ? `${weight}` : '0.00'} <span style={{ fontSize: '16px', color: '#adb5bd' }}>kg</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                  <div style={{ color: '#6c757d', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}>Tiến Độ Quét</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--success-color)', marginTop: '5px' }}>
                    {scannedUnits.length} <span style={{ fontSize: '16px', color: '#adb5bd' }}>thùng</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ color: '#495057', fontWeight: 600 }}>ID Phiên:</span>
                 <span style={{ fontFamily: 'monospace', fontSize: '15px', background: '#e9ecef', padding: '4px 8px', borderRadius: '4px' }}>
                   {pack360Id || 'Chưa bắt đầu'}
                 </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 'auto' }}>
                <button 
                  onClick={handleComplete} 
                  disabled={!pack360Id}
                  style={{ gridColumn: '1 / -1', padding: '18px', fontSize: '18px', fontWeight: 700, background: !pack360Id ? '#ced4da' : 'var(--success-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: !pack360Id ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'all 0.2s' }}
                >
                  <Printer size={24} />
                  {isManualWeight ? 'CHỐT THÙNG (NHẬP TAY) & IN TEM' : 'CÂN IOT & CHỐT THÙNG (IN TEM)'}
                </button>
                
                <button 
                  onClick={handleReset} 
                  style={{ padding: '12px', fontSize: '15px', fontWeight: 600, background: 'var(--error-color)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <RefreshCcw size={18} /> Làm Mới (Hủy)
                </button>

                <button 
                  onClick={() => handlePrint(printData)} 
                  disabled={!printData}
                  style={{ padding: '12px', fontSize: '15px', fontWeight: 600, background: !printData ? '#e9ecef' : 'var(--warning-color)', color: !printData ? '#adb5bd' : '#fff', border: 'none', borderRadius: '6px', cursor: !printData ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <Printer size={18} /> In Lại Tem Nhất
                </button>
              </div>
        </div>

        {/* LỚP PHẢI: DANH SÁCH & PREVIEW TEM */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ flex: 1, background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #dee2e6', fontWeight: 600, color: '#495057' }}>
              Danh Sách Mã Thùng Đã Quét
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th style={{ padding: '10px 15px', color: '#6c757d', borderBottom: '2px solid #dee2e6', width: '50px' }}>#</th>
                    <th style={{ padding: '10px 15px', color: '#6c757d', borderBottom: '2px solid #dee2e6' }}>Mã QR / ID</th>
                    <th style={{ padding: '10px 15px', color: '#6c757d', borderBottom: '2px solid #dee2e6', width: '100px' }}>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedUnits.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#adb5bd' }}>Chưa có thùng 60 nào được quét.</td>
                    </tr>
                  ) : (
                    scannedUnits.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f3f5', background: i === 0 ? '#f8f9fa' : 'transparent' }}>
                        <td style={{ padding: '10px 15px', color: '#868e96' }}>{scannedUnits.length - i}</td>
                        <td style={{ padding: '10px 15px', fontWeight: 600, color: 'var(--primary-color)' }}>{item.qr}</td>
                        <td style={{ padding: '10px 15px', color: '#868e96' }}>{item.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MÔ PHỎNG TEM */}
          <div style={{ background: '#e9ecef', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
             <div style={{ fontSize: '13px', fontWeight: 600, color: '#6c757d', textTransform: 'uppercase', marginBottom: '10px' }}>Mô phỏng Tem in (Preview)</div>
             <div style={{ display: 'flex', gap: '10px', height: '180px' }}>
               
               {/* Tem 1: Master Label */}
               <div style={{ flex: 1, background: '#fff', borderRadius: '4px', padding: '10px', border: '1px solid #ced4da', position: 'relative', overflow: 'hidden' }}>
                  {printData ? (
                    <>
                      <div style={{ position: 'absolute', right: 10, top: 10, border: '2px solid #000', padding: '2px 10px', fontWeight: 'bold' }}>5567</div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: 30 }}>Weight (Kg) :</div>
                      <div style={{ fontSize: '28px', fontWeight: 900 }}>{printData.weight}</div>
                      <div style={{ fontSize: '11px', marginTop: 5 }}>000/26XK</div>
                      
                      <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <QrCode size={40} />
                        <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', flex: 1 }}>{printData.pack360_qr}</div>
                        <QrCode size={40} />
                      </div>
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '12px' }}>[ Tem Tổng 360 ]</div>
                  )}
               </div>

               {/* Tem 2: Detail Label */}
               <div style={{ flex: 1, background: '#fff', borderRadius: '4px', padding: '10px', border: '1px solid #ced4da', position: 'relative', overflow: 'hidden' }}>
                  {printData ? (
                    <>
                      <div style={{ position: 'absolute', right: 10, top: 10, border: '1px solid #000', padding: '2px 10px', fontWeight: 'bold' }}>5567</div>
                      <div style={{ marginTop: 25, fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {printData.units.slice(0, 6).map((u, i) => (
                          <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u}</div>
                        ))}
                      </div>
                      <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                        <QrCode size={30} />
                      </div>
                    </>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '12px' }}>[ Tem Chi Tiết ]</div>
                  )}
               </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
