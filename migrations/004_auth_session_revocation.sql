USE WMS1;
GO

IF COL_LENGTH('dbo.sec_user', 'must_change_password') IS NULL
BEGIN
    ALTER TABLE dbo.sec_user
        ADD must_change_password BIT NOT NULL
            CONSTRAINT DF_sec_user_must_change_password DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.sec_user', 'last_password_changed_at') IS NULL
BEGIN
    ALTER TABLE dbo.sec_user ADD last_password_changed_at DATETIME NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.sec_permission WHERE permission_id = 'StockType.Manage')
    INSERT INTO dbo.sec_permission(permission_id, permission_name, resource, action)
    VALUES ('StockType.Manage', N'Quản lý loại tồn kho', 'StockType', 'Manage');

IF NOT EXISTS (SELECT 1 FROM dbo.sec_permission WHERE permission_id = 'InventoryClosing.Manage')
    INSERT INTO dbo.sec_permission(permission_id, permission_name, resource, action)
    VALUES ('InventoryClosing.Manage', N'Kết chuyển và chốt tồn kho', 'InventoryClosing', 'Manage');

IF NOT EXISTS (SELECT 1 FROM dbo.sec_permission WHERE permission_id = 'SystemMemory.Manage')
    INSERT INTO dbo.sec_permission(permission_id, permission_name, resource, action)
    VALUES ('SystemMemory.Manage', N'Quản lý lịch sử hệ thống', 'SystemMemory', 'Manage');

INSERT INTO dbo.sec_role_permission(role_id, permission_id)
SELECT role_id, permission_id
FROM (VALUES
    ('IT_ADMIN', 'StockType.Manage'),
    ('IT_ADMIN', 'InventoryClosing.Manage'),
    ('IT_ADMIN', 'SystemMemory.Manage'),
    ('THU_KHO', 'StockType.Manage'),
    ('THU_KHO', 'InventoryClosing.Manage')
) AS required_permission(role_id, permission_id)
WHERE EXISTS (SELECT 1 FROM dbo.sec_role WHERE role_id = required_permission.role_id)
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.sec_role_permission existing
      WHERE existing.role_id = required_permission.role_id
        AND existing.permission_id = required_permission.permission_id
  );
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_ChangePassword
    @UserID NVARCHAR(50),
    @ExpectedCurrentPasswordHash NVARCHAR(500),
    @NewPasswordHash NVARCHAR(500),
    @ClientIP NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @UserName NVARCHAR(50);
    DECLARE @IsActive BIT;

    SELECT @UserName = username, @IsActive = is_active
    FROM dbo.sec_user
    WHERE user_id = @UserID;

    IF @UserName IS NULL
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END

    IF @IsActive = 0
    BEGIN
        INSERT INTO dbo.sec_user_password_log
            (user_id, username, action_type, result, message, client_ip, user_agent)
        VALUES
            (@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', N'Tài khoản đang bị khóa', @ClientIP, @UserAgent);
        RAISERROR(N'Tài khoản đang bị khóa.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    UPDATE dbo.sec_user
    SET password_hash = @NewPasswordHash,
        must_change_password = 0,
        last_password_changed_at = GETUTCDATE(),
        updated_at = GETUTCDATE()
    WHERE user_id = @UserID
      AND password_hash = @ExpectedCurrentPasswordHash;

    IF @@ROWCOUNT = 0
    BEGIN
        INSERT INTO dbo.sec_user_password_log
            (user_id, username, action_type, result, message, client_ip, user_agent)
        VALUES
            (@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', N'Mật khẩu đã thay đổi bởi một phiên khác', @ClientIP, @UserAgent);
        COMMIT TRANSACTION;
        RAISERROR(N'Mật khẩu đã thay đổi bởi một phiên khác. Vui lòng đăng nhập lại.', 16, 1);
        RETURN;
    END

    INSERT INTO dbo.sec_user_password_log
        (user_id, username, action_type, result, message, client_ip, user_agent)
    VALUES
        (@UserID, @UserName, N'CHANGE_PASSWORD', N'SUCCESS', N'Đổi mật khẩu thành công', @ClientIP, @UserAgent);

    COMMIT TRANSACTION;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_AdminResetPassword
    @TargetUserID NVARCHAR(50),
    @AdminUserName NVARCHAR(50),
    @DefaultPasswordHash NVARCHAR(500),
    @ClientIP NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @TargetUserName NVARCHAR(50);
    SELECT @TargetUserName = username
    FROM dbo.sec_user
    WHERE user_id = @TargetUserID;

    IF @TargetUserName IS NULL
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    UPDATE dbo.sec_user
    SET password_hash = @DefaultPasswordHash,
        must_change_password = 1,
        failed_attempts = 0,
        lockout_until = NULL,
        last_password_changed_at = GETUTCDATE(),
        updated_at = GETUTCDATE()
    WHERE user_id = @TargetUserID;

    INSERT INTO dbo.sec_user_password_log
        (user_id, username, action_type, result, message, client_ip, user_agent)
    VALUES
        (@TargetUserID, @TargetUserName, N'ADMIN_RESET', N'SUCCESS', N'Reset password bởi admin ' + @AdminUserName, @ClientIP, @UserAgent);

    COMMIT TRANSACTION;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_UpdateUserRoles
    @TargetUserID NVARCHAR(50),
    @Roles NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.sec_user WHERE user_id = @TargetUserID)
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    DELETE FROM dbo.sec_user_role
    WHERE user_id = @TargetUserID;

    IF @Roles IS NOT NULL AND LTRIM(RTRIM(@Roles)) <> ''
    BEGIN
        INSERT INTO dbo.sec_user_role (user_id, role_id)
        SELECT @TargetUserID, LTRIM(RTRIM(value))
        FROM STRING_SPLIT(@Roles, ',')
        WHERE LTRIM(RTRIM(value)) <> '';
    END

    UPDATE dbo.sec_user
    SET last_password_changed_at = GETUTCDATE(),
        updated_at = GETUTCDATE()
    WHERE user_id = @TargetUserID;

    COMMIT TRANSACTION;
END
GO
