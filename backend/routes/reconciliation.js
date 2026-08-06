const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { poolPromise } = require('../db');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

// GET /api/v1/reconciliation/transactions/:id - Đối soát sổ đơn vị vs sổ sản phẩm cho 1 giao dịch
router.get('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const txnRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .query('SELECT * FROM stock_transaction_book WHERE transaction_id = @id');

        if (txnRes.recordset.length === 0) {
            return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy giao dịch.' });
        }

        const invRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(`
                SELECT product_code, SUM(quantity_change) as total_inv_change
                FROM inventory_ledger
                WHERE transaction_id = @id
                GROUP BY product_code
            `);

        const itemRes = await pool.request()
            .input('id', sql.NVarChar, id)
            .query(`
                SELECT product_code, SUM(total_quantity_change) as total_item_change
                FROM item_ledger
                WHERE transaction_id = @id
                GROUP BY product_code
            `);

        // Group & Compare
        const comparisonMap = {};

        invRes.recordset.forEach(r => {
            comparisonMap[r.product_code] = {
                product_code: r.product_code,
                unit_ledger_change: r.total_inv_change,
                item_ledger_change: 0,
                discrepancy: r.total_inv_change
            };
        });

        itemRes.recordset.forEach(r => {
            if (!comparisonMap[r.product_code]) {
                comparisonMap[r.product_code] = {
                    product_code: r.product_code,
                    unit_ledger_change: 0,
                    item_ledger_change: r.total_item_change,
                    discrepancy: -r.total_item_change
                };
            } else {
                comparisonMap[r.product_code].item_ledger_change = r.total_item_change;
                comparisonMap[r.product_code].discrepancy = 
                    comparisonMap[r.product_code].unit_ledger_change - r.total_item_change;
            }
        });

        const rows = Object.values(comparisonMap);
        const isBalanced = rows.every(r => Math.abs(r.discrepancy) < 0.0001);

        res.json({
            status: 'SUCCESS',
            transaction: txnRes.recordset[0],
            is_balanced: isBalanced,
            comparison: rows
        });

    } catch (err) {
        console.error('Error in /reconciliation/transactions:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

// GET /api/v1/reconciliation/inventory - Đối soát Tồn thực tế vs Sổ cái
router.get('/inventory', async (req, res) => {
    try {
        const pool = await poolPromise;

        // 1. Tồn thực tế On-Hand hiện tại (tất cả các trạng thái còn nằm trong kho, chưa xuất bến - REC-P1-03)
        const physicalRes = await pool.request().query(`
            SELECT product_code, SUM(current_qty) as physical_stock, COUNT(id_60) as total_boxes
            FROM tbl_thung60_kho
            WHERE status IN ('AVAILABLE', 'BLOCKED', 'ALLOCATED', 'PICKED', 'STAGED', 'PALLETIZED', 'PACKED')
            GROUP BY product_code
        `);

        // 2. Lũy kế Sổ cái
        const ledgerRes = await pool.request().query(`
            SELECT product_code, SUM(total_quantity_change) as ledger_projected_stock
            FROM item_ledger
            GROUP BY product_code
        `);

        const map = {};

        physicalRes.recordset.forEach(r => {
            map[r.product_code] = {
                product_code: r.product_code,
                physical_stock: r.physical_stock,
                total_boxes: r.total_boxes,
                ledger_projected_stock: 0,
                discrepancy: r.physical_stock
            };
        });

        ledgerRes.recordset.forEach(r => {
            if (!map[r.product_code]) {
                map[r.product_code] = {
                    product_code: r.product_code,
                    physical_stock: 0,
                    total_boxes: 0,
                    ledger_projected_stock: r.ledger_projected_stock,
                    discrepancy: -r.ledger_projected_stock
                };
            } else {
                map[r.product_code].ledger_projected_stock = r.ledger_projected_stock;
                map[r.product_code].discrepancy = map[r.product_code].physical_stock - r.ledger_projected_stock;
            }
        });

        const comparison = Object.values(map);
        const hasDiscrepancy = comparison.some(r => Math.abs(r.discrepancy) > 0.0001);

        res.json({
            status: 'SUCCESS',
            is_sync: !hasDiscrepancy,
            comparison
        });

    } catch (err) {
        console.error('Error in /reconciliation/inventory:', err);
        res.status(500).json({ status: 'ERROR', message: err.message });
    }
});

module.exports = router;
