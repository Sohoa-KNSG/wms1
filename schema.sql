-- Schema WMS Kho Thành Phẩm (Phiên bản 5.0)
-- Dialect: SQL Server (T-SQL)

-- ==============================================
-- 1. Inbound (Nhập kho)
-- ==============================================

CREATE TABLE production_handover_header (
    handover_no NVARCHAR(50) NOT NULL,
    production_area NVARCHAR(100),
    handover_date DATE NOT NULL,
    status NVARCHAR(30) NOT NULL,
    created_by NVARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (handover_no)
);
GO

CREATE TABLE tbl_oem_orders_history (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    oem_order_no NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    batch_no INT NOT NULL,
    action_type NVARCHAR(20) NOT NULL,
    old_data NVARCHAR(MAX),
    new_data NVARCHAR(MAX),
    action_by NVARCHAR(50) NOT NULL,
    action_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE TABLE tbl_temporary_dispatch_header (
    dispatch_no NVARCHAR(50) NOT NULL PRIMARY KEY,
    reason_code NVARCHAR(50) NOT NULL,
    borrower_name NVARCHAR(100) NOT NULL,
    dispatch_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_cartons INT NOT NULL DEFAULT 0,
    total_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    returned_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    converted_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    status NVARCHAR(30) NOT NULL DEFAULT 'TEMPORARY_ISSUE',
    created_by NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE TABLE tbl_temporary_dispatch_detail (
    dispatch_no NVARCHAR(50) NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    qty DECIMAL(18,4) NOT NULL,
    item_status NVARCHAR(30) NOT NULL DEFAULT 'TEMPORARY_ISSUE',
    returned_id_60 NVARCHAR(50) NULL,
    returned_product_code NVARCHAR(50) NULL,
    returned_qty DECIMAL(18,4) NULL DEFAULT 0,
    return_condition NVARCHAR(50) NULL, -- 'EXACT', 'REPACKED_NEW_BOX', 'REWORKED_NEW_SKU', 'DAMAGED'
    returned_at DATETIME,
    PRIMARY KEY (dispatch_no, id_60)
);
GO


CREATE TABLE production_handover_line (
    handover_no NVARCHAR(50) NOT NULL,
    handover_line_no INT NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    product_name NVARCHAR(255),
    planned_qty DECIMAL(18,4) NOT NULL,
    temp_received_qty DECIMAL(18,4) DEFAULT 0,
    official_received_qty DECIMAL(18,4) DEFAULT 0,
    remaining_qty DECIMAL(18,4) DEFAULT 0,
    oem_order_no NVARCHAR(50),
    oem_batch_no INT,
    po_no NVARCHAR(50),
    po_line_no NVARCHAR(50),
    customer_code NVARCHAR(50),
    pack_rule_code NVARCHAR(50),
    packing_standard_type NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    PRIMARY KEY (handover_no, handover_line_no)
);
GO

CREATE TABLE receipt_session_header (
    receipt_session_no NVARCHAR(50) NOT NULL,
    handover_no NVARCHAR(50) NOT NULL,
    handover_line_no INT NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    oem_order_no NVARCHAR(50),
    oem_batch_no INT,
    po_no NVARCHAR(50),
    pack_rule_code NVARCHAR(50),
    status NVARCHAR(30) NOT NULL,
    scanned_qty DECIMAL(18,4) NOT NULL DEFAULT 0,
    temp_confirmed_by NVARCHAR(50),
    temp_confirmed_at DATETIME,
    official_confirmed_by NVARCHAR(50),
    official_confirmed_at DATETIME,
    PRIMARY KEY (receipt_session_no)
);
GO

CREATE TABLE receipt_session_detail (
    receipt_session_no NVARCHAR(50) NOT NULL,
    line_no INT NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    qr_60 NVARCHAR(255) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    scan_result NVARCHAR(30) NOT NULL,
    error_code NVARCHAR(50),
    scanned_by NVARCHAR(50) NOT NULL,
    scanned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_id NVARCHAR(100),
    request_id NVARCHAR(100) NOT NULL,
    PRIMARY KEY (receipt_session_no, line_no)
);
GO

-- ==============================================
-- 2. Core: Thùng 60 & Lịch sử
-- ==============================================

CREATE TABLE tbl_thung60_kho (
    id_60 NVARCHAR(50) NOT NULL,
    qr_60 NVARCHAR(255) NOT NULL UNIQUE,
    product_code NVARCHAR(50) NOT NULL,
    product_name NVARCHAR(255),
    standard_qty DECIMAL(18,4),
    original_qty DECIMAL(18,4) NOT NULL,
    current_qty DECIMAL(18,4) NOT NULL,
    uom NVARCHAR(20) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    stock_type NVARCHAR(30) NOT NULL,
    block_reason_code NVARCHAR(50),
    is_virtual BIT NOT NULL DEFAULT 0,
    unit_origin_type NVARCHAR(30) NOT NULL,
    parent_id_60 NVARCHAR(50),
    root_id_60 NVARCHAR(50),
    source_split_event_id NVARCHAR(50),
    split_qty_total DECIMAL(18,4) DEFAULT 0,
    is_full_box BIT NOT NULL DEFAULT 1,
    
    production_handover_no NVARCHAR(50),
    production_handover_line_no INT,
    receipt_session_no NVARCHAR(50),
    official_receipt_no NVARCHAR(50),
    
    current_oem_order_no NVARCHAR(50),
    current_oem_batch_no INT,
    current_po_no NVARCHAR(50),
    current_po_line_no NVARCHAR(50),
    current_pack_rule_code NVARCHAR(50),
    customer_code NVARCHAR(50),
    
    current_pack360_id NVARCHAR(50),
    current_pallet_id NVARCHAR(50),
    current_location_code NVARCHAR(50),
    
    created_from_issue_no NVARCHAR(50),
    created_from_issue_line_no INT,
    
    last_event_type NVARCHAR(50),
    last_event_at DATETIME,
    last_event_by NVARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_60)
);
GO

CREATE TABLE thung60_split_history (
    split_id NVARCHAR(50) NOT NULL,
    source_id_60 NVARCHAR(50) NOT NULL,
    generated_id_60 NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    split_qty DECIMAL(18,4) NOT NULL,
    source_qty_before DECIMAL(18,4) NOT NULL,
    source_qty_after DECIMAL(18,4) NOT NULL,
    issue_no NVARCHAR(50),
    issue_line_no INT,
    reason_code NVARCHAR(50) NOT NULL,
    performed_by NVARCHAR(50) NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_id NVARCHAR(100),
    request_id NVARCHAR(100) NOT NULL,
    PRIMARY KEY (split_id)
);
GO

CREATE TABLE thung60_event (
    event_id NVARCHAR(50) NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    event_type NVARCHAR(50) NOT NULL,
    old_status NVARCHAR(30),
    new_status NVARCHAR(30),
    old_stock_type NVARCHAR(30),
    new_stock_type NVARCHAR(30),
    old_qty DECIMAL(18,4),
    new_qty DECIMAL(18,4),
    old_location_code NVARCHAR(50),
    new_location_code NVARCHAR(50),
    source_document_no NVARCHAR(50),
    request_id NVARCHAR(100) NOT NULL,
    performed_by NVARCHAR(50) NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message NVARCHAR(MAX),
    PRIMARY KEY (event_id)
);
GO

CREATE TABLE thung60_relation_history (
    relation_id NVARCHAR(50) NOT NULL,
    parent_id_60 NVARCHAR(50) NOT NULL,
    child_id_60 NVARCHAR(50) NOT NULL,
    relation_type NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (relation_id)
);
GO

-- ==============================================
-- 3. Pack360
-- ==============================================

CREATE TABLE pack360_header (
    pack360_id NVARCHAR(50) NOT NULL,
    pack360_qr NVARCHAR(255) NOT NULL UNIQUE,
    packing_standard_type NVARCHAR(30) NOT NULL,
    pack_rule_code NVARCHAR(50),
    oem_order_no NVARCHAR(50),
    oem_batch_no INT,
    po_no NVARCHAR(50),
    status NVARCHAR(30) NOT NULL,
    target_unit_count INT,
    actual_unit_count INT,
    weight DECIMAL(18,4),
    created_by NVARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_by NVARCHAR(50),
    completed_at DATETIME,
    released_by NVARCHAR(50),
    released_at DATETIME,
    release_reason NVARCHAR(255),
    PRIMARY KEY (pack360_id)
);
GO

CREATE TABLE pack360_unit (
    pack360_id NVARCHAR(50) NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    added_by NVARCHAR(50) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (pack360_id, id_60)
);
GO

CREATE TABLE pack360_unit_history (
    history_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    pack360_id NVARCHAR(50) NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    added_by NVARCHAR(50) NOT NULL,
    removed_at DATETIME NULL,
    removed_by NVARCHAR(50) NULL,
    add_event_id NVARCHAR(50) NULL,
    remove_event_id NVARCHAR(50) NULL,
    reason NVARCHAR(255) NULL,
    request_id NVARCHAR(100) NULL
);
GO

CREATE TABLE pack360_event (
    event_id NVARCHAR(50) NOT NULL,
    pack360_id NVARCHAR(50) NOT NULL,
    event_type NVARCHAR(50) NOT NULL,
    old_status NVARCHAR(30),
    new_status NVARCHAR(30),
    source_document_no NVARCHAR(50),
    request_id NVARCHAR(100) NOT NULL,
    performed_by NVARCHAR(50) NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message NVARCHAR(MAX),
    PRIMARY KEY (event_id)
);
GO

-- ==============================================
-- 4. Storage (Lưu trữ)
-- ==============================================

CREATE TABLE pallet (
    pallet_id NVARCHAR(50) NOT NULL,
    pallet_type NVARCHAR(50),
    status NVARCHAR(30) NOT NULL,
    current_location_code NVARCHAR(50),
    tare_weight DECIMAL(18,2) NOT NULL DEFAULT 15.00,
    created_by NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pallet_id)
);
GO

