-- =============================================
-- XỬ LÝ NGHIỆP VỤ ĐÓNG GÓI PACK360 (UC05)
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

CREATE OR ALTER PROCEDURE usp_Pack360_ScanUnit
    @pack360_id NVARCHAR(50) = NULL, -- NULL nếu là thùng đầu tiên
    @qr_60 NVARCHAR(255),
    @packing_standard_type NVARCHAR(30) = 'TRADITIONAL', -- TRADITIONAL hoặc OEM
    @target_oem_order_no NVARCHAR(255) = NULL, -- Truyền từ giao diện khi đóng hàng OEM
    @target_oem_batch_no INT = 1,
    @user_code NVARCHAR(50),
    @is_repack BIT = 0,
    @new_pack360_id NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @id_60 NVARCHAR(50);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @channel NVARCHAR(50);
    DECLARE @current_pack360_id NVARCHAR(50);
    DECLARE @status NVARCHAR(30);
    DECLARE @scanned_oem_order_no NVARCHAR(255);
    DECLARE @scanned_oem_batch_no INT;
    
    -- Parse Kênh và ProductCode từ QR (Giả định QR format: K07/1/D.01-16/GT/...)
    -- Lấy phần tử thứ 3 (ProductCode) và thứ 4 (Channel)
    SELECT 
        @id_60 = id_60,
        @product_code = product_code,
        @status = status,
        @current_pack360_id = current_pack360_id,
        @scanned_oem_order_no = current_oem_order_no,
        @scanned_oem_batch_no = current_oem_batch_no
    FROM tbl_thung60_kho
    WHERE qr_60 = @qr_60;

    IF @id_60 IS NULL
    BEGIN
        RAISERROR(N'Thùng 60 không tồn tại trong hệ thống', 16, 1);
        RETURN;
    END

    DECLARE @stock_type NVARCHAR(50);
    SELECT @stock_type = stock_type FROM tbl_thung60_kho WHERE id_60 = @id_60;
    
    IF @stock_type <> 'UNRESTRICTED'
    BEGIN
        RAISERROR(N'Thùng 60 không ở trạng thái UNRESTRICTED', 16, 1);
        RETURN;
    END

    IF @status <> 'AVAILABLE' AND @status <> '1'
    BEGIN
        RAISERROR(N'Thùng 60 không ở trạng thái sẵn sàng đóng gói', 16, 1);
        RETURN;
    END

    IF @current_pack360_id IS NOT NULL
    BEGIN
        RAISERROR(N'Thùng 60 này đã nằm trong một Pack360 khác', 16, 1);
        RETURN;
    END
    
    -- Extract Channel (Kênh) từ QR bằng dbo.SplitString (nếu có) hoặc parse thủ công
    -- Vì SQL Server không có Split dễ dùng sẵn, tạm lấy bằng logic chuỗi:
    -- K07/1/D.01-16/GT/...
    -- Đoạn này có thể phức tạp nên có thể Backend truyền vào hoặc dùng hàm T-SQL.
    -- Để đơn giản trong code mẫu, giả định @channel lấy từ parse chuỗi @qr_60
    DECLARE @p1 INT = CHARINDEX('/', @qr_60)
    DECLARE @p2 INT = CHARINDEX('/', @qr_60, @p1 + 1)
    DECLARE @p3 INT = CHARINDEX('/', @qr_60, @p2 + 1)
    DECLARE @p4 INT = CHARINDEX('/', @qr_60, @p3 + 1)
    SET @channel = SUBSTRING(@qr_60, @p3 + 1, @p4 - @p3 - 1)

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Xử lý OEM
        DECLARE @final_oem_order_no NVARCHAR(255) = NULL;
        DECLARE @final_oem_batch_no INT = 1;

        IF @pack360_id IS NULL OR @pack360_id = ''
        BEGIN
            -- Tạo mới Pack360
            SET @new_pack360_id = NEWID();
            
            IF @packing_standard_type = 'OEM'
            BEGIN
                IF @target_oem_order_no IS NOT NULL AND @target_oem_order_no <> ''
                BEGIN
                    SET @final_oem_order_no = @target_oem_order_no;
                    SET @final_oem_batch_no = @target_oem_batch_no;
                END
                ELSE
                BEGIN
                    SET @final_oem_order_no = @scanned_oem_order_no;
                    SET @final_oem_batch_no = ISNULL(@scanned_oem_batch_no, 1);
                END
            END

            INSERT INTO pack360_header (
                pack360_id, pack360_qr, packing_standard_type, oem_order_no, oem_batch_no, status, target_unit_count, actual_unit_count, created_by
            ) VALUES (
                @new_pack360_id, 'TEMP_' + @new_pack360_id, @packing_standard_type, @final_oem_order_no, @final_oem_batch_no, 'OPEN', 6, 0, @user_code
            );

            -- Ghi event khởi tạo Pack360
            INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
            VALUES (NEWID(), @new_pack360_id, 'CREATE_PACK', NULL, 'OPEN', @user_code, NEWID());
        END
        ELSE
        BEGIN
            SET @new_pack360_id = @pack360_id;
            
            -- Validation check nếu thùng 60 có khớp rule với Pack360 hiện tại không
            IF @packing_standard_type = 'OEM'
            BEGIN
                DECLARE @header_oem NVARCHAR(255);
                DECLARE @header_batch INT;
                SELECT @header_oem = oem_order_no, @header_batch = oem_batch_no FROM pack360_header WHERE pack360_id = @new_pack360_id;

                -- Nếu người dùng KHÔNG NHẬP mã OEM mới (Trường hợp 1), thì các thùng quét sau phải giống mã OEM của thùng đầu tiên
                IF (@target_oem_order_no IS NULL OR @target_oem_order_no = '') AND @is_repack = 0
                BEGIN
                    IF ISNULL(@scanned_oem_order_no, '') <> ISNULL(@header_oem, '') OR ISNULL(@scanned_oem_batch_no, 1) <> ISNULL(@header_batch, 1)
                    BEGIN
                        RAISERROR(N'Thùng 60 này không cùng đơn hàng OEM hoặc Đợt giao với các thùng trước đó trong phiên.', 16, 1);
                        ROLLBACK TRANSACTION;
                        RETURN;
                    END
                END
                -- Nếu người dùng CÓ NHẬP mã OEM mới (Trường hợp 2: Đóng lại đơn mới), KHÔNG RÀNG BUỘC thùng 60 phải giống đơn.
            END
        END
        
        -- Thêm vào pack360_unit
        INSERT INTO pack360_unit (pack360_id, id_60, added_by, is_current)
        VALUES (@new_pack360_id, @id_60, @user_code, 1);

        -- Thêm vào pack360_unit_history (Interval Model)
        DECLARE @add_event_id NVARCHAR(50) = NEWID();
        INSERT INTO pack360_unit_history (pack360_id, id_60, added_at, added_by, add_event_id, request_id)
        VALUES (@new_pack360_id, @id_60, GETDATE(), @user_code, @add_event_id, NEWID());

        -- Ghi event pack360_event & thung60_event
        INSERT INTO pack360_event (event_id, pack360_id, event_type, new_status, performed_by, request_id)
        VALUES (@add_event_id, @new_pack360_id, 'ADD_UNIT', 'OPEN', @user_code, NEWID());

        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, request_id)
        VALUES (NEWID(), @id_60, 'PACK_INTO_360', @status, 'PACKED_360', @user_code, NEWID());
        
        -- Cập nhật tbl_thung60_kho
        UPDATE tbl_thung60_kho 
        SET current_pack360_id = @new_pack360_id, status = 'PACKED_360' 
        WHERE id_60 = @id_60;
        
        -- Cập nhật số lượng
        UPDATE pack360_header
        SET actual_unit_count = (SELECT COUNT(1) FROM pack360_unit WHERE pack360_id = @new_pack360_id AND is_current = 1)
        WHERE pack360_id = @new_pack360_id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE usp_Pack360_Complete
    @pack360_id NVARCHAR(50),
    @weight DECIMAL(18,2),
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    DECLARE @first_qr_60 NVARCHAR(255);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @channel NVARCHAR(50);
    
    SELECT @status = status 
    FROM pack360_header WITH (UPDLOCK, HOLDLOCK)
    WHERE pack360_id = @pack360_id;
    
    IF @status <> 'OPEN'
    BEGIN
        RAISERROR(N'Pack360 không ở trạng thái OPEN', 16, 1);
        RETURN;
    END

    -- Lấy QR của 1 thùng 60 để parse Channel và ProductCode
    SELECT TOP 1 @first_qr_60 = t.qr_60, @product_code = t.product_code
    FROM pack360_unit u
    INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
    WHERE u.pack360_id = @pack360_id AND u.is_current = 1;
    
    -- Parse Channel từ QR (VD: K07/1/D.01-16/GT/l6/13/49)
    DECLARE @p1 INT = CHARINDEX('/', @first_qr_60)
    DECLARE @p2 INT = CHARINDEX('/', @first_qr_60, @p1 + 1)
    DECLARE @p3 INT = CHARINDEX('/', @first_qr_60, @p2 + 1)
    DECLARE @p4 INT = CHARINDEX('/', @first_qr_60, @p3 + 1)
    SET @channel = SUBSTRING(@first_qr_60, @p3 + 1, @p4 - @p3 - 1)
    
    -- Sinh QR code mới
    DECLARE @dateStr NVARCHAR(10) = FORMAT(GETDATE(), 'dd/MM/yy'); -- dd/MM/yy
    -- Định dạng yêu cầu: GT/D.01-16/13/07/26/90 (90 là sequence)
    DECLARE @prefix NVARCHAR(100) = @channel + '/' + @product_code + '/' + @dateStr + '/';
    DECLARE @seq INT;
    
    SELECT @seq = ISNULL(MAX(CAST(REPLACE(pack360_qr, @prefix, '') AS INT)), 0) + 1
    FROM pack360_header
    WHERE pack360_qr LIKE @prefix + '%' AND ISNUMERIC(REPLACE(pack360_qr, @prefix, '')) = 1;
    
    DECLARE @new_qr NVARCHAR(255) = @prefix + CAST(@seq AS NVARCHAR(10));
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        UPDATE pack360_header
        SET status = 'COMPLETED',
            weight = @weight,
            completed_by = @user_code,
            completed_at = GETDATE(),
            pack360_qr = @new_qr
        WHERE pack360_id = @pack360_id;

        -- Ghi event COMPLETE_PACK
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
        VALUES (NEWID(), @pack360_id, 'COMPLETE_PACK', 'OPEN', 'COMPLETED', @user_code, NEWID());

        -- Hạch toán Dual Ledger
        IF OBJECT_ID('stock_transaction_book', 'U') IS NOT NULL
        BEGIN
            INSERT INTO stock_transaction_book (transaction_id, transaction_type, object_id, qty, created_at, created_by)
            VALUES (NEWID(), 'PACK360_COMPLETE', @pack360_id, @weight, GETDATE(), @user_code);
        END

        IF OBJECT_ID('inventory_ledger', 'U') IS NOT NULL
        BEGIN
            INSERT INTO inventory_ledger (ledger_id, product_code, change_qty, reason, created_at, created_by)
            VALUES (NEWID(), @product_code, @weight, 'PACK360_COMPLETE', GETDATE(), @user_code);
        END

        -- Cập nhật trạng thái các Thùng 60 bên trong thành PACKED_360
        UPDATE tbl_thung60_kho
        SET status = 'PACKED_360'
        WHERE current_pack360_id = @pack360_id;
        
        COMMIT TRANSACTION;
        
        -- Trả về dữ liệu QR cho API
        SELECT @new_qr AS Pack360_QR, @weight AS Weight, @product_code AS ProductCode, @channel AS Channel;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE usp_Pack360_Cancel
    @pack360_id NVARCHAR(50),
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    
    SELECT @status = status 
    FROM pack360_header 
    WHERE pack360_id = @pack360_id;
    
    IF @status <> 'OPEN'
    BEGIN
        RAISERROR(N'Chỉ có thể hủy (Reset) phiên đóng gói đang ở trạng thái OPEN', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Giải phóng Thùng 60
        UPDATE tbl_thung60_kho 
        SET current_pack360_id = NULL 
        WHERE current_pack360_id = @pack360_id;
        
        -- Đổi trạng thái thay vì xóa vật lý
        UPDATE pack360_header SET status = 'CANCELLED' WHERE pack360_id = @pack360_id;
        
        -- Đóng membership
        UPDATE pack360_unit SET is_current = 0 WHERE pack360_id = @pack360_id;

        -- Đóng lịch sử thành viên
        DECLARE @cancel_evt NVARCHAR(50) = NEWID();
        UPDATE pack360_unit_history
        SET removed_at = GETDATE(), removed_by = @user_code, remove_event_id = @cancel_evt, reason = 'CANCELLED'
        WHERE pack360_id = @pack360_id AND removed_at IS NULL;

        -- Event
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
        VALUES (@cancel_evt, @pack360_id, 'CANCEL_PACK', @status, 'CANCELLED', @user_code, NEWID());

        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, request_id)
        SELECT NEWID(), id_60, 'CANCEL_PACK_MEMBERSHIP', 'AVAILABLE', 'AVAILABLE', @user_code, NEWID()
        FROM pack360_unit WHERE pack360_id = @pack360_id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO

-- =============================================
-- UC08: Giải phóng Pack360
-- =============================================
CREATE OR ALTER PROCEDURE usp_Pack360_Release
    @pack360_id NVARCHAR(50),
    @release_reason NVARCHAR(255),
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    
    SELECT @status = status
    FROM pack360_header 
    WHERE pack360_id = @pack360_id;
    
    IF @status <> 'COMPLETED'
    BEGIN
        RAISERROR(N'Chỉ có thể giải phóng Pack360 ở trạng thái COMPLETED.', 16, 1);
        RETURN;
    END
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Đổi trạng thái Pack360
        UPDATE pack360_header
        SET status = 'RELEASED',
            released_by = @user_code,
            released_at = CURRENT_TIMESTAMP,
            release_reason = @release_reason
        WHERE pack360_id = @pack360_id;
        
        -- Đóng membership
        UPDATE pack360_unit SET is_current = 0 WHERE pack360_id = @pack360_id;

        -- Giải phóng thùng 60, chuyển về Repack Bin
        UPDATE tbl_thung60_kho 
        SET current_pack360_id = NULL,
            status = 'AVAILABLE',
            current_location_code = 'REPACK_BIN'
        WHERE current_pack360_id = @pack360_id;
        
        -- Đóng lịch sử thành viên
        DECLARE @release_evt NVARCHAR(50) = NEWID();
        UPDATE pack360_unit_history
        SET removed_at = CURRENT_TIMESTAMP, removed_by = @user_code, remove_event_id = @release_evt, reason = 'RELEASED'
        WHERE pack360_id = @pack360_id AND removed_at IS NULL;

        -- Event
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
        VALUES (@release_evt, @pack360_id, 'RELEASE_PACK', @status, 'RELEASED', @user_code, NEWID());

        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, request_id)
        SELECT NEWID(), id_60, 'RELEASE_FROM_360', 'AVAILABLE', 'AVAILABLE', @user_code, NEWID()
        FROM pack360_unit WHERE pack360_id = @pack360_id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END
