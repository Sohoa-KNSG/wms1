-- =============================================
-- XỬ LÝ NGHIỆP VỤ XUẤT KHO (OUTBOUND & PARTIAL ISSUE)
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

-- =============================================
-- Phân bổ tồn cho phiếu xuất
-- =============================================
CREATE PROCEDURE usp_Outbound_Allocate
    @issue_no NVARCHAR(50),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'Outbound_Allocate', 'PROCESSING');
        
        BEGIN TRANSACTION;
        -- TODO: Only select tbl_thung60_kho where stock_type = 'UNRESTRICTED' and status = 'AVAILABLE'
        -- TODO: Update status to 'ALLOCATED'
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Phân bổ thành công' AS message, NULL AS error_code, @issue_no AS document_no, NULL AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO

-- =============================================
-- Xuất lẻ sinh thùng ảo (Nghiệp vụ cốt lõi)
-- =============================================
CREATE PROCEDURE usp_Outbound_PartialIssue
    @issue_no NVARCHAR(50),
    @issue_line_no INT,
    @source_id_60 NVARCHAR(50),
    @partial_qty DECIMAL(18,4),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'Outbound_PartialIssue', 'PROCESSING');
        
        BEGIN TRANSACTION;
        
        -- 1. Validate qty
        -- 2. Create virtual box in tbl_thung60_kho (is_virtual=1)
        -- 3. Link parent_id_60 to @source_id_60
        -- 4. Update source box qty and set stock_type = 'BLOCKED', block_reason_code = 'PARTIAL_REMAINING'
        -- 5. Insert into thung60_split_history
        -- 6. Insert events
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Tạo thùng ảo xuất lẻ thành công' AS message, NULL AS error_code, @issue_no AS document_no, NULL AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
