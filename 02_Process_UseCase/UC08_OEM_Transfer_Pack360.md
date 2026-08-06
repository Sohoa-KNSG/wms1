# Phân tích Thiết kế Logic UC08 - Chuyển Đơn OEM Cho Kiện Pack360 (Pack360 OEM Transfer)

## 1. Business Logic (Logic Nghiệp Vụ)
- **Mục tiêu cốt lõi:** Cho phép Quản lý Kho / Thủ Kho chuyển toàn bộ Kiện Pack360 và các Thùng 60 thành viên bên trong từ đơn hàng OEM hiện tại sang một Đơn hàng OEM mới khi cần thay đổi kế hoạch đóng gói hoặc xử lý hàng dư đợt trước.
- **Các quy tắc nghiệp vụ (Business Rules):**
  - `BR-OEM-TRF-001`: Chỉ được phép chuyển đơn OEM khi Kiện Pack360 còn nằm trong kho (không ở các trạng thái xuất kho: `ALLOCATED`, `PICKED`, `STAGED`, `SHIPPED`).
  - `BR-OEM-TRF-002`: Mã sản phẩm của Kiện Pack360 phải tương thích với mã sản phẩm của Đơn hàng OEM mới.
  - `BR-OEM-TRF-003`: Việc chuyển đơn phải cập nhật đồng bộ thông tin `oem_order_no` và `oem_batch_no` ở cả cấp Header (`pack360_header`) và cấp đơn vị thành viên (`tbl_thung60_kho`).
  - `BR-OEM-TRF-004`: Phải ghi nhận nhật ký sự kiện `pack360_event` (`TRANSFER_OEM`), `thung60_event` (`TRANSFER_OEM`) và `audit_log` phục vụ truy vết vệt lịch sử 100%.
