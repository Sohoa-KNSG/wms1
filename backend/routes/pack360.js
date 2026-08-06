const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');

// /api/pack360/scan-unit
router.post('/scan-unit', async (req, res) => {
    try {
        const { pack360_id, qr_60, packing_standard_type, user_code, target_oem_order_no } = req.body;
        
        if (!qr_60 || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc.' });
        }

        const pool = await poolPromise;
        const request = pool.request();
        
        if (pack360_id) {
            request.input('pack360_id', sql.NVarChar(50), pack360_id);
        }
        request.input('qr_60', sql.NVarChar(255), qr_60);
        request.input('packing_standard_type', sql.NVarChar(30), packing_standard_type || 'TRADITIONAL');
        if (target_oem_order_no) {
            request.input('target_oem_order_no', sql.NVarChar(255), target_oem_order_no);
        }
        request.input('user_code', sql.NVarChar(50), user_code);
        request.input('is_repack', sql.Bit, req.body.is_repack ? 1 : 0);
        request.output('new_pack360_id', sql.NVarChar(50));
        
        const result = await request.execute('usp_Pack360_ScanUnit');
            
        const newPack360Id = result.output.new_pack360_id;
        
        // Return current status (e.g. current unit count)
        const countResult = await pool.request()
            .input('pack360_id', sql.NVarChar(50), newPack360Id)
            .query('SELECT actual_unit_count FROM pack360_header WHERE pack360_id = @pack360_id');
            
        const count = countResult.recordset[0] ? countResult.recordset[0].actual_unit_count : 1;

        res.json({
            status: 'SUCCESS',
            pack360_id: newPack360Id,
            actual_unit_count: count,
            message: 'Thêm Thùng 60 thành công.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/scan-unit:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/complete
router.post('/complete', async (req, res) => {
    try {
        const { pack360_id, weight, user_code } = req.body;
        
        if (!pack360_id || weight == null || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc.' });
        }

        const pool = await poolPromise;
        
        // Execute SP
        const result = await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .input('weight', sql.Decimal(18,2), weight)
            .input('user_code', sql.NVarChar(50), user_code)
            .execute('usp_Pack360_Complete');
            
        const row = result.recordset[0];
        
        // Get list of Thùng 60 for the detail label
        const unitResult = await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .query(`
                SELECT t.qr_60 
                FROM pack360_unit u 
                INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60 
                WHERE u.pack360_id = @pack360_id AND u.is_current = 1
            `);
            
        const listQr60 = unitResult.recordset.map(r => r.qr_60);

        res.json({
            status: 'SUCCESS',
            pack360_qr: row.Pack360_QR,
            weight: row.Weight,
            product_code: row.ProductCode,
            channel: row.Channel,
            units: listQr60,
            message: 'Hoàn tất Đóng gói Thùng 360.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/complete:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/complete-repack (UC10)
router.post('/complete-repack', async (req, res) => {
    try {
        const { pack360_id, weight, user_code } = req.body;
        
        if (!pack360_id || weight == null || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc.' });
        }

        const pool = await poolPromise;
        
        // Execute SP
        const result = await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .input('weight', sql.Decimal(18,2), weight)
            .input('user_code', sql.NVarChar(50), user_code)
            .execute('usp_Pack360_Complete');
            
        const row = result.recordset[0];
        
        // Cập nhật các thùng 60 đã repack xong
        await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .query(`
                UPDATE tbl_thung60_kho 
                SET current_location_code = 'WAREHOUSE'
                WHERE current_pack360_id = @pack360_id
            `);

        res.json({
            status: 'SUCCESS',
            pack360_qr: row.Pack360_QR,
            weight: row.Weight,
            message: 'Đã hoàn tất đóng gói kiện Repack.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/complete-repack:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/cancel
router.post('/cancel', async (req, res) => {
    try {
        const { pack360_id, user_code } = req.body;
        
        if (!pack360_id || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc.' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .input('user_code', sql.NVarChar(50), user_code)
            .execute('usp_Pack360_Cancel');
            
        res.json({
            status: 'SUCCESS',
            message: 'Đã hủy thao tác và giải phóng thùng.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/cancel:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/release (UC08)
router.post('/release', async (req, res) => {
    try {
        const { pack360_qr, release_reason, user_code } = req.body;
        
        if (!pack360_qr || !release_reason || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc (pack360_qr, release_reason, user_code).' });
        }

        const pool = await poolPromise;
        
        // Lookup pack360_id from pack360_qr or assume the input might be the ID directly
        const lookupResult = await pool.request()
            .input('pack360_qr', sql.NVarChar(255), pack360_qr)
            .query(`
                SELECT pack360_id 
                FROM pack360_header 
                WHERE pack360_qr = @pack360_qr OR pack360_id = @pack360_qr
            `);
            
        if (lookupResult.recordset.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy Pack360 với mã này.' });
        }
        
        const pack360_id = lookupResult.recordset[0].pack360_id;

        await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .input('release_reason', sql.NVarChar(255), release_reason)
            .input('user_code', sql.NVarChar(50), user_code)
            .execute('usp_Pack360_Release');
            
        res.json({
            status: 'SUCCESS',
            message: 'Đã giải phóng Pack360 thành công.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/release:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // Fetch header
        const headerResult = await pool.request()
            .input('id', sql.NVarChar(255), id)
            .query(`
                SELECT * 
                FROM pack360_header 
                WHERE pack360_id = @id OR pack360_qr = @id
            `);
            
        if (headerResult.recordset.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy kiện Pack360.' });
        }
        const pack360 = headerResult.recordset[0];
        
        // Fetch units
        const unitsResult = await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360.pack360_id)
            .query(`
                SELECT t.id_60, t.qr_60, t.status 
                FROM pack360_unit u 
                INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60 
                WHERE u.pack360_id = @pack360_id AND u.is_current = 1
            `);
            
        res.json({
            status: 'SUCCESS',
            pack360: pack360,
            units: unitsResult.recordset
        });

    } catch (err) {
        console.error('Error in /api/pack360/:id:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

// /api/pack360/detach-units (UC09)
router.post('/detach-units', async (req, res) => {
    try {
        const { pack360_id, unit_ids, reason, user_code } = req.body;
        
        if (!pack360_id || !unit_ids || !reason || !user_code) {
            return res.status(400).json({ status: 'ERROR', message: 'Thiếu tham số bắt buộc (pack360_id, unit_ids, reason, user_code).' });
        }

        const unitIdsStr = Array.isArray(unit_ids) ? unit_ids.join(',') : unit_ids;

        const pool = await poolPromise;
        
        await pool.request()
            .input('pack360_id', sql.NVarChar(50), pack360_id)
            .input('unit_ids', sql.NVarChar(sql.MAX), unitIdsStr)
            .input('reason', sql.NVarChar(255), reason)
            .input('user_code', sql.NVarChar(50), user_code)
            .execute('usp_Pack360_DetachUnits');
            
        res.json({
            status: 'SUCCESS',
            message: 'Đã tách các thùng 60 thành công. Kiện 360 cần được cân lại trọng lượng.'
        });

    } catch (err) {
        console.error('Error in /api/pack360/detach-units:', err);
        res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi server.' });
    }
});

module.exports = router;
