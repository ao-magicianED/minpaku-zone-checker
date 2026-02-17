import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "民泊用途地域チェッカー | 住所入力で民泊可否を即判定",
  description:
    "住所を入力するだけで、用途地域を判定し民泊営業の可否を即座に表示。自治体の最新民泊条例情報も確認できるWebツール。あおサロンAI提供。",
  keywords: ["民泊", "用途地域", "チェッカー", "住宅宿泊事業法", "民泊営業", "用途地域チェック", "不動産"],
  openGraph: {
    title: "民泊用途地域チェッカー",
    description: "住所入力で民泊営業の可否を即座に判定",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* ナビゲーション */}
        <nav className="nav">
          <div className="container nav-inner">
            <a href="/" className="nav-logo">
              🏠 <span>民泊用途地域チェッカー</span>
            </a>
            <ul className="nav-links">
              <li><a href="/">ホーム</a></li>
              <li><a href="/check">住所チェック</a></li>
              <li><a href="/guide">用途地域ガイド</a></li>
              <li>
                <a href="/check" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  今すぐチェック →
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main style={{ paddingTop: '72px' }}>
          {children}
        </main>

        {/* フッター */}
        <footer style={{
          padding: '40px 0',
          borderTop: '1px solid var(--border-color)',
          marginTop: '80px',
        }}>
          <div className="container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                © 2026 民泊用途地域チェッカー — あおサロンAI提供
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                ⚠️ 本ツールの判定結果は参考情報です。最終確認は各自治体にお問い合わせください。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <a href="https://aosalonai.com/" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)' }}>
                あおサロンAI
              </a>
              <a href="https://github.com/ao-magicianED/minpaku-zone-checker" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)' }}>
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
