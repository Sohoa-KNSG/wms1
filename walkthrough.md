# Báo cáo triển khai — Full UAT Remediation (2026-08-11)

## Kết quả triển khai

- Tạo nhánh `agent/full-uat-remediation-20260811` từ `origin/main` trong worktree riêng, không ảnh hưởng checkout local đang có thay đổi.
- Lập ma trận 268 mục: 260 test case từ 25 kế hoạch Full UAT và 8 field test case UC03. Tất cả giữ trạng thái `BLOCKED-ENV` hoặc `BLOCKED-FIELD` cho đến khi có môi trường UAT cô lập và thiết bị thật.
- Loại secret khỏi HEAD, đóng endpoint phá huỷ ẩn danh, bổ sung authorization chi tiết và thu hồi session theo trạng thái tài khoản/mật khẩu.
- Hoàn thiện luồng Temporary Dispatch hai bước, các phương án trả hàng, idempotency và dual ledger.
- Sửa thao tác hoàn tất/tập kết toàn xe thành giao dịch all-or-nothing; tăng độ an toàn cho đổi loại tồn, chuyển tồn đầu kỳ và chốt tồn cuối kỳ.
- Nâng phụ thuộc frontend và .NET; audit cuối không còn lỗ hổng npm/NuGet đã biết theo nguồn hiện tại.

## Bằng chứng kỹ thuật

- .NET build: PASS, 0 warning, 0 error.
- .NET tests: PASS, 26 unit + 2 integration.
- Frontend: ESLint PASS, Vitest 10/10, production build PASS, npm audit 0 vulnerability.
- Edge bridge: 15/15 test PASS, npm audit 0 vulnerability mức High trở lên.
- Runtime smoke: API `/health/live` HTTP 200 và Vite dev server HTTP 200.
- Prettier: còn 75 tệp legacy không đạt, bằng baseline trước thay đổi; không format hàng loạt trong milestone nghiệp vụ này.

## Việc bắt buộc trước production

1. Rotate SQL credential và JWT secret từng xuất hiện trong lịch sử Git.
2. Cấp DB UAT cô lập, backup/restore thử và chạy migration 003–005.
3. Chạy đủ 268 mục với fixture, người kiểm thử và bằng chứng đối soát ledger/thiết bị.
4. Chỉ chuyển trạng thái GO khi không còn mục BLOCKED và không còn lỗi Critical/High mở.

---

# Báo cáo Triển khai - Quản lý Đơn hàng OEM (UC07)

Quá trình triển khai chức năng **Quản lý Đơn hàng OEM** đã hoàn tất với các hạng mục sau:

## 1. Phát triển Backend
- **Tạo mới `backend/routes/oem.js`**: 
  - Cung cấp API `GET /api/oem-orders` cho phép lấy danh sách đơn hàng từ database (`tbl_oem_orders`), có hỗ trợ lọc theo trạng thái và tìm kiếm chuỗi.
  - Cung cấp API `POST /api/oem-orders/import` để tiếp nhận danh sách dữ liệu từ client. Quá trình lưu trữ sử dụng cơ chế SQL Transaction. Hệ thống tự động kiểm tra trùng lặp (`oem_order_no`, `product_code`, `batch_no`) trước khi insert.
- **Tích hợp Router (`backend/server.js`)**: Đã đăng ký đường dẫn `/api/oem-orders` vào hệ thống API chính của ứng dụng.

## 2. Phát triển Frontend
- **Tích hợp thư viện xử lý Excel**: Do môi trường không gọi được lệnh cài thư viện thông qua NPM nên tôi đã linh hoạt tích hợp bộ thư viện `xlsx.full.min.js` của SheetJS thông qua CDN trực tiếp vào `index.html`. Giải pháp này đảm bảo ứng dụng vẫn có khả năng đọc file Excel trực tiếp tại trình duyệt một cách mượt mà.
- **Điều hướng & Trang chủ (`App.jsx`, `HomeScreen.jsx`)**: 
  - Bổ sung quyền phân quyền `isPlannerOrManager` cho các roles `PLANNER` và `MANAGER`.
  - Thêm thẻ Card "Quản lý Đơn hàng OEM" với icon `ClipboardList` nổi bật.
  - Định nghĩa view `oem_orders` trong bộ định tuyến của React.
- **Giao diện Data Grid (`OemOrderList.jsx`)**:
  - Giao diện dạng lưới theo đúng Wireframe chuẩn.
  - Hỗ trợ thanh tìm kiếm, bộ lọc trạng thái.
  - Bảng dữ liệu hiển thị trực quan thông tin đơn hàng với thanh Tiến độ (Progress bar) tự động tính phần trăm từ `actual_qty` và `target_qty`.
  - Có đánh dấu màu đỏ (highlight) cho các đơn hàng chuẩn bị trễ hạn (còn dưới 3 ngày).
- **Giao diện Import Excel Modal (`OemOrderImportModal.jsx`)**:
  - Thiết kế UI chuẩn, có vùng "Kéo thả file" (Drag & Drop zone).
  - Tích hợp hàm đọc `.xlsx` và map đúng vào các cột dữ liệu theo template.
  - Validate ngay phía Client (kiểm tra dòng thiếu dữ liệu bắt buộc) và bôi đỏ các dòng có lỗi, hiển thị chi tiết nguyên nhân lỗi ở cột cuối.
  - Gửi Payload JSON an toàn xuống Backend.

## 3. Tổng kết
Các thành phần đã được kiểm tra chéo về mặt thiết kế mã nguồn, cấu trúc dữ liệu và bám sát tài liệu thiết kế (UC07_OEM_Order_Management.md và Wireframe). 

Người dùng có thể tiến hành kiểm tra trên giao diện Frontend bằng cách truy cập bằng tài khoản có quyền `PLANNER` hoặc `ADMIN`.
