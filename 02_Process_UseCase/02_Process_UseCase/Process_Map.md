# Process Map - Kho thành phẩm sản xuất

**Dự án:** Hệ thống quản lý kho thành phẩm WMS  
**Nhóm tài liệu:** 02_Process_UseCase  
**File:** Process_Map.md  
**Phiên bản:** 5.0  
**Ngày cập nhật:** 2026-07-07

---

## 1. Phạm vi quy trình

Tài liệu mô tả quy trình end-to-end của kho thành phẩm xoay quanh đối tượng **thùng 60** và **Pack360**. Quy trình bao gồm:

- Nhận data phiếu giao kho từ sản xuất.
- Chọn phiếu giao kho và dòng chi tiết.
- Quét nhập tạm thùng 60.
- Thủ kho xác nhận nhập chính thức.
- Gán pallet / lưu kho / lên kệ / chờ đóng Pack360 / chờ xuất.
- Đóng Pack360 theo rule truyền thống hoặc rule OEM/PO.
- Giải phóng Pack360, tách một/vài thùng 60 khỏi Pack360, đóng lại Pack360 mới.
- Chuyển đơn OEM trong quá trình lưu kho.
- Chuyển stock type, khóa tồn, release tồn.
- Xuất nguyên thùng, xuất Pack360, xuất lẻ từ thùng 60.
- Xuất tạm, hoàn nhập, tất toán.
- Điều chỉnh, reversal và xử lý ngoại lệ.
- Truy vết vòng đời thùng 60 từ nhập kho đến xuất kho.

---

## 2. Nguyên tắc tổng thể

| Nguyên tắc | Mô tả |
|---|---|
| Không update trực tiếp | UI và thiết bị không cập nhật trực tiếp trạng thái thùng, Pack360, pallet, vị trí hoặc tồn kho. |
| Orchestrator là cổng nghiệp vụ | Mọi nghiệp vụ ghi nhận qua command/orchestrator. |
| Current state + event | Thùng 60 có trạng thái hiện tại và lịch sử sự kiện đầy đủ. |
| Ledger rõ ràng | Nghiệp vụ tăng/giảm tồn hoặc đổi phân loại tồn phải ghi ledger hoặc reclassification ledger nếu cần. |
| Audit bắt buộc | Nghiệp vụ quan trọng phải ghi ai làm, lúc nào, trước/sau ra sao. |
| Stock type tách khỏi status | `status` mô tả bước vận hành; `stock_type` quyết định hàng có được dùng/xuất hay không. |
| Kho không QC đầu vào | Chất lượng đã được kiểm soát tại chuyền sản xuất trước khi giao kho. Kho chỉ xử lý khóa tồn nếu phát hiện vấn đề sau khi lưu kho. |
| BLOCKED cho hàng bị giữ | Dư đơn OEM hoặc phát hiện vấn đề chất lượng trong kho chuyển `stock_type = BLOCKED`. |
| TEMPORARY_ISSUE chỉ cho xuất tạm | Không dùng `TEMPORARY_ISSUE` cho dư đơn hoặc lỗi chất lượng. |
| Thùng 60 ảo không có bảng riêng | Thùng 60 ảo sinh ra từ xuất lẻ là bản ghi mới trong bảng thùng 60 hiện có. |

---

## 3. Quy trình end-to-end tổng quát

