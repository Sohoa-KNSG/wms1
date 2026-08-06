# Business Rules - Kho thành phẩm sản xuất

## 1. Mục đích

Tài liệu này định nghĩa các quy tắc nghiệp vụ cho hệ thống WMS kho thành phẩm xoay quanh đối tượng quản lý chính là **thùng 60**.

Phiên bản này cập nhật theo các nghiệp vụ mới nhất:

- Nhập tạm theo phiếu giao kho từ data sản xuất.
- Thủ kho xác nhận nhập chính thức.
- Hàng OEM lấy tự động thông tin OEM/PO/pack rule từ dòng phiếu giao kho.
- Đóng Pack360 cho hàng truyền thống và hàng OEM.
- Hàng OEM có thể đóng Pack360 khác mã hàng và số lượng tùy đơn/PO.
- Quản trị tồn trong quá trình lưu kho: chuyển đơn OEM, chuyển stock type, khóa tồn, release tồn.
- Dư đơn OEM hoặc vấn đề chất lượng phát hiện trong kho được chuyển `stock_type = BLOCKED`.
- `TEMPORARY_ISSUE` chỉ dùng cho nghiệp vụ xuất tạm, không dùng cho dư đơn hoặc vấn đề chất lượng.
- Giải phóng Pack360, tách một/vài thùng 60, đóng lại Pack360 mới.
- Xuất lẻ từ thùng 60: tạo bản ghi thùng 60 mới trong cùng bảng thùng 60, có `is_virtual = 1`, `parent_id_60`, `root_id_60`.

## 2. Nguyên tắc nghiệp vụ tổng thể

| Mã rule | Quy tắc | Ghi chú |
|---|---|---|
| BR-GEN-001 | UI, thiết bị scan và app không được cập nhật trực tiếp trạng thái thùng, Pack360, pallet hoặc tồn kho. | Mọi thay đổi đi qua Orchestrator. |
| BR-GEN-002 | Mỗi nghiệp vụ phải được gọi bằng command có `request_id`. | Chống gửi lặp khi mạng yếu hoặc người dùng bấm lại. |
| BR-GEN-003 | Orchestrator phải kiểm tra quyền, dữ liệu đầu vào, trạng thái hiện tại và điều kiện nghiệp vụ trước khi ghi dữ liệu. | Không tin dữ liệu từ client. |
| BR-GEN-004 | Mỗi thay đổi trạng thái, stock type, vị trí, Pack360, pallet, OEM/PO phải ghi event history. | Dùng để truy vết vòng đời thùng 60. |
| BR-GEN-005 | Nghiệp vụ quan trọng phải ghi audit log: ai làm, lúc nào, đối tượng nào, trước/sau ra sao. | Bắt buộc cho nhập chính thức, xuất, split, block, release, chuyển đơn, Pack360. |
| BR-GEN-006 | Nghiệp vụ làm tăng/giảm tồn chính thức hoặc chuyển phân loại tồn phải ghi Inventory Ledger hoặc ledger reclassification. | Ledger không sửa/xóa trực tiếp. |
| BR-GEN-007 | Sai sau khi đã post phải xử lý bằng reversal, adjustment hoặc request xử lý ngoại lệ. | Không sửa tay dữ liệu đã post. |
| BR-GEN-008 | `status` mô tả bước vận hành; `stock_type` quyết định hàng có được sử dụng/xuất hay không. | Không gộp hai ý nghĩa này vào một cột. |

## 3. Quy tắc trạng thái thùng 60

### 3.1. Status chuẩn

