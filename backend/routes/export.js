const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// --- UC15: Paste Data ---
router.post('/paste-data', async (req, res) => {
    try {
        const data = req.body; // Expecting an array of { product_code, channel_code, requested_qty }
        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ error: 'Invalid data format. Expected an array of objects.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);
            
            // Generate a unique request_no
            const requestNo = 'REQ-' + Date.now();
            
            // Insert into header
            await request
                .input('request_no', sql.NVarChar, requestNo)
                .input('request_date', sql.Date, new Date())
                .input('imported_by', sql.NVarChar, 'SYSTEM')
                .query(`
                    INSERT INTO export_request_header (request_no, request_date, imported_by) 
                    VALUES (@request_no, @request_date, @imported_by)
                `);

            // Check product validities
            const invalidProducts = [];
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                
                // BR15.4 Validation: check if product_code exists in Master Data view
                const checkReq = new sql.Request(transaction);
                checkReq.input('product_code', sql.NVarChar, item.product_code);
                const checkRes = await checkReq.query(`
                    SELECT TOP 1 MFInvtID FROM [WMS1].[dbo].[vw_WMS_Product] WHERE MFInvtID = @product_code
                `);

                if (checkRes.recordset.length === 0) {
                    invalidProducts.push(item.product_code);
                }
            }

            if (invalidProducts.length > 0) {
                // If there are invalid products, rollback and return the list
                await transaction.rollback();
                return res.status(400).json({ 
                    error: 'Có mã sản phẩm không tồn tại trong hệ thống', 
                    invalidProducts 
                });
            }

            // If all are valid, insert details
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const detailReq = new sql.Request(transaction);
                await detailReq
                    .input('request_no', sql.NVarChar, requestNo)
                    .input('line_no', sql.Int, i + 1)
                    .input('product_code', sql.NVarChar, item.product_code)
                    .input('channel_code', sql.NVarChar, item.channel_code)
                    .input('requested_qty', sql.Decimal(18, 4), item.requested_qty)
                    .query(`
                        INSERT INTO export_request_detail (request_no, line_no, product_code, channel_code, requested_qty) 
                        VALUES (@request_no, @line_no, @product_code, @channel_code, @requested_qty)
                    `);
            }

            await transaction.commit();
            res.json({ success: true, message: 'Data imported successfully', request_no: requestNo });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UC15: Get Requirements with Stock ---
router.get('/requirements', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Group requirements and join with total stock (trả về Nhu cầu ban đầu, Đã phân bổ xe, Nhu cầu còn lại)
        const result = await pool.request().query(`
            SELECT 
                d.product_code, 
                d.channel_code, 
                SUM(d.requested_qty) as original_requested_qty,
                SUM(ISNULL(d.allocated_qty, 0)) as already_allocated_qty,
                SUM(d.requested_qty - ISNULL(d.allocated_qty, 0)) as total_requested_qty,
                (SELECT ISNULL(SUM(current_qty), 0) FROM tbl_thung60_kho t WHERE t.product_code = d.product_code AND t.status = 'AVAILABLE') as total_stock
            FROM export_request_detail d
            JOIN export_request_header h ON d.request_no = h.request_no
            WHERE h.status IN ('NEW', 'PARTIAL')
            GROUP BY d.product_code, d.channel_code
            HAVING SUM(d.requested_qty - ISNULL(d.allocated_qty, 0)) > 0
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UC15: Delete Requirement ---
router.delete('/requirements', async (req, res) => {
    try {
        const { product_code, channel_code } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('product_code', sql.NVarChar, product_code)
            .input('channel_code', sql.NVarChar, channel_code)
            .query(`
                DELETE d FROM export_request_detail d
                JOIN export_request_header h ON d.request_no = h.request_no
                WHERE d.product_code = @product_code AND d.channel_code = @channel_code AND h.status = 'NEW'
            `);
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UC15: Edit Requirement Qty ---
router.put('/requirements', async (req, res) => {
    try {
        const { product_code, channel_code, new_qty } = req.body;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            // Lấy dòng đầu tiên theo request_no và line_no
            const reqFirst = new sql.Request(transaction);
            reqFirst.input('product_code', sql.NVarChar, product_code);
            reqFirst.input('channel_code', sql.NVarChar, channel_code);
            const resFirst = await reqFirst.query(`
                SELECT TOP 1 d.request_no, d.line_no 
                FROM export_request_detail d
                JOIN export_request_header h ON d.request_no = h.request_no
                WHERE d.product_code = @product_code AND d.channel_code = @channel_code AND h.status = 'NEW'
                ORDER BY d.request_no ASC, d.line_no ASC
            `);

            if (resFirst.recordset.length > 0) {
                const firstReqNo = resFirst.recordset[0].request_no;
                const firstLineNo = resFirst.recordset[0].line_no;
                
                // Update dòng đầu
                const reqUpdate = new sql.Request(transaction);
                await reqUpdate
                    .input('request_no', sql.NVarChar, firstReqNo)
                    .input('line_no', sql.Int, firstLineNo)
                    .input('new_qty', sql.Decimal(18, 4), new_qty)
                    .query(`UPDATE export_request_detail SET requested_qty = @new_qty WHERE request_no = @request_no AND line_no = @line_no`);
                
                // Delete các dòng trùng khác
                const reqDelete = new sql.Request(transaction);
                await reqDelete
                    .input('request_no', sql.NVarChar, firstReqNo)
                    .input('line_no', sql.Int, firstLineNo)
                    .input('product_code', sql.NVarChar, product_code)
                    .input('channel_code', sql.NVarChar, channel_code)
                    .query(`
                        DELETE d FROM export_request_detail d
                        JOIN export_request_header h ON d.request_no = h.request_no
                        WHERE d.product_code = @product_code AND d.channel_code = @channel_code AND h.status = 'NEW' 
                          AND (d.request_no <> @request_no OR d.line_no <> @line_no)
                    `);
            }
            await transaction.commit();
            res.json({ success: true, message: 'Updated successfully' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- UC15: Create Delivery Note (Tự động tách Phiếu Xuất riêng theo từng Khách Hàng) ---
router.post('/delivery-notes', async (req, res) => {
    try {
        const { license_plate, driver_id, guard_id, delivery_location, details } = req.body;
        if (!details || details.length === 0) {
            return res.status(400).json({ error: 'Chưa chọn mặt hàng nào để xuất kho.' });
        }

        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const reqTruck = new sql.Request(transaction);
            reqTruck.input('license_plate', sql.NVarChar, license_plate);
            const resTruck = await reqTruck.query('SELECT max_weight_kg FROM tbl_trucks WHERE license_plate = @license_plate');
            if (resTruck.recordset.length === 0) {
                throw new Error('Không tìm thấy xe tải.');
            }
            const maxWeight = resTruck.recordset[0].max_weight_kg;

            let totalWeight = 0;
            for (const item of details) {
                totalWeight += (item.total_weight_kg || 0);
            }

            if (totalWeight > maxWeight) {
                throw new Error(`Tổng trọng lượng (${totalWeight} kg) vượt quá tải trọng của xe (${maxWeight} kg).`);
            }

            // Nhóm chi tiết xuất kho theo từng Khách Hàng để tạo Phiếu Xuất riêng
            const groupedByCustomer = {};
            for (const item of details) {
                const cName = item.customer_name || 'Khách chung';
                if (!groupedByCustomer[cName]) {
                    groupedByCustomer[cName] = [];
                }
                groupedByCustomer[cName].push(item);
            }

            const createdNotes = [];
            const timestampBase = Date.now();
            let noteIdx = 1;

            for (const [custName, custDetails] of Object.entries(groupedByCustomer)) {
                const reqNo = `DN-${timestampBase}-${noteIdx}`;
                noteIdx++;

                const headerReq = new sql.Request(transaction);
                await headerReq
                    .input('delivery_note_no', sql.NVarChar, reqNo)
                    .input('license_plate', sql.NVarChar, license_plate)
                    .input('driver_id', sql.Int, driver_id || 1)
                    .input('guard_id', sql.Int, guard_id || 1)
                    .input('customer_name', sql.NVarChar, custName)
                    .input('delivery_location', sql.NVarChar, delivery_location || 'Kho Nguyễn Văn Báu')
                    .input('created_by', sql.NVarChar, 'SYSTEM')
                    .query(`
                        INSERT INTO delivery_note_header (delivery_note_no, license_plate, driver_id, guard_id, customer_name, delivery_location, status, created_by) 
                        VALUES (@delivery_note_no, @license_plate, @driver_id, @guard_id, @customer_name, @delivery_location, 'PENDING_PICK', @created_by)
                    `);

                let custTotalQty = 0;
                let custTotalWeight = 0;

                for (let i = 0; i < custDetails.length; i++) {
                    const item = custDetails[i];
                    custTotalQty += Number(item.qty || 0);
                    custTotalWeight += Number(item.total_weight_kg || 0);

                    const detailReq = new sql.Request(transaction);
                    await detailReq
                        .input('delivery_note_no', sql.NVarChar, reqNo)
                        .input('line_no', sql.Int, i + 1)
                        .input('customer_name', sql.NVarChar, custName)
                        .input('product_code', sql.NVarChar, item.product_code)
                        .input('channel_code', sql.NVarChar, item.channel_code)
                        .input('qty', sql.Decimal(18, 4), item.qty)
                        .input('box_large', sql.Int, item.box_large || 0)
                        .input('box_small', sql.Int, item.box_small || 0)
                        .input('box_virtual', sql.Int, item.box_virtual || 0)
                        .input('total_weight_kg', sql.Decimal(18, 2), item.total_weight_kg || 0)
                        .query(`
                            INSERT INTO delivery_note_detail (delivery_note_no, line_no, customer_name, product_code, channel_code, qty, box_large, box_small, box_virtual, total_weight_kg) 
                            VALUES (@delivery_note_no, @line_no, @customer_name, @product_code, @channel_code, @qty, @box_large, @box_small, @box_virtual, @total_weight_kg)
                        `);

                    // Cập nhật lũy kế phân bổ theo nguyên tắc FIFO từng dòng nhu cầu (export_request_detail)
                    let remainingToDistribute = Number(item.qty || 0);

                    const reqDetailFetch = new sql.Request(transaction);
                    reqDetailFetch.input('product_code', sql.NVarChar, item.product_code);
                    reqDetailFetch.input('channel_code', sql.NVarChar, item.channel_code);
                    const matchingDetails = await reqDetailFetch.query(`
                        SELECT d.request_no, d.line_no, d.requested_qty, ISNULL(d.allocated_qty, 0) as allocated_qty
                        FROM export_request_detail d
                        JOIN export_request_header h ON d.request_no = h.request_no
                        WHERE d.product_code = @product_code 
                          AND d.channel_code = @channel_code 
                          AND h.status IN ('NEW', 'PARTIAL')
                          AND (d.requested_qty - ISNULL(d.allocated_qty, 0)) > 0
                        ORDER BY d.request_no ASC, d.line_no ASC
                    `);

                    for (const detailRow of matchingDetails.recordset) {
                        if (remainingToDistribute <= 0) break;

                        const unallocatedInRow = Number(detailRow.requested_qty) - Number(detailRow.allocated_qty);
                        const addAllocated = Math.min(remainingToDistribute, unallocatedInRow);
                        const newAllocatedTotal = Number(detailRow.allocated_qty) + addAllocated;
                        const newStatus = (newAllocatedTotal >= Number(detailRow.requested_qty)) ? 'PROCESSED' : 'PARTIAL';

                        const reqUpdateRow = new sql.Request(transaction);
                        await reqUpdateRow
                            .input('request_no', sql.NVarChar, detailRow.request_no)
                            .input('line_no', sql.Int, detailRow.line_no)
                            .input('new_allocated', sql.Decimal(18, 4), newAllocatedTotal)
                            .input('new_status', sql.NVarChar, newStatus)
                            .query(`UPDATE export_request_detail SET allocated_qty = @new_allocated, status = @new_status WHERE request_no = @request_no AND line_no = @line_no`);

                        remainingToDistribute -= addAllocated;
                    }

                    // Cập nhật trạng thái Header export_request_header thành COMPLETED nếu tất cả các dòng đã xuất đủ
                    const reqUpdateHeaders = new sql.Request(transaction);
                    await reqUpdateHeaders.query(`
                        UPDATE h
                        SET h.status = CASE WHEN NOT EXISTS (
                            SELECT 1 FROM export_request_detail d2 WHERE d2.request_no = h.request_no AND ISNULL(d2.status, 'NEW') <> 'PROCESSED'
                        ) THEN 'COMPLETED' ELSE 'PARTIAL' END
                        FROM export_request_header h
                        WHERE h.status IN ('NEW', 'PARTIAL');
                    `);
                }

                createdNotes.push({
                  delivery_note_no: reqNo,
                  customer_name: custName,
                  delivery_location: delivery_location || 'Kho Nguyễn Văn Báu',
                  total_qty: custTotalQty,
                  total_weight_kg: custTotalWeight
                });
            }

            await transaction.commit();
            res.json({ 
              success: true, 
              message: `Đã phát hành thành công ${createdNotes.length} Phiếu Xuất Kho cho ${Object.keys(groupedByCustomer).length} Khách Hàng`, 
              created_notes: createdNotes 
            });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
