import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, ArrowRight, Filter, WifiOff, ShieldOff } from 'lucide-react';
import { ledgerApi } from '../features/ledger/api/ledgerApi.js';

export default function LedgerList({ onSelectTransaction }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterFromDate) params.fromDate = filterFromDate;
      if (filterToDate) params.toDate = filterToDate;
      // API-01: Dùng ledgerApi thay fetch(port 3001)
      const res = await ledgerApi.getTransactions(params);
      const listData = res?.data !== undefined ? res.data : res;
      setTransactions(Array.isArray(listData) ? listData : []);
    } catch (err) {
      const statusCode = err?.statusCode || 0;
      const traceId = err?.traceId || null;
      if (statusCode === 403) {
        setError({ type: 'forbidden', message: 'Bạn không có quyền xem sổ cái kép. Liên hệ quản trị viên.', traceId });
      } else {
        setError({ type: 'error', message: err.message || 'Không thể tải danh sách giao dịch.', traceId });
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterFromDate, filterToDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ backgroundColor: 'var(--primary-glow)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <BookOpen size={32} color="var(--primary-color)" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="card-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '0.25rem', fontSize: '1.5rem' }}>Sổ cái Kho (Ledger)</h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Lịch sử giao dịch nhập/xuất kho</p>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Filter size={18} /> <span style={{ fontWeight: 600 }}>Bộ lọc:</span>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Loại giao dịch
          </label>
          <select 
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="">Tất cả</option>
            <option value="RECEIPT">Nhập kho (RECEIPT)</option>
            <option value="ISSUE">Xuất kho (ISSUE)</option>
            <option value="ADJUSTMENT">Điều chỉnh (ADJUSTMENT)</option>
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Từ ngày
          </label>
          <input 
            type="date" 
            className="input-field" 
            value={filterFromDate}
            onChange={(e) => setFilterFromDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Đến ngày
          </label>
          <input 
            type="date" 
            className="input-field" 
            value={filterToDate}
            onChange={(e) => setFilterToDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>
        ) : error ? (
          <div style={{ padding: '1.5rem', color: error.type === 'forbidden' ? '#92400e' : '#991b1b', background: error.type === 'forbidden' ? '#fef3c7' : '#fee2e2', borderRadius: '8px', margin: '1rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {error.type === 'forbidden' ? <ShieldOff size={20} style={{ flexShrink: 0 }} /> : <WifiOff size={20} style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontWeight: 700 }}>{error.type === 'forbidden' ? 'Không đủ quyền' : 'Lỗi kết nối'}</div>
              <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>{error.message}</div>
              {error.traceId && <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Trace ID: {error.traceId}</div>}
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <BookOpen size={32} style={{ display: 'block', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600 }}>Không tìm thấy giao dịch nào</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Chưa có bút toán nào phù hợp với bộ lọc hiện tại.</div>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Giao Dịch</th>
                  <th>Loại</th>
                  <th>Chứng Từ</th>
                  <th>Đơn Vị Đối Tác</th>
                  <th>Người Giao/Nhận</th>
                  <th>Người Thực Hiện</th>
                  <th>Thời Gian</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.TransactionId}>
                    <td>
                      <strong style={{ color: 'var(--primary-color)' }}>{tx.TransactionId}</strong>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem',
                        backgroundColor: tx.TransactionType === 'RECEIPT' ? '#dcfce7' : '#f3f4f6',
                        color: tx.TransactionType === 'RECEIPT' ? '#166534' : '#374151'
                      }}>
                        {tx.TransactionType}
                      </span>
                    </td>
                    <td><strong>{tx.DocumentNo}</strong></td>
                    <td>{tx.PartnerUnit || '-'}</td>
                    <td>{tx.PartnerName || '-'}</td>
                    <td>{tx.PostedBy}</td>
                    <td>{formatDate(tx.PostedAt)}</td>
                    <td>
                      <button 
                        className="btn btn-back" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', width: 'auto' }}
                        onClick={() => onSelectTransaction(tx)}
                      >
                        Chi tiết <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
