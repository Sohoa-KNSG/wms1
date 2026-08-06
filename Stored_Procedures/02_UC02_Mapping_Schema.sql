USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- =========================================================================
-- MAPPING SCHEMA (UC02: Nhận phiếu giao kho từ sản xuất)
-- =========================================================================

-- Bảng lưu trữ mapping giữa dòng phiếu nhập và mã đơn hàng
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WMS_PhieuNhap_DonHang_Map')
BEGIN
    CREATE TABLE dbo.WMS_PhieuNhap_DonHang_Map
    (
        ID BIGINT IDENTITY(1,1) PRIMARY KEY,

        SoPhieuNhap NVARCHAR(50) NOT NULL,
        MaChiTietPhieu NVARCHAR(50) NOT NULL,
        MaSanPham NVARCHAR(50) NOT NULL,
        MaDonHang NVARCHAR(50) NOT NULL,
        MaDotGiao INT NOT NULL DEFAULT 1,

        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(100) NULL,
        UpdatedAt DATETIME NULL,
        UpdatedBy NVARCHAR(100) NULL,

        IsDeleted BIT NOT NULL DEFAULT 0
    );

    -- Tạo index unique để mỗi dòng phiếu chỉ có 1 mã đơn hàng đang hiệu lực
    CREATE UNIQUE INDEX UX_WMS_PhieuNhap_DonHang_Map_Active
    ON dbo.WMS_PhieuNhap_DonHang_Map
    (
        SoPhieuNhap,
        MaChiTietPhieu
    )
    WHERE IsDeleted = 0;
END
GO