```mermaid
flowchart TD
    A[Data sản xuất tạo phiếu giao kho] --> B[NV kho chọn phiếu giao kho]
    B --> C[NV kho chọn dòng chi tiết]
    C --> D[Hệ thống khóa ngữ cảnh: mã hàng, OEM/PO, pack rule, số lượng còn lại]
    D --> E[Quét QR thùng 60 cùng mã]
    E --> F{QR hợp lệ và đúng dòng phiếu?}
    F -- Không --> F1[Từ chối quét, ghi lỗi, thông báo]
    F -- Có --> G[Thêm vào phiên nhập tạm]
    G --> H{Quét tiếp?}
    H -- Có --> E
    H -- Không --> I[NV kho xác nhận nhập tạm]
    I --> J[Orchestrator ghi receipt session, event, audit; chưa post ledger]
    J --> K[Thủ kho kiểm tra trên màn hình quản lý]
    K --> L{Đủ điều kiện nhập chính thức?}
    L -- Không --> L1[Trả lại xử lý / hủy nhập tạm / yêu cầu bổ sung]
    L1 --> E
    L -- Có --> M[Thủ kho xác nhận nhập chính thức]
    M --> N[Post nhập kho, cập nhật thùng 60, ghi ledger tăng tồn và audit]
    N --> O{Cần đóng Pack360 ngay?}
    O -- Không --> P[Gán thùng 60 lên pallet để lưu kho / chờ đóng / chờ xuất]
    O -- Có --> Q{Loại hàng?}
    Q -- Truyền thống --> R[Đóng Pack360 theo rule chuẩn]
    Q -- OEM --> S[Đóng Pack360 theo rule OEM/PO: có thể khác mã và số lượng tùy đơn]
    R --> T[Complete Pack360]
    S --> T
    T --> U[Gán Pack360 lên pallet / lên kệ / chờ xuất]
    P --> V[Quản lý tồn trong kho]
    U --> V
    V --> W{Có nghiệp vụ lưu kho phát sinh?}
    W -- Chuyển đơn OEM --> X[Tạo yêu cầu chuyển đơn OEM, duyệt, post]
    W -- Khóa tồn / đổi stock type --> Y[Tạo yêu cầu chuyển stock type]
    W -- Giải phóng/tách Pack360 --> Z[Giải phóng, tách hoặc đóng lại Pack360]
    W -- Chuyển vị trí --> MV[Move location / putaway lại]
    W -- Không --> AA[Chờ phân bổ xuất]
    X --> AA
    Y --> AA
    Z --> AA
    MV --> AA
    AA --> AB[Tạo yêu cầu xuất / phân bổ]
    AB --> AC{Xuất nguyên hay xuất lẻ?}
    AC -- Xuất nguyên thùng/Pack360 --> AD[Pick nguyên đơn vị]
    AC -- Xuất lẻ --> AE[Tách số lượng từ thùng 60, sinh thùng 60 ảo]
    AE --> AF[Thùng gốc bị BLOCKED reason PARTIAL_REMAINING]
    AF --> AG[Thùng 60 ảo đi theo luồng pick]
    AD --> AH[Stage]
    AG --> AH
    AH --> AI[Xác nhận xuất]
    AI --> AJ[Ledger giảm tồn, audit, trạng thái SHIPPED]
```

---

## 4. Luồng nhập kho theo phiếu giao kho sản xuất

### 4.1. Mục tiêu

Ghi nhận vật lý thùng 60 từ sản xuất vào kho theo phiếu giao kho. Hàng chỉ trở thành tồn chính thức sau khi **thủ kho xác nhận nhập chính thức**.

### 4.2. Lưu đồ con

```mermaid
flowchart TD
    A[Data sản xuất đồng bộ phiếu giao kho] --> B[NV kho chọn phiếu giao kho]
    B --> C[Chọn dòng chi tiết trên phiếu]
    C --> D[Hệ thống khóa mã hàng, OEM/PO, pack rule, số lượng còn lại]
    D --> E[Scan QR thùng 60]
    E --> F{QR đúng dòng phiếu và chưa trùng?}
    F -- Không --> G[Từ chối, ghi lỗi, hiển thị lý do]
    F -- Có --> H[Thêm thùng vào Receipt Session]
    H --> I{Tiếp tục scan?}
    I -- Có --> E
    I -- Không --> J[NV kho xác nhận nhập tạm]
    J --> K[Orchestrator ghi event TEMP_RECEIVED và audit]
    K --> L[Thủ kho xem danh sách nhập tạm]
    L --> M[Đối chiếu phiếu giao kho, số lượng, danh sách thùng]
    M --> N{Đạt điều kiện?}
    N -- Không --> O[Trả lại xử lý / hủy nhập tạm / yêu cầu bổ sung]
    O --> E
    N -- Có --> P[Xác nhận nhập chính thức]
    P --> Q[Post receipt, cập nhật current state, ledger tăng tồn]
    Q --> R[Thùng 60 sẵn sàng lưu kho / đóng Pack360 / xuất]
```

