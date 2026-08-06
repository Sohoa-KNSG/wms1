# Activity Diagrams - Kho thành phẩm sản xuất

**Dự án:** Hệ thống quản lý kho thành phẩm WMS  
**Nhóm tài liệu:** 02_Process_UseCase  
**File:** Activity_Diagrams.md  
**Phiên bản:** 5.0  
**Ngày cập nhật:** 2026-07-07

---

## 1. Activity - Nhập kho tạm và xác nhận chính thức

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn phiếu giao kho]
    A --> B[Chọn dòng chi tiết]
    B --> C[Scan QR thùng 60]
    C --> D{QR đúng dòng phiếu?}
    D -- Không --> E[Thông báo lỗi]
    E --> C
    D -- Có --> F[Thêm vào phiên nhập tạm]
    F --> G{Scan tiếp?}
    G -- Có --> C
    G -- Không --> H[Xác nhận nhập tạm]
    H --> I[Thủ kho kiểm tra]
    I --> J{Đủ điều kiện?}
    J -- Không --> K[Trả lại/hủy/yêu cầu bổ sung]
    K --> C
    J -- Có --> L[Post nhập chính thức]
    L --> End([End])
```

---

## 2. Activity - Gán pallet / lưu kho

```mermaid
flowchart TD
    Start([Start]) --> A[Scan thùng 60 hoặc Pack360]
    A --> B[Scan pallet]
    B --> C{Pallet hợp lệ?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Gán pallet]
    E --> F{Mục đích lưu?}
    F -- Lưu kho --> G[Putaway vị trí]
    F -- Chờ đóng 360 --> H[Đưa vào khu chờ đóng]
    F -- Chờ xuất --> I[Đưa vào khu chờ xuất]
    G --> J[Ghi event/audit]
    H --> J
    I --> J
    J --> End([End])
```

---

## 3. Activity - Đóng Pack360 hàng truyền thống

```mermaid
flowchart TD
    Start([Start]) --> A[Tạo Pack360 OPEN]
    A --> B[Scan thùng 60 đầu tiên]
    B --> C[Load rule chuẩn SKU]
    C --> D[Scan thùng tiếp theo]
    D --> E{Đúng SKU/rule?}
    E -- Không --> F[Từ chối]
    E -- Có --> G[Thêm vào Pack360]
    G --> H{Đủ slot/số lượng?}
    H -- Không --> D
    H -- Có --> I[Complete Pack360]
    I --> J[Ghi event/audit]
    J --> End([End])
```

---

## 4. Activity - Đóng Pack360 hàng OEM

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn OEM/PO/pack rule]
    A --> B[Tạo Pack360 OPEN]
    B --> C[Scan thùng 60]
    C --> D{Thùng được phép theo đơn?}
    D -- Không --> E[Từ chối]
    D -- Có --> F[Thêm vào Pack360]
    F --> G{Đủ rule OEM/PO?}
    G -- Không --> C
    G -- Có --> H[Complete Pack360]
    H --> I[Ghi event/audit]
    I --> End([End])
```

---

## 5. Activity - Giải phóng / tách Pack360

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn Pack360]
    A --> B[Hiển thị danh sách thùng 60]
    B --> C{Loại thao tác?}
    C -- Giải phóng toàn bộ --> D[Nhập lý do]
    C -- Tách một phần --> E[Chọn thùng cần tách]
    D --> F{Đủ điều kiện?}
    E --> F
    F -- Không --> G[Từ chối]
    F -- Có --> H[Duyệt]
    H --> I[Cập nhật Pack360 và quan hệ thùng]
    I --> J[Ghi relation history/event/audit]
    J --> End([End])
```

---

## 6. Activity - Chuyển đơn OEM

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn thùng/Pallet/Pack360]
    A --> B[Chọn đơn OEM/PO mới]
    B --> C{Đủ điều kiện chuyển?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Tạo request]
    E --> F[Duyệt]
    F --> G[Cập nhật OEM/PO/pack rule]
    G --> H[Ghi event/audit/reclassification]
    H --> End([End])
```

---

## 7. Activity - Khóa tồn / chuyển stock type

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn đối tượng tồn]
    A --> B[Chọn stock_type = BLOCKED]
    B --> C[Chọn reason: OEM_SURPLUS/QUALITY_ISSUE/PARTIAL_REMAINING]
    C --> D{Đang allocated/picked/staged?}
    D -- Có --> E[Từ chối hoặc hủy phân bổ trước]
    D -- Không --> F[Duyệt]
    F --> G[Cập nhật stock type]
    G --> H[Ghi event/audit/reclassification]
    H --> End([End])
```

---

## 8. Activity - Release tồn bị khóa

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn hàng BLOCKED]
    A --> B[Xem reason]
    B --> C[Nhập lý do release]
    C --> D{Đủ quyền release?}
    D -- Không --> E[Từ chối]
    D -- Có --> F[Chuyển về UNRESTRICTED hoặc stock type phù hợp]
    F --> G[Ghi event/audit]
    G --> End([End])
```

---

## 9. Activity - Xuất nguyên thùng / Pack360

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn phiếu xuất]
    A --> B[Phân bổ hàng]
    B --> C{Stock type được xuất?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Pick]
    E --> F[Stage]
    F --> G[Xác nhận xuất]
    G --> H[Ledger giảm tồn, audit]
    H --> End([End])
```

---

## 10. Activity - Xuất lẻ từ thùng 60

```mermaid
flowchart TD
    Start([Start]) --> A[Chọn phiếu xuất]
    A --> B[Chọn dòng xuất]
    B --> C[Chọn thùng 60 gốc]
    C --> D[Nhập số lượng xuất lẻ]
    D --> E{Số lượng hợp lệ?}
    E -- Không --> F[Từ chối]
    E -- Có --> G[Sinh bản ghi thùng 60 mới trong bảng thùng 60]
    G --> H[Gán is_virtual=1, parent_id_60, root_id_60]
    H --> I[Cập nhật thùng gốc còn lại]
    I --> J[Block thùng gốc reason PARTIAL_REMAINING]
    J --> K[Thùng ảo đi pick/stage/xuất]
    K --> L[Ghi split history/event/audit/ledger]
    L --> End([End])
```

---

## 11. Activity - Xuất tạm và hoàn nhập

```mermaid
flowchart TD
    Start([Start]) --> A[Tạo chứng từ xuất tạm]
    A --> B[Chọn hàng]
    B --> C{Đủ điều kiện?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Chuyển stock_type = TEMPORARY_ISSUE]
    E --> F[Ghi event/audit]
    F --> G{Hàng quay về?}
    G -- Có --> H[Hoàn nhập]
    G -- Không --> I[Tất toán]
    H --> J[Cập nhật stock type/status]
    I --> J
    J --> K[Ghi ledger/audit]
    K --> End([End])
```

---

## 12. Activity - Xử lý ngoại lệ / adjustment / reversal

```mermaid
flowchart TD
    Start([Start]) --> A[Phát hiện sai lệch]
    A --> B[Phân loại sai lệch]
    B --> C{Đã post ledger?}
    C -- Chưa --> D[Hủy/sửa phiên tạm có audit]
    C -- Rồi --> E[Tạo reversal/adjustment request]
    E --> F[Duyệt]
    F --> G[Post reversal/adjustment]
    D --> H[Ghi audit]
    G --> H
    H --> End([End])
```
