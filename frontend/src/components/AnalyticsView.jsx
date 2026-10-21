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
    link.setAttribute('download', `outreach_analytics_${analyticsData.shareId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = analyticsData?.summary || { total: 0, called: 0, messaged: 0, untouched: 0, percentComplete: 0 };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '40px' }}>
      
      {/* Page Header */}
      <div className="view-header" style={{ marginBottom: '16px' }}>
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
              }}
            >
              <BarChart3 size={18} />
            </div>
            <h1 className="view-title">Campaign Outreach Analytics (आउटरीच एनालिटिक्स)</h1>
          </div>
          <p className="view-subtitle">
            ट्रैक करें कि शेयर की गई लिंक से किस-किस को कॉल किया, किस-किस को मैसेज भेजा और कितने बाकी (Untouched) हैं।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              fetchShareLinks();
              if (selectedShareId) fetchAnalyticsDetails(selectedShareId);
            }}
            disabled={loading || loadingDetails}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '6px' }}
            title="Refresh Live Analytics"
          >
            <RefreshCw size={14} className={loading || loadingDetails ? 'animate-spin' : ''} />
            <span>Live Refresh</span>
          </button>

          {analyticsData && (
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.82rem', gap: '6px' }}
              title="Download CSV Report"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Share Link Selector Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 18px',
          marginBottom: '16px',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
            📌 Select Shared Link (शेयर की गई लिंक चुनें):
          </span>

          {shareLinks.length > 0 ? (
            <select
              value={selectedShareId}
              onChange={(e) => setSelectedShareId(e.target.value)}
              className="input-field"
              style={{ height: '36px', fontSize: '0.84rem', padding: '4px 10px', minWidth: '260px', fontWeight: 600 }}
            >
              {shareLinks.map((s) => (
                <option key={s.shareId} value={s.shareId}>
                  {s.title} ({s.totalCount} Contacts) • {new Date(s.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                </option>
              ))}
            </select>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              No share links created yet. Click "Share Link" in Contacts list to create one.
            </span>
          )}
        </div>

        {selectedShareId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => handleCopyLink(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', gap: '5px' }}
              title="Copy Public Link URL"
            >
              {copiedId === selectedShareId ? <Check size={14} color="#059669" /> : <Copy size={14} />}
              <span>Copy Link</span>
            </button>

            <button
              onClick={() => handleOpenLink(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', gap: '5px' }}
              title="Open Public Caller Page in New Tab"
            >
              <ExternalLink size={14} color="#0284c7" />
              <span>Open Caller Page</span>
            </button>

            <button
              onClick={() => handleDeleteShare(selectedShareId)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
              title="Delete this link"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {shareLinks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px 20px', textAlign: 'center', background: '#ffffff' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Share2 size={28} />
          </div>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 700 }}>
            No Outreach Share Links Yet
          </h3>
          <p style={{ margin: '8px auto 20px', color: '#64748b', fontSize: '0.86rem', maxWidth: '440px' }}>
            Create your first public webpage link by clicking <strong>"Share Link"</strong> in the top navigation bar or Contacts list.
          </p>
        </div>
      ) : (
        <>
          {/* 4 Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            
            {/* 1. Total Contacts */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Contacts (कुल)
                </span>
                <Users size={16} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                {summary.total}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Assigned to this outreach link
              </div>
            </div>

            {/* 2. Called Contacts */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                  📞 Called (कॉल किए गए)
                </span>
                <Phone size={16} color="#059669" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {summary.called}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.called / summary.total) * 100) : 0}% Call Outreach Complete
              </div>
            </div>

            {/* 3. Messaged Contacts */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                  💬 Messaged (मैसेज भेजे)
                </span>
                <MessageCircle size={16} color="#15803d" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d', marginTop: '6px' }}>
                {summary.messaged}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.messaged / summary.total) * 100) : 0}% WhatsApp Reached
              </div>
            </div>

            {/* 4. Untouched Contacts */}
            <div className="glass-panel" style={{ padding: '14px 16px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
                  ⚪ Untouched (अछूते / बाकी)
                </span>
                <Clock size={16} color="#ea580c" />
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
                {summary.untouched}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#c2410c', marginTop: '2px', fontWeight: 600 }}>
                {summary.total > 0 ? Math.round((summary.untouched / summary.total) * 100) : 0}% Yet to be contacted
              </div>
            </div>

          </div>

          {/* Progress Bar Strip */}
          <div className="glass-panel" style={{ padding: '12px 18px', marginBottom: '16px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                Overall Outreach Progress: {summary.percentComplete}%
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {summary.total - summary.untouched} of {summary.total} contacts touched
              </span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${summary.percentComplete}%`,
                  background: 'linear-gradient(90deg, #10b981, #0284c7)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Contacts Table Card */}
          <div className="glass-panel" style={{ padding: '14px 16px', background: '#ffffff' }}>
            
            {/* Table Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 220px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search name, phone, locality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: statusFilter === 'ALL' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'ALL' ? '#0f172a' : '#64748b',
                    boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  All ({summary.total})
                </button>
                <button
                  onClick={() => setStatusFilter('CALLED')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: statusFilter === 'CALLED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'CALLED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'CALLED' ? '#047857' : '#64748b',
                    boxShadow: statusFilter === 'CALLED' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  📞 Called ({summary.called})
                </button>
                <button
                  onClick={() => setStatusFilter('MESSAGED')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: statusFilter === 'MESSAGED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'MESSAGED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'MESSAGED' ? '#166534' : '#64748b',
                    boxShadow: statusFilter === 'MESSAGED' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  💬 Messaged ({summary.messaged})
                </button>
                <button
                  onClick={() => setStatusFilter('UNTOUCHED')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: statusFilter === 'UNTOUCHED' ? 700 : 500,
                    border: 'none',
                    background: statusFilter === 'UNTOUCHED' ? '#ffffff' : 'transparent',
                    color: statusFilter === 'UNTOUCHED' ? '#c2410c' : '#64748b',
                    boxShadow: statusFilter === 'UNTOUCHED' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  ⚪ Untouched ({summary.untouched})
                </button>
              </div>

            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table className="contacts-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                    <th>Name / नाम</th>
                    <th>Phone Number / मोबाइल</th>
                    <th>Locality / क्षेत्र</th>
                    <th>Call Status (कॉल स्थिति)</th>
                    <th>WhatsApp Status (मैसेज स्थिति)</th>
                    <th>Overall Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No contacts match the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c, i) => (
                      <tr key={c.phone + i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>
                          #{c.serialNo || i + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                          {c.reference && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Ref: {c.reference}</div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                            +91 {c.phone}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.74rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                            📍 {c.locality || 'Mahima'}
                          </span>
                        </td>
                        <td>
                          {c.called ? (
                            <div>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                📞 Called ({c.callCount || 1}x)
                              </span>
                              {c.calledAt && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                  {new Date(c.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>— Not Called</span>
                          )}
                        </td>
                        <td>
                          {c.messaged ? (
                            <div>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                                💬 Messaged ({c.messageCount || 1}x)
                              </span>
                              {c.messagedAt && (
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                                  {new Date(c.messagedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>— Not Messaged</span>
                          )}
                        </td>
                        <td>
                          {(c.called || c.messaged || c.contacted) ? (
                            <span className="badge badge-contacted" style={{ fontSize: '0.72rem' }}>
                              ✅ Contacted
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
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

    </div>
  );
}
