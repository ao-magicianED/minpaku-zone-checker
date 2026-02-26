import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllMunicipalities, findMunicipality, findMunicipalitiesByPrefecture, MUNICIPALITY_DATA_LAST_VERIFIED_AT } from '@/lib/municipality-data';
import { getMunicipalityContent } from '@/lib/municipality-content';
import styles from '../../area.module.css';

interface CityPageProps {
  params: Promise<{ prefecture: string; city: string }>;
}

export async function generateStaticParams() {
  const all = getAllMunicipalities();
  return all.map((m) => ({
    prefecture: m.prefecture,
    city: m.city,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { prefecture, city } = await params;
  const decodedPref = decodeURIComponent(prefecture);
  const decodedCity = decodeURIComponent(city);
  const m = findMunicipality(decodedPref, decodedCity);

  const desc = m
    ? `${decodedCity}（${decodedPref}）の民泊条例を徹底解説。年間営業日数は${m.maxDays}日、${m.hasAreaRestriction ? '区域制限あり（' + m.areaRestrictionDetail + '）' : '区域制限なし'}。届出先: ${m.submissionTo}。開業までのステップや注意点も網羅。`
    : `${decodedCity}（${decodedPref}）の民泊条例・規制情報。`;

  return {
    title: `【2026年最新】${decodedCity}（${decodedPref}）の民泊条例・上乗せ規制を徹底解説`,
    description: desc,
    keywords: [
      `${decodedCity} 民泊`, `${decodedCity} 民泊 条例`, `${decodedCity} 住宅宿泊事業法`,
      `${decodedCity} 旅館業法`, `${decodedCity} 民泊 規制`, `${decodedPref} 民泊`,
      '民泊 上乗せ条例', '民泊 開業', '民泊 届出',
    ],
    alternates: {
      canonical: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decodedPref)}/${encodeURIComponent(decodedCity)}`,
    },
    openGraph: {
      title: `${decodedCity}（${decodedPref}）の民泊条例【2026年最新】`,
      description: desc,
      type: 'article',
      locale: 'ja_JP',
    },
  };
}

/** テキスト内の \n を <br/> に変換し、**太字** をパースするヘルパー */
function renderMarkdown(text: string) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    // **太字** を <strong> に変換
    const segments = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {i > 0 && <br />}
        {segments.map((seg, j) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return <strong key={j}>{seg.slice(2, -2)}</strong>;
          }
          return <span key={j}>{seg}</span>;
        })}
      </span>
    );
  });
}

export default async function CityPage({ params }: CityPageProps) {
  const { prefecture, city } = await params;
  const decodedPref = decodeURIComponent(prefecture);
  const decodedCity = decodeURIComponent(city);
  const m = findMunicipality(decodedPref, decodedCity);
  const content = getMunicipalityContent(decodedPref, decodedCity);

  // 同じ都道府県の別の自治体（関連エリア）
  const siblings = findMunicipalitiesByPrefecture(decodedPref).filter((s) => s.city !== decodedCity);

  // 全FAQを統合（テンプレFAQ + リッチコンテンツの追加FAQ）
  const allFaq = [
    ...(m ? [
      {
        question: `${decodedCity}で民泊営業は可能ですか？`,
        answer: `${decodedCity}では、住宅宿泊事業法（民泊新法）に基づき年間${m.maxDays}日まで営業可能です。${m.hasAreaRestriction ? `ただし、${m.areaRestrictionDetail}などの区域制限があります。` : '特段の区域制限はありませんが、工業専用地域での営業は全国共通で不可です。'}届出先は${m.submissionTo}です。`,
      },
      {
        question: `${decodedCity}の民泊の営業日数上限は何日ですか？`,
        answer: `${decodedCity}の民泊営業日数の上限は年間${m.maxDays}日です。${m.maxDays < 180 ? '住宅宿泊事業法の法定上限（180日）より厳しい上乗せ条例が適用されています。' : '住宅宿泊事業法の法定上限と同じです。'}`,
      },
      {
        question: `${decodedCity}で民泊を始めるにはどこに届出しますか？`,
        answer: `${decodedCity}で民泊を始めるには、${m.submissionTo}に届出を行います。問い合わせ先: ${m.contact}。詳細は公式ガイドラインをご確認ください。`,
      },
    ] : []),
    ...(content?.additionalFaq ?? []),
  ];

  // JSON-LD: Article
  const articleJsonLd = m ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${decodedCity}（${decodedPref}）の民泊条例・上乗せ規制【2026年最新】`,
    description: content?.leadText || `${decodedCity}の民泊営業日数は年間${m.maxDays}日。${m.hasAreaRestriction ? m.areaRestrictionDetail : '区域制限なし'}。`,
    datePublished: '2026-02-24',
    dateModified: MUNICIPALITY_DATA_LAST_VERIFIED_AT,
    author: { '@type': 'Organization', name: 'あおサロンAI', url: 'https://aosalonai.com' },
    publisher: { '@type': 'Organization', name: 'あおサロンAI', url: 'https://aosalonai.com' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decodedPref)}/${encodeURIComponent(decodedCity)}`,
    },
  } : null;

  // JSON-LD: FAQPage
  const faqJsonLd = allFaq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaq.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://minpaku-checker.aosalonai.com' },
      { '@type': 'ListItem', position: 2, name: 'エリア一覧', item: 'https://minpaku-checker.aosalonai.com/area' },
      { '@type': 'ListItem', position: 3, name: decodedPref, item: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decodedPref)}` },
      { '@type': 'ListItem', position: 4, name: decodedCity, item: `https://minpaku-checker.aosalonai.com/area/${encodeURIComponent(decodedPref)}/${encodeURIComponent(decodedCity)}` },
    ],
  };

  // ──────── 未登録自治体のフォールバック ────────
  if (!m) {
    return (
      <div className={styles.container}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <nav className={styles.breadcrumb}>
          <Link href="/">ホーム</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <Link href="/area">エリア一覧</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <Link href={`/area/${encodeURIComponent(decodedPref)}`}>{decodedPref}</Link>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span>{decodedCity}</span>
        </nav>
        <h1 className={styles.pageTitle}>{decodedCity}（{decodedPref}）</h1>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ marginBottom: '16px', fontSize: '15px' }}>この自治体の条例データはまだ登録されていません。</p>
          <Link href="/check" className="btn btn-primary">住所チェッカーで直接調べる →</Link>
        </div>
      </div>
    );
  }

  // ──────── メインページ ────────
  return (
    <div className={styles.container}>
      {/* JSON-LD */}
      {articleJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />}
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* パンくず */}
      <nav className={styles.breadcrumb}>
        <Link href="/">ホーム</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link href="/area">エリア一覧</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <Link href={`/area/${encodeURIComponent(decodedPref)}`}>{decodedPref}</Link>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span>{decodedCity}</span>
      </nav>

      <h1 className={styles.pageTitle}>
        🏛️ {decodedCity}（{decodedPref}）の民泊条例【2026年最新】
      </h1>

      {/* リード文 — リッチコンテンツがある場合は記事調の文章 */}
      <p className={styles.pageSubtitle}>
        {content ? content.leadText : (
          <>
            {decodedCity}で民泊（住宅宿泊事業）を始めたい方へ。
            この記事では、{decodedCity}の<strong>上乗せ条例による営業日数制限・区域制限・届出先</strong>を詳しく解説します。
            物件を契約する前に必ず確認しておきたいポイントをまとめました。
          </>
        )}
        <br />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          最終更新日: {MUNICIPALITY_DATA_LAST_VERIFIED_AT} / データ提供: {m.owner}
        </span>
      </p>

      {/* ──── 1. サマリカード ──── */}
      <section className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardIcon}>📅</div>
          <div className={styles.summaryCardValue}>
            <span className={styles.daysHighlight}>{m.maxDays}</span>
            <span className={styles.daysUnit}>日/年</span>
          </div>
          <div className={styles.summaryCardLabel}>営業日数上限</div>
          {m.maxDays < 180 && <div className={styles.summaryCardNote}>法定上限（180日）より厳しい</div>}
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardIcon}>{m.hasAreaRestriction ? '⚠️' : '✅'}</div>
          <div className={styles.summaryCardValue}>{m.hasAreaRestriction ? 'あり' : 'なし'}</div>
          <div className={styles.summaryCardLabel}>区域制限</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardIcon}>📮</div>
          <div className={styles.summaryCardValue} style={{ fontSize: '14px' }}>
            {m.submissionTo.length > 15 ? m.submissionTo.substring(0, 15) + '…' : m.submissionTo}
          </div>
          <div className={styles.summaryCardLabel}>届出先</div>
        </div>
      </section>

      {/* ──── 2. 条例の詳細 ──── */}
      <section className={`glass-card ${styles.detailSection}`}>
        <h2 className={styles.detailSectionTitle}>📋 {decodedCity}の民泊条例の詳細</h2>
        {content?.regulationDetail ? (
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p>{renderMarkdown(content.regulationDetail)}</p>
          </div>
        ) : (
          <table className={styles.detailTable}>
            <tbody>
              <tr>
                <th>📅 年間営業日数上限</th>
                <td>
                  <span className={styles.daysHighlight}>{m.maxDays}</span>
                  <span className={styles.daysUnit}>日 / 年</span>
                  {m.maxDays < 180 ? (
                    <span style={{ display: 'block', fontSize: '12px', color: '#f0ad4e', marginTop: '4px' }}>
                      ※ 住宅宿泊事業法の法定上限は年間180日ですが、{decodedCity}では独自の上乗せ条例により{m.maxDays}日に制限されています。
                    </span>
                  ) : (
                    <span style={{ display: 'block', fontSize: '12px', color: '#4caf50', marginTop: '4px' }}>
                      ※ 住宅宿泊事業法の法定上限と同じ180日です。
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <th>🗺️ 区域制限</th>
                <td>
                  {m.hasAreaRestriction ? (
                    <>
                      <span style={{ color: '#f0ad4e', fontWeight: 600 }}>⚠️ 区域制限あり</span>
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '14px', lineHeight: '1.7' }}>{m.areaRestrictionDetail}</span>
                    </>
                  ) : (
                    <span style={{ color: '#4caf50', fontWeight: 600 }}>✅ 特段の区域制限なし</span>
                  )}
                </td>
              </tr>
              <tr><th>📮 届出先</th><td>{m.submissionTo}</td></tr>
              <tr><th>📞 問い合わせ先</th><td>{m.contact}</td></tr>
            </tbody>
          </table>
        )}
      </section>

      {/* ──── 3. 区域制限の詳細（リッチコンテンツのみ） ──── */}
      {content?.areaRestrictionDetail && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>🗺️ {decodedCity}の区域制限を詳しく解説</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p>{renderMarkdown(content.areaRestrictionDetail)}</p>
          </div>
        </section>
      )}

      {/* ──── 4. この自治体の民泊の魅力（リッチコンテンツのみ） ──── */}
      {content?.attractionPoints && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>✨ {decodedCity}で民泊を運営するメリット</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p>{renderMarkdown(content.attractionPoints)}</p>
          </div>
        </section>
      )}

      {/* ──── 5. 運営上の注意点（リッチコンテンツのみ） ──── */}
      {content?.operationCautions && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>⚠️ {decodedCity}での民泊運営 注意点・リスク</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p>{renderMarkdown(content.operationCautions)}</p>
          </div>
        </section>
      )}

      {/* ──── 6. エリア別ガイド（リッチコンテンツのみ） ──── */}
      {content?.areaGuide && content.areaGuide.length > 0 && (
        <section className={styles.detailSection}>
          <h2 className={styles.detailSectionTitle}>📍 {decodedCity}のエリア別ガイド</h2>
          <div className={styles.cardGrid}>
            {content.areaGuide.map((area, i) => (
              <div key={i} className={`glass-card`} style={{ padding: '20px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{area.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {area.title}
                </h3>
                <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                  {area.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ──── 7. 特記事項（基本データのnotesから） ──── */}
      {m.notes && !content && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>💡 {decodedCity}で民泊を始める際のポイント</h2>
          <div style={{ fontSize: '14px', lineHeight: '1.9', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '16px' }}>{m.notes}</p>
            <div style={{ background: 'rgba(28, 181, 224, 0.06)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(28, 181, 224, 0.15)' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-color)', marginBottom: '8px' }}>📝 事前確認チェックリスト</p>
              <ul style={{ fontSize: '13px', paddingLeft: '20px', margin: 0 }}>
                <li style={{ marginBottom: '4px' }}>物件の用途地域を確認する（住所チェッカーを利用）</li>
                <li style={{ marginBottom: '4px' }}>マンションの場合、管理規約で民泊が禁止されていないか確認する</li>
                <li style={{ marginBottom: '4px' }}>消防法に基づく設備要件（火災報知器、消火器等）を確認する</li>
                <li style={{ marginBottom: '4px' }}>近隣住民への事前説明の要否を確認する</li>
                <li style={{ marginBottom: '4px' }}>{m.submissionTo}に届出書類を確認・提出する</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ──── 8. 法定基準との比較 ──── */}
      <section className={`glass-card ${styles.detailSection}`}>
        <h2 className={styles.detailSectionTitle}>⚖️ 住宅宿泊事業法と{decodedCity}条例の比較</h2>
        <table className={styles.detailTable}>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>項目</th>
              <th style={{ color: 'var(--text-muted)' }}>法定基準（全国共通）</th>
              <th style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{decodedCity}の条例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>年間営業日数</td>
              <td>180日</td>
              <td style={{ fontWeight: 600 }}>
                {m.maxDays}日
                {m.maxDays < 180 && <span style={{ color: '#f0ad4e', marginLeft: '4px' }}>（より厳しい）</span>}
                {m.maxDays === 180 && <span style={{ color: '#4caf50', marginLeft: '4px' }}>（同じ）</span>}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>区域制限</td>
              <td>工業専用地域のみ不可</td>
              <td style={{ fontWeight: 600 }}>
                {m.hasAreaRestriction ? <span style={{ color: '#f0ad4e' }}>追加制限あり</span> : <span style={{ color: '#4caf50' }}>追加制限なし</span>}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>届出先</td>
              <td>都道府県知事（保健所経由）</td>
              <td style={{ fontWeight: 600 }}>{m.submissionTo}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ──── 9. 開業ステップ ──── */}
      <section className={`glass-card ${styles.detailSection}`}>
        <h2 className={styles.detailSectionTitle}>🚀 {decodedCity}で民泊を開業するまでのステップ</h2>
        <div className={styles.stepList}>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>物件の用途地域を確認</h3>
              <p className={styles.stepDescription}>
                物件の住所が{m.hasAreaRestriction ? `${decodedCity}の区域制限に` : '工業専用地域に'}
                該当しないか確認します。当サイトの<Link href="/check" style={{ color: 'var(--accent-color)' }}>住所チェッカー</Link>で簡単に調べられます。
              </p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>消防設備・安全措置の準備</h3>
              <p className={styles.stepDescription}>
                消防法に基づく自動火災報知設備、誘導灯、消火器等の設置が必要です。管轄消防署に事前相談してください。
              </p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>住宅宿泊管理業者の選定（該当する場合）</h3>
              <p className={styles.stepDescription}>
                家主不在型の場合、国土交通大臣登録の住宅宿泊管理業者への委託が法律で義務付けられています。
              </p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{m.submissionTo}へ届出</h3>
              <p className={styles.stepDescription}>
                必要書類を揃えて{m.submissionTo}に届出を行います。届出番号が交付されたら営業開始可能です。
                {content?.relatedLinks?.[0] && (
                  <>
                    <br />
                    <a href={content.relatedLinks[0].url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', fontSize: '13px' }}>
                      📎 {decodedCity}の公式ガイドラインを確認する →
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>仲介サイト登録・営業開始</h3>
              <p className={styles.stepDescription}>
                Airbnb等の仲介サイトに届出番号を記載して掲載しましょう。年間{m.maxDays}日の上限に注意して運営してください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── 10. 公式リンク集（リッチコンテンツ版は拡充） ──── */}
      <section className={`glass-card ${styles.detailSection}`}>
        <h2 className={styles.detailSectionTitle}>🔗 {decodedCity}の公式情報・関連リンク</h2>
        {content?.relatedLinks && content.relatedLinks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {content.relatedLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.relatedCard}
                style={{ textDecoration: 'none' }}
              >
                <span className={styles.relatedCardTitle}>🌐 {link.label}</span>
                {link.description && (
                  <span className={styles.relatedCardMeta}>{link.description}</span>
                )}
              </a>
            ))}
          </div>
        ) : (
          <table className={styles.detailTable}>
            <tbody>
              <tr>
                <th>公式ガイドライン</th>
                <td>
                  <a href={m.guidelineUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', wordBreak: 'break-all' }}>
                    🌐 {decodedCity}の民泊に関する公式ページを開く ↗
                  </a>
                </td>
              </tr>
              <tr><th>問い合わせ先</th><td>{m.contact}</td></tr>
              <tr><th>データ最終確認日</th><td>{MUNICIPALITY_DATA_LAST_VERIFIED_AT}</td></tr>
            </tbody>
          </table>
        )}
      </section>

      {/* ──── 11. FAQ ──── */}
      {allFaq.length > 0 && (
        <section className={`glass-card ${styles.detailSection}`}>
          <h2 className={styles.detailSectionTitle}>❓ {decodedCity}の民泊に関するよくある質問</h2>
          <div className={styles.faqList}>
            {allFaq.map((faq, i) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{faq.question}</summary>
                <div className={styles.faqAnswer}>{faq.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ──── 12. チェッカーCTA ──── */}
      <div className={styles.ctaBox}>
        <h2 className={styles.ctaTitle}>🔍 {decodedCity}の物件を住所でチェック</h2>
        <p className={styles.ctaDescription}>
          物件の住所を入力するだけで、<strong>用途地域</strong>と<strong>民泊可否</strong>を自動判定。<br />
          {decodedCity}の条例情報も合わせて表示します。
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/check" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '16px', fontWeight: 'bold' }}>
            住所チェッカーを使う →
          </Link>
        </div>
      </div>

      {/* ──── 13. あおサロンAI CTA ──── */}
      <div className={styles.ctaBox} style={{ marginTop: '16px', background: 'linear-gradient(135deg, rgba(28, 181, 224, 0.15), rgba(0, 8, 81, 0.2))', borderColor: 'rgba(28, 181, 224, 0.4)' }}>
        <h2 className={styles.ctaTitle}>🤖 この地域の条例をもっと詳しくAIに聞く</h2>
        <p className={styles.ctaDescription}>
          「民泊物件判別GPT」は、住所を入力するだけで上乗せ条例・営業可否をAIが瞬時に調査。<br />
          {decodedCity}の最新条例にも対応しています。あおサロンAI会員なら無償！
        </p>
        <div className={styles.ctaButtons}>
          <a href="https://aosalonai.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary"
            style={{ padding: '12px 24px', fontSize: '14px', fontWeight: 'bold', background: 'linear-gradient(135deg, #1cb5e0 0%, #000851 100%)', border: 'none' }}>
            🚀 あおサロンAIを見る
          </a>
          <a href="https://note.com/ao_salon_ai/n/n888ddb49b460" target="_blank" rel="noopener noreferrer" className="btn btn-secondary"
            style={{ padding: '12px 24px', fontSize: '14px' }}>
            📝 Noteで単体購入
          </a>
        </div>
      </div>

      {/* ──── 14. 関連エリア ──── */}
      {siblings.length > 0 && (
        <section className={styles.detailSection} style={{ marginTop: '40px' }}>
          <h2 className={styles.detailSectionTitle}>🏘️ {decodedPref}の他のエリアも見る</h2>
          <div className={styles.relatedGrid}>
            {siblings.slice(0, 8).map((s) => (
              <Link key={s.city} href={`/area/${encodeURIComponent(s.prefecture)}/${encodeURIComponent(s.city)}`} className={styles.relatedCard}>
                <span className={styles.relatedCardTitle}>{s.city}</span>
                <span className={styles.relatedCardMeta}>📅 {s.maxDays}日 {s.hasAreaRestriction ? '⚠️制限あり' : '✅制限なし'}</span>
              </Link>
            ))}
            {siblings.length > 8 && (
              <Link href={`/area/${encodeURIComponent(decodedPref)}`} className={styles.relatedCard} style={{ justifyContent: 'center', color: 'var(--accent-color)' }}>
                他 {siblings.length - 8} 自治体を見る →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ──── 免責事項 ──── */}
      <div className={styles.disclaimer}>
        ⚠️ 本ページの情報は{MUNICIPALITY_DATA_LAST_VERIFIED_AT}時点の{decodedCity}の公開情報に基づいています。
        条例の改正等により最新の内容と異なる場合があります。
        また、用途地域の判定精度は参考値であり、正式な確認は各自治体の都市計画課にお問い合わせください。
        民泊営業の最終判断は、必ず{m.submissionTo}にご確認ください。
      </div>
    </div>
  );
}
