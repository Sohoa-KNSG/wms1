# Walkthrough: Cập Nhật Tài Liệu Use Case 03 & 02

## 1. Cập nhật tài liệu UC03 (Quét Nhập Tạm Thùng 60)
File: `/home/knsg-s3/WMS/02_Process_UseCase/UC03_Scan_Inbound.md`

Tài liệu UC03 hiện tại đã tuân thủ cực kỳ chuẩn xác và đầy đủ Form mẫu thiết kế theo yêu cầu (Có đủ 5 phần từ Business Logic, UI/UX, Programming, Data Layer, cho tới các biểu đồ Mermaid: `SequenceDiagram`, `Flowchart TD`, `ERDiagram`).

**Bổ sung thêm trong đợt này:**
- Đã bổ sung chú ý quan trọng (Alert) vào phần **[3.1. Frontend Logic]** về vấn đề **Type Mismatch Validation Error (HTTP 400)**.
- Tài liệu quy định rõ bắt buộc phải sử dụng hàm ép kiểu `String(lineNo)` ở Frontend để đồng bộ với `string LineNo` của record C#, tránh lỗi Validation từ ASP.NET Core trước khi chạm tới Controller.

## 2. Cập nhật bổ sung tài liệu UC02 (Gán Đơn OEM)
File: `/home/knsg-s3/WMS/02_Process_UseCase/UC02_Receive_Data1.md`

Vì bạn cũng có yêu cầu cập nhật UC02 ở các lượt trước, tôi đã cập nhật thêm các tính năng mới nhất vừa code vào tài liệu này:
- Bổ sung Business Rule `BR-UC02-06`: Hủy gán đơn OEM (Unmap).
- Cập nhật **UI/UX Guidelines**:
  - Hướng dẫn hiển thị Icon Thùng Rác Đỏ (Trash2) để Hủy gán.
  - Ẩn hoàn toàn nút Sửa và nút Hủy khi thùng đã bị quét (`scannedQty > 0`) để đảm bảo Soft-Lock.
  - Sắp xếp kết quả tìm kiếm (CTE Sort): Ưu tiên đẩy các Đơn hàng OEM khớp 100% mã sản phẩm lên đầu danh sách trả về của Modal.
