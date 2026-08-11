- **Thời gian**: 2026-08-11
- **Tên Task/Milestone**: Tích hợp Báo Cáo Thông Minh (UC22) & Fix API UC06
- **Nội dung thay đổi**:
  - API C#: Khắc phục lỗi Dapper Serialization cho `QueryFirstOrDefaultAsync<dynamic>`, ép kiểu về `IDictionary<string, object>` để trả về JSON chuẩn, áp dụng vào `ReportsController` và `PalletController`.
  - Backend: Chuyển đổi mã nguồn báo cáo Smart Analytics (UC22) chạy ASP.NET.
  - Kiểm thử: Viết script SQL thực thi Unit Test luồng UC06.1 (Remove Unit) với các điều kiện ràng buộc.
  - Tài liệu: Bổ sung màn hình báo cáo Smart Analytics vào bảng danh mục `Screen_Catalog.md` và thêm quy chuẩn hiển thị bảng màu vào `UI_Rules.md`.

- **Thời gian**: 2026-08-11
- **Tên Task/Milestone**: Hoàn tất chuyển đổi kiến trúc sang ASP.NET
- **Nội dung thay đổi**:
  - Xóa bỏ toàn bộ thư mục `backend/` (chứa mã nguồn Node.js cũ) do hệ thống thực tế đã chạy 100% trên ASP.NET.
  - Cập nhật cấu hình `frontend/vite.config.js` thêm ghi chú rõ ràng về việc proxy `/api` sang Kestrel ASP.NET (`127.0.0.1:5000`).
  - Lưu lại kế hoạch dọn dẹp tại `docs/history/Phase_Backend_Cleanup_implementation_plan.md`.

- **Thời gian**: 2026-08-10
- **Tên Task/Milestone**: Fix Bug UC04 (Double-Confirm)
- **Nội dung thay đổi**:
  - Bổ sung cột `TrangThaiPhieu` vào bảng nội bộ WMS `WMS_PhieuNhap_DonHang_Map` thông qua `ALTER TABLE`.
  - Cập nhật Stored Procedure `usp_WMS_UC04_ConfirmNhapKho` để set `TrangThaiPhieu = N'COMPLETED'` thay vì `IsDeleted = 0`.
  - Cập nhật View `vw_WMS_UC04_PhieuChoXacNhan` để lọc bỏ các phiếu giao kho đã xác nhận (`TrangThaiPhieu = N'COMPLETED'`), giúp ẩn phiếu khỏi danh sách chờ trên Frontend ngay lập tức mà không tác động tới bảng `sxtpt.dbo.MF_InTran` của ERP.
  - Sao lưu `implementation_plan.md` và `walkthrough.md` vào thư mục `docs/history/`.

- **Thời gian**: 2026-08-10
- **Tên Task/Milestone**: Cập nhật cấu hình Device Agent và Bridge CORS cho UC05
- **Nội dung thay đổi**:
  - Xác minh Frontend sử dụng `localhost:8080` làm mặc định và không hardcode IP.
  - Bổ sung URL Web (`http://10.17.16.164:5173`) vào biến `CORS_ALLOWED_ORIGINS` của `wms-edge-bridge` (`config.js` và `.env.example`).
  - Đảm bảo ứng dụng UC05 có thể gọi Bridge trực tiếp từ Chromium chạy trên Raspberry Pi.
# Changelog

- **Thời gian**: 2026-08-10
- **Tên Task/Milestone**: Fix Bug UC03 (Lỗi Hủy Quét Thùng - TC_UC03_09)
- **Nội dung thay đổi**:
  - Fix SP `usp_WMS_UC03_ScanThung60`: Trả về `SCOPE_IDENTITY() AS ScanLogID` sau khi Insert để Frontend có ID thực phục vụ Hủy quét.
  - Cập nhật UI `ScanScreen.jsx`: Dùng `window.prompt` hiển thị Modal yêu cầu người dùng nhập lý do khi bấm Hủy Quét.
  - Sửa lỗi Frontend không call API Hủy Quét và không trừ số lượng tích lũy do thiếu `scanLogId`.

---

