import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, Search, FileText, ChevronDown, ChevronUp, BookOpen, 
  Download, AlertCircle, RefreshCw, Layers, TrendingUp, TrendingDown, 
  Box, Tag, Activity, Calendar, Filter, CheckCircle2, ShieldCheck, Zap, ArrowRight, X
} from 'lucide-react';
import { ledgerApi } from '../features/ledger/api/ledgerApi.js';
import StockIssueVoucherModal from './StockIssueVoucherModal.jsx';

export default function LedgerReportScreen({ onBack }) {
  // Ưu tiên MẶC ĐỊNH xem Sổ Tổng Hợp Theo Mã Số Lượng SKU (SUMMARY - item_ledger) trước
  const [activeTab, setActiveTab] = useState('SUMMARY'); // 'SUMMARY' (item_ledger) or 'DETAIL' (inventory_ledger)
  
  const [transactions, setTransactions] = useState([]);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [txDetails, setTxDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Voucher modal state
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Quick Date Filter State (Mặc định: Trong tuần này để tránh quá tải hệ thống)
  const getInitialDates = () => {
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    return { from: monday.toISOString().substring(0, 10), to: todayStr };
  };
  const initialDates = getInitialDates();

  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [txType, setTxType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateRange, setActiveDateRange] = useState('THIS_WEEK'); // 'TODAY', 'YESTERDAY', 'THIS_WEEK'

  const handleQuickDateFilter = (rangeKey) => {
    setActiveDateRange(rangeKey);
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    if (rangeKey === 'TODAY') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (rangeKey === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yestStr = yesterday.toISOString().substring(0, 10);
      setFromDate(yestStr);
      setToDate(yestStr);
    } else if (rangeKey === 'THIS_WEEK') {
      const dayOfWeek = now.getDay();
      const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMonday);
      setFromDate(monday.toISOString().substring(0, 10));
      setToDate(todayStr);
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (txType) params.type = txType;

      const res = await ledgerApi.getTransactions(params);
      const listData = res?.data !== undefined ? res.data : res;

      if (Array.isArray(listData)) {
        setTransactions(listData);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Lỗi lấy báo cáo sổ cái:", err);
      setError(err.message || 'Không thể tải danh sách giao dịch Sổ cái Kép từ CSDL');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, txType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchDetails = async (transactionId) => {
    setDetailLoading(true);
    try {
      const res = await ledgerApi.getTransactionDetail(transactionId);
      const listData = res?.data !== undefined ? res.data : res;
      setTxDetails(Array.isArray(listData) ? listData : []);
    } catch (err) {
      console.error("Lỗi tải chi tiết sổ cái:", err);
      setTxDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleRow = (txId) => {
    if (selectedTxId === txId) {
      setSelectedTxId(null);
      setTxDetails([]);
    } else {
      setSelectedTxId(txId);
      fetchDetails(txId);
    }
  };

  // Filtered List based on search query
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (tx.TransactionId || tx.transaction_id || tx.id || '').toLowerCase().includes(q) ||
        (tx.DocumentNo || tx.ref_no || tx.handover_no || tx.document_no || '').toLowerCase().includes(q) ||
        (tx.PostedBy || tx.created_by || tx.posted_by || '').toLowerCase().includes(q) ||
        (tx.PartnerUnit || tx.partner_unit || tx.partner_name || '').toLowerCase().includes(q) ||
        (tx.ProductCode || tx.product_code || '').toLowerCase().includes(q) ||
        (tx.Id60 || tx.id_60 || '').toLowerCase().includes(q)
      );
    });
  }, [transactions, searchQuery]);

  // Calculate Metrics Overview
  const totalTxCount = filteredTransactions.length;
  let totalInflowQty = 0;
  let totalOutflowQty = 0;

  filteredTransactions.forEach(tx => {
    const qty = Number(tx.TotalQuantity || tx.totalQuantity || tx.quantity_change || tx.qty || tx.total_qty) || 0;
    const typeStr = String(tx.TransactionType || tx.transaction_type || '').toUpperCase();
    const isInbound = ['RECEIPT', 'RECEIPT_PARTIAL', 'INITIAL_BALANCE', 'INBOUND'].some(t => typeStr.includes(t));

    if (isInbound) {
      totalInflowQty += Math.abs(qty);
    } else {
      totalOutflowQty += Math.abs(qty);
    }
  });

  const netBalance = totalInflowQty - totalOutflowQty;

  // Aggregate SKU Summary List for TAB 1 (item_ledger)
  const skuSummaryList = useMemo(() => {
    const map = {};
    filteredTransactions.forEach(tx => {
      const docNo = tx.DocumentNo || tx.document_no || 'N/A';
      const qty = Number(tx.TotalQuantity || tx.totalQuantity || tx.quantity_change || tx.qty) || 0;
      const typeStr = String(tx.TransactionType || tx.transaction_type || '').toUpperCase();
      const isInbound = ['RECEIPT', 'RECEIPT_PARTIAL', 'INITIAL_BALANCE', 'INBOUND'].some(t => typeStr.includes(t));
      const sku = (tx.ProductCode || tx.product_code || 'CHƯA PHÂN LOẠI').trim();

      if (!map[sku]) {
        map[sku] = {
          productCode: sku,
          inflow: 0,
          outflow: 0,
          netBalance: 0,
          docSet: new Set(),
          txCount: 0,
          lastUpdated: tx.PostedAt || tx.posted_at || tx.created_at
        };
      }

      if (isInbound) {
        map[sku].inflow += Math.abs(qty);
      } else {
        map[sku].outflow += Math.abs(qty);
      }
      map[sku].netBalance = map[sku].inflow - map[sku].outflow;
      map[sku].docSet.add(docNo);
      map[sku].txCount += 1;
    });

    return Object.values(map).sort((a, b) => b.netBalance - a.netBalance);
  }, [filteredTransactions]);

  // Helper cho Badge Loại Giao Dịch
  const renderTxBadge = (typeRaw) => {
    const type = String(typeRaw || '').toUpperCase();
    if (type === 'RECEIPT') {
      return (
        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={13} /> NHẬP CHÍNH THỨC
        </span>
      );
    }
    if (type === 'RECEIPT_PARTIAL') {
      return (
        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Zap size={13} /> NHẬP LẺ (THÙNG ẢO)
        </span>
      );
    }
    if (type === 'INITIAL_BALANCE') {
      return (
        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={13} /> TỒN ĐẦU KỲ
        </span>
      );
    }
    if (type === 'PICKING' || type === 'DISPATCH' || type === 'OUTBOUND') {
      return (
        <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <TrendingDown size={13} /> XUẤT KHO PICKING
        </span>
      );
    }
    return (
      <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
        {type || 'GIAO DỊCH'}
      </span>
    );
  };

  // Switch to Detail Tab with pre-filtered search query
  const drillDownToDocumentDetail = (productCode) => {
    if (productCode && productCode !== 'CHƯA PHÂN LOẠI') {
      setSearchQuery(productCode);
    }
    setActiveTab('DETAIL');
  };

  // Quay trở lại danh sách Tổng hợp tất cả SKU
  const returnToSummaryTab = () => {
    setSearchQuery('');
    setActiveTab('SUMMARY');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Không có dữ liệu sổ cái để xuất file.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mã Giao Dịch,Loại Giao Dịch,Mã Chứng Từ Gốc,Đơn Vị / Đối Tác,Mã Sản Phẩm,Người Thực Hiện,Ngày Hạch Toán,Tổng Số Lượng\n";

    filteredTransactions.forEach(tx => {
      const txId = tx.TransactionId || tx.transaction_id || tx.id || 'N/A';
      const type = tx.TransactionType || tx.transaction_type || 'GIAO_DICH';
      const docNo = tx.DocumentNo || tx.ref_no || tx.handover_no || tx.document_no || 'N/A';
      const partner = tx.PartnerName || tx.PartnerUnit || tx.partner_name || 'N/A';
      const sku = tx.ProductCode || tx.product_code || 'N/A';
      const user = tx.PostedBy || tx.posted_by || 'System';
      const date = (tx.PostedAt || tx.posted_at) ? String(tx.PostedAt || tx.posted_at).replace('T', ' ').substring(0, 19) : '';
      const qty = tx.TotalQuantity || tx.totalQuantity || 0;

      csvContent += `"${txId}","${type}","${docNo}","${partner}","${sku}","${user}","${date}","${qty}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_Cao_So_Cai_Kep_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="screen-container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.25rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Banner Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '1.5rem 2rem', 
        borderRadius: '16px', 
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {onBack && (
            <button 
              onClick={onBack} 
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.2)', 
                background: 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                backdropFilter: 'blur(4px)',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ backgroundColor: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>UC22.2</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Báo Cáo Sổ Cái Kép (Dual Ledger Report)
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
              Ưu tiên kiểm tra Tổng Hợp Mã Số Lượng SKU trước, đối soát chi tiết theo đơn vị phiếu sau
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={fetchTransactions} 
            style={{ 
              padding: '10px 16px', 
              borderRadius: '8px', 
              border: '1px solid rgba(255,255,255,0.2)', 
              background: 'rgba(255,255,255,0.1)', 
              color: '#fff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={16} /> Tải Lại
          </button>
          <button 
            onClick={handleExportCSV} 
            style={{ 
              padding: '10px 18px', 
              borderRadius: '8px', 
              border: 'none', 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: '#fff', 
              cursor: 'pointer', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Download size={18} /> Xuất Excel / CSV
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={26} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mặt Hàng Phát Sinh (SKU)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{skuSummaryList.length.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Mã</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={26} color="#16a34a" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Nhập Kho (Credit)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>+ {totalInflowQty.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SP</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingDown size={26} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Xuất Kho (Debit)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>- {totalOutflowQty.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SP</span></div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={26} color="#0284c7" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Tồn Ròng Sổ Cái</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7' }}>{netBalance.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>SP</span></div>
          </div>
        </div>

      </div>

      {/* Main Container Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
        
        {/* Navigation Tabs (Ưu tiên Sổ Tổng Hợp Theo Mã Số Lượng SKU làm MẶC ĐỊNH) */}
        <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9', marginBottom: '1.25rem', gap: '8px' }}>
          <button
            onClick={returnToSummaryTab}
            style={{
              padding: '12px 24px', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              borderBottom: activeTab === 'SUMMARY' ? '3px solid #2563eb' : 'none',
              color: activeTab === 'SUMMARY' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'SUMMARY' ? 700 : 600,
              fontSize: '0.95rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}
          >
            <Tag size={18} /> 🌟 1. Sổ Tổng Hợp Theo Mã Số Lượng SKU (item_ledger)
          </button>
          
          <button
            onClick={() => setActiveTab('DETAIL')}
            style={{
              padding: '12px 24px', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              borderBottom: activeTab === 'DETAIL' ? '3px solid #2563eb' : 'none',
              color: activeTab === 'DETAIL' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'DETAIL' ? 700 : 600,
              fontSize: '0.95rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}
          >
            <Box size={18} /> 📦 2. Sổ Chi Tiết Theo Đơn Vị Phiếu/Thùng (inventory_ledger)
          </button>
        </div>

        {/* Quick Return Bar when in DETAIL tab or search active */}
        {(activeTab === 'DETAIL' || searchQuery) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'space-between', 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            padding: '10px 16px', 
            borderRadius: '10px', 
            marginBottom: '1rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#1e40af', fontWeight: 600 }}>
              <Layers size={18} /> 
              <span>Đang lọc theo: <strong>{searchQuery ? `Mã SKU [ ${searchQuery} ]` : 'Chi tiết phiếu'}</strong></span>
            </div>
            <button
              onClick={returnToSummaryTab}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #2563eb',
                background: '#ffffff',
                color: '#2563eb',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <ArrowLeft size={16} /> Quay Lại Sổ Tổng Hợp Tất Cả SKU
            </button>
          </div>
        )}

        {/* Quick Date Filter Chips Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Calendar size={15} /> Lọc nhanh thời gian:
          </span>
          {[
            { key: 'TODAY', label: '📅 Hôm Nay' },
            { key: 'YESTERDAY', label: '⏪ Hôm Qua' },
            { key: 'THIS_WEEK', label: '📆 Trong Tuần Này' }
          ].map(chip => {
            const isActive = activeDateRange === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => handleQuickDateFilter(chip.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1d4ed8' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 4px rgba(37, 99, 235, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.25rem', 
          flexWrap: 'wrap', 
          alignItems: 'flex-end', 
          backgroundColor: '#f8fafc', 
          padding: '1.25rem', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0' 
        }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>
              Tìm kiếm mã sản phẩm / chứng từ
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Nhập mã SKU (D.507V, N.27), mã chứng từ (0181617CC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', 
                  height: '42px', 
                  paddingLeft: '2.5rem', 
                  paddingRight: searchQuery ? '2.5rem' : '1rem', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Từ ngày</label>
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
              style={{ height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Đến ngày</label>
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
              style={{ height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.9rem' }} 
            />
          </div>

        {/* Quick Transaction Type Filter Chips Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Layers size={16} /> Loại Giao Dịch:
          </span>
          {[
            { key: '', label: '🌐 Tất Cả Loại Giao Dịch', activeBg: '#2563eb', activeColor: '#ffffff' },
            { key: 'INBOUND', label: '🟢 Nhập Kho (INBOUND)', activeBg: '#16a34a', activeColor: '#ffffff' },
            { key: 'OUTBOUND', label: '🔴 Xuất Kho (OUTBOUND)', activeBg: '#dc2626', activeColor: '#ffffff' },
            { key: 'INITIAL_BALANCE', label: '🔵 Tồn Đầu Kỳ (INITIAL)', activeBg: '#0284c7', activeColor: '#ffffff' },
            { key: 'STOCK_RECLASSIFY', label: '🟡 Đổi Loại Tồn Kho', activeBg: '#d97706', activeColor: '#ffffff' }
          ].map(btn => {
            const isActive = (txType || '') === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => setTxType(btn.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? `1px solid ${btn.activeBg}` : '1px solid #cbd5e1',
                  backgroundColor: isActive ? btn.activeBg : '#ffffff',
                  color: isActive ? btn.activeColor : '#475569',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 3px 6px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

          <button 
            onClick={fetchTransactions} 
            style={{ 
              height: '42px', 
              padding: '0 1.5rem', 
              borderRadius: '8px', 
              background: '#2563eb', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={16} /> Lọc Dữ Liệu
          </button>
        </div>

        {/* Status Loading / Error */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1rem', fontWeight: 600 }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} /><br />
            Đang tổng hợp Sổ Cái Kép theo Mã Sản Phẩm & Phiếu từ CSDL...
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', color: '#dc2626', background: '#fee2e2', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* TAB 1: SỔ TỔNG HỢP THEO MÃ SỐ LƯỢNG (ITEM LEDGER) - MẶC ĐỊNH */}
        {activeTab === 'SUMMARY' && !loading && !error && (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc', width: '60px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>MÃ SẢN PHẨM (SKU)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', backgroundColor: '#f8fafc' }}>TỔNG NHẬP (CREDIT)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', backgroundColor: '#f8fafc' }}>TỔNG XUẤT (DEBIT)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', backgroundColor: '#f8fafc' }}>SỐ DƯ TỒN SỔ CÁI</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>SỐ CHỨNG TỪ</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: '#f8fafc' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {skuSummaryList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      Chưa có dữ liệu tổng hợp mặt hàng nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  skuSummaryList.map((item, idx) => (
                    <tr 
                      key={item.productCode}
                      style={{ 
                        borderBottom: '1px solid #f1f5f9', 
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                          {item.productCode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        + {item.inflow.toLocaleString()} SP
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                        - {item.outflow.toLocaleString()} SP
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: item.netBalance >= 0 ? '#0284c7' : '#dc2626',
                          backgroundColor: item.netBalance >= 0 ? '#f0f9ff' : '#fef2f2',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: item.netBalance >= 0 ? '1px solid #bae6fd' : '1px solid #fecaca'
                        }}>
                          {item.netBalance.toLocaleString()} SP
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ backgroundColor: '#e2e8f0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                          📁 {item.docSet.size} chứng từ
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => drillDownToDocumentDetail(item.productCode)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid #2563eb',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Xem Chi Tiết Theo Phiếu <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: SỔ CHI TIẾT THEO ĐƠN VỊ PHIẾU/THÙNG (INVENTORY LEDGER) */}
        {activeTab === 'DETAIL' && !loading && !error && (
          <div style={{ overflowX: 'auto', maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc' }}>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc', width: '60px', textAlign: 'center' }}>XEM</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>MÃ BÚT TOÁN (TX ID)</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>LOẠI GIAO DỊCH</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>MÃ CHỨNG TỪ GỐC</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>ĐƠN VỊ NGUỒN / ĐỐI TÁC</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>MÃ SẢN PHẨM (SKU)</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right', backgroundColor: '#f8fafc' }}>TỔNG SỐ LƯỢNG (SP)</th>
                  <th style={{ padding: '14px 16px', backgroundColor: '#f8fafc' }}>THỜI GIAN HẠCH TOÁN</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      Chưa có bút toán hạch toán Sổ cái Kép nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const txId = tx.TransactionId || tx.transaction_id || tx.id || 'N/A';
                    const type = tx.TransactionType || tx.transaction_type || 'GIAO_DICH';
                    const docNo = tx.DocumentNo || tx.ref_no || tx.handover_no || tx.document_no || 'N/A';
                    const customer = tx.PartnerName || tx.customer_name || tx.partner_name || tx.borrower_name || tx.PartnerUnit || tx.partner_unit || 'Nội bộ / Xưởng SX';
                    const sku = tx.ProductCode || tx.product_code || 'N/A';
                    const qty = Number(tx.TotalQuantity || tx.totalQuantity || tx.quantity_change || tx.qty || tx.total_qty) || 0;
                    const typeStr = String(type).toUpperCase();
                    const isCredit = ['RECEIPT', 'RECEIPT_PARTIAL', 'INITIAL_BALANCE', 'INBOUND'].some(t => typeStr.includes(t));
                    const isExpanded = selectedTxId === txId;

                    return (
                      <React.Fragment key={txId}>
                        <tr 
                          onClick={() => toggleRow(txId)}
                          style={{ 
                            borderBottom: '1px solid #f1f5f9', 
                            backgroundColor: isExpanded ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleRow(txId); }} 
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb', padding: '4px' }}
                            >
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                            {txId}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {renderTxBadge(type)}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 700 }}>
                            {docNo}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 600 }}>
                            {customer}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: 700, fontFamily: 'monospace' }}>
                            {sku}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: isCredit ? '#16a34a' : '#dc2626',
                              backgroundColor: isCredit ? '#f0fdf4' : '#fef2f2',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: isCredit ? '1px solid #bbf7d0' : '1px solid #fecaca'
                            }}>
                              {isCredit ? `+ ${Math.abs(qty).toLocaleString()} (CREDIT)` : `- ${Math.abs(qty).toLocaleString()} (DEBIT)`}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                            {(tx.PostedAt || tx.posted_at || tx.created_at) ? String(tx.PostedAt || tx.posted_at || tx.created_at).replace('T', ' ').substring(0, 19) : 'Hôm nay'}
                          </td>
                        </tr>

                        {/* Expanded Detail Rows */}
                        {isExpanded && (
                          <tr>
                            <td colSpan="8" style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderBottom: '2px solid #2563eb' }}>
                              <div style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                                  <div>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>
                                      📌 Bút Toán Chi Tiết Giao Dịch: <span style={{ color: '#2563eb', fontFamily: 'monospace' }}>[{txId}]</span>
                                    </h4>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                      Mã Chứng Từ Gốc: <strong>{docNo}</strong> | Người hạch toán: <strong>{tx.PostedBy || tx.posted_by || 'System'}</strong>
                                    </span>
                                  </div>
                                  
                                  {type === 'PICKING' || type === 'DISPATCH' ? (
                                    <button
                                      onClick={() => {
                                        setSelectedVoucher({
                                          documentNo: docNo !== 'N/A' ? docNo : '717',
                                          recipientName: customer,
                                          items: txDetails.map((d, i) => ({
                                            stt: i + 1,
                                            name: d.product_name || `Mặt hàng ${d.product_code || ''}`,
                                            code: d.product_code || '02010101010014',
                                            uom: d.uom || 'Cây',
                                            reqQty: Number(d.quantity_change || d.qty) || 1200,
                                            actQty: Number(d.quantity_change || d.qty) || 1200,
                                            price: 0,
                                            amount: 0
                                          }))
                                        });
                                        setIsVoucherOpen(true);
                                      }}
                                      style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #1d4ed8', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                      <FileText size={16} /> In Phiếu Xuất Kho (Mẫu 02-VT)
                                    </button>
                                  ) : null}
                                </div>

                                {detailLoading ? (
                                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>Đang tải chi tiết các dòng hạch toán...</p>
                                ) : (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                    <thead>
                                      <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                                        <th style={{ padding: '10px 12px' }}>MÃ THÙNG / KIỆN (ID 60)</th>
                                        <th style={{ padding: '10px 12px' }}>LOẠI THÙNG</th>
                                        <th style={{ padding: '10px 12px' }}>MÃ SẢN PHẨM (SKU)</th>
                                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>SỐ LƯỢNG HẠCH TOÁN</th>
                                        <th style={{ padding: '10px 12px' }}>TRẠNG THÁI TỒN (STOCK TYPE)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {txDetails.length === 0 ? (
                                        <tr><td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy dòng chi tiết hạch toán.</td></tr>
                                      ) : (
                                        txDetails.map((dt, idx) => {
                                          const id60 = dt.Id60 || dt.id_60 || 'N/A';
                                          const isVirtual = id60.startsWith('VIR-');
                                          return (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                                                {id60}
                                              </td>
                                              <td style={{ padding: '10px 12px' }}>
                                                {isVirtual ? (
                                                  <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    ⚡ THÙNG ẢO
                                                  </span>
                                                ) : (
                                                  <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                    📦 THÙNG VẬT LÝ
                                                  </span>
                                                )}
                                              </td>
                                              <td style={{ padding: '10px 12px', color: '#2563eb', fontWeight: 700 }}>
                                                {dt.ProductCode || dt.product_code || 'N/A'}
                                              </td>
                                              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800 }}>
                                                {(Number(dt.QuantityChange || dt.quantity_change || dt.qty) || 0).toLocaleString()} SP
                                              </td>
                                              <td style={{ padding: '10px 12px', fontWeight: 700, color: (dt.NewStockType || dt.new_stock_type) === 'BLOCKED' ? '#dc2626' : '#16a34a' }}>
                                                {dt.NewStockType || dt.new_stock_type || 'UNRESTRICTED'}
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockIssueVoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        voucherData={selectedVoucher}
      />
    </div>
  );
}
