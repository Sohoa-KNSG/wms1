# Kế hoạch thực thi: Đồng bộ UC05 với WMS Edge Bridge đã cài

## Mục tiêu

Giữ nguyên bridge 1.0.0 đang vận hành trên Raspberry Pi và điều chỉnh repository, Web App, API cùng SQL để dùng chung một hợp đồng dữ liệu ổn định.

## Phạm vi

1. Đồng bộ thư mục `raspberry-pi/wms-edge-bridge` với gói đã cài; không triển khai lại Raspberry Pi.
2. API Complete/Reprint trả `pack360_id`, `print_job_id` và TSPL dưới cả `label_data` lẫn `label_tspl` để tương thích ngược.
3. Frontend gửi payload bridge `{ jobId, printerName, data }`, ưu tiên `print_job_id` do API tạo để bridge chống in trùng.
4. Device Agent URL/token lấy theo thứ tự localStorage, biến môi trường, giá trị mặc định localhost:8080.
5. Nguồn cân chỉ nhận `SCALE` hoặc `MANUAL`; chế độ thủ công bắt buộc có lý do.
6. Stored procedure Complete giữ khóa trong transaction, event, Dual Ledger, trạng thái thùng 60 và bổ sung metadata cân/in.
7. Đồng bộ permission Pack360 giữa `PolicyNames`, router, security seed và migration.

## Hợp đồng tích hợp

### API WMS trả về

```json
{
  "pack360_id": "...",
  "print_job_id": "...",
  "label_data": "TSPL...",
  "label_tspl": "TSPL..."
}
```

### Web App gửi tới Raspberry Pi

```json
{
  "jobId": "...",
  "printerName": "DEFAULT_PRINTER",
  "data": "TSPL..."
}
```

## Kế hoạch kiểm thử

- `dotnet test Wms.sln`
- Frontend: lint, Vitest và production build.
- Edge bridge: syntax check, 15 test Node và production dependency audit.
- Kiểm tra `git diff --check`.
- Kiểm thử phần cứng cuối cùng trên Raspberry Pi với máy in thật do người vận hành thực hiện.

## Triển khai

1. Áp dụng `migrations/uc05_pi_bridge.sql` vào đúng database WMS.
2. Triển khai API và frontend từ cùng commit.
3. Nếu trình duyệt chạy ngoài Raspberry Pi, cấu hình URL/token theo README của bridge.
4. Không ghi đè hoặc cài lại service bridge đang hoạt động nếu version triển khai vẫn là 1.0.0 đã xác nhận.
