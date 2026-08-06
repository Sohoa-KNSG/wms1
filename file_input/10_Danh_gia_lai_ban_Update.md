# 10. Đánh giá lại bản Update

> Phạm vi: `Update/WMS` tại 2026-07-22  
> Phương pháp: diff với mã chính, static review schema/SP/API/UI, `node --check` backend và `vite build` frontend. Chưa chạy migration hay integration test trên SQL Server.

## 1. Kết luận

Bản Update đã cải thiện rõ rệt so với lần rà soát trước, nhưng **chưa sẵn sàng triển khai production**. Điểm đánh giá tổng hợp: **3,2/5**.

| Nhóm | Mức đánh giá |
|---|---:|
| Receipt và dual-level ledger | 4/5 |
| Lịch sử Thùng60 | 3.5/5 |
| Lịch sử Pack360 | 3/5 |
| Outbound và xuất cổng | 2/5 |
| Trace/reconciliation | 3.5/5 |
| Security API | 2.5/5 |
| UI/UX | 3.2/5 |
| Build/syntax | 4/5 |

## 2. Nội dung đã hoàn thành tốt

- Receipt pipeline cũ đã ghi thêm `item_ledger`, `thung60_event` và audit.
- `pack360_unit_history.removed_at` đã cho phép `NULL`; có actor, event ID và request ID.
- Khi thêm unit đã tạo membership history, Pack360 event và Thùng60 event.
- Cancel Pack360 chuyển trạng thái thay vì hard-delete.
- Cancel/release/detach đã đóng `pack360_unit.is_current` và membership history.
- Đã sửa các tên cột cũ `pack_no`, `qr_code`, `initial_qty`, `location` trong vùng code được quét.
- Split outbound đã bổ sung các trường NOT NULL còn thiếu.
- Shipping Pack360 đã bung ledger xuống từng Thùng60.
- Pallet event đã có `request_id`, không còn vi phạm NOT NULL trực tiếp.
- Trace và reconciliation API đã gắn `verifyToken`.
- Reconciliation không còn chỉ tính `AVAILABLE`, đã mở rộng nhóm on-hand.
- UI bỏ credential mặc định, chặn role rỗng, nhóm menu theo workflow, thêm Toast và breakpoint PDA.
- Toàn bộ JavaScript backend vượt qua syntax check; frontend production build thành công.

## 3. Lỗi P0 còn lại

### P0-01 — Luồng Gate Check xuất hàng nhưng không post ledger

`POST /api/picking/gate-check` cập nhật `delivery_note_header.status = 'SHIPPED'`, nhưng không:

- cập nhật trạng thái Thùng60/Pack360;
- ghi `thung60_event`/`pack360_event`;
- ghi `stock_transaction_book`;
- ghi `inventory_ledger` và `item_ledger`;
- ghi audit trong cùng transaction.

Trong khi endpoint `/ship` cũ mới thực hiện các bước trên. UI `ExportGateApprovalScreen` gọi `/gate-check`, vì vậy luồng mới có thể làm chứng từ đã SHIPPED nhưng tồn và ledger chưa giảm.

**Kiến nghị:** chỉ có một application command `shipDeliveryNote`. Gate check phải gọi command này sau khi kiểm tra điều kiện hoặc stored procedure atomic; không được có hai đường chuyển sang SHIPPED.

### P0-02 — Storekeeper approval bỏ qua event staging

`/approve-storekeeper` chuyển header từ `PICKED` sang `STAGED`, nhưng không cập nhật unit và không ghi stage event như endpoint `/stage`.

**Kiến nghị:** hợp nhất `/approve-storekeeper` với logic `/stage`; approval là điều kiện/metadata của transition, không phải một đường update riêng.

### P0-03 — Schema không có các cột mà outbound mới sử dụng

Code mới đọc/ghi các cột chưa có trong `Update/WMS/schema.sql`:

- `delivery_note_header.delivery_location`
- `approved_by`, `approved_at`, `approval_note`
- `security_checked_by`, `security_checked_at`
- `driver_name`, `seal_no`, `gate_note`
- `delivery_note_detail.customer_name`
- `delivery_note_detail.box_virtual`

`truck-summary` cũng SUM `box_virtual`. Nếu database chỉ dựng từ schema update, các endpoint tạo phiếu, duyệt, gate check và truck summary sẽ lỗi.

**Kiến nghị:** bổ sung versioned migration và index/constraint; không chỉ sửa `schema.sql` thủ công.

### P0-04 — Outbound, picking và Pack360 vẫn không có authentication

Trace/reconciliation đã có JWT, nhưng các route thay đổi tồn quan trọng vẫn chưa gắn `verifyToken`:

- `/api/export`
- `/api/picking`
- `/api/pack360`

Client gửi username trong body và backend có fallback `SYSTEM`, `THU_KHO`, `BAO_VE`. Người gọi có thể giả mạo actor.

**Kiến nghị:** `router.use(verifyToken)`, actor chỉ lấy từ `req.user`, permission riêng cho pick/stage/storekeeper approval/gate ship.

### P0-05 — Không kiểm tra số dòng bị update trước khi trả thành công

Các endpoint complete/approve/gate/truck-stage có thể không update dòng nào do trạng thái sai nhưng vẫn trả `{success: true}`.

**Kiến nghị:** kiểm tra `rowsAffected`; nếu bằng 0 trả 409 `INVALID_STATE_TRANSITION`; lock và validate trạng thái trong transaction.

