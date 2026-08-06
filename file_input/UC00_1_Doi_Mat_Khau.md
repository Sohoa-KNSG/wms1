# UC00.1 - Đổi mật khẩu

## 1. Mục tiêu

UC00.1 cho phép người dùng WMS đổi mật khẩu đăng nhập hệ thống. Use case này được tách riêng khỏi UC00 - Đăng nhập hệ thống để quản lý rõ nghiệp vụ bảo mật, kiểm tra mật khẩu và ghi nhận lịch sử thao tác.

UC00.1 có thể được gọi từ hai tình huống:

| Tình huống | Mô tả |
|---|---|
| Người dùng chủ động đổi mật khẩu | Người dùng đã đăng nhập và chọn chức năng đổi mật khẩu. |
| Hệ thống bắt buộc đổi mật khẩu | Người dùng đăng nhập lần đầu, dùng mật khẩu tạm hoặc mật khẩu đã hết hạn. |

---

## 2. Tác nhân

| Tác nhân | Vai trò |
|---|---|
| Người dùng WMS | Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới. |
| Hệ thống WMS | Kiểm tra điều kiện bảo mật, cập nhật mật khẩu và ghi log. |
| SQL Server | Xử lý xác thực, cập nhật dữ liệu thông qua Stored Procedure. |

---

## 3. Điều kiện đầu vào

| Điều kiện | Mô tả |
|---|---|
| Người dùng tồn tại | Tài khoản phải có trong bảng người dùng WMS. |
| Tài khoản đang hoạt động | Tài khoản không bị khóa hoặc xóa mềm. |
| Người dùng đã đăng nhập | Áp dụng cho trường hợp đổi mật khẩu chủ động. |
| Hoặc đang trong luồng bắt buộc đổi mật khẩu | Áp dụng cho lần đăng nhập đầu tiên, mật khẩu tạm hoặc mật khẩu hết hạn. |

---

## 4. Luồng xử lý chính

### Bước 1: Người dùng mở màn hình đổi mật khẩu

Màn hình hiển thị các ô nhập:

| Trường nhập | Mô tả |
|---|---|
| `MatKhauHienTai` | Mật khẩu hiện tại của người dùng. |
| `MatKhauMoi` | Mật khẩu mới muốn cập nhật. |
| `XacNhanMatKhauMoi` | Nhập lại mật khẩu mới để xác nhận. |

---

### Bước 2: Hệ thống kiểm tra dữ liệu nhập

Hệ thống kiểm tra:

| Điều kiện kiểm tra | Quy tắc |
|---|---|
| Mật khẩu hiện tại | Không được để trống. |
| Mật khẩu mới | Không được để trống. |
| Xác nhận mật khẩu mới | Phải giống mật khẩu mới. |
| Mật khẩu mới | Không được trùng mật khẩu hiện tại. |
| Độ mạnh mật khẩu | Phải đạt quy định của hệ thống. |

---

### Bước 3: Hệ thống xác thực mật khẩu hiện tại

Hệ thống kiểm tra mật khẩu hiện tại có đúng với mật khẩu đang lưu của người dùng hay không.

Lưu ý: mật khẩu trong database phải được lưu dưới dạng hash, không lưu plain text.

---

### Bước 4: Hệ thống cập nhật mật khẩu mới

Nếu tất cả điều kiện hợp lệ, hệ thống thực hiện:

```text
1. Hash mật khẩu mới
2. Cập nhật mật khẩu mới vào bảng người dùng
3. Cập nhật trạng thái bắt buộc đổi mật khẩu nếu có
4. Ghi nhận thời gian đổi mật khẩu
5. Ghi log thao tác đổi mật khẩu
```

---

### Bước 5: Hoàn tất

Sau khi đổi mật khẩu thành công, hệ thống thông báo:

```text
Đổi mật khẩu thành công. Vui lòng đăng nhập lại.
```

Khuyến nghị: hệ thống đăng xuất người dùng sau khi đổi mật khẩu thành công và yêu cầu đăng nhập lại.

---

## 5. Luồng ngoại lệ

| Mã lỗi | Tình huống | Thông báo |
|---|---|---|
| `AUTH-CP-01` | Mật khẩu hiện tại không đúng | Mật khẩu hiện tại không chính xác. |
| `AUTH-CP-02` | Mật khẩu mới và xác nhận không khớp | Mật khẩu xác nhận không khớp. |
| `AUTH-CP-03` | Mật khẩu mới trùng mật khẩu cũ | Mật khẩu mới không được trùng mật khẩu hiện tại. |
| `AUTH-CP-04` | Mật khẩu mới không đạt độ mạnh | Mật khẩu mới không đạt yêu cầu bảo mật. |
| `AUTH-CP-05` | Tài khoản bị khóa | Tài khoản không được phép đổi mật khẩu. |
| `AUTH-CP-06` | Người dùng không tồn tại | Tài khoản không tồn tại trong hệ thống. |

---

## 6. Business Rules

