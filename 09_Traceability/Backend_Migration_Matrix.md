# Backend Migration Matrix — Node.js to ASP.NET Core Web API

Tài liệu này là hồ sơ **Phase 0** phục vụ chuyển đổi Backend WMS từ **Node.js/Express** sang **ASP.NET Core Web API (.NET LTS)**. Tất cả thông tin dưới đây phản ánh chính xác trạng thái hiện tại của codebase.

---

## 1. Tổng Quan Hệ Thống Backend Hiện Tại

- **Số lượng Route Modules:** 12 files trong `backend/routes/`.
- **Tổng số Endpoints:** 58 endpoints.
- **Cơ sở dữ liệu:** SQL Server (sử dụng Dapper / `mssql` pool trong Node.js).
- **Stored Procedures hiện có:** 26 tập tin SQL trong `Stored_Procedures/`.

---

## 2. Ma Trận Chuyển Đổi API (API Contract Parity Matrix)

| STT | Endpoint Node.js Hiện Tại | HTTP Method | Auth Middleware | Capability / Role Policy Target | ASP.NET Core Target Route | Cơ Chế Dữ Liệu (Direct SQL vs SP) | Phase Migration |
| --- | --- | :---: | :---: | --- | --- | --- | :---: |
| **AUTH MODULE** | | | | | | | **Phase 3** |
| 1 | `/api/auth/login` | POST | Anonymous | Anonymous | `/api/v1/auth/login` | Direct SQL (`tbl_users`, `tbl_roles`) | Phase 3 |
| 2 | `/api/auth/change-password` | POST | `verifyToken` | Authenticated User | `/api/v1/auth/change-password` | Direct SQL (`tbl_users`) | Phase 3 |
| 3 | `/api/auth/users` | GET | `verifyToken` | `Admin.Users.Manage` | `/api/v1/admin/users` | Direct SQL (`tbl_users`) | Phase 3 |
| 4 | `/api/auth/admin/reset-password` | POST | `verifyToken` | `Admin.Users.Manage` | `/api/v1/admin/users/reset-password` | Direct SQL (`tbl_users`) | Phase 3 |
| 5 | `/api/auth/admin/users` | POST | `verifyToken` | `Admin.Users.Manage` | `/api/v1/admin/users` | Direct SQL (`tbl_users`, `tbl_user_roles`) | Phase 3 |
| 6 | `/api/auth/admin/users/:id/status` | PUT | `verifyToken` | `Admin.Users.Manage` | `/api/v1/admin/users/{id}/status` | Direct SQL (`tbl_users`) | Phase 3 |
| 7 | `/api/auth/admin/users/:id/roles` | PUT | `verifyToken` | `Admin.Users.Manage` | `/api/v1/admin/users/{id}/roles` | Direct SQL (`tbl_user_roles`) | Phase 3 |
| **REPORTS MODULE** | | | | | | | **Phase 2** |
| 8 | `/api/reports/inventory/macro` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Reports.Read` | `/api/v1/reports/inventory/macro` | Direct SQL (`tbl_thung60_kho`) | Phase 2 |
| 9 | `/api/reports/inventory/micro` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Reports.Read` | `/api/v1/reports/inventory/micro` | Direct SQL (`tbl_thung60_kho`) | Phase 2 |
| 10 | `/api/reports/inventory/location` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Reports.Read` | `/api/v1/reports/inventory/location` | Direct SQL (`tbl_thung60_kho`) | Phase 2 |
| 11 | `/api/reports/inventory/export` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Reports.Read` | `/api/v1/reports/inventory/export` | Direct SQL (`tbl_thung60_kho`) | Phase 2 |
| **MASTER DATA MODULE** | | | | | | | **Phase 2** |
| 12 | `/api/master/trucks` | GET | `verifyToken` | `MasterData.Read` | `/api/v1/master/trucks` | Direct SQL (`tbl_trucks`) | Phase 2 |
| 13 | `/api/master/trucks` | POST | `verifyToken` | `MasterData.Manage` | `/api/v1/master/trucks` | Direct SQL (`tbl_trucks`) | Phase 2 |
| 14 | `/api/master/drivers` | GET | `verifyToken` | `MasterData.Read` | `/api/v1/master/drivers` | Direct SQL (`tbl_drivers`) | Phase 2 |
| 15 | `/api/master/drivers` | POST | `verifyToken` | `MasterData.Manage` | `/api/v1/master/drivers` | Direct SQL (`tbl_drivers`) | Phase 2 |
| 16 | `/api/master/guards` | GET | `verifyToken` | `MasterData.Read` | `/api/v1/master/guards` | Direct SQL (`tbl_guards`) | Phase 2 |
| 17 | `/api/master/guards` | POST | `verifyToken` | `MasterData.Manage` | `/api/v1/master/guards` | Direct SQL (`tbl_guards`) | Phase 2 |
| 18 | `/api/master/customers` | GET | `verifyToken` | `MasterData.Read` | `/api/v1/master/customers` | Direct SQL (`tbl_customers`) | Phase 2 |
| 19 | `/api/master/customers` | POST | `verifyToken` | `MasterData.Manage` | `/api/v1/master/customers` | Direct SQL (`tbl_customers`) | Phase 2 |
| **LEDGER & TRACE MODULES** | | | | | | | **Phase 2** |
| 20 | `/api/ledger/transactions` | GET | `verifyToken` | `Ledger.Read` | `/api/v1/ledger/transactions` | Direct SQL (`stock_transaction_book`) | Phase 2 |
| 21 | `/api/ledger/transactions/:id/details` | GET | `verifyToken` | `Ledger.Read` | `/api/v1/ledger/transactions/{id}/details` | Direct SQL (`inventory_ledger`, `item_ledger`) | Phase 2 |
| 22 | `/api/trace/units/:id60` | GET | `verifyToken` | `Trace.Read` | `/api/v1/trace/units/{id60}` | SP: `usp_Trace_UnitHistory` | Phase 2 |
| 23 | `/api/trace/packs/:pack360Id` | GET | `verifyToken` | `Trace.Read` | `/api/v1/trace/packs/{pack360Id}` | SP: `usp_Trace_PackHistory` | Phase 2 |
| 24 | `/api/trace/orders/:orderNo` | GET | `verifyToken` | `Trace.Read` | `/api/v1/trace/orders/{orderNo}` | SP: `usp_Trace_OrderHistory` | Phase 2 |
| 25 | `/api/trace/documents/:type/:no` | GET | `verifyToken` | `Trace.Read` | `/api/v1/trace/documents/{type}/{no}` | Direct SQL (`thung60_event`, `pack360_event`) | Phase 2 |
| 26 | `/api/reconciliation/transactions/:id` | GET | `verifyToken` | `Reconciliation.Read` | `/api/v1/reconciliation/transactions/{id}` | Direct SQL | Phase 2 |
| 27 | `/api/reconciliation/inventory` | GET | `verifyToken` | `Reconciliation.Read` | `/api/v1/reconciliation/inventory` | Direct SQL | Phase 2 |
| **OEM MODULE** | | | | | | | **Phase 4** |
| 28 | `/api/oem/products` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Read` | `/api/v1/oem/products` | Direct SQL (`tbl_oem_orders`) | Phase 4 |
| 29 | `/api/oem/` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Read` | `/api/v1/oem/orders` | Direct SQL (`tbl_oem_orders`) | Phase 4 |
| 30 | `/api/oem/import` | POST | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Manage` | `/api/v1/oem/orders/import` | Direct SQL Transaction | Phase 4 |
| 31 | `/api/oem/` | POST | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Manage` | `/api/v1/oem/orders` | Direct SQL (`tbl_oem_orders`) | Phase 4 |
| 32 | `/api/oem/:orderNo/:productCode/:batchNo` | PUT | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Manage` | `/api/v1/oem/orders/{orderNo}/{productCode}/{batchNo}` | Direct SQL Transaction | Phase 4 |
| 33 | `/api/oem/:orderNo/:productCode/:batchNo/history` | GET | **Thiếu (`Anonymous`)** ⚠️ | `Oem.Read` | `/api/v1/oem/orders/{orderNo}/{productCode}/{batchNo}/history` | Direct SQL (`tbl_oem_order_history`) | Phase 4 |
| **RECEIVING (NHẬP KHO) MODULE** | | | | | | | **Phase 4** |
| 34 | `/api/receipt/handovers` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/handovers` | SP: `usp_Receipt_GetAllHandovers` | Phase 4 |
| 35 | `/api/receipt/handover/:no` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/handovers/{no}` | SP: `usp_Receipt_GetHandoverDetail` | Phase 4 |
| 36 | `/api/receipt/scan` | POST | `verifyToken` | `Receipt.Scan` | `/api/v1/receipt/scan` | SP: `usp_Receipt_ScanBarcode` | Phase 4 |
| 37 | `/api/receipt/confirm` | POST | `verifyToken` | `Receipt.Confirm` | `/api/v1/receipt/confirm` | SP: `usp_Receipt_ConfirmHandover` | Phase 4 |
| 38 | `/api/receipt/orders/search` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/orders/search` | SP: `usp_UC02_SearchOEMOrders` | Phase 4 |
| 39 | `/api/receipt/handover/map-order` | POST | `verifyToken` | `Receipt.Manage` | `/api/v1/receipt/handovers/map-order` | SP: `usp_UC02_MapHandoverLineToOEM` | Phase 4 |
| 40 | `/api/receipt/handover/:hNo/line/:lNo/progress` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/handovers/{hNo}/lines/{lNo}/progress` | SP: `usp_UC03_GetLineProgress` | Phase 4 |
| 41 | `/api/receipt/handover/:hNo/line/:lNo/scanned-boxes` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/handovers/{hNo}/lines/{lNo}/scanned-boxes` | SP: `usp_UC03_GetScannedBoxes` | Phase 4 |
| 42 | `/api/receipt/scan-thung60` | POST | `verifyToken` | `Receipt.Scan` | `/api/v1/receipt/scan-thung60` | SP: `usp_UC03_ScanBarcode` | Phase 4 |
| 43 | `/api/receipt/confirm-nhap-kho` | POST | `verifyToken` | `Receipt.Confirm` | `/api/v1/receipt/confirm-nhap-kho` | SP: `usp_UC03_ConfirmReceipt` | Phase 4 |
| 44 | `/api/receipt/confirm-nhap-le` | POST | `verifyToken` | `Receipt.Confirm` | `/api/v1/receipt/confirm-nhap-le` | SP: `usp_UC04_1_ConfirmPartialReceipt` | Phase 4 |
| 45 | `/api/receipt/confirm-nhap-le-batch` | POST | `verifyToken` | `Receipt.Confirm` | `/api/v1/receipt/confirm-nhap-le-batch` | SP: `usp_UC04_1_ConfirmPartialReceiptBatch` | Phase 4 |
| 46 | `/api/receipt/cancel-scan` | POST | `verifyToken` | `Receipt.Manage` | `/api/v1/receipt/cancel-scan` | SP: `usp_UC04_2_CancelScan` | Phase 4 |
| 47 | `/api/receipt/confirm-list` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/confirm-list` | Direct SQL | Phase 4 |
| 48 | `/api/receipt/confirm-handover/:hNo/lines` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/confirm-handovers/{hNo}/lines` | Direct SQL | Phase 4 |
| 49 | `/api/receipt/confirm-detail/:hNo/:lNo` | GET | `verifyToken` | `Receipt.Read` | `/api/v1/receipt/confirm-detail/{hNo}/{lNo}` | Direct SQL | Phase 4 |
| **PACK360 & PALLET MODULES** | | | | | | | **Phase 5** |
| 50 | `/api/pack360/scan-unit` | POST | `verifyToken` | `Pack360.Scan` | `/api/v1/pack360/scan-unit` | SP: `usp_Pack360_ScanUnit` | Phase 5 |
| 51 | `/api/pack360/complete` | POST | `verifyToken` | `Pack360.Complete` | `/api/v1/pack360/complete` | SP: `usp_Pack360_Complete` | Phase 5 |
| 52 | `/api/pack360/complete-repack` | POST | `verifyToken` | `Pack360.Complete` | `/api/v1/pack360/complete-repack` | SP: `usp_Pack360_CompleteRepack` | Phase 5 |
| 53 | `/api/pack360/cancel` | POST | `verifyToken` | `Pack360.Cancel` | `/api/v1/pack360/cancel` | SP: `usp_Pack360_Cancel` | Phase 5 |
| 54 | `/api/pack360/release` | POST | `verifyToken` | `Pack360.Release` | `/api/v1/pack360/release` | SP: `usp_Pack360_ReleaseCartons` | Phase 5 |
| 55 | `/api/pack360/:id` | GET | `verifyToken` | `Pack360.Read` | `/api/v1/pack360/{id}` | Direct SQL | Phase 5 |
| 56 | `/api/pack360/detach-units` | POST | `verifyToken` | `Pack360.Detach` | `/api/v1/pack360/detach-units` | SP: `usp_Pack360_DetachCartons` | Phase 5 |
| 57 | `/api/pack360/transfer-order` | POST | `verifyToken` | `Pack360.Transfer` | `/api/v1/pack360/transfer-order` | SP: `usp_Pack360_TransferOEM` | Phase 5 |
| 58 | `/api/pallet/init` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/init` | SP: `usp_UC06_InitializePallet` | Phase 5 |
| 59 | `/api/pallet/:id/add-unit` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/{id}/add-unit` | SP: `usp_UC06_AddUnitToPallet` | Phase 5 |
| 60 | `/api/pallet/:id/complete` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/{id}/complete` | SP: `usp_UC06_CompletePallet` | Phase 5 |
| 61 | `/api/pallet/remove-unit` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/remove-unit` | SP: `usp_UC06_RemoveUnitFromPallet` | Phase 5 |
| 62 | `/api/pallet/transfer-unit` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/transfer-unit` | SP: `usp_UC06_TransferUnitBetweenPallets` | Phase 5 |
| 63 | `/api/pallet/:id/info` | GET | `verifyToken` | `Pallet.Read` | `/api/v1/pallet/{id}/info` | SP: `usp_UC06_2_GetPalletInfo` | Phase 5 |
| 64 | `/api/pallet/:id/putaway` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/{id}/putaway` | SP: `usp_UC11_ShelvePallet` | Phase 5 |
| 65 | `/api/pallet/:id/letdown` | POST | `verifyToken` | `Pallet.Manage` | `/api/v1/pallet/{id}/letdown` | SP: `usp_UC11_LetdownPallet` | Phase 5 |
| **EXPORT & PICKING MODULES (UC15 & UC16)** | | | | | | | **Phase 6** |
| 66 | `/api/export/paste-data` | POST | `verifyToken` | `Export.Manage` | `/api/v1/export/paste-data` | Direct SQL Transaction | Phase 6 |
| 67 | `/api/export/requirements` | GET | `verifyToken` | `Export.Read` | `/api/v1/export/requirements` | Direct SQL | Phase 6 |
| 68 | `/api/export/requirements` | DELETE | `verifyToken` | `Export.Manage` | `/api/v1/export/requirements` | Direct SQL | Phase 6 |
| 69 | `/api/export/requirements` | PUT | `verifyToken` | `Export.Manage` | `/api/v1/export/requirements` | Direct SQL | Phase 6 |
| 70 | `/api/export/delivery-notes` | POST | `verifyToken` | `Export.Manage` | `/api/v1/export/delivery-notes` | Direct SQL Transaction | Phase 6 |
| 71 | `/api/picking/notes` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/notes` | Direct SQL | Phase 6 |
| 72 | `/api/picking/notes/:id` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/notes/{id}` | Direct SQL | Phase 6 |
| 73 | `/api/picking/notes/:id/line/:pcode` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/notes/{id}/line/{pcode}` | Direct SQL | Phase 6 |
| 74 | `/api/picking/scan` | POST | `verifyToken` | `Picking.Scan` | `/api/v1/picking/scan` | Direct SQL Transaction | Phase 6 |
| 75 | `/api/picking/complete` | POST | `verifyToken` | `Picking.Manage` | `/api/v1/picking/complete` | Direct SQL | Phase 6 |
| 76 | `/api/picking/approve-storekeeper` | POST | `verifyToken` | `Picking.Approve` | `/api/v1/picking/approve-storekeeper` | Direct SQL (`executeStageTransaction`) | Phase 6 |
| 77 | `/api/picking/stage` | POST | `verifyToken` | `Picking.Approve` | `/api/v1/picking/stage` | Direct SQL (`executeStageTransaction`) | Phase 6 |
| 78 | `/api/picking/gate-check` | POST | `verifyToken` | `Picking.Ship` | `/api/v1/picking/gate-check` | Direct SQL (`executeShipTransaction`) | Phase 6 |
| 79 | `/api/picking/ship` | POST | `verifyToken` | `Picking.Ship` | `/api/v1/picking/ship` | Direct SQL (`executeShipTransaction`) | Phase 6 |
| 80 | `/api/picking/truck-summary/:license_plate` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/truck-summary/{license_plate}` | Direct SQL | Phase 6 |
| 81 | `/api/picking/truck-complete` | POST | `verifyToken` | `Picking.Manage` | `/api/v1/picking/truck-complete` | Direct SQL | Phase 6 |
| 82 | `/api/picking/truck-stage` | POST | `verifyToken` | `Picking.Approve` | `/api/v1/picking/truck-stage` | Direct SQL (`executeStageTransactionForTruck`) | Phase 6 |
| 83 | `/api/picking/fifo-suggestions/:product_code` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/fifo-suggestions/{product_code}` | Direct SQL | Phase 6 |
| 84 | `/api/picking/available-boxes/:productCode` | GET | `verifyToken` | `Picking.Read` | `/api/v1/picking/available-boxes/{productCode}` | Direct SQL | Phase 6 |
| 85 | `/api/picking/split-box` | POST | `verifyToken` | `Picking.Scan` | `/api/v1/picking/split-box` | Direct SQL Transaction | Phase 6 |

---

## 3. Đánh Giá Các Rủi Ro An Ninh & Kiến Trúc P0

> [!CAUTION]
> Các rủi ro P0 dưới đây cần được xử lý triệt để ngay trong quá trình chuyển đổi sang ASP.NET Core:

1. **Thiếu Khóa Xác Thực (Anonymous Access Risks):**
   - Phân hệ **`reports.js`** (4 endpoints: `/inventory/macro`, `/micro`, `/location`, `/export`) và **`oem.js`** (6 endpoints) đang không gọi middleware `verifyToken`. Bất kỳ ai có kết nối mạng tới server đều có thể truy vấn báo cáo và cập nhật đơn OEM.
   - **Giải pháp ASP.NET Core:** Tất cả Controllers mặc định bắt buộc attr `[Authorize]`, ngoại trừ `[AllowAnonymous]` trên `/api/v1/auth/login` và `/health`.

2. **Gợi Khai Báo Danh Tính Từ Client Body (Identity Spoofing):**
   - Một số API (như `pack360.js`, `picking.js`) chấp nhận giá trị `user` hoặc `user_code` từ JSON Body client truyền lên (`const { user } = req.body;`).
   - **Giải pháp ASP.NET Core:** Danh tính `performed_by` / `approved_by` **bắt buộc 100%** trích xuất từ `User.FindFirst(ClaimTypes.NameIdentifier)?.Value` (JWT Authenticated Principal).

3. **Ghi Trực Tiếp Bảng Nghiệp Vụ Trong Node.js Khi Đã Có Stored Procedure:**
   - Trong `picking.js` và `export.js`, các hàm hạch toán Sổ Cái Kép (`executeShipTransaction`), tạo phiếu xuất và tách thùng ảo (`split-box`) đang tự viết câu lệnh T-SQL inline trong Node.js thay vì đóng gói vào Stored Procedure chuyên biệt.
   - **Giải pháp ASP.NET Core:** Đưa logic transaction, locking `UPDLOCK`, và dual ledger post vào Stored Procedure SQL Server chuyên biệt (như `usp_UC16_ShipDispatch`, `usp_UC16_SplitVirtualBox`), C# chỉ đóng vai trò gọi Gateway qua Dapper.

4. **Trả Trực Tiếp Stack Trace & SQL Error Cho Client:**
   - Một số endpoints Node.js trả trực tiếp `res.status(500).json({ error: err.message })` làm lộ chi tiết bảng/cột SQL Server khi bị exception.
   - **Giải pháp ASP.NET Core:** Sử dụng `ProblemDetails` Middleware thống nhất. Khi chạy Production, ghi log chi tiết phía server kèm `TraceId`, chỉ trả cho Client mã lỗi chuẩn hóa (`error_code`, `message`, `trace_id`).

5. **Thiếu Header Idempotency (`X-Request-Id`):**
   - Các API quét mã vạch và ký duyệt hiện tại chưa hỗ trợ nhận dạng Request lặp lại do rớt mạng.
   - **Giải pháp ASP.NET Core:** Bổ sung Middleware kiểm tra `X-Request-Id` cho toàn bộ Command endpoints.

---

## 4. Kế Hoạch Thực Hiện Tiếp Theo (Phase 1 — ASP.NET Core Foundation)

Sau khi hoàn tất Phase 0, bước tiếp theo là triển khai **Phase 1 Foundation**:
- Tạo Solution `Wms.sln` tại thư mục root với 4 projects:
  - `src/Wms.Api` (ASP.NET Core 8 / LTS Web API)
  - `src/Wms.Application` (DTOs, FluentValidation, Use Case Handlers)
  - `src/Wms.Domain` (Core Constants, Error Codes, Domain Types)
  - `src/Wms.Infrastructure` (Dapper Connection Factory, JWT Service, SP Executor)
- Cấu hình Global Exception Middleware (`ProblemDetails`), JWT Bearer Authentication, Capability Policy Authorization, CORS Allowlist, Dynamic Health Checks & OpenAPI Swagger.
- Viết Unit/Integration Test Skeleton cho ASP.NET Core.

---
*Hồ sơ Phase 0 đã hoàn tất và sẵn sàng cho các bước triển khai Phase 1 tiếp theo.*
