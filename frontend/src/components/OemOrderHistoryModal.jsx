import React, { useState, useEffect } from 'react';
import { oemApi } from '../features/oem/api/oemApi.js';

const OemOrderHistoryModal = ({ isOpen, onClose, order }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      fetchHistory();
    }
  }, [isOpen, order]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await oemApi.getHistory(order.oem_order_no, order.product_code, order.batch_no);
      const listData = res?.data !== undefined ? res.data : res;
      setHistory(Array.isArray(listData) ? listData : []);
    } catch (err) {
      setError('Lỗi tải lịch sử: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <h2>Lịch Sử Đơn Hàng: {order?.oem_order_no} (SP: {order?.product_code}, Đợt: {order?.batch_no})</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div style={{ flex: 1, overflowY: 'auto', marginTop: '15px' }}>
          {loading ? <p>Đang tải lịch sử...</p> : (
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Thời Gian</th>
                  <th>Hành Động</th>
                  <th>Người Thực Hiện</th>
                  <th>Chi Tiết Thay Đổi</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  let diffText = '';
                  try {
                    const oldData = h.old_data ? JSON.parse(h.old_data) : null;
                    const newData = h.new_data ? JSON.parse(h.new_data) : null;
                    
                    if (h.action_type === 'CREATE') {
                      diffText = 'Tạo mới đơn hàng.';
                    } else if (h.action_type === 'UPDATE' && oldData && newData) {
                      const changes = [];
                      if (oldData.target_qty !== newData.target_qty) changes.push(`SL: ${oldData.target_qty} -> ${newData.target_qty}`);
                      if (oldData.status !== newData.status) changes.push(`Trạng thái: ${oldData.status} -> ${newData.status}`);
                      if (oldData.due_date !== newData.due_date) changes.push(`Hạn giao: ${oldData.due_date} -> ${newData.due_date}`);
                      diffText = changes.join(' | ') || 'Cập nhật thông tin khác (Tên KH, Ngày nhận...)';
                    }
                  } catch (e) {
                    diffText = 'Không thể parse JSON dữ liệu';
                  }

                  return (
                    <tr key={i}>
                      <td>{new Date(h.action_at).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${h.action_type === 'CREATE' ? 'status-new' : 'status-completed'}`}>
                          {h.action_type}
                        </span>
                      </td>
                      <td>{h.action_by}</td>
                      <td>{diffText}</td>
                    </tr>
                  );
                })}
                {history.length === 0 && !loading && (
                  <tr><td colSpan="4" style={{ textAlign: 'center' }}>Không có dữ liệu lịch sử</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button className="btn-secondary" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default OemOrderHistoryModal;
