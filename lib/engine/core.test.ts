import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeCoreScores, mergeIChingScores } from './core';

test('core sums all four sources',()=>{
  const result=mergeCoreScores({
    sources:{
      astrology:{exploration:3,learning:2,change:1},
      numerology:{change:3,exploration:2,challenge:1},
      iching:{exploration:3,learning:2,chance:1},
      tarot:{creation:3,exploration:2,chance:1},
    },
  });
  assert.equal(result.primaryCategory,'exploration');
});

test('core uses astrology before later tie breakers',()=>{
  const result=mergeCoreScores({
    sources:{
      astrology:{learning:3,exploration:2},
      numerology:{exploration:3,learning:2},
      iching:{learning:1,exploration:1},
      tarot:{learning:1,exploration:1},
    },
  });
  assert.equal(result.primaryCategory,'learning');
});

test('previous primary is avoided only at final tie stage',()=>{
  const result=mergeCoreScores({
    previousPrimaryCategory:'exploration',
    sources:{
      astrology:{exploration:1,connection:1},
      numerology:{exploration:1,connection:1},
      iching:{exploration:1,connection:1},
      tarot:{exploration:1,connection:1},
    },
  });
  assert.equal(result.primaryCategory,'connection');
});

test('resulting I Ching posture contributes at most one point',()=>{
  const merged=mergeIChingScores(
    {challenge:3,decision:2,exploration:1},
    {change:3,creation:2,exploration:1},
  );
  assert.equal(merged.change,1);
  assert.equal(merged.creation,2/3);
  assert.equal(merged.exploration,1+1/3);
});
