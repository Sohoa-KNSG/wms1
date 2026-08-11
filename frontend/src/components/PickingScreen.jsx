import React, { useState, useEffect, useRef } from 'react';
import { Truck, ArrowLeft, Barcode, CheckCircle, AlertTriangle, Package, Loader, Save, ListChecks, History, Box, ArrowRightCircle, X } from 'lucide-react';
import { pickingApi } from '../features/picking/api/pickingApi.js';

export default function PickingScreen({ user, onBack }) {
    // Đảm bảo nút Thủ Kho Duyệt luôn hiển thị cho người dùng trên hệ thống WMS
    const isStorekeeper = true;
    // Tầng 1: Danh sách
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [activeTab, setActiveTab] = useState('PICKING'); // PICKING, PICKED, STAGED
    const [selectedTruckFilter, setSelectedTruckFilter] = useState(''); // Bộ lọc theo chuyến xe tải
    
    // Tầng Tổng Hợp Theo Xe Tải
    const [selectedTruckSummary, setSelectedTruckSummary] = useState(null);
    const [truckSummaryData, setTruckSummaryData] = useState([]);
    const [loadingTruckSummary, setLoadingTruckSummary] = useState(false);

    // Tầng Xem Gợi Ý FIFO & Vị Trí Kho Dành Cho Thủ Kho (Tier 2 Review)
    const [viewFifoModalItem, setViewFifoModalItem] = useState(null);
    const [modalFifoData, setModalFifoData] = useState(null);
    const [modalScanHistory, setModalScanHistory] = useState([]);
    const [loadingModalFifo, setLoadingModalFifo] = useState(false);

    // Tầng Thủ Kho Duyệt Xác Nhận Xuất Kho (UC16)
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalNote, setApprovalNote] = useState('');
    
    // Tầng 2: Chi tiết phiếu
    const [selectedNote, setSelectedNote] = useState(null);
    const [noteDetails, setNoteDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Tầng 3: Quét mã theo dòng
    const [selectedLine, setSelectedLine] = useState(null);
    const [barcode, setBarcode] = useState('');
    const [scanMessage, setScanMessage] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);
    const [fifoSuggestions, setFifoSuggestions] = useState([]);
    const barcodeInputRef = useRef(null);

    // --- Tầng 4 (Tách thùng UC17) ---
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [availableBoxes, setAvailableBoxes] = useState([]);
    const [selectedBoxForSplit, setSelectedBoxForSplit] = useState(null);
    const [splitQty, setSplitQty] = useState('');
    const [splitLoading, setSplitLoading] = useState(false);

    // --- Tầng 1 ---
    const fetchNotes = async () => {
        setLoadingNotes(true);
        let list = [];
        try {
            const res = await pickingApi.getDeliveryNotes();
            let data = res?.data !== undefined ? res.data : res;
            list = Array.isArray(data) ? data : [];
        } catch (err) {
            console.error('Backend API error:', err);
        } finally {
            setNotes(list);
            setLoadingNotes(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Filter notes based on active tab
    const getFilteredNotes = () => {
        return notes.filter(n => {
            const st = (n.status || 'NEW').toUpperCase();
            if (activeTab === 'PICKING') return st === 'NEW' || st === 'PENDING_PICK' || st === 'PICKING';
            if (activeTab === 'PICKED') return st === 'PICKED';
            if (activeTab === 'STAGED') return st === 'STAGED';
            return false;
        });
    };

    // --- Tầng 2 ---
    const fetchDetails = async (noteId) => {
        setLoadingDetails(true);
        let data = null;
        try {
            const res = await pickingApi.getDeliveryNoteDetails(noteId);
            data = res?.data !== undefined ? res.data : res;
        } catch (err) {
            console.error('Backend API error for details:', err);
        } finally {
            if (data && (data.header || data.details || data.lines)) {
                setNoteDetails(data);
                if (data?.header?.status) {
                    setSelectedNote(prev => ({...prev, status: data.header.status}));
                }
            } else {
                setNoteDetails(null);
            }
            setLoadingDetails(false);
        }
    };

    const handleSelectNote = (note) => {
        setSelectedNote(note);
        setSelectedLine(null);
        fetchDetails(note.delivery_note_no);
    };

    const handleBackToList = () => {
        setSelectedNote(null);
        setSelectedLine(null);
        setNoteDetails(null);
        fetchNotes();
    };

    // Hành động chuyển trạng thái (Complete Pick, Stage, Ship)
    const handleStateAction = async (actionUrl, confirmMsg, successMsg) => {
        if (!window.confirm(confirmMsg)) return;
        
        setIsProcessing(true);
        try {
            const res = await pickingApi.completePick({ DeliveryNoteNo: selectedNote.delivery_note_no });
            const data = res?.data !== undefined ? res.data : res;
            alert(data?.message || successMsg);
            if (actionUrl === 'complete') {
                setShowApprovalModal(true);
            } else {
                handleBackToList();
            }
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không xác định'));
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Hành động xử lý GOM NHÓM THEO CHUYẾN XE TẢI ---
    const handleOpenTruckSummary = async (truckPlate) => {
        setSelectedTruckSummary(truckPlate);
        setLoadingTruckSummary(true);
        try {
            const res = await pickingApi.getTruckSummary(truckPlate);
            const data = res?.data !== undefined ? res.data : res;
            setTruckSummaryData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Lỗi lấy tổng hợp xe tải', err);
        } finally {
            setLoadingTruckSummary(false);
        }
    };

    const handleBatchTruckAction = async (truckPlate, endpoint, confirmMsg) => {
        if (!window.confirm(confirmMsg)) return;
        setIsProcessing(true);
        try {
            let res;
            if (endpoint === 'complete') {
                res = await pickingApi.completeTruck(truckPlate);
            } else if (endpoint === 'stage') {
                res = await pickingApi.stageTruck(truckPlate);
            } else {
                throw new Error('Thao tác chuyến xe không hợp lệ');
            }
            alert(res?.message || 'Thao tác thành công!');
            setSelectedTruckSummary(null);
            fetchNotes();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Thất bại'));
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Thao tác Thủ kho Xem Vị Trí FIFO khi duyệt phiếu (Tier 2) ---
    const handleOpenFifoModal = async (item) => {
        const normalizedItem = {
            ...item,
            qty: Number(item.qty || item.requested_qty || 0),
            picked_qty: Number(item.picked_qty || 0)
        };
        setViewFifoModalItem(normalizedItem);
        setLoadingModalFifo(true);
        try {
            const [fifoRes, scanRes] = await Promise.all([
                pickingApi.getFifoSuggestions(normalizedItem.product_code),
                pickingApi.getLineScanHistory(selectedNote?.delivery_note_no, normalizedItem.product_code)
            ]);
            setModalFifoData(fifoRes?.data !== undefined ? fifoRes.data : fifoRes);
            setModalScanHistory(scanRes?.data !== undefined ? scanRes.data : scanRes);
        } catch (err) {
            console.error('Lỗi xem vị trí FIFO', err);
        } finally {
            setLoadingModalFifo(false);
        }
    };

    // --- Thủ kho Ký Duyệt Xác Nhận Xuất Kho ---
    const handleApproveStorekeeper = async () => {
        setIsProcessing(true);
        try {
            const res = await pickingApi.stageDeliveryNote({ 
                DeliveryNoteNo: selectedNote.delivery_note_no,
                Note: approvalNote || 'Thủ kho đã đối soát và ký duyệt xác nhận xuất kho.'
            });
            alert(res?.message || 'Ký duyệt xuất kho thành công!');
            setShowApprovalModal(false);
            handleBackToList();
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Thất bại'));
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Tầng 3 ---
    const fetchHistory = async (noteId, pcode) => {
        try {
            const res = await pickingApi.getLineScanHistory(noteId, pcode);
            const data = res?.data !== undefined ? res.data : res;
            setScanHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching history', err);
        }
    };

    const handleSelectLine = (line) => {
        const normalizedLine = {
            ...line,
            qty: Number(line.qty || line.requested_qty || 0),
            picked_qty: Number(line.picked_qty || 0)
        };
        setSelectedLine(normalizedLine);
        setBarcode('');
        setScanMessage(null);
        fetchHistory(selectedNote?.delivery_note_no, normalizedLine.product_code);
        fetchFifoSuggestions(normalizedLine.product_code);
        setTimeout(() => {
            if (barcodeInputRef.current) barcodeInputRef.current.focus();
        }, 100);
    };

    const fetchFifoSuggestions = async (pcode) => {
        try {
            const res = await pickingApi.getFifoSuggestions(pcode);
            const data = res?.data !== undefined ? res.data : res;
            setFifoSuggestions(data && typeof data === 'object' ? data : {});
        } catch (err) {
            console.error('Lỗi lấy gợi ý FIFO', err);
            setFifoSuggestions({});
        }
    };

    const handleBackToNote = () => {
        setSelectedLine(null);
        setScanMessage(null);
        setShowSplitModal(false);
        // Refresh details progress
        fetchDetails(selectedNote.delivery_note_no);
    };

    const handleOpenSplitModal = async () => {
        setShowSplitModal(true);
        setSplitLoading(true);
        setSelectedBoxForSplit(null);
        setSplitQty(Math.max(0, selectedLine.qty - selectedLine.picked_qty));
        
        try {
            const res = await pickingApi.getAvailableBoxes(selectedLine.product_code);
            const data = res?.data !== undefined ? res.data : res;
            setAvailableBoxes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching available boxes', err);
        } finally {
            setSplitLoading(false);
        }
    };

    const handleConfirmSplit = async () => {
        if (!selectedBoxForSplit) {
            alert('Vui lòng chọn 1 thùng để tách');
            return;
        }
        const qty = parseFloat(splitQty);
        if (isNaN(qty) || qty <= 0) {
            alert('Số lượng không hợp lệ');
            return;
        }
        if (qty > selectedBoxForSplit.current_qty) {
            alert('Số lượng lấy không được lớn hơn số lượng hiện có của thùng');
            return;
        }

        setSplitLoading(true);
        try {
            const res = await pickingApi.splitBox({
                DeliveryNoteNo: selectedNote.delivery_note_no,
                ProductCode: selectedLine.product_code,
                SourceId60: selectedBoxForSplit.id_60,
                SplitQty: qty
            });
            const data = res?.data !== undefined ? res.data : res;
            alert(res?.message || 'Tách thùng thành công');
            setShowSplitModal(false);
            const newPicked = selectedLine.picked_qty + qty;
            setSelectedLine({ ...selectedLine, picked_qty: newPicked });
            fetchHistory(selectedNote.delivery_note_no, selectedLine.product_code);
            
            setScanMessage({
                type: 'success',
                message: `Lấy lẻ thành công ${qty} SP từ thùng ${selectedBoxForSplit.id_60} (Sinh thùng ảo ${data.virtual_id || ''})`
            });
        } catch (err) {
            alert('Lỗi: ' + (err.message || 'Không xác định'));
        } finally {
            setSplitLoading(false);
        }
    };

    const handleScan = async (e) => {
        e.preventDefault();
        if (!barcode.trim()) return;

        try {
            const res = await pickingApi.scanPickingUnit({
                DeliveryNoteNo: selectedNote.delivery_note_no,
                Barcode: barcode.trim(),
                ExpectedProductCode: selectedLine.product_code
            });
            const data = res?.data !== undefined ? res.data : res;
            setScanMessage({ type: 'success', text: `Quét thành công: ${data.product_code} (SL: ${data.qty})` });
            setSelectedLine(prev => ({
                ...prev,
                picked_qty: prev.picked_qty + data.qty
            }));
            fetchHistory(selectedNote.delivery_note_no, selectedLine.product_code);
        } catch (err) {
            setScanMessage({ type: 'error', text: err.message || 'Không thể kết nối máy chủ' });
        } finally {
            setBarcode('');
            if (barcodeInputRef.current) barcodeInputRef.current.focus();
        }
    };


    // -------------------------------------------------------------
    // RENDER: Tầng 1 - Danh sách Phiếu
    // -------------------------------------------------------------
    if (!selectedNote) {
        const filtered = getFilteredNotes();
        
        return (
            <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button onClick={onBack} className="btn-icon" title="Quay lại">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                            Soạn Hàng & Xuất Bến (UC16)
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Quản lý toàn trình: Soạn Hàng (Pick) &gt; Tập Kết (Stage) &gt; Xuất Bến (Ship)
                        </p>
                    </div>
                </div>

                {/* Tabs & Bộ Lọc Xe Tải */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button 
                            className={`btn ${activeTab === 'PICKING' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('PICKING')}
                        >
                            <Package size={18} style={{ marginRight: '0.5rem' }}/> Đang Soạn 
                            ({notes.filter(n => ['NEW', 'PENDING_PICK', 'PICKING'].includes((n.status || '').toUpperCase())).length})
                        </button>
                        <button 
                            className={`btn ${activeTab === 'PICKED' ? 'btn-primary' : 'btn-outline'}`}
                            style={{ backgroundColor: activeTab === 'PICKED' ? '#f59e0b' : 'transparent', borderColor: activeTab === 'PICKED' ? '#f59e0b' : '#d1d5db', color: activeTab === 'PICKED' ? '#fff' : 'inherit' }}
                            onClick={() => setActiveTab('PICKED')}
                        >
                            <Box size={18} style={{ marginRight: '0.5rem' }}/> Chờ Tập Kết 
                            ({notes.filter(n => (n.status || '').toUpperCase() === 'PICKED').length})
                        </button>
                        {isStorekeeper ? (
                            <button 
                                className={`btn ${activeTab === 'STAGED' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ backgroundColor: activeTab === 'STAGED' ? '#10b981' : 'transparent', borderColor: activeTab === 'STAGED' ? '#10b981' : '#d1d5db', color: activeTab === 'STAGED' ? '#fff' : 'inherit' }}
                                onClick={() => setActiveTab('STAGED')}
                            >
                                <Truck size={18} style={{ marginRight: '0.5rem' }}/> Chờ Xuất Bến 
                                ({notes.filter(n => (n.status || '').toUpperCase() === 'STAGED').length})
                            </button>
                        ) : null}
                    </div>

                    {/* Bộ lọc chọn Chuyến Xe Tải */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0f9ff', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #0284c7' }}>
                        <Truck size={18} color="#0369a1" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1' }}>Lọc Theo Xe Tải:</span>
                        <select 
                            value={selectedTruckFilter}
                            onChange={(e) => setSelectedTruckFilter(e.target.value)}
                            className="input-field"
                            style={{ width: '180px', padding: '0.25rem 0.5rem', fontSize: '0.85rem', borderColor: '#0284c7', color: '#0369a1', fontWeight: 700 }}
                        >
                            <option value="">-- Tất Cả Các Xe --</option>
                            {Array.from(new Set(notes.map(n => n.license_plate).filter(Boolean))).map((plate, idx) => (
                                <option key={idx} value={plate}>Xe {plate}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Hiển Thị Gom Nhóm Danh Sách Soạn Hàng Theo Chuyến Xe Tải */}
                {(() => {
                    const notesToDisplay = filtered.filter(n => !selectedTruckFilter || n.license_plate === selectedTruckFilter);
                    const notesByTruck = {};
                    notesToDisplay.forEach(n => {
                        const truck = n.license_plate || 'Chưa gán xe';
                        if (!notesByTruck[truck]) notesByTruck[truck] = [];
                        notesByTruck[truck].push(n);
                    });

                    if (loadingNotes) {
                        return (
                            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                <Loader className="animate-spin" size={32} color="var(--primary)" />
                            </div>
                        );
                    }

                    if (notesToDisplay.length === 0) {
                        return (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <CheckCircle size={48} style={{ margin: '0 auto 1rem', color: '#10b981' }} />
                                <p style={{ fontSize: '1.125rem' }}>Không có phiếu xuất nào ở trạng thái này.</p>
                            </div>
                        );
                    }

                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {Object.entries(notesByTruck).map(([truckPlate, truckNotes]) => (
                                <div key={truckPlate} className="card" style={{ padding: '1.25rem', borderLeft: '5px solid var(--primary-color)' }}>
                                    
                                    {/* Header Khung Chuyến Xe */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                                                <Truck size={24} color="#0284c7" />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                                    CHUYẾN XE TẢI: <span style={{ color: '#0284c7' }}>{truckPlate}</span>
                                                </h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    Gồm {truckNotes.length} phiếu xuất kho cho các khách hàng
                                                </span>
                                            </div>
                                        </div>

                                        {/* Thao Tác Nhanh Theo Chuyến Xe */}
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button 
                                                className="btn btn-outline"
                                                onClick={() => handleOpenTruckSummary(truckPlate)}
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', color: '#0284c7', borderColor: '#0284c7' }}
                                            >
                                                <ListChecks size={16} style={{ marginRight: 4 }} /> Tổng Hợp Xe
                                            </button>

                                            {activeTab === 'PICKING' && (
                                                <button 
                                                    className="btn btn-primary"
                                                    disabled={isProcessing}
                                                    onClick={() => handleBatchTruckAction(truckPlate, 'complete', `Xác nhận hoàn tất soạn hàng cho toàn bộ Chuyến Xe ${truckPlate}?`)}
                                                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                                >
                                                    <CheckCircle size={16} style={{ marginRight: 4 }} /> Hoàn Tất Soạn Cả Xe
                                                </button>
                                            )}

                                            {activeTab === 'PICKED' && (
                                                <button 
                                                    className="btn btn-primary"
                                                    disabled={isProcessing}
                                                    onClick={() => handleBatchTruckAction(truckPlate, 'stage', `Xác nhận đã tập kết đủ hàng cho toàn bộ Chuyến Xe ${truckPlate}?`)}
                                                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                                >
                                                    <Box size={16} style={{ marginRight: 4 }} /> Tập Kết Cả Xe
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bảng Chi Tiết Các Phiếu Thuộc Chuyến Xe */}
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Mã Phiếu Xuất</th>
                                                    <th>Khách Hàng</th>
                                                    <th>Nơi Giao / Địa Điểm</th>
                                                    <th>Trạng Thái</th>
                                                    <th>Ngày Tạo</th>
                                                    <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {truckNotes.map(note => (
                                                    <tr key={note.delivery_note_no}>
                                                        <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{note.delivery_note_no}</td>
                                                        <td style={{ fontWeight: 600 }}>{note.customer_name || 'Khách Hàng KNSG'}</td>
                                                        <td>{note.delivery_location || 'Kho Nguyễn Văn Báu'}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                note.status === 'PICKING' ? 'badge-warning' : 
                                                                note.status === 'PICKED' ? 'badge-warning' : 
                                                                note.status === 'STAGED' ? 'badge-info' : 'badge-neutral'
                                                            }`}>
                                                                {note.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(note.created_at).toLocaleString('vi-VN')}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            {note.status === 'PICKED' ? (
                                                                <button 
                                                                    className="btn btn-primary"
                                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                                                                    onClick={() => {
                                                                        setSelectedNote(note);
                                                                        setShowApprovalModal(true);
                                                                    }}
                                                                >
                                                                    🔑 Thủ Kho Duyệt <ArrowRightCircle size={16} style={{marginLeft: 4}}/>
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    className="btn btn-outline"
                                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                                                                    onClick={() => handleSelectNote(note)}
                                                                >
                                                                    {note.status === 'STAGED' ? 'Xem Phiếu' : 'Soạn Hàng'} <ArrowRightCircle size={16} style={{marginLeft: 4}}/>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* MODAL TỔNG HỢP SOẠN HÀNG CẢ CHUYẾN XE TẢI */}
                {selectedTruckSummary && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Truck size={28} color="#0284c7" />
                                    <div>
                                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                            BẢNG TỔNG HỢP SOẠN HÀNG CHUYẾN XE: <span style={{ color: '#0284c7' }}>{selectedTruckSummary}</span>
                                        </h2>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Danh sách gom nhóm toàn bộ sản phẩm cần lấy kho cho chuyến xe
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTruckSummary(null)} className="btn-icon">
                                    <X size={24} />
                                </button>
                            </div>

                            {loadingTruckSummary ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                                    <Loader className="animate-spin" size={32} color="var(--primary)" />
                                </div>
                            ) : truckSummaryData.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Không có dữ liệu mặt hàng nào cho chuyến xe này.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="table-container">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Mã Sản Phẩm</th>
                                                    <th>Kênh</th>
                                                    <th style={{ textAlign: 'center' }}>Chi Tiết Thùng (K360 / T60 / Ảo)</th>
                                                    <th style={{ textAlign: 'right' }}>Tổng SL Cần Soạn</th>
                                                    <th style={{ textAlign: 'right' }}>Trọng Lượng (Kg)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {truckSummaryData.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td><strong>{row.product_code}</strong></td>
                                                        <td><span className="badge badge-neutral">{row.channel_code}</span></td>
                                                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#0369a1' }}>
                                                            {row.total_box_large || 0} Kiện 360 / {row.total_box_small || 0} Thùng 60 / {row.total_box_virtual || 0} Ảo
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary-color)', fontSize: '1.05rem' }}>
                                                            {Math.round(row.total_qty || 0).toLocaleString('vi-VN')} SP
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                                                            {Number(row.total_weight_kg || 0).toLocaleString('vi-VN')} Kg
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #0284c7' }}>
                                        <div>
                                            <span style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 600 }}>TỔNG CHUYẾN XE {selectedTruckSummary}:</span>
                                            <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginLeft: '0.5rem' }}>
                                                {Math.round(truckSummaryData.reduce((s, r) => s + Number(r.total_qty || 0), 0)).toLocaleString('vi-VN')} SP
                                            </strong>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                                                ({truckSummaryData.reduce((s, r) => s + Number(r.total_weight_kg || 0), 0).toLocaleString('vi-VN')} Kg)
                                            </span>
                                        </div>

                                        {activeTab === 'PICKING' && (
                                            <button 
                                                className="btn btn-primary"
                                                disabled={isProcessing}
                                                onClick={() => handleBatchTruckAction(selectedTruckSummary, 'complete', `Xác nhận hoàn tất soạn hàng cho toàn bộ Chuyến Xe ${selectedTruckSummary}?`)}
                                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                                            >
                                                <CheckCircle size={18} /> Hoàn Tất Soạn Cả Xe {selectedTruckSummary}
                                            </button>
                                        )}

                                        {activeTab === 'PICKED' && (
                                            <button 
                                                className="btn btn-primary"
                                                disabled={isProcessing}
                                                onClick={() => handleBatchTruckAction(selectedTruckSummary, 'stage', `Xác nhận đã tập kết đủ hàng cho toàn bộ Chuyến Xe ${selectedTruckSummary}?`)}
                                                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                            >
                                                <Box size={18} /> Xác Nhận Tập Kết Cả Xe {selectedTruckSummary}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // -------------------------------------------------------------
    // RENDER: Tầng 2 - Chi tiết Phiếu Xuất
    // -------------------------------------------------------------
    if (!selectedLine) {
        const canPick = selectedNote.status === 'NEW' || selectedNote.status === 'PENDING_PICK' || selectedNote.status === 'PICKING';
        const isPicked = selectedNote.status === 'PICKED';
        const isStaged = selectedNote.status === 'STAGED';

        return (
            <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={handleBackToList} className="btn-icon" title="Quay lại">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                Phiếu Xuất: {selectedNote.delivery_note_no}
                            </h1>
                            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Trạng thái hiện tại: <strong style={{ color: 'var(--primary)' }}>{selectedNote.status}</strong>
                            </p>
                        </div>
                    </div>
                    
                    {canPick && (
                        <button 
                            className="btn btn-primary" 
                            onClick={() => handleStateAction('complete', 'Xác nhận hoàn tất soạn hàng cho phiếu này (chờ Thủ Kho duyệt)?', 'Soạn hàng thành công (Chuyển sang PICKED)!')}
                            disabled={isProcessing}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isProcessing ? 0.6 : 1 }}
                        >
                            <CheckCircle size={20} /> {isProcessing ? 'Đang lưu...' : 'Hoàn Tất Soạn (Chờ Thủ Kho Duyệt)'}
                        </button>
                    )}
                    
                    {isPicked && (
                        isStorekeeper ? (
                            <button 
                                className="btn btn-primary" 
                                onClick={() => setShowApprovalModal(true)}
                                disabled={isProcessing}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0284c7', borderColor: '#0284c7', boxShadow: '0 4px 6px -1px rgba(2, 132, 199, 0.4)' }}
                            >
                                <CheckCircle size={20} /> {isProcessing ? 'Đang xử lý...' : '🔑 THỦ KHO DUYỆT XÁC NHẬN XUẤT KHO'}
                            </button>
                        ) : (
                            <div style={{ backgroundColor: '#fef3c7', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #f59e0b', color: '#92400e', fontWeight: 600, fontSize: '0.9rem' }}>
                                ⏳ ĐANG CHỜ THỦ KHO KÝ DUYỆT XÁC NHẬN XUẤT KHO
                            </div>
                        )
                    )}

                    {isStaged && (
                        <button 
                            className="btn btn-primary" 
                            onClick={() => handleStateAction('ship', 'Xác nhận xe tải rời bến? Việc này sẽ trừ trực tiếp tồn kho thực tế.', 'Xuất bến thành công (Chuyển sang SHIPPED)!')}
                            disabled={isProcessing}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                        >
                            <Truck size={20} /> {isProcessing ? 'Đang lưu...' : 'Xác Nhận Xuất Bến (SHIP)'}
                        </button>
                    )}
                </div>

                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ListChecks size={24} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Chi tiết hàng hóa</h3>
                    </div>
                    
                    {loadingDetails ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <Loader className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    ) : (
                        <div className="table-container" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                            <table className="data-table">
                                <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <tr>
                                        <th style={{ backgroundColor: '#f8fafc' }}>Mã SP</th>
                                        <th style={{ backgroundColor: '#f8fafc' }}>Kênh</th>
                                        <th style={{ textAlign: 'right', backgroundColor: '#f8fafc' }}>Yêu Cầu</th>
                                        <th style={{ textAlign: 'right', backgroundColor: '#f8fafc' }}>Thực Xuất (Đã Quét)</th>
                                        <th style={{ textAlign: 'center', width: '180px', backgroundColor: '#f8fafc' }}>Tiến Độ</th>
                                        <th style={{ textAlign: 'center', backgroundColor: '#f8fafc' }}>Vị Trí Kho & FIFO</th>
                                        {canPick && (
                                            <th style={{ textAlign: 'center', width: '100px', backgroundColor: '#f8fafc' }}>Thao tác</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(noteDetails?.details) ? noteDetails.details : Array.isArray(noteDetails?.lines) ? noteDetails.lines : []).map((item, idx) => {
                                        const qty = Number(item.qty || item.requested_qty || 0);
                                        const pickedQty = Number(item.picked_qty || 0);
                                        const progress = qty > 0 ? (pickedQty / qty) * 100 : 0;
                                        const isComplete = pickedQty >= qty;
                                        
                                        return (
                                            <tr key={idx} style={{ backgroundColor: isComplete ? '#f0fdf4' : 'transparent' }}>
                                                <td style={{ fontWeight: 600 }}>{item.product_code}</td>
                                                <td>{item.channel_code}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                                    {qty.toLocaleString('vi-VN')}
                                                </td>
                                                <td style={{ textAlign: 'right', color: isComplete ? '#16a34a' : 'var(--text-main)', fontWeight: 600 }}>
                                                    {pickedQty.toLocaleString('vi-VN')}
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div 
                                                                style={{ 
                                                                    height: '100%', 
                                                                    width: `${Math.min(progress, 100)}%`,
                                                                    backgroundColor: isComplete ? '#16a34a' : 'var(--primary)',
                                                                    transition: 'width 0.3s ease'
                                                                }} 
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', minWidth: '35px', textAlign: 'right' }}>
                                                            {progress.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button 
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', color: '#0284c7', borderColor: '#0284c7' }}
                                                        onClick={() => handleOpenFifoModal(item)}
                                                    >
                                                        📍 Xem Vị Trí FIFO
                                                    </button>
                                                </td>
                                                {canPick && (
                                                    <td style={{ textAlign: 'center' }}>
                                                        <button 
                                                            className="btn btn-outline"
                                                            onClick={() => handleSelectLine(item)}
                                                            disabled={isComplete}
                                                            style={{
                                                                padding: '0.4rem 0.6rem',
                                                                fontSize: '0.85rem',
                                                                borderColor: isComplete ? '#d1d5db' : 'var(--primary)',
                                                                color: isComplete ? '#9ca3af' : 'var(--primary)'
                                                            }}
                                                        >
                                                            <Barcode size={16} /> Quét
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL BẢNG CHỈ DẪN VỊ TRÍ KHO & XEM GỢI Ý FIFO DÀNH CHO THỦ KHO KHI DUYỆT PHIẾU */}
                {viewFifoModalItem && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #16a34a', paddingBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={28} color="#16a34a" />
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                            CHỈ DẪN VỊ TRÍ KHO & GỢI Ý FIFO: <span style={{ color: 'var(--primary-color)' }}>{viewFifoModalItem.product_code}</span>
                                        </h2>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Thủ kho đối soát vị trí lưu trữ và tiến độ quét thực tế của mặt hàng
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setViewFifoModalItem(null)} className="btn-icon">
                                    <X size={24} />
                                </button>
                            </div>

                            {loadingModalFifo ? (
                                <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
                                    <Loader className="animate-spin" size={32} color="var(--primary)" />
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                    {/* Thống kê tiến độ & Kế hoạch phân bổ quy đổi */}
                                    {(() => {
                                        const modalQty = Number(viewFifoModalItem?.qty || viewFifoModalItem?.requested_qty || 0);
                                        const modalPicked = Number(viewFifoModalItem?.picked_qty || 0);
                                        const modalRemaining = Math.max(0, modalQty - modalPicked);

                                        const bLargePlan = Number(viewFifoModalItem?.box_large !== undefined ? viewFifoModalItem.box_large : Math.floor(modalQty / 360));
                                        const rem360Plan = modalQty % 360;
                                        const bSmallPlan = Number(viewFifoModalItem?.box_small !== undefined ? viewFifoModalItem.box_small : Math.floor(rem360Plan / 60));
                                        const bVirtualPlan = Number(viewFifoModalItem?.box_virtual !== undefined ? viewFifoModalItem.box_virtual : (rem360Plan % 60));

                                        return (
                                            <div style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", textAlign: "center" }}>
                                                    <div>
                                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Yêu Cầu Xuất Kho:</span>
                                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-color)" }}>
                                                            {modalQty.toLocaleString("vi-VN")} SP
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Đã Quét Thực Tế:</span>
                                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#16a34a" }}>
                                                            {modalPicked.toLocaleString("vi-VN")} SP
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Còn Lại:</span>
                                                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#dc2626" }}>
                                                            {modalRemaining.toLocaleString("vi-VN")} SP
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.85rem', textAlign: 'center', color: '#334155' }}>
                                                    🎯 <strong>Kế Hoạch Phân Bổ Quy Đổi:</strong>{' '}
                                                    <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{bLargePlan} Kiện 360</span> | <span style={{ color: '#15803d', fontWeight: 700 }}>{bSmallPlan} Thùng 60</span> | <span style={{ color: '#d97706', fontWeight: 700 }}>{bVirtualPlan} SP Lẻ (Thùng Ảo)</span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* Bảng Kiện 360 */}
                                    {(Number(viewFifoModalItem?.box_large || 0) > 0 || modalFifoData?.pack360_suggestions?.length > 0) && (
                                        <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                                                📦 Kiện Lớn 360 Gợi Ý Theo FIFO (Kế hoạch: {Number(viewFifoModalItem?.box_large || 0)} Kiện):
                                            </h4>
                                            <div className="table-container">
                                                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Mã Kiện 360 / Cụm Kiện</th>
                                                            <th>📍 Vị Trí Kho</th>
                                                            <th style={{ textAlign: 'right' }}>SL</th>
                                                            <th>Ngày Nhập</th>
                                                            <th style={{ textAlign: 'center' }}>Trạng Thái Quét</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(!modalFifoData?.pack360_suggestions || modalFifoData.pack360_suggestions.length === 0) ? (
                                                            <tr>
                                                                <td colSpan="5" style={{ textAlign: 'center', color: '#1d4ed8', padding: '1rem', backgroundColor: '#eff6ff', fontSize: '0.8rem' }}>
                                                                    💡 Không tìm thấy Kiện 360 nguyên đai khả dụng trong kho. Thủ kho vui lòng lấy từ danh sách Thùng 60 đơn lẻ phía dưới.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            (Array.isArray(modalFifoData?.pack360_suggestions) ? modalFifoData.pack360_suggestions : []).map((p, idx) => {
                                                                const scanned = (Array.isArray(modalScanHistory) ? modalScanHistory : []).some(s => s?.barcode === p?.pack_id || s?.barcode === p?.id_60);
                                                                return (
                                                                    <tr key={idx} style={{ backgroundColor: scanned ? '#dcfce7' : '#eff6ff' }}>
                                                                        <td style={{ fontWeight: 700, color: '#1d4ed8' }}>{p.pack_id}</td>
                                                                        <td>
                                                                            <span style={{ fontWeight: 700, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                                                {p.location_code || 'KHO CHÍNH'}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>{Math.round(p.total_qty || 360)} SP</td>
                                                                        <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                                                                        <td style={{ textAlign: 'center' }}>
                                                                            {scanned ? (
                                                                                <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                    ✅ ĐÃ QUÉT ĐÚNG
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                    ⏳ CHƯA QUÉT
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
                                    )}

                                    {/* Bảng Thùng 60 & Thùng Ảo */}
                                    {(() => {
                                        const allBoxes = modalFifoData?.box60_suggestions || (Array.isArray(modalFifoData) ? modalFifoData : []);
                                        const full60Boxes = allBoxes.filter(b => Number(b.current_qty || 60) >= 60 && !b.is_virtual);
                                        const virtualBoxes = (modalFifoData?.virtual_box_suggestions || []).concat(
                                            allBoxes.filter(b => Number(b.current_qty || 60) < 60 || b.is_virtual)
                                        );

                                        return (
                                            <>
                                                {/* Thùng 60 Đơn Lẻ */}
                                                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d', margin: '0 0 0.5rem 0' }}>
                                                        📦 Thùng 60 Đơn Lẻ Gợi Ý Theo FIFO (Kế hoạch: {Number(viewFifoModalItem?.box_small || 0)} Thùng):
                                                    </h4>
                                                    <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th>Mã Thùng 60</th>
                                                                    <th>📍 Vị Trí Kho</th>
                                                                    <th style={{ textAlign: 'right' }}>SL</th>
                                                                    <th>Ngày Nhập</th>
                                                                    <th style={{ textAlign: 'center' }}>Trạng Thái Quét</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {full60Boxes.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="5" style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                                                                            Không có thùng 60 lẻ nào trong kho.
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    full60Boxes.map((box, idx) => {
                                                                        const scanned = (Array.isArray(modalScanHistory) ? modalScanHistory : []).some(s => s?.barcode === box?.id_60 || s?.barcode === box?.qr_60);
                                                                        return (
                                                                            <tr key={idx} style={{ backgroundColor: scanned ? '#dcfce7' : 'transparent' }}>
                                                                                <td style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{box.id_60}</td>
                                                                                <td>
                                                                                    <span style={{ fontWeight: 700, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                                                        {box.location_code || 'KHO CHÍNH'}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{Math.round(box.current_qty)} SP</td>
                                                                                <td>{box.created_at ? new Date(box.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                                                                                <td style={{ textAlign: 'center' }}>
                                                                                    {scanned ? (
                                                                                        <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                            ✅ ĐÃ QUÉT ĐÚNG
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span style={{ color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                            ⏳ CHƯA QUÉT
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

                                                {/* Thùng Ảo / Hàng Lẻ */}
                                                <div style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fde68a', marginTop: '0.75rem' }}>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b45309', margin: '0 0 0.5rem 0' }}>
                                                        📦 Thùng Ảo / Hàng Lẻ Gợi Ý Theo FIFO (Kế hoạch: {Number(viewFifoModalItem?.box_virtual || 0)} SP lẻ):
                                                    </h4>
                                                    <div className="table-container" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                                            <thead>
                                                                <tr>
                                                                    <th>Mã Thùng Lẻ / Thùng Ảo</th>
                                                                    <th>📍 Vị Trí Kho</th>
                                                                    <th style={{ textAlign: 'right' }}>SL Lẻ</th>
                                                                    <th>Ngày Nhập</th>
                                                                    <th style={{ textAlign: 'center' }}>Trạng Thái Quét</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {virtualBoxes.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan="5" style={{ textAlign: 'center', color: '#b45309', padding: '1rem', backgroundColor: '#fffbeb', fontSize: '0.8rem' }}>
                                                                            💡 Khi đến vị trí kho, Thủ kho quét trực tiếp Thùng 60 dở dốc hoặc nhập số lượng SP lẻ ({Number(viewFifoModalItem?.box_virtual || 0)} SP) theo yêu cầu.
                                                                        </td>
                                                                    </tr>
                                                                ) : (
                                                                    virtualBoxes.map((box, idx) => {
                                                                        const scanned = (Array.isArray(modalScanHistory) ? modalScanHistory : []).some(s => s?.barcode === box?.id_60 || s?.barcode === box?.qr_60);
                                                                        return (
                                                                            <tr key={idx} style={{ backgroundColor: scanned ? '#dcfce7' : '#fffbeb' }}>
                                                                                <td style={{ fontWeight: 700, color: '#b45309' }}>{box.id_60 || box.qr_60}</td>
                                                                                <td>
                                                                                    <span style={{ fontWeight: 700, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                                                                        {box.location_code || 'KHO CHÍNH'}
                                                                                    </span>
                                                                                </td>
                                                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{Math.round(box.current_qty)} SP</td>
                                                                                <td>{box.created_at ? new Date(box.created_at).toLocaleDateString('vi-VN') : '-'}</td>
                                                                                <td style={{ textAlign: 'center' }}>
                                                                                    {scanned ? (
                                                                                        <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                            ✅ ĐÃ QUÉT ĐÚNG
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                                                            ⏳ CHƯA QUÉT
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
                                            </>
                                        );
                                    })()}

                                    <div style={{ textAlign: 'right' }}>
                                        <button className="btn btn-secondary" onClick={() => setViewFifoModalItem(null)}>
                                            Đóng Bảng
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* MODAL THỦ KHO DUYỆT XÁC NHẬN XUẤT KHO (UC16) */}
                {showApprovalModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}>
                        <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #0284c7', paddingBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={28} color="#0284c7" />
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                                            THỦ KHO KÝ DUYỆT XÁC NHẬN XUẤT KHO
                                        </h2>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Quy trình kiểm soát chất lượng & đối soát số lượng xuất kho (UC16)
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setShowApprovalModal(false)} className="btn-icon">
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #0284c7' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <div>Mã Phiếu Xuất: <strong style={{ color: 'var(--primary-color)' }}>{selectedNote.delivery_note_no}</strong></div>
                                        <div>Khách Hàng: <strong>{selectedNote.customer_name}</strong></div>
                                        <div>Chuyến Xe Tải: <strong style={{ color: '#0369a1' }}>{selectedNote.license_plate}</strong></div>
                                        <div>Trạng Thái: <span className="badge badge-warning">PICKED</span></div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ghi Chú Duyệt / Chữ Ký Thủ Kho:</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Nhập ghi chú hoặc thông tin chữ ký xác nhận của Thủ Kho..."
                                        value={approvalNote}
                                        onChange={(e) => setApprovalNote(e.target.value)}
                                        style={{ padding: '0.75rem', fontSize: '0.9rem' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    <button className="btn btn-secondary" onClick={() => setShowApprovalModal(false)}>
                                        Hủy Bỏ
                                    </button>
                                    <button 
                                        className="btn btn-primary"
                                        disabled={isProcessing}
                                        onClick={handleApproveStorekeeper}
                                        style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <CheckCircle size={18} /> {isProcessing ? 'Đang duyệt...' : '✅ KÝ DUYỆT XÁC NHẬN XUẤT KHO'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // -------------------------------------------------------------
    // RENDER: Tầng 3 - Màn hình Quét Mã (Dành riêng cho 1 Mã SP)
    // -------------------------------------------------------------
    const progress = selectedLine.qty > 0 ? (selectedLine.picked_qty / selectedLine.qty) * 100 : 0;
    const isLineComplete = selectedLine.picked_qty >= selectedLine.qty;

    return (
        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={handleBackToNote} className="btn-icon" title="Quay lại">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        Quét mã: {selectedLine.product_code}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Phiếu Xuất: {selectedNote.delivery_note_no}
                    </p>
                </div>
            </div>

            {/* Thông số & Tiến độ */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cần Soạn</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{selectedLine.qty.toLocaleString('vi-VN')}</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#16a34a' }}>Thực Xuất (Đã Quét)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{selectedLine.picked_qty.toLocaleString('vi-VN')}</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Còn Lại</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                            {Math.max(0, selectedLine.qty - selectedLine.picked_qty).toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div 
                            style={{ 
                                height: '100%', 
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: isLineComplete ? '#16a34a' : 'var(--primary)',
                                transition: 'width 0.3s ease'
                            }} 
                        />
                    </div>
                    <span style={{ fontWeight: 'bold', color: isLineComplete ? '#16a34a' : 'var(--text-main)' }}>
                        {progress.toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* BẢNG GỢI Ý XUẤT KHO FIFO PHÂN LOẠI THEO KIỆN 360 VÀ THÙNG LẺ 60 */}
            {(() => {
                const reqQty = Math.max(0, (selectedLine.qty || 0) - (selectedLine.picked_qty || 0));
                const needed360 = Math.floor(reqQty / 360);
                const needed60 = Math.floor((reqQty % 360) / 60);
                const rawVirt = (reqQty % 360) % 60;
                const neededVirt = Math.round(rawVirt * 100) / 100;

                const packs = fifoSuggestions?.pack360_suggestions || [];
                const boxes = fifoSuggestions?.box60_suggestions || (Array.isArray(fifoSuggestions) ? fifoSuggestions : []);

                // Hàm kiểm tra xem Mã Kiện / Mã Thùng gợi ý đã được quét hay chưa
                const isItemScanned = (code, qr) => {
                    if (!code && !qr) return false;
                    return scanHistory.some(s => 
                        (code && s.barcode === code) || 
                        (qr && s.barcode === qr) ||
                        (code && s.barcode && s.barcode.includes(code))
                    );
                };

                return (
                    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#f0fdf4', border: '1.5px solid #16a34a', borderRadius: '12px' }}>
                        {/* Header Tiêu Đề Gợi Ý */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', color: '#15803d', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px dashed #bbf7d0', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={24} color="#16a34a" />
                                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#166534' }}>
                                    GỢI Ý VỊ TRÍ KHO & THÙNG HÀNG FIFO (LẤY TRƯỚC HẠN)
                                </h3>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, backgroundColor: '#dcfce7', padding: '0.35rem 0.75rem', borderRadius: '8px', color: '#166534', border: '1px solid #86efac' }}>
                                📋 Cần soạn: {needed360 > 0 ? `${needed360} Kiện 360 ` : ''}{needed60 > 0 ? `${needed60} Thùng 60 ` : ''}{neededVirt > 0 ? `${neededVirt} SP Lẻ` : ''}
                            </span>
                        </div>

                        {/* 1. GỢI Ý KIỆN LỚN 360 */}
                        {needed360 > 0 && (
                            <div style={{ marginBottom: '1.25rem', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Box size={20} color="#1e40af" />
                                    1. Gợi Ý Lấy {needed360} Kiện Lớn 360 Theo FIFO (Đến đúng vị trí kệ bên dưới):
                                </div>

                                {packs.length === 0 ? (
                                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem' }}>
                                        Không tìm thấy Kiện 360 khả dụng (Vui lòng lấy từ danh sách Thùng 60 đơn lẻ phía dưới).
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        <table className="data-table" style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>
                                                    <th style={{ width: '38%', padding: '0.6rem 0.75rem', borderRadius: '6px 0 0 6px' }}>Mã Kiện 360</th>
                                                    <th style={{ width: '20%', padding: '0.6rem 0.75rem' }}>📍 Vị Trí Kệ Kho</th>
                                                    <th style={{ width: '14%', padding: '0.6rem 0.75rem', textAlign: 'right' }}>Số Lượng</th>
                                                    <th style={{ width: '14%', padding: '0.6rem 0.75rem', textAlign: 'center' }}>Ngày Nhập</th>
                                                    <th style={{ width: '14%', padding: '0.6rem 0.75rem', textAlign: 'center', borderRadius: '0 6px 6px 0' }}>Trạng Thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {packs.slice(0, needed360 + 2).map((p, idx) => {
                                                    const scanned = isItemScanned(p.pack_id, null);
                                                    const isTopPriority = idx < needed360;
                                                    return (
                                                        <tr key={p.pack_id || idx} style={{ 
                                                            backgroundColor: scanned ? '#dcfce7' : (isTopPriority ? '#fef9c3' : '#ffffff'),
                                                            border: isTopPriority && !scanned ? '1.5px solid #fde047' : '1px solid #e2e8f0',
                                                            borderRadius: '6px'
                                                        }}>
                                                            <td style={{ padding: '0.6rem 0.75rem', wordBreak: 'break-all', fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>
                                                                {p.pack_id}
                                                                {isTopPriority && !scanned && (
                                                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', backgroundColor: '#fef08a', color: '#854d0e', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #facc15', fontFamily: 'sans-serif' }}>
                                                                        ⭐ Ưu tiên #{idx + 1}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.75rem' }}>
                                                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                    📍 {p.location_code || 'KHO CHÍNH'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                                                {Math.round(p.total_qty || 360).toLocaleString('vi-VN')} SP
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
                                                                {new Date(p.created_at).toLocaleDateString('vi-VN')}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                                {scanned ? (
                                                                    <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-block' }}>
                                                                        ✅ ĐÃ QUÉT
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-block' }}>
                                                                        ⏳ CHƯA QUÉT
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. GỢI Ý THÙNG LẺ 60 */}
                        <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid #86efac', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={20} color="#15803d" />
                                {needed60 > 0 ? `2. Gợi Ý Lấy ${needed60} Thùng Lẻ 60 Theo FIFO:` : 'Gợi Ý Danh Sách Thùng 60 Đơn Lẻ Khả Dụng:'}
                            </div>

                            {boxes.length === 0 ? (
                                <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', padding: '0.5rem' }}>
                                    Không có dữ liệu thùng 60 lẻ bên ngoài trong kho.
                                </div>
                            ) : (
                                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                                                <th style={{ width: '42%', padding: '0.6rem 0.75rem', borderRadius: '6px 0 0 6px' }}>Mã Thùng 60</th>
                                                <th style={{ width: '20%', padding: '0.6rem 0.75rem' }}>📍 Vị Trí Kệ Kho</th>
                                                <th style={{ width: '12%', padding: '0.6rem 0.75rem', textAlign: 'right' }}>Số Lượng</th>
                                                <th style={{ width: '13%', padding: '0.6rem 0.75rem', textAlign: 'center' }}>Ngày Nhập</th>
                                                <th style={{ width: '13%', padding: '0.6rem 0.75rem', textAlign: 'center', borderRadius: '0 6px 6px 0' }}>Trạng Thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {boxes.map((box, idx) => {
                                                const scanned = isItemScanned(box.id_60, box.qr_60);
                                                const isTopPriority = idx < (needed60 || 1);
                                                return (
                                                    <tr key={box.id_60 || idx} style={{ 
                                                        backgroundColor: scanned ? '#dcfce7' : (isTopPriority ? '#fef9c3' : '#ffffff'),
                                                        border: isTopPriority && !scanned ? '1.5px solid #facc15' : '1px solid #e2e8f0',
                                                        borderRadius: '6px'
                                                    }}>
                                                        <td style={{ padding: '0.6rem 0.75rem', wordBreak: 'break-all', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-color)' }}>
                                                            {box.id_60}
                                                            {isTopPriority && !scanned && (
                                                                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', backgroundColor: '#fef08a', color: '#854d0e', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid #facc15', fontFamily: 'sans-serif' }}>
                                                                    ⭐ Ưu tiên #{idx + 1}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.75rem' }}>
                                                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                                📍 {box.location_code || 'KHO CHÍNH'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                                                            {Math.round(box.current_qty).toLocaleString('vi-VN')} SP
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
                                                            {new Date(box.created_at).toLocaleDateString('vi-VN')}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                                                            {scanned ? (
                                                                <span style={{ color: '#15803d', fontWeight: 700, backgroundColor: '#bbf7d0', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-block' }}>
                                                                    ✅ ĐÃ QUÉT
                                                                </span>
                                                            ) : (
                                                                <span style={{ color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-block' }}>
                                                                    ⏳ CHƯA QUÉT
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Khung quét mã */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <form onSubmit={handleScan}>
                    <div className="form-group">
                        <label>Quét Mã Thùng 60 / Kiện 360 của mặt hàng <strong>{selectedLine.product_code}</strong></label>
                        <input
                            ref={barcodeInputRef}
                            type="text"
                            className="form-control"
                            placeholder={isLineComplete ? "Đã soạn xong mặt hàng này" : "Click vào đây và quét mã..."}
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            disabled={isLineComplete}
                            autoComplete="off"
                            style={{ 
                                fontSize: '1.25rem', 
                                padding: '1rem', 
                                textAlign: 'center',
                                letterSpacing: '2px',
                                borderColor: 'var(--primary)',
                                borderWidth: '2px',
                                backgroundColor: isLineComplete ? '#f3f4f6' : '#fff'
                            }}
                        />
                    </div>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button 
                        className="btn btn-secondary" 
                        onClick={handleOpenSplitModal}
                        disabled={isLineComplete}
                        style={{ padding: '0.75rem 1.5rem', width: 'auto', backgroundColor: '#f59e0b', color: '#fff', border: 'none' }}
                    >
                        <Box size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Lấy Lẻ từ Thùng Gốc / Thùng Ảo (UC17)
                    </button>
                </div>

                {/* Scan Message Log */}
                {scanMessage && (
                    <div className={`card ${scanMessage.type === 'error' ? 'shake' : ''}`} 
                        style={{ 
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: scanMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            borderColor: scanMessage.type === 'success' ? '#bbf7d0' : '#fecaca',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            {scanMessage.type === 'success' ? (
                                <CheckCircle size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                            ) : (
                                <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                            )}
                            <div>
                                <h4 style={{ 
                                    fontWeight: 600, 
                                    color: scanMessage.type === 'success' ? '#16a34a' : '#dc2626',
                                    marginBottom: '0.25rem'
                                }}>
                                    {scanMessage.type === 'success' ? 'Thành công' : 'Lỗi quét mã'}
                                </h4>
                                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    {scanMessage.text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Lịch sử quét */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <History size={20} color="var(--text-muted)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Lịch sử quét ({selectedLine.product_code})</h3>
                </div>
                
                {scanHistory.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có mã vạch nào được quét.</p>
                ) : (
                    <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table className="data-table" style={{ fontSize: '0.875rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#fff' }}>
                                <tr>
                                    <th>Mã Vạch</th>
                                    <th>Loại</th>
                                    <th style={{ textAlign: 'right' }}>SL</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Array.isArray(scanHistory) ? scanHistory : []).map((h, i) => (
                                    <tr key={i}>
                                        <td style={{ fontFamily: 'monospace' }}>{h.barcode}</td>
                                        <td>
                                            <span className={`badge ${h.barcode_type === 'PACK360' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                                                {h.barcode_type}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{h.qty}</td>
                                        <td>{new Date(h.scanned_at).toLocaleTimeString('vi-VN')}</td>
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
