require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');
const receiptRoutes = require('./routes/receipt');
const authRoutes = require('./routes/auth');
const ledgerRoutes = require('./routes/ledger');
const pack360Routes = require('./routes/pack360');
const oemRoutes = require('./routes/oem');
const palletRoutes = require('./routes/pallet');
const masterDataRoutes = require('./routes/masterData');
const exportRoutes = require('./routes/export');
const pickingRoutes = require('./routes/picking');
const reportsRoutes = require('./routes/reports');
const traceRoutes = require('./routes/trace');
const reconciliationRoutes = require('./routes/reconciliation');
const temporaryDispatchRoutes = require('./routes/temporaryDispatch');
const app = express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  }
}));
app.use(express.json());

// Routes - Dual mounted for /api/v1 and legacy /api compatibility
const mounts = [
  ['auth', authRoutes],
  ['receipt', receiptRoutes],
  ['ledger', ledgerRoutes],
  ['pack360', pack360Routes],
  ['oem-orders', oemRoutes],
  ['oem', oemRoutes],
  ['pallets', palletRoutes],
  ['pallet', palletRoutes],
  ['master', masterDataRoutes],
  ['master-data', masterDataRoutes],
  ['export', exportRoutes],
  ['picking', pickingRoutes],
  ['reports', reportsRoutes],
  ['trace', traceRoutes],
  ['reconciliation', reconciliationRoutes],
  ['temporary-dispatch', temporaryDispatchRoutes]
];

mounts.forEach(([prefix, router]) => {
  const middleware = prefix === 'auth' ? [] : [verifyToken];
  app.use(`/api/v1/${prefix}`, ...middleware, router);
  app.use(`/api/${prefix}`, ...middleware, router);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
