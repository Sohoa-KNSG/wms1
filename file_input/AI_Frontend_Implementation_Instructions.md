# AI Implementation Instructions — React Frontend Standardization

## 1. Vai trò và mục tiêu

Bạn là kỹ sư frontend chịu trách nhiệm chuẩn hóa ứng dụng React WMS hiện tại để kết nối an toàn với ASP.NET Core Web API.

Mục tiêu:

- Giữ nguyên React + Vite và các luồng nghiệp vụ đang hoạt động.
- Không viết lại toàn bộ giao diện.
- Chuyển dần từ cấu trúc screen-based sang feature-based.
- Chuẩn hóa routing, authentication, API client, error handling và quality gate.
- Không thay đổi business rule, API contract hoặc UI workflow nếu chưa có yêu cầu rõ ràng.
- Mỗi phase phải nhỏ, kiểm thử được và có khả năng rollback.

## 2. Phạm vi repository

```text
frontend/                       Mã nguồn frontend cần chuẩn hóa
backend/                        Backend Node.js tham chiếu trong giai đoạn chuyển tiếp
src/Wms.Api hoặc Wms.Api/       ASP.NET Core API khi được tạo
02_Process_UseCase/             Tài liệu nghiệp vụ
05_Application_Design/          API contract
06_UI_UX/                       UI rule, screen catalog và wireframe
08_Test_Acceptance/             Acceptance criteria và UAT
09_Traceability/                Tài liệu triển khai và change log
Update/WMS/                     Bản sao tham chiếu; không sửa nếu chưa được yêu cầu
```

Trước khi code phải đọc:

1. `.agents/AGENTS.md`.
2. File này.
3. `09_Traceability/AI_Implementation_Instructions.md`.
4. Tài liệu use case, UI rule và acceptance test của feature đang sửa.
5. API implementation hiện tại và API contract tương ứng.

## 3. Các lỗi hiện tại cần xử lý

### P0

- Refresh có thể bỏ qua màn hình bắt buộc đổi mật khẩu.
- API URL được hard-code tại nhiều component.
- Trộn `fetch`, `axios`, URL tuyệt đối và `/api`.
- Nhiều request nghiệp vụ không gửi Bearer token.
- Username audit lấy từ `localStorage` hoặc fallback thành `testuser`.
- Scale/print service hard-code `http://localhost:8080`, có nguy cơ mixed content khi Portal dùng HTTPS.

### P1

- `App.jsx` điều hướng bằng chuỗi `currentView`, không có router/deep-link.
- Route guard và capability guard chưa tập trung.
- Các component Pallet, Picking, Pack360, Repack và Export quá lớn.
- Pack360/Repack và các màn hình xác nhận nhập kho có nhiều code trùng.
- Có state, handler, import và component không còn được sử dụng.

### P2

- Chưa có lint, formatter, unit test hoặc integration test frontend.
- Không có responsive breakpoint rõ ràng.
- Dùng nhiều `alert`, `confirm`, `prompt`.
- Chưa có server-state management thống nhất.
- Import XLSX phụ thuộc CDN bên ngoài.

## 4. Kiến trúc đích

Giữ một React application, tổ chức theo feature:

```text
frontend/src/
  app/
    App.jsx
    router/
    providers/
    auth/
  api/
    httpClient.js
    apiError.js
    problemDetails.js
  features/
    receiving/
      api/
      hooks/
      components/
      pages/
    packing/
    pallets/
    outbound/
    picking/
    reports/
    administration/
  integrations/
    deviceAgent/
  shared/
    components/
    hooks/
    utils/
    constants/
    styles/
  main.jsx
```

Dependency direction:

```text
app -> features -> shared
app -> api
features -> api + shared
integrations -> api/shared contracts
shared -> không phụ thuộc feature
```

Không để feature này import file nội bộ của feature khác. Nếu cần chia sẻ, dùng public contract hoặc chuyển phần thực sự dùng chung vào `shared`.

## 5. Coding standard bắt buộc

- Component, hook và function phải có một trách nhiệm chính.
- Không tạo god component, generic helper mơ hồ hoặc shared component chỉ có một consumer.
- Không hard-code API URL, port, role, permission, status hoặc error code trong page component.
- Không gọi API trực tiếp từ presentational component.
- Không đọc token/user trực tiếp từ `localStorage` tại feature component.
- Không gửi `username`, `user` hoặc `user_code` để backend dùng làm audit identity.
- Không fallback thành `testuser` hoặc `SYSTEM` ở frontend.
- Không duplicate business rule từ Stored Procedure vào frontend. Frontend chỉ validation định dạng và trải nghiệm người dùng.
- Hook bắt đầu bằng `use`; component dùng `PascalCase`; function/variable dùng `camelCase`; constant thực sự bất biến dùng `UPPER_SNAKE_CASE`.
- Không dùng `any` nếu chuyển sang TypeScript; kiểu `unknown` phải được narrow trước khi dùng.
- Không để code chết, import thừa, debug log, commented-out code hoặc TODO không có lý do.
- Async action phải có loading state, chống submit lặp và xử lý cancellation khi phù hợp.
- Error phải hiển thị thông điệp nghiệp vụ an toàn; chi tiết kỹ thuật chỉ đi vào logging có kiểm soát.
- Comment giải thích lý do hoặc giới hạn nghiệp vụ, không mô tả lại JSX.

