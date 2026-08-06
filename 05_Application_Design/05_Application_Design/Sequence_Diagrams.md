# Sequence Diagrams - App gọi SQL Stored Procedure

## 1. Nguyên tắc chung

Các sequence diagram trong tài liệu này mô tả mô hình:

```text
App / Handheld / Admin Portal → API Wrapper hoặc SQL Connector → SQL Stored Procedure → Data Tables
```

Stored Procedure là nơi xử lý logic nghiệp vụ, transaction, event, ledger và audit.

---

## 2. Nhập tạm thùng 60

```mermaid
sequenceDiagram
    actor User as Nhân viên kho
    participant App as App/Handheld
    participant API as API/SQL Connector
    participant SP as usp_Receipt_ScanThung60 / usp_Receipt_TempConfirm
    participant DB as SQL Tables

    User->>App: Chọn phiếu giao kho và dòng chi tiết
    User->>App: Scan QR thùng 60
    App->>App: Sinh request_id
    App->>API: Gửi handover_no, line_no, qr_60, request_id
    API->>SP: Execute Stored Procedure
    SP->>DB: Kiểm tra request_id
    SP->>DB: Kiểm tra QR, mã hàng, trạng thái thùng, trùng phiên
    SP->>DB: Ghi receipt_session_detail
    SP->>DB: Ghi thung60_event và audit_log
    SP-->>API: Trả status/message
    API-->>App: Kết quả scan
    App-->>User: Hiển thị thành công/lỗi

    User->>App: Bấm xác nhận nhập tạm
    App->>API: Gửi receipt_session_no, request_id
    API->>SP: usp_Receipt_TempConfirm
    SP->>DB: Cập nhật session = TEMP_CONFIRMED
    SP->>DB: Ghi event/audit, chưa post ledger
    SP-->>App: SUCCESS
```

---

## 3. Thủ kho xác nhận nhập chính thức

```mermaid
sequenceDiagram
    actor Manager as Thủ kho
    participant Portal as Admin Portal
    participant API as API/SQL Connector
    participant SP as usp_Receipt_OfficialConfirm
    participant DB as SQL Tables

    Manager->>Portal: Mở danh sách nhập tạm chờ xác nhận
    Portal->>API: Lấy receipt session pending
    API->>DB: Query view/report
    DB-->>Portal: Dữ liệu phiên nhập tạm
    Manager->>Portal: Xác nhận nhập chính thức
    Portal->>API: Gửi receipt_session_no, request_id, user
    API->>SP: Execute usp_Receipt_OfficialConfirm
    SP->>DB: BEGIN TRANSACTION
    SP->>DB: Kiểm tra session, số lượng, trạng thái thùng
    SP->>DB: Cập nhật tbl_thung60_kho
    SP->>DB: Ghi inventory_ledger tăng tồn
    SP->>DB: Ghi thung60_event
    SP->>DB: Ghi audit_log
    SP->>DB: COMMIT
    SP-->>Portal: SUCCESS
```

---

## 4. Đóng Pack360 OEM/PO

```mermaid
sequenceDiagram
    actor User as Nhân viên kho
    participant App as App
    participant API as API/SQL Connector
    participant SP as usp_Pack360_Create/Add/Complete
    participant DB as SQL Tables

    User->>App: Chọn đơn OEM/PO hoặc pack rule
    App->>API: Gửi request tạo Pack360
    API->>SP: usp_Pack360_Create
    SP->>DB: Tạo pack360_header status OPEN
    SP-->>App: pack360_id

    loop Scan từng thùng 60
        User->>App: Scan QR thùng 60
        App->>API: Gửi pack360_id, id_60, request_id
        API->>SP: usp_Pack360_AddThung60
        SP->>DB: Kiểm tra rule OEM/PO hoặc rule chuẩn
        SP->>DB: Ghi pack360_unit
        SP->>DB: Cập nhật current state thùng 60
        SP->>DB: Ghi event/audit
        SP-->>App: Kết quả
    end

    User->>App: Complete Pack360
    App->>API: Gửi pack360_id, request_id
    API->>SP: usp_Pack360_Complete
    SP->>DB: Kiểm tra đủ rule
    SP->>DB: Cập nhật Pack360 COMPLETED
    SP->>DB: Ghi event/audit/outbox in tem nếu cần
    SP-->>App: SUCCESS
```

---

## 5. Chuyển stock type sang BLOCKED