CREATE TABLE pallet_unit (
    pallet_id NVARCHAR(50) NOT NULL,
    unit_id NVARCHAR(50) NOT NULL,
    unit_type NVARCHAR(30) NOT NULL, 
    is_current BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (pallet_id, unit_id)
);
GO

CREATE TABLE location (
    location_code NVARCHAR(50) NOT NULL,
    location_type NVARCHAR(50),
    status NVARCHAR(30) NOT NULL,
    x_coord FLOAT NULL,
    y_coord FLOAT NULL,
    z_coord FLOAT NULL,
    distance_to_staging FLOAT NULL,
    PRIMARY KEY (location_code)
);
GO

CREATE TABLE pallet_location_history (
    history_id INT IDENTITY(1,1),
    pallet_id NVARCHAR(50) NOT NULL,
    location_code NVARCHAR(50) NOT NULL,
    placed_at DATETIME NOT NULL,
    removed_at DATETIME,
    PRIMARY KEY (history_id)
);
GO

-- ==============================================
-- 5. Control (Chứng từ / Yêu cầu)
-- ==============================================

CREATE TABLE oem_transfer_request_header (
    request_no NVARCHAR(50) NOT NULL,
    new_oem_order_no NVARCHAR(50) NOT NULL,
    new_oem_batch_no INT,
    new_po_no NVARCHAR(50),
    status NVARCHAR(30) NOT NULL,
    requested_by NVARCHAR(50) NOT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by NVARCHAR(50),
    approved_at DATETIME,
    PRIMARY KEY (request_no)
);
GO

