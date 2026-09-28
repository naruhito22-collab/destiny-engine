import test from 'node:test';
import assert from 'node:assert/strict';
import { selectGenerationAxes } from './generation-axes';

test('level 1 never selects NEW without random boost',()=>{
  const x=selectGenerationAxes({primaryCategory:'exploration',level:1,seedHex:'c'.repeat(64)});
  assert.ok(['FAMILIAR','ADJACENT'].includes(x.novelty));
  assert.equal(x.intensity,'LOW');
});

test('level 3 selects NEW and HIGH',()=>{
  const x=selectGenerationAxes({primaryCategory:'challenge',level:3,seedHex:'d'.repeat(64)});
  assert.equal(x.novelty,'NEW');
  assert.equal(x.intensity,'HIGH');
});

test('axis selection is deterministic',()=>{
  const a=selectGenerationAxes({primaryCategory:'creation',level:2,seedHex:'e'.repeat(64)});
  const b=selectGenerationAxes({primaryCategory:'creation',level:2,seedHex:'e'.repeat(64)});
  assert.deepEqual(a,b);
});
