'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './check.module.css';
import { ZONING_TYPES, getStatusLabel, getStatusColor } from '@/lib/zoning-data';
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

export default function CheckPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoning, setSelectedZoning] = useState<string | null>(null);
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{ current: number; limit: number; planTier: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedZoning(null);
    setUsageLimitReached(false);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.usageLimitReached) {
          setUsageLimitReached(true);
          if (data.usage) setUsageInfo(data.usage);
        }
        setError(data.error || '判定に失敗しました');
        return;
      }

      setResult(data);
      if (data.usage) setUsageInfo(data.usage);
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 検索フォーム */}
      <section className={styles.searchSection}>
        <h1 className={styles.title}>住所で民泊の可否をチェック</h1>
        <p className={styles.subtitle}>
          検討中の物件住所を入力してください。用途地域と民泊可否を判定します。
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

      {/* 利用回数バナー */}
      {usageInfo && !usageLimitReached && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 16px',
          padding: '10px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <span>
            📊 今月の利用: <strong style={{ color: 'var(--text-primary)' }}>{usageInfo.current}</strong>
            {usageInfo.limit > 0 ? ` / ${usageInfo.limit}回` : ' / 無制限'}
          </span>
          {!isLoggedIn && (
            <Link href="/login" style={{ color: 'var(--primary-light)', fontSize: '12px' }}>
              ログインで上限UP →
            </Link>
          )}
        </div>
      )}

      {/* エラー表示 */}
      {error && !usageLimitReached && (
        <div className={styles.errorBox}>
          <span>❌</span> {error}
        </div>
      )}

      {/* 利用制限到達時の案内 */}
      {usageLimitReached && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 32px',
          padding: '32px',
          background: 'var(--bg-glass)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.2rem' }}>
            今月の利用回数に達しました
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isLoggedIn && (
              <Link
                href="/login"
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                🔑 ログインする
              </Link>
            )}
            <a
              href="https://aosalonai.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 24px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              🌟 あおサロンAIに入会する
            </a>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className={styles.results}>
          {/* 地図 */}
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

          {/* 用途地域マップリンク */}
          <section className={`glass-card ${styles.zoningMapSection}`}>
            <h2 className={styles.sectionTitle}>🗺️ 用途地域の確認</h2>
            <p className={styles.zoningNote}>
              {result.zoningReference.note}
            </p>
            <a
              href={result.zoningReference.externalMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-primary ${styles.mapLink}`}
            >
              🌐 用途地域マップで確認する（外部サイト）
            </a>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              ※ cityzone.mapexpert.net が開きます。地図上で色分けされた用途地域を確認できます。
            </p>
          </section>

          {/* 用途地域別 民泊ルール一覧 */}
          <section className={`glass-card ${styles.zoningListSection}`}>
            <h2 className={styles.sectionTitle}>
              📋 用途地域が判明したら — 民泊ルール一覧
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
              上の外部マップで用途地域を確認したら、下記から該当する地域をクリックしてください。
            </p>
            <div className={styles.zoningGrid}>
              {ZONING_TYPES.map((z) => (
                <button
                  key={z.code}
                  className={`${styles.zoningCard} ${selectedZoning === z.code ? styles.zoningCardActive : ''}`}
                  onClick={() => setSelectedZoning(selectedZoning === z.code ? null : z.code)}
                  style={{ borderLeftColor: z.color }}
                >
                  <div className={styles.zoningCardHeader}>
                    <span className={styles.zoningName}>{z.name}</span>
                    <span
                      className={`badge ${z.minpakuStatus === 'allowed' ? 'badge-success' : z.minpakuStatus === 'conditional' ? 'badge-warning' : 'badge-danger'}`}
                    >
                      {getStatusLabel(z.minpakuStatus)}
                    </span>
                  </div>
                  {selectedZoning === z.code && (
                    <div className={styles.zoningDetail}>
                      <p style={{ marginBottom: '8px' }}><strong>概要:</strong> {z.description}</p>
                      <p style={{ marginBottom: '8px' }}>
                        <strong>民泊（住宅宿泊事業法）:</strong>{' '}
                        <span style={{ color: getStatusColor(z.minpakuStatus) }}>
                          {getStatusLabel(z.minpakuStatus)}
                        </span>
                      </p>
                      <p style={{ marginBottom: '8px' }}>
                        <strong>旅館業法（簡易宿所）:</strong>{' '}
                        <span style={{ color: getStatusColor(z.ryokanStatus) }}>
                          {getStatusLabel(z.ryokanStatus)}
                        </span>
                      </p>
                      <p className={styles.zoningExplanation}>{z.minpakuDetail}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* 自治体情報 */}
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

          {/* 免責事項 */}
          <div className={styles.disclaimer}>
            {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
