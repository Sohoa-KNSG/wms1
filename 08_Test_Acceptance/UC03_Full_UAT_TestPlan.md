# Kế Hoạch Kiểm Thử Toàn Diện (Full UAT) - UC03: Quét Nhập Tạm Thùng 60

Tài liệu này là kịch bản kiểm thử (Test Plan) chi tiết và bao quát 100% logic của Use Case 03. Phù hợp cho QA/QC hoặc Product Owner nghiệm thu toàn bộ tính năng trước khi Go-Live.

## 1. Môi trường & Tiền điều kiện (Pre-conditions)
- **Thiết bị:** 01 PC (để giả lập màn hình Desktop) & 01 PDA/Smartphone có kết nối máy quét (kiểm tra UI Mobile).
- **Tài khoản:** Đăng nhập bằng tài khoản Nhân viên Kho / Thủ Kho (Có quyền truy cập `/receipt`).
- **Dữ liệu chuẩn bị:**
  - 1 Phiếu nhập kho đang ở trạng thái xử lý, có ít nhất 1 dòng hàng chưa quét đủ số lượng.
  - Các mã QR Code Thùng 60 thực tế (hoặc in ra giấy) đại diện cho:
    - [A] Thùng hợp lệ (Đúng SP, Trạng thái Packaging = 1).
    - [B] Thùng sai mã sản phẩm.
    - [C] Thùng chưa đóng gói xong (Trạng thái Packaging khác 1).
    - [D] Mã QR rác (Không có trong hệ thống).

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 2.1. Kiểm thử Giao diện & Trải nghiệm (UI/UX)
| Mã TC | Hạng mục kiểm tra | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái (Pass/Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **UI-01** | **Responsive Design** | 1. Mở màn hình quét trên PC.<br>2. Mở trên màn hình PDA/Mobile. | Bố cục co giãn hợp lý. Trên Mobile, ô nhập mã QR và nút chức năng không bị che khuất, thanh tiến độ to rõ, dễ nhìn. | [ ] |
| **UI-02** | **Hiển thị tiến độ (Progress)** | 1. Chọn 1 dòng phiếu nhập cần quét. | Thanh tiến độ hiển thị đúng: "Đã quét: 0 / [Tổng số] Thùng (0%)". | [ ] |
| **UI-03** | **Audio & Visual Cues (Cảnh báo)** | 1. Cố tình quét 1 mã lỗi.<br>2. Quét 1 mã đúng. | - Khi lỗi: Màn hình nháy viền ĐỎ, phát tiếng BUZZER trầm.<br>- Khi đúng: Màn hình nháy XANH, phát tiếng BEEP thanh. | [ ] |
| **UI-04** | **Auto-Focus (Rảnh tay)** | 1. Quét 1 mã bất kỳ (đúng hay sai).<br>2. Không chạm tay vào màn hình. | Ngay sau khi xử lý xong, hệ thống tự xóa trắng ô input và đặt lại con trỏ chuột (focus) để sẵn sàng quét tiếp. | [ ] |

### 2.2. Kiểm thử Luồng Chuẩn (Happy Path)
| Mã TC | Hạng mục kiểm tra | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái (Pass/Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **HP-01** | **Quét thành công 1 thùng** | 1. Quét mã QR thùng [A] hợp lệ. | Báo XANH. Danh sách log thêm 1 dòng mới trên cùng. Tiến độ +1 thùng. | [ ] |
| **HP-02** | **Quét liên tục nhiều thùng** | 1. Tiếp tục quét các thùng [A] khác nhau liên tiếp. | Tiến độ cộng dồn chính xác. Log hiển thị đủ số dòng quét theo thứ tự thời gian giảm dần (mới nhất ở trên). | [ ] |
| **HP-03** | **Đạt 100% tiến độ** | 1. Quét liên tục đến khi "Số lượng đã quét" = "Số lượng yêu cầu". | Thanh tiến độ đạt 100% (Màu xanh lá cây đầy). | [ ] |

### 2.3. Kiểm thử Ràng buộc Logic (Fail-fast Validations)
| Mã TC | Hạng mục kiểm tra | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái (Pass/Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **ERR-01** | **Chống quét trùng lặp** | 1. Quét lại mã QR thùng [A] đã quét thành công ở HP-01. | Hệ thống chặn. Báo lỗi ĐỎ: "Mã thùng đã được quét...". Số lượng KHÔNG tăng. | [ ] |
| **ERR-02** | **Sai mã sản phẩm** | 1. Quét mã QR thùng [B] (khác mã SP của dòng phiếu đang chọn). | Chặn. Báo ĐỎ: "Mã sản phẩm trên thùng không khớp...". | [ ] |
| **ERR-03** | **Sai trạng thái Packaging**| 1. Quét mã QR thùng [C] (Trạng thái đóng gói khác 1). | Chặn. Báo ĐỎ: "Mã thùng không ở trạng thái chờ nhập kho...". | [ ] |
| **ERR-04** | **Mã rác không tồn tại** | 1. Quét mã QR [D] không có trong CSDL Packaging. | Chặn. Báo ĐỎ: "Mã thùng 60 không tồn tại...". | [ ] |
| **ERR-05** | **Vượt giới hạn số lượng** | 1. Chọn dòng phiếu yêu cầu 2 thùng.<br>2. Quét 2 thùng thành công.<br>3. Quét tiếp thùng thứ 3 (hợp lệ). | Chặn. Báo ĐỎ: "Tổng số lượng quét vượt số lượng yêu cầu...". Tiến độ giữ nguyên ở mức 2/2. | [ ] |

### 2.4. Kiểm thử Hủy Quét & Khôi phục (Cancel Logic)
| Mã TC | Hạng mục kiểm tra | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái (Pass/Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **DEL-01** | **Hủy lượt quét thành công** | 1. Bấm icon Thùng rác ở 1 dòng quét VALID.<br>2. Bấm Xác nhận hủy. | Dòng đó chuyển sang màu xám/gạch ngang (CANCELLED). Tiến độ tổng bị trừ đi 1 thùng (Tụt % hoàn thành). | [ ] |
| **DEL-02** | **Quét lại sau khi hủy** | 1. Quét lại chính mã QR vừa hủy ở DEL-01. | Hệ thống NHẬN LẠI mã này (Vì trạng thái cũ đã bị Soft-delete). Tiến độ lại tăng lên 1. | [ ] |

### 2.5. Kiểm thử Mức Cơ sở dữ liệu (Database Integrity - Dành cho Kỹ thuật)
*(Truy cập SQL Server Management Studio để đối chiếu sau khi thực hiện các bước trên)*
| Mã TC | Hạng mục kiểm tra | Các bước thực hiện | Kết quả kỳ vọng | Trạng thái (Pass/Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **DB-01** | **Ghi Log Chính xác** | Kiểm tra bảng `WMS_UC03_ScanLog`. | Các lượt quét HP-01 lưu `TrangThaiScan = 'VALID'`. Các lượt quét DEL-01 lưu `TrangThaiScan = 'CANCELLED', IsDeleted = 1`. Đã lưu đúng `MaDonHang` và `MaKhachHang`. | [ ] |
| **DB-02** | **Cách ly Sổ Cái (Ledger)** | Kiểm tra các bảng `tbl_thung60_kho`, `stock_transaction_book`. | **KHÔNG** phát sinh bất kỳ bản ghi nào (Bảo toàn nguyên tắc Staging: Chỉ quét tạm, chưa ghi nợ/có Sổ cái Kép). | [ ] |

---
**Nhận xét tổng thể sau nghiệm thu:**
- [ ] Chức năng hoạt động ổn định, đủ điều kiện đưa vào sử dụng.
- [ ] Cần khắc phục một số lỗi (Ghi chú chi tiết bên dưới).

*Ghi chú thêm:*
.........................................................................................................
.........................................................................................................
