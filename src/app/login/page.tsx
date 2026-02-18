'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: memberId.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'ログインに失敗しました');
        return;
      }

      // ログイン成功 → チェック画面にリダイレクト
      router.push('/check');
      router.refresh();
    } catch {
      setError('通信エラーが発生しました。しばらくしてからお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginIcon}>🔑</div>
        <h1 className={styles.loginTitle}>会員ログイン</h1>
        <p className={styles.loginSubtitle}>
          あおサロンAI会員アカウントでログインしてください
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label htmlFor="memberId" className={styles.fieldLabel}>
              会員番号
            </label>
            <input
              id="memberId"
              type="text"
              className={styles.input}
              placeholder="例: AO8X92B"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className={styles.fieldLabel}>
              パスワード
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className={styles.divider}>または</div>

        <div className={styles.signupSection}>
          <p className={styles.signupText}>
            まだ会員ではない方
          </p>
          <a
            href="https://aosalonai.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.signupLink}
          >
            🌟 あおサロンAIに入会する →
          </a>
        </div>

        <div className={styles.guestNote}>
          <p className={styles.guestNoteText}>
            ログインしなくても月3回まで無料でご利用いただけます。
            <br />
            <Link href="/check" className={styles.guestLink}>
              ゲストとして利用する →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