- **Thời gian**: 2026-08-07
- **Tên Task/Milestone**: Đồng bộ UC05 Web App/API với WMS Edge Bridge đã cài trên Raspberry Pi
- **Nội dung thay đổi**:
  - Đồng bộ mã nguồn `raspberry-pi/wms-edge-bridge` với đúng bản 1.0.0 đang vận hành; giữ API `/health`, `/scale/weight`, `/printer/status` và `/printer/print` trên cổng 8080.
  - Chuẩn hóa hợp đồng in: API trả đồng thời `label_data`/`label_tspl`, `pack360_id`, `print_job_id`; frontend chuyển nguyên `print_job_id` và trường TSPL `data` tới bridge.
  - Chuẩn hóa Device Agent URL/token qua biến môi trường hoặc localStorage, có tương thích khóa token cũ.
  - Bổ sung kiểm tra nguồn cân và lý do nhập cân thủ công cho Pack360/Repack.
  - Sửa migration và stored procedure UC05 để lưu metadata cân/in nhưng vẫn giữ `pack360_event`, Dual Ledger và cập nhật trạng thái thùng 60 trong cùng transaction.
  - Đồng bộ permission `Pack360.Scan`/`Pack360.Reprint` giữa frontend, API và security schema.
  - Bổ sung test hợp đồng bridge; kết quả: 11 unit test .NET, 2 integration test, 8 frontend test và 15 edge bridge test đều đạt.

---

Lịch sử thay đổi và cập nhật của dự án WMS.

---

- **Thời gian**: 2026-08-07
- **Tên Task/Milestone**: Fix UAT Bugs cho UC05 (Mã QR, Sổ cái, Giao diện)
- **Nội dung thay đổi**:
  - SQL: Cập nhật định dạng mã QR kiện 360 trong `usp_Pack360_Complete` thành `{Kênh}-{Mã_SP}-{DDMMYYYY}-{Sequence}`.
  - SQL: Bổ sung logic ghi nhận vào Sổ cái kép (`stock_transaction_book` loại `PACK360_CREATE`) khi chốt kiện.
  - Backend: Chuyển đổi lệnh TSPL sang sử dụng `QRCODE` chuyên dụng thay vì in chuỗi dạng văn bản (TEXT).
  - Frontend: Thêm hiển thị báo trạng thái kết nối thời gian thực cho Cân điện tử và Máy in ở góc phải của màn hình `Pack360Screen`.
  - Raspberry Pi: Chuẩn hóa lại các tuyến (API routes) `/scale/weight` và `/printer/print` trong `server.js` để đồng bộ hoàn toàn với Frontend.

---

