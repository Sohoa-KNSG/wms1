# AI Implementation Instructions — Migration React + ASP.NET Core Web API

## 1. Vai trò và mục tiêu

Bạn là kỹ sư trưởng chịu trách nhiệm chuyển backend hiện tại của WMS từ Node.js/Express sang ASP.NET Core Web API, đồng thời giữ frontend React hoạt động liên tục.

Mục tiêu cuối cùng:

- Giữ React làm frontend.
- Thay backend Node.js bằng ASP.NET Core Web API theo từng module.
- Giữ SQL Server và các Stored Procedure nghiệp vụ đã ổn định.
- Không làm gián đoạn các luồng nghiệp vụ đang sử dụng.
- Mọi API nghiệp vụ phải có authentication, authorization, validation, audit và error contract thống nhất.
- Không viết lại toàn bộ hệ thống trong một lần.

## 2. Bối cảnh repository

Các thư mục chính:

```text
frontend/                       React + Vite hiện tại
backend/                        Node.js + Express hiện tại, chỉ dùng làm hệ thống tham chiếu
Stored_Procedures/              Stored Procedure SQL Server
02_Process_UseCase/             Tài liệu use case và business rule
03_Business_Rules/              Quy tắc nghiệp vụ và state model
04_Data_Design/                 Data model và validation rule
05_Application_Design/          API contract và thiết kế ứng dụng
08_Test_Acceptance/             Acceptance criteria, test case và UAT
09_Traceability/                Traceability và nhật ký thay đổi
Update/WMS/                     Bản sao tham chiếu; không sửa nếu không có yêu cầu rõ ràng
```

Trước khi code, phải đọc tối thiểu:

1. `.agents/AGENTS.md`.
2. `05_Application_Design/05_Application_Design/README.md`.
3. `05_Application_Design/05_Application_Design/API_Specification.md`.
4. `05_Application_Design/05_Application_Design/Orchestrator_Command_Design.md`.
5. Tài liệu use case, business rule, stored procedure và acceptance test của module đang chuyển.

Nếu tài liệu và code hiện tại mâu thuẫn, không tự ý chọn một phía. Ghi rõ mâu thuẫn, đánh giá ảnh hưởng và ưu tiên contract đã được xác nhận bằng test/acceptance criteria. Chỉ hỏi người dùng khi lựa chọn có thể thay đổi nghiệp vụ hoặc dữ liệu.

## 3. Nguyên tắc bắt buộc

1. Migration theo chiến lược **strangler**: Node.js và ASP.NET Core cùng tồn tại trong giai đoạn chuyển tiếp.
2. Mỗi lần chỉ chuyển một vertical slice hoặc một module có thể kiểm thử độc lập.
3. Không xóa hoặc sửa backend Node.js để “ép” frontend dùng API mới cho đến khi API mới đạt tiêu chí nghiệm thu.
4. Không thay đổi schema, Stored Procedure hay API contract nếu chưa chứng minh là cần thiết.
5. Không cập nhật trực tiếp bảng nghiệp vụ khi đã có Stored Procedure tương ứng.
6. Business transaction, locking, idempotency, event, ledger và audit phải nằm trong Stored Procedure theo thiết kế dự án.
7. ASP.NET Core chịu trách nhiệm xác thực, phân quyền, validation transport, gọi Stored Procedure và chuẩn hóa response.
8. Danh tính thực hiện nghiệp vụ phải lấy từ authenticated principal, không lấy `user`, `username` hoặc `user_code` do client tự khai báo.
9. Không hard-code secret, connection string, hostname, port hoặc mật khẩu.
10. Không trả stack trace, SQL error hoặc `Exception.Message` trực tiếp cho client trong production.
11. Không sử dụng mật khẩu mặc định cố định như `123456`. Nếu cần bootstrap/reset, dùng token một lần hoặc mật khẩu ngẫu nhiên bắt buộc đổi.
12. Mọi command thay đổi trạng thái phải hỗ trợ `X-Request-Id` hoặc request ID tương đương để chống gửi lặp.
13. Không thực hiện big-bang rewrite và không tự ý mở rộng phạm vi ngoài phase hiện tại.