CREATE TABLE oem_transfer_request_detail (
    request_no NVARCHAR(50) NOT NULL,
    line_no INT NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    PRIMARY KEY (request_no, line_no)
);
GO

CREATE TABLE stock_type_change_request_header (
    request_no NVARCHAR(50) NOT NULL,
    change_type NVARCHAR(30) NOT NULL,
    reason_code NVARCHAR(50) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    requested_by NVARCHAR(50) NOT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by NVARCHAR(50),
    approved_at DATETIME,
    posted_by NVARCHAR(50),
    posted_at DATETIME,
    PRIMARY KEY (request_no)
);
GO

CREATE TABLE stock_type_change_request_detail (
    request_no NVARCHAR(50) NOT NULL,
    line_no INT NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    qty DECIMAL(18,4) NOT NULL,
    old_stock_type NVARCHAR(30) NOT NULL,
    new_stock_type NVARCHAR(30) NOT NULL,
    old_block_reason_code NVARCHAR(50),
    new_block_reason_code NVARCHAR(50),
    PRIMARY KEY (request_no, line_no)
);
GO

CREATE TABLE pack360_repack_request_header (
    request_no NVARCHAR(50) NOT NULL,
    pack360_id NVARCHAR(50) NOT NULL,
    action_type NVARCHAR(30) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    requested_by NVARCHAR(50) NOT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (request_no)
);
GO