- **Thời gian**: 2026-08-07
- **Tên Task/Milestone**: Database and Backend (C#) changes for UC05 Raspberry Pi Integration
- **Nội dung thay đổi**:
  - SQL: Thêm các cột `weight_source`, `print_job_id`, `print_status` vào bảng `pack360_header`.
  - SQL: Tạo bảng audit `pack360_reprint_audit` và stored procedure `usp_Pack360_Reprint_Audit`. Cập nhật `usp_Pack360_Complete` để lưu thông tin mới.
  - Backend: Cập nhật `Pack360Controller` để nhận request mới có `weight_source`.
  - Backend: Thêm endpoint `POST /api/v1/pack360/{id}/reprint` để xử lý in lại mã vạch thông qua stored procedure.
  - Backend: Tạo helper format dữ liệu TSPL và áp dụng Authorization Policies cho toàn bộ API trong `Pack360Controller`.

- **Thời gian**: 2026-08-07
- **Tên Task/Milestone**: Refactor Frontend UC05 Pack360
- **Nội dung thay đổi**:
  - Cập nhật cấu hình Device Agent (PI_BRIDGE_URL) và Token xác thực.
  - Tích hợp gửi `X-Device-Agent-Token` qua `deviceClient`.
  - Cải thiện `Pack360Screen`: hỗ trợ hiển thị trạng thái cân IoT (STABLE, STALE, OFFLINE), nhập tay cân nặng (kèm lý do), ẩn hardcoded TSPL, xử lý lỗi in (Hiển thị nút in lại) thay vì chặn luồng chốt kiện.

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Fix Bug Nhóm 4 (UC11 -> UC15 Outbound & Logistics)
- **Nội dung thay đổi**:
  - SQL: Thêm `WITH (UPDLOCK)` cho SP Putaway Pallet (UC11).
  - SQL/C#: Tạo SP `usp_WMS_UC12_GetUniversalDossier` và refactor `TraceController.cs` gọi `QueryMultipleAsync` tránh Inline SQL (UC12).
  - SQL/C#: Tạo SP `usp_StockType_Change` (Whitelist validation, tự động xóa Block Reason) và refactor `StockTypeChangeController.cs` (UC13, UC14).
  - C#: Sửa logic API `CreateDeliveryNotes`, nhóm hóa phiếu xuất theo Khách hàng và validate tải trọng xe (UC15).

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Fix Bug Nhóm 3 (UC05 -> UC10 Packaging & Pallet)
- **Nội dung thay đổi**:
  - SQL: Thắt chặt Data Logic, Idempotency và Sổ Cái Kép trong SP Pack360 (UC05, UC10).
  - SQL: Dời SELECT UPDLOCK vào trong BEGIN TRAN ở SP Chuyển Đơn OEM (UC08).
  - C#: Sửa lổ hổng API Update Đơn OEM, bổ sung check mã sản phẩm hợp lệ (UC07).

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Fix Bug Nhóm 2 (UC02 Receive Data, UC03 Scan Inbound)
- **Nội dung thay đổi**:
  - SQL: Sửa lỗi thiếu Soft-Lock trên cả `tbl_thung60_kho` và `WMS_UC03_ScanLog` trong quá trình Update/Unmap mã đơn OEM.
  - SQL: Thắt chặt logic Filter `MaHang` khi Search Đơn OEM.
  - Backend: Bổ sung Validation an toàn cho API `ScanThung60` và fallback `UserName`.

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Fix Bug Nhóm 1 (UC01 Login, UC23 User Admin)
- **Nội dung thay đổi**:
  - Backend: Bổ sung Rate Limiting API chống Brute force, sửa logic trả về mật khẩu ngẫu nhiên.
  - Frontend: Xử lý redirect ép đổi mật khẩu, sửa lỗi hiển thị mật khẩu tĩnh "123456".
  - Tài liệu: Đồng bộ tên trường `user_code` thành `username` ở UC23.

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Fix Bug UC04 (Pending Handover, Partial Receipt, Cancel Scan)
- **Nội dung thay đổi**:
  - Sửa lỗi Controller `CancelHandoverScan` gọi sai SP và sai tham số.
  - Bổ sung Fail-fast check và `UPDLOCK` trong SP `usp_WMS_UC04_ConfirmNhapKho`.
  - Cập nhật tài liệu thiết kế UC04.1 (đồng bộ Transaction ID có Millisecond và thêm `old_stock_type` vào `inventory_ledger`).

- **Thời gian**: 2026-08-06
- **Tên Task/Milestone**: Thiết lập Git, GitHub & Cập nhật luật AI
- **Nội dung thay đổi**:
  - Khởi tạo kho lưu trữ Git cục bộ (`git init`).
  - Cập nhật tệp `.gitignore` bỏ qua các thư mục tạm (`bin/`, `obj/`, `node_modules/`, `dist/`).
  - Kết nối mã nguồn dự án và đẩy thành công lên kho lưu trữ GitHub (`sohoaknsg/wms1`).
  - Bổ sung quy tắc ghi nhận Changelog chi tiết và quy trình lưu trữ tài liệu vào `.agents/AGENTS.md`.

---

- **Thời gian**: 2026-08-05
- **Tên Task/Milestone**: Xử lý Báo Lỗi Kiểm tra UC02
- **Nội dung thay đổi**:
  - Phân tích và giải quyết các lỗi phát sinh liên quan đến quy trình UC02.

---

- **Thời gian**: 2026-08-03
- **Tên Task/Milestone**: Xác định Vị Trí Cấu Hình Hệ Thống
- **Nội dung thay đổi**:
  - Tìm kiếm và xác định vị trí của các tệp tin cấu hình cốt lõi của hệ thống WMS.

---

- **Thời gian**: 2026-07-21 đến 2026-08-03
- **Tên Task/Milestone**: Quản Lý Nhập Xuất Tồn
- **Nội dung thay đổi**:
  - Triển khai, phân tích và thực hiện các nghiệp vụ liên quan đến quản lý số liệu nhập xuất tồn kho.

---

- **Thời gian**: 2026-07-30 đến 2026-07-31
- **Tên Task/Milestone**: Tiếp Nhận Phản Hồi Thử Nghiệm
- **Nội dung thay đổi**:
  - Ghi nhận và xử lý các phản hồi, cải thiện chất lượng chức năng sau giai đoạn thử nghiệm (Testing).

---

- **Thời gian**: 2026-07-23 đến 2026-07-28
- **Tên Task/Milestone**: Phân Tích File UC16_Picking
- **Nội dung thay đổi**:
  - Phân tích chi tiết logic, thiết kế tài liệu nghiệp vụ, và xác định kiến trúc cần thiết cho Use Case UC16 (Quá trình lấy hàng / Picking).

---

- **Thời gian**: 2026-08-05
- **Tên Task/Milestone**: Phát triển Frontend & Triển khai (Publish)
- **Nội dung thay đổi**:
  - Khởi tạo và thiết lập thư mục `frontend`.
  - Thiết lập quy trình đóng gói ứng dụng (`publish`) và viết các kịch bản kiểm thử chấp nhận (`08_Test_Acceptance`).

---

- **Thời gian**: 2026-07-30 đến 2026-07-31
- **Tên Task/Milestone**: Tối ưu Cơ sở dữ liệu & Cấu trúc Backend
- **Nội dung thay đổi**:
  - Phát triển và tinh chỉnh các Stored Procedures (`Stored_Procedures`).
  - Mở rộng kiến trúc và các module liên quan ở `backend`.

---

- **Thời gian**: 2026-07-27
- **Tên Task/Milestone**: Thiết kế Ứng dụng & Hoàn thiện Schema Database
- **Nội dung thay đổi**:
  - Xây dựng tài liệu thiết kế ứng dụng (`05_Application_Design`).
  - Cập nhật và hoàn thiện cấu trúc Database (`schema.sql`).

---

- **Thời gian**: 2026-07-23
- **Tên Task/Milestone**: Khởi tạo Kiến trúc Backend .NET
- **Nội dung thay đổi**:
  - Thiết lập dự án .NET Core (`Wms.sln`, thư mục `src`, `tests`).
  - Thiết lập Entity Framework Migrations (`migrations`) và tài liệu Traceability (`09_Traceability`).

---

- **Thời gian**: 2026-07-17
- **Tên Task/Milestone**: Khởi tạo Dữ liệu Mẫu & Import Database
- **Nội dung thay đổi**:
  - Viết script Python sinh dữ liệu mẫu (`generate_pallet_sql.py`).
  - Thực thi nạp lượng lớn dữ liệu vào database (`import_pallet_data.sql`, `temp_alter_2.sql`).

---

- **Thời gian**: 2026-07-15
- **Tên Task/Milestone**: Hoạch định Kiến trúc Nghiệp vụ & Trải nghiệm Người dùng
- **Nội dung thay đổi**:
  - Lập tài liệu Tổng quan dự án, Kiến trúc nghiệp vụ (`01_Business_Architecture`) và Quy tắc nghiệp vụ (`03_Business_Rules`).
  - Thiết kế quy chuẩn UI/UX (`06_UI_UX`) và các yêu cầu phi chức năng (`07_Non_Functional`).
  - Phân tích Use Case UC08 (`walkthrough_UC08.md`).

---

- **Thời gian**: 2026-07-10
- **Tên Task/Milestone**: Thiết kế Cơ sở Dữ liệu Đầu vào
- **Nội dung thay đổi**:
  - Khởi tạo thư mục và các tài liệu liên quan đến thiết kế Data Layer (`04_Data_Design`).

---

- **Thời gian**: 2026-07-08
- **Tên Task/Milestone**: Khởi tạo Dự án & Thiết lập Môi trường Cấu hình
- **Nội dung thay đổi**:
  - Tạo các file cấu hình cơ bản (`cau_hinh_sql.txt`, `mock_data.sql`).
  - Bổ sung tài liệu AI Antigravity Guide để hỗ trợ lập trình Agent.

## 2026-08-07
- **Tên Task/Milestone**: Build wms-edge-bridge
- **Nội dung thay đổi**: Khởi tạo project Node.js `wms-edge-bridge` cho Raspberry Pi, bao gồm Express server, scaleService đọc USB serial, printService gửi lệnh in TCP và script cài đặt systemd.
