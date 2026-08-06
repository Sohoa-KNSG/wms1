USE WMS1;
GO

-- =========================================================================
-- SECURITY SCHEMA (UC01: RBAC - Role Based Access Control)
-- =========================================================================

-- 1. sec_user: Bảng lưu thông tin người dùng
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_user')
BEGIN
    CREATE TABLE sec_user (
        user_id NVARCHAR(50) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(100),
        is_active BIT DEFAULT 1,
        failed_attempts INT DEFAULT 0,
        lockout_until DATETIME,
        must_change_password BIT DEFAULT 0,
        last_password_changed_at DATETIME,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
END
ELSE
BEGIN
    IF COL_LENGTH('sec_user', 'must_change_password') IS NULL
    BEGIN
        ALTER TABLE sec_user ADD must_change_password BIT DEFAULT 0;
    END

    IF COL_LENGTH('sec_user', 'last_password_changed_at') IS NULL
    BEGIN
        ALTER TABLE sec_user ADD last_password_changed_at DATETIME;
    END

    IF COL_LENGTH('sec_user', 'failed_attempts') IS NULL
    BEGIN
        ALTER TABLE sec_user ADD failed_attempts INT DEFAULT 0;
    END

    IF COL_LENGTH('sec_user', 'lockout_until') IS NULL
    BEGIN
        ALTER TABLE sec_user ADD lockout_until DATETIME;
    END
END
GO

-- Bảng lưu log đổi mật khẩu (UC00.1)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_user_password_log')
BEGIN
    CREATE TABLE sec_user_password_log (
        log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id NVARCHAR(50),
        username NVARCHAR(50) NOT NULL,
        action_type NVARCHAR(50) NOT NULL,
        result NVARCHAR(30) NOT NULL,
        message NVARCHAR(500),
        client_ip NVARCHAR(50),
        user_agent NVARCHAR(500),
        created_at DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- Stored Procedure: usp_WMS_AUTH_ChangePassword (UC00.1)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_ChangePassword
    @UserID NVARCHAR(50),
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
    FROM sec_user WHERE user_id = @UserID;
    
    IF @UserName IS NULL
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END
    
    IF @IsActive = 0
    BEGIN
        INSERT INTO sec_user_password_log(user_id, username, action_type, result, message, client_ip, user_agent)
        VALUES(@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', N'Tài khoản đang bị khóa', @ClientIP, @UserAgent);
        RAISERROR(N'Tài khoản đang bị khóa.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;
    
    UPDATE sec_user
    SET password_hash = @NewPasswordHash,
        must_change_password = 0,
        last_password_changed_at = GETDATE(),
        updated_at = GETDATE()
    WHERE user_id = @UserID;

    INSERT INTO sec_user_password_log(user_id, username, action_type, result, message, client_ip, user_agent)
    VALUES(@UserID, @UserName, N'CHANGE_PASSWORD', N'SUCCESS', N'Đổi mật khẩu thành công', @ClientIP, @UserAgent);

    COMMIT TRANSACTION;
END
GO

-- Stored Procedure: usp_WMS_AUTH_AdminResetPassword (UC01.2)
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
    FROM sec_user WHERE user_id = @TargetUserID;
    
    IF @TargetUserName IS NULL
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;
    
    UPDATE sec_user
    SET password_hash = @DefaultPasswordHash,
        must_change_password = 1,
        failed_attempts = 0,
        lockout_until = NULL,
        last_password_changed_at = GETDATE(),
        updated_at = GETDATE()
    WHERE user_id = @TargetUserID;

    INSERT INTO sec_user_password_log(user_id, username, action_type, result, message, client_ip, user_agent)
    VALUES(@TargetUserID, @TargetUserName, N'ADMIN_RESET', N'SUCCESS', N'Reset password bởi admin ' + @AdminUserName, @ClientIP, @UserAgent);

    COMMIT TRANSACTION;
END
GO

-- 2. sec_role: Bảng lưu danh mục vai trò
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_role')
BEGIN
    CREATE TABLE sec_role (
        role_id NVARCHAR(50) PRIMARY KEY,
        role_name NVARCHAR(100) NOT NULL,
        description NVARCHAR(255)
    );
END
GO

-- 3. sec_permission: Bảng lưu danh mục quyền hạn
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_permission')
BEGIN
    CREATE TABLE sec_permission (
        permission_id NVARCHAR(50) PRIMARY KEY,
        permission_name NVARCHAR(100) NOT NULL,
        resource NVARCHAR(100),
        action NVARCHAR(50)
    );
END
GO

-- 4. sec_user_role: Mapping Người dùng - Vai trò
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_user_role')
BEGIN
    CREATE TABLE sec_user_role (
        user_id NVARCHAR(50) NOT NULL,
        role_id NVARCHAR(50) NOT NULL,
        PRIMARY KEY (user_id, role_id),
        CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES sec_user(user_id),
        CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES sec_role(role_id)
    );
END
GO

-- 5. sec_role_permission: Mapping Vai trò - Quyền hạn
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sec_role_permission')
BEGIN
    CREATE TABLE sec_role_permission (
        role_id NVARCHAR(50) NOT NULL,
        permission_id NVARCHAR(50) NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES sec_role(role_id),
        CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES sec_permission(permission_id)
    );
END
GO

-- =========================================================================
-- STORED PROCEDURES (UC23)
-- =========================================================================

-- Stored Procedure: usp_WMS_AUTH_CreateUser (UC23.1)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_CreateUser
    @Username NVARCHAR(50),
    @PasswordHash NVARCHAR(255),
    @FullName NVARCHAR(100),
    @Roles NVARCHAR(MAX) -- Chuỗi các RoleID cách nhau bằng dấu phẩy
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    IF EXISTS (SELECT 1 FROM sec_user WHERE username = @Username)
    BEGIN
        RAISERROR(N'Tài khoản đã tồn tại.', 16, 1);
        RETURN;
    END

    -- Generate a unique user_id, ví dụ 'U' + timestamp hoặc đơn giản dùng chuỗi random (ở đây để đơn giản dùng NEWID, nhưng vì giới hạn NVARCHAR(50) nên ta convert)
    DECLARE @NewUserID NVARCHAR(50) = LEFT(CAST(NEWID() AS NVARCHAR(50)), 8);

    BEGIN TRANSACTION;
    
    INSERT INTO sec_user (user_id, username, password_hash, full_name, is_active, must_change_password)
    VALUES (@NewUserID, @Username, @PasswordHash, @FullName, 1, 1);

    -- Insert roles
    IF @Roles IS NOT NULL AND LTRIM(RTRIM(@Roles)) <> ''
    BEGIN
        INSERT INTO sec_user_role (user_id, role_id)
        SELECT @NewUserID, value
        FROM STRING_SPLIT(@Roles, ',');
    END

    COMMIT TRANSACTION;
END
GO

-- Stored Procedure: usp_WMS_AUTH_UpdateUserRoles (UC23.4)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_UpdateUserRoles
    @TargetUserID NVARCHAR(50),
    @Roles NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    IF NOT EXISTS (SELECT 1 FROM sec_user WHERE user_id = @TargetUserID)
    BEGIN
        RAISERROR(N'Tài khoản không tồn tại.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;
    
    -- Xóa quyền cũ
    DELETE FROM sec_user_role WHERE user_id = @TargetUserID;

    -- Thêm quyền mới
    IF @Roles IS NOT NULL AND LTRIM(RTRIM(@Roles)) <> ''
    BEGIN
        INSERT INTO sec_user_role (user_id, role_id)
        SELECT @TargetUserID, value
        FROM STRING_SPLIT(@Roles, ',');
    END

    COMMIT TRANSACTION;
END
GO

-- =========================================================================
-- SEED DATA (Dữ liệu mẫu)
-- =========================================================================
-- Mật khẩu mặc định cho các tài khoản mẫu dưới đây là '123456'.
-- Chuỗi hash bcrypt (salt 10) tương ứng của '123456' là: 
-- $2b$10$wE2fI7qL4X1G4O.5Q3jX5O2C6Y3/g2g4x.Yf/xOQ4V5K.tqG/XvC.

BEGIN TRY
    BEGIN TRANSACTION;

    -- Xóa dữ liệu cũ nếu có (để nạp lại cho demo)
    DELETE FROM sec_user_role;
    DELETE FROM sec_role_permission;
    DELETE FROM sec_user;
    DELETE FROM sec_role;
    DELETE FROM sec_permission;

    -- Roles
    INSERT INTO sec_role (role_id, role_name, description) VALUES
    ('IT_ADMIN', N'Quản trị hệ thống', N'Quyền truy cập cao nhất'),
    ('THU_KHO', N'Thủ kho', N'Kiểm soát và xác nhận nhập/xuất'),
    ('NHAN_VIEN', N'Nhân viên kho', N'Thực hiện quét mã và thao tác vật lý');

    -- =========================================================================
    -- SEC-01: Permissions — permission_id phải khớp 1-1 với PolicyNames.cs constants
    -- =========================================================================
    INSERT INTO sec_permission (permission_id, permission_name, resource, action) VALUES
    ('Receipt.Read',        N'Xem danh sách phiếu nhập',    'Receipt',        'Read'),
    ('Receipt.Scan',        N'Quét mã nhập kho',             'Receipt',        'Scan'),
    ('Receipt.Confirm',     N'Xác nhận nhập kho',            'Receipt',        'Confirm'),
    ('Receipt.Manage',      N'Quản lý phiếu nhập',           'Receipt',        'Manage'),
    ('Pack360.Read',        N'Xem thông tin pack360',        'Pack360',        'Read'),
    ('Pack360.Scan',        N'Quét đơn vị pack360',          'Pack360',        'Scan'),
    ('Pack360.Complete',    N'Hoàn tất pack360',             'Pack360',        'Complete'),
    ('Pack360.Cancel',      N'Hủy pack360',                  'Pack360',        'Cancel'),
    ('Pack360.Release',     N'Release pack360',              'Pack360',        'Release'),
    ('Pack360.Detach',      N'Tách đơn vị pack360',          'Pack360',        'Detach'),
    ('Pack360.Transfer',    N'Chuyển đơn hàng pack360',     'Pack360',        'Transfer'),
    ('Pallet.Read',         N'Xem pallet',                   'Pallet',         'Read'),
    ('Pallet.Manage',       N'Quản lý pallet',               'Pallet',         'Manage'),
    ('Picking.Read',        N'Xem lệnh xuất kho',            'Picking',        'Read'),
    ('Picking.Scan',        N'Quét xuất kho',                'Picking',        'Scan'),
    ('Picking.Manage',      N'Quản lý xuất kho',             'Picking',        'Manage'),
    ('Picking.Approve',     N'Phê duyệt xuất kho',           'Picking',        'Approve'),
    ('Picking.Ship',        N'Xác nhận xuất cổng',           'Picking',        'Ship'),
    ('Export.Read',         N'Xem yêu cầu xuất',             'Export',         'Read'),
    ('Export.Manage',       N'Quản lý lệnh xuất',            'Export',         'Manage'),
    ('Oem.Read',            N'Xem đơn hàng OEM',             'Oem',            'Read'),
    ('Oem.Manage',          N'Quản lý đơn hàng OEM',         'Oem',            'Manage'),
    ('MasterData.Read',     N'Xem master data',              'MasterData',     'Read'),
    ('MasterData.Manage',   N'Quản lý master data',          'MasterData',     'Manage'),
    ('Reports.Read',        N'Xem báo cáo tồn kho',          'Reports',        'Read'),
    ('Ledger.Read',         N'Xem sổ cái kép',               'Ledger',         'Read'),
    ('Trace.Read',          N'Tra cứu vết hàng hóa',         'Trace',          'Read'),
    ('Reconciliation.Read', N'Xem đối soát tồn kho',         'Reconciliation', 'Read'),
    ('Admin.Users.Manage',  N'Quản lý tài khoản người dùng', 'Admin',          'Users.Manage');

    -- IT_ADMIN: Toàn quyền
    INSERT INTO sec_role_permission (role_id, permission_id)
    SELECT 'IT_ADMIN', permission_id FROM sec_permission;

    -- THU_KHO: Nhập kho đầy đủ + xem OEM/Report/Ledger + phê duyệt xuất
    INSERT INTO sec_role_permission (role_id, permission_id) VALUES
    ('THU_KHO', 'Receipt.Read'),    ('THU_KHO', 'Receipt.Scan'),
    ('THU_KHO', 'Receipt.Confirm'), ('THU_KHO', 'Receipt.Manage'),
    ('THU_KHO', 'Pack360.Read'),    ('THU_KHO', 'Pack360.Scan'),
    ('THU_KHO', 'Pack360.Complete'),('THU_KHO', 'Pack360.Cancel'),
    ('THU_KHO', 'Pack360.Release'), ('THU_KHO', 'Pallet.Read'),
    ('THU_KHO', 'Pallet.Manage'),   ('THU_KHO', 'Oem.Read'),
    ('THU_KHO', 'Picking.Read'),    ('THU_KHO', 'Picking.Approve'),
    ('THU_KHO', 'Picking.Ship'),    ('THU_KHO', 'Export.Read'),
    ('THU_KHO', 'Reports.Read'),    ('THU_KHO', 'Ledger.Read'),
    ('THU_KHO', 'Trace.Read'),      ('THU_KHO', 'Reconciliation.Read'),
    ('THU_KHO', 'MasterData.Read');

    -- NHAN_VIEN: Quét + xem cơ bản
    INSERT INTO sec_role_permission (role_id, permission_id) VALUES
    ('NHAN_VIEN', 'Receipt.Read'),  ('NHAN_VIEN', 'Receipt.Scan'),
    ('NHAN_VIEN', 'Pack360.Read'),  ('NHAN_VIEN', 'Pack360.Scan'),
    ('NHAN_VIEN', 'Pallet.Read'),   ('NHAN_VIEN', 'Picking.Read'),
    ('NHAN_VIEN', 'Picking.Scan'),  ('NHAN_VIEN', 'Oem.Read'),
    ('NHAN_VIEN', 'Trace.Read');

    -- Users (Password = 123456)
    INSERT INTO sec_user (user_id, username, password_hash, full_name, must_change_password) VALUES
    ('U001', 'admin',    '$2b$10$wE2fI7qL4X1G4O.5Q3jX5O2C6Y3/g2g4x.Yf/xOQ4V5K.tqG/XvC.', N'IT Admin', 0),
    ('U002', 'thukho',   '$2b$10$wE2fI7qL4X1G4O.5Q3jX5O2C6Y3/g2g4x.Yf/xOQ4V5K.tqG/XvC.', N'Thủ kho A', 1),
    ('U003', 'nhanvien', '$2b$10$wE2fI7qL4X1G4O.5Q3jX5O2C6Y3/g2g4x.Yf/xOQ4V5K.tqG/XvC.', N'Nhân viên kho B', 0);

    -- User - Role Mapping
    INSERT INTO sec_user_role (user_id, role_id) VALUES
    ('U001', 'IT_ADMIN'),
    ('U002', 'THU_KHO'),
    ('U003', 'NHAN_VIEN');

    COMMIT;
END TRY
BEGIN CATCH
    ROLLBACK;
    THROW;
END CATCH
GO
