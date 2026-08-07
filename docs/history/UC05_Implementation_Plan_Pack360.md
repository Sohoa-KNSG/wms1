# Kế hoạch Thực thi (Implementation Plan) - Refactor Frontend UC05 Pack360

## 1. Mục tiêu
Refactor React frontend cho UC05 Pack360 Integration, bao gồm việc cấu hình Device Agent linh hoạt hơn, thêm bảo mật bằng Token, và cải thiện UI/UX cũng như logic xử lý lỗi cho màn hình đóng gói (Pack360Screen).

## 2. Các thay đổi chi tiết

### 2.1. `frontend/src/integrations/deviceAgent/deviceConfig.js`
- Cập nhật hàm `getDeviceAgentUrl`: Nếu `window.location.hostname` không phải là `localhost` hoặc `127.0.0.1`, sẽ không mặc định trả về `http://localhost:8080`.
- Thêm hàm `getDeviceAgentToken` để đọc giá trị token từ `localStorage.getItem('X-Device-Agent-Token')`.

### 2.2. `frontend/src/integrations/deviceAgent/deviceClient.js`
- Cập nhật `deviceClient.interceptors.request` để thêm Header `X-Device-Agent-Token` vào mỗi request gửi đến Device Agent, lấy từ `getDeviceAgentToken()`.
- Đảm bảo xử lý lỗi (timeout, offline) được giữ nguyên và cải thiện thông báo nếu cần.

### 2.3. `frontend/src/integrations/deviceAgent/scaleService.js` và `printService.js`
- `scaleService.js`: Đảm bảo hàm `readWeight` trả về đầy đủ các trường `weight`, `unit`, `isStable`, và `stale` từ phản hồi của thiết bị.
- `printService.js`: Bắt lỗi và xử lý lỗi cụ thể để báo về UI nếu việc gửi lệnh in gặp sự cố, đảm bảo UI nhận biết được in thất bại.

### 2.4. `frontend/src/components/Pack360Screen.jsx`
- **Quản lý trạng thái cân (Scale States):** Thêm logic để hiển thị các trạng thái của cân IoT như CONNECTED, STABLE, UNSTABLE, STALE, OFFLINE trên giao diện.
- **Vô hiệu hóa nút Complete:** Nút "CHỐT THÙNG & IN TEM" sẽ bị disable (vô hiệu hóa) nếu chế độ là cân IoT và cân đang ở trạng thái `isStable=false` hoặc `stale=true`.
- **Xử lý Nguồn cân nặng (Weight Source):**
  - Nếu nhập tay (`isManualWeight = true`), khi chốt thùng sẽ thiết lập `weight_source = 'MANUAL'` và hiển thị một hộp thoại (prompt) yêu cầu người dùng nhập lý do.
  - Nếu dùng cân IoT, thiết lập `weight_source = 'SCALE'`.
- **Loại bỏ hardcode TSPL:** Xóa bỏ template TSPL cứng trong hàm `generateTSPL`. Dữ liệu tem sẽ được API trả về trực tiếp hoặc dùng cấu trúc động. (Trong yêu cầu ghi "Remove hardcoded TSPL label data", sẽ sử dụng TSPL do backend trả về trong payload của `completePack` nếu có, hoặc nhận data TSPL sẵn từ `printData.label_tspl`).
- **Xử lý lỗi in và Nút In Lại (Reprint):**
  - Gọi backend `packingApi.completePack` truyền thêm `weight_source` và `manual_weight_reason`.
  - Nếu backend chốt thùng thành công nhưng gửi lệnh in qua deviceAgent thất bại, màn hình sẽ **không làm mới** (không xóa mã kiện) mà hiển thị trạng thái "Pack360 completed but print failed".
  - Hiển thị nút "IN LẠI (REPRINT)". Khi bấm, gọi `packingApi.reprintPack(id, reason)` và thử gửi lại lệnh in cho thiết bị qua `printService`.

## 3. Xin ý kiến duyệt
Vui lòng xem xét Kế hoạch Thực thi trên. Nếu bạn đồng ý, hãy bấm **Proceed** hoặc trả lời để tôi tiến hành sửa đổi các tệp tin theo kế hoạch.
