# 02_Process_UseCase - Kho thành phẩm sản xuất

**Dự án:** WMS kho thành phẩm  
**Phiên bản:** 5.0  
**Ngày cập nhật:** 2026-07-07  
**Trọng tâm:** quản lý vòng đời thùng 60, Pack360, nhập tạm, nhập chính thức, lưu kho, chuyển đơn OEM, khóa tồn, xuất lẻ và truy vết.

---

## 1. Mục đích nhóm tài liệu

Nhóm tài liệu này mô tả cách nghiệp vụ kho thành phẩm vận hành từ đầu đến cuối. Đối tượng trung tâm là **thùng 60**. Tất cả biến động quan trọng phải được ghi nhận bằng command qua **Orchestrator**, cập nhật **current state**, ghi **event history**, ghi **audit log**, và ghi **inventory ledger** khi có ảnh hưởng đến tồn chính thức.

---

## 2. Các file trong nhóm

| File | Mục đích |
|---|---|
| `Process_Map.md` | Bản đồ quy trình end-to-end và các lưu đồ con chi tiết. |
| `BPMN_Process.md` | Mô tả BPMN nghiệp vụ theo lane, gateway, bước xử lý và ngoại lệ. |
| `Use_Case_Catalog.md` | Danh mục use case chi tiết cho các nghiệp vụ lõi. |
| `Activity_Diagrams.md` | Activity diagram Mermaid cho các use case quan trọng. |

---

## 3. Các nghiệp vụ đã bao phủ

- Nhận dữ liệu phiếu giao kho từ sản xuất.
- Chọn phiếu giao kho và dòng chi tiết.
- Quét nhập tạm thùng 60 theo đúng dòng phiếu.
- Thủ kho xác nhận nhập chính thức.
- Gán thùng 60 lên pallet để lưu kho, chờ đóng Pack360 hoặc chờ xuất.
- Đóng Pack360 theo rule truyền thống hoặc rule OEM/PO.
- Hàng OEM có thể đóng Pack360 khác mã hàng và số lượng tùy đơn/PO.
- Giải phóng Pack360, tách một/vài thùng 60, đóng lại Pack360 mới.
- Chuyển đơn OEM trong quá trình lưu kho.
- Chuyển stock type, khóa tồn `BLOCKED`, release tồn.
- Dư đơn OEM hoặc phát hiện vấn đề chất lượng trong kho dùng `stock_type = BLOCKED`.
- `TEMPORARY_ISSUE` chỉ dùng cho nghiệp vụ xuất tạm.
- Xuất lẻ từ thùng 60 bằng cách sinh bản ghi thùng 60 mới trong chính bảng thùng 60 hiện có.
- Thùng ảo có `is_virtual = 1`, `parent_id_60`, `root_id_60`.
- Thùng gốc sau khi bị lấy lẻ bị `BLOCKED` với reason `PARTIAL_REMAINING`.

---

## 4. Nguyên tắc thiết kế

1. UI và thiết bị scan không cập nhật trực tiếp vào bảng nghiệp vụ.
2. Mọi nghiệp vụ ghi nhận qua Orchestrator.
3. Thùng 60 có current state và event history.
4. Stock type tách khỏi status.
5. Ledger chỉ ghi khi tồn chính thức tăng, giảm hoặc tái phân loại.
6. Sai nghiệp vụ sau khi post xử lý bằng reversal, adjustment hoặc exception, không sửa tay im lặng.
7. Mọi thao tác nhạy cảm có audit.
