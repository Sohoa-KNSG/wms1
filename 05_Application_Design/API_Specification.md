# API Specification - Đặc Tả Toàn Diện Hệ Thống RESTful API WMS (.NET Core 8.0)

Tài liệu đặc tả kiến trúc kỹ thuật và toàn bộ danh mục **RESTful API Endpoints (15 Phân hệ / 86+ Endpoints)** của hệ thống WMS (Warehouse Management System), được vận hành 100% trên nền tảng **C# ASP.NET Core Web API 8.0** theo tiêu chuẩn kiến trúc Clean Architecture & High-Performance Dapper ORM.

> [!NOTE]
> **Cam Kết Kiến Trúc:** Hệ thống Backend hiện tại chạy độc lập và trọn vẹn trên **C# .NET Core 8.0** (Port `5000` / `5001`). Các hệ thống backend cũ (Node.js/Express) đã được loại bỏ hoàn toàn và được ghi nhận là lỗi thời (Obsoleted).

---

## 1. Quy Chuẩn Kỹ Thuật & Tiêu Chuẩn Giao Tiếp (General Standards)

### 1.1. Cấu hình Cơ sở (Base Configuration)
- **Base URL:** `https://wms.domain.com/api/v1` (hoặc nội bộ Mạng Fab / Mạng Kho: `http://192.168.1.10:5000/api/v1`)
- **Data Format:** JSON (`application/json; charset=utf-8`)
- **Authentication:** Mọi yêu cầu truy cập (trừ `/login` và `/health`) bắt buộc mang HTTP Header `Authorization: Bearer <JWT_TOKEN>`.
- **Idempotency Header:** Bắt buộc mang Header `X-Request-Id: <UUID_V4>` đối với mọi API làm thay đổi trạng thái dữ liệu (HTTP `POST`, `PUT`, `DELETE`).

### 1.2. Cơ Chế Bất Khả Kép & Chống Trùng Lặp Giao Dịch (Idempotency & Retry Assurance)
- Môi trường Wifi tại nhà kho công nghiệp luôn có độ trễ hoặc sự cố rớt sóng chớp nhoáng khi PDA di chuyển qua lại giữa các khu bãi kệ sắt kim loại.
- Để phòng tránh việc người dùng bấm liên tiếp nút "Quét" hoặc client PDA gửi lại request khi vi mạch mạng tạm thời gián đoạn, mọi giao dịch write đều kiểm tra giá trị `X-Request-Id` tại bảng `command_request_log` trong CSDL SQL Server với cơ chế khóa bi quan:
  ```sql
  SELECT 1 FROM command_request_log WITH (UPDLOCK, HOLDLOCK) WHERE request_id = @RequestId;
  ```
- Nếu bản ghi đã tồn tại, hệ thống ngay lập tức trả về kết quả giao dịch hợp lệ cũ (Idempotence Success) và kết thúc tiến trình (Fail-fast), **tuyệt đối không thực thi lại** giao dịch SQL, không tạo ra lỗi đôi và không làm xáo trộn số liệu kho.

### 1.3. Kiến Trúc ACID Transaction & Hạch Toán Sổ Cái Kép (Dual Ledger Architecture)
- Mọi thao tác làm dịch chuyển số lượng hoặc thay đổi tính chất quyền sở hữu tài sản (Nhập kho, Xuất bến, Xuất tạm, Trả hàng, Tách lẻ, Gom bãi Pallet/Thùng 360, Chuyển cờ Stock Type, Chốt sổ) đều thực thi trọn vẹn bên trong một Khối Giao Dịch Nguyên Khối (Atomic SQL Transaction).
- Cấu trúc hạch toán kép đồng bộ tuyệt đối trong 3 hệ thống nhật ký:
  1. **Sổ Nhật Ký Nghiệp Vụ Kho (`stock_transaction_book`):** Ghi nhận Header chứng từ, Transaction ID, Loại nghiệp vụ (`TEMPORARY_DISPATCH`, `STOCK_RECLASSIFY`, `DISPATCH`, `RECEIPT`, ...).
  2. **Sổ Cái Chi Tiết Đơn Vị (`inventory_ledger`):** Lưu trữ biến động theo định danh cá thể rõ ràng của từng mã cá thể (Thùng 60 `id_60` / Kiện 360 `pack360_id`).
  3. **Sổ Cái Tổng Khối Lượng Mặt Hàng (`item_ledger`):** Cân đối các bút toán Nợ (+)/Có (-) của mặt hàng theo mã SKU (`product_code`), hỗ trợ liên tục xuất báo cáo đối soát và đẩy sang hệ thống ERP/SAP mà không tốn công tính toán cộng dồn.

