const jwt = require('jsonwebtoken');

// Never fall back to a repository-defined signing key.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be provided through the environment and contain at least 32 characters');
}

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
