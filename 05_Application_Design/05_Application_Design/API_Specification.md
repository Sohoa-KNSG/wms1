# API Specification - Wrapper gọi SQL Stored Procedure

## 1. Mục tiêu

API trong thiết kế này đóng vai trò **wrapper** giữa App/Handheld/Admin Portal và SQL Server Stored Procedure.

Business logic không nằm trong API. API chỉ thực hiện:

1. Xác thực người dùng.
2. Chuẩn hóa request.
3. Gọi đúng Stored Procedure.
4. Truyền tham số.
5. Nhận kết quả trả về từ Stored Procedure.
6. Trả response cho App.

Nếu dùng Power Apps SQL Connector trực tiếp, tài liệu API này có thể được hiểu là **contract gọi Stored Procedure**.

## 2. Response chuẩn

```json
{
  "status": "SUCCESS",
  "message": "Xử lý thành công",
  "error_code": null,
  "document_no": "RC-20260706-0001",
  "object_code": "TH60-0001",
  "request_id": "REQ-20260706-000001",
  "trace_id": "e7b9b5d2-0000-0000-0000-000000000001"
}
```

## 3. Header chuẩn

| Header | Bắt buộc | Ý nghĩa |
|---|---:|---|
| `Authorization` | Có | Bearer token nếu dùng API |
| `X-Request-Id` | Có | Mã chống gửi lặp |
| `X-Device-Id` | Không | Mã thiết bị handheld |
| `X-Source-Screen` | Không | Màn hình phát sinh command |

## 4. Endpoint chính

### 4.1. Scan nhập tạm thùng 60

```http
POST /api/v1/receipt/temp-sessions/{sessionNo}/scan
```

Gọi Stored Procedure:

```sql
usp_Receipt_ScanThung60
```

Request:

```json
{
  "handover_no": "PGK-0001",
  "handover_line_no": "1",
  "qr_60": "TH60-0001",
  "user_code": "NV001",
  "device_id": "HH-001"
}
```

### 4.2. Xác nhận nhập tạm

```http
POST /api/v1/receipt/temp-sessions/{sessionNo}/confirm-temp
```

Gọi Stored Procedure:

```sql
usp_Receipt_TempConfirm
```

### 4.3. Thủ kho xác nhận nhập chính thức

```http
POST /api/v1/receipt/temp-sessions/{sessionNo}/confirm-official
```

Gọi Stored Procedure:

```sql
usp_Receipt_OfficialConfirm
```

### 4.4. Tạo Pack360

```http
POST /api/v1/pack360/create
```

Gọi Stored Procedure:

```sql
usp_Pack360_Create
```

### 4.5. Thêm thùng 60 vào Pack360

```http
POST /api/v1/pack360/{pack360Id}/units
```

Gọi Stored Procedure:

```sql
usp_Pack360_AddThung60
```

### 4.6. Complete Pack360

```http
POST /api/v1/pack360/{pack360Id}/complete
```

Gọi Stored Procedure:

```sql
usp_Pack360_Complete
```

### 4.7. Giải phóng Pack360

```http
POST /api/v1/pack360/{pack360Id}/release
```

Gọi Stored Procedure:

```sql
usp_Pack360_Release
```

### 4.8. Tách thùng khỏi Pack360

```http
POST /api/v1/pack360/{pack360Id}/split-units
```

Gọi Stored Procedure:

```sql
usp_Pack360_SplitUnits
```

Request:

```json
{
  "unit_ids": ["TH60-0001", "TH60-0002"],
  "reason_code": "REPACK",
  "note": "Tách để đóng lại Pack360 mới"
}
```

### 4.9. Chuyển đơn OEM

```http
POST /api/v1/oem-transfer/post
```

Gọi Stored Procedure:

```sql
usp_OEM_Transfer_Post
```

### 4.10. Chuyển stock type

```http
POST /api/v1/stock-type/change
```

Gọi Stored Procedure:

```sql
usp_StockType_Change_Post
```

Request:

```json
{
  "object_type": "THUNG60",
  "object_codes": ["TH60-0001"],
  "new_stock_type": "BLOCKED",
  "reason_code": "OEM_SURPLUS",
  "note": "Dư đơn OEM, chờ quyết định xử lý"
}
```

### 4.11. Release stock type

```http
POST /api/v1/stock-type/release
```

Gọi Stored Procedure:

```sql
usp_StockType_Release
```

### 4.12. Xuất lẻ từ thùng 60

```http
POST /api/v1/outbound/partial-issue
```

Gọi Stored Procedure:

```sql
usp_Outbound_PartialIssue
```

Request:

```json
{
  "issue_no": "IS-0001",
  "issue_line_no": "1",
  "source_id_60": "TH60-0001",
  "split_qty": 3,
  "uom": "PCS",
  "user_code": "NV001",
  "device_id": "HH-001"
}
```

Response:

```json
{
  "status": "SUCCESS",
  "message": "Đã tạo thùng 60 ảo từ nghiệp vụ xuất lẻ",
  "document_no": "IS-0001",
  "object_code": "TH60-0001-SPLIT-001",
  "request_id": "REQ-0001",
  "trace_id": "..."
}
```

## 5. Error code thường dùng

| Error Code | Mô tả |
|---|---|
| `QR_NOT_FOUND` | Không tìm thấy QR |
| `INVALID_STATUS` | Trạng thái không hợp lệ |
| `BLOCKED_STOCK` | Hàng đang bị BLOCKED |
| `DUPLICATE_REQUEST` | Request đã được xử lý |
| `PACK360_RULE_FAILED` | Không đạt rule đóng Pack360 |
| `PARTIAL_QTY_INVALID` | Số lượng xuất lẻ không hợp lệ |
| `PERMISSION_DENIED` | Không có quyền |
