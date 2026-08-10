const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');

test('allows a localhost bridge without a device token', () => {
  const config = loadConfig({ HOST: '127.0.0.1' });
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.token, '');
});

test('requires a strong device token when listening on the LAN', () => {
  assert.throws(
    () => loadConfig({ HOST: '0.0.0.0', DEVICE_AGENT_TOKEN: 'short' }),
    /at least 32 characters/
  );

  const config = loadConfig({ HOST: '0.0.0.0', DEVICE_AGENT_TOKEN: 'x'.repeat(32) });
  assert.equal(config.token.length, 32);
});
