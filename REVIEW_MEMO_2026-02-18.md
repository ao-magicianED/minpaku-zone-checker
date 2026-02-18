# レビューメモ（数値・表記ゆれ）

## 反映済み
- `/api/check` の文言「最大無制限」を「無制限」に統一。
- 用途地域データ（第二種中高層住居専用地域）の説明に「年間180日以内」を追記。
- 京都市データの「約60日」を「60日」に統一。
- `municipality-data.ts` の `contact` を全件 `部署名（TEL: ...）` 形式に統一。
- `municipality-data.ts` に `MUNICIPALITY_DATA_LAST_VERIFIED_AT = '2026-02-18'` を追加。
- `/api/check` レスポンスに `dataMeta.municipalityLastVerifiedAt` を追加。
- `check` / `guide` ページに「データ最終確認日」の表示を追加。
- `guidelineUrl` を公式自治体ドメインの民泊関連ページへ更新（新宿、渋谷、港、大田、大阪、京都、札幌、福岡、那覇、横浜）。
- `auth.ts` で `JWT_SECRET` 未設定時に起動エラー化し、JWT claim の必須検証を追加。
- `isActiveMember` から `past_due` を除外し、`active/trialing` のみ有効会員扱いに変更。
- `api/auth/login` に `EXTERNAL_SERVICE_API_KEY` 設定ガードと 6 秒タイムアウトを追加。
- `geocoding.ts` を結果型（`ok`/`reason`）に変更し、`not_found` と `upstream_error` を分離。
- `/api/check` に `errorCode` を追加し、`GEOCODE_UPSTREAM` を 502 で返すように変更。
- `/api/check` の `geocode` に `source` / `retryCount` を追加。
- 利用回数管理を Cookie ベースから Supabase 永続カウンタ（`usage_counters` + `consume_usage` RPC）へ移行。
- `municipality-data.ts` に `owner` / `lastCheckedBy` を追加し、福岡市の届出先・問い合わせ先の主体を統一。
- URL 健全性チェック用スクリプト `scripts/check-municipality-urls.mjs` を追加（失敗時に REVIEW_MEMO へ追記）。
- `README.md` を最新構成・運用手順（最終確認日更新手順、データ更新担当）に更新。

## 要確認（事実確認が必要）
- なし（2026-02-18 時点）
