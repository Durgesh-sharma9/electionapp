import React from 'react';
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  FileSpreadsheet,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  onOpenAddModal,
  onOpenBulkModal,
}) {
  return (
    <aside className="app-sidebar" aria-label="Sidebar Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <MessageCircle size={20} color="#ffffff" />
        </div>
        <div className="sidebar-brand-text">
          <h1 className="sidebar-title">Outreach Portal</h1>
          <span className="sidebar-subtitle">WhatsApp 1-Click Redirects</span>
        </div>
      </div>

      {/* Main 3 Tabs Navigation */}
      <nav className="sidebar-nav">
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <div className="sidebar-nav-left">
            <LayoutDashboard size={18} />
            <span className="sidebar-nav-label">Dashboard</span>
          </div>
        </button>

        {/* Tab 2: Contacts List */}
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`sidebar-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
        >
          <div className="sidebar-nav-left">
            <Users size={18} />
            <span className="sidebar-nav-label">Contacts List</span>
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
          <div className="sidebar-nav-left">
            <FileText size={18} />
            <span className="sidebar-nav-label">Templates</span>
          </div>
          {templatesCount > 0 && (
            <span className="sidebar-nav-badge sidebar-nav-badge-emerald">{templatesCount}</span>
          )}
        </button>
      </nav>

      {/* Primary Action Buttons */}
      <div className="sidebar-quick-actions">
        <button
          type="button"
          onClick={onOpenAddModal}
          className="btn btn-primary w-full justify-center text-xs font-semibold py-2.5"
        >
          <UserPlus size={15} />
          <span>+ Add Contact</span>
        </button>

        <button
          type="button"
          onClick={onOpenBulkModal}
          className="btn btn-secondary w-full justify-center text-xs font-semibold py-2.5"
          style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca' }}
        >
          <FileSpreadsheet size={15} color="#4f46e5" />
          <span>Paste Bulk List</span>
        </button>
      </div>
    </aside>
  );
}