| Status | Ý nghĩa | Ghi chú |
|---|---|---|
| `TEMP_RECEIVED` | Đã quét nhập tạm, chờ thủ kho xác nhận. | Chưa post ledger, chưa được xuất. |
| `AVAILABLE` | Có thể sử dụng trong kho. | Chỉ xuất được nếu `stock_type = UNRESTRICTED`. |
| `PALLETIZED` | Đã gán lên pallet. | Có thể nằm trên pallet để lưu kho, chờ đóng 360 hoặc chờ xuất. |
| `PACKED_360` | Đã nằm trong Pack360 active. | Phải có relation history. |
| `ALLOCATED` | Đã phân bổ cho phiếu xuất. | Không được chuyển OEM hoặc block nếu chưa hủy phân bổ. |
| `PICKED` | Đã pick khỏi vị trí. | Chờ stage hoặc xác nhận xuất. |
| `STAGED` | Đã đưa ra khu chờ giao. | Chưa phải shipped. |
| `SHIPPED` | Đã xuất khỏi kho. | Trạng thái cuối, không sửa tay. |
| `TEMP_ISSUED` | Đã xuất tạm ra khỏi kho. | Phải theo dõi hoàn nhập/tất toán. |
| `RETURNED` | Hàng trả về. | Không tự động thành unrestricted. |
| `SCRAPPED` | Đã hủy/loại bỏ. | Trạng thái cuối. |
| `WAITING_REPACK` | Chờ đóng lại Pack360 sau khi tách/giải phóng. | Không dùng để xuất nếu stock type bị khóa. |

### 3.2. Quy tắc về status

| Mã rule | Quy tắc |
|---|---|
| BR-ST-001 | Thùng 60 chỉ được đổi status qua event hợp lệ. |
| BR-ST-002 | Thùng `SHIPPED` hoặc `SCRAPPED` không được thao tác tiếp nếu không có nghiệp vụ đảo/reversal. |
| BR-ST-003 | Thùng `TEMP_RECEIVED` chưa được phân bổ, pick, stage hoặc xuất. |
| BR-ST-004 | Thùng `ALLOCATED`, `PICKED`, `STAGED` không được chuyển đơn OEM hoặc chuyển stock type nếu chưa hủy nghiệp vụ xuất liên quan. |
| BR-ST-005 | Thùng 60 ảo sinh ra từ xuất lẻ vẫn dùng status như thùng 60 bình thường, nhưng phải có `is_virtual = 1`. |

## 4. Quy tắc stock type

### 4.1. Stock type chuẩn

| Stock type | Khi dùng | Có được xuất mặc định? |
|---|---|---|
| `UNRESTRICTED` | Tồn tự do, được sử dụng. | Có |
| `BLOCKED` | Dư đơn OEM, vấn đề chất lượng phát hiện trong kho, chờ quyết định, sai lệch dữ liệu, thùng gốc còn thiếu chuẩn sau xuất lẻ. | Không |
| `RETURNED` | Hàng trả về. | Tùy phê duyệt |
| `TEMPORARY_ISSUE` | Hàng đã xuất tạm ra khỏi kho, cần hoàn nhập hoặc tất toán. | Không |
| `CUSTOMER_OWNED` | Hàng thuộc khách/bên ngoài. | Không |
| `SCRAP` | Hàng phế/hủy. | Không |

### 4.2. Block reason chuẩn

| Block reason | Khi dùng |
|---|---|
| `OEM_SURPLUS` | Dư đơn OEM hoặc dư kế hoạch, chờ chuyển đơn hoặc xử lý. |
| `QUALITY_ISSUE` | Có vấn đề chất lượng phát hiện trong quá trình lưu kho. |
| `PARTIAL_REMAINING` | Thùng 60 gốc còn lại sau xuất lẻ, không đủ số lượng chuẩn. |
| `PACK360_NEED_REVIEW` | Pack360 sau khi tách không còn đạt rule đóng gói. |
| `DATA_EXCEPTION` | Dữ liệu nghi ngờ, thiếu liên kết, sai trạng thái. |
| `WAITING_DECISION` | Chờ quyết định xử lý của quản lý. |

### 4.3. Quy tắc về stock type

