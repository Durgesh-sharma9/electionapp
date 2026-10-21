import React from 'react';
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  FileText,
  Smartphone,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  waConnected = false,
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
          <span className="sidebar-subtitle">Campaign Assistant</span>
        </div>
      </div>

      {/* Main 4 Navigation Tabs */}
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

        {/* Tab 4: WhatsApp Connect (Live Socket) */}
        <button
          type="button"
          onClick={() => onTabChange('whatsapp')}
          className={`sidebar-nav-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
        >
          <div className="sidebar-nav-left">
            <Smartphone size={18} />
            <span className="sidebar-nav-label">WhatsApp Link</span>
          </div>
          <span
            className="sidebar-status-dot"
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: waConnected ? '#10b981' : '#94a3b8',
              boxShadow: waConnected ? '0 0 6px #10b981' : 'none',
            }}
            title={waConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}
          />
        </button>
      </nav>
    </aside>
  );
}
