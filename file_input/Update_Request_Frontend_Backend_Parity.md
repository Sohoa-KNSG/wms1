# Yêu cầu cập nhật — Frontend/ASP.NET Core Contract Parity và Security

## 1. Thông tin yêu cầu

| Thuộc tính | Nội dung |
|---|---|
| Mã yêu cầu | `CR-WMS-2026-07-FE-BE-PARITY-01` |
| Mức ưu tiên | P0 — Critical |
| Phạm vi | `Update/WMS/frontend`, `Update/WMS/src`, tests và traceability |
| Mục tiêu | Khôi phục khả năng tải dữ liệu ổn định và bảo đảm phân quyền đúng sau migration ASP.NET Core |
| Chiến lược | Sửa theo vertical slice, không big-bang |
| Điều kiện cutover | Tất cả tiêu chí nghiệm thu P0/P1 đạt và có bằng chứng test |

## 2. Bối cảnh

Bản cập nhật hiện đã có React Router, feature API, ASP.NET Core Web API và migration matrix. Tuy nhiên kiểm tra thực tế cho thấy:

- Nhiều màn hình vẫn gọi backend Node.js tại port `3001`.
- Nhiều endpoint được đánh dấu hoàn tất nhưng chưa tồn tại trong ASP.NET Core.
- Authorization policy hiện chỉ yêu cầu đăng nhập, không kiểm tra permission thực tế.
- Demo login, demo data và `testuser` đang che lỗi API.
- Receiving chưa dùng URL params như tài liệu mô tả.
- Lint và format chưa đạt quality gate.
- JWT secret vẫn nằm trong source.
- Health endpoint có nguy cơ đăng ký trùng.

## 3. Mục tiêu bắt buộc

1. Không còn giao diện hiển thị dữ liệu giả khi API lỗi.
2. Mỗi frontend API phải có endpoint ASP.NET Core hoặc adapter Node.js được ghi rõ trong matrix.
3. Mỗi policy phải kiểm tra đúng permission/role, không chỉ kiểm tra authenticated user.
4. Mọi màn hình đã migration phải dùng API client tập trung.
5. Route nghiệp vụ phải hoạt động sau refresh/deep-link.
6. Matrix phải phản ánh đúng code và test thực tế.
7. Lint, format, test và build phải đạt trước nghiệm thu.

## 4. Yêu cầu P0 — Security

### SEC-01: Sửa authorization policy

Không được đăng ký policy theo mẫu:

```csharp
options.AddPolicy(policyName, p => p.RequireAuthenticatedUser());
```

Mỗi capability phải yêu cầu claim tương ứng, với admin override được quy định rõ:

```csharp
RequireClaim("permission", PolicyNames.ReportsRead)
```

hoặc authorization handler dùng chung hỗ trợ:

- Permission claim chính xác.
- `ADMIN`/`IT_ADMIN` override nếu được phê duyệt.
- Không cấp quyền do username hoặc do danh sách role rỗng.

Tiêu chí nghiệm thu:

- Anonymous nhận `401`.
- User đăng nhập nhưng thiếu capability nhận `403`.
- User có capability nhận `200` hoặc được thực hiện command.
- Có automated test cho tối thiểu `Admin.Users.Manage`, `Picking.Ship`, `Receipt.Scan`, `Reports.Read`.

### SEC-02: Loại bỏ secret khỏi source

- Xóa JWT signing secret thật/mặc định khỏi tracked `appsettings.json`.
- Dùng environment variable, user secrets hoặc secret store.
- Ứng dụng từ chối khởi động khi secret thiếu hoặc không đạt độ dài yêu cầu.
- Rotate secret đã xuất hiện trong source.

### SEC-03: Loại bỏ authentication giả

Xóa khỏi production code:

- Demo login khi API lỗi.
- Demo JWT token.
- Cấp toàn quyền theo username `admin`.
- Cấp toàn quyền khi `roles.length === 0`.
- `testuser` hoặc `SYSTEM` fallback từ frontend.

