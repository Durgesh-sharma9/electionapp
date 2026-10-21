import React from 'react';
import { MessageCircle, UserPlus, FileSpreadsheet, Download, RefreshCw, Users, FileText } from 'lucide-react';

export default function Navbar({
  activeTab = 'contacts',
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  onOpenAddModal,
  onOpenBulkModal,
  onRefresh,
  onExportCSV,
  dbConnected,
  loading,
}) {
  return (
    <header className="glass-panel nav-header-mobile" style={{ padding: '14px 20px', marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            flexShrink: 0,
          }}>
            <MessageCircle size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.28rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
              }}>
                WhatsApp Outreach Portal
              </h1>
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#059669',
                fontWeight: 600,
                border: '1px solid #a7f3d0',
              }}>
                INTERNAL TOOL
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Add contacts, paste lists & 1-click WhatsApp redirect
              </span>
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
                {dbConnected ? 'Database Live' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Tabs for Desktop */}
        <div className="nav-tabs-container">
          <button
            type="button"
            onClick={() => onTabChange && onTabChange('contacts')}
            className={`nav-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          >
            <Users size={16} />
            <span>Contacts</span>
            {totalContacts > 0 && <span className="nav-tab-badge">{totalContacts}</span>}
          </button>

          <button
            type="button"
            onClick={() => onTabChange && onTabChange('templates')}
            className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <FileText size={16} />
            <span>Templates</span>
            {templatesCount > 0 && <span className="nav-tab-badge nav-tab-badge-emerald">{templatesCount}</span>}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="nav-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onRefresh}
            title="Refresh List"
            disabled={loading}
          >
            <RefreshCw size={15} />
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

      </div>
    </header>
  );
}
