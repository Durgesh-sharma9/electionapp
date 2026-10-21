import {
  MessageCircle,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Smartphone,
  Share2,
} from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  onTabChange,
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
          title: 'Outreach Analytics Dashboard',
          subtitle: 'Real-time overview, outreach completion progress, and voter breakdown',
        };
      case 'templates':
        return {
          title: 'WhatsApp Message Templates',
          subtitle: 'Manage reusable messages with dynamic {name} personalization',
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp Device Connection',
          subtitle: 'Scan QR code with your phone for direct live message dispatching',
        };
      case 'contacts':
      default:
        return {
          title: 'Contacts & Outreach Directory',
          subtitle: 'Manage contacts list and 1-click WhatsApp redirects',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="glass-panel main-top-header" style={{ padding: '8px 14px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Mobile Logo + Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="mobile-only-logo" style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.2)',
            flexShrink: 0,
          }}>
            <MessageCircle size={17} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
              }}>
                {headerInfo.title}
              </h1>
            </div>
            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '1px 0 0 0' }}>
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Desktop Quick Header Actions */}
        <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Live WA Status Pill (Clickable) */}
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('whatsapp')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
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
            title={waConnected ? `Connected with: ${waSession?.phone || 'Linked Device'} (Click to manage)` : 'Click to scan QR code and link WhatsApp'}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: waConnected ? '#10b981' : '#f97316',
                boxShadow: waConnected ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
              }}
            />
            <span>
              {waConnected
                ? `🟢 WA Connected${waSession?.phone ? ` (${waSession.phone})` : ''}`
                : '🔴 WA Not Connected • Link Now'}
            </span>
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onRefresh}
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          {activeTab === 'contacts' && (
            <>
              <button className="btn btn-secondary" onClick={onExportCSV} style={{ padding: '5px 9px', fontSize: '0.76rem' }}>
                <Download size={13} />
                <span>CSV Export</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={onOpenBulkModal} 
                style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca', padding: '5px 9px', fontSize: '0.76rem' }}
              >
                <FileSpreadsheet size={13} color="#4f46e5" />
                <span>Paste Bulk List</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={onOpenShareModal} 
                style={{ borderColor: '#7dd3fc', background: '#f0f9ff', color: '#0369a1', padding: '5px 9px', fontSize: '0.76rem', fontWeight: 600 }}
                title="Generate public caller link with Call & WhatsApp buttons"
              >
                <Share2 size={13} color="#0284c7" />
                <span>Share Link</span>
              </button>
            </>
          )}

          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '5px 11px', fontSize: '0.78rem' }}>
            <UserPlus size={13} />
            <span>+ Add Contact</span>
          </button>
        </div>

      </div>
    </header>
  );
}
