# Tổng kết Sửa lỗi Nhóm 2 (Walkthrough)

## Các lỗi đã khắc phục thành công:

1. **UC02 - Lỗi Soft-Lock khi Gán/Sửa mã đơn OEM**
   - Đã cập nhật `Stored_Procedures/02_UC02_Order_SPs.sql` (hàm `usp_WMS_UC02_UpdateMaDonHang`).
   - Bổ sung kiểm tra `IF EXISTS` với bảng kho tạm `WMS_UC03_ScanLog` và bảng kho chính thức `tbl_thung60_kho`. Ngăn chặn hoàn toàn việc sửa đổi dữ liệu nếu đã có phát sinh thao tác quét thực tế.

2. **UC02 - Lỗi Tìm kiếm Đơn hàng OEM (Sai điều kiện)**
   - Đã cập nhật `Stored_Procedures/02_UC02_Order_SPs.sql` (hàm `usp_WMS_UC02_SearchDonHang`).
   - Đảm bảo nhánh tìm kiếm theo `MaDonHang` / `MaPO` vẫn bị ràng buộc cứng bởi điều kiện `MaHang = @Keyword`, loại bỏ triệt để rủi ro gán sai hàng.

3. **UC02 - Lỗi Soft-Lock khi Hủy gán mã đơn OEM**
   - Đã cập nhật `Stored_Procedures/02_UC02_Order_SPs.sql` (hàm `usp_WMS_UC02_UnmapMaDonHang`).
   - Sửa lỗi chỉ kiểm tra `tbl_thung60_kho` bằng cách thêm kiểm tra đồng thời cả bảng `WMS_UC03_ScanLog`. Không cho phép Hủy gán nếu kiện hàng đang nằm chờ (Staging).

4. **UC03 - Lỗi API Backend (Thiếu Validation & Fallback)**
   - Đã cập nhật `src/Wms.Api/Controllers/ReceiptController.cs` (hàm `ScanThung60`).
   - Thêm bộ kiểm tra `string.IsNullOrWhiteSpace` cho các trường bắt buộc, chặn đứng các Request không hợp lệ (HTTP 400).
   - Thêm cơ chế Fallback an toàn `UserName = _currentUserService.Username ?? "SYSTEM_PDA"`.
   - Bọc toàn bộ khối lệnh trong `try-catch` để tránh Crash hệ thống.

## Đánh giá
Đã biên dịch thành công Backend (`Build Succeeded 0 Error(s)`). Toàn bộ 4 rủi ro lớn về tính toàn vẹn dữ liệu (Data Integrity) của Giai đoạn 2 đã được bảo vệ (Fail-fast). Kế hoạch hoàn thành xuất sắc.
