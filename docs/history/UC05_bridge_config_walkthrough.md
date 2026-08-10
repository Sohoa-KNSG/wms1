# Walkthrough: Cập nhật Kiến trúc Local Bridge cho UC05

## 1. Giới thiệu

Yêu cầu thay đổi đã được thực hiện nhằm hỗ trợ trình duyệt Chromium chạy trực tiếp trên Raspberry Pi truy cập thẳng tới ứng dụng Web trên máy chủ (Vite DEV Server), đồng thời thực hiện kết nối HTTP trực tiếp về chính Pi (trên cổng 8080) để điều khiển máy in và đọc dữ liệu cân IoT (Không qua API proxy).

## 2. Những thay đổi đã thực hiện

### 2.1 Cấu hình Frontend (`deviceConfig.js`)
Frontend đã được chuẩn hóa, và được xác nhận là hoàn toàn tương thích với kiến trúc này:
- Mặc định Device Agent URL là `http://localhost:8080`.
- Cho phép người vận hành hoặc DevOps ghi đè thông qua `localStorage.setItem('wms_device_agent_url', ...)` hoặc biến môi trường `VITE_DEVICE_AGENT_URL`.
- Loại bỏ hoàn toàn khả năng vô tình dùng `window.location.hostname` (ngăn trường hợp Frontend gửi lệnh in nhầm tới máy chủ WMS).

### 2.2 Cấu hình CORS của Edge Bridge
Do Frontend tải HTML/JS từ máy chủ (`10.17.16.164`), trình duyệt Chromium sẽ xem các request tới `localhost:8080` (Bridge) là Cross-Origin Resource Sharing (CORS).
- Đã chỉnh sửa mảng `CORS_ALLOWED_ORIGINS` mặc định trong `wms-edge-bridge/src/config.js` để cấp phép cho IP mạng LAN của máy chủ: `http://10.17.16.164:5173`.
- Đã chỉnh sửa mẫu `wms-edge-bridge/.env.example` làm tài liệu hướng dẫn khi deploy lên Pi thực tế.

## 3. Xác thực (Verification)

Mọi thay đổi đã được kiểm tra trên cả 2 repository:
- **wms-edge-bridge**: Vượt qua 15/15 unit test. Cấu hình origin mới không làm hỏng các bài kiểm tra bảo mật (Device Agent Token).
- **frontend**: Vượt qua kiểm tra Lint, Unit Tests (8/8) và Production Build thành công trong 4.06s.

## 4. Hướng dẫn Vận hành tại Packing Station
1. Bật Raspberry Pi và mở trình duyệt Chromium.
2. Đăng nhập hệ thống tại `http://10.17.16.164:5173` bằng tài khoản nhân viên (role `NHAN_VIEN` hoặc `THU_KHO` tuỳ phân quyền).
3. Truy cập chức năng đóng gói và theo dõi kết nối thiết bị báo "STABLE". Lúc này lệnh in sẽ tự động truyền đến Bridge.