## 4. Kiến trúc đích

Tạo solution mới tại repository root:

```text
Wms.sln
src/
  Wms.Api/
  Wms.Application/
  Wms.Domain/
  Wms.Infrastructure/
tests/
  Wms.UnitTests/
  Wms.IntegrationTests/
```

Trách nhiệm:

```text
React
  -> HTTPS / JSON / JWT
Wms.Api
  -> Controllers, authentication, authorization, middleware, OpenAPI
Wms.Application
  -> Use cases, request/response DTO, validation, ports/interfaces
Wms.Domain
  -> Kiểu dữ liệu và quy tắc thuần sự cần thiết; không chứa EF/Dapper/HTTP
Wms.Infrastructure
  -> SQL Server, Dapper, Stored Procedure gateway, identity/integration
SQL Server
  -> Transaction, locking, state transition, idempotency, event, ledger, audit
```

Không tạo abstraction chỉ để đủ “Clean Architecture”. CRUD đọc đơn giản có thể dùng query service rõ ràng. Command nghiệp vụ phải có application service/use case riêng.

## 5. Công nghệ và quy ước

- Dùng phiên bản .NET LTS được cài đặt và hỗ trợ trong môi trường triển khai.
- ASP.NET Core Web API với controller hoặc minimal API nhất quán; ưu tiên controller cho API nghiệp vụ lớn.
- Dapper cho Stored Procedure và SQL read model.
- Chỉ dùng EF Core khi có lý do rõ ràng, ví dụ quản trị identity hoặc migration cho bảng do ứng dụng sở hữu.
- Validation bằng FluentValidation hoặc cơ chế validation tập trung tương đương.
- OpenAPI/Swagger phải được sinh từ API.
- Logging có cấu trúc; hỗ trợ correlation/trace ID.
- Unit test bằng xUnit; integration test phải chạy trên database test riêng, không dùng production database.
- Nullable reference types và analyzers phải bật.
- Build phải chạy với warnings nghiêm ngặt; không che warning bằng cách disable toàn cục.

### 5.1. Chuẩn mã nguồn bắt buộc

Mục tiêu không chỉ là code chạy được. Code phải dễ đọc, dễ kiểm thử, có ownership rõ ràng và tuân thủ một quy chuẩn thống nhất trong toàn solution.

Quy tắc chung:

- Ưu tiên code rõ nghĩa hơn code ngắn hoặc abstraction phức tạp.
- Một class/function chỉ có một trách nhiệm chính và một lý do thay đổi.
- Không dùng tên mơ hồ như `Helper`, `Manager`, `Common`, `Utils`, `ProcessData` nếu không mô tả đúng vai trò.
- Không tạo “god service”, “god controller” hoặc file tập trung toàn bộ module.
- Không copy/paste business rule giữa controller, service và Stored Procedure.
- Không dùng magic string/magic number cho status, role, permission, error code hoặc header.
- Không giữ code chết, comment-out code, debug log, credential mẫu hoặc TODO không có ngữ cảnh.
- Comment giải thích **vì sao**, không lặp lại điều code đã thể hiện.
- Public API và quyết định kiến trúc quan trọng phải có tài liệu ngắn gọn.
- Mọi dependency phải có lý do sử dụng; không thêm package chỉ để thay vài dòng code đơn giản.

### 5.2. Quy chuẩn C# và ASP.NET Core

