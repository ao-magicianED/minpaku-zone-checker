'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MUNICIPALITY_DATA, getRegisteredPrefectures } from '@/lib/municipality-data';
import styles from './area.module.css';

type SearchResult = 
  | { type: 'prefecture'; name: string; url: string }
  | { type: 'city'; prefecture: string; city: string; url: string };

export default function AreaSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 外側クリックで結果を閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const q = text.toLowerCase();
    const registeredPrefectures = getRegisteredPrefectures();
    const newResults: SearchResult[] = [];

    // 都道府県の一致（「東京」「東京都」どちらでもヒットするように）
    registeredPrefectures.forEach(pref => {
      const strippedPref = pref.replace(/[都道府県]/g, '');
      if (pref.toLowerCase().includes(q) || strippedPref.toLowerCase().includes(q)) {
        newResults.push({
          type: 'prefecture',
          name: pref,
          url: `/area/${encodeURIComponent(pref)}`
        });
      }
    });

    // 市区町村の一致
    let cityCount = 0;
    for (const item of MUNICIPALITY_DATA) {
      if (!registeredPrefectures.includes(item.prefecture)) continue;

      const fullStr = `${item.prefecture}${item.city}`.toLowerCase();
      // 県名＋市名、または市名の一部が含まれていればヒット
      if (fullStr.includes(q) || item.city.toLowerCase().includes(q) || item.prefecture.toLowerCase().includes(q)) {
        // 重複チェック
        if (!newResults.some(r => r.type === 'city' && r.city === item.city && r.prefecture === item.prefecture)) {
          // 「都道府県だけ」で検索されたときに市町村が大量に出ないよう、
          // 文字列が短い＆県名完全一致の場合はフィルタをかける調整
          if (q.length <= 4 && item.prefecture.toLowerCase().includes(q) && !item.city.toLowerCase().includes(q)) {
             continue; 
          }

          newResults.push({
            type: 'city',
            prefecture: item.prefecture,
            city: item.city,
            url: `/area/${encodeURIComponent(item.prefecture)}/${encodeURIComponent(item.city)}`
          });
          cityCount++;
          if (cityCount > 15) break; 
        }
      }
    }

    setResults(newResults);
    setIsOpen(true);
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <div className={styles.searchInputContainer}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="都道府県・市区町村で検索 (例: 新宿区, 大阪)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {query && (
          <button className={styles.searchClearBtn} onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={styles.searchResults}>
          {results.map((res, i) => (
            <button
              key={i}
              className={styles.searchResultItem}
              onClick={() => {
                setIsOpen(false);
                setQuery('');
                router.push(res.url);
              }}
            >
              {res.type === 'prefecture' ? (
                <>
                  <span className={`${styles.searchResultBadge} ${styles.badgePref}`}>都道府県</span>
                  <span>{res.name}</span>
                </>
              ) : (
                <>
                  <span className={`${styles.searchResultBadge} ${styles.badgeCity}`}>市区町村</span>
                  <span>{res.prefecture} <span style={{ fontWeight: 600 }}>{res.city}</span></span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.trim() && results.length === 0 && (
        <div className={styles.searchResults}>
          <div className={styles.searchNoResult}>一致するエリアが見つかりません。</div>
        </div>
      )}
    </div>
  );
}
