USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =============================================
-- XỬ LÝ NGHIỆP VỤ CHUYỂN LOẠI TỒN / KHÓA TỒN
-- =============================================

CREATE OR ALTER PROCEDURE dbo.usp_StockType_Change
    @requestNo NVARCHAR(100),
    @lineNo INT,
    @id60 NVARCHAR(50),
    @changeType NVARCHAR(50),
    @newStockType NVARCHAR(50),
    @newReason NVARCHAR(50),
    @actor NVARCHAR(100),
    @requestId NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    DECLARE @productCode NVARCHAR(50);
    DECLARE @currentQty DECIMAL(18,4);
    DECLARE @oldStockType NVARCHAR(50);
    DECLARE @oldReason NVARCHAR(50);
    DECLARE @currentStatus NVARCHAR(50);
    DECLARE @actualId NVARCHAR(100);
    
    SELECT @actualId = id_60, @productCode = product_code, @currentQty = current_qty, 
           @oldStockType = stock_type, @oldReason = block_reason_code, @currentStatus = status
    FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK)
    WHERE id_60 = @id60 OR qr_60 = @id60;
    
    IF @productCode IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy thùng 60 có mã: %s', 16, 1, @id60);
        RETURN;
    END
    
    IF @currentStatus NOT IN ('AVAILABLE', 'PALLETIZED', 'PACKED_360')
    BEGIN
        RAISERROR(N'Thùng %s đang ở trạng thái %s, không thể đổi stock type.', 16, 1, @id60, @currentStatus);
        RETURN;
    END
    
    IF @changeType = 'RELEASE' AND @oldStockType <> 'BLOCKED'
    BEGIN
        RAISERROR(N'Thùng %s không ở trạng thái BLOCKED nên không thể Release.', 16, 1, @id60);
        RETURN;
    END
    
    IF @changeType = 'RELEASE'
    BEGIN
        SET @newReason = NULL;
    END

    INSERT INTO stock_type_change_request_detail (
        request_no, line_no, id_60, product_code, qty, old_stock_type, new_stock_type, old_block_reason_code, new_block_reason_code
    ) VALUES (
        @requestNo, @lineNo, @actualId, @productCode, @currentQty, @oldStockType, @newStockType, @oldReason, @newReason
    );

    UPDATE tbl_thung60_kho SET
        stock_type = @newStockType,
        block_reason_code = @newReason,
        updated_at = GETDATE()
    WHERE id_60 = @actualId;
    
    DECLARE @eventType NVARCHAR(50) = CASE WHEN @changeType = 'RELEASE' THEN 'STOCK_RELEASE' ELSE 'STOCK_TYPE_CHANGE' END;
    DECLARE @eventId NVARCHAR(50) = 'EVT-' + LEFT(REPLACE(NEWID(), '-', ''), 10);
    
    INSERT INTO thung60_event (event_id, id_60, event_type, old_stock_type, new_stock_type, message, performed_by, performed_at, request_id)
    VALUES (@eventId, @actualId, @eventType, @oldStockType, @newStockType, @newReason, @actor, GETDATE(), @requestId);

    DECLARE @txId NVARCHAR(50) = 'TX-' + LEFT(REPLACE(NEWID(), '-', ''), 10);
    
    INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by, posted_at)
    VALUES (@txId, 'STOCK_RECLASSIFY', @requestNo, @actor, GETDATE());

    INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
    VALUES (CAST(GETDATE() AS DATE), @actualId, @productCode, @txId, @requestNo, 0, @oldStockType, @newStockType, GETDATE());
END;
GO