GO

-- =============================================
-- UC09: Tách thùng 60 khỏi Pack360
-- =============================================
CREATE OR ALTER PROCEDURE usp_Pack360_DetachUnits
    @pack360_id NVARCHAR(50),
    @unit_ids NVARCHAR(MAX),
    @reason NVARCHAR(255),
    @user_code NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    DECLARE @total_units INT;
    DECLARE @detach_count INT;
    
    -- Lấy thông tin Pack360
    SELECT @status = status, @total_units = actual_unit_count
    FROM pack360_header 
    WHERE pack360_id = @pack360_id;
    
    IF @status <> 'COMPLETED'
    BEGIN
        RAISERROR(N'Pack360 không ở trạng thái COMPLETED', 16, 1);
        RETURN;
    END

    -- Parse unit_ids
    DECLARE @UnitTable TABLE (id_60 NVARCHAR(50));
    INSERT INTO @UnitTable (id_60)
    SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@unit_ids, ',') WHERE LTRIM(RTRIM(value)) <> '';
    
    SELECT @detach_count = COUNT(1) FROM @UnitTable;
    
    IF @detach_count = 0
    BEGIN
        RAISERROR(N'Không có thùng 60 nào được chọn để tách', 16, 1);
        RETURN;
    END

    IF @detach_count >= @total_units
    BEGIN
        RAISERROR(N'Số lượng tách bằng hoặc vượt quá tổng số thùng trong kiện. Vui lòng dùng chức năng giải phóng toàn bộ kiện (UC08).', 16, 1);
        RETURN;
    END
    
    -- Kiểm tra tất cả thùng chọn có thuộc kiện này không
    DECLARE @invalid_count INT;
    SELECT @invalid_count = COUNT(1)
    FROM @UnitTable u
    LEFT JOIN tbl_thung60_kho t ON u.id_60 = t.id_60 AND t.current_pack360_id = @pack360_id
    WHERE t.id_60 IS NULL;
    
    IF @invalid_count > 0
    BEGIN
        RAISERROR(N'Một hoặc nhiều thùng 60 được chọn không thuộc kiện này', 16, 1);
        RETURN;
    END

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Cập nhật tbl_thung60_kho
        UPDATE tbl_thung60_kho 
        SET current_pack360_id = NULL,
            status = 'AVAILABLE',
            current_location_code = 'REPACK_BIN'
        WHERE id_60 IN (SELECT id_60 FROM @UnitTable);
        
        -- Cập nhật pack360_unit
        UPDATE pack360_unit
        SET is_current = 0
        WHERE pack360_id = @pack360_id AND id_60 IN (SELECT id_60 FROM @UnitTable);
        
        -- Đóng lịch sử thành viên
        DECLARE @detach_evt NVARCHAR(50) = NEWID();
        UPDATE pack360_unit_history
        SET removed_at = CURRENT_TIMESTAMP, removed_by = @user_code, remove_event_id = @detach_evt, reason = @reason
        WHERE pack360_id = @pack360_id AND id_60 IN (SELECT id_60 FROM @UnitTable) AND removed_at IS NULL;

        -- Event
        INSERT INTO pack360_event (event_id, pack360_id, event_type, old_status, new_status, performed_by, request_id)
        VALUES (@detach_evt, @pack360_id, 'DETACH_UNIT', @status, 'NEED_REVIEW', @user_code, NEWID());

        INSERT INTO thung60_event (event_id, id_60, event_type, old_status, new_status, performed_by, request_id)
        SELECT NEWID(), id_60, 'DETACH_FROM_360', 'AVAILABLE', 'AVAILABLE', @user_code, NEWID()
        FROM @UnitTable;
        
        -- Cập nhật pack360_header
        UPDATE pack360_header
        SET status = 'NEED_REVIEW',
            actual_unit_count = actual_unit_count - @detach_count
        WHERE pack360_id = @pack360_id;
        
        -- Ghi Audit Log
        INSERT INTO audit_log (object_type, object_id, action, old_value, new_value, performed_by)
        VALUES ('pack360_header', @pack360_id, 'DETACH_UNITS', CAST(@total_units AS NVARCHAR(MAX)), CAST((@total_units - @detach_count) AS NVARCHAR(MAX)), @user_code);
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg2 NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg2, 16, 1);
    END CATCH
END
GO

