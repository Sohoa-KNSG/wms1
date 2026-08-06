# Mục lục Use Case (Use Case Catalog)

Bảng dưới đây thống kê danh sách toàn bộ các Use Case hiện có của hệ thống WMS.

| ID | Mã UC | Tên Use Case / Chức Năng | Phân Hệ | Trạng Thái | File Tài Liệu |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | **UC01** | [Đăng Nhập](UC01_Login.md) | System | 🟢 Hiện có | [UC01_Login.md](UC01_Login.md) |
| **2** | **UC01.1** | [Đổi Mật Khẩu](UC01.1_Change_Password.md) | System | 🟢 Hiện có | [UC01.1_Change_Password.md](UC01.1_Change_Password.md) |
| **3** | **UC02** | [Nhận dữ liệu phiếu giao kho từ sản xuất](UC02_Receive_Data1.md) | Inbound | 🟢 Hiện có | [UC02_Receive_Data1.md](UC02_Receive_Data1.md) |
| **4** | **UC03** | [Quét nhập tạm thùng 60](UC03_Scan_Inbound.md) | Inbound | 🟢 Hiện có | [UC03_Scan_Inbound.md](UC03_Scan_Inbound.md) |
| **5** | **UC04** | [Quản lý & Xác nhận Phiếu chờ (Pending Handover)](UC04_Pending_Handover.md) | Inbound | 🟢 Hiện có | [UC04_Pending_Handover.md](UC04_Pending_Handover.md) |
| **6** | **UC04.1**| [Nhập Lẻ (Partial/Loose Receipt) / Sinh thùng ảo](UC04_1_Partial_Receipt.md) | Inbound | 🟢 Hiện có | [UC04_1_Partial_Receipt.md](UC04_1_Partial_Receipt.md) |
| **7** | **UC04.2**| [Hủy kết quả quét Nhập kho (Reversal of Scanned Inbound)](UC04_2_Cancel_Scan.md) | Inbound | 🟢 Hiện có | [UC04_2_Cancel_Scan.md](UC04_2_Cancel_Scan.md) |
| **8** | **UC05** | [Đóng gói Kiện 360 (Pack360 Master Carton Packing)](UC05_Pack360_Packing.md) | Inbound | 🟢 **Đã nâng cấp chuẩn** | [UC05_Pack360_Packing.md](UC05_Pack360_Packing.md) |
| **9** | **UC06** | [Lập Pallet (Palletizing)](UC06_Palletizing.md) | Storage | 🟢 Hiện có | [UC06_Palletizing.md](UC06_Palletizing.md) |
| **10** | **UC06.1**| [Tháo dỡ và Chuyển Pallet (Depalletizing & Transfer)](UC06.1_Depalletizing_Transfer.md) | Storage | 🟢 Hiện có | [UC06.1_Depalletizing_Transfer.md](UC06.1_Depalletizing_Transfer.md) |
| **11** | **UC07** | [Khai báo và Theo dõi Đơn hàng OEM](UC07_OEM_Order_Management.md) | Master | 🟢 Hiện có | [UC07_OEM_Order_Management.md](UC07_OEM_Order_Management.md) |
| **12** | **UC11** | [Đưa hàng lên kệ / Xuống kệ (Putaway / Letdown)](UC11_Shelving.md) | Storage | 🟢 Hiện có | [UC11_Shelving.md](UC11_Shelving.md) |
| **13** | **UC12** | [Tra cứu hồ sơ Thùng 60 / Pack360 / Pallet (Asset Dossier & Traceability Inquiry)](UC12_Asset_Dossier_Inquiry.md) | Storage / Trace | 🟢 **Hoàn thành chuẩn hóa** | [UC12_Asset_Dossier_Inquiry.md](UC12_Asset_Dossier_Inquiry.md) |
| **14** | **UC13** | [Chuyển Stock Type / Khóa Tồn Kho (Stock Blocking)](UC13_Stock_Type_Change.md) | Inventory | 🟢 **Hoàn thành** | [UC13_Stock_Type_Change.md](UC13_Stock_Type_Change.md) |
| **15** | **UC14** | [Release Tồn Bị Khóa (Stock Release / Unblocking)](UC14_Stock_Release.md) | Inventory | 🟢 **Hoàn thành** | [UC14_Stock_Release.md](UC14_Stock_Release.md) |
| **16** | **UC15** | [Tạo và phân bổ phiếu xuất kho](UC15_Logic_Architecture.md) | Outbound | 🟢 Hiện có | [UC15_Logic_Architecture.md](UC15_Logic_Architecture.md) |
| **17** | **UC16** | [Soạn hàng & Xuất Bến (Picking & Gate-Out)](UC16_Picking.md) | Outbound | 🟢 **Hoàn thành** | [UC16_Picking.md](UC16_Picking.md) |
| **18** | **UC18** | [Quản Lý Xuất Tạm Thành Phẩm (Temporary Dispatch)](UC18_Temporary_Dispatch.md) | Outbound | 🟢 **Mới bổ sung** | [UC18_Temporary_Dispatch.md](UC18_Temporary_Dispatch.md) |
| **19** | **UC23** | [Quản trị người dùng](UC23_User_Administration.md) | System | 🟢 Hiện có | [UC23_User_Administration.md](UC23_User_Administration.md) |
