USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =========================================================================
-- STORED PROCEDURES (UC02: Nhận phiếu giao kho từ sản xuất)
-- =========================================================================

-- 1. Tìm kiếm đơn hàng OEM
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC02_SearchDonHang
    @Keyword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.vw_WMS_DonHangOEM_ChiTiet WHERE MaHang = @Keyword)
    BEGIN
        SELECT DISTINCT TOP 50
            MaDonHang,
            MaHang,
            1 AS MaDotGiao,
            MaKhachHang,
            MaPO,
            SoLuongDonHang
        FROM dbo.vw_WMS_DonHangOEM_ChiTiet
        WHERE MaHang = @Keyword
        ORDER BY MaDonHang, MaHang;
    END
    ELSE
    BEGIN
        SELECT DISTINCT TOP 50
            MaDonHang,
            MaHang,
            1 AS MaDotGiao,
            MaKhachHang,
            MaPO,
            SoLuongDonHang
        FROM dbo.vw_WMS_DonHangOEM_ChiTiet
        WHERE 
            MaHang = @Keyword
            AND (
                MaDonHang LIKE '%' + @Keyword + '%'
                OR MaKhachHang LIKE '%' + @Keyword + '%'
                OR MaPO LIKE '%' + @Keyword + '%'
            )
        ORDER BY MaDonHang, MaHang;
    END
END;
GO

-- 2. Cập nhật mã đơn hàng cho dòng phiếu nhập
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC02_UpdateMaDonHang
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50),
    @MaSanPham NVARCHAR(50),
    @MaDonHang NVARCHAR(50),
    @UserId NVARCHAR(50) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Fail-fast Check: Kiểm tra mã sản phẩm thuộc đơn hàng OEM trong View ERP (nếu có dữ liệu)
        IF EXISTS (SELECT 1 FROM dbo.vw_WMS_DonHangOEM_ChiTiet WHERE MaDonHang = @MaDonHang)
           AND NOT EXISTS (SELECT 1 FROM dbo.vw_WMS_DonHangOEM_ChiTiet WHERE MaDonHang = @MaDonHang AND MaHang = @MaSanPham)
        BEGIN
            RAISERROR(N'ERR_UC02_PRODUCT_MISMATCH: Mã sản phẩm [%s] không thuộc Đơn hàng OEM [%s] trên hệ thống ERP.', 16, 1, @MaSanPham, @MaDonHang);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- Check Soft-Lock: Không cho phép đổi mã Đơn hàng nếu đã phát sinh quét tem (ở kho tạm hoặc chính thức)
        IF EXISTS (SELECT 1 FROM dbo.tbl_thung60_kho WITH (NOLOCK) WHERE production_handover_no = @SoPhieuNhap AND product_code = @MaSanPham)
           OR EXISTS (SELECT 1 FROM dbo.WMS_UC03_ScanLog WITH (NOLOCK) WHERE SoPhieuNhap = @SoPhieuNhap AND MaSanPham = @MaSanPham AND IsDeleted = 0 AND TrangThaiScan IN ('VALID', 'CONFIRMED'))
        BEGIN
            RAISERROR(N'ERR_UC02_LOCKED: Dòng phiếu đã phát sinh quét tem nhập kho, không được phép sửa mã đơn.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF EXISTS (
            SELECT 1
            FROM dbo.WMS_PhieuNhap_DonHang_Map
            WHERE SoPhieuNhap = @SoPhieuNhap
              AND MaChiTietPhieu = @MaChiTietPhieu
              AND IsDeleted = 0
        )
        BEGIN
            UPDATE dbo.WMS_PhieuNhap_DonHang_Map
            SET 
                MaSanPham = @MaSanPham,
                MaDonHang = @MaDonHang,
                UpdatedAt = GETDATE(),
                UpdatedBy = @UserId
            WHERE SoPhieuNhap = @SoPhieuNhap
              AND MaChiTietPhieu = @MaChiTietPhieu
              AND IsDeleted = 0;
        END
        ELSE
        BEGIN
            INSERT INTO dbo.WMS_PhieuNhap_DonHang_Map
            (
                SoPhieuNhap,
                MaChiTietPhieu,
                MaSanPham,
                MaDonHang,
                CreatedBy
            )
            VALUES
            (
                @SoPhieuNhap,
                @MaChiTietPhieu,
                @MaSanPham,
                @MaDonHang,
                @UserId
            );
        END;

        COMMIT TRANSACTION;

        SELECT 
            'SUCCESS' AS status,
            N'Gán mã đơn hàng OEM thành công' AS message,
            @SoPhieuNhap AS SoPhieuNhap,
            @MaChiTietPhieu AS MaChiTietPhieu,
            @MaDonHang AS MaDonHang;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- 3. Hủy gán (xóa mềm) mã đơn hàng OEM cho dòng phiếu nhập
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC02_UnmapMaDonHang
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50),
    @MaSanPham NVARCHAR(50),
    @UserId NVARCHAR(50) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- 4. Fail-fast Check: Kiểm tra Soft-Lock (Đã phát sinh dữ liệu quét chưa)
        IF EXISTS (
            SELECT 1 FROM dbo.tbl_thung60_kho WITH (NOLOCK)
            WHERE production_handover_no = @SoPhieuNhap AND product_code = @MaSanPham
        )
        OR EXISTS (
            SELECT 1 FROM dbo.WMS_UC03_ScanLog WITH (NOLOCK)
            WHERE SoPhieuNhap = @SoPhieuNhap AND MaSanPham = @MaSanPham AND IsDeleted = 0 AND TrangThaiScan IN ('VALID', 'CONFIRMED')
        )
        BEGIN
            RAISERROR(N'ERR_UC02_LOCKED: Dòng phiếu đã phát sinh quét tem nhập kho, không được phép hủy gán mã đơn.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        IF EXISTS (
            SELECT 1 FROM dbo.WMS_PhieuNhap_DonHang_Map
            WHERE SoPhieuNhap = @SoPhieuNhap AND MaChiTietPhieu = @MaChiTietPhieu AND IsDeleted = 0
        )
        BEGIN
            UPDATE dbo.WMS_PhieuNhap_DonHang_Map
            SET 
                IsDeleted = 1,
                UpdatedAt = GETDATE(),
                UpdatedBy = @UserId
            WHERE SoPhieuNhap = @SoPhieuNhap 
              AND MaChiTietPhieu = @MaChiTietPhieu 
              AND IsDeleted = 0;
        END;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO
