# Bản đồ Quy trình (Process Map)

Tài liệu này mô tả tổng quan các quy trình cốt lõi của hệ thống WMS, dựa trên kiến trúc "Sổ cái kép" (Dual Ledger) và thực thể trung tâm là Thùng 60.

## 1. Luồng Nhập Kho Thành Phẩm (Inbound Core Flow)

Luồng Nhập kho là quy trình khép kín từ lúc nhận dữ liệu từ xưởng sản xuất cho đến khi đóng gói thành kiện lớn (Master Carton).

1. **Tiếp nhận & Tiền xử lý Dữ liệu (UC02 - Receive Data)**
   - Dữ liệu phiếu giao kho được đồng bộ từ hệ thống Sản xuất (ERP).
   - Nhân viên tiến hành gán mã Đơn hàng OEM cho sản phẩm (Mapping). Dữ liệu WMS được thiết kế tách biệt (decoupled) với ERP gốc.
   
2. **Quét nhập tạm Thùng 60 (UC03 - Scan Inbound)**
   - Sử dụng thiết bị PDA để quét mã QR thực tế dán trên Thùng 60.
   - Cơ chế Fail-fast: Hệ thống kiểm tra ngay lập tức tính hợp lệ của mã QR (đúng phiếu, đúng trạng thái, đúng số lượng). Quét thành công, thùng chuyển sang trạng thái tạm.

3. **Nhập hàng lẻ / Sinh Thùng Ảo (UC04.1 - Partial Receipt)**
   - Hỗ trợ xử lý hàng không nguyên đai nguyên kiện.
   - Hệ thống tự động sinh mã "Thùng 60 Ảo" (tiền tố `VIR-`) để khớp với định mức số lượng, đảm bảo tính nhất quán trên Sổ cái.

4. **Xác nhận Nhập kho & Ghi Sổ cái (UC04 - Pending Handover)**
   - Bước chốt chặn cuối cùng thực hiện trên Desktop UI bởi Thủ kho.
   - Yêu cầu: Tổng số lượng quét hợp lệ phải khớp 100% với số lượng kế hoạch.
   - Hệ thống tiến hành ghi Sổ cái kép (Transaction Book, Inventory Ledger, Item Ledger) và chuyển hàng sang trạng thái `AVAILABLE`.

5. **Đóng gói Kiện lớn (UC05 - Master Carton)**
   - Gom các Thùng 60 thành kiện lớn (Thùng 360 / Pallet).
   - Tích hợp cân điện tử (IoT) để lấy trọng lượng.
   - Máy in TSPL tự động in tem QR mới cho kiện hàng.
   - Hỗ trợ chế độ đóng gói Truyền thống và OEM Repack.