- Tuân thủ .NET naming conventions: `PascalCase` cho type/public member, `camelCase` cho local/parameter, interface có tiền tố `I`.
- Bật `Nullable`, `ImplicitUsings`, analyzers và formatting thống nhất qua `.editorconfig`.
- Dùng async xuyên suốt luồng I/O và truyền `CancellationToken` từ endpoint xuống database call.
- Không dùng `.Result`, `.Wait()`, `async void` hoặc fire-and-forget cho nghiệp vụ.
- Controller phải mỏng: bind request, gọi application use case và map response; không viết SQL hay business transaction trong controller.
- Application layer không phụ thuộc ASP.NET Core, Dapper, SQL Server hoặc implementation của Infrastructure.
- Domain layer không phụ thuộc project khác trong solution.
- Infrastructure chỉ implement interface/port do lớp trong định nghĩa; không để Application gọi trực tiếp `SqlConnection`.
- DTO API, command/query model và database record model là các kiểu riêng; không trả trực tiếp entity/database row ra API.
- Ưu tiên immutable `record` cho request/response/value object phù hợp.
- Dùng typed options và validate configuration khi startup; không gọi `Environment.GetEnvironmentVariable` rải rác.
- Dùng dependency injection qua constructor; không dùng service locator hoặc global mutable state.
- Exception chỉ dùng cho tình huống bất thường; lỗi nghiệp vụ dự kiến dùng result/error model rõ ràng.
- Bắt exception tại boundary thích hợp; không `catch` chỉ để log rồi `throw` lặp gây log trùng.
- Mọi resource I/O phải được dispose đúng cách; dùng connection factory và connection pool chuẩn.
- Truy vấn SQL phải parameterized. Tên cột sort động phải lấy từ allowlist, không nối trực tiếp input.
- Log dùng message template có cấu trúc, không nối chuỗi và không ghi dữ liệu nhạy cảm.

Dependency rule bắt buộc:

```text
Wms.Domain          -> không phụ thuộc project nào
Wms.Application     -> Wms.Domain
Wms.Infrastructure  -> Wms.Application + Wms.Domain
Wms.Api             -> Wms.Application + Wms.Infrastructure (composition root)
```

Không tạo tham chiếu ngược hoặc circular dependency để giải quyết nhanh lỗi build.

### 5.3. Quy chuẩn tổ chức theo feature

Trong mỗi layer, tổ chức code theo nghiệp vụ/feature thay vì gom toàn bộ theo loại kỹ thuật:

```text
Wms.Application/
  Receiving/
    ScanCarton/
      ScanCartonCommand.cs
      ScanCartonValidator.cs
      ScanCartonHandler.cs
      ScanCartonResult.cs
  Pack360/
  Pallets/
  Picking/
```

- Một vertical slice phải có request, validation, handler/use case và test gần nhau về mặt cấu trúc.
- Shared code chỉ được đưa vào `Common` khi có ít nhất hai consumer thực sự và cùng semantics.
- Không tạo generic repository cho Stored Procedure chỉ nhằm che giấu tên câu lệnh. Dùng gateway/query repository có tên theo nghiệp vụ.

### 5.4. Quy chuẩn React trong giai đoạn migration

- Feature code đặt theo module, không tiếp tục dồn mọi màn hình vào `components/`.
- Component trình bày không tự hard-code API URL hoặc đọc token trực tiếp từ `localStorage`.
- Mọi HTTP call đi qua API client tập trung; server state đi qua query/mutation hook thống nhất.
- Component lớn phải tách page/container, hook và presentational component.
- Không duplicate model, status và error mapping ở nhiều màn hình.
- Route phải có authorization guard theo capability, nhưng backend vẫn là nơi quyết định quyền cuối cùng.
- Không dùng `alert`, `prompt`, `confirm` cho workflow mới; dùng notification/dialog component có accessibility.
- Form phải có validation, loading, disable duplicate submission và error state rõ ràng.
- UI mới phải hỗ trợ keyboard, focus state, label và responsive layout tối thiểu.

### 5.5. Quality gate bắt buộc

Mọi pull request/phase phải vượt qua:

```text
dotnet restore
dotnet format --verify-no-changes
dotnet build --no-restore --warnaserror
dotnet test --no-build
npm run lint
npm run test
npm run build
```