---

## 2. Danh Mục API Endpoints Chi Tiết Theo Phân Hệ

### 📦 2.1. Phân Hệ UC16 Soạn Hàng & Xuất Bến (`PickingOutboundController` - 13 Endpoints)
Quản lý toàn diện quy trình lấy hàng từ giá kệ theo Phiếu Xuất Kho (DN), áp dụng chiến lược xuất trước nhập trước (FIFO) và kiểm duyệt xuất cổng.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Authorization |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/picking/delivery-notes` | Lấy danh sách phiếu xuất kho (Lọc theo `status`: NEW, PICKING, PICKED, STAGED, DISPATCHED) | `Picking.Read` |
| `GET` | `/api/v1/picking/delivery-notes/{id}` | Lấy chi tiết thông tin Header, danh sách mặt hàng và lịch sử quét của một phiếu xuất | `Picking.Read` |
| `GET` | `/api/v1/picking/delivery-notes/{id}/lines/{productCode}/scans` | Lấy chi tiết toàn bộ lịch sử các lượt quét mã của 1 dòng mặt hàng SKU cụ thể | `Picking.Read` |
| `POST` | `/api/v1/picking/scan` | Quét mã vạch thực tế (Thùng 60 / Kiện 360 / Thùng lẻ) tại kệ, cập nhật trạng thái `PICKED` | `Picking.Scan` |
| `POST` | `/api/v1/picking/split-box` | Tách số lượng lẻ từ thùng 60 gốc, khóa thùng gốc và sinh tự động Thùng Ảo (`is_virtual=1`) | `Picking.Scan` |
| `POST` | `/api/v1/picking/complete` | Thủ kho xác nhận hoàn tất thao tác soạn thảo hàng hóa cho một phiếu xuất kho | `Picking.Manage` |
| `GET` | `/api/v1/picking/fifo-suggestions/{productCode}` | Lấy gợi ý thông minh danh sách Thùng 60/Kiện 360 ưu tiên xuất theo tuổi kho FIFO | `Picking.Read` |
| `GET` | `/api/v1/picking/available-boxes/{productCode}` | Lấy danh sách thùng 60 đang có sẵn (`status='AVAILABLE'`) trên toàn kho | `Picking.Read` |
| `POST` | `/api/v1/picking/stage` | Thủ kho trưởng / Giám sát xác nhận duyệt tập kết hàng hóa ra khu bãi tạm xuất (Staging) | `Picking.Approve` |
| `POST` | `/api/v1/picking/gate-out` | Bảo vệ kiểm tra niêm phong xe tải (Seal), chốt sổ xuất bến (`DISPATCHED`) và hạch toán Dual Ledger | `Picking.Ship` |
| `GET` | `/api/v1/picking/truck-summary/{licensePlate}` | Tổng hợp bảng kiểm kê danh mục mặt hàng theo biển số xe tải vận tải | `Picking.Read` |
| `POST` | `/api/v1/picking/trucks/{licensePlate}/complete` | Hoàn tất soạn thảo hàng loạt cho toàn bộ các phiếu xuất kho theo một chuyến xe tải | `Picking.Manage` |
| `POST` | `/api/v1/picking/trucks/{licensePlate}/stage` | Xác nhận duyệt tập kết hàng loạt cho tất cả các phiếu thuộc một chuyến xe | `Picking.Approve` |

---

### 📥 2.2. Phân Hệ Nhập Kho & Quản Lý Phiếu Bàn Giao (`ReceiptController` - 16 Endpoints)
Tiếp nhận thành phẩm bàn giao từ nhà xưởng Sản xuất, quét xác nhận Thùng 60 và ghi sổ thực tế tồn kho.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) |
| :---: | :--- | :--- |
| `GET` | `/api/v1/receipt/handovers` | Lấy danh sách các Phiếu giao kho bàn giao từ xưởng sản xuất (Production Handovers) |
| `GET` | `/api/v1/receipt/handover/{no}` | Xem chi tiết từng dòng mặt hàng và thông số bàn giao của 1 phiếu giao kho |
| `GET` | `/api/v1/receipt/orders/search?keyword={kw}` | Tìm kiếm nhanh đơn hàng OEM theo chuỗi khóa để gán vào biên bản bàn giao |
| `POST` | `/api/v1/receipt/map-order` | Ánh xạ & gán mã Đơn hàng OEM / Đợt giao hàng cho dòng mặt hàng trong phiếu bàn giao |
| `POST` | `/api/v1/receipt/scan` | Quét xác nhận Thùng 60 trong một phiên làm việc nhập kho tạm thời (Session Scan) |
| `POST` | `/api/v1/receipt/confirm` | Chốt xác nhận chính thức cho một phiên nhập kho toàn diện |
| `POST` | `/api/v1/receipt/scan-thung60` | Quét Thùng 60 nhập kho trực tiếp gắn theo Biên bản bàn giao sản xuất (UC03) |
| `POST` | `/api/v1/receipt/confirm-nhap-kho` | Thủ kho chính thức duyệt dòng nhập kho trọn gói, kích hoạt ghi tăng tồn kho kho thành phẩm |
| `POST` | `/api/v1/receipt/confirm-nhap-le` | Xác nhận nhập vào kho cho phần số lượng bị dư / thiếu lẻ thùng (Tự động sinh thùng ảo) |
| `POST` | `/api/v1/receipt/confirm-nhap-le-batch` | Xử lý nhập lẻ theo lô hàng loạt cho nhiều dòng biên bản bàn giao cùng lúc |
| `POST` | `/api/v1/receipt/cancel-scan` | Hủy bỏ một lượt quét sai định dạng hoặc thao tác nhầm trên giao diện scanner PDA |
| `GET` | `/api/v1/receipt/confirm-list` | Truyền danh sách các Phiếu giao kho đang treo, chờ Thủ kho phê chuẩn chính thức |
| `GET` | `/api/v1/receipt/confirm-handover/{handoverNo}/lines` | Liệt kê chi tiết các dòng thuộc phiếu bàn giao đang ở trạng thái chờ xác nhận nhập kho |
| `GET` | `/api/v1/receipt/confirm-detail/{handoverNo}/{lineNo}` | Tra cứu trực tiếp danh sách mã QR Thùng 60 thuộc dòng phiếu đang chờ phê duyệt |
| `GET` | `/api/v1/receipt/handover/{handoverNo}/line/{lineNo}/progress` | Lấy thống kê thời gian thực tiến độ quét nhập kho theo từng dòng SKU |
| `GET` | `/api/v1/receipt/handover/{handoverNo}/line/{lineNo}/scanned-boxes` | Liệt kê danh sách trọn vẹn các mã Thùng 60 đã quét hợp lệ trong phiên làm việc |
| `POST` | `/api/v1/receipt/handover/{handoverNo}/cancel-scan` | Hủy thao tác quét của một bản ghi gắn cụ thể với số biên bản bàn giao |

---

### 🍱 2.3. Phân Hệ Gom Đóng Kiện 360 & Hàng Thêu OEM (`Pack360Controller` & `OemOrdersController` - 14 Endpoints)
Cung cấp khả năng quét gom các Thùng 60 riêng lẻ thành Kiện 360 tiêu chuẩn hoặc quy chuẩn Packing theo đơn hàng OEM cụ thể.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) |
| :---: | :--- | :--- |
| `POST` | `/api/v1/pack360/scan-unit` | Quét đưa Thùng 60 vào trong một Kiện 360 (Tạo mới kiện nếu mã kiện chưa có sẵn) |
| `POST` | `/api/v1/pack360/complete` | Chốt chùm kiện 360, ghi nhận trọng lượng cân điện tử và khởi tạo mã vạch Kiện |
| `POST` | `/api/v1/pack360/cancel` | Hủy bỏ quá trình gom kiện 360 đang diễn ra và giải phóng toàn bộ Thùng 60 bên trong |
| `GET` | `/api/v1/pack360/{id}` | Truy cập chi tiết cấu trúc Kiện 360 cùng danh sách đầy đủ các Thùng 60 trực thuộc |
| `POST` | `/api/v1/pack360/release` | Giải phóng một Kiện 360 hoàn chỉnh về trạng thái Thùng 60 độc lập (Unpack) |
| `POST` | `/api/v1/pack360/detach-units` | Tách rời ra khỏi Kiện 360 một danh sách cụ thể các mã Thùng 60 được chỉ định |
| `POST` | `/api/v1/pack360/complete-repack` | Chốt gia cố lại Kiện sau khi tái xếp dỡ hoặc thay thế thùng vỡ hỏng (Repack completion) |
| `POST` | `/api/v1/pack360/transfer-order` | Chuyển đổi quyền điều phối Kiện 360 sang mục tiêu của một Mã Đơn Hàng OEM khác |
| `GET` | `/api/v1/oem-orders/products` | Truy xuất danh mục Sản phẩm OEM hợp lệ từ hệ thống View dữ liệu Master |
| `GET` | `/api/v1/oem-orders` | Truy vấn danh sách và tiến độ sản xuất/giao nhận của các Đơn Hàng OEM |
| `POST` | `/api/v1/oem-orders/import` | Tải hàng loạt danh sách danh mục Đơn Hàng OEM theo mác đợt giao từ tệp dữ liệu Excel |
| `POST` | `/api/v1/oem-orders` | Tạo mới một đơn hàng theo dõi giao hàng OEM với khách hàng chỉ định |
| `PUT` | `/api/v1/oem-orders/{orderNo}/{productCode}/{batchNo}` | Cập nhật thông số số lượng kế hoạch và mốc hạn thời gian hoàn thành (Due date) Đơn OEM |
| `GET` | `/api/v1/oem-orders/{orderNo}/{productCode}/{batchNo}/history` | Tra cứu toàn bộ lịch sử chỉnh sửa và theo dõi các thay đổi trên Đơn Hàng OEM |

---

### 🏗️ 2.4. Phân Hệ Quản Lý Pallet & Kệ Bãi (`PalletController` - 7 Endpoints)
Điều phối lưu trữ cụm tài sản trên Pallet bằng gỗ/nhựa và nghiệp vụ đưa lên, hạ xuống Kệ cao tầng.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) |
| :---: | :--- | :--- |
| `POST` | `/api/v1/pallet/init` | Khởi tạo cấu trúc một Pallet trống định danh để sẵn sàng chất hàng |
| `POST` | `/api/v1/pallet/{id}/add-unit` | Gom một Thùng 60 hoặc Kiện 360 lên trên Pallet (Xác nhận qua mã vạch) |
| `POST` | `/api/v1/pallet/{id}/complete` | Chốt niêm phong Pallet sau khi đã chất đầy tải trọng/số lượng quy định |
| `POST` | `/api/v1/pallet/remove-unit` | Gỡ bỏ một đơn vị Thùng/Kiện cụ thể ra khỏi vị trí trên Pallet hiện tại |
| `POST` | `/api/v1/pallet/transfer-unit` | Chuyển tiếp đơn vị Thùng/Kiện trực tiếp từ Pallet cũ sang một Pallet mới khác |
| `GET` | `/api/v1/pallet/{id}/info` | Hiển thị trọn vẹn thông tin chi tiết cấu trúc tầng, tải trọng và thành phần trên Pallet |
| `POST` | `/api/v1/pallet/{id}/putaway` | Thực hiện điều chuyển chất toàn bộ Pallet vào Vị Trí Kệ kho cao tầng (Put-away) |
| `POST` | `/api/v1/pallet/{id}/letdown` | Hạ toàn bộ Pallet từ Vị Trí Kệ kho xuống khu vực hành lang hoặc bãi xuất hàng (Let-down) |

---

### 🔄 2.5. Phân Hệ Chuyển Cờ Trạng Thái Kho - UC13/UC14 (`StockTypeChangeController` - 1 Endpoint)
Xử lý quy trình đánh giá chất lượng (QMS), phong tỏa hàng kém chất lượng hoặc thay đổi tính chất tồn kho (Unrestricted, Blocked, Quality Inspection).

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/stock-type-change` | Chuyển đổi cờ loại hình tồn kho (Hỗ trợ 3 nghiệp vụ: `BLOCK`, `RELEASE`, `RECLASSIFY`). Thực thi khóa ACID `WITH (UPDLOCK, HOLDLOCK)`, ghi log `thung60_event`, và hạch toán Sổ Cái Kép song song vào `inventory_ledger` và `stock_transaction_book`. | `Authorize` (Quyền QMS / Thủ kho) |

