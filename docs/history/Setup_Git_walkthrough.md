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
