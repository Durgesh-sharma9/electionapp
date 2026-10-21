import React from 'react';
import {
  ShieldCheck,
  Share2,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  LogOut,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  localitiesCount = 0,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenShareModal,
  onRefresh,
  onExportCSV,
  onLogout,
  dbConnected = true,
  waConnected = false,
  waSession = null,
  loading = false,
}) {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'localities':
        return 'Locality Master';
      case 'analytics':
        return 'Live Analytics';
      case 'templates':
        return 'WhatsApp Templates';
      case 'whatsapp':
        return 'WhatsApp Connection';
      case 'contacts':
      default:
        return 'Contacts Directory';
    }
  };

  const currentTitle = getPageTitle();

  return (
    <header
      className="main-top-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        marginBottom: '16px',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      {/* LEFT: Logo Emblem + Brand Name + Session Year + Active Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
        {/* Emblem / Badge */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '2px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={20} color="#38bdf8" />
        </div>

        {/* Brand & Subtitle */}
        <div style={{ minWidth: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.05rem',
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

          {/* Session / Year Accent Line (Matching User Reference) */}
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

      {/* RIGHT: Quick Action Buttons & Circular Utilities */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
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
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
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

        {/* 3. WhatsApp Status Indicator */}
        <button
          type="button"
          onClick={() => onTabChange && onTabChange('whatsapp')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 11px',
            borderRadius: '8px',
            background: waConnected ? '#ecfdf5' : '#fff7ed',
            border: `1px solid ${waConnected ? '#a7f3d0' : '#fed7aa'}`,
            fontSize: '0.76rem',
            fontWeight: 700,
            color: waConnected ? '#059669' : '#c2410c',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          title={
            waConnected
              ? `Connected: ${waSession?.phone || 'Device Linked'} (Click to manage)`
              : 'WhatsApp offline. Click to connect device.'
          }
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: waConnected ? '#10b981' : '#f97316',
              boxShadow: waConnected ? '0 0 6px rgba(16, 185, 129, 0.7)' : 'none',
            }}
          />
          <span>{waConnected ? 'Active' : 'Offline'}</span>
        </button>

        {/* 4. Secondary actions on contacts tab (Hidden on mobile to save space) */}
        {activeTab === 'contacts' && (
          <>
            <button
              type="button"
              className="btn btn-secondary hide-on-mobile"
              onClick={onOpenBulkModal}
              style={{
                borderColor: '#c7d2fe',
                background: '#eef2ff',
                color: '#4338ca',
                padding: '7px 11px',
                fontSize: '0.78rem',
                fontWeight: 600,
                alignItems: 'center',
                gap: '5px',
              }}
              title="Paste multiple contacts from Excel"
            >
              <FileSpreadsheet size={14} color="#4f46e5" />
              <span>Bulk List</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary hide-on-mobile"
              onClick={onExportCSV}
              style={{
                padding: '7px 11px',
                fontSize: '0.78rem',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Export contacts as CSV"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>
          </>
        )}

        {/* 5. Circular Utility Icon: Refresh */}
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

        {/* 6. Circular Utility Icon: Logout */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Logout from Admin"
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
