# AI Instructions — Fix Frontend Data Loading After ASP.NET Core Migration

## 1. Mục tiêu

Khắc phục có hệ thống các giao diện WMS không tải được dữ liệu sau khi thêm React Router và ASP.NET Core Web API.

Không vá riêng lẻ bằng dữ liệu giả. Phải đồng bộ đầy đủ:

```text
React route state/params
    -> feature API client
    -> HTTP endpoint
    -> authentication/authorization policy
    -> ASP.NET Core request/response contract
    -> SQL/Stored Procedure
```

## 2. Quy tắc bắt buộc

1. Đọc `.agents/AGENTS.md`, file này và các tài liệu use case liên quan trước khi sửa.
2. Không dùng production database để kiểm thử.
3. Không thay đổi business rule hoặc Stored Procedure chỉ để giao diện hiển thị dữ liệu.
4. Không hard-code hostname, port `3001`, port `5000` hoặc URL thiết bị trong component.
5. Không thêm demo login, demo token, demo data hoặc fallback `testuser`.
6. Không biến lỗi API thành mảng rỗng rồi coi là thành công.
7. Không gọi `fetch`/`axios` trực tiếp trong page/component sau khi feature đã migration.
8. Chỉ sử dụng `frontend/src/api/httpClient.js` thông qua feature API tương ứng.
9. Không gửi username audit từ frontend; backend lấy danh tính từ JWT.
10. Không sửa toàn bộ feature trong một commit/lượt. Hoàn tất và kiểm thử từng vertical slice.
11. Không xóa backend Node.js cho đến khi endpoint ASP.NET Core tương ứng đạt contract parity.
12. Không báo hoàn tất nếu lint, test hoặc build còn lỗi.

## 3. Nguyên nhân đã xác định

### 3.1. URL không nhất quán

Nhiều component vẫn gọi:

```text
http://{hostname}:3001/api/...
/api/...
/api/v1/...
```

API đích phải thống nhất qua `httpClient` với base URL:

```text
VITE_API_BASE_URL hoặc /api/v1
```

Reverse proxy chịu trách nhiệm route sang Node.js hoặc ASP.NET Core trong thời gian chuyển tiếp.

### 3.2. Response contract không nhất quán

ASP.NET Core response chuẩn:

```json
{
  "status": "SUCCESS",
  "message": "Xử lý thành công",
  "errorCode": null,
  "data": [],
  "requestId": "...",
  "traceId": "..."
}
```

Không kiểm tra `response.data.success` nếu API không có trường `success`.

`httpClient` hiện trả trực tiếp response body. Feature API/hook phải hiểu rõ điều này và không gọi thêm `.json()` hoặc `.data` sai cấp.

### 3.3. Router làm mất state nghiệp vụ

Router mới chưa truyền/chưa mã hóa các dữ liệu từng được giữ trong `App.jsx`:

- Receipt list thiếu hành động chọn phiếu.
- Receipt detail cần `handoverNo`.
- Scan cần `handoverNo`, `lineNo`, `productCode`.
- Storekeeper confirmation cần định danh handover.
- Partial receipt cần định danh handover.

Phải dùng URL params/search params cho định danh có thể khôi phục sau refresh. Không phụ thuộc object chỉ tồn tại trong memory route state.

Ví dụ:

```text
/receiving/handovers
/receiving/handovers/:handoverNo
/receiving/handovers/:handoverNo/lines/:lineNo/scan?productCode=...
/receiving/confirm/:handoverNo
/receiving/partial/:handoverNo
```

### 3.4. Authorization policy thiếu

Controllers đang tham chiếu các policy chưa được đăng ký đầy đủ:

- `Ledger.Read`
- `Reports.Read`
- `MasterData.Read`
- `Trace.Read`
- `Reconciliation.Read`

Mọi giá trị trong `PolicyNames` được controller sử dụng phải có registration và test `401/403/200` tương ứng.

### 3.5. Endpoint parity chưa hoàn tất

Các lệch contract đã biết:

