import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDirectionBoard,
  calculateDayStarFromAnchor,
  calculateDirectionSignal,
  calculateHonmeiStar,
  dayBreakDirection,
  sexagenaryDayIndex,
} from './nine-star';

test('honmei star uses risshun as the year boundary',()=>{
  assert.equal(calculateHonmeiStar('1964-06-01','1964-02-05').star,9);
  assert.equal(calculateHonmeiStar('1964-01-20','1964-02-05').adjustedYear,1963);
});

test('sexagenary day index reference',()=>{
  assert.equal(sexagenaryDayIndex('2000-01-01'),54);
});

test('day star advances or retreats from an anchor',()=>{
  assert.equal(calculateDayStarFromAnchor('2026-09-22','2026-09-15',2,'YIN'),4);
});

test('direction board always follows Lo Shu flying route',()=>{
  const board=buildDirectionBoard(4);
  assert.equal(board.NW,5);
  assert.equal(board.SE,3);
});

test('direction signal matches known 2026-09-22 structure',()=>{
  const result=calculateDirectionSignal({
    localDate:'2026-09-22',
    centerStar:4,
    honmeiStar:3,
  });
  assert.ok(result.exclusions.NW?.includes('GOOU_SATSU'));
  assert.ok(result.exclusions.SE?.includes('ANKEN_SATSU'));
  assert.ok(result.exclusions.SE?.includes('HONMEI_SATSU'));
});

test('day break is the opposite direction of the day branch',()=>{
  assert.ok(['N','NE','E','SE','S','SW','W','NW'].includes(dayBreakDirection('2026-09-22')));
});

test('2026 transition dates match Koyomi reference', async()=>{
  const { calculateTransitionFromSolstice } = await import('./nine-star');
  assert.equal(calculateTransitionFromSolstice('2025-12-22','WINTER').transitionDate,'2025-12-21');
  assert.equal(calculateTransitionFromSolstice('2026-06-21','SUMMER').transitionDate,'2026-06-19');
  assert.equal(calculateTransitionFromSolstice('2026-12-22','WINTER').transitionDate,'2026-12-16');
});

test('2026-09-28 day star matches Koyomi reference', async()=>{
  const { calculateDayStarFromSolstices } = await import('./nine-star');
  const result=calculateDayStarFromSolstices({
    localDate:'2026-09-28',
    currentSolsticeDate:'2026-06-21',
    currentKind:'SUMMER',
    nextSolsticeDate:'2026-12-22',
    nextKind:'WINTER',
  });
  assert.equal(result.star,7);
  assert.equal(result.mode,'YIN');
});
