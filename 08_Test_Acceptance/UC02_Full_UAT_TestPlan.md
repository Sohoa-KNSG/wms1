# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC02: Nhận Dữ Liệu Phiếu Giao Kho & Gán Đơn OEM

Tài liệu này là kịch bản kiểm thử (Test Plan) chi tiết cho Use Case 02, tập trung vào việc hiển thị danh sách phiếu từ ERP, gán mã đơn hàng OEM vào dòng phiếu, các ràng buộc tính toàn vẹn (Cross-check) và cơ chế Soft-Lock.

---

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Thiết bị:** Máy tính Desktop (để xem thao tác Web UI rõ ràng) hoặc Tablet.
- **Tài khoản:** Đăng nhập bằng tài khoản Nhân viên Kho / Thủ Kho (Có quyền truy cập danh sách Phiếu Giao Kho).
- **Dữ liệu chuẩn bị:**
  - 1 Phiếu nhập kho từ ERP (Đang ở trạng thái xử lý/chưa hoàn tất).
  - Có các mã Sản phẩm (SKU) trên phiếu tồn tại Đơn hàng OEM bên hệ thống ERP.
  - Có 1 dòng phiếu đã quét nhập ít nhất 1 thùng (`scannedQty > 0`) để test Soft-Lock.

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Giao diện & Hiển thị (UI/UX)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **UI-01** | **Hiển thị danh sách phiếu** | 1. Truy cập màn hình Phiếu Giao Kho. | Load thành công dữ liệu từ `vw_WMS_PhieuNhapKhoTP_Tong`. Hiển thị đúng số phiếu, đối tác. |  |  |  |  |
| **UI-02** | **Phân biệt trạng thái gán đơn** | 1. Xem chi tiết 1 phiếu có dòng chưa gán, dòng đã gán chưa quét, và dòng đã gán đã quét. | - Chưa gán: Nút Cam "Gán đơn".<br/>- Đã gán chưa quét: Badge Xanh + Icon Edit + Icon Hủy.<br/>- Đã quét: Badge Xanh, KHÔNG CÓ nút Edit/Hủy. |  |  |  |  |
| **UI-03** | **Sắp xếp Modal (CTE Sort)** | 1. Bấm Gán đơn cho 1 dòng SP (VD: `D.501`).<br/>2. Quan sát Modal danh sách Đơn OEM. | Các Đơn OEM có đúng mã `D.501` nằm trên cùng. Các mã có chứa từ khóa (VD: `D.501-5MM`) nếu có sẽ nằm bên dưới. |  |  |  |  |

---

### 2.2. Kiểm thử Luồng Chuẩn (Happy Path)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **HP-01** | **Gán đơn OEM lần đầu** | 1. Bấm Gán đơn ở 1 dòng phiếu mới.<br/>2. Chọn 1 Đơn OEM hợp lệ.<br/>3. Bấm Xác nhận. | Thông báo Thành công. Giao diện cập nhật hiển thị Đơn OEM. Dữ liệu ghi vào `WMS_PhieuNhap_DonHang_Map`. |  |  |  |  |
| **HP-02** | **Cập nhật / Đổi Đơn OEM** | 1. Bấm nút Edit ở dòng đã gán (nhưng chưa quét thùng).<br/>2. Chọn 1 Đơn OEM khác.<br/>3. Bấm Xác nhận. | Thông báo Thành công. Giao diện cập nhật sang mã mới. DB cập nhật UPSERT đè lên bản ghi map cũ. |  |  |  |  |
| **HP-03** | **Hủy gán đơn (Unmap)** | 1. Bấm nút Thùng rác đỏ ở dòng đã gán (chưa quét).<br/>2. Bấm Xác nhận Hộp thoại cảnh báo. | Giao diện quay về trạng thái Chưa gán (Nút cam). DB cập nhật cờ `IsDeleted = 1`. |  |  |  |  |

---

### 2.3. Kiểm thử Ràng buộc Logic (Fail-fast Validations)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **ERR-01** | **Ràng buộc toàn vẹn Mã SP** | 1. Dùng công cụ gọi API trực tiếp (Postman) / Bỏ qua UI.<br/>2. Truyền mã Đơn OEM không chứa Mã Sản Phẩm của dòng phiếu. | Backend SQL SP chặn lại: `ERR_UC02_PRODUCT_MISMATCH`. Trả về lỗi 400 Bad Request. |  |  |  |  |
| **ERR-02** | **Khóa cứng (Soft-Lock) khi sửa** | 1. Chọn 1 dòng đã quét thùng (`scannedQty > 0`).<br/>2. Cố tình gọi API sửa mã Đơn OEM (Dùng Postman). | API chặn (Không được sửa dòng đã phát sinh tồn kho vật lý). |  |  |  |  |
| **ERR-03** | **Khóa cứng khi hủy (Unmap)** | 1. Dòng phiếu `scannedQty > 0`.<br/>2. Gọi API Hủy mapping. | Chặn luồng Hủy. Báo lỗi không thể hủy dòng đang thực hiện. |  |  |  |  |
| **ERR-04** | **Ép kiểu an toàn (Safe Casting)** | 1. Gọi API `map-order` với payload `lineNo` là kiểu Số (Number) thay vì Chuỗi (String). | Backend C# tiếp nhận bình thường nhờ `object?`, không văng lỗi 400 Validation Problem. |  |  |  |  |

---

### 2.4. Kiểm thử Tương tác Dữ liệu & Sổ cái (Database Level)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) | Trạng thái (Pass/Fail) | Người Test | Ngày Test | Ghi chú (Bug ID) |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **DB-01** | **Cách ly dữ liệu ERP** | 1. Thực hiện các thao tác gán / sửa / hủy đơn OEM. | Kiểm tra bảng `WMS_PhieuNhap_DonHang_Map` có biến động ghi nhận. Tuyệt đối **KHÔNG** ghi ngược bất kỳ dữ liệu nào vào CSDL ERP (`sxtpt.dbo.*`). |  |  |  |  |
| **DB-02** | **Chưa tác động Tồn kho** | 1. Sau khi gán Đơn OEM xong, kiểm tra `stock_transaction_book` và `inventory_ledger`. | KHÔNG phát sinh bất kỳ bút toán hạch toán nào (Vì mới chỉ là bước tiền xử lý, chưa nhập kho vật lý). |  |  |  |  |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Toàn vẹn UI:** Người dùng không thể chọn sai mã đơn hàng nhờ tính năng lọc chính xác mã SKU trên Modal.
2. **Khóa dữ liệu:** Không có bất kỳ kẽ hở nào (kể cả dùng API trực tiếp) để đổi mã Đơn OEM của một dòng phiếu đã bắt đầu quét nhập (`scannedQty > 0`).
3. **API Stability:** Xử lý tốt các sai lệch kiểu dữ liệu đầu vào (String/Number) từ Client, không báo lỗi HTTP 400 crash ngầm.