| Mã rule | Quy tắc |
|---|---|
| BR-STK-001 | Chỉ `UNRESTRICTED` mới được phân bổ/xuất mặc định. |
| BR-STK-002 | `BLOCKED` không được allocation, pick, stage hoặc xuất. |
| BR-STK-003 | Dư đơn OEM hoặc dư kế hoạch phải chuyển `stock_type = BLOCKED`, reason `OEM_SURPLUS`. |
| BR-STK-004 | Vấn đề chất lượng phát hiện trong kho phải chuyển `stock_type = BLOCKED`, reason `QUALITY_ISSUE`. |
| BR-STK-005 | Không dùng `TEMPORARY_ISSUE` cho dư đơn hoặc vấn đề chất lượng. |
| BR-STK-006 | `TEMPORARY_ISSUE` chỉ dùng khi hàng đã ra khỏi kho theo nghiệp vụ xuất tạm và cần theo dõi hoàn nhập/tất toán. |
| BR-STK-007 | Chuyển stock type phải có lý do, người thực hiện, người duyệt nếu cấu hình yêu cầu, event, audit và ledger reclassification nếu cần. |
| BR-STK-008 | Release từ `BLOCKED` về `UNRESTRICTED` phải kiểm tra quyền và điều kiện release. |

## 5. Quy tắc nhập kho theo phiếu giao kho sản xuất

| Mã rule | Quy tắc |
|---|---|
| BR-IN-001 | Nhân viên kho phải chọn phiếu giao kho từ data sản xuất trước khi quét nhập. |
| BR-IN-002 | Nhân viên kho phải chọn dòng chi tiết trên phiếu trước khi quét thùng 60. |
| BR-IN-003 | Một phiên nhập tạm chỉ áp dụng cho một dòng chi tiết phiếu giao kho. |
| BR-IN-004 | Chỉ cho phép quét thùng 60 cùng mã hàng với dòng chi tiết đã chọn. |
| BR-IN-005 | OEM/PO/pack rule/customer lấy tự động từ dòng phiếu, không nhập tay tại thời điểm scan. |
| BR-IN-006 | QR trùng trong cùng phiên bị từ chối. |
| BR-IN-007 | Thùng đã nhập chính thức trước đó không được nhập lại nếu không có reversal/adjustment. |
| BR-IN-008 | Xác nhận nhập tạm chưa ghi ledger tăng tồn chính thức và chưa cho xuất. |
| BR-IN-009 | Chỉ thủ kho hoặc người được phân quyền mới được xác nhận nhập chính thức. |
| BR-IN-010 | Khi nhập chính thức, hệ thống cập nhật current state thùng 60, ghi event, audit, Stock Transaction Book và Inventory Ledger tăng tồn. |
| BR-IN-011 | Kho không thực hiện kiểm soát chất lượng đầu vào; nếu phát hiện vấn đề chất lượng sau khi nhập thì dùng nghiệp vụ chuyển stock type sang `BLOCKED`. |

## 6. Quy tắc Pack360

### 6.1. Quy tắc chung

| Mã rule | Quy tắc |
|---|---|
| BR-P360-001 | Pack360 phải có mã/QR duy nhất. |
| BR-P360-002 | Chỉ Pack360 `OPEN` mới được thêm thùng 60. |
| BR-P360-003 | Một thùng 60 chỉ thuộc một Pack360 active tại một thời điểm. |
| BR-P360-004 | Thùng `SHIPPED`, `SCRAPPED`, `TEMP_ISSUED` không được đưa vào Pack360. |
| BR-P360-005 | Complete Pack360 phải ghi event, audit và cập nhật quan hệ Pack360Unit. |
| BR-P360-006 | Pack360 completed mới được gán pallet/lưu kho/xuất theo quy định. |

### 6.2. Hàng truyền thống

| Mã rule | Quy tắc |
|---|---|
| BR-P360-STD-001 | Pack360 truyền thống phải theo rule chuẩn của mã hàng. |
| BR-P360-STD-002 | Các thùng 60 trong Pack360 truyền thống phải cùng mã hàng, trừ khi rule master cho phép khác. |
| BR-P360-STD-003 | Số lượng/slot phải đúng cấu hình chuẩn. |