| Frontend/legacy endpoint | Trạng thái ASP.NET Core cần xử lý |
|---|---|
| `POST /auth/admin/create-user` | Dùng thống nhất `POST /auth/admin/users` |
| `POST /export/delivery-notes` | Chưa có endpoint tương ứng |
| `GET /picking/notes` | Backend hiện dùng `/picking/delivery-notes` |
| `GET /picking/notes/{id}` | Backend hiện dùng `/picking/delivery-notes/{id}` |
| `POST /picking/scan` | Chưa có |
| `POST /picking/split-box` | Chưa có |
| `GET /picking/available-boxes/{product}` | Chưa có |
| `GET /picking/fifo-suggestions/{product}` | Chưa có |
| `POST /picking/approve-storekeeper` | Chưa có |
| `POST /picking/gate-check` | Chưa có hoặc cần map sang command mới |
| `GET /pack360/{id}` | Chưa có |
| `POST /pack360/release` | Chưa có |
| `POST /pack360/detach-units` | Chưa có |
| `POST /pack360/complete-repack` | Chưa có |
| `POST /pack360/transfer-order` | Chưa có |
| `PUT /oem-orders/{...}` | Chưa có |
| `GET /oem-orders/{...}/history` | Chưa có |
| `POST /master/{entity}` | Chưa có |

Không tự đoán rằng hai endpoint khác tên có cùng semantics. Đối chiếu Node.js, use case, Stored Procedure và acceptance criteria trước khi map.

## 4. Kiến trúc triển khai

Mỗi feature phải có API adapter riêng:

```text
frontend/src/features/
  receiving/api/receivingApi.js
  reports/api/reportsApi.js
  masterData/api/masterDataApi.js
  ledger/api/ledgerApi.js
  oem/api/oemApi.js
  packing/api/packingApi.js
  pallets/api/palletsApi.js
  outbound/api/outboundApi.js
  picking/api/pickingApi.js
  administration/api/adminApi.js
```

Luồng gọi:

```text
Page -> feature hook/service -> feature API -> httpClient -> ASP.NET Core
```

Page không đọc token và không tự chuẩn hóa URL/response.

## 5. Response parser chuẩn

Tạo hoặc hoàn thiện một hàm dùng chung để phân biệt:

1. Envelope response: `{ status, message, data, ... }`.
2. Raw read model tạm thời trong giai đoạn migration.
3. Problem Details cho lỗi HTTP.

Quy tắc:

- `status === "SUCCESS"`: trả `data` nếu có.
- `status === "ERROR"|"FAILED"`: throw `ApiError` với `errorCode`, `traceId`, `requestId`.
- Raw array: chỉ hỗ trợ bằng adapter được ghi chú là legacy.
- Không coi empty array là network/API error.
- Không thay API error bằng demo data.
- `401` logout; `403` hiển thị forbidden nhưng không logout.
- `409/422` hiển thị lỗi nghiệp vụ.
- `500` hiển thị thông báo an toàn kèm `traceId`.

## 6. Thứ tự sửa bắt buộc

### Phase 0 — Tạo contract matrix

Tạo `09_Traceability/Frontend_Data_Load_Matrix.md` với các cột:

```text
Screen
React route
Required route params
Frontend API method
Actual requested URL
ASP.NET Core endpoint
Permission policy
Request contract
Response contract
Stored Procedure/query
Current status
Evidence/test
```

Không bắt đầu sửa hàng loạt trước khi matrix xác định được endpoint thật.

### Phase 1 — Backend security/runtime foundation

- Đăng ký đầy đủ authorization policies.
- Xóa JWT secret khỏi tracked `appsettings.json`; dùng environment/user secrets.
- Xử lý route `/health` bị định nghĩa trùng.
- Readiness phải kiểm tra database thật.
- Thêm test cho policy registration để không còn lỗi “policy not found”.

### Phase 2 — HTTP client và auth

- Chỉ giữ một API client chính.
- Đánh dấu `authenticatedFetch` là legacy và loại bỏ dần.
- Xóa demo login/token.
- Sửa forced password change và chuyển API đổi mật khẩu sang `httpClient`.
- Bổ sung test `401`, `403`, refresh và `mustChangePassword`.

### Phase 3 — Reports làm vertical slice mẫu

- Chuyển `RealtimeReportScreen` sang `reportsApi`.
- Bỏ URL port `3001`.
- Parse `{ status, data }` đúng.
- Đăng ký `Reports.Read`.
- Nếu export endpoint chưa có, disable action rõ ràng hoặc triển khai endpoint theo contract; không gọi URL không tồn tại.
- Test loading, empty, success, 403 và API error.

### Phase 4 — Master Data

- Chuyển màn hình sang `masterDataApi`.
- Không dùng `.catch(() => [])` để nuốt lỗi.
- Đăng ký `MasterData.Read`.
- Chỉ hiển thị chức năng tạo mới khi API POST và permission tương ứng tồn tại.
- Phân biệt dữ liệu rỗng với lỗi tải dữ liệu.

