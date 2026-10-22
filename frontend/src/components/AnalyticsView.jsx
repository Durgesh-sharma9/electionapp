import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Phone,
  MessageCircle,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Share2,
  Calendar,
  MapPin,
  TrendingUp,
  Download,
  AlertCircle,
  Award,
  Target,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AnalyticsView({
  contacts = [],
  stats = null,
  wards = [],
  localities = [],
  onOpenShareModal,
  onToast,
}) {
  // Sub-tabs: 'campaign' (Ward & Voters Analytics) vs 'shares' (Share link caller actions)
  const [activeSubTab, setActiveSubTab] = useState('campaign');

  // ==============================================================
  // 1. CAMPAIGN & WARD ANALYTICS STATE
  // ==============================================================
  const [wardFilter, setWardFilter] = useState('ALL');
  const [localityFilter, setLocalityFilter] = useState('ALL');
  const [sureFilter, setSureFilter] = useState('ALL'); // 'ALL' | 'SURE_ONLY' | 'PENDING_SURE'
  const [campaignSearch, setCampaignSearch] = useState('');

  // Overall Campaign Metrics
  const totalVoters = useMemo(() => {
    return contacts.reduce((sum, c) => sum + (c.voterCount || 1), 0);
  }, [contacts]);
  const totalFamilies = contacts.length;
  const sureVotersCount = useMemo(() => {
    return contacts.filter((c) => c.isSureVoter).reduce((sum, c) => sum + (c.voterCount || 1), 0);
  }, [contacts]);
  const contactedVotersCount = useMemo(() => {
    return contacts.filter((c) => c.contacted).reduce((sum, c) => sum + (c.voterCount || 1), 0);
  }, [contacts]);
  const pendingVotersCount = totalVoters - contactedVotersCount;

  const surePercentage = totalVoters > 0 ? Math.round((sureVotersCount / totalVoters) * 100) : 0;
  const contactedPercentage = totalVoters > 0 ? Math.round((contactedVotersCount / totalVoters) * 100) : 0;

  // Ward-wise Aggregation
  const wardBreakdown = useMemo(() => {
    const list = wards.length > 0 ? wards : [{ _id: 'default', name: 'Ward 1', targetVoters: 500 }];
    return list.map((w) => {
      const wardContacts = contacts.filter((c) => (c.ward || '') === w.name);
      const total = wardContacts.reduce((sum, c) => sum + (c.voterCount || 1), 0);
      const totalFamilies = wardContacts.length;
      const sure = wardContacts.filter((c) => c.isSureVoter).reduce((sum, c) => sum + (c.voterCount || 1), 0);
      const contacted = wardContacts.filter((c) => c.contacted).reduce((sum, c) => sum + (c.voterCount || 1), 0);
      const target = Number(w.targetVoters) || 0;
      const percentOfTotal = total > 0 ? Math.round((sure / total) * 100) : 0;
      const percentOfTarget = target > 0 ? Math.min(100, Math.round((sure / target) * 100)) : 0;
      return {
        ...w,
        total,
        totalFamilies,
        sure,
        contacted,
        target,
        percentOfTotal,
        percentOfTarget,
      };
    });
  }, [wards, contacts]);

  // Locality Breakdown
  const localityBreakdown = useMemo(() => {
    return localities.map((loc) => {
      const locContacts = contacts.filter((c) => c.locality === loc.name);
      const total = locContacts.reduce((sum, c) => sum + (c.voterCount || 1), 0);
      const totalFamilies = locContacts.length;
      const sure = locContacts.filter((c) => c.isSureVoter).reduce((sum, c) => sum + (c.voterCount || 1), 0);
      const contacted = locContacts.filter((c) => c.contacted).reduce((sum, c) => sum + (c.voterCount || 1), 0);
      return {
        ...loc,
        total,
        totalFamilies,
        sure,
        contacted,
        percentSure: total > 0 ? Math.round((sure / total) * 100) : 0,
      };
    });
  }, [localities, contacts]);

  // Filtered Campaign Voters for Table
  const filteredCampaignContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (wardFilter !== 'ALL') {
        if (wardFilter === 'UNASSIGNED') {
          if (c.ward && c.ward.trim() !== '') return false;
        } else if (c.ward !== wardFilter) {
          return false;
        }
      }
      if (localityFilter !== 'ALL' && c.locality !== localityFilter) return false;
      if (sureFilter === 'SURE_ONLY' && !c.isSureVoter) return false;
      if (sureFilter === 'PENDING_SURE' && c.isSureVoter) return false;

      if (campaignSearch.trim()) {
        const q = campaignSearch.toLowerCase().trim();
        const mName = (c.name || '').toLowerCase().includes(q);
        const mPhone = (c.phone || '').includes(q);
        const mLoc = (c.locality || '').toLowerCase().includes(q);
        const mRef = (c.reference || '').toLowerCase().includes(q);
        return mName || mPhone || mLoc || mRef;
      }
      return true;
    });
  }, [contacts, wardFilter, localityFilter, sureFilter, campaignSearch]);

  // Export Campaign Analytics CSV
  const handleExportCampaignCSV = () => {
    const headers = ['Serial No', 'Name', 'Votes in Family', 'Phone', 'Ward', 'Locality', 'Reference', 'Sure Voter (⭐)', 'Contacted Status', 'Notes'];
    const rows = filteredCampaignContacts.map((c, i) => [
      c.serialNo || i + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.voterCount || 1,
      `"${c.phone}"`,
      `"${c.ward || '—'}"`,
      `"${c.locality || ''}"`,
      `"${c.reference || ''}"`,
      c.isSureVoter ? `YES (${c.voterCount || 1} Votes)` : 'NO',
      c.contacted ? 'Contacted' : 'Pending',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campaign_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Campaign Analytics CSV exported! 📊');
  };

  // ==============================================================
  // 2. PUBLIC SHARE LINKS & CALLER ANALYTICS STATE
  // ==============================================================
  const [shareLinks, setShareLinks] = useState([]);
  const [selectedShareId, setSelectedShareId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingShares, setLoadingShares] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [shareLocalityFilter, setShareLocalityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchShareLinks = async () => {
    try {
      setLoadingShares(true);
      const res = await fetch('/api/shares');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setShareLinks(data.data);
        if (data.data.length > 0 && !selectedShareId) {
          setSelectedShareId(data.data[0].shareId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch share links:', err);
    } finally {
      setLoadingShares(false);
    }
  };

  const fetchAnalyticsDetails = async (shareId) => {
    if (!shareId) return;
    try {
      setLoadingDetails(true);
      const res = await fetch(`/api/shares/${shareId}/analytics`);
      const data = await res.json();
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'shares') {
      fetchShareLinks();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (activeSubTab === 'shares' && selectedShareId) {
      fetchAnalyticsDetails(selectedShareId);
    }
  }, [selectedShareId, activeSubTab]);

  const handleCopyLink = (shareId) => {
    const url = `${window.location.origin}/?share=${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    if (onToast) onToast('Share link copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenLink = (shareId) => {
    const url = `${window.location.origin}/?share=${shareId}`;
    window.open(url, '_blank');
  };

  const handleDeleteShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to delete this share link?')) return;
    try {
      const res = await fetch(`/api/shares/${shareId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Share link deleted');
        const remaining = shareLinks.filter((s) => s.shareId !== shareId);
        setShareLinks(remaining);
        if (selectedShareId === shareId) {
          setSelectedShareId(remaining[0]?.shareId || '');
          setAnalyticsData(null);
        }
      }
    } catch (err) {
      alert('Failed to delete share link: ' + err.message);
    }
  };

  const filteredShareContacts = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData.contacts)) return [];
    return analyticsData.contacts.filter((c) => {
      if (statusFilter === 'CALLED' && !c.called) return false;
      if (statusFilter === 'MESSAGED' && !c.messaged) return false;
      if (statusFilter === 'UNTOUCHED' && (c.called || c.messaged || c.contacted)) return false;

      if (shareLocalityFilter !== 'ALL') {
        const cLoc = (c.locality || '').trim().toLowerCase();
        if (cLoc !== shareLocalityFilter.trim().toLowerCase()) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').includes(q);
        return matchesName || matchesPhone;
      }
      return true;
    });
  }, [analyticsData, statusFilter, shareLocalityFilter, searchQuery]);

  const shareSummary = analyticsData?.summary || {
    total: 0,
    called: 0,
    messaged: 0,
    both: 0,
    untouched: 0,
    percentComplete: 0,
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '90px' }}>
      
      {/* View Header with Dual-Tab Switcher */}
      <div className="view-header" style={{ marginBottom: '16px', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <BarChart3 size={18} />
            </div>
            <h1 className="view-title">
              Campaign & Outreach Analytics
            </h1>
          </div>
          <p className="view-subtitle">
            Live Ward breakdown, confirmed Sure Voters progress, and caller tracking
          </p>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('campaign')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'campaign' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'campaign' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSubTab === 'campaign' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🗳️ Ward & Sure Voters</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('shares')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: activeSubTab === 'shares' ? '#ffffff' : 'transparent',
              color: activeSubTab === 'shares' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeSubTab === 'shares' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🔗 Public Share Links</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: WARD & CAMPAIGN VOTERS ANALYTICS                      */}
      {/* ============================================================== */}
      {activeSubTab === 'campaign' && (
        <>
          {/* Top 4 KPI Metrics */}
          <div
            className="metric-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            {/* 1. Total Registered Voters */}
            <div className="glass-panel metric-card-box" style={{ padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Voters
                </span>
                <Users size={16} color="#0284c7" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                {totalVoters}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                {totalFamilies} Families • {wards.length} Wards
              </div>
            </div>

            {/* 2. Confirmed Sure Voters ⭐ */}
            <div className="glass-panel metric-card-box" style={{ padding: '12px 14px', background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                  ⭐ Sure Voters
                </span>
                <Award size={16} color="#d97706" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: '3px' }}>
                {sureVotersCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: '2px', fontWeight: 700 }}>
                {surePercentage}% of {totalVoters} Votes
              </div>
            </div>

            {/* 3. Reached / Contacted */}
            <div className="glass-panel metric-card-box" style={{ padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  💬 Contacted
                </span>
                <CheckCircle2 size={16} color="#059669" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: '3px' }}>
                {contactedVotersCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
                {contactedPercentage}% Reached Out
              </div>
            </div>

            {/* 4. Pending Outreach */}
            <div className="glass-panel metric-card-box" style={{ padding: '12px 14px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                  ⏳ Pending
                </span>
                <Clock size={16} color="#ea580c" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c', marginTop: '3px' }}>
                {pendingVotersCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#c2410c', marginTop: '2px', fontWeight: 600 }}>
                {totalVoters > 0 ? 100 - contactedPercentage : 0}% Pending
              </div>
            </div>
          </div>

          {/* Sure Voters Overall Target Bar */}
          <div className="glass-panel" style={{ padding: '12px 16px', marginBottom: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                  Campaign Sure Voters Strength: {surePercentage}%
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                <strong>{sureVotersCount}</strong> of {totalVoters} Voters Confirmed
              </span>
            </div>
            <div style={{ width: '100%', height: '10px', background: '#fef3c7', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, surePercentage))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  borderRadius: '6px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Ward Performance Summary Table */}
          <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                    Ward-Wise Performance & Sure Voter Targets
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Real-time registered voter breakdown and sure target achievement per ward
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportCampaignCSV}
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem', gap: '5px' }}
              >
                <Download size={13} />
                <span>Export Ward Report</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>WARD</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>REGISTERED</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>⭐ SURE VOTERS</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>WARD TARGET</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>TARGET REACHED</th>
                    <th style={{ padding: '10px 12px', fontWeight: 700, color: '#475569' }}>CONTACTED</th>
                  </tr>
                </thead>
                <tbody>
                  {wardBreakdown.map((w) => (
                    <tr key={w.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0f172a' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 9px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                          🏛️ {w.name}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#334155' }}>
                        {w.total} Voters
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #fde68a' }}>
                          ⭐ {w.sure} ({w.percentOfTotal}%)
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: 600 }}>
                        {w.target > 0 ? `🎯 ${w.target}` : <span style={{ color: '#94a3b8' }}>— Not set</span>}
                      </td>
                      <td style={{ padding: '10px 12px', minWidth: '150px' }}>
                        {w.target > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${w.percentOfTarget}%`,
                                  height: '100%',
                                  background: w.percentOfTarget >= 75 ? '#10b981' : '#f59e0b',
                                  borderRadius: '4px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
                              {w.percentOfTarget}%
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          ✅ {w.contacted}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Locality Grid Breakdown */}
          {localityBreakdown.length > 0 && (
            <div className="glass-panel" style={{ padding: '16px', marginBottom: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={16} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                  Locality & Area Breakdown
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {localityBreakdown.map((loc) => (
                  <div
                    key={loc._id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                        📍 {loc.name}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#1d4ed8', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {loc.ward || 'General'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#475569', marginTop: '6px' }}>
                      <span>Total: <strong>{loc.total}</strong></span>
                      <span style={{ color: '#b45309', fontWeight: 700 }}>⭐ Sure: {loc.sure} ({loc.percentSure}%)</span>
                    </div>

                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${loc.percentSure}%`,
                          height: '100%',
                          background: '#f59e0b',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Voter List with Filters */}
          <div className="glass-panel" style={{ padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                Voter Directory ({filteredCampaignContacts.length} Contacts)
              </h3>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search voter..."
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '28px', height: '32px', fontSize: '0.78rem', width: '140px' }}
                  />
                </div>

                {/* Ward Filter */}
                <select
                  className="input-field"
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  style={{ height: '32px', fontSize: '0.78rem', padding: '2px 8px', fontWeight: 600 }}
                >
                  <option value="ALL">🏛️ All Wards</option>
                  <option value="UNASSIGNED">Unassigned Ward</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>

                {/* Sure Filter */}
                <select
                  className="input-field"
                  value={sureFilter}
                  onChange={(e) => setSureFilter(e.target.value)}
                  style={{
                    height: '32px',
                    fontSize: '0.78rem',
                    padding: '2px 8px',
                    fontWeight: 700,
                    background: sureFilter === 'SURE_ONLY' ? '#fef3c7' : '#ffffff',
                    borderColor: sureFilter === 'SURE_ONLY' ? '#f59e0b' : '#cbd5e1',
                  }}
                >
                  <option value="ALL">All Support</option>
                  <option value="SURE_ONLY">⭐ Sure Voters Only</option>
                  <option value="PENDING_SURE">Pending Decision</option>
                </select>
              </div>
            </div>

            {/* Contacts Table */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 10px', width: '40px' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>NAME</th>
                    <th style={{ padding: '8px 10px' }}>FAMILY VOTES</th>
                    <th style={{ padding: '8px 10px' }}>PHONE</th>
                    <th style={{ padding: '8px 10px' }}>WARD</th>
                    <th style={{ padding: '8px 10px' }}>LOCALITY</th>
                    <th style={{ padding: '8px 10px' }}>SURE STATUS</th>
                    <th style={{ padding: '8px 10px' }}>CONTACTED</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaignContacts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No voters found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaignContacts.map((c, i) => (
                      <tr key={c._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0284c7', fontFamily: 'monospace' }}>
                          #{c.serialNo || i + 1}
                        </td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>
                          {c.name}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontSize: '0.74rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #bae6fd' }}>
                            👥 {c.voterCount || 1} { (c.voterCount || 1) > 1 ? 'Votes' : 'Vote'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#334155' }}>
                          +91 {c.phone}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>
                            🏛️ {c.ward || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                            📍 {c.locality || 'Mahima'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {c.isSureVoter ? (
                            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                              ⭐ Sure ({c.voterCount || 1} { (c.voterCount || 1) > 1 ? 'Votes' : 'Vote'})
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>— Not Confirmed</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          {c.contacted ? (
                            <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ✅ Contacted
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>⏳ Pending</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: PUBLIC SHARE LINKS & CALLER ANALYTICS                */}
      {/* ============================================================== */}
      {activeSubTab === 'shares' && (
        <>
          {/* Share Link Selector Banner */}
          <div
            className="glass-panel"
            style={{
              padding: '12px 14px',
              marginBottom: '14px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  📌 Select Shared Link:
                </span>
                <span style={{ fontSize: '0.72rem', color: '#0284c7', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {shareLinks.length} Links
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {onOpenShareModal && (
                  <button
                    type="button"
                    onClick={onOpenShareModal}
                    className="btn btn-primary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      gap: '4px',
                      background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                      borderRadius: '6px',
                    }}
                  >
                    <Share2 size={12} />
                    <span>+ New Link</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    fetchShareLinks();
                    if (selectedShareId) fetchAnalyticsDetails(selectedShareId);
                  }}
                  disabled={loadingShares || loadingDetails}
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
                >
                  <RefreshCw size={12} className={loadingShares || loadingDetails ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Dropdown Selector */}
            {shareLinks.length > 0 ? (
              <select
                value={selectedShareId}
                onChange={(e) => setSelectedShareId(e.target.value)}
                className="input-field"
                style={{ height: '36px', fontSize: '0.82rem', padding: '4px 8px', width: '100%', fontWeight: 600, marginBottom: '8px' }}
              >
                {shareLinks.map((s) => (
                  <option key={s.shareId} value={s.shareId}>
                    {s.title} ({s.totalCount} Contacts) • {new Date(s.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '6px 0' }}>
                No outreach share links active right now.
              </div>
            )}

            {/* Action Buttons for Selected Link */}
            {selectedShareId && (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedShareId)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', flex: 1, justifyContent: 'center' }}
                >
                  {copiedId === selectedShareId ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                  <span>Copy Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenLink(selectedShareId)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', flex: 1, justifyContent: 'center' }}
                >
                  <ExternalLink size={13} color="#0284c7" />
                  <span>Open Page</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteShare(selectedShareId)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 8px', fontSize: '0.76rem', color: '#dc2626', borderColor: '#fecaca' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {shareLinks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px 16px', textAlign: 'center', background: '#ffffff', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Share2 size={24} />
              </div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
                No Outreach Share Links Yet
              </h3>
              <p style={{ margin: '6px auto 16px', color: '#64748b', fontSize: '0.82rem', maxWidth: '400px' }}>
                Generate a shareable outreach webpage link using the <strong>"Share Link"</strong> button in the top navigation bar or the button below.
              </p>
              {onOpenShareModal && (
                <button
                  type="button"
                  onClick={onOpenShareModal}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.28)',
                  }}
                >
                  <Share2 size={15} />
                  <span>+ Create Share Link</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <div
                className="metric-cards-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px',
                }}
              >
                <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Assigned
                    </span>
                    <Users size={14} color="#0284c7" />
                  </div>
                  <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {shareSummary.total}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    In this link
                  </div>
                </div>

                <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                      📞 Called
                    </span>
                    <Phone size={14} color="#059669" />
                  </div>
                  <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    {shareSummary.called}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 600 }}>
                    {shareSummary.total > 0 ? Math.round((shareSummary.called / shareSummary.total) * 100) : 0}% Done
                  </div>
                </div>

                <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      💬 Messaged
                    </span>
                    <MessageCircle size={14} color="#15803d" />
                  </div>
                  <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                    {shareSummary.messaged}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 600 }}>
                    {shareSummary.total > 0 ? Math.round((shareSummary.messaged / shareSummary.total) * 100) : 0}% Reached
                  </div>
                </div>

                <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                      ⚪ Untouched
                    </span>
                    <Clock size={14} color="#ea580c" />
                  </div>
                  <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                    {shareSummary.untouched}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 600 }}>
                    {shareSummary.total > 0 ? Math.round((shareSummary.untouched / shareSummary.total) * 100) : 0}% Remaining
                  </div>
                </div>
              </div>

              {/* Progress Bar Strip */}
              <div className="glass-panel" style={{ padding: '10px 14px', marginBottom: '12px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    Outreach Progress: {shareSummary.percentComplete}%
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {shareSummary.called + shareSummary.messaged} of {shareSummary.total} touched
                  </span>
                </div>
                <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(0, shareSummary.percentComplete))}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #0284c7, #059669)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Contacts Table */}
              <div className="glass-panel" style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ position: 'relative', flex: '1 1 180px' }}>
                    <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search name, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '30px', height: '32px', fontSize: '0.8rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '3px', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: statusFilter === 'ALL' ? 700 : 500,
                        border: 'none',
                        background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                        color: statusFilter === 'ALL' ? '#0f172a' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      All ({shareSummary.total})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('CALLED')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: statusFilter === 'CALLED' ? 700 : 500,
                        border: 'none',
                        background: statusFilter === 'CALLED' ? '#ffffff' : 'transparent',
                        color: statusFilter === 'CALLED' ? '#047857' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      📞 Called ({shareSummary.called})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('MESSAGED')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: statusFilter === 'MESSAGED' ? 700 : 500,
                        border: 'none',
                        background: statusFilter === 'MESSAGED' ? '#ffffff' : 'transparent',
                        color: statusFilter === 'MESSAGED' ? '#166534' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      💬 Messaged ({shareSummary.messaged})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter('UNTOUCHED')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: statusFilter === 'UNTOUCHED' ? 700 : 500,
                        border: 'none',
                        background: statusFilter === 'UNTOUCHED' ? '#ffffff' : 'transparent',
                        color: statusFilter === 'UNTOUCHED' ? '#c2410c' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      ⚪ Untouched ({shareSummary.untouched})
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                  <table className="contacts-table" style={{ width: '100%', fontSize: '0.8rem', minWidth: '600px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center', padding: '9px 8px' }}>#</th>
                        <th style={{ padding: '9px 10px' }}>Name</th>
                        <th style={{ padding: '9px 10px' }}>Phone</th>
                        <th style={{ padding: '9px 10px' }}>Locality</th>
                        <th style={{ padding: '9px 10px' }}>Call Status</th>
                        <th style={{ padding: '9px 10px' }}>WhatsApp Status</th>
                        <th style={{ padding: '9px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShareContacts.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                            No contacts match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredShareContacts.map((c, i) => (
                          <tr key={c.phone + i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7', padding: '8px 6px' }}>
                              #{c.serialNo || i + 1}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                              {c.reference && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: {c.reference}</div>
                              )}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                                +91 {c.phone}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}>
                                📍 {c.locality || 'Mahima'}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {c.called ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 7px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                  📞 Called ({c.callCount || 1}x)
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>— Not Called</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {c.messaged ? (
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                  💬 Messaged ({c.messageCount || 1}x)
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>— Not Messaged</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              {(c.called || c.messaged || c.contacted) ? (
                                <span className="badge badge-contacted" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                  ✅ Contacted
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                  ⚪ Untouched
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

    </div>
  );
}
