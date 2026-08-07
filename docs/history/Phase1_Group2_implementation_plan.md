# Kế hoạch Thực thi (Implementation Plan) - Sửa lỗi Nhóm 2 (UC02, UC03)

Dựa trên báo cáo lỗi từ QA Tester, tôi đề xuất kế hoạch sửa chữa cụ thể như sau:

> [!IMPORTANT]
> **Cần Bạn Phê Duyệt:** Kế hoạch này sẽ thay đổi logic Khóa mềm (Soft-Lock) tại Database và cập nhật Validation tại API Controller. Nếu bạn đồng ý, hãy bấm **Proceed**.

## Open Questions
- Không có. Các đề xuất sửa chữa đã rõ ràng và tuân thủ chặt chẽ tài liệu Use Case.

## Proposed Changes

---

### 1. Sửa Lỗi Database Logic: Thiếu Soft-Lock khi Update
Chặn việc sửa đổi Đơn OEM khi dòng phiếu đã phát sinh quét tem.

#### [MODIFY] [02_UC02_Order_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/02_UC02_Order_SPs.sql)
- **Hàm `usp_WMS_UC02_UpdateMaDonHang`**: Bổ sung khối lệnh kiểm tra `IF EXISTS` với bảng `tbl_thung60_kho` và `WMS_UC03_ScanLog`. Nếu đã tồn tại dữ liệu quét, `RAISERROR` và `ROLLBACK`.

---

### 2. Sửa Lỗi Database Logic: Sai điều kiện Search
Bắt buộc việc tìm kiếm đơn hàng luôn phải khớp chính xác mã sản phẩm.

#### [MODIFY] [02_UC02_Order_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/02_UC02_Order_SPs.sql)
- **Hàm `usp_WMS_UC02_SearchDonHang`**: Tại nhánh tìm kiếm dự phòng (`ELSE`), bổ sung điều kiện `WHERE MaHang = @Keyword AND (MaDonHang LIKE ... OR MaKhachHang LIKE ...)` để bảo đảm luôn lọc đúng mã hàng.

---

### 3. Sửa Lỗi Database Logic: Thiếu Soft-Lock khi Unmap
Chặn việc Hủy gán Đơn OEM khi dòng phiếu đang có hàng ở Kho tạm (ScanLog).

#### [MODIFY] [02_UC02_Order_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/02_UC02_Order_SPs.sql)
- **Hàm `usp_WMS_UC02_UnmapMaDonHang`**: Bổ sung điều kiện kiểm tra tồn tại bản ghi hợp lệ (`VALID`, `CONFIRMED`) ở bảng `WMS_UC03_ScanLog` vào chung với khối kiểm tra Soft-lock hiện tại.

---

### 4. Sửa Lỗi Backend API: Thiếu Validation và Fallback
Cập nhật C# Code để bắt lỗi từ sớm và gán user fallback.

#### [MODIFY] [ReceiptController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/ReceiptController.cs)
- **Hàm `ScanThung60`**: Bổ sung check `string.IsNullOrWhiteSpace` cho các trường bắt buộc, bọc khối lệnh trong `try-catch`, và gán fallback `_currentUserService.Username ?? "SYSTEM_PDA"`.

## Verification Plan
1. Chạy Script SQL để cập nhật các hàm (Alter Procedure).
2. Chạy thử biên dịch (Build) API C# để đảm bảo an toàn.
3. Ghi `CHANGELOG.md` và `walkthrough.md` tổng kết Giai đoạn 2.
