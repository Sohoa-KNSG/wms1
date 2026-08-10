const crypto = require('crypto');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function authenticate(config) {
  return (req, res, next) => {
    if (!config.token) return next();

    const supplied = req.get('X-Device-Agent-Token') || '';
    if (!safeEqual(supplied, config.token)) {
      return res.status(401).json({ success: false, error: 'DEVICE_AGENT_UNAUTHORIZED' });
    }

    return next();
  };
}

module.exports = { authenticate };
