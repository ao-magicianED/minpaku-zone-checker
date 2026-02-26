import type { Metadata } from "next";
import NavAuth from "@/components/NavAuth";
import Link from "next/link";
import "./globals.css";

const SITE_URL = 'https://minpaku-checker.aosalonai.com';
const SITE_NAME = '民泊用途地域チェッカー';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '民泊用途地域チェッカー | 住所入力で民泊可否を即判定【2026年最新】',
    template: '%s | 民泊用途地域チェッカー',
  },
  description:
    '住所を入力するだけで用途地域を自動判定し、民泊営業（住宅宿泊事業法・旅館業法）の可否を即座に表示。全国対応の無料Webツール。あおサロンAI提供。',
  keywords: [
    '民泊', '用途地域', 'チェッカー', '民泊可否', '住宅宿泊事業法', '旅館業法',
    '用途地域チェック', '民泊営業', '不動産', '民泊物件', '上乗せ条例',
    '民泊規制', '簡易宿所', '民泊判定', '用途地域判定', '民泊開業',
  ],
  authors: [{ name: 'あおサロンAI', url: 'https://aosalonai.com' }],
  creator: 'あおサロンAI',
  publisher: 'あおサロンAI',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: '民泊用途地域チェッカー | 住所入力で民泊可否を即判定',
    description: '住所を入力するだけで用途地域を自動判定し、民泊営業の可否を即座に表示。全国対応の無料Webツール。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '民泊用途地域チェッカー - 住所入力で民泊可否を即判定',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '民泊用途地域チェッカー | 住所入力で民泊可否を即判定',
    description: '住所を入力するだけで用途地域を自動判定し、民泊営業の可否を即座に表示。全国対応の無料Webツール。',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '_LrK0HNfGGTuayY4OIViBd4qtLzNnUvdfMp4xAZTe8Q',
  },
  category: '不動産・民泊',
};

// JSON-LD 構造化データ
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: '住所を入力するだけで用途地域を自動判定し、民泊営業の可否を即座に表示する無料Webツール。',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
  author: {
    '@type': 'Organization',
    name: 'あおサロンAI',
    url: 'https://aosalonai.com',
  },
  aggregateRating: undefined, // 将来のレビュー用
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '民泊用途地域チェッカーとは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '住所を入力するだけで、その場所の用途地域を自動判定し、民泊営業（住宅宿泊事業法・旅館業法）の可否を即座に表示する無料のWebツールです。国土交通省の不動産情報ライブラリAPIを利用しています。',
      },
    },
    {
      '@type': 'Question',
      name: '用途地域とは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '用途地域とは、都市計画法に基づいて定められた13種類の地域区分です。住居、商業、工業など、その地域で建てられる建物の用途が制限されます。民泊の可否もこの用途地域によって大きく左右されます。',
      },
    },
    {
      '@type': 'Question',
      name: '民泊営業が可能な用途地域はどれですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '住宅宿泊事業法（民泊新法）に基づく届出制であれば、工業専用地域を除くすべての用途地域で原則として営業可能です。ただし、各自治体の上乗せ条例により、営業可能区域や日数がさらに制限されている場合があります。',
      },
    },
    {
      '@type': 'Question',
      name: '上乗せ条例とは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '上乗せ条例とは、住宅宿泊事業法で認められた年間180日の営業日数に対して、各自治体が独自にさらに厳しい制限を設ける条例のことです。例えば、平日の営業禁止や特定区域での営業制限などがあります。',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        {/* JSON-LD 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        {/* ナビゲーション */}
        <nav className="nav">
          <div className="container nav-inner">
            <Link href="/" className="nav-logo">
              🏠 <span>民泊用途地域チェッカー</span>
            </Link>
            <ul className="nav-links">
              <li><Link href="/">ホーム</Link></li>
              <li><Link href="/check">住所チェック</Link></li>
              <li><Link href="/area">エリア一覧</Link></li>
              <li><Link href="/guide">用途地域ガイド</Link></li>
              <NavAuth />
              <li>
                <Link href="/check" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                  今すぐチェック →
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main style={{ paddingTop: '72px' }}>
          {children}
        </main>

        {/* フッター */}
        <footer className="footer" style={{
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
