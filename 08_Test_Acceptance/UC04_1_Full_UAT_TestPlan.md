# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC04.1: Nhập Lẻ & Sinh Thùng Ảo

Tài liệu này là kịch bản kiểm thử (Test Plan) chi tiết cho Use Case 04.1, chuyên biệt về quy trình khai báo nhập hàng lẻ chưa đủ nguyên đai nguyên kiện (Thùng ảo - Virtual Box) trong hệ thống WMS.

---

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Thiết bị:** Máy tính Desktop (để xem thao tác Web UI rõ ràng) hoặc Tablet.
- **Tài khoản:** Đăng nhập bằng tài khoản Nhân viên Kho / Thủ Kho.
- **Dữ liệu chuẩn bị:**
  - `D08`: Dòng phiếu còn thiếu số lượng dư (Ví dụ: Yêu cầu 10 thùng, đã quét 9 thùng, thiếu phần lẻ tương đương 1 thùng). Đã có mapping với Đơn OEM.
  - `D09`: Phiếu có nhiều dòng hàng đều đang thiếu số lượng dư (cần nhập lẻ hàng loạt - Batch).

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Luồng Chuẩn (Happy Path)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC04.1-HP-01** | Nhập đúng phần thiếu | Bấm "Nhập lẻ" trên D08, nhập đúng con số còn thiếu và tên người giao. | Tạo một thùng ảo có mã `VIR-*`, `is_virtual = 1`, kế thừa đúng SKU/Đơn OEM/Khách hàng và có số lượng khớp với phần dư. |  |  |  |  |
| **UC04.1-HP-02** | Hạch toán Sổ cái | Truy vấn CSDL đối chiếu sau HP-01 | Phải có transaction `RECEIPT_PARTIAL` trong `stock_transaction_book`. Dữ liệu đổ đúng vào `inventory_ledger` (cấp thùng) và `item_ledger` (cấp SKU), kèm `thung60_event`. |  |  |  |  |
| **UC04.1-HP-03** | Cập nhật tiến độ | Kiểm tra thanh tiến độ trên UI của D08 | UI tải lại báo Tiến độ đạt 100%. Thùng ảo `VIR-*` không bị push ngược sang hệ thống Packaging. |  |  |  |  |

---

### 2.2. Kiểm duyệt Ràng buộc Logic (Fail-fast Validation)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC04.1-ERR-01** | Khai báo số lượng bằng 0 | Gửi request `looseQty = 0` | Bị từ chối. Báo lỗi "Số lượng lẻ phải lớn hơn 0". Không phát sinh dữ liệu. |  |  |  |  |
| **UC04.1-ERR-02** | Khai báo số lượng âm | Gửi request `looseQty = -5` | Bị từ chối. Báo lỗi "Số lượng lẻ phải lớn hơn 0". Không phát sinh dữ liệu. |  |  |  |  |
| **UC04.1-ERR-03** | Khai báo số thập phân | Gửi request `looseQty = 1.5` | Bị từ chối theo quy tắc số nguyên. Không phát sinh dữ liệu. |  |  |  |  |
| **UC04.1-ERR-04** | Nhập sai phần thiếu | Gửi số lượng nhỏ hơn hoặc lớn hơn phần dư thực tế của D08 | Bị từ chối. Lỗi "Số lượng khai báo không khớp số dư còn thiếu". Tiến độ giữ nguyên. |  |  |  |  |
| **UC04.1-ERR-05** | Mất nguồn gốc OEM | Xóa/khóa mapping Đơn OEM của dữ liệu test rồi bấm Nhập lẻ | Bị từ chối. Lỗi không tìm thấy nguồn gốc Đơn OEM. Không tạo thùng ảo rác. |  |  |  |  |

---

### 2.3. Kiểm thử Tải & Hàng loạt (Concurrency & Batch Processing)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC04.1-BAT-01** | Batch thành công | Chọn toàn bộ các dòng của D09 và bấm Nhập lẻ hàng loạt (nếu có tính năng) hoặc gọi API batch | Tất cả các dòng đều sinh thùng ảo thành công và thuộc cùng một SQL Transaction chung. |  |  |  |  |
| **UC04.1-BAT-02** | Batch lỗi giữa chừng | Làm cho dòng giữa của D09 bị lỗi (VD: Sai số lượng lẻ) rồi chạy Batch | Toàn bộ Batch bị Rollback. Không có bất kỳ dòng nào được ghi vào CSDL. |  |  |  |  |
| **UC04.1-CON-01** | Trùng mã thùng ảo | Gửi hai request HTTP nhập lẻ đồng thời (Race condition) cho cùng dòng D08 | Chỉ một request thành công tạo thùng `VIR-*`. Request kia bị chặn lại, không sinh trùng `id_60`. |  |  |  |  |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Kiểm soát Tồn kho Ảo:** Thùng `VIR-*` sinh ra bắt buộc phải có cờ `is_virtual = 1` và `unit_origin_type = 'RECEIPT_VIRTUAL'`.
2. **Hạch toán tách biệt:** Loại giao dịch Header trên sổ cái phải là `RECEIPT_PARTIAL` để phục vụ bóc tách báo cáo hàng lẻ.
3. **Rollback an toàn:** Tất cả các luồng lỗi (ERR, BAT-02, CON-01) phải đảm bảo không để lại dữ liệu rác trên `WMS_UC03_ScanLog` hay các sổ cái.
