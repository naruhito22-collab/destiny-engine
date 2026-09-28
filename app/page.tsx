export default function Home() {
  return (
    <main className="shell">
      <p className="eyebrow">DESTINY ENGINE</p>
      <h1>今日の一手</h1>
      <p className="lead">6つの占術を、ひとつの行動へ。</p>
      <section className="card">
        <p className="muted">MVP SETUP</p>
        <h2>まだ今日の運命は演算されていません。</h2>
        <button disabled>運命を演算する</button>
      </section>
    </main>
  );
}
