# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC06: Lập Pallet (Palletizing)

Tài liệu này cung cấp các kịch bản kiểm thử (Test Plan) chi tiết cho Use Case 06, tập trung vào tính năng gom hàng (Thùng 60 lẻ hoặc Pack360) lên Pallet đích, bắt các lỗi trạng thái sai quy định và kiểm tra việc ghi vết Audit Log.

---

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Thiết bị:** Máy quét mã vạch HHT (Zebra/Honeywell) hoặc Tablet/Laptop để thao tác UI web.
- **Tài khoản:** Đăng nhập bằng tài khoản Nhân viên Kho / Thủ Kho.
- **Dữ liệu chuẩn bị:**
  - `P-EMPTY`: Mã 1 Pallet trống rỗng chưa có hàng (`status = CREATED`).
  - `P-ACTIVE`: Mã 1 Pallet đang có sẵn vài thùng hàng (`status = ACTIVE`).
  - `P-LOCKED`: Mã 1 Pallet đang ở trạng thái không được phép nhận thêm hàng (`SHIPPED` hoặc `SCRAPPED`).
  - `U-VALID`: Mã Thùng 60 và Pack360 hợp lệ (`status` không bị khóa, Pack360 phải ở trạng thái `COMPLETED`).
  - `U-INVALID`: Mã Thùng 60 bị xuất kho (`SHIPPED`) hoặc Thùng đang nằm trên 1 Pallet khác.

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Giao diện & Trải nghiệm (UI/UX)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC06-UI-01** | Ngăn chặn quét trùng mã hàng | Đang ở Bước 1, quét liên tiếp 2 lần cùng một mã Thùng `U-VALID`. | UI cảnh báo "Mã hàng đã được quét" và không thêm trùng lặp vào mảng danh sách tạm. |  |  |  |  |
| **UC06-UI-02** | Xóa kiện hàng khỏi danh sách tạm | Quét 3 mã hàng hợp lệ, sau đó bấm nút "Xóa/Remove" tại 1 mã hàng. | Mã đó biến mất khỏi danh sách trên màn hình HHT, tổng số lượng kiện hàng cập nhật giảm đi 1. |  |  |  |  |
| **UC06-UI-03** | Khóa bước nếu danh sách trống | Không quét hàng hóa nào, bấm nút "Tiếp tục" sang Bước 2 (Quét Pallet). | Bị UI chặn lại, yêu cầu quét ít nhất 1 kiện hàng trước khi chuyển bước. |  |  |  |  |

---

### 2.2. Kiểm thử Luồng Chuẩn (Happy Path)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC06-HP-01** | Lập Pallet mới hoàn toàn | 1. Quét danh sách Thùng/Pack `U-VALID`.<br/>2. Quét Pallet `P-EMPTY`.<br/>3. Bấm Xác nhận. | Thông báo Thành công. Pallet `P-EMPTY` chuyển thành `ACTIVE`. Các kiện hàng chuyển `status = PALLETIZED`. |  |  |  |  |
| **UC06-HP-02** | Bổ sung hàng vào Pallet đang dùng | 1. Quét thêm vài Thùng `U-VALID`.<br/>2. Quét Pallet `P-ACTIVE`.<br/>3. Bấm Xác nhận. | Thông báo Thành công. Pallet `P-ACTIVE` giữ nguyên trạng thái. Kiện hàng mới được gán thêm ID của Pallet này. |  |  |  |  |
| **UC06-HP-03** | Kiểm tra ghi vết Sự kiện | Truy vấn Database bảng `thung60_event` và `audit_log` sau khi chạy HP-01. | Có sinh ra event `PALLETIZED` cho từng thùng hàng và log `COMPLETE_PALLET` cho mã Pallet. |  |  |  |  |

---

### 2.3. Kiểm duyệt Ràng buộc Logic (Fail-fast Validation)

| Mã TC | Kịch bản | Bước thực hiện | Kết quả mong đợi | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UC06-ERR-01** | Pallet đích không hợp lệ | Quét danh sách hàng hợp lệ, nhưng gán vào Pallet `P-LOCKED` (Đã xuất/Scrap). | API báo lỗi "Pallet không ở trạng thái khả dụng". Rollback không lưu kiện hàng nào. |  |  |  |  |
| **UC06-ERR-02** | Thùng hàng sai trạng thái | Quét danh sách chứa 1 mã `U-INVALID` (VD: Đã xuất kho). | Giao dịch bị Rollback toàn bộ (Kể cả các thùng hợp lệ quét chung lần đó cũng không được lưu). Thông báo lỗi rõ ràng. |  |  |  |  |
| **UC06-ERR-03** | Thùng đang nằm trên Pallet khác | Quét 1 mã Thùng đang có `current_pallet_id` khác rỗng. | API chặn lại: "Thùng đang thuộc Pallet khác. Hãy tháo dỡ trước". |  |  |  |  |
| **UC06-ERR-04** | Pack360 chưa hoàn tất đóng gói | Quét 1 mã Pack360 đang ở trạng thái đóng dở (`status != COMPLETED`). | API chặn lại: "Pack360 phải hoàn tất mới được đưa lên Pallet". |  |  |  |  |
| **UC06-ERR-05** | Truy vấn độc lập Sổ cái | Quét kiểm tra các bảng `stock_transaction_book` sau khi báo lỗi/thành công. | Tuyệt đối KHÔNG sinh giao dịch Sổ cái Kép (Dual Ledger) cho nghiệp vụ lập Pallet. |  |  |  |  |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Toàn vẹn Dữ liệu (Atomic Transaction):** Nếu người dùng quét 50 thùng lên Pallet, nhưng chỉ có 1 thùng bị sai trạng thái (VD: bị khóa), thì hệ thống phải chặn và **Rollback toàn bộ 50 thùng** đó, không được phép lưu nửa chừng.
2. **Ngăn chặn luồng chồng chéo:** Một thùng vật lý không thể tồn tại đồng thời trên 2 Pallet khác nhau (Cờ `is_current = 1` trong bảng `pallet_unit` chỉ được phép trỏ tới 1 Pallet duy nhất).
3. **Hiển thị Rõ Ràng:** Màn hình HHT cần phải phát cảnh báo bằng âm thanh/popup lớn khi gặp lỗi để người dùng kho đang tập trung quét hàng không bị bỏ sót.