### 4.3. Bảng bước nghiệp vụ

| Bước | Tác nhân | Thao tác | Hệ thống xử lý | Kết quả |
|---:|---|---|---|---|
| 1 | Data sản xuất | Cung cấp phiếu giao kho và dòng chi tiết | Đồng bộ vào WMS | Có dữ liệu nguồn |
| 2 | Nhân viên kho | Chọn phiếu giao kho | Hiển thị các dòng chi tiết | Chọn đúng phiếu |
| 3 | Nhân viên kho | Chọn dòng chi tiết | Khóa mã hàng, OEM/PO, pack rule, số lượng còn lại | Có ngữ cảnh scan |
| 4 | Nhân viên kho | Scan thùng 60 cùng mã | Kiểm tra QR, mã hàng, trùng phiên, trạng thái | Thêm vào phiên nhập tạm |
| 5 | Nhân viên kho | Xác nhận nhập tạm | Ghi event/audit, chưa post ledger | Chờ thủ kho xác nhận |
| 6 | Thủ kho | Kiểm tra phiên nhập tạm | Đối chiếu phiếu, dòng, số lượng, danh sách thùng | Kết quả đạt/không đạt |
| 7 | Thủ kho | Xác nhận nhập chính thức | Post receipt, ledger tăng tồn, cập nhật current state | Tồn chính thức |

### 4.4. Quy tắc chính

- Một phiên nhập tạm chỉ áp dụng cho **một dòng chi tiết** phiếu giao kho.
- Nhân viên chỉ quét thùng 60 **cùng mã hàng** với dòng chi tiết.
- OEM/PO/pack rule lấy tự động từ dòng phiếu, không nhập tay.
- Nhập tạm chưa được xem là tồn chính thức và chưa được xuất.
- Chỉ thủ kho hoặc người được phân quyền mới xác nhận nhập chính thức.
- Kho không thực hiện QC đầu vào. Nếu trong quá trình lưu kho phát hiện vấn đề chất lượng, dùng nghiệp vụ chuyển stock type sang `BLOCKED`.

---

## 5. Luồng gán pallet / lưu kho / chờ đóng Pack360 / chờ xuất

```mermaid
flowchart TD
    A[Thùng 60 đã nhập chính thức] --> B{Cần đóng Pack360 ngay?}
    B -- Có --> C[Chuyển sang luồng đóng Pack360]
    B -- Không --> D[Gán thùng 60 lên pallet]
    D --> E{Mục đích lưu?}
    E -- Lưu kho --> F[Putaway vào vị trí]
    E -- Chờ đóng Pack360 --> G[Đưa vào khu chờ đóng Pack360]
    E -- Chờ xuất --> H[Đưa vào khu staging/chờ xuất nếu có kế hoạch]
    F --> I[Quản lý tồn hiện tại]
    G --> I
    H --> I
```

| Điểm kiểm soát | Mô tả |
|---|---|
| Pallet hợp lệ | Pallet phải tồn tại, active và không bị khóa. |
| Vị trí hợp lệ | Vị trí/kệ phải đúng loại, còn hiệu lực, không khóa. |
| Không mất dấu vật lý | Hàng vật lý di chuyển thì hệ thống phải ghi event. |
| Chờ đóng Pack360 | Thùng 60 chờ đóng vẫn phải có pallet/vị trí rõ ràng. |

---

## 6. Luồng đóng Pack360

### 6.1. Hàng truyền thống

Hàng truyền thống đóng Pack360 theo rule chuẩn của mã hàng.

```mermaid
flowchart TD
    A[Chọn chức năng đóng Pack360] --> B[Scan thùng 60 đầu tiên]
    B --> C[Hệ thống xác định rule chuẩn theo mã hàng]
    C --> D[Scan các thùng 60 tiếp theo]
    D --> E{Cùng mã và đúng tiêu chuẩn?}
    E -- Không --> F[Từ chối, thông báo lỗi]
    E -- Có --> G[Thêm vào Pack360 OPEN]
    G --> H{Đủ số lượng/slot?}
    H -- Không --> D
    H -- Có --> I[Complete Pack360]
    I --> J[Ghi event, audit, cập nhật current state]
```