Nếu repository chưa có một script frontend trong danh sách trên, phase foundation phải bổ sung script và cấu hình tương ứng trước khi coi quality gate hoàn chỉnh.

Ngoài ra:

- Không merge khi có test fail, analyzer warning hoặc lỗi format.
- Code mới phải có unit test cho application rule và integration test cho database/API boundary quan trọng.
- Coverage là tín hiệu hỗ trợ, không phải mục tiêu duy nhất; không viết test vô nghĩa chỉ để tăng phần trăm.
- Mọi bug được sửa phải có regression test nếu có thể tái tạo tự động.
- Architecture test phải kiểm tra dependency rule giữa bốn project.
- CI phải dùng cấu hình tương đương môi trường build thực tế và không phụ thuộc secret local.

Quy ước API mới:

```text
/api/v1/{module}/...
```

Header chuẩn:

```http
Authorization: Bearer <token>
X-Request-Id: <unique-id>
X-Device-Id: <optional-device-id>
X-Source-Screen: <optional-screen-code>
```

Response command chuẩn:

```json
{
  "status": "SUCCESS",
  "message": "Xử lý thành công",
  "error_code": null,
  "document_no": null,
  "object_code": null,
  "request_id": "request-id",
  "trace_id": "trace-id"
}
```

Mapping HTTP tối thiểu:

| Trường hợp | HTTP status |
|---|---:|
| Thành công tạo mới | 201 |
| Thành công đọc/cập nhật | 200 |
| Request không hợp lệ | 400 |
| Chưa đăng nhập/token sai | 401 |
| Không đủ quyền | 403 |
| Không tìm thấy | 404 |
| Trùng request/idempotent replay hợp lệ | 200 |
| Xung đột trạng thái/concurrency | 409 |
| Lỗi nghiệp vụ không thuộc các nhóm trên | 422 |
| Lỗi hệ thống không dự kiến | 500 |

## 6. Security baseline bắt buộc

- Mặc định toàn bộ `/api` yêu cầu authenticated user; chỉ login và health endpoint được anonymous rõ ràng.
- Dùng policy-based authorization, không rải kiểm tra chuỗi role trong controller.
- Định nghĩa policy theo capability, ví dụ `Receipt.Scan`, `Pack360.Complete`, `Pallet.Transfer`, `Picking.Ship`, `Admin.Users.Manage`.
- Secret và connection string lấy từ configuration provider/environment/user secrets/secret store.
- Cấu hình CORS bằng allowlist theo môi trường.
- Bật HTTPS, security headers phù hợp và giới hạn kích thước request/import.
- Rate limit login và các endpoint scan nhạy cảm.
- Validate token issuer, audience, signing key, lifetime và clock skew.
- Không log password, token, connection string, barcode payload nhạy cảm hoặc dữ liệu cá nhân không cần thiết.
- Ghi audit cho thay đổi quyền, reset credential và mọi command làm thay đổi tồn kho.
- Health endpoint công khai chỉ trả trạng thái tối thiểu; readiness kiểm tra DB nhưng không lộ chi tiết kết nối.

## 7. Chiến lược tương thích frontend

Trong giai đoạn migration:

- Giữ request/response hiện tại nếu frontend đang phụ thuộc vào chúng, hoặc thêm adapter rõ ràng.
- Dùng reverse proxy để route module đã chuyển sang ASP.NET Core và module chưa chuyển sang Node.js.
- Không hard-code URL backend trong React.
- Tạo API client tập trung và cấu hình base URL bằng environment.
- Khi thay contract, cập nhật OpenAPI, frontend adapter và test trong cùng phase.
- Không đánh dấu module hoàn tất nếu refresh, lỗi 401, lỗi mạng và thao tác gửi lặp chưa được kiểm tra.

## 8. Lộ trình thực hiện

### Phase 0 — Baseline và hồ sơ migration

