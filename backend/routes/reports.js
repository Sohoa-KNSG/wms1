const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const { poolPromise } = require('../db');

// GET /api/v1/reports/inventory/macro
// Báo cáo tồn kho tổng hợp (SKU Level)
router.get('/inventory/macro', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `
            SELECT 
                product_code, 
                customer_code, 
                current_oem_order_no, 
                status, 
                stock_type, 
                SUM(current_qty) AS total_qty,
                SUM(CASE WHEN is_virtual = 1 THEN 1 ELSE 0 END) AS count_thung_ao,
                SUM(CASE WHEN is_virtual = 0 AND current_pack360_id IS NULL THEN 1 ELSE 0 END) AS count_thung_60_roi,
                COUNT(DISTINCT current_pack360_id) AS count_kien_360
            FROM tbl_thung60_kho WITH (NOLOCK)
            WHERE status != 'DISPATCHED'
        `;
        
        const params = [];
        const request = pool.request();
        
        if (req.query.search) {
            query += ` AND product_code LIKE @search `;
            request.input('search', `%${req.query.search}%`);
        }
        
        query += `
            GROUP BY product_code, customer_code, current_oem_order_no, status, stock_type
            ORDER BY product_code;
        `;
        
        const result = await request.query(query);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching macro inventory report:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

// GET /api/v1/reports/inventory/micro
// Báo cáo tồn kho chi tiết (Carton Level)
router.get('/inventory/micro', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        let query = `
            SELECT 
                COALESCE(t.current_pack360_id, t.id_60) AS package_id,
                CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END AS package_type,
                t.product_code, 
                SUM(t.current_qty) AS current_qty, 
                MAX(t.uom) AS uom,
                MAX(t.status) AS status, 
                MAX(t.stock_type) AS stock_type, 
                MAX(CAST(t.is_virtual AS INT)) AS is_virtual,
                MAX(t.current_location_code) AS current_location_code, 
                MAX(t.customer_code) AS customer_code, 
                MAX(t.current_oem_order_no) AS current_oem_order_no
            FROM tbl_thung60_kho t WITH (NOLOCK)
            WHERE t.status != 'DISPATCHED'
        `;
        
        const request = pool.request();
        
        if (req.query.search) {
            query += ` AND (t.product_code LIKE @search OR t.id_60 LIKE @search OR t.current_pack360_id LIKE @search)`;
            request.input('search', `%${req.query.search}%`);
        }
        if (req.query.product_code) {
            query += ` AND t.product_code = @product_code`;
            request.input('product_code', req.query.product_code);
        }
        if (req.query.status) {
            query += ` AND t.status = @status`;
            request.input('status', req.query.status);
        }
        if (req.query.stock_type) {
            query += ` AND t.stock_type = @stock_type`;
            request.input('stock_type', req.query.stock_type);
        }
        
        query += ` 
            GROUP BY 
                COALESCE(t.current_pack360_id, t.id_60),
                CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END,
                t.product_code
            ORDER BY package_type, package_id;
        `;
        
        const result = await request.query(query);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching micro inventory report:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});