## 6. Authentication và authorization

- Auth state được quản lý tại `app/auth`, không phân tán trong component.
- Khi khởi động ứng dụng phải xác minh session/token trước khi render protected route.
- Nếu `must_change_password = true`, mọi protected route phải chuyển sang trang đổi mật khẩu, kể cả sau refresh hoặc nhập URL trực tiếp.
- `401`: xóa session hợp lệ và chuyển về login.
- `403`: giữ session, hiển thị trang/notification không đủ quyền.
- Route guard dùng capability/permission thống nhất với ASP.NET Core policy.
- Ẩn menu chỉ phục vụ UX; backend vẫn là nơi quyết định quyền cuối cùng.
- Không tin roles/user object chỉ vì tồn tại trong local storage.
- Không log hoặc hiển thị token.

Nếu backend hỗ trợ secure HttpOnly cookie, ưu tiên đánh giá phương án này. Nếu giai đoạn chuyển tiếp vẫn dùng Bearer token, việc truy cập token phải được cô lập trong auth store/API client và có kế hoạch giảm rủi ro XSS.

## 7. API client standard

Chỉ có một HTTP client chịu trách nhiệm:

- Base URL từ `VITE_API_BASE_URL` hoặc relative `/api` qua reverse proxy.
- Gắn Authorization theo cơ chế auth thống nhất.
- Gắn `X-Request-Id` cho command làm thay đổi trạng thái.
- Gắn `X-Device-Id` và `X-Source-Screen` khi có cấu hình.
- Timeout và cancellation.
- Parse ASP.NET Core Problem Details và command response chuẩn.
- Xử lý tập trung `401`, `403`, `409`, `422`, `429` và `500`.
- Không tự động retry command không idempotent.
- Không làm mất `trace_id`, `request_id`, `error_code` từ backend.

Không hard-code đường dẫn Node.js hoặc ASP.NET Core trong component. Trong giai đoạn strangler, reverse proxy quyết định backend nào xử lý endpoint.

## 8. Device Agent standard

Scale và printer không được gọi bằng URL hard-code trong page.

Tạo abstraction:

```text
integrations/deviceAgent/
  deviceClient
  scaleService
  printService
  deviceConfig
```

Yêu cầu:

- Endpoint được cấu hình theo môi trường/trạm.
- Có timeout, health status và thông báo khi agent offline.
- Có chiến lược HTTPS hoặc cơ chế được hạ tầng phê duyệt để tránh mixed content.
- Không gửi JWT chính của WMS cho local agent nếu không cần thiết.
- Print command phải có request/job ID để tránh in lặp ngoài ý muốn.
- Không đánh dấu đóng gói hoàn tất chỉ dựa vào kết quả UI nếu backend chưa xác nhận.

## 9. UI, accessibility và responsive

- Không dùng `window.alert`, `window.confirm` hoặc `window.prompt` cho code mới.
- Dùng notification, confirmation dialog và form dialog dùng chung.
- Dialog phải quản lý focus, đóng bằng Escape khi an toàn và có accessible name.
- Input phải có label; lỗi validation phải liên kết với input.
- Button icon phải có accessible label/title phù hợp.
- Có focus-visible state và hỗ trợ thao tác bàn phím.
- Thiết kế tối thiểu cho desktop vận hành, tablet và handheld theo tài liệu UI.
- Scan input phải giữ focus đúng nhưng không cướp focus khi người dùng đang thao tác dialog/form khác.
- Màu sắc không được là tín hiệu duy nhất cho success/error/status.

## 10. Quality gate