---

### 🚀 2.6. Phân Hệ Xuất Tạm & Nhập Trả Hàng Linh Hoạt 2 Bước - UC18 (`TemporaryDispatchController` - 4 Endpoints)
Quản lý luồng xuất kho tạm thời cho mượn đi dự exhibition/trụ sở thử nghiệm/bảo hành và quy trình Nhập trả hàng linh hoạt 2 bước tuyệt mật.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/temporary-dispatch` | Lấy danh sách các phiếu xuất tạm kho (Cho phép lọc theo chuỗi tìm kiếm, `status`, và cờ `overdueOnly=true` để phát hiện các đơn quá hạn hoàn trả) | `Authorize` |
| `POST` | `/api/v1/temporary-dispatch` | **Bước 1 (Khai Báo Mượn Hàng):** Lập phiếu xuất tạm khai báo danh sách thùng 60, thiết lập trạng thái `PENDING_OUT` (hoặc chốt thẳng `TEMPORARY_ISSUE`). Kiểm tra tính khả dụng `UNRESTRICTED` và khóa dòng bi quan `WITH (UPDLOCK, HOLDLOCK)`. | `Authorize` |
| `POST` | `/api/v1/temporary-dispatch/{dispatchNo}/confirm-scan` | **Bước 2 (Quét Thực Tế Trì Giao):** Thực hiện quét xác nhận thực tế tai kho lúc xuất bến. Chuyển trạng thái từ `PENDING_OUT` $\to$ `TEMP_OUT`, kích hoạt hạch toán trừ số lượng Sổ Cái Kép và gắn cờ tài sản rời khỏi kho. | `Authorize` |
| `POST` | `/api/v1/temporary-dispatch/{dispatchNo}/return` | **Xử Lý Hoàn Nhập Trả Hàng (Flexible Return System):** Tiếp nhận hàng hoàn trả về kho từ mượn tạm theo 3 định dạng linh hoạt: <br>1. **Trả nguyên trạng:** Đón nhận thùng nguyên vẹn, phục hồi `UNRESTRICTED`. <br>2. **Trả đổi mã Thùng 60 mới:** Trường hợp vỏ thùng 60 cũ móp méo rách hỏng, cho phép khai báo dán mã tem QR mới sinh ra (`60-RET-xxx`), thừa kế trọn vẹn đặc tính từ thùng cũ. <br>3. **Trả hàng theo mã SKU tái tạo:** Xử lý trả gom từ các đơn vị mượn lẻ rải rác, tổng hợp lại thành Thùng 60 hoàn hảo mới theo tiêu chuẩn đóng gói mã SKU, tự động hạch toán khôi phục số lượng vào Sổ Cái Kép. | `Authorize` |

---

### 📋 2.7. Phân Hệ Nhu Cầu Xuất Kho & Phân Bổ (`ExportRequirementsController` - 5 Endpoints)
Đón nhận nhu cầu đơn đặt hàng xuất bến từ bộ phận Kinh doanh / Logistics và lên phương án tạo phiếu Xuất Kho thực thi.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) |
| :---: | :--- | :--- |
| `POST` | `/api/v1/export/paste-data` | Nhập khẩu nhanh danh sách yêu cầu xuất hàng thông qua thao tác dán dữ liệu bảng từ Excel |
| `GET` | `/api/v1/export/requirements` | Truy vấn danh sách nhu cầu xuất kho đang mở (Tính toán so khớp với tổng số Tồn kho `AVAILABLE` hiện hữu) |
| `DELETE` | `/api/v1/export/requirements` | Xóa bỏ một dòng yêu cầu xuất kho cụ thể (Khi Đơn hàng ở trạng thái `NEW`) |
| `PUT` | `/api/v1/export/requirements` | Chỉnh sửa số lượng nhu cầu cần xuất của mặt hàng SKU và kênh phân phối tương ứng |
| `POST` | `/api/v1/export/delivery-notes` | Chuyển hóa nhu cầu xuất kho hợp lệ thành các Phiếu Xuất Kho chính thức (`delivery_note_header`), gán biển xe tải và tài xế vận tải |

---

### 🧾 2.8. Phân Hệ Sổ Cái Kép, Đối Soát & Chốt Kho (`LedgerController`, `ReconciliationController`, `InventoryClosingController` - 6 Endpoints)
Nhân ách trung tâm đảm bảo sự toàn hảo về tài chính, số lượng và tính khả kiểm định (Auditability) của toàn bộ dữ liệu WMS.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/ledger/transactions` | Lấy danh sách các Bút toán Sổ Cái (UC22.2), lọc theo loại giao dịch (`type`), mốc từ ngày đến ngày | `Ledger.Read` |
| `GET` | `/api/v1/ledger/transactions/{transactionId}/details` | Truy xuất sâu bảng đối chiếu Nợ/Có, gia giảm tồn kho của một giao dịch Ledger cụ thể | `Ledger.Read` |
| `GET` | `/api/v1/reconciliation/transactions/{id}` | Đối soát độ cân bằng tuyệt đối giữa biến động Sổ cái Đơn vị (`inventory_ledger`) và Sổ cái Mặt hàng (`item_ledger`) trong cùng một ID Giao dịch (Kiểm soát chênh lệch `discrepancy < 0.0001`) | `Reconciliation.Read` |
| `GET` | `/api/v1/reconciliation/inventory` | Đối soát tổng tồn kho vật lý chi tiết từng thùng trong bảng `tbl_thung60_kho` so với hình chiếu lũy kế của Sổ Cái (`item_ledger`), lập biên bản chênh lệch nếu có | `Reconciliation.Read` |
| `POST` | `/api/v1/inventory/migrate-initial` | Thực hiện kết chuyển trọn gói Tồn kho Ban đầu (UC24) từ môi trường legacy vào WMS mới và hạch toán phát hành Sổ Cái Kép đầu kỳ | `ADMIN, IT_ADMIN, THU_KHO` |
| `POST` | `/api/v1/inventory/period-close` | Chốt sổ kho cuối kỳ hàng tháng (UC25). Thực thi trong khối SQL Transaction, lưu snapshot tĩnh từng thùng vào `monthly_carton_balances` và snapshot tổng theo SKU vào `monthly_inventory_balances`, gán ID chứng từ chốt (`CLOSE_YYYYMM`). | `ADMIN, IT_ADMIN, THU_KHO` |

