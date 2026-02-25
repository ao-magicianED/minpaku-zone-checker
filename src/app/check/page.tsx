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

  const handleMarkerDragEnd = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    // UIをチラつかせないため、既存のresultは保持したまま再フェッチ

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }), // 緯度経度を直接送る
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '再判定に失敗しました');
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{error}</p>
              {result?.usage && result.usage.current >= result.usage.limit && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', color: '#333', fontSize: '14px' }}>
                  <p style={{ marginBottom: '8px' }}>
                    無料プラン（ゲスト）の利用回数は<strong>月3回まで</strong>です。<br />
                    引き続き無制限（または大幅増枠）でご利用いただくには、有料プランへの加入をご検討ください。
                  </p>
                  <a
                    href="https://aosalonai.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    🚀 有料プラン（あおサロンAI）を見る
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      {result && !error && (
        <div className={styles.results}>
          {/* ツールバー (利用回数 ＆ 印刷ボタン) */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            {/* 利用回数表示 */}
            {result.usage && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-glass)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                今月の利用状況: <strong>{result.usage.current}</strong> / {result.usage.limit === Infinity || result.usage.limit > 1000 ? '無制限' : result.usage.limit} 回
              </div>
            )}
            
            {/* 印刷/PDF保存ボタン */}
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
            
            <div style={{ position: 'relative' }}>
              <MapView
                lat={result.geocode.lat}
                lon={result.geocode.lon}
                markerLabel={result.address}
                draggable={true}
                onMarkerDragEnd={handleMarkerDragEnd}
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'none'
              }}>
                <span style={{ fontSize: '16px' }}>👆</span> ピンを動かして位置を微調整できます
              </div>
            </div>
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

          {/* ステップ3: 民泊物件判別GPTの紹介 + 入手方法 */}
          <section className={`glass-card ${styles.ctaSection}`}>
            <h2 className={styles.sectionTitle}>🏛️ 次のステップ：自治体条例の詳細チェック</h2>
            <div className={styles.ctaContent} style={{ textAlign: 'center' }}>

              {/* 問題提起 */}
              <p style={{ marginBottom: '24px', lineHeight: '1.8' }}>
                用途地域による原則の可否がわかったら、次は<strong>『自治体ごとの上乗せ条例』</strong>の確認が不可欠です。<br />
                「用途地域的にOKだから大丈夫」と思って物件を契約しても、自治体独自のルールで<br />
                <span style={{ color: 'var(--error-color)', fontWeight: 'bold' }}>平日営業禁止・特定区域での制限・届出が通らない</span>ケースが全国で多発しています。
              </p>

              {/* GPT製品紹介 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '28px 24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'left', marginBottom: '28px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                  🤖 民泊物件判別GPT
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
                  民泊・旅館業アドバイザーチャット
                </p>

                <p style={{ marginBottom: '20px', lineHeight: '1.8', fontSize: '15px' }}>
                  住所を入力するだけで、その物件エリアの上乗せ条例・営業可否を<strong>AIが瞬時に調査</strong>。<br />
                  毎回保健所に電話する手間から解放される、物件検討時の強力な相棒です。
                </p>

                {/* 4つの機能 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                    <strong style={{ fontSize: '14px' }}>条例の自動調査</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      住所を入力するだけで、該当エリアの上乗せ条例・営業制限を一括検索
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚖️</div>
                    <strong style={{ fontSize: '14px' }}>両面ファクトチェック</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      旅館業法（簡易宿所）と住宅宿泊事業法（民泊新法）の両面から営業可否を診断
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
                    <strong style={{ fontSize: '14px' }}>公式リンク提示</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      該当する自治体・保健所の公式ページリンクを提示し、最終確認もスムーズ
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                    <strong style={{ fontSize: '14px' }}>多彩な入力に対応</strong>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      住所だけでなく、Googleマップのリンクや物件の募集図面からも読み取り可能
                    </p>
                  </div>
                </div>

                {/* 利用の流れ */}
                <div style={{ background: 'rgba(28, 181, 224, 0.08)', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-color)' }}>📋 使い方はかんたん3ステップ</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>❶ リンクからChatGPTを起動</span>
                    <span style={{ fontSize: '12px', lineHeight: '2' }}>→</span>
                    <span style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>❷ 住所・MAP・図面を送信</span>
                    <span style={{ fontSize: '12px', lineHeight: '2' }}>→</span>
                    <span style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px' }}>❸ 即座に診断結果を取得</span>
                  </div>
                </div>

                {/* デモ動画 */}
                <div style={{ textAlign: 'center' }}>
                  <a
                    href="https://youtu.be/x4YP7bhacHA"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255, 0, 0, 0.1)', borderRadius: '8px', color: '#ff6b6b', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', border: '1px solid rgba(255, 0, 0, 0.2)' }}
                  >
                    ▶️ 実際の動作をデモ動画で見る（YouTube）
                  </a>
                </div>
              </div>

              {/* 入手方法の見出し */}
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                💡 民泊物件判別GPTの入手方法
              </h3>

              {/* あおサロンAI（主軸CTA） */}
              <div style={{ background: 'linear-gradient(135deg, rgba(28, 181, 224, 0.15), rgba(0, 8, 81, 0.2))', border: '2px solid rgba(28, 181, 224, 0.4)', borderRadius: '16px', padding: '28px 24px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1cb5e0', marginBottom: '8px', letterSpacing: '0.1em' }}>✨ おすすめ ― 単体購入よりお得！</div>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
                  あおサロンAIに入会すると<span style={{ color: '#1cb5e0' }}>無償プレゼント🎁</span>
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  月額 <strong style={{ fontSize: '20px', color: 'var(--text-primary)' }}>4,980円</strong>で、民泊物件判別GPTだけでなく
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

              {/* Note単体購入 */}
              <div style={{ padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '24px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  GPT単体で購入したい方はこちら
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

              {/* コラム記事への誘導 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  📚 あおサロンAIの無料コラムもチェック
                </p>
                <a
                  href="https://aosalonai.com/columns/tokyo-23ku-minpaku-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '14px', marginBottom: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  📖 【2026年最新】東京23区 民泊規制完全ガイド｜全区の上乗せ条例を比較表で徹底解説 →
                </a>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  他のエリアの条例解説や、民泊経営に役立つ最新コラムを随時配信中！
                </p>
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
