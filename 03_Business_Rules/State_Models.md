# State Models - Kho thành phẩm sản xuất

## 1. Mục đích

Tài liệu mô tả mô hình trạng thái cho các đối tượng nghiệp vụ chính trong WMS kho thành phẩm.

## 2. State model - Thùng 60

```mermaid
stateDiagram-v2
    [*] --> TEMP_RECEIVED: quét nhập tạm
    TEMP_RECEIVED --> AVAILABLE: thủ kho xác nhận nhập chính thức
    TEMP_RECEIVED --> [*]: hủy nhập tạm

    AVAILABLE --> PALLETIZED: gán pallet
    PALLETIZED --> AVAILABLE: tách khỏi pallet

    AVAILABLE --> PACKED_360: đưa vào Pack360
    PACKED_360 --> WAITING_REPACK: tách/giải phóng Pack360
    WAITING_REPACK --> PACKED_360: đóng lại Pack360
    WAITING_REPACK --> AVAILABLE: release chờ xử lý

    AVAILABLE --> ALLOCATED: phân bổ xuất
    ALLOCATED --> PICKED: pick
    PICKED --> STAGED: đưa ra khu chờ giao
    STAGED --> SHIPPED: xác nhận xuất

    AVAILABLE --> TEMP_ISSUED: xuất tạm
    TEMP_ISSUED --> RETURNED: hoàn nhập
    TEMP_ISSUED --> SHIPPED: tất toán thành xuất thật
    TEMP_ISSUED --> SCRAPPED: tất toán hủy

    AVAILABLE --> SCRAPPED: hủy hàng
    RETURNED --> AVAILABLE: release sau xử lý
    RETURNED --> SCRAPPED: hủy
```

### Ghi chú

- `stock_type` là phân loại tồn, không phải status. Một thùng có thể `status = AVAILABLE` nhưng `stock_type = BLOCKED`, khi đó không được xuất.
- Thùng 60 ảo sinh ra từ xuất lẻ vẫn đi theo state model này, nhưng có `is_virtual = 1`.
- `SHIPPED` và `SCRAPPED` là trạng thái cuối; nếu sai phải xử lý bằng reversal/adjustment.

## 3. State model - Stock type của thùng 60

```mermaid
stateDiagram-v2
    [*] --> UNRESTRICTED: nhập chính thức hoặc release
    UNRESTRICTED --> BLOCKED: dư đơn / chất lượng / partial remaining / exception
    BLOCKED --> UNRESTRICTED: release hợp lệ
    UNRESTRICTED --> TEMPORARY_ISSUE: xuất tạm
    TEMPORARY_ISSUE --> UNRESTRICTED: hoàn nhập
    TEMPORARY_ISSUE --> SCRAP: tất toán hủy
    TEMPORARY_ISSUE --> [*]: tất toán xuất thật
    UNRESTRICTED --> RETURNED: hàng trả về
    RETURNED --> UNRESTRICTED: duyệt dùng lại
    RETURNED --> SCRAP: hủy
    UNRESTRICTED --> SCRAP: hủy
```

### Block reason

| Stock type | Reason |
|---|---|
| `BLOCKED` | `OEM_SURPLUS` |
| `BLOCKED` | `QUALITY_ISSUE` |
| `BLOCKED` | `PARTIAL_REMAINING` |
| `BLOCKED` | `PACK360_NEED_REVIEW` |
| `BLOCKED` | `DATA_EXCEPTION` |
| `BLOCKED` | `WAITING_DECISION` |

## 4. State model - Phiên nhập tạm

```mermaid
stateDiagram-v2
    [*] --> DRAFT: tạo phiên
    DRAFT --> SCANNING: bắt đầu quét
    SCANNING --> TEMP_CONFIRMED: NV kho xác nhận nhập tạm
    TEMP_CONFIRMED --> RETURNED_FOR_CHECK: thủ kho trả lại kiểm tra
    RETURNED_FOR_CHECK --> SCANNING: quét bổ sung/sửa phiên
    TEMP_CONFIRMED --> OFFICIALLY_CONFIRMED: thủ kho xác nhận nhập chính thức
    SCANNING --> CANCELLED: hủy phiên
    TEMP_CONFIRMED --> CANCELLED: hủy phiên chờ xác nhận
    OFFICIALLY_CONFIRMED --> [*]
    CANCELLED --> [*]
```

## 5. State model - Dòng phiếu giao kho sản xuất

```mermaid
stateDiagram-v2
    [*] --> OPEN
    OPEN --> PARTIAL_TEMP_RECEIVED: quét nhập tạm một phần
    PARTIAL_TEMP_RECEIVED --> TEMP_RECEIVED: quét đủ tạm
    TEMP_RECEIVED --> PARTIAL_OFFICIAL_RECEIVED: xác nhận chính thức một phần
    PARTIAL_TEMP_RECEIVED --> PARTIAL_OFFICIAL_RECEIVED: xác nhận chính thức một phần
    TEMP_RECEIVED --> OFFICIALLY_RECEIVED: xác nhận đủ
    PARTIAL_OFFICIAL_RECEIVED --> OFFICIALLY_RECEIVED: xác nhận bổ sung đủ
    OFFICIALLY_RECEIVED --> CLOSED
    OPEN --> CANCELLED
    PARTIAL_TEMP_RECEIVED --> CANCELLED
```

