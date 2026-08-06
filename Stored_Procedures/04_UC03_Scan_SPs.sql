USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. Stored Procedure quét nhanh thùng 60
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC03_ScanThung60
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50),
    @MaSanPham NVARCHAR(50),
    @MaThung60 NVARCHAR(100),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE 
        @SoLuongThung DECIMAL(18,2),
        @MaSanPhamThung NVARCHAR(50),
        @TrangThaiThung NVARCHAR(10),
        @SoLuongPhieu DECIMAL(18,2),
        @SoLuongDaQuet DECIMAL(18,2),
        @MaDonHang NVARCHAR(50),
        @MaKhachHang NVARCHAR(50),
        @TrangThaiScan NVARCHAR(30),
        @KetQua NVARCHAR(500);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Lấy thông tin phiếu nhập yêu cầu (Line Level)
        SELECT 
            @SoLuongPhieu = SoLuongNhap
        FROM dbo.vw_WMS_PhieuNhapKhoTP_ChiTiet WITH (NOLOCK)
        WHERE SoPhieuNhap = @SoPhieuNhap
          AND MaChiTietPhieu = @MaChiTietPhieu
          AND MaSanPham = @MaSanPham;

        -- 2. Lấy đơn hàng & khách hàng tương ứng (Mapping Level)
        SELECT 
            @MaDonHang = MaDonHang
        FROM dbo.WMS_PhieuNhap_DonHang_Map WITH (NOLOCK)
        WHERE SoPhieuNhap = @SoPhieuNhap
          AND MaChiTietPhieu = @MaChiTietPhieu
          AND IsDeleted = 0;

        SELECT 
            @MaKhachHang = MaKhachHang
        FROM dbo.vw_WMS_DonHangOEM_Tong WITH (NOLOCK)
        WHERE MaDonHang = @MaDonHang;

        -- 3. Query view Packaging hệ thống đóng gói
        SELECT
            @MaSanPhamThung = MaSanPham,
            @SoLuongThung = SoLuongTrongThung,
            @TrangThaiThung = TrangThaiThung
        FROM dbo.vw_WMS_Thung60_Packaging WITH (NOLOCK)
        WHERE MaThung60 = @MaThung60;

        -- 4. Trình tự kiểm duyệt Logic (Fail-fast validation)
        IF @SoPhieuNhap IS NULL OR @MaChiTietPhieu IS NULL OR @MaThung60 IS NULL
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Dữ liệu đầu vào không hợp lệ (mã phiếu, dòng phiếu hoặc mã thùng bị rỗng).';
        END
        ELSE IF @SoLuongPhieu IS NULL
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Dòng phiếu nhập không tồn tại hoặc mã sản phẩm không khớp với chứng từ.';
        END
        ELSE IF @MaSanPhamThung IS NULL
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Mã thùng 60 không tồn tại trong hệ thống Packaging.';
        END
        ELSE IF @TrangThaiThung <> '1'
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Mã thùng không ở trạng thái chờ nhập kho (Trạng thái vật lý Packaging khác 1).';
        END
        ELSE IF @MaSanPhamThung <> @MaSanPham
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Mã sản phẩm trên thùng (' + ISNULL(@MaSanPhamThung, N'N/A') + N') không khớp với dòng phiếu nhập (' + @MaSanPham + N').';
        END
        ELSE IF EXISTS (
            SELECT 1
            FROM dbo.WMS_UC03_ScanLog WITH (UPDLOCK, HOLDLOCK)
            WHERE MaThung60 = @MaThung60
              AND IsDeleted = 0
              AND TrangThaiScan IN (N'VALID', N'CONFIRMED')
        )
        BEGIN
            SET @TrangThaiScan = N'INVALID';
            SET @KetQua = N'Mã thùng ' + @MaThung60 + N' đã được quét hợp lệ hoặc đã nhập kho trước đó (Chống quét trùng).';
        END
        ELSE
        BEGIN
            -- Khóa dòng dữ liệu ScanLog để tính tổng chính xác trong môi trường nhiều máy quét đồng thời (Concurrency Control)
            SELECT 
                @SoLuongDaQuet = ISNULL(SUM(SoLuongThung), 0)
            FROM dbo.WMS_UC03_ScanLog WITH (UPDLOCK, HOLDLOCK)
            WHERE SoPhieuNhap = @SoPhieuNhap
              AND MaChiTietPhieu = @MaChiTietPhieu
              AND MaSanPham = @MaSanPham
              AND IsDeleted = 0
              AND TrangThaiScan IN (N'VALID', N'CONFIRMED');

            IF ISNULL(@SoLuongDaQuet, 0) + ISNULL(@SoLuongThung, 0) > @SoLuongPhieu
            BEGIN
                SET @TrangThaiScan = N'INVALID';
                SET @KetQua = N'Tổng số lượng quét (' + CAST(ISNULL(@SoLuongDaQuet, 0) + ISNULL(@SoLuongThung, 0) AS NVARCHAR) + N') vượt số lượng yêu cầu trên phiếu (' + CAST(@SoLuongPhieu AS NVARCHAR) + N').';
            END
            ELSE
            BEGIN
                SET @TrangThaiScan = N'VALID';
                SET @KetQua = N'Thùng hợp lệ, đã ghi nhận kho tạm Staging. Chờ thủ kho xác nhận.';
            END
        END;

        -- 5. Ghi log quét (Audit Log & Staging Log)
        INSERT INTO dbo.WMS_UC03_ScanLog
        (
            SoPhieuNhap,
            MaChiTietPhieu,
            MaSanPham,
            MaDonHang,
            MaKhachHang,
            MaThung60,
            SoLuongThung,
            TrangThaiPackaging,
            TrangThaiScan,
            KetQuaKiemTra,
            CreatedBy
        )
        VALUES
        (
            @SoPhieuNhap,
            @MaChiTietPhieu,
            @MaSanPham,
            ISNULL(@MaDonHang, N''),
            ISNULL(@MaKhachHang, N''),
            @MaThung60,
            ISNULL(@SoLuongThung, 0),
            ISNULL(@TrangThaiThung, N'0'),
            @TrangThaiScan,
            @KetQua,
            @UserName
        );

        COMMIT TRANSACTION;

        -- 6. Trả về kết quả cho API
        SELECT 
            @TrangThaiScan AS TrangThaiScan,
            @KetQua AS KetQuaKiemTra,
            @MaThung60 AS MaThung60,
            @MaSanPhamThung AS MaSanPhamThung,
            ISNULL(@SoLuongThung, 0) AS SoLuongThung,
            @TrangThaiThung AS TrangThaiPackaging,
            ISNULL(@MaDonHang, N'') AS MaDonHang,
            ISNULL(@MaKhachHang, N'') AS MaKhachHang;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO

