# Frontend Migration & Standardization Matrix — React + Vite

Tài liệu này là hồ sơ **Phase 0 (Frontend Baseline & Matrix)** phục vụ chuẩn hóa ứng dụng React WMS (`frontend/`) kết nối an toàn với **ASP.NET Core 8.0 Web API**.

---

## 1. Tổng Quan Frontend Hiện Tại

- **Framework:** React 18.2.0 + Vite 5.2.0.
- **Số lượng Screens/Components:** 31 file JSX trong `frontend/src/components/`.
- **Cơ chế routing hiện tại:** Quản lý bằng biến state `currentView` trong `App.jsx` (chưa có React Router, chưa hỗ trợ Deep-link / Refresh giữ trang).
- **Cơ chế gọi API:** Đang bị phân tán (trộn lẫn `fetch`, `axios`, URL tuyệt đối và URL tương đối).

---

## 2. Ma Trận Chuẩn Hóa Màn Hình (Frontend Screen Mapping Matrix)

| STT | Màn Hình React (`src/components/`) | Chức Năng Nghiệp Vụ | API Endpoints Đang Gọi | Role / Capability Required | Core Target Controller (ASP.NET Core) | Giai Đoạn Migration |
| --- | --- | --- | --- | --- | --- | :---: |
| **AUTH & SECURITY** | | | | | | **Phase 2 & 3** |
| 1 | `LoginScreen.jsx` | Đăng nhập hệ thống | `POST /api/v1/auth/login` | Anonymous | `AuthController.cs` | Phase 2 |
| 2 | `ChangePasswordScreen.jsx` | Đổi mật khẩu | `POST /api/v1/auth/change-password` | Authenticated User | `AuthController.cs` | Phase 2 |
| 3 | `AdminUserList.jsx` | Quản trị người dùng & vai trò | `GET/POST/PUT /api/v1/auth/admin/...` | `ADMIN`, `IT_ADMIN` | `AuthController.cs` | Phase 5 |
| **RECEIVING (NHẬP KHO)** | | | | | | **Phase 5** |
| 4 | `ReceiptList.jsx` | Danh sách phiếu giao kho | `GET /api/v1/receipt/handovers` | `Receipt.Read` | `ReceiptController.cs` | Phase 5 |
| 5 | `ReceiptDetail.jsx` | Chi tiết phiếu nhập | `GET /api/v1/receipt/handover/{no}` | `Receipt.Read` | `ReceiptController.cs` | Phase 5 |
| 6 | `ScanScreen.jsx` | Quét mã vạch nhập tạm | `POST /api/v1/receipt/scan` | `Receipt.Scan` | `ReceiptController.cs` | Phase 5 |
| 7 | `StorekeeperConfirmOverview.jsx` | Tổng quan chờ thủ kho xác nhận | `GET /api/v1/receipt/confirm-list` | `THU_KHO` | `ReceiptController.cs` | Phase 5 |
| 8 | `StorekeeperConfirmList.jsx` | Danh sách phiếu chờ xác nhận | `GET /api/v1/receipt/confirm-handover/{hNo}/lines` | `THU_KHO` | `ReceiptController.cs` | Phase 5 |
| 9 | `PartialReceiptOverview.jsx` | Nhập lẻ tạo thùng ảo | `POST /api/v1/receipt/confirm-nhap-le` | `THU_KHO` | `ReceiptController.cs` | Phase 5 |
| **PACK360 & PALLET** | | | | | | **Phase 5** |
| 10 | `Pack360Screen.jsx` | Đóng gói Kiện 360 | `POST /api/v1/pack360/scan-unit`, `/complete`, `/cancel` | `Pack360.Scan` | `Pack360Controller.cs` | Phase 5 |
| 11 | `RepackScreen.jsx` | Đóng gói Repack | `POST /api/v1/pack360/complete-repack` | `Pack360.Scan` | `Pack360Controller.cs` | Phase 5 |
| 12 | `DetachCartonsScreen.jsx` | Tháo thùng khỏi Kiện 360 | `POST /api/v1/pack360/release` | `Pack360.Detach` | `Pack360Controller.cs` | Phase 5 |
| 13 | `PalletScreen.jsx` | Khởi tạo, xếp Pallet & Lên/Xuống kệ | `POST /api/v1/pallet/...` | `Pallet.Manage` | `PalletController.cs` | Phase 5 |
| **OUTBOUND & PICKING** | | | | | | **Phase 5** |
| 14 | `ExportDispatchScreen.jsx` | Dán nhu cầu & tạo phiếu xuất | `POST /api/v1/export/paste-data`, `/delivery-notes` | `Export.Manage` | `ExportRequirementsController.cs` | Phase 5 |
| 15 | `ExportGateApprovalScreen.jsx` | Bảo vệ xác nhận xuất bến | `POST /api/v1/picking/gate-out` | `Picking.Ship` | `PickingOutboundController.cs` | Phase 5 |
| 16 | `PickingScreen.jsx` | Quét hàng lấy theo đơn | `GET/POST /api/v1/picking/...` | `Picking.Scan` | `PickingOutboundController.cs` | Phase 5 |
| **MASTER DATA & REPORTS** | | | | | | **Phase 5** |
| 17 | `MasterDataScreen.jsx` | Danh mục Xe, Tài xế, Bảo vệ, KH | `GET/POST /api/v1/master/...` | `MasterData.Read` | `MasterDataController.cs` | Phase 5 |
| 18 | `RealtimeReportScreen.jsx` | Báo cáo Tồn kho Realtime | `GET /api/v1/reports/inventory/...` | `Reports.Read` | `ReportsController.cs` | Phase 5 |
| 19 | `LedgerReportScreen.jsx` | Báo cáo Sổ cái Kép & Tra cứu | `GET /api/v1/ledger/...`, `GET /api/v1/trace/...` | `Ledger.Read` | `LedgerController.cs`, `TraceController.cs` | Phase 5 |
| 20 | `OemOrderList.jsx` | Quản lý Đơn hàng OEM | `GET/POST /api/v1/oem-orders/...` | `Oem.Read` | `OemOrdersController.cs` | Phase 5 |

---

## 3. Rà Soát Các Vấn Đề An Ninh & Chất Lượng Cần Chuẩn Hóa

1. **Rủi Ro P0 — Identity Spoofing từ Client Body:**
   - Một số component truyền `user` hoặc `username` lấy từ `localStorage` lên body API.
   - **Chuẩn hóa:** Xóa bỏ hoàn toàn việc gửi `username` trong body. ASP.NET Core Web API trích xuất danh tính 100% từ JWT Claim (`ClaimTypes.NameIdentifier`).

2. **Rủi Ro P0 — Hard-coded API Endpoints & Mixed Content:**
   - Nhiều màn hình hard-code `http://localhost:5000/api/...` hoặc gọi Cân/In `http://localhost:8080`.
   - **Chuẩn hóa:** Đưa HTTP Client về `src/api/httpClient.js` sử dụng `import.meta.env.VITE_API_BASE_URL` hoặc relative path `/api`. Đóng gói Device Agent vào `src/integrations/deviceAgent/`.

3. **Cải Tiến P1 — Navigation & Routing:**
   - Đổi cơ chế `currentView` trong `App.jsx` sang **React Router v6** chính thức với `BrowserRouter` & Protected Capability Guards (`must_change_password` & permission guards).

---

*Hồ sơ Phase 0 Baseline Matrix cho Frontend đã được tạo thành công.*
