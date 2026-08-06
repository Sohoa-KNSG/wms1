import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';
import { oemApi } from '../features/oem/api/oemApi.js';

export default function OemOrderImportModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [previewData, setPreviewData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // We expect window.XLSX to be available from the CDN script
    if (!window.XLSX) {
      setGlobalError("Thư viện XLSX chưa được tải, vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to json
        const data = window.XLSX.utils.sheet_to_json(ws, { raw: false });
        
        // Map and validate
        let errCnt = 0;
        const mappedData = data.map((row, idx) => {
          // Mapping according to the wireframe column names
          const oem_order_no = row['Số ĐH'] || row['Order No'] || row['oem_order_no'];
          const product_code = row['Mã SP'] || row['SKU'] || row['product_code'];
          const batch_no = row['Đợt giao'] || row['Batch'] || row['batch_no'] || 1;
          const target_qty = row['SL đơn hàng'] || row['Qty'] || row['target_qty'];
          const customer_code = row['Mã Khách Hàng'] || row['customer_code'];
          const customer_name = row['Tên Khách Hàng'] || row['customer_name'];
          
          let error = null;
          if (!oem_order_no || !product_code || !target_qty) {
            error = "Thiếu Số ĐH, Mã SP hoặc SL";
            errCnt++;
          }
          
          // Format date if needed
          let order_receive_date = row['Ngày nhận ĐH'] || null;
          let start_date = row['Ngày triển khai'] || null;
          let due_date = row['Ngày Yêu cầu HT'] || null;
          
          // Basic conversion if it's parsed as mm/dd/yyyy string, but XLSX sheet_to_json with cellDates=true usually helps
          if (due_date && due_date.includes && due_date.includes('/')) {
            const parts = due_date.split('/'); // Assuming DD/MM/YYYY or MM/DD/YYYY from UI string
            if(parts.length === 3) due_date = `${parts[2]}-${parts[0]}-${parts[1]}`; // just a rough ISO format for SQL
          }
          if (start_date && start_date.includes && start_date.includes('/')) {
            const parts = start_date.split('/');
            if(parts.length === 3) start_date = `${parts[2]}-${parts[0]}-${parts[1]}`;
          }
          if (order_receive_date && order_receive_date.includes && order_receive_date.includes('/')) {
            const parts = order_receive_date.split('/');
            if(parts.length === 3) order_receive_date = `${parts[2]}-${parts[0]}-${parts[1]}`;
          }
          
          return {
            rowIdx: idx + 2, // offset for header
            oem_order_no: String(oem_order_no || '').trim(),
            product_code: String(product_code || '').trim(),
            batch_no: parseInt(batch_no) || 1,
            target_qty: parseInt(target_qty) || 0,
            customer_code: customer_code ? String(customer_code).trim() : null,
            customer_name: customer_name ? String(customer_name).trim() : null,
            order_receive_date: order_receive_date ? new Date(order_receive_date).toISOString().split('T')[0] : null,
            start_date: start_date ? new Date(start_date).toISOString().split('T')[0] : null,
            due_date: due_date ? new Date(due_date).toISOString().split('T')[0] : null,
            error
          };
        });
        
        setPreviewData(mappedData);
        setErrorCount(errCnt);
        setGlobalError(null);
      } catch (err) {
        setGlobalError("File không hợp lệ hoặc lỗi phân tích dữ liệu: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    if (errorCount > 0) return;
    setIsUploading(true);
    setGlobalError(null);
    
    try {
      const payload = {
        orders: previewData.map(d => ({
          OemOrderNo: d.oem_order_no,
          ProductCode: d.product_code,
          BatchNo: Number(d.batch_no) || 1,
          TargetQty: Number(d.target_qty) || 0,
          CustomerCode: d.customer_code || null,
          CustomerName: d.customer_name || null,
          OrderReceiveDate: d.order_receive_date || null,
          StartDate: d.start_date || null,
          DueDate: d.due_date || null
        }))
      };
      
      const res = await oemApi.importOrders(payload);
      const message = res?.message || 'Import đơn hàng thành công!';
      alert(message);
      onSuccess();
    } catch (err) {
      setGlobalError(err.message || 'Lỗi lưu dữ liệu');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
          <X size={24} color="#64748b" />
        </button>
        
        <h2 className="card-title">Import Excel Đơn hàng OEM</h2>
        
        {!previewData.length ? (
          <div 
            style={{
              border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '3rem', 
              textAlign: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', marginTop: '1rem'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 500, color: '#475569' }}>Kéo thả file Excel vào đây hoặc click để duyệt file</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Chỉ hỗ trợ định dạng .xlsx, tối đa 5MB.</p>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
            />
          </div>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontWeight: 600 }}>Tóm tắt: </span>
                <span>Tìm thấy {previewData.length} dòng. </span>
                {errorCount > 0 ? (
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>Có {errorCount} dòng lỗi.</span>
                ) : (
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Tất cả hợp lệ.</span>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setPreviewData([])} disabled={isUploading}>Chọn file khác</button>
            </div>
            
            <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Dòng</th>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>Số ĐH</th>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>Mã SP</th>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Đợt</th>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>SL</th>
                    <th style={{ padding: '0.5rem', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 50).map((row, i) => (
                    <tr key={i} style={{ backgroundColor: row.error ? '#fef2f2' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>{row.rowIdx}</td>
                      <td style={{ padding: '0.5rem', border: row.error && !row.oem_order_no ? '1px solid #ef4444' : 'none' }}>{row.oem_order_no}</td>
                      <td style={{ padding: '0.5rem', border: row.error && !row.product_code ? '1px solid #ef4444' : 'none' }}>{row.product_code}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>{row.batch_no}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', border: row.error && !row.target_qty ? '1px solid #ef4444' : 'none' }}>{row.target_qty}</td>
                      <td style={{ padding: '0.5rem', color: '#ef4444', fontWeight: 500 }}>{row.error || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 50 && <p style={{ textAlign: 'center', padding: '1rem', color: '#64748b', backgroundColor: '#f8fafc' }}>... và {previewData.length - 50} dòng khác</p>}
            </div>
            
            {globalError && (
              <div className="status-msg status-error mt-4">
                <AlertCircle size={20} />
                {globalError}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>Hủy</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={errorCount > 0 || isUploading}
                style={{ minWidth: '120px' }}
              >
                {isUploading ? 'Đang lưu...' : 'Lưu Dữ Liệu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
