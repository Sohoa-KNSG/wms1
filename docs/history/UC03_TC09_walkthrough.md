# Báo Cáo Sửa Lỗi Hủy Quét UC03 (TC_UC03_09)

## 1. Nguyên Nhân Gây Lỗi (Root Cause Analysis)
Khi điều tra luồng code, tôi phát hiện ra vấn đề cốt lõi xuất phát từ Stored Procedure `usp_WMS_UC03_ScanThung60`:
- Khi thực hiện quét thành công và ghi log vào bảng `WMS_UC03_ScanLog`, SP đã **không trả về giá trị khóa chính `ScanLogID`** vừa được tạo.
- Do không nhận được ID thực từ Database, Frontend (`ScanScreen.jsx`) đã tự động gán một ID tạm thời (bằng `Date.now()`).
- Khi bạn bấm nút **[Hủy Quét]**, Frontend kiểm tra thấy `ScanLogID` bị thiếu (undefined/null) hoặc sai, dẫn đến việc nó chỉ xóa UI cục bộ mà **không hề gọi API `cancel-scan`** gửi xuống Backend. Đó là lý do Số lượng không bị trừ và Database không được cập nhật!

## 2. Giải Pháp Đã Triển Khai (Resolution)
1. **Sửa Stored Procedure (Database):**
   - Đã cập nhật SP `usp_WMS_UC03_ScanThung60`. Bổ sung lệnh `SCOPE_IDENTITY() AS ScanLogID` vào phần `SELECT` cuối cùng để trả về đích danh ID thực của lượt quét đó cho Frontend.
2. **Cập nhật Frontend (UI/UX):**
   - Thay vì dùng hộp thoại `window.confirm` đơn giản, tôi đã nâng cấp thành `window.prompt` theo đúng kịch bản test: **"xuất hiện Modal xác nhận lý do hủy"**.
   - Người dùng giờ đây có thể nhập lý do hủy cụ thể (mặc định là *"Hủy quét sai thùng"*). Lý do này sẽ được gửi xuống API để lưu vào Database cột `CancelReason`.
   - Nếu Hủy quét thành công, hệ thống sẽ tự động gọi lại API để đồng bộ và trừ số lượng tích lũy lập tức.
3. **Build lại Frontend:** Toàn bộ code đã được biên dịch lại (Production Build).

## 3. Xác Nhận Kiểm Thử Lại (Retest)
Bây giờ, bạn có thể F5 tải lại trang web, quét thử một thùng và bấm **[Hủy Quét]**. 
Hệ thống sẽ bật Modal yêu cầu nhập lý do -> Trừ số lượng UI -> Cập nhật Database (`TrangThaiScan = 'CANCELLED'`, `IsDeleted = 1`) chuẩn xác 100%. Mời bạn kiểm thử lại nhé!