### Phase 5 — Receiving

- Chuyển route sang params có thể refresh.
- Sửa hành động ReceiptList -> ReceiptDetail -> Scan.
- Chuyển toàn bộ API receipt sang `receivingApi`.
- Giữ đúng tên endpoint backend: kiểm tra `/map-order`, `/confirm`, `/confirm-nhap-kho`, `/confirm-nhap-le`, `/confirm-nhap-le-batch`, `/cancel-scan`.
- Xóa fallback phiếu demo.
- Test refresh trực tiếp tại detail/scan URL.

### Phase 6 — Ledger, OEM và Administration

- Chuyển từng feature sang API client.
- Đăng ký `Ledger.Read` và policy liên quan.
- Đồng bộ create-user thành `/auth/admin/users`.
- Chỉ bật edit/history OEM sau khi endpoint backend tương ứng tồn tại và có test.

### Phase 7 — Packing và Pallet

- Chuyển Pack360/Repack/Detach sang feature API.
- Không để UI gọi endpoint chưa port.
- Loại bỏ `testuser`; backend lấy actor từ JWT.
- Tách Device Agent khỏi WMS API.
- Kiểm thử scan trùng, cancel, complete, release và refresh state.

### Phase 8 — Export và Picking

Chỉ bắt đầu sau khi lập parity đầy đủ cho các command rủi ro cao.

- Chốt naming `/notes` hay `/delivery-notes` và cập nhật một contract duy nhất.
- Port đủ create delivery note, scan, split box, FIFO suggestion, approval, stage và gate-out.
- Không map `gate-check` sang `gate-out` nếu business semantics khác nhau.
- Test concurrency, idempotency, over-picking và duplicate scan.

## 7. Test bắt buộc cho mỗi màn hình

- Loading state xuất hiện và kết thúc.
- Empty data hiển thị đúng, không phải error và không phải demo data.
- Success response render đúng field.
- `401` chuyển login.
- `403` hiển thị không đủ quyền, không logout.
- `404` phân biệt object không tồn tại.
- `409/422` hiển thị lỗi nghiệp vụ.
- `500` hiển thị trace ID nếu backend cung cấp.
- Refresh/deep-link giữ đủ route params.
- Request bị hủy khi component unmount nếu phù hợp.
- Không gửi request lặp do StrictMode hoặc double click.

## 8. Quality gate

Frontend:

```text
npm run lint
npm run format:check
npm run test
npm run build
```

ESLint/Prettier phải ignore tối thiểu:

```text
node_modules/
dist/
coverage/
```

Backend trên máy có .NET SDK:

```text
dotnet restore Wms.sln
dotnet format Wms.sln --verify-no-changes
dotnet build Wms.sln --no-restore --warnaserror
dotnet test Wms.sln --no-build --no-restore
```

Không gộp các lệnh bằng cách làm mất exit code của lệnh thất bại.

## 9. Definition of Done

Một screen/feature chỉ hoàn tất khi:

- Không còn URL hard-code hoặc API call trực tiếp trong component.
- Route có đủ params và hoạt động sau refresh.
- Endpoint ASP.NET Core tồn tại và policy đã đăng ký.
- Request/response contract được ghi trong matrix.
- Không dùng demo fallback hoặc nuốt lỗi thành dữ liệu rỗng.
- Có test loading, empty, success và error chính.
- Không còn `testuser` hoặc audit username từ frontend.
- Lint, format, test và build đều pass.
- Đã kiểm tra với API thật trên môi trường test hoặc integration test tương đương.

## 10. Mẫu báo cáo của AI

```text
Kết quả:
- Feature/screen đã sửa
- Endpoint và policy đã đồng bộ
- File đã thay đổi

Kiểm chứng:
- Lệnh đã chạy
- Test pass/fail
- Response contract đã xác nhận

Chưa hoàn tất:
- Endpoint hoặc business decision còn thiếu

Bước tiếp theo:
- Một vertical slice cụ thể
```

## 11. Lệnh khởi đầu

Khi được yêu cầu thực hiện, bắt đầu bằng **Phase 0**: tạo `Frontend_Data_Load_Matrix.md` từ code thực tế. Sau đó xử lý **Phase 1** và **Phase 2**. Dừng báo cáo trước khi chuyển sang Reports. Không tự động sửa toàn bộ feature trong một lượt.
