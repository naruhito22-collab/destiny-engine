import test from 'node:test';
import assert from 'node:assert/strict';
import { findSolarTerm, solsticePairForDate } from './solar-terms';

test('2026 Japanese solar-term dates are plausible and stable',()=>{
  assert.equal(findSolarTerm(2026,'SUMMER_SOLSTICE').localDate,'2026-06-21');
  assert.equal(findSolarTerm(2026,'WINTER_SOLSTICE').localDate,'2026-12-22');
});

test('1964 Risshun is calculated astronomically',()=>{
  const r=findSolarTerm(1964,'RISSHUN');
  assert.ok(['1964-02-04','1964-02-05'].includes(r.localDate));
});

test('September uses summer to winter solstice pair',()=>{
  const p=solsticePairForDate('2026-09-28');
  assert.equal(p.currentKind,'SUMMER');
  assert.equal(p.nextKind,'WINTER');
});
