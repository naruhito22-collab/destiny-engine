import type { DailyDestinyData, Category } from '@/lib/types/destiny';

export const ORACLE_THEMES = ['general','love','work','money','relationships','health','creation'] as const;
export type OracleTheme = typeof ORACLE_THEMES[number];

type OracleResult = {
  title: string;
  reading: string;
  suggestion: string;
  basis: string;
  disclaimer: string;
  calculationVersion: string;
};

const LABELS: Record<Category,string> = {
  exploration:'探索', connection:'つながり', creation:'創造', learning:'学び',
  challenge:'挑戦', organization:'整理', reflection:'内省', body:'身体',
  contribution:'貢献', change:'変化', decision:'決断', chance:'機会',
};

const THEMES: Record<OracleTheme,{title:string;subject:string;suggestions:Record<Category,string>}> = {
  general:{title:'総合運',subject:'今日の過ごし方',suggestions:{
    exploration:'普段と違う選択肢を一つ調べてみる',connection:'気になっていた人に短い連絡を送る',creation:'思いついた案を小さな形にする',
    learning:'疑問を一つ選び、資料に当たる',challenge:'無理のない新しい試みを一つする',organization:'目の前の予定を整える',
    reflection:'少し静かな時間を取り、考えを書き出す',body:'短い休憩や軽い運動を取り入れる',contribution:'誰かを支える小さな行動を考える',
    change:'日課の一つを見直す',decision:'後回しの選択肢を二つに絞る',chance:'気になる誘いや機会を確認する'}},
  love:{title:'恋愛運',subject:'親密な関係や気持ちの伝え方',suggestions:{
    exploration:'相手の新しい一面を知る質問を一つする',connection:'相手の話に丁寧に耳を傾ける',creation:'一緒に楽しめる小さな計画を考える',
    learning:'相手の好みや意向を確かめる',challenge:'伝えたい思いを穏やかに言葉にする',organization:'連絡や予定を無理なく整理する',
    reflection:'自分が本当に望む関係を書き出す',body:'疲れているときは無理に結論を出さない',contribution:'見返りを求めない気遣いを一つ示す',
    change:'いつもの接し方を少し変えてみる',decision:'相手を尊重したうえで自分の希望を整理する',chance:'自然な会話の機会を逃さないようにする'}},
  work:{title:'仕事運',subject:'仕事の進め方',suggestions:{
    exploration:'新しい仕事の進め方を一つ調べる',connection:'関係者に認識を確認する',creation:'提案のラフを一つ作る',
    learning:'不足している情報を確認する',challenge:'着手しやすい難題を一つ選ぶ',organization:'優先事項を三つ以内に整理する',
    reflection:'今の進め方の改善点を書き出す',body:'集中と休憩の時間を調整する',contribution:'チームの困りごとを一つ聞く',
    change:'無駄な工程を一つ見直す',decision:'保留中の仕事の判断材料を整理する',chance:'新しい依頼や提案を検討する'}},
  money:{title:'金運',subject:'お金との向き合い方',suggestions:{
    exploration:'必要な支出の選択肢を比較する',connection:'関係者と予算認識を合わせる',creation:'低コストの代案を考える',
    learning:'料金や条件を一つ調べる',challenge:'固定費の見直しに着手する',organization:'支出記録を整理する',
    reflection:'衝動的な支出の理由を書き留める',body:'疲れているときの大きな金銭判断を避ける',contribution:'共同費用の負担を確認する',
    change:'継続支出を一つ見直す',decision:'比較表を作って検討する',chance:'無料や低コストの選択肢を探す'}},
  relationships:{title:'対人運',subject:'人との関わり方',suggestions:{
    exploration:'普段話さない人と短く話す',connection:'相手の話を最後まで聞く',creation:'一緒にできる企画を考える',
    learning:'相手の立場を確認する',challenge:'必要な相談を穏やかに切り出す',organization:'連絡待ちの案件を整理する',
    reflection:'すれ違いの原因を一度振り返る',body:'疲れたら距離を取り休む',contribution:'手助けできることを尋ねる',
    change:'伝え方を一つ工夫する',decision:'関係の境界線を整理する',chance:'偶然の対話を丁寧に受け止める'}},
  health:{title:'健康運',subject:'心身のセルフケア',suggestions:{
    exploration:'自分に合う軽い気分転換を試す',connection:'無理なく相談できる相手と話す',creation:'気持ちが落ち着く活動を少し行う',
    learning:'信頼できる健康情報を確認する',challenge:'無理のない範囲で身体を動かす',organization:'睡眠と休憩の時間を整える',
    reflection:'体調や気分を記録する',body:'身体の疲れを確認して休息を優先する',contribution:'自分への配慮も忘れない',
    change:'負担の大きい習慣を一つ見直す',decision:'休憩を取る時間を予定に入れる',chance:'休息の機会を意識して確保する'}},
  creation:{title:'創作運',subject:'創作や発想',suggestions:{
    exploration:'未知の表現を一つ観察する',connection:'作品の構想を誰かと話す',creation:'小さな試作を一つ作る',
    learning:'新しい技法を一つ調べる',challenge:'普段と違う方法で試作する',organization:'素材やアイデアを整理する',
    reflection:'作品の核心となる言葉を書き出す',body:'少し離れて作品を見直す',contribution:'誰かの反応を制作の参考にする',
    change:'既存案の一部を置き換える',decision:'試す方向性を一つ選ぶ',chance:'偶然生まれた表現を記録する'}},
};

