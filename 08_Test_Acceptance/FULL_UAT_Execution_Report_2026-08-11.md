# Báo cáo rà soát và thực thi Full UAT — 2026-08-11

## Kết luận

- **Functional/security gates của source code:** PASS.
- **Formatting gate:** FAIL do 75 tệp legacy chưa theo cấu hình Prettier; không format hàng loạt trong PR sửa nghiệp vụ này.
- **Business UAT trên dữ liệu thật:** BLOCKED, chưa đủ điều kiện ký nghiệm thu.
- **Khuyến nghị triển khai production:** NO-GO cho đến khi chạy migration và toàn bộ ma trận trên một DB UAT cô lập.

Không test case nghiệp vụ nào được đánh dấu PASS chỉ dựa trên code review. Cấu hình được phát hiện trỏ tới SQL Server mạng nội bộ và tên DB không thể hiện đây là môi trường test; vì vậy không có lệnh ghi dữ liệu, migration hoặc UAT nghiệp vụ nào được chạy lên DB đó.

## Phạm vi được kiểm kê

| Tài liệu | Số test case duy nhất | Trạng thái thực thi |
|---|---:|---|
| UC01.1 | 9 | BLOCKED-ENV |
| UC01 | 9 | BLOCKED-ENV |
| UC02 | 12 | BLOCKED-ENV |
| UC03 | 14 | BLOCKED-ENV |
| UC04.1 | 11 | BLOCKED-ENV |
| UC04.2 | 6 | BLOCKED-ENV |
| UC04 | 31 | BLOCKED-ENV |
| UC05 | 13 | BLOCKED-ENV/FIELD |
| UC06.1 | 9 | BLOCKED-ENV |
| UC06.2 | 9 | BLOCKED-ENV |
| UC06 | 11 | BLOCKED-ENV |
| UC07 | 9 | BLOCKED-ENV |
| UC08 | 9 | BLOCKED-ENV |
| UC09 | 9 | BLOCKED-ENV |
| UC10 | 9 | BLOCKED-ENV |
| UC11 | 9 | BLOCKED-ENV |
| UC12 | 9 | BLOCKED-ENV |
| UC13 | 9 | BLOCKED-ENV |
| UC14 | 9 | BLOCKED-ENV |
| UC15 | 9 | BLOCKED-ENV |
| UC16 | 9 | BLOCKED-ENV |
| UC18 | 9 | BLOCKED-ENV |
| UC22.1 | 9 | BLOCKED-ENV |
| UC22.2 | 9 | BLOCKED-ENV |
| UC23 | 9 | BLOCKED-ENV |
| UC03 field checklist | 8 | BLOCKED-FIELD |

Tổng chính xác theo các dòng test case hiện có: **260 UAT test case + 8 field test case = 268 mục**. Ma trận từng ID nằm tại `FULL_UAT_Case_Matrix_2026-08-11.md`.

## Bằng chứng tự động đã đạt

| Gate | Kết quả |
|---|---|
| `dotnet build Wms.sln --no-restore` | PASS, 0 warning, 0 error |
| .NET unit tests | PASS, 26/26 |
| .NET integration tests | PASS, 2/2 |
| Frontend ESLint | PASS |
| Frontend Vitest | PASS, 10/10 |
| Frontend production build | PASS |
| API process + `GET /health/live` | PASS, HTTP 200 với cấu hình DB giả không kết nối |
| Vite dev server process | PASS, HTTP 200 và render root HTML |
| Frontend `npm audit --audit-level=high` | PASS, 0 vulnerability |
| NuGet audit, gồm transitive packages | PASS, không còn package dễ tổn thương theo nguồn hiện tại |
| Raspberry Pi edge bridge tests | PASS, 15/15 |
| Frontend Prettier check | FAIL, 75 tệp legacy; baseline đã tồn tại trước thay đổi |
| `git diff --check` | Chạy ở quality gate cuối trước commit |

Các gate trên chứng minh source biên dịch được và các regression test hiện hữu đạt; chúng **không thay thế** test nghiệp vụ có DB, UI, cân, máy in, PDA và tem thật.