CREATE TABLE pack360_repack_request_detail (
    request_no NVARCHAR(50) NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    PRIMARY KEY (request_no, id_60)
);
GO

-- ==============================================
-- 6. Ledger & Audit
-- ==============================================

CREATE TABLE stock_transaction_book (
    transaction_id NVARCHAR(50) NOT NULL,
    transaction_type NVARCHAR(50) NOT NULL,
    document_no NVARCHAR(50) NOT NULL,
    partner_unit NVARCHAR(100),
    partner_name NVARCHAR(100),
    posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    posted_by NVARCHAR(50) NOT NULL,
    PRIMARY KEY (transaction_id)
);
GO

CREATE TABLE inventory_ledger (
    ledger_id INT IDENTITY(1,1),
    ledger_date DATE NOT NULL,
    id_60 NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    customer_code NVARCHAR(50),
    customer_name NVARCHAR(100),
    transaction_id NVARCHAR(50) NOT NULL,
    source_document_no NVARCHAR(50),
    quantity_change DECIMAL(18,4) NOT NULL,
    old_stock_type NVARCHAR(30),
    new_stock_type NVARCHAR(30),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ledger_id)
);
GO

CREATE TABLE item_ledger (
    item_ledger_id INT IDENTITY(1,1),
    ledger_date DATE NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    customer_code NVARCHAR(50),
    customer_name NVARCHAR(100),
    transaction_id NVARCHAR(50) NOT NULL,
    source_document_no NVARCHAR(50),
    total_quantity_change DECIMAL(18,4) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_ledger_id)
);
GO

CREATE TABLE audit_log (
    audit_id BIGINT IDENTITY(1,1),
    object_type NVARCHAR(50) NOT NULL,
    object_id NVARCHAR(50) NOT NULL,
    action NVARCHAR(50) NOT NULL,
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    performed_by NVARCHAR(50) NOT NULL,
    performed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address NVARCHAR(50),
    PRIMARY KEY (audit_id)
);
GO

CREATE TABLE command_request_log (
    request_id NVARCHAR(100) NOT NULL,
    command_type NVARCHAR(50) NOT NULL,
    status NVARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (request_id)
);
GO

-- ==============================================
-- 7. Indexes 
-- ==============================================

CREATE INDEX idx_thung60_product_stock_status ON tbl_thung60_kho(product_code, stock_type, status);
CREATE INDEX idx_thung60_oem_po ON tbl_thung60_kho(current_oem_order_no, current_po_no);
CREATE INDEX idx_thung60_pack360 ON tbl_thung60_kho(current_pack360_id);
CREATE INDEX idx_thung60_pallet ON tbl_thung60_kho(current_pallet_id);
CREATE INDEX idx_thung60_virtual_parent ON tbl_thung60_kho(is_virtual, parent_id_60);

