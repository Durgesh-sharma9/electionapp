import React from 'react';
import { Users, FileText, UserPlus, FileSpreadsheet } from 'lucide-react';

export default function BottomTabBar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  templatesCount = 0,
  onOpenAddModal,
  onOpenBulkModal,
}) {
  return (
    <nav className="bottom-tab-bar" aria-label="Bottom Navigation">
      <div className="bottom-tab-container">
        {/* Tab 1: Contacts List */}
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`bottom-tab-item ${activeTab === 'contacts' ? 'active' : ''}`}
        >
          <div className="tab-icon-wrapper">
            <Users size={20} />
            {totalContacts > 0 && <span className="tab-badge">{totalContacts}</span>}
          </div>
          <span className="tab-label">Contacts</span>
        </button>

        {/* Tab 2: Templates (Requested by user: "neeche tabs banao us sme ek me templates ka hoga") */}
        <button
          type="button"
          onClick={() => onTabChange('templates')}
          className={`bottom-tab-item ${activeTab === 'templates' ? 'active' : ''}`}
        >
          <div className="tab-icon-wrapper">
            <FileText size={20} />
            {templatesCount > 0 && <span className="tab-badge tab-badge-emerald">{templatesCount}</span>}
          </div>
          <span className="tab-label">Templates</span>
        </button>

        {/* Tab 3: Quick Bulk Paste List */}
        <button
          type="button"
          onClick={onOpenBulkModal}
          className="bottom-tab-item"
        >
          <div className="tab-icon-wrapper">
            <FileSpreadsheet size={20} className="text-blue-600" />
          </div>
          <span className="tab-label">Paste List</span>
        </button>

        {/* Tab 4: Add Contact */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bottom-tab-item tab-action-highlight"
        >
          <div className="tab-icon-wrapper">
            <UserPlus size={20} className="text-orange-600" />
          </div>
          <span className="tab-label">Add Contact</span>
        </button>
      </div>
    </nav>
  );
}