// GET /api/v1/reports/inventory/location
// Báo cáo tồn kho theo vị trí
router.get('/inventory/location', async (req, res) => {
    try {
        const pool = await poolPromise;
        let query = `
            SELECT 
                COALESCE(current_location_code, 'CHƯA LÊN KỆ') AS current_location_code,
                product_code, 
                customer_code, 
                current_oem_order_no, 
                status, 
                stock_type, 
                SUM(current_qty) AS total_qty
            FROM tbl_thung60_kho WITH (NOLOCK)
            WHERE status != 'DISPATCHED'
        `;
        
        const request = pool.request();
        
        if (req.query.search) {
            query += ` AND (current_location_code LIKE @search OR product_code LIKE @search) `;
            request.input('search', `%${req.query.search}%`);
        }
        if (req.query.product_code) {
            query += ` AND product_code = @product_code `;
            request.input('product_code', req.query.product_code);
        }
        
        query += `
            GROUP BY 
                current_location_code, product_code, customer_code, current_oem_order_no, status, stock_type
            ORDER BY current_location_code, product_code;
        `;
        
        const result = await request.query(query);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching location inventory report:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

// GET /api/v1/reports/inventory/export
// Xuất báo cáo tồn kho ra Excel
router.get('/inventory/export', async (req, res) => {
    try {
        const pool = await poolPromise;
        const view = req.query.view || 'macro'; // 'macro' or 'micro' or 'location'
        const search = req.query.search;
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'WMS System';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet('Inventory Report');
        
        const request = pool.request();
        let query = '';

        if (view === 'macro') {
            worksheet.columns = [
                { header: 'SKU', key: 'product_code', width: 20 },
                { header: 'Khách Hàng', key: 'customer_code', width: 20 },
                { header: 'Đơn Hàng', key: 'current_oem_order_no', width: 25 },
                { header: 'Status', key: 'status', width: 15 },
                { header: 'Type', key: 'stock_type', width: 15 },
                { header: 'Tổng SL', key: 'total_qty', width: 15 },
                { header: 'Thùng Ảo', key: 'count_thung_ao', width: 15 },
                { header: 'Thùng Lẻ', key: 'count_thung_60_roi', width: 15 },
                { header: 'Kiện 360', key: 'count_kien_360', width: 15 }
            ];

            query = `
                SELECT 
                    product_code, 
                    customer_code, 
                    current_oem_order_no,
                    status, 
                    stock_type, 
                    SUM(current_qty) AS total_qty,
                    SUM(CASE WHEN is_virtual = 1 THEN 1 ELSE 0 END) AS count_thung_ao,
                    SUM(CASE WHEN is_virtual = 0 AND current_pack360_id IS NULL THEN 1 ELSE 0 END) AS count_thung_60_roi,
                    COUNT(DISTINCT current_pack360_id) AS count_kien_360
                FROM tbl_thung60_kho WITH (NOLOCK)
                WHERE status != 'DISPATCHED'
            `;
            if (search) {
                query += ` AND product_code LIKE @search `;
                request.input('search', `%${search}%`);
            }
            query += ` GROUP BY product_code, customer_code, current_oem_order_no, status, stock_type ORDER BY product_code; `;
        } else {
            worksheet.columns = [
                { header: 'Mã Kiện (ID)', key: 'package_id', width: 25 },
                { header: 'Loại Kiện', key: 'package_type', width: 15 },
                { header: 'SKU', key: 'product_code', width: 20 },
                { header: 'Kệ', key: 'current_location_code', width: 15 },
                { header: 'Khách Hàng', key: 'customer_code', width: 20 },
                { header: 'Đơn Hàng', key: 'current_oem_order_no', width: 25 }
            ];

            query = `
                SELECT 
                    COALESCE(t.current_pack360_id, t.id_60) AS package_id,
                    CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END AS package_type,
                    t.product_code, 
                    SUM(t.current_qty) AS current_qty, 
                    MAX(t.uom) AS uom,
                    MAX(t.status) AS status, 
                    MAX(t.stock_type) AS stock_type, 
                    MAX(CAST(t.is_virtual AS INT)) AS is_virtual,
                    MAX(t.current_location_code) AS current_location_code, 
                    MAX(t.customer_code) AS customer_code, 
                    MAX(t.current_oem_order_no) AS current_oem_order_no
                FROM tbl_thung60_kho t WITH (NOLOCK)
                WHERE t.status != 'DISPATCHED'
            `;
            if (search) {
                query += ` AND (t.id_60 LIKE @search OR t.current_pack360_id LIKE @search OR t.product_code LIKE @search) `;
                request.input('search', `%${search}%`);
            }
            if (req.query.product_code) {
                query += ` AND t.product_code = @pcode `;
                request.input('pcode', req.query.product_code);
            }
            if (req.query.status) {
                query += ` AND t.status = @stt `;
                request.input('stt', req.query.status);
            }
            if (req.query.stock_type) {
                query += ` AND t.stock_type = @stype `;
                request.input('stype', req.query.stock_type);
            }
            query += `
                GROUP BY 
                    COALESCE(t.current_pack360_id, t.id_60),
                    CASE WHEN t.current_pack360_id IS NOT NULL THEN 'THÙNG 360' ELSE 'THÙNG 60' END,
                    t.product_code
                ORDER BY package_type, package_id;
            `;
        }

        const result = await request.query(query);
        worksheet.addRows(result.recordset);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + `Inventory_Report_${view}_${new Date().getTime()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error exporting report:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

// GET /api/v1/reports/smart/abc-xyz (UC22.3)
router.get('/smart/abc-xyz', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM vw_WMS_UC22_3_ABC_XYZ_Analysis ORDER BY abc_xyz_category, dispatch_frequency DESC');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching ABC/XYZ report:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/v1/reports/smart/heatmap (UC22.3)
router.get('/smart/heatmap', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_WMS_UC22_3_GetWarehouseHeatmap');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching Heatmap data:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/v1/reports/smart/picking-kpi (UC22.4)
router.get('/smart/picking-kpi', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_WMS_UC22_4_GetPickingPerformanceKPI');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching Picking KPI report:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/v1/reports/smart/aging (UC22.5)
router.get('/smart/aging', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_WMS_UC22_5_GetStockAgingPrediction');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching Stock Aging report:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/v1/reports/smart/reconciliation (UC22.6)
router.get('/smart/reconciliation', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().execute('usp_WMS_UC22_6_ReconcilePhysicalVsLedger');
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Error fetching Reconciliation report:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
