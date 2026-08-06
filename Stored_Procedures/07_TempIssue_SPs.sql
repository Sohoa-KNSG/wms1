-- =============================================
-- XỬ LÝ NGHIỆP VỤ XUẤT TẠM
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE PROCEDURE usp_TempIssue_Create
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'TempIssue_Create', 'PROCESSING');
        
        DECLARE @new_issue_no NVARCHAR(50) = NEWID();
        
        BEGIN TRANSACTION;
        -- TODO: Insert header
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Tạo yêu cầu thành công' AS message, NULL AS error_code, @new_issue_no AS document_no, NULL AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
