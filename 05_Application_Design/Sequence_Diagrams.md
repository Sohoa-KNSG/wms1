# Sequence Diagrams - Biểu Đồ Tuần Tự Luồng Nghiệp Vụ WMS

Tài liệu này tổng hợp các biểu đồ tuần tự (Sequence Diagram) mô tả chi tiết luồng tương tác giữa Người dùng, Giao diện Frontend, Backend API và Cơ sở dữ liệu SQL Server.

---

## 1. UC16 - Luồng Soạn Hàng & Gợi Ý FIFO (Outbound Picking Flow)

```mermaid
sequenceDiagram
    autonumber
    actor ThuKho as Thủ Kho
    participant UI as Frontend (PickingScreen.jsx)
    participant API as Backend (PickingOutboundController)
    participant DB as SQL Server (WMS1)

    ThuKho->>UI: Chọn phiếu xuất kho (VD: DN-1784706214477-1)
    UI->>API: GET /api/v1/picking/delivery-notes/DN-1784706214477-1
    API->>DB: Query header, lines & scannedBarcodes
    DB-->>API: Trả về chi tiết phiếu xuất
    API-->>UI: 200 OK (Render danh sách mặt hàng)

    ThuKho->>UI: Chọn mặt hàng cần soạn (VD: D.555)
    UI->>API: GET /api/v1/picking/fifo-suggestions/D.555
    API->>DB: EXEC usp_WMS_UC16_GetFifoSuggestions @ProductCode='D.555'
    DB-->>API: Trả về Pack360 FIFO & Thùng 60 Lẻ FIFO
    API-->>UI: 200 OK (Hiển thị Bảng gợi ý vị trí kho & mã thùng ưu tiên)

    ThuKho->>UI: Quét mã vạch thùng 60 tại kệ kho
    UI->>API: POST /api/v1/picking/scan (Header: X-Request-Id: REQ-123)
    API->>DB: EXEC usp_WMS_UC16_ScanBarcode @RequestId='REQ-123', @Barcode='K07/1/D.555...'
    
    alt RequestID đã tồn tại (Retry)
        DB-->>API: Trả về kết quả giao dịch trước đó (Idempotent response)
    else RequestID mới
        DB->>DB: Kiểm tra trạng thái Thùng 60 WITH (UPDLOCK)
        DB->>DB: Cập nhật status = 'PICKED'
        DB->>DB: Ghi bảng delivery_note_barcode & processed_request
        DB-->>API: Giao dịch thành công
    end
    
    API-->>UI: 200 OK (Cập nhật tiến độ & Lịch sử quét)
```

---

## 2. UC16 / UC17 - Luồng Lấy Lẻ Từ Thùng Gốc & Tạo Thùng Ảo (Split Box Flow)

```mermaid
sequenceDiagram
    autonumber
    actor ThuKho as Thủ Kho
    participant UI as Frontend (PickingScreen.jsx)
    participant API as Backend (PickingOutboundController)
    participant DB as SQL Server (WMS1)

    ThuKho->>UI: Click "Lấy lẻ từ thùng gốc" & nhập Số lượng lẻ (VD: 3 SP)
    UI->>API: POST /api/v1/picking/split-box (SourceId60, SplitQty=3)
    API->>DB: EXEC usp_WMS_UC16_SplitBox @SourceId60, @SplitQty=3

    DB->>DB: Khóa thùng gốc WITH (UPDLOCK) & kiểm tra status = 'AVAILABLE'
    DB->>DB: Trừ current_qty thùng gốc (VD: 60 - 3 = 57)
    DB->>DB: Đổi status thùng gốc = 'BLOCKED', reason = 'PARTIAL_REMAINING'
    DB->>DB: Tạo bản ghi Thùng Ảo mới trong tbl_thung60_kho (is_virtual=1, qty=3)
    DB->>DB: Quét tự động Thùng Ảo vào phiếu xuất kho
    DB-->>API: Trả về Mã Thùng Ảo mới sinh (VD: 60A-SPLIT-001)
    API-->>UI: 200 OK (Thông báo đã lấy lẻ & tạo thùng ảo thành công)
```

---

## 3. UC16 - Luồng Kiểm Cổng & Hạch Toán Sổ Cái Kép (Unified Gate Out & Dual Ledger Flow)

