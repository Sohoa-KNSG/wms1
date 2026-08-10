const crypto = require('crypto');
const os = require('os');
const express = require('express');
const cors = require('cors');
const { authenticate } = require('./middleware/authenticate');

function createApp({ config, scaleService, printerService }) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsAllowedOrigins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error('Origin is not allowed by CORS'), { statusCode: 403 }));
    }
  }));
  app.use(express.json({ limit: config.printer.maxJobBytes }));

  app.get('/health', async (_req, res) => {
    const [printer, scale] = await Promise.all([
      printerService.getStatus(),
      Promise.resolve(scaleService.getStatus())
    ]);
    const healthy = scale.isReady && printer.isReady;
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'HEALTHY' : 'DEGRADED',
      uptimeSeconds: Math.floor(process.uptime()),
      cpuTemperatureCelsius: await readCpuTemperature(),
      memory: { freeBytes: os.freemem(), totalBytes: os.totalmem() },
      peripherals: { scale, printer }
    });
  });

  app.use(authenticate(config));

  const weightHandler = (_req, res) => {
    const reading = scaleService.getReading();
    res.status(reading.connected ? 200 : 503).json({
      success: reading.connected,
      weight: reading.weight,
      unit: reading.unit,
      isStable: reading.isStable,
      stable: reading.isStable,
      connected: reading.connected,
      timestamp: reading.timestamp,
      stale: reading.stale
    });
  };
  app.get(['/scale/weight', '/api/scale/weight', '/api/scale/current'], weightHandler);
  app.get(['/scale/status', '/api/scale/status'], (_req, res) => res.json(scaleService.getStatus()));

  app.get(['/printer/status', '/api/printer/status'], async (_req, res) => {
    const status = await printerService.getStatus();
    res.status(status.isReady ? 200 : 503).json(status);
  });

  const printHandler = async (req, res, next) => {
    try {
      const result = await printerService.print({
        jobId: req.body.jobId || crypto.randomUUID(),
        printerName: req.body.printerName || config.printer.name,
        data: req.body.data || req.body.tsplCode,
        copies: req.body.copies
      });
      res.status(result.duplicate ? 200 : 201).json(result);
    } catch (error) {
      next(error);
    }
  };
  app.post(['/printer/print', '/api/printer/print', '/api/print'], printHandler);

  app.use((error, _req, res, _next) => {
    const status = error.statusCode || (error.type === 'entity.too.large' ? 413 : 500);
    res.status(status).json({ success: false, error: error.message });
  });

  return app;
}

async function readCpuTemperature() {
  try {
    const content = await require('fs/promises').readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    return Number((Number.parseInt(content, 10) / 1000).toFixed(1));
  } catch {
    return null;
  }
}

module.exports = { createApp };