### 6.3. Hàng OEM

| Mã rule | Quy tắc |
|---|---|
| BR-P360-OEM-001 | Pack360 OEM áp dụng theo rule đơn OEM/PO hoặc packing list. |
| BR-P360-OEM-002 | Pack360 OEM có thể cho phép khác mã hàng trong cùng Pack360 nếu rule OEM/PO cho phép. |
| BR-P360-OEM-003 | Pack360 OEM có thể có số lượng thùng 60 linh hoạt theo đơn/PO. |
| BR-P360-OEM-004 | Hệ thống phải kiểm tra danh sách thùng được phép theo OEM/PO/pack rule trước khi complete. |
| BR-P360-OEM-005 | Nếu rule OEM thay đổi, Pack360 chưa xuất có thể cần chuyển `NEED_REVIEW` hoặc đóng lại. |

## 7. Quy tắc giải phóng, tách và đóng lại Pack360

| Mã rule | Quy tắc |
|---|---|
| BR-P360-REL-001 | Không được xóa vật lý Pack360 đã tạo; chỉ được đổi trạng thái và ghi lịch sử. |
| BR-P360-REL-002 | Chỉ Pack360 chưa xuất, chưa staged, chưa thuộc phiếu xuất active mới được giải phóng hoặc tách. |
| BR-P360-REL-003 | Giải phóng toàn bộ Pack360 chuyển Pack360 sang `RELEASED`; các thùng 60 về `WAITING_REPACK` hoặc `AVAILABLE` theo điều kiện. |
| BR-P360-SPLIT-001 | Tách một/vài thùng 60 khỏi Pack360 phải cập nhật relation history. |
| BR-P360-SPLIT-002 | Pack360 cũ sau khi bị tách phải cập nhật lại số lượng còn lại và trạng thái: `COMPLETED_ADJUSTED`, `NEED_REVIEW` hoặc `RELEASED`. |
| BR-P360-SPLIT-003 | Nếu Pack360 cũ không còn đạt rule đóng gói thì chuyển `NEED_REVIEW`. |
| BR-P360-REP-001 | Thùng 60 tách ra chỉ được đóng lại Pack360 mới khi đạt điều kiện status/stock type. |
| BR-P360-REP-002 | Mọi thao tác giải phóng, tách, đóng lại Pack360 phải ghi Pack360 event, Thung60 event, relation history và audit. |

## 8. Quy tắc chuyển đơn OEM

| Mã rule | Quy tắc |
|---|---|
| BR-OEM-TRF-001 | Chỉ được chuyển đơn OEM khi thùng/Pack360 còn trong kho và chưa shipped. |
| BR-OEM-TRF-002 | Không được chuyển OEM nếu thùng đang `ALLOCATED`, `PICKED`, `STAGED` hoặc thuộc phiếu xuất active. |
| BR-OEM-TRF-003 | Đơn OEM/PO mới phải hợp lệ, còn hiệu lực và có nhu cầu hoặc được phê duyệt vượt nhu cầu. |
| BR-OEM-TRF-004 | Nếu chuyển OEM làm thay đổi pack rule, hệ thống phải cập nhật `pack_rule_code` và đánh dấu Pack360 `NEED_REVIEW` nếu cần. |
| BR-OEM-TRF-005 | Chuyển OEM phải có lý do, người yêu cầu, người duyệt, event và audit. |
| BR-OEM-TRF-006 | Nếu tồn được quản lý theo dimension OEM/PO, chuyển OEM phải ghi ledger reclassification. |

## 9. Quy tắc xuất kho và xuất lẻ

### 9.1. Xuất kho chung