---

### 🔍 2.9. Phân Hệ Truy Xuất Ngược Nguồn Gốc & Lịch Sử (`TraceController` - 4 Endpoints)
Phục vụ chẩn đoán sự cố, tra cứu chuỗi gia cố linh kiện, và kiểm duyệt nguồn gốc sản xuất (Traceability) theo chuỗi thực tế.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/trace/units/{id60}` | Truy xuất dòng đời toàn vẹn của một Thùng 60 (Từ khâu bàn giao, các lượt sự kiện `thung60_event`, lịch sử bị tách lẻ `thung60_split_history`, gom kiện 360 đến lúc xuất bến) | `Trace.Read` |
| `GET` | `/api/v1/trace/packs/{pack360Id}` | Tra cứu cấu trúc lịch sử và sự kiên hình thành của một Kiện 360 cùng toàn bộ Thùng 60 hội tụ bên trong | `Trace.Read` |
| `GET` | `/api/v1/trace/orders/{orderNo}` | Kiểm soát toàn cảnh số lượng, danh sách Thùng 60 và Kiện 360 đã được gắn quy chuẩn cho một Mã Đơn Hàng OEM | `Trace.Read` |
| `GET` | `/api/v1/trace/documents/{type}/{no}` | Tra cứu nhanh bằng chứng thực thi gốc rễ của các dòng chứng từ nghiệp vụ (Phiếu xuất bến, Báo cáo mượn tạm) | `Trace.Read` |

---

### 🏛️ 2.10. Phân Hệ Quản Lý Danh Mục Khối Môi Trường (`MasterDataController` - 8 Endpoints)
Cấu hình danh tính các nhà quản trị xung quanh bến bãi giao nhận WMS.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/master/trucks` | Lấy danh sách Biển số xe tải chở hàng đang ở trạng thái Hoạt động (`ACTIVE`) | `MasterData.Read` |
| `POST` | `/api/v1/master/trucks` | Thêm mới thông tin đăng kiểm Xe tải (Biển số, Tải trọng tối đa Kg, Thể tích m3 tối đa) | `MasterData.Manage` |
| `GET` | `/api/v1/master/drivers` | Lấy danh sách Tài xế vận chuyển chính thức | `MasterData.Read` |
| `POST` | `/api/v1/master/drivers` | Khái báo hồ sơ mới cho Tài xế (Họ tên, Số điện thoại liên lạc) | `MasterData.Manage` |
| `GET` | `/api/v1/master/guards` | Lấy danh sách Bảo vệ Kiểm cổng vận hành tại Trạm Gate | `MasterData.Read` |
| `POST` | `/api/v1/master/guards` | Bổ sung danh tính Bảo vệ kiểm cổng hệ thống | `MasterData.Manage` |
| `GET` | `/api/v1/master/customers` | Lấy danh sách Đối tác & Khách hàng phân phối của nhà kho | `MasterData.Read` |
| `POST` | `/api/v1/master/customers` | Khởi tạo Khách hàng mới (Mã KH, Tên đầy đủ, Địa chỉ xuất hóa đơn) | `MasterData.Manage` |

