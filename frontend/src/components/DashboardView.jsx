import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  FileSpreadsheet,
  UserPlus,
  Download,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardView({
  stats,
  contactsCount = 0,
  templatesCount = 0,
  onNavigateTab,
  onOpenAddModal,
  onOpenBulkModal,
  onExportCSV,
}) {
  const total = stats?.total || contactsCount || 0;
  const contacted = stats?.contactedCount || 0;
  const pending = stats?.pendingCount !== undefined ? stats.pendingCount : total - contacted;
  const progressPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;
  const categoryStats = stats?.categoryStats || [];

  return (
    <div className="dashboard-view animate-fade-in space-y-6" style={{ paddingBottom: '90px' }}>
      {/* Welcome Banner */}
      <div className="section-card" style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #e0f2fe 100%)',
        border: '1px solid #bbf7d0',
        padding: '24px 26px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>👋</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Outreach Performance Dashboard
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, maxWidth: '580px' }}>
              Overview of your contacts, outreach completion rate, and messaging performance. All stats update in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onNavigateTab('contacts')}
              className="btn btn-primary"
              style={{ padding: '10px 18px', fontSize: '0.9rem' }}
            >
              <span>View Contacts List</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Total Contacts */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab('contacts')}
          style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Contacts</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#0f172a' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            All phone numbers loaded
          </div>
        </div>

        {/* Messaged */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab('contacts')}
          style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Messaged / Contacted</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#059669' }}>
            {contacted}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <TrendingUp size={13} />
            <span>{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Pending */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab('contacts')}
          style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Pending Outreach</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: '#fffbeb', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#d97706' }}>
            {pending}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '4px' }}>
            Awaiting 1-click message
          </div>
        </div>

        {/* Templates Count */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab('templates')}
          style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Message Templates</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#2563eb' }}>
            {templatesCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#3b82f6', marginTop: '4px' }}>
            Ready for WhatsApp
          </div>
        </div>

      </div>

      {/* Progress & Quick Actions in 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Progress Breakdown Card */}
        <div className="section-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Outreach Completion Progress
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Ratio of completed messages vs total list
              </span>
            </div>
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#059669',
              background: '#ecfdf5',
              padding: '4px 12px',
              borderRadius: '20px',
              border: '1px solid #a7f3d0',
            }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '14px',
            background: '#f1f5f9',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '16px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ea580c 0%, #10b981 100%)',
              borderRadius: '10px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>COMPLETED</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>{contacted}</div>
              <div style={{ fontSize: '0.72rem', color: '#166534' }}>Recipients contacted</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 600 }}>REMAINING</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>{pending}</div>
              <div style={{ fontSize: '0.72rem', color: '#92400e' }}>Waiting to be messaged</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="section-card" style={{ padding: '22px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Quick Management Shortcuts
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Fast access to essential workflows
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{ padding: '14px 12px', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}
            >
              <UserPlus size={20} />
              <span style={{ fontSize: '0.82rem' }}>Add Contact</span>
            </button>

            <button
              onClick={onOpenBulkModal}
              className="btn btn-secondary"
              style={{ padding: '14px 12px', justifyContent: 'center', flexDirection: 'column', gap: '6px', borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca' }}
            >
              <FileSpreadsheet size={20} color="#4f46e5" />
              <span style={{ fontSize: '0.82rem' }}>Paste Bulk List</span>
            </button>

            <button
              onClick={() => onNavigateTab('templates')}
              className="btn btn-secondary"
              style={{ padding: '14px 12px', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}
            >
              <MessageSquare size={20} color="#059669" />
              <span style={{ fontSize: '0.82rem' }}>Edit Templates</span>
            </button>

            <button
              onClick={onExportCSV}
              className="btn btn-secondary"
              style={{ padding: '14px 12px', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}
            >
              <Download size={20} color="#64748b" />
              <span style={{ fontSize: '0.82rem' }}>Export CSV</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
