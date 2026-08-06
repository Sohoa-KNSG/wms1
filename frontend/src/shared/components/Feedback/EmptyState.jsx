import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'Không có dữ liệu', description = 'Hiện chưa có bản ghi nào để hiển thị.' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        textAlign: 'center',
        color: '#6b7280'
      }}
    >
      <Inbox size={48} strokeWidth={1.5} style={{ marginBottom: '12px', color: '#9ca3af' }} />
      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#374151' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '14px' }}>{description}</p>
    </div>
  );
};
