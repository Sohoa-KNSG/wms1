# Phân Tích & Thiết Kế Kiến Trúc Logic UC15 - Nhu Cầu Xuất Kho & Phân Bổ Chuyến Xe

Tài liệu này chi tiết hóa kiến trúc logic, luồng dữ liệu và thiết kế Stored Procedure / C# API cho **UC15 (Nhu Cầu Xuất Kho & Phân Bổ Xe)** theo đúng chuẩn mẫu tại `/home/knsg-s3/WMS/02_Process_UseCase/_UseCase_Documentation_Template.md`.

---

## 1. Business Logic (Logic Nghiệp Vụ)

- **Mục tiêu:** Tiếp nhận nhu cầu xuất kho dán từ Excel, phân bổ chuyến xe tải, tách phiếu xuất độc lập cho từng Khách hàng và ghi nhận cơ cấu kiện (K360 / T60 / Thùng Ảo `VIR-...`).
- **Business Rules (`BR-UC15-01` -> `BR-UC15-05`):**
  - Validation All-or-Nothing khi nạp khối dữ liệu nhu cầu từ Excel.
  - Ràng buộc tải trọng xe tải (`max_weight_kg`).
  - Kiểm tra tồn kho khả dụng (`AVAILABLE`) trước khi phân bổ.
  - Tự động phân tách phiếu xuất kho (`PXK-...`) độc lập theo từng Khách hàng.

---

## 2. UI/UX Guidelines (Hướng Dẫn Giao Diện)

- **Component Frontend:** `ExportDispatchScreen.jsx` và `MasterDataScreen.jsx`.
- **4 Thẻ Tab:** `Nhập Nhu Cầu Hàng Loạt`, `Phân Bổ Xe & Lập Phiếu Xuất`, `Xuất Tạm Kho (UC18)`, `Quản Lý Danh Mục Xe Tải`.
- **Modal Preview:** Hiển thị tổng quan chuyến xe, kiểm tra tải trọng % nạp xe, và xem trước danh sách các phiếu xuất tự động tách theo từng Khách hàng.

---

## 3. Programming Logic (Logic Lập Trình)

- **Backend API:** C# .NET 8 Web API (`src/Wms.Api/Controllers/ExportRequirementsController.cs`).
- **Endpoints:**
  - `POST /api/v1/export/paste-data`: Nhập nhu cầu từ Excel.
  - `GET /api/v1/export/requirements`: Đọc danh sách nhu cầu kèm tồn kho thực tế.
  - `DELETE /api/v1/export/requirements`: Xóa dòng nhu cầu.
  - `PUT /api/v1/export/requirements`: Điều chỉnh số lượng nhu cầu.
  - `POST /api/v1/export/delivery-notes`: Khởi tạo danh sách Phiếu Xuất Kho theo xe tải và từng Khách hàng.

---

## 4. Data Logic (Logic Dữ Liệu)

- **Bảng CSDL:** `export_request_header`, `export_request_detail`, `delivery_note_header`, `delivery_note_detail`, `tbl_trucks`, `tbl_thung60_kho`.
- **CRUD Matrix & Single Transaction Scope:** Thực thi SQL Transaction đảm bảo tính toàn vẹn dữ liệu khi nạp đơn và phát hành phiếu xuất.

---

## 5. Diagrams (Biểu Đồ Mermaid 100%)

Sử dụng cú pháp Mermaid tiêu chuẩn vẽ `sequenceDiagram`, `flowchart TD` Data Layer Architecture và `erDiagram`.
*(Xem thông tin chi tiết tại [UC15 _Tạo và phân bổ phiếu xuất.md](file:///home/knsg-s3/WMS/02_Process_UseCase/UC15%20_T%E1%BA%A1o%20v%C3%A0%20ph%C3%A2n%20b%E1%BB%95%20phi%E1%BA%BFu%20xu%E1%BA%A5t.md))*
