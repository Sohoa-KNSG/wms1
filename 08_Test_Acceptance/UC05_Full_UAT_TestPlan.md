# Kịch Bản Kiểm Thử Chấp Nhận (UAT Test Plan) - UC05 Đóng Gói Kiện 360

Tài liệu này định nghĩa các kịch bản kiểm thử (Test Cases) từ cơ bản (Happy Path) đến các trường hợp ngoại lệ (Edge Cases) nhằm đảm bảo chức năng Đóng gói Kiện 360 (Pack360) hoạt động ổn định, chính xác và tuân thủ chặt chẽ nghiệp vụ.

---

## 1. Yêu cầu môi trường & Thiết bị (Prerequisites)
1. **Phần cứng:**
   - 01 Đầu đọc mã vạch (Barcode Scanner) cắm qua USB.
   - 01 Cân điện tử có cổng Serial RS232 (hoặc bộ giả lập tín hiệu cân).
   - 01 Máy in tem nhãn Xprinter/Zebra hỗ trợ lệnh TSPL kết nối mạng/USB.
2. **Phần mềm:**
   - WMS Frontend chạy trên trình duyệt web.
   - `wms-edge-bridge` (Device Agent) đang chạy ngầm trên máy tính/Raspberry Pi (Cổng 8080).
3. **Dữ liệu chuẩn bị (Test Data):**
   - Ít nhất 5 mã Thùng 60 (trạng thái `AVAILABLE`, `UNRESTRICTED`, cùng SKU).
   - Ít nhất 2 mã Thùng 60 (khác SKU với nhóm trên).
   - Ít nhất 2 mã Thùng 60 (cùng SKU nhưng thuộc 2 đơn OEM khác nhau).

---

## 2. Kịch bản kiểm thử cốt lõi (Core Test Scenarios)

### Nhóm 1: Kiểm thử luồng Đóng gói Cơ bản (Happy Path)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) |
| :--- | :--- | :--- | :--- |
| **TC05-01** | Quét & Chốt kiện Standard (Chuẩn) thành công | 1. Chọn chế độ **Standard**.<br/>2. Quét mã QR thùng thứ nhất (SKU A).<br/>3. Quét mã QR thùng thứ hai (SKU A).<br/>4. Kiểm tra Cân IoT báo `STABLE` (VD: 15.2 Kg).<br/>5. Bấm `[ 📦 Cân IoT & Chốt Kiện 360 ]`. | - Danh sách thùng cập nhật ngay lập tức sau mỗi lần quét.<br/>- Toast báo Xanh "Chốt kiện thành công".<br/>- DB: Sinh mã `pack360_qr` mới, cập nhật `tbl_thung60_kho`, hạch toán `stock_transaction_book`.<br/>- Máy in in ra 2 tem (Master & Detail). |
| **TC05-02** | Xóa thùng khỏi danh sách Draft | 1. Quét 2 mã QR hợp lệ.<br/>2. Bấm nút Xóa (Thùng rác) ở dòng thùng thứ 2.<br/>3. Bấm chốt kiện. | - Thùng thứ 2 biến mất khỏi danh sách màn hình.<br/>- Kiện 360 sinh ra chỉ chứa 1 thùng. |

---

### Nhóm 2: Kiểm duyệt Nghiệp vụ Quét Mã (Fail-fast Validation)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) |
| :--- | :--- | :--- | :--- |
| **TC05-03** | Chặn quét thùng Khác Mã SKU | 1. Chọn chế độ Standard.<br/>2. Quét thùng 1 (SKU **A**).<br/>3. Quét thùng 2 (SKU **B**). | - Hệ thống cảnh báo Đỏ: "Thùng 60 không cùng mã sản phẩm (SKU) với kiện hiện tại".<br/>- Không thêm thùng 2 vào danh sách. |
| **TC05-04** | Chặn quét thùng Khác Đơn OEM | 1. Chọn chế độ **OEM**.<br/>2. Quét thùng 1 (SKU A, Đơn **OEM1**).<br/>3. Quét thùng 2 (SKU A, Đơn **OEM2**). | - Cảnh báo Đỏ: "Thùng không thuộc cùng đơn OEM".<br/>- Không thêm thùng 2 vào danh sách. |
| **TC05-05** | Chặn quét thùng trùng lặp | 1. Quét thùng 1 (SKU A).<br/>2. Quét **LẠI** thùng 1. | - Cảnh báo Đỏ: "Thùng đã tồn tại trong danh sách kiện này". |
| **TC05-06** | Chặn quét thùng đã nằm trong kiện khác | 1. Quét thùng 1 (SKU A) đã có `current_pack360_id` ở kiện khác. | - Cảnh báo Đỏ: "Thùng 60 đã nằm trong kiện khác". |
| **TC05-07** | Chặn quét thùng sai Trạng Thái | 1. Quét thùng 1 đang bị khóa (`status = 'LOCKED'`). | - Cảnh báo Đỏ: "Thùng 60 không ở trạng thái AVAILABLE". |

