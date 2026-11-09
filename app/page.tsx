import DestinyClient from './destiny-client';

export default function Home(){
  return (
    <main className="shell">
      <p className="eyebrow">DESTINY ENGINE</p>
      <h1>今日の一手</h1>
      <p className="lead">6つの占術を、ひとつの行動へ。</p>
      <a className="about-link" href="/about" target="_blank" rel="noopener noreferrer">6つの占術について ↗ <span>別ウインドウで開く</span></a>
      <DestinyClient />
    </main>
  );
}
