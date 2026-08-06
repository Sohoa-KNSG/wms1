# BPMN Process - Kho thành phẩm sản xuất

**Dự án:** Hệ thống quản lý kho thành phẩm WMS  
**Nhóm tài liệu:** 02_Process_UseCase  
**File:** BPMN_Process.md  
**Phiên bản:** 5.0  
**Ngày cập nhật:** 2026-07-07

---

## 1. Mục đích

Tài liệu này mô tả các quy trình nghiệp vụ chính theo tư duy BPMN: tác nhân, sự kiện bắt đầu, hoạt động, gateway quyết định, kết quả và ngoại lệ.

Quy tắc nền:

- UI/thiết bị scan chỉ gửi command.
- Orchestrator kiểm tra rule và cập nhật dữ liệu.
- Mọi nghiệp vụ quan trọng ghi event, audit và ledger khi cần.
- Kho không làm QC đầu vào; nếu phát hiện vấn đề trong lưu kho thì chuyển `stock_type = BLOCKED`.

---

## 2. Lane nghiệp vụ

| Lane | Vai trò |
|---|---|
| Data sản xuất | Cung cấp phiếu giao kho và dòng chi tiết. |
| Nhân viên kho | Scan, nhập tạm, pallet, Pack360, pick, stage. |
| Thủ kho / Quản lý kho | Xác nhận nhập chính thức, duyệt chuyển đơn, duyệt stock type, duyệt xuất, xử lý sai lệch. |
| Hệ thống WMS / Orchestrator | Kiểm tra rule, cập nhật current state, event, ledger, audit. |
| ERP/Kế toán | Đối chiếu chứng từ và tồn chính thức. |
| Vận chuyển / Khách hàng | Nhận hàng ở stage/xuất. |

---

## 3. BPMN - Nhập kho tạm và nhập kho chính thức

### 3.1. Sự kiện bắt đầu

Có phiếu giao kho từ sản xuất đã được đồng bộ vào WMS.

### 3.2. Sơ đồ BPMN dạng Mermaid

```mermaid
flowchart TD
    subgraph S1[Data sản xuất]
        A1[Phát sinh phiếu giao kho]
        A2[Đồng bộ dòng chi tiết: mã hàng, số lượng, OEM/PO, pack rule]
    end
    subgraph S2[Nhân viên kho]
        B1[Chọn phiếu giao kho]
        B2[Chọn dòng chi tiết]
        B3[Scan QR thùng 60]
        B4[Xác nhận nhập tạm]
    end
    subgraph S3[Hệ thống WMS / Orchestrator]
        C1[Khóa ngữ cảnh dòng phiếu]
        C2[Kiểm tra QR, mã hàng, số lượng còn lại, request_id]
        C3[Ghi Receipt Session, Event, Audit]
        C4[Chờ xác nhận chính thức]
        C5[Post nhập kho, Ledger tăng tồn]
    end
    subgraph S4[Thủ kho]
        D1[Kiểm tra danh sách nhập tạm]
        D2{Đủ điều kiện?}
        D3[Xác nhận nhập chính thức]
        D4[Trả lại / hủy / yêu cầu bổ sung]
    end
    A1 --> A2 --> B1 --> B2 --> C1 --> B3 --> C2
    C2 -->|Hợp lệ| B4 --> C3 --> C4 --> D1 --> D2
    C2 -->|Không hợp lệ| B3
    D2 -->|Có| D3 --> C5
    D2 -->|Không| D4 --> B3
```

### 3.3. Gateway chính

| Gateway | Điều kiện |
|---|---|
| QR hợp lệ? | QR tồn tại, đúng dòng phiếu, không trùng phiên, chưa bị nhập chính thức. |
| Đủ điều kiện nhập chính thức? | Số lượng hợp lệ, danh sách thùng rõ, không có lỗi treo, thủ kho xác nhận. |

### 3.4. Kết quả

- Nhập tạm: có receipt session, event và audit; chưa post ledger.
- Nhập chính thức: cập nhật current state, ledger tăng tồn, audit.

---

## 4. BPMN - Gán pallet / lưu kho / chờ đóng Pack360

```mermaid
flowchart TD
    A[Thùng 60 nhập chính thức] --> B{Có đóng Pack360 ngay?}
    B -- Có --> C[Chuyển qua quy trình đóng Pack360]
    B -- Không --> D[Gán pallet]
    D --> E{Mục đích?}
    E -- Lưu kho --> F[Putaway vào vị trí]
    E -- Chờ đóng 360 --> G[Đưa vào khu chờ đóng]
    E -- Chờ xuất --> H[Đưa vào khu chờ xuất]
    F --> I[Orchestrator ghi event/audit]
    G --> I
    H --> I
```

---

## 5. BPMN - Đóng Pack360

### 5.1. Hàng truyền thống

```mermaid
flowchart TD
    A[Start: chọn đóng Pack360 chuẩn] --> B[Scan thùng 60 đầu tiên]
    B --> C[Orchestrator xác định rule chuẩn theo SKU]
    C --> D[Scan thùng tiếp theo]
    D --> E{Đúng SKU và rule chuẩn?}
    E -- Không --> F[Từ chối scan]
    E -- Có --> G[Thêm vào Pack360 OPEN]
    G --> H{Đủ slot/số lượng?}
    H -- Không --> D
    H -- Có --> I[Complete Pack360]
    I --> J[Ghi Pack360Event, Thung60Event, Audit]
```

