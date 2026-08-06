USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. SP Tháo dỡ Unit khỏi Pallet (Depalletizing)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_1_RemoveUnit
    @PalletId NVARCHAR(50) = NULL,
    @UnitId NVARCHAR(50),
    @UnitType NVARCHAR(30), -- 'THUNG60' hoặc 'PACK360'
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    
    -- Tự động tìm Pallet ID nếu không truyền vào
    IF @PalletId IS NULL OR @PalletId = ''
    BEGIN
        IF @UnitType = 'THUNG60'
            SELECT @PalletId = current_pallet_id FROM dbo.tbl_thung60_kho WHERE id_60 = @UnitId;
        ELSE IF @UnitType = 'PACK360'
            SELECT @PalletId = pallet_id FROM dbo.pallet_unit WHERE unit_id = @UnitId AND unit_type = 'PACK360' AND is_current = 1;
    END

    -- Kiểm tra Unit có nằm trên Pallet này không
    IF @PalletId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.pallet_unit WHERE pallet_id = @PalletId AND unit_id = @UnitId AND unit_type = @UnitType AND is_current = 1)
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Đơn vị hàng hóa không nằm trên bất kỳ Pallet nào hoặc không hợp lệ.', 16, 1);
        RETURN;
    END

    -- Gỡ khỏi Pallet (Cập nhật is_current = 0)
    UPDATE dbo.pallet_unit
    SET is_current = 0
    WHERE pallet_id = @PalletId AND unit_id = @UnitId AND unit_type = @UnitType AND is_current = 1;

    -- Xử lý tùy theo Unit Type
    IF @UnitType = 'THUNG60'
    BEGIN
        -- Update tbl_thung60_kho về AVAILABLE và xóa Pallet ID
        UPDATE dbo.tbl_thung60_kho
        SET current_pallet_id = NULL,
            status = 'AVAILABLE'
        WHERE id_60 = @UnitId;

        -- Ghi event
        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by, request_id)
        VALUES (NEWID(), @UnitId, 'DEPALLETIZED', 'AVAILABLE', @UserName, NEWID());
    END
    ELSE IF @UnitType = 'PACK360'
    BEGIN
        -- Cập nhật đồng loạt các Thùng 60 bên trong
        UPDATE t
        SET t.current_pallet_id = NULL,
            t.status = 'AVAILABLE'
        FROM dbo.tbl_thung60_kho t
        INNER JOIN dbo.pack360_unit p ON t.id_60 = p.id_60
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;

        -- Ghi event
        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by, request_id)
        SELECT NEWID(), p.id_60, 'DEPALLETIZED', 'AVAILABLE', @UserName, NEWID()
        FROM dbo.pack360_unit p
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;
    END

    -- Ghi Audit Log cho Pallet
    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @PalletId, 'REMOVE_UNIT', @UnitId, @UserName, '127.0.0.1');

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Tháo dỡ hàng khỏi Pallet thành công' AS Message;
END;
GO

