const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost']);

function integer(value, fallback, minimum, maximum) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function number(value, fallback, minimum, maximum) {
  const parsed = Number.parseFloat(value ?? '');
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, parsed));
}

function boolean(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function list(value, fallback) {
  return String(value || fallback)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function loadConfig(env = process.env) {
  const host = env.HOST || '127.0.0.1';
  const token = env.DEVICE_AGENT_TOKEN || '';

  if (!LOOPBACK_HOSTS.has(host) && token.length < 32) {
    throw new Error('DEVICE_AGENT_TOKEN must contain at least 32 characters when the bridge listens outside localhost');
  }

  return {
    nodeEnv: env.NODE_ENV || 'production',
    host,
    port: integer(env.PORT, 8080, 1, 65535),
    token,
    corsAllowedOrigins: list(
      env.CORS_ALLOWED_ORIGINS,
      'http://localhost:5173,http://localhost:3000'
    ),
    scale: {
      path: env.SCALE_PORT || '/dev/ttyUSB0',
      baudRate: integer(env.SCALE_BAUD_RATE, 9600, 300, 921600),
      delimiter: String(env.SCALE_DELIMITER || '\\r\\n')
        .replaceAll('\\r', '\r')
        .replaceAll('\\n', '\n'),
      reconnectMs: integer(env.SCALE_RECONNECT_MS, 3000, 500, 60000),
      staleMs: integer(env.SCALE_STALE_MS, 5000, 500, 60000),
      stableSamples: integer(env.SCALE_STABLE_SAMPLES, 3, 1, 20),
      stableToleranceKg: number(env.SCALE_STABLE_TOLERANCE_KG, 0.02, 0, 10),
      mock: boolean(env.MOCK_SCALE),
      mockWeightKg: number(env.MOCK_SCALE_WEIGHT_KG, 15.45, 0, 100000)
    },
    printer: {
      mock: boolean(env.MOCK_PRINTER),
      mode: String(env.PRINTER_MODE || 'tcp').toLowerCase(),
      name: env.PRINTER_NAME || 'DEFAULT_PRINTER',
      host: env.PRINTER_HOST || '',
      port: integer(env.PRINTER_PORT, 9100, 1, 65535),
      device: env.PRINTER_DEVICE || '/dev/usb/lp0',
      timeoutMs: integer(env.PRINTER_TIMEOUT_MS, 5000, 500, 60000),
      maxJobBytes: integer(env.PRINTER_MAX_JOB_BYTES, 262144, 1024, 1048576),
      jobCacheMs: integer(env.PRINT_JOB_CACHE_MS, 3600000, 1000, 86400000)
    }
  };
}

module.exports = { loadConfig };
