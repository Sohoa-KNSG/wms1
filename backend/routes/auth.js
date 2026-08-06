const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { poolPromise } = require('../db');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// Cấu hình Rate Limiting: Giới hạn 20 request / 1 phút mỗi IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: { status: 'ERROR', message: 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'ERROR', message: 'Vui lòng nhập tài khoản và mật khẩu' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('username', username);
    
    // Tìm user và các roles của user đó
    const result = await request.query(`
      SELECT u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password,
             STRING_AGG(r.role_id, ',') AS roles
      FROM sec_user u
      LEFT JOIN sec_user_role ur ON u.user_id = ur.user_id
      LEFT JOIN sec_role r ON ur.role_id = r.role_id
      WHERE u.username = @username
      GROUP BY u.user_id, u.username, u.password_hash, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password
    `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ status: 'ERROR', message: 'Tài khoản không tồn tại' });
    }

    const user = result.recordset[0];
    if (!user.is_active) {
      return res.status(403).json({ status: 'ERROR', message: 'Tài khoản đã bị khóa' });
    }

    // Kiểm tra lockout_until
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return res.status(403).json({ status: 'ERROR', message: 'Tài khoản đang bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau.' });
    }

    // Kiểm tra password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      const updateReq = pool.request();
      const failCount = (user.failed_attempts || 0) + 1;
      updateReq.input('userId', user.user_id);
      updateReq.input('failCount', failCount);
      
      let errorMsg = 'Mật khẩu không chính xác';
      if (failCount >= 5) {
        await updateReq.query('UPDATE sec_user SET failed_attempts = @failCount, lockout_until = DATEADD(MINUTE, 15, GETDATE()) WHERE user_id = @userId');
        errorMsg = 'Nhập sai quá 5 lần. Tài khoản của bạn đã bị khóa 15 phút.';
      } else {
        await updateReq.query('UPDATE sec_user SET failed_attempts = @failCount WHERE user_id = @userId');
      }
      return res.status(401).json({ status: 'ERROR', message: errorMsg });
    }

    // Reset failed_attempts và lockout_until khi đăng nhập thành công
    if (user.failed_attempts > 0 || user.lockout_until) {
      const updateReq = pool.request();
      updateReq.input('userId', user.user_id);
      await updateReq.query('UPDATE sec_user SET failed_attempts = 0, lockout_until = NULL WHERE user_id = @userId');
    }

    // Lấy danh sách quyền từ sec_role_permission
    const permResult = await pool.request()
      .input('userId', user.user_id)
      .query(`
        SELECT DISTINCT rp.permission_id 
        FROM sec_role_permission rp
        INNER JOIN sec_user_role ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = @userId
      `);
    const permissions = permResult.recordset.map(row => row.permission_id);

    // Sinh JWT
    const token = jwt.sign(
      { 
        user_id: user.user_id, 
        username: user.username,
        full_name: user.full_name,
        roles: user.roles ? user.roles.split(',') : [],
        permissions: permissions,
        must_change_password: user.must_change_password
      },
      JWT_SECRET,
      { expiresIn: '8h' } // Token hết hạn sau 8 tiếng
    );

    res.json({
      status: 'SUCCESS',
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          full_name: user.full_name,
          roles: user.roles ? user.roles.split(',') : [],
          permissions: permissions,
          must_change_password: user.must_change_password
        }
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'ERROR', message: 'Lỗi máy chủ nội bộ' });
  }
});

