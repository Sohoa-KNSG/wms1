const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

function fixture(token = '', print = async job => ({ success: true, jobId: job.jobId, duplicate: false })) {
  const config = {
    token,
    corsAllowedOrigins: ['http://localhost:5173'],
    scale: { mock: true },
    printer: { maxJobBytes: 4096, name: 'DEFAULT_PRINTER' }
  };
  const scaleService = {
    getReading: () => ({ weight: 15.45, unit: 'KG', isStable: true, connected: true, stale: false, timestamp: '2026-08-07T00:00:00Z' }),
    getStatus: () => ({ connected: true, isReady: true, status: 'READY' })
  };
  const printerService = {
    getStatus: async () => ({ isReady: true, status: 'READY' }),
    print
  };
  return createApp({ config, scaleService, printerService });
}

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('returns the frontend-compatible scale payload', async () => {
  await withServer(fixture(), async baseUrl => {
    const response = await fetch(`${baseUrl}/scale/weight`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.weight, 15.45);
    assert.equal(body.isStable, true);
  });
});

test('requires the device token when configured', async () => {
  await withServer(fixture('a'.repeat(32)), async baseUrl => {
    const denied = await fetch(`${baseUrl}/scale/weight`);
    assert.equal(denied.status, 401);

    const allowed = await fetch(`${baseUrl}/scale/weight`, {
      headers: { 'X-Device-Agent-Token': 'a'.repeat(32) }
    });
    assert.equal(allowed.status, 200);
  });
});

test('rejects an unconfigured browser origin', async () => {
  await withServer(fixture(), async baseUrl => {
    const response = await fetch(`${baseUrl}/scale/weight`, {
      headers: { Origin: 'https://untrusted.example' }
    });
    assert.equal(response.status, 403);
  });
});

test('accepts the Web App print contract and preserves the API job id', async () => {
  let receivedJob;
  const print = async job => {
    receivedJob = job;
    return { success: true, jobId: job.jobId, duplicate: false };
  };

  await withServer(fixture('', print), async baseUrl => {
    const response = await fetch(`${baseUrl}/printer/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: 'pack360-job-001',
        printerName: 'DEFAULT_PRINTER',
        data: 'CLS\r\nPRINT 1,1\r\n'
      })
    });

    assert.equal(response.status, 201);
    assert.deepEqual(receivedJob, {
      jobId: 'pack360-job-001',
      printerName: 'DEFAULT_PRINTER',
      data: 'CLS\r\nPRINT 1,1\r\n',
      copies: undefined
    });
  });
});