-- 2. Stored Procedure xác nhận nhập kho (UC04)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_ConfirmNhapKho
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50) = NULL,
    @UserName NVARCHAR(50),
    @PartnerName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    -- Kiểm tra điều kiện: Số lượng nhận phải bằng số lượng phiếu (BR-UC04)
    DECLARE @TongCanNhap DECIMAL(18,4);
    DECLARE @TongDaQuet DECIMAL(18,4);

    IF @MaChiTietPhieu IS NOT NULL
    BEGIN
        SELECT 
            @TongCanNhap = SoLuongCanNhap,
            @TongDaQuet = SoLuongDaQuetHopLe
        FROM dbo.vw_WMS_UC04_PhieuChoXacNhan
        WHERE SoPhieuNhap = @SoPhieuNhap AND MaChiTietPhieu = @MaChiTietPhieu;
    END
    ELSE
    BEGIN
        SELECT 
            @TongCanNhap = TongSoLuongCanNhap,
            @TongDaQuet = TongSoLuongDaQuetHopLe
        FROM dbo.vw_WMS_UC04_TongHopPhieu
        WHERE SoPhieuNhap = @SoPhieuNhap;
    END

    IF (@TongCanNhap IS NULL OR @TongCanNhap <> @TongDaQuet)
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Tổng số lượng quét hợp lệ không khớp với số lượng yêu cầu của phiếu nhập kho.', 16, 1);
        RETURN;
    END;

    -- Kiểm tra xem phiếu có dữ liệu ScanLog (VALID hoặc CONFIRMED) không
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.WMS_UC03_ScanLog
        WHERE SoPhieuNhap = @SoPhieuNhap
          AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
          AND TrangThaiScan IN (N'VALID', N'CONFIRMED')
          AND IsDeleted = 0
    )
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Không có thùng hợp lệ để xác nhận nhập kho.', 16, 1);
        RETURN;
    END;

    -- Xử lý các thùng chưa CONFIRMED (TrangThaiScan = N'VALID') nếu có
    IF EXISTS (
        SELECT 1
        FROM dbo.WMS_UC03_ScanLog
        WHERE SoPhieuNhap = @SoPhieuNhap
          AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
          AND TrangThaiScan = N'VALID'
          AND IsDeleted = 0
    )
    BEGIN
        -- Kiểm tra xem có thùng VALID nào đã tồn tại trong kho chưa (BR-UC04-07)
        IF EXISTS (
            SELECT 1
            FROM dbo.WMS_UC03_ScanLog s
            INNER JOIN dbo.tbl_thung60_kho k ON s.MaThung60 = k.id_60
            WHERE s.SoPhieuNhap = @SoPhieuNhap
              AND (s.MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
              AND s.TrangThaiScan = N'VALID'
              AND s.IsDeleted = 0
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Một số mã thùng đã tồn tại trong kho (tbl_thung60_kho). Không thể xác nhận.', 16, 1);
            RETURN;
        END;

    -- Thao tác DB chéo (Cross-DB). Cập nhật trạng thái sang 3 (BR-UC04-05)
    -- Every distinct VALID carton must be updated in Packaging. If another
    -- process changed or removed any carton, roll back the whole receipt.
    DECLARE @ExpectedPackagingRows INT;
    DECLARE @UpdatedPackagingRows INT;

    SELECT @ExpectedPackagingRows = COUNT(DISTINCT s.MaThung60)
    FROM dbo.WMS_UC03_ScanLog s
    WHERE s.SoPhieuNhap = @SoPhieuNhap
      AND (s.MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND s.TrangThaiScan = N'VALID'
      AND s.IsDeleted = 0;

    UPDATE p
    SET 
        p.trangthai = '3',
        p.BatNbr = s.SoPhieuNhap,
        p.RecordID = s.MaChiTietPhieu,
        p.OEM_1 = s.MaDonHang
    FROM [Packaging].[dbo].[tbl_thung60] p
    INNER JOIN dbo.WMS_UC03_ScanLog s
        ON p.id_60 = s.MaThung60
    WHERE s.SoPhieuNhap = @SoPhieuNhap
      AND (s.MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND s.TrangThaiScan = N'VALID'
      AND s.IsDeleted = 0
      AND p.trangthai = '1';

    SET @UpdatedPackagingRows = @@ROWCOUNT;

    IF @UpdatedPackagingRows <> @ExpectedPackagingRows
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Cập nhật Packaging không đầy đủ (%d/%d thùng). Giao dịch nhập kho đã rollback.', 16, 1, @UpdatedPackagingRows, @ExpectedPackagingRows);
        RETURN;
    END;

    -- Ghi dữ liệu vào bảng tbl_thung60_kho (BR-UC04-03)
    INSERT INTO dbo.tbl_thung60_kho (
        id_60, 
        qr_60, 
        product_code, 
        original_qty, 
        current_qty, 
        uom, 
        status, 
        stock_type, 
        is_virtual, 
        unit_origin_type, 
        receipt_session_no, 
        current_oem_order_no, 
        customer_code,
        gross_weight
    )
    SELECT 
        s.MaThung60, 
        s.MaThung60, 
        s.MaSanPham, 
        s.SoLuongThung, 
        s.SoLuongThung, 
        'PCS', 
        'AVAILABLE', 
        'UNRESTRICTED', 
        0, 
        'PHYSICAL', 
        s.SoPhieuNhap, 
        s.MaDonHang, 
        s.MaKhachHang,
        ISNULL(CAST(pkg.trong_luong AS DECIMAL(18,2)), 0)
    FROM dbo.WMS_UC03_ScanLog s
    LEFT JOIN [Packaging].[dbo].[tbl_thung60] pkg ON s.MaThung60 = pkg.id_60
    WHERE s.SoPhieuNhap = @SoPhieuNhap
      AND (s.MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND s.TrangThaiScan = N'VALID'
      AND s.IsDeleted = 0;

    -- Lấy thông tin đối tác (Đơn vị nguồn)
    DECLARE @PartnerUnit NVARCHAR(100);
    SELECT TOP 1 @PartnerUnit = DonviNguon 
    FROM dbo.vw_WMS_PhieuNhapKhoTP_Tong 
    WHERE SoPhieuNhap = @SoPhieuNhap;

    -- Ghi nhận lịch sử giao dịch (Transaction Book)
    DECLARE @TxId NVARCHAR(50) = 'TX-IN-' + @SoPhieuNhap + '-' + RIGHT('0' + CAST(DATEPART(HOUR, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(MINUTE, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(SECOND, GETDATE()) AS NVARCHAR), 2) + RIGHT('00' + CAST(DATEPART(MILLISECOND, GETDATE()) AS NVARCHAR), 3);
    
    INSERT INTO dbo.stock_transaction_book (
        transaction_id, transaction_type, document_no, partner_unit, partner_name, posted_by
    )
    VALUES (
        @TxId, 'RECEIPT', @SoPhieuNhap, @PartnerUnit, @PartnerName, @UserName
    );

    -- Ghi nhận chi tiết lịch sử Vận hành (Inventory Ledger cấp Thùng 60)
    INSERT INTO dbo.inventory_ledger (
        ledger_date, id_60, product_code, transaction_id, source_document_no, 
        quantity_change, old_stock_type, new_stock_type
    )
    SELECT 
        CAST(GETDATE() AS DATE), MaThung60, MaSanPham, @TxId, SoPhieuNhap,
        SoLuongThung, NULL, 'UNRESTRICTED'
    FROM dbo.WMS_UC03_ScanLog
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND TrangThaiScan = N'VALID'
      AND IsDeleted = 0;

    -- Ghi nhận chi tiết lịch sử Kế toán (Item Ledger cấp Hàng hóa)
    INSERT INTO dbo.item_ledger (
        ledger_date, product_code, transaction_id, source_document_no, total_quantity_change
    )
    SELECT 
        CAST(GETDATE() AS DATE), MaSanPham, @TxId, SoPhieuNhap,
        SUM(SoLuongThung)
    FROM dbo.WMS_UC03_ScanLog
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND TrangThaiScan = N'VALID'
      AND IsDeleted = 0
    GROUP BY MaSanPham, SoPhieuNhap;

    -- Ghi nhận sự kiện vòng đời Thùng 60 (thung60_event) (BR-UC04-03)
    INSERT INTO dbo.thung60_event (
        event_id, id_60, event_type, new_status, new_stock_type, new_qty, source_document_no, request_id, performed_by
    )
    SELECT 
        NEWID(), MaThung60, 'OFFICIAL_RECEIPT_POSTED', 'AVAILABLE', 'UNRESTRICTED', SoLuongThung, SoPhieuNhap, @TxId, @UserName
    FROM dbo.WMS_UC03_ScanLog
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND TrangThaiScan = N'VALID'
      AND IsDeleted = 0;

    -- Ghi nhận Audit Log
    INSERT INTO dbo.audit_log (
        object_type, object_id, action, new_value, performed_by, ip_address
    )
    VALUES (
        'RECEIPT_CONFIRMATION', @SoPhieuNhap, 'CONFIRM_NHAP_KHO', 
        (SELECT CAST(COUNT(1) AS NVARCHAR) FROM dbo.WMS_UC03_ScanLog WHERE SoPhieuNhap = @SoPhieuNhap AND TrangThaiScan = N'VALID' AND IsDeleted = 0), 
        @UserName, '127.0.0.1'
    );

    -- Cập nhật dòng log thành CONFIRMED (BR-UC04-06)
    UPDATE dbo.WMS_UC03_ScanLog
    SET
        TrangThaiScan = N'CONFIRMED',
        KetQuaKiemTra = N'Đã xác nhận nhập kho.',
        ConfirmedAt = GETDATE(),
        ConfirmedBy = @UserName
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND (MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL)
      AND TrangThaiScan = N'VALID'
      AND IsDeleted = 0;
    END;

    -- Cập nhật trạng thái phiếu bên ERP/WMS
    UPDATE map
    SET IsDeleted = 0
    FROM dbo.WMS_PhieuNhap_DonHang_Map map
    WHERE map.SoPhieuNhap = @SoPhieuNhap;

    COMMIT TRANSACTION;

    SELECT 
        N'OK' AS Result,
        N'Xác nhận nhập kho thành công cho toàn bộ phiếu.' AS Message;
END;
GO

-- 3. Stored Procedure hủy dòng quét Staging
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC03_CancelScan
    @ScanLogID BIGINT,
    @UserName NVARCHAR(100),
    @CancelReason NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.WMS_UC03_ScanLog WITH (UPDLOCK)
            WHERE ScanLogID = @ScanLogID
              AND IsDeleted = 0
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Dòng quét không tồn tại hoặc đã bị hủy trước đó.', 16, 1);
            RETURN;
        END;

        IF EXISTS (
            SELECT 1
            FROM dbo.WMS_UC03_ScanLog WITH (NOLOCK)
            WHERE ScanLogID = @ScanLogID
              AND TrangThaiScan = N'CONFIRMED'
              AND IsDeleted = 0
        )
        BEGIN
            ROLLBACK TRANSACTION;
            RAISERROR(N'Dòng quét đã được xác nhận nhập kho chính thức (CONFIRMED), không thể hủy trực tiếp.', 16, 1);
            RETURN;
        END;

        UPDATE dbo.WMS_UC03_ScanLog
        SET
            TrangThaiScan = N'CANCELLED',
            IsDeleted = 1,
            CancelledAt = GETDATE(),
            CancelledBy = @UserName,
            CancelReason = ISNULL(@CancelReason, N'Hủy thao tác quét từ giao diện PDA/Desktop')
        WHERE ScanLogID = @ScanLogID
          AND IsDeleted = 0;

        COMMIT TRANSACTION;

        SELECT N'OK' AS Result, N'Đã hủy dòng quét Staging thành công.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;
GO
