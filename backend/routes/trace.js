const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/v1/trace/units/:id60 - Unified Single Timeline Traceability (REC-P1-01)
router.get('/units/:id60', async (req, res) => {
    try {
        const { id60 } = req.params;
        const pool = await poolPromise;

        // 1. Snapshot hiện tại
        const snapshotRes = await pool.request()
            .input('id', sql.NVarChar, id60)
            .query(`
                SELECT * FROM tbl_thung60_kho 
                WHERE id_60 = @id OR qr_60 = @id
            `);

        if (snapshotRes.recordset.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy Thùng 60.' });
        }
        const snapshot = snapshotRes.recordset[0];
        const actualId = snapshot.id_60;

        // 2. Query all event streams
        const eventsRes = await pool.request().input('id', sql.NVarChar, actualId)
            .query('SELECT * FROM thung60_event WHERE id_60 = @id');

        const splitRes = await pool.request().input('id', sql.NVarChar, actualId)
            .query('SELECT * FROM thung60_split_history WHERE source_id_60 = @id OR generated_id_60 = @id');

        const packHistoryRes = await pool.request().input('id', sql.NVarChar, actualId)
            .query(`
                SELECT h.*, p.pack360_qr, p.status as pack_status
                FROM pack360_unit_history h
                LEFT JOIN pack360_header p ON h.pack360_id = p.pack360_id
                WHERE h.id_60 = @id
            `);

        const ledgerRes = await pool.request().input('id', sql.NVarChar, actualId)
            .query(`
                SELECT l.*, t.transaction_type, t.posted_by
                FROM inventory_ledger l
                LEFT JOIN stock_transaction_book t ON l.transaction_id = t.transaction_id
                WHERE l.id_60 = @id
            `);

        // 3. Build Unified Timeline Array (REC-P1-01)
        const timeline = [];

        eventsRes.recordset.forEach(e => {
            timeline.push({
                occurred_at: e.performed_at,
                category: 'DOMAIN_EVENT',
                event_type: e.event_type,
                document_no: e.source_document_no,
                actor: e.performed_by,
                before_state: e.old_status || e.old_stock_type,
                after_state: e.new_status || e.new_stock_type,
                request_id: e.request_id,
                details: e.message || null
            });
        });

        splitRes.recordset.forEach(s => {
            timeline.push({
                occurred_at: s.performed_at,
                category: 'SPLIT_LINEAGE',
                event_type: s.source_id_60 === actualId ? 'SPLIT_SOURCE' : 'SPLIT_GENERATED',
                document_no: s.issue_no || null,
                actor: s.performed_by,
                before_state: `Qty: ${s.source_qty_before}`,
                after_state: `SplitQty: ${s.split_qty}, Remaining: ${s.source_qty_after}`,
                request_id: s.request_id,
                details: `Source: ${s.source_id_60} -> Generated: ${s.generated_id_60}`
            });
        });

        packHistoryRes.recordset.forEach(p => {
            timeline.push({
                occurred_at: p.added_at,
                category: 'PACK360_JOIN',
                event_type: 'JOIN_PACK',
                document_no: p.pack360_id,
                actor: p.added_by,
                before_state: 'STANDALONE',
                after_state: `IN_PACK (${p.pack360_id})`,
                request_id: p.request_id,
                details: `Pack QR: ${p.pack360_qr || p.pack360_id}`
            });

            if (p.removed_at) {
                timeline.push({
                    occurred_at: p.removed_at,
                    category: 'PACK360_LEAVE',
                    event_type: 'LEAVE_PACK',
                    document_no: p.pack360_id,
                    actor: p.removed_by || 'SYSTEM',
                    before_state: `IN_PACK (${p.pack360_id})`,
                    after_state: 'STANDALONE',
                    request_id: p.remove_event_id || p.request_id,
                    details: `Reason: ${p.reason || 'REMOVED'}`
                });
            }
        });

        ledgerRes.recordset.forEach(l => {
            timeline.push({
                occurred_at: l.created_at || l.ledger_date,
                category: 'INVENTORY_LEDGER',
                event_type: l.transaction_type || 'LEDGER_POSTING',
                document_no: l.source_document_no,
                actor: l.posted_by || 'SYSTEM',
                before_state: l.old_stock_type,
                after_state: l.new_stock_type,
                request_id: l.transaction_id,
                details: `Quantity Change: ${l.quantity_change}`
            });
        });

        // Sort unified timeline by timestamp ascending
        timeline.sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at));

        res.json({
            status: 'SUCCESS',
            data: {
                snapshot,
                unified_timeline: timeline
            }
        });

    } catch (err) {
        console.error('Error in /trace/units:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// GET /api/v1/trace/packs/:pack360Id - Truy vết Kiện 360 & thành viên
router.get('/packs/:pack360Id', async (req, res) => {
    try {
        const { pack360Id } = req.params;
        const pool = await poolPromise;

        const headerRes = await pool.request()
            .input('id', sql.NVarChar, pack360Id)
            .query(`
                SELECT * FROM pack360_header 
                WHERE pack360_id = @id OR pack360_qr = @id
            `);

        if (headerRes.recordset.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy Kiện Pack360.' });
        }
        const packHeader = headerRes.recordset[0];
        const actualPackId = packHeader.pack360_id;

        const currentUnitsRes = await pool.request()
            .input('packId', sql.NVarChar, actualPackId)
            .query(`
                SELECT u.id_60, u.added_at, u.added_by, t.qr_60, t.product_code, t.current_qty, t.status
                FROM pack360_unit u
                INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
                WHERE u.pack360_id = @packId AND u.is_current = 1
            `);

        const unitHistoryRes = await pool.request()
            .input('packId', sql.NVarChar, actualPackId)
            .query(`
                SELECT * FROM pack360_unit_history 
                WHERE pack360_id = @packId 
                ORDER BY added_at ASC
            `);

        const eventsRes = await pool.request()
            .input('packId', sql.NVarChar, actualPackId)
            .query(`
                SELECT * FROM pack360_event 
                WHERE pack360_id = @packId 
                ORDER BY performed_at ASC
            `);

        res.json({
            status: 'SUCCESS',
            data: {
                header: packHeader,
                current_units: currentUnitsRes.recordset,
                unit_history: unitHistoryRes.recordset,
                events: eventsRes.recordset
            }
        });

    } catch (err) {
        console.error('Error in /trace/packs:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// GET /api/v1/trace/orders/:orderNo - Truy vết Đơn hàng OEM Lịch sử (REC-P1-02)
router.get('/orders/:orderNo', async (req, res) => {
    try {
        const { orderNo } = req.params;
        const pool = await poolPromise;

        // Current & Historical Units
        const unitsRes = await pool.request()
            .input('orderNo', sql.NVarChar, orderNo)
            .query(`
                SELECT DISTINCT t.id_60, t.qr_60, t.product_code, t.current_qty, t.status, t.stock_type, t.current_location_code, t.current_oem_order_no
                FROM tbl_thung60_kho t
                LEFT JOIN WMS_UC03_ScanLog s ON t.id_60 = s.MaThung60
                WHERE t.current_oem_order_no = @orderNo OR s.MaDonHang = @orderNo
            `);

        const packsRes = await pool.request()
            .input('orderNo', sql.NVarChar, orderNo)
            .query(`
                SELECT pack360_id, pack360_qr, status, actual_unit_count, weight, created_at
                FROM pack360_header 
                WHERE oem_order_no = @orderNo
            `);

        res.json({
            status: 'SUCCESS',
            data: {
                order_no: orderNo,
                total_units: unitsRes.recordset.length,
                total_packs: packsRes.recordset.length,
                units: unitsRes.recordset,
                packs: packsRes.recordset
            }
        });

    } catch (err) {
        console.error('Error in /trace/orders:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// GET /api/v1/trace/documents/:type/:no - Truy vết Chứng từ
router.get('/documents/:type/:no', async (req, res) => {
    try {
        const { type, no } = req.params;
        const pool = await poolPromise;
        const upperType = type.toUpperCase();

        let header = null;
        let details = [];
        let ledgers = [];

        if (upperType === 'DISPATCH' || upperType === 'OUTBOUND') {
            const headerRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM delivery_note_header WHERE delivery_note_no = @no');
            header = headerRes.recordset[0] || null;

            const detailRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM delivery_note_detail WHERE delivery_note_no = @no');
            details = detailRes.recordset;

            const ledgerRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM inventory_ledger WHERE source_document_no = @no');
            ledgers = ledgerRes.recordset;
        } else {
            const headerRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM receipt_session_header WHERE receipt_session_no = @no');
            header = headerRes.recordset[0] || null;

            const detailRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM receipt_session_detail WHERE receipt_session_no = @no');
            details = detailRes.recordset;

            const ledgerRes = await pool.request().input('no', sql.NVarChar, no)
                .query('SELECT * FROM inventory_ledger WHERE source_document_no = @no');
            ledgers = ledgerRes.recordset;
        }

        if (!header) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy chứng từ.' });
        }

        res.json({
            status: 'SUCCESS',
            data: {
                document_type: upperType,
                document_no: no,
                header,
                details,
                ledgers
            }
        });

    } catch (err) {
        console.error('Error in /trace/documents:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

module.exports = router;
