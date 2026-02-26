import Link from 'next/link';
import type { Metadata } from 'next';
import { getRegisteredPrefectures, findMunicipalitiesByPrefecture, MUNICIPALITY_DATA_LAST_VERIFIED_AT } from '@/lib/municipality-data';
import styles from '../area.module.css';

interface PrefecturePageProps {
  params: Promise<{ prefecture: string }>;
}

export async function generateStaticParams() {
  const prefectures = getRegisteredPrefectures();
  return prefectures.map((p) => ({ prefecture: p }));
}

export async function generateMetadata({ params }: PrefecturePageProps): Promise<Metadata> {
  const { prefecture } = await params;
  const decoded = decodeURIComponent(prefecture);
  const municipalities = findMunicipalitiesByPrefecture(decoded);
  const withRestriction = municipalities.filter((m) => m.hasAreaRestriction).length;

  return {
    title: `【2026年最新】${decoded}の民泊条例・規制一覧 | ${municipalities.length}自治体の比較`,
    description: `${decoded}の${municipalities.length}自治体の民泊条例を徹底比較。営業日数制限、区域制限、届出先を一覧で確認。${withRestriction}自治体に区域制限あり。`,
    keywords: [
      `${decoded} 民泊`, `${decoded} 民泊 条例`, `${decoded} 民泊 規制`,
      `${decoded} 住宅宿泊事業法`, '民泊 上乗せ条例', '民泊 比較',
    ],
    alternates: {
      canonical: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decoded)}`,
    },
    openGraph: {
      title: `${decoded}の民泊条例一覧【2026年最新】`,
      description: `${decoded}の${municipalities.length}自治体の民泊条例を比較。営業日数・区域制限・届出先を一覧で確認できます。`,
      type: 'article',
      locale: 'ja_JP',
    },
  };
}

export default async function PrefecturePage({ params }: PrefecturePageProps) {
  const { prefecture } = await params;
  const decoded = decodeURIComponent(prefecture);
  const municipalities = findMunicipalitiesByPrefecture(decoded);

  // 統計情報
  const totalCount = municipalities.length;
  const withRestriction = municipalities.filter((m) => m.hasAreaRestriction).length;
  const withoutRestriction = totalCount - withRestriction;
  const minDays = municipalities.length > 0 ? Math.min(...municipalities.map((m) => m.maxDays)) : 0;
  const maxDays = municipalities.length > 0 ? Math.max(...municipalities.map((m) => m.maxDays)) : 0;
  const hasStricterThanLaw = municipalities.some((m) => m.maxDays < 180);

  // JSON-LD: ItemList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${decoded}の民泊条例一覧`,
    description: `${decoded}の${totalCount}自治体の民泊条例・規制情報`,
    numberOfItems: totalCount,
    itemListElement: municipalities.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${m.city}（${m.prefecture}）の民泊条例`,
      url: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(m.prefecture)}/${encodeURIComponent(m.city)}`,
    })),
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://minpaku-checker.aosalonai.com' },
      { '@type': 'ListItem', position: 2, name: 'エリア一覧', item: 'https://minpaku-checker.aosalonai.com/area' },
      { '@type': 'ListItem', position: 3, name: decoded, item: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decoded)}` },
    ],
  };

  // JSON-LD: FAQPage
  const faqJsonLd = totalCount > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${decoded}で民泊営業はできますか？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${decoded}では住宅宿泊事業法に基づき民泊営業が可能です。ただし、自治体ごとに上乗せ条例が存在します。当サイトでは${totalCount}自治体の条例情報を掲載しています。${withRestriction}自治体で区域制限があります。`,
        },
      },
      {
        '@type': 'Question',
        name: `${decoded}で最も民泊規制が厳しい自治体はどこですか？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${decoded}で登録されている自治体の中で、営業日数が最も少ないのは年間${minDays}日です。${withRestriction}自治体が区域制限を設けています。詳細は各自治体のページをご確認ください。`,
        },
      },
    ],
  } : null;

  return (
    <div className={styles.container}>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* パンくず */}
      <nav className={styles.breadcrumb}>
        <Link href="/">ホーム</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link href="/area">エリア一覧</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span>{decoded}</span>
      </nav>

      <h1 className={styles.pageTitle}>🏛️ {decoded}の民泊条例・規制一覧【2026年最新】</h1>
      <p className={styles.pageSubtitle}>
        {decoded}で民泊を検討中の方へ。当サイトに登録されている <strong>{totalCount}</strong> 自治体の条例情報を比較できます。
        各自治体をクリックすると、営業日数制限・区域制限・届出先・開業ステップなどの詳細を確認できます。
        <br />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          最終更新日: {MUNICIPALITY_DATA_LAST_VERIFIED_AT}
        </span>
      </p>

      {/* ──────────────── 統計サマリ ──────────────── */}
      {totalCount > 0 && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>🏛️</span>
            <div>
              <div className={styles.statValue}>{totalCount}</div>
              <div className={styles.statLabel}>登録自治体数</div>
            </div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⚠️</span>
            <div>
              <div className={styles.statValue}>{withRestriction}</div>
              <div className={styles.statLabel}>区域制限あり</div>
            </div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✅</span>
            <div>
              <div className={styles.statValue}>{withoutRestriction}</div>
              <div className={styles.statLabel}>区域制限なし</div>
            </div>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📅</span>
            <div>
              <div className={styles.statValue}>{minDays === maxDays ? `${minDays}` : `${minDays}〜${maxDays}`}</div>
              <div className={styles.statLabel}>営業日数幅（日/年）</div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── 解説テキスト ──────────────── */}
      {totalCount > 0 && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>📖 {decoded}の民泊規制の特徴</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '12px' }}>
              {decoded}には当サイトに{totalCount}の自治体が登録されています。
              営業日数は{minDays === maxDays
                ? `いずれも年間${minDays}日`
                : `最も厳しい自治体で年間${minDays}日、最も緩い自治体で年間${maxDays}日`
              }となっています。
            </p>
            <p style={{ marginBottom: '12px' }}>
              区域制限については、{withRestriction}自治体が独自の制限を設けており、
              {withRestriction > 0
                ? '「住居専用地域での営業制限」「特定区域での曜日制限」など、自治体ごとに内容が異なります。'
                : '比較的営業しやすい環境といえます。'}
            </p>
            {hasStricterThanLaw && (
              <p style={{ padding: '12px', background: 'rgba(255, 193, 7, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.15)', fontSize: '13px' }}>
                ⚠️ {decoded}には、住宅宿泊事業法の法定上限（年間180日）よりも厳しい制限を設けている自治体があります。
                物件を契約する前に、必ず該当自治体の条例を確認してください。
              </p>
            )}
          </div>
        </section>
      )}

      {/* ──────────────── 比較テーブル ──────────────── */}
      {totalCount > 0 && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>📊 {decoded}の自治体別 条例比較表</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.detailTable}>
              <thead>
                <tr>
                  <th>自治体名</th>
                  <th>営業日数</th>
                  <th>区域制限</th>
                  <th>届出先</th>
                </tr>
              </thead>
              <tbody>
                {municipalities.map((m) => (
                  <tr key={m.city}>
                    <td>
                      <Link
                        href={`/area/${encodeURIComponent(m.prefecture)}/${encodeURIComponent(m.city)}`}
                        style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {m.city}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: m.maxDays < 180 ? '#f0ad4e' : 'var(--text-primary)' }}>
                        {m.maxDays}日
                      </span>
                      {m.maxDays < 180 && <span style={{ fontSize: '11px', color: '#f0ad4e', marginLeft: '4px' }}>▼</span>}
                    </td>
                    <td>
                      {m.hasAreaRestriction ? (
                        <span style={{ color: '#f0ad4e', fontSize: '13px' }}>⚠️ あり</span>
                      ) : (
                        <span style={{ color: '#4caf50', fontSize: '13px' }}>✅ なし</span>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {m.submissionTo.length > 20 ? m.submissionTo.substring(0, 20) + '…' : m.submissionTo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ──────────────── カード一覧 ──────────────── */}
      {municipalities.length === 0 ? (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ marginBottom: '16px' }}>この都道府県のデータはまだ登録されていません。</p>
          <Link href="/check" className="btn btn-primary">
            住所チェッカーで直接調べる →
          </Link>
        </div>
      ) : (
        <>
          <h2 className={styles.detailSectionTitle} style={{ marginTop: '8px' }}>🏘️ 各自治体の詳細ページ</h2>
          <div className={styles.cardGrid}>
            {municipalities.map((m) => (
              <Link
                key={m.city}
                href={`/area/${encodeURIComponent(m.prefecture)}/${encodeURIComponent(m.city)}`}
                className={styles.areaCard}
              >
                <div className={styles.areaCardTitle}>{m.city}</div>
                <div className={styles.areaCardMeta}>
                  <span className={styles.areaCardBadge}>
                    📅 年間 {m.maxDays}日
                  </span>
                  {m.hasAreaRestriction && (
                    <span className={`${styles.areaCardBadge} ${styles.areaCardBadgeWarning}`}>
                      ⚠️ 区域制限あり
                    </span>
                  )}
                </div>
                <div className={styles.areaCardNote}>
                  {m.notes}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ──────────────── FAQ ──────────────── */}
      {totalCount > 0 && (
        <section className={`glass-card ${styles.detailSection}`} style={{ marginTop: '32px' }}>
          <h2 className={styles.detailSectionTitle}>❓ {decoded}の民泊に関するよくある質問</h2>
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                {decoded}で民泊営業はできますか？
              </summary>
              <div className={styles.faqAnswer}>
                はい、住宅宿泊事業法（民泊新法）に基づき{decoded}でも民泊営業は可能です。
                ただし、自治体ごとに上乗せ条例が存在し、営業日数の制限や区域制限が設けられています。
                {decoded}では{withRestriction}自治体が区域制限を設けています。
                物件の所在地の自治体の条例を事前に確認してから、物件の契約を進めることを強くおすすめします。
              </div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                {decoded}で最も民泊がしやすい自治体はどこですか？
              </summary>
              <div className={styles.faqAnswer}>
                一概には言えませんが、区域制限がなく営業日数上限が法定の180日である自治体が比較的営業しやすいと言えます。
                ただし、観光需要や物件の取得コストなど、営業日数以外の要素も民泊の収益性に大きく影響します。
                各自治体の詳細ページで条例内容と特記事項を確認してください。
              </div>
            </details>
          </div>
        </section>
      )}

      {/* ──────────────── CTA ──────────────── */}
      <div className={styles.ctaBox}>
        <h2 className={styles.ctaTitle}>🔍 {decoded}の物件を住所でチェック</h2>
        <p className={styles.ctaDescription}>
          物件の住所を入力するだけで、用途地域と民泊可否を自動判定。<br />
          {decoded}の条例情報も合わせて表示します。
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/check" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '16px', fontWeight: 'bold' }}>
            住所チェッカーを使う →
          </Link>
        </div>
      </div>

      {/* ──────────────── 免責事項 ──────────────── */}
      <div className={styles.disclaimer}>
        ⚠️ 掲載情報は{MUNICIPALITY_DATA_LAST_VERIFIED_AT}時点の各自治体公開情報に基づいていますが、条例の改正等により最新の内容と異なる場合があります。
        正確な規制内容は必ず各自治体の窓口にご確認ください。
      </div>
    </div>
  );
}
