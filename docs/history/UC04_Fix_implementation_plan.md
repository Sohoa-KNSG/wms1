# Cập nhật SP Xác nhận Nhập kho (UC04)

Giải quyết lỗi: Phiếu UC04 sau khi xác nhận không chuyển trạng thái và vẫn cho phép nhấn xác nhận lại (gây lỗi "Không có thùng hợp lệ").

## Nguyên nhân
Trong Store Procedure `usp_WMS_UC04_ConfirmNhapKho`, mặc dù dữ liệu Thùng 60 đã được chuyển trạng thái sang `CONFIRMED` và tồn kho vật lý (`tbl_thung60_kho`) đã được hạch toán đầy đủ, hệ thống đã thiếu câu lệnh cập nhật cờ `Rlsed = 1` (Trạng thái release) ngược về bảng chứng từ gốc (`sxtpt.dbo.MF_InTran`).

Do `Rlsed` vẫn bằng `0`, view `vw_WMS_UC04_PhieuChoXacNhan` tiếp tục hiển thị phiếu này ở mục "Chờ xác nhận" trên Frontend.

## User Review Required

> [!IMPORTANT]
> - Thay đổi này sẽ thực## Open Questions

None.

## Proposed Changes

### Database Layer (WMS)
Because we cannot modify `sxtpt.dbo.MF_InTran` directly, we will rely on WMS's local state. `usp_WMS_UC04_ConfirmNhapKho` currently has a block labeled `-- Cập nhật trạng thái phiếu bên ERP/WMS` which simply does `SET IsDeleted = 0` on `WMS_PhieuNhap_DonHang_Map`. We will add a real status column and use it to filter out confirmed tickets from the pending view.

#### [MODIFY] SQL Migration (Add Status Column)
Create a new migration script to add the state column:
```sql
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.WMS_PhieuNhap_DonHang_Map') AND name = 'TrangThaiPhieu')
BEGIN
    ALTER TABLE dbo.WMS_PhieuNhap_DonHang_Map ADD TrangThaiPhieu NVARCHAR(50) DEFAULT N'NEW';
END
```

#### [MODIFY] `Stored_Procedures/04_UC03_Scan_SPs.sql` (usp_WMS_UC04_ConfirmNhapKho)
Update the stored procedure so it correctly updates the ticket line to `COMPLETED`:
```sql
    -- Cập nhật trạng thái phiếu bên WMS
    UPDATE map
    SET TrangThaiPhieu = N'COMPLETED'
    FROM dbo.WMS_PhieuNhap_DonHang_Map map
    WHERE map.SoPhieuNhap = @SoPhieuNhap
      AND (map.MaChiTietPhieu = @MaChiTietPhieu OR @MaChiTietPhieu IS NULL);
```

#### [MODIFY] `Stored_Procedures/05_UC04_Pending_Schema.sql` (vw_WMS_UC04_PhieuChoXacNhan)
Modify the `vw_WMS_UC04_PhieuChoXacNhan` view. It currently filters pending tickets using `WHERE ct.TrangThaiRelease = 0`. We will append a check to exclude lines marked as `COMPLETED` in the mapping table:
```sql
      WHERE ct.TrangThaiRelease = 0
        AND ISNULL(map.TrangThaiPhieu, N'NEW') <> N'COMPLETED'
```
This ensures the UI instantly hides confirmed tickets without waiting for an ERP sync.

## Verification Plan

### Automated Tests
- Chạy thử SQL query trên DEV để xác nhận SP biên dịch và cập nhật thành công.

### Manual Verification
- Người dùng vào màn hình UC04, tìm một phiếu đang chờ và xác nhận.
- Đảm bảo phiếu biến mất khỏi danh sách "Chờ xác nhận" sau khi thao tác.