---

### Nhóm 3: Kiểm thử Tích hợp Phần cứng (Hardware Integration)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) |
| :--- | :--- | :--- | :--- |
| **TC05-08** | Cân IoT dao động (STALE) | 1. Tác động nhẹ lên bàn cân liên tục (hoặc gửi dữ liệu giả dao động liên tục).<br/>2. Quan sát giao diện. | - Cột cân IoT chớp cảnh báo Cam "Cân chưa ổn định".<br/>- Nút chốt kiện báo cần chờ cân ổn định. |
| **TC05-09** | Cân IoT mất kết nối (OFFLINE) & Nhập tay | 1. Rút cáp kết nối cân / tắt service `wms-edge-bridge`.<br/>2. Quét 1 thùng 60 hợp lệ.<br/>3. Chọn "Nhập tay (Manual)".<br/>4. Nhập 15.5 Kg, lý do: "Đứt cáp cân".<br/>5. Bấm Chốt Kiện. | - Chốt kiện thành công.<br/>- DB: Ghi nhận trọng lượng 15.5 Kg. |
| **TC05-10** | Quên nhập lý do khi nhập tay | 1. Cân OFFLINE.<br/>2. Nhập tay số Kg nhưng để trống ô Lý do.<br/>3. Bấm Chốt Kiện. | - Cảnh báo Đỏ: "Bắt buộc nhập lý do khi dùng cân thủ công".<br/>- Chặn luồng chốt kiện. |

---

### Nhóm 4: Kiểm thử Sự cố Ngoại vi (Printer & Edge Cases)

| Mã TC | Tên Kịch Bản | Các bước thực hiện (Steps) | Kết quả kỳ vọng (Expected) |
| :--- | :--- | :--- | :--- |
| **TC05-11** | Máy in kẹt giấy / Hỏng kết nối | 1. Rút điện máy in nhiệt (hoặc đổi IP sai).<br/>2. Quét thùng và bấm Chốt Kiện.<br/>3. Đợi tiến trình hoàn tất. | - Kiện vẫn chốt **thành công** trên DB WMS.<br/>- Modal cảnh báo xuất hiện: "Lỗi máy in" kèm nút `[ 🖨️ In Lại Mã Vạch ]`. |
| **TC05-12** | In lại mã vạch (Reprint) | 1. Tiếp tục từ TC05-11.<br/>2. Cắm lại điện máy in, đảm bảo máy in Ready.<br/>3. Bấm nút `[ 🖨️ In Lại Mã Vạch ]` trên Modal. | - Gửi lệnh in thành công, máy in nhả 2 tem.<br/>- Không sinh lỗi hay sinh kiện mới trên DB. |
| **TC05-13** | Load Test / Nhanh tay | 1. Dùng Tool hoặc súng quét chế độ liên tục quét 50 thùng/giây. | - Hệ thống tự động Debounce hoặc xử lý tuần tự.<br/>- Không bị lỗi Crash Frontend hoặc Race Condition trên SQL (Nhờ `UPDLOCK`). |

---

## 3. Tiêu chí Nghiệm thu (Sign-off Criteria)
1. **Pass Rate:** 100% các Test Case thuộc Nhóm 1 và Nhóm 2 phải PASS.
2. **Performance:** Độ trễ từ khi bấm Chốt Kiện đến khi Máy in bắt đầu chạy < 2 giây.
3. **Dual Ledger:** Kiểm tra ngẫu nhiên 3 kiện trong DB, phải đảm bảo có Header tại `stock_transaction_book` và cập nhật đúng `current_pack360_id` tại `tbl_thung60_kho`.
