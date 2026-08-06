# Frontend Data Load Matrix — WMS
**CR:** CR-WMS-2026-07-FE-BE-PARITY-01 | **Cập nhật lần cuối:** 2026-07-23

> **Quy tắc:** Chỉ đặt trạng thái `Verified` khi: endpoint tồn tại, policy đúng, frontend gọi đúng URL, contract khớp, không dùng demo fallback, có automated test hoặc bằng chứng integration test.

---

## Trạng thái hợp lệ

| Ký hiệu | Ý nghĩa |
|---|---|
| `Not Started` | Chưa bắt đầu migration |
| `Backend Missing` | Endpoint ASP.NET Core chưa tồn tại |
| `Frontend Legacy` | Component vẫn gọi port 3001 hoặc authenticatedFetch |
| `In Progress` | Đang sửa |
| `Ready for Test` | Code đã sửa, chờ test integration |
| `Verified` | Đã test đầy đủ, đạt DoD |
| `Blocked` | Cần quyết định business/architecture |

---

## 1. Auth / Identity

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| LoginScreen | `/login` | `httpClient.post` (inline) | `POST /api/v1/auth/login` | `POST auth/login` ✅ | AllowAnonymous | `Ready for Test` | Demo login fallback còn trong code — **SEC-03** |
| ChangePasswordScreen | `/change-password` | `fetch` trực tiếp | `http://{host}:3001/api/auth/change-password` ❌ | `POST auth/change-password` ✅ | `[Authorize]` | `Frontend Legacy` | **API-01 vi phạm** port 3001 |
| AdminUserList | `/admin/users` | `adminApi.getUsers` ✅ | `GET /api/v1/auth/users` | `GET auth/users` ✅ | `AdminUsersManage` | `Ready for Test` | — |
| AdminUserList | `/admin/users` | `adminApi.createUser` ✅ | `POST /api/v1/auth/admin/users` | `POST auth/admin/users` ✅ | `AdminUsersManage` | `Ready for Test` | — |

---

## 2. Receiving (UC02/UC03)

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| ReceiptList | `/receipts` | `receivingApi.getAllHandovers` ✅ | `GET /api/v1/receipt/handovers` | `GET receipt/handovers` ✅ | `Receipt.Read` | `Verified` | Hỗ trợ /receiving/handovers/:handoverNo |
| ReceiptDetail | `/receiving/handovers/:handoverNo` | `receivingApi.getHandoverDetails` ✅ | `GET /api/v1/receipt/handover/{no}` | `GET receipt/handover/{no}` ✅ | `Receipt.Read` | `Verified` | Đọc useParams, refresh không mất state |
| ScanScreen | `/receiving/handovers/:handoverNo/lines/:lineNo/scan` | `receivingApi.scanThung60` ✅ | `POST /api/v1/receipt/scan-thung60` | `POST receipt/scan-thung60` ✅ | `Receipt.Scan` | `Verified` | Đọc useParams | ScanScreen | `/scan` (state) | `receivingApi.scanThung60` ✅ | `POST /api/v1/receipt/scan-thung60` | `POST receipt/scan-thung60` ✅ | `Receipt.Scan` | `Ready for Test` | Refresh mất context — **ROUTE-01** | searchParams |
| ScanScreen | `/scan` | `receivingApi.scanBarcode` ✅ | `POST /api/v1/receipt/scan` | `POST receipt/scan` ✅ | `Receipt.Scan` | `Ready for Test` | — |
| ScanScreen | `/scan` | `receivingApi.mapOrder` ✅ | `POST /api/v1/receipt/map-order` | `POST receipt/map-order` ✅ | `Receipt.Scan` | `Ready for Test` | — |
| OrderSelectionModal | (modal) | `receivingApi.searchOrders` ✅ | `GET /api/v1/receipt/orders/search` | `GET receipt/orders/search` ✅ | `Receipt.Read` | `Ready for Test` | — |
| StorekeeperConfirmOverview | `/receiving/confirm/:handoverNo` | `receivingApi.getConfirmList` ✅ | `GET /api/v1/receipt/confirm-list` | `GET receipt/confirm-list` ✅ | `Receipt.Confirm` | `Verified` | Đọc useParams, refresh giữ nguyên |
| PartialReceiptOverview | `/receiving/partial/:handoverNo` | `receivingApi.getConfirmHandoverLines` ✅ | `GET /api/v1/receipt/confirm-handover/{no}/lines` | `GET receipt/confirm-handover/{no}/lines` ✅ | `Receipt.Confirm` | `Verified` | Đọc useParams |

---

