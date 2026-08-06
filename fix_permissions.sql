-- 1. Insert permissions into sec_permission if they don't exist
INSERT INTO sec_permission (permission_id, permission_name, resource, action)
SELECT p.permission_id, p.permission_id, p.permission_id, 'ALL'
FROM (VALUES
('Receipt.Read'),
('Receipt.Scan'),
('Receipt.Confirm'),
('Receipt.Manage'),
('Pack360.Read'),
('Pack360.Scan'),
('Pack360.Complete'),
('Pack360.Cancel'),
('Pack360.Release'),
('Pack360.Detach'),
('Pack360.Transfer'),
('Pallet.Read'),
('Pallet.Manage'),
('Picking.Read'),
('Picking.Scan'),
('Picking.Manage'),
('Picking.Approve'),
('Picking.Ship'),
('Export.Read'),
('Export.Manage'),
('Oem.Read'),
('Oem.Manage'),
('MasterData.Read'),
('MasterData.Manage'),
('Reports.Read'),
('Ledger.Read'),
('Trace.Read'),
('Reconciliation.Read'),
('Admin.Users.Manage'),
('THU_KHO')
) AS p(permission_id)
WHERE NOT EXISTS (SELECT 1 FROM sec_permission sp WHERE sp.permission_id = p.permission_id);

-- 2. Clear old role permissions
DELETE FROM sec_role_permission;

-- 3. Re-assign permissions
INSERT INTO sec_role_permission (role_id, permission_id)
SELECT 'IT_ADMIN', permission_id FROM sec_permission;

INSERT INTO sec_role_permission (role_id, permission_id)
SELECT 'NHAN_VIEN', permission_id FROM sec_permission;

INSERT INTO sec_role_permission (role_id, permission_id)
SELECT 'THU_KHO', permission_id FROM sec_permission;
