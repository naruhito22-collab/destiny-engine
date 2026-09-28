import { seededIndex } from './seed';
import type { Category } from '@/lib/types/destiny';

export type IChingPosture='GO'|'WAIT'|'CHANGE'|'KEEP'|'CONNECT'|'WITHDRAW'|'PREPARE'|'OBSERVE';

const POSTURE_SCORES:Record<IChingPosture,Partial<Record<Category,number>>>={
GO:{challenge:3,decision:2,exploration:1},
WAIT:{reflection:3,organization:2,learning:1},
CHANGE:{change:3,creation:2,exploration:1},
KEEP:{organization:3,body:2,contribution:1},
CONNECT:{connection:3,contribution:2,creation:1},
WITHDRAW:{reflection:3,change:2,organization:1},
PREPARE:{learning:3,organization:2,body:1},
OBSERVE:{exploration:3,learning:2,chance:1},
};

const HEXAGRAMS:[number,string,IChingPosture][]=[
[1,'乾為天','GO'],[2,'坤為地','KEEP'],[3,'水雷屯','PREPARE'],[4,'山水蒙','OBSERVE'],[5,'水天需','WAIT'],[6,'天水訟','WITHDRAW'],[7,'地水師','PREPARE'],[8,'水地比','CONNECT'],
[9,'風天小畜','KEEP'],[10,'天沢履','OBSERVE'],[11,'地天泰','GO'],[12,'天地否','WITHDRAW'],[13,'天火同人','CONNECT'],[14,'火天大有','GO'],[15,'地山謙','KEEP'],[16,'雷地豫','GO'],
[17,'沢雷随','CONNECT'],[18,'山風蠱','CHANGE'],[19,'地沢臨','CONNECT'],[20,'風地観','OBSERVE'],[21,'火雷噬嗑','CHANGE'],[22,'山火賁','KEEP'],[23,'山地剥','WITHDRAW'],[24,'地雷復','CHANGE'],
[25,'天雷无妄','GO'],[26,'山天大畜','PREPARE'],[27,'山雷頤','KEEP'],[28,'沢風大過','CHANGE'],[29,'坎為水','WAIT'],[30,'離為火','OBSERVE'],[31,'沢山咸','CONNECT'],[32,'雷風恒','KEEP'],
[33,'天山遯','WITHDRAW'],[34,'雷天大壮','GO'],[35,'火地晋','GO'],[36,'地火明夷','WITHDRAW'],[37,'風火家人','KEEP'],[38,'火沢睽','OBSERVE'],[39,'水山蹇','WAIT'],[40,'雷水解','CHANGE'],
[41,'山沢損','WITHDRAW'],[42,'風雷益','GO'],[43,'沢天夬','CHANGE'],[44,'天風姤','OBSERVE'],[45,'沢地萃','CONNECT'],[46,'地風升','GO'],[47,'沢水困','WAIT'],[48,'水風井','KEEP'],
[49,'沢火革','CHANGE'],[50,'火風鼎','CHANGE'],[51,'震為雷','GO'],[52,'艮為山','WAIT'],[53,'風山漸','KEEP'],[54,'雷沢帰妹','OBSERVE'],[55,'雷火豊','GO'],[56,'火山旅','OBSERVE'],
[57,'巽為風','CONNECT'],[58,'兌為沢','CONNECT'],[59,'風水渙','CHANGE'],[60,'水沢節','KEEP'],[61,'風沢中孚','CONNECT'],[62,'雷山小過','PREPARE'],[63,'水火既済','KEEP'],[64,'火水未済','PREPARE']
];


type Trigram='QIAN'|'DUI'|'LI'|'ZHEN'|'XUN'|'KAN'|'GEN'|'KUN';

const TRIGRAM_BITS:Record<Trigram,string>={
  QIAN:'111',
  DUI:'110',
  LI:'101',
  ZHEN:'100',
  XUN:'011',
  KAN:'010',
  GEN:'001',
  KUN:'000',
};

const TRIGRAM_ORDER:Trigram[]=['QIAN','DUI','LI','ZHEN','XUN','KAN','GEN','KUN'];

// Rows = lower trigram, columns = upper trigram.
// Values are King Wen hexagram numbers.
const KING_WEN_MATRIX:number[][]=[
  [1,43,14,34,9,5,26,11],
  [10,58,38,54,61,60,41,19],
  [13,49,30,55,37,63,22,36],
  [25,17,21,51,42,3,27,24],
  [44,28,50,32,57,48,18,46],
  [6,47,64,40,59,29,4,7],
  [33,31,56,62,53,39,52,15],
  [12,45,35,16,20,8,23,2],
];

const HEXAGRAM_BY_ID=new Map(HEXAGRAMS.map(h=>[h[0],h] as const));

function hexagramIdFromBits(bits:string){
  if(!/^[01]{6}$/.test(bits)) throw new Error('hexagram bits must contain six 0/1 values');
  const lowerBits=bits.slice(0,3);
  const upperBits=bits.slice(3,6);
  const lowerIndex=TRIGRAM_ORDER.findIndex(t=>TRIGRAM_BITS[t]===lowerBits);
  const upperIndex=TRIGRAM_ORDER.findIndex(t=>TRIGRAM_BITS[t]===upperBits);
  if(lowerIndex<0||upperIndex<0) throw new Error('invalid trigram bits');
  return KING_WEN_MATRIX[lowerIndex][upperIndex];
}

function bitsFromHexagramId(id:number){
  for(let lowerIndex=0;lowerIndex<8;lowerIndex++){
    for(let upperIndex=0;upperIndex<8;upperIndex++){
      if(KING_WEN_MATRIX[lowerIndex][upperIndex]===id){
        return TRIGRAM_BITS[TRIGRAM_ORDER[lowerIndex]]+TRIGRAM_BITS[TRIGRAM_ORDER[upperIndex]];
      }
    }
  }
  throw new Error(`unknown hexagram id: ${id}`);
}

export function resultingHexagramId(hexagramId:number,changingLine:number){
  if(changingLine<1||changingLine>6||!Number.isInteger(changingLine)){
    throw new Error('changingLine must be an integer 1..6');
  }
  const bits=bitsFromHexagramId(hexagramId).split('');
  const i=changingLine-1;
  bits[i]=bits[i]==='1'?'0':'1';
  return hexagramIdFromBits(bits.join(''));
}

export function drawIChing(seedHex:string){
  const [id,name,posture]=HEXAGRAMS[seededIndex(seedHex,64,12)];
  const changingLine=seededIndex(seedHex,6,24)+1;
  const resultId=resultingHexagramId(id,changingLine);
  const result=HEXAGRAM_BY_ID.get(resultId);
  if(!result) throw new Error(`resulting hexagram not found: ${resultId}`);
  const [,resultName,resultPosture]=result;
  return {
    hexagramId:id,
    hexagramName:name,
    primaryPosture:posture,
    changingLine,
    resultingHexagramId:resultId,
    resultingHexagramName:resultName,
    secondaryPosture:resultPosture,
    secondaryCategoryScores:POSTURE_SCORES[resultPosture],
    categoryScores:POSTURE_SCORES[posture],
    caution:null,
    seedVersion:'daily_seed_v1',
    calculationVersion:'iching_v2'
  };
}
