-- ============================================================================
-- SCRIPT TẠO STORED PROCEDURES & VIEWS BÁO CÁO THÔNG MINH (UC22.1 - UC22.6)
-- Database: WMS1
-- Server: 10.17.16.106
-- ============================================================================

USE WMS1;
GO

-- 1. UC22.3: VIEW Phân Loại Tồn Kho ABC / XYZ
IF OBJECT_ID('vw_WMS_UC22_3_ABC_XYZ_Analysis', 'V') IS NOT NULL
    DROP VIEW vw_WMS_UC22_3_ABC_XYZ_Analysis;
GO

CREATE VIEW vw_WMS_UC22_3_ABC_XYZ_Analysis AS
WITH ProductStats AS (
    SELECT 
        t.product_code,
        SUM(t.current_qty) AS current_stock_qty,
        COUNT(t.id_60) AS total_boxes,
        ISNULL(SUM(d.qty), 0) AS total_dispatched_qty,
        COUNT(DISTINCT d.delivery_note_no) AS dispatch_frequency
    FROM tbl_thung60_kho t WITH (NOLOCK)
    LEFT JOIN delivery_note_detail d WITH (NOLOCK) ON t.product_code = d.product_code
    WHERE t.status != 'DISPATCHED'
    GROUP BY t.product_code
),
RankedProducts AS (
    SELECT 
        product_code,
        current_stock_qty,
        total_boxes,
        total_dispatched_qty,
        dispatch_frequency,
        PERCENT_RANK() OVER (ORDER BY dispatch_frequency DESC, total_dispatched_qty DESC) AS abc_rank,
        CASE 
            WHEN dispatch_frequency >= 10 THEN 'X' -- Nhu cầu ổn định, xuất thường xuyên
            WHEN dispatch_frequency BETWEEN 3 AND 9 THEN 'Y' -- Nhu cầu biến động trung bình
            ELSE 'Z' -- Nhu cầu bất thường / xuất rất ít
        END AS xyz_class
    FROM ProductStats
)
SELECT 
    product_code,
    current_stock_qty,
    total_boxes,
    total_dispatched_qty,
    dispatch_frequency,
    CASE 
        WHEN abc_rank <= 0.20 THEN 'A' -- 20% mặt hàng xuất nhiều nhất (80% sản lượng)
        WHEN abc_rank <= 0.50 THEN 'B' -- 30% mặt hàng xuất trung bình (15% sản lượng)
        ELSE 'C' -- 50% mặt hàng xuất ít nhất (5% sản lượng)
    END AS abc_class,
    xyz_class,
    (CASE 
        WHEN abc_rank <= 0.20 THEN 'A' 
        WHEN abc_rank <= 0.50 THEN 'B' 
        ELSE 'C' 
    END) + xyz_class AS abc_xyz_category
FROM RankedProducts;
GO

-- 2. UC22.3: Stored Procedure Lấy Bản Đồ Nhiệt Vị Trí Kho (Warehouse Heatmap)
IF OBJECT_ID('usp_WMS_UC22_3_GetWarehouseHeatmap', 'P') IS NOT NULL
    DROP PROCEDURE usp_WMS_UC22_3_GetWarehouseHeatmap;
GO

CREATE PROCEDURE usp_WMS_UC22_3_GetWarehouseHeatmap
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COALESCE(t.current_location_code, N'CHƯA LÊN KỆ') AS location_code,
        COUNT(t.id_60) AS total_cartons,
        SUM(t.current_qty) AS total_qty,
        COUNT(DISTINCT t.product_code) AS distinct_skus,
        MAX(abc.abc_class) AS primary_abc_class,
        CASE 
            WHEN COUNT(t.id_60) >= 50 THEN N'VERY_HIGH'
            WHEN COUNT(t.id_60) BETWEEN 20 AND 49 THEN N'HIGH'
            WHEN COUNT(t.id_60) BETWEEN 5 AND 19 THEN N'MEDIUM'
            ELSE N'LOW'
        END AS heat_level
    FROM tbl_thung60_kho t WITH (NOLOCK)
    LEFT JOIN vw_WMS_UC22_3_ABC_XYZ_Analysis abc ON t.product_code = abc.product_code
    WHERE t.status != 'DISPATCHED'
    GROUP BY COALESCE(t.current_location_code, N'CHƯA LÊN KỆ')
    ORDER BY total_cartons DESC;
END;
GO

-- 3. UC22.4: Stored Procedure Phân Tích Hiệu Suất Soạn Hàng (Picking KPI)
IF OBJECT_ID('usp_WMS_UC22_4_GetPickingPerformanceKPI', 'P') IS NOT NULL
    DROP PROCEDURE usp_WMS_UC22_4_GetPickingPerformanceKPI;
GO

