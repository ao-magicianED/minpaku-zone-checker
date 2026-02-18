# 民泊用途地域チェッカー

住所を入力するだけで、用途地域の確認導線と民泊営業可否の参考情報を表示する Web アプリケーション。

## 機能

- 住所ジオコーディング（Nominatim）
- 地図表示（Leaflet）
- 用途地域ごとの民泊可否ガイド表示
- 自治体条例データ表示（最終確認日つき）
- 会員ログイン連携（外部会員基盤JWT）
- 利用回数制限（Supabase 永続カウンタ）

## 技術スタック

- Next.js 16 (App Router, TypeScript)
- React 19
- Leaflet / react-leaflet
- jose (JWT)
- Supabase (usage counter 永続化)

## セットアップ

```bash
npm install
npm run dev
```

## 環境変数

- `JWT_SECRET` (必須)
- `AOSALON_API_URL` (任意: デフォルト `https://aosalonai.com`)
- `EXTERNAL_SERVICE_API_KEY` (必須: 会員検証APIキー)
- `SUPABASE_URL` または `NEXT_PUBLIC_SUPABASE_URL` (必須)
- `SUPABASE_SERVICE_ROLE_KEY` (必須)
- `USAGE_HASH_SALT` (本番必須)

## 主要スクリプト

- `npm run build`
- `npm run lint`
- `npm run check:urls`  
  自治体 `guidelineUrl` の到達性を確認。失敗時は `REVIEW_MEMO_*.md` に自動追記。
- `npm run test`  
  URL健全性チェックの no-write 実行。

## 自治体データ更新手順

対象ファイル: `src/lib/municipality-data.ts`

1. 該当自治体の `guidelineUrl` / `submissionTo` / `contact` / `notes` を更新。
2. `MUNICIPALITY_DATA_LAST_VERIFIED_AT` を更新日（`YYYY-MM-DD`）へ変更。
3. `lastCheckedBy` を更新者識別子へ変更。
4. `npm run check:urls` を実行し、リンク疎通を確認。
5. `check` ページと `guide` ページで最終確認日表示が一致することを確認。

## データ運用担当

- データオーナー: `あおサロンAI 運営`
- 更新責任: `lastCheckedBy` に記録

## Supabase マイグレーション

利用回数カウンタ用 SQL:

- `supabase/migrations/20260218_usage_counters.sql`

この SQL で `usage_counters` テーブルと `consume_usage` RPC を作成します。

## ライセンス

MIT
