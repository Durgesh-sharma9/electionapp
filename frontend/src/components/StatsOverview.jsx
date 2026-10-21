import React from 'react';
import { Users, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

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
          border: currentCategory === 'ALL' ? '2px solid #ea580c' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'ALL' ? '#fff7ed' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>कुल मतदाता / संपर्क</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c' }}>
            <Users size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#0f172a' }}>
          {total}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
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
          border: currentCategory === 'CONTACTED' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'CONTACTED' ? '#f0fdf4' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>संपर्क हो चुका</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#059669' }}>
          {contacted}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
          <TrendingUp size={12} />
          <span>{progressPercent}% जनसंपर्क पूर्ण</span>
        </div>
      </div>

      {/* Remaining */}
      <div 
        className="glass-panel" 
        onClick={() => onFilterCategory('PENDING')}
        style={{
          padding: '16px 18px',
          cursor: 'pointer',
          border: currentCategory === 'PENDING' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
          transition: 'all 0.2s ease',
          background: currentCategory === 'PENDING' ? '#fffbeb' : '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>बाकी (Pending)</span>
          <div style={{ padding: '6px', borderRadius: '8px', background: '#fffbeb', color: '#d97706' }}>
            <Clock size={17} />
          </div>
        </div>
        <div className="stat-num" style={{ fontSize: '1.85rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#d97706' }}>
          {pending}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
          संदेश भेजना बाकी
        </div>
      </div>

      {/* Campaign Progress */}
      <div className="glass-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>अभियान लक्ष्य प्रगति</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ea580c' }}>{progressPercent}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#e2e8f0',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '6px 0 8px 0',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ea580c, #10b981)',
            borderRadius: '4px',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
          {contacted} संपर्कित / {total} कुल मतदाता
        </span>
      </div>

    </div>
  );
}