### 6.2. Hàng OEM

Hàng OEM đóng Pack360 theo rule của đơn OEM/PO. Rule có thể cho phép:

- Khác mã hàng trong cùng Pack360.
- Số lượng thùng 60 linh hoạt theo đơn.
- Khác slot chuẩn của hàng truyền thống.
- Kiểm theo danh sách BOM, packing list hoặc PO line.

```mermaid
flowchart TD
    A[Chọn đơn OEM/PO hoặc pack rule] --> B[Tạo Pack360 OPEN]
    B --> C[Scan thùng 60]
    C --> D{Thùng thuộc danh sách được phép của OEM/PO?}
    D -- Không --> E[Từ chối scan]
    D -- Có --> F[Thêm vào Pack360Unit]
    F --> G{Đủ rule theo đơn/PO?}
    G -- Không --> C
    G -- Có --> H[Complete Pack360]
    H --> I[Ghi event, audit, in tem nếu cần]
```

### 6.3. Quy tắc chung Pack360

| Rule | Nội dung |
|---|---|
| P360-001 | Pack360 phải có QR duy nhất. |
| P360-002 | Chỉ Pack360 `OPEN` mới được thêm thùng. |
| P360-003 | Một thùng 60 chỉ thuộc một Pack360 active tại một thời điểm. |
| P360-004 | Thùng đã `SHIPPED` hoặc `SCRAPPED` không được ghép. |
| P360-005 | Hàng truyền thống kiểm theo rule chuẩn; hàng OEM kiểm theo rule đơn/PO. |
| P360-006 | Complete Pack360 phải ghi event và audit. |

---

## 7. Luồng giải phóng, tách và đóng lại Pack360

### 7.1. Mục tiêu

Cho phép kho giải phóng Pack360 cũ, hoặc lấy một/vài thùng 60 bên trong để đóng lại Pack360 mới, nhưng vẫn giữ đầy đủ lịch sử quan hệ.

```mermaid
flowchart TD
    A[Chọn Pack360] --> B[Hiển thị danh sách thùng 60 bên trong]
    B --> C{Loại thao tác?}
    C -- Giải phóng toàn bộ --> D[Chọn lý do và xác nhận]
    C -- Tách một phần --> E[Chọn các thùng 60 cần tách]
    D --> F[Orchestrator chuyển Pack360 sang RELEASED]
    E --> G[Orchestrator gỡ quan hệ các thùng được chọn]
    F --> H[Thùng 60 về WAITING_REPACK hoặc AVAILABLE]
    G --> I[Cập nhật Pack360 cũ: COMPLETED_ADJUSTED hoặc NEED_REVIEW]
    H --> J{Có đóng Pack360 mới?}
    I --> J
    J -- Có --> K[Tạo Pack360 mới và scan thùng 60]
    J -- Không --> L[Lưu kho / chờ xử lý]
    K --> M[Complete Pack360 mới]
    L --> N[Ghi relation history, event, audit]
    M --> N
```

### 7.2. Quy tắc chính

- Không xóa vật lý Pack360 đã tạo; chỉ đổi trạng thái và ghi lịch sử.
- Chỉ được giải phóng/tách Pack360 khi chưa xuất, chưa stage, chưa thuộc phiếu xuất active.
- Nếu tách một phần làm Pack360 cũ không còn đạt rule, chuyển `NEED_REVIEW`.
- Thùng 60 tách ra phải có trạng thái phù hợp trước khi đóng lại Pack360 mới.

---

## 8. Luồng lưu kho và quản trị tồn

Trong quá trình lưu kho, hàng có thể phát sinh nghiệp vụ không làm xuất hàng ngay nhưng ảnh hưởng quyền sử dụng tồn.

### 8.1. Chuyển đơn OEM

```mermaid
flowchart TD
    A[Quản lý chọn thùng/Pallet/Pack360] --> B[Chọn chức năng chuyển đơn OEM]
    B --> C[Chọn đơn OEM/PO mới]
    C --> D{Kiểm tra điều kiện chuyển}
    D -- Không hợp lệ --> E[Từ chối, ghi lý do]
    D -- Hợp lệ --> F[Tạo yêu cầu chuyển đơn]
    F --> G[Duyệt]
    G --> H[Orchestrator cập nhật OEM/PO/pack rule]
    H --> I[Ghi event, audit, ledger reclassification nếu cần]
```

