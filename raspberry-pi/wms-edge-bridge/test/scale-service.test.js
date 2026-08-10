const test = require('node:test');
const assert = require('node:assert/strict');
const { parseScaleReading, ScaleService } = require('../src/services/scale-service');

test('parses a stable kilogram reading', () => {
  const reading = parseScaleReading('ST,GS,+0015.45kg');
  assert.equal(reading.weightKg, 15.45);
  assert.equal(reading.explicitlyStable, true);
});

test('converts grams to kilograms', () => {
  const reading = parseScaleReading('ST,GS,+015450 g');
  assert.equal(reading.weightKg, 15.45);
});

test('marks an unstable reading', () => {
  const reading = parseScaleReading('US,GS,+0015.40kg');
  assert.equal(reading.explicitlyStable, false);
});

test('does not turn a negative scale value into a positive weight', () => {
  const reading = parseScaleReading('ST,GS,-0000.25kg');
  assert.equal(reading.weightKg, -0.25);
});

test('ignores malformed scale data', () => {
  assert.equal(parseScaleReading('ERROR'), null);
  assert.equal(parseScaleReading(''), null);
});

test('mock scale is immediately ready', async () => {
  const service = new ScaleService({
    path: '/dev/null',
    mock: true,
    mockWeightKg: 12.34,
    staleMs: 5000
  });
  service.start();
  assert.deepEqual(
    { weight: service.getReading().weight, isStable: service.getReading().isStable },
    { weight: 12.34, isStable: true }
  );
  await service.stop();
});