## 4. Lỗi lịch sử Pack360 còn lại

### Thiếu `CREATE_PACK` và `COMPLETE_PACK`

SP mới ghi `ADD_UNIT`, `CANCEL_PACK`, `RELEASE_PACK`, `DETACH_UNIT`, nhưng chưa ghi event khi tạo header và khi complete.

### Request ID chưa thật sự idempotent

Các SP thường gọi `NEWID()` riêng cho membership, Pack360 event và Thùng60 event. Những dòng của cùng command không chia sẻ một request ID; API retry tạo thao tác mới.

**Kiến nghị:** API nhận/tạo một request ID duy nhất, truyền vào SP và dùng cho mọi record trong transaction; kiểm tra `command_request_log` trước mutation.

### Trạng thái event Thùng60 chưa phản ánh thực tế

Event `PACK_INTO_360` đang ghi `new_status = 'AVAILABLE'` và snapshot cũng chỉ cập nhật pointer, trong khi catalog mô tả `PACKED_360`. Cancel/release/detach cũng ghi old/new `AVAILABLE` cố định.

**Kiến nghị:** quyết định rõ status unit có đổi khi pack hay chỉ quan hệ thay đổi. Event phải lấy giá trị thực tế trước update, không hard-code.

### Thiếu Pack event cho pallet/location/repack

Chưa thấy ghi `PALLETIZE_PACK`, `DEPALLETIZE_PACK`, putaway/letdown hoặc liên kết repack pack cũ–mới.

## 5. Lỗi trace và reconciliation

- Trace order vẫn dựa chủ yếu vào `current_oem_order_no`, chưa phải lịch sử ownership.
- Trace unit chưa hợp nhất pallet/location, scan log, delivery barcode và audit thành một timeline.
- Reconciliation dùng danh sách status hard-code thay vì status catalog `is_on_hand`.
- Danh sách có `PACKED`, trong khi event catalog/schema nghiệp vụ còn dùng `PACKED_360`; dễ bỏ sót tồn.
- Reconciliation chỉ tổng hợp theo product, chưa kiểm theo unit/order/location/document.
- Chưa có persistence cho reconciliation run/exception và cảnh báo tự động.

## 6. Đánh giá UI/UX bản Update

### Đã cải thiện

- Login không điền sẵn tài khoản/mật khẩu.
- Tài khoản không role không còn được mặc định là staff.
- Home được nhóm theo bốn vùng nghiệp vụ.
- Có breakpoint 600 px, touch target 48 px, sticky header/table header.
- Có component Toast và màn duyệt xuất/kiểm cổng mới.

### Còn thiếu

- 12 component vẫn dùng `alert()` hoặc `window.confirm()`.
- Toast chưa có `role="status"`/`alert`, `aria-live`; nút đóng thiếu `aria-label`.
- Card Home vẫn là `div onClick`, không có `tabIndex`, Enter/Space hay semantic button.
- Nhiều inline styles; breakpoint mới chỉ xử lý layout chung, chưa chuyển bảng lớn thành mobile cards.
- ExportGateApprovalScreen vẫn dùng alert và gọi API không token.
- Header/route state vẫn dựa vào `currentView`, refresh/back tiếp tục mất context.
- Bundle tăng lên khoảng 480 KB raw; chưa code-split màn hình lớn.

## 7. Rủi ro thiết kế outbound mới

Luồng hiện có nhiều endpoint cùng thay đổi trạng thái:

```text
/complete
/approve-storekeeper
/gate-check
/truck-complete
/truck-stage
/stage
/ship
```

Điều này tạo nhiều đường đi khác nhau tới `PICKED`, `STAGED`, `SHIPPED`; chỉ một số đường ghi event/ledger. Đây là nguyên nhân chính làm dữ liệu khó kiểm soát.

Kiến nghị chuẩn hóa thành ba command duy nhất:

1. `completePicking`: validate quantity → PICKED.
2. `approveAndStage`: storekeeper approval + unit events → STAGED.
3. `gateCheckAndShip`: gate evidence + unit/pack transition + dual ledger → SHIPPED.

Command theo chuyến xe phải gọi từng document command trong transaction/batch có kết quả chi tiết, không update status hàng loạt trực tiếp.

## 8. Thứ tự sửa đề xuất

1. Hợp nhất gate-check với ship và approve với stage.
2. Bổ sung migration các cột outbound còn thiếu.
3. Gắn authentication/RBAC cho export, picking và Pack360.
4. Kiểm tra `rowsAffected` và state transition.
5. Bổ sung CREATE/COMPLETE Pack360 event và request ID xuyên suốt.
6. Hoàn thiện trace order/unit/location và status catalog.
7. Hoàn thiện accessibility/mobile patterns và thay alert/confirm.

## 9. Điều kiện chấp nhận bản Update

- Một chứng từ chỉ có một đường chuyển trạng thái hợp lệ.
- Mọi đường SHIPPED đều ghi unit/pack event và hai ledger trong cùng transaction.
- Schema sạch chạy được mọi endpoint mới.
- Actor lấy từ JWT; không nhận actor tin cậy từ request body.
- Pack360 có đủ create→add→complete→detach/release/repack→ship events.
- Retry cùng request ID không tạo dữ liệu trùng.
- Reconciliation unit/item/snapshot bằng 0 trên bộ dữ liệu nghiệm thu.
- Integration test chứng minh rollback khi lỗi giữa transaction.
- Critical UI flow dùng được trên PDA và bàn phím.

