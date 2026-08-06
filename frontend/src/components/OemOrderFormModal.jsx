import React, { useState, useEffect } from 'react';
import { oemApi } from '../features/oem/api/oemApi.js';

const OemOrderFormModal = ({ isOpen, onClose, onSaved, initialData }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    oem_order_no: '',
    product_code: '',
    batch_no: 1,
    target_qty: '',
    customer_code: '',
    customer_name: '',
    order_receive_date: '',
    start_date: '',
    due_date: '',
    status: 'NEW'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const res = await oemApi.getProducts();
      const listData = res?.data !== undefined ? res.data : res;
      if (Array.isArray(listData)) {
        setProducts(listData);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        oem_order_no: initialData.oem_order_no || '',
        product_code: initialData.product_code || '',
        batch_no: initialData.batch_no || 1,
        target_qty: initialData.target_qty || '',
        customer_code: initialData.customer_code || '',
        customer_name: initialData.customer_name || '',
        order_receive_date: initialData.order_receive_date ? initialData.order_receive_date.substring(0, 10) : '',
        start_date: initialData.start_date ? initialData.start_date.substring(0, 10) : '',
        due_date: initialData.due_date ? initialData.due_date.substring(0, 10) : '',
        status: initialData.status || 'NEW'
      });
    } else {
      setFormData({
        oem_order_no: '',
        product_code: '',
        batch_no: 1,
        target_qty: '',
        customer_code: '',
        customer_name: '',
        order_receive_date: '',
        start_date: '',
        due_date: '',
        status: 'NEW'
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dto = {
        oemOrderNo: formData.oem_order_no,
        productCode: formData.product_code,
        batchNo: Number(formData.batch_no) || 1,
        customerCode: formData.customer_code,
        customerName: formData.customer_name,
        targetQty: Number(formData.target_qty) || 0,
        orderReceiveDate: formData.order_receive_date || null,
        startDate: formData.start_date || null,
        dueDate: formData.due_date || null,
        status: formData.status || 'NEW'
      };

      if (isEditMode) {
        await oemApi.updateOrder(formData.oem_order_no, formData.product_code, formData.batch_no, dto);
      } else {
        await oemApi.createOrder(dto);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-content" style={{ width: '800px', maxWidth: '90vw', borderRadius: '12px', padding: 0, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '1.5rem', color: 'white' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{isEditMode ? 'Sửa Đơn Hàng OEM' : 'Khai Báo Đơn Hàng Mới'}</h2>
          <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.875rem' }}>{isEditMode ? 'Cập nhật tiến độ hoặc thay đổi trạng thái của đơn hàng.' : 'Nhập đầy đủ thông tin để khởi tạo đơn hàng mới vào hệ thống.'}</p>
        </div>
        
        <div style={{ padding: '2rem' }}>
          {error && <div className="error-message" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-group row">
            <div className="col">
              <label>Số ĐH *</label>
              <input type="text" name="oem_order_no" value={formData.oem_order_no} onChange={handleChange} required disabled={isEditMode} />
            </div>
            <div className="col">
              <label>Mã SP (MFInvtID) *</label>
              {isEditMode ? (
                <input type="text" name="product_code" value={formData.product_code} onChange={handleChange} required disabled={true} className="input-field" style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f1f5f9', cursor: 'not-allowed' }} />
              ) : (
                <>
                  <input 
                    type="text"
                    name="product_code" 
                    value={formData.product_code} 
                    onChange={handleChange} 
                    required 
                    list="product-list"
                    autoComplete="off"
                    placeholder="Tìm kiếm hoặc chọn sản phẩm..."
                    className="input-field" 
                    style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', transition: 'border-color 0.2s' }}
                  />
                  <datalist id="product-list">
                    {products.map(p => (
                      <option key={p.MFInvtID} value={p.MFInvtID} />
                    ))}
                  </datalist>
                </>
              )}
            </div>
          </div>
          
          <div className="form-group row">
            <div className="col">
              <label>Đợt Giao *</label>
              <input type="number" name="batch_no" value={formData.batch_no} onChange={handleChange} required disabled={isEditMode} min="1" />
            </div>
            <div className="col">
              <label>Số Lượng Yêu Cầu *</label>
              <input type="number" name="target_qty" value={formData.target_qty} onChange={handleChange} required min="1" />
            </div>
          </div>
          
          <div className="form-group row">
            <div className="col">
              <label>Mã Khách Hàng</label>
              <input type="text" name="customer_code" value={formData.customer_code} onChange={handleChange} />
            </div>
            <div className="col">
              <label>Tên Khách Hàng</label>
              <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group row">
            <div className="col">
              <label>Ngày Nhận Đơn</label>
              <input type="date" name="order_receive_date" value={formData.order_receive_date} onChange={handleChange} />
            </div>
            <div className="col">
              <label>Ngày Bắt Đầu</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} />
            </div>
            <div className="col">
              <label>Ngày Hạn (Due Date)</label>
              <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group row">
            <div className="col">
              <label>Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                <option value="NEW">NEW (Mới)</option>
                <option value="PROCESSING">PROCESSING (Đang xử lý)</option>
                <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
                <option value="HOLD">HOLD (Tạm dừng)</option>
              </select>
            </div>
          </div>
          
          <div className="modal-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading} style={{ padding: '0.625rem 1.5rem', borderRadius: '6px', fontWeight: 500 }}>Hủy Bỏ</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.625rem 1.5rem', borderRadius: '6px', fontWeight: 500, backgroundColor: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}>
              {loading ? 'Đang lưu...' : 'Lưu Đơn Hàng'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default OemOrderFormModal;
