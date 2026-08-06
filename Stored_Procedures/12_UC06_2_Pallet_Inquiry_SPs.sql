USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_2_GetPalletInfo
    @PalletId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Result Set 1: Pallet Info
    SELECT pallet_id, pallet_type, status, current_location_code AS current_location, created_at, created_by
    FROM dbo.pallet
    WHERE pallet_id = @PalletId;

    -- 2. Result Set 2: Inventory Summary (Thống kê theo Thùng 60)
    WITH AllCartons AS (
        SELECT t.id_60, t.product_code, t.current_oem_order_no, t.customer_code, 'THUNG60' as original_unit_type
        FROM dbo.pallet_unit pu
        INNER JOIN dbo.tbl_thung60_kho t ON pu.unit_id = t.id_60
        WHERE pu.pallet_id = @PalletId AND pu.is_current = 1 AND pu.unit_type = 'THUNG60'
        
        UNION ALL
        
        SELECT t.id_60, t.product_code, t.current_oem_order_no, t.customer_code, 'PACK360' as original_unit_type
        FROM dbo.pallet_unit pu
        INNER JOIN dbo.pack360_unit pku ON pu.unit_id = pku.pack360_id
        INNER JOIN dbo.tbl_thung60_kho t ON pku.id_60 = t.id_60
        WHERE pu.pallet_id = @PalletId AND pu.is_current = 1 AND pu.unit_type = 'PACK360' AND pku.is_current = 1
    )
    SELECT 
        product_code, 
        current_oem_order_no, 
        customer_code, 
        COUNT(*) AS quantity_thung60
    FROM AllCartons
    GROUP BY product_code, current_oem_order_no, customer_code;

    -- 3. Result Set 3: Unit Details (Chi tiết các mã quét trực tiếp trên Pallet)
    SELECT 
        pu.unit_id, 
        pu.unit_type,
        CASE 
            WHEN pu.unit_type = 'THUNG60' THEN (SELECT product_code FROM dbo.tbl_thung60_kho WHERE id_60 = pu.unit_id)
            WHEN pu.unit_type = 'PACK360' THEN (SELECT TOP 1 t.product_code FROM dbo.pack360_unit pku INNER JOIN dbo.tbl_thung60_kho t ON pku.id_60 = t.id_60 WHERE pku.pack360_id = pu.unit_id)
        END AS sample_product_code
    FROM dbo.pallet_unit pu
    WHERE pu.pallet_id = @PalletId AND pu.is_current = 1;

END;
GO
