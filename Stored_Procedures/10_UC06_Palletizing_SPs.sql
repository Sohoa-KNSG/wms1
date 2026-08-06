USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =====================================================================
-- Danh sách Stored Procedures cho UC06: Lập Pallet (Palletizing)
-- =====================================================================

-- 1. SP Khởi tạo Pallet (Quét QR Pallet)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_InitPallet
    @PalletId NVARCHAR(50),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    IF EXISTS (SELECT 1 FROM dbo.pallet WHERE pallet_id = @PalletId)
    BEGIN
        -- Đã tồn tại, kiểm tra xem có đang bị khóa hay không
        DECLARE @Status NVARCHAR(30);
        SELECT @Status = status FROM dbo.pallet WHERE pallet_id = @PalletId;
        
        IF @Status IN ('SHIPPED', 'SCRAPPED')
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Pallet đang ở trạng thái không hợp lệ (%s).', 16, 1, @Status);
            RETURN;
        END
    END
    ELSE
    BEGIN
        -- Chưa tồn tại, insert mới
        INSERT INTO dbo.pallet (pallet_id, pallet_type, status, created_by, created_at)
        VALUES (@PalletId, 'STANDARD', 'CREATED', @UserName, GETDATE());
        
        -- Ghi Audit Log tạo mới
        INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
        VALUES ('PALLET', @PalletId, 'CREATE_PALLET', 'CREATED', @UserName, '127.0.0.1');
    END

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Khởi tạo Pallet thành công' AS Message;
END;
GO


-- 2. SP Gán Đơn vị vào Pallet (Thùng 60 hoặc Pack360)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_AddUnitToPallet
    @PalletId NVARCHAR(50),
    @UnitId NVARCHAR(50),
    @UnitType NVARCHAR(30), -- 'THUNG60' hoặc 'PACK360'
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Fail-fast kiểm tra Pallet
    IF NOT EXISTS (SELECT 1 FROM dbo.pallet WHERE pallet_id = @PalletId AND status IN ('CREATED', 'ACTIVE'))
    BEGIN
        RAISERROR(N'Pallet không tồn tại hoặc không ở trạng thái khả dụng.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    -- Xử lý tùy theo Unit Type
    IF @UnitType = 'THUNG60'
    BEGIN
        -- Kiểm tra Thùng 60
        DECLARE @T60Status NVARCHAR(30);
        DECLARE @T60CurrentPallet NVARCHAR(50);
        
        SELECT @T60Status = status, @T60CurrentPallet = current_pallet_id 
        FROM dbo.tbl_thung60_kho 
        WHERE id_60 = @UnitId;

        IF @T60Status IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Thùng 60 không tồn tại trong kho.', 16, 1);
            RETURN;
        END
        
        IF @T60Status IN ('SHIPPED', 'SCRAPPED', 'TEMP_ISSUED')
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Thùng 60 đang ở trạng thái không thể đưa lên Pallet (%s).', 16, 1, @T60Status);
            RETURN;
        END

        IF @T60CurrentPallet = @PalletId
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Thùng 60 này đã nằm sẵn trên Pallet này rồi.', 16, 1);
            RETURN;
        END
        ELSE IF @T60CurrentPallet IS NOT NULL
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Thùng 60 đang thuộc một Pallet khác (%s). Hãy tháo trước.', 16, 1, @T60CurrentPallet);
            RETURN;
        END

        -- Insert vào pallet_unit
        INSERT INTO dbo.pallet_unit (pallet_id, unit_id, unit_type, is_current)
        VALUES (@PalletId, @UnitId, 'THUNG60', 1);

        -- Update tbl_thung60_kho
        UPDATE dbo.tbl_thung60_kho
        SET current_pallet_id = @PalletId,
            status = 'PALLETIZED'
        WHERE id_60 = @UnitId;

        -- Ghi event
        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by, request_id)
        VALUES (NEWID(), @UnitId, 'PALLETIZED', 'PALLETIZED', @UserName, NEWID());

    END
    ELSE IF @UnitType = 'PACK360'
    BEGIN
        -- Kiểm tra Pack360
        DECLARE @P360Status NVARCHAR(30);
        SELECT @P360Status = status FROM dbo.pack360_header WHERE pack360_id = @UnitId;

        IF @P360Status IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Pack360 không tồn tại.', 16, 1);
            RETURN;
        END

        IF @P360Status <> 'COMPLETED'
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Pack360 phải ở trạng thái COMPLETED mới được đưa lên Pallet.', 16, 1);
            RETURN;
        END

        -- Kiểm tra xem đã nằm trên Pallet khác chưa (qua pallet_unit)
        IF EXISTS (SELECT 1 FROM dbo.pallet_unit WHERE unit_id = @UnitId AND unit_type = 'PACK360' AND is_current = 1 AND pallet_id <> @PalletId)
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Pack360 này đang thuộc một Pallet khác.', 16, 1);
            RETURN;
        END
        
        -- Insert vào pallet_unit (bỏ qua nếu đã có)
        IF NOT EXISTS (SELECT 1 FROM dbo.pallet_unit WHERE unit_id = @UnitId AND pallet_id = @PalletId AND is_current = 1)
        BEGIN
            INSERT INTO dbo.pallet_unit (pallet_id, unit_id, unit_type, is_current)
            VALUES (@PalletId, @UnitId, 'PACK360', 1);
        END

        -- Đệ quy cập nhật toàn bộ thùng 60 bên trong Pack360
        UPDATE t
        SET t.current_pallet_id = @PalletId,
            t.status = 'PALLETIZED'
        FROM dbo.tbl_thung60_kho t
        INNER JOIN dbo.pack360_unit p ON t.id_60 = p.id_60
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;

        -- Ghi Event cho toàn bộ thùng con
        INSERT INTO dbo.thung60_event (event_id, id_60, event_type, new_status, performed_by, request_id)
        SELECT NEWID(), p.id_60, 'PALLETIZED', 'PALLETIZED', @UserName, NEWID()
        FROM dbo.pack360_unit p
        WHERE p.pack360_id = @UnitId AND p.is_current = 1;

    END
    ELSE
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Loại Unit không hợp lệ.', 16, 1);
        RETURN;
    END

    COMMIT TRANSACTION;
    SELECT N'OK' AS Result, N'Gán hàng lên Pallet thành công' AS Message;
END;
GO

-- 3. SP Chốt Pallet (Hoàn thành)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC06_CompletePallet
    @PalletId NVARCHAR(50),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    UPDATE dbo.pallet
    SET status = 'ACTIVE'
    WHERE pallet_id = @PalletId;
    
    INSERT INTO dbo.audit_log (object_type, object_id, action, new_value, performed_by, ip_address)
    VALUES ('PALLET', @PalletId, 'COMPLETE_PALLET', 'ACTIVE', @UserName, '127.0.0.1');

    COMMIT TRANSACTION;
    
    SELECT N'OK' AS Result, N'Hoàn thành Lập Pallet' AS Message;
END;
GO
