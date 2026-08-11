SET XACT_ABORT ON;
GO

BEGIN TRANSACTION;

IF COL_LENGTH('dbo.tbl_temporary_dispatch_header', 'request_id') IS NULL
BEGIN
    ALTER TABLE dbo.tbl_temporary_dispatch_header ADD request_id NVARCHAR(100) NULL;
    UPDATE dbo.tbl_temporary_dispatch_header
    SET request_id = CONCAT('LEGACY-', dispatch_no)
    WHERE request_id IS NULL;
    ALTER TABLE dbo.tbl_temporary_dispatch_header ALTER COLUMN request_id NVARCHAR(100) NOT NULL;
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID('dbo.tbl_temporary_dispatch_header')
      AND name = 'ux_temp_dispatch_request_id'
)
BEGIN
    CREATE UNIQUE INDEX ux_temp_dispatch_request_id
        ON dbo.tbl_temporary_dispatch_header(request_id);
END;

IF OBJECT_ID('dbo.tbl_temporary_dispatch_request_line', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.tbl_temporary_dispatch_request_line (
        dispatch_no NVARCHAR(50) NOT NULL,
        line_no INT NOT NULL,
        product_code NVARCHAR(50) NOT NULL,
        requested_qty DECIMAL(18,4) NOT NULL,
        scanned_qty DECIMAL(18,4) NOT NULL CONSTRAINT df_temp_request_scanned_qty DEFAULT 0,
        CONSTRAINT pk_temp_dispatch_request_line PRIMARY KEY (dispatch_no, line_no),
        CONSTRAINT fk_temp_dispatch_request_header FOREIGN KEY (dispatch_no)
            REFERENCES dbo.tbl_temporary_dispatch_header(dispatch_no)
    );
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'fk_temp_dispatch_request_header'
      AND parent_object_id = OBJECT_ID('dbo.tbl_temporary_dispatch_request_line')
)
BEGIN
    ALTER TABLE dbo.tbl_temporary_dispatch_request_line WITH CHECK
        ADD CONSTRAINT fk_temp_dispatch_request_header
        FOREIGN KEY (dispatch_no)
        REFERENCES dbo.tbl_temporary_dispatch_header(dispatch_no);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'fk_temp_dispatch_detail_header'
      AND parent_object_id = OBJECT_ID('dbo.tbl_temporary_dispatch_detail')
)
BEGIN
    ALTER TABLE dbo.tbl_temporary_dispatch_detail WITH CHECK
        ADD CONSTRAINT fk_temp_dispatch_detail_header
        FOREIGN KEY (dispatch_no)
        REFERENCES dbo.tbl_temporary_dispatch_header(dispatch_no);
END;

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys
    WHERE name = 'fk_temp_dispatch_detail_carton'
      AND parent_object_id = OBJECT_ID('dbo.tbl_temporary_dispatch_detail')
)
BEGIN
    ALTER TABLE dbo.tbl_temporary_dispatch_detail WITH CHECK
        ADD CONSTRAINT fk_temp_dispatch_detail_carton
        FOREIGN KEY (id_60)
        REFERENCES dbo.tbl_thung60_kho(id_60);
END;

UPDATE dbo.tbl_temporary_dispatch_header
SET status = 'TEMP_OUT'
WHERE status = 'TEMPORARY_ISSUE';

DECLARE @defaultConstraint SYSNAME;
SELECT @defaultConstraint = dc.name
FROM sys.default_constraints dc
INNER JOIN sys.columns c
    ON c.object_id = dc.parent_object_id
   AND c.column_id = dc.parent_column_id
WHERE dc.parent_object_id = OBJECT_ID('dbo.tbl_temporary_dispatch_header')
  AND c.name = 'status';

IF @defaultConstraint IS NOT NULL
BEGIN
    EXEC(N'ALTER TABLE dbo.tbl_temporary_dispatch_header DROP CONSTRAINT ' + QUOTENAME(@defaultConstraint));
END;

ALTER TABLE dbo.tbl_temporary_dispatch_header
    ADD CONSTRAINT df_temp_dispatch_status DEFAULT 'PENDING_OUT' FOR status;

COMMIT TRANSACTION;
GO