---

### 📊 2.11. Phân Hệ Báo Cáo Tồn Kho & Kết Xuất Dữ Liệu (`ReportsController` - 4 Endpoints)
Cung cấp khả năng tổng hợp siêu tốc bức tranh hiện Trạng tài sản, gom nhóm thông minh theo đa tầng bao bì.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/inventory/macro` | Báo cáo tổng quan tầm nhìn vĩ mô (Macro) gom theo mã SKU, Khách hàng, Đơn hàng OEM, phân mảnh số lượng Thùng Áo, Thùng Rời và Kiện 360 | `Reports.Read` |
| `GET` | `/api/v1/reports/inventory/micro` | Báo cáo chi tiết tầm nhìn vi mô (Micro), hiển thị đến từng cấp định danh Kiện 360 hoặc Thùng 60 độc lập trên bãi kệ | `Reports.Read` |
| `GET` | `/api/v1/reports/inventory/location` | Báo cáo thống kê quy mô hàng hóa phân bổ theo Tọa độ Vị Trí Kệ Bãi (Location Bin/Rack) | `Reports.Read` |
| `GET` | `/api/v1/reports/inventory/export?view={v}` | Kết xuất lập tức dòng báo cáo ra định dạng file trang tính `.CSV` với tiêu đề UTF-8 BOM chống lỗi font tiếng Việt khi mở bằng Microsoft Excel | `Reports.Read` |

---

### 🔐 2.12. Phân Hệ Xác Thực & Quản Trị Người Dùng (`AuthController` - 7 Endpoints)
Xác thực danh tính theo tiêu chuẩn JWT, kiểm soát mật khẩu một lần (OTP/Initial) và gia nhập vai trò theo chính sách.

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Cấp chuỗi xác thực Bearer JWT Token và danh sách Roles/Claims sau khi đăng nhập thành công | `AllowAnonymous` |
| `POST` | `/api/v1/auth/change-password` | Người dùng tự thay đổi mật khẩu định kỳ trong không gian bảo mật cá nhân | `Authorize` |
| `GET` | `/api/v1/auth/users` | Danh sách toàn bộ tài khoản người dùng hoạt động trong hạ tầng nhà kho | `AdminUsers.Manage` |
| `POST` | `/api/v1/auth/admin/users` | Admin khởi tạo tài khoản nhân sự mới cho Trưởng kho / Thủ kho / Sức khỏe hệ thống | `AdminUsers.Manage` |
| `POST` | `/api/v1/auth/admin/reset-password` | Admin ép khôi phục mật khẩu tài khoản về Mật khẩu dùng một lần khởi tạo (One-Time Password) | `AdminUsers.Manage` |
| `PUT` | `/api/v1/auth/admin/users/{id}/status` | Khóa tạm thời (`INACTIVE`) hoặc Kích hoạt lại (`ACTIVE`) tài khoản người dùng định danh | `AdminUsers.Manage` |
| `PUT` | `/api/v1/auth/admin/users/{id}/roles` | Gán hoặc tháo dỡ quyền phân nhóm nghiệp vụ (Role: Admin, IT_Admin, Thu_Kho, Bao_Ve, ... ) | `AdminUsers.Manage` |

---

### 💓 2.13. Phân Hệ Chẩn Đoán Sức Khỏe & Liveness Middleware (Health Check Endpoints)
Được đăng ký tự động qua kiến trúc ASP.NET Core Diagnostic HealthChecks trong `Program.cs` nhằm đảm bảo vận hành bền vững 24/7 (24/7 High-Availability).

| HTTP Method | Endpoint Path | Description (Mô tả nghiệp vụ) | Policy / Auth |
| :---: | :--- | :--- | :--- |
| `GET` | `/health` | Kiểm tra trạng thái tồn tại và sinh lực của máy chủ C# API (Liveness / No DB connection needed) | `AllowAnonymous` |
| `GET` | `/health/live` | Trả về tín hiệu Liveness Ping dành cho hệ thống cân bằng tải (Load Balancer / Kubernetes probe) | `AllowAnonymous` |
| `GET` | `/health/ready` | Kiểm tra độ sẵn sàng nghiệp vụ sâu (Readiness Probe), thực hiện Ping kết nối đến Database SQL Server và Thread Pools | `AllowAnonymous` |

---

## 3. Cấu Trúc Đóng Gói Phục Hợp & Danh Bạ Mã Lỗi (Response Standard & Error Codes)

### 3.1. Định dạng JSON Chuẩn Chỉ (Standard Response Payload)
Mọi endpoint thuộc `src/Wms.Api` đều đóng gói kết quả theo chuỗi khung `ApiResponse<T>` thống nhất:
```json
{
  "status": "SUCCESS",
  "message": "Quét mã vạch thành công và đã hạch toán vào Sổ cái Kép.",
  "data": {
    "pack360_qr": "P360-20260727-0099",
    "weight": 245.5,
    "units_count": 6
  },
  "errorCode": null,
  "requestId": "REQ-1234-UUID-5678"
}
```

### 3.2. Bảng Phân Định Mã Lỗi Kiến Trúc (WmsErrorCodes Reference)
Khi yêu cầu sai phạm quy chế hoặc cẩu thả về trạng thái kho, hệ thống lập tức chốt từ chối (Fail-fast HTTP Status 400 / 401 / 403 / 404 / 409 / 500) và gửi mã lỗi rõ ràng theo danh ngữ sau:

| Error Code (`errorCode`) | HTTP Status | Giải Nghĩa Lỗi & Nguyên Nhân Thực Tế |
| :--- | :---: | :--- |
| `ValidationFailed` | `400 BadRequest` | Thiếu trường thông tin bắt buộc, thông số cân nặng/trường số lượng bị sai (< 0), hoặc sai cú pháp Header Idempotency. |
| `Unauthorized` | `401 Unauthorized` | JWT Token không hợp lệ, hết hạn, hoặc bị sửa đổi trái phép. |
| `Forbidden` | `403 Forbidden` | Tài khoản hợp lệ nhưng không đủ quyền nghiệp vụ thi hành (VD: Tài khoản Bảo Vệ cố gắng bấm "Soạn hàng"). |
| `NotFound` | `404 NotFound` | Thùng 60, Kiện 360, Phiếu xuất hoặc Đơn hàng OEM không tồn tại trong Cơ sở dữ liệu. |
| `InvalidStateTransition` | `409 Conflict` | Thùng hoặc Phiếu đang ở trạng thái không cho phép chuyển đổi (VD: Cố tình xuất bến một Thùng 60 đang mang trạng thái `DISPATCHED` hoặc `BLOCKED`). |
| `DuplicateRecord` | `409 Conflict` | Thử thêm mới Đơn hàng OEM bị ngạch trùng đợt giao, hoặc tài xế đã tồn tại. |
| `SystemError` | `500 Internal Error` | Lỗi gián đoạn đường truyền cáp SQL Server hoặc từ chối thực thi do Deadlock tầng CSDL. |