- **Quy trình tương tác chi tiết (Detailed Interaction Flow):**

  - **Bước 1: Khởi tạo thao tác tại Trạm Pack360**
    - **Người dùng thao tác:** Thủ kho / Quản lý kho truy cập vào màn hình "Trạm Đóng Gói Pack360" và nhấn chọn Tab **"CHUYỂN ĐƠN OEM"**.
    - **Hệ thống xử lý:** Chuyển giao diện sang màu chủ đạo Xanh biển (`#0284c7`), kích hoạt con trỏ chuột tự động focus vào ô quét mã QR, đồng thời gọi API `GET /api/oem-orders` để tải trước danh sách các Đơn hàng OEM khả dụng.

  - **Bước 2: Quét / Tra cứu thông tin Kiện 360**
    - **Người dùng thao tác:** Thủ kho dùng máy quét barcode hoặc nhập tay Mã QR / ID Kiện Pack360 vào ô tìm kiếm, sau đó nhấn nút **"Kiểm Tra Kiện"**.
    - **Hệ thống xử lý:**
      1. Gửi request `GET /api/pack360/:pack360_id` lên máy chủ.
      2. Backend tra cứu bảng `pack360_header` và `pack360_unit` để lấy thông tin chi tiết: Đơn OEM hiện tại, Trạng thái vật lý, Mã sản phẩm và Số lượng thùng 60 thành phần.
      3. Kiểm tra trạng thái kiện: Nếu kiện đang thuộc luồng xuất kho (`ALLOCATED`, `PICKED`, `STAGED`, `SHIPPED`), hệ thống báo lỗi cảnh báo và ngăn không cho thực hiện chuyển đơn.
      4. Phản hồi dữ liệu lên Frontend, hiển thị thẻ thông tin tóm tắt về Kiện 360.

  - **Bước 3: Lựa chọn Đơn hàng OEM Mới & Nhập lý do**
    - **Người dùng thao tác:** Thủ kho chọn Đơn hàng OEM đích từ danh sách gợi ý (dropdown) hoặc nhập trực tiếp Mã đơn OEM mới vào ô thông tin, đồng thời nhập Lý do chuyển đơn (ví dụ: "Chuyển đơn theo yêu cầu Kế hoạch").
    - **Hệ thống xử lý:** Tự động lọc và hiển thị danh sách các Đơn hàng OEM có cùng Mã sản phẩm (`product_code`) với Kiện 360 để hỗ trợ người dùng chọn chính xác, tránh nhầm lẫn sản phẩm.

  - **Bước 4: Xác nhận và Thực thi Chuyển đơn (Submit)**
    - **Người dùng thao tác:** Thủ kho kiểm tra lại thông tin và bấm nút **"XÁC NHẬN CHUYỂN ĐƠN OEM"**.
    - **Hệ thống xử lý (Backend Atomic Transaction):**
      1. **Khóa bản ghi (Locking):** Khởi tạo SQL Transaction và thực thi lệnh khóa `UPDLOCK` trên bản ghi `pack360_header`.
      2. **Kiểm tra ràng buộc (Fail-Fast Validation):**
         - Xác nhận lại trạng thái Kiện 360 không nằm trong luồng xuất bến (`BR-ST-004`).
         - Xác nhận Đơn hàng OEM mới tồn tại trong bảng `tbl_oem_orders`.
         - Kiểm tra tính tương thích về Mã sản phẩm (`product_code`).
      3. **Cập nhật dữ liệu (Data Mutation):**
         - Update `pack360_header`: Gán `oem_order_no = @target_oem_order_no`, `oem_batch_no = @target_oem_batch_no`.
         - Update `tbl_thung60_kho`: Gán `current_oem_order_no = @target_oem_order_no`, `current_oem_batch_no = @target_oem_batch_no` cho toàn bộ Thùng 60 đang nằm trong Kiện 360 đó (`is_current = 1`).
      4. **Ghi nhật ký sự kiện & Audit Log:**
         - Ghi bản ghi `TRANSFER_OEM` vào bảng `pack360_event` kèm mã `request_id`.
         - Ghi bản ghi `TRANSFER_OEM` vào bảng `thung60_event` cho tất cả thùng 60 thành phần.
         - Ghi vết hành động vào `audit_log` với `object_type = 'PACK360'`, lưu thông tin đơn cũ và đơn mới.
      5. **Commit & Phản hồi:** Hoàn tất SQL Transaction (`COMMIT TRANSACTION`), trả về HTTP 200 SUCCESS.
      6. **Hiển thị giao diện:** Frontend nhận phản hồi, hiển thị Toast thông báo thành công chuẩn ARIA, xóa dữ liệu form nhập và làm mới trạng thái.

## 2. Tiêu chuẩn Thiết kế Giao diện (UI/UX Guidelines)
- **Thiết bị đích:** Máy tính Trạm PC Kho / Máy kiểm kê di động PDA.
- **Yêu cầu trải nghiệm:**
  - Tab "CHUYỂN ĐƠN OEM" nổi bật màu xanh biển (`#0284c7`) rõ ràng.
  - Tự động focus con trỏ vào ô nhập mã vạch khi chuyển Tab.
  - Hiển thị bảng tóm tắt thông tin kiện ngay khi quét thành công.
  - Chặn thao tác sai bằng Toast thông báo chuẩn ARIA (`role="status"`, `aria-live="polite"`).

## 3. Programming Logic (Logic Lập Trình)
### 3.1. Frontend (`Pack360Screen.jsx`)
- **State chính:** `transferPackId`, `transferTargetOemOrderNo`, `transferTargetBatchNo`, `transferReason`, `transferPackInfo`, `oemOrdersList`.
- **Luồng xử lý:** Gọi `axios.get('/api/oem-orders')` để nạp danh sách đơn OEM; Gọi `axios.post('/api/pack360/transfer-order')` với đính kèm JWT Authorization header.