-- 2. SP Chuyển Unit sang Pallet khác (Transfer / Re-palletizing)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_1_TransferUnit
    @OldPalletId NVARCHAR(50) = NULL,
    @NewPalletId NVARCHAR(50),
    @UnitId NVARCHAR(50),
    @UnitType NVARCHAR(30), -- 'THUNG60' hoặc 'PACK360'
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;
    
    -- Tự động tìm Pallet Nguồn nếu không truyền vào
    IF @OldPalletId IS NULL OR @OldPalletId = ''
    BEGIN
        IF @UnitType = 'THUNG60'
            SELECT @OldPalletId = current_pallet_id FROM dbo.tbl_thung60_kho WHERE id_60 = @UnitId;
        ELSE IF @UnitType = 'PACK360'
            SELECT @OldPalletId = pallet_id FROM dbo.pallet_unit WHERE unit_id = @UnitId AND unit_type = 'PACK360' AND is_current = 1;
    END

    -- Ràng buộc 1: Kiểm tra Unit có nằm trên Pallet cũ không
    IF @OldPalletId IS NULL OR NOT EXISTS (SELECT 1 FROM dbo.pallet_unit WHERE pallet_id = @OldPalletId AND unit_id = @UnitId AND unit_type = @UnitType AND is_current = 1)
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Đơn vị hàng hóa không nằm trên Pallet cũ hoặc đã bị tháo dỡ.', 16, 1);
        RETURN;
    END

    -- Ràng buộc 2: Kiểm tra Pallet đích (NewPalletId) phải là CREATED hoặc ACTIVE
    DECLARE @NewPalletStatus NVARCHAR(30);
    SELECT @NewPalletStatus = status FROM dbo.pallet WHERE pallet_id = @NewPalletId;

    IF @NewPalletStatus IS NULL
    BEGIN
        -- Nếu Pallet đích chưa tồn tại, tự động tạo mới
        INSERT INTO dbo.pallet (pallet_id, pallet_type, status, created_by, created_at)
        VALUES (@NewPalletId, 'STANDARD', 'CREATED', @UserName, GETDATE());
        
        SET @NewPalletStatus = 'CREATED';
        
        INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
        VALUES ('PALLET', @NewPalletId, 'CREATE_PALLET_BY_TRANSFER', 'CREATED', @UserName, '127.0.0.1');
    END
    ELSE IF @NewPalletStatus NOT IN ('CREATED', 'ACTIVE')
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Pallet đích không hợp lệ (Trạng thái hiện tại: %s). Chỉ chấp nhận Pallet CREATED hoặc ACTIVE.', 16, 1, @NewPalletStatus);
        RETURN;
    END

    -- Gỡ khỏi Pallet cũ (is_current = 0)
    UPDATE dbo.pallet_unit
    SET is_current = 0
    WHERE pallet_id = @OldPalletId AND unit_id = @UnitId AND unit_type = @UnitType AND is_current = 1;

    -- Thêm vào Pallet mới (is_current = 1)
    IF EXISTS (SELECT 1 FROM dbo.pallet_unit WHERE pallet_id = @NewPalletId AND unit_id = @UnitId AND unit_type = @UnitType)
    BEGIN
        UPDATE dbo.pallet_unit SET is_current = 1 WHERE pallet_id = @NewPalletId AND unit_id = @UnitId AND unit_type = @UnitType;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.pallet_unit (pallet_id, unit_id, unit_type, is_current)
        VALUES (@NewPalletId, @UnitId, @UnitType, 1);
    END

    -- Xử lý tùy theo Unit Type để cập nhật vào tbl_thung60_kho
    IF @UnitType = 'THUNG60'
    BEGIN
        -- Giữ nguyên status = PALLETIZED, chỉ cập nhật Pallet ID
        UPDATE dbo.tbl_thung60_kho
        SET current_pallet_id = @NewPalletId,
            status = 'PALLETIZED' 
        WHERE id_60 = @UnitId;

        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by)
        VALUES (NEWID(), @UnitId, 'PALLET_TRANSFERRED', 'PALLETIZED', @UserName);
    END
    ELSE IF @UnitType = 'PACK360'
    BEGIN
        -- Cập nhật đồng loạt các Thùng 60 bên trong
        UPDATE t
        SET t.current_pallet_id = @NewPalletId,
            t.status = 'PALLETIZED'
        FROM dbo.tbl_thung60_kho t
        INNER JOIN dbo.pack360_unit p ON t.id_60 = p.id_60
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;

        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by)
        SELECT NEWID(), p.id_60, 'PALLET_TRANSFERRED', 'PALLETIZED', @UserName
        FROM dbo.pack360_unit p
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;
    END

    -- Ghi Audit Log cho cả 2 Pallet
    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @OldPalletId, 'TRANSFER_OUT', @UnitId, @UserName, '127.0.0.1');

    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @NewPalletId, 'TRANSFER_IN', @UnitId, @UserName, '127.0.0.1');

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Luân chuyển Pallet thành công' AS Message;
END;
GO
