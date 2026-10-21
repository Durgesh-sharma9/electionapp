import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Users,
  Grid,
  List,
  Trash2,
  MessageCircle,
  Phone,
  Check,
  Download,
  UserPlus,
  FileSpreadsheet,
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
  const [activeTemplate, setActiveTemplate] = useState('greeting');
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

  // Distinct groups/areas for filter dropdown
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

      // Area filter
      if (wardFilter !== 'ALL' && c.ward !== wardFilter) {
        return false;
      }

      // Contacted filter
      if (contactedFilter === 'CONTACTED' && !c.contacted) return false;
      if (contactedFilter === 'PENDING' && c.contacted) return false;

      // Search query (name, phone, area, notes)
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
    showToast(`✓ Added contact: ${result.data.name}`);
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
    showToast(`✓ Successfully imported ${result.insertedCount} contacts!`);
    fetchData();
  };

  // WhatsApp Redirect (1-CLICK DIRECT MESSAGING)
  const handleWhatsAppRedirect = async (contact) => {
    const cleanPhone = String(contact.phone).replace(/\D/g, '').slice(-10);
    const personalizedMessage = customText.replace(/{name}/g, contact.name || 'Friend');
    const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(personalizedMessage)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, '_blank');

    // Update MongoDB status to messaged/contacted
    try {
      await fetch(`/api/contacts/${contact._id}/contacted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: true }),
      });
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
      showToast(`✓ Opened WhatsApp for ${contact.name}`);
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
      showToast(`📞 Calling ${contact.name}...`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showToast('Contact deleted');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} selected contacts?`)) return;

    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`✓ Deleted ${selectedIds.size} contacts`);
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
      alert('No contacts available to export');
      return;
    }
    const headers = ['Name', 'Phone', 'Area/Group', 'Category', 'Messaged', 'Notes'];
    const rows = contacts.map((c) => [
      `"${c.name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.ward || ''}"`,
      `"${c.category || ''}"`,
      c.contacted ? 'Yes' : 'No',
      `"${c.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Contacts_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ CSV file downloaded successfully!');
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

      {/* Statistics Overview */}
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
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by name, phone number, area or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Category Dropdown */}
            <select
              className="input-field"
              style={{ width: 'auto', padding: '9px 14px', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="General">General</option>
              <option value="Lead / Inquiry">Lead / Inquiry</option>
              <option value="VIP Contact">VIP Contact</option>
              <option value="Member / Supporter">Member / Supporter</option>
              <option value="Volunteer / Staff">Volunteer / Staff</option>
              <option value="CONTACTED">Messaged Only</option>
              <option value="PENDING">Pending Only</option>
            </select>

            {/* Area Dropdown */}
            {availableWards.length > 0 && (
              <select
                className="input-field"
                style={{ width: 'auto', padding: '9px 14px', fontSize: '0.85rem' }}
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
              >
                <option value="ALL">All Groups / Areas</option>
                {availableWards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setViewMode('cards')}
                style={{
                  background: viewMode === 'cards' ? '#ea580c' : 'transparent',
                  color: viewMode === 'cards' ? '#ffffff' : '#64748b',
                  border: 'none',
                  width: '34px',
                  height: '34px',
                }}
                title="Card Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? '#ea580c' : 'transparent',
                  color: viewMode === 'table' ? '#ffffff' : '#64748b',
                  border: 'none',
                  width: '34px',
                  height: '34px',
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>

          </div>

        </div>

        {/* Selection Bar */}
        {selectedIds.size > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#9a3412' }}>
              {selectedIds.size} contact(s) selected
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleBulkDelete}
              style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Trash2 size={14} />
              <span>Delete Selected</span>
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
            background: '#fff7ed',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
          }}>
            <Users size={32} />
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
            {contacts.length === 0 ? 'No contacts in database yet' : 'No matching contacts found'}
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>
            {contacts.length === 0
              ? 'Click "+ Add Contact" or "Paste Bulk List" above to get started!'
              : 'Try adjusting your search query or category filters'}
          </p>
          {contacts.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                + Add First Contact
              </button>
              <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(true)}>
                📋 Paste Bulk List
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
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ accentColor: '#ea580c', cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Mobile Number</th>
                <th style={{ padding: '12px 16px' }}>Group / Area</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Direct Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr
                  key={contact._id}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: selectedIds.has(contact._id) ? '#fff7ed' : '#ffffff',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact._id)}
                      onChange={(e) => handleSelectToggle(contact._id, e.target.checked)}
                      style={{ accentColor: '#ea580c', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                    {contact.name}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#0284c7', fontWeight: 600 }}>
                    +91 {contact.phone}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {contact.ward}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-supporter">{contact.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {contact.contacted ? (
                      <span className="badge badge-contacted">Messaged</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
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
                        style={{ width: '30px', height: '30px', color: '#ef4444' }}
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
          title="Export CSV"
        >
          <Download size={18} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setIsBulkModalOpen(true)}
          style={{ borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca' }}
        >
          <FileSpreadsheet size={17} color="#4f46e5" />
          <span>Paste List</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={18} />
          <span>+ Add Contact</span>
        </button>
      </div>

    </div>
  );
}
