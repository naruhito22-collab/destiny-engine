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
    assert.equal(r.calculationVersion,'oracle-rules-v6');
    assert.doesNotMatch(r.reading,/架空/);
  }
  assert.equal(suggestions.size,7);
  const readings=ORACLE_THEMES.map(theme=>buildOracleReading(fixture,theme).reading);
  assert.equal(new Set(readings).size,7);
  assert.match(buildOracleReading(fixture,'work').reading,/仕事/);
  assert.match(buildOracleReading(fixture,'love').reading,/相手/);
  assert.match(buildOracleReading(fixture,'money').reading,/買う前/);
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

test('readings stay short and avoid technical terms',()=>{
  for(const theme of ORACLE_THEMES){
    const reading=buildOracleReading(fixture,theme).reading;
    assert.ok(reading.length<120,theme);
    assert.doesNotMatch(reading,/易の|数秘術|タロット|補助線|焦点は/);
  }
});

test('optional evidence stays in basis, not invented in the main interpretation',()=>{
  const sparse={...fixture,iching:{},tarot:{},astrology:{},nineStarKi:{},rokuyo:{}};
  for(const theme of ORACLE_THEMES){
    const r=buildOracleReading(sparse,theme);
    assert.doesNotMatch(r.reading,/パーソナルデー|風地観|The Star|西洋占星術/);
    assert.doesNotMatch(r.basis,/易:|タロット:|西洋占星術:|九星気学:|六曜:/);
    assert.equal(r.calculationVersion,'oracle-rules-v6');
  }
});

test('different domains never share the same guidance for the same posture',()=>{
  const readings=ORACLE_THEMES.map(theme=>buildOracleReading(fixture,theme));
  assert.equal(new Set(readings.map(r=>r.reading.split('。')[1])).size,7);
  for(const r of readings)assert.doesNotMatch(r.suggestion,/六曜|テンポ補正/);
});
