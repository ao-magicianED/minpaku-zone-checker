import styles from './guide.module.css';
import { ZONING_TYPES, getStatusLabel, getStatusColor } from '@/lib/zoning-data';
import { MUNICIPALITY_DATA_LAST_VERIFIED_AT } from '@/lib/municipality-data';

export default function GuidePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>用途地域ガイド</h1>
      <p className={styles.subtitle}>
        日本の都市計画法で定められた13種類の用途地域と、
        民泊営業（住宅宿泊事業法・旅館業法）の可否を初心者向けに解説します。
      </p>

      {/* 凡例 */}
      <div className={`glass-card ${styles.legend}`}>
        <h2>凡例</h2>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className="badge badge-success">✅ 原則OK</span>
            <span>原則として民泊営業が可能な地域</span>
          </div>
          <div className={styles.legendItem}>
            <span className="badge badge-warning">⚠️ 条件付き</span>
            <span>条件付きで営業可能（自治体条例による制限あり）</span>
          </div>
          <div className={styles.legendItem}>
            <span className="badge badge-danger">❌ 不可</span>
            <span>原則として営業不可</span>
          </div>
        </div>
      </div>

      {/* 用途地域一覧テーブル */}
      <div className={`glass-card ${styles.tableWrapper}`}>
        <h2 className={styles.tableTitle}>用途地域別 民泊可否一覧</h2>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>用途地域名</th>
                <th>民泊（住宅宿泊事業法）</th>
                <th>旅館業法（簡易宿所）</th>
                <th>主な建物用途</th>
              </tr>
            </thead>
            <tbody>
              {ZONING_TYPES.map((z) => (
                <tr key={z.code}>
                  <td>
                    <div className={styles.zoneName}>
                      <span
                        className={styles.zoneColor}
                        style={{ background: z.color }}
                      />
                      {z.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: getStatusColor(z.minpakuStatus), fontWeight: 600 }}>
                      {getStatusLabel(z.minpakuStatus)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: getStatusColor(z.ryokanStatus), fontWeight: 600 }}>
                      {getStatusLabel(z.ryokanStatus)}
                    </span>
                  </td>
                  <td className={styles.mainUse}>{z.mainUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳細カード */}
      <div className={styles.detailCards}>
        <h2 className={styles.detailTitle}>各用途地域の詳細</h2>
        {ZONING_TYPES.map((z) => (
          <div
            key={z.code}
            className={`glass-card ${styles.detailCard}`}
            style={{ borderLeftColor: z.color }}
          >
            <div className={styles.detailHeader}>
              <h3>{z.name}</h3>
              <div className={styles.statuses}>
                <span
                  className={`badge ${z.minpakuStatus === 'allowed' ? 'badge-success' : z.minpakuStatus === 'conditional' ? 'badge-warning' : 'badge-danger'}`}
                >
                  民泊: {getStatusLabel(z.minpakuStatus)}
                </span>
                <span
                  className={`badge ${z.ryokanStatus === 'allowed' ? 'badge-success' : z.ryokanStatus === 'conditional' ? 'badge-warning' : 'badge-danger'}`}
                >
                  旅館業: {getStatusLabel(z.ryokanStatus)}
                </span>
              </div>
            </div>
            <p className={styles.detailDescription}>{z.description}</p>
            <div className={styles.detailExplanation}>
              <strong>民泊営業について:</strong>
              <p>{z.minpakuDetail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 注意事項 */}
      <div className={styles.notice}>
        <h2>⚠️ 重要な注意事項</h2>
        <ul>
          <li>
            <strong>住宅宿泊事業法（民泊新法）</strong>に基づく届出制は、
            年間営業日数が<strong>180日以内</strong>に制限されます。
          </li>
          <li>
            各自治体は独自の条例で、営業可能区域・日数をさらに制限できます。
            必ず該当自治体の条例を確認してください。
          </li>
          <li>
            マンション等の場合、管理規約で民泊が禁止されていることがあります。
          </li>
          <li>
            <strong>旅館業法</strong>に基づく営業許可は、用途地域による建築制限を受けます。
          </li>
          <li>
            本ガイドは一般的な情報であり、最終判断は必ず管轄の保健所・自治体にご確認ください。
          </li>
        </ul>
      </div>

      {/* 参考リンク */}
      <div className={`glass-card ${styles.references}`}>
        <h2>📚 参考リンク</h2>
        <div className={styles.refLinks}>
          <a href="https://www.mlit.go.jp/kankocho/minpaku/" target="_blank" rel="noopener noreferrer">
            国土交通省 民泊制度ポータルサイト →
          </a>
          <a href="https://cityzone.mapexpert.net/" target="_blank" rel="noopener noreferrer">
            用途地域マップ（全国対応） →
          </a>
          <a href="https://www.reinfolib.mlit.go.jp/" target="_blank" rel="noopener noreferrer">
            不動産情報ライブラリ →
          </a>
          <a href="https://nlftp.mlit.go.jp/ksj/" target="_blank" rel="noopener noreferrer">
            国土数値情報ダウンロードサイト →
          </a>
        </div>
        <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          データ最終確認日: {MUNICIPALITY_DATA_LAST_VERIFIED_AT}
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a href="/check" className="btn btn-primary btn-large">
          🔍 住所をチェックしてみる
        </a>
      </div>
    </div>
  );
}