## 6. State model - Pack360

```mermaid
stateDiagram-v2
    [*] --> OPEN: tạo Pack360
    OPEN --> COMPLETED: complete đóng thùng
    OPEN --> CANCELLED: hủy Pack360 chưa complete
    COMPLETED --> PALLETIZED: gán pallet
    PALLETIZED --> COMPLETED: tách khỏi pallet
    COMPLETED --> COMPLETED_ADJUSTED: tách một phần nhưng còn hợp lệ
    COMPLETED --> NEED_REVIEW: tách một phần và không còn đạt rule
    COMPLETED --> RELEASED: giải phóng toàn bộ
    COMPLETED_ADJUSTED --> NEED_REVIEW: phát sinh không hợp lệ
    NEED_REVIEW --> COMPLETED: xử lý và xác nhận lại
    NEED_REVIEW --> RELEASED: giải phóng
    COMPLETED --> ALLOCATED: phân bổ xuất
    ALLOCATED --> PICKED: pick
    PICKED --> STAGED: stage
    STAGED --> SHIPPED: xác nhận xuất
    SHIPPED --> [*]
    RELEASED --> [*]
    CANCELLED --> [*]
```

## 7. State model - Yêu cầu chuyển đơn OEM

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED: gửi duyệt
    SUBMITTED --> APPROVED: duyệt
    SUBMITTED --> REJECTED: từ chối
    APPROVED --> POSTED: post chuyển đơn
    APPROVED --> CANCELLED: hủy trước post
    POSTED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

## 8. State model - Yêu cầu chuyển stock type

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    SUBMITTED --> APPROVED
    SUBMITTED --> REJECTED
    APPROVED --> POSTED: đổi stock type
    APPROVED --> CANCELLED
    POSTED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

## 9. State model - Yêu cầu giải phóng/tách/đóng lại Pack360

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    SUBMITTED --> APPROVED
    SUBMITTED --> REJECTED
    APPROVED --> POSTED: orchestrator thực hiện
    APPROVED --> CANCELLED
    POSTED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

## 10. State model - Yêu cầu xuất lẻ

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> VALIDATED: kiểm tra thùng gốc và số lượng
    VALIDATED --> SPLIT_CREATED: tạo thùng 60 ảo trong bảng thùng 60
    SPLIT_CREATED --> SOURCE_BLOCKED: khóa thùng gốc nếu còn thiếu chuẩn
    SOURCE_BLOCKED --> ALLOCATED: thùng ảo phân bổ cho phiếu xuất
    ALLOCATED --> PICKED
    PICKED --> STAGED
    STAGED --> SHIPPED
    DRAFT --> CANCELLED
    VALIDATED --> REJECTED
    SHIPPED --> [*]
    CANCELLED --> [*]
    REJECTED --> [*]
```

## 11. State model - Thùng 60 Ảo (Virtual Box)

```mermaid
stateDiagram-v2
    [*] --> VIRTUAL_CREATED: Sinh thùng ảo (từ Nhập lẻ / Xuất lẻ)
    VIRTUAL_CREATED --> AVAILABLE: Sẵn sàng sử dụng tạm thời
    
    AVAILABLE --> ALLOCATED: Phân bổ (chỉ áp dụng nếu là xuất lẻ)
    AVAILABLE --> BLOCKED: Khóa chờ bù/trừ số lượng vật lý
    
    BLOCKED --> RESOLVED_MERGED: Bù đủ hàng vật lý (Gộp)
    AVAILABLE --> RESOLVED_CONSUMED: Xuất hết hàng (Tất toán)
    
    RESOLVED_MERGED --> [*]: Xóa / Ẩn thùng ảo
    RESOLVED_CONSUMED --> [*]: Xóa / Ẩn thùng ảo
```

### Ràng buộc nghiệp vụ (Business Rules)
- **Thùng ảo sinh ra từ Nhập lẻ (UC04.1)**: Đại diện cho số lượng trên chứng từ nhưng thực tế kho chưa nhận được. Trạng thái kế toán (`stock_type`) mặc định là `UNRESTRICTED` nhưng **tuyệt đối không được phép** đưa vào đóng kiện Pack360 (UC05) cho đến khi bù đủ hàng thực tế.
- **Thùng ảo sinh ra từ Xuất lẻ (UC15/UC10)**: Đại diện cho phần hàng được tách ra từ một Thùng vật lý gốc để đi xuất. Thùng gốc sẽ bị khóa một phần (`BLOCKED - PARTIAL_REMAINING`). Thùng ảo này sẽ luân chuyển qua các bước `ALLOCATED -> PICKED -> STAGED -> SHIPPED` bình thường.
