require('dotenv').config();

const { loadConfig } = require('./config');
const { createApp } = require('./app');
const { ScaleService } = require('./services/scale-service');
const { PrinterService } = require('./services/printer-service');

const config = loadConfig();
const scaleService = new ScaleService(config.scale);
const printerService = new PrinterService(config.printer);
const app = createApp({ config, scaleService, printerService });

scaleService.start();
const server = app.listen(config.port, config.host, () => {
  console.info(`WMS edge bridge listening at http://${config.host}:${config.port}`);
});

async function shutdown(signal) {
  console.info(`${signal} received; stopping WMS edge bridge`);
  server.close();
  await scaleService.stop();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

module.exports = { app, server };
