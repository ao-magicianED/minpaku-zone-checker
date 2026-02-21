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

          {/* ステップ3: 自治体条例情報 */}
          {result.municipality.found && result.municipality.info && (
            <section className={`glass-card ${styles.municipalitySection}`}>
              <h2 className={styles.sectionTitle}>🏛️ 自治体条例情報</h2>
              <div className={styles.municipalityGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>自治体</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.prefecture} {result.municipality.info.city}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>年間営業日数上限</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.maxDays}日
                    {result.municipality.info.maxDays < 180 && (
                      <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                        法定上限より厳しい
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>区域制限</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.hasAreaRestriction ? (
                      <span className="badge badge-warning">あり</span>
                    ) : (
                      <span className="badge badge-success">なし</span>
                    )}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>区域制限の詳細</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.areaRestrictionDetail}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>届出先</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.submissionTo}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>特記事項</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.notes}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>問い合わせ先</span>
                  <span className={styles.infoValue}>
                    {result.municipality.info.contact}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>データ最終確認日</span>
                  <span className={styles.infoValue}>
                    {result.dataMeta.municipalityLastVerifiedAt}
                  </span>
                </div>
              </div>
              <a
                href={result.municipality.info.guidelineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-secondary ${styles.guidelineLink}`}
              >
                📄 公式ガイドラインを見る
              </a>
            </section>
          )}

          {!result.municipality.found && (
            <section className={`glass-card ${styles.municipalitySection}`}>
              <h2 className={styles.sectionTitle}>🏛️ 自治体条例情報</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                この自治体の条例データはまだ収録されていません。
                下記リンクから国土交通省の民泊ポータルサイトで確認できます。
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                データ最終確認日: {result.dataMeta.municipalityLastVerifiedAt}
              </p>
              <a
                href="https://www.mlit.go.jp/kankocho/minpaku/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ marginTop: '16px' }}
              >
                民泊制度ポータルサイト →
              </a>
            </section>
          )}

          {/* ステップ4: 販売動線CTA */}
          <section className={`glass-card ${styles.ctaSection}`}>
            <div className={styles.ctaTitle}>🎯 もっと詳しく知りたい方へ</div>
            <p className={styles.ctaDescription}>
              民泊事業の始め方、収益シミュレーション、申請手続きの詳細など、
              AIが個別にアドバイスいたします。
            </p>
            <div className={styles.ctaButtons}>
              <a
                href="https://chatgpt.com/g/g-minpaku"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-large"
              >
                🤖 民泊GPTsで相談する
              </a>
              <a
                href="https://note.com/ao_salon_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-large"
              >
                📝 noteで詳細を見る
              </a>
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
