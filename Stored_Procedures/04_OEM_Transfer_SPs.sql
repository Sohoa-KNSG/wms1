-- =============================================
-- XỬ LÝ NGHIỆP VỤ CHUYỂN ĐƠN OEM
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE PROCEDURE usp_OEM_Transfer_RequestCreate
    @new_oem_order_no NVARCHAR(50),
    @new_po_no NVARCHAR(50),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'OEM_Transfer_RequestCreate', 'PROCESSING');
        
        DECLARE @new_request_no NVARCHAR(50) = NEWID();
        
        BEGIN TRANSACTION;
        -- TODO: Insert header
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Tạo yêu cầu thành công' AS message, NULL AS error_code, @new_request_no AS document_no, NULL AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO

-- =============================================
-- CHUYỂN ĐƠN OEM CHO KIỆN PACK360 (UC08 / OEM Transfer)
-- =============================================
CREATE OR ALTER PROCEDURE usp_Pack360_TransferOEM
    @pack360_id NVARCHAR(50),
    @target_oem_order_no NVARCHAR(255),
    @target_oem_batch_no INT = 1,
    @reason NVARCHAR(500) = NULL,
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    DECLARE @old_oem_order_no NVARCHAR(255);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @target_product_code NVARCHAR(50);

    SELECT @status = status, @old_oem_order_no = oem_order_no
    FROM pack360_header
    WHERE pack360_id = @pack360_id OR pack360_qr = @pack360_id;

    IF @status IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy Kiện 360', 16, 1);
        RETURN;
    END

    IF @status IN ('ALLOCATED', 'PICKED', 'STAGED', 'SHIPPED')
    BEGIN
        RAISERROR(N'Kiện 360 đang trong quá trình xuất kho, không được chuyển đơn OEM', 16, 1);
        RETURN;
    END

    SELECT @target_product_code = product_code
    FROM tbl_oem_orders
    WHERE oem_order_no = @target_oem_order_no;

    IF @target_product_code IS NULL
    BEGIN
        RAISERROR(N'Đơn hàng OEM mới không tồn tại trong hệ thống', 16, 1);
        RETURN;
    END

    SELECT TOP 1 @product_code = t.product_code
    FROM pack360_unit u
    INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
    WHERE u.pack360_id = @pack360_id AND u.is_current = 1;

    IF @product_code IS NOT NULL AND @product_code <> @target_product_code
    BEGIN
        RAISERROR(N'Sản phẩm của Kiện 360 không khớp với sản phẩm của đơn OEM mới', 16, 1);
        RETURN;
    END

    DECLARE @reqId NVARCHAR(100) = 'REQ-TRF-OEM-' + CAST(DATEDIFF(SECOND, '1970-01-01', GETDATE()) AS NVARCHAR(50));

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Cập nhật header Kiện 360
        UPDATE pack360_header
        SET oem_order_no = @target_oem_order_no,
            oem_batch_no = ISNULL(@target_oem_batch_no, 1)
        WHERE pack360_id = @pack360_id OR pack360_qr = @pack360_id;

        -- 2. Cập nhật thùng 60 thành viên
        UPDATE t
        SET current_oem_order_no = @target_oem_order_no,
            current_oem_batch_no = ISNULL(@target_oem_batch_no, 1)
        FROM tbl_thung60_kho t
        INNER JOIN pack360_unit u ON t.id_60 = u.id_60
        WHERE u.pack360_id = @pack360_id AND u.is_current = 1;

        -- 3. Ghi event pack360_event & thung60_event
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id, message)
        VALUES (NEWID(), @pack360_id, 'TRANSFER_OEM', @status, @status, @user_code, @reqId, N'Chuyển đơn OEM sang ' + @target_oem_order_no);

        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, source_document_no, performed_by, request_id)
        SELECT NEWID(), u.id_60, 'TRANSFER_OEM', t.status, t.status, @target_oem_order_no, @user_code, @reqId
        FROM pack360_unit u
        INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
        WHERE u.pack360_id = @pack360_id AND u.is_current = 1;

        -- 4. Audit Log
        INSERT INTO audit_log (object_type, object_id, action, old_value, new_value, performed_by)
        VALUES ('PACK360', @pack360_id, 'TRANSFER_OEM', ISNULL(@old_oem_order_no, 'NULL'), @target_oem_order_no, @user_code);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO
