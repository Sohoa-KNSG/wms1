# 09. Đánh giá UI/UX và tính thuận tiện

> Ngày rà soát: 2026-07-22  
> Phương pháp: static review toàn bộ 27 component React, stylesheet, luồng điều hướng và production build. Chưa thực hiện usability test với người dùng kho hoặc thiết bị quét thật.

## 1. Kết luận

Giao diện đã có nền tảng tốt cho ứng dụng kho nội bộ: màu trạng thái rõ, màn hình theo tác vụ, nút tương đối lớn, luồng scan giữ focus và hiển thị tiến độ trực quan. Production build thành công.

Tuy nhiên, trải nghiệm tổng thể hiện ở mức **prototype sử dụng được**, chưa đạt mức tối ưu cho vận hành kho cường độ cao. Các vấn đề chính là:

1. Trang chủ quá nhiều chức năng, chưa nhóm theo quy trình hay công việc trong ca.
2. Không có breakpoint responsive; nhiều màn hình lớn khó dùng trên PDA/điện thoại.
3. Accessibility và thao tác bàn phím chưa đạt: card dùng `div`, label không liên kết input, thiếu ARIA và focus management.
4. Dùng nhiều native `alert/confirm`, làm gián đoạn luồng và khó chuẩn hóa phản hồi.
5. URL/API, loading, error và retry không thống nhất giữa màn hình.
6. Các màn hình Pack360/Repack gần như trùng lặp, làm trải nghiệm và bảo trì dễ lệch.
7. Một số quyết định gây rủi ro vận hành: tài khoản mẫu/mật khẩu hiển thị, mặc định sẵn credential, cho role rỗng quyền staff và chặn phím Tab tại màn hình scan.

## 2. Điểm số tổng quan

| Tiêu chí | Điểm / 5 | Nhận xét |
|---|---:|---|
| Dễ hiểu tác vụ | 3.5 | Tên module tương đối rõ nhưng thuật ngữ pha Việt–Anh/UC code |
| Tốc độ thao tác kho | 3.5 | Luồng scan tốt; nhiều modal/alert và bước thừa ở luồng khác |
| Nhất quán | 2.5 | Style, API client, thông báo và pattern form khác nhau |
| PDA/mobile | 2.0 | Có grid/co giãn tự nhiên nhưng không có media query chuyên biệt |
| Phòng tránh sai sót | 2.5 | Có confirm/validation cục bộ; thiếu summary và rule nhất quán |
| Phản hồi hệ thống | 3.0 | Nhiều loading/success/error; một số lỗi chỉ console hoặc alert |
| Accessibility | 1.5 | Thiếu semantic, keyboard, ARIA, live region và focus chuẩn |
| Khả năng học | 3.0 | Có mô tả module; thiếu hướng dẫn theo bước và thuật ngữ chuẩn |
| Khả năng phục hồi | 2.0 | Không deep link/restore, retry/idempotency UX chưa rõ |
| Tổng thể | **2.6/5** | Dùng được nội bộ, cần hardening trước triển khai diện rộng |

## 3. Điểm mạnh

- Palette công nghiệp, tương phản trạng thái success/error/warning tương đối rõ.
- Touch target của nút chính thường đủ lớn.
- Màn hình scan hiển thị yêu cầu, đã quét, còn thiếu và log năm lần gần nhất.
- Focus được trả về ô scan sau request, phù hợp máy quét hoạt động như bàn phím.
- Các thao tác nguy hiểm như cancel/release/reset có bước xác nhận.
- Form và card có cấu trúc trực quan; bảng hỗ trợ cuộn ngang.
- Role được dùng để giảm bớt module không liên quan trên trang chủ.
- Có loading/disabled state ở nhiều thao tác bất đồng bộ.
- Build Vite production thành công; không phát hiện lỗi cú pháp frontend.

## 4. Vấn đề toàn hệ thống

### UX-P0-01 — Credential mẫu xuất hiện trên màn hình đăng nhập

`LoginScreen` đặt sẵn `nhanvien/123456` và hiển thị tài khoản/mật khẩu chung. Điều này vừa gây rủi ro bảo mật vừa khiến người dùng dễ đăng nhập nhầm bằng tài khoản dùng chung.

**Kiến nghị:** chỉ cho phép demo credential trong build development; production để trống, hỗ trợ password manager và thông báo môi trường rõ ràng.

### UX-P0-02 — Role rỗng được xem là nhân viên

Trang chủ coi `roles.length === 0` là `isStaff`. Tài khoản chưa phân quyền vẫn thấy chức năng nhập, Pack360, pallet và các tác vụ kho.

**Kiến nghị:** mặc định deny; role rỗng chỉ thấy thông báo “Tài khoản chưa được phân quyền” và liên hệ quản trị.

### UX-P0-03 — Feedback có thể gây thao tác lặp

Một số request không có trạng thái idempotency/retry rõ. Khi mạng chậm, người dùng có thể scan hoặc bấm lại vì không biết server đã nhận chưa.

**Kiến nghị:** mỗi command có request ID từ client, nút/ô scan khóa đúng phạm vi, hiển thị “đã nhận/đang xử lý/đã hoàn tất”, và retry trả kết quả cũ.

### UX-P1-01 — Điều hướng không có URL/deep link

`App.jsx` dùng chuỗi `currentView`; refresh sẽ quay về home và mất phiếu/dòng đang thao tác. Nút Back của trình duyệt không hoạt động theo màn hình.

**Kiến nghị:** dùng React Router, route guard và params cho document/unit; lưu draft context có thời hạn cho scan/pack/picking.

### UX-P1-02 — Trang chủ quá dài và không theo workflow

Nhiều card giống nhau, icon lặp lại, có cả tên use case kỹ thuật như UC09/UC10/UC22.1. Người vận hành phải đọc toàn bộ để tìm tác vụ.

**Kiến nghị:** nhóm theo “Nhập kho”, “Đóng gói & lưu trữ”, “Xuất kho”, “Kiểm soát & báo cáo”, “Quản trị”; ưu tiên “Công việc của tôi”, recent task và badge backlog.

### UX-P1-03 — Header không phản ánh toàn hệ thống

Header luôn hiển thị `WMS INBOUND` dù người dùng đang OEM, outbound, picking hoặc báo cáo.

**Kiến nghị:** header gồm tên trang hiện tại, breadcrumb ngắn, site/warehouse, user/role và trạng thái kết nối.

### UX-P1-04 — Không có responsive design rõ ràng

Stylesheet không có `@media`. Các màn Pallet, Picking, Export, Report và Admin chứa bảng/form/tab lớn; co màn hình chủ yếu dựa vào flex và cuộn ngang.

**Kiến nghị:** định nghĩa breakpoint PDA 360–480 px, tablet 768 px và desktop; trên PDA chuyển bảng thành card/list, sticky primary action và tối đa một cột.

### UX-P1-05 — Native alert/confirm quá nhiều

`alert()`/`window.confirm()` xuất hiện rộng ở receipt, export, picking, master data, ledger và admin. Native dialog chặn UI, khó đọc thông tin dài, không có action phụ chuẩn và không lưu được context.

**Kiến nghị:** component `Toast`, `InlineAlert`, `ConfirmDialog`; destructive dialog phải hiển thị đối tượng, tác động, lý do và nút hành động cụ thể.

### UX-P1-06 — Thiếu accessibility

- Card trang chủ là `div onClick`, không focus/tab/Enter được.
- Phần lớn label không có `htmlFor` và input không có `id`.
- Icon-only header button chỉ dựa vào `title`, thiếu `aria-label`.
- Status thay đổi không có `aria-live`.
- Modal chưa thể hiện `role="dialog"`, focus trap và trả focus.
- Màu được dùng mạnh để truyền đạt trạng thái, dù một số nơi có icon/text bổ trợ.

**Kiến nghị:** dùng semantic button/link, label association, ARIA live region, dialog chuẩn, visible focus và kiểm thử WCAG 2.2 AA.

### UX-P1-07 — Inline style quá nhiều

Các component lớn có 50–100 inline style blocks; `RealtimeReportScreen`, `PalletScreen`, `PickingScreen`, `Pack360Screen` là các điểm nóng. Điều này làm breakpoint, theme, focus/hover và consistency khó quản lý.

**Kiến nghị:** xây design system nhỏ gồm PageHeader, Card, Button, Field, ScannerInput, StatusBadge, DataTable/MobileList, Tabs, Modal, EmptyState và Toast.

## 5. Đánh giá theo luồng

### 5.1. Đăng nhập và đổi mật khẩu

**Tốt:** form ngắn, loading rõ, thông báo lỗi ở trong trang, bắt buộc đổi mật khẩu được khóa điều hướng.

**Thiếu:** credential mặc định; không có hiện/ẩn mật khẩu, Caps Lock warning, quên mật khẩu, session-expired message; password policy chỉ hiện sau submit; không đưa focus về field lỗi.

### 5.2. Trang chủ

**Tốt:** phân quyền ẩn/hiện module, mô tả ngắn, card lớn.

**Thiếu:** chưa nhóm quy trình; icon PackageSearch lặp lại; terminology pha trộn; không có badge việc chờ; card không accessible; hover bằng handler inline không có ý nghĩa trên màn cảm ứng.

### 5.3. Nhập kho và scan Thùng60

**Tốt nhất trong hệ thống:** tiến độ trực quan, số còn thiếu nổi bật, focus tự động, log scan thành công/thất bại, xem danh sách đã scan, primary action sticky.

**Cần sửa:** chặn phím Tab làm người dùng bàn phím không thoát được; forced focus có thể giành focus khỏi thao tác khác; thông báo “khóa cứng Focus” mang tính kỹ thuật; không có âm thanh/rung phân biệt success/error; chưa hiển thị trạng thái offline/timeout và request ID; primary action “Hoàn tất” thực chất quay lại, dễ hiểu nhầm là post dữ liệu.

**Đề xuất:** scanner mode có nút bật/tắt; Enter scan, Escape tạm dừng; beep/rung cấu hình; success xanh ngắn, error đỏ giữ lại; nút đáy ghi đúng “Quay lại danh sách dòng” nếu không thực hiện confirm.

### 5.4. Duyệt phiếu và nhập lẻ

**Tốt:** có validation số lượng và confirm thao tác quan trọng.

**Thiếu:** dùng nhiều alert; hai component `StorekeeperConfirmOverview` và `PartialReceiptOverview` trùng logic; người dùng khó thấy tác động ledger/thùng ảo; input yêu cầu số nguyên trong khi schema quantity là decimal; thiếu summary trước confirm.

**Đề xuất:** một màn duyệt với action drawer “Nhập đủ/Nhập lẻ/Hủy scan”, hiển thị planned–scanned–loose–variance và danh sách thùng bị tác động.

### 5.5. Pack360 và Repack

**Tốt:** có scan, cân, in, release/detach và trạng thái phiên.

**Thiếu:** hai component gần như sao chép; nhiều tác vụ khác nhau trên một màn; phụ thuộc agent `localhost:8080` nhưng không có health indicator; manual weight chưa thể hiện quyền/lý do rõ; nguy cơ rời trang làm mất phiên.

**Đề xuất:** wizard theo bước Scan → Validate → Weigh → Complete → Print; hiển thị agent/device online; autosave session; Repack tái sử dụng cùng component với mode/policy khác.

### 5.6. Pallet và putaway

**Tốt:** chia tab theo palletize, depalletize, transfer, inquiry và shelving; nhiều ô scan có autofocus.

**Thiếu:** component 760 dòng, mật độ chức năng cao; nhiều autofocus trong cùng component; trạng thái bước dựa vào state cục bộ; nhãn và thông tin thành công/lỗi chưa theo một pattern; thiếu xác nhận pallet đích bằng summary.

**Đề xuất:** task-based routes riêng, mỗi màn chỉ một scanner chính; stepper; summary pallet nguồn/đích; cảnh báo sản phẩm/order không đồng nhất trước commit.

### 5.7. Outbound và picking

**Tốt:** có tab trạng thái, drill vào phiếu/dòng, scan history và hỗ trợ split.

**Thiếu:** nhiều alert/confirm; “complete/stage/ship” cần guard và summary mạnh hơn; chưa thể hiện rõ requested–picked–variance ở mọi bước; over-pick được backend cho phép nhưng UI chưa cảnh báo mức độ; không có trạng thái máy quét/offline.

**Đề xuất:** workflow header cố định PENDING_PICK → PICKING → PICKED → STAGED → SHIPPED; action chỉ bật khi đủ điều kiện; exception override yêu cầu quyền và lý do.

### 5.8. OEM, master data và admin

**Tốt:** có list, search/filter, modal CRUD/import và history OEM.

**Thiếu:** bảng khó dùng trên PDA; import validation cần file-level summary; form label chưa liên kết; destructive admin dùng native confirm; reset password mặc định tạo UX/bảo mật xấu.

**Đề xuất:** các màn này ưu tiên desktop/tablet; responsive table; validation theo dòng; random temporary password/invite flow; audit preview trước thao tác admin.

