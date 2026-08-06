const { poolPromise } = require('./db');

async function runSQL() {
  try {
    const pool = await poolPromise;
    
    console.log("Creating event_catalog table...");
    await pool.request().query(`
      IF OBJECT_ID('dbo.event_catalog', 'U') IS NOT NULL
        DROP TABLE dbo.event_catalog;

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
    `);
    
    console.log("Inserting event catalog data...");
    await pool.request().query(`
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
    `);
    
    console.log("Querying to verify...");
    const result = await pool.request().query("SELECT * FROM event_catalog;");
    console.log(`Verification: Found ${result.recordset.length} rows in event_catalog.`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
runSQL();
