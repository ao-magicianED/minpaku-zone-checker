import Link from 'next/link';
import type { Metadata } from 'next';
import { getRegisteredPrefectures, findMunicipalitiesByPrefecture } from '@/lib/municipality-data';
import styles from './area.module.css';

export const metadata: Metadata = {
  title: '民泊条例データベース | 全国の自治体別民泊規制一覧【2026年最新】',
  description:
    '全国80以上の自治体の民泊条例・規制情報を網羅。都道府県別に営業日数制限、区域制限、届出先などの情報をわかりやすくまとめています。',
  alternates: {
    canonical: 'https://minpaku-checker.aosalonai.com/area',
  },
};

/** 地方ブロックの定義 */
const REGION_BLOCKS = [
  { name: '北海道・東北', prefectures: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', prefectures: ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県'] },
  { name: '中部', prefectures: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', prefectures: ['京都府', '大阪府', '兵庫県', '奈良県', '三重県', '滋賀県', '和歌山県'] },
  { name: '中国・四国', prefectures: ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州・沖縄', prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
];

export default function AreaIndexPage() {
  const registeredPrefectures = getRegisteredPrefectures();

  return (
    <div className={styles.container}>
      {/* パンくず */}
      <nav className={styles.breadcrumb}>
        <Link href="/">ホーム</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span>エリア一覧</span>
      </nav>

      <h1 className={styles.pageTitle}>📍 全国の民泊条例データベース</h1>
      <p className={styles.pageSubtitle}>
        全国80以上の自治体の民泊条例・規制情報を網羅しています。<br />
        都道府県を選択すると、各自治体の営業日数制限・区域制限・届出先などの詳細を確認できます。
      </p>

      {REGION_BLOCKS.map((region) => {
        const availablePrefectures = region.prefectures.filter((p) =>
          registeredPrefectures.includes(p)
        );
        if (availablePrefectures.length === 0) return null;

        return (
          <section key={region.name} className={styles.regionBlock}>
            <h2 className={styles.regionTitle}>{region.name}</h2>
            <div className={styles.cardGrid}>
              {availablePrefectures.map((pref) => {
                const municipalities = findMunicipalitiesByPrefecture(pref);
                return (
                  <Link
                    key={pref}
                    href={`/area/${encodeURIComponent(pref)}`}
                    className={styles.areaCard}
                  >
                    <div className={styles.areaCardTitle}>{pref}</div>
                    <div className={styles.areaCardCount}>
                      🏛️ {municipalities.length} 自治体の情報あり
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <div className={styles.ctaBox}>
        <h2 className={styles.ctaTitle}>🔍 住所を入力して今すぐチェック</h2>
        <p className={styles.ctaDescription}>
          物件の住所を入力するだけで、用途地域と民泊可否を自動判定します。
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/check" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 'bold' }}>
            住所チェッカーを使う →
          </Link>
        </div>
      </div>

      {/* 免責事項 */}
      <div className={styles.disclaimer}>
        ⚠️ 掲載情報は各自治体の公開情報に基づいていますが、条例の改正等により最新の内容と異なる場合があります。
        正確な規制内容は必ず各自治体の窓口にご確認ください。
      </div>
    </div>
  );
}
