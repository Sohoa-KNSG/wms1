const test = require('node:test');
const assert = require('node:assert/strict');
const { PrinterService, normalizePrintData } = require('../src/services/printer-service');

test('rejects an empty TSPL job', () => {
  assert.throws(() => normalizePrintData('', 1024), /TSPL data is required/);
});

test('rejects a TSPL job above the configured limit', () => {
  assert.throws(() => normalizePrintData('X'.repeat(20), 10), /exceeds 10 bytes/);
});

test('mock printer is ready and de-duplicates a successful job', async () => {
  const printer = new PrinterService({
    mock: true,
    mode: 'tcp',
    name: 'DEFAULT_PRINTER',
    maxJobBytes: 4096,
    jobCacheMs: 60000
  });

  assert.equal((await printer.getStatus()).isReady, true);
  const first = await printer.print({ jobId: 'job-1', data: 'CLS\nPRINT 1\n' });
  const second = await printer.print({ jobId: 'job-1', data: 'CLS\nPRINT 1\n' });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
});
