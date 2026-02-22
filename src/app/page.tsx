import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* ヒーローセクション */}
      <section className={styles.hero}>
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.heroContent}>
            <div className={`${styles.heroBadge} animate-fadeInUp`}>
              🚀 AI × 不動産テック — あおサロンAI提供
            </div>
            <h1 className={`${styles.heroTitle} animate-fadeInUp animate-delay-1`}>
              住所を入力するだけで
              <br />
              <span className={styles.heroGradient}>民泊の可否</span>
              を即判定
            </h1>
            <p className={`${styles.heroDescription} animate-fadeInUp animate-delay-2`}>
              物件の用途地域を自動判定し、民泊営業（住宅宿泊事業法・旅館業法）の
              可否を即座に表示。自治体の条例情報もワンストップで確認できます。
            </p>
            <div className={`${styles.heroActions} animate-fadeInUp animate-delay-3`}>
              <a href="/check" className="btn btn-primary btn-large">
                🔍 住所をチェックする
              </a>
              <a href="/guide" className="btn btn-secondary btn-large">
                📖 用途地域ガイド
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            民泊物件検討の<span className={styles.heroGradient}>不安をゼロに</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            従来の複雑な調査プロセスを、AIとオープンデータで劇的に効率化
          </p>
          <div className={styles.featureGrid}>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>📍</div>
              <h3>住所入力だけ</h3>
              <p>
                調べたい物件の住所を入力するだけ。ジオコーディングで自動的に
                位置を特定し、地図上に表示します。
              </p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>🗺️</div>
              <h3>用途地域を即特定</h3>
              <p>
                国土交通省のオープンデータと連携。13種類の用途地域から
                該当する地域を自動的に判定します。
              </p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>✅</div>
              <h3>民泊可否を色分け表示</h3>
              <p>
                住宅宿泊事業法・旅館業法それぞれの営業可否を
                緑（OK）・黄（条件付き）・赤（不可）で直感的に表示。
              </p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>📋</div>
              <h3>自治体条例を自動取得</h3>
              <p>
                該当する自治体の民泊関連条例（営業日数制限・区域制限等）を
                データベースから自動で表示します。
              </p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>💰</div>
              <h3>完全無料で利用可能</h3>
              <p>
                あおサロンAIプレミアム会員は無制限。一般ユーザーも
                月10回まで無料でチェックできます。
              </p>
            </div>
            <div className={`glass-card ${styles.featureCard}`}>
              <div className={styles.featureIcon}>📱</div>
              <h3>スマホ対応</h3>
              <p>
                内見先でもスマホからサッとチェック。レスポンシブデザインで
                どのデバイスでも快適に利用可能。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className={styles.howto}>
        <div className="container">
          <h2 className={styles.sectionTitle}>
            たった<span className={styles.heroGradient}>3ステップ</span>で完了
          </h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>住所を入力</h3>
              <p>検討中の物件住所を入力欄に入力します。</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>自動判定</h3>
              <p>AIが用途地域と民泊条例を自動でチェック。</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>結果確認</h3>
              <p>民泊可否と詳細情報を色分けで確認。</p>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="/check" className="btn btn-primary btn-large">
              🔍 今すぐ住所をチェック
            </a>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className={styles.cta}>
        <div className="container">
          <div className={`glass-card ${styles.ctaCard}`} style={{ padding: '40px 24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              面倒な「自治体ごとの上乗せ条例」の確認、AIに任せませんか？
            </h2>
            <p style={{ marginBottom: '24px', lineHeight: '1.8', textAlign: 'center' }}>
              用途地域上は営業可能でも、全国の自治体ごとに<strong>「平日営業禁止」「特定区域での制限」</strong>などの
              複雑な上乗せ条例が存在し、それに気づかず物件を契約してしまうケースが多発しています。
            </p>

            {/* あおサロンAI（主軸） */}
            <div style={{ background: 'linear-gradient(135deg, rgba(28, 181, 224, 0.15), rgba(0, 8, 81, 0.2))', border: '2px solid rgba(28, 181, 224, 0.4)', borderRadius: '16px', padding: '28px 24px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1cb5e0', marginBottom: '8px', letterSpacing: '0.1em' }}>✨ おすすめ</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                あおサロンAIに入会すると、民泊物件判別GPTを<span style={{ color: '#1cb5e0' }}>無償プレゼント🎁</span>
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                月額 <strong style={{ fontSize: '20px', color: 'var(--text-primary)' }}>4,980円</strong>で、このGPTだけでなく
                <strong>民泊ダッシュボード・プロンプト集・セミナー映像・Discordコミュニティ</strong>まですべて使い放題。<br />
                単体購入（12,000円）より<span style={{ color: '#1cb5e0', fontWeight: 'bold' }}>月額が安い</span>のに、中身は圧倒的にお得です。
              </p>
              <a href="https://aosalonai.com" target="_blank" rel="noopener noreferrer"
                className="btn btn-primary btn-large" style={{ width: '100%', maxWidth: '500px', fontSize: '16px', fontWeight: 'bold', padding: '16px', background: 'linear-gradient(135deg, #1cb5e0 0%, #000851 100%)', border: 'none', boxShadow: '0 4px 15px rgba(28, 181, 224, 0.4)' }}>
                🚀 あおサロンAIを見てみる →
              </a>
            </div>

            {/* コラム記事 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <a href="https://aosalonai.com/columns/tokyo-23ku-minpaku-2026" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px' }}>
                📖 【2026年最新】東京23区 民泊規制完全ガイド →
              </a>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                他のエリアの条例解説コラムも随時配信中
              </p>
            </div>

            {/* Note単体（サブ） */}
            <div style={{ textAlign: 'center', opacity: 0.85 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                民泊物件判別GPTを単体で購入したい方はこちら
              </p>
              <a href="https://note.com/ao_salon_ai/n/n888ddb49b460" target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 24px' }}>
                📝 Noteで単体購入する（12,000円）
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
