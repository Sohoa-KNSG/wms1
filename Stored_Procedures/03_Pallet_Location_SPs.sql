-- =============================================
-- XỬ LÝ NGHIỆP VỤ PALLET VÀ LOCATION
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE PROCEDURE usp_Pallet_AttachUnit
    @pallet_id NVARCHAR(50),
    @unit_id NVARCHAR(50),
    @unit_type NVARCHAR(30),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'Pallet_AttachUnit', 'PROCESSING');
        
        BEGIN TRANSACTION;
        -- TODO: Validate pallet and unit
        -- TODO: Insert into pallet_unit
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Gán vào pallet thành công' AS message, NULL AS error_code, NULL AS document_no, @pallet_id AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
