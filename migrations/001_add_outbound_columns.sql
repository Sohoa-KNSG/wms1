-- Migration 001: Ensure missing outbound columns exist in delivery_note_header and delivery_note_detail

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_header') AND name = 'delivery_location')
    ALTER TABLE delivery_note_header ADD delivery_location NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_header') AND name = 'approved_by')
    ALTER TABLE delivery_note_header ADD approved_by NVARCHAR(50), approved_at DATETIME, approval_note NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_header') AND name = 'security_checked_by')
    ALTER TABLE delivery_note_header ADD security_checked_by NVARCHAR(50), security_checked_at DATETIME, driver_name NVARCHAR(100), seal_no NVARCHAR(100), gate_note NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_detail') AND name = 'customer_name')
    ALTER TABLE delivery_note_detail ADD customer_name NVARCHAR(255);

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('delivery_note_detail') AND name = 'box_virtual')
    ALTER TABLE delivery_note_detail ADD box_virtual INT DEFAULT 0;
GO
