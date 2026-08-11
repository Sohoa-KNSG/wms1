# Walkthrough — Full UAT Remediation

Ngày thực hiện: 2026-08-11

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