Danh tính audit phải do ASP.NET Core lấy từ authenticated principal.

## 5. Yêu cầu P0 — Data loading và API contract

### API-01: Một HTTP client duy nhất

- `frontend/src/api/httpClient.js` là HTTP client chính.
- Không gọi `fetch`, `axios` hoặc `authenticatedFetch` trực tiếp trong component đã migration.
- Base URL lấy từ `VITE_API_BASE_URL` hoặc relative `/api/v1`.
- Không hard-code port `3001`, `5000` hoặc hostname trong component.
- `authenticatedFetch` chỉ được tồn tại tạm thời với danh sách consumer legacy rõ ràng và deadline xóa.

### API-02: Chuẩn hóa response

Read response chuẩn:

```json
{
  "status": "SUCCESS",
  "message": "Xử lý thành công",
  "data": [],
  "errorCode": null,
  "requestId": "...",
  "traceId": "..."
}
```

Yêu cầu frontend:

- Không kiểm tra trường `success` nếu contract không định nghĩa.
- Không gọi `.json()` trên dữ liệu đã được Axios interceptor parse.
- Phân biệt empty data với API error.
- `401` logout; `403` không logout; `409/422` hiển thị lỗi nghiệp vụ.
- Không nuốt lỗi bằng `.catch(() => [])`.
- Không thay lỗi bằng demo data.

### API-03: Contract parity bắt buộc

Không đánh dấu `Complete` nếu endpoint chưa tồn tại và chưa có test.

Các endpoint cần hoàn thiện hoặc đánh dấu lại trạng thái:

| Nhóm | Endpoint/contract cần xử lý |
|---|---|
| Auth | Đồng bộ `POST /auth/admin/users`; sửa change-password |
| Pack360 | get info, release, detach, complete-repack, transfer-order |
| OEM | update order, history, import contract |
| Export | create delivery note và update requirement nếu UI sử dụng |
| Picking | scan, split-box, available-boxes, FIFO, approval, gate-check/gate-out |
| Master Data | POST/update nếu UI vẫn cho phép thao tác |
| Ledger | List/detail phải dùng API client mới |

Không map hai command khác tên nếu chưa xác nhận cùng business semantics.

## 6. Yêu cầu P1 — Routing

### ROUTE-01: Receiving deep-link

Route đích:

```text
/receiving/handovers
/receiving/handovers/:handoverNo
/receiving/handovers/:handoverNo/lines/:lineNo/scan?productCode=...
/receiving/confirm/:handoverNo
/receiving/partial/:handoverNo
```

Yêu cầu:

- Receipt list chọn phiếu phải thay đổi URL.
- Detail lấy `handoverNo` từ URL params.
- Scan lấy `handoverNo`, `lineNo`, `productCode` từ URL/search params.
- Refresh tại detail/scan phải tải lại đúng dữ liệu.
- Không phụ thuộc hoàn toàn vào component memory state.
- Back/forward của trình duyệt hoạt động đúng.

### ROUTE-02: Forced password change

- User có `mustChangePassword=true` không được truy cập route khác sau refresh hoặc nhập URL trực tiếp.
- Change password dùng API client mới.
- Thành công phải cập nhật auth state hoặc logout theo contract được chọn.
- Không gọi callback không được router truyền.

## 7. Yêu cầu P1 — Health và runtime

### OPS-01: Health endpoint

- Chỉ có một handler cho `GET /health`.
- Không đăng ký đồng thời controller và `MapHealthChecks("/health")` cùng route.
- Liveness không phụ thuộc database.
- Readiness phải kiểm tra database thật.
- Response không lộ connection string hoặc chi tiết SQL.

### OPS-02: Error observability

- Mọi lỗi backend có `traceId`.
- Frontend hiển thị `traceId` ở thông báo lỗi hệ thống.
- Log có request ID, user ID và endpoint nhưng không chứa token/password.

## 8. Yêu cầu P1 — Migration matrix

