import React from 'react';
import { Users, MapPin, BarChart3, Smartphone, UserPlus } from 'lucide-react';

export default function BottomTabBar({
  activeTab,
  onTabChange,
  totalContacts = 0,
  localitiesCount = 0,
  onOpenAddModal,
  waConnected = false,
}) {
  return (
    <nav className="bottom-tab-bar" aria-label="Mobile Navigation">
      <div className="bottom-tab-container">
        {/* 1. Contacts Tab */}
        <button
          type="button"
          onClick={() => onTabChange('contacts')}
          className={`bottom-tab-item ${activeTab === 'contacts' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Users size={18} />
            {totalContacts > 0 && (
              <span className="bottom-tab-badge">{totalContacts}</span>
            )}
          </div>
          <span className="bottom-tab-label">Contacts</span>
        </button>

        {/* 2. Locality Tab */}
        <button
          type="button"
          onClick={() => onTabChange('localities')}
          className={`bottom-tab-item ${activeTab === 'localities' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <MapPin size={18} />
            {localitiesCount > 0 && (
              <span className="bottom-tab-badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                {localitiesCount}
              </span>
            )}
          </div>
          <span className="bottom-tab-label">Locality</span>
        </button>

        {/* 3. CENTER FAB: + Add Contact */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bottom-tab-fab"
          title="Add New Contact"
          aria-label="Add Contact"
        >
          <UserPlus size={20} color="#ffffff" />
        </button>

        {/* 4. Analytics Tab */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`bottom-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span className="bottom-tab-label">Analytics</span>
        </button>

        {/* 5. WhatsApp Tab */}
        <button
          type="button"
          onClick={() => onTabChange('whatsapp')}
          className={`bottom-tab-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Smartphone size={18} />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-3px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: waConnected ? '#10b981' : '#f97316',
                border: '1px solid #ffffff',
              }}
            />
          </div>
          <span className="bottom-tab-label">WhatsApp</span>
        </button>
      </div>
    </nav>
  );
}