| Rule | Nội dung |
|---|---|
| `BR-AUTH-01` | Người dùng phải có tài khoản hợp lệ trong hệ thống WMS. |
| `BR-AUTH-02` | Mật khẩu phải được lưu dạng hash, không lưu plain text. |
| `BR-AUTH-03` | Khi đổi mật khẩu, người dùng phải nhập đúng mật khẩu hiện tại. |
| `BR-AUTH-04` | Mật khẩu mới và xác nhận mật khẩu mới phải giống nhau. |
| `BR-AUTH-05` | Mật khẩu mới không được trùng mật khẩu hiện tại. |
| `BR-AUTH-06` | Mật khẩu mới phải đạt quy định độ mạnh của hệ thống. |
| `BR-AUTH-07` | Nếu là mật khẩu tạm hoặc lần đăng nhập đầu tiên, hệ thống bắt buộc đổi mật khẩu trước khi vào màn hình nghiệp vụ. |
| `BR-AUTH-08` | Sau khi đổi mật khẩu thành công, hệ thống nên yêu cầu người dùng đăng nhập lại. |
| `BR-AUTH-09` | Mọi thao tác đổi mật khẩu thành công hoặc thất bại phải được ghi log. |

---

## 7. Quy định độ mạnh mật khẩu đề xuất

| Điều kiện | Quy định |
|---|---|
| Độ dài tối thiểu | Tối thiểu 8 ký tự. |
| Chữ hoa | Có ít nhất 1 chữ hoa. |
| Chữ thường | Có ít nhất 1 chữ thường. |
| Số | Có ít nhất 1 chữ số. |
| Ký tự đặc biệt | Có ít nhất 1 ký tự đặc biệt. |
| Trùng tài khoản | Không được chứa tên đăng nhập. |

Có thể điều chỉnh quy định này theo chính sách nội bộ của công ty.

---

## 8. Bảng dữ liệu đề xuất

### 8.1. Bảng người dùng WMS

Nếu hệ thống đã có bảng người dùng, không tạo mới bảng. AI Developer cần map vào bảng hiện hữu.

Cấu trúc tham khảo:

```sql
CREATE TABLE dbo.WMS_Users
(
    UserID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200) NULL,
    RoleCode NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    MustChangePassword BIT NOT NULL DEFAULT 0,
    LastPasswordChangedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NULL,
    IsDeleted BIT NOT NULL DEFAULT 0
);
```

---

### 8.2. Bảng log đổi mật khẩu

```sql
CREATE TABLE dbo.WMS_UserPasswordLog
(
    PasswordLogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID BIGINT NULL,
    UserName NVARCHAR(100) NOT NULL,
    ActionType NVARCHAR(50) NOT NULL,
    Result NVARCHAR(30) NOT NULL,
    Message NVARCHAR(500) NULL,
    ClientIP NVARCHAR(50) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
```

Mô tả:

| Trường | Mô tả |
|---|---|
| `PasswordLogID` | Khóa chính log. |
| `UserID` | ID người dùng nếu xác định được. |
| `UserName` | Tài khoản thực hiện đổi mật khẩu. |
| `ActionType` | Loại thao tác, ví dụ `CHANGE_PASSWORD`. |
| `Result` | Kết quả: `SUCCESS` hoặc `FAILED`. |
| `Message` | Nội dung kết quả hoặc lỗi. |
| `ClientIP` | Địa chỉ IP thiết bị nếu có. |
| `UserAgent` | Thông tin thiết bị/trình duyệt nếu có. |
| `CreatedAt` | Thời gian ghi log. |

---

## 9. Stored Procedure đề xuất

### 9.1. Stored Procedure đổi mật khẩu

> Ghi chú: phần kiểm tra hash mật khẩu nên dùng cơ chế hash phù hợp của hệ thống hiện tại. SQL dưới đây là khung xử lý nghiệp vụ để AI Developer triển khai.

```sql
CREATE OR ALTER PROCEDURE dbo.usp_WMS_AUTH_ChangePassword
    @UserName NVARCHAR(100),
    @CurrentPassword NVARCHAR(500),
    @NewPassword NVARCHAR(500),
    @ConfirmNewPassword NVARCHAR(500),
    @ClientIP NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @UserID BIGINT,
        @PasswordHash NVARCHAR(500),
        @IsActive BIT,
        @IsDeleted BIT,
        @Message NVARCHAR(500),
        @NewPasswordHash NVARCHAR(500);

    SELECT
        @UserID = UserID,
        @PasswordHash = PasswordHash,
        @IsActive = IsActive,
        @IsDeleted = IsDeleted
    FROM dbo.WMS_Users
    WHERE UserName = @UserName;

    IF @UserID IS NULL
    BEGIN
        SET @Message = N'Tài khoản không tồn tại.';
        INSERT INTO dbo.WMS_UserPasswordLog(UserID, UserName, ActionType, Result, Message, ClientIP, UserAgent)
        VALUES(NULL, @UserName, N'CHANGE_PASSWORD', N'FAILED', @Message, @ClientIP, @UserAgent);
        RAISERROR(@Message, 16, 1);
        RETURN;
    END;

    IF ISNULL(@IsActive, 0) = 0 OR ISNULL(@IsDeleted, 0) = 1
    BEGIN
        SET @Message = N'Tài khoản không hoạt động hoặc đã bị khóa.';
        INSERT INTO dbo.WMS_UserPasswordLog(UserID, UserName, ActionType, Result, Message, ClientIP, UserAgent)
        VALUES(@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', @Message, @ClientIP, @UserAgent);
        RAISERROR(@Message, 16, 1);
        RETURN;
    END;

    IF @NewPassword <> @ConfirmNewPassword
    BEGIN
        SET @Message = N'Mật khẩu xác nhận không khớp.';
        INSERT INTO dbo.WMS_UserPasswordLog(UserID, UserName, ActionType, Result, Message, ClientIP, UserAgent)
        VALUES(@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', @Message, @ClientIP, @UserAgent);
        RAISERROR(@Message, 16, 1);
        RETURN;
    END;

    IF @CurrentPassword = @NewPassword
    BEGIN
        SET @Message = N'Mật khẩu mới không được trùng mật khẩu hiện tại.';
        INSERT INTO dbo.WMS_UserPasswordLog(UserID, UserName, ActionType, Result, Message, ClientIP, UserAgent)
        VALUES(@UserID, @UserName, N'CHANGE_PASSWORD', N'FAILED', @Message, @ClientIP, @UserAgent);
        RAISERROR(@Message, 16, 1);
        RETURN;
    END;

    -- TODO: Thay bằng hàm verify password hash thực tế của hệ thống
    -- IF dbo.fn_VerifyPassword(@CurrentPassword, @PasswordHash) = 0
    -- BEGIN ... END

    -- TODO: Thay bằng hàm hash password thực tế của hệ thống
    -- SET @NewPasswordHash = dbo.fn_HashPassword(@NewPassword);
    SET @NewPasswordHash = @NewPassword;

    BEGIN TRANSACTION;

    UPDATE dbo.WMS_Users
    SET
        PasswordHash = @NewPasswordHash,
        MustChangePassword = 0,
        LastPasswordChangedAt = GETDATE(),
        UpdatedAt = GETDATE()
    WHERE UserID = @UserID;

    INSERT INTO dbo.WMS_UserPasswordLog
    (
        UserID,
        UserName,
        ActionType,
        Result,
        Message,
        ClientIP,
        UserAgent
    )
    VALUES
    (
        @UserID,
        @UserName,
        N'CHANGE_PASSWORD',
        N'SUCCESS',
        N'Đổi mật khẩu thành công.',
        @ClientIP,
        @UserAgent
    );

    COMMIT TRANSACTION;

    SELECT
        N'OK' AS Result,
        N'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' AS Message;
END;
```

---

## 10. Giao diện đề xuất

### Màn hình đổi mật khẩu

| Thành phần | Mô tả |
|---|---|
| Mật khẩu hiện tại | Ô nhập dạng password. |
| Mật khẩu mới | Ô nhập dạng password. |
| Xác nhận mật khẩu mới | Ô nhập dạng password. |
| Nút đổi mật khẩu | Gọi stored procedure đổi mật khẩu. |
| Nút hủy | Quay lại màn hình trước, nếu không phải luồng bắt buộc đổi mật khẩu. |
| Thông báo lỗi | Hiển thị lỗi trả về từ stored procedure. |

Trong trường hợp bắt buộc đổi mật khẩu, không hiển thị nút bỏ qua.

---

## 11. Phân quyền

| Vai trò | Quyền |
|---|---|
| Nhân viên kho | Được đổi mật khẩu của chính mình. |
| Thủ kho | Được đổi mật khẩu của chính mình. |
| Quản lý/Admin | Có thể reset mật khẩu người dùng khác theo use case quản trị riêng. |

Lưu ý: UC00.1 chỉ xử lý người dùng tự đổi mật khẩu. Reset mật khẩu bởi Admin nên tách thành use case quản trị riêng.

---

## 12. Ghi chú cho AI Developer

1. Không xử lý đổi mật khẩu trực tiếp trên app.
2. App chỉ gọi Stored Procedure và hiển thị kết quả.
3. Không lưu mật khẩu plain text trong database.
4. Cần thay phần `TODO` hash/verify password bằng cơ chế bảo mật thực tế của hệ thống.
5. Mọi lần đổi mật khẩu thành công hoặc thất bại đều phải ghi log.
6. Sau khi đổi mật khẩu thành công, nên xóa session/token hiện tại và yêu cầu đăng nhập lại.

---

## 13. Kết luận

UC00.1 là use case bảo mật độc lập, dùng để đổi mật khẩu người dùng WMS. Use case này có thể được gọi sau đăng nhập hoặc khi hệ thống bắt buộc đổi mật khẩu. Tất cả logic kiểm tra, cập nhật và ghi log nên được xử lý tại SQL Server thông qua Stored Procedure.
