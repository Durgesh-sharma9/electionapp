import React, { useState, useMemo } from 'react';
import {
  Star,
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Download,
  Search,
  Filter,
  Phone,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import ContactCard from './ContactCard';

export default function SureVotersView({
  contacts = [],
  wards = [],
  localities = [],
  references = [],
  onToggleSureVoter,
  onStatusChange,
  onWhatsAppRedirect,
  onOpenTemplateModal,
  onCallRedirect,
  onEditContact,
  onDeleteContact,
  onOpenAddModal,
  onBack,
  waConnected = false,
  onToast,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [localityFilter, setLocalityFilter] = useState('ALL');
  const [referenceFilter, setReferenceFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('SURE_ONLY'); // 'SURE_ONLY', 'PENDING_ONLY', 'ALL'
  const [selectedIds, setSelectedIds] = useState(new Set());

  // ----------------- ANALYTICS CALCULATIONS -----------------
  const totalFamilies = contacts.length;
  const totalCount = totalFamilies;
  const totalVotes = contacts.reduce((sum, c) => sum + (c.voterCount || 1), 0);
  const sureFamilies = contacts.filter((c) => c.isSureVoter).length;
  const sureCount = sureFamilies;
  const sureVotes = contacts.filter((c) => c.isSureVoter).reduce((sum, c) => sum + (c.voterCount || 1), 0);
  const remainingVotes = Math.max(0, totalVotes - sureVotes);
  const remainingFamilies = Math.max(0, totalFamilies - sureFamilies);
  const remainingCount = remainingFamilies;
  const surePercentage = totalVotes > 0 ? ((sureVotes / totalVotes) * 100).toFixed(1) : 0;

  // Ward breakdown (calculating both votes and families)
  const wardStats = useMemo(() => {
    const map = {};
    // Seed with all known wards
    wards.forEach((w) => {
      map[w.name] = { ward: w.name, total: 0, sure: 0, totalVotes: 0, sureVotes: 0 };
    });
    // Add default if none
    if (Object.keys(map).length === 0) {
      map['Ward 1'] = { ward: 'Ward 1', total: 0, sure: 0, totalVotes: 0, sureVotes: 0 };
    }

    contacts.forEach((c) => {
      const w = c.ward && c.ward.trim() ? c.ward : 'Unassigned';
      if (!map[w]) map[w] = { ward: w, total: 0, sure: 0, totalVotes: 0, sureVotes: 0 };
      const v = c.voterCount || 1;
      map[w].total += 1;
      map[w].totalVotes += v;
      if (c.isSureVoter) {
        map[w].sure += 1;
        map[w].sureVotes += v;
      }
    });

    return Object.values(map);
  }, [contacts, wards]);

  // Locality breakdown
  const localityStats = useMemo(() => {
    const map = {};
    contacts.forEach((c) => {
      const loc = c.locality && c.locality.trim() ? c.locality : 'Unassigned';
      if (!map[loc]) {
        map[loc] = {
          name: loc,
          ward: c.ward && c.ward.trim() ? c.ward : '—',
          total: 0,
          sure: 0,
          totalVotes: 0,
          sureVotes: 0,
        };
      }
      const v = c.voterCount || 1;
      map[loc].total += 1;
      map[loc].totalVotes += v;
      if (c.isSureVoter) {
        map[loc].sure += 1;
        map[loc].sureVotes += v;
      }
    });

    return Object.values(map).sort((a, b) => b.sureVotes - a.sureVotes);
  }, [contacts]);

  // Leading Ward by Sure Votes
  const topWard = useMemo(() => {
    if (wardStats.length === 0) return null;
    return [...wardStats].sort((a, b) => b.sureVotes - a.sureVotes)[0];
  }, [wardStats]);

  // ----------------- FILTERING -----------------
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Scope filter
      if (scopeFilter === 'SURE_ONLY' && !c.isSureVoter) return false;
      if (scopeFilter === 'PENDING_ONLY' && c.isSureVoter) return false;

      // Ward filter
      if (wardFilter !== 'ALL') {
        if (wardFilter === 'UNASSIGNED') {
          if (c.ward && c.ward.trim() !== '') return false;
        } else if (c.ward !== wardFilter) {
          return false;
        }
      }

      // Locality filter
      if (localityFilter !== 'ALL') {
        if (localityFilter === 'UNASSIGNED') {
          if (c.locality && c.locality.trim() !== '') return false;
        } else if (c.locality !== localityFilter) {
          return false;
        }
      }

      // Reference filter
      if (referenceFilter !== 'ALL') {
        if (referenceFilter === 'UNASSIGNED') {
          if (c.reference && c.reference.trim() !== '') return false;
        } else if (c.reference !== referenceFilter) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.includes(q);
        const matchLoc = c.locality?.toLowerCase().includes(q);
        const matchRef = c.reference?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchLoc && !matchRef) return false;
      }

      return true;
    }).sort((a, b) =>
      (a.name || '').trim().localeCompare((b.name || '').trim(), undefined, { sensitivity: 'base', numeric: true })
    );
  }, [contacts, scopeFilter, wardFilter, localityFilter, referenceFilter, searchQuery]);

  // Export Sure Voters CSV
  const handleExportCSV = () => {
    const listToExport = contacts.filter((c) => c.isSureVoter);
    if (listToExport.length === 0) {
      if (onToast) onToast('No sure voters to export yet.');
      return;
    }
    const headers = ['Serial', 'Name', 'Phone', 'Family Votes', 'Ward', 'Locality', 'Reference', 'Contacted', 'Notes'];
    const rows = listToExport.map((c, i) => [
      c.serialNo || i + 1,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      c.phone,
      c.voterCount || 1,
      `"${c.ward || '—'}"`,
      `"${(c.locality || '').replace(/"/g, '""')}"`,
      `"${(c.reference || '').replace(/"/g, '""')}"`,
      c.contacted ? 'Yes' : 'No',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mahapura_Sure_Voters_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast(`Exported ${listToExport.length} Sure Voters to CSV!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #fffdf5 0%, #ffffff 100%)',
          border: '1.5px solid #fde68a',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              color: '#ffffff',
            }}
          >
            ⭐
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
              Sure Voters Tracker & Analytics
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Track confirmed supporters, ward & locality conversion, and remaining voter outreach
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
              style={{
                padding: '7px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                gap: '5px',
                borderColor: '#cbd5e1',
                background: '#ffffff',
                color: '#334155',
              }}
              title="Return to Contacts Directory"
            >
              <ArrowLeft size={14} />
              <span>Back to Contacts</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-secondary"
            style={{
              padding: '7px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              gap: '6px',
              borderColor: '#fde68a',
              background: '#ffffff',
              color: '#b45309',
            }}
            title="Download CSV file of all Sure Voters"
          >
            <Download size={14} />
            <span>Export CSV ({sureCount})</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {/* Card 1: Confirmed Sure Voters */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: '#fffdf5',
            border: '1.5px solid #fde68a',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Confirmed Sure Votes
            </span>
            <span style={{ fontSize: '1.1rem' }}>⭐</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b45309', fontFamily: 'monospace', lineHeight: 1 }}>
              {sureVotes}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
              Sure Votes ({surePercentage}%)
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#78716c', marginTop: '6px' }}>
            from <strong>{sureFamilies}</strong> families (out of {totalVotes} total voters)
          </div>
        </div>

        {/* Card 2: Remaining / Yet to Decide */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Remaining To Decide
            </span>
            <Clock size={16} color="#64748b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e293b', fontFamily: 'monospace', lineHeight: 1 }}>
              {remainingVotes}
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
              Votes ({totalVotes > 0 ? ((remainingVotes / totalVotes) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px' }}>
            across {remainingFamilies} families needing outreach
          </div>
        </div>

        {/* Card 3: Target Progress */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Campaign Conversion
            </span>
            <TrendingUp size={16} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace', lineHeight: 1 }}>
            {surePercentage}%
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '999px',
              background: '#f1f5f9',
              marginTop: '10px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Number(surePercentage))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Card 4: Top Ward by Sure Voters */}
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Leading Ward
            </span>
            <MapPin size={16} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#5b21b6', lineHeight: 1.2 }}>
            {topWard ? topWard.ward : 'Ward 1'}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700, marginTop: '8px' }}>
            ⭐ {topWard ? topWard.sure : 0} of {topWard ? topWard.total : 0} voters confirmed
          </div>
        </div>
      </div>

      {/* 3. Ward & Locality Progress Breakdown Section */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
        }}
      >
        <h3 style={{ margin: '0 0 14px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🏛️ Ward-wise Sure Voter Breakdown</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {wardStats.map((w) => {
            const wardTotal = w.totalVotes || w.total;
            const wardSure = w.sureVotes || w.sure;
            const pct = wardTotal > 0 ? ((wardSure / wardTotal) * 100).toFixed(0) : 0;
            const remainingInWard = Math.max(0, wardTotal - wardSure);
            const isFilterSelected = wardFilter === w.ward;

            return (
              <div
                key={w.ward}
                onClick={() => setWardFilter(isFilterSelected ? 'ALL' : w.ward)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isFilterSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isFilterSelected ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={`Click to filter contacts by ${w.ward}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    {w.ward}
                  </span>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: Number(pct) >= 50 ? '#059669' : '#d97706',
                      background: Number(pct) >= 50 ? '#ecfdf5' : '#fffbeb',
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}
                  >
                    ⭐ {w.sureVotes || w.sure} / {w.totalVotes || w.total} Votes ({pct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b' }}>
                  <span>⭐ <strong>{w.sure}</strong> Sure</span>
                  <span>⏳ <strong>{remainingInWard}</strong> Left</span>
                  <span>Total: <strong>{w.total}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filters & Controls Toolbar */}
      <div className="glass-panel" style={{ padding: '10px 14px', background: '#ffffff', borderRadius: '14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Top Row: Search + Scope Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search sure voters by name, phone, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '32px', width: '100%', height: '34px', fontSize: '0.84rem' }}
              />
            </div>

            {/* Scope Filter Buttons (Sure Only vs All vs Pending) */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setScopeFilter('SURE_ONLY')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: 'none',
                  background: scopeFilter === 'SURE_ONLY' ? '#f59e0b' : 'transparent',
                  color: scopeFilter === 'SURE_ONLY' ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.12s ease',
                }}
              >
                <span>⭐ Sure Only ({sureCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('PENDING_ONLY')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: 'none',
                  background: scopeFilter === 'PENDING_ONLY' ? '#ffffff' : 'transparent',
                  color: scopeFilter === 'PENDING_ONLY' ? '#0f172a' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.12s ease',
                  boxShadow: scopeFilter === 'PENDING_ONLY' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <span>⏳ Remaining ({remainingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('ALL')}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: 'none',
                  background: scopeFilter === 'ALL' ? '#ffffff' : 'transparent',
                  color: scopeFilter === 'ALL' ? '#0f172a' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: scopeFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <span>All ({totalCount})</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Ward & Locality & Reference Cascading Filters */}
          <div className="mobile-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Ward Select */}
            <select
              className="input-field"
              value={wardFilter}
              onChange={(e) => {
                setWardFilter(e.target.value);
                setLocalityFilter('ALL');
              }}
              style={{
                width: 'auto',
                padding: '4px 10px',
                fontSize: '0.8rem',
                height: '34px',
                borderColor: wardFilter !== 'ALL' ? '#2563eb' : undefined,
                background: wardFilter !== 'ALL' ? '#eff6ff' : '#ffffff',
                fontWeight: 600,
              }}
            >
              <option value="ALL">🏛️ All Wards</option>
              <option value="UNASSIGNED">Unassigned Ward</option>
              {wards.map((w) => (
                <option key={w._id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>

            {/* Locality Select */}
            <select
              className="input-field"
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              style={{
                width: 'auto',
                padding: '4px 10px',
                fontSize: '0.8rem',
                height: '34px',
                borderColor: localityFilter !== 'ALL' ? '#f59e0b' : undefined,
                background: localityFilter !== 'ALL' ? '#fef3c7' : '#ffffff',
                fontWeight: 600,
              }}
            >
              <option value="ALL">📍 All Localities</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {(wardFilter !== 'ALL' ? localities.filter((l) => l.ward === wardFilter) : localities).map((loc) => (
                <option key={loc._id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            {/* Reference Select if references exist */}
            {references.length > 0 && (
              <select
                className="input-field"
                value={referenceFilter}
                onChange={(e) => setReferenceFilter(e.target.value)}
                style={{
                  width: 'auto',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  height: '34px',
                  borderColor: referenceFilter !== 'ALL' ? '#8b5cf6' : undefined,
                  background: referenceFilter !== 'ALL' ? '#ede9fe' : '#ffffff',
                  fontWeight: 600,
                }}
              >
                <option value="ALL">👤 All References</option>
                <option value="UNASSIGNED">No Reference</option>
                {references.map((ref) => (
                  <option key={ref} value={ref}>
                    Ref: {ref}
                  </option>
                ))}
              </select>
            )}

            {/* Reset Filters Button if any is applied */}
            {(wardFilter !== 'ALL' || localityFilter !== 'ALL' || referenceFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setWardFilter('ALL');
                  setLocalityFilter('ALL');
                  setReferenceFilter('ALL');
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                ✕ Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Results Summary Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{filteredContacts.length}</strong> {scopeFilter === 'SURE_ONLY' ? 'Sure' : ''} voters
          {wardFilter !== 'ALL' ? ` in ${wardFilter}` : ''}
          {localityFilter !== 'ALL' ? ` (${localityFilter})` : ''}
        </span>
      </div>

      {/* 6. Contact Cards Grid */}
      {filteredContacts.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px 20px',
            textAlign: 'center',
            borderRadius: '16px',
            background: '#ffffff',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              marginBottom: '12px',
            }}
          >
            ⭐
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
            {scopeFilter === 'SURE_ONLY' ? 'No Confirmed Sure Voters in this Selection' : 'No Contacts Match Filters'}
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: '#64748b', maxWidth: '420px', marginInline: 'auto' }}>
            {scopeFilter === 'SURE_ONLY'
              ? "You can mark any contact as a Confirmed Sure Voter by tapping '☆ Make Sure' on their contact card in the Contacts directory or by switching to 'All' scope above."
              : 'Try clearing your filters or search term to see more voters.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setScopeFilter('ALL');
              setWardFilter('ALL');
              setLocalityFilter('ALL');
            }}
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            View All Voters
          </button>
        </div>
      ) : (
        <div className="contact-grid">
          {filteredContacts.map((contact, index) => (
            <ContactCard
              key={contact._id}
              contact={{
                ...contact,
                displaySerial: index + 1,
              }}
              isSelected={selectedIds.has(contact._id)}
              onSelectToggle={(id, checked) => {
                const next = new Set(selectedIds);
                if (checked) next.add(id);
                else next.delete(id);
                setSelectedIds(next);
              }}
              onToggleSureVoter={onToggleSureVoter}
              onStatusChange={onStatusChange}
              onDirectWhatsAppSend={(c) => onWhatsAppRedirect(c)}
              onWhatsAppRedirect={(c) => onWhatsAppRedirect(c)}
              onOpenTemplateModal={(c) => onOpenTemplateModal(c)}
              onCallRedirect={onCallRedirect}
              onDelete={onDeleteContact}
              onEdit={onEditContact}
              waConnected={waConnected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