CREATE INDEX idx_thung60event_id60_time ON thung60_event(id_60, performed_at DESC);
CREATE INDEX idx_thung60event_type_time ON thung60_event(event_type, performed_at DESC);
CREATE INDEX idx_thung60event_req ON thung60_event(request_id);

CREATE INDEX idx_split_source ON thung60_split_history(source_id_60);
CREATE INDEX idx_split_generated ON thung60_split_history(generated_id_60);
CREATE INDEX idx_split_issue ON thung60_split_history(issue_no, issue_line_no);

CREATE INDEX idx_pack360_unit_active ON pack360_unit(pack360_id, is_current);
CREATE INDEX idx_pack360_unit_id60_active ON pack360_unit(id_60, is_current);

CREATE INDEX idx_ledger_product_date ON inventory_ledger(product_code, ledger_date);
CREATE INDEX idx_ledger_id60 ON inventory_ledger(id_60);
CREATE INDEX idx_ledger_doc ON inventory_ledger(source_document_no);

CREATE INDEX idx_audit_obj_time ON audit_log(object_type, object_id, performed_at DESC);
CREATE INDEX idx_audit_user_time ON audit_log(performed_by, performed_at DESC);
GO

-- ==============================================
-- 7. Quản lý Đơn hàng OEM (UC07)
-- ==============================================

CREATE TABLE tbl_oem_orders (
    oem_order_no NVARCHAR(50) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    batch_no INT NOT NULL DEFAULT 1,
    
    customer_code NVARCHAR(50),
    customer_name NVARCHAR(255),
    
    target_qty INT NOT NULL,
    actual_qty INT NOT NULL DEFAULT 0,
    
    order_receive_date DATE,
    start_date DATE,
    due_date DATE,
    
    status NVARCHAR(30) NOT NULL DEFAULT 'NEW',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by NVARCHAR(50),
    
    PRIMARY KEY (oem_order_no, product_code, batch_no)
);
GO

-- ==============================================
-- 8. Master Data (UC15)
-- ==============================================

