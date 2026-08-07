# Kế hoạch Thực thi (Implementation Plan) - Sửa lỗi Nhóm 1 (UC01, UC01.1, UC23)

Dựa trên báo cáo lỗi từ QA Tester, tôi đề xuất kế hoạch sửa chữa cụ thể như sau:

> [!IMPORTANT]
> **Cần Bạn Phê Duyệt:** Kế hoạch này sẽ thay đổi logic Rate Limiting ở API, chỉnh sửa luồng điều hướng ở Frontend, và cập nhật tài liệu UC23. Nếu bạn đồng ý, hãy bấm **Proceed**.

## Open Questions
- Không có. Các đề xuất sửa chữa đã được nghiên cứu kỹ và phù hợp với tiêu chuẩn dự án.

## Proposed Changes

---

### 1. Sửa Lỗi Backend API (UC01 - Login): Thêm Rate Limiting
Bổ sung cơ chế chống Brute-force/DDoS cho API Đăng nhập.

#### [MODIFY] [Program.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Program.cs)
- Cấu hình `builder.Services.AddRateLimiter` với chính sách "LoginRateLimit" (20 requests / 1 phút).
- Gọi `app.UseRateLimiter()` vào middleware pipeline (trước `UseAuthentication`).

#### [MODIFY] [AuthController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/AuthController.cs)
- Thêm attribute `[EnableRateLimiting("LoginRateLimit")]` lên hàm `Login`.

---

### 2. Sửa Lỗi Luồng Đăng Nhập Frontend (UC01)
Xử lý chuyển hướng ép buộc đổi mật khẩu.

#### [MODIFY] [LoginScreen.jsx](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/frontend/src/components/LoginScreen.jsx)
- Cập nhật hàm `handleSubmit`: sau khi gọi `login()` thành công, kiểm tra `must_change_password` (từ state AuthContext hoặc response data) để quyết định `navigate(ROUTES.CHANGE_PASSWORD)` thay vì luôn luôn `navigate(ROUTES.HOME)`.

---

### 3. Sửa Lỗi Hiển Thị Mật Khẩu (UC23 - User Admin)
Thay vì hardcode "123456", hệ thống sẽ truyền và hiển thị mật khẩu bảo mật ngẫu nhiên.

#### [MODIFY] [IAuthService.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Application/Auth/Services/IAuthService.cs) & [AuthService.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Infrastructure/Services/AuthService.cs)
- Đổi kiểu trả về của `CreateUserAsync` và `ResetPasswordAsync` từ `Task<Result>` thành `Task<Result<string>>`.
- Trả về mật khẩu ngẫu nhiên (`randomDefaultPassword`, `randomResetPassword`) thông qua `Result<string>.Success(...)`.

#### [MODIFY] [AuthController.cs](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/src/Wms.Api/Controllers/AuthController.cs)
- Trong các endpoint `CreateUser` và `ResetPassword`, nạp giá trị mật khẩu vào `ApiResponse<object>.Success(new { password = result.Value }, ...)`.

#### [MODIFY] [AdminUserList.jsx](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/frontend/src/components/AdminUserList.jsx)
- Đọc mật khẩu sinh ra từ `res.data.password` và hiển thị trên thông báo thành công thay vì hardcode "123456".

---

### 4. Đồng Bộ Tài Liệu Thiết Kế (UC23)
Sửa lại tài liệu cho thống nhất với Code.

#### [MODIFY] [UC23_User_Administration.md](file:///home/knsg-s3/.gemini/antigravity/worktrees/WMS/verify-uat-test-plan/02_Process_UseCase/UC23_User_Administration.md)
- Cập nhật toàn bộ các đề cập `user_code` thành `username` trong mô tả bảng `sec_user` và sơ đồ ERD.

## Verification Plan
1. Chạy thử biên dịch (Build) API C# để đảm bảo không gãy cấu trúc `Result<T>`.
2. Kiểm tra sơ đồ ERD của tài liệu sau khi thay thế.
3. Ghi `CHANGELOG.md` và `walkthrough.md` tổng kết Giai đoạn 1.
