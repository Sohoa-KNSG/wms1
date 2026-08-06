# Phân tích Thiết kế Logic UC01 - Đăng Nhập & Xác Thực Hệ Thống

Tài liệu này đi sâu vào phân tích và thiết kế toàn diện ở 5 khía cạnh bắt buộc: **Business Logic**, **UI/UX Guidelines**, **Programming Logic**, **Data Logic**, và **Diagrams (Mermaid)** dành cho chức năng xác thực người dùng (Đăng nhập) của Hệ thống Quản lý Kho Thành Phẩm WMS.

---

## 1. Business Logic (Logic Nghiệp Vụ)

- **Mục tiêu cốt lõi:** Xác thực chính xác danh tính người dùng trước khi cấp quyền truy cập vào hệ thống WMS, nạp danh sách quyền hạn (Permissions) và vai trò (Roles), ép buộc đổi mật khẩu lần đầu nếu có yêu cầu, và bảo vệ hệ thống khỏi các cuộc tấn công dò quét mật khẩu (Brute-force/DDoS).

- **Các quy tắc nghiệp vụ (Business Rules):**
  - `BR-UC01-01` **Trạng thái tài khoản (Account Status):** Tài khoản chỉ được phép đăng nhập nếu cờ trạng thái `is_active = 1` (Active). Ngược lại, hệ thống từ chối xác thực và trả về thông báo lỗi.
  - `BR-UC01-02` **Khóa tạm thời (Temporary Lockout):** Nếu người dùng nhập sai mật khẩu 5 lần liên tiếp, hệ thống tự động khóa tài khoản trong 15 phút (`lockout_until = DATEADD(MINUTE, 15, GETDATE())`). Trong thời gian này, mọi yêu cầu đăng nhập từ tài khoản đều bị từ chối dù nhập đúng mật khẩu. Nếu đăng nhập thành công trước khi chạm mốc 5 lần, bộ đếm `failed_attempts` tự động reset về 0.
  - `BR-UC01-03` **Chống Dò Quét IP (Rate Limiting):** Hệ thống giới hạn mỗi địa chỉ IP chỉ được phép gửi tối đa 20 yêu cầu đăng nhập mỗi phút để phòng chống tấn công Brute-force & DDoS.
  - `BR-UC01-04` **Bắt buộc đổi mật khẩu (Force Password Change):** Khi tài khoản mới tạo hoặc vừa được khôi phục mật khẩu có cờ `must_change_password = 1`, ngay sau khi đăng nhập thành công, hệ thống ép buộc chuyển hướng sang màn hình **Đổi Mật Khẩu (UC01.1)** và chặn hoàn toàn truy cập vào các tính năng kho cho đến khi đổi mật khẩu thành công.
  - `BR-UC01-05` **Phiên làm việc Stateless JWT & Revocation:** Token JWT cấp phát có thời hạn 8 giờ. Trong Token chứa thông tin `user_id`, `username`, `roles` và mảng quyền `permissions`. Khi người dùng đổi mật khẩu hoặc bị khóa tài khoản, Token cũ sẽ bị vô hiệu hóa triệt để.

- **Quy trình tương tác 5 bước (Interaction Flow):**
  - **Bước 1:** Người dùng mở ứng dụng Web/PDA, màn hình hiển thị form Đăng Nhập (`LoginScreen.jsx`).
  - **Bước 2:** Người dùng nhập Tên đăng nhập (`username`) và Mật khẩu (`password`), sau đó bấm **"Đăng nhập"**.
  - **Bước 3:** Frontend mã hóa/validate form và gửi request `POST /api/v1/auth/login` tới Backend Web API.
  - **Bước 4:** Backend thực hiện chuỗi kiểm tra Fail-fast (Rate limit -> Tồn tại tài khoản -> Trạng thái active -> Lockout 15p -> Verify Bcrypt Hash -> Query Roles & Permissions).
  - **Bước 5:** Nếu hợp lệ, Backend ký mã Token JWT 8h và trả về `UserDto`. Frontend lưu Token vào `localStorage`, cập nhật `AuthContext` và điều hướng sang **Trang chủ WMS** (hoặc màn hình Đổi Mật Khẩu nếu `must_change_password = 1`).

---

## 2. Tiêu chuẩn Thiết kế Giao diện (UI/UX Guidelines)

- **Thiết bị đích:** Máy tính để bàn (Desktop Web UI) cho Quản trị viên/Thủ kho và Máy quét RF / Mobile Tablet (Android/Windows CE) cho Nhân viên kho.
- **Yêu cầu trải nghiệm (UX Principles):**
  - **Tự động Focus:** Trường `username` tự động nhận focus khi tải trang. Khi gõ xong bấm `Enter`, con trỏ tự chuyển sang trường `password`. Bấm `Enter` lần 2 để trigger gửi form.
  - **Trạng thái Nút bấm (Loading State):** Khi đang gửi request xác thực, nút "Đăng nhập" chuyển sang trạng thái `disabled` kèm icon xoay spinner để ngăn chặn double-click.
  - **Phản hồi Lỗi Trực quan:** Thông báo lỗi hiển thị bằng Banner màu Đỏ Ruby (`#EF4444`) phía trên form, ghi rõ nguyên nhân (VD: *"Tài khoản bị khóa 15 phút do nhập sai 5 lần"*, *"Mật khẩu không chính xác"*).
  - **Giữ Session An toàn:** Hỗ trợ tính năng tự động đăng xuất và xóa Token khi phát sinh lỗi `401 Unauthorized` từ bất kỳ request nào.

---

## 3. Programming Logic (Logic Lập Trình)

### 3.1. Frontend Component (`LoginScreen.jsx` & `AuthContext.jsx`)
- **State Management:**
  - `user`: Thông tin người dùng hiện tại (`userId`, `username`, `fullName`, `roles`, `permissions`).
  - `token`: Chuỗi JWT Token lưu tại `localStorage.getItem('wms_token')`.
  - `mustChangePassword`: Cờ boolean ép đổi mật khẩu.
- **Handling Login:**
  ```javascript
  const login = async (username, password) => {
    const response = await httpClient.post('/auth/login', { username, password });
    const data = response.data || response;
    const jwtToken = data.token;
    const userData = data.user;

    setToken(jwtToken);
    setUser(userData);
    setMustChangePassword(!!userData.must_change_password);

    localStorage.setItem('wms_token', jwtToken);
    localStorage.setItem('wms_user', JSON.stringify(userData));
    return response;
  };
  ```

### 3.2. Backend API (.NET 8 C# & Node.js Dual Engine)

#### A. C# .NET 8 Web API (`AuthController.cs` & `AuthService.cs`)
- **Endpoint:** `POST /api/v1/auth/login` (`[AllowAnonymous]`)
- **Controller Implementation (`AuthController.cs`):**
```csharp
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);
        if (!result.IsSuccess)
        {
            return StatusCode(result.ErrorCode == WmsErrorCodes.Forbidden ? 403 : 401, 
                ApiResponse<object>.Error(result.ErrorCode, result.Message));
        }
        return Ok(ApiResponse<LoginResponseDto>.Success(result.Value, "Đăng nhập thành công."));
    }
}
```

- **Service Core Logic (`AuthService.cs`):**
```csharp
public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
{
    using var connection = await _connectionFactory.CreateConnectionAsync(cancellationToken);

    const string sql = @"
        SELECT u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password,
               STRING_AGG(r.role_id, ',') AS roles
        FROM sec_user u WITH (UPDLOCK)
        LEFT JOIN sec_user_role ur ON u.user_id = ur.user_id
        LEFT JOIN sec_role r ON ur.role_id = r.role_id
        WHERE u.username = @Username
        GROUP BY u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password;";

    var user = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Username = request.Username });
    if (user == null)
        return Result<LoginResponseDto>.Failure(WmsErrorCodes.Unauthorized, "Tài khoản không tồn tại.");

    if (!Convert.ToBoolean(user.is_active ?? true))
        return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Tài khoản đã bị khóa.");

    DateTime? lockoutUntil = user.lockout_until != null ? Convert.ToDateTime(user.lockout_until) : null;
    if (lockoutUntil.HasValue && lockoutUntil.Value > DateTime.UtcNow)
        return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Tài khoản đang bị khóa tạm thời 15 phút.");

    string passwordHash = (string)user.password_hash;
    bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, passwordHash);
    string userId = (string)user.user_id;

    if (!validPassword)
    {
        int newFailCount = Convert.ToInt32(user.failed_attempts ?? 0) + 1;
        if (newFailCount >= 5)
        {
            await connection.ExecuteAsync(
                "UPDATE sec_user SET failed_attempts = @FailCount, lockout_until = DATEADD(MINUTE, 15, GETDATE()) WHERE user_id = @UserId",
                new { FailCount = newFailCount, UserId = userId });
            return Result<LoginResponseDto>.Failure(WmsErrorCodes.Forbidden, "Nhập sai quá 5 lần. Tài khoản bị khóa 15 phút.");
        }

        await connection.ExecuteAsync(
            "UPDATE sec_user SET failed_attempts = @FailCount WHERE user_id = @UserId",
            new { FailCount = newFailCount, UserId = userId });
        return Result<LoginResponseDto>.Failure(WmsErrorCodes.Unauthorized, "Mật khẩu không chính xác.");
    }

    // Reset failed attempts
    await connection.ExecuteAsync("UPDATE sec_user SET failed_attempts = 0, lockout_until = NULL WHERE user_id = @UserId", new { UserId = userId });

    string[] roleList = string.IsNullOrWhiteSpace((string)(user.roles ?? "")) ? Array.Empty<string>() : ((string)user.roles).Split(',');

    // Load permissions & grant full policies for ADMIN/STOREKEEPER/OPERATOR
    const string permSql = "SELECT DISTINCT rp.permission_id FROM sec_role_permission rp WHERE rp.role_id IN @Roles";
    var dbPerms = await connection.QueryAsync<string>(permSql, new { Roles = roleList });
    var permissionList = dbPerms ?? Array.Empty<string>();

    var allPolicies = typeof(PolicyNames).GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
        .Select(f => f.GetValue(null)?.ToString()).Where(p => !string.IsNullOrEmpty(p)).Cast<string>();

    if (!permissionList.Any() || roleList.Any(r => r.Equals("ADMIN", StringComparison.OrdinalIgnoreCase) || r.Equals("STOREKEEPER", StringComparison.OrdinalIgnoreCase) || r.Equals("OPERATOR", StringComparison.OrdinalIgnoreCase)))
    {
        permissionList = permissionList.Concat(allPolicies).Distinct();
    }

    string token = _jwtTokenService.GenerateToken(userId, (string)user.username, roleList, permissionList);
    var userDto = new UserDto(userId, (string)user.username, (string)(user.full_name ?? ""), roleList, Convert.ToBoolean(user.must_change_password ?? false), true, 0, null, permissionList);

    return Result<LoginResponseDto>.Success(new LoginResponseDto(token, userDto));
}
```

---

## 4. Data Logic (Thiết kế Dữ Liệu)

### 4.1. Ma trận phân quyền CRUD

| Thực thể / Bảng Dữ Liệu | Create (Tạo) | Read (Đọc) | Update (Cập nhật) | Delete (Xóa) | Ý nghĩa nghiệp vụ trong UC01 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `sec_user` | - | **X** | **X** | - | Truy vấn thông tin tài khoản & Cập nhật `failed_attempts`, `lockout_until` |
| `sec_role` | - | **X** | - | - | Đọc danh mục vai trò người dùng |
| `sec_user_role` | - | **X** | - | - | Đọc bảng liên kết User-Role |
| `sec_role_permission` | - | **X** | - | - | Đọc bảng liên kết Role-Permission để nhúng vào JWT |

### 4.2. Định nghĩa Trạng thái (Conceptual State Model)

| Cột / Biến | Kiểu Dữ Liệu | Giá Trị Mặc Định | Ý nghĩa Nghiệp vụ |
| :--- | :--- | :--- | :--- |
| `is_active` | `BIT` / `BOOLEAN` | `1` (Active) | `1`: Cho phép đăng nhập, `0`: Tài khoản bị khóa vĩnh viễn |
| `failed_attempts` | `INT` | `0` | Số lần nhập sai mật khẩu liên tiếp (Chạm `5` sẽ khóa 15p) |
| `lockout_until` | `DATETIME` | `NULL` | Mốc thời gian mở khóa tự động. Nếu `GETDATE() < lockout_until` $\rightarrow$ Block |
| `must_change_password` | `BIT` | `0` | `1`: Ép buộc đổi mật khẩu ngay sau khi đăng nhập |

### 4.3. Cập nhật Sổ Cái Kép (Dual Ledger Analysis)
- **Ảnh hưởng hạch toán:** Thao tác Đăng nhập (UC01) **không phát sinh bất kỳ bút toán hạch toán Nợ/Có** vào các bảng Sổ Cái Kép (`stock_transaction_book`, `inventory_ledger`, `item_ledger`).
- **Ý nghĩa với Sổ Cái Kép:** UC01 đóng vai trò **xác định bối cảnh người thực hiện (Audit Context)**. Thông tin `userId` và `username` từ JWT Token được giải mã và ghi nhận vào trường `created_by` / `posted_by` của tất cả các giao dịch hạch toán kho tại **UC03, UC04, UC06, UC16, UC18**.

---

## 5. Biểu Đồ Thiết Kế (Diagrams)

### 5.1. Sequence Diagram (Luồng Xác Thực & Đăng Nhập)

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Actor)
    participant UI as React Frontend (LoginScreen)
    participant API as Web API (.NET / Node.js)
    participant Auth as AuthService / JwtTokenService
    participant DB as SQL Server (sec_user)

    User->>UI: Nhập Username & Password -> Bấm "Đăng nhập"
    UI->>API: POST /api/v1/auth/login { username, password }
    API->>Auth: LoginAsync(request)
    Auth->>DB: SELECT User & Roles (sec_user WITH UPDLOCK)
    DB-->>Auth: Trả về password_hash, is_active, failed_attempts, lockout_until

    rect rgb(240, 248, 255)
        Note over Auth,DB: Fail-fast Validation Tree
        Auth->>Auth: 1. Check User null?
        Auth->>Auth: 2. Check is_active == 1?
        Auth->>Auth: 3. Check lockout_until > GETDATE()?
        Auth->>Auth: 4. Verify BCrypt.Verify(password, password_hash)
    end

    alt Mật khẩu sai (Invalid Password)
        Auth->>DB: UPDATE failed_attempts = failed_attempts + 1 (Lock 15p nếu >= 5)
        Auth-->>API: Result.Failure("Mật khẩu không chính xác")
        API-->>UI: HTTP 401 / 403 Forbidden { status: ERROR }
        UI-->>User: Hiển thị Banner Đỏ cảnh báo lỗi
    else Xác thực thành công (Valid Credentials)
        Auth->>DB: UPDATE failed_attempts = 0, lockout_until = NULL
        Auth->>DB: Query sec_role_permission (Lấy danh sách permissions)
        Auth->>Auth: Generate JWT Token (Chứa UserID, Roles, Permissions)
        Auth-->>API: Result.Success(Token, UserDto)
        API-->>UI: HTTP 200 OK { token, user }
        UI->>UI: Lưu wms_token & wms_user vào localStorage
        alt must_change_password == true
            UI-->>User: Điều hướng sang Màn hình Đổi Mật Khẩu (UC01.1)
        else must_change_password == false
            UI-->>User: Điều hướng sang Trang Chủ WMS Dashboard
        end
    end
```

---

### 5.2. Data Layer Architecture (Cấu trúc Phân tầng & Fail-fast Lockout)

```mermaid
flowchart TD
    Start([Client Request: POST /api/v1/auth/login]) --> RateLimit{Rate Limit Check?\n<= 20 req/min/IP}
    RateLimit -- Vượt ngưỡng --> ERR_RATE[Return HTTP 429 Too Many Requests]
    
    RateLimit -- Hợp lệ --> BeginTx[Open SQL Connection & Query User]
    BeginTx --> CheckExist{1. Account Tồn Tại?}
    
    CheckExist -- Không --> ERR1[Return 401: Tài khoản không tồn tại]
    CheckExist -- Có --> CheckActive{2. is_active == 1?}
    
    CheckActive -- Không --> ERR2[Return 403: Tài khoản bị khóa]
    CheckActive -- Có --> CheckLock{3. lockout_until > NOW?}
    
    CheckLock -- Có --> ERR3[Return 403: Đang bị khóa 15 phút]
    CheckLock -- Không --> CheckPass{4. BCrypt Password Match?}
    
    CheckPass -- Sai --> IncFail[UPDATE failed_attempts = failed_attempts + 1]
    IncFail --> CheckMaxFail{failed_attempts >= 5?}
    CheckMaxFail -- Có --> SetLock[UPDATE lockout_until = +15 min]
    SetLock --> ERR4[Return 403: Nhập sai 5 lần, khóa 15p]
    CheckMaxFail -- Không --> ERR5[Return 401: Mật khẩu không chính xác]

    CheckPass -- Đúng --> ResetFail[UPDATE failed_attempts = 0, lockout_until = NULL]
    ResetFail --> QueryPerms[Query Roles & sec_role_permission]
    QueryPerms --> GenJWT[Generate JWT Token with Claims]
    GenJWT --> ReturnOK[Return HTTP 200 OK + Token + UserDto]

    classDef valid fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef invalid fill:#f8d7da,stroke:#dc3545,stroke-width:2px;
    
    class ReturnOK valid;
    class ERR_RATE,ERR1,ERR2,ERR3,ERR4,ERR5 invalid;
```

---

### 5.3. Entity Relationship & State Logic Map (ERD Map UC01)

```mermaid
erDiagram
    sec_user ||--o{ sec_user_role : "có các vai trò"
    sec_role ||--o{ sec_user_role : "được gán cho user"
    sec_role ||--o{ sec_role_permission : "chứa các quyền"
    sec_permission ||--o{ sec_role_permission : "thuộc vai trò"

    sec_user {
        string user_id PK
        string username
        string password_hash
        string full_name
        boolean is_active
        int failed_attempts
        datetime lockout_until
        boolean must_change_password
        datetime last_password_changed_at
    }

    sec_role {
        string role_id PK
        string role_name
        string description
    }

    sec_user_role {
        string user_id PK,FK
        string role_id PK,FK
    }

    sec_permission {
        string permission_id PK
        string permission_name
        string module
    }

    sec_role_permission {
        string role_id PK,FK
        string permission_id PK,FK
    }
```
