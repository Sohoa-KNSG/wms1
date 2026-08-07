# Tổng kết Sửa lỗi Nhóm 1 (Walkthrough)

## Các lỗi đã khắc phục thành công:

1. **UC01 - Lỗi Thiếu Rate Limiting (Brute-force / DDoS vulnerability)**
   - Đã cập nhật `src/Wms.Api/Program.cs` bổ sung `AddRateLimiter` và `UseRateLimiter()`.
   - Cấu hình chính sách `LoginRateLimit` tối đa 20 lượt truy cập/phút cho mỗi IP.
   - Gắn `[EnableRateLimiting("LoginRateLimit")]` vào API Login tại `AuthController.cs`.

2. **UC01 - Lỗi Luồng Redirect Mật khẩu (Frontend)**
   - Đã cập nhật `frontend/src/components/LoginScreen.jsx`.
   - Nếu `login` trả về cờ `must_change_password`, ứng dụng sẽ chuyển ngay sang `ROUTES.CHANGE_PASSWORD` thay vì `ROUTES.HOME` nhằm áp đặt bảo mật Zero-trust.

3. **UC23 - Giao diện báo sai Mật khẩu ngẫu nhiên**
   - Đã cập nhật `IAuthService.cs` và `AuthService.cs` (Backend) để trả ra mật khẩu vừa sinh ngẫu nhiên khi `CreateUserAsync` hoặc `ResetPasswordAsync`.
   - Đã chỉnh sửa `AuthController.cs` nhét mật khẩu này vào chuỗi trả về API (`ApiResponse<object>.Success`).
   - Đã nâng cấp màn hình `AdminUserList.jsx` ở Frontend để đọc dữ liệu từ `res.data.password` và hiển thị chính xác mật khẩu được cấp phép, thay vì cứng nhắc hardcode `"123456"`.

4. **Đồng bộ hóa Tài liệu Thiết kế UC23**
   - Đã rà soát và đổi toàn bộ từ khóa `user_code` thành `username` trong file `02_Process_UseCase/UC23_User_Administration.md` để khớp hoàn toàn với kiến trúc CSDL hiện tại.

## Đánh giá
Đã biên dịch thành công Backend (`Build Succeeded 0 Error(s)`). Luồng quy trình QA & Fix của Giai đoạn 1 đã diễn ra trôi chảy. Toàn bộ mã nguồn đã sẵn sàng cho bản phát hành kế tiếp.
