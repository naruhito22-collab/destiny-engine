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

  const personalDay=num(numerology.personalDay);
  const numberAction=str(numerology.actionType);
  const hexagram=str(iching.hexagramName);
  const posture=str(iching.primaryPosture);
  const tarotName=str(tarot.cardName);
  const mood=str(tarot.mood);
  const astroCategory=category(astrology.primaryCategory);
  const direction=str(nineStar.directionModifier);
  const rokuyoName=str(rokuyo.rokuyoName);
  const tempo=str(rokuyo.tempoModifier);

  const headline:Record<OracleTheme,Record<Category,string>>={
    general:{exploration:'新しい発見がありそうな日。',connection:'人との会話がヒントになる日。',creation:'アイデアを形にしたい日。',learning:'知ることから運が動く日。',challenge:'小さな挑戦に向く日。',organization:'身の回りを整えたい日。',reflection:'落ち着いて考えたい日。',body:'無理せず自分をいたわる日。',contribution:'人を助けることが充実につながる日。',change:'いつものやり方を変えてみたい日。',decision:'迷いを整理したい日。',chance:'思いがけない機会に目を向けたい日。'},
    love:{exploration:'相手の新しい一面に気づけそう。',connection:'素直な会話が距離を縮める日。',creation:'一緒に楽しむ時間を作りたい日。',learning:'相手をよく知ることが大切な日。',challenge:'気持ちを少し伝えてみたい日。',organization:'連絡や約束を整えたい日。',reflection:'自分の本心を確かめたい日。',body:'無理に恋を進めなくていい日。',contribution:'小さな思いやりが大切な日。',change:'接し方を少し変えてみたい日。',decision:'関係への希望をはっきりさせたい日。',chance:'自然な出会いや会話を大切にしたい日。'},
    work:{exploration:'新しい仕事の進め方を探したい日。',connection:'周囲との連携が鍵になる日。',creation:'アイデアを提案に変えたい日。',learning:'調べてから動くとよい日。',challenge:'難しい仕事に一歩踏み出したい日。',organization:'仕事の優先順位を整えたい日。',reflection:'進め方を見直したい日。',body:'無理のないペースが大切な日。',contribution:'チームを支える行動が生きる日。',change:'仕事のやり方を変えてみたい日。',decision:'保留中の判断に向き合いたい日。',chance:'新しい仕事の機会を確かめたい日。'},
    money:{exploration:'買う前の比較が大切な日。',connection:'お金の話をすり合わせたい日。',creation:'お金をかけずに工夫したい日。',learning:'料金や条件を確かめたい日。',challenge:'固定費の見直しを始めたい日。',organization:'支出を整理したい日。',reflection:'衝動買いを見直したい日。',body:'疲れているときの大きな買い物は慎重に。',contribution:'共同のお金の使い方を確認したい日。',change:'毎月の支払いを見直したい日。',decision:'お金の決断は比較してから。',chance:'お得な代案を探したい日。'},
    relationships:{exploration:'新しい人との会話に目を向けたい日。',connection:'相手の話を聞くことが大切な日。',creation:'誰かと一緒に考えるとよい日。',learning:'相手の立場を知りたい日。',challenge:'必要な相談を切り出したい日。',organization:'連絡や約束を整理したい日。',reflection:'すれ違いを振り返りたい日。',body:'人付き合いで無理をしない日。',contribution:'小さな手助けが生きる日。',change:'伝え方を工夫したい日。',decision:'人との距離感を見直したい日。',chance:'偶然の会話を大切にしたい日。'},
    health:{exploration:'気分転換を試したい日。',connection:'誰かに話すと気持ちが軽くなるかも。',creation:'好きなことを楽しみたい日。',learning:'自分の体調を知ることが大切な日。',challenge:'無理のない運動を始めたい日。',organization:'睡眠と休憩を整えたい日。',reflection:'疲れや気分を振り返りたい日。',body:'休息を優先したい日。',contribution:'自分自身もいたわりたい日。',change:'負担の大きい習慣を変えたい日。',decision:'休む時間を先に確保したい日。',chance:'ひと息つける機会を逃さない日。'},
    creation:{exploration:'未知の表現に出会いたい日。',connection:'誰かとの会話から発想が広がる日。',creation:'ひらめきを形にしたい日。',learning:'新しい技法を吸収したい日。',challenge:'普段と違う表現を試したい日。',organization:'アイデアを整理したい日。',reflection:'作品の核を見つめたい日。',body:'作品から少し離れてみたい日。',contribution:'他者の反応を取り入れたい日。',change:'いつもの表現を変えてみたい日。',decision:'制作の方向を一つ選びたい日。',chance:'偶然の発見を生かしたい日。'},
  };
  const postureHint:Record<string,string>={
    GO:'今日は少し前に進めてみましょう。',WAIT:'急がず、準備を整えるのがよさそうです。',
    CHANGE:'やり方を少し変えるとよさそうです。',KEEP:'今のペースを大切にしましょう。',
    CONNECT:'一人で抱えず、誰かと話してみましょう。',WITHDRAW:'一度距離を置いて考えてみましょう。',
    PREPARE:'まず準備から始めましょう。',OBSERVE:'すぐに決めず、様子を見てみましょう。',
  };
  const reading=[headline[theme][primary],posture&&postureHint[posture]?postureHint[posture]:'まずはできることを一つ選びましょう。'].join(' ');
  const basis:string[]=[`CORE: ${LABELS[primary]}${secondary?` / ${LABELS[secondary]}`:''}`];
  if(personalDay!==null&&numberAction&&NUMBER_ACTION[numberAction])basis.push(`数秘術: ${personalDay} / ${numberAction}`);
  if(hexagram&&posture&&POSTURE[posture])basis.push(`易: ${hexagram} / ${posture}`);
  if(tarotName&&mood&&MOOD[mood])basis.push(`タロット: ${tarotName} / ${mood}`);
  if(astroCategory)basis.push(`西洋占星術: ${LABELS[astroCategory]}（出生時刻・出生地不明の近似）`);
  if(direction&&DIR[direction])basis.push(`九星気学: ${DIR[direction]}（独自方位シグナル）`);
  if(rokuyoName)basis.push(`六曜: ${rokuyoName}`);
  const tempoAdvice=tempo&&TEMPO[tempo]?` 六曜のテンポ補正では「${TEMPO[tempo]}」を参考にできます。`:'';

  return {
    title:entry.title,
    reading,
    suggestion:`${entry.suggestions[primary]}。${tempoAdvice}`,
    basis:basis.join('｜'),
    disclaimer:'伝統的占術体系を元にした独自の解釈で、科学的な未来予測ではありません。健康・投資・法律等の専門的判断を代替しません。',
    calculationVersion:'oracle-rules-v5',
  };
}
