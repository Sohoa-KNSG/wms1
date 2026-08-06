-- Migration 002: Stored Procedures & Constraints cho UC16 Picking (Fix-UC16-2026-07-01)
-- Dialect: SQL Server (T-SQL)

-- ==============================================
-- 1. Idempotency Table & Indexes
-- ==============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'processed_request')
BEGIN
    CREATE TABLE processed_request (
        request_id NVARCHAR(100) NOT NULL PRIMARY KEY,
        command_type NVARCHAR(50) NOT NULL,
        result_data NVARCHAR(MAX) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_delivery_note_barcode_unique' AND object_id = OBJECT_ID('delivery_note_barcode'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX idx_delivery_note_barcode_unique
    ON delivery_note_barcode(barcode);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_delivery_note_barcode_note_prod' AND object_id = OBJECT_ID('delivery_note_barcode'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_delivery_note_barcode_note_prod
    ON delivery_note_barcode(delivery_note_no, product_code);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_delivery_note_header_status_plate' AND object_id = OBJECT_ID('delivery_note_header'))
BEGIN
    CREATE NONCLUSTERED INDEX idx_delivery_note_header_status_plate
    ON delivery_note_header(status, license_plate);
END
GO

-- ==============================================
-- 2. Stored Procedures: Read Queries
-- ==============================================

CREATE OR ALTER PROCEDURE usp_WMS_UC16_GetDeliveryNotes
    @Status NVARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        h.delivery_note_no, 
        h.license_plate, 
        h.driver_id, 
        h.driver_name,
        h.guard_id,
        ISNULL(NULLIF(h.customer_name, ''), ISNULL(MIN(d.customer_name), N'Khách Hàng KNSG')) AS customer_name,
        h.delivery_location, 
        h.status, 
        h.created_at, 
        h.created_by, 
        h.approved_by, 
        h.approved_at, 
        h.approval_note,
        h.security_checked_by, 
        h.security_checked_at,
        h.seal_no,
        h.gate_note,
        COUNT(d.line_no) AS items_count,
        ISNULL(SUM(d.qty), 0) AS total_qty,
        ISNULL((SELECT SUM(qty) FROM delivery_note_barcode b WHERE b.delivery_note_no = h.delivery_note_no), 0) AS picked_qty
    FROM delivery_note_header h WITH (NOLOCK)
    LEFT JOIN delivery_note_detail d WITH (NOLOCK) ON h.delivery_note_no = d.delivery_note_no
    WHERE (@Status IS NULL OR h.status = @Status)
    GROUP BY 
        h.delivery_note_no, h.license_plate, h.driver_id, h.driver_name, h.guard_id, h.customer_name,
        h.delivery_location, h.status, h.created_at, h.created_by, h.approved_by, h.approved_at, h.approval_note,
        h.security_checked_by, h.security_checked_at, h.seal_no, h.gate_note
    ORDER BY h.created_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_WMS_UC16_GetDeliveryNoteDetail
    @DeliveryNoteNo NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- Header
    SELECT 
        delivery_note_no, 
        license_plate, 
        driver_id, 
        driver_name,
        guard_id, 
        delivery_location, 
        status, 
        approved_by,
        approved_at,
        approval_note,
        security_checked_by,
        security_checked_at,
        seal_no,
        gate_note,
        created_by,
        created_at
    FROM delivery_note_header WITH (NOLOCK)
    WHERE delivery_note_no = @DeliveryNoteNo;

    -- Lines (Details)
    SELECT 
        d.delivery_note_no,
        d.line_no,
        d.customer_name,
        d.product_code,
        d.channel_code,
        d.qty AS requested_qty,
        ISNULL(SUM(b.qty), 0) AS picked_qty,
        d.box_large,
        d.box_small,
        d.box_virtual,
        d.total_weight_kg
    FROM delivery_note_detail d WITH (NOLOCK)
    LEFT JOIN delivery_note_barcode b WITH (NOLOCK) 
        ON d.delivery_note_no = b.delivery_note_no AND d.product_code = b.product_code
    WHERE d.delivery_note_no = @DeliveryNoteNo
    GROUP BY d.delivery_note_no, d.line_no, d.customer_name, d.product_code, d.channel_code, d.qty, d.box_large, d.box_small, d.box_virtual, d.total_weight_kg;

    -- Scanned Barcodes
    SELECT 
        id,
        delivery_note_no,
        barcode,
        barcode_type,
        product_code,
        qty,
        scanned_by,
        scanned_at
    FROM delivery_note_barcode WITH (NOLOCK)
    WHERE delivery_note_no = @DeliveryNoteNo
    ORDER BY scanned_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE usp_WMS_UC16_GetFifoSuggestions
    @ProductCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Result 1: Pack 360 Suggestions
    SELECT TOP 5
        p.pack360_id AS pack_id,
        t.product_code,
        p.actual_unit_count AS total_qty,
        'KHO CHÍNH' AS location_code,
        p.created_at
    FROM pack360_header p WITH (NOLOCK)
    INNER JOIN (
        SELECT pack360_id, MIN(id_60) as id_60 FROM pack360_unit GROUP BY pack360_id
    ) u ON p.pack360_id = u.pack360_id
    INNER JOIN tbl_thung60_kho t WITH (NOLOCK) ON u.id_60 = t.id_60
    WHERE t.product_code = @ProductCode AND p.status = 'COMPLETED'
    ORDER BY p.created_at ASC;

    -- Result 2: Box 60 Suggestions
    SELECT TOP 10 
        id_60, 
        qr_60, 
        product_code, 
        current_qty, 
        current_location_code AS location_code, 
        created_at
    FROM tbl_thung60_kho WITH (NOLOCK)
    WHERE product_code = @ProductCode AND status = 'AVAILABLE'
    ORDER BY created_at ASC;
END;
GO

CREATE OR ALTER PROCEDURE usp_WMS_UC16_GetAvailableBoxes
    @ProductCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        id_60, 
        qr_60, 
        product_code, 
        current_qty, 
        current_location_code
    FROM tbl_thung60_kho WITH (NOLOCK)
    WHERE product_code = @ProductCode AND status = 'AVAILABLE'
    ORDER BY current_qty DESC;
END;
GO

-- ==============================================
-- 3. Stored Procedures: Scan Barcode
-- ==============================================

CREATE OR ALTER PROCEDURE usp_WMS_UC16_ScanBarcode
    @DeliveryNoteNo NVARCHAR(50),
    @Barcode NVARCHAR(255),
    @ExpectedProductCode NVARCHAR(50) = NULL,
    @ScannedBy NVARCHAR(50),
    @RequestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Idempotency check
    IF EXISTS (SELECT 1 FROM processed_request WHERE request_id = @RequestId)
    BEGIN
        SELECT result_data FROM processed_request WHERE request_id = @RequestId;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        -- 1. Validate Delivery Note State
        DECLARE @NoteStatus NVARCHAR(30);
        SELECT @NoteStatus = status 
        FROM delivery_note_header WITH (UPDLOCK, ROWLOCK)
        WHERE delivery_note_no = @DeliveryNoteNo;

        IF @NoteStatus IS NULL
        BEGIN
            RAISERROR(N'Phiếu xuất kho %s không tồn tại.', 16, 1, @DeliveryNoteNo);
        END

        IF @NoteStatus NOT IN ('NEW', 'PENDING_PICK', 'PICKING')
        BEGIN
            RAISERROR(N'Phiếu xuất %s đang ở trạng thái %s, không thể quét thêm hàng.', 16, 1, @DeliveryNoteNo, @NoteStatus);
        END

        -- 2. Identify Barcode (Thùng 60 hay Kiện 360)
        DECLARE @BarcodeType NVARCHAR(30) = NULL;
        DECLARE @ProductCode NVARCHAR(50) = NULL;
        DECLARE @Qty DECIMAL(18,4) = 0;
        DECLARE @Id60 NVARCHAR(50) = NULL;
        DECLARE @Pack360Id NVARCHAR(50) = NULL;

        -- Try Thùng 60
        SELECT 
            @Id60 = id_60,
            @ProductCode = product_code,
            @Qty = current_qty,
            @BarcodeType = CASE WHEN is_virtual = 1 THEN 'VIRTUAL' ELSE 'THUNG60' END
        FROM tbl_thung60_kho WITH (UPDLOCK, ROWLOCK)
        WHERE (id_60 = @Barcode OR qr_60 = @Barcode) AND status = 'AVAILABLE';

        IF @Id60 IS NULL
        BEGIN
            -- Try Pack 360
            SELECT TOP 1
                @Pack360Id = p.pack360_id,
                @ProductCode = t.product_code,
                @Qty = p.actual_unit_count,
                @BarcodeType = 'PACK360'
            FROM pack360_header p WITH (UPDLOCK, ROWLOCK)
            INNER JOIN pack360_unit u WITH (NOLOCK) ON p.pack360_id = u.pack360_id
            INNER JOIN tbl_thung60_kho t WITH (NOLOCK) ON u.id_60 = t.id_60
            WHERE p.pack360_id = @Barcode AND p.status = 'COMPLETED';
        END

        IF @BarcodeType IS NULL
        BEGIN
            RAISERROR(N'Mã vạch %s không tồn tại hoặc không ở trạng thái khả dụng (AVAILABLE / COMPLETED).', 16, 1, @Barcode);
        END

        -- 3. Validate Expected Product Code
        IF @ExpectedProductCode IS NOT NULL AND @ExpectedProductCode <> '' AND @ProductCode <> @ExpectedProductCode
        BEGIN
            RAISERROR(N'Mã sản phẩm của kiện/thùng (%s) không khớp với sản phẩm đang chọn (%s).', 16, 1, @ProductCode, @ExpectedProductCode);
        END

        -- 4. Validate Product in Delivery Note Detail
        DECLARE @RequestedQty DECIMAL(18,4) = 0;
        SELECT @RequestedQty = qty
        FROM delivery_note_detail WITH (NOLOCK)
        WHERE delivery_note_no = @DeliveryNoteNo AND product_code = @ProductCode;

        IF @RequestedQty IS NULL OR @RequestedQty = 0
        BEGIN
            RAISERROR(N'Sản phẩm %s không nằm trong kế hoạch của Phiếu xuất %s.', 16, 1, @ProductCode, @DeliveryNoteNo);
        END

        -- 5. Check Barcode Already Scanned Elsewhere
        IF EXISTS (SELECT 1 FROM delivery_note_barcode WITH (NOLOCK) WHERE barcode = @Barcode)
        BEGIN
            RAISERROR(N'Mã vạch %s đã được quét trong hệ thống.', 16, 1, @Barcode);
        END

        -- 6. Check Over-picking
        DECLARE @AlreadyPickedQty DECIMAL(18,4) = 0;
        SELECT @AlreadyPickedQty = ISNULL(SUM(qty), 0)
        FROM delivery_note_barcode WITH (NOLOCK)
        WHERE delivery_note_no = @DeliveryNoteNo AND product_code = @ProductCode;

        IF (@AlreadyPickedQty + @Qty) > @RequestedQty
        BEGIN
            DECLARE @ErrQty1 NVARCHAR(30) = CAST((@AlreadyPickedQty + @Qty) AS NVARCHAR(30));
            DECLARE @ErrQty2 NVARCHAR(30) = CAST(@RequestedQty AS NVARCHAR(30));
            RAISERROR(N'Tổng số lượng quét (%s) sẽ vượt số lượng yêu cầu (%s) của sản phẩm %s.', 16, 1, 
                @ErrQty1, @ErrQty2, @ProductCode);
        END

        -- 7. Record Scan & Update Unit Status
        INSERT INTO delivery_note_barcode (delivery_note_no, barcode, barcode_type, product_code, qty, scanned_by, scanned_at)
        VALUES (@DeliveryNoteNo, @Barcode, @BarcodeType, @ProductCode, @Qty, @ScannedBy, GETDATE());

        IF @BarcodeType IN ('THUNG60', 'VIRTUAL')
        BEGIN
            UPDATE tbl_thung60_kho
            SET status = 'PICKED', last_event_type = 'PICK_60', last_event_at = GETDATE(), last_event_by = @ScannedBy, updated_at = GETDATE()
            WHERE id_60 = @Id60;

            INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
            VALUES (NEWID(), @Id60, 'PICK_60', 'AVAILABLE', 'PICKED', @DeliveryNoteNo, @RequestId, @ScannedBy);
        END
        ELSE IF @BarcodeType = 'PACK360'
        BEGIN
            UPDATE pack360_header
            SET status = 'PICKED'
            WHERE pack360_id = @Pack360Id;

            INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, request_id, performed_by)
            VALUES (NEWID(), @Pack360Id, 'PICK_PACK', 'COMPLETED', 'PICKED', @DeliveryNoteNo, @RequestId, @ScannedBy);
        END

        -- Update Note Status to PICKING if was PENDING_PICK/NEW
        IF @NoteStatus IN ('NEW', 'PENDING_PICK')
        BEGIN
            UPDATE delivery_note_header 
            SET status = 'PICKING'
            WHERE delivery_note_no = @DeliveryNoteNo;
        END

        -- Audit Log
        INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
        VALUES ('DELIVERY_NOTE', @DeliveryNoteNo, 'SCAN_BARCODE', CONCAT('Barcode: ', @Barcode, ', Qty: ', @Qty), @ScannedBy);

        -- Save Idempotency
        DECLARE @ResultJson NVARCHAR(MAX) = (
            SELECT 
                'SUCCESS' AS status,
                @ProductCode AS product_code,
                @Qty AS qty,
                @BarcodeType AS barcode_type,
                @Barcode AS barcode
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        INSERT INTO processed_request (request_id, command_type, result_data)
        VALUES (@RequestId, 'SCAN_BARCODE', @ResultJson);

        COMMIT TRAN;

        SELECT @ResultJson AS result_data;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO

-- ==============================================
-- 4. Stored Procedures: Split Box (UC17 integration)
-- ==============================================

CREATE OR ALTER PROCEDURE usp_WMS_UC16_SplitBox
    @DeliveryNoteNo NVARCHAR(50),
    @ProductCode NVARCHAR(50),
    @SourceId60 NVARCHAR(50),
    @SplitQty DECIMAL(18,4),
    @ScannedBy NVARCHAR(50),
    @RequestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM processed_request WHERE request_id = @RequestId)
    BEGIN
        SELECT result_data FROM processed_request WHERE request_id = @RequestId;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        IF @SplitQty <= 0 OR @SplitQty <> FLOOR(@SplitQty)
        BEGIN
            RAISERROR(N'Số lượng tách lẻ phải là số nguyên dương.', 16, 1);
        END

        -- Lock Source Box
        DECLARE @SourceCurrentQty DECIMAL(18,4);
        DECLARE @SourceStatus NVARCHAR(30);
        DECLARE @SourceProductCode NVARCHAR(50);
        DECLARE @Uom NVARCHAR(20);
        DECLARE @LocationCode NVARCHAR(50);

        SELECT 
            @SourceCurrentQty = current_qty,
            @SourceStatus = status,
            @SourceProductCode = product_code,
            @Uom = uom,
            @LocationCode = current_location_code
        FROM tbl_thung60_kho WITH (UPDLOCK, ROWLOCK)
        WHERE id_60 = @SourceId60;

        IF @SourceStatus IS NULL OR @SourceStatus <> 'AVAILABLE'
        BEGIN
            RAISERROR(N'Thùng nguồn %s không tồn tại hoặc không ở trạng thái AVAILABLE.', 16, 1, @SourceId60);
        END

        IF @SourceProductCode <> @ProductCode
        BEGIN
            RAISERROR(N'Mã sản phẩm của thùng nguồn (%s) không khớp với sản phẩm cần tách (%s).', 16, 1, @SourceProductCode, @ProductCode);
        END

        IF @SourceCurrentQty < @SplitQty
        BEGIN
            DECLARE @ErrQty3 NVARCHAR(30) = CAST(@SourceCurrentQty AS NVARCHAR(30));
            DECLARE @ErrQty4 NVARCHAR(30) = CAST(@SplitQty AS NVARCHAR(30));
            RAISERROR(N'Số lượng khả dụng của thùng nguồn (%s) không đủ để tách %s.', 16, 1, @ErrQty3, @ErrQty4);
        END

        -- Generate Virtual Box ID
        DECLARE @VirtualId NVARCHAR(50) = CONCAT('VIR-PICK-', REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''));

        -- Deduct source box
        UPDATE tbl_thung60_kho
        SET current_qty = current_qty - @SplitQty,
            split_qty_total = ISNULL(split_qty_total, 0) + @SplitQty,
            is_full_box = 0,
            updated_at = GETDATE()
        WHERE id_60 = @SourceId60;

        -- Create Virtual Box
        INSERT INTO tbl_thung60_kho (
            id_60, qr_60, product_code, standard_qty, original_qty, current_qty, uom, status, stock_type,
            is_virtual, unit_origin_type, parent_id_60, root_id_60, current_location_code, created_at, updated_at
        )
        VALUES (
            @VirtualId, @VirtualId, @ProductCode, @SplitQty, @SplitQty, @SplitQty, @Uom, 'PICKED', 'UNRESTRICTED',
            1, 'PARTIAL_SPLIT', @SourceId60, @SourceId60, @LocationCode, GETDATE(), GETDATE()
        );

        -- Record Split History
        DECLARE @SplitId NVARCHAR(50) = CONCAT('SPLIT-', REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', ''));
        INSERT INTO thung60_split_history (split_id, source_id_60, generated_id_60, product_code, split_qty, source_qty_before, source_qty_after, issue_no)
        VALUES (@SplitId, @SourceId60, @VirtualId, @ProductCode, @SplitQty, @SourceCurrentQty, (@SourceCurrentQty - @SplitQty), @DeliveryNoteNo);

        -- Record Barcode Mapping
        INSERT INTO delivery_note_barcode (delivery_note_no, barcode, barcode_type, product_code, qty, scanned_by, scanned_at)
        VALUES (@DeliveryNoteNo, @VirtualId, 'VIRTUAL', @ProductCode, @SplitQty, @ScannedBy, GETDATE());

        -- Update Note Status to PICKING
        UPDATE delivery_note_header 
        SET status = 'PICKING' 
        WHERE delivery_note_no = @DeliveryNoteNo AND status IN ('NEW', 'PENDING_PICK');

        DECLARE @ResultJson NVARCHAR(MAX) = (
            SELECT 
                'SUCCESS' AS status,
                @VirtualId AS virtual_id,
                @SplitQty AS split_qty,
                @ProductCode AS product_code
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        INSERT INTO processed_request (request_id, command_type, result_data)
        VALUES (@RequestId, 'SPLIT_BOX', @ResultJson);

        COMMIT TRAN;

        SELECT @ResultJson AS result_data;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO

-- ==============================================
-- 5. Stored Procedures: Complete, Stage & Gate-Out
-- ==============================================

CREATE OR ALTER PROCEDURE usp_WMS_UC16_CompletePicking
    @DeliveryNoteNo NVARCHAR(50),
    @CompletedBy NVARCHAR(50),
    @RequestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM processed_request WHERE request_id = @RequestId)
    BEGIN
        SELECT result_data FROM processed_request WHERE request_id = @RequestId;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        DECLARE @NoteStatus NVARCHAR(30);
        SELECT @NoteStatus = status 
        FROM delivery_note_header WITH (UPDLOCK, ROWLOCK)
        WHERE delivery_note_no = @DeliveryNoteNo;

        IF @NoteStatus IS NULL
        BEGIN
            RAISERROR(N'Phiếu xuất kho %s không tồn tại.', 16, 1, @DeliveryNoteNo);
        END

        IF @NoteStatus NOT IN ('PENDING_PICK', 'PICKING')
        BEGIN
            RAISERROR(N'Phiếu xuất %s đang ở trạng thái %s, không thể chuyển sang PICKED.', 16, 1, @DeliveryNoteNo, @NoteStatus);
        END

        -- Ensure at least one barcode is scanned
        IF NOT EXISTS (SELECT 1 FROM delivery_note_barcode WHERE delivery_note_no = @DeliveryNoteNo)
        BEGIN
            RAISERROR(N'Phiếu xuất %s chưa được quét bất kỳ mã vạch nào.', 16, 1, @DeliveryNoteNo);
        END

        UPDATE delivery_note_header
        SET status = 'PICKED'
        WHERE delivery_note_no = @DeliveryNoteNo;

        INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
        VALUES ('DELIVERY_NOTE', @DeliveryNoteNo, 'COMPLETE_PICKING', 'Status: PICKED', @CompletedBy);

        DECLARE @ResultJson NVARCHAR(MAX) = (
            SELECT 'SUCCESS' AS status, N'Hoàn tất soạn hàng thành công.' AS message
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        INSERT INTO processed_request (request_id, command_type, result_data)
        VALUES (@RequestId, 'COMPLETE_PICKING', @ResultJson);

        COMMIT TRAN;

        SELECT @ResultJson AS result_data;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE usp_WMS_UC16_ApproveStage
    @DeliveryNoteNo NVARCHAR(50),
    @Note NVARCHAR(255) = NULL,
    @ApprovedBy NVARCHAR(50),
    @RequestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM processed_request WHERE request_id = @RequestId)
    BEGIN
        SELECT result_data FROM processed_request WHERE request_id = @RequestId;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        DECLARE @RowsAffected INT = 0;
        UPDATE delivery_note_header 
        SET status = 'STAGED', 
            approved_by = @ApprovedBy, 
            approved_at = GETDATE(), 
            approval_note = ISNULL(@Note, N'Đã duyệt tập kết bãi')
        WHERE delivery_note_no = @DeliveryNoteNo AND status = 'PICKED';

        SET @RowsAffected = @@ROWCOUNT;

        IF @RowsAffected = 0
        BEGIN
            RAISERROR(N'Phiếu xuất %s không tồn tại hoặc không ở trạng thái CHỜ TẬP KẾT (PICKED).', 16, 1, @DeliveryNoteNo);
        END

        -- Update Thùng 60 to STAGED
        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
        SELECT NEWID(), t.id_60, 'STAGE_60', t.status, 'STAGED', @DeliveryNoteNo, @RequestId, @ApprovedBy
        FROM tbl_thung60_kho t
        INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND (b.barcode_type = 'THUNG60' OR b.barcode_type = 'VIRTUAL');

        UPDATE t
        SET status = 'STAGED', last_event_type = 'STAGE_60', last_event_at = GETDATE(), last_event_by = @ApprovedBy
        FROM tbl_thung60_kho t
        INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND (b.barcode_type = 'THUNG60' OR b.barcode_type = 'VIRTUAL');

        -- Update Pack 360 to STAGED
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, request_id, performed_by)
        SELECT NEWID(), p.pack360_id, 'STAGE_PACK', p.status, 'STAGED', @DeliveryNoteNo, @RequestId, @ApprovedBy
        FROM pack360_header p
        INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND b.barcode_type = 'PACK360';

        UPDATE p
        SET status = 'STAGED'
        FROM pack360_header p
        INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND b.barcode_type = 'PACK360';

        INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
        VALUES ('DELIVERY_NOTE', @DeliveryNoteNo, 'STAGE_APPROVAL', 'Status: STAGED', @ApprovedBy);

        DECLARE @ResultJson NVARCHAR(MAX) = (
            SELECT 'SUCCESS' AS status, N'Duyệt tập kết thành công.' AS message
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        INSERT INTO processed_request (request_id, command_type, result_data)
        VALUES (@RequestId, 'STAGE_APPROVAL', @ResultJson);

        COMMIT TRAN;

        SELECT @ResultJson AS result_data;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE usp_WMS_UC16_GateOut
    @DeliveryNoteNo NVARCHAR(50),
    @DriverName NVARCHAR(100) = NULL,
    @SealNo NVARCHAR(100) = NULL,
    @GateNote NVARCHAR(255) = NULL,
    @SecurityUser NVARCHAR(50),
    @RequestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF EXISTS (SELECT 1 FROM processed_request WHERE request_id = @RequestId)
    BEGIN
        SELECT result_data FROM processed_request WHERE request_id = @RequestId;
        RETURN;
    END

    BEGIN TRY
        BEGIN TRAN;

        -- 1. Check Accounting Period OPEN
        IF EXISTS (
            SELECT 1 FROM sys.tables WHERE name = 'accounting_periods'
        )
        BEGIN
            IF EXISTS (
                SELECT 1 FROM accounting_periods 
                WHERE period_status = 'CLOSED' 
                  AND CAST(GETDATE() AS DATE) BETWEEN start_date AND end_date
            )
            BEGIN
                RAISERROR(N'Kỳ kế toán hiện tại đã BỊ KHÓA (CLOSED), không thể thực hiện hạch toán xuất bến.', 16, 1);
            END
        END

        -- 2. Validate Delivery Note State
        DECLARE @CustomerName NVARCHAR(255) = NULL;
        SELECT @CustomerName = customer_name
        FROM delivery_note_header WITH (UPDLOCK, ROWLOCK)
        WHERE delivery_note_no = @DeliveryNoteNo AND status = 'STAGED';

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR(N'Phiếu xuất %s không tồn tại hoặc không ở trạng thái TẬP KẾT (STAGED).', 16, 1, @DeliveryNoteNo);
        END

        -- Update Note Header
        UPDATE delivery_note_header 
        SET status = 'SHIPPED', 
            security_checked_by = @SecurityUser, 
            security_checked_at = GETDATE(),
            driver_name = ISNULL(@DriverName, driver_name),
            seal_no = ISNULL(@SealNo, seal_no),
            gate_note = ISNULL(@GateNote, N'Bảo vệ xác nhận xuất bến')
        WHERE delivery_note_no = @DeliveryNoteNo;

        -- 3. Post Dual Ledger Header
        DECLARE @TransactionId NVARCHAR(50) = CONVERT(NVARCHAR(50), NEWID());
        INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, partner_name, posted_by, posted_at)
        VALUES (@TransactionId, 'OUT_DISPATCH', @DeliveryNoteNo, ISNULL(@CustomerName, N'Khách hàng'), @SecurityUser, GETDATE());

        -- 4. Post Item Ledger (Detail Level 1 - Aggregate by Product)
        INSERT INTO item_ledger (ledger_date, product_code, transaction_id, source_document_no, total_quantity_change, created_at)
        SELECT 
            CAST(GETDATE() AS DATE), 
            product_code, 
            @TransactionId, 
            @DeliveryNoteNo, 
            -SUM(qty), 
            GETDATE()
        FROM delivery_note_barcode
        WHERE delivery_note_no = @DeliveryNoteNo
        GROUP BY product_code;

        -- 5. Post Inventory Ledger & Update Thùng 60
        INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
        SELECT 
            CAST(GETDATE() AS DATE), 
            t.id_60, 
            t.product_code, 
            @TransactionId, 
            @DeliveryNoteNo, 
            -t.current_qty, 
            t.stock_type, 
            'SHIPPED', 
            GETDATE()
        FROM tbl_thung60_kho t WITH (UPDLOCK)
        INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND (b.barcode_type = 'THUNG60' OR b.barcode_type = 'VIRTUAL');

        -- Events & Status update for Thùng 60
        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, request_id, performed_by)
        SELECT NEWID(), t.id_60, 'SHIP_60', t.status, 'SHIPPED', @DeliveryNoteNo, @RequestId, @SecurityUser
        FROM tbl_thung60_kho t
        INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND (b.barcode_type = 'THUNG60' OR b.barcode_type = 'VIRTUAL');

        UPDATE t
        SET status = 'SHIPPED', last_event_type = 'SHIP_60', last_event_at = GETDATE(), last_event_by = @SecurityUser, updated_at = GETDATE()
        FROM tbl_thung60_kho t
        INNER JOIN delivery_note_barcode b ON t.id_60 = b.barcode OR t.qr_60 = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND (b.barcode_type = 'THUNG60' OR b.barcode_type = 'VIRTUAL');

        -- 6. Expand & Process Pack 360
        INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
        SELECT 
            CAST(GETDATE() AS DATE), 
            u.id_60, 
            t.product_code, 
            @TransactionId, 
            @DeliveryNoteNo, 
            -t.current_qty, 
            t.stock_type, 
            'SHIPPED', 
            GETDATE()
        FROM pack360_unit u
        INNER JOIN pack360_header p ON u.pack360_id = p.pack360_id
        INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode
        INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
        WHERE b.delivery_note_no = @DeliveryNoteNo AND b.barcode_type = 'PACK360' AND u.is_current = 1;

        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, source_document_no, request_id, performed_by)
        SELECT NEWID(), p.pack360_id, 'SHIP_PACK', p.status, 'SHIPPED', @DeliveryNoteNo, @RequestId, @SecurityUser
        FROM pack360_header p
        INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND b.barcode_type = 'PACK360';

        UPDATE p
        SET status = 'SHIPPED'
        FROM pack360_header p
        INNER JOIN delivery_note_barcode b ON p.pack360_id = b.barcode
        WHERE b.delivery_note_no = @DeliveryNoteNo AND b.barcode_type = 'PACK360';

        -- Audit Log
        INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
        VALUES ('DELIVERY_NOTE', @DeliveryNoteNo, 'GATE_OUT_SHIPPED', CONCAT('TransactionId: ', @TransactionId), @SecurityUser);

        DECLARE @ResultJson NVARCHAR(MAX) = (
            SELECT 'SUCCESS' AS status, N'Bảo vệ đã xác nhận xuất bến thành công. Sổ cái Kép đã hạch toán.' AS message, @TransactionId AS transaction_id
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        );

        INSERT INTO processed_request (request_id, command_type, result_data)
        VALUES (@RequestId, 'GATE_OUT', @ResultJson);

        COMMIT TRAN;

        SELECT @ResultJson AS result_data;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        THROW;
    END CATCH;
END;
GO
