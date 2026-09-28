import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_PATTERNS, selectActionPattern } from './action-patterns';

test('there are exactly 36 initial action patterns',()=>{
  assert.equal(ACTION_PATTERNS.length,36);
});

test('pattern selection stays inside category and level',()=>{
  const p=selectActionPattern({primaryCategory:'exploration',level:1,seedHex:'a'.repeat(64)});
  assert.equal(p.category,'exploration');
  assert.ok(p.allowedLevels.includes(1));
});

test('recently unused pattern is preferred',()=>{
  const p=selectActionPattern({
    primaryCategory:'exploration',level:1,seedHex:'b'.repeat(64),
    recentHistory:[
      {patternId:'EXP-01',localDate:'2026-09-28'},
      {patternId:'EXP-02',localDate:'2026-09-27'},
    ],
  });
  assert.equal(p.id,'EXP-03');
});
