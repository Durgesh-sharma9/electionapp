import React, { useState, useMemo } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Users,
  Search,
  CheckSquare,
  Square,
  Link2,
  CheckCircle2,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function ShareLinkModal({
  isOpen,
  onClose,
  contacts = [],
  localities = [],
  selectedIds = new Set(),
  activeTemplateText = '',
  onToast,
}) {
  if (!isOpen) return null;

  const totalContacts = contacts.length;

  // Form State
  const [title, setTitle] = useState('Mahapura Outreach Campaign');
  const [scopeMode, setScopeMode] = useState(selectedIds && selectedIds.size > 0 ? 'selected' : 'all'); // 'all' | 'selected' | 'locality'
  const [selectedLocality, setSelectedLocality] = useState(() => {
    return localities[0]?.name || 'Mahima';
  });

  // Local state for selected contact IDs inside modal
  const [modalSelectedIds, setModalSelectedIds] = useState(() => {
    if (selectedIds && selectedIds.size > 0) {
      return new Set(selectedIds);
    }
    // Default select all if none selected initially
    return new Set(contacts.map((c) => c._id));
  });

  // Search filter inside the contact picker
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  const [messageTemplate, setMessageTemplate] = useState(
    activeTemplateText || 'Hello {name}, hope you are doing well! Reaching out to connect and stay in touch.'
  );

  // Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedShareData, setGeneratedShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Toggle single contact in modal picker
  const handleToggleContact = (id) => {
    setModalSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all / Deselect all in picker
  const handleSelectAllContacts = () => {
    if (modalSelectedIds.size === contacts.length) {
      setModalSelectedIds(new Set());
    } else {
      setModalSelectedIds(new Set(contacts.map((c) => c._id)));
    }
  };

  // Filtered contacts for picker display
  const filteredContactsForPicker = useMemo(() => {
    if (!contactSearchQuery.trim()) return contacts;
    const q = contactSearchQuery.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.locality && c.locality.toLowerCase().includes(q))
    );
  }, [contacts, contactSearchQuery]);

  // Compute included contacts
  const includedList = useMemo(() => {
    if (scopeMode === 'selected') {
      return contacts.filter((c) => modalSelectedIds.has(c._id));
    }
    if (scopeMode === 'locality') {
      const locTarget = (selectedLocality || '').trim().toLowerCase();
      return contacts.filter((c) => (c.locality || 'Mahima').trim().toLowerCase() === locTarget);
    }
    // Default: 'all'
    return contacts;
  }, [scopeMode, modalSelectedIds, selectedLocality, contacts]);

  // Generate Share Link
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (includedList.length === 0) {
      alert('Please select at least 1 contact to generate the link.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Outreach Contact List',
          messageTemplate,
          contacts: includedList,
          countLimit: includedList.length,
          localityFilter: scopeMode === 'locality' ? selectedLocality : '',
        }),
      });

      const data = await res.json();
      if (data.success) {
        const shareUrl = `${window.location.origin}/?share=${data.shareId}`;
        setGeneratedLink(shareUrl);
        setGeneratedShareData(data);
        if (onToast) onToast('Share link generated successfully! 🔗');
      } else {
        alert(data.error || 'Failed to generate share link');
      }
    } catch (err) {
      alert('Error creating link: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    if (onToast) onToast('Link copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenLink = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank');
  };

  const handleShareViaWhatsApp = () => {
    if (!generatedLink) return;
    const shareMsg = `*${title}*\n\nHere is your assigned outreach contact list (${includedList.length} contacts) with direct WhatsApp and Call buttons:\n\n👉 Open List: ${generatedLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
  };

  // Locality list
  const availableLocalities = useMemo(() => {
    const set = new Set();
    localities.forEach((l) => { if (l.name) set.add(l.name.trim()); });
    contacts.forEach((c) => { if (c.locality) set.add(c.locality.trim()); });
    if (set.size === 0) set.add('Mahima');
    return Array.from(set);
  }, [localities, contacts]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.3)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                flexShrink: 0,
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#0f172a' }}>
                Share Outreach Webpage Link
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Generate a live public page with Direct WhatsApp & Call buttons
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY (Scrollable) */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1 }}>
          {!generatedLink ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Campaign Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Campaign / List Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mahapura Outreach Campaign"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                  }}
                />
              </div>

              {/* Selection Scope Radio Options */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                    Select Contacts to Include:
                  </label>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {includedList.length} Contacts Included
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Option 1: All Contacts */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: scopeMode === 'all' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: scopeMode === 'all' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="shareScope"
                      value="all"
                      checked={scopeMode === 'all'}
                      onChange={() => setScopeMode('all')}
                      style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                        1. All Contacts ({totalContacts} Contacts in Directory)
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Generate public link containing all contacts in the database.
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Selected Contacts Only (WITH INTERACTIVE LIST PICKER) */}
                  <div
                    style={{
                      borderRadius: '10px',
                      border: scopeMode === 'selected' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: scopeMode === 'selected' ? '#f8fafc' : '#ffffff',
                      transition: 'all 0.15s ease',
                      overflow: 'hidden',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: scopeMode === 'selected' ? '#f0f9ff' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="shareScope"
                        value="selected"
                        checked={scopeMode === 'selected'}
                        onChange={() => setScopeMode('selected')}
                        style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                          2. Selected Contacts Only ({modalSelectedIds.size} selected)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Pick exactly which contacts to assign to this link below.
                        </div>
                      </div>
                    </label>

                    {/* Contact Picker View - Visible when Option 2 is Active */}
                    {scopeMode === 'selected' && (
                      <div
                        style={{
                          padding: '10px 14px 14px 14px',
                          borderTop: '1px solid #e2e8f0',
                          background: '#ffffff',
                        }}
                      >
                        {/* Search & Select All Bar */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <div
                            style={{
                              position: 'relative',
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Search
                              size={14}
                              color="#94a3b8"
                              style={{ position: 'absolute', left: '10px' }}
                            />
                            <input
                              type="text"
                              value={contactSearchQuery}
                              onChange={(e) => setContactSearchQuery(e.target.value)}
                              placeholder="Search contacts by name or phone..."
                              style={{
                                width: '100%',
                                padding: '6px 10px 6px 30px',
                                fontSize: '0.8rem',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSelectAllContacts}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {modalSelectedIds.size === contacts.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        {/* Interactive Contacts List (Max Height with scroll) */}
                        <div
                          style={{
                            maxHeight: '190px',
                            overflowY: 'auto',
                            border: '1px solid #f1f5f9',
                            borderRadius: '8px',
                            background: '#fafafa',
                          }}
                        >
                          {filteredContactsForPicker.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                              No contacts match your search.
                            </div>
                          ) : (
                            filteredContactsForPicker.map((c) => {
                              const isChecked = modalSelectedIds.has(c._id);
                              return (
                                <div
                                  key={c._id}
                                  onClick={() => handleToggleContact(c._id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '7px 10px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: isChecked ? '#eff6ff' : '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'background 0.1s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleContact(c._id)}
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ accentColor: '#0284c7', width: '15px', height: '15px' }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                      <div
                                        style={{
                                          fontSize: '0.82rem',
                                          fontWeight: 600,
                                          color: '#0f172a',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {c.serialNo ? <span style={{ color: '#0284c7' }}>#{c.serialNo} </span> : null}
                                        {c.name}
                                      </div>
                                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                        +91 {c.phone}
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 600,
                                      color: '#475569',
                                      background: '#f1f5f9',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {c.locality || 'Mahima'}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: By Locality */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: scopeMode === 'locality' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: scopeMode === 'locality' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="shareScope"
                      value="locality"
                      checked={scopeMode === 'locality'}
                      onChange={() => setScopeMode('locality')}
                      style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                    />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#0f172a' }}>
                          3. By Locality (Area-wise)
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Include only contacts residing in a specific locality.
                        </div>
                      </div>

                      {scopeMode === 'locality' && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <select
                            value={selectedLocality}
                            onChange={(e) => setSelectedLocality(e.target.value)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              background: '#ffffff',
                            }}
                          >
                            {availableLocalities.map((loc) => {
                              const cnt = contacts.filter((c) => (c.locality || 'Mahima').trim().toLowerCase() === loc.toLowerCase()).length;
                              return (
                                <option key={loc} value={loc}>
                                  {loc} ({cnt} Contacts)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  </label>

                </div>
              </div>

              {/* Default WhatsApp Outreach Message Template */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                    Default WhatsApp Outreach Message:
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {'{name}'} is replaced dynamically
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Enter message text with {name} placeholder..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    fontFamily: 'inherit',
                    lineHeight: '1.4',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || includedList.length === 0}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: includedList.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: includedList.length === 0 ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                  }}
                >
                  <Link2 size={16} />
                  <span>{isGenerating ? 'Generating Link...' : `Generate Link (${includedList.length} Contacts)`}</span>
                </button>
              </div>

            </form>
          ) : (
            /* LINK GENERATED SUCCESS SCREEN */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <CheckCircle2 size={24} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#166534', fontWeight: 700 }}>
                    Public Link Generated Successfully!
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                    Volunteers & callers can open this page directly on any phone without login. It contains{' '}
                    <strong>{includedList.length} contacts</strong> with 1-click Call & WhatsApp buttons.
                  </p>
                </div>
              </div>

              {/* URL Display Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Public Outreach Link:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.82rem',
                      color: '#0369a1',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${copied ? '#10b981' : '#cbd5e1'}`,
                      background: copied ? '#ecfdf5' : '#ffffff',
                      color: copied ? '#059669' : '#0f172a',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons for Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleOpenLink}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd',
                    background: '#f0f9ff',
                    color: '#0369a1',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Open Webpage</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareViaWhatsApp}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <MessageCircle size={15} />
                  <span>Share via WhatsApp</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedLink('');
                    setGeneratedShareData(null);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '0.8rem',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  ← Create Another Link
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
