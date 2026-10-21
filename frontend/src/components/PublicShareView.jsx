import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Users,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function PublicShareView({ shareId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'DONE'

  // Clipboard copy state
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Fetch shared list from API
  const fetchSharedList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/shares/${shareId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || 'Share link not found or expired');
      }
    } catch (err) {
      setError('Failed to connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shareId) {
      fetchSharedList();
    }
  }, [shareId]);

  // Toggle Contacted Status
  const handleToggleContacted = async (phone) => {
    if (!data) return;

    // Optimistic UI update
    setData((prev) => {
      const nextContacts = prev.contacts.map((c) => {
        if (c.phone === phone) {
          const newStatus = !c.contacted;
          return {
            ...c,
            contacted: newStatus,
            contactCount: newStatus ? (c.contactCount || 0) + 1 : c.contactCount,
          };
        }
        return c;
      });
      return { ...prev, contacts: nextContacts };
    });

    try {
      await fetch(`/api/shares/${shareId}/contact/${phone}/toggle`, { method: 'PATCH' });
    } catch (err) {
      console.error('Failed to sync toggle:', err);
    }
  };

  // Handle WhatsApp Click
  const handleWhatsAppClick = (contact) => {
    const template = data?.messageTemplate || 'Hello {name}, reaching out from our team!';
    const message = template.replace(/{name}/g, contact.name || 'Valued Member');
    const encoded = encodeURIComponent(message);
    const cleanPhone = contact.phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone}`;

    // Auto mark as contacted
    if (!contact.contacted) {
      handleToggleContacted(contact.phone);
    }

    showToast(`Opening WhatsApp for ${contact.name}...`);
    window.open(`https://wa.me/${fullPhone}?text=${encoded}`, '_blank');
  };

  // Handle Call Click
  const handleCallClick = (contact) => {
    const cleanDigits = contact.phone.replace(/\D/g, '');
    const fullPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;

    navigator.clipboard.writeText(cleanDigits);
    setCopiedPhone(contact.phone);
    setTimeout(() => setCopiedPhone(null), 2500);

    showToast(`Calling ${contact.name} (${fullPhone} copied)`);
    window.location.href = `tel:${fullPhone}`;
  };

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    showToast(`+91 ${phone} copied to clipboard!`);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Filter contacts
  const filteredContacts = useMemo(() => {
    if (!data || !Array.isArray(data.contacts)) return [];
    return data.contacts.filter((c) => {
      // Status filter
      if (statusFilter === 'PENDING' && c.contacted) return false;
      if (statusFilter === 'DONE' && !c.contacted) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').includes(q);
        const matchesNotes = (c.notes || '').toLowerCase().includes(q);
        const matchesSerial = String(c.serialNo || '').includes(q);
        return matchesName || matchesPhone || matchesNotes || matchesSerial;
      }
      return true;
    });
  }, [data, searchQuery, statusFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    if (!data || !Array.isArray(data.contacts)) return { total: 0, done: 0, pending: 0, percent: 0 };
    const total = data.contacts.length;
    const done = data.contacts.filter((c) => c.contacted).length;
    const pending = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, percent };
  }, [data]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="animate-spin" color="#0284c7" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, color: '#0f172a' }}>Loading Outreach Directory...</h3>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '20px' }}>
        <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '32px', textAlign: 'center', background: '#ffffff' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>Link Not Found</h3>
          <p style={{ margin: '8px 0 20px', color: '#64748b', fontSize: '0.88rem' }}>
            {error || 'The requested outreach list link does not exist or has expired.'}
          </p>
          <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 20px' }}>
            Go to Main Portal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="toast-notice">
          <Check size={18} color="#10b981" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {data.title || 'Outreach Contact List'}
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Assigned Calling & WhatsApp Directory • {stats.total} Contacts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#065f46',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={14} color="#059669" />
              <span>Public Caller Link</span>
            </span>
            <button
              onClick={fetchSharedList}
              className="btn btn-secondary btn-icon"
              title="Refresh List"
              style={{ width: '34px', height: '34px', padding: 0 }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '900px', margin: '20px auto', padding: '0 16px' }}>
        
        {/* Progress Overview Card */}
        <div
          className="glass-panel"
          style={{
            padding: '18px 20px',
            marginBottom: '16px',
            background: '#ffffff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
              Outreach Progress
            </span>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0284c7' }}>
              {stats.done} of {stats.total} Completed ({stats.percent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                height: '100%',
                width: `${stats.percent}%`,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>TOTAL CONTACTS</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>COMPLETED (DONE)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{stats.done}</div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>PENDING</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b45309' }}>{stats.pending}</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div
          className="glass-panel"
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, or #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px', width: '100%', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'ALL' ? 700 : 500,
                border: 'none',
                background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
                color: statusFilter === 'ALL' ? '#0f172a' : '#64748b',
                boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'PENDING' ? 700 : 500,
                border: 'none',
                background: statusFilter === 'PENDING' ? '#ffffff' : 'transparent',
                color: statusFilter === 'PENDING' ? '#b45309' : '#64748b',
                boxShadow: statusFilter === 'PENDING' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('DONE')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: statusFilter === 'DONE' ? 700 : 500,
                border: 'none',
                background: statusFilter === 'DONE' ? '#ffffff' : 'transparent',
                color: statusFilter === 'DONE' ? '#15803d' : '#64748b',
                boxShadow: statusFilter === 'DONE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              Done ({stats.done})
            </button>
          </div>
        </div>

        {/* Contacts Count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '0 4px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredContacts.length} of {stats.total} contacts
          </span>
        </div>

        {/* Contacts Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredContacts.map((contact, index) => (
            <div
              key={contact.phone + index}
              className="glass-panel"
              style={{
                padding: '16px',
                background: contact.contacted ? '#fafffc' : '#ffffff',
                border: contact.contacted ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                position: 'relative',
              }}
            >
              {/* Top Row: Serial & Name */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#e0f2fe',
                        color: '#0284c7',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                      }}
                    >
                      #{contact.serialNo || index + 1}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {contact.name}
                    </h3>
                  </div>

                  {/* Toggle Done Button */}
                  <button
                    onClick={() => handleToggleContacted(contact.phone)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title="Toggle Completed Status"
                  >
                    <span className={contact.contacted ? 'badge badge-contacted' : 'badge badge-pending'}>
                      {contact.contacted ? '✅ Done' : '⏳ Pending'}
                    </span>
                  </button>
                </div>

                {/* Phone Number */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.96rem', color: '#0369a1', fontWeight: 700, fontFamily: 'monospace' }}>
                    +91 {contact.phone}
                  </span>
                  <button
                    onClick={() => handleCopy(contact.phone)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: copiedPhone === contact.phone ? '#059669' : '#94a3b8' }}
                    title="Copy Phone"
                  >
                    {copiedPhone === contact.phone ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Warning / Note Banner if present */}
                {contact.notes && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      fontSize: '0.74rem',
                      color: '#b45309',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>⚠️</span>
                    <span>{contact.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: WhatsApp & Call */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                {/* WhatsApp Button */}
                <button
                  type="button"
                  className="btn btn-whatsapp"
                  onClick={() => handleWhatsAppClick(contact)}
                  style={{
                    padding: '9px 12px',
                    fontSize: '0.84rem',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  }}
                  title="Open WhatsApp with personalized message"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </button>

                {/* Call Button */}
                <button
                  type="button"
                  className="btn btn-call"
                  onClick={() => handleCallClick(contact)}
                  style={{
                    padding: '9px 12px',
                    fontSize: '0.84rem',
                    justifyContent: 'center',
                  }}
                  title="Call Phone Number"
                >
                  <Phone size={15} />
                  <span>Call</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', marginTop: '16px' }}>
            <Users size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>No Contacts Found</h4>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              No contacts match your search or filter criteria.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}
