# Fix UC05 Pack360 Completion Logic & QR Format

Khắc phục lỗi định dạng QR Code và bổ sung luồng ghi nhận sổ cái kép (Dual Ledger) khi hoàn tất đóng gói Kiện 360, đồng thời sửa lỗi in tem TSPL.

## Vấn đề hiện tại
1. **Sai định dạng QR Code:** Hiện tại SQL đang sinh mã QR có định dạng `Kênh/Mã_SP/dd/MM/yy/Seq` (ví dụ `GT/D.507V/07/08/26/1`), trong khi tài liệu `BR-UC05-01` yêu cầu định dạng là `{Kênh}-{Mã_SP}-{DDMMYYYY}-{Sequence}` (ví dụ `GT-D.507V-07082026-1`). Sự không đồng nhất này khiến cho QA Tester nhận thấy sự khác biệt giữa chuẩn quy định trên tem và dữ liệu thực tế lưu trong SQL.
2. **Thiếu Hạch Toán Sổ Cái:** Stored Procedure `usp_Pack360_Complete` hiện tại chỉ cập nhật bảng `pack360_header` mà **bỏ sót** bước ghi nhận vào sổ cái `stock_transaction_book` với loại giao dịch `PACK360_CREATE` (theo quy định tại mục 4.3).
3. **Lỗi Template TSPL:** Backend hiện tại đang xuất ra chuỗi dạng `TEXT ... "QR: {escapedQr}"` thay vì lệnh in mã vạch QR thực thụ của máy in mã vạch (`QRCODE`).

## Proposed Changes

### 1. Database (Stored Procedure)
#### [MODIFY] `usp_Pack360_Complete`
- **Sửa logic sinh mã QR:** Thay đổi cách tạo biến `@prefix`.
  Sử dụng `REPLACE(CONVERT(VARCHAR, GETDATE(), 103), '/', '')` để lấy chuỗi ngày tháng dạng `DDMMYYYY`.
  Ghép chuỗi định dạng bằng dấu gạch ngang (`-`) thay vì gạch chéo (`/`).
- **Thêm lệnh Hạch toán:** Thêm câu lệnh `INSERT INTO stock_transaction_book (transaction_id, transaction_type, document_no, posted_at, posted_by)` với giá trị tương ứng `NEWID()`, `'PACK360_CREATE'`, `@new_qr`, `GETDATE()`, và `@user_code` vào trong khối `TRANSACTION`.

### 2. Backend (C#)
#### [MODIFY] `src/Wms.Api/Controllers/Pack360Controller.cs`
- **Cập nhật hàm `TsplHelper.GenerateLabel`:** Thay thế dòng in chữ `TEXT 50,50,"3",0,1,1,"QR: ..."` bằng lệnh in mã QR chuẩn TSPL: `QRCODE 50,50,H,4,A,0,"{escapedQr}"`.
- Điều chỉnh lại tọa độ (X, Y) của các dòng TEXT còn lại để nhường chỗ cho khối hình QR code (vì hình QR code chiếm diện tích lớn hơn so với một dòng text bình thường).

## Verification Plan

### Automated/Manual Verification
- Thực thi file SQL cập nhật Procedure `usp_Pack360_Complete`.
- Build lại backend C#.
- Dùng `curl` hoặc yêu cầu user test lại luồng *Hoàn tất đóng gói* trên Frontend để xác nhận:
  - QR Code sinh ra có dạng chuẩn `GT-D.507V-DDMMYYYY-1`.
  - CSDL có dữ liệu trong `stock_transaction_book`.
  - UI Preview hoặc JSON trả về chứa mã lệnh `QRCODE` hợp lệ.
