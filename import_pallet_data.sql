USE WMS1;
GO


IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_10')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_10', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_10';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_100')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_100', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_100';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1000')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1000', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1000';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1001')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1001', N'ACTIVE', N'B45/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B45/2'
    WHERE pallet_id = N'p_1001';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1002')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1002', N'ACTIVE', N'A12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/2'
    WHERE pallet_id = N'p_1002';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1003')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1003', N'ACTIVE', N'B65/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B65/1'
    WHERE pallet_id = N'p_1003';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1004')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1004', N'ACTIVE', N'D34/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D34/2'
    WHERE pallet_id = N'p_1004';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1005')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1005', N'ACTIVE', N'B13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_1005';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1006')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1006', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1006';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1007')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1007', N'ACTIVE', N'E65/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E65/2'
    WHERE pallet_id = N'p_1007';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1008')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1008', N'ACTIVE', N'D45/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D45/2'
    WHERE pallet_id = N'p_1008';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1009')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1009', N'ACTIVE', N'A13/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A13/2'
    WHERE pallet_id = N'p_1009';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_101')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_101', N'ACTIVE', N'A12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/1'
    WHERE pallet_id = N'p_101';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1010')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1010', N'ACTIVE', N'D14/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/2'
    WHERE pallet_id = N'p_1010';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1011')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1011', N'ACTIVE', N'C11/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C11/2'
    WHERE pallet_id = N'p_1011';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1012')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1012', N'ACTIVE', N'B33/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B33/1'
    WHERE pallet_id = N'p_1012';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1013')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1013', N'ACTIVE', N'D15/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/2'
    WHERE pallet_id = N'p_1013';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1014')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1014', N'ACTIVE', N'D11/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D11/1'
    WHERE pallet_id = N'p_1014';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1015')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1015', N'ACTIVE', N'T6', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T6'
    WHERE pallet_id = N'p_1015';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1016')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1016', N'ACTIVE', N'D25/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D25/2'
    WHERE pallet_id = N'p_1016';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1017')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1017', N'ACTIVE', N'E44/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E44/2'
    WHERE pallet_id = N'p_1017';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1018')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1018', N'ACTIVE', N'A14/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A14/2'
    WHERE pallet_id = N'p_1018';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1019')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1019', N'ACTIVE', N'T3', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_1019';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_102')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_102', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_102';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1020')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1020', N'ACTIVE', N'C34/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C34/2'
    WHERE pallet_id = N'p_1020';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1021')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1021', N'ACTIVE', N'T2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_1021';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1022')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1022', N'ACTIVE', N'C23/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_1022';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1023')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1023', N'ACTIVE', N'E15/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E15/1'
    WHERE pallet_id = N'p_1023';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1024')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1024', N'ACTIVE', N'E14/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E14/2'
    WHERE pallet_id = N'p_1024';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1025')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1025', N'ACTIVE', N'F54/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F54/1'
    WHERE pallet_id = N'p_1025';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1026')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1026', N'ACTIVE', N'E45/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E45/2'
    WHERE pallet_id = N'p_1026';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1027')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1027', N'ACTIVE', N'B34/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B34/1'
    WHERE pallet_id = N'p_1027';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1028')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1028', N'ACTIVE', N'C53/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C53/1'
    WHERE pallet_id = N'p_1028';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1029')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1029', N'ACTIVE', N'D12/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/1'
    WHERE pallet_id = N'p_1029';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_103')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_103', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_103';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1030')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1030', N'ACTIVE', N'B35/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B35/1'
    WHERE pallet_id = N'p_1030';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1031')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1031', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1031';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1032')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1032', N'ACTIVE', N'E35/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E35/1'
    WHERE pallet_id = N'p_1032';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1033')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1033', N'ACTIVE', N'D34/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D34/1'
    WHERE pallet_id = N'p_1033';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1034')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1034', N'ACTIVE', N'E55/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E55/2'
    WHERE pallet_id = N'p_1034';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1035')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1035', N'ACTIVE', N'D15/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/1'
    WHERE pallet_id = N'p_1035';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1036')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1036', N'ACTIVE', N'E12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E12/2'
    WHERE pallet_id = N'p_1036';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1037')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1037', N'ACTIVE', N'T3', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_1037';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1038')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1038', N'ACTIVE', N'G13/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'G13/2'
    WHERE pallet_id = N'p_1038';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1039')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1039', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1039';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_104')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_104', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_104';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1040')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1040', N'ACTIVE', N'A32/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/1'
    WHERE pallet_id = N'p_1040';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1041')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1041', N'ACTIVE', N'D35/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D35/2'
    WHERE pallet_id = N'p_1041';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1042')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1042', N'ACTIVE', N'L04', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L04'
    WHERE pallet_id = N'p_1042';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1043')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1043', N'ACTIVE', N'C24/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C24/1'
    WHERE pallet_id = N'p_1043';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1044')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1044', N'ACTIVE', N'A32/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/2'
    WHERE pallet_id = N'p_1044';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1045')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1045', N'ACTIVE', N'D13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D13/1'
    WHERE pallet_id = N'p_1045';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1046')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1046', N'ACTIVE', N'A13/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A13/2'
    WHERE pallet_id = N'p_1046';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1047')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1047', N'ACTIVE', N'T4', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T4'
    WHERE pallet_id = N'p_1047';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1048')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1048', N'ACTIVE', N'F24/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F24/1'
    WHERE pallet_id = N'p_1048';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1049')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1049', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1049';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_105')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_105', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_105';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1050')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1050', N'ACTIVE', N'T4', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T4'
    WHERE pallet_id = N'p_1050';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1051')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1051', N'ACTIVE', N'D15/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/1'
    WHERE pallet_id = N'p_1051';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1052')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1052', N'ACTIVE', N'E54/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E54/2'
    WHERE pallet_id = N'p_1052';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1053')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1053', N'ACTIVE', N'C25/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C25/1'
    WHERE pallet_id = N'p_1053';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1054')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1054', N'ACTIVE', N'D12/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/1'
    WHERE pallet_id = N'p_1054';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1055')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1055', N'ACTIVE', N'E12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E12/2'
    WHERE pallet_id = N'p_1055';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1056')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1056', N'ACTIVE', N'E62/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E62/1'
    WHERE pallet_id = N'p_1056';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1057')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1057', N'ACTIVE', N'E24/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E24/1'
    WHERE pallet_id = N'p_1057';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1058')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1058', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1058';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1059')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1059', N'ACTIVE', N'T2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_1059';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_106')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_106', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_106';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1060')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1060', N'ACTIVE', N'E35/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E35/2'
    WHERE pallet_id = N'p_1060';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1061')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1061', N'ACTIVE', N'B51/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B51/2'
    WHERE pallet_id = N'p_1061';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1062')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1062', N'ACTIVE', N'B61/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B61/1'
    WHERE pallet_id = N'p_1062';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1063')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1063', N'ACTIVE', N'B42/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B42/2'
    WHERE pallet_id = N'p_1063';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1064')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1064', N'ACTIVE', N'E23/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E23/1'
    WHERE pallet_id = N'p_1064';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1065')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1065', N'ACTIVE', N'T3', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_1065';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1066')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1066', N'ACTIVE', N'T3', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_1066';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1067')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1067', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1067';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1068')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1068', N'ACTIVE', N'E42/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E42/1'
    WHERE pallet_id = N'p_1068';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1069')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1069', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1069';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_107')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_107', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_107';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1070')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1070', N'ACTIVE', N'E53/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E53/2'
    WHERE pallet_id = N'p_1070';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1071')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1071', N'ACTIVE', N'B65/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B65/1'
    WHERE pallet_id = N'p_1071';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1072')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1072', N'ACTIVE', N'B25/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/2'
    WHERE pallet_id = N'p_1072';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1073')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1073', N'ACTIVE', N'T2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_1073';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1074')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1074', N'ACTIVE', N'E32/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E32/1'
    WHERE pallet_id = N'p_1074';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1075')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1075', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1075';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1076')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1076', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1076';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1077')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1077', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1077';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1078')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1078', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1078';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1079')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1079', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1079';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_108')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_108', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_108';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1080')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1080', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1080';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1081')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1081', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1081';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1082')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1082', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1082';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1083')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1083', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1083';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1084')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1084', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1084';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1085')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1085', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1085';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1086')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1086', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1086';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1087')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1087', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1087';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1088')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1088', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1088';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1089')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1089', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1089';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_109')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_109', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_109';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1090')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1090', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1090';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1091')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1091', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1091';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1092')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1092', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1092';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1093')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1093', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1093';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1094')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1094', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1094';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1095')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1095', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1095';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1096')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1096', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1096';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1097')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1097', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1097';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1098')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1098', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1098';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1099')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1099', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1099';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_11')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_11', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_11';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_110')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_110', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_110';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1100')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1100', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1100';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1101')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1101', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1101';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1102')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1102', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1102';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1103')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1103', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1103';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1104')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1104', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1104';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1105')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1105', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1105';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1106')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1106', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1106';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1107')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1107', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1107';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1108')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1108', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1108';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1109')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1109', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1109';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_111')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_111', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_111';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1110')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1110', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1110';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1111')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1111', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1111';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1112')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1112', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1112';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1113')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1113', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1113';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1114')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1114', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1114';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1115')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1115', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1115';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1116')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1116', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1116';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1117')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1117', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1117';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1118')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1118', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1118';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1119')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1119', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1119';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_112')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_112', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_112';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1120')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1120', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1120';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1121')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1121', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1121';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1122')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1122', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1122';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1123')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1123', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1123';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1124')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1124', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1124';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1125')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1125', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1125';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1126')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1126', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1126';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1127')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1127', N'ACTIVE', N'C14/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C14/2'
    WHERE pallet_id = N'p_1127';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1128')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1128', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1128';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1129')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1129', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1129';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_113')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_113', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_113';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1130')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1130', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1130';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1131')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1131', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1131';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1132')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1132', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1132';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1133')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1133', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1133';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1134')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1134', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1134';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1135')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1135', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1135';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1136')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1136', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1136';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1137')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1137', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1137';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1138')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1138', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1138';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1139')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1139', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1139';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_114')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_114', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_114';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1140')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1140', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1140';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1141')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1141', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1141';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1142')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1142', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1142';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1143')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1143', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1143';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1144')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1144', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1144';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1145')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1145', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1145';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1146')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1146', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1146';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1147')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1147', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1147';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1148')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1148', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1148';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1149')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1149', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1149';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_115')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_115', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_115';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1150')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1150', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1150';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1151')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1151', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1151';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1152')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1152', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1152';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1153')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1153', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1153';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1154')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1154', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1154';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1155')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1155', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1155';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1156')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1156', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1156';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1157')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1157', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1157';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1158')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1158', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1158';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1159')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1159', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1159';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_116')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_116', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_116';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1160')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1160', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1160';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1161')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1161', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1161';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1162')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1162', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1162';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1163')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1163', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1163';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1164')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1164', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1164';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1165')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1165', N'ACTIVE', N'D13/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D13/2'
    WHERE pallet_id = N'p_1165';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1166')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1166', N'ACTIVE', N'E42/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E42/2'
    WHERE pallet_id = N'p_1166';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1167')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1167', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1167';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1168')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1168', N'ACTIVE', N'F32/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F32/1'
    WHERE pallet_id = N'p_1168';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1169')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1169', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1169';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_117')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_117', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_117';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1170')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1170', N'ACTIVE', N'E65/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E65/1'
    WHERE pallet_id = N'p_1170';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1171')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1171', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1171';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1172')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1172', N'ACTIVE', N'C13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_1172';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1173')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1173', N'ACTIVE', N'C34/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C34/1'
    WHERE pallet_id = N'p_1173';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1174')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1174', N'ACTIVE', N'C13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_1174';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1175')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1175', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1175';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1176')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1176', N'ACTIVE', N'F21/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F21/1'
    WHERE pallet_id = N'p_1176';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1177')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1177', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1177';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1178')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1178', N'ACTIVE', N'D41/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D41/1'
    WHERE pallet_id = N'p_1178';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1179')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1179', N'ACTIVE', N'F34/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F34/1'
    WHERE pallet_id = N'p_1179';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_118')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_118', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_118';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1180')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1180', N'ACTIVE', N'C33/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/2'
    WHERE pallet_id = N'p_1180';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1181')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1181', N'ACTIVE', N'A11/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A11/2'
    WHERE pallet_id = N'p_1181';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1182')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1182', N'ACTIVE', N'K05', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K05'
    WHERE pallet_id = N'p_1182';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1183')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1183', N'ACTIVE', N'A15/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A15/1'
    WHERE pallet_id = N'p_1183';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1184')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1184', N'ACTIVE', N'F64/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F64/2'
    WHERE pallet_id = N'p_1184';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1185')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1185', N'ACTIVE', N'F14/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F14/2'
    WHERE pallet_id = N'p_1185';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1186')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1186', N'ACTIVE', N'F14/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F14/1'
    WHERE pallet_id = N'p_1186';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1187')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1187', N'ACTIVE', N'T2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_1187';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1188')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1188', N'ACTIVE', N'B54/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B54/1'
    WHERE pallet_id = N'p_1188';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1189')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1189', N'ACTIVE', N'F13/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F13/2'
    WHERE pallet_id = N'p_1189';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_119')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_119', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_119';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1190')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1190', N'INACTIVE', N'F12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'F12/2'
    WHERE pallet_id = N'p_1190';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1191')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1191', N'ACTIVE', N'F12/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F12/1'
    WHERE pallet_id = N'p_1191';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1192')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1192', N'ACTIVE', N'H07', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'H07'
    WHERE pallet_id = N'p_1192';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1193')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1193', N'ACTIVE', N'L11', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L11'
    WHERE pallet_id = N'p_1193';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1194')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1194', N'ACTIVE', N'L16', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L16'
    WHERE pallet_id = N'p_1194';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1195')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1195', N'ACTIVE', N'L15', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L15'
    WHERE pallet_id = N'p_1195';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1196')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1196', N'ACTIVE', N'L14', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L14'
    WHERE pallet_id = N'p_1196';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1197')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1197', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1197';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1198')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1198', N'ACTIVE', N'L13', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L13'
    WHERE pallet_id = N'p_1198';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1199')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1199', N'ACTIVE', N'L12', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L12'
    WHERE pallet_id = N'p_1199';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_12')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_12', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_12';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_120')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_120', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_120';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1200')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1200', N'ACTIVE', N'L10', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L10'
    WHERE pallet_id = N'p_1200';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1201')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1201', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1201';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1202')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1202', N'ACTIVE', N'L09', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L09'
    WHERE pallet_id = N'p_1202';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1203')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1203', N'ACTIVE', N'L08', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L08'
    WHERE pallet_id = N'p_1203';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1204')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1204', N'ACTIVE', N'L07', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L07'
    WHERE pallet_id = N'p_1204';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1205')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1205', N'ACTIVE', N'L06', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L06'
    WHERE pallet_id = N'p_1205';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1206')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1206', N'ACTIVE', N'L03', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L03'
    WHERE pallet_id = N'p_1206';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1207')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1207', N'ACTIVE', N'L02', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L02'
    WHERE pallet_id = N'p_1207';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1208')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1208', N'ACTIVE', N'L01', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L01'
    WHERE pallet_id = N'p_1208';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1209')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1209', N'ACTIVE', N'T3', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_1209';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_121')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_121', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_121';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1210')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1210', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1210';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1211')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1211', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1211';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1212')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1212', N'ACTIVE', N'M05', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'M05'
    WHERE pallet_id = N'p_1212';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1213')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1213', N'ACTIVE', N'G13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'G13/1'
    WHERE pallet_id = N'p_1213';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1214')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1214', N'ACTIVE', N'A15/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A15/2'
    WHERE pallet_id = N'p_1214';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1215')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1215', N'ACTIVE', N'B55/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B55/1'
    WHERE pallet_id = N'p_1215';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1216')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1216', N'ACTIVE', N'F25/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F25/1'
    WHERE pallet_id = N'p_1216';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1217')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1217', N'ACTIVE', N'C13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_1217';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1218')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1218', N'ACTIVE', N'C15/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/2'
    WHERE pallet_id = N'p_1218';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1219')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1219', N'ACTIVE', N'A33/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A33/1'
    WHERE pallet_id = N'p_1219';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_122')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_122', N'ACTIVE', N'C33/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/1'
    WHERE pallet_id = N'p_122';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1220')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1220', N'ACTIVE', N'B13/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_1220';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1221')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1221', N'ACTIVE', N'F42/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F42/1'
    WHERE pallet_id = N'p_1221';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1222')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1222', N'ACTIVE', N'F42/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F42/2'
    WHERE pallet_id = N'p_1222';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1223')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1223', N'ACTIVE', N'F62/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F62/2'
    WHERE pallet_id = N'p_1223';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1224')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1224', N'ACTIVE', N'C24/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C24/2'
    WHERE pallet_id = N'p_1224';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1225')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1225', N'ACTIVE', N'E32/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E32/1'
    WHERE pallet_id = N'p_1225';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1226')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1226', N'ACTIVE', N'E64/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E64/2'
    WHERE pallet_id = N'p_1226';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1227')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1227', N'ACTIVE', N'E52/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E52/2'
    WHERE pallet_id = N'p_1227';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1228')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1228', N'ACTIVE', N'E12/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E12/1'
    WHERE pallet_id = N'p_1228';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1229')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1229', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1229';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_123')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_123', N'ACTIVE', N'N7', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'N7'
    WHERE pallet_id = N'p_123';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1230')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1230', N'ACTIVE', N'B33/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B33/1'
    WHERE pallet_id = N'p_1230';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1231')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1231', N'ACTIVE', N'A22/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A22/2'
    WHERE pallet_id = N'p_1231';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1232')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1232', N'ACTIVE', N'T5', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_1232';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1233')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1233', N'ACTIVE', N'F31/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F31/1'
    WHERE pallet_id = N'p_1233';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1234')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1234', N'ACTIVE', N'B34/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B34/2'
    WHERE pallet_id = N'p_1234';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1235')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1235', N'ACTIVE', N'T6', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T6'
    WHERE pallet_id = N'p_1235';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1236')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1236', N'ACTIVE', N'D25/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D25/1'
    WHERE pallet_id = N'p_1236';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1237')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1237', N'ACTIVE', N'D12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/2'
    WHERE pallet_id = N'p_1237';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1238')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1238', N'ACTIVE', N'C33/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/1'
    WHERE pallet_id = N'p_1238';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1239')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1239', N'ACTIVE', N'C43/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C43/2'
    WHERE pallet_id = N'p_1239';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_124')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_124', N'ACTIVE', N'A34/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A34/1'
    WHERE pallet_id = N'p_124';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1240')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1240', N'ACTIVE', N'A23/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A23/2'
    WHERE pallet_id = N'p_1240';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1241')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1241', N'ACTIVE', N'A12/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/2'
    WHERE pallet_id = N'p_1241';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1242')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1242', N'ACTIVE', N'D12/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/1'
    WHERE pallet_id = N'p_1242';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1243')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1243', N'ACTIVE', N'D42/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D42/1'
    WHERE pallet_id = N'p_1243';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1244')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1244', N'ACTIVE', N'G24/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'G24/1'
    WHERE pallet_id = N'p_1244';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1245')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1245', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1245';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1246')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1246', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1246';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1247')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1247', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1247';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1248')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1248', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1248';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1249')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1249', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1249';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_125')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_125', N'ACTIVE', N'C15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/2'
    WHERE pallet_id = N'p_125';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1250')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1250', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1250';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1251')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1251', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1251';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1252')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1252', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1252';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1253')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1253', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1253';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1254')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1254', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1254';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1255')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1255', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1255';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1256')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1256', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1256';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1257')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1257', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1257';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1258')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1258', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1258';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1259')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1259', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1259';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_126')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_126', N'ACTIVE', N'D15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/2'
    WHERE pallet_id = N'p_126';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1260')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1260', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1260';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1261')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1261', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1261';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1262')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1262', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1262';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1263')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1263', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1263';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1264')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1264', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1264';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1265')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1265', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1265';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1266')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1266', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1266';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1267')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1267', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1267';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1268')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1268', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1268';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1269')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1269', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1269';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_127')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_127', N'ACTIVE', N'C33/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/1'
    WHERE pallet_id = N'p_127';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1270')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1270', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1270';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1271')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1271', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1271';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1272')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1272', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1272';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1273')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1273', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1273';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1274')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1274', N'ACTIVE', N'C24/2', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C24/2'
    WHERE pallet_id = N'p_1274';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1275')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1275', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1275';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1276')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1276', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1276';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1277')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1277', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1277';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1278')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1278', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1278';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1279')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1279', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1279';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_128')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_128', N'ACTIVE', N'B51/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B51/2'
    WHERE pallet_id = N'p_128';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1280')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1280', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1280';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1281')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1281', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1281';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1282')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1282', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1282';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1283')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1283', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1283';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1284')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1284', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1284';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1285')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1285', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1285';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1286')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1286', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1286';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1287')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1287', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1287';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1288')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1288', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1288';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1289')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1289', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1289';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_129')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_129', N'ACTIVE', N'B11/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B11/2'
    WHERE pallet_id = N'p_129';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1290')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1290', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1290';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1291')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1291', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1291';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1292')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1292', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1292';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1293')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1293', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1293';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1294')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1294', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1294';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1295')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1295', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1295';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1296')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1296', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1296';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1297')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1297', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1297';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1298')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1298', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1298';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1299')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1299', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1299';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_13')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_13', N'ACTIVE', N'C31/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C31/2'
    WHERE pallet_id = N'p_13';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_130')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_130', N'ACTIVE', N'T4', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T4'
    WHERE pallet_id = N'p_130';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1300')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1300', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1300';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1301')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1301', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1301';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1302')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1302', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1302';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1303')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1303', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1303';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1304')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1304', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1304';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1305')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1305', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1305';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1306')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1306', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1306';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1307')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1307', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1307';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1308')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1308', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1308';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1309')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1309', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1309';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_131')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_131', N'ACTIVE', N'E13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E13/2'
    WHERE pallet_id = N'p_131';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1310')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1310', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1310';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1311')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1311', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1311';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1312')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1312', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1312';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1313')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1313', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1313';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1314')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1314', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1314';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1315')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1315', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1315';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1316')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1316', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1316';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1317')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1317', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1317';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1318')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1318', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1318';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1319')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1319', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1319';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_132')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_132', N'ACTIVE', N'D15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/2'
    WHERE pallet_id = N'p_132';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1320')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1320', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1320';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1321')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1321', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1321';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1322')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1322', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1322';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1323')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1323', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1323';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1324')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1324', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1324';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1325')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1325', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1325';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1326')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1326', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1326';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1327')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1327', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1327';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1328')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1328', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1328';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1329')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1329', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1329';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_133')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_133', N'ACTIVE', N'F33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F33/2'
    WHERE pallet_id = N'p_133';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1330')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1330', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1330';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1331')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1331', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1331';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1332')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1332', N'ACTIVE', N'C33/1', N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/1'
    WHERE pallet_id = N'p_1332';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1333')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1333', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1333';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1334')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1334', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1334';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1335')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1335', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1335';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1336')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1336', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1336';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1337')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1337', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1337';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1338')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1338', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1338';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1339')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1339', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1339';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_134')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_134', N'ACTIVE', N'A25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A25/1'
    WHERE pallet_id = N'p_134';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1340')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1340', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1340';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1341')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1341', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1341';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1342')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1342', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1342';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1343')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1343', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1343';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1344')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1344', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1344';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1345')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1345', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1345';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1346')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1346', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1346';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1347')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1347', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1347';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1348')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1348', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1348';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1349')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1349', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1349';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_135')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_135', N'ACTIVE', N'B65/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B65/1'
    WHERE pallet_id = N'p_135';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1350')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1350', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1350';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1351')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1351', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1351';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1352')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1352', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1352';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1353')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1353', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1353';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1354')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1354', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1354';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1355')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1355', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1355';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1356')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1356', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1356';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1357')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1357', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1357';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1358')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1358', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1358';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1359')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1359', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1359';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_136')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_136', N'ACTIVE', N'C45/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C45/1'
    WHERE pallet_id = N'p_136';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1360')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1360', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1360';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1361')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1361', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1361';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1362')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1362', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1362';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1363')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1363', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1363';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1364')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1364', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1364';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1365')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1365', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1365';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1366')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1366', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1366';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1367')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1367', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1367';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1368')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1368', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1368';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1369')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1369', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1369';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_137')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_137', N'ACTIVE', N'D14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/1'
    WHERE pallet_id = N'p_137';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1370')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1370', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1370';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1371')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1371', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1371';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1372')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1372', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1372';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1373')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1373', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1373';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1374')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1374', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1374';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1375')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1375', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1375';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1376')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1376', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1376';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1377')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1377', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1377';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1378')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1378', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1378';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1379')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1379', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1379';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_138')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_138', N'ACTIVE', N'E32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E32/2'
    WHERE pallet_id = N'p_138';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1380')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1380', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1380';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1381')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1381', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1381';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1382')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1382', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1382';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1383')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1383', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1383';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1384')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1384', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1384';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1385')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1385', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1385';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1386')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1386', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1386';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1387')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1387', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1387';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1388')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1388', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1388';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1389')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1389', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1389';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_139')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_139', N'ACTIVE', N'C33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/2'
    WHERE pallet_id = N'p_139';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1390')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1390', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1390';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1391')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1391', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1391';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1392')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1392', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1392';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1393')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1393', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1393';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1394')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1394', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1394';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1395')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1395', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1395';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1396')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1396', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1396';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1397')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1397', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1397';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1398')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1398', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1398';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1399')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1399', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1399';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_14')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_14', N'ACTIVE', N'D25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D25/1'
    WHERE pallet_id = N'p_14';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_140')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_140', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_140';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1400')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1400', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1400';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1401')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1401', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1401';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1402')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1402', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1402';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1403')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1403', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1403';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1404')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1404', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1404';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1405')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1405', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1405';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1406')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1406', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1406';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1407')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1407', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1407';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1408')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1408', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1408';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1409')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1409', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1409';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_141')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_141', N'ACTIVE', N'B44/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B44/2'
    WHERE pallet_id = N'p_141';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1410')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1410', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1410';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1411')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1411', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1411';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1412')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1412', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1412';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1413')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1413', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1413';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1414')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1414', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1414';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1415')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1415', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1415';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1416')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1416', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1416';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1417')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1417', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1417';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1418')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1418', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1418';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1419')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1419', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1419';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_142')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_142', N'ACTIVE', N'T6', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T6'
    WHERE pallet_id = N'p_142';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1420')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1420', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1420';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1421')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1421', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1421';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1422')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1422', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1422';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1423')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1423', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1423';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1424')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1424', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1424';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1425')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1425', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1425';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1426')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1426', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1426';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1427')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1427', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1427';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1428')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1428', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1428';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1429')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1429', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1429';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_143')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_143', N'ACTIVE', N'T3', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_143';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1430')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1430', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1430';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1431')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1431', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1431';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1432')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1432', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1432';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1433')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1433', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1433';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1434')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1434', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1434';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1435')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1435', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1435';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1436')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1436', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1436';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1437')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1437', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1437';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1438')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1438', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1438';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1439')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1439', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1439';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_144')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_144', N'ACTIVE', N'D41/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D41/1'
    WHERE pallet_id = N'p_144';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1440')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1440', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1440';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1441')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1441', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1441';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1442')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1442', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1442';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1443')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1443', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1443';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1444')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1444', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1444';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1445')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1445', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1445';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1446')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1446', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1446';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1447')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1447', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1447';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1448')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1448', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1448';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1449')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1449', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1449';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_145')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_145', N'ACTIVE', N'A43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A43/1'
    WHERE pallet_id = N'p_145';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1450')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1450', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1450';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1451')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1451', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1451';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1452')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1452', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1452';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1453')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1453', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1453';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1454')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1454', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1454';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1455')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1455', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1455';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1456')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1456', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1456';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1457')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1457', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1457';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1458')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1458', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1458';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1459')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1459', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1459';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_146')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_146', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_146';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1460')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1460', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1460';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1461')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1461', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1461';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1462')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1462', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1462';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1463')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1463', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1463';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1464')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1464', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1464';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1465')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1465', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1465';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1466')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1466', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1466';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1467')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1467', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1467';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1468')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1468', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1468';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1469')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1469', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1469';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_147')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_147', N'ACTIVE', N'T2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_147';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1470')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1470', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1470';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1471')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1471', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1471';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1472')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1472', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1472';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1473')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1473', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1473';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1474')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1474', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1474';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1475')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1475', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1475';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1476')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1476', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1476';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1477')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1477', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1477';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1478')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1478', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1478';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1479')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1479', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1479';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_148')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_148', N'ACTIVE', N'C14/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C14/2'
    WHERE pallet_id = N'p_148';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1480')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1480', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1480';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1481')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1481', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1481';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1482')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1482', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1482';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1483')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1483', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1483';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1484')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1484', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1484';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1485')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1485', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1485';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1486')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1486', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1486';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1487')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1487', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1487';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1488')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1488', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1488';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1489')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1489', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1489';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_149')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_149', N'ACTIVE', N'N04', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'N04'
    WHERE pallet_id = N'p_149';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1490')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1490', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1490';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1491')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1491', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1491';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1492')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1492', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1492';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1493')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1493', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1493';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1494')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1494', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1494';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1495')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1495', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1495';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1496')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1496', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1496';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1497')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1497', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1497';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1498')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1498', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1498';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1499')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1499', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1499';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_15')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_15', N'ACTIVE', N'A12/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/2'
    WHERE pallet_id = N'p_15';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_150')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_150', N'ACTIVE', N'D22/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D22/1'
    WHERE pallet_id = N'p_150';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_1500')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_1500', N'ACTIVE', NULL, N'2025-11-25 15:45:29.000', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_1500';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_151')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_151', N'ACTIVE', N'A22/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A22/2'
    WHERE pallet_id = N'p_151';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_152')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_152', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_152';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_153')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_153', N'ACTIVE', N'D61/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D61/1'
    WHERE pallet_id = N'p_153';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_154')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_154', N'ACTIVE', N'A12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/1'
    WHERE pallet_id = N'p_154';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_155')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_155', N'ACTIVE', N'G23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'G23/2'
    WHERE pallet_id = N'p_155';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_156')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_156', N'ACTIVE', N'T6', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T6'
    WHERE pallet_id = N'p_156';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_157')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_157', N'ACTIVE', N'B14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B14/1'
    WHERE pallet_id = N'p_157';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_158')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_158', N'ACTIVE', N'E63/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E63/1'
    WHERE pallet_id = N'p_158';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_159')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_159', N'ACTIVE', N'C22/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C22/2'
    WHERE pallet_id = N'p_159';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_16')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_16', N'ACTIVE', N'T5', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_16';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_160')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_160', N'ACTIVE', N'F51/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F51/2'
    WHERE pallet_id = N'p_160';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_161')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_161', N'ACTIVE', N'D44/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D44/1'
    WHERE pallet_id = N'p_161';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_162')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_162', N'ACTIVE', N'G11/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'G11/1'
    WHERE pallet_id = N'p_162';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_163')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_163', N'ACTIVE', N'D32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/1'
    WHERE pallet_id = N'p_163';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_164')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_164', N'ACTIVE', N'C45/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C45/2'
    WHERE pallet_id = N'p_164';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_165')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_165', N'ACTIVE', N'D32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/2'
    WHERE pallet_id = N'p_165';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_166')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_166', N'ACTIVE', N'E34/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E34/1'
    WHERE pallet_id = N'p_166';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_167')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_167', N'ACTIVE', N'D12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/1'
    WHERE pallet_id = N'p_167';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_168')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_168', N'ACTIVE', N'C15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/2'
    WHERE pallet_id = N'p_168';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_169')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_169', N'ACTIVE', N'D32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/2'
    WHERE pallet_id = N'p_169';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_17')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_17', N'ACTIVE', N'F53/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F53/1'
    WHERE pallet_id = N'p_17';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_170')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_170', N'ACTIVE', N'E55/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E55/2'
    WHERE pallet_id = N'p_170';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_171')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_171', N'ACTIVE', N'F45/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F45/2'
    WHERE pallet_id = N'p_171';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_172')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_172', N'ACTIVE', N'B32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B32/1'
    WHERE pallet_id = N'p_172';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_173')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_173', N'ACTIVE', N'A13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A13/2'
    WHERE pallet_id = N'p_173';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_174')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_174', N'ACTIVE', N'A32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/1'
    WHERE pallet_id = N'p_174';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_175')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_175', N'ACTIVE', N'D15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D15/2'
    WHERE pallet_id = N'p_175';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_176')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_176', N'ACTIVE', N'C51/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C51/2'
    WHERE pallet_id = N'p_176';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_177')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_177', N'ACTIVE', N'A32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/2'
    WHERE pallet_id = N'p_177';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_178')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_178', N'ACTIVE', N'B25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/1'
    WHERE pallet_id = N'p_178';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_179')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_179', N'ACTIVE', N'F52/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F52/2'
    WHERE pallet_id = N'p_179';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_18')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_18', N'ACTIVE', N'F21/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F21/2'
    WHERE pallet_id = N'p_18';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_180')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_180', N'ACTIVE', N'C34/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C34/2'
    WHERE pallet_id = N'p_180';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_181')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_181', N'ACTIVE', N'C14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C14/1'
    WHERE pallet_id = N'p_181';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_182')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_182', N'ACTIVE', N'B25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/1'
    WHERE pallet_id = N'p_182';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_183')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_183', N'ACTIVE', N'D14/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/2'
    WHERE pallet_id = N'p_183';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_184')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_184', N'ACTIVE', N'E23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E23/2'
    WHERE pallet_id = N'p_184';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_185')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_185', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_185';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_186')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_186', N'ACTIVE', N'A32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/1'
    WHERE pallet_id = N'p_186';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_187')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_187', N'ACTIVE', N'C31/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C31/1'
    WHERE pallet_id = N'p_187';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_188')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_188', N'ACTIVE', N'D12/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/2'
    WHERE pallet_id = N'p_188';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_189')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_189', N'ACTIVE', N'C13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_189';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_19')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_19', N'ACTIVE', N'B32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B32/2'
    WHERE pallet_id = N'p_19';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_190')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_190', N'ACTIVE', N'A65/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A65/2'
    WHERE pallet_id = N'p_190';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_191')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_191', N'ACTIVE', N'T5', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_191';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_192')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_192', N'ACTIVE', N'A13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A13/2'
    WHERE pallet_id = N'p_192';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_193')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_193', N'ACTIVE', N'D43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D43/1'
    WHERE pallet_id = N'p_193';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_194')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_194', N'ACTIVE', N'E54/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E54/2'
    WHERE pallet_id = N'p_194';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_195')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_195', N'ACTIVE', N'A43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A43/2'
    WHERE pallet_id = N'p_195';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_196')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_196', N'ACTIVE', N'C11/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C11/1'
    WHERE pallet_id = N'p_196';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_197')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_197', N'ACTIVE', N'C53/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C53/2'
    WHERE pallet_id = N'p_197';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_198')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_198', N'ACTIVE', N'D14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/1'
    WHERE pallet_id = N'p_198';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_199')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_199', N'ACTIVE', N'C25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C25/2'
    WHERE pallet_id = N'p_199';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_2')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_2', N'ACTIVE', N'B25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/1'
    WHERE pallet_id = N'p_2';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_20')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_20', N'ACTIVE', N'A42/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A42/2'
    WHERE pallet_id = N'p_20';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_200')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_200', N'ACTIVE', N'D32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/1'
    WHERE pallet_id = N'p_200';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_201')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_201', N'ACTIVE', N'C12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C12/1'
    WHERE pallet_id = N'p_201';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_202')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_202', N'ACTIVE', N'A32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/1'
    WHERE pallet_id = N'p_202';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_203')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_203', N'ACTIVE', N'B24/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B24/1'
    WHERE pallet_id = N'p_203';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_204')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_204', N'ACTIVE', N'D21/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D21/2'
    WHERE pallet_id = N'p_204';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_205')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_205', N'ACTIVE', N'D63/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D63/1'
    WHERE pallet_id = N'p_205';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_206')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_206', N'ACTIVE', N'B32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B32/1'
    WHERE pallet_id = N'p_206';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_207')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_207', N'ACTIVE', N'C33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/2'
    WHERE pallet_id = N'p_207';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_208')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_208', N'ACTIVE', N'A63/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A63/2'
    WHERE pallet_id = N'p_208';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_209')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_209', N'ACTIVE', N'D14/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/2'
    WHERE pallet_id = N'p_209';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_21')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_21', N'INACTIVE', N'A42/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'A42/2'
    WHERE pallet_id = N'p_21';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_210')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_210', N'ACTIVE', N'D23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D23/2'
    WHERE pallet_id = N'p_210';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_211')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_211', N'ACTIVE', N'E11/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E11/2'
    WHERE pallet_id = N'p_211';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_212')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_212', N'ACTIVE', N'A63/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A63/1'
    WHERE pallet_id = N'p_212';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_213')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_213', N'ACTIVE', N'B15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B15/1'
    WHERE pallet_id = N'p_213';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_214')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_214', N'ACTIVE', N'C13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/2'
    WHERE pallet_id = N'p_214';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_215')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_215', N'ACTIVE', N'T5', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_215';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_216')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_216', N'ACTIVE', N'D42/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D42/2'
    WHERE pallet_id = N'p_216';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_217')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_217', N'ACTIVE', N'D55/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D55/1'
    WHERE pallet_id = N'p_217';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_218')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_218', N'ACTIVE', N'T2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T2'
    WHERE pallet_id = N'p_218';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_219')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_219', N'ACTIVE', N'C33/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/1'
    WHERE pallet_id = N'p_219';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_22')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_22', N'ACTIVE', N'D22/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D22/1'
    WHERE pallet_id = N'p_22';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_220')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_220', N'ACTIVE', N'D12/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/2'
    WHERE pallet_id = N'p_220';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_221')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_221', N'ACTIVE', N'B23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B23/2'
    WHERE pallet_id = N'p_221';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_222')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_222', N'ACTIVE', N'E12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E12/1'
    WHERE pallet_id = N'p_222';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_223')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_223', N'ACTIVE', N'E24/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E24/1'
    WHERE pallet_id = N'p_223';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_224')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_224', N'ACTIVE', N'B15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B15/2'
    WHERE pallet_id = N'p_224';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_225')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_225', N'ACTIVE', N'B51/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B51/1'
    WHERE pallet_id = N'p_225';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_226')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_226', N'ACTIVE', N'C14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C14/1'
    WHERE pallet_id = N'p_226';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_227')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_227', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_227';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_228')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_228', N'INACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_228';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_229')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_229', N'INACTIVE', N'T3', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_229';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_23')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_23', N'INACTIVE', N'D51/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'D51/1'
    WHERE pallet_id = N'p_23';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_230')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_230', N'INACTIVE', N'B54/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'B54/1'
    WHERE pallet_id = N'p_230';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_231')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_231', N'INACTIVE', N'B15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'B15/1'
    WHERE pallet_id = N'p_231';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_232')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_232', N'INACTIVE', N'C23/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_232';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_233')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_233', N'ACTIVE', N'A53/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A53/1'
    WHERE pallet_id = N'p_233';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_234')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_234', N'ACTIVE', N'T3', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_234';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_235')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_235', N'ACTIVE', N'D54/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D54/2'
    WHERE pallet_id = N'p_235';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_236')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_236', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_236';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_237')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_237', N'ACTIVE', N'C23/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_237';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_238')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_238', N'ACTIVE', N'E14/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E14/2'
    WHERE pallet_id = N'p_238';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_239')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_239', N'ACTIVE', N'A32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A32/1'
    WHERE pallet_id = N'p_239';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_24')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_24', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_24';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_240')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_240', N'ACTIVE', N'A55/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A55/2'
    WHERE pallet_id = N'p_240';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_241')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_241', N'ACTIVE', N'C43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C43/1'
    WHERE pallet_id = N'p_241';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_242')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_242', N'ACTIVE', N'B25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/2'
    WHERE pallet_id = N'p_242';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_243')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_243', N'ACTIVE', N'A15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A15/2'
    WHERE pallet_id = N'p_243';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_244')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_244', N'ACTIVE', N'C31/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C31/2'
    WHERE pallet_id = N'p_244';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_245')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_245', N'ACTIVE', N'C42/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C42/2'
    WHERE pallet_id = N'p_245';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_246')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_246', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_246';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_247')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_247', N'ACTIVE', N'E33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E33/2'
    WHERE pallet_id = N'p_247';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_248')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_248', N'ACTIVE', N'E43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/2'
    WHERE pallet_id = N'p_248';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_249')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_249', N'ACTIVE', N'C22/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C22/1'
    WHERE pallet_id = N'p_249';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_25')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_25', N'ACTIVE', N'E43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/2'
    WHERE pallet_id = N'p_25';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_250')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_250', N'ACTIVE', N'C25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C25/2'
    WHERE pallet_id = N'p_250';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_251')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_251', N'ACTIVE', N'C15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/1'
    WHERE pallet_id = N'p_251';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_252')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_252', N'INACTIVE', N'L05', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'L05'
    WHERE pallet_id = N'p_252';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_253')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_253', N'ACTIVE', N'C23/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_253';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_254')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_254', N'ACTIVE', N'C53/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C53/1'
    WHERE pallet_id = N'p_254';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_255')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_255', N'INACTIVE', N'F55/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'INACTIVE', current_location_code = N'F55/2'
    WHERE pallet_id = N'p_255';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_256')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_256', N'ACTIVE', N'F35/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F35/1'
    WHERE pallet_id = N'p_256';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_257')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_257', N'ACTIVE', N'E21/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E21/2'
    WHERE pallet_id = N'p_257';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_258')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_258', N'ACTIVE', N'N05', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'N05'
    WHERE pallet_id = N'p_258';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_259')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_259', N'ACTIVE', N'F35/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F35/2'
    WHERE pallet_id = N'p_259';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_26')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_26', N'ACTIVE', N'C15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/2'
    WHERE pallet_id = N'p_26';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_260')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_260', N'ACTIVE', N'B25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/1'
    WHERE pallet_id = N'p_260';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_261')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_261', N'ACTIVE', N'C13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/2'
    WHERE pallet_id = N'p_261';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_262')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_262', N'ACTIVE', N'C13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_262';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_263')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_263', N'ACTIVE', N'E43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/1'
    WHERE pallet_id = N'p_263';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_264')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_264', N'ACTIVE', N'C15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/1'
    WHERE pallet_id = N'p_264';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_265')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_265', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_265';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_266')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_266', N'ACTIVE', N'B25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/1'
    WHERE pallet_id = N'p_266';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_267')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_267', N'ACTIVE', N'L04', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L04'
    WHERE pallet_id = N'p_267';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_268')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_268', N'ACTIVE', N'B42/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B42/1'
    WHERE pallet_id = N'p_268';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_269')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_269', N'ACTIVE', N'A33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A33/2'
    WHERE pallet_id = N'p_269';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_27')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_27', N'ACTIVE', N'B34/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B34/1'
    WHERE pallet_id = N'p_27';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_270')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_270', N'ACTIVE', N'B34/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B34/2'
    WHERE pallet_id = N'p_270';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_271')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_271', N'ACTIVE', N'T5', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T5'
    WHERE pallet_id = N'p_271';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_272')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_272', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_272';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_273')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_273', N'ACTIVE', N'D31/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D31/1'
    WHERE pallet_id = N'p_273';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_274')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_274', N'ACTIVE', N'B15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B15/1'
    WHERE pallet_id = N'p_274';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_275')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_275', N'ACTIVE', N'C44/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C44/2'
    WHERE pallet_id = N'p_275';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_276')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_276', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_276';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_277')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_277', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_277';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_278')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_278', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_278';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_279')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_279', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_279';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_28')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_28', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_28';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_280')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_280', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_280';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_281')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_281', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_281';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_282')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_282', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_282';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_283')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_283', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_283';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_284')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_284', N'ACTIVE', N'N06', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'N06'
    WHERE pallet_id = N'p_284';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_285')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_285', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_285';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_286')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_286', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_286';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_287')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_287', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_287';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_288')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_288', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_288';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_289')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_289', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_289';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_29')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_29', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_29';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_290')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_290', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_290';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_291')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_291', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_291';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_292')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_292', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_292';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_293')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_293', N'ACTIVE', N'E64/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E64/1'
    WHERE pallet_id = N'p_293';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_294')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_294', N'ACTIVE', N'M15', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'M15'
    WHERE pallet_id = N'p_294';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_295')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_295', N'ACTIVE', N'M16', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'M16'
    WHERE pallet_id = N'p_295';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_296')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_296', N'ACTIVE', N'M17', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'M17'
    WHERE pallet_id = N'p_296';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_297')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_297', N'ACTIVE', N'M18', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'M18'
    WHERE pallet_id = N'p_297';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_298')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_298', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_298';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_299')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_299', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_299';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_3')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_3', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_3';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_30')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_30', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_30';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_300')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_300', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_300';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_301')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_301', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_301';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_302')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_302', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_302';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_303')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_303', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_303';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_304')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_304', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_304';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_305')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_305', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_305';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_306')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_306', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_306';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_307')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_307', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_307';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_308')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_308', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_308';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_309')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_309', N'ACTIVE', N'D25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D25/1'
    WHERE pallet_id = N'p_309';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_31')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_31', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_31';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_310')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_310', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_310';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_311')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_311', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_311';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_312')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_312', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_312';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_313')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_313', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_313';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_314')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_314', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_314';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_315')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_315', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_315';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_316')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_316', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_316';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_317')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_317', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_317';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_318')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_318', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_318';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_319')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_319', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_319';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_32')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_32', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_32';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_320')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_320', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_320';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_321')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_321', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_321';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_322')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_322', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_322';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_323')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_323', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_323';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_324')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_324', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_324';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_325')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_325', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_325';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_326')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_326', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_326';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_327')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_327', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_327';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_328')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_328', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_328';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_329')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_329', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_329';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_33')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_33', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_33';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_330')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_330', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_330';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_331')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_331', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_331';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_332')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_332', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_332';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_333')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_333', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_333';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_334')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_334', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_334';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_335')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_335', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_335';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_336')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_336', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_336';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_337')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_337', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_337';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_338')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_338', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_338';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_339')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_339', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_339';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_34')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_34', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_34';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_340')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_340', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_340';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_341')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_341', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_341';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_342')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_342', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_342';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_343')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_343', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_343';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_344')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_344', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_344';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_345')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_345', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_345';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_346')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_346', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_346';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_347')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_347', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_347';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_348')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_348', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_348';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_349')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_349', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_349';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_35')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_35', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_35';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_350')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_350', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_350';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_351')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_351', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_351';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_352')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_352', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_352';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_353')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_353', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_353';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_354')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_354', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_354';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_355')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_355', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_355';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_356')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_356', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_356';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_357')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_357', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_357';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_358')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_358', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_358';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_359')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_359', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_359';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_36')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_36', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_36';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_360')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_360', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_360';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_361')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_361', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_361';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_362')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_362', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_362';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_363')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_363', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_363';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_364')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_364', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_364';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_365')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_365', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_365';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_366')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_366', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_366';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_367')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_367', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_367';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_368')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_368', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_368';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_369')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_369', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_369';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_37')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_37', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_37';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_370')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_370', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_370';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_371')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_371', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_371';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_372')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_372', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_372';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_373')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_373', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_373';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_374')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_374', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_374';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_375')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_375', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_375';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_376')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_376', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_376';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_377')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_377', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_377';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_378')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_378', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_378';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_379')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_379', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_379';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_38')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_38', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_38';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_380')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_380', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_380';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_381')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_381', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_381';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_382')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_382', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_382';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_383')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_383', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_383';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_384')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_384', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_384';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_385')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_385', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_385';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_386')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_386', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_386';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_387')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_387', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_387';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_388')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_388', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_388';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_389')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_389', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_389';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_39')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_39', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_39';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_390')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_390', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_390';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_391')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_391', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_391';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_392')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_392', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_392';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_393')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_393', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_393';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_394')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_394', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_394';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_395')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_395', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_395';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_396')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_396', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_396';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_397')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_397', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_397';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_398')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_398', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_398';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_399')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_399', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_399';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_4')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_4', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_4';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_40')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_40', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_40';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_400')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_400', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_400';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_401')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_401', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_401';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_402')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_402', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_402';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_403')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_403', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_403';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_404')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_404', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_404';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_405')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_405', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_405';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_406')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_406', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_406';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_407')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_407', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_407';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_408')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_408', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_408';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_409')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_409', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_409';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_41')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_41', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_41';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_410')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_410', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_410';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_411')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_411', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_411';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_412')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_412', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_412';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_413')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_413', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_413';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_414')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_414', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_414';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_415')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_415', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_415';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_416')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_416', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_416';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_417')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_417', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_417';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_418')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_418', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_418';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_419')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_419', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_419';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_42')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_42', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_42';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_420')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_420', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_420';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_421')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_421', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_421';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_422')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_422', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_422';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_423')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_423', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_423';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_424')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_424', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_424';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_425')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_425', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_425';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_426')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_426', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_426';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_427')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_427', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_427';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_428')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_428', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_428';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_429')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_429', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_429';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_43')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_43', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_43';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_430')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_430', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_430';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_431')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_431', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_431';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_432')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_432', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_432';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_433')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_433', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_433';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_434')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_434', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_434';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_435')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_435', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_435';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_436')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_436', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_436';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_437')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_437', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_437';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_438')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_438', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_438';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_439')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_439', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_439';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_44')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_44', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_44';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_440')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_440', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_440';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_441')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_441', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_441';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_442')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_442', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_442';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_443')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_443', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_443';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_444')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_444', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_444';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_445')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_445', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_445';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_446')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_446', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_446';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_447')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_447', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_447';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_448')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_448', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_448';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_449')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_449', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_449';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_45')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_45', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_45';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_450')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_450', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_450';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_451')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_451', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_451';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_452')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_452', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_452';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_453')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_453', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_453';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_454')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_454', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_454';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_455')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_455', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_455';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_456')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_456', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_456';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_457')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_457', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_457';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_458')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_458', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_458';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_459')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_459', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_459';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_46')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_46', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_46';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_460')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_460', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_460';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_461')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_461', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_461';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_462')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_462', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_462';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_463')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_463', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_463';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_464')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_464', N'ACTIVE', NULL, N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = NULL
    WHERE pallet_id = N'p_464';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_465')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_465', N'ACTIVE', N'H12', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'H12'
    WHERE pallet_id = N'p_465';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_466')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_466', N'ACTIVE', N'C25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C25/1'
    WHERE pallet_id = N'p_466';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_467')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_467', N'ACTIVE', N'K02', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K02'
    WHERE pallet_id = N'p_467';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_468')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_468', N'ACTIVE', N'K03', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K03'
    WHERE pallet_id = N'p_468';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_469')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_469', N'ACTIVE', N'K04', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K04'
    WHERE pallet_id = N'p_469';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_47')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_47', N'ACTIVE', N'K06', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K06'
    WHERE pallet_id = N'p_47';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_470')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_470', N'ACTIVE', N'K12', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K12'
    WHERE pallet_id = N'p_470';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_471')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_471', N'ACTIVE', N'K11', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K11'
    WHERE pallet_id = N'p_471';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_472')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_472', N'ACTIVE', N'K10', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K10'
    WHERE pallet_id = N'p_472';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_473')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_473', N'ACTIVE', N'K09', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'K09'
    WHERE pallet_id = N'p_473';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_474')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_474', N'ACTIVE', N'D14/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D14/1'
    WHERE pallet_id = N'p_474';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_475')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_475', N'ACTIVE', N'B33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B33/2'
    WHERE pallet_id = N'p_475';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_476')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_476', N'ACTIVE', N'F25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F25/1'
    WHERE pallet_id = N'p_476';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_477')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_477', N'ACTIVE', N'E62/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E62/1'
    WHERE pallet_id = N'p_477';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_478')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_478', N'ACTIVE', N'E13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E13/1'
    WHERE pallet_id = N'p_478';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_479')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_479', N'ACTIVE', N'B21/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B21/2'
    WHERE pallet_id = N'p_479';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_48')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_48', N'ACTIVE', N'L2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L2'
    WHERE pallet_id = N'p_48';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_480')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_480', N'ACTIVE', N'L1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'L1'
    WHERE pallet_id = N'p_480';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_481')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_481', N'ACTIVE', N'T3', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'T3'
    WHERE pallet_id = N'p_481';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_482')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_482', N'ACTIVE', N'C23/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_482';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_483')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_483', N'ACTIVE', N'C42/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C42/1'
    WHERE pallet_id = N'p_483';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_484')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_484', N'ACTIVE', N'C24/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C24/2'
    WHERE pallet_id = N'p_484';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_485')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_485', N'ACTIVE', N'A12/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A12/2'
    WHERE pallet_id = N'p_485';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_486')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_486', N'ACTIVE', N'C43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C43/2'
    WHERE pallet_id = N'p_486';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_487')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_487', N'ACTIVE', N'C21/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C21/2'
    WHERE pallet_id = N'p_487';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_488')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_488', N'ACTIVE', N'A52/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A52/1'
    WHERE pallet_id = N'p_488';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_489')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_489', N'ACTIVE', N'B61/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B61/1'
    WHERE pallet_id = N'p_489';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_49')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_49', N'ACTIVE', N'F24/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F24/1'
    WHERE pallet_id = N'p_49';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_490')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_490', N'ACTIVE', N'B32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B32/1'
    WHERE pallet_id = N'p_490';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_491')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_491', N'ACTIVE', N'E43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/1'
    WHERE pallet_id = N'p_491';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_492')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_492', N'ACTIVE', N'E43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/2'
    WHERE pallet_id = N'p_492';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_493')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_493', N'ACTIVE', N'A65/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A65/2'
    WHERE pallet_id = N'p_493';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_494')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_494', N'ACTIVE', N'B54/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B54/1'
    WHERE pallet_id = N'p_494';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_495')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_495', N'ACTIVE', N'B15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B15/1'
    WHERE pallet_id = N'p_495';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_496')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_496', N'ACTIVE', N'D32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/1'
    WHERE pallet_id = N'p_496';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_497')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_497', N'ACTIVE', N'B25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/2'
    WHERE pallet_id = N'p_497';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_498')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_498', N'ACTIVE', N'B25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B25/2'
    WHERE pallet_id = N'p_498';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_499')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_499', N'ACTIVE', N'E43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/2'
    WHERE pallet_id = N'p_499';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_5')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_5', N'ACTIVE', N'E43/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E43/1'
    WHERE pallet_id = N'p_5';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_50')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_50', N'ACTIVE', N'D32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D32/2'
    WHERE pallet_id = N'p_50';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_500')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_500', N'ACTIVE', N'B23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B23/2'
    WHERE pallet_id = N'p_500';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_501')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_501', N'ACTIVE', N'B12/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B12/2'
    WHERE pallet_id = N'p_501';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_502')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_502', N'ACTIVE', N'B11/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B11/2'
    WHERE pallet_id = N'p_502';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_503')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_503', N'ACTIVE', N'B11/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B11/1'
    WHERE pallet_id = N'p_503';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_504')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_504', N'ACTIVE', N'C52/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C52/2'
    WHERE pallet_id = N'p_504';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_505')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_505', N'ACTIVE', N'C51/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C51/1'
    WHERE pallet_id = N'p_505';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_506')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_506', N'ACTIVE', N'E61/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E61/2'
    WHERE pallet_id = N'p_506';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_507')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_507', N'ACTIVE', N'C34/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C34/1'
    WHERE pallet_id = N'p_507';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_508')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_508', N'ACTIVE', N'B14/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B14/2'
    WHERE pallet_id = N'p_508';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_509')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_509', N'ACTIVE', N'B13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B13/1'
    WHERE pallet_id = N'p_509';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_51')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_51', N'ACTIVE', N'C33/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C33/2'
    WHERE pallet_id = N'p_51';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_510')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_510', N'ACTIVE', N'E25/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E25/1'
    WHERE pallet_id = N'p_510';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_511')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_511', N'ACTIVE', N'E13/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E13/2'
    WHERE pallet_id = N'p_511';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_512')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_512', N'ACTIVE', N'B22/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B22/2'
    WHERE pallet_id = N'p_512';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_513')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_513', N'ACTIVE', N'E63/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E63/1'
    WHERE pallet_id = N'p_513';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_514')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_514', N'ACTIVE', N'D12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D12/1'
    WHERE pallet_id = N'p_514';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_515')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_515', N'ACTIVE', N'F34/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F34/1'
    WHERE pallet_id = N'p_515';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_516')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_516', N'ACTIVE', N'A25/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A25/2'
    WHERE pallet_id = N'p_516';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_517')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_517', N'ACTIVE', N'C35/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C35/1'
    WHERE pallet_id = N'p_517';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_518')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_518', N'ACTIVE', N'C15/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C15/1'
    WHERE pallet_id = N'p_518';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_519')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_519', N'ACTIVE', N'B12/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B12/1'
    WHERE pallet_id = N'p_519';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_52')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_52', N'ACTIVE', N'D45/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D45/1'
    WHERE pallet_id = N'p_52';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_520')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_520', N'ACTIVE', N'A13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A13/1'
    WHERE pallet_id = N'p_520';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_521')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_521', N'ACTIVE', N'A34/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A34/2'
    WHERE pallet_id = N'p_521';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_522')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_522', N'ACTIVE', N'B64/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B64/1'
    WHERE pallet_id = N'p_522';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_523')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_523', N'ACTIVE', N'F65/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F65/1'
    WHERE pallet_id = N'p_523';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_524')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_524', N'ACTIVE', N'A54/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A54/2'
    WHERE pallet_id = N'p_524';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_525')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_525', N'ACTIVE', N'F65/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F65/1'
    WHERE pallet_id = N'p_525';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_526')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_526', N'ACTIVE', N'D24/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D24/1'
    WHERE pallet_id = N'p_526';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_527')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_527', N'ACTIVE', N'C32/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C32/2'
    WHERE pallet_id = N'p_527';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_528')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_528', N'ACTIVE', N'A65/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A65/1'
    WHERE pallet_id = N'p_528';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_529')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_529', N'ACTIVE', N'E45/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E45/1'
    WHERE pallet_id = N'p_529';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_53')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_53', N'ACTIVE', N'D54/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D54/2'
    WHERE pallet_id = N'p_53';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_530')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_530', N'ACTIVE', N'A45/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A45/2'
    WHERE pallet_id = N'p_530';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_531')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_531', N'ACTIVE', N'E22/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E22/1'
    WHERE pallet_id = N'p_531';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_532')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_532', N'ACTIVE', N'C23/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C23/1'
    WHERE pallet_id = N'p_532';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_533')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_533', N'ACTIVE', N'F24/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F24/2'
    WHERE pallet_id = N'p_533';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_534')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_534', N'ACTIVE', N'D54/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D54/2'
    WHERE pallet_id = N'p_534';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_535')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_535', N'ACTIVE', N'E53/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E53/2'
    WHERE pallet_id = N'p_535';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_536')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_536', N'ACTIVE', N'B52/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B52/1'
    WHERE pallet_id = N'p_536';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_537')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_537', N'ACTIVE', N'C13/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C13/1'
    WHERE pallet_id = N'p_537';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_538')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_538', N'ACTIVE', N'B15/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B15/2'
    WHERE pallet_id = N'p_538';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_539')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_539', N'ACTIVE', N'A62/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A62/1'
    WHERE pallet_id = N'p_539';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_54')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_54', N'ACTIVE', N'A53/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A53/2'
    WHERE pallet_id = N'p_54';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_540')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_540', N'ACTIVE', N'A54/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A54/1'
    WHERE pallet_id = N'p_540';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_541')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_541', N'ACTIVE', N'A43/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'A43/2'
    WHERE pallet_id = N'p_541';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_542')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_542', N'ACTIVE', N'D45/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D45/2'
    WHERE pallet_id = N'p_542';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_543')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_543', N'ACTIVE', N'D41/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'D41/2'
    WHERE pallet_id = N'p_543';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_544')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_544', N'ACTIVE', N'E32/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'E32/1'
    WHERE pallet_id = N'p_544';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_545')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_545', N'ACTIVE', N'F55/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'F55/1'
    WHERE pallet_id = N'p_545';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_546')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_546', N'ACTIVE', N'C42/1', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'C42/1'
    WHERE pallet_id = N'p_546';
END
GO

IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'p_547')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'p_547', N'ACTIVE', N'B23/2', N'2024-08-08 11:45:28.973', 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'ACTIVE', current_location_code = N'B23/2'
    WHERE pallet_id = N'p_547';
END
GO
