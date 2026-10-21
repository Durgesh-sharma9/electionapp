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
      {/* LEFT: Logo Emblem + Brand Name + Session Year + Active Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Emblem / Badge */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={19} color="#38bdf8" />
        </div>

        {/* Brand & Subtitle */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.02rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Mahapura Outreach
            </h1>

            {/* Current Active Section Badge */}
            <span
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

          {/* Session / Year Accent Line */}
          <div
            style={{
              fontSize: '0.72rem',
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

      {/* RIGHT: Sure Voters Live Counter + Quick Action Buttons & Circular Utilities */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Live Sure Voters Counter Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '1px solid #f59e0b',
            padding: '5px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
          }}
          title="Total Confirmed Sure Voters in Campaign"
        >
          <span style={{ fontSize: '0.85rem' }}>⭐</span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#92400e', fontFamily: 'monospace' }}>
            {sureCount}
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>
            Sure Voters
          </span>
        </div>
        {/* 1. Share Link Button */}
        <button
          type="button"
          onClick={onOpenShareModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          title="Create shareable public outreach link"
        >
          <Share2 size={14} color="#ffffff" />
          <span>Share Link</span>
        </button>

        {/* 2. + Add Contact Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenAddModal}
          style={{
            padding: '7px 13px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            whiteSpace: 'nowrap',
          }}
          title="Add a new contact"
        >
          <UserPlus size={14} />
          <span>+ Add</span>
        </button>

        {/* 3. Circular Utility Icon: Refresh */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh All Data"
          disabled={loading}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            padding: 0,
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* 4. Circular Utility Icon: Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fecaca',
              background: '#fff5f5',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </header>
  );
}
