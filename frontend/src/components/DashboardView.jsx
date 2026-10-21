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
  Star,
  MapPin,
  Landmark,
  Phone,
  MessageCircle,
  Zap,
} from 'lucide-react';

export default function DashboardView({
  stats,
  contacts = [],
  wards = [],
  localities = [],
  contactsCount = 0,
  templatesCount = 0,
  onNavigateTab,
  onFilterByWard,
  onFilterByLocality,
  onOpenAddModal,
  onOpenBulkModal,
  onExportCSV,
  onOpenSendMessage,
  onCallRedirect,
}) {
  const total = stats?.total || contactsCount || contacts.length || 0;
  const contacted = stats?.contactedCount || contacts.filter((c) => c.contacted).length || 0;
  const pending = stats?.pendingCount !== undefined ? stats.pendingCount : Math.max(0, total - contacted);
  const sureCount = stats?.sureCount || contacts.filter((c) => c.isSureVoter).length || 0;
  const progressPercent = total > 0 ? Math.round((contacted / total) * 100) : 0;
  const surePercent = total > 0 ? Math.round((sureCount / total) * 100) : 0;

  // Ward-wise aggregation fallback
  const wardBreakdown = React.useMemo(() => {
    if (stats?.wardStats && stats.wardStats.length > 0) {
      return stats.wardStats;
    }
    const map = {};
    contacts.forEach((c) => {
      const w = c.ward && c.ward.trim() ? c.ward : 'Unassigned';
      if (!map[w]) map[w] = { _id: w, total: 0, sureCount: 0, contactedCount: 0 };
      map[w].total += 1;
      if (c.isSureVoter) map[w].sureCount += 1;
      if (c.contacted) map[w].contactedCount += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [stats?.wardStats, contacts]);

  // Recent 5 contacts for quick outreach queue
  const recentContacts = React.useMemo(() => {
    return contacts.slice(0, 5);
  }, [contacts]);

  return (
    <div className="dashboard-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '90px' }}>
      
      {/* 1. Compact Header Banner */}
      <div
        className="section-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #eff6ff 100%)',
          border: '1px solid #bbf7d0',
          padding: '12px 18px',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Campaign Outreach Performance
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0 }}>
                Real-time election outreach, ward coverage, and sure voter conversion
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('sure-voters')}
              className="btn btn-secondary"
              style={{
                height: '30px',
                padding: '0 10px',
                fontSize: '0.76rem',
                fontWeight: 700,
                background: '#fffbeb',
                borderColor: '#fde68a',
                color: '#b45309',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>Sure Voters ({sureCount})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('contacts')}
              className="btn btn-primary"
              style={{
                height: '30px',
                padding: '0 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Contacts List</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Compact 5 KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        
        {/* Total Contacts */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab && onNavigateTab('contacts')}
          style={{ padding: '12px 14px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s ease' }}
          title="Click to view all contacts"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Contacts</span>
            <div style={{ padding: '5px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c' }}>
              <Users size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            {total}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
            All voters loaded
          </div>
        </div>

        {/* Sure Voters */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab && onNavigateTab('sure-voters')}
          style={{ padding: '12px 14px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s ease', borderColor: '#fde68a', background: '#fffdf5' }}
          title="Click to view confirmed sure voters"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700 }}>⭐ Sure Voters</span>
            <div style={{ padding: '5px', borderRadius: '8px', background: '#fef3c7', color: '#d97706' }}>
              <Star size={15} fill="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#b45309', lineHeight: 1.1 }}>
            {sureCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '3px', fontWeight: 600 }}>
            {surePercent}% of total list
          </div>
        </div>

        {/* Messaged */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab && onNavigateTab('contacts')}
          style={{ padding: '12px 14px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s ease' }}
          title="Click to view messaged contacts"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>Messaged</span>
            <div style={{ padding: '5px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
            {contacted}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
            <TrendingUp size={11} />
            <span>{progressPercent}% Complete</span>
          </div>
        </div>

        {/* Pending */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab && onNavigateTab('contacts')}
          style={{ padding: '12px 14px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s ease' }}
          title="Click to view pending contacts"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Pending</span>
            <div style={{ padding: '5px', borderRadius: '8px', background: '#fffbeb', color: '#d97706' }}>
              <Clock size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>
            {pending}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '3px' }}>
            Awaiting outreach
          </div>
        </div>

        {/* Wards & Localities */}
        <div
          className="glass-panel"
          onClick={() => onNavigateTab && onNavigateTab('localities')}
          style={{ padding: '12px 14px', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.15s ease' }}
          title="Click to view Ward & Locality Master"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Wards & Areas</span>
            <div style={{ padding: '5px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <Landmark size={15} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#2563eb', lineHeight: 1.1 }}>
            {wards.length || 4}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '3px' }}>
            {localities.length} Localities mapped
          </div>
        </div>

      </div>

      {/* 3. Progress Breakdown & Quick Shortcuts Row (Compact) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        
        {/* Progress Breakdown Card */}
        <div className="section-card" style={{ padding: '14px 18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Outreach Completion Progress
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Completed messages vs total campaign list
              </span>
            </div>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#059669',
              background: '#ecfdf5',
              padding: '2px 10px',
              borderRadius: '16px',
              border: '1px solid #a7f3d0',
            }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '10px',
            background: '#f1f5f9',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ea580c 0%, #10b981 100%)',
              borderRadius: '8px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 700 }}>COMPLETED</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803d' }}>{contacted}</div>
              <div style={{ fontSize: '0.68rem', color: '#166534' }}>Messaged</div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.68rem', color: '#92400e', fontWeight: 700 }}>REMAINING</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b45309' }}>{pending}</div>
              <div style={{ fontSize: '0.68rem', color: '#92400e' }}>Pending</div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#fffdf5', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700 }}>SURE VOTERS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b45309' }}>{sureCount}</div>
              <div style={{ fontSize: '0.68rem', color: '#b45309' }}>⭐ Confirmed</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="section-card" style={{ padding: '14px 18px', borderRadius: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Quick Management Shortcuts
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Fast 1-click access to campaign operations
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="btn btn-primary"
              style={{
                height: '42px',
                padding: '0 10px',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <UserPlus size={16} />
              <span>Add Contact</span>
            </button>

            <button
              type="button"
              onClick={onOpenBulkModal}
              className="btn btn-secondary"
              style={{
                height: '42px',
                padding: '0 10px',
                justifyContent: 'center',
                gap: '8px',
                borderColor: '#c7d2fe',
                background: '#eef2ff',
                color: '#4338ca',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <FileSpreadsheet size={16} color="#4f46e5" />
              <span>Paste Bulk List</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('templates')}
              className="btn btn-secondary"
              style={{
                height: '42px',
                padding: '0 10px',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <MessageSquare size={16} color="#059669" />
              <span>Edit Templates</span>
            </button>

            <button
              type="button"
              onClick={onExportCSV}
              className="btn btn-secondary"
              style={{
                height: '42px',
                padding: '0 10px',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Download size={16} color="#64748b" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. NEW: Rich Bottom Section (Ward-wise Breakdown & Quick Outreach Queue) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        
        {/* Left: Ward-Wise Performance Breakdown */}
        <div className="section-card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Landmark size={15} color="#0284c7" />
                <span>Ward-wise Coverage & Status</span>
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Voters, sure voters and messaging progress by ward
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('localities')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0,
              }}
            >
              <span>Manage Wards</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Compact Ward Table */}
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textAlign: 'left', textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Ward</th>
                  <th style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'center' }}>⭐ Sure</th>
                  <th style={{ padding: '8px 10px', fontWeight: 700 }}>Progress</th>
                  <th style={{ padding: '8px 8px', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {wardBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                      No ward data available
                    </td>
                  </tr>
                ) : (
                  wardBreakdown.map((wb, idx) => {
                    const wardTotal = wb.total || 0;
                    const wardSure = wb.sureCount || 0;
                    const wardContacted = wb.contactedCount || 0;
                    const wardPct = wardTotal > 0 ? Math.round((wardContacted / wardTotal) * 100) : 0;
                    const isUnassigned = wb._id === 'Unassigned' || !wb._id;

                    return (
                      <tr key={wb._id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.1s ease' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {isUnassigned ? '📍 General / None' : `🏛️ ${wb._id}`}
                          </span>
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'center', fontWeight: 800, color: '#334155' }}>
                          {wardTotal}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: wardSure > 0 ? '#fef3c7' : '#f8fafc',
                            color: wardSure > 0 ? '#b45309' : '#94a3b8',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                          }}>
                            {wardSure}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', minWidth: '90px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${wardPct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', width: '28px' }}>
                              {wardPct}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (onFilterByWard) {
                                onFilterByWard(isUnassigned ? 'ALL' : wb._id);
                              } else if (onNavigateTab) {
                                onNavigateTab('contacts');
                              }
                            }}
                            style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              color: '#15803d',
                              borderRadius: '5px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Filter contacts for this ward"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Outreach Queue (Pending & Recent Contacts) */}
        <div className="section-card" style={{ padding: '16px 18px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} color="#ea580c" />
                <span>Quick Outreach Queue</span>
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Direct message or call recent voters from dashboard
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('contacts')}
              style={{
                background: 'none',
                border: 'none',
                color: '#ea580c',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0,
              }}
            >
              <span>All ({total})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Contacts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentContacts.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No contacts loaded yet. Use "Add Contact" or "Paste Bulk List" above.
              </div>
            ) : (
              recentContacts.map((contact) => (
                <div
                  key={contact._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    gap: '10px',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {contact.name}
                      </span>
                      {contact.isSureVoter && (
                        <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>⭐</span>
                      )}
                      <span className={contact.contacted ? 'badge badge-contacted' : 'badge badge-pending'} style={{ fontSize: '0.64rem', padding: '1px 5px' }}>
                        {contact.contacted ? 'Messaged' : 'Pending'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      <span style={{ fontFamily: 'monospace' }}>+91 {contact.phone}</span>
                      {contact.locality && (
                        <span>• 📍 {contact.locality}</span>
                      )}
                      {contact.ward && (
                        <span>• 🏛️ {contact.ward}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn btn-whatsapp"
                      onClick={() => {
                        if (onOpenSendMessage) {
                          onOpenSendMessage(contact);
                        } else {
                          window.open(`https://wa.me/91${contact.phone}`, '_blank');
                        }
                      }}
                      style={{
                        height: '26px',
                        padding: '0 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle size={12} fill="#ffffff" />
                      <span>WA</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-call"
                      onClick={() => {
                        if (onCallRedirect) {
                          onCallRedirect(contact);
                        } else {
                          window.location.href = `tel:${contact.phone}`;
                        }
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        padding: 0,
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Call Phone"
                    >
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
