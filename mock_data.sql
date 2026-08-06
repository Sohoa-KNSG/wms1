USE WMS1;
GO

INSERT INTO production_handover_header (handover_no, production_area, handover_date, status, created_by)
VALUES ('HG-001', 'Xưởng 1', '2026-07-08', 'NEW', 'admin');
GO

INSERT INTO production_handover_line (handover_no, handover_line_no, product_code, product_name, planned_qty, packing_standard_type, status)
VALUES 
('HG-001', 1, 'SKU-001', 'Sản phẩm A', 600, 'STANDARD', 'NEW'),
('HG-001', 2, 'SKU-002', 'Sản phẩm B', 1200, 'STANDARD', 'NEW');
GO
