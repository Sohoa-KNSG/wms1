USE WMS1;
GO

IF COL_LENGTH('dbo.stock_type_change_request_header', 'request_id') IS NULL
BEGIN
    ALTER TABLE dbo.stock_type_change_request_header ADD request_id NVARCHAR(100) NULL;
    UPDATE dbo.stock_type_change_request_header
    SET request_id = request_no
    WHERE request_id IS NULL;
    ALTER TABLE dbo.stock_type_change_request_header ALTER COLUMN request_id NVARCHAR(100) NOT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.stock_type_change_request_header')
      AND name = 'UX_stock_type_change_request_id'
)
BEGIN
    CREATE UNIQUE INDEX UX_stock_type_change_request_id
        ON dbo.stock_type_change_request_header(request_id);
END
GO

IF OBJECT_ID('dbo.inventory_period_closing', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.inventory_period_closing (
        closing_id NVARCHAR(50) NOT NULL PRIMARY KEY,
        request_id NVARCHAR(100) NOT NULL UNIQUE,
        closing_year INT NOT NULL,
        closing_month INT NOT NULL,
        status NVARCHAR(30) NOT NULL,
        closed_by NVARCHAR(50) NOT NULL,
        closed_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_inventory_period UNIQUE (closing_year, closing_month),
        CONSTRAINT CK_inventory_period_month CHECK (closing_month BETWEEN 1 AND 12)
    );
END
GO

IF OBJECT_ID('dbo.monthly_carton_balances', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.monthly_carton_balances (
        closing_id NVARCHAR(50) NOT NULL,
        closing_year INT NOT NULL,
        closing_month INT NOT NULL,
        id_60 NVARCHAR(50) NOT NULL,
        product_code NVARCHAR(50) NOT NULL,
        closing_qty DECIMAL(18,4) NOT NULL,
        current_location_code NVARCHAR(50) NULL,
        stock_type NVARCHAR(30) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT PK_monthly_carton_balances PRIMARY KEY (closing_id, id_60),
        CONSTRAINT FK_monthly_carton_closing FOREIGN KEY (closing_id)
            REFERENCES dbo.inventory_period_closing(closing_id)
    );
END
GO

IF OBJECT_ID('dbo.monthly_inventory_balances', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.monthly_inventory_balances (
        closing_id NVARCHAR(50) NOT NULL,
        closing_year INT NOT NULL,
        closing_month INT NOT NULL,
        product_code NVARCHAR(50) NOT NULL,
        total_closing_qty DECIMAL(18,4) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT PK_monthly_inventory_balances PRIMARY KEY (closing_id, product_code),
        CONSTRAINT FK_monthly_inventory_closing FOREIGN KEY (closing_id)
            REFERENCES dbo.inventory_period_closing(closing_id)
    );
END
GO
