import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { ledgerApi } from '../features/ledger/api/ledgerApi.js';

export default function LedgerDetail({ transaction, onBack }) {
  const [details, setDetails] = useState([]);
  const [error, setError] = useState(null);

  const txId = transaction?.TransactionId || transaction?.transaction_id || transaction?.id;

  const fetchDetails = useCallback(async () => {
    if (!txId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await ledgerApi.getTransactionDetail(txId);
      const listData = res?.data !== undefined ? res.data : res;
      setDetails(Array.isArray(listData) ? listData : []);
    } catch (err) {
      console.error("Fetch details failed", err);
      setError(err.message || 'Không thể tải chi tiết sổ cái');
      setDetails([]);
    } finally {
      setLoading(false);
    }
  }, [txId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <button 
        className="btn btn-back" 
        onClick={onBack}
        style={{ width: 'auto', alignSelf: 'flex-start', padding: '0.5rem 1rem' }}
      >
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Quay lại Danh sách Sổ Cái
      </button>

      {/* Header Info */}
      <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                padding: '0.25rem 0.75rem', 
                borderRadius: '1rem',
                backgroundColor: transaction.TransactionType === 'RECEIPT' ? '#dcfce7' : '#f3f4f6',
                color: transaction.TransactionType === 'RECEIPT' ? '#166534' : '#374151'
              }}>
                {transaction.TransactionType}
              </span>
              <h2 className="card-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0, fontSize: '1.5rem' }}>
                {transaction.TransactionId}
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', color: 'var(--text-muted)' }}>
              <div>Chứng từ: <strong style={{ color: 'var(--text-main)' }}>{transaction.DocumentNo}</strong></div>
              <div>Đơn vị ĐT: <strong style={{ color: 'var(--text-main)' }}>{transaction.PartnerUnit || '-'}</strong></div>
              <div>Người G/N: <strong style={{ color: 'var(--text-main)' }}>{transaction.PartnerName || '-'}</strong></div>
              <div>Người tạo: <strong style={{ color: 'var(--text-main)' }}>{transaction.PostedBy}</strong></div>
              <div>Thời gian: <strong style={{ color: 'var(--text-main)' }}>{formatDate(transaction.PostedAt)}</strong></div>
            </div>
          </div>
          
          <div style={{ backgroundColor: 'var(--primary-glow)', padding: '1rem', borderRadius: '50%' }}>
            <BookOpen size={32} color="var(--primary-color)" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Số Mã Hàng Biến Động</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{details.length}</div>
          </div>
          <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Số Lượng Biến Động</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: transaction.TransactionType === 'RECEIPT' ? '#10b981' : '#f59e0b' }}>
              {transaction.TransactionType === 'RECEIPT' ? '+' : ''}
              {details.reduce((sum, item) => sum + item.QuantityChange, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
          <Layers size={18} /> Chi tiết dòng sổ cái
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : details.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Không có dữ liệu chi tiết</div>
        ) : (
          <div className="data-table-container" style={{ borderRadius: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã Thùng 60 (ID)</th>
                  <th>Mã Hàng Hóa (SKU)</th>
                  <th style={{ textAlign: 'right' }}>Số Lượng Biến Động</th>
                  <th>Trạng Thái Ghi Nhận</th>
                </tr>
              </thead>
              <tbody>
                {details.map((item, index) => (
                  <tr key={index}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td><strong>{item.Id60}</strong></td>
                    <td><strong style={{ color: 'var(--primary-color)' }}>{item.ProductCode}</strong></td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: item.QuantityChange > 0 ? '#10b981' : '#f59e0b'
                    }}>
                      {item.QuantityChange > 0 ? '+' : ''}{item.QuantityChange}
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.25rem',
                        backgroundColor: '#f1f5f9',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}>
                        {item.NewStockType}
                      </span>
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
