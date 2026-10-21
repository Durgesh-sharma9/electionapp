import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  Grid,
  List,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Phone,
  Edit2,
  Check,
} from 'lucide-react';

import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import MessageTemplateBar, { DEFAULT_TEMPLATES } from './components/MessageTemplateBar';
import AddContactModal from './components/AddContactModal';
import BulkImportModal from './components/BulkImportModal';
import ContactCard from './components/ContactCard';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [contactedFilter, setContactedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Message Template
  const [activeTemplate, setActiveTemplate] = useState('appeal');
  const [customText, setCustomText] = useState(DEFAULT_TEMPLATES[0].text);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Stats & Contacts
  const fetchData = async () => {
    setLoading(true);
    try {
      // Check health
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setDbConnected(healthData.database === 'connected');

      // Get stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Get contacts
      const contactsRes = await fetch('/api/contacts');
      const contactsData = await contactsRes.json();
      if (contactsData.success) {
        setContacts(contactsData.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Distinct wards for filter dropdown
  const availableWards = useMemo(() => {
    const set = new Set();
    contacts.forEach((c) => {
      if (c.ward) set.add(c.ward);
    });
    return Array.from(set);
  }, [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Category filter
      if (categoryFilter === 'CONTACTED') {
        if (!c.contacted) return false;
      } else if (categoryFilter === 'PENDING') {
        if (c.contacted) return false;
      } else if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
        return false;
      }

      // Ward filter
      if (wardFilter !== 'ALL' && c.ward !== wardFilter) {
        return false;
      }

      // Contacted filter
      if (contactedFilter === 'CONTACTED' && !c.contacted) return false;
      if (contactedFilter === 'PENDING' && c.contacted) return false;

      // Search query (name, phone, ward, notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.includes(q);
        const matchesWard = c.ward?.toLowerCase().includes(q);
        const matchesNotes = c.notes?.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesWard || matchesNotes;
      }

      return true;
    });
  }, [contacts, categoryFilter, wardFilter, contactedFilter, searchQuery]);

  // Single Add Contact
  const handleSaveContact = async (data) => {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    showToast(`✓ ${result.data.name} को सफलता पूर्वक जोड़ दिया गया!`);
    fetchData();
  };

  // Bulk Import
  const handleBulkImport = async (payload) => {
    const res = await fetch('/api/contacts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    showToast(`✓ ${result.insertedCount} नए संपर्क MongoDB में जोड़े गए!`);
    fetchData();
  };

  // WhatsApp Redirect (CORE REQUIREMENT)
  const handleWhatsAppRedirect = async (contact) => {
    const cleanPhone = String(contact.phone).replace(/\D/g, '').slice(-10);
    const personalizedMessage = customText.replace(/{name}/g, contact.name || 'मतदाता');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Update MongoDB status to contacted
    try {
      await fetch(`/api/contacts/${contact._id}/contacted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: true }),
      });
      // Update local state instantly
      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id
            ? { ...c, contacted: true, contactCount: (c.contactCount || 0) + 1, lastContactedAt: new Date() }
            : c
        )
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              contactedCount: prev.contactedCount + (contact.contacted ? 0 : 1),
              pendingCount: Math.max(0, prev.pendingCount - (contact.contacted ? 0 : 1)),
            }
          : prev
      );
      showToast(`✓ ${contact.name} के WhatsApp पर रीडायरेक्ट किया गया!`);
    } catch (err) {
      console.error('Error updating contacted status:', err);
    }
  };

  // Call Redirect
  const handleCallRedirect = async (contact) => {
    const cleanPhone = String(contact.phone).replace(/\D/g, '').slice(-10);
    window.open(`tel:${cleanPhone}`, '_self');

    try {
      await fetch(`/api/contacts/${contact._id}/contacted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: true }),
      });
      setContacts((prev) =>
        prev.map((c) =>
          c._id === contact._id
            ? { ...c, contacted: true, contactCount: (c.contactCount || 0) + 1 }
            : c
        )
      );
      showToast(`📞 ${contact.name} को कॉल डायल किया गया!`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm('क्या आप इस संपर्क को हटाना चाहते हैं?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('संपर्क हटा दिया गया');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`क्या आप चुने गए ${selectedIds.size} संपर्कों को हटाना चाहते हैं?`)) return;

    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`✓ ${result.message}`);
        setSelectedIds(new Set());
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Select / Deselect All
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredContacts.map((c) => c._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // Toggle Single Selection
  const handleSelectToggle = (id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      alert('एक्सपोर्ट के लिए कोई डेटा नहीं है');
      return;
    }
    const headers = ['नाम (Name)', 'मोबाइल (Phone)', 'वार्ड (Ward)', 'श्रेणी (Category)', 'संपर्क हुआ (Contacted)', 'टिप्पणी (Notes)'];
    const rows = contacts.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.ward || ''}"`,
      `"${c.category || ''}"`,
      c.contacted ? 'हाँ (Yes)' : 'नहीं (No)',
      `"${c.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mahapura_Election_Voters_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ CSV फ़ाइल डाउनलोड हो गई!');
  };

  return (
    <div className="main-app-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px 20px' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <Check size={18} color="#34d399" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header / Navbar */}
      <Navbar
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onRefresh={fetchData}
        onExportCSV={handleExportCSV}
        dbConnected={dbConnected}
        loading={loading}
      />

      {/* Campaign Statistics Overview */}
      <StatsOverview
        stats={stats}
        onFilterCategory={(cat) => setCategoryFilter(cat)}
        currentCategory={categoryFilter}
      />

      {/* WhatsApp Message Template Bar */}
      <MessageTemplateBar
        activeTemplate={activeTemplate}
        onSelectTemplate={(id, text) => {
          setActiveTemplate(id);
          setCustomText(text);
        }}
        customText={customText}
        onUpdateCustomText={(txt) => setCustomText(txt)}
      />

      {/* Search & Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="नाम, मोबाइल नंबर या वार्ड से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Filters: Ward & Category & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Category Dropdown */}
            <select
              className="input-field"
              style={{ width: 'auto', padding: '9px 14px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">सभी श्रेणियाँ (All)</option>
              <option value="समर्थक (Supporter)">समर्थक (Supporter)</option>
              <option value="तटस्थ (Undecided)">तटस्थ (Undecided)</option>
              <option value="प्रमुख व्यक्ति (Key Person)">प्रमुख व्यक्ति (Key Person)</option>
              <option value="कार्यकर्ता (Volunteer)">कार्यकर्ता (Volunteer)</option>
              <option value="CONTACTED">केवल संपर्कित (Contacted)</option>
              <option value="PENDING">केवल शेष (Pending)</option>
            </select>

            {/* Ward Dropdown */}
            {availableWards.length > 0 && (
              <select
                className="input-field"
                style={{ width: 'auto', padding: '9px 14px', fontSize: '0.85rem' }}
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="ALL">सभी वार्ड / क्षेत्र</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setViewMode('cards')}
                style={{
                  background: viewMode === 'cards' ? 'rgba(249, 115, 22, 0.25)' : 'transparent',
                  color: viewMode === 'cards' ? '#f97316' : 'var(--text-muted)',
                  border: 'none',
                  width: '34px',
                  height: '34px',
                }}
                title="कार्ड व्यू (Card View)"
              >
                <Grid size={16} />
              </button>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'rgba(249, 115, 22, 0.25)' : 'transparent',
                  color: viewMode === 'table' ? '#f97316' : 'var(--text-muted)',
                  border: 'none',
                  width: '34px',
                  height: '34px',
                }}
                title="टेबल व्यू (Table View)"
              >
                <List size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* Selection Bar if items selected */}
        {selectedIds.size > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fed7aa' }}>
              {selectedIds.size} संपर्क चुने गए हैं
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleBulkDelete}
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} />
              <span>चुने गए हटाएं (Delete Selected)</span>
            </button>
          </div>
        )}

      </div>

      {/* Contacts List / Empty State */}
      {filteredContacts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <Users size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
            {contacts.length === 0 ? 'अभी कोई मतदाता संपर्क दर्ज नहीं है' : 'कोई परिणाम नहीं मिला'}
          </h3>
          <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {contacts.length === 0
              ? 'ऊपर दिए गए बटन से नया संपर्क जोड़ें या सीधे बल्क लिस्ट पेस्ट करें!'
              : 'कृपया अपनी खोज या फ़िल्टर बदलकर देखें'}
          </p>
          {contacts.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                + पहला संपर्क जोड़ें
              </button>
              <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(true)}>
                📋 बल्क लिस्ट पेस्ट करें
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Card Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact._id}
              contact={contact}
              onWhatsAppRedirect={handleWhatsAppRedirect}
              onCallRedirect={handleCallRedirect}
              onDelete={handleDeleteContact}
              onEdit={(c) => setEditingContact(c)}
              isSelected={selectedIds.has(contact._id)}
              onSelectToggle={handleSelectToggle}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ accentColor: '#f97316', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>नाम (Name)</th>
                <th style={{ padding: '12px 16px' }}>मोबाइल (Phone)</th>
                <th style={{ padding: '12px 16px' }}>वार्ड (Ward)</th>
                <th style={{ padding: '12px 16px' }}>श्रेणी (Category)</th>
                <th style={{ padding: '12px 16px' }}>स्थिति (Status)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>रीडायरेक्ट ऐक्शन (Action)</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact._id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: selectedIds.has(contact._id) ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact._id)}
                      onChange={(e) => handleSelectToggle(contact._id, e.target.checked)}
                      style={{ accentColor: '#f97316', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                    {contact.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#38bdf8', fontWeight: 500 }}>
                    +91 {contact.phone}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {contact.ward}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-supporter">{contact.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {contact.contacted ? (
                      <span className="badge badge-contacted">संपर्कित</span>
                    ) : (
                      <span className="badge badge-pending">बाकी</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        className="btn btn-whatsapp"
                        onClick={() => handleWhatsAppRedirect(contact)}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        className="btn btn-call"
                        onClick={() => handleCallRedirect(contact)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <Phone size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => handleDeleteContact(contact._id)}
                        style={{ width: '30px', height: '30px', color: '#f87171' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Single Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveContact}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkImport={handleBulkImport}
      />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-bar">
        <button
          className="btn btn-secondary"
          onClick={handleExportCSV}
          style={{ flex: '0 0 50px', padding: 0 }}
          title="CSV डाउनलोड"
        >
          <Download size={18} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setIsBulkModalOpen(true)}
          style={{ borderColor: 'rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.18)', color: '#c7d2fe' }}
        >
          <FileSpreadsheet size={17} color="#a5b4fc" />
          <span>बल्क पेस्ट</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>+ नया संपर्क</span>
        </button>
      </div>

    </div>
  );
}
