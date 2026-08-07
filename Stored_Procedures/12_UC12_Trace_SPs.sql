USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC12_GetUniversalDossier
    @assetCode NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check CARTON_60
    IF EXISTS (SELECT 1 FROM tbl_thung60_kho WITH (NOLOCK) WHERE id_60 = @assetCode OR qr_60 = @assetCode)
    BEGIN
        DECLARE @actualId NVARCHAR(100);
        SELECT @actualId = id_60 FROM tbl_thung60_kho WITH (NOLOCK) WHERE id_60 = @assetCode OR qr_60 = @assetCode;
        
        SELECT 'CARTON_60' AS asset_type;
        SELECT * FROM tbl_thung60_kho WITH (NOLOCK) WHERE id_60 = @actualId;
        SELECT * FROM thung60_split_history WITH (NOLOCK) WHERE source_id_60 = @actualId OR generated_id_60 = @actualId ORDER BY performed_at DESC;
        SELECT * FROM thung60_event WITH (NOLOCK) WHERE id_60 = @actualId ORDER BY performed_at DESC;
        SELECT l.*, t.transaction_type, t.posted_by, t.customer_name
        FROM inventory_ledger l WITH (NOLOCK)
        LEFT JOIN stock_transaction_book t WITH (NOLOCK) ON l.transaction_id = t.transaction_id
        WHERE l.id_60 = @actualId ORDER BY l.posted_at DESC;
        RETURN;
    END

    -- Check PACK_360
    IF EXISTS (SELECT 1 FROM pack360_header WITH (NOLOCK) WHERE pack360_id = @assetCode OR pack360_qr = @assetCode)
    BEGIN
        DECLARE @packId NVARCHAR(100);
        SELECT @packId = pack360_id FROM pack360_header WITH (NOLOCK) WHERE pack360_id = @assetCode OR pack360_qr = @assetCode;
        
        SELECT 'PACK_360' AS asset_type;
        SELECT * FROM pack360_header WITH (NOLOCK) WHERE pack360_id = @packId;
        SELECT u.id_60, u.added_at, u.added_by, t.product_code, t.current_qty, t.status, t.stock_type, t.current_location_code
        FROM pack360_unit u WITH (NOLOCK)
        INNER JOIN tbl_thung60_kho t WITH (NOLOCK) ON u.id_60 = t.id_60
        WHERE u.pack360_id = @packId AND u.is_current = 1;
        SELECT * FROM pack360_event WITH (NOLOCK) WHERE pack360_id = @packId ORDER BY performed_at DESC;
        SELECT l.*, t.transaction_type, t.posted_by, t.customer_name
        FROM inventory_ledger l WITH (NOLOCK)
        LEFT JOIN stock_transaction_book t WITH (NOLOCK) ON l.transaction_id = t.transaction_id
        WHERE l.id_60 IN (SELECT id_60 FROM pack360_unit WITH (NOLOCK) WHERE pack360_id = @packId)
        ORDER BY l.posted_at DESC;
        RETURN;
    END

    -- Check PALLET
    IF EXISTS (SELECT 1 FROM pallet WITH (NOLOCK) WHERE pallet_id = @assetCode)
    BEGIN
        SELECT 'PALLET' AS asset_type;
        SELECT * FROM pallet WITH (NOLOCK) WHERE pallet_id = @assetCode;
        SELECT pu.unit_id, pu.unit_type, pu.attached_at, pu.attached_by,
               t.product_code, t.current_qty, t.status as unit_status, t.stock_type
        FROM pallet_unit pu WITH (NOLOCK)
        LEFT JOIN tbl_thung60_kho t WITH (NOLOCK) ON pu.unit_id = t.id_60 AND pu.unit_type = 'CARTON'
        WHERE pu.pallet_id = @assetCode AND pu.is_current = 1;
        SELECT * FROM pallet_location_history WITH (NOLOCK) WHERE pallet_id = @assetCode ORDER BY placed_at DESC;
        SELECT l.*, t.transaction_type, t.posted_by, t.customer_name
        FROM inventory_ledger l WITH (NOLOCK)
        LEFT JOIN stock_transaction_book t WITH (NOLOCK) ON l.transaction_id = t.transaction_id
        WHERE l.id_60 IN (SELECT unit_id FROM pallet_unit WITH (NOLOCK) WHERE pallet_id = @assetCode AND is_current = 1)
        ORDER BY l.posted_at DESC;
        RETURN;
    END

    SELECT 'NOT_FOUND' AS asset_type;
END;
GO
