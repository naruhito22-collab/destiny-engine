import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '6つの占術について｜DESTINY ENGINE',
  description: 'DESTINY ENGINEが使う6占術と、ACTION・ORACLEへの反映方法をご案内します。',
};

const methods = [
  {number:'01',name:'西洋占星術',english:'ASTROLOGY',role:'CORE',description:'生年月日から求める天体配置と、対象日の天体の動きを照合し、行動テーマを数値化します。',note:'出生時刻・出生地は入力しません。出生時刻が不明なため出生時の月に関わるアスペクトは除外し、時刻依存の要素は判断材料にしません。'},
  {number:'02',name:'数秘術',english:'NUMEROLOGY',role:'CORE',description:'生年月日と対象日からパーソナルイヤー・マンス・デイを計算し、その日の行動傾向を導きます。'},
  {number:'03',name:'易',english:'I CHING',role:'CORE',description:'日付とユーザーごとの固定シードを使って卦を決定し、進め方や慎重さを行動テーマに反映します。'},
  {number:'04',name:'タロット',english:'TAROT',role:'CORE',description:'固定シードによるカードの抽出結果から、行動テーマ・気分・注意点を読み取ります。'},
  {number:'05',name:'九星気学',english:'NINE STAR KI',role:'補正',description:'本命星や日盤を計算し、方向に関する補助的な条件をACTIONへ加えます。'},
  {number:'06',name:'六曜',english:'ROKUYO',role:'補正',description:'旧暦の日付から六曜を求め、行動の時間帯やペースに関する補助条件を加えます。'},
];

export default function AboutPage(){
  return <main className="shell about-shell">
    <p className="eyebrow">DESTINY ENGINE / ABOUT</p>
    <h1>6つの占術で、<br/>今日の一手を。</h1>
    <p className="lead">異なる6つの占術を組み合わせ、今日の行動のヒントを導き出します。</p>
    <section className="card stack">
      <h2>6占術の役割</h2>
      <p>西洋占星術・数秘術・易・タロットの4占術を<strong>CORE（中核）</strong>として統合します。九星気学と六曜は、行動の方向や時間に関する<strong>補正</strong>に使います。</p>
      <p className="meta">4つのCOREは現在、同じ重みでスコアを合算しています。6占術すべてを同じ重みで合算しているわけではありません。</p>
    </section>
    <div className="about-methods">
      {methods.map(method=><section className="card about-method" key={method.number}>
        <div className="about-method-top"><span className="about-number">{method.number}</span><span className="about-role">{method.role}</span></div>
        <p className="eyebrow">{method.english}</p>
        <h2>{method.name}</h2>
        <p>{method.description}</p>
        {method.note&&<p className="meta">{method.note}</p>}
      </section>)}
    </div>
    <section className="card stack">
      <h2>結果はどう使われる？</h2>
      <p><strong>ACTION｜運命行動</strong> — 4つのCOREからその日の中心テーマを決め、九星気学・六曜の補正とともに、AIが実行可能な行動を文章にします。</p>
      <p><strong>ORACLE｜テーマ別占い</strong> — 同じ日の占術計算結果を使い、恋愛・仕事・お金など7テーマの観点から読み解きます。</p>
      <p className="meta">同じ日・同じ計算バージョンの結果は保存・再利用されます。AIによる文章生成と占術計算値は異なるものです。</p>
    </section>
    <section className="card stack">
      <h2>ご利用にあたって</h2>
      <p>占いは未来を科学的に予測・保証するものではありません。結果は内省や行動のきっかけとしてお使いください。健康・投資・法律などの専門的判断の代わりにはなりません。</p>
      <p className="meta">出生時刻は収集しません。出生時刻不明の占星術は近似を含みます。</p>
    </section>
    <a className="about-back" href="/">← アプリに戻る</a>
  </main>;
}
