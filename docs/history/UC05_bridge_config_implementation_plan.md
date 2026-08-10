# Cập nhật Cấu hình Kết nối Device Agent cho UC05

Thay đổi cấu hình CORS trên Bridge và xác nhận URL kết nối trên Frontend đảm bảo ứng dụng Web UC05 chạy được từ trình duyệt Chromium của chính Raspberry Pi.

## User Review Required

> [!IMPORTANT]
> - Thay đổi này sẽ ảnh hưởng tới danh sách origin được phép truy cập Bridge.
> - Xin vui lòng xem xét `VITE_DEVICE_AGENT_URL` sẽ mặc định là `http://localhost:8080` ở code frontend để Chromium local gọi đúng IP của chính nó.

## Open Questions

Không có câu hỏi mở. Các yêu cầu đã rất rõ ràng:
- Frontend không hard-code IP (giữ nguyên fallback là `http://localhost:8080`).
- Không tạo API proxy.
- Bổ sung `http://10.17.16.164:5173` vào `CORS_ALLOWED_ORIGINS` của bridge.

## Proposed Changes

### Frontend Configuration

Frontend đã được thiết kế đúng theo chuẩn:
- Không sử dụng `window.location.hostname`.
- Fallback về `http://localhost:8080`.
- Chấp nhận ghi đè bằng `localStorage` và `import.meta.env`.

*(Không cần sửa mã nguồn, chỉ cần xác nhận lint/test passing)*

---

### Edge Bridge Configuration

Cập nhật danh sách CORS để cho phép máy chủ Vite DEV truy cập từ Chromium:

#### [MODIFY] config.js
Bổ sung `http://10.17.16.164:5173` vào mảng mặc định `CORS_ALLOWED_ORIGINS`.

#### [MODIFY] .env.example
Cập nhật mẫu `.env` với domain `http://10.17.16.164:5173` tương tự.

## Verification Plan

### Automated Tests
- Chạy `npm run lint`, `npm test` và `npm run build` trên `frontend`.
- Chạy `npm run check`, `npm test` trên `raspberry-pi/wms-edge-bridge`.

### Manual Verification
- Bạn cần truy cập trang web bằng Chromium trên Raspberry Pi, đăng nhập tài khoản nhân viên, vào UC05 và xác nhận Máy in cũng như dữ liệu Cân được tải thành công.
