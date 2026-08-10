# Walkthrough: Đồng bộ UC05 với WMS Edge Bridge đã cài

## Thay đổi đã thực hiện

- Thay bridge tối giản trong commit Antigravity bằng đúng mã nguồn bridge 1.0.0 đã đóng gói và cài trên Raspberry Pi.
- API Complete/Reprint trả payload in nhất quán và giữ hai tên trường TSPL để không phá vỡ client cũ.
- `printService` giữ nguyên `print_job_id` của API khi gọi `/printer/print`; retry cùng payload được bridge nhận diện là job trùng.
- `Pack360Screen` và `RepackScreen` dùng TSPL do API trả, kiểm tra cân ổn định và lưu lý do cân thủ công.
- URL/token bridge hỗ trợ `VITE_DEVICE_AGENT_URL`, `VITE_DEVICE_AGENT_TOKEN`, `wms_device_agent_url`, `wms_device_agent_token` và khóa token cũ.
- Stored procedure Complete được đưa toàn bộ vào transaction với `UPDLOCK, HOLDLOCK`; event, Dual Ledger và cập nhật thùng 60 không còn bị mất.
- Permission scan dùng lại `Pack360.Scan`; permission `Pack360.Reprint` được bổ sung vào security seed và migration.

## Kết quả xác minh

- .NET unit tests: 11/11 đạt.
- .NET integration tests: 2/2 đạt.
- Frontend lint: đạt.
- Frontend tests: 8/8 đạt.
- Frontend production build: đạt; còn cảnh báo bundle lớn hơn 500 kB.
- Edge bridge syntax check: đạt.
- Edge bridge tests: 15/15 đạt.
- Edge bridge production audit: 0 lỗ hổng.
- `git diff --check`: đạt.

## Giới hạn xác minh

- Chưa chạy migration trên database production.
- Chưa gửi lệnh in thật từ bản Web App mới tới Raspberry Pi; bước này cần thực hiện sau khi deploy API/frontend và cấu hình origin/token đúng tại trạm đóng gói.
- Frontend production audit vẫn báo hai cảnh báo moderate từ React Router; việc nâng major dependency được tách khỏi phạm vi tương thích UC05.
