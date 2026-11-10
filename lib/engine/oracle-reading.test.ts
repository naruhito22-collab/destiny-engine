import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOracleReading, ORACLE_THEMES } from './oracle-reading';
import type { DailyDestinyData } from '@/lib/types/destiny';

const fixture={
  identity:{userId:'test-user',localDate:'2026-11-10',timezone:'Asia/Tokyo',engineVersion:'0.2.0',calculationId:'test',createdAt:'2026-11-10T00:00:00Z'},
  numerology:{personalYear:1,personalMonth:2,personalDay:3,actionType:'EXPRESS',categoryScores:{creation:3},calculationVersion:'numerology_v1'},
  coreResult:{primaryCategory:'creation',secondaryCategory:'learning',categoryScores:{creation:3,learning:2}},
  iching:{hexagramName:'風地観',primaryPosture:'OBSERVE'},
  tarot:{cardName:'The Star',mood:'hopeful'},
  astrology:{primaryCategory:'exploration'},
  nineStarKi:{directionModifier:'N'},
  rokuyo:{rokuyoName:'先勝',tempoModifier:'early'},
} satisfies DailyDestinyData;

test('all seven ORACLE themes have individual suggestions with verified evidence',()=>{
  const suggestions=new Set<string>();
  for(const theme of ORACLE_THEMES){
    const r=buildOracleReading(fixture,theme);
    suggestions.add(r.suggestion);
    assert.match(r.basis,/風地観/);
    assert.match(r.basis,/The Star/);
    assert.match(r.basis,/数秘術: 3/);
    assert.match(r.basis,/九星気学: 北/);
    assert.equal(r.calculationVersion,'oracle-rules-v4');
    assert.doesNotMatch(r.reading,/架空/);
  }
  assert.equal(suggestions.size,7);
  const readings=ORACLE_THEMES.map(theme=>buildOracleReading(fixture,theme).reading);
  assert.equal(new Set(readings).size,7);
  assert.match(buildOracleReading(fixture,'work').reading,/仕事の意思決定|仕事の進め方/);
  assert.match(buildOracleReading(fixture,'love').reading,/相手との関係|恋愛/);
  assert.match(buildOracleReading(fixture,'money').reading,/支出や予算/);
});

test('missing divination evidence is not invented',()=>{
  const sparse={...fixture,iching:{},tarot:{},astrology:{},nineStarKi:{},rokuyo:{}};
  const r=buildOracleReading(sparse,'general');
  assert.doesNotMatch(r.reading,/風地観|The Star/);
  assert.doesNotMatch(r.basis,/タロット|易:|九星気学/);
});

test('missing core category is rejected',()=>{
  assert.throws(()=>buildOracleReading({...fixture,coreResult:undefined},'general'),/ORACLE_CORE_CATEGORY_MISSING/);
});

test('changing the CORE signal changes the reading in every theme',()=>{
  const alternate={...fixture,coreResult:{...fixture.coreResult,primaryCategory:'organization' as const}};
  for(const theme of ORACLE_THEMES){
    const original=buildOracleReading(fixture,theme);
    const changed=buildOracleReading(alternate,theme);
    assert.notEqual(original.reading,changed.reading,theme);
    assert.notEqual(original.suggestion,changed.suggestion,theme);
    assert.match(changed.basis,/CORE: 整理/);
  }
});

test('theme-specific reading does not present another theme as its main focus',()=>{
  const expectations={
    general:/一日の流れと優先順位/,
    love:/親密さ・気持ちの伝達/,
    work:/仕事の判断・段取り/,
    money:/支出・予算/,
    relationships:/周囲との協力・対話/,
    health:/休息・生活リズム/,
    creation:/着想・試作/,
  } as const;
  for(const theme of ORACLE_THEMES){
    const reading=buildOracleReading(fixture,theme).reading;
    assert.match(reading,expectations[theme],theme);
    assert.ok(reading.length>100,theme);
  }
});

test('optional evidence stays in basis, not invented in the main interpretation',()=>{
  const sparse={...fixture,numerology:{},iching:{},tarot:{},astrology:{},nineStarKi:{},rokuyo:{}};
  for(const theme of ORACLE_THEMES){
    const r=buildOracleReading(sparse,theme);
    assert.doesNotMatch(r.reading,/パーソナルデー|風地観|The Star|西洋占星術/);
    assert.doesNotMatch(r.basis,/数秘術:|易:|タロット:|西洋占星術:|九星気学:|六曜:/);
    assert.equal(r.calculationVersion,'oracle-rules-v4');
  }
});
