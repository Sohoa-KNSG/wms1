USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- 1. View danh sách dòng phiếu đang chờ xác nhận (theo dòng chi tiết)
CREATE OR ALTER VIEW dbo.vw_WMS_UC04_PhieuChoXacNhan
AS
SELECT
    ct.SoPhieuNhap,
    ct.MaChiTietPhieu,
    ct.MaSanPham,
    ct.SoLuongNhap AS SoLuongCanNhap,

    ISNULL(SUM(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') AND scan.IsDeleted = 0
        THEN scan.SoLuongThung 
        ELSE 0 
    END), 0) AS SoLuongDaQuetHopLe,

    ct.SoLuongNhap - ISNULL(SUM(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') AND scan.IsDeleted = 0
        THEN scan.SoLuongThung 
        ELSE 0 
    END), 0) AS SoLuongConLai,

    COUNT(CASE 
        WHEN scan.TrangThaiScan IN (N'VALID', N'CONFIRMED') AND scan.IsDeleted = 0
        THEN 1 
    END) AS SoThungHopLe,

    COUNT(CASE 
        WHEN scan.TrangThaiScan = N'INVALID' AND scan.IsDeleted = 0
        THEN 1 
    END) AS SoThungLoi,
    
    MAX(scan.MaDonHang) AS MaDonHang,
    MAX(scan.MaKhachHang) AS MaKhachHang

FROM dbo.vw_WMS_PhieuNhapKhoTP_ChiTiet ct
LEFT JOIN dbo.WMS_PhieuNhap_DonHang_Map map
    ON ct.SoPhieuNhap = map.SoPhieuNhap
    AND ct.MaChiTietPhieu = map.MaChiTietPhieu
    AND map.IsDeleted = 0
LEFT JOIN dbo.WMS_UC03_ScanLog scan
    ON ct.SoPhieuNhap = scan.SoPhieuNhap
    AND ct.MaChiTietPhieu = scan.MaChiTietPhieu
    AND ct.MaSanPham = scan.MaSanPham
    AND scan.TrangThaiScan IN (N'VALID', N'CONFIRMED')
    AND scan.IsDeleted = 0
WHERE ct.TrangThaiRelease = 0 -- Chỉ lấy những phiếu chưa hoàn tất bên ERP
  AND ISNULL(map.TrangThaiPhieu, N'NEW') <> N'COMPLETED' -- Và chưa hoàn tất xác nhận trong WMS
GROUP BY
    ct.SoPhieuNhap,
    ct.MaChiTietPhieu,
    ct.MaSanPham,
    ct.SoLuongNhap;
GO

-- 2. View tổng hợp cấp Phiếu
CREATE OR ALTER VIEW dbo.vw_WMS_UC04_TongHopPhieu
AS
SELECT 
    SoPhieuNhap,
    COUNT(MaChiTietPhieu) AS SoDongCanDuyet,
    SUM(SoLuongCanNhap) AS TongSoLuongCanNhap,
    SUM(SoLuongDaQuetHopLe) AS TongSoLuongDaQuetHopLe,
    SUM(SoThungHopLe) AS TongSoThungHopLe,
    MIN(CASE WHEN SoLuongDaQuetHopLe < SoLuongCanNhap THEN 0 ELSE 1 END) AS IsDuSoLuongToanPhieu
FROM dbo.vw_WMS_UC04_PhieuChoXacNhan
GROUP BY SoPhieuNhap;
GO

-- 3. SP lấy danh sách các PHIẾU chờ xác nhận
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_GetPendingHandovers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SoPhieuNhap,
        SoDongCanDuyet,
        TongSoLuongCanNhap,
        TongSoLuongDaQuetHopLe,
        TongSoThungHopLe,
        CASE 
            WHEN IsDuSoLuongToanPhieu = 1 THEN N'Đủ số lượng'
            ELSE N'Chưa đủ'
        END AS TrangThaiSoLuong
    FROM dbo.vw_WMS_UC04_TongHopPhieu
    ORDER BY SoPhieuNhap DESC;
END;
GO

-- 4. SP lấy danh sách các DÒNG CHI TIẾT của một PHIẾU cụ thể
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_GetHandoverLines
    @SoPhieuNhap NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SoPhieuNhap,
        MaChiTietPhieu,
        MaSanPham,
        MaDonHang,
        MaKhachHang,
        SoLuongCanNhap,
        SoLuongDaQuetHopLe,
        SoLuongConLai,
        SoThungHopLe,
        SoThungLoi,
        CASE 
            WHEN SoLuongDaQuetHopLe >= SoLuongCanNhap THEN N'Đủ số lượng'
            ELSE N'Chưa đủ'
        END AS TrangThaiSoLuong
    FROM dbo.vw_WMS_UC04_PhieuChoXacNhan
    WHERE SoPhieuNhap = @SoPhieuNhap
    ORDER BY MaChiTietPhieu ASC;
END;
GO

-- 5. SP lấy chi tiết các thùng chờ xác nhận của một dòng phiếu
CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_GetPendingBoxes
    @SoPhieuNhap NVARCHAR(50),
    @MaChiTietPhieu NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        MaThung60,
        MaSanPham,
        SoLuongThung,
        MaDonHang,
        MaKhachHang,
        TrangThaiPackaging,
        TrangThaiScan,
        KetQuaKiemTra,
        CreatedAt,
        CreatedBy
    FROM dbo.WMS_UC03_ScanLog
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND MaChiTietPhieu = @MaChiTietPhieu
      AND TrangThaiScan = N'VALID'
      AND IsDeleted = 0
    ORDER BY CreatedAt DESC;
END;
GO
