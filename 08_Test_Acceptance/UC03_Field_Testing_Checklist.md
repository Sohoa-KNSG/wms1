# Kế Hoạch Kiểm Thử Hiện Trường (Field Testing) - UC03: Quét Nhập Tạm Thùng 60

> **Hướng dẫn:** Anh/Chị mang thiết bị (Súng quét PDA / Điện thoại) ra kho, thực hiện tuần tự các bước dưới đây.
> Đánh dấu `[x]` vào ô `[ ]` nếu PASS. Ghi chú lỗi vào dòng `💬 Feedback:` nếu FAIL. Cuối cùng, bôi đen toàn bộ nội dung và dán lại vào khung chat để tôi xử lý.

---

## 🛠 1. Công Tác Chuẩn Bị
- [ ] Thiết bị PDA/Máy quét đã kết nối mạng ổn định.
- [ ] Chọn sẵn 1 phiếu nhập kho (Giao diện Web/App).
- [ ] Chuẩn bị thực tế:
  - 1 Thùng 60 **ĐÚNG** mã sản phẩm (Trạng thái Packaging = 1).
  - 1 Thùng 60 **SAI** mã sản phẩm.
  - 1 Thùng 60 **CHƯA ĐÓNG GÓI XONG** (Trạng thái Packaging khác 1 - nếu có).

---

## ✅ 2. Kiểm Thử Luồng Chuẩn (Happy Path)
- [ ] **TC-01: Quét thùng hợp lệ**
  - **Thao tác:** Hướng súng quét vào mã QR đúng mã sản phẩm và bóp cò.
  - **Kỳ vọng:** Màn hình nháy Xanh. Loa phát tiếng *BEEP* bổng. Danh sách hiện thêm 1 dòng. Tiến độ (% và số lượng) tăng lên chính xác.
  - `💬 Feedback:` 

- [ ] **TC-02: Chức năng Tự động Focus (Rảnh tay)**
  - **Thao tác:** Sau khi quét thành công TC-01, không chạm tay vào màn hình, tiếp tục bóp cò quét luôn thùng thứ 2 (có thể quét lại thùng cũ để test focus).
  - **Kỳ vọng:** Mã QR tiếp theo vẫn ăn vào ô nhập liệu và hệ thống tự động xử lý.
  - `💬 Feedback:` 

---

## 🛑 3. Kiểm Thử Chặn Lỗi (Edge Cases & Validations)
- [ ] **TC-03: Quét trùng lặp (Anti-Duplication)**
  - **Thao tác:** Quét lại đúng cái tem mã QR vừa quét thành công ở TC-01.
  - **Kỳ vọng:** Màn hình viền Đỏ. Tiếng còi *BUZZER* báo lỗi. Báo lỗi: *"Mã thùng đã được quét..."*. Không tăng số lượng.
  - `💬 Feedback:` 

- [ ] **TC-04: Quét sai mã sản phẩm (Cross-Product)**
  - **Thao tác:** Bóp cò quét mã QR của thùng thuộc mã sản phẩm khác.
  - **Kỳ vọng:** Báo lỗi viền Đỏ. Báo lỗi: *"Mã sản phẩm trên thùng không khớp..."*.
  - `💬 Feedback:` 

- [ ] **TC-05: Quét mã rác / Mã không tồn tại**
  - **Thao tác:** Quét thử một mã QR bất kỳ không phải của hệ thống Packaging.
  - **Kỳ vọng:** Báo lỗi viền Đỏ. Báo lỗi: *"Mã thùng 60 không tồn tại..."*.
  - `💬 Feedback:` 

- [ ] **TC-06: Vượt quá số lượng yêu cầu (Over-quantity)**
  - **Thao tác:** Dùng 1 phiếu nhập số lượng ít (Ví dụ: 1 thùng). Quét 1 thùng thành công. Quét tiếp 1 thùng mới (khác mã QR nhưng đúng SP).
  - **Kỳ vọng:** Báo lỗi viền Đỏ. Báo lỗi: *"Tổng số lượng quét vượt số lượng yêu cầu..."*.
  - `💬 Feedback:` 

---

## 🗑 4. Kiểm Thử Hủy Lượt Quét (Unhappy Path)
- [ ] **TC-07: Hủy dòng đã quét**
  - **Thao tác:** Tìm dòng quét thành công (Màu xanh) ở dưới danh sách, bấm vào icon **Hủy (Thùng rác)**. Xác nhận hủy.
  - **Kỳ vọng:** Dòng quét chuyển sang trạng thái đã hủy. Thanh tiến độ (% và số lượng) bị trừ đi tương ứng và cập nhật ngay lập tức.
  - `💬 Feedback:` 

- [ ] **TC-08: Quét lại tem vừa hủy**
  - **Thao tác:** Lấy mã QR vừa bị hủy ở TC-07 quét lại lần nữa.
  - **Kỳ vọng:** Hệ thống chấp nhận tem hợp lệ trở lại (Báo Xanh, *BEEP*).
  - `💬 Feedback:` 

---
*(Nếu có bất kỳ lỗi nào khác ngoài kịch bản trên, anh/chị vui lòng ghi chú ngắn gọn ở dưới)*
`💬 Ghi chú thêm:` 
