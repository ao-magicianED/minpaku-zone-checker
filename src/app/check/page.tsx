'use client';

import { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import styles from './check.module.css';
import { getStatusColor } from '@/lib/zoning-data';
import type { CheckResult } from '@/app/api/check/route';

// Leaflet はクライアントサイドのみでロード（SSR非対応のため）
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
      <div className="spinner" />
    </div>
  ),
});

function getStatusIcon(status: 'allowed' | 'conditional' | 'restricted'): string {
  switch (status) {
    case 'allowed': return '✅';
    case 'conditional': return '⚠️';
    case 'restricted': return '❌';
  }
}

export default function CheckPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '判定に失敗しました');
        return;
      }

      setResult(data);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 印刷用ヘッダー（画面上は非表示） */}
      <div className="print-header" style={{ display: 'none', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px', color: '#000' }}>民泊用途地域チェッカー 判定結果レポート</h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          判定日時: {new Date().toLocaleDateString('ja-JP')} {new Date().toLocaleTimeString('ja-JP')}
        </p>
      </div>

      {/* 検索フォーム */}
      <section className={styles.searchSection}>
        <h1 className={styles.title}>住所で民泊の可否をチェック</h1>
        <p className={styles.subtitle}>
          物件の住所を入力するだけで、用途地域と民泊可否を自動判定します。
        </p>

        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔍</span>
            <input
              type="text"
              className={`input-field ${styles.searchInput}`}
              placeholder="例: 東京都新宿区歌舞伎町1-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`btn btn-primary ${styles.searchButton}`}
            disabled={loading || !address.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18 }} />
                判定中...
              </>
            ) : (
              '判定する'
            )}
          </button>
        </form>

        {/* サンプル住所 */}
        <div className={styles.sampleAddresses}>
          <span className={styles.sampleLabel}>サンプル:</span>
          {[
            '東京都新宿区歌舞伎町1-1',
            '京都市左京区下鴨泉川町',
            '大阪市中央区難波1丁目',
            '福岡市博多区博多駅前2丁目',
          ].map((sample) => (
            <button
              key={sample}
              className={styles.sampleButton}
              onClick={() => setAddress(sample)}
              type="button"
            >
              {sample}
            </button>
          ))}
        </div>
      </section>

      {/* エラー表示 */}
      {error && (
        <div className={styles.errorBox}>
          <span>❌</span> {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className={styles.results}>
          {/* 印刷/PDF保存ボタン */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-secondary"
              style={{ gap: '8px' }}
            >
              🖨️ 結果を印刷 / PDF保存
            </button>
          </div>

          {/* ステップ1: 地図 */}
          <section className={`glass-card ${styles.mapSection}`}>
            <h2 className={styles.sectionTitle}>📍 位置情報</h2>
            <div className={styles.locationInfo}>
              <p><strong>住所:</strong> {result.geocode.displayName}</p>
              <p><strong>都道府県:</strong> {result.geocode.prefecture}</p>
              <p><strong>市区町村:</strong> {result.geocode.city}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                座標: {result.geocode.lat.toFixed(6)}, {result.geocode.lon.toFixed(6)}
              </p>
            </div>
            <MapView
              lat={result.geocode.lat}
              lon={result.geocode.lon}
              markerLabel={result.address}
            />
          </section>

          {/* ステップ2: 用途地域判定結果 */}
          <section className={`glass-card ${styles.zoningResultSection}`}>
            <h2 className={styles.sectionTitle}>🗺️ 用途地域の判定結果</h2>

            {result.zoning.detected && result.zoning.minpakuStatus ? (
              <div className={styles.zoningResultCard}>
                <div className={styles.zoningStatusIcon}>
                  {getStatusIcon(result.zoning.minpakuStatus)}
                </div>
                <div className={styles.zoningName} style={{ color: result.zoning.color || 'var(--text-primary)' }}>
                  {result.zoning.name}
                </div>
                <div className={styles.zoningDescription}>
                  {result.zoning.description}
                </div>

                {/* 民泊・旅館業法の判定 */}
                <div className={styles.zoningStatusGrid}>
                  <div className={styles.zoningStatusItem}>
                    <span className={styles.zoningStatusLabel}>住宅宿泊事業法（民泊新法）</span>
                    <span
                      className={styles.zoningStatusValue}
                      style={{ color: getStatusColor(result.zoning.minpakuStatus) }}
                    >
                      {getStatusIcon(result.zoning.minpakuStatus)} {result.zoning.minpakuStatusLabel}
                    </span>
                  </div>
                  {result.zoning.ryokanStatus && (
                    <div className={styles.zoningStatusItem}>
                      <span className={styles.zoningStatusLabel}>旅館業法（簡易宿所）</span>
                      <span
                        className={styles.zoningStatusValue}
                        style={{ color: getStatusColor(result.zoning.ryokanStatus) }}
                      >
                        {getStatusIcon(result.zoning.ryokanStatus)} {result.zoning.ryokanStatusLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* 詳細説明 */}
                {result.zoning.minpakuDetail && (
                  <div className={styles.zoningDetailText}>
                    {result.zoning.minpakuDetail}
                  </div>
                )}

                {/* 容積率・建蔽率 */}
                {(result.zoning.floorAreaRatio || result.zoning.buildingCoverageRatio) && (
                  <div className={styles.zoningExtraInfo}>
                    {result.zoning.floorAreaRatio && (
                      <span>📐 容積率: <strong>{result.zoning.floorAreaRatio}</strong></span>
                    )}
                    {result.zoning.buildingCoverageRatio && (
                      <span>📏 建蔽率: <strong>{result.zoning.buildingCoverageRatio}</strong></span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.zoningFallback}>
                <p style={{ marginBottom: '16px' }}>
                  この地点の用途地域を自動判定できませんでした。
                  {result.zoning.rawZoningName && (
                    <span><br />取得された情報: <strong>{result.zoning.rawZoningName}</strong></span>
                  )}
                </p>
                <a
                  href={result.zoning.externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  🌐 用途地域マップで確認する（外部サイト）
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  ※ cityzone.mapexpert.net が開きます。地図上で色分けされた用途地域を確認できます。
                </p>
              </div>
            )}

            {/* 外部マップリンク（判定成功時も参考として表示） */}
            {result.zoning.detected && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <a
                  href={result.zoning.externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: 'var(--text-muted)' }}
                >
                  🌐 用途地域マップでも確認する →
                </a>
              </div>
            )}
          </section>

          {/* ステップ3: 自治体条例・詳細チェック (AIへの誘導) */}
          <section className={`glass-card ${styles.ctaSection}`}>
            <h2 className={styles.sectionTitle}>🏛️ 自治体ごとの細かい条例・ルールの確認</h2>
            <div className={styles.ctaContent} style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
                用途地域による原則の可否がわかったら、次は<strong>『自治体ごとの上乗せ条例』</strong>の確認が必要です。<br />
                「ここはこの用途地域だからOK！」と思って進めても、各自治体の独自のルールや制限によって、<br />
                <span style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>実際には営業できない・保健所の許可が下りない</span>という落とし穴が全国各地にあります。
              </p>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'inline-block', textAlign: 'left', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>
                  🌟 その面倒な確認作業、「AIボット」がすべて瞬時に解決！
                </h3>
                <p style={{ marginBottom: '12px' }}>
                  毎回保健所に確認する手間を省く、民泊オーナー・開業検討者のための強力な相棒です。
                </p>
                <ul style={{ paddingLeft: '24px', lineHeight: '2' }}>
                  <li>✅ 該当地域の用途地域や上乗せ条例を<strong>自動で徹底調査</strong></li>
                  <li>✅ 本当に民泊・旅館業の営業が可能か<strong>即座にファクトチェック</strong></li>
                  <li>✅ 該当自治体（保健所）の<strong>公式ページリンクを直接提示</strong></li>
                </ul>
              </div>

              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '32px' }}>
                「民泊物件判別GPT」が、あなたの物件検討・調査時間を劇的に短縮します💨
              </p>

              {/* あおサロンAI（主軸CTA） */}
              <div style={{ background: 'linear-gradient(135deg, rgba(28, 181, 224, 0.15), rgba(0, 8, 81, 0.2))', border: '2px solid rgba(28, 181, 224, 0.4)', borderRadius: '16px', padding: '28px 24px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1cb5e0', marginBottom: '8px', letterSpacing: '0.1em' }}>✨ おすすめ</div>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  あおサロンAIに入会すると、民泊物件判別GPTを<span style={{ color: '#1cb5e0' }}>無償プレゼント🎁</span>
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  月額 <strong style={{ fontSize: '20px', color: 'var(--text-primary)' }}>4,980円</strong>で、このGPTだけでなく
                  <strong>民泊ダッシュボード・プロンプト集・セミナー映像・Discordコミュニティ</strong>まですべて使い放題。<br />
                  単体購入（12,000円）より<span style={{ color: '#1cb5e0', fontWeight: 'bold' }}>月額が安い</span>のに、中身は圧倒的にお得です。
                </p>
                <a
                  href="https://aosalonai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-large"
                  style={{ width: '100%', maxWidth: '500px', fontSize: '16px', fontWeight: 'bold', padding: '16px', background: 'linear-gradient(135deg, #1cb5e0 0%, #000851 100%)', border: 'none', boxShadow: '0 4px 15px rgba(28, 181, 224, 0.4)' }}
                >
                  🚀 あおサロンAIを見てみる →
                </a>
              </div>

              {/* コラム記事への誘導 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  📚 あおサロンAIの無料コラムもチェック
                </p>
                <a
                  href="https://aosalonai.com/columns/tokyo-23ku-minpaku-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px', border: '1px solid rgba(255, 255, 255, 0.06)', transition: 'background 0.2s' }}
                >
                  📖 【2026年最新】東京23区 民泊規制完全ガイド｜全区の上乗せ条例を比較表で徹底解説 →
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  他のエリアの条例解説や、民泊経営に役立つ最新コラムを随時配信中！
                </p>
              </div>

              {/* Note単体購入（サブCTA） */}
              <div style={{ opacity: 0.85 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  民泊物件判別GPTを単体で購入したい方はこちら
                </p>
                <a
                  href="https://note.com/ao_salon_ai/n/n888ddb49b460"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 24px' }}
                >
                  📝 Noteで単体購入する（12,000円）
                </a>
              </div>
            </div>
          </section>

          {/* 免責事項 */}
          <div className={styles.disclaimer}>
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
