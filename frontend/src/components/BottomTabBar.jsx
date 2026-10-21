import React from 'react';
import { LayoutDashboard, Users, FileText, UserPlus, Smartphone, BarChart3 } from 'lucide-react';

export default function BottomTabBar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  onOpenAddModal,
  waConnected = false,
}) {
  return (
    <nav className="bottom-tab-bar" aria-label="Mobile Navigation">
      {/* 1. Dashboard Tab */}
      <button
        type="button"
        onClick={() => onTabChange('dashboard')}
        className={`bottom-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span className="bottom-tab-label">Dashboard</span>
      </button>

      {/* 2. Contacts Tab */}
      <button
        type="button"
        onClick={() => onTabChange('contacts')}
        className={`bottom-tab-item ${activeTab === 'contacts' ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <Users size={20} />
          {totalContacts > 0 && (
            <span className="bottom-tab-badge">{totalContacts}</span>
          )}
        </div>
        <span className="bottom-tab-label">Contacts</span>
      </button>

      {/* Floating Quick Add Action */}
      <button
        type="button"
        onClick={onOpenAddModal}
        className="bottom-tab-fab"
        title="Add Single Contact"
        aria-label="Add Contact"
      >
        <UserPlus size={22} color="#ffffff" />
      </button>

      {/* 3. Templates Tab */}
      <button
        type="button"
        onClick={() => onTabChange('templates')}
        className={`bottom-tab-item ${activeTab === 'templates' ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <FileText size={20} />
          {templatesCount > 0 && (
            <span className="bottom-tab-badge bottom-tab-badge-emerald">{templatesCount}</span>
          )}
        </div>
        <span className="bottom-tab-label">Templates</span>
      </button>

      {/* 4. WhatsApp Connect Tab */}
      <button
        type="button"
        onClick={() => onTabChange('whatsapp')}
        className={`bottom-tab-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
      >
        <div style={{ position: 'relative' }}>
          <Smartphone size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-1px',
              right: '-3px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: waConnected ? '#10b981' : '#94a3b8',
            }}
          />
        </div>
        <span className="bottom-tab-label">WA Link</span>
      </button>

      {/* 5. Analytics Tab */}
      <button
        type="button"
        onClick={() => onTabChange('analytics')}
        className={`bottom-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
      >
        <BarChart3 size={20} />
        <span className="bottom-tab-label">Analytics</span>
      </button>
    </nav>
  );
}
