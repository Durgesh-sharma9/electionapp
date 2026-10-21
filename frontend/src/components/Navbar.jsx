import React from 'react';
import { MessageCircle, UserPlus, FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  onOpenAddModal,
  onOpenBulkModal,
  onRefresh,
  onExportCSV,
  dbConnected,
  loading,
}) {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Outreach Dashboard',
          subtitle: 'Real-time overview, outreach completion progress, and quick statistics',
        };
      case 'templates':
        return {
          title: 'WhatsApp Message Templates',
          subtitle: 'Create, test with {name}, and permanently save reusable messages',
        };
      case 'contacts':
      default:
        return {
          title: 'Contacts & Outreach List',
          subtitle: 'Manage your contact list and 1-click WhatsApp redirects',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="glass-panel main-top-header" style={{ padding: '14px 18px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Mobile Brand / Desktop Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <span className="mobile-only-badge" style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#059669',
                fontWeight: 600,
                border: '1px solid #a7f3d0',
              }}>
                INTERNAL
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Desktop Quick Header Actions */}
        <div className="desktop-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onRefresh}
            title="Refresh Data"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

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
            <span>📋 Paste Bulk List</span>
          </button>

          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '7px 14px', fontSize: '0.85rem' }}>
            <UserPlus size={15} />
            <span>+ Add Contact</span>
          </button>
        </div>

        {/* Mobile DB status pill */}
        <div className="mobile-only-status" style={{ display: 'none' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.72rem',
            color: dbConnected ? '#059669' : '#dc2626',
            fontWeight: 600,
            background: dbConnected ? '#ecfdf5' : '#fef2f2',
            padding: '2px 8px',
            borderRadius: '6px',
            border: `1px solid ${dbConnected ? '#a7f3d0' : '#fecaca'}`,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: dbConnected ? '#10b981' : '#ef4444',
            }} />
            {dbConnected ? 'Live' : 'Connecting'}
          </span>
        </div>

      </div>
    </header>
  );
}
