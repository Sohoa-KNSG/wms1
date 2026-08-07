# Kế hoạch Thực thi (Implementation Plan) - Sửa lỗi Nhóm 4 (Outbound & Logistics)

Dựa trên báo cáo lỗi từ QA Tester, tôi đề xuất kế hoạch sửa chữa tổng thể cho Giai đoạn 4.

> [!IMPORTANT]
> **Cần Bạn Phê Duyệt:** Kế hoạch này sẽ thực hiện một số cấu trúc Refactor lớn (đưa Inline SQL xuống Stored Procedure) để cải thiện Performance cho UC12, UC13. Nếu bạn đồng ý, hãy bấm **Proceed**.

## Open Questions

> [!WARNING]
> **Câu hỏi nghiệp vụ (UC11):** 
> 1. Hiện tại mã nguồn Putaway/Letdown đang thao tác trên đối tượng **Pallet**, trong khi tài liệu UC11 ghi là **Kiện 360**. Chúng ta sẽ cập nhật Tài liệu UC11 để khớp với Mã nguồn (dùng Pallet), hay phải sửa lại Mã nguồn để dùng Kiện 360? (Tạm thời tôi đề xuất giữ nguyên mã nguồn Pallet và chỉ sửa các lỗi bảo mật dữ liệu, chờ BA chốt).
> 2. API Route của UC11 trong Code là `/api/v1/pallet/{id}/putaway` khác với Tài liệu `/api/v1/shelving/putaway`. Tôi sẽ ưu tiên giữ cấu trúc Code hiện tại và đề xuất cập nhật Tài liệu.

## Proposed Changes

---

### 1. UC11 - Đưa hàng lên kệ / Xuống kệ (Putaway)

#### [MODIFY] [Stored_Procedures/11_UC11_Shelving_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/11_UC11_Shelving_SPs.sql)
- **Hàm `usp_WMS_UC11_PutawayPallet` (hoặc tương đương)**: Bổ sung từ khóa `WITH (UPDLOCK)` khi truy vấn đọc trạng thái của Pallet/Kiện 360 để chặn Race Condition.

---

### 2. UC12 - Tra cứu Hồ sơ (Traceability)

#### [NEW] [Stored_Procedures/12_UC12_Trace_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/12_UC12_Trace_SPs.sql)
- Viết mới Stored Procedure `usp_WMS_UC12_GetUniversalDossier` sử dụng kỹ thuật Multi-result Set (trả về nhiều bảng dữ liệu trong 1 lần gọi) kèm theo hint `WITH (NOLOCK)` để tăng tốc độ đọc.

#### [MODIFY] [src/Wms.Api/Controllers/TraceController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/TraceController.cs)
- Loại bỏ các câu truy vấn Inline SQL tuần tự. Refactor sử dụng Dapper `QueryMultipleAsync` gọi đến SP `usp_WMS_UC12_GetUniversalDossier`.

---

### 3. UC13 & UC14 - Khóa và Mở Khóa Tồn Kho (Stock Blocking / Release)

#### [MODIFY] [Stored_Procedures/05_StockType_SPs.sql](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/Stored_Procedures/05_StockType_SPs.sql)
- **Hàm `usp_StockType_Block` / `usp_StockType_Release`**: Xây dựng hoàn chỉnh luồng SQL thay vì để Dummy. 

#### [MODIFY] [src/Wms.Api/Controllers/StockTypeChangeController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/StockTypeChangeController.cs)
- **Validation**: Đổi từ Blacklist sang Whitelist (chỉ cho phép `AVAILABLE`, `PALLETIZED`, `PACKED_360`).
- **Release (UC14)**: Bổ sung check `oldStockType == "BLOCKED"`. Ghi nhận sự kiện `STOCK_RELEASE` và gán `block_reason_code = NULL`.
- Cấu trúc lại để Controller chỉ làm nhiệm vụ gọi SP thay vì chạy Inline SQL Transaction.

---

### 4. UC15 - Phiếu Giao Hàng (Delivery Note)

#### [MODIFY] [src/Wms.Api/Controllers/DeliveryController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/DeliveryController.cs)
- **Hàm `CreateDeliveryNotes`**: 
  - Sửa logic Group By: Nhóm danh sách các mặt hàng theo `CustomerName` (hoặc Code) trước khi tạo Phiếu Xuất, mỗi Khách hàng 1 Phiếu Xuất độc lập.
  - Thêm logic lấy `max_weight_kg` từ bảng `tbl_trucks`, cộng tổng `total_weight_kg` của phiếu xuất, nếu vượt tải trọng thì `BadRequest`.

## Verification Plan
1. Khởi tạo/Cập nhật các SP bằng cách chạy lệnh SQL.
2. Build lại toàn bộ WMS API Project.
3. Cập nhật `CHANGELOG.md` và `walkthrough.md` hoàn tất Giai đoạn 4.
