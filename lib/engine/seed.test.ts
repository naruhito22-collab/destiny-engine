import test from 'node:test';
import assert from 'node:assert/strict';
import { dailySeed, seededIndex } from './seed';

test('daily seed is stable', () => {
  const input = { userId: 'u1', localDate: '2026-09-28', engineVersion: '0.1.0', salt: 'x' };
  assert.equal(dailySeed(input), dailySeed(input));
});

test('seededIndex is bounded', () => {
  const s = dailySeed({ userId: 'u1', localDate: '2026-09-28', engineVersion: '0.1.0', salt: 'x' });
  const idx = seededIndex(s, 22);
  assert.ok(idx >= 0 && idx < 22);
});
