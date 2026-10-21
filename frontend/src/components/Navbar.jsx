import React from 'react';
import { Vote, UserPlus, FileSpreadsheet, Download, RefreshCw, Database } from 'lucide-react';

export default function Navbar({ onOpenAddModal, onOpenBulkModal, onRefresh, onExportCSV, dbConnected, loading }) {
  return (
    <header className="glass-panel nav-header-mobile" style={{ padding: '16px 22px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
            flexShrink: 0,
          }}>
            <Vote size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.35rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                margin: 0,
              }}>
                चुनाव जनसंपर्क पोर्टल
              </h1>
              <span style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#fff7ed',
                color: '#c2410c',
                fontWeight: 600,
                border: '1px solid #fed7aa',
              }}>
                ELECTION 2026
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Voter Outreach & Direct WhatsApp Contact Portal
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

        {/* Action Buttons (Desktop & Tablet) */}
        <div className="nav-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Refresh */}
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onRefresh}
            title="रिफ्रेश करें"
            disabled={loading}
          >
            <RefreshCw size={16} />
          </button>

          {/* Export CSV */}
          <button className="btn btn-secondary" onClick={onExportCSV} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <Download size={15} />
            <span>CSV Export</span>
          </button>

          {/* Bulk Paste */}
          <button className="btn btn-secondary" onClick={onOpenBulkModal} style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca', padding: '8px 14px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} color="#4f46e5" />
            <span>📋 बल्क लिस्ट पेस्ट</span>
          </button>

          {/* Add Single */}
          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
            <UserPlus size={16} />
            <span>+ नया संपर्क</span>
          </button>

        </div>

      </div>
    </header>
  );
}