router.post('/change-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const { user_id, username } = req.user;
  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ status: 'ERROR', message: 'Vui lòng điền đầy đủ thông tin.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ status: 'ERROR', message: 'Mật khẩu xác nhận không khớp.' });
  }

  if (newPassword === currentPassword) {
    return res.status(400).json({ status: 'ERROR', message: 'Mật khẩu mới không được trùng mật khẩu hiện tại.' });
  }

  // Yêu cầu độ mạnh mật khẩu cơ bản: 8 ký tự
  if (newPassword.length < 8) {
    return res.status(400).json({ status: 'ERROR', message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', user_id);
    
    // Lấy thông tin user hiện tại
    const result = await request.query('SELECT password_hash FROM sec_user WHERE user_id = @userId');
    if (result.recordset.length === 0) {
      return res.status(401).json({ status: 'ERROR', message: 'Tài khoản không tồn tại.' });
    }

    const passwordHash = result.recordset[0].password_hash;
    
    // Kiểm tra currentPassword
    const validPassword = await bcrypt.compare(currentPassword, passwordHash);
    if (!validPassword) {
      return res.status(400).json({ status: 'ERROR', message: 'Mật khẩu hiện tại không chính xác.' });
    }

    // Mã hóa mật khẩu mới
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Gọi SP cập nhật
    const spReq = pool.request();
    spReq.input('UserID', user_id);
    spReq.input('NewPasswordHash', newPasswordHash);
    spReq.input('ClientIP', clientIp);
    spReq.input('UserAgent', userAgent);
    
    await spReq.execute('usp_WMS_AUTH_ChangePassword');
    
    res.json({ status: 'SUCCESS', message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi máy chủ nội bộ' });
  }
});

// Lấy danh sách người dùng (Dành cho Admin)
router.get(['/users', '/admin/users'], verifyToken, async (req, res) => {
  if (!req.user.roles.includes('IT_ADMIN')) {
    return res.status(403).json({ status: 'ERROR', message: 'Bạn không có quyền thực hiện chức năng này.' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.user_id, u.username, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password,
             STRING_AGG(r.role_name, ', ') AS role_names
      FROM sec_user u
      LEFT JOIN sec_user_role ur ON u.user_id = ur.user_id
      LEFT JOIN sec_role r ON ur.role_id = r.role_id
      GROUP BY u.user_id, u.username, u.full_name, u.is_active, u.failed_attempts, u.lockout_until, u.must_change_password
    `);
    res.json({ status: 'SUCCESS', data: result.recordset });
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Lỗi máy chủ nội bộ' });
  }
});

// Admin reset mật khẩu người dùng
router.post('/admin/reset-password', verifyToken, async (req, res) => {
  if (!req.user.roles.includes('IT_ADMIN')) {
    return res.status(403).json({ status: 'ERROR', message: 'Bạn không có quyền thực hiện chức năng này.' });
  }

  const { target_user_id } = req.body;
  if (!target_user_id) {
    return res.status(400).json({ status: 'ERROR', message: 'Vui lòng chọn người dùng.' });
  }

  const clientIp = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  try {
    const newPasswordHash = await bcrypt.hash('123456', 10);
    const pool = await poolPromise;
    const spReq = pool.request();
    spReq.input('TargetUserID', target_user_id);
    spReq.input('AdminUserName', req.user.username);
    spReq.input('DefaultPasswordHash', newPasswordHash);
    spReq.input('ClientIP', clientIp);
    spReq.input('UserAgent', userAgent);
    
    await spReq.execute('usp_WMS_AUTH_AdminResetPassword');
    
    res.json({ status: 'SUCCESS', message: 'Đặt lại mật khẩu thành công (Mặc định: 123456).' });
  } catch (err) {
    console.error('Admin Reset Password Error:', err);
    res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi máy chủ nội bộ' });
  }
});

// Admin tạo người dùng mới
router.post('/admin/users', verifyToken, async (req, res) => {
  if (!req.user.roles.includes('IT_ADMIN')) {
    return res.status(403).json({ status: 'ERROR', message: 'Bạn không có quyền thực hiện chức năng này.' });
  }

  const { username, roles } = req.body;
  const full_name = req.body.full_name || req.body.fullName;
  if (!username || !full_name) {
    return res.status(400).json({ status: 'ERROR', message: 'Vui lòng điền đủ thông tin.' });
  }

  try {
    const passwordHash = await bcrypt.hash('123456', 10); // Mật khẩu mặc định
    const pool = await poolPromise;
    const spReq = pool.request();
    spReq.input('Username', username);
    spReq.input('PasswordHash', passwordHash);
    spReq.input('FullName', full_name);
    spReq.input('Roles', roles ? roles.join(',') : '');
    
    await spReq.execute('usp_WMS_AUTH_CreateUser');
    
    res.json({ status: 'SUCCESS', message: 'Tạo tài khoản thành công.' });
  } catch (err) {
    console.error('Create User Error:', err);
    res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi máy chủ nội bộ' });
  }
});

// Admin Khóa/Mở khóa tài khoản
router.put('/admin/users/:id/status', verifyToken, async (req, res) => {
  if (!req.user.roles.includes('IT_ADMIN')) {
    return res.status(403).json({ status: 'ERROR', message: 'Bạn không có quyền thực hiện chức năng này.' });
  }

  const targetUserId = req.params.id;
  const { is_active } = req.body;

  if (targetUserId === req.user.user_id) {
    return res.status(400).json({ status: 'ERROR', message: 'Không thể tự khóa/mở khóa tài khoản của chính mình.' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('TargetUserID', targetUserId);
    request.input('IsActive', is_active ? 1 : 0);
    
    await request.query('UPDATE sec_user SET is_active = @IsActive WHERE user_id = @TargetUserID');
    
    res.json({ status: 'SUCCESS', message: 'Cập nhật trạng thái thành công.' });
  } catch (err) {
    console.error('Update Status Error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Lỗi máy chủ nội bộ' });
  }
});

// Admin Cập nhật phân quyền
router.put('/admin/users/:id/roles', verifyToken, async (req, res) => {
  if (!req.user.roles.includes('IT_ADMIN')) {
    return res.status(403).json({ status: 'ERROR', message: 'Bạn không có quyền thực hiện chức năng này.' });
  }

  const targetUserId = req.params.id;
  const { roles } = req.body;

  try {
    const pool = await poolPromise;
    const spReq = pool.request();
    spReq.input('TargetUserID', targetUserId);
    spReq.input('Roles', roles ? roles.join(',') : '');
    
    await spReq.execute('usp_WMS_AUTH_UpdateUserRoles');
    
    res.json({ status: 'SUCCESS', message: 'Cập nhật phân quyền thành công.' });
  } catch (err) {
    console.error('Update Roles Error:', err);
    res.status(500).json({ status: 'ERROR', message: err.message || 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = router;
