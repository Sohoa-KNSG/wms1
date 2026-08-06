-- =============================================
-- XỬ LÝ NGHIỆP VỤ NHẬP KHO (RECEIPT)
-- Hệ quản trị: SQL Server (T-SQL)
-- =============================================

-- =============================================
-- Lấy phiếu giao kho và dòng chi tiết từ data sản xuất
-- =============================================
CREATE OR ALTER PROCEDURE usp_Receipt_GetProductionHandoverLines
    @handover_no NVARCHAR(50),
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
        IF EXISTS (SELECT 1 FROM command_request_log WHERE request_id = @request_id)
        BEGIN
            SELECT 'ERROR' AS status, 'Duplicate request' AS message, 'DUPLICATE_REQUEST' AS error_code;
            RETURN;
        END
        
        INSERT INTO command_request_log (request_id, command_type, status)
        VALUES (@request_id, 'Receipt_GetProductionHandoverLines', 'PROCESSING');

        -- Dữ liệu trả về (2 Result Sets: Header và Line)
        -- 1. Header từ View ERP
        SELECT 
            SoPhieuNhap AS handover_no,
            DonViNguon AS production_area,
            NgayNhap AS handover_date,
            TrangThaiPhieu AS status,
            SoDongChiTiet AS items_count,
            TongSoLuongNhap AS total_qty
        FROM vw_WMS_PhieuNhapKhoTP_Tong 
        WHERE SoPhieuNhap = @handover_no;

        -- 2. Lines từ View ERP và WMS_UC03_ScanLog (để lấy số lượng đã quét)
        SELECT 
            ct.SoPhieuNhap AS handover_no,
            ct.MaChiTietPhieu AS handover_line_no,
            ct.MaSanPham AS product_code,
            ct.DonViNguon AS production_area,
            ct.SoLuongNhap AS planned_qty,
            ct.TenTrangThaiRelease AS status,
            map.MaDonHang AS order_no,
            ISNULL(map.MaDotGiao, 1) AS batch_no,
            ISNULL(scan.SoLuongDaQuet, 0) AS scanned_qty
        FROM dbo.vw_WMS_PhieuNhapKhoTP_ChiTiet ct
        LEFT JOIN dbo.WMS_PhieuNhap_DonHang_Map map
            ON ct.SoPhieuNhap = map.SoPhieuNhap
            AND ct.MaChiTietPhieu = map.MaChiTietPhieu
            AND map.IsDeleted = 0
        LEFT JOIN (
            SELECT 
                SoPhieuNhap, 
                MaChiTietPhieu, 
                MaSanPham,
                SUM(SoLuongThung) AS SoLuongDaQuet
            FROM dbo.WMS_UC03_ScanLog
            WHERE IsDeleted = 0 AND TrangThaiScan IN (N'VALID', N'CONFIRMED')
            GROUP BY SoPhieuNhap, MaChiTietPhieu, MaSanPham
        ) scan
            ON ct.SoPhieuNhap = scan.SoPhieuNhap
            AND ct.MaChiTietPhieu = scan.MaChiTietPhieu
            AND ct.MaSanPham = scan.MaSanPham
        WHERE ct.SoPhieuNhap = @handover_no;

        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        
        -- Không cần select output standard nếu API cần trả data trực tiếp. Ở đây tôi trả kèm thông tin data ở trên.
    END TRY
    BEGIN CATCH
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO

-- =============================================
-- Ghi nhận từng thùng 60 vào phiên nhập tạm
-- =============================================
CREATE OR ALTER PROCEDURE usp_Receipt_ScanThung60
    @receipt_session_no NVARCHAR(50),
    @qr_60 NVARCHAR(255),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'Receipt_ScanThung60', 'PROCESSING');
        
        BEGIN TRANSACTION;
        
        -- Logic: Kiểm tra QR đã tồn tại và trạng thái có hợp lệ chưa
        DECLARE @current_status NVARCHAR(30);
        DECLARE @id_60 NVARCHAR(50);
        DECLARE @product_code NVARCHAR(50);
        DECLARE @qty DECIMAL(18,4);

        SELECT @id_60 = id_60, @current_status = status, @product_code = product_code, @qty = current_qty 
        FROM tbl_thung60_kho WHERE qr_60 = @qr_60;

        IF @id_60 IS NULL
        BEGIN
            THROW 50002, N'Thùng chưa tồn tại hoặc chưa được đồng bộ từ hệ thống Sản xuất', 1;
        END
        ELSE IF @current_status = 'AVAILABLE' OR @current_status = 'SHIPPED'
        BEGIN
            THROW 50001, 'Thùng đã được nhập hoặc đã xuất', 1;
        END

        -- Insert session detail
        DECLARE @line_no INT = ISNULL((SELECT MAX(line_no) FROM receipt_session_detail WHERE receipt_session_no = @receipt_session_no), 0) + 1;
        
        INSERT INTO receipt_session_detail (receipt_session_no, line_no, id_60, qr_60, product_code, quantity, scan_result, scanned_by, request_id)
        VALUES (@receipt_session_no, @line_no, @id_60, @qr_60, @product_code, @qty, 'SUCCESS', @user_code, @request_id);

        -- Update thung60
        UPDATE tbl_thung60_kho SET status = 'TEMP_RECEIVED', receipt_session_no = @receipt_session_no WHERE id_60 = @id_60;
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Quét thành công' AS message, NULL AS error_code, @receipt_session_no AS document_no, @qr_60 AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO

-- =============================================
-- Xác nhận nhập chính thức, post ledger tăng tồn
-- =============================================
CREATE OR ALTER PROCEDURE usp_Receipt_OfficialConfirm
    @receipt_session_no NVARCHAR(50),
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
        INSERT INTO command_request_log (request_id, command_type, status) VALUES (@request_id, 'Receipt_OfficialConfirm', 'PROCESSING');
        
        BEGIN TRANSACTION;
        
        DECLARE @tx_id NVARCHAR(50) = NEWID();

        -- 1. Insert Transaction Book
        INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_by)
        VALUES (@tx_id, 'RECEIPT', @receipt_session_no, @user_code);

        -- 2. Update tbl_thung60_kho status to AVAILABLE
        UPDATE t
        SET t.status = 'AVAILABLE', t.official_receipt_no = @receipt_session_no
        FROM tbl_thung60_kho t
        INNER JOIN receipt_session_detail d ON t.id_60 = d.id_60
        WHERE d.receipt_session_no = @receipt_session_no;

        -- 3. Insert into inventory_ledger for all scanned units
        INSERT INTO inventory_ledger (ledger_date, id_60, product_code, transaction_id, source_document_no, quantity_change, new_stock_type)
        SELECT CAST(GETDATE() AS DATE), id_60, product_code, @tx_id, @receipt_session_no, quantity, 'UNRESTRICTED'
        FROM receipt_session_detail
        WHERE receipt_session_no = @receipt_session_no;

        -- 3.5. Insert into item_ledger (product aggregate level)
        INSERT INTO item_ledger (ledger_date, product_code, transaction_id, source_document_no, total_quantity_change)
        SELECT CAST(GETDATE() AS DATE), product_code, @tx_id, @receipt_session_no, SUM(quantity)
        FROM receipt_session_detail
        WHERE receipt_session_no = @receipt_session_no
        GROUP BY product_code;

        -- 3.6. Insert domain events for all scanned units
        INSERT INTO thung60_event (event_id, id_60, event_type, new_status, new_stock_type, new_qty, source_document_no, request_id, performed_by)
        SELECT NEWID(), id_60, 'OFFICIAL_RECEIPT_POSTED', 'AVAILABLE', 'UNRESTRICTED', quantity, @receipt_session_no, @request_id, @user_code
        FROM receipt_session_detail
        WHERE receipt_session_no = @receipt_session_no;

        -- 3.7. Audit log
        INSERT INTO audit_log (object_type, object_id, action, new_value, performed_by)
        VALUES ('RECEIPT_SESSION', @receipt_session_no, 'OFFICIAL_CONFIRM', 
                (SELECT CAST(COUNT(1) AS NVARCHAR) FROM receipt_session_detail WHERE receipt_session_no = @receipt_session_no), 
                @user_code);

        -- 4. Update receipt_session_header status to CONFIRMED
        UPDATE receipt_session_header 
        SET status = 'CONFIRMED', official_confirmed_by = @user_code, official_confirmed_at = GETDATE()
        WHERE receipt_session_no = @receipt_session_no;
        
        COMMIT TRANSACTION;
        UPDATE command_request_log SET status = 'SUCCESS' WHERE request_id = @request_id;
        SELECT 'SUCCESS' AS status, 'Xác nhận nhập kho thành công' AS message, NULL AS error_code, @receipt_session_no AS document_no, NULL AS object_code, @request_id AS request_id, NEWID() AS trace_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        UPDATE command_request_log SET status = 'FAILED' WHERE request_id = @request_id;
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message, 'SYSTEM_ERROR' AS error_code;
    END CATCH
END
GO
