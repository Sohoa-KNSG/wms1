# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC04.2: Hủy Kết Quả Quét (Hủy Phiếu)

Tài liệu này là kịch bản kiểm thử (Test Plan) chi tiết cho Use Case 04.2, tập trung vào quy trình Hủy kết quả quét của các dòng phiếu khi có sai sót thực tế, thu hồi tiến độ dòng, và các ràng buộc không cho phép hủy khi phiếu đã được Xác nhận chính thức (đã hạch toán sổ cái).

---

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Thiết bị:** Máy tính Desktop (để xem thao tác Web UI rõ ràng) hoặc Tablet/Máy quét RF.
- **Tài khoản:** Đăng nhập bằng tài khoản Nhân viên Kho / Thủ Kho được cấp quyền.
- **Dữ liệu chuẩn bị:**
  - `D11`: Phiếu nhập chưa xác nhận chính thức, đang có các bản ghi scan trạng thái `VALID` (đã quét thùng vào tạm nhưng chưa hạch toán sổ cái).
  - `D10`: Phiếu nhập ĐÃ xác nhận thành công (đã sinh thùng `VIR`, đã hạch toán `inventory_ledger`).

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Luồng Chuẩn (Happy Path) & Audit Log

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC04.2-HP-01** | Hủy phiếu chưa xác nhận | Nhập lý do hủy và bấm xác nhận hủy trên phiếu D11. | Hệ thống cập nhật các bản ghi scan active sang trạng thái `CANCELLED` và cờ `IsDeleted = 1`. Tiến độ dòng trên giao diện lập tức lùi về đúng giá trị. |  |  |  |  |
| **UC04.2-HP-02** | Sinh vết Audit Log | Kiểm tra bảng `audit_log` trong CSDL sau khi thực hiện TC HP-01. | Bản ghi audit log phải chứa đầy đủ: Số phiếu, Lý do hủy, Người thao tác (User), Thời gian, IP/Device và Request ID. |  |  |  |  |

---

### 2.2. Kiểm thử Ràng buộc Logic (Fail-fast Validation)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC04.2-ERR-01** | Bỏ trống lý do hủy | Bấm Hủy nhưng không nhập hoặc gửi lý do rỗng qua API. | Bị từ chối (HTTP 400). Yêu cầu nhập lý do. Dữ liệu trong Database không thay đổi. |  |  |  |  |
| **UC04.2-ERR-02** | Khóa dữ liệu (Soft-lock) khi đã chốt Sổ cái | Cố tình Hủy phiếu D10 (Phiếu đã xác nhận nhập kho thành công). | API trả về lỗi Xung đột (Conflict). Không xóa các bản scan và tuyệt đối KHÔNG xóa các bản ghi hạch toán (ledger). |  |  |  |  |
| **UC04.2-ERR-03** | Phiếu không có scan hợp lệ | Hủy một phiếu rỗng chưa có bất kỳ ai quét thùng nào. | Bị từ chối. Trả về thông báo lỗi "Không có dữ liệu quét hợp lệ để hủy". Tránh việc sinh rác log "Hủy thành công" giả mạo. |  |  |  |  |
| **UC04.2-ERR-04** | Hủy trùng lặp (Idempotent) | Gửi lặp lại request Hủy đã thành công ở HP-01 (Spam click/API replay). | Không làm thay đổi dữ liệu lần nữa. Hệ thống có thể báo Xung đột hoặc xử lý Idempotent an toàn. |  |  |  |  |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Truy vết minh bạch:** Mọi giao dịch Hủy phiếu bắt buộc phải đi kèm Lý do và được lưu trữ vĩnh viễn trong `audit_log`.
2. **Khóa dữ liệu Kế toán:** Tuyệt đối không cho phép dùng tính năng Hủy Phiếu để xóa đi dữ liệu của các phiếu đã chốt (đã hạch toán vào Sổ cái Kép). Việc hủy phiếu chỉ có tác dụng thu hồi các bản ghi ở khâu **tiền xử lý (Tạm nhập)**.
3. **An toàn giao diện:** Tiến độ % trên UI phải lùi về khớp với số liệu quét sau khi trừ đi các thùng đã hủy.
