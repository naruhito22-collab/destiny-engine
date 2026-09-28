import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDailyDestinyData } from './daily-destiny';

const input={
  userId:'u1',
  localDate:'2026-09-28',
  timezone:'Asia/Tokyo',
  engineVersion:'0.1.0',
  seedSalt:'test-salt',
  birthDate:'1964-06-01',
  birthTimeAvailable:false,
  natal:{year:1964,month:6,day:1,hour:12},
  transit:{year:2026,month:9,day:28,hour:12},
  lunarDate:{year:2026,month:8,day:18,isLeapMonth:false},
  risshunDate:'1964-02-05',
  currentSolsticeDate:'2026-06-21',
  currentSolsticeKind:'SUMMER' as const,
  nextSolsticeDate:'2026-12-22',
  nextSolsticeKind:'WINTER' as const,
};

test('daily destiny is deterministic except createdAt',()=>{
  const a=generateDailyDestinyData(input);
  const b=generateDailyDestinyData(input);
  assert.equal(a.identity.calculationId,b.identity.calculationId);
  assert.deepEqual(a.numerology,b.numerology);
  assert.deepEqual(a.tarot,b.tarot);
  assert.deepEqual(a.iching,b.iching);
  assert.deepEqual(a.coreResult,b.coreResult);
  assert.equal(a.nineStarKi.dayStar.star,7);
});

test('daily destiny contains all six systems and core',()=>{
  const d=generateDailyDestinyData(input);
  assert.ok(d.astrology);
  assert.ok(d.numerology);
  assert.ok(d.iching);
  assert.ok(d.tarot);
  assert.ok(d.nineStarKi);
  assert.ok(d.rokuyo);
  assert.ok(d.coreResult.primaryCategory);
});
