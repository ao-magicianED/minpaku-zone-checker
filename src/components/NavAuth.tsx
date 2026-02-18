'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MemberInfo {
  memberId: string;
  name: string | null;
  planTier: string;
  subscriptionStatus: string;
}

const PLAN_LABELS: Record<string, string> = {
  premium: 'プレミアム',
  light: 'ライト',
  none: 'ゲスト',
};

export default function NavAuth() {
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setMember(data.member);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMember(null);
    setMenuOpen(false);
    window.location.reload();
  };

  if (loading) {
    return <div style={{ width: 100 }} />;
  }

  if (!member) {
    return (
      <li>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '8px',
            color: '#a5b4fc',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          🔑 ログイン
        </Link>
      </li>
    );
  }

  const planLabel = PLAN_LABELS[member.planTier] || member.planTier;
  const isActive = ['active', 'trialing'].includes(member.subscriptionStatus);

  return (
    <li style={{ position: 'relative' }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
          border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{
          display: 'inline-block',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 700,
          background: isActive
            ? member.planTier === 'premium' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(16, 185, 129, 0.2)'
            : 'rgba(107, 114, 128, 0.2)',
          color: isActive ? '#fff' : '#9ca3af',
        }}>
          {planLabel}
        </span>
        <span>{member.name || member.memberId}</span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          background: 'rgba(15, 15, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '8px',
          minWidth: '180px',
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{
            padding: '8px 12px',
            color: 'var(--text-muted)',
            fontSize: '11px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '4px',
          }}>
            {member.memberId}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: '6px',
              transition: 'background 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
          >
            ログアウト
          </button>
        </div>
      )}
    </li>
  );
}