CREATE TABLE tbl_trucks (
    license_plate NVARCHAR(50) PRIMARY KEY,
    max_weight_kg DECIMAL(18,2) NOT NULL,
    max_volume DECIMAL(18,2),
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
GO

CREATE TABLE tbl_drivers (
    driver_id INT IDENTITY(1,1) PRIMARY KEY,
    driver_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
GO

CREATE TABLE tbl_guards (
    guard_id INT IDENTITY(1,1) PRIMARY KEY,
    guard_name NVARCHAR(100) NOT NULL,
    status NVARCHAR(30) DEFAULT 'ACTIVE'
);
GO

-- ==============================================
-- 9. Xuất Kho (UC15)
-- ==============================================

CREATE TABLE export_request_header (
    request_no NVARCHAR(50) PRIMARY KEY,
    request_date DATE NOT NULL,
    status NVARCHAR(30) DEFAULT 'NEW',
    imported_by NVARCHAR(50),
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE TABLE export_request_detail (
    id INT IDENTITY(1,1) PRIMARY KEY,
    request_no NVARCHAR(50) NOT NULL,
    line_no INT NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    channel_code NVARCHAR(50) NOT NULL,
    requested_qty DECIMAL(18, 4) NOT NULL,
    allocated_qty DECIMAL(18, 4) DEFAULT 0 NULL,
    status NVARCHAR(30) DEFAULT 'NEW' NULL,
    FOREIGN KEY (request_no) REFERENCES export_request_header(request_no)
);
GO

CREATE TABLE delivery_note_header (
    delivery_note_no NVARCHAR(50) PRIMARY KEY,
    license_plate NVARCHAR(50),
    driver_id INT,
    guard_id INT,
    customer_name NVARCHAR(255),
    delivery_location NVARCHAR(255),
    status NVARCHAR(30) DEFAULT 'PENDING_PICK',
    approved_by NVARCHAR(50),
    approved_at DATETIME,
    approval_note NVARCHAR(255),
    security_checked_by NVARCHAR(50),
    security_checked_at DATETIME,
    driver_name NVARCHAR(100),
    seal_no NVARCHAR(100),
    gate_note NVARCHAR(255),
    created_by NVARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO

CREATE TABLE delivery_note_detail (
    delivery_note_no NVARCHAR(50),
    line_no INT,
    customer_name NVARCHAR(255),
    product_code NVARCHAR(50),
    channel_code NVARCHAR(50),
    qty DECIMAL(18,4),
    box_large INT DEFAULT 0,
    box_small INT DEFAULT 0,
    box_virtual INT DEFAULT 0,
    total_weight_kg DECIMAL(18,2),
    PRIMARY KEY (delivery_note_no, line_no)
);
GO

CREATE TABLE delivery_note_barcode (
    id INT IDENTITY(1,1) PRIMARY KEY,
    delivery_note_no NVARCHAR(50) NOT NULL,
    barcode NVARCHAR(255) NOT NULL,
    barcode_type NVARCHAR(30) NOT NULL,
    product_code NVARCHAR(50) NOT NULL,
    qty DECIMAL(18,4) NOT NULL,
    scanned_by NVARCHAR(50),
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
GO

-- ==============================================
-- 9. System Reference Data (Catalog)
-- ==============================================

CREATE TABLE event_catalog (
    event_code NVARCHAR(50) NOT NULL,
    event_group NVARCHAR(50) NOT NULL,
    event_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    target_object NVARCHAR(50),
    
    from_status NVARCHAR(50),
    to_status NVARCHAR(50),
    from_stock_type NVARCHAR(50),
    to_stock_type NVARCHAR(50),
    
    location_impact NVARCHAR(50),
    pallet_impact NVARCHAR(50),
    pack360_impact NVARCHAR(50),
    metrics_impact NVARCHAR(50),
    
    is_active BIT NOT NULL DEFAULT 1,
    PRIMARY KEY (event_code)
);
GO

INSERT INTO event_catalog (event_code, event_group, event_name, description, target_object, from_status, to_status, from_stock_type, to_stock_type, location_impact, pallet_impact, pack360_impact, metrics_impact) VALUES
-- Thung 60 Events
('TEMP_RECEIVE', 'THUNG60', N'Quét nhập tạm', N'Nhập tạm hàng vào kho', 'tbl_thung60_kho', NULL, 'TEMP_RECEIVED', NULL, 'UNRESTRICTED', 'REQUIRE_NEW', 'UNCHANGED', 'UNCHANGED', 'ADD_QTY'),
('OFFICIAL_RECEIVE', 'THUNG60', N'Nhập chính thức', N'Thủ kho xác nhận nhập', 'tbl_thung60_kho', 'TEMP_RECEIVED', 'AVAILABLE', 'UNRESTRICTED', 'UNRESTRICTED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('CANCEL_RECEIVE', 'THUNG60', N'Hủy nhập tạm', N'Hủy quét tạm', 'tbl_thung60_kho', 'TEMP_RECEIVED', NULL, 'UNRESTRICTED', NULL, 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'REVERT_QTY'),
('PALLETIZE_60', 'THUNG60', N'Gán Pallet', N'Chất thùng lên Pallet', 'tbl_thung60_kho', 'AVAILABLE', 'PALLETIZED', 'UNRESTRICTED', 'UNRESTRICTED', 'INHERIT_PALLET', 'ATTACH', 'UNCHANGED', 'UNCHANGED'),
('DEPALLETIZE_60', 'THUNG60', N'Tách Pallet', N'Lấy thùng khỏi Pallet', 'tbl_thung60_kho', 'PALLETIZED', 'AVAILABLE', 'UNRESTRICTED', 'UNRESTRICTED', 'REQUIRE_NEW', 'DETACH', 'UNCHANGED', 'UNCHANGED'),
('PACK_INTO_360', 'THUNG60', N'Đưa vào Pack360', N'Đóng kiện 360', 'tbl_thung60_kho', 'AVAILABLE', 'PACKED_360', 'UNRESTRICTED', 'UNRESTRICTED', 'CLEAR', 'UNCHANGED', 'ATTACH', 'UNCHANGED'),
('RELEASE_FROM_360', 'THUNG60', N'Giải phóng Pack360', N'Tách thùng ra khỏi kiện', 'tbl_thung60_kho', 'PACKED_360', 'WAITING_REPACK', 'UNRESTRICTED', 'UNRESTRICTED', 'MOVE_TO_REPACK', 'UNCHANGED', 'DETACH', 'UNCHANGED'),
('REPACK_INTO_360', 'THUNG60', N'Đóng lại Pack360', N'Gộp lại thùng vào kiện', 'tbl_thung60_kho', 'WAITING_REPACK', 'PACKED_360', 'UNRESTRICTED', 'UNRESTRICTED', 'CLEAR', 'UNCHANGED', 'ATTACH', 'UNCHANGED'),
('RELEASE_TO_AVAIL', 'THUNG60', N'Release thành công', N'Xử lý xong chờ repack', 'tbl_thung60_kho', 'WAITING_REPACK', 'AVAILABLE', 'UNRESTRICTED', 'UNRESTRICTED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('ALLOCATE_ISSUE', 'THUNG60', N'Phân bổ xuất', N'Giữ chỗ xuất kho', 'tbl_thung60_kho', 'AVAILABLE', 'ALLOCATED', 'UNRESTRICTED', 'UNRESTRICTED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('PICK_60', 'THUNG60', N'Pick hàng', N'Nhặt hàng', 'tbl_thung60_kho', 'ALLOCATED', 'PICKED', 'UNRESTRICTED', 'UNRESTRICTED', 'MOVE_TO_CART', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('STAGE_60', 'THUNG60', N'Stage hàng', N'Đưa ra bãi tập kết', 'tbl_thung60_kho', 'PICKED', 'STAGED', 'UNRESTRICTED', 'UNRESTRICTED', 'MOVE_TO_STAGE', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('SHIP_60', 'THUNG60', N'Xuất kho thực tế', N'Hàng lên xe', 'tbl_thung60_kho', 'STAGED', 'SHIPPED', 'UNRESTRICTED', 'UNRESTRICTED', 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY'),
('TEMP_ISSUE', 'THUNG60', N'Xuất tạm', N'Hàng xuất tạm', 'tbl_thung60_kho', 'AVAILABLE', 'TEMP_ISSUED', 'UNRESTRICTED', 'TEMPORARY_ISSUE', 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('RETURN_60', 'THUNG60', N'Hoàn nhập', N'Hàng xuất tạm trả về', 'tbl_thung60_kho', 'TEMP_ISSUED', 'RETURNED', 'TEMPORARY_ISSUE', 'UNRESTRICTED', 'REQUIRE_NEW', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('FINALIZE_ISSUE', 'THUNG60', N'Tất toán xuất thật', N'Chốt xuất', 'tbl_thung60_kho', 'TEMP_ISSUED', 'SHIPPED', 'TEMPORARY_ISSUE', NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY'),
('FINALIZE_SCRAP', 'THUNG60', N'Tất toán hủy', N'Chốt hủy hàng tạm', 'tbl_thung60_kho', 'TEMP_ISSUED', 'SCRAPPED', 'TEMPORARY_ISSUE', 'SCRAP', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY'),
('DIRECT_SCRAP', 'THUNG60', N'Hủy hàng trực tiếp', N'Hủy hàng', 'tbl_thung60_kho', 'AVAILABLE', 'SCRAPPED', 'UNRESTRICTED', 'SCRAP', 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY'),
('RELEASE_RETURN', 'THUNG60', N'Release hoàn', N'Xử lý hoàn tất', 'tbl_thung60_kho', 'RETURNED', 'AVAILABLE', 'UNRESTRICTED', 'UNRESTRICTED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('SCRAP_RETURN', 'THUNG60', N'Hủy hàng hoàn', N'Hàng trả về bị hủy', 'tbl_thung60_kho', 'RETURNED', 'SCRAPPED', 'UNRESTRICTED', 'SCRAP', 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY'),
('QA_BLOCK_60', 'THUNG60', N'QA Khóa thùng', N'Phát hiện lỗi', 'tbl_thung60_kho', 'UNCHANGED', 'UNCHANGED', 'UNRESTRICTED', 'BLOCKED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('QA_UNBLOCK_60', 'THUNG60', N'QA Mở khóa', N'Xử lý lỗi xong', 'tbl_thung60_kho', 'UNCHANGED', 'UNCHANGED', 'BLOCKED', 'UNRESTRICTED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),

-- Pack360 Events
('CREATE_PACK', 'PACK360', N'Tạo kiện mới', N'Mở kiện', 'pack360_header', NULL, 'OPEN', NULL, NULL, 'REQUIRE_NEW', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('COMPLETE_PACK', 'PACK360', N'Hoàn tất đóng kiện', N'Chốt kiện', 'pack360_header', 'OPEN', 'COMPLETED', NULL, NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UPDATE_METRICS'),
('CANCEL_PACK', 'PACK360', N'Hủy kiện chưa chốt', N'Hủy', 'pack360_header', 'OPEN', 'CANCELLED', NULL, NULL, 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'CLEAR_METRICS'),
('PALLETIZE_PACK', 'PACK360', N'Gán Pallet', N'Lên Pallet', 'pack360_header', 'COMPLETED', 'PALLETIZED', NULL, NULL, 'INHERIT_PALLET', 'ATTACH', 'UNCHANGED', 'UNCHANGED'),
('DEPALLETIZE_PACK', 'PACK360', N'Tách Pallet', N'Xuống Pallet', 'pack360_header', 'PALLETIZED', 'COMPLETED', NULL, NULL, 'REQUIRE_NEW', 'DETACH', 'UNCHANGED', 'UNCHANGED'),
('PARTIAL_ADJUST', 'PACK360', N'Tách 1 phần hợp lệ', N'Rút hàng', 'pack360_header', 'COMPLETED', 'COMPLETED_ADJUSTED', NULL, NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UPDATE_METRICS'),
('ADJUST_TO_REVIEW', 'PACK360', N'Tách lỗi rule', N'Cần review', 'pack360_header', 'COMPLETED_ADJUSTED', 'NEED_REVIEW', NULL, NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UPDATE_METRICS'),
('REVIEW_PASS', 'PACK360', N'Xử lý lại thành công', N'Xác nhận lại kiện', 'pack360_header', 'NEED_REVIEW', 'COMPLETED', NULL, NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('RELEASE_PACK', 'PACK360', N'Giải phóng kiện', N'Tháo dỡ hoàn toàn', 'pack360_header', 'COMPLETED', 'RELEASED', NULL, NULL, 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'CLEAR_METRICS'),
('ALLOCATE_PACK', 'PACK360', N'Phân bổ xuất kiện', N'Giữ chỗ xuất', 'pack360_header', 'COMPLETED', 'ALLOCATED', NULL, NULL, 'UNCHANGED', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('PICK_PACK', 'PACK360', N'Pick kiện', N'Nhặt kiện', 'pack360_header', 'ALLOCATED', 'PICKED', NULL, NULL, 'MOVE_TO_CART', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('STAGE_PACK', 'PACK360', N'Stage kiện', N'Ra bãi chờ', 'pack360_header', 'PICKED', 'STAGED', NULL, NULL, 'MOVE_TO_STAGE', 'UNCHANGED', 'UNCHANGED', 'UNCHANGED'),
('SHIP_PACK', 'PACK360', N'Xác nhận xuất kiện', N'Xuất kiện', 'pack360_header', 'STAGED', 'SHIPPED', NULL, NULL, 'CLEAR', 'UNCHANGED', 'UNCHANGED', 'DEDUCT_QTY');
GO
