import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRokuyoFromLunarDate } from './rokuyo';
import { drawTarot } from './tarot';
import { drawIChing } from './iching';
import { dailySeed } from './seed';

test('rokuyo formula',()=>{
  assert.equal(calculateRokuyoFromLunarDate(1,1).rokuyoName,'先勝');
  assert.equal(calculateRokuyoFromLunarDate(8,1).rokuyoName,'友引');
});

test('tarot and iching are deterministic',()=>{
  const s=dailySeed({userId:'u1',localDate:'2026-09-28',engineVersion:'0.1.0',salt:'x'});
  assert.deepEqual(drawTarot(s),drawTarot(s));
  assert.deepEqual(drawIChing(s),drawIChing(s));
});
