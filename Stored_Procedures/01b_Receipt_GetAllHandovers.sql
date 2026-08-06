USE WMS1;
GO

CREATE OR ALTER PROCEDURE usp_Receipt_GetAllProductionHandovers
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Lấy danh sách phiếu chưa hoàn tất (ví dụ: TrangThaiPhieu <> 'Đã hoàn tất')
        SELECT 
            SoPhieuNhap AS handover_no,
            DonViNguon AS production_area,
            NgayNhap AS handover_date,
            TrangThaiPhieu AS status,
            SoDongChiTiet AS items_count,
            TongSoLuongNhap AS total_qty
        FROM vw_WMS_PhieuNhapKhoTP_Tong
        ORDER BY NgayNhap DESC;
    END TRY
    BEGIN CATCH
        SELECT 'ERROR' AS status, ERROR_MESSAGE() AS message;
    END CATCH
END
GO
