-- UC05: Persist scale/print metadata while preserving Pack360 accounting.
-- Safe to run repeatedly on SQL Server.

IF COL_LENGTH('pack360_header', 'weight_source') IS NULL
    ALTER TABLE pack360_header ADD weight_source VARCHAR(20) NULL;
GO

IF COL_LENGTH('pack360_header', 'manual_weight_reason') IS NULL
    ALTER TABLE pack360_header ADD manual_weight_reason NVARCHAR(255) NULL;
GO

IF COL_LENGTH('pack360_header', 'print_job_id') IS NULL
    ALTER TABLE pack360_header ADD print_job_id VARCHAR(50) NULL;
GO

IF COL_LENGTH('pack360_header', 'print_status') IS NULL
    ALTER TABLE pack360_header ADD print_status VARCHAR(20) NULL;
GO

IF OBJECT_ID('pack360_reprint_audit', 'U') IS NULL
BEGIN
    CREATE TABLE pack360_reprint_audit (
        audit_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        pack360_id VARCHAR(50) NOT NULL,
        reason NVARCHAR(255) NOT NULL,
        user_code VARCHAR(50) NOT NULL,
        print_job_id VARCHAR(50) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF OBJECT_ID('sec_permission', 'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sec_permission WHERE permission_id = 'Pack360.Reprint')
BEGIN
    INSERT INTO sec_permission (permission_id, permission_name, resource, action)
    VALUES ('Pack360.Reprint', N'In lại tem pack360', 'Pack360', 'Reprint');
END
GO

IF OBJECT_ID('sec_role_permission', 'U') IS NOT NULL
   AND EXISTS (SELECT 1 FROM sec_role WHERE role_id = 'THU_KHO')
   AND NOT EXISTS (
       SELECT 1 FROM sec_role_permission
       WHERE role_id = 'THU_KHO' AND permission_id = 'Pack360.Reprint'
   )
BEGIN
    INSERT INTO sec_role_permission (role_id, permission_id)
    VALUES ('THU_KHO', 'Pack360.Reprint');
END
GO

CREATE OR ALTER PROCEDURE usp_Pack360_Complete
    @pack360_id NVARCHAR(50),
    @weight DECIMAL(18,2),
    @user_code NVARCHAR(50),
    @weight_source VARCHAR(20) = 'SCALE',
    @manual_weight_reason NVARCHAR(255) = NULL,
    @print_job_id VARCHAR(50) = NULL,
    @print_status VARCHAR(20) = 'PENDING'
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @status NVARCHAR(30);
    DECLARE @first_qr_60 NVARCHAR(255);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @channel NVARCHAR(50);
    DECLARE @p1 INT;
    DECLARE @p2 INT;
    DECLARE @p3 INT;
    DECLARE @p4 INT;
    DECLARE @dateStr NVARCHAR(10);
    DECLARE @prefix NVARCHAR(100);
    DECLARE @seq INT;
    DECLARE @new_qr NVARCHAR(255);

    BEGIN TRY
        BEGIN TRANSACTION;

        SELECT @status = status
        FROM pack360_header WITH (UPDLOCK, HOLDLOCK)
        WHERE pack360_id = @pack360_id;

        IF ISNULL(@status, '') <> 'OPEN'
            RAISERROR(N'Pack360 không tồn tại hoặc không ở trạng thái OPEN', 16, 1);

        SELECT TOP 1
            @first_qr_60 = t.qr_60,
            @product_code = t.product_code
        FROM pack360_unit u
        INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
        WHERE u.pack360_id = @pack360_id AND u.is_current = 1;

        IF @first_qr_60 IS NULL OR @product_code IS NULL
            RAISERROR(N'Pack360 không có thùng 60 hợp lệ để hoàn tất', 16, 1);

        SET @p1 = CHARINDEX('/', @first_qr_60);
        SET @p2 = CHARINDEX('/', @first_qr_60, @p1 + 1);
        SET @p3 = CHARINDEX('/', @first_qr_60, @p2 + 1);
        SET @p4 = CHARINDEX('/', @first_qr_60, @p3 + 1);

        IF @p3 = 0 OR @p4 = 0
            RAISERROR(N'QR thùng 60 không đúng định dạng để xác định kênh', 16, 1);

        SET @channel = SUBSTRING(@first_qr_60, @p3 + 1, @p4 - @p3 - 1);
        SET @dateStr = FORMAT(GETDATE(), 'dd/MM/yy');
        SET @prefix = @channel + '/' + @product_code + '/' + @dateStr + '/';

        SELECT @seq = ISNULL(MAX(CAST(REPLACE(pack360_qr, @prefix, '') AS INT)), 0) + 1
        FROM pack360_header WITH (UPDLOCK, HOLDLOCK)
        WHERE pack360_qr LIKE @prefix + '%'
          AND ISNUMERIC(REPLACE(pack360_qr, @prefix, '')) = 1;

        SET @new_qr = @prefix + CAST(@seq AS NVARCHAR(10));

        UPDATE pack360_header
        SET status = 'COMPLETED',
            weight = @weight,
            completed_by = @user_code,
            completed_at = GETDATE(),
            pack360_qr = @new_qr,
            weight_source = @weight_source,
            manual_weight_reason = @manual_weight_reason,
            print_job_id = @print_job_id,
            print_status = @print_status
        WHERE pack360_id = @pack360_id;

        INSERT INTO pack360_event
            (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
        VALUES
            (NEWID(), @pack360_id, 'COMPLETE_PACK', 'OPEN', 'COMPLETED', @user_code, NEWID());

        IF OBJECT_ID('stock_transaction_book', 'U') IS NOT NULL
        BEGIN
            INSERT INTO stock_transaction_book
                (transaction_id, transaction_type, object_id, qty, created_at, created_by)
            VALUES
                (NEWID(), 'PACK360_COMPLETE', @pack360_id, @weight, GETDATE(), @user_code);
        END

        IF OBJECT_ID('inventory_ledger', 'U') IS NOT NULL
        BEGIN
            INSERT INTO inventory_ledger
                (ledger_id, product_code, change_qty, reason, created_at, created_by)
            VALUES
                (NEWID(), @product_code, @weight, 'PACK360_COMPLETE', GETDATE(), @user_code);
        END

        UPDATE tbl_thung60_kho
        SET status = 'PACKED_360'
        WHERE current_pack360_id = @pack360_id;

        COMMIT TRANSACTION;

        SELECT
            @new_qr AS Pack360_QR,
            @weight AS Weight,
            @product_code AS ProductCode,
            @channel AS Channel;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE usp_Pack360_Reprint_Audit
    @pack360_id VARCHAR(50),
    @reason NVARCHAR(255),
    @user_code VARCHAR(50),
    @print_job_id VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM pack360_header WITH (UPDLOCK, HOLDLOCK)
            WHERE pack360_id = @pack360_id AND status = 'COMPLETED'
        )
            RAISERROR(N'Chỉ có thể in lại Pack360 ở trạng thái COMPLETED', 16, 1);

        SET @print_job_id = REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', '');

        INSERT INTO pack360_reprint_audit
            (pack360_id, reason, user_code, print_job_id, created_at)
        VALUES
            (@pack360_id, @reason, @user_code, @print_job_id, SYSUTCDATETIME());

        UPDATE pack360_header
        SET print_job_id = @print_job_id,
            print_status = 'PENDING'
        WHERE pack360_id = @pack360_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
