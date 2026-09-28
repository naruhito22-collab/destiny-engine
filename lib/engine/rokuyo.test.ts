import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRokuyoFromLunarDate } from './rokuyo';

test('rokuyo matches documented kyureki examples', () => {
  assert.equal(calculateRokuyoFromLunarDate(8, 28).rokuyoName, '大安');
  assert.equal(calculateRokuyoFromLunarDate(9, 2).rokuyoName, '仏滅');
});
