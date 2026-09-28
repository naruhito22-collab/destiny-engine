import DestinyClient from './destiny-client';

export default function Home(){
  return (
    <main className="shell">
      <p className="eyebrow">DESTINY ENGINE</p>
      <h1>今日の一手</h1>
      <p className="lead">6つの占術を、ひとつの行動へ。</p>
      <DestinyClient />
    </main>
  );
}
