# Kế hoạch Thực thi (Implementation Plan) - Sửa lỗi UC04

Tài liệu này trình bày kế hoạch chi tiết để sửa 3 lỗi nghiêm trọng và sai lệch dữ liệu liên quan đến UC04 (Pending Handover, Partial Receipt, Cancel Scan) dựa trên Báo cáo Kiểm thử của QA (QA Bug Report).

> [!IMPORTANT]
> **Cần Bạn Phê Duyệt:** Vui lòng xem kỹ kế hoạch dưới đây, đặc biệt là phần Cập nhật Tài liệu thay vì cập nhật Code cho UC04.1. Nếu bạn đồng ý, hãy bấm **Proceed** để tôi tiến hành sửa chữa.

## Open Questions
- Không có câu hỏi nào. Đề xuất của QA là hợp lý và tuân thủ nguyên tắc thiết kế dự án.

## Proposed Changes

---

### 1. Sửa Lỗi Backend API (UC04.2 - Cancel Scan)
Sửa lỗi gọi nhầm Stored Procedure và truyền sai tham số để đảm bảo tính năng Hủy toàn bộ phiếu hoạt động đúng.

#### [MODIFY] [ReceiptController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/ReceiptController.cs)
- Cập nhật hàm `CancelHandoverScan` (tại Route `POST handover/{handoverNo}/cancel-scan`).
- Đổi tên SP từ `usp_WMS_UC03_CancelScan` thành `usp_WMS_UC04_2_CancelScan`.
- Chỉnh sửa object parameters truyền vào: sử dụng `SoPhieuNhap = handoverNo` thay vì `ScanLogID`. 

---

### 2. Sửa Lỗi Logic & Khóa Dữ liệu (UC04 - Pending Handover)
Đảm bảo tính năng Xác nhận Nhập Kho có kiểm tra Fail-fast đúng đắn và bọc `UPDLOCK` để chống race conditions theo chuẩn thiết kế.

#### [MODIFY] [04_UC03_Scan_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/04_UC03_Scan_SPs.sql)
- Sửa đổi Stored Procedure `usp_WMS_UC04_ConfirmNhapKho`.
- Cập nhật điều kiện kiểm tra tồn tại thùng (dòng 221-230): sử dụng `WITH (UPDLOCK)` và check đích danh `TrangThaiScan = N'VALID'` để Fail-fast nếu không có thùng hợp lệ chờ xác nhận.
- Đảm bảo các câu truy vấn SELECT bên trong Transaction đều được áp dụng `WITH (UPDLOCK)` khi cần.

---

### 3. Cập Nhật Tài Liệu Thiết Kế (UC04.1 - Partial Receipt)
Thay vì sửa code làm mất tính năng chống trùng lặp Transaction ID, ta sẽ cập nhật tài liệu thiết kế Use Case để đồng bộ với Code.

#### [MODIFY] [UC04_1_Partial_Receipt.md](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/02_Process_UseCase/UC04_1_Partial_Receipt.md)
- Cập nhật phần Code mẫu (3.2.B) và Data Flow Diagram để phản ánh việc Transaction ID có chứa Milliseconds (`HHmmssfff`).
- Bổ sung trường `old_stock_type` vào lược đồ ERD (phần 5.3) và phần mô tả bảng `inventory_ledger`.

## Verification Plan
Sau khi thực hiện thay đổi, tôi sẽ:
1. Đảm bảo mã C# (Backend API) được biên dịch không lỗi (Build success).
2. Chạy lại script SQL `04_UC03_Scan_SPs.sql` vào DB để cập nhật SP (nếu khả thi).
3. Đảm bảo tài liệu được Render Mermaid đúng chuẩn.
4. Ghi chép Changelog và Walkthrough.