Cập nhật `09_Traceability/Frontend_Data_Load_Matrix.md` theo code thực tế.

Trạng thái hợp lệ:

```text
Not Started
Backend Missing
Frontend Legacy
In Progress
Ready for Test
Verified
Blocked
```

Chỉ dùng `Verified` khi:

- Endpoint tồn tại.
- Policy đúng.
- Frontend gọi đúng URL.
- Request/response contract khớp.
- Không dùng demo fallback.
- Có automated test hoặc bằng chứng integration test.
- Quality gate liên quan pass.

Không dùng “Build & Vitest Pass” làm bằng chứng cho endpoint chưa có test riêng.

## 9. Yêu cầu P1 — Quality gate

Frontend phải ignore:

```text
node_modules/
dist/
coverage/
```

Sửa hai lỗi source hiện có:

- `src/integrations/deviceAgent/printService.js`
- `src/integrations/deviceAgent/scaleService.js`

Các lệnh bắt buộc:

```text
npm run lint
npm run format:check
npm run test
npm run build
```

Backend trên môi trường có .NET SDK:

```text
dotnet restore Wms.sln
dotnet format Wms.sln --verify-no-changes
dotnet build Wms.sln --no-restore --warnaserror
dotnet test Wms.sln --no-build --no-restore
```

Không gộp lệnh theo cách làm mất exit code thất bại.

## 10. Test acceptance tối thiểu

Mỗi màn hình tải dữ liệu phải có:

- Loading state.
- Empty state thật.
- Success response.
- `401`.
- `403`.
- `404` khi có object ID.
- `409/422` cho lỗi nghiệp vụ.
- `500` kèm trace ID.
- Network timeout.
- Refresh/deep-link.
- Không gửi request kép do double click hoặc StrictMode.

Các workflow bắt buộc có integration test:

1. Login và forced password change.
2. Receipt list → detail → scan.
3. Storekeeper confirmation và partial receipt.
4. Reports và Master Data load.
5. Pack360 scan/complete/cancel.
6. Picking scan/stage/gate-out.

## 11. Thứ tự triển khai

1. Sửa authorization policy và secret.
2. Sửa health endpoint.
3. Xóa demo login/token và toàn quyền fallback.
4. Làm quality gate pass.
5. Sửa auth/change-password và HTTP client.
6. Hoàn tất Reports như vertical slice mẫu.
7. Hoàn tất Master Data.
8. Hoàn tất Receiving và URL params.
9. Hoàn tất Ledger/OEM/Admin.
10. Hoàn tất Pack360/Pallet.
11. Hoàn tất Export/Picking.
12. Cập nhật matrix thành `Verified` theo bằng chứng thật.

Không chuyển sang nhóm tiếp theo nếu nhóm hiện tại chưa đạt acceptance criteria.

## 12. Definition of Done

Change request chỉ hoàn tất khi:

- Không còn demo login, demo token, demo data hoặc `testuser` trong production flow.
- Không còn JWT secret trong tracked source.
- Policy kiểm tra đúng permission/role và có test `401/403/200`.
- Không còn health route trùng.
- Không còn URL port `3001` trong component đã cutover.
- Receiving hoạt động qua URL params sau refresh.
- Mọi mục `Verified` trong matrix có endpoint và test thật.
- Lint, format, frontend test/build và .NET test/build đều pass.
- UAT xác nhận các luồng nghiệp vụ trọng yếu tải và cập nhật dữ liệu thật.

## 13. Chỉ dẫn cho AI thực hiện

Đọc file này cùng `AI_Fix_Frontend_Data_Load_Instructions.md`. Bắt đầu từ mục 11, bước 1. Sau mỗi bước:

```text
Kết quả
Kiểm chứng
Rủi ro còn lại
Matrix đã cập nhật
Bước tiếp theo
```

Dừng báo cáo trước khi chuyển sang feature tiếp theo. Không tự đánh dấu `Verified` nếu chưa có test hoặc không thể chạy backend .NET.
