import React from 'react';
import {
  MessageCircle,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Smartphone,
} from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  onOpenAddModal,
  onOpenBulkModal,
  onRefresh,
  onExportCSV,
  dbConnected = true,
  waConnected = false,
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
    <header className="glass-panel main-top-header" style={{ padding: '14px 18px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Mobile Logo + Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mobile-only-logo" style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
            flexShrink: 0,
          }}>
            <MessageCircle size={20} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
              }}>
                {headerInfo.title}
              </h1>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Desktop Quick Header Actions */}
        <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* WA Status Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: waConnected ? '#ecfdf5' : '#f8fafc',
            border: `1px solid ${waConnected ? '#a7f3d0' : '#e2e8f0'}`,
            fontSize: '0.74rem',
            fontWeight: 600,
            color: waConnected ? '#059669' : '#64748b',
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: waConnected ? '#10b981' : '#cbd5e1',
            }} />
            <span>{waConnected ? 'WA Connected' : 'WA Standby'}</span>
          </div>

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
              <button className="btn btn-secondary" onClick={onExportCSV} style={{ padding: '7px 12px', fontSize: '0.82rem' }}>
                <Download size={14} />
                <span>CSV Export</span>
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={onOpenBulkModal} 
                style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca', padding: '7px 12px', fontSize: '0.82rem' }}
              >
                <FileSpreadsheet size={15} color="#4f46e5" />
                <span>Paste Bulk List</span>
              </button>
            </>
          )}

          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
            <UserPlus size={15} />
            <span>+ Add Contact</span>
          </button>
        </div>

      </div>
    </header>
  );
}
