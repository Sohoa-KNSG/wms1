import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';

export default function StockIssueVoucherModal({ isOpen, onClose, voucherData }) {
  const printRef = useRef();

  if (!isOpen || !voucherData) return null;

  const {
    documentNo = '717',
    date = '29 tháng 06 năm 2026',
    vehicleNo = 'Xe 51M-860.42 + 51C-346.20',
    deliveryNotes = 'NP: 000.137 + 000.138 / 000.139 + 000.140',
    recipientName = 'CÔNG TY CỔ PHẦN KỀM NGHĨA',
    recipientAddress = 'Địa chỉ (bộ phận): Kênh GT Chao ba',
    reason = 'Bán hàng cho CTy Kềm Nghĩa (kênh GT Chao ba)',
    warehouseName = 'Kho thành phẩm - TP1',
    creatorName = 'Nguyễn Thị Thanh Vân',
    receiverName = 'Huy',
    items = []
  } = voucherData;

  // Sample items if none passed
  const displayItems = items.length > 0 ? items : [
    { stt: 1, name: 'Kềm da inox bao simili D-01 (12)', code: '02010101010014', uom: 'Cây', reqQty: 1800, actQty: 1800, price: 0, amount: 0 },
    { stt: 2, name: 'Kềm da inox bao simili D-01 (14)', code: '02010101010014', uom: 'Cây', reqQty: 1800, actQty: 1800, price: 0, amount: 0 },
    { stt: 3, name: 'Kềm da inox bao simili D-01 (16)', code: '02010101010016', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 4, name: 'Kềm da inox bao simili D-03 (12)', code: '02010101010032', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 5, name: 'Kềm da inox bao simili D-03 (14)', code: '02010101010034', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 6, name: 'Kềm da inox bao simili D-03 (16)', code: '02010101010036', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 7, name: 'Kềm da inox bao simili D-04 (12)', code: '02010101010042', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 8, name: 'Kềm da inox bao simili D-04 (14)', code: '02010101010044', uom: 'Cây', reqQty: 1800, actQty: 1800, price: 0, amount: 0 },
    { stt: 9, name: 'Kềm da inox bao simili D-04 (16)', code: '02010101010046', uom: 'Cây', reqQty: 1800, actQty: 1800, price: 0, amount: 0 },
    { stt: 10, name: 'Kềm da inox hộp nhựa D-05V (14)', code: '02020301010008', uom: 'Cây', reqQty: 300, actQty: 300, price: 0, amount: 0 },
    { stt: 11, name: 'Kềm da inox bao simili D-06 (12)', code: '02010101010026', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 12, name: 'Kềm da inox bao simili D-06 (14)', code: '02010101010024', uom: 'Cây', reqQty: 1800, actQty: 1800, price: 0, amount: 0 },
    { stt: 13, name: 'Kềm da inox bao simili D-06 (16)', code: '02010101010026', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 14, name: 'Kềm da inox bao simili D-07 (12)', code: '02010101010027', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 15, name: 'Kềm da inox bao simili D-07 (14)', code: '02010101010027', uom: 'Cây', reqQty: 1200, actQty: 1200, price: 0, amount: 0 },
    { stt: 16, name: 'Kềm da inox bao simili D-07 (16)', code: '02010101010037', uom: 'Cây', reqQty: 3100, actQty: 3100, price: 0, amount: 0 },
    { stt: 17, name: 'Kềm da inox bao simili D-08 (12)', code: '02010101010038', uom: 'Cây', reqQty: 300, actQty: 300, price: 0, amount: 0 },
    { stt: 18, name: 'Kềm da inox bao simili D-09 (12)', code: '02010101010115', uom: 'Cây', reqQty: 300, actQty: 300, price: 0, amount: 0 },
    { stt: 19, name: 'Kềm D-18 Simili', code: '01020101010008', uom: 'Cây', reqQty: 600, actQty: 600, price: 0, amount: 0 },
    { stt: 20, name: 'Kềm da thép D.555 simili không đũa', code: '01020101020003', uom: 'Cây', reqQty: 6000, actQty: 6000, price: 0, amount: 0 },
    { stt: 21, name: 'Kềm D-506 simili', code: '01020101020006', uom: 'Cây', reqQty: 2400, actQty: 2400, price: 0, amount: 0 },
    { stt: 22, name: 'Kềm D-501 simili', code: '01020101020001', uom: 'Cây', reqQty: 6000, actQty: 6000, price: 0, amount: 0 },
    { stt: 23, name: 'Bấm móng lớn vỉ giấy B-901', code: '07020101010022', uom: 'Cây', reqQty: 2160, actQty: 2160, price: 0, amount: 0 },
    { stt: 24, name: 'Bấm móng lớn vỉ giấy B-902', code: '07020101010012', uom: 'Cây', reqQty: 720, actQty: 720, price: 0, amount: 0 },
    { stt: 25, name: 'Sủi vỉ giấy S-505', code: '04010101010015', uom: 'Cây', reqQty: 360, actQty: 360, price: 0, amount: 0 },
    { stt: 26, name: 'Sủi vỉ giấy S-506', code: '04010101010022', uom: 'Cây', reqQty: 720, actQty: 720, price: 0, amount: 0 },
    { stt: 27, name: 'Lấy khóe-sủi da vỉ giấy S-516', code: '04010101010036', uom: 'Cây', reqQty: 720, actQty: 720, price: 0, amount: 0 }
  ];

  const totalActualQty = displayItems.reduce((sum, item) => sum + Number(item.actQty || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem',
      overflowY: 'auto'
    }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-voucher, .printable-voucher * { visibility: visible; }
          .printable-voucher { position: absolute; left: 0; top: 0; width: 100%; font-size: 11pt; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{
        backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '850px',
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Modal Top Control Bar */}
        <div className="no-print" style={{
          padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
              Mẫu số 02 - VT (TT 99/2025/TT-BTC)
            </span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Phiếu Xuất Kho Sổ Cái [{documentNo}]
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Printer size={18} /> In Phiếu Xuất Kho
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="printable-voucher" ref={printRef} style={{ padding: '2rem 2.5rem', backgroundColor: '#fff', fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', lineHeight: '1.4' }}>
          
          {/* Paper Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ width: '60%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase' }}>CÔNG TY CỔ PHẦN KỀM NGHĨA SÀI GÒN</div>
              <div style={{ fontSize: '12px' }}>Lô B4-3, đường D4, KCN Tân Phú Trung, xã Củ Chi, TP.HCM</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '4px', color: '#1e293b' }}>
                {vehicleNo}
              </div>
              <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
                {deliveryNotes}
              </div>
            </div>

            <div style={{ textAlign: 'right', width: '38%' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Mẫu số 02 - VT</div>
              <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
                (Ban hành theo Thông tư số 99/2025/TT-BTC<br/>ngày 27/10/2025 của Bộ trưởng Bộ Tài chính)
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div style={{ textAlign: 'center', margin: '1.2rem 0 1rem 0' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
              PHIẾU XUẤT KHO
            </h1>
            <div style={{ fontStyle: 'italic', fontSize: '13px' }}>
              Ngày {date}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', marginTop: '2px' }}>
              Số: {documentNo}
            </div>
          </div>

          {/* Form Info Section */}
          <div style={{ marginBottom: '1.2rem', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '180px' }}>Họ tên người nhận hàng:</span>
              <span style={{ fontWeight: 'bold' }}>{recipientName}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '180px' }}>Địa chỉ (bộ phận):</span>
              <span>{recipientAddress}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '180px' }}>Lý do xuất kho:</span>
              <span>{reason}</span>
            </div>
            <div style={{ display: 'flex', marginBottom: '4px' }}>
              <span style={{ width: '180px' }}>Xuất tại kho (ngăn lô):</span>
              <span style={{ fontWeight: 'bold' }}>{warehouseName}</span>
            </div>
          </div>

          {/* Data Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000', marginBottom: '1rem', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px', width: '35px' }}>Stt</th>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px' }}>
                  Tên, nhãn hiệu, quy cách phẩm chất vật tư,<br/>dụng cụ sản phẩm, hàng hóa
                </th>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px', width: '110px' }}>Mã số</th>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px', width: '50px' }}>Đơn vị tính</th>
                <th colSpan="2" style={{ border: '1px solid #000', padding: '4px' }}>Số lượng</th>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px', width: '65px' }}>Đơn giá</th>
                <th rowSpan="2" style={{ border: '1px solid #000', padding: '6px', width: '75px' }}>Thành tiền</th>
              </tr>
              <tr style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                <th style={{ border: '1px solid #000', padding: '4px', width: '75px' }}>Yêu cầu</th>
                <th style={{ border: '1px solid #000', padding: '4px', width: '75px' }}>Thực xuất</th>
              </tr>
              <tr style={{ textAlign: 'center', fontSize: '11px', fontStyle: 'italic', backgroundColor: '#f1f5f9' }}>
                <td style={{ border: '1px solid #000', padding: '2px' }}>A</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>B</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>C</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>D</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>1</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>2</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>3</td>
                <td style={{ border: '1px solid #000', padding: '2px' }}>4</td>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{item.stt || idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', fontWeight: 'bold' }}>{item.name}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontFamily: 'monospace' }}>{item.code}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>{item.uom}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>{Number(item.reqQty || 0).toLocaleString()}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{Number(item.actQty || 0).toLocaleString()}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>{item.price ? Number(item.price).toLocaleString() : ''}</td>
                  <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'right' }}>{item.amount ? Number(item.amount).toLocaleString() : ''}</td>
                </tr>
              ))}
              
              {/* Summary Row */}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f8fafc' }}>
                <td colSpan="4" style={{ border: '1px solid #000', padding: '6px 12px', textAlign: 'center' }}>Cộng</td>
                <td colSpan="2" style={{ border: '1px solid #000', padding: '6px 12px', textAlign: 'right', fontSize: '13px' }}>
                  {totalActualQty.toLocaleString()}
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              </tr>
            </tbody>
          </table>

          {/* Amount In Words */}
          <div style={{ fontStyle: 'italic', marginBottom: '6px', fontSize: '13px' }}>
            - Tổng số tiền (Viết bằng chữ): Ba tỷ ba trăm ba mươi triệu không trăm tám mươi làm nghìn tám trăm hai mươi tư đồng chẵn.
          </div>
          <div style={{ fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '13px' }}>
            - Số chứng từ gốc kèm theo: {documentNo}
          </div>

          {/* Date Stamp */}
          <div style={{ textAlign: 'right', fontStyle: 'italic', marginBottom: '1rem', fontSize: '13px' }}>
            Ngày {date}
          </div>

          {/* Signatures Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', fontSize: '12px', marginBottom: '3rem' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Người lập phiếu</div>
              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>(Ký, họ tên)</div>
              <div style={{ marginTop: '3.5rem', fontWeight: 'bold' }}>{creatorName}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Người nhận hàng</div>
              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>(Ký, họ tên)</div>
              <div style={{ marginTop: '3.5rem', fontWeight: 'bold' }}>{receiverName}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Thủ kho</div>
              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>(Ký, họ tên)</div>
              <div style={{ marginTop: '3.5rem', fontWeight: 'bold' }}>Phan Văn Nam</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Kế toán trưởng</div>
              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>(Ký, họ tên)</div>
              <div style={{ marginTop: '3.5rem', fontWeight: 'bold' }}>Võ Thị Mai</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Giám đốc</div>
              <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#475569' }}>(Ký, họ tên)</div>
              <div style={{ marginTop: '3.5rem', fontWeight: 'bold' }}>Trần Văn Thành</div>
            </div>
          </div>

          {/* Security Guard Stamp */}
          <div style={{ border: '2px solid #b91c1c', color: '#b91c1c', padding: '8px 12px', width: '220px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginTop: '1rem' }}>
            <div>BẢO VỆ KNSG</div>
            <div style={{ fontSize: '14px', letterSpacing: '1px' }}>ĐÃ KIỂM TRA</div>
            <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#7f1d1d', marginTop: '2px' }}>Ngày ... Tháng ... Năm ...</div>
          </div>

        </div>

      </div>
    </div>
  );
}
