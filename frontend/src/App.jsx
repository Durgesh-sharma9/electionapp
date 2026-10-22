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
  Zap,
  Sparkles,
} from 'lucide-react';

import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import StatsOverview from './components/StatsOverview';
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
import SureVotersView from './components/SureVotersView';
import LoginView from './components/LoginView';

export default function App() {
  // Check if opening a shared outreach link (?share=sh_xxxx) - Public links bypass login!
  const urlShareId = useMemo(() => {
    return new URLSearchParams(window.location.search).get('share');
  }, []);

  if (urlShareId) {
    return <PublicShareView shareId={urlShareId} />;
  }

  // Persistent Admin Authentication (Device remember: admin / 123456)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const auth = localStorage.getItem('mahapura_admin_auth');
      if (auth) {
        const parsed = JSON.parse(auth);
        return Boolean(parsed.loggedIn);
      }
    } catch {}
    return false;
  });

  const handleLogin = (user) => {
    try {
      localStorage.setItem('mahapura_admin_auth', JSON.stringify({ loggedIn: true, user, at: Date.now() }));
    } catch {}
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        localStorage.removeItem('mahapura_admin_auth');
      } catch {}
      setIsAuthenticated(false);
    }
  };

  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  // Valid Main View Tabs with browser URL synchronization
  const VALID_TABS = ['contacts', 'sure-voters', 'templates', 'dashboard', 'whatsapp', 'localities', 'analytics'];

  const getTabFromUrl = () => {
    try {
      const rawPath = decodeURIComponent(window.location.pathname.replace(/^\/+/, '')).toLowerCase().trim();
      if (VALID_TABS.includes(rawPath)) return rawPath;
      if (rawPath === 'sure' || rawPath === 'sure voters' || rawPath === 'sure-voters' || rawPath === 'surevoters') return 'sure-voters';
      if (rawPath === 'wards' || rawPath === 'ward' || rawPath === 'locality' || rawPath === 'localities') return 'localities';
      if (rawPath === 'template' || rawPath === 'templates') return 'templates';
      if (rawPath === 'dash' || rawPath === 'dashboard') return 'dashboard';
      if (rawPath === 'wa' || rawPath === 'whatsapp') return 'whatsapp';
      if (rawPath === 'analytic' || rawPath === 'analytics') return 'analytics';

      const hash = decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).toLowerCase().trim();
      if (VALID_TABS.includes(hash)) return hash;
      if (hash === 'sure' || hash === 'sure voters' || hash === 'sure-voters' || hash === 'surevoters') return 'sure-voters';
    } catch {}
    return 'contacts';
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  const navigateTab = (tab, replace = false) => {
    setActiveTab(tab);
    try {
      const targetPath = tab === 'contacts' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ tab }, '', targetPath);
        } else {
          window.history.pushState({ tab }, '', targetPath);
        }
      }
    } catch {}
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTab('contacts');
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getTabFromUrl();
      setActiveTab(currentTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [contactedFilter, setContactedFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [localityFilter, setLocalityFilter] = useState('ALL');
  const [referenceFilter, setReferenceFilter] = useState('ALL');
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 880 : false));
  const [viewMode, setViewMode] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 880 ? 'cards' : 'table'));

  // Ward Master & Locality Master & Reference state
  const [wards, setWards] = useState([]);
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

  // Active Action Menu for 2-number contacts (WhatsApp or Call popup)
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.action-dropdown-popover') && !e.target.closest('.btn-action-trigger')) {
        setActiveActionMenu(null);
      }
    };
    if (activeActionMenu) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [activeActionMenu]);

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

  // Fetch Wards from MongoDB
  const fetchWards = async () => {
    try {
      const res = await fetch('/api/wards');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWards(data.data);
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
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

  // Fetch Stats & Contacts & Wards & Localities & References
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

      // Refresh wards, localities and references counts
      fetchWards();
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
    fetchWards();
    fetchLocalities();
    fetchReferences();

    const handleResize = () => {
      const mobile = window.innerWidth <= 880;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('cards');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to get effective ward from contact or inherited from locality
  const getContactWard = (contact) => {
    if (contact?.ward && contact.ward.trim()) return contact.ward.trim();
    if (contact?.locality) {
      const locObj = localities.find(
        (l) => l.name?.trim().toLowerCase() === contact.locality?.trim().toLowerCase()
      );
      if (locObj && locObj.ward && locObj.ward.trim()) return locObj.ward.trim();
    }
    return '';
  };

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Contacted, Symbol Sent, Pending & Sure filter
      const currentSt = c.status || (c.contacted ? 'Contacted' : 'Pending');
      if (contactedFilter === 'CONTACTED' && currentSt !== 'Contacted') return false;
      if (contactedFilter === 'SYMBOL_SENT' && currentSt !== 'Symbol Sent') return false;
      if (contactedFilter === 'PENDING' && currentSt !== 'Pending') return false;
      if (contactedFilter === 'SURE' && !c.isSureVoter) return false;

      // Ward filter
      const contactWard = getContactWard(c);
      if (wardFilter !== 'ALL') {
        if (wardFilter === 'UNASSIGNED') {
          if (contactWard && contactWard.trim() !== '') return false;
        } else if (contactWard !== wardFilter) {
          return false;
        }
      }

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
  }, [contacts, localities, categoryFilter, contactedFilter, wardFilter, localityFilter, referenceFilter, searchQuery]);

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
        navigateTab('whatsapp');
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
  const handleSendWebFromModal = async (contact, messageText, targetPhone = null) => {
    const rawNumber = targetPhone || contact.phone;
    const phone = rawNumber.replace(/\D/g, '');
    const fullPhone = phone.startsWith('91') && phone.length === 12 ? phone : `91${phone}`;
    const encodedMessage = encodeURIComponent(messageText);

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
  const handleCallRedirect = (contact, targetPhone = null) => {
    const rawNumber = targetPhone || (typeof contact === 'string' ? contact : contact.phone);
    const cleanDigits = rawNumber.replace(/\D/g, '');
    const fullPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
    navigator.clipboard.writeText(cleanDigits);
    showToast(`📞 Calling ${contact.name || ''} (${fullPhone} copied)`);
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
          prev.map((c) =>
            c._id === id
              ? {
                  ...c,
                  contacted: !currentStatus,
                  status: !currentStatus ? 'Contacted' : 'Pending',
                }
              : c
          )
        );
        showToast(!currentStatus ? 'Marked as Contacted ✅' : 'Marked as Pending ⏳');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Change Outreach Status (Pending, Contacted, Symbol Sent)
  const handleStatusChange = async (id, newStatus) => {
    try {
      setContacts((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, status: newStatus, contacted: newStatus !== 'Pending' }
            : c
        )
      );

      const res = await fetch(`/api/contacts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus === 'Symbol Sent') {
          showToast('Status: Symbol Sent 🗳️');
        } else if (newStatus === 'Contacted') {
          showToast('Status: Contacted ✅');
        } else {
          showToast('Status: Pending ⏳');
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Error updating status ❌');
    }
  };

  // Toggle Confirmed Sure Voter Status
  const handleToggleSureVoter = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/contacts/${id}/sure`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSureVoter: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, isSureVoter: !currentStatus } : c))
        );
        setStats((prev) => {
          if (!prev) return prev;
          const delta = !currentStatus ? 1 : -1;
          return {
            ...prev,
            sureCount: Math.max(0, (prev.sureCount || 0) + delta),
          };
        });
        showToast(!currentStatus ? '⭐ Marked as Confirmed Sure Voter!' : 'Removed from Sure Voters');
      } else {
        alert(data.error || 'Failed to update sure voter status');
      }
    } catch (err) {
      console.error('Failed to toggle sure status:', err);
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

  // If not authenticated on this device, show LoginView (admin / 123456)
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

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
        onTabChange={navigateTab}
        totalContacts={contacts.length}
        sureCount={stats?.sureCount ?? contacts.filter((c) => c.isSureVoter).length}
        templatesCount={templates.length}
        localitiesCount={localities.length}
        waConnected={waConnected}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        <Navbar
          activeTab={activeTab}
          totalContacts={contacts.length}
          sureCount={stats?.sureCount ?? contacts.filter((c) => c.isSureVoter).length}
          onOpenAddModal={() => {
            setEditingContact(null);
            setIsAddModalOpen(true);
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onRefresh={fetchData}
          onLogout={handleLogout}
          onNavigateTab={navigateTab}
          onBack={handleBack}
          loading={loading}
        />

        {/* Page Body Container (Navbar stays permanently fixed at top) */}
        <div className="app-page-container">

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED DASHBOARD                                      */}
      {/* ============================================================== */}
      {activeTab === 'dashboard' && (
        <DashboardView
          stats={stats}
          contacts={contacts}
          wards={wards}
          localities={localities}
          contactsCount={contacts.length}
          templatesCount={templates.length}
          onNavigateTab={navigateTab}
          onFilterByWard={(wName) => {
            setWardFilter(wName);
            navigateTab('contacts');
          }}
          onFilterByLocality={(lName) => {
            setLocalityFilter(lName);
            navigateTab('contacts');
          }}
          onOpenAddModal={() => {
            setEditingContact(null);
            setIsAddModalOpen(true);
          }}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onExportCSV={handleExportCSV}
          onOpenSendMessage={handleOpenSendMessage}
          onCallRedirect={handleCallRedirect}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 2: CONTACTS LIST ONLY (Bss List View)                      */}
      {/* ============================================================== */}
      {activeTab === 'contacts' && (
        <>
          {/* Search & Filter Toolbar (Balanced) */}
          <div className="glass-panel" style={{ padding: isMobile ? '8px 10px' : '8px 14px', marginBottom: '10px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', flexWrap: isMobile ? 'nowrap' : 'wrap', gap: '8px', width: '100%', minWidth: 0 }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: isMobile ? '1 1 auto' : '1 1 200px', width: isMobile ? '100%' : 'auto', minWidth: 0 }}>
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

              {/* Filter Controls (Horizontally scrollable on mobile) */}
              <div className="mobile-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto', minWidth: 0, overflowX: 'auto' }}>
                
                {/* Ward Filter */}
                <select
                  className="input-field"
                  value={wardFilter}
                  onChange={(e) => {
                    setWardFilter(e.target.value);
                    setLocalityFilter('ALL'); // Reset locality filter when ward changes
                  }}
                  style={{
                    width: 'auto',
                    padding: '4px 10px',
                    fontSize: '0.8rem',
                    height: '34px',
                    borderColor: wardFilter !== 'ALL' ? '#2563eb' : undefined,
                    background: wardFilter !== 'ALL' ? '#eff6ff' : '#ffffff',
                    fontWeight: 600,
                  }}
                  title="Filter by Ward"
                >
                  <option value="ALL">🏛️ All Wards</option>
                  <option value="UNASSIGNED">Unassigned Ward</option>
                  {wards.map((w) => (
                    <option key={w._id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>

                {/* Locality Filter - dynamically filtered to selected Ward if one is picked */}
                <select
                  className="input-field"
                  value={localityFilter}
                  onChange={(e) => setLocalityFilter(e.target.value)}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem', height: '34px', borderColor: localityFilter !== 'ALL' ? '#f59e0b' : undefined, background: localityFilter !== 'ALL' ? '#fef3c7' : '#ffffff' }}
                  title="Filter by Locality / Area"
                >
                  <option value="ALL">📍 All Localities</option>
                  <option value="UNASSIGNED">Unassigned Only</option>
                  {(wardFilter !== 'ALL' ? localities.filter((l) => l.ward === wardFilter) : localities).map((loc) => (
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

                {/* Status / Sure Filter */}
                <select
                  className="input-field"
                  value={contactedFilter}
                  onChange={(e) => setContactedFilter(e.target.value)}
                  style={{
                    width: 'auto',
                    padding: '4px 8px',
                    fontSize: '0.8rem',
                    height: '34px',
                    borderColor: contactedFilter === 'SURE' ? '#f59e0b' : undefined,
                    background: contactedFilter === 'SURE' ? '#fef3c7' : '#ffffff',
                    fontWeight: contactedFilter === 'SURE' ? 700 : 500,
                  }}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="CONTACTED">✅ Contacted</option>
                  <option value="SYMBOL_SENT">🗳️ Symbol Sent</option>
                  <option value="SURE">⭐ Sure Voters Only</option>
                </select>

                {/* View Mode Switcher (Desktop only - mobile uses dedicated responsive Cards) */}
                {!isMobile && (
                  <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '2px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    <button
                      onClick={() => setViewMode('cards')}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
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
                        borderRadius: '6px',
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
                )}

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

          {/* Results Summary with Total and Sure Votes Tally */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 500 }}>
                Showing <strong>{filteredContacts.length}</strong> contacts
              </span>
              <span style={{ fontSize: '0.78rem', color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                👥 {filteredContacts.reduce((sum, c) => sum + (c.voterCount || 1), 0)} Total Votes
              </span>
              <span style={{ fontSize: '0.78rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                ⭐ {filteredContacts.filter((c) => c.isSureVoter).reduce((sum, c) => sum + (c.voterCount || 1), 0)} Sure Votes
              </span>
            </div>

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
                  <span>Add Contact</span>
                </button>
              </div>
            </div>
          ) : isMobile || viewMode === 'cards' ? (
            /* Native App-Style Responsive Contact Cards */
            <div className="contact-grid">
                  {filteredContacts.map((contact) => (
                    <ContactCard
                      key={contact._id}
                      contact={{
                        ...contact,
                        ward: getContactWard(contact),
                      }}
                      isSelected={selectedIds.has(contact._id)}
                      onSelectToggle={(id, checked) => {
                        const next = new Set(selectedIds);
                        if (checked) next.add(id);
                        else next.delete(id);
                        setSelectedIds(next);
                      }}
                      onToggleSureVoter={handleToggleSureVoter}
                      onStatusChange={handleStatusChange}
                      onDirectWhatsAppSend={(c) => handleSendWebFromModal(c, customText)}
                      onWhatsAppRedirect={(c) => handleSendWebFromModal(c, customText)}
                      onOpenTemplateModal={(c) => setMessageModalContact(c)}
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
                /* Desktop Table View */
                <div className="compact-table-container" style={{ overflowX: 'auto' }}>
                  <table className="compact-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                          <tr>
                            <th style={{ width: '30px', textAlign: 'center', padding: '7px 4px' }}>
                              <input
                                type="checkbox"
                                checked={selectedIds.size > 0 && selectedIds.size === filteredContacts.length}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedIds(new Set(filteredContacts.map((c) => c._id)));
                                  else setSelectedIds(new Set());
                                }}
                              />
                            </th>
                            <th style={{ width: '38px', textAlign: 'center', padding: '7px 4px' }}>#</th>
                            <th style={{ padding: '7px 6px' }}>NAME</th>
                            <th style={{ width: '80px', padding: '7px 5px' }}>WARD</th>
                            <th style={{ width: '85px', padding: '7px 5px' }}>LOCALITY</th>
                            <th style={{ width: '135px', padding: '7px 5px' }}>PHONE</th>
                            <th style={{ width: '75px', padding: '7px 5px' }}>SURE</th>
                            <th style={{ width: '55px', padding: '7px 5px' }}>REF</th>
                            <th style={{ width: '85px', padding: '7px 5px' }}>STATUS</th>
                            <th style={{ width: '170px', padding: '7px 5px', textAlign: 'right' }}>ACTIONS</th>
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
                      <td style={{ textAlign: 'center', padding: '5px 4px' }}>
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
                      <td style={{ textAlign: 'center', padding: '5px 4px', fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', fontSize: '0.76rem' }}>
                        #{contact.serialNo || index + 1}
                      </td>
                      <td style={{ padding: '5px 6px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem' }}>{contact.name}</span>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              padding: '1px 5px',
                              background: (contact.voterCount || 1) > 1 ? '#e0f2fe' : '#f8fafc',
                              color: (contact.voterCount || 1) > 1 ? '#0369a1' : '#64748b',
                              border: `1px solid ${(contact.voterCount || 1) > 1 ? '#bae6fd' : '#e2e8f0'}`,
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                            title={`${contact.voterCount || 1} voters in family`}
                          >
                            👥 {contact.voterCount || 1} {(contact.voterCount || 1) > 1 ? 'Votes' : 'Vote'}
                          </span>
                          {contact.notes && (
                            <span style={{ fontSize: '0.66rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '1px 4px', fontWeight: 500 }}>
                              ⚠️ {contact.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '5px 5px', whiteSpace: 'nowrap' }}>
                        {getContactWard(contact) ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600,
                              borderRadius: '4px',
                            }}
                          >
                            🏛️ {getContactWard(contact)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '5px 5px', whiteSpace: 'nowrap' }}>
                        {contact.locality ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600,
                              borderRadius: '4px',
                            }}
                          >
                            📍 {contact.locality}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '5px 5px', fontFamily: 'monospace', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '0.76rem' }}>+91 {contact.phone}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(contact.phone);
                                showToast(`Copied ${contact.phone}`);
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                              title="Copy Main Number"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                          {contact.secondaryPhone && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#6366f1' }}>+91 {contact.secondaryPhone}</span>
                              <span style={{ fontSize: '0.58rem', background: '#e0e7ff', color: '#4338ca', padding: '0 3px', borderRadius: '3px', fontWeight: 700 }}>2nd</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(contact.secondaryPhone);
                                  showToast(`Copied ${contact.secondaryPhone}`);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                                title="Copy 2nd Number"
                              >
                                <Copy size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '5px 5px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleSureVoter(contact._id, contact.isSureVoter)}
                          style={{
                            background: contact.isSureVoter ? '#fef3c7' : '#ffffff',
                            border: contact.isSureVoter ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                            color: contact.isSureVoter ? '#b45309' : '#64748b',
                            padding: '2px 5px',
                            borderRadius: '5px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            height: '24px',
                            boxShadow: contact.isSureVoter ? '0 1px 3px rgba(245, 158, 11, 0.15)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                          title={contact.isSureVoter ? `Confirmed: ${contact.voterCount || 1} Sure Votes (Click to toggle)` : `Click to mark as Confirmed (+${contact.voterCount || 1} Votes)`}
                        >
                          <span>{contact.isSureVoter ? `⭐ ${contact.voterCount || 1} Sure` : `☆ Mark (${contact.voterCount || 1})`}</span>
                        </button>
                      </td>
                      <td style={{ padding: '5px 5px', whiteSpace: 'nowrap' }}>
                        {contact.reference ? (
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 5px',
                              background: '#ede9fe',
                              color: '#5b21b6',
                              border: '1px solid #ddd6fe',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontWeight: 600,
                              borderRadius: '4px',
                            }}
                          >
                            👤 {contact.reference}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '5px 5px', whiteSpace: 'nowrap' }}>
                        <select
                          value={contact.status || (contact.contacted ? 'Contacted' : 'Pending')}
                          onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 4px',
                            height: '24px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            outline: 'none',
                            border: '1.5px solid',
                            transition: 'all 0.15s ease',
                            background:
                              contact.status === 'Symbol Sent'
                                ? '#f5f3ff'
                                : contact.status === 'Contacted' || contact.contacted
                                ? '#ecfdf5'
                                : '#fffbeb',
                            color:
                              contact.status === 'Symbol Sent'
                                ? '#6d28d9'
                                : contact.status === 'Contacted' || contact.contacted
                                ? '#047857'
                                : '#b45309',
                            borderColor:
                              contact.status === 'Symbol Sent'
                                ? '#ddd6fe'
                                : contact.status === 'Contacted' || contact.contacted
                                ? '#a7f3d0'
                                : '#fde68a',
                          }}
                          title="Change voter outreach status"
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="Contacted">✅ Contacted</option>
                          <option value="Symbol Sent">🗳️ Symbol Sent</option>
                        </select>
                      </td>
                      <td style={{ padding: '5px 5px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '3px', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap', position: 'relative' }}>
                          
                          {/* 1. Direct WhatsApp Button (Single Button) */}
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className="btn btn-whatsapp btn-action-trigger"
                              onClick={() => {
                                if (contact.secondaryPhone) {
                                  setActiveActionMenu((prev) =>
                                    prev?.id === contact._id && prev?.type === 'wa' ? null : { id: contact._id, type: 'wa' }
                                  );
                                } else {
                                  handleSendWebFromModal(contact, customText, contact.phone);
                                }
                              }}
                              style={{
                                height: '24px',
                                padding: '0 6px',
                                fontSize: '0.68rem',
                                borderRadius: '5px',
                                gap: '3px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                boxShadow: '0 1px 4px rgba(16, 185, 129, 0.2)',
                                flexShrink: 0,
                              }}
                              title={contact.secondaryPhone ? 'Choose WhatsApp Number' : 'Direct WhatsApp Chat'}
                            >
                              <MessageCircle size={11} fill="#ffffff" />
                              <span>WhatsApp</span>
                              {contact.secondaryPhone && (
                                <span style={{ fontSize: '0.56rem', background: 'rgba(255,255,255,0.28)', padding: '0 3px', borderRadius: '3px', marginLeft: '1px', fontWeight: 800 }}>
                                  2
                                </span>
                              )}
                            </button>

                            {/* WhatsApp Number Selection Popup */}
                            {activeActionMenu?.id === contact._id && activeActionMenu?.type === 'wa' && (
                              <div
                                className="action-dropdown-popover"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  marginTop: '4px',
                                  zIndex: 1000,
                                  background: '#ffffff',
                                  border: '1.5px solid #cbd5e1',
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
                                  padding: '5px',
                                  minWidth: '190px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  animation: 'fadeIn 0.12s ease-out',
                                }}
                              >
                                <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', padding: '2px 6px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <MessageCircle size={10} color="#059669" />
                                  <span>Send WhatsApp to:</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSendWebFromModal(contact, customText, contact.phone);
                                    setActiveActionMenu(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #a7f3d0',
                                    background: '#ecfdf5',
                                    color: '#047857',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                  }}
                                >
                                  <span>📱 Main: +91 {contact.phone}</span>
                                  <span style={{ fontSize: '0.60rem', background: '#dcfce7', color: '#15803d', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>1</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSendWebFromModal(contact, customText, contact.secondaryPhone);
                                    setActiveActionMenu(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #c7d2fe',
                                    background: '#eef2ff',
                                    color: '#4338ca',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                  }}
                                >
                                  <span>📱 2nd: +91 {contact.secondaryPhone}</span>
                                  <span style={{ fontSize: '0.60rem', background: '#e0e7ff', color: '#3730a3', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>2</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 2. Choose Template / Edit Message Button */}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setMessageModalContact(contact)}
                            style={{
                              height: '24px',
                              padding: '0 5px',
                              fontSize: '0.68rem',
                              borderRadius: '5px',
                              background: '#fffbeb',
                              borderColor: '#fde68a',
                              color: '#b45309',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              flexShrink: 0,
                            }}
                            title="Choose Template / Edit Message"
                          >
                            <Sparkles size={11} color="#f59e0b" />
                            <span>Template</span>
                          </button>

                          {/* 3. Call Phone Button (Single Button) */}
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className="btn btn-call btn-action-trigger"
                              onClick={() => {
                                if (contact.secondaryPhone) {
                                  setActiveActionMenu((prev) =>
                                    prev?.id === contact._id && prev?.type === 'call' ? null : { id: contact._id, type: 'call' }
                                  );
                                } else {
                                  handleCallRedirect(contact, contact.phone);
                                }
                              }}
                              style={{
                                height: '24px',
                                padding: contact.secondaryPhone ? '0 5px' : 0,
                                width: contact.secondaryPhone ? 'auto' : '24px',
                                borderRadius: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '2px',
                                flexShrink: 0,
                              }}
                              title={contact.secondaryPhone ? 'Choose Number to Call' : `Call: +91 ${contact.phone}`}
                            >
                              <Phone size={11} />
                              {contact.secondaryPhone && (
                                <span style={{ fontSize: '0.56rem', background: 'rgba(255,255,255,0.25)', padding: '0 3px', borderRadius: '3px', fontWeight: 800 }}>
                                  2
                                </span>
                              )}
                            </button>

                            {/* Call Number Selection Popup */}
                            {activeActionMenu?.id === contact._id && activeActionMenu?.type === 'call' && (
                              <div
                                className="action-dropdown-popover"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  marginTop: '4px',
                                  zIndex: 1000,
                                  background: '#ffffff',
                                  border: '1.5px solid #cbd5e1',
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.25)',
                                  padding: '5px',
                                  minWidth: '190px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px',
                                  animation: 'fadeIn 0.12s ease-out',
                                }}
                              >
                                <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', padding: '2px 6px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Phone size={10} color="#2563eb" />
                                  <span>Call Phone:</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCallRedirect(contact, contact.phone);
                                    setActiveActionMenu(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #bfdbfe',
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                  }}
                                >
                                  <span>📞 Main: +91 {contact.phone}</span>
                                  <span style={{ fontSize: '0.60rem', background: '#dbeafe', color: '#1e40af', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>1</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCallRedirect(contact, contact.secondaryPhone);
                                    setActiveActionMenu(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid #c7d2fe',
                                    background: '#eef2ff',
                                    color: '#4338ca',
                                    fontWeight: 700,
                                    fontSize: '0.74rem',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    width: '100%',
                                  }}
                                >
                                  <span>📞 2nd: +91 {contact.secondaryPhone}</span>
                                  <span style={{ fontSize: '0.60rem', background: '#e0e7ff', color: '#3730a3', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>2</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 4. Edit Contact Button */}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingContact(contact);
                              setIsAddModalOpen(true);
                            }}
                            style={{
                              width: '24px',
                              height: '24px',
                              padding: 0,
                              borderRadius: '5px',
                              color: '#0284c7',
                              borderColor: '#cbd5e1',
                              background: '#ffffff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                            title="Edit Contact"
                          >
                            <Edit2 size={11} />
                          </button>

                          {/* 5. Delete Contact Button */}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleDeleteContact(contact._id)}
                            style={{
                              width: '24px',
                              height: '24px',
                              padding: 0,
                              borderRadius: '5px',
                              color: '#ef4444',
                              borderColor: '#fecaca',
                              background: '#fff5f5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                            title="Delete Contact"
                          >
                            <Trash2 size={11} />
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
      {/* TAB 2.5: SURE VOTERS TRACKER & WARD/LOCALITY ANALYTICS         */}
      {/* ============================================================== */}
      {activeTab === 'sure-voters' && (
        <SureVotersView
          contacts={contacts}
          wards={wards}
          localities={localities}
          references={references}
          onToggleSureVoter={handleToggleSureVoter}
          onStatusChange={handleStatusChange}
          onWhatsAppRedirect={(c) => handleSendWebFromModal(c, customText)}
          onOpenTemplateModal={(c) => setMessageModalContact(c)}
          onCallRedirect={handleCallRedirect}
          onEditContact={(c) => {
            setEditingContact(c);
            setIsAddModalOpen(true);
          }}
          onDeleteContact={handleDeleteContact}
          onOpenAddModal={() => {
            setEditingContact(null);
            setIsAddModalOpen(true);
          }}
          onBack={handleBack}
          waConnected={waConnected}
          onToast={showToast}
        />
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
      {/* TAB 5: WARD & LOCALITY MASTER VIEW                             */}
      {/* ============================================================== */}
      {activeTab === 'localities' && (
        <LocalityMaster
          wards={wards}
          localities={localities}
          onRefreshLocalities={() => {
            fetchWards();
            fetchLocalities();
            fetchData();
          }}
          onFilterByLocality={(locName) => {
            setLocalityFilter(locName);
            navigateTab('contacts');
          }}
          onBack={handleBack}
          totalContacts={contacts.length}
          onToast={showToast}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 6: ANALYTICS VIEW (Campaign, Wards & Share Link Analytics) */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <AnalyticsView
          contacts={contacts}
          stats={stats}
          wards={wards}
          localities={localities}
          onToast={showToast}
        />
      )}

        </div>
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
        wards={wards}
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
        onNavigateToWhatsAppLink={() => navigateTab('whatsapp')}
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
        onTabChange={navigateTab}
        totalContacts={contacts.length}
        localitiesCount={localities.length}
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
