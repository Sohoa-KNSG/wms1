-- Legacy allocation contract cannot represent the current UC16 scan-based
-- allocation workflow. Fail closed instead of returning a false SUCCESS.
CREATE OR ALTER PROCEDURE dbo.usp_Outbound_Allocate
    @issue_no NVARCHAR(50),
    @request_id NVARCHAR(100),
    @user_code NVARCHAR(100),
    @user_email NVARCHAR(255),
    @device_id NVARCHAR(100) = NULL,
    @source_screen NVARCHAR(100) = NULL,
    @note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    THROW 51000, N'usp_Outbound_Allocate đã ngừng sử dụng. UC16 phân bổ tồn bằng API picking/scan theo FIFO.', 1;
END
GO

-- Compatibility wrapper for partial issue. The canonical implementation owns
-- the virtual-carton creation, source locking, event trail and idempotency.
CREATE OR ALTER PROCEDURE dbo.usp_Outbound_PartialIssue
    @issue_no NVARCHAR(50),
    @issue_line_no INT,
    @source_id_60 NVARCHAR(50),
    @partial_qty DECIMAL(18,4),
    @request_id NVARCHAR(100),
    @user_code NVARCHAR(100),
    @user_email NVARCHAR(255),
    @device_id NVARCHAR(100) = NULL,
    @source_screen NVARCHAR(100) = NULL,
    @note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ProductCode NVARCHAR(50);
    SELECT @ProductCode = product_code
    FROM dbo.delivery_note_detail
    WHERE delivery_note_no = @issue_no
      AND line_no = @issue_line_no;

    IF @ProductCode IS NULL
    BEGIN
        THROW 51000, N'Không tìm thấy dòng phiếu xuất để thực hiện xuất lẻ.', 1;
    END

    EXEC dbo.usp_WMS_UC16_SplitBox
        @DeliveryNoteNo = @issue_no,
        @ProductCode = @ProductCode,
        @SourceId60 = @source_id_60,
        @SplitQty = @partial_qty,
        @ScannedBy = @user_code,
        @RequestId = @request_id;
END
GO
