export const ROKUYO = ['大安','赤口','先勝','友引','先負','仏滅'] as const;
export type RokuyoName = typeof ROKUYO[number];

export function calculateRokuyoFromLunarDate(lunarMonth:number,lunarDay:number){
  if(lunarMonth<1||lunarMonth>12) throw new Error('lunarMonth must be 1..12');
  if(lunarDay<1||lunarDay>30) throw new Error('lunarDay must be 1..30');
  const index=(lunarMonth+lunarDay)%6;
  return {
    rokuyoName: ROKUYO[index],
    index,
    calculationVersion:'rokuyo_v1'
  };
}

export function rokuyoModifier(name:RokuyoName){
  const map:Record<RokuyoName,{timeModifier:string|null;tempoModifier:string}> = {
    '先勝':{timeModifier:'morning',tempoModifier:'early'},
    '友引':{timeModifier:null,tempoModifier:'social_optional'},
    '先負':{timeModifier:'afternoon',tempoModifier:'slow'},
    '仏滅':{timeModifier:null,tempoModifier:'review_reset'},
    '大安':{timeModifier:null,tempoModifier:'neutral'},
    '赤口':{timeModifier:null,tempoModifier:'short_careful'},
  };
  return map[name];
}