### 5.2. Hàng OEM

```mermaid
flowchart TD
    A[Start: chọn đơn OEM/PO] --> B[Tạo Pack360 OPEN]
    B --> C[Scan thùng 60]
    C --> D{Thùng được phép theo rule OEM/PO?}
    D -- Không --> E[Từ chối scan]
    D -- Có --> F[Thêm vào Pack360Unit]
    F --> G{Đủ packing rule theo đơn?}
    G -- Không --> C
    G -- Có --> H[Complete Pack360]
    H --> I[Ghi event/audit/in tem nếu cần]
```

---

## 6. BPMN - Giải phóng / tách / đóng lại Pack360

```mermaid
flowchart TD
    A[Start: chọn Pack360] --> B[Hiển thị danh sách thùng 60]
    B --> C{Loại thao tác?}
    C -- Giải phóng toàn bộ --> D[Nhập lý do]
    C -- Tách một phần --> E[Chọn thùng 60 cần tách]
    D --> F{Pack360 chưa xuất/chưa stage?}
    E --> F
    F -- Không --> G[Từ chối]
    F -- Có --> H[Duyệt thao tác]
    H --> I[Orchestrator cập nhật Pack360 và quan hệ thùng]
    I --> J[Thùng tách ra về WAITING_REPACK/AVAILABLE]
    J --> K{Có đóng Pack360 mới?}
    K -- Có --> L[Chuyển sang quy trình đóng Pack360]
    K -- Không --> M[Lưu kho/chờ xử lý]
    L --> N[Ghi relation history, event, audit]
    M --> N
```

---

## 7. BPMN - Chuyển đơn OEM

```mermaid
flowchart TD
    A[Start: chọn thùng/Pallet/Pack360] --> B[Chọn chuyển đơn OEM]
    B --> C[Chọn đơn OEM/PO mới]
    C --> D{Điều kiện hợp lệ?}
    D -- Không --> E[Từ chối và ghi lý do]
    D -- Có --> F[Tạo yêu cầu chuyển đơn]
    F --> G[Duyệt]
    G --> H[Orchestrator cập nhật OEM/PO/pack rule]
    H --> I[Ghi event, audit, ledger reclassification nếu cần]
```

---

## 8. BPMN - Chuyển stock type / khóa tồn / release tồn

```mermaid
flowchart TD
    A[Start: chọn đối tượng tồn] --> B[Chọn chuyển stock type]
    B --> C{Loại thao tác?}
    C -- Khóa tồn --> D[Chọn BLOCKED và reason]
    C -- Release --> E[Chọn stock type đích]
    D --> F{Đang allocated/picked/staged?}
    E --> G{Đủ quyền release?}
    F -- Có --> H[Từ chối hoặc yêu cầu hủy phân bổ]
    F -- Không --> I[Duyệt khóa tồn]
    G -- Không --> J[Từ chối]
    G -- Có --> K[Duyệt release]
    I --> L[Orchestrator cập nhật stock type]
    K --> L
    L --> M[Ghi event, audit, reclassification]
```

---

## 9. BPMN - Xuất nguyên thùng/Pack360

```mermaid
flowchart TD
    A[Tạo phiếu xuất] --> B[Phân bổ hàng]
    B --> C{Stock type được xuất?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Pick]
    E --> F[Stage]
    F --> G[Xác nhận xuất]
    G --> H[Ledger giảm tồn, status SHIPPED, audit]
```

---

## 10. BPMN - Xuất lẻ từ thùng 60

```mermaid
flowchart TD
    A[Start: chọn phiếu xuất] --> B[Chọn dòng xuất]
    B --> C[Chọn thùng 60 gốc]
    C --> D[Chọn xuất lẻ và nhập số lượng]
    D --> E{Số lượng hợp lệ?}
    E -- Không --> F[Từ chối]
    E -- Có --> G[Orchestrator tạo bản ghi thùng 60 mới trong bảng thùng 60]
    G --> H[Gán is_virtual=1, parent_id_60, root_id_60]
    H --> I[Cập nhật thùng gốc còn lại]
    I --> J[Thùng gốc stock_type=BLOCKED, reason=PARTIAL_REMAINING]
    J --> K[Thùng ảo allocated/picked]
    K --> L[Stage và xác nhận xuất]
    L --> M[Ghi split history, event, ledger, audit]
```

---

## 11. BPMN - Xuất tạm / hoàn nhập / tất toán

```mermaid
flowchart TD
    A[Start: tạo chứng từ xuất tạm] --> B[Chọn hàng xuất tạm]
    B --> C{Đủ điều kiện?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Chuyển stock type=TEMPORARY_ISSUE]
    E --> F[Ghi chứng từ, event, audit]
    F --> G{Hàng quay về?}
    G -- Có --> H[Hoàn nhập]
    G -- Không --> I[Tất toán]
    H --> J[Chuyển RETURNED/UNRESTRICTED theo quyết định]
    I --> K[Chuyển xuất thật/điều chỉnh/hủy]
    J --> L[Ghi ledger/audit]
    K --> L
```
