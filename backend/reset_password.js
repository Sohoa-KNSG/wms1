const bcrypt = require('bcrypt');
const { poolPromise } = require('./db');

async function resetPasswords() {
  try {
    console.log('Đang tạo mã hóa mới cho mật khẩu "123456"...');
    const newHash = await bcrypt.hash('123456', 10);
    
    const pool = await poolPromise;
    console.log('Đang cập nhật CSDL...');
    await pool.request().query(`UPDATE sec_user SET password_hash = '${newHash}'`);
    
    console.log('Thành công! Tất cả tài khoản đã được reset mật khẩu về: 123456');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
}

resetPasswords();