## Lỗi Critical/High đã xử lý

1. Loại chuỗi kết nối và JWT secret thật khỏi các cấu hình đang được theo dõi; cấu hình runtime chuyển sang biến môi trường.
2. Gỡ endpoint xóa dữ liệu test không xác thực và gỡ API tương ứng khỏi frontend.
3. Đóng lỗ hổng nâng quyền mặc định: role thường không còn tự động nhận toàn bộ policy.
4. Thêm policy cụ thể cho Receipt, OEM, Pallet, Export, Trace, Temporary Dispatch, Stock Type, Inventory Closing và System Memory; test kiến trúc quét toàn bộ controller.
5. Thu hồi JWT theo mốc phiên chính xác, chặn token của tài khoản bị khóa và cưỡng chế đổi mật khẩu ở backend.
6. Ghi audit cho cả các lần đổi mật khẩu thất bại; đổi/reset mật khẩu dùng UTC và chống race condition.
7. Sửa CORS wildcard kết hợp credentials thành allow-list origin cụ thể.
8. Viết lại UC18 theo hai bước `PENDING_OUT -> TEMP_OUT`, xác nhận danh sách tem, hạch toán hai ledger và hỗ trợ trả đúng thùng/đóng lại/đổi SKU.
9. Sửa route và nhánh xử lý “hoàn tất cả xe/tập kết cả xe”; batch backend giờ all-or-nothing, không nuốt exception.
10. Bổ sung idempotency và schema cho đổi loại tồn, kết chuyển tồn đầu và chốt tồn cuối kỳ.
11. Thay stored procedure khung trả SUCCESS giả bằng wrapper thật hoặc lỗi fail-closed chỉ rõ API thay thế.
12. Nâng Vite, Vitest và React Router lên bản đã vá; `npm audit` từ 10 cảnh báo về 0.
13. Nâng SQL client/JWT runtime, bỏ package ASP.NET 2.2 lỗi thời và pin `System.Text.Json` 8.0.6; NuGet audit từ các cảnh báo Critical/High/Moderate/Low về 0.

## Blocker bắt buộc trước khi ký UAT

1. Cấp DB UAT cô lập hoặc bản sao đã khử dữ liệu nhạy cảm; tuyệt đối không dùng DB đang được cấu hình hiện tại nếu chưa xác nhận.
2. Backup/restore thử và chạy lần lượt `003_uc18_temporary_dispatch.sql`, `004_auth_session_revocation.sql`, `005_inventory_control_integrity.sql`.
3. Chuẩn bị fixture được đặt tên cho từng kịch bản, đặc biệt UC04 D01–D11, UC05 thiết bị, UC16 chuyến xe và UC18 trả hàng.
4. Chạy 260 test case và ghi người test, ngày test, Bug ID, ảnh/API response và truy vấn đối soát ledger.
5. Chạy 8 field test case UC03 trên PDA/máy quét tại kho và test cân/máy in của UC05.
6. Chuẩn hóa 18 test plan dạng boilerplate thành kịch bản đặc thù use case; hiện nhiều mô tả màn hình/luồng không đủ làm bằng chứng nghiệm thu.
7. Điền hoặc liên kết fixture trong ba tài liệu chỉ mục thay vì để tài liệu rỗng.
8. Xoay vòng ngay SQL credential và JWT secret từng tồn tại trong lịch sử Git. Việc xóa khỏi HEAD không vô hiệu bí mật đã bị commit trước đó.

## Điều kiện chuyển sang GO

- 268/268 mục có kết quả và bằng chứng; không còn BLOCKED.
- 0 lỗi Critical/High mở; lỗi Medium có owner và lịch xử lý được phê duyệt.
- Đối soát `inventory_ledger` và `item_ledger` bằng nhau cho mọi giao dịch nhập/xuất/chuyển loại/chốt kỳ.
- Retry cùng `X-Request-Id` không tạo dữ liệu thứ hai.
- Credential cũ đã được rotate và không còn trong artifact triển khai.
