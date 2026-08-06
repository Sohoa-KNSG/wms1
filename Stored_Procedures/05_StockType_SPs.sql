-- =============================================
-- XỬ LÝ NGHIỆP VỤ CHUYỂN LOẠI TỒN / KHÓA TỒN
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE PROCEDURE usp_StockType_Block
    @id_60 NVARCHAR(50),
    @reason_code NVARCHAR(50),
    @request_id NVARCHAR(100),
    @user_code NVARCHAR(100),
    @user_email NVARCHAR(255),
    @device_id NVARCHAR(100) = NULL,
    @source_screen NVARCHAR(100) = NULL,
    @note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM command_request_log WHERE request_id = @request_id) RETURN;
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'StockType_Block', 'PROCESSING');
        
        BEGIN TRANSACTION;
        -- TODO: Validate current status is not shipped or allocated
        -- TODO: Update tbl_thung60_kho set stock_type = 'BLOCKED', block_reason_code = @reason_code
        -- TODO: Insert event history
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Khóa tồn thành công' AS message, NULL AS error_code, NULL AS document_no, @id_60 AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
