const EventEmitter = require('events');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

function parseScaleReading(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  const matches = upper.match(/[-+]?\d+(?:[.,]\d+)?/g);
  if (!matches?.length) return null;

  const parsed = Number.parseFloat(matches.at(-1).replace(',', '.'));
  if (!Number.isFinite(parsed)) return null;

  const unit = /(?:^|\W)G(?:$|\W)/.test(upper) && !upper.includes('KG') ? 'G' : 'KG';
  const weightKg = unit === 'G' ? parsed / 1000 : parsed;
  const explicitlyUnstable = /(?:^|[,\s])US(?:[,\s]|$)/.test(upper);
  const explicitlyStable = /(?:^|[,\s])ST(?:[,\s]|$)/.test(upper);

  return {
    weightKg,
    explicitlyStable: explicitlyStable ? true : explicitlyUnstable ? false : null,
    raw
  };
}

class ScaleService extends EventEmitter {
  constructor(config, logger = console) {
    super();
    this.config = config;
    this.logger = logger;
    this.port = null;
    this.reconnectTimer = null;
    this.stopping = false;
    this.samples = [];
    this.state = {
      weight: 0,
      unit: 'KG',
      isStable: false,
      connected: false,
      timestamp: null,
      port: config.path,
      error: null
    };
  }

  start() {
    this.stopping = false;
    if (this.config.mock) {
      this.state = {
        ...this.state,
        weight: this.config.mockWeightKg,
        isStable: true,
        connected: true,
        timestamp: new Date().toISOString(),
        error: null
      };
      return;
    }
    this.#connect();
  }

  async stop() {
    this.stopping = true;
    clearTimeout(this.reconnectTimer);
    if (this.port?.isOpen) {
      await new Promise(resolve => this.port.close(() => resolve()));
    }
  }

  getReading() {
    const timestampMs = this.state.timestamp ? Date.parse(this.state.timestamp) : 0;
    const stale = !this.config.mock && (!timestampMs || Date.now() - timestampMs > this.config.staleMs);
    return { ...this.state, isStable: this.state.isStable && !stale, stale };
  }

  getStatus() {
    const reading = this.getReading();
    return {
      connected: reading.connected,
      isReady: reading.connected && !reading.stale,
      status: !reading.connected ? 'OFFLINE' : reading.stale ? 'STALE' : 'READY',
      port: reading.port,
      lastReadingAt: reading.timestamp,
      error: reading.error
    };
  }

  #connect() {
    if (this.stopping || this.port?.isOpen) return;

    this.port = new SerialPort({
      path: this.config.path,
      baudRate: this.config.baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      autoOpen: false
    });

    const parser = this.port.pipe(new ReadlineParser({ delimiter: this.config.delimiter }));
    parser.on('data', data => this.#accept(data));
    this.port.on('error', error => this.#disconnected(error));
    this.port.on('close', () => this.#disconnected(new Error('Scale serial port closed')));
    this.port.open(error => {
      if (error) return this.#disconnected(error);
      this.state = { ...this.state, connected: true, error: null };
      this.logger.info?.(`Scale connected at ${this.config.path} (${this.config.baudRate} baud)`);
    });
  }

  #accept(data) {
    const reading = parseScaleReading(data);
    if (!reading) return;

    this.samples.push(reading.weightKg);
    this.samples = this.samples.slice(-this.config.stableSamples);
    const spread = this.samples.length
      ? Math.max(...this.samples) - Math.min(...this.samples)
      : Number.POSITIVE_INFINITY;
    const inferredStable = this.samples.length >= this.config.stableSamples &&
      spread <= this.config.stableToleranceKg;

    this.state = {
      ...this.state,
      weight: Number(reading.weightKg.toFixed(3)),
      isStable: reading.explicitlyStable ?? inferredStable,
      connected: true,
      timestamp: new Date().toISOString(),
      error: null
    };
    this.emit('reading', this.getReading());
  }

  #disconnected(error) {
    if (this.stopping) return;
    this.state = { ...this.state, connected: false, isStable: false, error: error.message };
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.#connect(), this.config.reconnectMs);
    this.reconnectTimer.unref?.();
  }
}

module.exports = { ScaleService, parseScaleReading };