- [ ] Kiểm tra working tree, không ghi đè thay đổi của người dùng.
- [ ] Ghi nhận toàn bộ endpoint Node.js, authentication, role, request, response và Stored Procedure tương ứng.
- [ ] Tạo bảng contract parity giữa Node.js và ASP.NET Core.
- [ ] Ghi baseline build/test của frontend và backend hiện tại.
- [ ] Xác định API nào đang cập nhật trực tiếp bảng dù đã có Stored Procedure.
- [ ] Xác định các rủi ro P0: endpoint anonymous, hard-coded JWT secret, identity từ body, lỗi trả thẳng từ DB.
- [ ] Chưa thay đổi luồng nghiệp vụ ở phase này.

Đầu ra: `09_Traceability/Backend_Migration_Matrix.md`.

### Phase 1 — ASP.NET Core foundation

- [ ] Tạo solution và bốn project chính.
- [ ] Cấu hình dependency direction đúng.
- [ ] Thêm configuration validation và từ chối khởi động nếu thiếu cấu hình bắt buộc.
- [ ] Thêm Problem Details/error middleware thống nhất.
- [ ] Thêm JWT authentication, policy authorization và CORS allowlist.
- [ ] Thêm Dapper connection factory và Stored Procedure executor.
- [ ] Thêm request ID, trace ID và structured logging.
- [ ] Thêm health/liveness/readiness.
- [ ] Thêm OpenAPI và API versioning.
- [ ] Thêm unit/integration test skeleton.

Tiêu chí hoàn tất:

- `dotnet restore`, `dotnet build` và `dotnet test` thành công.
- Không có secret trong source.
- Endpoint được bảo vệ mặc định.
- Có ít nhất một test chứng minh anonymous bị `401`, sai quyền bị `403`, lỗi hệ thống không lộ chi tiết.

### Phase 2 — Read-only modules

Chuyển lần lượt, không gộp nếu chưa kiểm thử:

1. Reports.
2. Master-data query.
3. Ledger/trace query.

Mỗi module phải có contract parity test và kiểm tra dữ liệu với Node.js trên cùng bộ input đã kiểm soát.

### Phase 3 — Authentication và user administration

- Chuyển login, change password và user administration.
- Thống nhất `ADMIN`/`IT_ADMIN` hoặc capability mapping với frontend.
- Không phát hành credential mặc định yếu.
- Kiểm thử lockout, token expiry, disabled user, forced password change và audit.

### Phase 4 — Receiving và OEM

- Chuyển receipt theo Stored Procedure wrapper.
- Chuyển OEM import/create/update/history.
- Import phải có giới hạn kích thước, validation toàn bộ dữ liệu và rollback đúng.
- Kiểm thử request lặp, scan trùng, sai trạng thái và concurrent scan.

### Phase 5 — Pack360 và Pallet

- Chuyển scan/add/complete/cancel/release/detach/repack.
- Chuyển init/add/remove/transfer/complete/putaway/letdown pallet.
- Không để API tự cập nhật nhiều bảng nghiệp vụ ngoài transaction Stored Procedure.
- Kiểm thử event, ledger, audit và trạng thái sau rollback.

### Phase 6 — Export và Picking

Đây là phase rủi ro cao, chỉ bắt đầu sau khi các phase trước ổn định.

- Chuyển demand/import và tạo delivery note.
- Chuyển picking, split box, complete, stage và ship.
- Bắt buộc conditional update/locking phù hợp, unique constraint và idempotency.
- Không cho over-picking trừ khi business rule được tài liệu hóa và acceptance test xác nhận.
- Kiểm thử hai scanner thao tác đồng thời trên cùng barcode/phiếu.

### Phase 7 — Cutover và loại bỏ Node.js

- [ ] Chạy regression/UAT toàn bộ module.
- [ ] Đối chiếu event, ledger và audit giữa hai implementation.
- [ ] Chuyển reverse proxy sang ASP.NET Core theo module.
- [ ] Có kế hoạch rollback đã thử nghiệm.
- [ ] Theo dõi lỗi, latency và DB contention sau cutover.
- [ ] Chỉ archive/xóa Node.js sau khi người dùng phê duyệt rõ ràng.

