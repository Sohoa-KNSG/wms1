USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. View đọc dữ liệu thùng 60 từ Packaging
CREATE OR ALTER VIEW dbo.vw_WMS_Thung60_Packaging
AS
SELECT
    AutoP       AS PackagingAutoID,
    id_60       AS MaThung60,
    InvID       AS MaSanPham,
    PO_code     AS MaPO,
    soluong     AS SoLuongTrongThung,
    BatNbr      AS SoPhieuNhap_Packaging,
    RecordID    AS MaChiTietPhieu_Packaging,
    OEM_1       AS MaDonHang_Packaging,
    trangthai   AS TrangThaiThung,
    time_cre1   AS ThoiGianTaoThung,
    date_cre    AS NgayTao,
    id_thung360 AS MaThung360,
    time_cre2   AS ThoiGianDongGoiThung360,
    time_xuat   AS ThoiGianXuat,
    trong_luong AS TrongLuong
FROM [Packaging].[dbo].[tbl_thung60];
GO

-- 2. Bảng log quét nhập kho UC03
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WMS_UC03_ScanLog')
BEGIN
    CREATE TABLE dbo.WMS_UC03_ScanLog
    (
        ScanLogID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,

        SoPhieuNhap NVARCHAR(50) NOT NULL,
        MaChiTietPhieu NVARCHAR(50) NOT NULL,
        MaSanPham NVARCHAR(50) NOT NULL,

        MaDonHang NVARCHAR(50) NOT NULL,
        MaKhachHang NVARCHAR(50) NULL,

        MaThung60 NVARCHAR(100) NOT NULL,
        SoLuongThung DECIMAL(18,2) NULL,

        TrangThaiPackaging NVARCHAR(10) NULL,

        TrangThaiScan NVARCHAR(30) NOT NULL DEFAULT N'PENDING',
        KetQuaKiemTra NVARCHAR(500) NULL,

        CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
        CreatedBy NVARCHAR(100) NULL,

        ConfirmedAt DATETIME NULL,
        ConfirmedBy NVARCHAR(100) NULL,

        CancelledAt DATETIME NULL,
        CancelledBy NVARCHAR(100) NULL,
        CancelReason NVARCHAR(500) NULL,

        IsDeleted BIT NOT NULL DEFAULT 0
    );

    -- Index chống quét trùng thùng hợp lệ
    CREATE UNIQUE INDEX UX_WMS_UC03_ScanLog_MaThung60_Active
    ON dbo.WMS_UC03_ScanLog(MaThung60)
    WHERE IsDeleted = 0
      AND TrangThaiScan IN (N'VALID', N'CONFIRMED');

    -- Index hỗ trợ xem tiến độ theo phiếu
    CREATE INDEX IX_WMS_UC03_ScanLog_Phieu
    ON dbo.WMS_UC03_ScanLog
    (
        SoPhieuNhap,
        MaChiTietPhieu,
        MaSanPham,
        TrangThaiScan
    )
    INCLUDE
    (
        MaThung60,
        SoLuongThung,
        CreatedAt,
        CreatedBy
    );
END
GO

-- 3. View tiến độ quét nhập
CREATE OR ALTER VIEW dbo.vw_WMS_UC03_TienDoQuetNhap
AS
SELECT
    ct.SoPhieuNhap,
    ct.MaChiTietPhieu,
    ct.MaSanPham,
    ct.SoLuongNhap AS SoLuongCanNhap,

    ISNULL(SUM(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') 
             AND scan.IsDeleted = 0
        THEN scan.SoLuongThung 
        ELSE 0 
    END), 0) AS SoLuongDaQuetHopLe,

    ct.SoLuongNhap - ISNULL(SUM(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') 
             AND scan.IsDeleted = 0
        THEN scan.SoLuongThung 
        ELSE 0 
    END), 0) AS SoLuongConLai,

    COUNT(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') 
             AND scan.IsDeleted = 0
        THEN 1 
    END) AS SoThungHopLe,

    COUNT(CASE 
        WHEN scan.TrangThaiScan = N'INVALID' 
             AND scan.IsDeleted = 0
        THEN 1 
    END) AS SoThungLoi

FROM dbo.vw_WMS_PhieuNhapKhoTP_ChiTiet ct
LEFT JOIN dbo.WMS_UC03_ScanLog scan
    ON ct.SoPhieuNhap = scan.SoPhieuNhap
    AND ct.MaChiTietPhieu = scan.MaChiTietPhieu
    AND ct.MaSanPham = scan.MaSanPham
GROUP BY
    ct.SoPhieuNhap,
    ct.MaChiTietPhieu,
    ct.MaSanPham,
    ct.SoLuongNhap;
GO
