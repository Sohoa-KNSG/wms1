const jwt = require('jsonwebtoken');

// Thay vì biến môi trường phức tạp cho demo, ta dùng secret cứng. Thực tế cần đưa vào .env
const JWT_SECRET = 'WMS_SECRET_KEY_2026';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ status: 'ERROR', message: 'Token là bắt buộc' });
  }

  try {
    // Xóa chữ Bearer nếu có
    const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(bearerToken, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'ERROR', message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = {
  verifyToken,
  JWT_SECRET
};
