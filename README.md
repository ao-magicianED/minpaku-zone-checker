# 民泊用途地域チェッカー

住所を入力するだけで、用途地域を判定し民泊営業の可否を即座に表示するWebアプリケーション。

## 機能

- 🔍 **住所検索**: 日本の住所を入力してジオコーディング
- 🗺️ **地図表示**: Leafletによるインタラクティブな地図表示
- 📋 **用途地域判定**: 13種類の用途地域別に民泊可否を色分け表示
- 🏛️ **自治体条例**: 主要自治体の民泊条例情報を自動表示
- 📱 **レスポンシブ**: PC・タブレット・スマホ対応

## 技術スタック

- **Next.js 15** (App Router, TypeScript)
- **Leaflet** (地図表示)
- **Nominatim API** (ジオコーディング)
- **Supabase** (認証・DB — 将来実装)

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

## ディレクトリ構成

```
src/
├── app/
│   ├── api/
│   │   ├── check/route.ts    # 住所判定API
│   │   └── geocode/route.ts  # ジオコーディングAPI
│   ├── check/                # 住所検索ページ
│   ├── guide/                # 用途地域ガイド
│   ├── globals.css           # グローバルスタイル
│   ├── layout.tsx            # レイアウト
│   └── page.tsx              # ランディングページ
├── components/
│   └── MapView.tsx           # 地図コンポーネント
└── lib/
    ├── geocoding.ts          # ジオコーディング
    ├── municipality-data.ts  # 自治体データ
    └── zoning-data.ts        # 用途地域データ
```

## ライセンス

MIT

## 提供

[あおサロンAI](https://aosalonai.com/)
