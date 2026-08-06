const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Middleware xác thực JWT
router.use(verifyToken);

// 1. GET danh sách phiếu xuất tạm
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                dispatch_no, reason_code, borrower_name, 
                dispatch_date, due_date, total_cartons, 
                total_qty, returned_qty, status, 
                created_by, created_at
            FROM tbl_temporary_dispatch_header
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching temporary dispatches:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. GET chi tiết 1 phiếu xuất tạm
router.get('/:dispatchNo', async (req, res) => {
    try {
        const { dispatchNo } = req.params;
        const pool = await poolPromise;
        
        const headerRes = await pool.request()
            .input('dispatchNo', sql.NVarChar(50), dispatchNo)
            .query('SELECT * FROM tbl_temporary_dispatch_header WHERE dispatch_no = @dispatchNo');

        if (headerRes.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu xuất tạm' });
        }

        const detailsRes = await pool.request()
            .input('dispatchNo', sql.NVarChar(50), dispatchNo)
            .query('SELECT * FROM tbl_temporary_dispatch_detail WHERE dispatch_no = @dispatchNo');

        res.json({
            success: true,
            data: {
                header: headerRes.recordset[0],
                details: detailsRes.recordset
            }
        });
    } catch (err) {
        console.error('Error fetching temporary dispatch detail:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. POST Tạo phiếu khai báo nhu cầu xuất tạm (Bước 1: PENDING_OUT)
router.post('/', async (req, res) => {
    try {
        const { borrower_name, reason_code, due_date, items } = req.body;
        if (!borrower_name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp bên mượn và danh sách sản phẩm' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const dispatchNo = `TEMP-${Date.now()}`;
            const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
            const totalCartons = items.length;
            const createdBy = req.user?.username || 'SYSTEM';

            // Insert Header
            const headerReq = new sql.Request(transaction);
            headerReq.input('dispatch_no', sql.NVarChar(50), dispatchNo);
            headerReq.input('reason_code', sql.NVarChar(50), reason_code || 'EXHIBITION_SAMPLE');
            headerReq.input('borrower_name', sql.NVarChar(100), borrower_name);
            headerReq.input('dispatch_date', sql.Date, new Date());
            headerReq.input('due_date', sql.Date, due_date ? new Date(due_date) : null);
            headerReq.input('total_cartons', sql.Int, totalCartons);
            headerReq.input('total_qty', sql.Decimal(18, 4), totalQty);
            headerReq.input('status', sql.NVarChar(30), 'PENDING_OUT');
            headerReq.input('created_by', sql.NVarChar(50), createdBy);

            await headerReq.query(`
                INSERT INTO tbl_temporary_dispatch_header 
                (dispatch_no, reason_code, borrower_name, dispatch_date, due_date, total_cartons, total_qty, returned_qty, status, created_by, created_at)
                VALUES 
                (@dispatch_no, @reason_code, @borrower_name, @dispatch_date, @due_date, @total_cartons, @total_qty, 0, @status, @created_by, GETDATE())
            `);

            // Insert Details
            for (const item of items) {
                const detailReq = new sql.Request(transaction);
                detailReq.input('dispatch_no', sql.NVarChar(50), dispatchNo);
                detailReq.input('id_60', sql.NVarChar(50), item.id_60 || item.carton_id || `REQ-${item.product_code}`);
                detailReq.input('product_code', sql.NVarChar(50), item.product_code);
                detailReq.input('qty', sql.Decimal(18, 4), Number(item.qty) || 0);
                detailReq.input('item_status', sql.NVarChar(30), 'PENDING');

                await detailReq.query(`
                    INSERT INTO tbl_temporary_dispatch_detail
                    (dispatch_no, id_60, product_code, qty, item_status)
                    VALUES
                    (@dispatch_no, @id_60, @product_code, @qty, @item_status)
                `);
            }

            await transaction.commit();
            res.json({
                success: true,
                message: 'Tạo phiếu khai báo xuất tạm thành công!',
                dispatchNo
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('Error creating temporary dispatch:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. POST Quét xuất thực tế (Bước 2: PENDING_OUT -> TEMP_OUT)
router.post('/:dispatchNo/confirm-scan', async (req, res) => {
    try {
        const { dispatchNo } = req.params;
        const { scanned_cartons } = req.body; // Mảng các mã id_60 thực tế quét

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Lock & Check Header
            const checkReq = new sql.Request(transaction);
            const checkRes = await checkReq
                .input('dispatchNo', sql.NVarChar(50), dispatchNo)
                .query(`SELECT status FROM tbl_temporary_dispatch_header WITH (UPDLOCK, HOLDLOCK) WHERE dispatch_no = @dispatchNo`);

            if (checkRes.recordset.length === 0) {
                throw new Error('Phiếu xuất tạm không tồn tại');
            }

            if (checkRes.recordset[0].status !== 'PENDING_OUT') {
                throw new Error(`Phiếu xuất tạm đang ở trạng thái ${checkRes.recordset[0].status}, không thể quét xuất.`);
            }

            // Chuyển stock_type của các thùng 60 sang TEMPORARY_ISSUE
            if (Array.isArray(scanned_cartons) && scanned_cartons.length > 0) {
                for (const cartonId of scanned_cartons) {
                    const updateCartonReq = new sql.Request(transaction);
                    await updateCartonReq
                        .input('cartonId', sql.NVarChar(50), cartonId)
                        .query(`
                            UPDATE tbl_thung60_kho 
                            SET stock_type = 'TEMPORARY_ISSUE' 
                            WHERE id_60 = @cartonId OR current_pack360_id = @cartonId
                        `);
                }
            }

            // Cập nhật trạng thái phiếu header thành TEMP_OUT
            const updateHeaderReq = new sql.Request(transaction);
            await updateHeaderReq
                .input('dispatchNo', sql.NVarChar(50), dispatchNo)
                .query(`UPDATE tbl_temporary_dispatch_header SET status = 'TEMP_OUT' WHERE dispatch_no = @dispatchNo`);

            await transaction.commit();
            res.json({
                success: true,
                message: `Xác nhận xuất tạm thành công cho phiếu ${dispatchNo}!`
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('Error confirming temporary dispatch scan:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. POST Hoàn nhập trả hàng (Bước 3: Return 3 tình huống)
router.post('/:dispatchNo/return', async (req, res) => {
    try {
        const { dispatchNo } = req.params;
        const { return_items } = req.body;
        /*
          return_items: [
             { id_60: 'BOX01', return_condition: 'EXACT', qty: 60 },
             { id_60: 'BOX02', returned_id_60: 'BOX02_NEW', return_condition: 'REPACKED_NEW_BOX', qty: 58 },
             { id_60: 'BOX03', returned_product_code: 'SKU_GRADE_B', return_condition: 'REWORKED_NEW_SKU', qty: 60 }
          ]
        */

        if (!Array.isArray(return_items) || return_items.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm hoàn trả không được trống' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            let totalReturnedQtyInBatch = 0;

            for (const item of return_items) {
                const returnQty = Number(item.qty) || 0;
                totalReturnedQtyInBatch += returnQty;

                // Tình huống A: EXACT
                if (item.return_condition === 'EXACT' || !item.return_condition) {
                    const updateExact = new sql.Request(transaction);
                    await updateExact
                        .input('cartonId', sql.NVarChar(50), item.id_60)
                        .query(`UPDATE tbl_thung60_kho SET stock_type = 'NVB', status = 'AVAILABLE' WHERE id_60 = @cartonId`);
                }
                // Tình huống B: REPACKED_NEW_BOX
                else if (item.return_condition === 'REPACKED_NEW_BOX') {
                    const updateOld = new sql.Request(transaction);
                    await updateOld
                        .input('cartonId', sql.NVarChar(50), item.id_60)
                        .query(`UPDATE tbl_thung60_kho SET status = 'SCRAP' WHERE id_60 = @cartonId`);

                    if (item.returned_id_60) {
                        const insertNew = new sql.Request(transaction);
                        insertNew.input('id_60', sql.NVarChar(50), item.returned_id_60);
                        insertNew.input('product_code', sql.NVarChar(50), item.product_code || 'REPACKED_SKU');
                        insertNew.input('qty', sql.Decimal(18, 4), returnQty);
                        await insertNew.query(`
                            INSERT INTO tbl_thung60_kho (id_60, qr_60, product_code, current_qty, status, stock_type, created_at)
                            VALUES (@id_60, @id_60, @product_code, @qty, 'AVAILABLE', 'NVB', GETDATE())
                        `);
                    }
                }
                // Tình huống C: REWORKED_NEW_SKU
                else if (item.return_condition === 'REWORKED_NEW_SKU') {
                    if (item.returned_product_code) {
                        const updateSku = new sql.Request(transaction);
                        updateSku.input('cartonId', sql.NVarChar(50), item.id_60);
                        updateSku.input('newSku', sql.NVarChar(50), item.returned_product_code);
                        await updateSku.query(`
                            UPDATE tbl_thung60_kho 
                            SET product_code = @newSku, stock_type = 'NVB', status = 'AVAILABLE' 
                            WHERE id_60 = @cartonId
                        `);
                    }
                }

                // Cập nhật trạng thái item trong detail
                const updateDetail = new sql.Request(transaction);
                updateDetail.input('dispatchNo', sql.NVarChar(50), dispatchNo);
                updateDetail.input('id_60', sql.NVarChar(50), item.id_60);
                await updateDetail.query(`
                    UPDATE tbl_temporary_dispatch_detail
                    SET item_status = 'RETURNED', returned_at = GETDATE()
                    WHERE dispatch_no = @dispatchNo AND id_60 = @id_60
                `);
            }

            // Cập nhật returned_qty ở Header & Kiểm tra tất toán
            const updateHeader = new sql.Request(transaction);
            updateHeader.input('dispatchNo', sql.NVarChar(50), dispatchNo);
            updateHeader.input('batchReturned', sql.Decimal(18, 4), totalReturnedQtyInBatch);

            await updateHeader.query(`
                UPDATE tbl_temporary_dispatch_header
                SET returned_qty = ISNULL(returned_qty, 0) + @batchReturned,
                    status = CASE WHEN (ISNULL(returned_qty, 0) + @batchReturned) >= total_qty THEN 'RETURNED' ELSE 'PARTIAL_RETURN' END
                WHERE dispatch_no = @dispatchNo
            `);

            await transaction.commit();
            res.json({
                success: true,
                message: `Hoàn nhập trả hàng thành công cho phiếu ${dispatchNo}!`
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('Error executing temporary dispatch return:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
