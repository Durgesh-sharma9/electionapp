import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Users,
  Sparkles,
  Link2,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function ShareLinkModal({
  isOpen,
  onClose,
  contacts = [],
  selectedIds = new Set(),
  activeTemplateText = '',
  onToast,
}) {
  if (!isOpen) return null;

  const totalContacts = contacts.length;

  // Form State
  const [title, setTitle] = useState('Mahapura Outreach Campaign');
  const [scopeMode, setScopeMode] = useState('all'); // 'all' | 'custom_count' | 'selected'
  const [customCount, setCustomCount] = useState(totalContacts);
  const [messageTemplate, setMessageTemplate] = useState(
    activeTemplateText || 'Hello {name}, hope you are doing well! Reaching out to connect and stay in touch.'
  );

  // Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedShareData, setGeneratedShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Compute how many contacts will be included
  const getIncludedContacts = () => {
    if (scopeMode === 'selected') {
      const selected = contacts.filter((c) => selectedIds.has(c._id));
      return selected.length > 0 ? selected : contacts;
    }
    if (scopeMode === 'custom_count') {
      const limit = Math.max(1, Math.min(totalContacts, Number(customCount) || totalContacts));
      return contacts.slice(0, limit);
    }
    // Default: ALL contacts
    return contacts;
  };

  const includedList = getIncludedContacts();

  // Generate Share Link
  const handleGenerate = async (e) => {
    e.preventDefault();
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
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Build URL using current host
        const shareUrl = `${window.location.origin}/?share=${data.shareId}`;
        setGeneratedLink(shareUrl);
        setGeneratedShareData(data);
        if (onToast) onToast('Share link created successfully! 🔗');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-scale-in"
        style={{ maxWidth: '580px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Share2 size={19} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Share Outreach Webpage Link
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Generate a live public webpage link with Call and WhatsApp buttons for callers / volunteers
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!generatedLink ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Campaign Title */}
              <div>
                <label className="form-label">Campaign / List Title</label>
                <input
                  type="text"
                  className="input-field"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mahapura Voter Outreach List"
                  required
                />
              </div>

              {/* Scope: How Many Contacts to Include */}
              <div>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kitni list ka link banana hai? (Contacts to Include):</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>
                    {includedList.length} Contacts Selected
                  </span>
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                  
                  {/* Option 1: ALL Contacts (Default) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: scopeMode === 'all' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: scopeMode === 'all' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="all"
                      checked={scopeMode === 'all'}
                      onChange={() => setScopeMode('all')}
                      style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        All Contacts (Default - All {totalContacts} Included) ✅
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Includes all contacts currently in your directory from #1 to #{totalContacts}.
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Custom Number (Kitne Contacts Chahiye) */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: scopeMode === 'custom_count' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: scopeMode === 'custom_count' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="custom_count"
                      checked={scopeMode === 'custom_count'}
                      onChange={() => setScopeMode('custom_count')}
                      style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                    />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          Custom Quantity (Pehle N Contacts)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Example: Give first 5, 10, or 15 contacts to a specific person.
                        </div>
                      </div>

                      {scopeMode === 'custom_count' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#475569' }}>Count:</span>
                          <input
                            type="number"
                            min="1"
                            max={totalContacts}
                            value={customCount}
                            onChange={(e) => setCustomCount(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '70px',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 700,
                              textAlign: 'center',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 3: Selected Contacts only (if any checked) */}
                  {selectedIds.size > 0 && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: scopeMode === 'selected' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                        background: scopeMode === 'selected' ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="scope"
                        value="selected"
                        checked={scopeMode === 'selected'}
                        onChange={() => setScopeMode('selected')}
                        style={{ accentColor: '#0284c7', width: '16px', height: '16px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          Currently Checked Contacts Only ({selectedIds.size} Selected)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Only share the specific contacts you ticked on the directory screen.
                        </div>
                      </div>
                    </label>
                  )}

                </div>
              </div>

              {/* Message to attach */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Default WhatsApp Outreach Message:</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{'{name} is replaced automatically'}</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Type message template that will be sent when volunteer taps WhatsApp..."
                  required
                />
              </div>

              {/* Action Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isGenerating || includedList.length === 0}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                    padding: '9px 20px',
                    fontSize: '0.88rem',
                  }}
                >
                  <Link2 size={16} />
                  <span>{isGenerating ? 'Generating Link...' : `Generate Link (${includedList.length} Contacts) 🔗`}</span>
                </button>
              </div>

            </form>
          ) : (
            /* Link Generated Success View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
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
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#166534', fontWeight: 700 }}>
                    Share Link Generated Successfully!
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#15803d' }}>
                    Anyone opening this link will see a dedicated calling & WhatsApp webpage with all{' '}
                    <strong>{includedList.length} contacts</strong>.
                  </p>
                </div>
              </div>

              {/* Link Box */}
              <div>
                <label className="form-label">Public Outreach Webpage URL:</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '0.84rem',
                      color: '#0369a1',
                      fontWeight: 600,
                    }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={handleCopyLink}
                    style={{
                      padding: '10px 14px',
                      background: copied ? '#ecfdf5' : '#ffffff',
                      borderColor: copied ? '#10b981' : '#cbd5e1',
                      color: copied ? '#059669' : '#0f172a',
                    }}
                  >
                    {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons for Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleOpenLink}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.86rem',
                    justifyContent: 'center',
                    background: '#f0f9ff',
                    borderColor: '#bae6fd',
                    color: '#0369a1',
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Open Webpage</span>
                </button>

                <button
                  type="button"
                  className="btn btn-whatsapp"
                  onClick={handleShareViaWhatsApp}
                  style={{ padding: '10px 14px', fontSize: '0.86rem', justifyContent: 'center' }}
                >
                  <MessageCircle size={16} />
                  <span>Share on WhatsApp</span>
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setGeneratedLink('');
                    setGeneratedShareData(null);
                  }}
                  style={{ fontSize: '0.82rem' }}
                >
                  ← Create Another Link
                </button>

                <button type="button" className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.84rem' }}>
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