### 8.2. Chuyển stock type / khóa tồn

Dùng khi hàng dư đơn cần giữ lại, hoặc phát hiện vấn đề chất lượng sau khi đã nhập kho.

```mermaid
flowchart TD
    A[Chọn thùng/Pallet/Pack360/vị trí] --> B[Chọn chuyển stock type]
    B --> C[Chọn stock_type mới = BLOCKED]
    C --> D[Chọn lý do: OEM_SURPLUS hoặc QUALITY_ISSUE hoặc DATA_EXCEPTION]
    D --> E{Hàng có đang allocated/picked/staged không?}
    E -- Có --> F[Từ chối hoặc yêu cầu hủy phân bổ trước]
    E -- Không --> G[Duyệt yêu cầu]
    G --> H[Orchestrator cập nhật stock type]
    H --> I[Ghi event, audit, ledger reclassification]
    I --> J[Hàng không được phân bổ/xuất]
```

### 8.3. Release tồn bị khóa

```mermaid
flowchart TD
    A[Chọn danh sách hàng BLOCKED] --> B[Xem lý do khóa]
    B --> C[Nhập lý do release]
    C --> D{Đủ quyền release?}
    D -- Không --> E[Từ chối]
    D -- Có --> F[Orchestrator đổi về UNRESTRICTED hoặc stock type phù hợp]
    F --> G[Ghi event, audit, ledger reclassification]
```

---

## 9. Luồng xuất kho

### 9.1. Xuất nguyên thùng / Pack360

```mermaid
flowchart TD
    A[Tạo yêu cầu xuất] --> B[Phân bổ hàng]
    B --> C{Stock type cho phép xuất?}
    C -- Không --> D[Từ chối: BLOCKED/TEMPORARY_ISSUE/SCRAP/CUSTOMER_OWNED]
    C -- Có --> E{Status cho phép xuất?}
    E -- Không --> F[Từ chối: sai trạng thái]
    E -- Có --> G[Pick]
    G --> H[Stage]
    H --> I[Xác nhận xuất]
    I --> J[Cập nhật SHIPPED, ledger giảm tồn, audit]
```

### 9.2. Xuất lẻ từ thùng 60

Khi chỉ cần lấy một phần số lượng từ thùng 60, hệ thống tạo **một bản ghi thùng 60 mới trong bảng thùng 60 hiện có**. Bản ghi này đại diện cho phần số lượng được lấy ra và có thể đi theo luồng xuất như thùng 60 bình thường.

Ví dụ: lấy 3 cây từ thùng gốc 60 cây.

- Thùng gốc còn 57 cây.
- Hệ thống sinh thùng 60 mới số lượng 3 cây.
- Thùng mới có `is_virtual = 1`, `parent_id_60 = thùng gốc`, `root_id_60 = thùng gốc`.
- Thùng gốc chuyển `stock_type = BLOCKED`, `block_reason_code = PARTIAL_REMAINING`.

```mermaid
flowchart TD
    A[Chọn phiếu xuất và dòng cần xuất] --> B[Chọn thùng 60 gốc]
    B --> C[Chọn xuất lẻ]
    C --> D[Nhập số lượng lấy lẻ]
    D --> E{Số lượng hợp lệ và thùng chưa bị khóa?}
    E -- Không --> F[Từ chối, hiển thị lý do]
    E -- Có --> G[Orchestrator tạo bản ghi thùng 60 mới trong bảng thùng 60]
    G --> H[Gán is_virtual = 1, parent_id_60, root_id_60]
    H --> I[Cập nhật thùng gốc: current_qty giảm]
    I --> J[Chuyển thùng gốc stock_type = BLOCKED]
    J --> K[Thùng ảo được allocated/picked cho phiếu xuất]
    K --> L[Ghi split history, event, ledger/audit]
    L --> M[Stage và xác nhận xuất]
```

### 9.3. Quy tắc xuất lẻ

