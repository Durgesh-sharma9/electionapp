import React from 'react';
import { Users, CheckCircle2, Clock, ThumbsUp, TrendingUp } from 'lucide-react';

export default function StatsOverview({ stats, onFilterCategory, currentCategory }) {
  const total = stats?.total || 0;
  const contacted = stats?.contactedCount || 0;
  const pending = stats?.pendingCount || 0;
  const progressPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;

  return (
    <div className="stats-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
      
      {/* Total Voters */}
      <div 
        className="glass-panel" 
        onClick={() => onFilterCategory('ALL')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          border: currentCategory === 'ALL' ? '1px solid rgba(249, 115, 22, 0.6)' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'ALL' ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>कुल मतदाता</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.15)', color: '#fb923c' }}>
            <Users size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#ffffff' }}>
          {total}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
          सभी दर्ज मतदाता
        </div>
      </div>

      {/* Contacted */}
      <div 
        className="glass-panel" 
        onClick={() => onFilterCategory('CONTACTED')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          border: currentCategory === 'CONTACTED' ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'CONTACTED' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>संपर्क हो चुका</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#34d399' }}>
          {contacted}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
          <TrendingUp size={12} />
          <span>{progressPercent}% पूर्ण</span>
        </div>
      </div>

      {/* Remaining */}
      <div 
        className="glass-panel" 
        onClick={() => onFilterCategory('PENDING')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          border: currentCategory === 'PENDING' ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'PENDING' ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>बाकी मतदाता</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fbbf24' }}>
          {pending}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
          संदेश भेजें
        </div>
      </div>

      {/* Progress Card */}
      <div className="glass-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>अभियान लक्ष्य</span>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f97316' }}>{progressPercent}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '6px 0 8px 0',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f97316, #10b981)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {contacted} संपर्कित / {total} कुल
        </span>
      </div>

    </div>
  );
}
