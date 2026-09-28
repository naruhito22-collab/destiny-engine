import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNumerology, reduce1to9 } from './numerology';

test('reduce1to9', () => {
  assert.equal(reduce1to9(2026), 1);
  assert.equal(reduce1to9(19), 1);
});

test('numerology is deterministic', () => {
  const a = calculateNumerology('1964-01-01', '2026-09-28');
  const b = calculateNumerology('1964-01-01', '2026-09-28');
  assert.deepEqual(a, b);
  assert.ok(a.personalDay >= 1 && a.personalDay <= 9);
});