### 3.2. Backend API & Stored Procedure
- **Endpoint:** `POST /api/pack360/transfer-order` (middleware `verifyToken`).
- **Stored Procedure:** `usp_Pack360_TransferOEM` trong [04_OEM_Transfer_SPs.sql](file:///home/knsg-s3/WMS/Stored_Procedures/04_OEM_Transfer_SPs.sql).
- **Trình tự Validation:** 
  1. Kiểm tra tồn tại Kiện 360 & Khóa bản ghi (`UPDLOCK`).
  2. Kiểm tra trạng thái không thuộc luồng xuất kho (`ALLOCATED`, `PICKED`, `STAGED`, `SHIPPED`).
  3. Kiểm tra sự tồn tại của Đơn hàng OEM mới và khớp Mã Sản Phẩm (`product_code`).
  4. Thực thi Update & Insert Event trong 1 Transaction nguyên tử.

## 4. Data Logic (Thiết kế Dữ Liệu)
### 4.1. Ma trận phân quyền CRUD
| Bảng dữ liệu | C | R | U | D | Mô tả ý nghĩa trong UC08 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `pack360_header` | | X | X | | Cập nhật `oem_order_no`, `oem_batch_no` cho Kiện 360 |
| `tbl_thung60_kho` | | X | X | | Cập nhật `current_oem_order_no`, `current_oem_batch_no` cho các thùng thành viên |
| `pack360_event` | X | X | | | Thêm bản ghi sự kiện `TRANSFER_OEM` cho Kiện 360 |
| `thung60_event` | X | X | | | Thêm bản ghi sự kiện `TRANSFER_OEM` cho các Thùng 60 |
| `audit_log` | X | X | | | Ghi vết chuyển đơn OEM cho đối tượng `PACK360` |

### 4.2. Định nghĩa Trạng thái (State Definitions)
- Trạng thái Kiện 360 trước và sau chuyển đơn giữ nguyên (`status = old_status`, ví dụ: `COMPLETED` hoặc `OPEN`).
- Đơn hàng OEM mới: Gán `oem_order_no = @target_oem_order_no`.

### 4.3. Cập nhật Sổ Cái Kép (Dual Ledger Logic)
- Nghiệp vụ Chuyển đơn OEM là chuyển đổi thuộc tính định danh đơn hàng lưu kho, **không làm thay đổi số lượng tổng khả dụng** của sản phẩm nên không ghi tăng/giảm số lượng trong `item_ledger`.
- Tất cả vệt chuyển đổi được lưu trữ chi tiết trong `pack360_event`, `thung60_event` và `audit_log`.

## 5. Biểu Đồ Thiết Kế (Diagrams)

### 5.1. Sequence Diagram (Luồng Chuyển Đơn OEM Pack360)
```mermaid
sequenceDiagram
    autonumber
    actor TK as Thủ Kho / Quản Lý Kho
    participant FE as React Frontend (Pack360Screen)
    participant API as Express API (/api/pack360/transfer-order)
    participant SP as Stored Procedure (usp_Pack360_TransferOEM)
    participant DB as SQL Server Database

    TK->>FE: Nhập Mã Pack360 + Chọn Đơn OEM Mới + Bấm "XÁC NHẬN CHUYỂN ĐƠN OEM"
    FE->>API: POST /api/pack360/transfer-order (Headers: JWT Token)
    API->>API: Xác thực verifyToken & Lấy req.user.username
    API->>SP: EXEC usp_Pack360_TransferOEM @pack360_id, @target_oem_order_no, @user_code
    SP->>DB: BEGIN TRANSACTION & LOCK pack360_header WITH (UPDLOCK)
    alt Trạng thái thuộc ALLOCATED/PICKED/STAGED/SHIPPED
        DB-->>SP: Báo lỗi trạng thái không hợp lệ
        SP-->>API: RAISERROR (HTTP 500/409)
        API-->>FE: HTTP 500 { status: 'ERROR', message: 'Kiện 360 đang xuất kho' }
        FE-->>TK: Hiển thị thông báo lỗi
    else Trạng thái Hợp lệ & Khớp Mã SP
        SP->>DB: 1. UPDATE pack360_header SET oem_order_no = @target_oem_order_no
        SP->>DB: 2. UPDATE tbl_thung60_kho SET current_oem_order_no = @target_oem_order_no WHERE pack360_id = @id AND is_current = 1
        SP->>DB: 3. INSERT INTO pack360_event (TRANSFER_OEM)
        SP->>DB: 4. INSERT INTO thung60_event (TRANSFER_OEM)
        SP->>DB: 5. INSERT INTO audit_log (PACK360 TRANSFER_OEM)
        SP->>DB: COMMIT TRANSACTION
        DB-->>SP: Transaction Committed Successfully
        SP-->>API: Return Success
        API-->>FE: HTTP 200 OK { status: 'SUCCESS', message: 'Chuyển đơn thành công' }
        FE-->>TK: Hiển thị Toast thành công & Reset Form
    end
```

### 5.2. Cấu trúc Phân tầng Dữ liệu (Data Layer Architecture)
```mermaid
flowchart TD
    ClientReq[Client Request: POST /api/pack360/transfer-order] --> AuthGuard{JWT VerifyToken}
    AuthGuard -- Invalid Token --> Res403[HTTP 403 Forbidden]
    AuthGuard -- Valid Token --> ExecSP[EXEC usp_Pack360_TransferOEM]
    
    ExecSP --> BeginTx[BEGIN TRANSACTION]
    BeginTx --> LockHeader[Lock pack360_header WITH UPDLOCK]
    LockHeader --> ValidateStatus{Check Status NOT IN ALLOCATED, PICKED, STAGED, SHIPPED}
    
    ValidateStatus -- True: In Dispatch Stream --> RollbackErr[ROLLBACK TRANSACTION & RAISERROR]
    ValidateStatus -- False: In Warehouse --> ValidateProduct{Check product_code match target OEM order}
    
    ValidateProduct -- Product Mismatch --> RollbackErr
    ValidateProduct -- Product Match --> UpdateHeader[UPDATE pack360_header oem_order_no]
    
    UpdateHeader --> UpdateUnits[UPDATE tbl_thung60_kho current_oem_order_no]
    UpdateUnits --> LogPackEvent[INSERT pack360_event TRANSFER_OEM]
    LogPackEvent --> LogUnitEvent[INSERT thung60_event TRANSFER_OEM]
    LogUnitEvent --> AuditLog[INSERT audit_log PACK360 TRANSFER_OEM]
    
    AuditLog --> CommitTx[COMMIT TRANSACTION]
    CommitTx --> SuccessRes[Return HTTP 200 SUCCESS]

    style AuthGuard fill:#e1f5fe,stroke:#0284c7,stroke-width:2px
    style LockHeader fill:#fff3e0,stroke:#f59e0b,stroke-width:2px
    style CommitTx fill:#e8f5e9,stroke:#10b981,stroke-width:2px
    style RollbackErr fill:#ffebee,stroke:#ef4444,stroke-width:2px
```

### 5.3. Entity Relationship & Logic Trạng thái (State Logic Map)
```mermaid
erDiagram
    pack360_header ||--|{ pack360_unit : contains
    pack360_unit }|--|| tbl_thung60_kho : references
    pack360_header ||--|{ pack360_event : logs
    tbl_thung60_kho ||--|{ thung60_event : logs
    pack360_header ||--|| tbl_oem_orders : assigned_to

    pack360_header {
        string pack360_id PK
        string pack360_qr
        string oem_order_no FK
        int oem_batch_no
        string status
    }

    tbl_thung60_kho {
        string id_60 PK
        string product_code
        string current_pack360_id FK
        string current_oem_order_no FK
        string status
    }

    pack360_event {
        string event_id PK
        string pack360_id FK
        string event_type
        string old_status
        string new_status
        string performed_by
        string request_id
    }
```