`frontend/package.json` phải có tối thiểu:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  }
}
```

Mỗi phase phải chạy:

```text
npm run lint
npm run format:check
npm run test
npm run build
```

Không giảm mức lint, disable rule toàn cục hoặc bỏ test chỉ để quality gate pass.

## 11. Lộ trình thực hiện

### Phase 0 — Baseline và inventory

- [ ] Kiểm tra thay đổi hiện có và không ghi đè code của người dùng.
- [ ] Lập danh sách route/view, API call, token access, hard-coded endpoint và device call.
- [ ] Ghi nhận baseline build và các luồng nghiệp vụ chính.
- [ ] Tạo mapping frontend screen → API endpoint → permission → backend hiện tại/đích.
- [ ] Xác định code chết và code trùng, nhưng chưa xóa.

Đầu ra: `09_Traceability/Frontend_Migration_Matrix.md`.

### Phase 1 — Quality foundation

- [ ] Thêm ESLint, Prettier, Vitest và React Testing Library.
- [ ] Thêm script quality gate.
- [ ] Thiết lập test environment và test render cơ bản.
- [ ] Không format hàng loạt file nghiệp vụ trong cùng thay đổi nếu gây diff lớn.

### Phase 2 — Auth và API client

- [ ] Tạo auth provider/store và HTTP client tập trung.
- [ ] Sửa bypass `must_change_password` sau refresh.
- [ ] Chuẩn hóa `401/403` và Problem Details.
- [ ] Chuyển từng API call sang client; không chuyển toàn bộ trong một commit lớn.
- [ ] Loại bỏ `testuser` và audit identity từ request body.
- [ ] Thêm test auth restoration, forced password change, expired token và forbidden.

### Phase 3 — Routing

- [ ] Thêm React Router.
- [ ] Định nghĩa route constant và capability metadata.
- [ ] Chuyển `currentView` sang route theo từng feature.
- [ ] Hỗ trợ refresh, deep-link, back/forward và protected route.
- [ ] Không thay đổi workflow nghiệp vụ khi chuyển route.

### Phase 4 — Shared UI foundation

- [ ] Notification system.
- [ ] Confirmation và form dialog.
- [ ] Loading, empty, error và forbidden state.
- [ ] Button, input, table/pagination primitives cần thiết.
- [ ] Responsive tokens và accessibility baseline.

Không xây design system quá lớn trước nhu cầu thực tế.

### Phase 5 — Feature refactoring

Thứ tự đề xuất:

1. Reports hoặc master data làm feature mẫu ít rủi ro.
2. Receiving.
3. Pack360/Repack.
4. Pallet.
5. Export/Picking.
6. Administration.

Với mỗi feature:

- Chuyển page, API, hook và component vào feature folder.
- Tách component lớn theo trách nhiệm.
- Hợp nhất code trùng nhưng không hợp nhất business flow khác nghĩa.
- Thêm unit/component test và ít nhất một integration test cho workflow chính.
- Xóa code cũ chỉ sau khi không còn import/route sử dụng.

### Phase 6 — Device integration

- [ ] Tạo Device Agent client chuẩn.
- [ ] Chuyển cân và in khỏi component.
- [ ] Xử lý agent offline, timeout, duplicate print và retry có kiểm soát.
- [ ] Kiểm thử trên môi trường HTTPS giống production.

### Phase 7 — Regression và cutover

- [ ] Chạy toàn bộ quality gate.
- [ ] Kiểm thử UAT các luồng login, scan, receipt, packing, pallet, picking và reports.
- [ ] Kiểm tra frontend với ASP.NET Core route đã chuyển và Node.js route còn lại.
- [ ] Kiểm tra refresh, deep-link, 401, 403, 409, timeout và gửi lặp.
- [ ] Chỉ xóa adapter tương thích Node.js sau khi module backend đã cutover và được phê duyệt.

## 12. Test matrix tối thiểu

Mỗi feature phải kiểm tra:

- Render loading, empty, success và error.
- Validation input.
- Double click/submit không tạo command kép.
- `401` đưa về login.
- `403` không logout người dùng.
- `409/422` hiển thị lỗi nghiệp vụ đúng.
- `429` thông báo giới hạn thao tác.
- Network timeout và cancellation.
- Refresh/deep-link giữ đúng route hoặc khôi phục state an toàn.
- Permission không phù hợp không hiển thị action.
- Backend vẫn từ chối action nếu cố gọi ngoài UI.
- Command giữ `request_id` khi xử lý response/replay.

Workflow scan/packing/picking phải có regression test cho focus, scan trùng và submit liên tiếp.

## 13. Definition of Done

Một phase/feature chỉ hoàn tất khi:

- `lint`, `format:check`, `test` và `build` thành công.
- Không thêm hard-coded endpoint hoặc token access ngoài auth/API layer.
- Không gửi audit username từ frontend.
- Không có `testuser`, code chết hoặc import thừa mới.
- Có loading, error và duplicate submission protection.
- Route/auth/permission liên quan có test.
- UI liên quan sử dụng được bằng bàn phím và ở viewport mục tiêu.
- API contract và migration matrix được cập nhật.
- Không làm thay đổi nghiệp vụ ngoài phạm vi được yêu cầu.
- Có báo cáo file thay đổi, test đã chạy và rủi ro còn lại.

## 14. Cách AI thực hiện và báo cáo

Sau mỗi lượt, báo cáo:

```text
Kết quả:
- Phase/vertical slice đã thực hiện
- File chính đã tạo hoặc sửa

Kiểm chứng:
- Lệnh đã chạy
- Test pass/fail
- Luồng đã kiểm tra

Rủi ro còn lại:
- Giả định, dependency hoặc contract chưa xác nhận

Bước tiếp theo:
- Một vertical slice nhỏ và cụ thể
```

Không tự động chuyển phase khi phase hiện tại chưa đạt Definition of Done. Không dùng production API/database để test. Khi thiếu quyết định nghiệp vụ, hoàn thành các kiểm tra an toàn còn lại rồi báo chính xác điều cần người dùng xác nhận.

## 15. Lệnh khởi đầu dành cho AI

Khi được yêu cầu bắt đầu, thực hiện **Phase 0** và tạo `Frontend_Migration_Matrix.md`. Sau đó triển khai **Phase 1 quality foundation** thành thay đổi độc lập. Dừng và báo cáo trước khi sửa authentication, routing hoặc feature nghiệp vụ.
