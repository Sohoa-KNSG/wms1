# Phân tích Thiết kế Logic UC10 - Đóng lại Pack360 mới (Repack into a new Pack360)

## 1. Business Logic (Logic Nghiệp Vụ)
Mục đích cốt lõi: Tái sử dụng/Đóng gói lại các Thùng 60 rời rạc đang nằm tại khu vực chờ xử lý thành kiện Pack360 hoàn toàn mới. Quá trình này đặc trưng bởi cờ `is_repack = 1`.

Các quy tắc nghiệp vụ (Business Rules):
- `BR-UC10-01` **Nguồn gốc Thùng 60 hợp lệ:** Thùng 60 quét vào phải tồn tại, đang ở trạng thái `AVAILABLE` và chưa gán vào kiện 360 nào khác (`pack360_unit`). 
- `BR-UC10-02` **Tính đồng nhất (Homogeneity):** Giống như UC05, các thùng đem đóng lại phải đồng nhất mã SKU hoặc mã Đơn OEM (trừ trường hợp cờ `is_repack` có ngoại lệ bỏ qua tính đồng nhất cho hàng trộn).
- `BR-UC10-03` **Đo lường trọng lượng (Weighting):** Bắt buộc phải thu thập trọng lượng thực tế cho kiện Pack360 mới này.
- `BR-UC10-04` **Định danh mới (New Identity):** Hệ thống sinh ra mã QR Pack360 hoàn toàn mới cho kiện đóng lại, đồng thời cập nhật `actual_unit_count` và lưu dữ liệu map vào bảng `pack360_unit`.

## 2. Programming Logic (Logic Lập Trình)
- **Giao diện Repack:** Dùng chung UI với UC05 hoặc module riêng cho Repack, hỗ trợ cờ `is_repack`.
- **Tương tác Thiết bị:** Kết nối Local Bridge để lấy thông số cân và in tem.
- **Backend API:** `POST /api/pack360/scan-unit` và `POST /api/pack360/complete-repack`. SP `usp_Pack360_ScanUnit` nhận thêm tham số `@is_repack = 1`.

## 3. Data Logic (Logic Dữ Liệu)

### 3.1. Ma trận phân quyền CRUD
Dưới đây là ma trận CRUD cho các bảng dữ liệu bị tác động trong UC10:

| Bảng Dữ Liệu | Create (C) | Read (R) | Update (U) | Delete (D) | Trạng Thái Bị Tác Động |
|---|---|---|---|---|---|
| `pack360_header` | X (Tạo kiện mới với `is_repack=1`) | X | X (Chốt kiện, update `actual_unit_count`, `weight`) | | `OPEN` -> `COMPLETED` |
| `pack360_unit` | X (Gán thùng 60 vào kiện mới) | X | | | |

### 3.2. Quản lý trạng thái
- `pack360_header`: Bắt đầu `OPEN`, kết thúc `COMPLETED`. Cột `is_repack` được set = 1. Cột `actual_unit_count` lưu số lượng thùng thực tế.
- `pack360_unit`: Sinh các bản ghi tương ứng map `pack360_id` và các `unit_id`.

## 4. Diagrams (Biểu đồ)

### 4.1. Lưu đồ thuật toán (Activity Diagram)
```mermaid
graph TD
    A([Bắt đầu Quét Thùng 60 - Repack]) --> B[Kiểm tra Tồn tại & Trạng thái]
    B --> C{Trạng thái AVAILABLE?}
    C -- Không --> D[RAISERROR: Trạng thái không hợp lệ]
    C -- Có --> G{Đã thuộc kiện khác?}
    
    G -- Có --> H[RAISERROR: Thùng đã bị khóa]
    G -- Không --> I{Khớp mã SKU/OEM với kiện mới?}
    I -- Không --> J[RAISERROR: Sai mã sản phẩm]
    I -- Có --> K[Map Thùng vào Kiện Mới trong pack360_unit]
    
    K --> L([Trả về SUCCESS])
    D --> M([Trả về ERROR])
    H --> M
    J --> M
```

### 4.2. Sequence Diagram (Biểu đồ tuần tự)
```mermaid
sequenceDiagram
    autonumber
    actor NV as Nhân viên đóng gói
    participant HW as Hardware (Cân/Máy in)
    participant UI as Web App (React)
    participant API as Backend (ASP.NET Core C#)
    participant DB as SQL Server

    NV->>UI: Chọn chức năng Đóng lại (Repack)
    NV->>UI: Quét mã QR Thùng 60
    UI->>API: POST /scan-unit (QR, is_repack=1)
    API->>DB: EXEC usp_Pack360_ScanUnit
    
    rect rgb(250, 250, 250)
        note right of DB: Kiểm tra: AVAILABLE, Đồng nhất
    end
    DB-->>API: Trả kết quả Hợp lệ
    API-->>UI: Hiển thị Thùng 60 vào danh sách chờ

    NV->>HW: Đặt kiện hàng mới lên cân
    NV->>UI: Bấm "Chốt kiện Repack"
    UI->>HW: Lấy dữ liệu Cân
    HW-->>UI: Trả về số Kg
    
    UI->>API: POST /complete (Trọng lượng, is_repack=1)
    
    rect rgb(240, 248, 255)
        note right of API: Transaction
        API->>DB: EXEC usp_Pack360_Complete
        DB->>DB: INSERT/UPDATE pack360_header (status=COMPLETED, is_repack=1, actual_unit_count)
        DB->>DB: INSERT pack360_unit (Map thùng vào kiện mới)
        DB-->>API: Trả về chuỗi tem TSPL (QR mới)
    end
    
    API-->>UI: Data in tem
    UI->>HW: Truyền lệnh in
    HW-->>NV: Nhả tem nhãn mới
```
