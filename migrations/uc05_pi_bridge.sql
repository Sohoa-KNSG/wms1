USE WMS1;
GO

-- 1. Add columns to pack360_header
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'weight_source' AND Object_ID = Object_ID('pack360_header'))
BEGIN
    ALTER TABLE pack360_header ADD weight_source VARCHAR(20) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'print_job_id' AND Object_ID = Object_ID('pack360_header'))
BEGIN
    ALTER TABLE pack360_header ADD print_job_id VARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE Name = 'print_status' AND Object_ID = Object_ID('pack360_header'))
BEGIN
    ALTER TABLE pack360_header ADD print_status VARCHAR(20) NULL;
END
GO

-- 2. Create table pack360_reprint_audit
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE Name = 'pack360_reprint_audit')
BEGIN
    CREATE TABLE pack360_reprint_audit (
        id INT IDENTITY(1,1) PRIMARY KEY,
        pack360_id VARCHAR(50) NULL,
        reason NVARCHAR(255) NULL,
        user_code VARCHAR(50) NULL,
        print_job_id VARCHAR(50) NULL,
        created_at DATETIME DEFAULT GETDATE()
    );
END
GO

-- 3. Update SP usp_Pack360_Complete
ALTER PROCEDURE usp_Pack360_Complete
    @pack360_id NVARCHAR(50),
    @weight DECIMAL(18,2),
    @user_code NVARCHAR(50),
    @weight_source VARCHAR(20) = NULL,
    @print_job_id VARCHAR(50) = NULL,
    @print_status VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @status NVARCHAR(30);
    DECLARE @first_qr_60 NVARCHAR(255);
    DECLARE @product_code NVARCHAR(50);
    DECLARE @channel NVARCHAR(50);
    
    SELECT @status = status 
    FROM pack360_header 
    WHERE pack360_id = @pack360_id;
    
    IF @status <> 'OPEN'
    BEGIN
        RAISERROR(N'Pack360 không ở trạng thái OPEN', 16, 1);
        RETURN;
    END

    -- Lấy QR của 1 thùng 60 để parse Channel và ProductCode
    SELECT TOP 1 @first_qr_60 = t.qr_60, @product_code = t.product_code
    FROM pack360_unit u
    INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
    WHERE u.pack360_id = @pack360_id AND u.is_current = 1;
    
    -- Parse Channel từ QR (VD: K07/1/D.01-16/GT/l6/13/49)
    DECLARE @p1 INT = CHARINDEX('/', @first_qr_60)
    DECLARE @p2 INT = CHARINDEX('/', @first_qr_60, @p1 + 1)
    DECLARE @p3 INT = CHARINDEX('/', @first_qr_60, @p2 + 1)
    DECLARE @p4 INT = CHARINDEX('/', @first_qr_60, @p3 + 1)
    SET @channel = SUBSTRING(@first_qr_60, @p3 + 1, @p4 - @p3 - 1)
    
    -- Sinh QR code mới
    DECLARE @dateStr NVARCHAR(10) = FORMAT(GETDATE(), 'dd/MM/yy'); -- dd/MM/yy
    -- Định dạng yêu cầu: GT/D.01-16/13/07/26/90 (90 là sequence)
    DECLARE @prefix NVARCHAR(100) = @channel + '/' + @product_code + '/' + @dateStr + '/';
    DECLARE @seq INT;
    
    SELECT @seq = ISNULL(MAX(CAST(REPLACE(pack360_qr, @prefix, '') AS INT)), 0) + 1
    FROM pack360_header
    WHERE pack360_qr LIKE @prefix + '%' AND ISNUMERIC(REPLACE(pack360_qr, @prefix, '')) = 1;
    
    DECLARE @new_qr NVARCHAR(255) = @prefix + CAST(@seq AS NVARCHAR(10));
    
    BEGIN TRY
        BEGIN TRANSACTION;
     
        UPDATE pack360_header
        SET status = 'COMPLETED',
            weight = @weight,
            completed_by = @user_code,
            completed_at = GETDATE(),
            pack360_qr = @new_qr,
            weight_source = @weight_source,
            print_job_id = @print_job_id,
            print_status = @print_status
        WHERE pack360_id = @pack360_id;
        
        COMMIT TRANSACTION;
        
        -- Trả về dữ liệu QR cho API
        SELECT @new_qr AS Pack360_QR, @weight AS Weight, @product_code AS ProductCode, @channel AS Channel;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END 
GO

-- 4. Create SP usp_Pack360_Reprint_Audit
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'usp_Pack360_Reprint_Audit')
    DROP PROCEDURE usp_Pack360_Reprint_Audit;
GO
CREATE PROCEDURE usp_Pack360_Reprint_Audit
    @pack360_id VARCHAR(50),
    @reason NVARCHAR(255),
    @user_code VARCHAR(50),
    @print_job_id VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    -- Generate a new GUID without hyphens as print_job_id
    SET @print_job_id = REPLACE(NEWID(), '-', '');
    
    INSERT INTO pack360_reprint_audit (pack360_id, reason, user_code, print_job_id, created_at)
    VALUES (@pack360_id, @reason, @user_code, @print_job_id, GETDATE());
    
    -- Also update the header to link to the new print job
    UPDATE pack360_header
    SET print_job_id = @print_job_id,
        print_status = 'PENDING'
    WHERE pack360_id = @pack360_id;
END
GO
