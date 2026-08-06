-- =============================================
-- Mô tả: SP lấy danh sách giao dịch Sổ Cái (Master)
-- Ngày tạo: 2026-07-10
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_WMS_GetTransactions
    @Type NVARCHAR(50) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        transaction_id AS TransactionId,
        transaction_type AS TransactionType,
        document_no AS DocumentNo,
        partner_unit AS PartnerUnit,
        partner_name AS PartnerName,
        posted_by AS PostedBy,
        posted_at AS PostedAt
    FROM dbo.stock_transaction_book
    WHERE 
        (@Type IS NULL OR transaction_type = @Type)
        AND (@FromDate IS NULL OR CAST(posted_at AS DATE) >= @FromDate)
        AND (@ToDate IS NULL OR CAST(posted_at AS DATE) <= @ToDate)
    ORDER BY posted_at DESC;
END;
GO

-- =============================================
-- Mô tả: SP lấy chi tiết giao dịch Sổ Cái (Detail)
-- Ngày tạo: 2026-07-10
-- =============================================
CREATE OR ALTER PROCEDURE dbo.usp_WMS_GetTransactionDetails
    @TransactionId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ledger_id AS LedgerId,
        ledger_date AS LedgerDate,
        id_60 AS Id60,
        product_code AS ProductCode,
        transaction_id AS TransactionId,
        source_document_no AS SourceDocumentNo,
        quantity_change AS QuantityChange,
        old_stock_type AS OldStockType,
        new_stock_type AS NewStockType,
        created_at AS CreatedAt
    FROM dbo.inventory_ledger
    WHERE transaction_id = @TransactionId
    ORDER BY created_at ASC;
END;
GO
