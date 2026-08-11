CREATE OR ALTER PROCEDURE usp_wms_migrate_initial_inventory
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @TransactionID UNIQUEIDENTIFIER = NEWID();
    DECLARE @LogDate DATETIME = GETUTCDATE();

    BEGIN TRY
        BEGIN TRANSACTION;

        IF EXISTS (
            SELECT 1
            FROM [WMS1].[dbo].[stock_transaction_book] WITH (UPDLOCK, HOLDLOCK)
            WHERE transaction_type = 'INITIAL_BALANCE'
              AND document_no = 'MIG_001'
        )
        BEGIN
            COMMIT TRANSACTION;
            SELECT 'SUCCESS' AS status, 'MIG_001' AS document_no, 1 AS already_processed;
            RETURN;
        END

        -- 1. Lọc và chuẩn bị dữ liệu (Lấy các dữ liệu hợp lệ)
        SELECT *
        INTO #Temp_Thung60
        FROM [WMS].[dbo].[vw_thung60_trenke]
        WHERE so_luong > 0 AND ma_sp IS NOT NULL AND ma_sp <> '';

        -- 2. Kết chuyển Kệ (Location)
        INSERT INTO [WMS1].[dbo].[location] (location_code, location_type, status)
        SELECT DISTINCT ma_ke, 'BIN', 'OCCUPIED'
        FROM #Temp_Thung60
        WHERE ma_ke IS NOT NULL
        AND ma_ke NOT IN (SELECT location_code FROM [WMS1].[dbo].[location]);

        -- 3. Kết chuyển Pallet (Pallet)
        INSERT INTO [WMS1].[dbo].[pallet] (pallet_id, status, current_location_code)
        SELECT DISTINCT pallet_in, 'IN_STORAGE', MIN(ma_ke)
        FROM #Temp_Thung60
        WHERE pallet_in IS NOT NULL
        AND pallet_in NOT IN (SELECT pallet_id FROM [WMS1].[dbo].[pallet])
        GROUP BY pallet_in;

        -- 4. Kết chuyển Thùng 360 (pack360_header)
        INSERT INTO [WMS1].[dbo].[pack360_header] (
            pack360_id, pack360_qr, packing_standard_type, 
            po_no, status, actual_unit_count, weight, created_at, completed_at,
            created_by, completed_by
        )
        SELECT 
            t.qr_360, t.qr_360, 'CARTON_360', 
            t.donhang, 'COMPLETED', t.soluong360, t.trongluong, 
            ISNULL(t.time_nhap, @LogDate), ISNULL(t.time_nhap, @LogDate),
            'SYSTEM_MIGRATION', 'SYSTEM_MIGRATION'
        FROM [WMS].[dbo].[thung360] t
        WHERE t.qr_360 IN (SELECT DISTINCT ID_360 FROM #Temp_Thung60 WHERE ID_360 IS NOT NULL)
        AND t.qr_360 NOT IN (SELECT pack360_id FROM [WMS1].[dbo].[pack360_header]);

        -- 5. Kết chuyển Thùng 60 (tbl_thung60_kho)
        INSERT INTO [WMS1].[dbo].[tbl_thung60_kho] (
            id_60, qr_60, product_code, standard_qty, original_qty, current_qty, uom,
            status, stock_type, is_virtual, unit_origin_type, 
            current_po_no, current_oem_order_no, customer_code, 
            current_pack360_id, current_pallet_id, current_location_code, created_at
        )
        SELECT 
            ID_60, ID_60, ma_sp, so_luong, so_luong, so_luong, 'PCS',
            'AVAILABLE', 'UNRESTRICTED', 0, 'MIGRATED',
            PO, oem_2, kenh_kd, 
            t360.qr_360, pallet_in, ma_ke, ISNULL(time_cre, @LogDate)
        FROM #Temp_Thung60 t60
        LEFT JOIN [WMS].[dbo].[thung360] t360 ON t60.ID_360 = t360.qr_360
        WHERE t60.ID_60 NOT IN (SELECT id_60 FROM [WMS1].[dbo].[tbl_thung60_kho]);

        -- 6. Hạch toán Sổ cái Kép (Dual Ledger)
        
        -- 6.1 Header
        INSERT INTO [WMS1].[dbo].[stock_transaction_book] (
            transaction_id, transaction_type, document_no, posted_by, posted_at
        )
        VALUES (@TransactionID, 'INITIAL_BALANCE', 'MIG_001', 'SYSTEM_MIGRATION', @LogDate);

        -- 6.2 Detail 1: Inventory Ledger (Cấp Thùng)
        INSERT INTO [WMS1].[dbo].[inventory_ledger] (
            ledger_date, id_60, product_code, transaction_id, 
            quantity_change, new_stock_type, created_at
        )
        SELECT 
            @LogDate, ID_60, ma_sp, @TransactionID,
            so_luong, 'UNRESTRICTED', @LogDate
        FROM #Temp_Thung60;

        -- 6.3 Detail 2: Item Ledger (Cấp SKU)
        INSERT INTO [WMS1].[dbo].[item_ledger] (
            ledger_date, product_code, transaction_id, 
            total_quantity_change, created_at
        )
        SELECT 
            @LogDate, ma_sp, @TransactionID, 
            SUM(so_luong), @LogDate
        FROM #Temp_Thung60
        GROUP BY ma_sp;
        
        -- 7. Ghi Log Event
        INSERT INTO [WMS1].[dbo].[thung60_event] (
            event_id, id_60, event_type, request_id, performed_by, performed_at
        )
        SELECT NEWID(), ID_60, 'MIGRATED_INITIAL', 'MIG_001', 'SYSTEM_MIGRATION', @LogDate
        FROM #Temp_Thung60;

        DROP TABLE #Temp_Thung60;

        COMMIT TRANSACTION;
        PRINT 'Migration completed successfully!';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