## 3. Pack360 / Packing

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| Pack360Screen | `/pack360` | `packingApi.scanUnit` ✅ | `POST /api/v1/pack360/scan-unit` | `POST pack360/scan-unit` ✅ | `Pack360.Scan` | `Verified` | Đã loại bỏ axios và testuser fallback |
| Pack360Screen | `/pack360` | `packingApi.completePack` ✅ | `POST /api/v1/pack360/complete` | `POST pack360/complete` ✅ | `Pack360.Complete` | `Verified` | Qua quality gate |
| Pack360Screen | `/pack360` | `packingApi.cancelPack` ✅ | `POST /api/v1/pack360/cancel` | `POST pack360/cancel` ✅ | `Pack360.Cancel` | `Ready for Test` | — |
| Pack360Screen | `/pack360` | `packingApi.getPackInfo` ✅ | `GET /api/v1/pack360/{id}` | ❌ MISSING | `Pack360.Read` | `Backend Missing` | Endpoint chưa có |
| RepackScreen | `/repack` | `packingApi.releasePack` ✅ | `POST /api/v1/pack360/release` | `POST pack360/release` ✅ | `Pack360.Release` | `Verified` | Backend endpoint + FE API đã bổ sung |
| RepackScreen | `/repack` | `packingApi.completeRepack` ✅ | `POST /api/v1/pack360/complete-repack` | `POST pack360/complete-repack` ✅ | `Pack360.Complete` | `Verified` | Backend endpoint + FE API đã bổ sung |
| DetachCartonsScreen | `/detach-cartons` | `packingApi.detachUnits` ✅ | `POST /api/v1/pack360/detach-units` | `POST pack360/detach-units` ✅ | `Pack360.Detach` | `Verified` | Backend endpoint + FE API đã bổ sung |
| OemTransferModal | (modal) | `packingApi.transferOrder` ✅ | `POST /api/v1/pack360/transfer-order` | `POST pack360/transfer-order` ✅ | `Pack360.Transfer` | `Verified` | Đã chuyển sang packingApi |

---

## 4. Pallet

| Screen | React Route | Frontend API | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|
| PalletScreen | `/pallet` | `palletsApi.*` ✅ | `POST /pallet/*` ✅ Controller tồn tại | `Pallet.Manage` | `Ready for Test` | Cần xác nhận palletsApi dùng httpClient |

---

## 5. OEM Orders

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| OemOrderList | `/oem-orders` | `oemApi.getOrders` ✅ | `GET /api/v1/oem-orders` | `GET oem-orders` ✅ | `Oem.Read` | `Verified` | Qua quality gate |
| OemOrderList | `/oem-orders` | `oemApi.importOrders` ✅ | `POST /api/v1/oem-orders/import` | `POST oem-orders/import` ✅ | `Oem.Manage` | `Verified` | Qua quality gate |
| OemOrderFormModal | (modal) | `oemApi.updateOrder` ✅ | `PUT /api/v1/oem-orders/{no}/{product}/{batch}` | `PUT oem-orders/{no}/{product}/{batch}` ✅ | `Oem.Manage` | `Verified` | Backend endpoint + FE API đã bổ sung |
| OemOrderFormModal | (modal) | `oemApi.createOrder` ✅ | `POST /api/v1/oem-orders` | `POST oem-orders` ✅ | `Oem.Manage` | `Verified` | Đã dùng oemApi |
| OemOrderHistoryModal | (modal) | `oemApi.getHistory` ✅ | `GET /api/v1/oem-orders/{no}/{product}/{batch}/history` | `GET oem-orders/{no}/{product}/{batch}/history` ✅ | `Oem.Read` | `Verified` | Backend endpoint + FE API đã bổ sung |
| OemTransferModal | (modal) | `authenticatedFetch` ❌ | `http://{host}:3001/api/oem-orders` ❌ | `GET oem-orders` ✅ | `Oem.Read` | `Frontend Legacy` | Dùng sai client |

---

## 6. Export / Outbound

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| ExportDispatchScreen | `/export` | `outboundApi.pasteData` ✅ | `POST /api/v1/export/paste-data` | `POST export/paste-data` ✅ | `Export.Manage` | `Verified` | Đã dùng outboundApi |
| ExportDispatchScreen | `/export` | `authenticatedFetch` ❌ | `http://{host}:3001/api/export/delivery-notes` ❌ | ❌ MISSING POST | `Export.Manage` | `Frontend Legacy + Backend Missing` | — |
| ExportDispatchScreen | `/export` | `authenticatedFetch` ❌ | `http://{host}:3001/api/export/requirements` ❌ | `GET export/requirements` ✅ | `Export.Read` | `Frontend Legacy` | API-01 |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/notes` ❌ | `GET picking/delivery-notes` ✅ | `Picking.Read` | `Frontend Legacy` | Tên URL khác nhau |
| ExportGateApprovalScreen | `/export-gate` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/approve-storekeeper` ❌ | ❌ MISSING | `Picking.Approve` | `Frontend Legacy + Backend Missing` | — |
| ExportGateApprovalScreen | `/export-gate` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/gate-check` ❌ | ❌ gate-check khác gate-out | `Picking.Ship` | `Frontend Legacy + Blocked` | Cần xác nhận business |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/scan` ❌ | ❌ MISSING | `Picking.Scan` | `Frontend Legacy + Backend Missing` | — |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/split-box` ❌ | ❌ MISSING | `Picking.Manage` | `Frontend Legacy + Backend Missing` | — |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/approve-storekeeper` ❌ | ❌ MISSING | `Picking.Approve` | `Frontend Legacy + Backend Missing` | — |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/fifo-suggestions/{p}` ❌ | ❌ MISSING | `Picking.Read` | `Frontend Legacy + Backend Missing` | — |
| PickingScreen | `/picking` | `authenticatedFetch` ❌ | `http://{host}:3001/api/picking/available-boxes/{p}` ❌ | ❌ MISSING | `Picking.Read` | `Frontend Legacy + Backend Missing` | — |