```mermaid
sequenceDiagram
    autonumber
    actor BaoVe as Bảo Vệ Kiểm Cổng
    participant UI as Frontend (GateOutScreen.jsx)
    participant API as Backend (PickingOutboundController)
    participant DB as SQL Server (WMS1)

    BaoVe->>UI: Nhập Biển số xe / Mã phiếu & Xác nhận xuất bến
    UI->>API: POST /api/v1/picking/gate-out (LicensePlate, DriverName, SealNo)
    API->>DB: EXEC usp_WMS_UC16_GateOut @FilterType='TRUCK', @FilterValue='51C-123.45'

    DB->>DB: Chuyển status phiếu xuất = 'DISPATCHED'
    DB->>DB: Chuyển status các Thùng 60 / Kiện 360 = 'DISPATCHED'
    
    rect rgb(235, 248, 255)
        note over DB: HẠCH TOÁN SỔ CÁI KÉP (DUAL LEDGER TRANSACTION)
        DB->>DB: 1. Ghi Sổ Nghiệp Vụ Kho (stock_transaction_book)
        DB->>DB: 2. Ghi Sổ Cái Mặt Hàng (item_ledger)
        DB->>DB: 3. Hạch Toán Nợ/Có Sổ Cái Tồn Kho (inventory_ledger)
    end

    DB-->>API: Xác nhận hạch toán xuất bến thành công N phiếu
    API-->>UI: 200 OK (Thông báo xe tải đã được duyệt xuất bến)
```

---

## 4. UC18 - Luồng Xuất Tạm 2 Bước & Hoàn Nhập Trả Hàng Linh Hoạt (Two-Stage Temporary Dispatch & Flexible Return Flow)

```mermaid
sequenceDiagram
    autonumber
    actor ThuKho as Thủ Kho / QC
    participant UI as Frontend (ExportDispatchScreen.jsx / PDA)
    participant Pi4 as Edge IoT Bridge (Pi 4 / Port 8080)
    participant API as C# API (TemporaryDispatchController)
    participant DB as SQL Server (WMS1)

    Note over ThuKho, DB: BƯỚC 1: KHAI BÁO PHIẾU NHU CẦU XUẤT TẠM
    ThuKho->>UI: Khai báo Đối tượng mượn, Lý do, Hạn trả (due_date) & Danh sách SKU
    UI->>API: POST /api/v1/temporary-dispatch (status = PENDING_OUT, Header: X-Request-Id)
    API->>DB: INSERT INTO tbl_temporary_dispatch_header (status='PENDING_OUT')
    DB-->>API: Trả về mã phiếu TEMP-YYYYMMDD-0001
    API-->>UI: 201 Created (Tạo phiếu thành công, chờ quét thực bái)

    Note over ThuKho, DB: BƯỚC 2: QUÉT THI CHUYỂN THAO TÁC XUẤT KHO THỰC TẾ
    ThuKho->>UI: Mang PDA quét mã QR Thùng 60 thực tế tại kệ
    UI->>API: POST /api/v1/temporary-dispatch/TEMP-YYYYMMDD-0001/confirm-scan (Header: X-Request-Id)
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK) SET stock_type='TEMPORARY_ISSUE'
    DB->>DB: Hạch toán Sổ Cái Kép: Nợ INV_TEMP_OUT, Có INV_UNRESTRICTED
    API->>DB: UPDATE tbl_temporary_dispatch_header SET status='TEMP_OUT'
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK (Chốt xuất tạm thành công, ghi nhận tải trọng xuất)

    Note over ThuKho, DB: BƯỚC 3: HOÀN NHẬP TRẢ HÀNG (3 TÌNH HUỐNG TRẢ HÀNG ĐẶC THÙ)
    ThuKho->>UI: Mở Phiếu TEMP-YYYYMMDD-0001 -> Chọn [ Hoàn Nhập Trả Hàng ]
    alt Tình huống 1: Trả nguyên bản (Exact Match)
        ThuKho->>UI: Quét mã Thùng 60 gốc cũ (id_60)
        UI->>API: POST /api/v1/temporary-dispatch/TEMP-YYYYMMDD-0001/return (return_condition='EXACT', id_60)
    else Tình huống 2: Đổi vỏ thùng & Cân IoT In lại Tem Mới (Repack Re-label)
        ThuKho->>Pi4: Đặt thùng mượn lên Cân điện tử -> GET http://localhost:8080/api/scale/current
        Pi4-->>UI: Trả về trọng lượng thực tế (kg)
        ThuKho->>Pi4: Phát lệnh in tem TSPL qua TCP/IP Port 9100 -> Nhận Mã Mới (id_60_new)
        UI->>API: POST /api/v1/temporary-dispatch/TEMP-YYYYMMDD-0001/return (return_condition='REPACKED_NEW_BOX', id_60, returned_id_60=id_60_new)
    else Tình huống 3: Gia công lại đổi sang Mã SKU Khác (Reworked SKU)
        ThuKho->>UI: Chọn Mã SP tái tạo (returned_product_code != product_code gốc)
        UI->>API: POST /api/v1/temporary-dispatch/TEMP-YYYYMMDD-0001/return (return_condition='REWORKED_NEW_SKU', returned_product_code)
    end

    API->>DB: BEGIN TRANSACTION (ACID Execution)
    DB->>DB: Đối soát & hạch toán cấn trừ chỉ tiêu nợ xuất tạm của phiếu gốc
    DB->>DB: Ghi Nhật Ký thung60_event, Đồng bộ Sổ Cái Kép inventory_ledger & item_ledger
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK (Thông báo nhập trả thành công & Đóng phiếu nếu đủ số lượng)
```

