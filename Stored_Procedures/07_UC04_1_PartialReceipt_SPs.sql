USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =====================================================================================
-- Danh sách Stored Procedures cho UC04.1 (Xác nhận nhập lẻ / Partial Receipt)
-- =====================================================================================

-- 1. SP Xác nhận Nhập Lẻ (Tạo thùng ảo cho số lượng lẻ chưa có mã QR vật lý)
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_1_ConfirmNhapLe
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50),
    @SoLuongLe DECIMAL(18,4),
    @UserName NVARCHAR(50),
    @PartnerName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- 1. Kiểm tra đầu vào cơ bản
    IF ISNULL(@SoLuongLe, 0) <= 0
    BEGIN
        RAISERROR(N'Số lượng lẻ phải lớn hơn 0.', 16, 1);
        RETURN;
    END;

    BEGIN TRANSACTION;

    -- 2. Kiểm tra điều kiện: Số lượng lẻ nhập vào có vừa khớp với phần còn thiếu không? (BR-UC04.1-01)
    DECLARE @SoLuongCanNhap DECIMAL(18,4);
    DECLARE @SoLuongDaQuetHopLe DECIMAL(18,4);
    DECLARE @MaSanPham NVARCHAR(50);
    DECLARE @MaDonHang NVARCHAR(50);
    DECLARE @MaKhachHang NVARCHAR(50);
    DECLARE @PartnerUnit NVARCHAR(100);

    -- Lấy thông tin dòng phiếu
    SELECT 
        @SoLuongCanNhap = SoLuongCanNhap,
        @SoLuongDaQuetHopLe = SoLuongDaQuetHopLe,
        @MaSanPham = MaSanPham
    FROM dbo.vw_WMS_UC04_PhieuChoXacNhan
    WHERE SoPhieuNhap = @SoPhieuNhap AND MaChiTietPhieu = @MaChiTietPhieu;

    IF @SoLuongCanNhap IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Không tìm thấy dòng chi tiết phiếu nhập.', 16, 1);
        RETURN;
    END;

    -- Số lượng lẻ cần nhập = Số lượng chứng từ - Số lượng chẵn đã quét
    DECLARE @SoLuongThieu DECIMAL(18,4) = @SoLuongCanNhap - @SoLuongDaQuetHopLe;
    
    IF @SoLuongLe <> @SoLuongThieu
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR(N'Số lượng lẻ khai báo không khớp với số dư còn thiếu của phiếu nhập kho.', 16, 1);
        RETURN;
    END;

    -- Lấy thông tin đơn hàng đã được map
    SELECT TOP 1 @MaDonHang = MaDonHang
    FROM dbo.WMS_PhieuNhap_DonHang_Map
    WHERE SoPhieuNhap = @SoPhieuNhap AND MaChiTietPhieu = @MaChiTietPhieu AND IsDeleted = 0;

    SELECT TOP 1 @MaKhachHang = MaKhachHang
    FROM dbo.vw_WMS_DonHangOEM_Tong
    WHERE MaDonHang = @MaDonHang;

    SELECT TOP 1 @PartnerUnit = DonviNguon 
    FROM dbo.vw_WMS_PhieuNhapKhoTP_Tong 
    WHERE SoPhieuNhap = @SoPhieuNhap;

    -- 3. Tạo Mã Thùng Ảo
    DECLARE @VirtualId60 NVARCHAR(50) = 'VIR-' + @SoPhieuNhap + '-' + @MaChiTietPhieu + '-' + RIGHT('0' + CAST(DATEPART(HOUR, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(MINUTE, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(SECOND, GETDATE()) AS NVARCHAR), 2);
    
    -- 4. Ghi dữ liệu vào bảng tbl_thung60_kho (BR-UC04.1-02)
    INSERT INTO dbo.tbl_thung60_kho (
        id_60, qr_60, product_code, original_qty, current_qty, 
        uom, status, stock_type, is_virtual, unit_origin_type, 
        receipt_session_no, current_oem_order_no, customer_code,
        gross_weight
    )
    VALUES (
        @VirtualId60, @VirtualId60, @MaSanPham, @SoLuongLe, @SoLuongLe,
        'PCS', 'AVAILABLE', 'UNRESTRICTED', 1, 'RECEIPT_VIRTUAL',
        @SoPhieuNhap, @MaDonHang, @MaKhachHang,
        0
    );

    -- 4.5. Ghi nhận vào ScanLog với trạng thái CONFIRMED để đồng bộ dữ liệu vào View Tiến độ
    INSERT INTO dbo.WMS_UC03_ScanLog (
        SoPhieuNhap, MaChiTietPhieu, MaSanPham, MaDonHang, MaKhachHang,
        MaThung60, SoLuongThung, TrangThaiPackaging, TrangThaiScan, 
        KetQuaKiemTra, CreatedBy, ConfirmedAt, ConfirmedBy
    )
    VALUES (
        @SoPhieuNhap, @MaChiTietPhieu, @MaSanPham, ISNULL(@MaDonHang, N''), ISNULL(@MaKhachHang, N''),
        @VirtualId60, @SoLuongLe, N'3', N'CONFIRMED', 
        N'Tạo thùng ảo do nhập lẻ', @UserName, GETDATE(), @UserName
    );

    -- 5. Ghi nhận Sổ Cái Kép (Dual Ledger) (BR-UC04.1-03)
    DECLARE @TxId NVARCHAR(50) = 'TX-IN-LE-' + @SoPhieuNhap + '-' + RIGHT('0' + CAST(DATEPART(HOUR, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(MINUTE, GETDATE()) AS NVARCHAR), 2) + RIGHT('0' + CAST(DATEPART(SECOND, GETDATE()) AS NVARCHAR), 2) + RIGHT('00' + CAST(DATEPART(MILLISECOND, GETDATE()) AS NVARCHAR), 3);
    
    -- Ghi nhận lịch sử giao dịch tổng (Transaction Book)
    INSERT INTO dbo.stock_transaction_book (
        transaction_id, transaction_type, document_no, partner_unit, partner_name, posted_by
    )
    VALUES (
        @TxId, 'RECEIPT_PARTIAL', @SoPhieuNhap, @PartnerUnit, @PartnerName, @UserName
    );

    -- Ghi nhận Sổ cái Vận hành (Inventory Ledger cấp Thùng)
    INSERT INTO dbo.inventory_ledger (
        ledger_date, id_60, product_code, transaction_id, source_document_no, 
        quantity_change, old_stock_type, new_stock_type
    )
    VALUES (
        CAST(GETDATE() AS DATE), @VirtualId60, @MaSanPham, @TxId, @SoPhieuNhap,
        @SoLuongLe, NULL, 'UNRESTRICTED'
    );

    -- Ghi nhận Sổ cái Kế toán (Item Ledger cấp Hàng hóa)
    INSERT INTO dbo.item_ledger (
        ledger_date, product_code, transaction_id, source_document_no, total_quantity_change
    )
    VALUES (
        CAST(GETDATE() AS DATE), @MaSanPham, @TxId, @SoPhieuNhap, @SoLuongLe
    );

    -- 6. Ghi nhận Event Thùng (thung60_event) (BR-UC04.1-04)
    INSERT INTO dbo.thung60_event (
        event_id, id_60, event_type, new_status, new_stock_type, new_qty, source_document_no, request_id, performed_by
    )
    VALUES (
        NEWID(), @VirtualId60, 'OFFICIAL_RECEIPT_POSTED', 'AVAILABLE', 'UNRESTRICTED', @SoLuongLe, @SoPhieuNhap, @TxId, @UserName
    );

    -- 7. Ghi nhận Audit Log
    INSERT INTO dbo.audit_log (
        object_type, object_id, action, new_value, performed_by, ip_address
    )
    VALUES (
        'RECEIPT_PARTIAL', @SoPhieuNhap, 'CONFIRM_NHAP_LE', 
        CAST(@SoLuongLe AS NVARCHAR) + N' (Thùng ảo: ' + @VirtualId60 + N')', 
        @UserName, '127.0.0.1'
    );

    COMMIT TRANSACTION;
END;
GO
