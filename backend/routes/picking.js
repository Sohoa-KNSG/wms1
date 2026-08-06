const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Ensure delivery_note_barcode table exists
(async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='delivery_note_barcode' AND xtype='U')
            CREATE TABLE delivery_note_barcode (
                id INT IDENTITY(1,1) PRIMARY KEY,
                delivery_note_no NVARCHAR(50) NOT NULL,
                barcode NVARCHAR(255) NOT NULL,
                barcode_type NVARCHAR(30) NOT NULL,
                product_code NVARCHAR(50) NOT NULL,
                qty DECIMAL(18,4) NOT NULL,
                scanned_by NVARCHAR(50),
                scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure delivery_note_header has approved_by, approved_at, approval_note, security_checked_by, security_checked_at, driver_name, seal_no, gate_note columns
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_header') AND name = 'approved_by')
            ALTER TABLE delivery_note_header ADD approved_by NVARCHAR(50), approved_at DATETIME, approval_note NVARCHAR(255);

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_header') AND name = 'security_checked_by')
            ALTER TABLE delivery_note_header ADD security_checked_by NVARCHAR(50), security_checked_at DATETIME, driver_name NVARCHAR(100), seal_no NVARCHAR(100), gate_note NVARCHAR(255);
        `);
    } catch(e) { console.error('Error creating delivery_note_barcode', e); }
})();

// GET list of delivery notes to pick
router.get('/notes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
                SELECT h.delivery_note_no, h.created_at, h.status, h.license_plate, h.customer_name
                FROM delivery_note_header h
                WHERE h.status IN ('PENDING_PICK', 'PICKING', 'PICKED', 'STAGED')
                ORDER BY h.created_at DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET delivery note details with picking progress
router.get('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        
        // Header
        const headerRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .query('SELECT * FROM delivery_note_header WHERE delivery_note_no = @id');
            
        if (headerRes.recordset.length === 0) {
            return res.status(404).json({ error: 'Delivery note not found' });
        }
        const header = headerRes.recordset[0];
        
        // Details with picked qty
        const detailRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(`
                SELECT d.product_code, d.channel_code, d.qty, d.box_large, d.box_small,
                       ISNULL((SELECT SUM(b.qty) FROM delivery_note_barcode b WHERE b.delivery_note_no = d.delivery_note_no AND b.product_code = d.product_code), 0) as picked_qty
                FROM delivery_note_detail d
                WHERE d.delivery_note_no = @id
            `);
            
        res.json({ header, details: detailRes.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET scanned history for a specific line
router.get('/notes/:id/line/:pcode', async (req, res) => {
    try {
        const { id, pcode } = req.params;
        const pool = await poolPromise;
        const historyRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .input('pcode', sql.NVarChar, pcode)
            .query(`
                SELECT barcode, barcode_type, qty, scanned_by, scanned_at
                FROM delivery_note_barcode
                WHERE delivery_note_no = @id AND product_code = @pcode
                ORDER BY scanned_at DESC
            `);
        res.json(historyRes.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST scan barcode
router.post('/scan', async (req, res) => {
    try {
        const { delivery_note_no, barcode, user, expected_product_code } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        try {
            // Check note status
            const noteReq = new sql.Request(transaction);
            const noteRes = await noteReq.input('id', sql.NVarChar, delivery_note_no)
                .query("SELECT status FROM delivery_note_header WHERE delivery_note_no = @id");
            if (noteRes.recordset.length === 0) throw new Error('Delivery note not found');
            const noteStatus = noteRes.recordset[0].status;
            
            if (noteStatus === 'PENDING_PICK') {
                // Change status to PICKING
                const updateNoteReq = new sql.Request(transaction);
                await updateNoteReq.input('id', sql.NVarChar, delivery_note_no)
                    .query("UPDATE delivery_note_header SET status = 'PICKING' WHERE delivery_note_no = @id");
            }
            
            // Identify barcode
            let barcodeType = null;
            let productCode = null;
            let qty = 0;
            
            // Check Thùng 60
            const thungReq = new sql.Request(transaction);
            const thungRes = await thungReq.input('barcode', sql.NVarChar, barcode)
                .query("SELECT * FROM tbl_thung60_kho WHERE qr_60 = @barcode OR id_60 = @barcode");
                
            if (thungRes.recordset.length > 0) {
                const thung = thungRes.recordset[0];
                if (thung.status !== 'AVAILABLE' && thung.status !== 'ALLOCATED') {
                    throw new Error(`Thùng 60 không khả dụng (Trạng thái: ${thung.status})`);
                }
                barcodeType = 'THUNG60';
                productCode = thung.product_code;
                qty = thung.current_qty;
                
                // Update status to PICKED
                const updateThungReq = new sql.Request(transaction);
                await updateThungReq.input('barcode', sql.NVarChar, barcode)
                    .input('user', sql.NVarChar, user || 'SYSTEM')
                    .input('note', sql.NVarChar, delivery_note_no)
                    .input('id60', sql.NVarChar, thung.id_60)
                    .input('oldStatus', sql.NVarChar, thung.status)
                    .query(`
                        UPDATE tbl_thung60_kho SET status = 'PICKED', last_event_type = 'PICK_60', last_event_at = GETDATE() WHERE id_60 = @id60;
                        
                        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
                        VALUES (NEWID(), @id60, 'PICK_60', @oldStatus, 'PICKED', @note, NEWID(), @user);
                    `);
            } else {
                // Check Pack 360 (REC-P0-01)
                const packReq = new sql.Request(transaction);
                const packRes = await packReq.input('barcode', sql.NVarChar, barcode)
                    .query("SELECT * FROM pack360_header WHERE pack360_id = @barcode OR pack360_qr = @barcode");
                    
                if (packRes.recordset.length > 0) {
                    const pack = packRes.recordset[0];
                    if (pack.status !== 'COMPLETED' && pack.status !== 'ALLOCATED' && pack.status !== 'OPEN') {
                        throw new Error(`Kiện 360 không hợp lệ (Trạng thái: ${pack.status})`);
                    }
                    barcodeType = 'PACK360';
                    
                    // Dynamic calculation of productCode and qty from active units
                    const packUnitsReq = new sql.Request(transaction);
                    const packUnitsRes = await packUnitsReq.input('packId', sql.NVarChar, pack.pack360_id)
                        .query(`
                            SELECT t.product_code, SUM(t.current_qty) as total_qty
                            FROM pack360_unit u
                            INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
                            WHERE u.pack360_id = @packId AND u.is_current = 1
                            GROUP BY t.product_code
                        `);

                    if (packUnitsRes.recordset.length === 0) {
                        throw new Error('Kiện 360 rỗng (không chứa thùng 60 nào).');
                    }

                    productCode = packUnitsRes.recordset[0].product_code;
                    qty = packUnitsRes.recordset.reduce((sum, r) => sum + Number(r.total_qty || 0), 0);
                    
                    // Update status to PICKED & log event
                    const updatePackReq = new sql.Request(transaction);
                    await updatePackReq.input('user', sql.NVarChar, user || 'SYSTEM')
                        .input('note', sql.NVarChar, delivery_note_no)
                        .input('packId', sql.NVarChar, pack.pack360_id)
                        .input('oldStatus', sql.NVarChar, pack.status)
                        .query(`
                            UPDATE pack360_header SET status = 'PICKED' WHERE pack360_id = @packId;
                            
                            INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, performed_by, request_id)
                            VALUES (NEWID(), @packId, 'PICK_PACK', @oldStatus, 'PICKED', @note, @user, NEWID());
                        `);
                } else {
                    throw new Error('Mã vạch không tồn tại trong hệ thống.');
                }
            }
            
            // Check if product code matches expected
            if (expected_product_code && productCode !== expected_product_code) {
                throw new Error(`Nhầm mã sản phẩm! Đang chọn mã ${expected_product_code} nhưng lại quét mã ${productCode}.`);
            }
            
            // Validate product_code matches note details and qty doesn't exceed requirement
            const detailReq = new sql.Request(transaction);
            const detailRes = await detailReq.input('id', sql.NVarChar, delivery_note_no)
                .input('pcode', sql.NVarChar, productCode)
                .query(`
                    SELECT ISNULL(SUM(d.qty), 0) as required_qty,
                           ISNULL((SELECT SUM(b.qty) FROM delivery_note_barcode b WHERE b.delivery_note_no = d.delivery_note_no AND b.product_code = d.product_code), 0) as picked_qty
                    FROM delivery_note_detail d
                    WHERE d.delivery_note_no = @id AND d.product_code = @pcode
                    GROUP BY d.delivery_note_no, d.product_code
                `);
                
            if (detailRes.recordset.length === 0) {
                throw new Error(`Sản phẩm ${productCode} không có trong phiếu xuất này.`);
            }
            
            // Allow over-picking according to user request (removed over-pick block here)
            
            // Check if already scanned
            const checkScannedReq = new sql.Request(transaction);
            const checkScannedRes = await checkScannedReq.input('barcode', sql.NVarChar, barcode)
                .query("SELECT * FROM delivery_note_barcode WHERE barcode = @barcode");
            if (checkScannedRes.recordset.length > 0) {
                throw new Error('Mã vạch này đã được quét cho một phiếu xuất.');
            }
            
            // Insert into barcode table
            const insertBarcodeReq = new sql.Request(transaction);
            await insertBarcodeReq
                .input('note', sql.NVarChar, delivery_note_no)
                .input('barcode', sql.NVarChar, barcode)
                .input('btype', sql.NVarChar, barcodeType)
                .input('pcode', sql.NVarChar, productCode)
                .input('qty', sql.Decimal(18, 4), qty)
                .input('user', sql.NVarChar, user || 'SYSTEM')
                .query(`
                    INSERT INTO delivery_note_barcode (delivery_note_no, barcode, barcode_type, product_code, qty, scanned_by)
                    VALUES (@note, @barcode, @btype, @pcode, @qty, @user)
                `);
                
            await transaction.commit();
            res.json({ success: true, message: 'Scanned successfully', product_code: productCode, qty });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST complete picking by single note
router.post('/complete', async (req, res) => {
    try {
        const { delivery_note_no } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.NVarChar, delivery_note_no)
            .query("UPDATE delivery_note_header SET status = 'PICKED' WHERE delivery_note_no = @id AND status IN ('PENDING_PICK', 'PICKING')");
            
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Thủ kho Duyệt Xác Nhận Xuất Kho sau khi soạn xong (UC16)
router.post('/approve-storekeeper', async (req, res) => {
    try {
        const { delivery_note_no, user, note } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.NVarChar, delivery_note_no)
            .input('user', sql.NVarChar, user || 'THU_KHO')
            .input('note', sql.NVarChar, note || 'Thủ kho đã duyệt xuất kho')
            .query(`
                UPDATE delivery_note_header 
                SET status = 'STAGED', 
                    approved_by = @user, 
                    approved_at = CURRENT_TIMESTAMP,
                    approval_note = @note
                WHERE delivery_note_no = @id AND status = 'PICKED'
            `);
            
        res.json({ success: true, message: `Thủ kho ${user} đã duyệt xác nhận xuất kho thành công!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Bảo vệ kiểm cổng xác nhận xe rời bến (UC16)
