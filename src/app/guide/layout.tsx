import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用途地域ガイド | 13種類の用途地域と民泊可否を徹底解説【2026年版】',
  description:
    '都市計画法で定められた13種類の用途地域を初心者向けに解説。各用途地域での民泊営業（住宅宿泊事業法・旅館業法）の可否を一覧表で比較。上乗せ条例や注意事項も網羅。',
  alternates: {
    canonical: 'https://minpaku-checker.aosalonai.com/guide',
  },
  openGraph: {
    title: '用途地域ガイド | 13種類の用途地域と民泊可否を徹底解説',
    description: '都市計画法で定められた13種類の用途地域を解説。各用途地域での民泊営業の可否を一覧表で比較。',
    url: 'https://minpaku-checker.aosalonai.com/guide',
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