const POSTURE: Record<string,string> = {
  GO:'進める',WAIT:'待って整える',CHANGE:'変えながら進む',KEEP:'維持する',
  CONNECT:'人とつなぐ',WITHDRAW:'一度距離を置く',PREPARE:'準備する',OBSERVE:'観察する',
};
const NUMBER_ACTION: Record<string,string> = {
  START:'始める',CONNECT:'つながる',EXPRESS:'表現する',ORDER:'整える',CHANGE:'変化させる',
  CARE:'気遣う',STUDY:'学ぶ',ACHIEVE:'成果を意識する',RELEASE:'手放して整理する',
};
const MOOD: Record<string,string> = {
  active:'動きを起こす',focused:'焦点を定める',reflective:'考えを深める',
  relational:'関係を大切にする',transformative:'見方を変える',hopeful:'可能性を見る',controlled:'節度を保つ',
};
const TEMPO: Record<string,string> = {
  early:'早い時間に少し着手する',social_optional:'対話の機会を柔軟に考える',
  slow:'急がず段階を踏む',review_reset:'見直しを中心にする',
  neutral:'時間帯を限定しない',short_careful:'短く慎重に進める',
};
const DIR:Record<string,string>={N:'北',NE:'北東',E:'東',SE:'南東',S:'南',SW:'南西',W:'西',NW:'北西'};

function object(value:unknown):Record<string,unknown>{
  return value!==null && typeof value==='object' && !Array.isArray(value) ? value as Record<string,unknown> : {};
}
function str(value:unknown):string|null{return typeof value==='string'&&value.length>0?value:null;}
function category(value:unknown):Category|null{
  return typeof value==='string' && Object.prototype.hasOwnProperty.call(LABELS,value) ? value as Category : null;
}
function num(value:unknown):number|null{return typeof value==='number'&&Number.isInteger(value)?value:null;}

export function buildOracleReading(input:DailyDestinyData,theme:OracleTheme):OracleResult{
  const entry=THEMES[theme];
  const core=object(input.coreResult);
  const primary=category(core.primaryCategory);
  if(!primary) throw new Error('ORACLE_CORE_CATEGORY_MISSING');

  const secondary=category(core.secondaryCategory);
  const numerology=object(input.numerology);
  const iching=object(input.iching);
  const tarot=object(input.tarot);
  const astrology=object(input.astrology);
  const nineStar=object(input.nineStarKi);
  const rokuyo=object(input.rokuyo);

  const parts:string[]=[];
  const basis:string[]=[];
  parts.push(`${entry.subject}について、今日の統合テーマは「${LABELS[primary]}」${secondary?`、補助テーマは「${LABELS[secondary]}」`:''}です。`);
  basis.push(`CORE: ${LABELS[primary]}${secondary?` / ${LABELS[secondary]}`:''}`);

  const personalDay=num(numerology.personalDay);
  const numberAction=str(numerology.actionType);
  if(personalDay!==null && numberAction && NUMBER_ACTION[numberAction]){
    parts.push(`数秘術のパーソナルデー${personalDay}は、この独自ルールでは「${NUMBER_ACTION[numberAction]}」の手掛かりとして読みます。`);
    basis.push(`数秘術: ${personalDay} / ${numberAction}`);
  }
  const hexagram=str(iching.hexagramName);
  const posture=str(iching.primaryPosture);
  if(hexagram&&posture&&POSTURE[posture]){
    parts.push(`易の「${hexagram}」からは「${POSTURE[posture]}」という姿勢を参照します。`);
    basis.push(`易: ${hexagram} / ${posture}`);
  }
  const tarotName=str(tarot.cardName);
  const mood=str(tarot.mood);
  if(tarotName&&mood&&MOOD[mood]){
    parts.push(`タロットの「${tarotName}」は「${MOOD[mood]}」という視点を加えます。`);
    basis.push(`タロット: ${tarotName} / ${mood}`);
  }
  const astroCategory=category(astrology.primaryCategory);
  if(astroCategory){
    parts.push(`西洋占星術の計算上の主題は「${LABELS[astroCategory]}」です。出生時刻と出生地が不明な近似計算として扱います。`);
    basis.push(`西洋占星術: ${LABELS[astroCategory]}`);
  }
  const direction=str(nineStar.directionModifier);
  if(direction&&DIR[direction]){
    basis.push(`九星気学: ${DIR[direction]}（独自方位シグナル）`);
  }
  const rokuyoName=str(rokuyo.rokuyoName);
  const tempo=str(rokuyo.tempoModifier);
  if(rokuyoName) basis.push(`六曜: ${rokuyoName}`);
  const tempoAdvice=tempo&&TEMPO[tempo]?` 六曜のテンポ補正では「${TEMPO[tempo]}」を参考にできます。`:'';

  return {
    title:entry.title,
    reading:parts.join(' '),
    suggestion:`「${LABELS[primary]}」を意識して、${entry.suggestions[primary]}。${tempoAdvice}`,
    basis:basis.join('｜'),
    disclaimer:'伝統的占術体系を元にした独自の解釈で、科学的な未来予測ではありません。健康・投資・法律等の専門的判断を代替しません。',
    calculationVersion:'oracle-rules-v2',
  };
}
