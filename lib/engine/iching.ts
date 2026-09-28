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

export function drawIChing(seedHex:string){
  const [id,name,posture]=HEXAGRAMS[seededIndex(seedHex,64,12)];
  const changingLine=seededIndex(seedHex,6,24)+1;
  return {
    hexagramId:id,
    hexagramName:name,
    primaryPosture:posture,
    changingLine,
    resultingHexagramId:null,
    secondaryPosture:null,
    categoryScores:POSTURE_SCORES[posture],
    caution:null,
    seedVersion:'daily_seed_v1',
    calculationVersion:'iching_v1'
  };
}
