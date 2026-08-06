# Kế Hoạch Ngừng Tải & Chuyển Giao (Node.js Decommissioning & Operational Plan)

## 1. Tổng Quan
Quá trình chuyển đổi toàn bộ Backend WMS từ **Node.js (Express)** sang **ASP.NET Core 8 Web API (Clean Architecture)** đã hoàn thành qua 7 giai đoạn. Tài liệu này hướng dẫn cách dừng vận hành Express Backend cũ, chuyển lưu lượng mạng (traffic) sang ASP.NET Core Web API mới và kế hoạch decommission.

---

## 2. Kiểm Trả Mức Độ Hoàn Thiện (Parity Checklist Verification)

| Phân Hệ API Node.js Cũ | Endpoint Target trong ASP.NET Core Web API | Phân Phụ Trách & Mức Độ Đạt Standard |
| --- | --- | --- |
| **Authentication & Users** | `AuthController.cs` | 100% — Thống nhất mã hóa BCrypt, khóa 5 lần/15 phút, Stored Procedures security |
| **Reports** | `ReportsController.cs` | 100% — Khắc phục rủi ro P0 Anonymous Access bằng `[Authorize(Policy = PolicyNames.ReportsRead)]` |
| **Master Data** | `MasterDataController.cs` | 100% — Trucks, Drivers, Guards, Customers qua Dapper |
| **Ledger & Traceability** | `LedgerController.cs`, `TraceController.cs` | 100% — Stored Procedures & Unified Timeline tracing |
| **Reconciliation** | `ReconciliationController.cs` | 100% — Transaction vs Unit/Item Ledger & Physical vs Ledger |
| **OEM Orders** | `OemOrdersController.cs` | 100% — Import hàng loạt có transaction rollback & limit 500 bản ghi |
| **Receiving (Nhập Kho)** | `ReceiptController.cs` | 100% — SP Gateway: `usp_Receipt_ScanThung60`, `usp_Receipt_OfficialConfirm`, `usp_WMS_UC04_1_ConfirmNhapLe` |
| **Pack360 & Pallet** | `Pack360Controller.cs`, `PalletController.cs` | 100% — Scan, Complete, Cancel, Putaway, Letdown, Depalletizing |
| **Inventory Closing** | `InventoryClosingController.cs` | 100% — Kết chuyển UC24 & Chốt sổ kỳ UC25 với Dual Ledger entries |
| **Export Requirements** | `ExportRequirementsController.cs` | 100% — Import nhu cầu, tính toán tồn kho khả dụng |
| **Outbound Execution** | `PickingOutboundController.cs` | 100% — Quét hàng, Storekeeper Duyệt Tập kết & Bảo vệ Xuất Bến `WITH (UPDLOCK)` |

---

## 3. Các Bước Chuyển Giao Môi Trường Vận Hành (Cutover Steps)

1. **Bước 1: Khởi động ASP.NET Core Web API**
   - Đảm bảo file `appsettings.json` tại `src/Wms.Api/appsettings.json` đã cấu hình đúng `DefaultConnection` và `Jwt:Secret` (tối thiểu 32 ký tự).
   - Thực thi lệnh:
     ```bash
     cd /home/knsg-s3/WMS/src/Wms.Api
     dotnet run --configuration Release
     ```
   - Xác nhận endpoint `/health` trả về HTTP 200 OK:
     ```bash
     curl http://localhost:5000/health
     ```

2. **Bước 2: Cập nhật Reverse Proxy (Nginx / Gateway)**
   - Đổi `proxy_pass` của các request `/api/` từ cổng Node.js (cổng `3000` hoặc `5000`) sang Web API ASP.NET Core mới.
   - Thêm Header `X-Request-Id` và `X-Trace-Id` hỗ trợ Distributed Tracing.

3. **Bước 3: Dừng Process Node.js Backend**
   - Tắt process Node.js cũ bằng PM2 hoặc systemd:
     ```bash
     pm2 stop wms-backend-node
     pm2 delete wms-backend-node
     ```

4. **Bước 4: Lưu trữ & Decommission Mã Nguồn Cũ**
   - Lưu trữ thư mục `backend/` thành `backend_deprecated_archive.tar.gz`.
   - Lưu vết lịch sử chuyển đổi vào `09_Traceability/Change_Log.md`.

---
*Kế hoạch Decommission Node.js Backend đã sẵn sàng thực thi.*