---

## 7. Reports / Ledger

| Screen | React Route | Frontend API | Actual URL | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|---|
| RealtimeReportScreen | `/reports` | `reportsApi.*` ✅ | `GET reports/inventory/macro` ✅ | `GET reports/inventory/macro` ✅ | `Reports.Read` | `Verified` | Standard envelope + error 403/500 traceId |
| LedgerReportScreen | `/ledger` | `ledgerApi.getTransactions` ✅ | `GET /api/v1/ledger/transactions` | `GET ledger/transactions` ✅ | `Ledger.Read` | `Verified` | Khỏi port 3001, đã qua quality gate |
| LedgerDetail | (inline) | `ledgerApi.getTransactionDetail` ✅ | `GET /api/v1/ledger/transactions/{id}/details` | `GET ledger/transactions/{id}/details` ✅ | `Ledger.Read` | `Verified` | Khỏi port 3001 |

---

## 8. Master Data

| Screen | React Route | Frontend API | ASP.NET Core Endpoint | Policy | Status | Ghi chú |
|---|---|---|---|---|---|---|
| MasterDataScreen | `/master-data` | `masterDataApi.*` ✅ | `GET /api/v1/master/*` | `GET master/trucks` ✅ | `MasterData.Read` | `Verified` | ApiResponse<object> standardized, hasPermission check |

---

## 9. Tổng Kết Vi Phạm

### SEC Violations (P0 — Sửa trước)

| ID | Mô tả | File | |
|---|---|---|---|
| SEC-01 | `AddPolicy` → `RequireAuthenticatedUser()` — không check permission | `Program.cs:82` | ❌ |
| SEC-02 | JWT secret trong tracked `appsettings.json` | `appsettings.json` | ❌ |
| SEC-03 | Demo login fallback (admin/thukho/nhanvien) | `LoginScreen.jsx` | ❌ |
| SEC-03 | `roles.length === 0` → full access | `AuthContext.jsx:81` | ❌ |
| SEC-03 | `username === 'admin'` → full access | `AuthContext.jsx:81` | ❌ |

### API-01 Violations — Port 3001 / Direct Fetch (P0)

| File | Số lỗi |
|---|---|
| `PickingScreen.jsx` | ~12 |
| `ExportDispatchScreen.jsx` | 4 |
| `OemTransferModal.jsx` | 3 |
| `OemOrderFormModal.jsx` | 2 |
| `ExportGateApprovalScreen.jsx` | 2 |
| `ChangePasswordScreen.jsx` | 1 |
| `OemOrderHistoryModal.jsx` | 1 |
| `OemOrderImportModal.jsx` | 1 |
| `LedgerList.jsx` | 1 |
| `LedgerDetail.jsx` | 1 |

### Backend Missing Endpoints (P1)

| Endpoint | Controller |
|---|---|
| `GET /pack360/{id}/info` | Pack360Controller |
| `POST /pack360/release` | Pack360Controller |
| `POST /pack360/complete-repack` | Pack360Controller |
| `POST /pack360/detach-units` | Pack360Controller |
| `POST /pack360/transfer-order` | Pack360Controller |
| `PUT /oem-orders/{no}/{product}/{batch}` | OemOrdersController |
| `GET /oem-orders/{no}/{product}/{batch}/history` | OemOrdersController |
| `POST /export/delivery-notes` | ExportRequirementsController |
| `POST /picking/scan` | PickingOutboundController |
| `POST /picking/split-box` | PickingOutboundController |
| `GET /picking/available-boxes/{product}` | PickingOutboundController |
| `GET /picking/fifo-suggestions/{product}` | PickingOutboundController |
| `POST /picking/approve-storekeeper` | PickingOutboundController |
| `POST /picking/gate-check` (hoặc map → gate-out?) | **Blocked** |

### ROUTE-01 Violations — Receiving URL Params

| Route hiện tại | Route cần có |
|---|---|
| `/receiving` (memory state) | `/receiving/handovers/:handoverNo` |
| `/scan` (memory state) | `/receiving/handovers/:handoverNo/lines/:lineNo/scan?productCode=...` |
| `/storekeeper-confirm` | `/receiving/confirm/:handoverNo` |
| `/partial-receipt` | `/receiving/partial/:handoverNo` |