| Mã rule | Quy tắc |
|---|---|
| BR-OUT-001 | Chỉ hàng `stock_type = UNRESTRICTED` mới được phân bổ xuất mặc định. |
| BR-OUT-002 | Không xuất hàng `BLOCKED`, `TEMPORARY_ISSUE`, `SCRAP`, `CUSTOMER_OWNED`. |
| BR-OUT-003 | Không xuất vượt số lượng phiếu nếu không có quyền/phê duyệt. |
| BR-OUT-004 | Xác nhận xuất cuối cùng phải ghi ledger giảm tồn và audit. |
| BR-OUT-005 | Sau khi `SHIPPED`, không sửa tay trạng thái. |

### 9.2. Xuất lẻ từ thùng 60

| Mã rule | Quy tắc |
|---|---|
| BR-PARTIAL-001 | Xuất lẻ chỉ áp dụng khi lấy một phần số lượng từ thùng 60 gốc. |
| BR-PARTIAL-002 | Nếu số lượng lấy bằng toàn bộ current qty thì xử lý như xuất nguyên thùng, không tạo thùng ảo. |
| BR-PARTIAL-003 | Nếu số lượng lấy nhỏ hơn current qty, hệ thống tạo một bản ghi thùng 60 mới trong bảng thùng 60 hiện có. |
| BR-PARTIAL-004 | Bản ghi sinh ra từ xuất lẻ phải có `is_virtual = 1`. |
| BR-PARTIAL-005 | Bản ghi sinh ra phải lưu `parent_id_60` là thùng gốc trực tiếp và `root_id_60` là thùng gốc ban đầu. |
| BR-PARTIAL-006 | Thùng 60 ảo được quản lý như một thùng 60 bình thường trong luồng pick/stage/xuất. |
| BR-PARTIAL-007 | Thùng 60 gốc sau khi bị lấy lẻ phải cập nhật `current_qty` còn lại. |
| BR-PARTIAL-008 | Nếu thùng gốc không còn đủ số lượng chuẩn, chuyển `stock_type = BLOCKED`, reason `PARTIAL_REMAINING`. |
| BR-PARTIAL-009 | Xuất lẻ phải ghi split history, event history, audit và ledger theo cấu hình. |
| BR-PARTIAL-010 | Không tạo bảng riêng để quản lý thùng 60 ảo; thùng ảo là bản ghi trong bảng thùng 60 hiện có. |

## 10. Quy tắc xuất tạm, hoàn nhập và tất toán

| Mã rule | Quy tắc |
|---|---|
| BR-TEMP-001 | Xuất tạm là nghiệp vụ riêng, dùng `stock_type = TEMPORARY_ISSUE` hoặc status `TEMP_ISSUED` theo thiết kế trạng thái. |
| BR-TEMP-002 | Xuất tạm phải có người nhận, lý do, thời hạn hoàn trả và chứng từ. |
| BR-TEMP-003 | Hàng xuất tạm không được tính là tồn tự do trong kho. |
| BR-TEMP-004 | Hoàn nhập xuất tạm phải ghi event, audit và ledger nếu có biến động tồn. |
| BR-TEMP-005 | Nếu không hoàn nhập mà tất toán thành xuất thật/hủy/điều chỉnh, phải có phê duyệt và ledger tương ứng. |

## 11. Quy tắc audit và ngoại lệ

| Mã rule | Quy tắc |
|---|---|
| BR-AUD-001 | Mọi nghiệp vụ nhập chính thức, Pack360, tách Pack360, chuyển OEM, block/release, xuất lẻ, xuất kho, xuất tạm, adjustment đều phải ghi audit. |
| BR-EXC-001 | QR không tồn tại, QR trùng, sai mã hàng, sai stock type, sai status phải bị từ chối và ghi lỗi. |
| BR-EXC-002 | Hai người thao tác cùng một thùng tại cùng thời điểm phải có cơ chế conflict control. |
| BR-EXC-003 | Mọi command phải idempotent theo `request_id`. |
| BR-EXC-004 | Sai dữ liệu sau khi post phải xử lý bằng reversal, adjustment hoặc exception request. |
