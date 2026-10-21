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
  Edit2,
  Copy,
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
import WhatsAppConnectView from './components/WhatsAppConnectView';
import SendMessageModal from './components/SendMessageModal';
import ShareLinkModal from './components/ShareLinkModal';
import PublicShareView from './components/PublicShareView';
import LocalityMaster from './components/LocalityMaster';
import AnalyticsView from './components/AnalyticsView';

export default function App() {
  // Check if opening a shared outreach link (?share=sh_xxxx)
  const urlShareId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('share');
  }, []);

  if (urlShareId) {
    return <PublicShareView shareId={urlShareId} />;
  }

  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Active Main View Tab ('contacts' | 'templates' | 'dashboard' | 'whatsapp' | 'localities')
  const [activeTab, setActiveTab] = useState('contacts');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [contactedFilter, setContactedFilter] = useState('ALL');
  const [localityFilter, setLocalityFilter] = useState('ALL');
  const [referenceFilter, setReferenceFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // Default: 'table' (Compact list view)

  // Locality Master & Reference state
  const [localities, setLocalities] = useState([]);
  const [references, setReferences] = useState([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [messageModalContact, setMessageModalContact] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Templates from Database
  const [templates, setTemplates] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('');
  const [customText, setCustomText] = useState(
    'Hello {name}, hope you are doing well! Reaching out to connect with you. Please let us know if you need any assistance.'
  );

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Toast & WA State
  const [toast, setToast] = useState(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waSession, setWaSession] = useState(null);
  const [sendingDirectId, setSendingDirectId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Check WA status periodically
  const fetchWaStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        const isLogged = Boolean(data.active && data.session?.loggedIn);
        setWaConnected(isLogged);
        setWaSession(isLogged ? data.session : null);
      }
    } catch {}
  };

  useEffect(() => {
    fetchWaStatus();
    const interval = setInterval(fetchWaStatus, 3000);
    return () => clearInterval(interval);
  }, []);

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

  // Fetch Localities from MongoDB
  const fetchLocalities = async () => {
    try {
      const res = await fetch('/api/localities');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocalities(data.data);
      }
    } catch (err) {
      console.error('Error fetching localities:', err);
    }
  };

  // Fetch References list from MongoDB
  const fetchReferences = async () => {
    try {
      const res = await fetch('/api/references');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setReferences(data.data);
      }
    } catch (err) {
      console.error('Error fetching references:', err);
    }
  };

  // Fetch Stats & Contacts & Localities & References
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

      // Refresh localities and references counts
      fetchLocalities();
      fetchReferences();
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
    fetchLocalities();
    fetchReferences();
  }, []);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Contacted filter
      if (contactedFilter === 'CONTACTED' && !c.contacted) return false;
      if (contactedFilter === 'PENDING' && c.contacted) return false;

      // Locality filter
      if (localityFilter !== 'ALL') {
        if (localityFilter === 'UNASSIGNED') {
          if (c.locality && c.locality.trim() !== '') return false;
        } else if (c.locality !== localityFilter) {
          return false;
        }
      }

      // Reference filter
      if (referenceFilter !== 'ALL') {
        if (referenceFilter === 'UNASSIGNED') {
          if (c.reference && c.reference.trim() !== '') return false;
        } else if (c.reference !== referenceFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchNotes = c.notes?.toLowerCase().includes(q);
        const matchLocality = c.locality?.toLowerCase().includes(q);
        const matchReference = c.reference?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNotes && !matchLocality && !matchReference) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, categoryFilter, contactedFilter, localityFilter, referenceFilter, searchQuery]);

  // Open Send Message Modal (allows template selection and custom message editing)
  const handleOpenSendMessage = (contact) => {
    setMessageModalContact(contact);
  };

  // 1. Direct Background WhatsApp Send from Modal
  const handleSendDirectFromModal = async (contact, messageText) => {
    if (!waConnected) {
      const wantToConnect = window.confirm(
        'WhatsApp account is not connected yet.\n\nClick "OK" to open the WhatsApp Link tab and scan the QR code.\nClick "Cancel" to send via WhatsApp Web instead.'
      );
      if (wantToConnect) {
        setActiveTab('whatsapp');
        return;
      } else {
        handleSendWebFromModal(contact, messageText);
        return;
      }
    }

    setSendingDirectId(contact._id);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.phone,
          message: messageText,
          contactId: contact._id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`✅ Direct WhatsApp delivered to ${contact.name}!`);
        setContacts((prev) =>
          prev.map((c) =>
            c._id === contact._id
              ? { ...c, contacted: true, contactCount: (c.contactCount || 0) + 1 }
              : c
          )
        );
      } else {
        alert(data.error || 'Failed to dispatch live WhatsApp message.');
      }
    } catch (err) {
      alert('Error connecting to backend: ' + err.message);
    } finally {
      setSendingDirectId(null);
    }
  };

  // 2. WhatsApp Web Redirect from Modal
  const handleSendWebFromModal = async (contact, messageText) => {
    const encodedMessage = encodeURIComponent(messageText);
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
      showToast(`🔗 Opening WhatsApp for ${contact.name}...`);
    } catch (e) {
      console.error('Failed to update contact status:', e);
    }

    // Open WhatsApp
    window.open(`https://wa.me/${fullPhone}?text=${encodedMessage}`, '_blank');
  };

  // 3. Direct Phone Call Redirect
  const handleCallRedirect = (contact) => {
    const cleanDigits = contact.phone.replace(/\D/g, '');
    const fullPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
    navigator.clipboard.writeText(cleanDigits);
    showToast(`📞 Calling ${contact.name} (${fullPhone} copied)`);
    window.location.href = `tel:${fullPhone}`;
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

  // Save or Update Single Contact
  const handleSaveContact = async (contactData) => {
    try {
      const isEdit = Boolean(contactData._id);
      const url = isEdit ? `/api/contacts/${contactData._id}` : '/api/contacts';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Contact updated successfully! ✅' : 'Contact saved successfully! 🎉');
        setIsAddModalOpen(false);
        setEditingContact(null);
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
    const headers = ['Name', 'Phone', 'Locality', 'Reference', 'Category', 'Status', 'Contact Count', 'Notes'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.phone || ''}"`,
      `"${(c.locality || '').replace(/"/g, '""')}"`,
      `"${(c.reference || '').replace(/"/g, '""')}"`,
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
        localitiesCount={localities.length}
        waConnected={waConnected}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          totalContacts={contacts.length}
          templatesCount={templates.length}
          onOpenAddModal={() => {
            setEditingContact(null);
            setIsAddModalOpen(true);
          }}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onRefresh={fetchData}
          onExportCSV={handleExportCSV}
          dbConnected={dbConnected}
          waConnected={waConnected}
          waSession={waSession}
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
          onOpenAddModal={() => {
            setEditingContact(null);
            setIsAddModalOpen(true);
          }}
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

          {/* Search & Filter Toolbar (Balanced) */}
          <div className="glass-panel" style={{ padding: '8px 14px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search name, phone, locality, ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '32px', width: '100%', height: '34px', fontSize: '0.84rem' }}
                />
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                
                {/* Locality Filter */}
                <select
                  className="input-field"
                  value={localityFilter}
                  onChange={(e) => setLocalityFilter(e.target.value)}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem', height: '34px', borderColor: localityFilter !== 'ALL' ? '#f59e0b' : undefined, background: localityFilter !== 'ALL' ? '#fef3c7' : '#ffffff' }}
                  title="Filter by Locality / Area"
                >
                  <option value="ALL">📍 All Localities</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                  {localities.map((loc) => (
                    <option key={loc._id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>

                {/* Reference Filter (if any distinct references exist) */}
                {references.length > 0 && (
                  <select
                    className="input-field"
                    value={referenceFilter}
                    onChange={(e) => setReferenceFilter(e.target.value)}
                    style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem', height: '34px', borderColor: referenceFilter !== 'ALL' ? '#8b5cf6' : undefined, background: referenceFilter !== 'ALL' ? '#ede9fe' : '#ffffff' }}
                    title="Filter by Reference person"
                  >
                    <option value="ALL">👤 All References</option>
                    <option value="UNASSIGNED">No Reference</option>
                    {references.map((ref) => (
                      <option key={ref} value={ref}>
                        Ref: {ref}
                      </option>
                    ))}
                  </select>
                )}


                {/* Contacted Filter */}
                <select
                  className="input-field"
                  value={contactedFilter}
                  onChange={(e) => setContactedFilter(e.target.value)}
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem', height: '34px' }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="CONTACTED">✅ Messaged</option>
                </select>

                {/* View Mode Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0' }}>
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
                <button className="btn btn-primary" onClick={() => {
                  setEditingContact(null);
                  setIsAddModalOpen(true);
                }}>
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
                  onSelectToggle={(id, checked) => {
                    const next = new Set(selectedIds);
                    if (checked) next.add(id);
                    else next.delete(id);
                    setSelectedIds(next);
                  }}
                  onDirectWhatsAppSend={handleOpenSendMessage}
                  onWhatsAppRedirect={handleOpenSendMessage}
                  onCallRedirect={handleCallRedirect}
                  onDelete={handleDeleteContact}
                  onEdit={(c) => {
                    setEditingContact(c);
                    setIsAddModalOpen(true);
                  }}
                  isSendingDirect={sendingDirectId === contact._id}
                  waConnected={waConnected}
                />
              ))}
            </div>
          ) : (
            <div className="compact-table-container" style={{ overflowX: 'auto' }}>
              <table className="compact-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center', padding: '10px 10px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredContacts.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filteredContacts.map((c) => c._id)));
                          else setSelectedIds(new Set());
                        }}
                      />
                    </th>
                    <th style={{ width: '56px', textAlign: 'center', padding: '10px 10px' }}>क्र.</th>
                    <th style={{ padding: '10px 12px' }}>NAME / DESCRIPTION</th>
                    <th style={{ padding: '10px 12px' }}>PHONE NUMBER</th>
                    <th style={{ padding: '10px 12px' }}>LOCALITY / क्षेत्र</th>
                    <th style={{ padding: '10px 12px' }}>REFERENCE</th>
                    <th style={{ padding: '10px 12px' }}>STATUS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact, index) => (
                    <tr
                      key={contact._id}
                      style={{
                        background: selectedIds.has(contact._id) ? '#f0fdf4' : index % 2 === 1 ? '#fafafa' : '#ffffff',
                      }}
                    >
                      <td style={{ textAlign: 'center', padding: '9px 10px' }}>
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
                      <td style={{ textAlign: 'center', padding: '9px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', fontSize: '0.82rem' }}>
                        #{contact.serialNo || index + 1}
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.88rem' }}>{contact.name}</span>
                          {contact.notes && (
                            <span style={{ fontSize: '0.72rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '2px 6px', fontWeight: 500 }}>
                              ⚠️ {contact.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.88rem' }}>+91 {contact.phone}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(contact.phone);
                              showToast(`Copied ${contact.phone}`);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#94a3b8' }}
                            title="Copy number"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                        {contact.locality ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                            }}
                          >
                            📍 {contact.locality}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>— Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                        {contact.reference ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              background: '#ede9fe',
                              color: '#5b21b6',
                              border: '1px solid #ddd6fe',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 600,
                            }}
                          >
                            👤 {contact.reference}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>— None</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <button
                          onClick={() => handleToggleContacted(contact._id, contact.contacted)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Click to toggle status"
                        >
                          <span className={contact.contacted ? 'badge badge-contacted' : 'badge badge-pending'} style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                            {contact.contacted ? '✅ Messaged' : '⏳ Pending'}
                          </span>
                        </button>
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {/* 1. Direct Send (WhatsApp Modal) - ONLY IF waConnected */}
                          {waConnected && (
                            <button
                              className="btn btn-whatsapp"
                              onClick={() => handleOpenSendMessage(contact)}
                              disabled={sendingDirectId === contact._id}
                              style={{ padding: '4px 9px', fontSize: '0.76rem', borderRadius: '6px', gap: '4px' }}
                              title="Instant WhatsApp Direct Send"
                            >
                              <span>{sendingDirectId === contact._id ? '...' : '⚡ Send'}</span>
                            </button>
                          )}

                          {/* 2. WhatsApp Web Redirect */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleOpenSendMessage(contact)}
                            style={{ padding: '4px 8px', fontSize: '0.76rem', borderRadius: '6px', background: '#f0fdf4', borderColor: '#a7f3d0', color: '#065f46' }}
                            title="Open WhatsApp Web"
                          >
                            <span>🔗 Web</span>
                          </button>

                          {/* 3. Call Phone */}
                          <button
                            className="btn btn-call"
                            onClick={() => handleCallRedirect(contact)}
                            style={{ padding: '4px 8px', fontSize: '0.76rem', borderRadius: '6px' }}
                            title="Call Phone Number"
                          >
                            <Phone size={13} />
                          </button>

                          {/* 4. Edit Contact */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingContact(contact);
                              setIsAddModalOpen(true);
                            }}
                            style={{ padding: '4px 7px', borderRadius: '6px', color: '#0284c7' }}
                            title="Edit Contact"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* 5. Delete Contact */}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDeleteContact(contact._id)}
                            style={{ padding: '4px 7px', borderRadius: '6px', color: '#ef4444' }}
                            title="Delete Contact"
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
      {/* TAB 3: TEMPLATES MANAGER VIEW (Saved WhatsApp templates)       */}
      {/* ============================================================== */}
      {activeTab === 'templates' && (
        <TemplatesManager
          templates={templates}
          activeTemplateId={activeTemplateId}
          onSelectTemplate={(tpl) => handleSelectTemplate(tpl._id, tpl.text)}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onSetDefaultTemplate={handleSetDefaultTemplate}
          loading={loading}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 4: WHATSAPP CONNECT VIEW (Baileys QR Link & Live Sandbox)  */}
      {/* ============================================================== */}
      {activeTab === 'whatsapp' && (
        <WhatsAppConnectView
          contacts={contacts}
          templates={templates}
          onToast={showToast}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 5: LOCALITY MASTER VIEW (Area / Ward / Mohalla Master)     */}
      {/* ============================================================== */}
      {activeTab === 'localities' && (
        <LocalityMaster
          localities={localities}
          onRefreshLocalities={() => {
            fetchLocalities();
            fetchData();
          }}
          onFilterByLocality={(locName) => {
            setLocalityFilter(locName);
            setActiveTab('contacts');
          }}
          totalContacts={contacts.length}
          onToast={showToast}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 6: ANALYTICS VIEW (Share Link Stats, Caller Action Tracking) */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <AnalyticsView onToast={showToast} />
      )}

      </div>

      {/* Add / Edit Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        localities={localities}
        references={references}
        onLocalityCreated={() => fetchLocalities()}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkImport={handleBulkImport}
      />

      {/* Send WhatsApp Message Modal (Interactive Message Box & Templates) */}
      <SendMessageModal
        isOpen={Boolean(messageModalContact)}
        onClose={() => setMessageModalContact(null)}
        contact={messageModalContact}
        templates={templates}
        activeTemplateId={activeTemplateId}
        waConnected={waConnected}
        waSession={waSession}
        onSendDirect={handleSendDirectFromModal}
        onSendWeb={handleSendWebFromModal}
        onNavigateToWhatsAppLink={() => setActiveTab('whatsapp')}
      />

      {/* Share Outreach Webpage Link Modal */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        contacts={contacts}
        selectedIds={selectedIds}
        localities={localities}
        activeTemplateText={customText}
        onToast={showToast}
      />

      {/* Sticky Bottom Tab Bar (Mobile Navigation) */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalContacts={contacts.length}
        templatesCount={templates.length}
        onOpenAddModal={() => {
          setEditingContact(null);
          setIsAddModalOpen(true);
        }}
        waConnected={waConnected}
      />

    </div>
  );
}
