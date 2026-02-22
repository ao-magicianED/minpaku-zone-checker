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
            <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
              用途地域上は営業可能でも、全国の自治体ごとに<strong>「平日営業禁止」「特定区域での制限」</strong>などの<br className="desktop-only" />
              複雑な上乗せ条例が存在し、それに気づかず物件を契約してしまうケースが多発しています。<br />
              <br />
              <strong>「民泊物件判別GPT」</strong>を使えば、保健所に毎回確認する手間を省き、<br className="desktop-only" />
              該当地域の上乗せ条例の自動調査や、公式ページリンクの直接提示までをAIが瞬時に実行します！
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <a href="https://note.com/ao_salon_ai/n/n888ddb49b460" target="_blank" rel="noopener noreferrer"
                className="btn btn-primary btn-large" style={{ width: '100%', maxWidth: '500px', fontSize: '16px', fontWeight: 'bold', padding: '16px', background: 'linear-gradient(135deg, #1cb5e0 0%, #000851 100%)', border: 'none', boxShadow: '0 4px 15px rgba(28, 181, 224, 0.4)' }}>
                📝 Noteで利用方法・購入ガイドを見る →
              </a>
              <a href="https://chatgpt.com/g/g-minpaku" target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                🤖 購入済みの方はこちら（GPTsを起動する）
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
