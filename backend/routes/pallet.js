const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Bỏ qua xác thực để dễ kiểm thử (nếu có auth thì thêm middleware requireAuth)

// 1. Khởi tạo Pallet (Quét QR Pallet)
router.post('/init', async (req, res) => {
    try {
        const { palletId, userName } = req.body;
        if (!palletId) {
            return res.status(400).json({ success: false, message: 'Thiếu palletId' });
        }

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);
        request.input('UserName', sql.NVarChar(100), userName || 'API_USER');

        const result = await request.execute('usp_WMS_UC06_InitPallet');
        const data = result.recordset[0];
        
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 2. Thêm Unit vào Pallet
router.post('/:id/add-unit', async (req, res) => {
    try {
        const palletId = req.params.id;
        const { unitId, unitType, userName } = req.body;
        
        if (!unitId || !unitType) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin Unit' });
        }

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);
        request.input('UnitId', sql.NVarChar(50), unitId);
        request.input('UnitType', sql.NVarChar(30), unitType);
        request.input('UserName', sql.NVarChar(100), userName || 'API_USER');

        const result = await request.execute('usp_WMS_UC06_AddUnitToPallet');
        const data = result.recordset[0];
        
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 3. Hoàn thành Pallet
router.post('/:id/complete', async (req, res) => {
    try {
        const palletId = req.params.id;
        const { userName } = req.body;

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);
        request.input('UserName', sql.NVarChar(100), userName || 'API_USER');

        const result = await request.execute('usp_WMS_UC06_CompletePallet');
        const data = result.recordset[0];
        
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 4. Tháo dỡ Unit khỏi Pallet (Depalletizing) - Tự động tìm Pallet
router.post('/remove-unit', async (req, res) => {
    try {
        const { unitId, unitType, userName } = req.body;
        
        if (!unitId || !unitType) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin Unit' });
        }

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), null); // Để null cho SP tự tìm
        request.input('UnitId', sql.NVarChar(50), unitId);
        request.input('UnitType', sql.NVarChar(30), unitType);
        request.input('UserName', sql.NVarChar(100), userName || 'API_USER');

        const result = await request.execute('usp_WMS_UC06_1_RemoveUnit');
        const data = result.recordset[0];
        
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 5. Chuyển Unit sang Pallet khác (Transfer) - Tự động tìm Pallet Nguồn
router.post('/transfer-unit', async (req, res) => {
    try {
        const { newPalletId, unitId, unitType, userName } = req.body;
        
        if (!newPalletId || !unitId || !unitType) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin chuyển đổi (newPalletId, unitId, unitType)' });
        }

        const request = new sql.Request();
        request.input('OldPalletId', sql.NVarChar(50), null); // Để null cho SP tự tìm
        request.input('NewPalletId', sql.NVarChar(50), newPalletId);
        request.input('UnitId', sql.NVarChar(50), unitId);
        request.input('UnitType', sql.NVarChar(30), unitType);
        request.input('UserName', sql.NVarChar(100), userName || 'API_USER');

        const result = await request.execute('usp_WMS_UC06_1_TransferUnit');
        const data = result.recordset[0];
        
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 6. Tra cứu thông tin Pallet (UC06.2)
router.get('/:id/info', async (req, res) => {
    try {
        const palletId = req.params.id;

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);

        const result = await request.execute('usp_WMS_UC06_2_GetPalletInfo');
        
        // mssql trả về mảng recordsets
        // result.recordsets[0] -> Pallet Info
        // result.recordsets[1] -> Summary
        // result.recordsets[2] -> Details
        
        if (!result.recordsets || result.recordsets.length < 3 || result.recordsets[0].length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Pallet' });
        }

        return res.json({ 
            success: true, 
            data: {
                pallet: result.recordsets[0][0],
                summary: result.recordsets[1],
                details: result.recordsets[2]
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 7. Lên kệ (Putaway) - UC11
router.post('/:id/putaway', async (req, res) => {
    try {
        const palletId = req.params.id;
        const { locationCode, userName } = req.body;

        if (!locationCode) {
            return res.status(400).json({ success: false, message: 'Thiếu mã Kệ (LocationCode)' });
        }

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);
        request.input('LocationCode', sql.NVarChar(50), locationCode);
        request.input('UserName', sql.NVarChar(100), userName || 'SYSTEM');

        const result = await request.execute('usp_WMS_UC11_PutawayPallet');
        const data = result.recordset[0];
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

// 8. Xuống kệ (Letdown) - UC11
router.post('/:id/letdown', async (req, res) => {
    try {
        const palletId = req.params.id;
        const { userName } = req.body;

        const request = new sql.Request();
        request.input('PalletId', sql.NVarChar(50), palletId);
        request.input('UserName', sql.NVarChar(100), userName || 'SYSTEM');

        const result = await request.execute('usp_WMS_UC11_LetdownPallet');
        const data = result.recordset[0];
        return res.json({ success: true, message: data.Message });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi server' });
    }
});

module.exports = router;
