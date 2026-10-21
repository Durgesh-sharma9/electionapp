import React from 'react';
import {
  MessageCircle,
  LayoutDashboard,
  Users,
  FileText,
  Smartphone,
  MapPin,
  BarChart3,
  LogOut,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  localitiesCount = 0,
  waConnected = false,
  onLogout,
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

      {/* Main Navigation Tabs */}
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

        {/* Tab 3: Locality Master */}
        <button
          type="button"
          onClick={() => onTabChange('localities')}
          className={`sidebar-nav-item ${activeTab === 'localities' ? 'active' : ''}`}
        >
          <div className="sidebar-nav-left">
            <MapPin size={18} />
            <span className="sidebar-nav-label">Locality Master</span>
          </div>
          {localitiesCount > 0 && (
            <span className="sidebar-nav-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
              {localitiesCount}
            </span>
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

        {/* Tab 5: Link Analytics */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`sidebar-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <div className="sidebar-nav-left">
            <BarChart3 size={18} />
            <span className="sidebar-nav-label">Analytics</span>
          </div>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="sidebar-nav-item"
            style={{ marginTop: 'auto', color: '#ef4444' }}
            title="Logout"
          >
            <div className="sidebar-nav-left">
              <LogOut size={18} color="#ef4444" />
              <span className="sidebar-nav-label">Logout</span>
            </div>
          </button>
        )}
      </nav>
    </aside>
  );
}
