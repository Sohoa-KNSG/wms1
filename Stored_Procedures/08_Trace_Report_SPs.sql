-- =============================================
-- XỬ LÝ NGHIỆP VỤ TRUY VẾT VÀ BÁO CÁO
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE PROCEDURE usp_Trace_Thung60Timeline
    @id_60 NVARCHAR(50),
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
        -- Log request but for read-only it might be optional depending on strictness
        
        -- SELECT event history
        SELECT * FROM thung60_event WHERE id_60 = @id_60 ORDER BY performed_at DESC;
        
        SELECT 'SUCCESS' AS status, 'Truy vết thành công' AS message, NULL AS error_code, NULL AS document_no, @id_60 AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