router.post('/gate-check', async (req, res) => {
    try {
        const { delivery_note_no, license_plate, security_user, driver_name, seal_no, gate_note } = req.body;
        const pool = await poolPromise;
        
        let query = `
            UPDATE delivery_note_header 
            SET status = 'SHIPPED', 
                security_checked_by = @security_user, 
                security_checked_at = CURRENT_TIMESTAMP,
                driver_name = @driver_name,
                seal_no = @seal_no,
                gate_note = @gate_note
            WHERE status = 'STAGED'
        `;
        
        const reqObj = pool.request()
            .input('security_user', sql.NVarChar, security_user || 'BAO_VE')
            .input('driver_name', sql.NVarChar, driver_name || '')
            .input('seal_no', sql.NVarChar, seal_no || '')
            .input('gate_note', sql.NVarChar, gate_note || 'Bảo vệ đã kiểm tra và cho phép xuất bến');

        if (delivery_note_no) {
            query += ` AND delivery_note_no = @delivery_note_no`;
            reqObj.input('delivery_note_no', sql.NVarChar, delivery_note_no);
        } else if (license_plate) {
            query += ` AND license_plate = @license_plate`;
            reqObj.input('license_plate', sql.NVarChar, license_plate);
        } else {
            return res.status(400).json({ error: 'Cần truyền delivery_note_no hoặc license_plate' });
        }

        await reqObj.query(query);
        res.json({ success: true, message: 'Bảo vệ đã xác nhận kiểm cổng & xe xuất bến thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UC16: API Thao Tác Soạn Hàng / Tập Kết / Xuất Bến Gom Nhóm Theo Chuyến Xe Tải ---

// GET Tổng hợp danh sách mặt hàng cần soạn của CẢ CHUYẾN XE
router.get('/truck-summary/:license_plate', async (req, res) => {
    try {
        const { license_plate } = req.params;
        const pool = await poolPromise;
        const summaryRes = await pool.request()
            .input('license_plate', sql.NVarChar, license_plate)
            .query(`
                SELECT 
                    d.product_code, 
                    d.channel_code, 
                    SUM(d.qty) as total_qty, 
                    SUM(d.box_large) as total_box_large, 
                    SUM(d.box_small) as total_box_small, 
                    SUM(d.box_virtual) as total_box_virtual,
                    SUM(d.total_weight_kg) as total_weight_kg,
                    COUNT(DISTINCT h.delivery_note_no) as total_notes
                FROM delivery_note_detail d
                JOIN delivery_note_header h ON d.delivery_note_no = h.delivery_note_no
                WHERE h.license_plate = @license_plate
                GROUP BY d.product_code, d.channel_code
            `);
        res.json(summaryRes.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Hoàn tất soạn hàng cho TOÀN BỘ CHUYẾN XE (PENDING_PICK / PICKING -> PICKED)
router.post('/truck-complete', async (req, res) => {
    try {
        const { license_plate } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('license_plate', sql.NVarChar, license_plate)
            .query("UPDATE delivery_note_header SET status = 'PICKED' WHERE license_plate = @license_plate AND status IN ('PENDING_PICK', 'PICKING')");
        res.json({ success: true, message: `Đã hoàn tất soạn hàng cho toàn bộ Chuyến Xe ${license_plate}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST Xác nhận tập kết cho TOÀN BỘ CHUYẾN XE (PICKED -> STAGED)
router.post('/truck-stage', async (req, res) => {
    try {
        const { license_plate } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('license_plate', sql.NVarChar, license_plate)
            .query("UPDATE delivery_note_header SET status = 'STAGED' WHERE license_plate = @license_plate AND status = 'PICKED'");
        res.json({ success: true, message: `Đã hoàn tất tập kết cho toàn bộ Chuyến Xe ${license_plate}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET Gợi ý xuất kho theo FIFO (First-In First-Out) & Vị trí kho (Tách Kiện Lớn 360 và Thùng Lẻ 60)
router.get('/fifo-suggestions/:product_code', async (req, res) => {
    try {
        const { product_code } = req.params;
        const pool = await poolPromise;
        
        // 1. Gợi ý Kiện Lớn 360 (Pack 360) theo FIFO
        const pack360Res = await pool.request()
            .input('product_code', sql.NVarChar, product_code)
            .query(`
                SELECT TOP 5 
                    t.current_pack360_id as pack_id,
                    COUNT(t.id_60) as total_boxes_60,
                    SUM(t.current_qty) as total_qty,
                    ISNULL(MIN(t.current_location_code), N'Kho NVB - Dãy A1') as location_code,
                    MIN(t.created_at) as created_at
                FROM tbl_thung60_kho t
                WHERE t.product_code = @product_code 
                  AND t.current_pack360_id IS NOT NULL 
                  AND t.current_pack360_id <> ''
                  AND t.status IN ('PACKED_360', 'AVAILABLE', 'PALLETIZED')
                  AND t.current_qty > 0
                GROUP BY t.current_pack360_id
                ORDER BY MIN(t.created_at) ASC
            `);

        // 2. Gợi ý Thùng Lẻ 60 (Thùng 60 đơn lẻ) theo FIFO
        const box60Res = await pool.request()
            .input('product_code', sql.NVarChar, product_code)
            .query(`
                SELECT TOP 10 
                    t.id_60, 
                    t.qr_60, 
                    t.product_code, 
                    t.current_qty, 
                    t.is_virtual,
                    ISNULL(t.current_location_code, N'Kho NVB - Dãy A2') as location_code,
                    t.created_at,
                    t.current_pack360_id
                FROM tbl_thung60_kho t
                WHERE t.product_code = @product_code 
                  AND (t.current_pack360_id IS NULL OR t.current_pack360_id = '')
                  AND t.status IN ('AVAILABLE', 'PALLETIZED')
                  AND t.current_qty > 0
                ORDER BY t.created_at ASC
            `);

        res.json({
            pack360_suggestions: pack360Res.recordset,
            box60_suggestions: box60Res.recordset
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET available boxes for partial picking (UC17)
router.get('/available-boxes/:productCode', async (req, res) => {
    try {
        const { productCode } = req.params;
        const pool = await poolPromise;
        
        // Find boxes that have status AVAILABLE and matches the product code
        const boxRes = await pool.request()
            .input('pcode', sql.NVarChar, productCode)
            .query(`
                SELECT id_60, qr_60, current_qty, unit_origin_type, is_virtual
                FROM tbl_thung60_kho
                WHERE product_code = @pcode AND status = 'AVAILABLE' AND current_qty > 0
                ORDER BY created_at ASC
            `);
            
        res.json({ success: true, data: boxRes.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST split box for partial picking (UC17)
router.post('/split-box', async (req, res) => {
    try {
        const { delivery_note_no, product_code, source_id_60, split_qty, user } = req.body;
        if (!split_qty || split_qty <= 0) throw new Error('Số lượng lấy lẻ không hợp lệ');

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // 1. Lock and check source box
            const checkReq = new sql.Request(transaction);
            const checkRes = await checkReq
                .input('id60', sql.NVarChar, source_id_60)
                .query(`
                    SELECT * FROM tbl_thung60_kho WITH (UPDLOCK) 
                    WHERE id_60 = @id60 AND status = 'AVAILABLE'
                `);
            
            if (checkRes.recordset.length === 0) {
                throw new Error('Thùng gốc không khả dụng hoặc đã bị lấy mất');
            }
            
            const sourceBox = checkRes.recordset[0];
            if (sourceBox.current_qty < split_qty) {
                throw new Error(`Thùng gốc chỉ còn ${sourceBox.current_qty}, không đủ để lấy ${split_qty}`);
            }

            // 2. Generate new Virtual Box ID
            const newVirtualId = 'VIR-SPLIT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

            // 3. Update source box
            const remainingQty = sourceBox.current_qty - split_qty;
            const newSourceStatus = 'AVAILABLE'; // User confirmed: giữ nguyên AVAILABLE

            const updateSourceReq = new sql.Request(transaction);
            await updateSourceReq
                .input('id60', sql.NVarChar, source_id_60)
                .input('remQty', sql.Decimal(18, 4), remainingQty)
                .input('newStatus', sql.NVarChar, newSourceStatus)
                .query(`
                    UPDATE tbl_thung60_kho 
                    SET current_qty = @remQty, status = @newStatus 
                    WHERE id_60 = @id60
                `);

            // 4. Create new Virtual Box (already picked for this note)
            const insertVirtualReq = new sql.Request(transaction);
            await insertVirtualReq
                .input('newId', sql.NVarChar, newVirtualId)
                .input('pcode', sql.NVarChar, product_code)
                .input('qty', sql.Decimal(18, 4), split_qty)
                .input('sourceId', sql.NVarChar, source_id_60)
                .input('unitType', sql.NVarChar, 'SPLIT_VIRTUAL')
                .input('rootId', sql.NVarChar, sourceBox.root_id_60 || source_id_60)
                .query(`
                    INSERT INTO tbl_thung60_kho (
                        id_60, qr_60, product_code, original_qty, current_qty, status, 
                        is_virtual, unit_origin_type, parent_id_60, root_id_60, uom, stock_type
                    )
                    VALUES (
                        @newId, @newId, @pcode, @qty, @qty, 'PICKED',
                        1, @unitType, @sourceId, @rootId, 'CARTON', 'UNRESTRICTED'
                    )
                `);

            // 5. Insert split history
            const reqId = 'REQ-SPLIT-' + Date.now();
            const splitHistReq = new sql.Request(transaction);
            await splitHistReq
                .input('splitId', sql.NVarChar, 'SPLIT-' + Date.now())
                .input('sourceId', sql.NVarChar, source_id_60)
                .input('genId', sql.NVarChar, newVirtualId)
                .input('pcode', sql.NVarChar, product_code)
                .input('splitQty', sql.Decimal(18, 4), split_qty)
                .input('qtyBefore', sql.Decimal(18, 4), sourceBox.current_qty)
                .input('qtyAfter', sql.Decimal(18, 4), remainingQty)
                .input('user', sql.NVarChar, user || 'SYSTEM')
                .input('reqId', sql.NVarChar, reqId)
                .query(`
                    INSERT INTO thung60_split_history (
                        split_id, source_id_60, generated_id_60, product_code, 
                        split_qty, source_qty_before, source_qty_after, reason_code,
                        performed_by, request_id
                    )
                    VALUES (
                        @splitId, @sourceId, @genId, @pcode, 
                        @splitQty, @qtyBefore, @qtyAfter, 'UC17_PARTIAL_PICK',
                        @user, @reqId
                    )
                `);

            // 6. Insert Event for source box and new box
            const eventReq = new sql.Request(transaction);
            await eventReq
                .input('sourceId', sql.NVarChar, source_id_60)
                .input('genId', sql.NVarChar, newVirtualId)
                .input('user', sql.NVarChar, user || 'SYSTEM')
                .input('note', sql.NVarChar, delivery_note_no)
                .input('reqId', sql.NVarChar, reqId)
                .query(`
                    INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, source_document_no, request_id)
                    VALUES (NEWID(), @sourceId, 'SPLIT_OUT', 'AVAILABLE', 'AVAILABLE', @user, @note, @reqId);
                    
                    INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, source_document_no, request_id)
                    VALUES (NEWID(), @genId, 'SPLIT_IN', 'NEW', 'PICKED', @user, @note, @reqId);
                `);

            // 7. Update status of note to PICKING if it's PENDING_PICK
            const updateNoteReq = new sql.Request(transaction);
            await updateNoteReq
                .input('note', sql.NVarChar, delivery_note_no)
                .query(`
                    UPDATE delivery_note_header 
                    SET status = 'PICKING' 
                    WHERE delivery_note_no = @note AND status = 'PENDING_PICK'
                `);

            // 8. Insert into delivery_note_barcode to map it
            const mapReq = new sql.Request(transaction);
            await mapReq
                .input('note', sql.NVarChar, delivery_note_no)
                .input('barcode', sql.NVarChar, newVirtualId)
                .input('pcode', sql.NVarChar, product_code)
                .input('qty', sql.Decimal(18, 4), split_qty)
                .input('user', sql.NVarChar, user || 'SYSTEM')
                .query(`
                    INSERT INTO delivery_note_barcode (
                        delivery_note_no, barcode, barcode_type, product_code, qty, scanned_by
                    )
                    VALUES (@note, @barcode, 'VIRTUAL', @pcode, @qty, @user)
                `);
            
            // Note: Ledger will be recorded collectively when the whole delivery note is posted in UC15/UC16.
            
            await transaction.commit();
            res.json({ success: true, message: 'Đã tách và lấy lẻ thành công!', virtual_id: newVirtualId });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST stage
router.post('/stage', async (req, res) => {
    try {
        const { delivery_note_no } = req.body;
        const user = 'SYSTEM'; // Frontend might not pass user yet
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .query("UPDATE delivery_note_header SET status = 'STAGED' WHERE delivery_note_no = @id AND status = 'PICKED'");
                
            // Update physical inventory status to STAGED & Record events
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .input('user', sql.NVarChar, user)
                .query(`
                    -- Thùng 60
                    INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
                    SELECT NEWID(), t.id_60, 'STAGE_60', t.status, 'STAGED', @id, NEWID(), @user
                    FROM tbl_thung60_kho t
                    INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'THUNG60';

                    UPDATE t
                    SET status = 'STAGED', last_event_type = 'STAGE_60', last_event_at = GETDATE()
                    FROM tbl_thung60_kho t
                    INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'THUNG60';

                    -- Kiện 360
                    INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, performed_by, request_id)
                    SELECT NEWID(), p.pack360_id, 'STAGE_PACK', p.status, 'STAGED', @id, @user, NEWID()
                    FROM pack360_header p
                    INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode OR p.pack360_qr = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'PACK360';

                    UPDATE p
                    SET status = 'STAGED'
                    FROM pack360_header p
                    INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode OR p.pack360_qr = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'PACK360';
                `);

            await transaction.commit();
            res.json({ success: true });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST ship
router.post('/ship', async (req, res) => {
    try {
        const { delivery_note_no } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Update note status
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .query("UPDATE delivery_note_header SET status = 'SHIPPED' WHERE delivery_note_no = @id AND status = 'STAGED'");

            // Update physical inventory status (tbl_thung60_kho)
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .input('user', sql.NVarChar, 'SYSTEM')
                .query(`
                    INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
                    SELECT NEWID(), t.id_60, 'SHIP_60', t.status, 'SHIPPED', @id, NEWID(), @user
                    FROM tbl_thung60_kho t
                    INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'THUNG60';
                    
                    UPDATE t
                    SET status = 'SHIPPED', 
                        last_event_type = 'SHIP_60', 
                        last_event_at = GETDATE() 
                    FROM tbl_thung60_kho t
                    INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'THUNG60';
                `);

            // Update physical inventory status (pack360_header)
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .input('user', sql.NVarChar, 'SYSTEM')
                .query(`
                    INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, performed_by, request_id)
                    SELECT NEWID(), p.pack360_id, 'SHIP_PACK', p.status, 'SHIPPED', @id, @user, NEWID()
                    FROM pack360_header p
                    INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode OR p.pack360_qr = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'PACK360';
                    
                    UPDATE p
                    SET status = 'SHIPPED'
                    FROM pack360_header p
                    INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode OR p.pack360_qr = b.barcode
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'PACK360';
                `);

            // Ghi nhận Sổ cái giao dịch (stock_transaction_book) & Sổ cái chi tiết
            await new sql.Request(transaction)
                .input('id', sql.NVarChar, delivery_note_no)
                .input('user', sql.NVarChar, 'SYSTEM')
                .query(`
                    DECLARE @txnId NVARCHAR(50) = NEWID();

                    INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, partner_unit, partner_name, posted_by)
                    SELECT @txnId, 'OUT_DISPATCH', @id, NULL, h.customer_name, @user
                    FROM delivery_note_header h
                    WHERE h.delivery_note_no = @id;

                    INSERT INTO item_ledger (ledger_date, product_code, transaction_id, source_document_no, total_quantity_change)
                    SELECT GETDATE(), product_code, @txnId, @id, -SUM(qty)
                    FROM delivery_note_barcode
                    WHERE delivery_note_no = @id
                    GROUP BY product_code;

                    -- 1) THUNG60 barcodes
                    INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type)
                    SELECT GETDATE(), b.barcode, b.product_code, @txnId, @id, -b.qty, 'AVAILABLE', 'SHIPPED'
                    FROM delivery_note_barcode b
                    WHERE b.delivery_note_no = @id AND (b.barcode_type = 'THUNG60' OR b.barcode_type IS NULL);

                    -- 2) PACK360 barcodes: expand into constituent id_60 units
                    INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type)
                    SELECT GETDATE(), u.id_60, b.product_code, @txnId, @id, -ISNULL(t.current_qty, 1), 'AVAILABLE', 'SHIPPED'
                    FROM delivery_note_barcode b
                    INNER JOIN pack360_header p ON b.barcode = p.pack360_id OR b.barcode = p.pack360_qr
                    INNER JOIN pack360_unit u ON p.pack360_id = u.pack360_id AND u.is_current = 1
                    LEFT JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
                    WHERE b.delivery_note_no = @id AND b.barcode_type = 'PACK360';

                    -- 3) Audit Log for Complete Dispatch
                    INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
                    VALUES ('DELIVERY_NOTE', @id, 'DISPATCH_COMPLETE', 'SHIPPED', @user);
                `);

            await transaction.commit();
            res.json({ success: true });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
