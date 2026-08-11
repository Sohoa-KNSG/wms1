# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC18: Temporary Dispatch

Tài liệu này cung cấp các kịch bản kiểm thử (Test Plan) chi tiết cho UC18, tập trung vào kiểm thử giao diện, luồng nghiệp vụ chuẩn (Happy Path) và các ràng buộc dữ liệu (Fail-fast Validation).

---

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Môi trường:** Frontend UI (Web/Tablet/HHT) kết nối Backend (ASP.NET Core C#) và CSDL SQL Server.
- **Tài khoản:** Đăng nhập bằng tài khoản có quyền truy cập chức năng này (VD: Nhân viên Kho, Quản lý).
- **Dữ liệu chuẩn bị:**
  - Cần chuẩn bị trước các dữ liệu master data (Sản phẩm, Khách hàng, Kệ kho) tương ứng với yêu cầu của Use Case.
  - Các dữ liệu trạng thái hợp lệ (`VALID`) và không hợp lệ (`INVALID`) để test Ràng buộc Logic.

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Giao diện & Trải nghiệm (UI/UX)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC18-UI-01** | Kiểm tra hiển thị màn hình | Truy cập vào màn hình chức năng Temporary Dispatch. | Màn hình load đầy đủ các thành phần (Nút bấm, form nhập liệu, bảng dữ liệu). |  |  |  |  |
| **UC18-UI-02** | Validate Input (Dữ liệu rỗng) | Để trống các trường bắt buộc và nhấn Submit. | Hiển thị thông báo lỗi màu đỏ yêu cầu nhập đầy đủ thông tin. |  |  |  |  |
| **UC18-UI-03** | Khóa thao tác (Double Submit) | Nhấn liên tục nhiều lần vào nút Xử lý/Lưu. | Hệ thống disable nút sau lần nhấn đầu tiên, chỉ gửi 1 request duy nhất. |  |  |  |  |

---

### 2.2. Kiểm thử Luồng Chuẩn (Happy Path)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC18-HP-01** | Thực thi luồng thành công | 1. Nhập/Quét dữ liệu hợp lệ hoàn toàn.<br/>2. Bấm Xác nhận/Lưu. | Hệ thống báo Thành công. Giao diện cập nhật trạng thái tương ứng. |  |  |  |  |
| **UC18-HP-02** | Cập nhật CSDL | Truy vấn Database sau khi chạy HP-01. | Dữ liệu được Insert/Update đúng vào các bảng lõi theo như thiết kế. |  |  |  |  |
| **UC18-HP-03** | Kiểm tra ghi vết (Audit Log) | Kiểm tra bảng `audit_log` hoặc bảng `event` tương ứng. | Có sinh ra log ghi lại hành động của người dùng và thời gian thực thi. |  |  |  |  |

---

### 2.3. Kiểm duyệt Ràng buộc Logic (Fail-fast Validation & Sổ cái)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC18-ERR-01** | Xử lý dữ liệu không hợp lệ | Nhập/Quét một mã dữ liệu đang ở trạng thái bị khóa (Locked/Shipped). | API trả về lỗi Bad Request. Rollback Transaction. Hiển thị popup lỗi rõ ràng. |  |  |  |  |
| **UC18-ERR-02** | Kiểm tra đồng thời (Concurrency) | Dùng 2 session cố gắng thực thi cùng 1 thao tác trên 1 đối tượng. | Session thứ 2 bị chặn bởi `UPDLOCK` hoặc báo lỗi "Dữ liệu đã bị thay đổi". |  |  |  |  |
| **UC18-ERR-03** | Đối chiếu Sổ cái Kép | Tra cứu `stock_transaction_book` sau khi thao tác. | Nếu nghiệp vụ làm thay đổi Tồn kho, phải có 1 dòng IN và 1 dòng OUT cân bằng. Nếu không thay đổi tồn kho, không có dữ liệu rác được sinh ra. |  |  |  |  |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Toàn vẹn Giao dịch (ACID):** Đảm bảo mọi thao tác lưu/xóa/sửa đều được bọc trong Transaction. Nếu có 1 phần dữ liệu lỗi, Rollback toàn bộ.
2. **Tuân thủ Sổ cái Kép:** Bất kỳ sự dịch chuyển tài sản nào (vị trí, loại kho, quyền sở hữu) đều phải được hạch toán đầy đủ vào `stock_transaction_book`.
3. **UI/UX đồng bộ:** Cảnh báo lỗi phải đủ lớn (kèm âm thanh nếu trên máy HHT) để người dùng kho nhận diện ngay lập tức.
