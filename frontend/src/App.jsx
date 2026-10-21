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
  FileText,
  Filter,
} from 'lucide-react';

import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import StatsOverview from './components/StatsOverview';
import MessageTemplateBar from './components/MessageTemplateBar';
import AddContactModal from './components/AddContactModal';
import BulkImportModal from './components/BulkImportModal';
import ContactCard from './components/ContactCard';
import TemplatesManager from './components/TemplatesManager';
import BottomTabBar from './components/BottomTabBar';
import Sidebar from './components/Sidebar';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Active Main View Tab ('contacts' | 'templates')
  const [activeTab, setActiveTab] = useState('contacts');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [contactedFilter, setContactedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Templates from Database
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [customText, setCustomText] = useState(
    'Hello {name}, hope you are doing well! Reaching out to connect with you. Please let us know if you need any assistance.'
  );

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Templates from MongoDB
  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTemplates(data.data);
        // Find default or first template if not set
        const defaultTpl = data.data.find((t) => t.isDefault) || data.data[0];
        if (defaultTpl && !activeTemplateId) {
          setActiveTemplateId(defaultTpl._id);
          setCustomText(defaultTpl.text);
        }
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
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
    fetchTemplates();
  }, []);

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

      // Contacted filter
      if (contactedFilter === 'CONTACTED' && !c.contacted) return false;
      if (contactedFilter === 'PENDING' && c.contacted) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchNotes = c.notes?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, categoryFilter, contactedFilter, searchQuery]);

  // 1-Click WhatsApp Redirect
  const handleWhatsAppRedirect = async (contact) => {
    const message = customText.replace(/{name}/g, contact.name || 'Friend');
    const encodedMessage = encodeURIComponent(message);
    const phone = contact.phone.replace(/\D/g, '');
    const fullPhone = phone.startsWith('91') && phone.length === 12 ? phone : `91${phone}`;

    // Mark contacted in background
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
    } catch (e) {
      console.error('Failed to update contact status:', e);
    }

    // Open WhatsApp
    window.open(`https://wa.me/${fullPhone}?text=${encodedMessage}`, '_blank');
  };

  // 1-Click Phone Call Redirect
  const handleCallRedirect = (contact) => {
    window.location.href = `tel:${contact.phone}`;
  };

  // Toggle Contacted Status
  const handleToggleContacted = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/contacts/${id}/contacted`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, contacted: !currentStatus } : c))
        );
        showToast(!currentStatus ? 'Marked as Contacted ✅' : 'Marked as Pending ⏳');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Save Single Contact
  const handleSaveContact = async (contactData) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Contact saved successfully! 🎉');
        setIsAddModalOpen(false);
        fetchData();
      } else {
        alert(data.error || 'Failed to save contact');
      }
    } catch (err) {
      alert('Error saving contact: ' + err.message);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
        showToast('Contact removed 🗑️');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected contacts?`)) return;

    try {
      const res = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${ids.length} contacts deleted!`);
        setSelectedIds(new Set());
        fetchData();
      }
    } catch (err) {
      alert('Bulk delete failed: ' + err.message);
    }
  };

  // Bulk Import
  const handleBulkImport = async (parsedList) => {
    try {
      const res = await fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: parsedList }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${data.insertedCount} contacts imported successfully! 🚀`);
        setIsBulkModalOpen(false);
        fetchData();
      } else {
        alert(data.error || 'Bulk import failed');
      }
    } catch (err) {
      alert('Bulk import error: ' + err.message);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      alert('No contacts to export.');
      return;
    }
    const headers = ['Name', 'Phone', 'Category', 'Status', 'Contact Count', 'Notes'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      c.contacted ? 'Contacted' : 'Pending',
      c.contactCount || 0,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `outreach_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully! 📁');
  };

  // Template CRUD Handlers
  const handleSaveTemplate = async (id, templateData) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/templates/${id}` : '/api/templates';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save template');
    }
    await fetchTemplates();
    return data.data;
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchTemplates();
        showToast('Template deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete template: ' + err.message);
    }
  };

  const handleSetDefaultTemplate = async (id) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTemplates();
        showToast('Set as default template!');
      }
    } catch (err) {
      alert('Failed to set default: ' + err.message);
    }
  };

  const handleSelectTemplate = (id, text) => {
    setActiveTemplateId(id);
    setCustomText(text);
    showToast('Active message template selected');
  };

  const activeTemplateObj = useMemo(() => {
    return templates.find((t) => t._id === activeTemplateId) || templates[0] || null;
  }, [templates, activeTemplateId]);

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <Check size={18} color="#10b981" />
          <span>{toast}</span>
        </div>
      )}

      {/* Desktop / Laptop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalContacts={contacts.length}
        templatesCount={templates.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onRefresh={fetchData}
        onExportCSV={handleExportCSV}
        dbConnected={dbConnected}
        loading={loading}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalContacts={contacts.length}
          templatesCount={templates.length}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onRefresh={fetchData}
          onExportCSV={handleExportCSV}
          dbConnected={dbConnected}
          loading={loading}
        />

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED DASHBOARD                                      */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <DashboardView
          stats={stats}
          contactsCount={contacts.length}
          templatesCount={templates.length}
          onNavigateTab={setActiveTab}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 2: CONTACTS LIST ONLY (Bss List View)                      */}
      {/* ============================================================== */}
      {activeTab === 'contacts' && (
        <>
          {/* WhatsApp Message Template Quick Bar */}
          <MessageTemplateBar
            templates={templates}
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
            customText={customText}
            onUpdateCustomText={setCustomText}
            onGoToTemplatesTab={() => setActiveTab('templates')}
          />

          {/* Search & Filter Toolbar */}
          <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 260px' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by name, phone number, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '38px', width: '100%' }}
                />
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                
                {/* Category Filter */}
                <select
                  className="input-field"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.84rem' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="General">General</option>
                  <option value="Supporter">Supporters</option>
                  <option value="Key Person">Key Persons</option>
                  <option value="Volunteer">Volunteers</option>
                  <option value="Undecided">Undecided</option>
                </select>

                {/* Contacted Filter */}
                <select
                  className="input-field"
                  value={contactedFilter}
                  onChange={(e) => setContactedFilter(e.target.value)}
                  style={{ width: 'auto', padding: '8px 12px', fontSize: '0.84rem' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">⏳ Pending Only</option>
                  <option value="CONTACTED">✅ Messaged Only</option>
                </select>

                {/* View Mode Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                      color: viewMode === 'cards' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                    title="Cards Grid"
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: viewMode === 'table' ? '#ffffff' : 'transparent',
                      color: viewMode === 'table' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                    title="Compact Table"
                  >
                    <List size={15} />
                  </button>
                </div>

              </div>

            </div>

            {/* Bulk Selection Bar */}
            {selectedIds.size > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.84rem', color: '#b91c1c', fontWeight: 600 }}>
                  {selectedIds.size} contacts selected
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <Trash2 size={13} />
                    <span>Delete Selected</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px' }}>
            <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 500 }}>
              Showing <strong>{filteredContacts.length}</strong> of {contacts.length} contacts
            </span>

            {filteredContacts.length > 0 && (
              <button
                onClick={() => {
                  if (selectedIds.size === filteredContacts.length) {
                    setSelectedIds(new Set());
                  } else {
                    setSelectedIds(new Set(filteredContacts.map((c) => c._id)));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedIds.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {/* Contacts Rendering: Cards or Table */}
          {filteredContacts.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Users size={30} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                No Contacts Found
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', margin: '0 auto 20px auto' }}>
                {searchQuery || categoryFilter !== 'ALL' || contactedFilter !== 'ALL'
                  ? 'No contacts match your active search or filters. Try clearing them.'
                  : 'Start by pasting your list of names and numbers or adding contacts individually.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => setIsBulkModalOpen(true)}>
                  <FileSpreadsheet size={16} />
                  <span>📋 Paste Bulk List</span>
                </button>
                <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus size={16} />
                  <span>+ Add Contact</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="contact-grid">
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact._id}
                  contact={contact}
                  isSelected={selectedIds.has(contact._id)}
                  onToggleSelect={(id) => {
                    const next = new Set(selectedIds);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    setSelectedIds(next);
                  }}
                  onWhatsApp={handleWhatsAppRedirect}
                  onCall={handleCallRedirect}
                  onToggleContacted={handleToggleContacted}
                  onDelete={handleDeleteContact}
                />
              ))}
            </div>
          ) : (
            <div className="section-card" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="compact-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 14px', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredContacts.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filteredContacts.map((c) => c._id)));
                          else setSelectedIds(new Set());
                        }}
                      />
                    </th>
                    <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>NAME</th>
                    <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>PHONE NUMBER</th>
                    <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>CATEGORY</th>
                    <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>STATUS</th>
                    <th style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact._id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: selectedIds.has(contact._id) ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(contact._id)}
                          onChange={() => {
                            const next = new Set(selectedIds);
                            if (next.has(contact._id)) next.delete(contact._id);
                            else next.add(contact._id);
                            setSelectedIds(next);
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                        {contact.name}
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#334155', fontWeight: 600 }}>
                        +91 {contact.phone}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span className="badge badge-pending">{contact.category || 'General'}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          onClick={() => handleToggleContacted(contact._id, contact.contacted)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <span className={contact.contacted ? 'badge badge-contacted' : 'badge badge-pending'}>
                            {contact.contacted ? '✅ Contacted' : '⏳ Pending'}
                          </span>
                        </button>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
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
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TEMPLATES MANAGER VIEW (Dedicated tab requested by user) */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <TemplatesManager
          templates={templates}
          activeTemplate={activeTemplateObj}
          onSelectTemplate={(tpl) => handleSelectTemplate(tpl._id, tpl.text)}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onSetDefaultTemplate={handleSetDefaultTemplate}
          loading={loading}
        />
      )}

      </div>

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

      {/* Sticky Bottom Tab Bar (Requested by user: "neeche tabs banao us sme ek me templates ka hoga") */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalContacts={contacts.length}
        templatesCount={templates.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
      />

    </div>
  );
}
