import React from 'react';
import { Users, MapPin, BarChart3, Smartphone, Plus } from 'lucide-react';

export default function BottomTabBar({
  activeTab,
  onTabChange,
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
          <Users size={20} />
          <span className="bottom-tab-label">Contacts</span>
        </button>

        {/* 2. Locality Tab */}
        <button
          type="button"
          onClick={() => onTabChange('localities')}
          className={`bottom-tab-item ${activeTab === 'localities' ? 'active' : ''}`}
        >
          <MapPin size={20} />
          <span className="bottom-tab-label">Locality</span>
        </button>

        {/* 3. CENTER FAB: Quick Add Contact */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="bottom-tab-fab"
          title="Add New Contact"
          aria-label="Add Contact"
        >
          <Plus size={22} color="#ffffff" strokeWidth={2.5} />
        </button>

        {/* 4. Analytics Tab */}
        <button
          type="button"
          onClick={() => onTabChange('analytics')}
          className={`bottom-tab-item ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span className="bottom-tab-label">Analytics</span>
        </button>

        {/* 5. WhatsApp Tab */}
        <button
          type="button"
          onClick={() => onTabChange('whatsapp')}
          className={`bottom-tab-item ${activeTab === 'whatsapp' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Smartphone size={20} />
            <span
              style={{
                position: 'absolute',
                top: '-1px',
                right: '-2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: waConnected ? '#10b981' : '#f97316',
                border: '1.5px solid #ffffff',
              }}
            />
          </div>
          <span className="bottom-tab-label">WhatsApp</span>
        </button>
      </div>
    </nav>
  );
}
