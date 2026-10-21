import React from 'react';
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Database,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
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
    <aside className="app-sidebar" aria-label="Desktop Sidebar Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <MessageCircle size={22} color="#ffffff" />
        </div>
        <div className="sidebar-brand-text">
          <div className="flex items-center gap-1.5">
            <h1 className="sidebar-title">Outreach Portal</h1>
            <span className="sidebar-badge">INTERNAL</span>
          </div>
          <span className="sidebar-subtitle">WhatsApp 1-Click Redirects</span>
        </div>
      </div>

      {/* Database Status Pill */}
      <div className="sidebar-status-box">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Database size={13} className={dbConnected ? 'text-emerald-500' : 'text-rose-500'} />
            <span>MongoDB Atlas</span>
          </span>
          <span className={`status-pill ${dbConnected ? 'status-pill-online' : 'status-pill-offline'}`}>
            <span className="status-dot" />
            <span>{dbConnected ? 'Live' : 'Connecting'}</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Links: 3 Separate Tabs */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">MAIN TABS</span>
        <nav className="sidebar-nav">
          
          {/* Tab 1: Dashboard */}
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Tab 2: Contacts List */}
          <button
            type="button"
            onClick={() => onTabChange('contacts')}
            className={`sidebar-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <Users size={18} />
              <span>Contacts List</span>
            </div>
            {totalContacts > 0 && (
              <span className="sidebar-nav-badge">{totalContacts}</span>
            )}
          </button>

          {/* Tab 3: Message Templates */}
          <button
            type="button"
            onClick={() => onTabChange('templates')}
            className={`sidebar-nav-item ${activeTab === 'templates' ? 'active' : ''}`}
          >
            <div className="flex items-center gap-2.5">
              <FileText size={18} />
              <span>Message Templates</span>
            </div>
            {templatesCount > 0 && (
              <span className="sidebar-nav-badge sidebar-nav-badge-emerald">{templatesCount}</span>
            )}
          </button>

        </nav>
      </div>

      {/* Quick Action Tools */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">QUICK ACTIONS</span>
        <div className="sidebar-actions space-y-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn btn-primary w-full justify-start text-xs font-semibold py-2.5"
          >
            <UserPlus size={16} />
            <span>Add Single Contact</span>
          </button>

          <button
            type="button"
            onClick={onOpenBulkModal}
            className="btn btn-secondary w-full justify-start text-xs font-semibold py-2.5"
            style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca' }}
          >
            <FileSpreadsheet size={16} color="#4f46e5" />
            <span>📋 Paste Bulk List</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="btn btn-secondary w-full justify-start text-xs py-2"
          >
            <Download size={15} />
            <span>Export Contacts (CSV)</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="btn btn-secondary w-full justify-start text-xs py-2"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer info */}
      <div className="sidebar-footer">
        <div className="text-[11px] text-slate-400 flex items-center justify-between">
          <span>Port 8501 / 8500</span>
          <span className="text-emerald-600 font-semibold">Ready</span>
        </div>
      </div>
    </aside>
  );
}
