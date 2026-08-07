# Tổng Kết Hoàn Thiện UC05: Tích hợp Edge Bridge Raspberry Pi 4

Dưới đây là bản tổng kết các hạng mục đã hoàn thành trong đợt refactoring diện rộng cho hệ thống Đóng Gói Pack360 kết hợp với phần cứng IoT (Cân điện tử & Máy in).

## 🚀 1. Raspberry Pi Edge Bridge (`wms-edge-bridge`)
Một máy chủ Node.js cục bộ (Local Daemon) đã được thiết lập để chạy ngầm trên Raspberry Pi 4.
- **REST APIs Mới:**
  - `GET /api/scale/current`: Đọc trọng lượng từ cân qua `serialport`, trả về số Kg và cờ báo hiệu cân đã ổn định (`isStable=true`). Tự động Auto-reconnect nếu cáp USB bị lỏng.
  - `POST /api/print`: Nhận dữ liệu nhãn in TSPL.
- **Idempotent Printing:** Máy in kết nối qua Raw Socket (Port 9100). Bridge sẽ lưu vết `jobId` vào file `jobs.json` để chặn in trùng lặp nếu máy trạm gửi lệnh 2 lần, đồng thời duy trì được bộ nhớ kể cả khi Pi bị sập nguồn khởi động lại.
- **Security:** Mọi endpoint (trừ `/health`) đều yêu cầu phải có `X-Device-Agent-Token` trùng khớp với Secret trên Pi.

## 💻 2. Nâng Cấp Giao Diện React (`Pack360Screen.jsx`)
Giao diện người dùng đã được hiện đại hóa để trực quan hóa trạng thái thiết bị ngoại vi:
- **Hiển thị Trạng Thái Cân IoT:** UI sẽ báo cho nhân viên biết cân đang `CONNECTED` (Đã kết nối), `STABLE` (Đã ổn định số), hay `UNSTABLE` (Số đang nhảy/Vật chưa nằm yên).
- **Chặn Lỗi Chốt Sớm:** Nút "Chốt Kiện tự động" chỉ có thể được bấm khi cân đạt chuẩn `isStable`.
- **Nhập Tay & Audit (Manual Weight):** Nếu cân bị hỏng, nhân viên có thể gõ tay số Kg. Hệ thống tự gán cờ `weight_source = 'MANUAL'` và bắt buộc nhân viên điền lý do nhập tay.
- **In Lại (Reprint Flow):** Cập nhật quy trình "Chốt Thành Công nhưng In Lỗi". Lúc này, kiện đã hoàn thành nhưng màn hình sẽ không Reset mà hiển thị cảnh báo đỏ và nút "In Lại". Việc ấn "In Lại" gọi đúng luồng Reprint API để sinh Audit thay vì chốt lại kiện.

## ⚙️ 3. Backend C# & Cơ Sở Dữ Liệu
Mã nguồn C# và SQL Server đã được thay đổi sâu để phục vụ tính năng Audit & Reprint.
- **Transaction & Audit Reprints:** 
  - Bổ sung trường `weight_source` và `print_job_id` vào `pack360_header`. 
  - Xây dựng bảng mới `pack360_reprint_audit` và SP `usp_Pack360_Reprint_Audit`. Bất kỳ yêu cầu in lại nào cũng sẽ bị ghi log (User nào in, lý do gì, vào lúc mấy giờ).
- **TSPL Engine:** Không còn code TSPL hard-code dưới Frontend! Dữ liệu nhãn (`pack360_qr`, danh sách mã thùng 60, v.v...) nay được C# generate động, Escape toàn bộ dấu ngoặc kép để chống Injection, rồi đẩy xuống cho UI bắn qua Pi.
- **Phân Quyền:** Gán chặt chẽ các Policy `Pack360.Scan`, `Pack360.Complete` vào từng endpoint C# tương ứng.

## ✅ Tiêu Chí Vượt Qua (Acceptance Criteria Met)
- [x] Không lưu mật khẩu/Token/JWT Secret trong Git Repository.
- [x] Bridge bảo mật qua CORS và Device Token.
- [x] Reprint có lưu nhật ký Audit và sinh Job ID mới.
- [x] Mọi Unit Test Backend và Linting Frontend đều xanh (Passed).

## 🛠️ 4. Sửa Lỗi Nghiệp Vụ Chốt Kiện (Fix Dual Ledger & TSPL)
Tiếp nhận phản hồi từ quá trình test UAT của QA, hệ thống đã được cập nhật thêm các bản vá quan trọng:
- **Chuẩn Hóa Mã QR:** Sửa Stored Procedure `usp_Pack360_Complete` để sinh mã QR theo đúng định dạng tài liệu UC05: `{Kênh}-{Mã_SP}-{DDMMYYYY}-{Sequence}` (Sử dụng dấu gạch ngang và format ngày `DDMMYYYY` thay vì gạch chéo).
- **Hạch Toán Sổ Cái Kép (Dual Ledger):** Bổ sung luồng ghi nhận tự động giao dịch loại `PACK360_CREATE` vào bảng `stock_transaction_book` ngay khi chốt kiện thành công, đảm bảo số liệu kế toán kho khớp hoàn toàn với dữ liệu vật lý.
- **Sửa Code TSPL:** Backend C# đã được fix lệnh in nhãn TSPL (sử dụng lệnh `QRCODE` chuyên dụng của máy in thay vì in chuỗi dạng `TEXT`). Đảm bảo khi lệnh gửi xuống máy in, máy sẽ xuất ra mã ma trận QR thực tế để máy quét cầm tay có thể đọc được dễ dàng.

> [!TIP]
> **Bước Tiếp Theo:** Toàn bộ code đã nằm trên nhánh `agent/uc05-raspberry-pi-bridge`. Bạn có thể triển khai thử nghiệm thực tế (UAT) trên xưởng ngay lúc này!
