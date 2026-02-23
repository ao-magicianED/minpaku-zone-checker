import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '住所チェック | 住所を入力して民泊営業の可否を無料で即判定',
  description:
    '住所を入力するだけで用途地域を自動判定し、民泊営業（住宅宿泊事業法・旅館業法）の可否を即座に確認。容積率・建蔽率も表示。全国の住所に対応した無料ツール。',
  alternates: {
    canonical: 'https://minpaku-checker.aosalonai.com/check',
  },
  openGraph: {
    title: '住所チェック | 住所入力で民泊可否を無料で即判定',
    description: '住所を入力するだけで用途地域を自動判定し、民泊営業の可否を即座に確認。全国対応の無料ツール。',
    url: 'https://minpaku-checker.aosalonai.com/check',
  },
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
