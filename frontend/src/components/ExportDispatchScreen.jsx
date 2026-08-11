import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Truck, CheckSquare, Plus, Trash2, Edit2, Check, X, 
  Play, Scale, Package, AlertCircle, TrendingUp, Info, List, Table, Layers, Users, Eye, MapPin
} from 'lucide-react';
import { outboundApi } from '../features/outbound/api/outboundApi.js';
import { masterDataApi } from '../features/masterData/api/masterDataApi.js';
import { httpClient } from '../api/httpClient.js';

export default function ExportDispatchScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('dispatch'); // 'paste' | 'dispatch'
  const [pasteData, setPasteData] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [invalidCodes, setInvalidCodes] = useState([]);
  
  const [requirements, setRequirements] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState('');
  const [customerName, setCustomerName] = useState(''); // Gán nhanh cho các dòng chưa chọn
  const [deliveryLocation, setDeliveryLocation] = useState('Kho Nguyễn Văn Báu'); // Nơi giao mặc định
  const [selectedItems, setSelectedItems] = useState({});

  // Modal xác nhận phát hành phiếu xuất kho
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Danh sách gợi ý Nơi Giao
  const locationOptions = [
    'Kho Nguyễn Văn Báu',
    'Cảng Cát Lái',
    'Cảng Phước Long',
    'Cảng ICD Transimex',
    'Cảng Hiệp Phước',
    'Kho Tổng Miền Nam'
  ];

  const [validProducts, setValidProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await masterDataApi.getProducts();
      const data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data)) {
        setValidProducts(data.map(p => String(p).toUpperCase()));
      }
    } catch (e) {
      console.error('Lỗi lấy danh mục sản phẩm', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    if (activeTab === 'dispatch') {
      fetchRequirements();
      fetchTrucks();
      fetchCustomers();
    }
  }, [activeTab]);

  // Tự động Parse dữ liệu paste thành Bảng Dữ Liệu và Kiểm Tra Mã Sản Phẩm với Danh Mục
  useEffect(() => {
    if (!pasteData.trim()) {
      setParsedRows([]);
      setInvalidCodes([]);
      setErrorMsg('');
      return;
    }

    const rows = pasteData.split('\n').filter(r => r.trim());
    const badProductCodesSet = new Set();

    const parsed = rows.map((row, index) => {
      const cols = row.split('\t');
      const pCode = cols[0]?.trim() || '';
      const cCode = cols[1]?.trim() || '';
      const qty = parseFloat(cols[2]?.trim() || '0');

      const isProductCodeInCatalog = pCode.length > 0 && (validProducts.length === 0 || validProducts.includes(pCode.toUpperCase()));
      if (pCode.length > 0 && !isProductCodeInCatalog) {
        badProductCodesSet.add(pCode);
      }

      return {
        id: index + 1,
        product_code: pCode,
        channel_code: cCode,
        requested_qty: isNaN(qty) ? 0 : qty,
        is_product_valid: isProductCodeInCatalog,
        is_valid: pCode.length > 0 && cCode.length > 0 && !isNaN(qty) && qty > 0 && isProductCodeInCatalog
      };
    });

    setParsedRows(parsed);
    setInvalidCodes(Array.from(badProductCodesSet));
  }, [pasteData, validProducts]);

  // Hàm định dạng số nguyên chuẩn (không dư số thập phân .0000)
  const fmtInt = (val) => Math.round(Number(val) || 0).toLocaleString('vi-VN');

  // Công thức tính trọng lượng chuẩn dựa trên số Thùng (60kg / Kiện 360, 10kg / Thùng 60, 0.167kg / SP lẻ)
  const calcWeightFromBoxes = (bLarge, bSmall, bVirtual) => {
    const w360 = Number(bLarge || 0) * 60.0;
    const w60 = Number(bSmall || 0) * 10.0;
    const wVirt = Number(bVirtual || 0) * (10.0 / 60.0);
    return Number((w360 + w60 + wVirt).toFixed(2));
  };

  const [reqStatusFilter, setReqStatusFilter] = useState('');
  const [reqFromDate, setReqFromDate] = useState('');
  const [reqToDate, setReqToDate] = useState('');

  const fetchRequirements = async (overrideParams = {}) => {
    try {
      const params = {
        status: overrideParams.status !== undefined ? overrideParams.status : reqStatusFilter,
        fromDate: overrideParams.fromDate !== undefined ? overrideParams.fromDate : reqFromDate,
        toDate: overrideParams.toDate !== undefined ? overrideParams.toDate : reqToDate
      };
      const res = await outboundApi.getRequirements(params);
      let data = res?.data !== undefined ? res.data : res;
      if (Array.isArray(data)) {
        data = data.map(d => {
          const remainingQty = d.remaining_qty !== undefined 
            ? Math.max(0, Number(d.remaining_qty)) 
            : Math.max(0, Number(d.total_requested_qty || 0) - Number(d.allocated_qty || 0));

          const bLarge = Math.floor(remainingQty / 360);
          const rem360 = remainingQty % 360;
          const bSmall = Math.floor(rem360 / 60);
          const bVirtual = rem360 % 60; // Hàng lẻ / Thùng ảo

          const calculatedQty = (bLarge * 360) + (bSmall * 60) + bVirtual;
          const calcWeight = calcWeightFromBoxes(bLarge, bSmall, bVirtual);

          // Gợi ý Khách Hàng dựa trên Kênh (channel_code)
          const suggestedCust = `Khách Kênh ${d.channel_code || 'Chung'}`;

          return {
            ...d,
            allocated_dispatch_qty: calculatedQty, // Khớp tuyệt đối 100% với tổng số lượng thùng (K360 * 360 + T60 * 60 + Ảo)
            allocated_weight_kg: calcWeight,
            box_large: bLarge,
            box_small: bSmall,
            box_virtual: bVirtual,
            customer_name: d.customer_name || suggestedCust // Gợi ý mặc định theo Kênh
          };
        });
        setRequirements(data);
      } else {
        setRequirements([]);
      }
    } catch (e) {
      console.error('Lỗi lấy nhu cầu', e);
    }
  };

  // Tự động tích chọn các dòng nhu cầu vừa đủ tải trọng xe tải khi chọn Xe Tải
  const handleTruckSelection = (truckPlate) => {
    setSelectedTruck(truckPlate);
    if (!truckPlate) return;

    const foundTruck = trucks.find(t => t.license_plate === truckPlate);
    const maxWeight = foundTruck ? Number(foundTruck.max_weight_kg || 999999) : 999999;

    let totalWeight = 0;
    const newSelected = {};

    requirements.forEach((item, idx) => {
      const itemWeight = Number(item.allocated_weight_kg || 0);
      const remQty = Number(item.allocated_dispatch_qty || 0);

      if (remQty > 0 && (totalWeight + itemWeight) <= maxWeight) {
        newSelected[idx] = true;
        totalWeight += itemWeight;
      }
    });

    setSelectedItems(newSelected);
  };

  // Cập nhật khi chọn Khách Hàng trên Header: Chỉ áp dụng cho các DÒNG ĐƯỢC TÍCH CHỌN, không đè toàn bộ gợi ý kênh của dòng khác
  const handleGlobalCustomerChange = (custName) => {
    setCustomerName(custName);
    if (custName) {
      const selectedIndices = Object.keys(selectedItems).filter(k => selectedItems[k]);
      if (selectedIndices.length > 0) {
        const newReqs = [...requirements];
        selectedIndices.forEach(idx => {
          newReqs[idx].customer_name = custName;
        });
        setRequirements(newReqs);
      }
    }
  };

  // Cập nhật Khách Hàng riêng cho từng dòng
  const updateRowCustomer = (index, custName) => {
    const newReqs = [...requirements];
    newReqs[index].customer_name = custName;
    setRequirements(newReqs);
  };

  // Cập nhật khi chỉnh sửa trực tiếp Ô Tổng Số Lượng Phân Bổ
  const updateAllocatedQty = (index, newQtyStr) => {
    const newQty = Math.max(0, Math.round(parseFloat(newQtyStr) || 0));
    const newReqs = [...requirements];
    const item = newReqs[index];

    item.allocated_dispatch_qty = newQty;

    // Tự động phân bổ lại số Thùng 360, Thùng 60 và Thùng ảo
    item.box_large = Math.floor(newQty / 360);
    const rem360 = newQty % 360;
    item.box_small = Math.floor(rem360 / 60);
    item.box_virtual = rem360 % 60;

    item.allocated_weight_kg = calcWeightFromBoxes(item.box_large, item.box_small, item.box_virtual);

    setRequirements(newReqs);
  };

  // Cập nhật khi Thủ kho điều chỉnh trực tiếp Số Thùng 360, Thùng 60 hoặc Thùng Ảo
  const updateBoxesDirectly = (index, field, valStr) => {
    const val = Math.max(0, parseInt(valStr, 10) || 0);
    const newReqs = [...requirements];
    const item = newReqs[index];

    item[field] = val;

    // Tính toán lại Tổng số lượng phân bổ = (Thùng 360 * 360) + (Thùng 60 * 60) + Thùng Ảo
    const calculatedQty = (Number(item.box_large || 0) * 360) + 
                          (Number(item.box_small || 0) * 60) + 
                          Number(item.box_virtual || 0);

    item.allocated_dispatch_qty = calculatedQty;
    item.allocated_weight_kg = calcWeightFromBoxes(item.box_large, item.box_small, item.box_virtual);

    setRequirements(newReqs);
  };

  const fetchTrucks = async () => {
    try {
      const res = await masterDataApi.getTrucks();
      const data = res?.data !== undefined ? res.data : res;
      setTrucks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Lỗi lấy danh sách xe', e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await masterDataApi.getCustomers();
      const data = res?.data !== undefined ? res.data : res;
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Lỗi lấy danh sách khách hàng', e);
    }
  };

  const handleParseAndValidate = async () => {
    setErrorMsg('');

    if (invalidCodes.length > 0) {
      const msg = `CẢNH BÁO: Không thể nạp do có ${invalidCodes.length} mã sản phẩm không tồn tại trong danh mục: [${invalidCodes.join(', ')}]. Vui lòng sửa lại các mã gõ sai trước khi nạp!`;
      setErrorMsg(msg);
      alert(msg);
      return;
    }

    try {
      const rows = pasteData.split('\n').filter(r => r.trim());
      const dataToValidate = rows.map((row, index) => {
        const cols = row.split('\t');
        return {
          id: index,
          product_code: cols[0]?.trim(),
          channel_code: cols[1]?.trim(),
          requested_qty: parseFloat(cols[2]?.trim() || '0')
        };
      });

      if (dataToValidate.length === 0) {
        setErrorMsg('Không có dữ liệu để xử lý.');
        return;
      }

      const res = await outboundApi.pasteData(dataToValidate);
      const result = res?.data !== undefined ? res.data : res;
      alert('Nạp dữ liệu nhu cầu thành công! Mã Request: ' + (result.request_no || 'OK'));
      setPasteData('');
      setParsedRows([]);
      setInvalidCodes([]);
      setActiveTab('dispatch');
    } catch (e) {
      setErrorMsg('Lỗi kết nối máy chủ: ' + e.message);
    }
  };

  // Tính toán KPI Tổng trên Header Phân Bổ
  const selectedIndices = Object.keys(selectedItems).filter(k => selectedItems[k]);
  const itemsToDispatch = selectedIndices.map(i => requirements[i]).filter(Boolean);

  const totalSelectedLines = itemsToDispatch.length;
  const totalAllocatedQty = itemsToDispatch.reduce((sum, item) => sum + Number(item.allocated_dispatch_qty || 0), 0);
  const totalAllocatedWeightKg = itemsToDispatch.reduce((sum, item) => sum + Number(item.allocated_weight_kg || 0), 0);

  const totalBox360 = itemsToDispatch.reduce((sum, item) => sum + Number(item.box_large || 0), 0);
  const totalBox60 = itemsToDispatch.reduce((sum, item) => sum + Number(item.box_small || 0), 0);
  const totalBoxVirtual = itemsToDispatch.reduce((sum, item) => sum + Number(item.box_virtual || 0), 0);

  // Nhóm các dòng theo từng Khách Hàng độc lập để chuẩn bị tách Phiếu Xuất riêng
  const groupedDetailsByCustomer = {};
  itemsToDispatch.forEach(item => {
    const cName = item.customer_name || `Khách Kênh ${item.channel_code || 'Chung'}`;
    if (!groupedDetailsByCustomer[cName]) {
      groupedDetailsByCustomer[cName] = {
        customer_name: cName,
        items: [],
        total_qty: 0,
        total_weight_kg: 0
      };
    }
    groupedDetailsByCustomer[cName].items.push(item);
    groupedDetailsByCustomer[cName].total_qty += Number(item.allocated_dispatch_qty || 0);
    groupedDetailsByCustomer[cName].total_weight_kg += Number(item.allocated_weight_kg || 0);
  });

  const customerGroupList = Object.values(groupedDetailsByCustomer);

  const truckObj = trucks.find(t => t.license_plate === selectedTruck);
  const maxTruckWeightKg = truckObj ? Number(truckObj.max_weight_kg || 0) : 0;
  const loadPercentage = maxTruckWeightKg > 0 ? ((totalAllocatedWeightKg / maxTruckWeightKg) * 100).toFixed(1) : 0;
  const isOverweight = maxTruckWeightKg > 0 && totalAllocatedWeightKg > maxTruckWeightKg;

  // Bước 1: Mở Modal Xem Trước & Xác Nhận Phiếu Xuất Kho
  const handleOpenConfirmModal = () => {
    if (itemsToDispatch.length === 0) {
      return alert('Vui lòng tích chọn ít nhất một mặt hàng cần phân bổ!');
    }
    if (!selectedTruck) {
      return alert('Vui lòng chọn Xe tải phân bổ!');
    }
    if (isOverweight) {
      return alert(`LỖI VƯỢT TẢI TRỌNG: Tổng trọng lượng (${totalAllocatedWeightKg.toLocaleString()} kg) vượt quá tải trọng xe (${maxTruckWeightKg.toLocaleString()} kg)!`);
    }

    setShowConfirmModal(true);
  };

  // Bước 2: Thủ kho xác nhận chính thức -> Gọi API phát hành các Phiếu Xuất Kho theo từng Khách Hàng
  const handleFinalSubmitDeliveryNote = async () => {
    const detailList = itemsToDispatch.map(item => ({
      CustomerName: item.customer_name || `Khách Kênh ${item.channel_code || 'Chung'}`,
      customer_name: item.customer_name || `Khách Kênh ${item.channel_code || 'Chung'}`,
      ProductCode: item.product_code,
      product_code: item.product_code,
      ChannelCode: item.channel_code,
      channel_code: item.channel_code,
      Qty: Number(item.allocated_dispatch_qty) || 0,
      qty: Number(item.allocated_dispatch_qty) || 0,
      BoxLarge: Number(item.box_large) || 0,
      box_large: Number(item.box_large) || 0,
      BoxSmall: Number(item.box_small) || 0,
      box_small: Number(item.box_small) || 0,
      BoxVirtual: Number(item.box_virtual) || 0,
      box_virtual: Number(item.box_virtual) || 0,
      TotalWeightKg: Number(item.allocated_weight_kg) || 0,
      total_weight_kg: Number(item.allocated_weight_kg) || 0
    }));

    const payload = {
      TruckPlate: selectedTruck,
      license_plate: selectedTruck,
      DriverId: "1",
      driver_id: "1", 
      GuardId: "1",
      guard_id: "1",  
      DeliveryLocation: deliveryLocation || "Kho Nguyễn Văn Báu",
      delivery_location: deliveryLocation || "Kho Nguyễn Văn Báu",
      Details: detailList,
      details: detailList
    };

    try {
      const res = await outboundApi.createDeliveryNotes(payload);
      const result = res?.data !== undefined ? res.data : res;
      alert(`TẠO PHIẾU XUẤT KHO THÀNH CÔNG!\nMã phiếu: ${result.delivery_note_no || 'Đã tạo'}`);
      setShowConfirmModal(false);
      setSelectedItems({});
      fetchRequirements(); 
    } catch (e) {
      alert('Lỗi kết nối: ' + e.message);
    }
  };

  const handleDeleteReq = async (row) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhu cầu dòng ${row.line_no || ''} của phiếu ${row.request_no || ''} (Mã SP ${row.product_code})?`)) return;
    try {
      await outboundApi.deleteRequirement({ 
        request_no: row.request_no, 
        line_no: row.line_no, 
        product_code: row.product_code, 
        channel_code: row.channel_code 
      });
      fetchRequirements();
    } catch (e) {
      console.error(e);
    }
  };

  // Xóa hàng loạt nhiều mã hoặc tất cả mã nhu cầu đã tích chọn
  const handleBatchDeleteSelectedReqs = async () => {
    const selectedRows = selectedIndices.map(i => requirements[i]).filter(Boolean);
    if (selectedRows.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 dòng nhu cầu để xóa!');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn XÓA ${selectedRows.length} dòng nhu cầu đã tích chọn khỏi hệ thống?`)) return;

    try {
      for (const row of selectedRows) {
        await outboundApi.deleteRequirement({ 
          request_no: row.request_no, 
          line_no: row.line_no, 
          product_code: row.product_code, 
          channel_code: row.channel_code 
        });
      }
      setSelectedItems({});
      fetchRequirements();
    } catch (e) {
      alert('Lỗi xóa hàng loạt: ' + e.message);
    }
  };

  // Render Tab Nhập Liệu Dạng Bảng Danh Mục
  const renderPasteTab = () => {
    const totalPasteQty = parsedRows.reduce((sum, r) => sum + (Number(r.requested_qty) || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            1. Dán Khối Dữ Liệu Từ Excel
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Copy toàn bộ bảng từ Excel gồm 3 cột (<strong>Mã SP</strong>, <strong>Kênh</strong>, <strong>Số lượng nhu cầu</strong>) và dán vào ô bên dưới:
          </p>

          <textarea
            rows={5}
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            placeholder="Ví dụ dán từ Excel:&#10;M.01	DISCOUNT	1200&#10;D.04-14	AGENCY	600"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}
          />

          {invalidCodes.length > 0 && (
            <div className="status-msg status-error" style={{ marginBottom: '1rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <AlertCircle size={22} color="#dc2626" />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>⚠️ CẢNH BÁO: PHÁT HIỆN {invalidCodes.length} MÃ SẢN PHẨM KHÔNG TỒN TẠI TRONG DANH MỤC:</strong>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#b91c1c', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                  {invalidCodes.join(', ')}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>Vui lòng kiểm tra và sửa lại các mã gõ sai trong khung dán ở trên trước khi nạp vào hệ thống.</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="status-msg status-error" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={20} />
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleParseAndValidate} 
              disabled={parsedRows.length === 0}
              className="btn btn-primary" 
              style={{ 
                width: 'auto', 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center',
                backgroundColor: parsedRows.length > 0 ? 'var(--primary-color)' : '#d1d5db',
                borderColor: parsedRows.length > 0 ? 'var(--primary-color)' : '#9ca3af'
              }}
            >
              <Play size={18} /> Kiểm Tra & Nạp Vào Danh Sách Chờ Phân Bổ ({parsedRows.length} dòng)
            </button>

            {pasteData && (
              <button
                onClick={() => { setPasteData(''); setParsedRows([]); setErrorMsg(''); }}
                className="btn btn-secondary"
                style={{ width: 'auto' }}
              >
                Xóa / Làm Mới
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Table size={20} color="var(--primary-color)" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
                2. Xem Trước Bảng Nhu Cầu Nạp ({parsedRows.length} dòng)
              </h3>
            </div>

            {parsedRows.length > 0 && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Tổng SL Nhu Cầu: <strong style={{ color: 'var(--primary-color)', fontSize: '1.05rem' }}>{totalPasteQty.toLocaleString('vi-VN')} SP</strong>
              </div>
            )}
          </div>

          <div className="data-table-container" style={{ borderRadius: 0, border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
                  <th>Mã Sản Phẩm</th>
                  <th>Kênh Bán Hàng</th>
                  <th style={{ textAlign: 'right' }}>Số Lượng Nhu Cầu</th>
                  <th style={{ textAlign: 'center', width: '180px' }}>Trạng Thái Validate</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      Chưa có dữ liệu. Vui lòng dán bảng từ Excel vào ô phía trên để xem trước dạng bảng.
                    </td>
                  </tr>
                ) : (
                  parsedRows.map((r, idx) => {
                    const isInvalid = invalidCodes.includes(r.product_code);
                    return (
                      <tr key={idx} style={{ backgroundColor: isInvalid ? '#fef2f2' : 'transparent' }}>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{r.id}</td>
                        <td>
                          <strong style={{ color: isInvalid ? '#dc2626' : 'var(--text-main)' }}>
                            {r.product_code || '(Rỗng)'}
                          </strong>
                        </td>
                        <td>{r.channel_code || '(Rỗng)'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          {r.requested_qty.toLocaleString('vi-VN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {isInvalid ? (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 600 }}>
                              ❌ Không Tồn Tại
                            </span>
                          ) : r.is_valid ? (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>
                              ✓ Hợp Lệ
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                              ⚠️ Sai Định Dạng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDispatchTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* THANH LỌC TRẠNG THÁI & LỊCH SỬ NGÀY NẠP NHU CẦU */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Lọc Trạng Thái Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '4px' }}>
            Trạng Thái:
          </span>
          {[
            { key: '', label: '🌐 Tất Cả', activeBg: '#2563eb' },
            { key: 'NEW', label: '⚡ Chờ Phân Bổ', activeBg: '#0284c7' },
            { key: 'PARTIAL', label: '🌗 Phân Bổ 1 Phần', activeBg: '#d97706' },
            { key: 'PROCESSED', label: '✅ Đã Hoàn Tất', activeBg: '#16a34a' }
          ].map(s => {
            const isActive = (reqStatusFilter || '') === s.key;
            return (
              <button
                key={s.key}
                onClick={() => {
                  setReqStatusFilter(s.key);
                  fetchRequirements({ status: s.key });
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: isActive ? `1px solid ${s.activeBg}` : '1px solid #cbd5e1',
                  backgroundColor: isActive ? s.activeBg : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Lọc Ngày Nạp Nhu Cầu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Lịch Sử Ngày:
          </span>
          <input
            type="date"
            value={reqFromDate}
            onChange={(e) => {
              setReqFromDate(e.target.value);
              fetchRequirements({ fromDate: e.target.value });
            }}
            style={{ height: '34px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
          />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>-</span>
          <input
            type="date"
            value={reqToDate}
            onChange={(e) => {
              setReqToDate(e.target.value);
              fetchRequirements({ toDate: e.target.value });
            }}
            style={{ height: '34px', padding: '0 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.825rem' }}
          />
          <button
            onClick={() => {
              setReqStatusFilter('');
              setReqFromDate('');
              setReqToDate('');
              fetchRequirements({ status: '', fromDate: '', toDate: '' });
            }}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
          >
            🔄 Xóa Lọc
          </button>

        </div>

      </div>

      {/* KHÓA CỐ ĐỊNH KHUNG ĐIỀU KHIỂN & TẢI TRỌNG XE KHI CUỘN TRANG (STICKY HEADER PANEL) */}
      <div className="card" style={{ 
        position: 'sticky', 
        top: '64px', 
        zIndex: 50, 
        padding: '1rem 1.25rem', 
        backgroundColor: '#ffffff',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
        border: '1px solid #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Hàng 1: Nơi giao, chọn xe & nút thao tác */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Phân Bổ Hàng Cho Chuyến Xe Xuất Kho
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Chọn Nơi Giao, Xe tải & gán Khách hàng để xuất kho
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Chọn Nơi Giao Hàng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={16} color="var(--primary-color)" />
              <select 
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="input-field"
                style={{ width: '180px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                title="Chọn Nơi Giao / Địa Điểm Nhận Hàng"
              >
                {locationOptions.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Gán Nhanh Khách Hàng */}
            <select 
              value={customerName}
              onChange={(e) => handleGlobalCustomerChange(e.target.value)}
              className="input-field"
              style={{ width: '180px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
            >
              <option value="">-- Gán nhanh Khách --</option>
              {customers.map((c, idx) => (
                <option key={idx} value={c.customer_name}>{c.customer_code} - {c.customer_name}</option>
              ))}
            </select>

            {/* Chọn Xe Tải */}
            <select 
              value={selectedTruck} 
              onChange={(e) => handleTruckSelection(e.target.value)}
              className="input-field"
              style={{ width: '180px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
            >
              <option value="">-- Chọn Xe Tải --</option>
              {trucks.map((t, idx) => (
                <option key={idx} value={t.license_plate}>{t.license_plate} ({t.max_weight_kg.toLocaleString()} kg)</option>
              ))}
            </select>

            <button 
              onClick={handleOpenConfirmModal} 
              className="btn btn-primary" 
              style={{ 
                width: 'auto', 
                backgroundColor: isOverweight ? '#ef4444' : 'var(--primary-color)',
                borderColor: isOverweight ? '#dc2626' : 'var(--primary-color)',
                display: 'flex', 
                gap: '0.4rem', 
                alignItems: 'center',
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem'
              }}
            >
              <Eye size={16} /> Xem & Xác Nhận Phiếu Xuất
            </button>

            {/* Nút Xóa Hàng Loạt Dòng Được Chọn */}
            {selectedIndices.length > 0 && (
              <button 
                onClick={handleBatchDeleteSelectedReqs}
                className="btn"
                style={{ 
                  width: 'auto',
                  backgroundColor: '#ef4444', 
                  color: '#ffffff',
                  borderColor: '#dc2626',
                  display: 'flex', 
                  gap: '0.4rem', 
                  alignItems: 'center',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
                title="Xóa tất cả các dòng nhu cầu đã được tích chọn"
              >
                <Trash2 size={16} /> Xóa đã chọn ({selectedIndices.length})
              </button>
            )}
          </div>
        </div>

        {/* Hàng 2: Khung KPI Tải Trọng Xe & Thống Kê Nạp */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid var(--primary-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dòng Được Chọn</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.1rem' }}>
              {totalSelectedLines} / {requirements.length} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>dòng</span>
            </div>
          </div>

          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #0ea5e9' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Tổng SL Phân Bổ</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0ea5e9', marginTop: '0.1rem' }}>
              {totalAllocatedQty.toLocaleString('vi-VN')} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>SP</span>
            </div>
          </div>

          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: `4px solid ${isOverweight ? '#ef4444' : '#10b981'}` }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Trọng Lượng Xe</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isOverweight ? '#ef4444' : '#10b981', marginTop: '0.1rem' }}>
              {totalAllocatedWeightKg.toLocaleString('vi-VN')} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Kg</span>
            </div>
          </div>

          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: `4px solid ${isOverweight ? '#ef4444' : '#f59e0b'}` }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sức Chứa Xe Tải</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isOverweight ? '#ef4444' : '#f59e0b', marginTop: '0.1rem' }}>
              {maxTruckWeightKg > 0 ? `${loadPercentage}%` : 'Chưa chọn xe'}
              <span style={{ fontSize: '0.7rem', fontWeight: 400, marginLeft: '0.25rem', color: 'var(--text-muted)' }}>
                {maxTruckWeightKg > 0 ? `(${maxTruckWeightKg.toLocaleString()} kg max)` : ''}
              </span>
            </div>
          </div>
        </div>

        {isOverweight && (
          <div className="status-msg status-error" style={{ margin: 0, padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <AlertCircle size={16} />
            <strong>CẢNH BÁO VƯỢT TẢI TRỌNG XE:</strong> Tổng trọng lượng hàng ({totalAllocatedWeightKg.toLocaleString()} kg) đã vượt quá tải trọng tối đa của xe ({maxTruckWeightKg.toLocaleString()} kg). Vui lòng giảm số lượng phân bổ!
          </div>
        )}
      </div>

      {/* 3. Bảng Phân Bổ Chi Tiết Với Tên Cột Được Khóa Cố Định Chuẩn Mực */}
      <div className="card" style={{ padding: 0 }}>
        <div className="data-table-container" style={{ borderRadius: 0, border: 'none', width: '100%', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '980px', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th style={{ width: '36px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newSelected = {};
                      if (checked) requirements.forEach((_, i) => newSelected[i] = true);
                      setSelectedItems(newSelected);
                    }}
                    checked={requirements.length > 0 && selectedIndices.length === requirements.length}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ width: '130px' }}>Mã Phiếu Nạp ⭐</th>
                <th style={{ width: '140px' }}>Khách Hàng ⭐</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Ngày/Giờ Nạp ⭐</th>
                <th style={{ width: '90px' }}>Người Nạp ⭐</th>
                <th style={{ width: '80px' }}>Mã SP</th>
                <th style={{ width: '50px' }}>Kênh</th>
                <th style={{ textAlign: 'right', width: '80px' }}>Nhu Cầu Gốc</th>
                <th style={{ textAlign: 'right', width: '80px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>Đã Phân Bổ Xe ⭐</th>
                <th style={{ textAlign: 'right', width: '80px' }}>Nhu Cầu Còn Lại</th>
                <th style={{ textAlign: 'right', width: '75px' }}>Tồn Kho</th>
                <th style={{ textAlign: 'center', backgroundColor: '#e0f2fe', width: '165px' }}>
                  Điều Chỉnh Thùng ⭐<br />
                  <span style={{ fontSize: '0.65rem', fontWeight: 400, textTransform: 'none' }}>(K360 / T60 / Ảo)</span>
                </th>
                <th style={{ textAlign: 'right', backgroundColor: '#e0f2fe', width: '85px' }}>
                  SL Xuất ⭐
                </th>
                <th style={{ textAlign: 'right', backgroundColor: '#e0f2fe', width: '90px' }}>
                  Trọng Lượng ⭐
                </th>
                <th style={{ textAlign: 'center', width: '40px' }}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Chưa có nhu cầu xuất hàng nào đang chờ phân bổ.
                  </td>
                </tr>
              ) : (
                requirements.map((d, i) => {
                  const isChecked = !!selectedItems[i];
                  const allocatedQty = Number(d.allocated_dispatch_qty || 0);
                  const allocatedWeight = Number(d.allocated_weight_kg || 0);
                  const isStockShortage = d.total_stock < allocatedQty;

                  return (
                    <tr key={i} style={{ backgroundColor: isChecked ? '#fffbe6' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={(e) => setSelectedItems({...selectedItems, [i]: e.target.checked})}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>

                      {/* Mã Phiếu Nạp Nhu Cầu */}
                      <td>
                        <span style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', backgroundColor: '#e2e8f0', color: '#1e293b', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                          {d.request_no || '-'}
                        </span>
                      </td>

                      {/* Combobox chọn Khách Hàng từng dòng từ Danh mục Khách Hàng */}
                      <td>
                        <select 
                          className="input-field"
                          value={d.customer_name || ''}
                          onChange={(e) => updateRowCustomer(i, e.target.value)}
                          style={{ width: '100%', fontSize: '0.8rem', padding: '0.2rem 0.3rem', fontWeight: 600, color: '#0369a1' }}
                        >
                          <option value={`Khách Kênh ${d.channel_code || 'Chung'}`}>
                            📌 Khách Kênh {d.channel_code || 'Chung'} (Gợi ý)
                          </option>
                          {customers.map((c, idx) => (
                            <option key={idx} value={c.customer_name}>
                              {c.customer_code} - {c.customer_name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Ngày/Giờ Yêu Cầu Nạp Nhu Cầu */}
                      <td style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                        {d.request_date ? new Date(d.request_date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '-'}
                      </td>

                      {/* Người Nạp Nhu Cầu */}
                      <td style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                        {d.imported_by || 'Admin'}
                      </td>

                      <td><strong>{d.product_code}</strong></td>
                      <td><span style={{ padding: '0.15rem 0.35rem', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 600, fontSize: '0.8rem' }}>{d.channel_code}</span></td>
                      
                      {/* Nhu cầu ban đầu gốc */}
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                        {fmtInt(d.total_requested_qty)}
                      </td>

                      {/* Đã phân bổ xe đợt trước */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7', backgroundColor: isChecked ? '#fef3c7' : '#f0f9ff' }}>
                        {fmtInt(d.allocated_qty || 0)}
                      </td>

                      {/* Nhu cầu còn lại */}
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {fmtInt(d.remaining_qty !== undefined ? d.remaining_qty : (d.total_requested_qty - (d.allocated_qty || 0)))}
                      </td>

                      <td style={{ textAlign: 'right', color: isStockShortage ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {fmtInt(d.total_stock)}
                      </td>

                      {/* Điều Chỉnh Trực Tiếp Số Thùng 360, Thùng 60 và Thùng Ảo */}
                      <td style={{ textAlign: 'center', backgroundColor: isChecked ? '#fef3c7' : '#f0f9ff' }}>
                        <div style={{ display: 'flex', gap: '0.15rem', alignItems: 'center', justifyContent: 'center' }}>
                          <input 
                            type="number" min="0" value={d.box_large || 0} 
                            onChange={(e) => updateBoxesDirectly(i, 'box_large', e.target.value)} 
                            className="input-field"
                            style={{ width: '45px', textAlign: 'center', padding: '0.15rem', fontWeight: 600, fontSize: '0.85rem' }}
                            title="Số Kiện 360" 
                          />
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>/</span>
                          
                          <input 
                            type="number" min="0" value={d.box_small || 0} 
                            onChange={(e) => updateBoxesDirectly(i, 'box_small', e.target.value)} 
                            className="input-field"
                            style={{ width: '42px', textAlign: 'center', padding: '0.15rem', fontWeight: 600, fontSize: '0.85rem' }}
                            title="Số Thùng 60" 
                          />
                          <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>/</span>

                          <input 
                            type="number" min="0" value={d.box_virtual || 0} 
                            onChange={(e) => updateBoxesDirectly(i, 'box_virtual', e.target.value)} 
                            className="input-field"
                            style={{ width: '42px', textAlign: 'center', padding: '0.15rem', fontWeight: 600, fontSize: '0.85rem', color: '#d97706', borderColor: '#f59e0b' }}
                            title="Số SP lẻ / Thùng Ảo" 
                          />
                        </div>
                      </td>

                      {/* Ô Tổng Số Lượng Phân Bổ Thực Xuất */}
                      <td style={{ textAlign: 'right', backgroundColor: isChecked ? '#fef3c7' : '#f0f9ff' }}>
                        <input 
                          type="number"
                          step="1"
                          min="0"
                          max={Math.round(d.total_requested_qty)}
                          className="input-field"
                          value={Math.round(d.allocated_dispatch_qty || 0)}
                          onChange={(e) => updateAllocatedQty(i, e.target.value)}
                          style={{ 
                            width: '80px', 
                            textAlign: 'right', 
                            fontWeight: 700, 
                            color: '#0369a1',
                            borderColor: '#0284c7',
                            padding: '0.2rem'
                          }}
                        />
                      </td>

                      {/* Trọng Lượng Phân Bổ (Kg) */}
                      <td style={{ textAlign: 'right', backgroundColor: isChecked ? '#fef3c7' : '#f0f9ff', fontWeight: 700, color: '#0369a1', fontSize: '0.85rem' }}>
                        {allocatedWeight.toLocaleString('vi-VN')} Kg
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDeleteReq(d)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          title="Hủy dòng này"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL XÁC NHẬN PHÁT HÀNH PHIẾU XUẤT KHO / SOẠN HÀNG (TỰ ĐỘNG TÁCH PHIẾU THEO TỪNG KHÁCH HÀNG) --- */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '920px',
            maxWidth: '95vw',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header Modal */}
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckSquare size={24} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                    XÁC NHẬN BẢNG PHIẾU XUẤT KHO / SOẠN HÀNG
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    Hệ thống sẽ phát hành riêng biệt từng Phiếu Xuất Kho cho mỗi Khách Hàng để hạch toán độc lập
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Body Modal */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Thẻ thông tin Chuyến xe & Nơi Giao */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc', margin: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Thông Tin Xe Xuất</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                    🚚 {selectedTruck}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Tải trọng xe: {maxTruckWeightKg.toLocaleString()} kg | Đã nạp: <strong>{loadPercentage}%</strong>
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc', margin: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Nơi Giao Hàng</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0369a1', marginTop: '0.25rem' }}>
                    📍 {deliveryLocation}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    (Địa điểm giao hàng cho nhân viên soạn kho)
                  </div>
                </div>

                <div className="card" style={{ padding: '1rem', backgroundColor: '#f8fafc', margin: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Số Phiếu Xuất Sẽ Phát Hành</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginTop: '0.25rem' }}>
                    📋 {customerGroupList.length} Phiếu Xuất Độc Lập
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    (Tương ứng với {customerGroupList.length} Khách Hàng)
                  </div>
                </div>
              </div>

              {/* 2. Danh Sách Các Phiếu Xuất Sẽ Được Phát Hành Cho Từng Khách Hàng */}
              <div>
                <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Danh Sách Phiếu Xuất Kho Tự Động Tách Theo Từng Khách Hàng:
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {customerGroupList.map((group, gIdx) => (
                    <div key={gIdx} className="card" style={{ padding: '1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', margin: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px dashed #cbd5e1' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--primary-color)' }}>
                            Phiếu #{gIdx + 1}: Khách Hàng [{group.customer_name}]
                          </strong>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                            📍 Nơi giao: <strong>{deliveryLocation}</strong>
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>
                          Tổng: {group.total_qty.toLocaleString('vi-VN')} SP ({group.total_weight_kg.toLocaleString('vi-VN')} Kg)
                        </div>
                      </div>

                      <table className="data-table" style={{ width: '100%', margin: 0, fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ width: '40px', textAlign: 'center' }}>STT</th>
                            <th>Mã Sản Phẩm</th>
                            <th>Kênh Bán Hàng</th>
                            <th style={{ textAlign: 'right' }}>SL Thực Xuất</th>
                            <th style={{ textAlign: 'center' }}>Quy Đổi Kiện (K360 / T60 / Ảo)</th>
                            <th style={{ textAlign: 'right' }}>Trọng Lượng (Kg)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((item, itemIdx) => (
                            <tr key={itemIdx}>
                              <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{itemIdx + 1}</td>
                              <td><strong>{item.product_code}</strong></td>
                              <td>{item.channel_code}</td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)' }}>
                                {Number(item.allocated_dispatch_qty).toLocaleString()}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {item.box_large || 0} Kiện 360 / {item.box_small || 0} Thùng 60 / {item.box_virtual || 0} Ảo
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                {Number(item.allocated_weight_kg).toLocaleString()} Kg
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Modal Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
                style={{ width: 'auto' }}
              >
                Quay Lại Điều Chỉnh
              </button>
              <button 
                onClick={handleFinalSubmitDeliveryNote}
                className="btn btn-primary"
                style={{ width: 'auto', backgroundColor: '#10b981', borderColor: '#059669', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <CheckSquare size={18} /> ✅ Phát Hành {customerGroupList.length} Phiếu Xuất Cho Khách Hàng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  // --- UC18 Temporary Dispatch States ---
  const [tempDispatches, setTempDispatches] = useState([]);
  const [loadingTemp, setLoadingTemp] = useState(false);
  const [showCreateTempModal, setShowCreateTempModal] = useState(false);
  const [showConfirmTempModal, setShowConfirmTempModal] = useState(false);
  const [showReturnTempModal, setShowReturnTempModal] = useState(false);
  const [selectedTemp, setSelectedTemp] = useState(null);
  const [tempScanIds, setTempScanIds] = useState('');

  // Form states for Create Temp Dispatch
  const [tempBorrower, setTempBorrower] = useState('');
  const [tempReason, setTempReason] = useState('EXHIBITION_SAMPLE');
  const [tempDueDate, setTempDueDate] = useState('');
  const [tempProductCode, setTempProductCode] = useState('');
  const [tempQty, setTempQty] = useState('');

  // Form states for Return Temp Dispatch
  const [returnCondition, setReturnCondition] = useState('EXACT');
  const [returnQty, setReturnQty] = useState('');
  const [returnSourceId60, setReturnSourceId60] = useState('');
  const [returnedId60, setReturnedId60] = useState('');
  const [returnedProductCode, setReturnedProductCode] = useState('');

  const fetchTempDispatches = async () => {
    setLoadingTemp(true);
    try {
      const res = await httpClient.get('/temporary-dispatch');
      const data = res?.data !== undefined ? res.data : res;
      setTempDispatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching temp dispatches:', err);
    } finally {
      setLoadingTemp(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'temp_dispatch') {
      fetchTempDispatches();
    }
  }, [activeTab]);

  const handleCreateTempSubmit = async () => {
    if (!tempBorrower || !tempProductCode || !tempQty) {
      alert('Vui lòng nhập đầy đủ Bên mượn, Mã sản phẩm và Số lượng!');
      return;
    }
    try {
      await httpClient.post('/temporary-dispatch', {
        borrower_name: tempBorrower,
        reason_code: tempReason,
        due_date: tempDueDate,
        items: [
          { product_code: tempProductCode, qty: Number(tempQty) }
        ]
      });
      alert('Tạo phiếu xuất tạm thành công!');
      setShowCreateTempModal(false);
      setTempBorrower('');
      setTempProductCode('');
      setTempQty('');
      fetchTempDispatches();
    } catch (err) {
      alert('Lỗi khi tạo phiếu xuất tạm: ' + (err.message || 'Không xác định'));
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedTemp || !returnSourceId60.trim() || !returnQty) {
      alert('Vui lòng nhập mã thùng gốc và số lượng hoàn trả!');
      return;
    }
    if (returnCondition !== 'EXACT' && !returnedId60.trim()) {
      alert('Hình thức trả đổi mã bắt buộc nhập mã thùng 60 mới!');
      return;
    }
    try {
      await httpClient.post(`/temporary-dispatch/${selectedTemp.dispatch_no}/return`, {
        return_items: [
          {
            id_60: returnSourceId60.trim(),
            return_condition: returnCondition,
            qty: Number(returnQty),
            returned_id_60: returnedId60,
            returned_product_code: returnedProductCode
          }
        ]
      });
      alert('Hoàn nhập trả hàng thành công!');
      setShowReturnTempModal(false);
      setSelectedTemp(null);
      setReturnSourceId60('');
      setReturnQty('');
      setReturnedId60('');
      setReturnedProductCode('');
      fetchTempDispatches();
    } catch (err) {
      alert('Lỗi hoàn nhập trả hàng: ' + (err.message || 'Không xác định'));
    }
  };

  const handleConfirmTempSubmit = async () => {
    const id60List = tempScanIds
      .split(/[\n,;]+/)
      .map(value => value.trim())
      .filter(Boolean);

    if (!selectedTemp || id60List.length === 0) {
      alert('Vui lòng quét hoặc nhập ít nhất một mã thùng 60!');
      return;
    }

    try {
      await httpClient.post(`/temporary-dispatch/${selectedTemp.dispatch_no}/confirm-scan`, {
        id_60_list: id60List
      });
      alert('Xác nhận thực xuất tạm thành công!');
      setShowConfirmTempModal(false);
      setSelectedTemp(null);
      setTempScanIds('');
      fetchTempDispatches();
    } catch (err) {
      alert('Lỗi xác nhận thực xuất: ' + (err.message || 'Không xác định'));
    }
  };

  const renderTempDispatchTab = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Quản Lý Xuất Tạm Thành Phẩm & Hoàn Nhập (UC18)
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Quản lý các đợt xuất hàng tạm triển lãm/hàng mẫu và theo dõi hạn hoàn trả
              </p>
            </div>
            <button
              onClick={() => setShowCreateTempModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', background: '#d97706', borderColor: '#b45309', color: '#fff', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={18} /> Tạo Phiếu Xuất Tạm Mới
            </button>
          </div>

          <div className="data-table-container" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {loadingTemp ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách xuất tạm...</div>
            ) : (
              <table className="data-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ textAlign: 'center', width: '50px' }}>STT</th>
                    <th>Mã Phiếu Xuất Tạm</th>
                    <th>Bên Nhận / Đơn Vị Mượn</th>
                    <th>Lý Do Xuất Tạm</th>
                    <th>Ngày Xuất</th>
                    <th>Hạn Trả</th>
                    <th style={{ textAlign: 'right' }}>Tổng Số Lượng</th>
                    <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                    <th style={{ textAlign: 'center', width: '140px' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tempDispatches.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        Chưa có phiếu xuất tạm nào. Hãy bấm "Tạo Phiếu Xuất Tạm Mới" để khai báo.
                      </td>
                    </tr>
                  ) : (
                    tempDispatches.map((row, idx) => (
                      <tr key={row.dispatch_no || idx}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td><strong style={{ color: '#d97706' }}>{row.dispatch_no}</strong></td>
                        <td><strong>{row.borrower_name}</strong></td>
                        <td>{row.reason_code}</td>
                        <td>{row.dispatch_date ? new Date(row.dispatch_date).toLocaleDateString('vi-VN') : '-'}</td>
                        <td><span style={{ color: '#dc2626', fontWeight: 700 }}>{row.due_date ? new Date(row.due_date).toLocaleDateString('vi-VN') : '-'}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{(Number(row.total_qty) || 0).toLocaleString()} SP</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: row.status === 'RETURNED' ? '#dcfce7' : row.status === 'PENDING_OUT' ? '#fef3c7' : '#fee2e2',
                            color: row.status === 'RETURNED' ? '#15803d' : row.status === 'PENDING_OUT' ? '#b45309' : '#b91c1c'
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {row.status === 'PENDING_OUT' ? (
                            <button
                              onClick={() => {
                                setSelectedTemp(row);
                                setShowConfirmTempModal(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d', fontWeight: 700, cursor: 'pointer' }}
                            >
                              📦 Quét Thực Xuất
                            </button>
                          ) : row.status === 'TEMP_OUT' || row.status === 'OVERDUE' ? (
                            <button
                              onClick={() => {
                                setSelectedTemp(row);
                                setShowReturnTempModal(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', fontWeight: 700, cursor: 'pointer' }}
                            >
                              ↩️ Nhập Trả Hàng
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal Tạo Phiếu Xuất Tạm (Step 1) */}
        {showCreateTempModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
              <h3 style={{ marginTop: 0, color: '#d97706' }}>📝 Khai Báo Nhu Cầu Xuất Tạm (UC18 - Bước 1)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Đơn Vị Mượn / Bên Nhận (*):</label>
                  <input type="text" className="input-field" style={{ width: '100%', padding: '8px' }} value={tempBorrower} onChange={e => setTempBorrower(e.target.value)} placeholder="Ví dụ: Công ty Kềm Nghĩa / Bộ phận QC..." />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Lý Do Xuất Tạm:</label>
                  <select className="input-field" style={{ width: '100%', padding: '8px' }} value={tempReason} onChange={e => setTempReason(e.target.value)}>
                    <option value="EXHIBITION_SAMPLE">Hàng Mẫu Triển Lãm / Hội Chợ</option>
                    <option value="QC_TESTING">Gửi Mẫu Kiểm Tra Chất Lượng (QC)</option>
                    <option value="REWORK_EXTERNAL">Gửi Xưởng Gia Công / Đổi Mã</option>
                    <option value="R_AND_D">Nghiên Cứu & Phát Triển (R&D)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hạn Cam Kết Trả:</label>
                  <input type="date" className="input-field" style={{ width: '100%', padding: '8px' }} value={tempDueDate} onChange={e => setTempDueDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mã Sản Phẩm (SKU) (*):</label>
                  <input type="text" className="input-field" style={{ width: '100%', padding: '8px' }} value={tempProductCode} onChange={e => setTempProductCode(e.target.value)} placeholder="Ví dụ: SKU-D555..." />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Số Lượng Yêu Cầu (*):</label>
                  <input type="number" className="input-field" style={{ width: '100%', padding: '8px' }} value={tempQty} onChange={e => setTempQty(e.target.value)} placeholder="100..." />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setShowCreateTempModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Hủy</button>
                <button onClick={handleCreateTempSubmit} className="btn btn-primary" style={{ padding: '8px 16px', background: '#d97706', borderColor: '#b45309' }}>Tạo Phiếu (PENDING_OUT)</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Quét Thực Xuất (Step 2) */}
        {showConfirmTempModal && selectedTemp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', width: '550px', maxWidth: '90%' }}>
              <h3 style={{ marginTop: 0, color: '#b45309' }}>📦 Quét Thực Xuất ({selectedTemp.dispatch_no})</h3>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mã Thùng 60 (mỗi dòng một mã):</label>
              <textarea
                className="input-field"
                style={{ width: '100%', minHeight: '150px', padding: '8px', marginTop: '8px' }}
                value={tempScanIds}
                onChange={event => setTempScanIds(event.target.value)}
                autoFocus
                placeholder={'BX-001\nBX-002'}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => setShowConfirmTempModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Hủy</button>
                <button onClick={handleConfirmTempSubmit} className="btn btn-primary" style={{ padding: '8px 16px', background: '#d97706', borderColor: '#b45309' }}>Xác Nhận Xuất Tạm</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Hoàn Nhập Trả Hàng (Step 3) */}
        {showReturnTempModal && selectedTemp && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', width: '550px', maxWidth: '90%' }}>
              <h3 style={{ marginTop: 0, color: '#15803d' }}>↩️ Hoàn Nhập Trả Hàng Xuất Tạm ({selectedTemp.dispatch_no})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mã Thùng 60 Gốc (*):</label>
                  <input type="text" className="input-field" style={{ width: '100%', padding: '8px' }} value={returnSourceId60} onChange={e => setReturnSourceId60(e.target.value)} placeholder="Quét mã thùng đã xuất tạm..." />
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hình Thức Hoàn Trả (Return Scenario):</label>
                  <select className="input-field" style={{ width: '100%', padding: '8px' }} value={returnCondition} onChange={e => setReturnCondition(e.target.value)}>
                    <option value="EXACT">🟢 Tình huống A: Trả nguyên bản (Exact Match)</option>
                    <option value="REPACKED_NEW_BOX">🟡 Tình huống B: Đóng bao bì mới & in mã thùng mới (Repack & Re-print)</option>
                    <option value="REWORKED_NEW_SKU">🟠 Tình huống C: Trả sau gia công/Tái tạo sang mã SP khác (Reworked SKU)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Số Lượng Hoàn Trả (*):</label>
                  <input type="number" className="input-field" style={{ width: '100%', padding: '8px' }} value={returnQty} onChange={e => setReturnQty(e.target.value)} placeholder="Nhập số lượng thực trả..." />
                </div>
                {returnCondition !== 'EXACT' && (
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mã Thùng 60 Mới (In lại):</label>
                    <input type="text" className="input-field" style={{ width: '100%', padding: '8px' }} value={returnedId60} onChange={e => setReturnedId60(e.target.value)} placeholder="Mã thùng 60 mới..." />
                  </div>
                )}
                {returnCondition === 'REWORKED_NEW_SKU' && (
                  <div>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mã Sản Phẩm Trả Về (Mã Mới After Rework):</label>
                    <input type="text" className="input-field" style={{ width: '100%', padding: '8px' }} value={returnedProductCode} onChange={e => setReturnedProductCode(e.target.value)} placeholder="Mã SKU mới sau tái tạo..." />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={() => setShowReturnTempModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Hủy</button>
                <button onClick={handleReturnSubmit} className="btn btn-primary" style={{ padding: '8px 16px', background: '#15803d', borderColor: '#166534' }}>Xác Nhận Hoàn Nhập</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('dispatch')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'dispatch' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'dispatch' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'dispatch' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Truck size={18} /> Phân Bổ Chuyến Xe
        </button>

        <button
          onClick={() => setActiveTab('temp_dispatch')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'temp_dispatch' ? '3px solid #d97706' : '3px solid transparent',
            color: activeTab === 'temp_dispatch' ? '#d97706' : 'var(--text-muted)',
            fontWeight: activeTab === 'temp_dispatch' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Package size={18} /> Quản Lý Xuất Tạm Thành Phẩm (UC18)
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'paste' ? '3px solid var(--primary-color)' : '3px solid transparent',
            color: activeTab === 'paste' ? 'var(--primary-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'paste' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileSpreadsheet size={18} /> Nhập Dữ Liệu Nhu Cầu (Paste Excel)
        </button>
      </div>

      {activeTab === 'dispatch' ? renderDispatchTab() : activeTab === 'temp_dispatch' ? renderTempDispatchTab() : renderPasteTab()}
    </div>
  );
}