## 9. Quy trình bắt buộc cho mỗi module

1. Đọc tài liệu use case, state model, business rule, API và Stored Procedure liên quan.
2. Liệt kê endpoint hiện tại và tạo contract parity table.
3. Xác định permission cho từng endpoint.
4. Viết test case trước cho happy path, validation, unauthorized, forbidden, conflict, duplicated request và DB failure.
5. Implement vertical slice nhỏ nhất.
6. Chạy build, unit test và integration test.
7. So sánh response và database effect với backend Node.js.
8. Kiểm tra event, ledger, audit và rollback.
9. Cập nhật OpenAPI, migration matrix và change log.
10. Báo cáo file đã đổi, lệnh kiểm thử, kết quả, rủi ro còn lại và bước tiếp theo.

Không chuyển sang module kế tiếp khi module hiện tại chưa đạt tiêu chí hoàn tất.

## 10. Test matrix tối thiểu

Mỗi command nghiệp vụ phải có:

- Happy path.
- Thiếu/sai field.
- Anonymous `401`.
- Authenticated nhưng sai quyền `403`.
- Không tìm thấy object `404`.
- State transition không hợp lệ `409` hoặc `422`.
- Gửi lại cùng `request_id` không tạo tác động kép.
- Hai request đồng thời không làm âm tồn hoặc cập nhật kép.
- Stored Procedure lỗi thì toàn bộ transaction rollback.
- Audit dùng username từ token, không dùng identity từ body.
- Response không lộ stack trace hoặc SQL detail.

API query phải kiểm tra pagination, filter, sort allowlist, giới hạn page size và timeout.

## 11. Definition of Done

Một phase chỉ hoàn tất khi:

- Build sạch và test liên quan thành công.
- `dotnet format --verify-no-changes`, analyzer và build `--warnaserror` thành công.
- Architecture test xác nhận không vi phạm dependency rule.
- Controller không chứa SQL/business transaction và Application không phụ thuộc Infrastructure.
- Code tuân thủ `.editorconfig`, naming convention và không có duplicate business rule mới.
- Có OpenAPI cập nhật.
- Có authorization policy và test tương ứng.
- Không có secret/hard-coded environment URL.
- Không có SQL nối chuỗi từ input người dùng.
- Không lấy audit identity từ request body.
- Có request ID/trace ID xuyên suốt.
- Có test rollback và idempotency cho command.
- Frontend vẫn hoạt động với module đã chuyển.
- Migration matrix và change log được cập nhật.
- Không còn TODO mơ hồ hoặc code tạm trong phạm vi phase.

## 12. Cách AI báo cáo sau mỗi lượt

Luôn báo cáo ngắn gọn theo mẫu:

```text
Kết quả:
- Phase/module đã thực hiện
- Các file chính đã tạo hoặc sửa

Kiểm chứng:
- Lệnh đã chạy
- Số test pass/fail
- Contract/database effect đã đối chiếu

Rủi ro còn lại:
- Rủi ro hoặc giả định chưa được xác nhận

Bước tiếp theo:
- Một vertical slice cụ thể, không tự động mở rộng phạm vi
```

Nếu bị chặn bởi database, secret, môi trường hoặc quyết định nghiệp vụ, vẫn hoàn tất mọi công việc an toàn có thể làm, sau đó nêu chính xác thông tin còn thiếu. Không dùng dữ liệu production để thử nghiệm và không tự tạo giá trị giả cho quyết định nghiệp vụ.

## 13. Lệnh khởi đầu dành cho AI

Khi được yêu cầu bắt đầu migration, thực hiện **Phase 0 trước**. Không tạo toàn bộ backend mới ngay lập tức. Sau khi hoàn tất migration matrix và baseline, triển khai **Phase 1 foundation** thành một thay đổi nhỏ có thể build/test độc lập. Dừng và báo cáo kết quả trước khi chuyển module nghiệp vụ đầu tiên.
