const express = require('express');
const cors = require('cors');
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

app.use(cors());
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
  app.use(`/api/v1/${prefix}`, router);
  app.use(`/api/${prefix}`, router);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
