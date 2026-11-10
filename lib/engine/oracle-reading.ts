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

  const contexts:Record<OracleTheme,{focus:string;question:string;approach:string;boundary:string}>={
    general:{focus:'一日の流れと優先順位',question:'今日、何を優先すると気持ちよく過ごせるか',approach:'予定を広げすぎず、最も大切なことを一つ選ぶ',boundary:'一つの兆しだけで一日全体を決めつけない'},
    love:{focus:'親密さ・気持ちの伝達・相互理解',question:'相手の気持ちを決めつけずに距離を縮めるにはどうするか',approach:'相手の意向を確かめ、押しつけずに気持ちを伝える',boundary:'相手の本心や恋愛の成否は占術から断定できない'},
    work:{focus:'仕事の判断・段取り・関係者との合意',question:'仕事でいま判断すべきことと、確認が必要なことは何か',approach:'保留中の判断材料を整理し、関係者との認識を合わせる',boundary:'契約や人事など重大な判断は現実の情報で行う'},
    money:{focus:'支出・予算・金銭的な優先順位',question:'支出を決める前に何を比較・確認すべきか',approach:'費用と必要性を照らし合わせ、保留中の支出を見直す',boundary:'値上がりや収益を予測するものではなく、投資判断には使わない'},
    relationships:{focus:'周囲との協力・対話・境界線',question:'誤解を減らし、相手と無理なく協力するにはどうするか',approach:'相手の希望を聞き、自分の都合も明確に伝える',boundary:'他人の意図や行動を決めつけない'},
    health:{focus:'休息・生活リズム・心身の負担',question:'今日の負担を軽くするために見直せることは何か',approach:'睡眠・休憩・活動量を無理なく整える',boundary:'病気の有無や体調の未来は占えず、症状の判断は専門家に相談する'},
    creation:{focus:'着想・試作・表現の選択',question:'発想を実際の作品に近づけるには何を試せるか',approach:'素材や発想を一つ選び、小さな試作に落とす',boundary:'作品の評価や成功を保証するものではない'},
  };
  const ctx=contexts[theme];
  const postureText=posture&&POSTURE[posture]?POSTURE[posture]:null;
  const numberText=numberAction&&NUMBER_ACTION[numberAction]?NUMBER_ACTION[numberAction]:null;
  const moodText=mood&&MOOD[mood]?MOOD[mood]:null;
  const lead:Record<OracleTheme,string>={
    general:'今日全体の流れを見ると',love:'恋愛や親密な関係では',work:'仕事の進め方では',
    money:'金銭面では',relationships:'対人関係では',health:'心身のセルフケアでは',creation:'創作活動では',
  };
  const themeInterpretations:Record<OracleTheme,string>={
    general:`「${LABELS[primary]}」を軸に、一日の優先順位を考える読みです。`,
    love:`「${LABELS[primary]}」は、相手との関係にどう向き合うかを考える手掛かりです。気持ちを伝える前に相互理解を意識します。`,
    work:`「${LABELS[primary]}」は、仕事の意思決定や段取りを見直す手掛かりです。成果を急ぐより判断材料を確かめる視点が中心です。`,
    money:`「${LABELS[primary]}」は、収入の予言ではなく支出や予算の扱い方を考える手掛かりです。`,
    relationships:`「${LABELS[primary]}」は、相手との距離感や協力の仕方を考える手掛かりです。`,
    health:`「${LABELS[primary]}」は、体調の予言ではなく、今日の休息や生活リズムを整える視点として読みます。`,
    creation:`「${LABELS[primary]}」は、発想をどのように形にするかという創作上の手掛かりです。`,
  };
  const reading=[
    `${lead[theme]}、焦点は「${ctx.focus}」です。`,
    themeInterpretations[theme],
    postureText?`易の姿勢「${postureText}」をこの領域に当てはめるなら、${ctx.approach}ことが考えられます。`:`この領域では、${ctx.approach}ことが考えられます。`,
    numberText?`数秘術の「${numberText}」は、${ctx.question}という問いを考える補助線になります。`:`考える問いは「${ctx.question}」です。`,
    moodText?`タロットの「${moodText}」という視点も、行動の強弱を調整する参考になります。`:'',
    `ただし、${ctx.boundary}。`,
  ].filter(Boolean).join(' ');

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
    calculationVersion:'oracle-rules-v3',
  };
}