CREATE PROCEDURE usp_WMS_UC22_4_GetPickingPerformanceKPI
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        h.delivery_note_no,
        h.customer_name,
        h.license_plate,
        h.status,
        h.created_at,
        h.approved_at,
        h.security_checked_at,
        ISNULL(DATEDIFF(MINUTE, h.created_at, h.approved_at), 0) AS picking_duration_minutes,
        ISNULL(DATEDIFF(MINUTE, h.approved_at, h.security_checked_at), 0) AS staging_to_gate_minutes,
        (SELECT COUNT(*) FROM delivery_note_detail d WHERE d.delivery_note_no = h.delivery_note_no) AS total_lines,
        (SELECT ISNULL(SUM(d.qty), 0) FROM delivery_note_detail d WHERE d.delivery_note_no = h.delivery_note_no) AS total_requested_qty,
        (SELECT ISNULL(SUM(b.qty), 0) FROM delivery_note_barcode b WHERE b.delivery_note_no = h.delivery_note_no) AS total_scanned_qty
    FROM delivery_note_header h WITH (NOLOCK)
    ORDER BY h.created_at DESC;
END;
GO

-- 4. UC22.5: Stored Procedure Báo Cáo Tuổi Hàng & Dự Báo Chậm Luân Chuyển (Aging & Deadstock Prediction)
IF OBJECT_ID('usp_WMS_UC22_5_GetStockAgingPrediction', 'P') IS NOT NULL
    DROP PROCEDURE usp_WMS_UC22_5_GetStockAgingPrediction;
GO

CREATE PROCEDURE usp_WMS_UC22_5_GetStockAgingPrediction
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.product_code,
        COUNT(t.id_60) AS total_boxes,
        SUM(t.current_qty) AS current_qty,
        MIN(t.created_at) AS oldest_carton_date,
        DATEDIFF(DAY, MIN(t.created_at), GETDATE()) AS max_aging_days,
        AVG(DATEDIFF(DAY, t.created_at, GETDATE())) AS avg_aging_days,
        CASE 
            WHEN DATEDIFF(DAY, MIN(t.created_at), GETDATE()) > 180 THEN N'CRITICAL_SLOW' -- Hàng chết / Tồn > 6 tháng
            WHEN DATEDIFF(DAY, MIN(t.created_at), GETDATE()) BETWEEN 90 AND 180 THEN N'WARNING_SLOW' -- Hàng cảnh báo chậm / Tồn 3-6 tháng
            WHEN DATEDIFF(DAY, MIN(t.created_at), GETDATE()) BETWEEN 30 AND 89 THEN N'MODERATE' -- Tồn 1-3 tháng
            ELSE N'FAST_MOVING' -- Hàng mới / Luân chuyển nhanh < 30 ngày
        END AS aging_category
    FROM tbl_thung60_kho t WITH (NOLOCK)
    WHERE t.status != 'DISPATCHED'
    GROUP BY t.product_code
    ORDER BY max_aging_days DESC;
END;
GO

-- 5. UC22.6: Stored Procedure Đối Soát Chênh Lệch Thùng Thật Vs Sổ Cái (Reconciliation)
IF OBJECT_ID('usp_WMS_UC22_6_ReconcilePhysicalVsLedger', 'P') IS NOT NULL
    DROP PROCEDURE usp_WMS_UC22_6_ReconcilePhysicalVsLedger;
GO

CREATE PROCEDURE usp_WMS_UC22_6_ReconcilePhysicalVsLedger
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH PhysicalStock AS (
        SELECT 
            product_code,
            SUM(current_qty) AS physical_qty,
            COUNT(id_60) AS physical_cartons
        FROM tbl_thung60_kho WITH (NOLOCK)
        WHERE status != 'DISPATCHED'
        GROUP BY product_code
    ),
    LedgerStock AS (
        SELECT 
            product_code,
            SUM(quantity_change) AS ledger_qty
        FROM inventory_ledger WITH (NOLOCK)
        GROUP BY product_code
    )
    SELECT 
        COALESCE(p.product_code, l.product_code) AS product_code,
        ISNULL(p.physical_qty, 0) AS physical_qty,
        ISNULL(p.physical_cartons, 0) AS physical_cartons,
        ISNULL(l.ledger_qty, ISNULL(p.physical_qty, 0)) AS ledger_qty,
        (ISNULL(p.physical_qty, 0) - ISNULL(l.ledger_qty, ISNULL(p.physical_qty, 0))) AS variance_qty,
        CASE 
            WHEN (ISNULL(p.physical_qty, 0) - ISNULL(l.ledger_qty, ISNULL(p.physical_qty, 0))) = 0 THEN N'MATCHED'
            ELSE N'DISCREPANCY'
        END AS recon_status
    FROM PhysicalStock p
    FULL OUTER JOIN LedgerStock l ON p.product_code = l.product_code
    ORDER BY ABS(ISNULL(p.physical_qty, 0) - ISNULL(l.ledger_qty, ISNULL(p.physical_qty, 0))) DESC;
END;
GO
