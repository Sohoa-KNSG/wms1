# Kế hoạch Thực thi (Implementation Plan) - Sửa lỗi Nhóm 3 (UC05 -> UC10)

Dựa trên báo cáo lỗi từ QA Tester, tôi đề xuất kế hoạch sửa chữa cụ thể để vá các lỗ hổng Race Condition và Validation như sau:

> [!IMPORTANT]
> **Cần Bạn Phê Duyệt:** Kế hoạch này can thiệp vào Logic Lock (Khóa DB) và Hạch toán Kép (Dual Ledger) - là những Core Logic cực kỳ quan trọng của WMS. Nếu bạn đồng ý, hãy bấm **Proceed**.

## Proposed Changes

---

### 1. UC05 - Sửa lỗi Data Logic & Idempotency (Đóng gói Pack360)

#### [MODIFY] [02_Pack360_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/02_Pack360_SPs.sql)
- **Hàm `usp_Pack360_ScanUnit`**: Bổ sung điều kiện `AND stock_type = 'UNRESTRICTED'` để chặn hàng cách ly. Thêm logic nhận cờ `@is_repack` (của UC10) để bỏ qua check `target_oem_order_no`.
- **Hàm `usp_Pack360_Complete`**:
  - Thêm `WITH (UPDLOCK, HOLDLOCK)` khi SELECT `pack360_header`.
  - Cập nhật Idempotency Log vào bảng `command_request_log` để chặn Double-Submit.
  - Bổ sung logic `INSERT INTO stock_transaction_book` và `inventory_ledger` (Hạch toán Sổ Cái Kép).

---

### 2. UC07 - Sửa lỗi Validation & Ngăn Update Đơn đã Hoàn thành

#### [MODIFY] [OemOrdersController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/OemOrdersController.cs)
- **Hàm `ImportOrders` và `CreateOrder`**: Bổ sung query `SELECT COUNT(1) FROM vw_WMS_Product WHERE MFInvtID = @ProductCode` để xác thực mã sản phẩm tồn tại trước khi Insert.
- **Hàm `UpdateOrder`**: Bổ sung cờ `WITH (UPDLOCK)` khi SELECT `existing`. Nếu `existing.status == "COMPLETED"`, trả về lỗi HTTP 400.

---

### 3. UC08 - Sửa lỗi Race Condition khi Chuyển Đơn OEM

#### [MODIFY] [04_OEM_Transfer_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/04_OEM_Transfer_SPs.sql)
- **Hàm `usp_Pack360_TransferOEM`**: Dịch chuyển block `SELECT` kiểm tra trạng thái kiện hàng vào bên trong `BEGIN TRANSACTION` và sử dụng `WITH (UPDLOCK)` để ngăn chặn triệt để luồng tranh chấp đồng thời.

---

### 4. UC10 - Hỗ trợ Cờ Repack

#### [MODIFY] [02_Pack360_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/02_Pack360_SPs.sql)
- Các chỉnh sửa đã được gộp vào `usp_Pack360_ScanUnit` (như mô tả ở mục 1).
- Chỉnh sửa lệnh `INSERT INTO pack360_header` để lưu trữ cột `is_repack`. (Nếu chưa có cột `is_repack`, sẽ phải thêm `ALTER TABLE`).

## Verification Plan
1. Chạy các lệnh ALTER SQL cập nhật Procedures và Bảng (nếu cần).
2. Biên dịch (Build) API C#.
3. Cập nhật Changelog và ghi Walkthrough cho Giai đoạn 3.
