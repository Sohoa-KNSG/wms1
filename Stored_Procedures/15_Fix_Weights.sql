USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. Xóa cột gross_weight vừa tạo thừa (nếu có)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.tbl_thung60_kho') AND name = 'gross_weight')
BEGIN
    DECLARE @ConstraintName nvarchar(200)
    SELECT @ConstraintName = Name FROM sys.default_constraints WHERE PARENT_OBJECT_ID = OBJECT_ID('dbo.tbl_thung60_kho') AND PARENT_COLUMN_ID = (SELECT column_id FROM sys.columns WHERE NAME = N'gross_weight' AND object_id = OBJECT_ID(N'dbo.tbl_thung60_kho'))
    IF @ConstraintName IS NOT NULL
        EXEC('ALTER TABLE dbo.tbl_thung60_kho DROP CONSTRAINT ' + @ConstraintName)
    ALTER TABLE dbo.tbl_thung60_kho DROP COLUMN gross_weight
END
GO

-- 2. Cập nhật SP GetPalletInfo để lấy trọng lượng từ DB Packaging
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_2_GetPalletInfo
    @PalletId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Tính tổng trọng lượng hàng
    DECLARE @TotalGrossWeight DECIMAL(18,2) = 0;
    
    WITH AllCartons AS (
        SELECT t.id_60
        FROM dbo.pallet_unit pu
        INNER JOIN dbo.tbl_thung60_kho t ON pu.unit_id = t.id_60
        WHERE pu.pallet_id = @PalletId AND pu.is_current = 1 AND pu.unit_type = 'THUNG60'
        
        UNION ALL
        
        SELECT t.id_60
        FROM dbo.pallet_unit pu
        INNER JOIN dbo.pack360_unit pku ON pu.unit_id = pku.pack360_id
        INNER JOIN dbo.tbl_thung60_kho t ON pku.id_60 = t.id_60
        WHERE pu.pallet_id = @PalletId AND pu.is_current = 1 AND pu.unit_type = 'PACK360' AND pku.is_current = 1
    )
    SELECT @TotalGrossWeight = ISNULL(SUM(CAST(ISNULL(pkg.trong_luong, 0) AS DECIMAL(18,2))), 0)
    FROM AllCartons a
    LEFT JOIN [Packaging].[dbo].[tbl_thung60] pkg ON a.id_60 = pkg.id_60;

    -- 1. Result Set 1: Pallet Info
    SELECT 
        pallet_id, 
        pallet_type, 
        status, 
        current_location_code AS current_location, 
        tare_weight,
        @TotalGrossWeight AS total_gross_weight,
        (tare_weight + @TotalGrossWeight) AS total_weight,
        created_at, 
        created_by
    FROM dbo.pallet
    WHERE pallet_id = @PalletId;

    -- 2. Result Set 2: Inventory Summary
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

    -- 3. Result Set 3: Unit Details
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
