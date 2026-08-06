# BR01: Quy tắc Nghiệp vụ Nhập Kho (Receiving Rules)

Tài liệu này tập trung các quy tắc nghiệp vụ cốt lõi áp dụng cho toàn bộ luồng Nhập kho (Inbound), bao gồm việc tiếp nhận, kiểm đếm và ghi nhận dữ liệu vào hệ thống.

## 1. Nguyên tắc Sổ cái kép (Dual Ledger)
- **Bất biến vật lý:** Mọi giao dịch làm thay đổi số lượng tồn kho (nhập, xuất, điều chỉnh) đều phải được ghi nhận vào `inventory_ledger`.
- **Cấm xóa vật lý (Hard Delete):** Không được phép thực hiện thao tác `DELETE` trên bảng `inventory_ledger` hay `tbl_thung60_kho` khi đã xác nhận chính thức. Mọi sai sót phải được xử lý bằng các giao dịch Đảo ngược (Reversal).

## 2. Quản lý Thực thể "Thùng 60"
- "Thùng 60" là đơn vị lưu trữ (Storage Unit) trung tâm của hệ thống.
- **Tính duy nhất:** Mã vạch (QR code) của Thùng 60 là duy nhất.
- **Trạng thái hợp lệ:** Thùng 60 chỉ được phép quét nhập khi ở trạng thái `NEW` hoặc `IN_TRANSIT` từ Sản xuất. Không được phép quét nhập lại một thùng đang ở trạng thái `AVAILABLE` (sẵn sàng trong kho) hoặc `SHIPPED` (đã xuất).
- **Thùng ảo (Virtual Box):** Đối với hàng lẻ (không đủ quy cách nguyên thùng), hệ thống tự động sinh một mã Thùng 60 ảo (`is_virtual = 1`) để duy trì tính nhất quán của Sổ cái.

## 3. Xác thực nguồn gốc (Traceability)
- Mọi Thùng 60 nhập kho phải được ánh xạ với một lệnh sản xuất hoặc phiếu giao hàng (Handover) hợp lệ.
- Nếu quét mã vạch không tồn tại hoặc chưa được đồng bộ từ hệ thống Sản xuất (ERP), hệ thống phải từ chối (Throw Error 50002) chứ không được tự động sinh dữ liệu ảo (Mock Data).

## 4. Quản lý Phiên (Session Management)
- Quá trình quét mã vạch trên máy PDA được gom thành một "Phiên nhập tạm" (`receipt_session_no`).
- Tồn kho chỉ chính thức tăng (cập nhật Sổ cái) khi và chỉ khi Thủ kho thực hiện thao tác **Xác nhận chính thức** (Official Confirm) toàn bộ phiên.

## 5. Kiểm soát Nhập dư (Over-receipt Control) & Chuyển dư đơn
- Khi quét nhập kho, hệ thống phải đối chiếu số lượng đang nhập cộng dồn vào định mức của Đơn hàng OEM tương ứng.
- Nếu số lượng vượt quá tổng `SL đơn hàng` (Over-receipt), hệ thống không chặn cứng mà sẽ hiển thị **Cảnh báo (Warning)** trên màn hình PDA/Desktop: *"Số lượng nhập đã vượt định mức của đơn hàng. Vui lòng điều chuyển số dư sang đơn hàng khác"*.
- **Chuyển dư đơn:** Cho phép Thủ kho gán trực tiếp phần số lượng dôi dư của Thùng 60 đó sang một mã Đơn hàng (Order No) khác đang trong trạng thái `PROCESSING` có cùng Mã sản phẩm (SKU) để tránh tình trạng đơn thì dư, đơn thì thiếu.
