import { seededIndex } from './seed';
import type { ActionLevel, Category } from '@/lib/types/destiny';

export type ActionPattern={
  id:string;
  category:Category;
  patternName:string;
  patternDefinition:string;
  allowedLevels:ActionLevel[];
  directionApplicable:boolean;
  timeModifierApplicable:boolean;
  outdoorPossible:boolean;
  socialPossible:boolean;
  active:boolean;
};

const ALL_LEVELS:ActionLevel[]=[1,2,3];
const p=(id:string,category:Category,patternName:string,patternDefinition:string,options:Partial<ActionPattern>={}):ActionPattern=>({
  id,category,patternName,patternDefinition,allowedLevels:ALL_LEVELS,
  directionApplicable:false,timeModifierApplicable:true,outdoorPossible:false,socialPossible:false,active:true,
  ...options,
});

export const ACTION_PATTERNS:ActionPattern[]=[
p('EXP-01','exploration','未経験選択','普段選ばないものを1つ選ぶ',{directionApplicable:true,outdoorPossible:true}),
p('EXP-02','exploration','ルート変更','いつもの移動経路を一部変える',{directionApplicable:true,outdoorPossible:true}),
p('EXP-03','exploration','観察探索','知らない場所・棚・情報源を短時間見る',{directionApplicable:true,outdoorPossible:true}),
p('CON-01','connection','接点追加','普段話さない相手と短く接点を作る',{socialPossible:true}),
p('CON-02','connection','再接続','しばらく連絡していない人へ軽い連絡をする',{socialPossible:true}),
p('CON-03','connection','質問追加','会話で質問を1つ増やす',{socialPossible:true}),
p('CRE-01','creation','3案生成','1テーマについて3案だけ出す'),
p('CRE-02','creation','組み替え','既存のものを別の組み合わせにする'),
p('CRE-03','creation','小作品','短時間で完成するものを1つ作る'),
p('LEA-01','learning','未知1テーマ','知らないことを1つだけ調べる'),
p('LEA-02','learning','深掘り','普段知っているテーマを一段深く調べる'),
p('LEA-03','learning','逆方向学習','普段選ばない分野を短時間見る'),
p('CHA-01','challenge','小さな未経験','少し躊躇するが低リスクなことを試す',{outdoorPossible:true,socialPossible:true}),
p('CHA-02','challenge','先延ばし着手','後回しにしていたことへ最初の一手を入れる'),
p('CHA-03','challenge','制限付き挑戦','時間・回数を決めて難しいことを試す'),
p('ORG-01','organization','1個減らす','不要な物・データ・予定を1つ減らす'),
p('ORG-02','organization','1区画整える','机・フォルダ・棚など範囲を限定して整える'),
p('ORG-03','organization','未完了整理','途中の案件・メモ・タスクを1つ閉じる'),
p('REF-01','reflection','1問だけ考える','今の状態について問いを1つ決めて考える'),
p('REF-02','reflection','記録する','今日気になったことを短く書く'),
p('REF-03','reflection','距離を取る','刺激を一時的に減らして観察する'),
p('BOD-01','body','短時間運動','軽い運動・ストレッチをする',{outdoorPossible:true}),
p('BOD-02','body','感覚観察','姿勢・呼吸・疲れなど身体感覚を確認する'),
p('BOD-03','body','生活調整','睡眠・食事・移動など日常動作を1つ整える'),
p('CNT-01','contribution','小さな手助け','負担にならない範囲で誰かを助ける',{socialPossible:true}),
p('CNT-02','contribution','知識共有','役立つ情報を1つ渡す',{socialPossible:true}),
p('CNT-03','contribution','感謝表現','感謝を具体的に1つ伝える',{socialPossible:true}),
p('CHG-01','change','方法変更','いつものやり方を1点だけ変える'),
p('CHG-02','change','配置変更','物・順番・環境を変える'),
p('CHG-03','change','習慣反転','いつもの選択とは逆側を一度試す',{outdoorPossible:true}),
p('DEC-01','decision','小決定','保留している小さなことを1つ決める'),
p('DEC-02','decision','二択整理','選択肢を2つに絞って決める'),
p('DEC-03','decision','終了判断','続ける必要のない小さなことを1つ終える'),
p('CHA-CH-01','chance','ランダム選択','安全な候補の中から偶然で1つ選ぶ',{outdoorPossible:true}),
p('CHA-CH-02','chance','予定外受容','今日起きた予定外の出来事を1つ活かす'),
p('CHA-CH-03','chance','未知接点','普段触れない人・物・情報との接点を1つ作る',{outdoorPossible:true,socialPossible:true}),
];

export type PatternHistory={patternId:string;localDate:string};

export function selectActionPattern(args:{
  primaryCategory:Category;
  level:ActionLevel;
  seedHex:string;
  recentHistory?:PatternHistory[];
  directionModifier?:string|null;
  timeModifier?:string|null;
}){
  const history=args.recentHistory??[];
  let candidates=ACTION_PATTERNS.filter(x=>
    x.active&&x.category===args.primaryCategory&&x.allowedLevels.includes(args.level)
  );
  if(!candidates.length) throw new Error('No action pattern candidates');

  const dayMs=86400000;
  const today=new Date(history[0]?.localDate??'1970-01-01').getTime();
  const recent7=new Set(history.filter(h=>today-new Date(h.localDate).getTime()<7*dayMs).map(h=>h.patternId));
  const unused7=candidates.filter(x=>!recent7.has(x.id));
  if(unused7.length) candidates=unused7;

  const counts=new Map<string,number>();
  for(const h of history) counts.set(h.patternId,(counts.get(h.patternId)??0)+1);
  const minCount=Math.min(...candidates.map(x=>counts.get(x.id)??0));
  candidates=candidates.filter(x=>(counts.get(x.id)??0)===minCount);

  if(args.directionModifier){
    const directionFit=candidates.filter(x=>x.directionApplicable);
    if(directionFit.length) candidates=directionFit;
  }
  if(args.timeModifier){
    const timeFit=candidates.filter(x=>x.timeModifierApplicable);
    if(timeFit.length) candidates=timeFit;
  }

  return candidates[seededIndex(args.seedHex,candidates.length,42)];
}
