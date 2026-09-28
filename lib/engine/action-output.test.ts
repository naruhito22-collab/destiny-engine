import test from 'node:test';
import assert from 'node:assert/strict';
import { ActionOutputSchema, validateActionSafety } from './action-output';

const safe=ActionOutputSchema.parse({
  action_text:'机の引き出しを1区画だけ10分整理する。',
  estimated_minutes:10,
  target_type:'ENVIRONMENT',
  action_type:'ARRANGE',
  novelty_type:'FAMILIAR',
  social_type:'SOLO',
  direction_used:null,
  time_modifier_used:null,
  risk_flags:[],
  short_reason:'整理カテゴリーとLevel 1に合わせた小さな行動。',
});

test('safe level 1 action passes',()=>{
  assert.equal(validateActionSafety(safe,1).ok,true);
});

test('major financial action is rejected',()=>{
  const risky={...safe,action_text:'仮想通貨へ投資する。'};
  assert.equal(validateActionSafety(risky,1).ok,false);
});

test('level duration mismatch is rejected',()=>{
  const long={...safe,estimated_minutes:120};
  assert.equal(validateActionSafety(long,1).ok,false);
});