| Rule | Nội dung |
|---|---|
| PI-001 | Xuất lẻ chỉ được thực hiện với thùng 60 còn trong kho và chưa bị khóa. |
| PI-002 | Số lượng xuất lẻ phải nhỏ hơn số lượng hiện có của thùng gốc. |
| PI-003 | Nếu lấy toàn bộ số lượng thì xử lý như xuất nguyên thùng, không sinh thùng ảo. |
| PI-004 | Thùng ảo là bản ghi mới trong bảng thùng 60 hiện có, không có bảng riêng. |
| PI-005 | Thùng ảo phải có `is_virtual = 1`, `parent_id_60`, `root_id_60`. |
| PI-006 | Thùng gốc sau khi bị lấy lẻ phải cập nhật `current_qty` và bị `BLOCKED` nếu không còn đủ số lượng chuẩn. |
| PI-007 | Thùng gốc bị lấy lẻ không được xuất tiếp nếu chưa có nghiệp vụ xử lý/release riêng. |
| PI-008 | Mọi nghiệp vụ split phải ghi event, split history, audit và ledger nếu ảnh hưởng tồn. |

---

## 10. Luồng xuất tạm, hoàn nhập và tất toán

```mermaid
flowchart TD
    A[Quản lý tạo chứng từ xuất tạm] --> B[Chọn thùng/Pallet/Pack360]
    B --> C{Đủ điều kiện xuất tạm?}
    C -- Không --> D[Từ chối]
    C -- Có --> E[Chuyển stock type = TEMPORARY_ISSUE]
    E --> F[Ghi chứng từ xuất tạm, event, audit]
    F --> G{Hàng quay về?}
    G -- Có --> H[Scan hoàn nhập]
    H --> I[Chuyển RETURNED hoặc UNRESTRICTED theo quyết định]
    G -- Không --> J[Tất toán: chuyển xuất thật / điều chỉnh / hủy]
    I --> K[Ghi ledger/audit]
    J --> K
```

---

## 11. Luồng điều chỉnh, reversal và xử lý ngoại lệ

```mermaid
flowchart TD
    A[Phát hiện sai lệch] --> B[Phân loại sai lệch]
    B --> C{Đã post ledger/chứng từ?}
    C -- Chưa post --> D[Hủy hoặc sửa phiên tạm có audit]
    C -- Đã post --> E[Tạo reversal/adjustment request]
    E --> F[Duyệt]
    F --> G[Orchestrator post reversal/adjustment]
    G --> H[Cập nhật current state, ledger, event, audit]
    B --> I{Lỗi dữ liệu nghi ngờ?}
    I -- Có --> J[Tạo exception, khóa đối tượng nếu cần]
    J --> H
```

---

## 12. Quy ước stock type

| Stock Type | Khi dùng | Có được xuất mặc định? |
|---|---|---|
| `UNRESTRICTED` | Tồn tự do, được sử dụng | Có |
| `BLOCKED` | Dư đơn, vấn đề chất lượng phát hiện trong kho, chờ quyết định, sai lệch dữ liệu, thùng gốc bị lấy lẻ | Không |
| `RETURNED` | Hàng trả về | Tùy phê duyệt |
| `TEMPORARY_ISSUE` | Hàng đã xuất tạm ra khỏi kho, cần hoàn trả/tất toán | Không |
| `CUSTOMER_OWNED` | Hàng thuộc khách/bên ngoài | Không |
| `SCRAP` | Hàng hủy/phế | Không |

---

## 13. Điểm kiểm soát quản lý

- Danh sách phiên nhập tạm chờ thủ kho xác nhận.
- Danh sách thùng 60 thuộc `stock_type = BLOCKED` theo lý do: dư đơn, chất lượng, partial remaining, chờ xử lý.
- Danh sách thùng 60 ảo sinh ra từ xuất lẻ và quan hệ với thùng gốc.
- Danh sách Pack360 OPEN quá lâu.
- Danh sách Pack360 NEED_REVIEW sau khi tách thùng.
- Danh sách xuất tạm còn mở/quá hạn.
- Báo cáo vòng đời thùng 60 từ nhập, pallet, Pack360, chuyển đơn, khóa tồn, release, split, xuất.
- Báo cáo ledger nhập - xuất - reclassification - adjustment.
