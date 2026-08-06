const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');

// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

// Helper function to extract user params dynamically from request
const getUserParams = (req) => ({
  user_code: req.user ? req.user.user_id || req.user.username : 'SYSTEM',
  user_email: req.user ? req.user.email || 'system@wms.local' : 'system@wms.local',
  device_id: req.headers['x-device-id'] || 'WEB-UI-01'
});

// 0. Lấy danh sách tất cả phiếu giao kho
router.get('/handovers', async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.execute('usp_Receipt_GetAllProductionHandovers');
    
    // Check if error
    if (result.recordset && result.recordset[0] && result.recordset[0].status === 'ERROR') {
      return res.status(500).json({ status: 'ERROR', message: result.recordset[0].message });
    }
    
    res.json({
      status: 'SUCCESS',
      data: result.recordset || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 1. Lấy thông tin phiếu giao kho
router.get('/handover/:no', async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('handover_no', sql.NVarChar(50), req.params.no);
    request.input('request_id', sql.NVarChar(100), uuidv4());
    const uParams = getUserParams(req);
    request.input('user_code', sql.NVarChar(100), uParams.user_code);
    request.input('user_email', sql.NVarChar(255), uParams.user_email);
    request.input('device_id', sql.NVarChar(100), uParams.device_id);

    const result = await request.execute('usp_Receipt_GetProductionHandoverLines');
    
    // Result has multiple recordsets
    const header = result.recordsets[0] ? result.recordsets[0][0] : null;
    const lines = result.recordsets[1] || [];

    res.json({
      status: header ? 'SUCCESS' : 'FAILED',
      data: { header, lines }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 2. Quét mã vạch (Scan)
router.post('/scan', async (req, res) => {
  try {
    const { receipt_session_no, qr_60 } = req.body;
    
    const pool = await poolPromise;
    const request = pool.request();
    request.input('receipt_session_no', sql.NVarChar(50), receipt_session_no);
    request.input('qr_60', sql.NVarChar(255), qr_60);
    request.input('request_id', sql.NVarChar(100), uuidv4());
    const uParams = getUserParams(req);
    request.input('user_code', sql.NVarChar(100), uParams.user_code);
    request.input('user_email', sql.NVarChar(255), uParams.user_email);
    request.input('device_id', sql.NVarChar(100), uParams.device_id);

    const result = await request.execute('usp_Receipt_ScanThung60');
    // SP returns a standard status row in recordset 0
    const spResult = result.recordset[0];
    
    res.json(spResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// 3. Xác nhận chính thức
router.post('/confirm', async (req, res) => {
  try {
    const { receipt_session_no } = req.body;
    
    const pool = await poolPromise;
    const request = pool.request();
    request.input('receipt_session_no', sql.NVarChar(50), receipt_session_no);
    request.input('request_id', sql.NVarChar(100), uuidv4());
    const uParams = getUserParams(req);
    request.input('user_code', sql.NVarChar(100), uParams.user_code);
    request.input('user_email', sql.NVarChar(255), uParams.user_email);
    request.input('device_id', sql.NVarChar(100), uParams.device_id);

    const result = await request.execute('usp_Receipt_OfficialConfirm');
    const spResult = result.recordset[0];
    
    res.json(spResult);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Search OEM Orders
router.get('/orders/search', async (req, res) => {
  const { keyword } = req.query;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('Keyword', sql.NVarChar(100), keyword || '');
    
    // Fallback if SP fails (e.g. permission issue on sxtpt views)
    try {
      const result = await request.execute('usp_WMS_UC02_SearchDonHang');
      res.json({
        status: 'SUCCESS',
        data: result.recordset
      });
    } catch (dbErr) {
      // Mock data fallback for UI development
      console.warn("DB Error on SearchDonHang, falling back to mock data: ", dbErr.message);
      const kw = (keyword || '').toLowerCase();
      const mockData = [
        { MaDonHang: 'PO-2026-8801', MaHang: 'SP-OEM-101', MaKhachHang: 'KH-DECAT', MaPO: 'PO-DEC-01', SoLuongDonHang: 120, MaDotGiao: 1 },
        { MaDonHang: 'PO-2026-8802', MaHang: 'SP-OEM-102', MaKhachHang: 'KH-DECAT', MaPO: 'PO-DEC-02', SoLuongDonHang: 180, MaDotGiao: 1 },
        { MaDonHang: 'PO-2026-8803', MaHang: 'SP-OEM-103', MaKhachHang: 'KH-DECAT', MaPO: 'PO-DEC-03', SoLuongDonHang: 60, MaDotGiao: 1 },
        { MaDonHang: 'PO-2026-8804', MaHang: 'SP-OEM-103', MaKhachHang: 'KH-DECAT', MaPO: 'PO-DEC-04', SoLuongDonHang: 150, MaDotGiao: 2 },
        { MaDonHang: 'PO-2026-9901', MaHang: 'SP-LR-201', MaKhachHang: 'KH-NISSAN', MaPO: 'PO-NIS-01', SoLuongDonHang: 300, MaDotGiao: 1 },
        { MaDonHang: 'PO-2026-9902', MaHang: 'SP-LR-202', MaKhachHang: 'KH-NISSAN', MaPO: 'PO-NIS-02', SoLuongDonHang: 240, MaDotGiao: 2 },
        { MaDonHang: 'PO-2026-7701', MaHang: 'SP-DG-301', MaKhachHang: 'KH-TOYOTA', MaPO: 'PO-TOY-01', SoLuongDonHang: 150, MaDotGiao: 1 }
      ].filter(item => 
        !kw ? true : (
          item.MaDonHang.toLowerCase().includes(kw) || 
          item.MaHang.toLowerCase().includes(kw) ||
          item.MaKhachHang.toLowerCase().includes(kw) ||
          item.MaPO.toLowerCase().includes(kw)
        )
      );
      res.json({
        status: 'SUCCESS',
        data: mockData
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Map Handover Line to Order
router.post(['/handover/map-order', '/map-order'], async (req, res) => {
  const { handoverNo, lineNo, productCode, orderNo } = req.body;
  
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    request.input('MaSanPham', sql.NVarChar(50), productCode);
    request.input('MaDonHang', sql.NVarChar(50), orderNo);
    request.input('UserId', sql.NVarChar(50), req.user ? (req.user.user_id || req.user.username) : 'SYSTEM');
    
    try {
      const result = await request.execute('usp_WMS_UC02_UpdateMaDonHang');
      const spData = result.recordset ? result.recordset[0] : null;
      res.json({
        status: 'SUCCESS',
        message: (spData && spData.message) || 'Gán mã đơn hàng OEM thành công',
        data: { handoverNo, lineNo, productCode, orderNo }
      });
    } catch (dbErr) {
      console.error("Lỗi thực thi Stored Procedure usp_WMS_UC02_UpdateMaDonHang:", dbErr);
      res.status(400).json({ status: 'ERROR', message: dbErr.message });
    }
  } catch (err) {
    console.error("Lỗi server khi gán mã đơn OEM:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC03: Lấy tiến độ quét
router.get('/handover/:handoverNo/line/:lineNo/progress', async (req, res) => {
  const { handoverNo, lineNo } = req.params;
  const productCode = req.query.productCode || '';
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    request.input('MaSanPham', sql.NVarChar(50), productCode);
    
    const result = await request.query(`
      SELECT * FROM dbo.vw_WMS_UC03_TienDoQuetNhap
      WHERE SoPhieuNhap = @SoPhieuNhap 
        AND MaChiTietPhieu = @MaChiTietPhieu
        AND MaSanPham = @MaSanPham
    `);
    
    if (result.recordset.length > 0) {
      res.json({ status: 'SUCCESS', data: result.recordset[0] });
    } else {
      res.json({ status: 'SUCCESS', data: {
        SoLuongCanNhap: 0, SoLuongDaQuetHopLe: 0, SoLuongConLai: 0, SoThungHopLe: 0, SoThungLoi: 0
      }});
    }
  } catch (err) {
    console.error("DB Error fetching progress:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC03: Lấy danh sách mã thùng 60 đã quét hợp lệ
router.get('/handover/:handoverNo/line/:lineNo/scanned-boxes', async (req, res) => {
  const { handoverNo, lineNo } = req.params;
  const productCode = req.query.productCode || '';
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    request.input('MaSanPham', sql.NVarChar(50), productCode);
    
    const result = await request.query(`
      SELECT ScanLogID, MaThung60, SoLuongThung, TrangThaiScan, KetQuaKiemTra, CreatedAt
      FROM dbo.WMS_UC03_ScanLog
      WHERE SoPhieuNhap = @SoPhieuNhap 
        AND MaChiTietPhieu = @MaChiTietPhieu
        AND MaSanPham = @MaSanPham
        AND TrangThaiScan IN (N'VALID', N'CONFIRMED')
        AND IsDeleted = 0
      ORDER BY CreatedAt DESC
    `);
    
    res.json({ status: 'SUCCESS', data: result.recordset });
  } catch (err) {
    console.error("DB Error fetching scanned boxes:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC03: Quét thùng 60
router.post('/scan-thung60', async (req, res) => {
  const { handoverNo, lineNo, productCode, qr60 } = req.body;
  const username = req.user ? req.user.user_id : 'SYSTEM';

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    request.input('MaSanPham', sql.NVarChar(50), productCode);
    request.input('MaThung60', sql.NVarChar(100), qr60);
    request.input('UserName', sql.NVarChar(100), username);
    
    const result = await request.execute('usp_WMS_UC03_ScanThung60');
    res.json({ status: 'SUCCESS', data: result.recordset[0] });
  } catch (err) {
    console.error("DB Error on ScanThung60:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04: Thủ kho xác nhận nhập kho
router.post('/confirm-nhap-kho', async (req, res) => {
  const { handoverNo, lineNo, partnerName } = req.body;
  const username = req.user ? req.user.user_id : 'SYSTEM';

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo || null);
    request.input('UserName', sql.NVarChar(100), username);
    if (partnerName) request.input('PartnerName', sql.NVarChar(100), partnerName);
    
    const result = await request.execute('usp_WMS_UC04_ConfirmNhapKho');
    res.json({ status: 'SUCCESS', data: result.recordset[0] });
  } catch (err) {
    console.error("DB Error on ConfirmNhapKho:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04.1: Xác nhận nhập lẻ (sinh thùng ảo)
router.post('/confirm-nhap-le', async (req, res) => {
  const { handoverNo, lineNo, looseQty, partnerName } = req.body;
  const username = req.user ? req.user.user_id : 'SYSTEM';

  if (!handoverNo || !lineNo || looseQty == null) {
    return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số (handoverNo, lineNo, looseQty)' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    request.input('SoLuongLe', sql.Decimal(18, 4), looseQty);
    request.input('UserName', sql.NVarChar(100), username);
    if (partnerName) request.input('PartnerName', sql.NVarChar(100), partnerName);
    
    await request.execute('usp_WMS_UC04_1_ConfirmNhapLe');
    res.json({ status: 'SUCCESS', message: 'Nhập lẻ thành công (đã sinh thùng ảo).' });
  } catch (err) {
    console.error("DB Error on ConfirmNhapLe:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04.1: Nhập lẻ theo lô (hỗ trợ chọn nhiều dòng checkbox tự động tạo thùng ảo)
router.post('/confirm-nhap-le-batch', async (req, res) => {
  const { handoverNo, lines, partnerName } = req.body; // lines: [{ lineNo, looseQty }]
  const username = req.user ? req.user.user_id : 'SYSTEM';

  if (!handoverNo || !lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ status: 'ERROR', message: 'Thiếu danh sách dòng nhập lẻ.' });
  }

  try {
    const pool = await poolPromise;
    for (let item of lines) {
      const request = pool.request();
      request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
      request.input('MaChiTietPhieu', sql.NVarChar(50), item.lineNo);
      request.input('SoLuongLe', sql.Decimal(18, 4), item.looseQty);
      request.input('UserName', sql.NVarChar(100), username);
      if (partnerName) request.input('PartnerName', sql.NVarChar(100), partnerName);
      
      await request.execute('usp_WMS_UC04_1_ConfirmNhapLe');
    }
    res.json({ status: 'SUCCESS', message: `Nhập lẻ thành công cho ${lines.length} dòng (hệ thống đã tự động tạo thùng ảo).` });
  } catch (err) {
    console.error("DB Error on ConfirmNhapLeBatch:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC03: Hủy quét
router.post('/cancel-scan', async (req, res) => {
  const { scanLogId, reason } = req.body;
  const username = req.user ? req.user.user_id : 'SYSTEM';

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('ScanLogID', sql.BigInt, scanLogId);
    request.input('UserName', sql.NVarChar(100), username);
    request.input('CancelReason', sql.NVarChar(500), reason || 'Scanner UI');
    
    const result = await request.execute('usp_WMS_UC03_CancelScan');
    res.json({ status: 'SUCCESS', data: result.recordset[0] });
  } catch (err) {
    console.error("DB Error on CancelScan:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04: Lấy danh sách phiếu chờ xác nhận (Tổng quan)
router.get('/confirm-list', async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    const result = await request.execute('usp_WMS_UC04_GetPendingHandovers');
    res.json({ status: 'SUCCESS', data: result.recordset });
  } catch (err) {
    console.error("DB Error on GetPendingHandovers:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04: Lấy danh sách dòng chi tiết của một phiếu
router.get('/confirm-handover/:handoverNo/lines', async (req, res) => {
  const { handoverNo } = req.params;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    
    const result = await request.execute('usp_WMS_UC04_GetHandoverLines');
    res.json({ status: 'SUCCESS', data: result.recordset });
  } catch (err) {
    console.error("DB Error on GetHandoverLines:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC04: Lấy chi tiết các thùng chờ xác nhận của một dòng phiếu
router.get('/confirm-detail/:handoverNo/:lineNo', async (req, res) => {
  const { handoverNo, lineNo } = req.params;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('MaChiTietPhieu', sql.NVarChar(50), lineNo);
    
    const result = await request.execute('usp_WMS_UC04_GetPendingBoxes');
    res.json({ status: 'SUCCESS', data: result.recordset });
  } catch (err) {
    console.error("DB Error on GetPendingBoxes:", err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// UC05.1: Thủ kho Hủy toàn bộ kết quả quét của Phiếu nhập (Pending Handover)
router.post('/handover/:handoverNo/cancel-scan', async (req, res) => {
  const { handoverNo } = req.params;
  const { reason } = req.body;
  const username = req.user ? req.user.user_id : 'SYSTEM';

  if (req.user && req.user.role && req.user.role !== 'STOREKEEPER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'ERROR', message: 'Forbidden. Only Storekeeper can cancel scan.' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('SoPhieuNhap', sql.NVarChar(50), handoverNo);
    request.input('LyDoHuy', sql.NVarChar(500), reason || '');
    request.input('UserName', sql.NVarChar(100), username);
    
    const result = await request.execute('usp_WMS_UC04_2_CancelScan');
    res.json({ status: 'SUCCESS', data: result.recordset ? result.recordset[0] : { Result: 'OK' } });
  } catch (err) {
    console.error("DB Error on CancelScan (UC05.1):", err);
    res.status(400).json({ status: 'ERROR', message: err.message });
  }
});

module.exports = router;
