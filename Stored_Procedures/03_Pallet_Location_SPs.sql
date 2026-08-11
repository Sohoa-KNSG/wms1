-- Legacy compatibility wrapper for pallet attachment.
-- The canonical implementation is dbo.usp_WMS_UC06_AddUnitToPallet.
CREATE OR ALTER PROCEDURE dbo.usp_Pallet_AttachUnit
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
                   @pallet_id AS object_code,
                   @request_id AS request_id;
            RETURN;
        END

        IF @ExistingStatus IS NOT NULL
        BEGIN
            THROW 51000, N'X-Request-Id đang được xử lý hoặc đã thất bại.', 1;
        END

        INSERT INTO dbo.command_request_log(request_id, command_type, status)
        VALUES (@request_id, 'Pallet_AttachUnit', 'PROCESSING');

        EXEC dbo.usp_WMS_UC06_AddUnitToPallet
            @PalletId = @pallet_id,
            @UnitId = @unit_id,
            @UnitType = @unit_type,
            @UserName = @user_code;

        UPDATE dbo.command_request_log
        SET status = 'SUCCESS'
        WHERE request_id = @request_id;

        COMMIT TRANSACTION;

        SELECT 'SUCCESS' AS status,
               N'Gán vào pallet thành công' AS message,
               NULL AS error_code,
               @pallet_id AS object_code,
               @request_id AS request_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
