const fs = require('fs');
const fsPromises = require('fs/promises');
const net = require('net');

function normalizePrintData(value, maxBytes) {
  if (typeof value !== 'string' || !value.trim()) {
    throw Object.assign(new Error('TSPL data is required'), { statusCode: 400 });
  }
  const data = Buffer.from(value, 'utf8');
  if (data.length > maxBytes) {
    throw Object.assign(new Error(`Print job exceeds ${maxBytes} bytes`), { statusCode: 413 });
  }
  return data;
}

class PrinterService {
  constructor(config) {
    this.config = config;
    this.jobs = new Map();
  }

  async print({ jobId, printerName, data, copies = 1 }) {
    if (!jobId) throw Object.assign(new Error('jobId is required'), { statusCode: 400 });
    if (printerName && printerName !== this.config.name) {
      throw Object.assign(new Error(`Unknown printer: ${printerName}`), { statusCode: 400 });
    }

    this.#purgeJobs();
    if (this.jobs.has(jobId)) return { ...this.jobs.get(jobId), duplicate: true };

    const payload = normalizePrintData(data, this.config.maxJobBytes);
    const safeCopies = Math.min(10, Math.max(1, Number.parseInt(copies, 10) || 1));

    for (let copy = 0; copy < safeCopies; copy += 1) {
      if (this.config.mock) continue;
      if (this.config.mode === 'tcp') await this.#printTcp(payload);
      else if (this.config.mode === 'usb') await this.#printUsb(payload);
      else throw Object.assign(new Error(`Unsupported PRINTER_MODE: ${this.config.mode}`), { statusCode: 503 });
    }

    const result = {
      success: true,
      jobId,
      printerName: this.config.name,
      copies: safeCopies,
      printedAt: new Date().toISOString(),
      duplicate: false
    };
    this.jobs.set(jobId, result);
    return result;
  }

  async getStatus() {
    if (this.config.mock) {
      return { isReady: true, status: 'READY', mode: 'mock', printerName: this.config.name };
    }

    try {
      if (this.config.mode === 'tcp') {
        await this.#connectTcp();
      } else if (this.config.mode === 'usb') {
        await fsPromises.access(this.config.device, fs.constants.W_OK);
      } else {
        throw new Error(`Unsupported PRINTER_MODE: ${this.config.mode}`);
      }
      return { isReady: true, status: 'READY', mode: this.config.mode, printerName: this.config.name };
    } catch (error) {
      return {
        isReady: false,
        status: 'OFFLINE',
        mode: this.config.mode,
        printerName: this.config.name,
        error: error.message
      };
    }
  }

  #connectTcp() {
    if (!this.config.host) return Promise.reject(new Error('PRINTER_HOST is not configured'));
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.config.host, port: this.config.port });
      socket.setTimeout(this.config.timeoutMs);
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('timeout', () => socket.destroy(new Error('Printer connection timed out')));
      socket.once('error', reject);
    });
  }

  #printTcp(payload) {
    if (!this.config.host) return Promise.reject(new Error('PRINTER_HOST is not configured'));
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: this.config.host, port: this.config.port });
      socket.setTimeout(this.config.timeoutMs);
      socket.once('connect', () => {
        socket.end(payload, resolve);
      });
      socket.once('timeout', () => socket.destroy(new Error('Printer write timed out')));
      socket.once('error', reject);
    });
  }

  async #printUsb(payload) {
    const handle = await fsPromises.open(this.config.device, 'w');
    try {
      await handle.write(payload);
    } finally {
      await handle.close();
    }
  }

  #purgeJobs() {
    const cutoff = Date.now() - this.config.jobCacheMs;
    for (const [jobId, job] of this.jobs.entries()) {
      if (Date.parse(job.printedAt) < cutoff) this.jobs.delete(jobId);
    }
  }
}

module.exports = { PrinterService, normalizePrintData };
