import React from 'react';
import {
  ShieldCheck,
  Share2,
  UserPlus,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  totalContacts = 0,
  sureCount = 0,
  onOpenAddModal,
  onOpenShareModal,
  onRefresh,
  onLogout,
  loading = false,
}) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'localities':
        return 'Ward & Locality Master';
      case 'analytics':
        return 'Live Analytics';
      case 'templates':
        return 'Message Templates';
      case 'whatsapp':
        return 'WhatsApp Connection';
      case 'contacts':
      default:
        return 'Contacts Directory';
    }
  };

  const currentTitle = getPageTitle();

  return (
    <header className="main-top-navbar">
      {/* LEFT: Logo Emblem + Brand Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
        {/* Emblem */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={18} color="#38bdf8" />
        </div>

        {/* Brand & Section Badge */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.98rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Mahapura
            </h1>

            {/* Desktop Section Badge (Hidden on mobile) */}
            <span
              className="hide-on-mobile"
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#475569',
                background: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                whiteSpace: 'nowrap',
              }}
            >
              {currentTitle}
            </span>
          </div>

          {/* Session / Year (Desktop Only) */}
          <div
            className="hide-on-mobile"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#d97706',
              letterSpacing: '0.02em',
              marginTop: '1px',
            }}
          >
            2026-2027
          </div>
        </div>
      </div>

      {/* RIGHT: Sure Voters Live Counter + Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        {/* Live Sure Voters Counter Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            padding: '4px 9px',
            borderRadius: '20px',
            boxShadow: '0 1px 4px rgba(245, 158, 11, 0.2)',
          }}
          title="Confirmed Sure Voters in Campaign"
        >
          <span style={{ fontSize: '0.8rem' }}>⭐</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', fontFamily: 'monospace' }}>
            {sureCount}
          </span>
          <span className="hide-on-mobile" style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>
            Sure
          </span>
        </div>

        {/* 1. Share Link Button */}
        <button
          type="button"
          onClick={onOpenShareModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 10px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.22)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          title="Create shareable public outreach link"
        >
          <Share2 size={13} color="#ffffff" />
          <span className="hide-on-mobile">Share</span>
        </button>

        {/* 2. + Add Contact Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddModal}
          style={{
            padding: '6px 11px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            borderRadius: '8px',
          }}
          title="Add a new contact"
        >
          <UserPlus size={13} />
          <span>+ Add</span>
        </button>

        {/* 3. Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh All Data"
          disabled={loading}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* 4. Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fecaca',
              background: '#fff5f5',
              color: '#ef4444',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </header>
  );
}
