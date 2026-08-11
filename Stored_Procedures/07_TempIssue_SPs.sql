-- Retained only to fail closed for legacy callers.
-- UC18 now requires borrower, due date and declared SKU quantities, none of which
-- exist in this legacy contract. Use POST /api/v1/temporary-dispatch instead.
CREATE OR ALTER PROCEDURE dbo.usp_TempIssue_Create
    @request_id NVARCHAR(100),
    @user_code NVARCHAR(100),
    @user_email NVARCHAR(255),
    @device_id NVARCHAR(100) = NULL,
    @source_screen NVARCHAR(100) = NULL,
    @note NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    THROW 51000, N'usp_TempIssue_Create đã ngừng sử dụng. Hãy gọi API temporary-dispatch với đầy đủ người mượn, hạn trả và danh sách SKU.', 1;
END
GO