---

## 5. UC13 / UC14 - Luồng Chuyển Cờ Trạng Thái Kho & Phong Tỏa QMS (Stock Type Transfer Flow)

```mermaid
sequenceDiagram
    autonumber
    actor QA as Nhân viên QC / Thủ Kho
    participant UI as Frontend (StockManagementScreen.jsx / Modal)
    participant API as C# API (StockTypeChangeController)
    participant DB as SQL Server (WMS1)

    QA->>UI: Chọn lô/thùng 60 cần phong tỏa (BLOCK) hoặc giải tỏa (RELEASE)
    UI->>API: POST /api/v1/stock-type-change (ChangeType='BLOCK', Reason='QMS_DEFECT', Items, Header: X-Request-Id)
    
    API->>DB: BEGIN TRANSACTION
    API->>DB: SELECT 1 FROM command_request_log WITH (UPDLOCK, HOLDLOCK) WHERE request_id = @RequestId
    alt Giao dịch lặp do mạng chớp nhoáng (Idempotency)
        DB-->>API: Phát hiện UUID trùng lặp -> Trả về kết quả trước đó
    else Request chưa thực hiện
        API->>DB: SELECT * FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK) WHERE id_60 IN (@Items)
        DB->>DB: Kiểm tra tính hợp lệ trạng thái (Không cho phép khóa thùng đã DISPATCHED)
        API->>DB: UPDATE tbl_thung60_kho SET stock_type = 'BLOCKED' (hoặc 'UNRESTRICTED')
        API->>DB: INSERT INTO thung60_event (id_60, event_type='STOCK_TYPE_CHANGE', note=@Reason)
        API->>DB: INSERT INTO stock_transaction_book & inventory_ledger (Hạch toán Sổ Cái Kép)
        API->>DB: INSERT INTO command_request_log (request_id, status='SUCCESS')
        API->>DB: COMMIT TRANSACTION
        API-->>UI: 200 OK (Cập nhật giao diện Huy hiệu màu Trạng Thái & Toast Notification)
    end
```

---

## 6. UC17 - Luồng Gom Đóng Kiện 360 & Gán Đơn Hàng OEM (Pack360 Assembly & OEM Mapping)

```mermaid
sequenceDiagram
    autonumber
    actor NV as Nhân viên Đóng Gói
    participant UI as Frontend (Pack360Screen.jsx)
    participant Pi4 as Edge Bridge (Cân & Máy In TSPL Port 8080/9100)
    participant API as C# API (Pack360Controller & OemOrdersController)
    participant DB as SQL Server (WMS1)

    NV->>UI: Khởi tạo Phiên Đóng Kiện 360 mới & Nhập/Chọn Đơn Hàng OEM
    UI->>API: GET /api/v1/oem-orders (Tra cứu danh mục hợp đồng thêu OEM)
    API-->>UI: 200 OK (Danh sách đợt giao, số lượng kế hoạch & quy chuẩn đóng gói)

    loop Quét từng Thùng 60 đưa vào Kiện 360
        NV->>UI: Quét mã QR Thùng 60 (VD: 60001290111)
        UI->>API: POST /api/v1/pack360/scan-unit (pack360_id, id_60, Header: X-Request-Id)
        API->>DB: EXEC usp_WMS_UC17_AddBoxToPack @PackId, @Id60 WITH (UPDLOCK)
        DB-->>API: Trả về thành công, số lượng thùng hiện tại trong Kiện
        API-->>UI: 200 OK (Hiển thị danh sách Thùng 60 đã gia dập trong Kiện)
    end

    NV->>Pi4: Đặt Kiện 360 lên Cân điện tử trạm -> GET /api/scale/current
    Pi4-->>UI: Trả về khối lượng tổng định mức (VD: 152.80 kg)
    NV->>UI: Bấm [ Chốt Kiện 360 ] (Complete Assembly)
    UI->>API: POST /api/v1/pack360/complete (pack360_id, weight=152.80, oem_order_no, Header: X-Request-Id)

    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE pack360_header SET status='COMPLETE', weight=152.80, oem_order_no=@OemNo
    API->>DB: UPDATE tbl_thung60_kho SET parent_pack_id = @PackId, status='PALLETIZED'
    API->>DB: Hạch toán Sổ Cái Kép: Gom số lượng từ cá thể vào mã Kiện tổng hợp
    API->>DB: COMMIT TRANSACTION

    DB-->>API: Chốt Kiện thành công -> Trả về chuỗi QR Kiện 360 (P360-20260728-0088)
    API-->>UI: 200 OK (Kích hoạt lệnh in tem tự động)
    UI->>Pi4: POST http://localhost:8080/api/printer/print (Gửi chuỗi Raw TSPL in tem Kiện 360)
    Pi4-->>UI: 200 OK (Máy in nhãn in thành công tem vạch Kiện 360)
```

