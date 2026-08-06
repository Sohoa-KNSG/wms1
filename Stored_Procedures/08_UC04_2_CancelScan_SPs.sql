USE WMS1;
GO
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

CREATE OR ALTER PROCEDURE dbo.usp_WMS_UC04_2_CancelScan
    @SoPhieuNhap NVARCHAR(50),
    @LyDoHuy NVARCHAR(500),
    @UserName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    -- Kiểm tra xem phiếu nhập có tồn tại trong ScanLog chưa và trạng thái có phải là CONFIRMED không.
    -- Fail-fast 1: Nếu đã có record trong ledger cho phiếu này
    IF EXISTS (
        SELECT 1
        FROM dbo.inventory_ledger
        WHERE source_document_no = @SoPhieuNhap
    )
    BEGIN
        RAISERROR(N'Phiếu đã được Thủ kho xác nhận và ghi vào Sổ cái. Không thể hủy.', 16, 1);
        RETURN;
    END;

    -- Fail-fast 2: Kiểm tra xem có bản ghi quét nào đang ở trạng thái CONFIRMED không (bảo vệ kép)
    IF EXISTS (
        SELECT 1
        FROM dbo.WMS_UC03_ScanLog
        WHERE SoPhieuNhap = @SoPhieuNhap
          AND TrangThaiScan = N'CONFIRMED'
          AND IsDeleted = 0
    )
    BEGIN
        RAISERROR(N'Một số kết quả quét của Phiếu đã được xác nhận. Không thể hủy.', 16, 1);
        RETURN;
    END;

    BEGIN TRANSACTION;

    UPDATE dbo.WMS_UC03_ScanLog
    SET
        TrangThaiScan = N'CANCELLED',
        IsDeleted = 1,
        CancelledAt = GETDATE(),
        CancelledBy = @UserName,
        CancelReason = @LyDoHuy
    WHERE SoPhieuNhap = @SoPhieuNhap
      AND IsDeleted = 0;

    -- Ghi nhận Audit Log
    INSERT INTO dbo.audit_log (
        object_type, object_id, action, new_value, performed_by, ip_address
    )
    VALUES (
        'RECEIPT_SESSION', @SoPhieuNhap, 'CANCEL_SCAN', 
        @LyDoHuy, @UserName, '127.0.0.1'
    );

    COMMIT TRANSACTION;

    SELECT N'OK' AS Result, N'Hủy kết quả quét thành công.' AS Message;
END;
GO
