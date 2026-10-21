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
} from 'lucide-react';

export default function AnalyticsView({ onToast }) {
  const [shareLinks, setShareLinks] = useState([]);
  const [selectedShareId, setSelectedShareId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CALLED' | 'MESSAGED' | 'UNTOUCHED'
  const [localityFilter, setLocalityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all share links
  const fetchShareLinks = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Fetch detailed analytics for the selected share link
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
    fetchShareLinks();
  }, []);

  useEffect(() => {
    if (selectedShareId) {
      fetchAnalyticsDetails(selectedShareId);
    }
  }, [selectedShareId]);

  // Copy share URL
  const handleCopyLink = (shareId) => {
    const url = `${window.location.origin}/?share=${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    if (onToast) onToast('Share link copied to clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Open share URL
  const handleOpenLink = (shareId) => {
    const url = `${window.location.origin}/?share=${shareId}`;
    window.open(url, '_blank');
  };

  // Delete share link
  const handleDeleteShare = async (shareId) => {
    if (!window.confirm('Are you sure you want to delete this share link? (क्या आप यह लिंक हटाना चाहते हैं?)')) {
      return;
    }
    try {
      const res = await fetch(`/api/shares/${shareId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Share link deleted successfully', 'info');
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

  // Filter contacts of selected link
  const filteredContacts = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData.contacts)) return [];
    return analyticsData.contacts.filter((c) => {
      // Status filter
      if (statusFilter === 'CALLED' && !c.called) return false;
      if (statusFilter === 'MESSAGED' && !c.messaged) return false;
      if (statusFilter === 'UNTOUCHED' && (c.called || c.messaged || c.contacted)) return false;

      // Locality filter
      if (localityFilter !== 'ALL') {
        const cLoc = (c.locality || 'Mahima').trim().toLowerCase();
        if (cLoc !== localityFilter.trim().toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').includes(q);
        const matchesLoc = (c.locality || '').toLowerCase().includes(q);
        const matchesRef = (c.reference || '').toLowerCase().includes(q);
        const matchesSerial = String(c.serialNo || '').includes(q);
        return matchesName || matchesPhone || matchesLoc || matchesRef || matchesSerial;
      }
      return true;
    });
  }, [analyticsData, statusFilter, searchQuery]);

  // Export Analytics CSV
  const handleExportCSV = () => {
    if (!analyticsData || !analyticsData.contacts) return;
    const headers = ['Serial No', 'Name', 'Phone', 'Locality', 'Reference', 'Called Status', 'Called Time', 'WhatsApp Status', 'Messaged Time', 'Overall Status'];
    const rows = analyticsData.contacts.map((c, i) => [
      c.serialNo || i + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.locality || 'Mahima'}"`,
      `"${c.reference || ''}"`,
      c.called ? 'Yes' : 'No',
      c.calledAt ? new Date(c.calledAt).toLocaleString() : '—',
      c.messaged ? 'Yes' : 'No',
      c.messagedAt ? new Date(c.messagedAt).toLocaleString() : '—',
      (c.called || c.messaged || c.contacted) ? 'Contacted' : 'Untouched',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_analytics_${selectedShareId || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast('Analytics CSV exported successfully! 📊');
  };

  const summary = analyticsData?.summary || {
    total: 0,
    called: 0,
    messaged: 0,
    both: 0,
    untouched: 0,
    percentComplete: 0,
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '90px' }}>
      
      {/* Desktop Header (Hidden on mobile to prevent duplicate title clutter) */}
      <div className="view-header hide-on-mobile" style={{ marginBottom: '14px', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              <BarChart3 size={16} />
            </div>
            <h1 className="view-title">
              Outreach Analytics (आउटरीच एनालिटिक्स)
            </h1>
          </div>
          <p className="view-subtitle">
            शेयर लिंक ट्रैकिंग: कॉल, व्हाट्सएप मैसेज और अछूते (Untouched) कॉन्टैक्ट्स की रिपोर्ट
          </p>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => {
              fetchShareLinks();
              if (selectedShareId) fetchAnalyticsDetails(selectedShareId);
            }}
            disabled={loading || loadingDetails}
            className="btn btn-secondary"
            style={{ padding: '6px 11px', fontSize: '0.8rem', gap: '5px' }}
            title="Refresh Live Analytics"
          >
            <RefreshCw size={13} className={loading || loadingDetails ? 'animate-spin' : ''} />
            <span>Live Refresh</span>
          </button>

          {analyticsData && (
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{ padding: '6px 11px', fontSize: '0.8rem', gap: '5px' }}
              title="Download CSV Report"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Share Link Selector Banner (Compact, self-contained for mobile & desktop) */}
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
            <button
              onClick={() => {
                fetchShareLinks();
                if (selectedShareId) fetchAnalyticsDetails(selectedShareId);
              }}
              disabled={loading || loadingDetails}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
              title="Refresh Live Analytics"
            >
              <RefreshCw size={12} className={loading || loadingDetails ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {analyticsData && (
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
                title="Download CSV Report"
              >
                <Download size={12} />
                <span>CSV</span>
              </button>
            )}
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
            No links generated yet. Click "Share Link" in top navbar.
          </div>
        )}

        {/* Action Buttons for Selected Link */}
        {selectedShareId && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
            <button
              onClick={() => handleCopyLink(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', flex: 1, justifyContent: 'center' }}
              title="Copy Public Link URL"
            >
              {copiedId === selectedShareId ? <Check size={13} color="#059669" /> : <Copy size={13} />}
              <span>Copy Link</span>
            </button>

            <button
              onClick={() => handleOpenLink(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.76rem', gap: '4px', flex: 1, justifyContent: 'center' }}
              title="Open Public Caller Page in New Tab"
            >
              <ExternalLink size={13} color="#0284c7" />
              <span>Open Page</span>
            </button>

            <button
              onClick={() => handleDeleteShare(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 8px', fontSize: '0.76rem', color: '#dc2626', borderColor: '#fecaca' }}
              title="Delete this link"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {shareLinks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '36px 16px', textAlign: 'center', background: '#ffffff' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Share2 size={24} />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
            No Outreach Share Links Yet
          </h3>
          <p style={{ margin: '6px auto 16px', color: '#64748b', fontSize: '0.82rem', maxWidth: '400px' }}>
            Create your first public webpage link by clicking <strong>"Share Link"</strong> in the top navigation bar.
          </p>
        </div>
      ) : (
        <>
          {/* 4 Summary Metric Cards - Responsive 2x2 grid */}
          <div
            className="metric-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {/* 1. Total Contacts */}
            <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total (कुल)
                </span>
                <Users size={14} color="#0284c7" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', lineHeight: 1.1 }}>
                {summary.total}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                Assigned contacts
              </div>
            </div>

            {/* 2. Called Contacts */}
            <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  📞 Called
                </span>
                <Phone size={14} color="#059669" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px', lineHeight: 1.1 }}>
                {summary.called}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.called / summary.total) * 100) : 0}% Complete
              </div>
            </div>

            {/* 3. Messaged Contacts */}
            <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  💬 Messaged
                </span>
                <MessageCircle size={14} color="#15803d" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '2px', lineHeight: 1.1 }}>
                {summary.messaged}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.messaged / summary.total) * 100) : 0}% Reached
              </div>
            </div>

            {/* 4. Untouched Contacts */}
            <div className="glass-panel metric-card-box" style={{ padding: '10px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                  ⚪ Untouched
                </span>
                <Clock size={14} color="#ea580c" />
              </div>
              <div className="metric-card-number" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c', marginTop: '2px', lineHeight: 1.1 }}>
                {summary.untouched}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#c2410c', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.untouched / summary.total) * 100) : 0}% Remaining
              </div>
            </div>
          </div>

          {/* Progress Bar Strip */}
          <div className="glass-panel" style={{ padding: '10px 14px', marginBottom: '12px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                Progress: {summary.percentComplete}%
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {summary.called + summary.messaged} of {summary.total} touched
              </span>
            </div>
            <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, summary.percentComplete))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #059669)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Contacts List Card */}
          <div className="glass-panel" style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              
              {/* Search */}
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

              {/* Locality Filter Dropdown */}
              <select
                className="input-field"
                value={localityFilter}
                onChange={(e) => setLocalityFilter(e.target.value)}
                style={{
                  width: 'auto',
                  padding: '2px 10px',
                  fontSize: '0.78rem',
                  height: '32px',
                  borderColor: localityFilter !== 'ALL' ? '#f59e0b' : '#cbd5e1',
                  background: localityFilter !== 'ALL' ? '#fef3c7' : '#ffffff',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
                title="Filter by Locality"
              >
                <option value="ALL">📍 All Localities (सभी)</option>
                <option value="Mahima">📍 Mahima (महिमा)</option>
              </select>

              {/* Status Filter Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  background: '#f1f5f9',
                  padding: '2px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  maxWidth: '100%',
                }}
              >
                <button
                  onClick={() => setStatusFilter('ALL')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'ALL' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'ALL' ? '#0f172a' : '#64748b',
                    boxShadow: statusFilter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  All ({summary.total})
                </button>
                <button
                  onClick={() => setStatusFilter('CALLED')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'CALLED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'CALLED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'CALLED' ? '#047857' : '#64748b',
                    boxShadow: statusFilter === 'CALLED' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📞 Called ({summary.called})
                </button>
                <button
                  onClick={() => setStatusFilter('MESSAGED')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'MESSAGED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'MESSAGED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'MESSAGED' ? '#166534' : '#64748b',
                    boxShadow: statusFilter === 'MESSAGED' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  💬 Messaged ({summary.messaged})
                </button>
                <button
                  onClick={() => setStatusFilter('UNTOUCHED')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    fontWeight: statusFilter === 'UNTOUCHED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'UNTOUCHED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'UNTOUCHED' ? '#c2410c' : '#64748b',
                    boxShadow: statusFilter === 'UNTOUCHED' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚪ Untouched ({summary.untouched})
                </button>
              </div>

            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hide-on-mobile" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table className="contacts-table" style={{ width: '100%', fontSize: '0.8rem', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center', padding: '9px 8px' }}>#</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>Name / नाम</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>Mobile / फोन</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>Locality / क्षेत्र</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>Call Status</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>WhatsApp Status</th>
                    <th style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No contacts match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c, i) => (
                      <tr key={c.phone + i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7', padding: '8px 6px' }}>
                          #{c.serialNo || i + 1}
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                          {c.reference && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ref: {c.reference}</div>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                            +91 {c.phone}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', padding: '2px 7px', borderRadius: '6px', fontWeight: 600 }}>
                            📍 {c.locality || 'Mahima'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          {c.called ? (
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 7px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                📞 Called ({c.callCount || 1}x)
                              </span>
                              {c.calledAt && (
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                                  {new Date(c.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>— Not Called</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                          {c.messaged ? (
                            <div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                💬 Messaged ({c.messageCount || 1}x)
                              </span>
                              {c.messagedAt && (
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                                  {new Date(c.messagedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>— Not Messaged</span>
                          )}
                        </td>
                        <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
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

            {/* Mobile Contact Cards (Clean, readable on phone without side scrolling) */}
            <div className="mobile-only-cards" style={{ display: 'none', flexDirection: 'column', gap: '8px' }}>
              {filteredContacts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.82rem' }}>
                  No contacts match the filter criteria.
                </div>
              ) : (
                filteredContacts.map((c, i) => (
                  <div
                    key={c.phone + i}
                    style={{
                      background: '#fafafa',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '9px 11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                          #{c.serialNo || i + 1}
                        </span>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                        📍 {c.locality || 'Mahima'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                        +91 {c.phone}
                      </span>

                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {c.called && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            📞 Called
                          </span>
                        )}
                        {c.messaged && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '1px 5px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                            💬 Messaged
                          </span>
                        )}
                        {!c.called && !c.messaged && !c.contacted && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c2410c', background: '#fff7ed', padding: '1px 5px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                            ⚪ Untouched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
