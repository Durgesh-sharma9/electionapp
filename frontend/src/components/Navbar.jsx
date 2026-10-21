import React from 'react';
import { Vote, UserPlus, FileSpreadsheet, Download, RefreshCw, Database } from 'lucide-react';

export default function Navbar({ onOpenAddModal, onOpenBulkModal, onRefresh, onExportCSV, dbConnected, loading }) {
  return (
    <header className="glass-panel nav-header-mobile" style={{ padding: '14px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
            flexShrink: 0,
          }}>
            <Vote size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(to right, #ffffff, #fed7aa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0,
              }}>
                महापुरा चुनाव संपर्क
              </h1>
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#fb923c',
                fontWeight: 600,
                border: '1px solid rgba(249, 115, 22, 0.35)',
              }}>
                2026
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              {/* DB Status */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                color: dbConnected ? '#34d399' : '#f87171',
                fontWeight: 500,
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: dbConnected ? '#10b981' : '#ef4444',
                  boxShadow: dbConnected ? '0 0 6px #10b981' : 'none',
                }} />
                {dbConnected ? 'MongoDB Live' : 'Connecting...'}
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
          <button className="btn btn-secondary" onClick={onOpenBulkModal} style={{ borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', padding: '8px 14px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} color="#a5b4fc" />
            <span>बल्क लिस्ट पेस्ट</span>
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