```mermaid
sequenceDiagram
    actor Manager as Quản lý kho
    participant Portal as Admin Portal
    participant API as API/SQL Connector
    participant SP as usp_StockType_Change_Post
    participant DB as SQL Tables

    Manager->>Portal: Chọn thùng/Pallet/Pack360 cần khóa
    Manager->>Portal: Chọn stock_type = BLOCKED, reason = OEM_SURPLUS/QUALITY_ISSUE
    Portal->>API: Gửi object list, reason, request_id
    API->>SP: Execute Stored Procedure
    SP->>DB: BEGIN TRANSACTION
    SP->>DB: Kiểm tra object chưa allocated/picked/staged/shipped
    SP->>DB: Cập nhật stock_type = BLOCKED
    SP->>DB: Ghi stock reclassification ledger nếu cần
    SP->>DB: Ghi event/audit
    SP->>DB: COMMIT
    SP-->>Portal: SUCCESS
```

---

## 6. Giải phóng/tách Pack360

```mermaid
sequenceDiagram
    actor User as Nhân viên/Quản lý kho
    participant App as App
    participant API as API/SQL Connector
    participant SP as usp_Pack360_Release / usp_Pack360_SplitUnits
    participant DB as SQL Tables

    User->>App: Chọn Pack360
    App->>DB: Query danh sách thùng 60 bên trong
    DB-->>App: pack360_unit list
    User->>App: Chọn giải phóng toàn bộ hoặc tách một phần
    App->>API: Gửi pack360_id, danh sách id_60, reason, request_id
    API->>SP: Execute Stored Procedure
    SP->>DB: Kiểm tra Pack360 chưa xuất/chưa stage/chưa bị khóa
    SP->>DB: Đóng hiệu lực quan hệ cũ trong pack360_unit_history
    SP->>DB: Cập nhật Pack360 RELEASED/COMPLETED_ADJUSTED/NEED_REVIEW
    SP->>DB: Cập nhật current state thùng 60
    SP->>DB: Ghi event/audit
    SP-->>App: SUCCESS
```

---

## 7. Xuất lẻ từ thùng 60

```mermaid
sequenceDiagram
    actor User as Nhân viên kho
    participant App as App/Handheld
    participant API as API/SQL Connector
    participant SP as usp_Outbound_PartialIssue
    participant DB as SQL Tables

    User->>App: Chọn phiếu xuất và dòng cần xuất
    User->>App: Chọn thùng 60 gốc
    User->>App: Nhập số lượng lấy lẻ, ví dụ 3 cây
    App->>API: Gửi issue_no, line_no, source_id_60, split_qty, request_id
    API->>SP: Execute usp_Outbound_PartialIssue
    SP->>DB: BEGIN TRANSACTION
    SP->>DB: Kiểm tra request_id
    SP->>DB: Kiểm tra thùng gốc còn trong kho, stock_type cho phép, đủ số lượng
    SP->>DB: Tạo bản ghi mới trong tbl_thung60_kho với is_virtual = 1
    SP->>DB: Gán parent_id_60 và root_id_60
    SP->>DB: Cập nhật current_qty thùng gốc
    SP->>DB: Cập nhật thùng gốc stock_type = BLOCKED nếu còn thiếu chuẩn
    SP->>DB: Ghi thung60_split_history
    SP->>DB: Ghi thung60_event, ledger, audit
    SP->>DB: COMMIT
    SP-->>App: SUCCESS + generated_id_60
    App-->>User: Hiển thị thùng 60 ảo đã sinh ra để xuất
```

---

## 8. Xác nhận xuất kho

```mermaid
sequenceDiagram
    actor Manager as Thủ kho/Quản lý
    participant Portal as Admin Portal
    participant API as API/SQL Connector
    participant SP as usp_Outbound_ConfirmShip
    participant DB as SQL Tables

    Manager->>Portal: Kiểm tra phiếu xuất, danh sách pick/stage
    Manager->>Portal: Xác nhận xuất
    Portal->>API: Gửi issue_no, request_id
    API->>SP: Execute usp_Outbound_ConfirmShip
    SP->>DB: BEGIN TRANSACTION
    SP->>DB: Kiểm tra tất cả line hợp lệ
    SP->>DB: Cập nhật status SHIPPED
    SP->>DB: Ghi inventory_ledger giảm tồn
    SP->>DB: Ghi event/audit
    SP->>DB: COMMIT
    SP-->>Portal: SUCCESS
```
