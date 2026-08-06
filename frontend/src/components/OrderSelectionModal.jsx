import React, { useState, useEffect } from 'react';
import { Search, X, Package, CheckCircle2 } from 'lucide-react';
import { receivingApi } from '../features/receiving/api/receivingApi.js';

export default function OrderSelectionModal({ isOpen, onClose, onSelectOrder, productCode }) {
  const [keyword, setKeyword] = useState('');
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderNo, setSelectedOrderNo] = useState('');

  // Nạp danh sách Đơn OEM (Data List) theo mã sản phẩm
  const loadDataList = async (code) => {
    setLoading(true);
    try {
      // 1. Tìm đơn tương ứng với Mã sản phẩm
      const res = await receivingApi.searchOrders(code || '');
      const dataObj = res?.data !== undefined ? res.data : res;
      let list = Array.isArray(dataObj) ? dataObj : [];
      
      // Nếu có mã sản phẩm, ưu tiên chỉ chọn các đơn khớp chính xác 100% mã sản phẩm
      if (code && list.length > 0) {
        const exactMatches = list.filter(o => (o.MaHang || o.product_code || '').trim() === code.trim());
        if (exactMatches.length > 0) {
          list = exactMatches;
        }
      }

      // Nếu sản phẩm cụ thể chưa có đơn riêng, nạp danh sách tất cả đơn OEM
      if (list.length === 0 && code) {
        const allRes = await receivingApi.searchOrders('');
        const allData = allRes?.data !== undefined ? allRes.data : allRes;
        const allList = Array.isArray(allData) ? allData : [];
        const exactMatchesAll = allList.filter(o => (o.MaHang || o.product_code || '').trim() === code.trim());
        list = exactMatchesAll.length > 0 ? exactMatchesAll : allList;
      }
      
      setDataList(list);
    } catch (err) {
      console.error("Lỗi nạp data list đơn OEM:", err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setKeyword('');
      setSelectedOrderNo('');
      loadDataList(productCode);
    }
  }, [isOpen, productCode]);

  // Tìm kiếm trực tiếp trên Data List (Client-side filtering)
  const filteredOrders = dataList.filter(o => {
    if (!keyword.trim()) return true;
    const k = keyword.toLowerCase().trim();
    const orderNo = (o.MaDonHang || o.oem_order_no || '').toLowerCase();
    const prodCode = (o.MaHang || o.product_code || '').toLowerCase();
    const customer = (o.MaKhachHang || '').toLowerCase();
    const po = (o.MaPO || '').toLowerCase();
    return orderNo.includes(k) || prodCode.includes(k) || customer.includes(k) || po.includes(k);
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is automatically reflected via client-side filtering on dataList
  };

  const handleConfirmMapping = () => {
    if (!selectedOrderNo) return;
    if (onSelectOrder) {
      onSelectOrder(selectedOrderNo);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Gán Mã Đơn Hàng OEM (UC02)
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Mã sản phẩm: <strong style={{ color: '#2563eb' }}>{productCode || 'Tất cả'}</strong> • Tổng {dataList.length} đơn thích hợp
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Ô Tìm kiếm trực tiếp trên Data List */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Lọc từ khóa mã đơn, mã hàng, PO..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '2.6rem',
                paddingRight: '1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 500,
                outline: 'none',
                caretColor: '#2563eb'
              }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{
              width: 'auto',
              minWidth: '90px',
              flexShrink: 0,
              padding: '0 1.25rem',
              height: '42px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Lọc
          </button>
        </form>

        {/* Render Danh Sách Đã Lọc (Filtered Orders from Data List) */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '4px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              Đang tải danh sách Đơn OEM cho mã sản phẩm [{productCode}]...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              {keyword ? `Không tìm thấy đơn OEM khớp với từ khóa "${keyword}".` : `Chưa có đơn OEM phù hợp với mã sản phẩm [${productCode}].`}
            </div>
          ) : (
            filteredOrders.map((o, idx) => {
              const orderNo = o.MaDonHang || o.oem_order_no;
              const isSelected = selectedOrderNo === orderNo;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedOrderNo(orderNo)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 14px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                    <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9', color: '#2563eb' }}>
                      <Package size={22} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isSelected ? '#1e40af' : '#1e293b' }}>
                          {orderNo}
                        </span>
                        {isSelected && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '0.8rem', fontWeight: 700 }}>
                            <CheckCircle2 size={16} /> Đã chọn
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        Khách hàng: <strong style={{ color: '#334155' }}>{o.MaKhachHang || 'N/A'}</strong> | Mã PO: <strong style={{ color: '#334155' }}>{o.MaPO || 'N/A'}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>
                        Mã sản phẩm: <strong style={{ color: '#2563eb' }}>{o.MaHang || o.product_code}</strong> | Tổng SL Đơn: {o.SoLuongDonHang || o.order_qty || 0}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Khối xác nhận gán đơn: Nút bấm Xác nhận Full Width */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={handleConfirmMapping}
            disabled={!selectedOrderNo}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '8px',
              background: selectedOrderNo ? '#2563eb' : '#94a3b8',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: selectedOrderNo ? 'pointer' : 'not-allowed',
              boxShadow: selectedOrderNo ? '0 4px 6px -1px rgba(37,99,235,0.3)' : 'none'
            }}
          >
            ✓ Xác Nhận Gán Đơn OEM
          </button>
        </div>
      </div>
    </div>
  );
}

