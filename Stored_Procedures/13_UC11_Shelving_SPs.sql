USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. Thêm cột mới vào bảng location (nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.location') AND name = 'x_coord')
BEGIN
    ALTER TABLE dbo.location ADD x_coord FLOAT NULL;
    ALTER TABLE dbo.location ADD y_coord FLOAT NULL;
    ALTER TABLE dbo.location ADD z_coord FLOAT NULL;
    ALTER TABLE dbo.location ADD distance_to_staging FLOAT NULL;
END
GO

-- 2. SP Lên Kệ (Putaway)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC11_PutawayPallet
    @PalletId NVARCHAR(50),
    @LocationCode NVARCHAR(50),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    
    -- Kiểm tra Trạng thái Pallet (Phải là ACTIVE hoặc CREATED, vì đôi khi Pallet vừa lập xong)
    DECLARE @PalletStatus NVARCHAR(30);
    SELECT @PalletStatus = status FROM dbo.pallet WITH (UPDLOCK) WHERE pallet_id = @PalletId;
    
    IF @PalletStatus IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Pallet không tồn tại.', 16, 1);
        RETURN;
    END

    IF @PalletStatus NOT IN ('ACTIVE', 'CREATED')
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Pallet phải ở trạng thái ACTIVE mới được phép lên kệ. Trạng thái hiện tại: %s', 16, 1, @PalletStatus);
        RETURN;
    END

    -- Kiểm tra Trạng thái Kệ (Phải là EMPTY)
    DECLARE @LocationStatus NVARCHAR(30);
    SELECT @LocationStatus = status FROM dbo.location WHERE location_code = @LocationCode;

    IF @LocationStatus IS NULL
    BEGIN
        -- Nếu location chưa tồn tại trong DB, tạo mới cho phép (Tính năng tự học vị trí kệ)
        INSERT INTO dbo.location (location_code, location_type, status)
        VALUES (@LocationCode, 'SHELF', 'EMPTY');
        SET @LocationStatus = 'EMPTY';
    END

    IF @LocationStatus <> 'EMPTY'
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Kệ %s không trống (Trạng thái hiện tại: %s). Vui lòng chọn kệ khác.', 16, 1, @LocationCode, @LocationStatus);
        RETURN;
    END

    -- 1. Cập nhật Pallet
    UPDATE dbo.pallet
    SET status = 'IN_STORAGE',
        current_location_code = @LocationCode
    WHERE pallet_id = @PalletId;

    -- 2. Cập nhật Kệ
    UPDATE dbo.location
    SET status = 'OCCUPIED'
    WHERE location_code = @LocationCode;

    -- 3. Lưu Lịch sử
    INSERT INTO dbo.pallet_location_history (pallet_id, location_code, placed_at)
    VALUES (@PalletId, @LocationCode, GETDATE());
    
    -- 4. Audit Log
    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @PalletId, 'PUTAWAY', @LocationCode, @UserName, '127.0.0.1');

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Cất hàng lên kệ thành công' AS Message;
END;
GO

-- 3. SP Xuống Kệ (Letdown)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC11_LetdownPallet
    @PalletId NVARCHAR(50),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    
    -- Lấy thông tin Pallet
    DECLARE @PalletStatus NVARCHAR(30);
    DECLARE @CurrentLocation NVARCHAR(50);
    SELECT @PalletStatus = status, @CurrentLocation = current_location_code 
    FROM dbo.pallet 
    WHERE pallet_id = @PalletId;
    
    IF @PalletStatus IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Pallet không tồn tại.', 16, 1);
        RETURN;
    END

    IF @PalletStatus <> 'IN_STORAGE' OR @CurrentLocation IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Pallet không nằm trên kệ kho (Trạng thái hiện tại: %s).', 16, 1, @PalletStatus);
        RETURN;
    END

    -- 1. Trả Pallet về ACTIVE
    UPDATE dbo.pallet
    SET status = 'ACTIVE',
        current_location_code = NULL
    WHERE pallet_id = @PalletId;

    -- 2. Đổi Kệ về EMPTY
    UPDATE dbo.location
    SET status = 'EMPTY'
    WHERE location_code = @CurrentLocation;

    -- 3. Cập nhật Lịch sử (Đóng Record)
    UPDATE dbo.pallet_location_history
    SET removed_at = GETDATE()
    WHERE pallet_id = @PalletId AND location_code = @CurrentLocation AND removed_at IS NULL;
    
    -- 4. Audit Log
    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @PalletId, 'LETDOWN', 'NULL', @UserName, '127.0.0.1');

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Lấy hàng xuống kệ thành công' AS Message;
END;
GO
