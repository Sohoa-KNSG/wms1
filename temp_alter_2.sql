-- Alter pallet
IF COL_LENGTH('pallet', 'tare_weight') IS NULL
    ALTER TABLE pallet ADD tare_weight DECIMAL(18,2) NOT NULL DEFAULT 15.00;
GO

-- Alter pallet_location_history
IF COL_LENGTH('pallet_location_history', 'x_coord') IS NULL
    ALTER TABLE pallet_location_history ADD x_coord FLOAT NULL, y_coord FLOAT NULL, z_coord FLOAT NULL, distance_to_staging FLOAT NULL;
GO

-- Create new master data tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tbl_trucks]') AND type in (N'U'))
BEGIN
CREATE TABLE tbl_trucks (
    license_plate NVARCHAR(50) PRIMARY KEY,
    max_weight_kg DECIMAL(18,2) NOT NULL,
    max_volume DECIMAL(18,2),
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tbl_drivers]') AND type in (N'U'))
BEGIN
CREATE TABLE tbl_drivers (
    driver_id INT IDENTITY(1,1) PRIMARY KEY,
    driver_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tbl_guards]') AND type in (N'U'))
BEGIN
CREATE TABLE tbl_guards (
    guard_id INT IDENTITY(1,1) PRIMARY KEY,
    guard_name NVARCHAR(100) NOT NULL,
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
END
GO

-- Create export tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[export_request_header]') AND type in (N'U'))
BEGIN
CREATE TABLE export_request_header (
    request_no NVARCHAR(50) PRIMARY KEY,
    request_date DATE NOT NULL,
    status NVARCHAR(30) DEFAULT 'NEW',
    imported_by NVARCHAR(50),
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[export_request_detail]') AND type in (N'U'))
BEGIN
CREATE TABLE export_request_detail (
    request_no NVARCHAR(50),
    line_no INT,
    product_code NVARCHAR(50),
    channel_code NVARCHAR(50),
    requested_qty DECIMAL(18,4),
    PRIMARY KEY (request_no, line_no)
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[delivery_note_header]') AND type in (N'U'))
BEGIN
CREATE TABLE delivery_note_header (
    delivery_note_no NVARCHAR(50) PRIMARY KEY,
    license_plate NVARCHAR(50),
    driver_id INT,
    guard_id INT,
    status NVARCHAR(30) DEFAULT 'PENDING_CHECK',
    created_by NVARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[delivery_note_detail]') AND type in (N'U'))
BEGIN
CREATE TABLE delivery_note_detail (
    delivery_note_no NVARCHAR(50),
    line_no INT,
    product_code NVARCHAR(50),
    channel_code NVARCHAR(50),
    qty DECIMAL(18,4),
    box_large INT DEFAULT 0,
    box_small INT DEFAULT 0,
    total_weight_kg DECIMAL(18,2),
    PRIMARY KEY (delivery_note_no, line_no)
);
END
GO
