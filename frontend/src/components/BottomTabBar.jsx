import React from 'react';
import { LayoutDashboard, Users, FileText, UserPlus } from 'lucide-react';

export default function BottomTabBar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  onOpenAddModal,
}) {
  return (
    <nav className="bottom-tab-bar" aria-label="Mobile Bottom Navigation">
      <div className="bottom-tab-container">
        
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`bottom-tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <div className="tab-icon-wrapper">
            <LayoutDashboard size={19} />
          </div>
          <span className="tab-label">Dashboard</span>
        </button>

        {/* Tab 2: Contacts List */}
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`bottom-tab-item ${activeTab === 'contacts' ? 'active' : ''}`}
        >
          <div className="tab-icon-wrapper">
            <Users size={19} />
            {totalContacts > 0 && <span className="tab-badge">{totalContacts}</span>}
          </div>
          <span className="tab-label">Contacts</span>
        </button>

        {/* Tab 3: Message Templates */}
        <button
          type="button"
          onClick={() => onTabChange('templates')}
          className={`bottom-tab-item ${activeTab === 'templates' ? 'active' : ''}`}
        >
          <div className="tab-icon-wrapper">
            <FileText size={19} />
            {templatesCount > 0 && <span className="tab-badge tab-badge-emerald">{templatesCount}</span>}
          </div>
          <span className="tab-label">Templates</span>
        </button>

        {/* Tab 4: Add Contact Action */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bottom-tab-item tab-action-highlight"
        >
          <div className="tab-icon-wrapper">
            <UserPlus size={19} className="text-orange-600" />
          </div>
          <span className="tab-label">+ Add</span>
        </button>

      </div>
    </nav>
  );
}
