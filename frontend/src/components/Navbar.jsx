import React from 'react';
import {
  MessageCircle,
  Users,
  MapPin,
  BarChart3,
  FileText,
  Smartphone,
  Share2,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Sparkles,
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
  dbConnected = true,
  waConnected = false,
  waSession = null,
  loading = false,
}) {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Campaign Overview Dashboard',
          subtitle: 'Real-time overview, outreach completion progress, and voter breakdown',
        };
      case 'localities':
        return {
          title: 'Locality Master (क्षेत्र / मोहल्ला)',
          subtitle: 'Manage residential areas, assign contacts, and generate locality-wise links',
        };
      case 'analytics':
        return {
          title: 'Outreach & Caller Analytics',
          subtitle: 'Live tracking of calls, WhatsApp messages, and untouched contacts',
        };
      case 'templates':
        return {
          title: 'WhatsApp Message Templates',
          subtitle: 'Manage reusable messages with dynamic {name} personalization',
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp Device Connection',
          subtitle: 'Scan QR code with your phone for instant direct message dispatching',
        };
      case 'contacts':
      default:
        return {
          title: 'Contacts & Outreach Directory',
          subtitle: 'Manage contacts list, 1-click WhatsApp messaging, and phone calls',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Navigation Items for Top Navbar
  const navTabs = [
    { id: 'contacts', label: 'Contacts', icon: Users, count: totalContacts },
    { id: 'localities', label: 'Locality Master', icon: MapPin, count: localitiesCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Live' },
    { id: 'templates', label: 'Templates', icon: FileText, count: templatesCount },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone, isConnected: waConnected },
  ];

  return (
    <header
      className="glass-panel main-top-header"
      style={{
        padding: '10px 16px',
        marginBottom: '12px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
      }}
    >
      {/* TOP ROW: Brand Title + Share Link Button + Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Branding & Current Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0', flex: '1 1 auto' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(16, 185, 129, 0.25)',
              flexShrink: 0,
            }}
          >
            <MessageCircle size={18} color="#ffffff" />
          </div>

          <div style={{ minWidth: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #a7f3d0',
                }}
              >
                महापुरा
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#0f172a',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {headerInfo.title}
              </h1>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons (Always Visible!) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {/* 1. KEY BUTTON: SHARE LINK (लिंक शेयर करें) - Prominent Gradient */}
          <button
            type="button"
            onClick={onOpenShareModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
            }}
            title="Generate public caller link (All, By Locality, or Selected Contacts)"
          >
            <Share2 size={15} color="#ffffff" />
            <span>🔗 Share Link (शेयर करें)</span>
          </button>

          {/* 2. + Add Contact Button */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            style={{
              padding: '7px 13px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Add a new contact"
          >
            <UserPlus size={15} />
            <span>+ Add Contact</span>
          </button>

          {/* 3. WhatsApp Status Indicator (Clickable to open WA tab) */}
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('whatsapp')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: waConnected ? '#ecfdf5' : '#fff7ed',
              border: `1px solid ${waConnected ? '#a7f3d0' : '#fed7aa'}`,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: waConnected ? '#059669' : '#c2410c',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={
              waConnected
                ? `Connected with: ${waSession?.phone || 'Linked Device'} (Click to manage)`
                : 'WhatsApp offline. Click to scan QR code and connect.'
            }
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: waConnected ? '#10b981' : '#f97316',
                boxShadow: waConnected ? '0 0 8px rgba(16, 185, 129, 0.7)' : 'none',
              }}
            />
            <span>
              {waConnected
                ? `🟢 WA Active${waSession?.phone ? ` (${waSession.phone.slice(-4)})` : ''}`
                : '🔴 Link WA'}
            </span>
          </button>

          {/* 4. Secondary actions on contacts tab */}
          {activeTab === 'contacts' && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onOpenBulkModal}
                style={{
                  borderColor: '#c7d2fe',
                  background: '#eef2ff',
                  color: '#4338ca',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                title="Paste multiple contacts from Excel / Sheet"
              >
                <FileSpreadsheet size={14} color="#4f46e5" />
                <span className="hide-on-mobile">Bulk List</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onExportCSV}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                title="Export contacts as CSV"
              >
                <Download size={14} />
                <span className="hide-on-mobile">CSV</span>
              </button>
            </>
          )}

          {/* 5. Refresh Data Button */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={onRefresh}
            title="Refresh All Data"
            disabled={loading}
            style={{ padding: '7px 9px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* BOTTOM ROW: Integrated Horizontal Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 13px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                background: isActive
                  ? '#0f172a'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
              }}
            >
              <Icon size={15} color={isActive ? '#38bdf8' : '#64748b'} />
              <span>{tab.label}</span>

              {/* Count / Status Badge */}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? '#334155' : '#f1f5f9',
                    color: isActive ? '#f8fafc' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              )}

              {tab.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isActive ? '#059669' : '#dcfce7',
                    color: isActive ? '#ffffff' : '#15803d',
                    textTransform: 'uppercase',
                  }}
                >
                  {tab.badge}
                </span>
              )}

              {tab.isConnected !== undefined && (
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: tab.isConnected ? '#10b981' : '#f97316',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
