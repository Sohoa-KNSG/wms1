-- =============================================
-- TẠO YÊU CẦU CHUYỂN ĐƠN OEM (legacy-compatible contract)
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_OEM_Transfer_RequestCreate
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
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @ExistingStatus NVARCHAR(30);
        SELECT @ExistingStatus = status
        FROM dbo.command_request_log WITH (UPDLOCK, HOLDLOCK)
        WHERE request_id = @request_id;

        IF @ExistingStatus = 'SUCCESS'
        BEGIN
            COMMIT TRANSACTION;
            SELECT 'SUCCESS' AS status,
                   N'Yêu cầu đã được xử lý trước đó' AS message,
                   @request_id AS request_id;
            RETURN;
        END

        IF @ExistingStatus IS NOT NULL
        BEGIN
            THROW 51000, N'X-Request-Id đang được xử lý hoặc đã thất bại.', 1;
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.tbl_oem_orders WHERE oem_order_no = @new_oem_order_no
        )
        BEGIN
            THROW 51000, N'Đơn hàng OEM mới không tồn tại trong hệ thống.', 1;
        END

        DECLARE @NewRequestNo NVARCHAR(50) = 'OTR-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '');

        INSERT INTO dbo.command_request_log(request_id, command_type, status)
        VALUES (@request_id, 'OEM_Transfer_RequestCreate', 'PROCESSING');

        INSERT INTO dbo.oem_transfer_request_header
            (request_no, new_oem_order_no, new_oem_batch_no, new_po_no, status, requested_by, requested_at)
        VALUES
            (@NewRequestNo, @new_oem_order_no, 1, @new_po_no, 'PENDING', @user_code, GETUTCDATE());

        UPDATE dbo.command_request_log
        SET status = 'SUCCESS'
        WHERE request_id = @request_id;

        COMMIT TRANSACTION;

        SELECT 'SUCCESS' AS status,
               N'Tạo yêu cầu thành công' AS message,
               @NewRequestNo AS document_no,
               @request_id AS request_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- =============================================
-- CHUYỂN ĐƠN OEM CHO KIỆN PACK360 (UC08)
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_Pack360_TransferOEM
    @pack360_id NVARCHAR(50),
    @target_oem_order_no NVARCHAR(255),
    @target_oem_batch_no INT = 1,
    @reason NVARCHAR(500) = NULL,
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NULLIF(LTRIM(RTRIM(@target_oem_order_no)), N'') IS NULL
       OR LEN(@target_oem_order_no) > 50
    BEGIN
        THROW 51000, N'Mã đơn hàng OEM đích là bắt buộc và không được vượt quá 50 ký tự.', 1;
    END

    DECLARE @resolved_pack360_id NVARCHAR(50);
    DECLARE @status NVARCHAR(30);
    DECLARE @old_oem_order_no NVARCHAR(255);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @reqId NVARCHAR(100) = 'REQ-TRF-OEM-' + REPLACE(CONVERT(NVARCHAR(36), NEWID()), '-', '');

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT @resolved_pack360_id = pack360_id,
               @status = status,
               @old_oem_order_no = oem_order_no
        FROM dbo.pack360_header WITH (UPDLOCK, HOLDLOCK)
        WHERE pack360_id = @pack360_id OR pack360_qr = @pack360_id;

        IF @resolved_pack360_id IS NULL
        BEGIN
            THROW 51000, N'Không tìm thấy Kiện 360.', 1;
        END

        IF @status IN ('ALLOCATED', 'PICKED', 'STAGED', 'SHIPPED')
        BEGIN
            THROW 51000, N'Kiện 360 đang trong quá trình xuất kho, không được chuyển đơn OEM.', 1;
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.tbl_oem_orders WHERE oem_order_no = @target_oem_order_no
        )
        BEGIN
            THROW 51000, N'Đơn hàng OEM mới không tồn tại trong hệ thống.', 1;
        END

        SELECT TOP (1) @product_code = t.product_code
        FROM dbo.pack360_unit u
        INNER JOIN dbo.tbl_thung60_kho t ON u.id_60 = t.id_60
        WHERE u.pack360_id = @resolved_pack360_id AND u.is_current = 1;

        IF @product_code IS NOT NULL
           AND NOT EXISTS (
               SELECT 1
               FROM dbo.tbl_oem_orders
               WHERE oem_order_no = @target_oem_order_no
                 AND product_code = @product_code
           )
        BEGIN
            THROW 51000, N'Sản phẩm của Kiện 360 không khớp với sản phẩm của đơn OEM mới.', 1;
        END

        UPDATE dbo.pack360_header
        SET oem_order_no = @target_oem_order_no,
            oem_batch_no = ISNULL(@target_oem_batch_no, 1)
        WHERE pack360_id = @resolved_pack360_id;

        UPDATE t
        SET current_oem_order_no = @target_oem_order_no,
            current_oem_batch_no = ISNULL(@target_oem_batch_no, 1)
        FROM dbo.tbl_thung60_kho t
        INNER JOIN dbo.pack360_unit u ON t.id_60 = u.id_60
        WHERE u.pack360_id = @resolved_pack360_id AND u.is_current = 1;

        INSERT INTO dbo.pack360_event
            (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id, message)
        VALUES
            (NEWID(), @resolved_pack360_id, 'TRANSFER_OEM', @status, @status, @user_code, @reqId,
             N'Chuyển đơn OEM sang ' + @target_oem_order_no + COALESCE(N'. Lý do: ' + @reason, N''));

        INSERT INTO dbo.thung60_event
            (event_id, id_60, event_type, old_status, new_status, source_document_no, performed_by, request_id)
        SELECT NEWID(), u.id_60, 'TRANSFER_OEM', t.status, t.status,
               @target_oem_order_no, @user_code, @reqId
        FROM dbo.pack360_unit u
        INNER JOIN dbo.tbl_thung60_kho t ON u.id_60 = t.id_60
        WHERE u.pack360_id = @resolved_pack360_id AND u.is_current = 1;

        INSERT INTO dbo.audit_log
            (object_type, object_id, action, old_value, new_value, performed_by)
        VALUES
            ('PACK360', @resolved_pack360_id, 'TRANSFER_OEM',
             ISNULL(@old_oem_order_no, 'NULL'), @target_oem_order_no, @user_code);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