### 5.9. Ledger và báo cáo tồn

**Tốt:** có filter thời gian/type, master-detail, macro/micro/location và export.

**Thiếu:** thuật ngữ kế toán/kho chưa có tooltip; trạng thái empty/error chưa thống nhất; report lớn có nhiều inline style; “realtime” chưa hiển thị last refreshed; filter không lưu khi quay lại.

**Đề xuất:** filter bar dùng chung, URL query state, last refreshed/data as-of, saved views và drill-through theo transaction/document/unit.

## 6. Design system đề xuất

### Thành phần dùng chung

- `AppShell`, `PageHeader`, `Breadcrumb`, `RoleContext`.
- `Button` với variant primary/secondary/danger và loading.
- `FormField` có label, hint, error và required indicator.
- `ScannerInput` có focus mode, device state, beep/rung và request state.
- `StatusBadge` lấy màu/text từ status catalog.
- `Toast`, `InlineAlert`, `ConfirmDialog`.
- `DataTable` desktop và `MobileRecordList` PDA.
- `TaskStepper`, `SummaryPanel`, `EmptyState`, `Skeleton`.

### Touch/PDA standards

- Touch target tối thiểu 44×44 px; tác vụ scan chính 52–56 px.
- Font body tối thiểu 16 px cho màn thao tác kho.
- Không yêu cầu hover để hiểu hoặc thao tác.
- Một primary action trên mỗi bước.
- Thông tin quan trọng nằm trong vùng nhìn đầu tiên; tránh cuộn qua form dài.
- Hỗ trợ scan liên tục mà không chạm màn hình, nhưng luôn có đường thoát bằng bàn phím.

## 7. Ưu tiên triển khai

### P0 — An toàn vận hành

1. Bỏ credential mặc định khỏi production.
2. Mặc định từ chối tài khoản không có role.
3. Chuẩn hóa trạng thái request/idempotency để tránh thao tác lặp.
4. Sửa tên/nội dung action gây hiểu nhầm ở ScanScreen.

### P1 — Thuận tiện và nhất quán

1. Responsive PDA cho inbound, Pack360, pallet và picking.
2. Design system và feedback components; bỏ native alert/confirm.
3. Router, route guard và khôi phục context.
4. Nhóm lại trang chủ theo workflow và backlog.
5. Tách component lớn; hợp nhất Pack360/Repack.
6. Accessibility WCAG AA.

### P2 — Tối ưu năng suất

1. Âm thanh/rung và scanner mode.
2. Device/scale/print health indicator.
3. Saved filter/recent task.
4. Telemetry UX: task time, error/retry, abandon rate.
5. Usability test tại kho và điều chỉnh từ dữ liệu thực tế.

## 8. Kế hoạch kiểm thử người dùng

Chọn ít nhất 2 người cho mỗi vai trò nhân viên nhập, thủ kho, đóng gói, pallet, picking và supervisor. Kiểm thử trên desktop, tablet/PDA và máy quét thật với các kịch bản:

1. Đăng nhập/đổi mật khẩu.
2. Tìm phiếu, map order, scan 10 thùng gồm lỗi trùng/sai SKU.
3. Xác nhận đủ và nhập lẻ.
4. Tạo/complete/cancel/release Pack360.
5. Palletize, transfer và putaway.
6. Pick nguyên thùng, split, stage và ship.
7. Truy tìm transaction và báo cáo tồn.

Đo: task completion, thời gian, số lần chạm/phím, error, retry, nhu cầu hỗ trợ và mức tự tin sau thao tác. Mục tiêu critical task success ≥ 95%, không có destructive error, scan feedback < 1 giây khi backend đáp ứng và người dùng hoàn thành luồng chính không cần hướng dẫn sau đào tạo.

## 9. Definition of Done

Giao diện được xem là thuận tiện khi:

- Mỗi vai trò nhìn thấy đúng công việc và không thấy chức năng trái quyền.
- Critical workflow sử dụng tốt trên PDA bằng scan/keyboard và touch.
- Refresh/back không làm mất context giao dịch quan trọng.
- Mọi thao tác có loading, success, error, retry và idempotency rõ.
- Destructive action hiển thị đúng tác động và yêu cầu lý do khi cần.
- Không còn native alert/confirm trong luồng chính.
- Component đáp ứng keyboard/screen reader và WCAG 2.2 AA.
- Usability test thực tế đạt mục tiêu đã thống nhất.

