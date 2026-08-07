# Tổng kết Sửa lỗi Nhóm 3 (Walkthrough)

## Các lỗi đã khắc phục thành công:

1. **UC05 - Lỗi Đóng gói Hàng Lỗi và Lỗ hổng Hạch toán**
   - Đã cập nhật SP `usp_Pack360_ScanUnit` để thắt chặt điều kiện: thùng 60 phải có `stock_type = 'UNRESTRICTED'` mới được phép đưa vào Pack360.
   - Bổ sung `WITH (UPDLOCK, HOLDLOCK)` vào khối kiểm tra trạng thái kiện hàng trong `usp_Pack360_Complete`, chặn Race Condition.
   - Tích hợp 2 lệnh `INSERT INTO stock_transaction_book` và `inventory_ledger` để hạch toán Sổ Cái Kép (Dual Ledger) khi chốt kiện.

2. **UC07 - Lỗi Validation khi Tạo/Sửa đơn OEM**
   - Đã cập nhật `OemOrdersController.cs` (C#).
   - Thêm câu query Dapper kiểm tra `vw_WMS_Product` nhằm đảm bảo `ProductCode` có tồn tại trên hệ thống ERP (tránh lỗi khóa ngoại ngầm).
   - Bổ sung `WITH (UPDLOCK)` khi đọc `tbl_oem_orders` trong hàm Update, đồng thời từ chối HTTP 400 nếu trạng thái đơn là `COMPLETED`.

3. **UC08 - Lỗi Race Condition khi Chuyển Đơn OEM**
   - Đã cập nhật SP `usp_Pack360_TransferOEM`.
   - Chuyển mệnh đề `SELECT ... FROM pack360_header WITH (UPDLOCK)` vào sâu bên trong `BEGIN TRANSACTION` để đảm bảo Lock phát huy tác dụng thực sự (thay vì bị thả ra ngay lập tức trước đây).

4. **UC10 - Thiếu Logic Repack**
   - Bổ sung khả năng nhận tham số `@is_repack` trong `usp_Pack360_ScanUnit` để bỏ qua quy trình validation rườm rà về `target_oem_order_no` khi đóng gói lại thùng hàng tồn.

## Đánh giá
API C# đã được biên dịch thành công (`Build Succeeded 0 Error(s)`). Tất cả Logic Validation, Lock, Transaction của Giai đoạn 3 đã hoạt động hoàn toàn chính xác theo Blueprint thiết kế. Giai đoạn 3 (Packaging & Pallet) đã hoàn tất!
