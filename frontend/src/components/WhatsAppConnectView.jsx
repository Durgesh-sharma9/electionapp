import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Send,
  RefreshCw,
  X,
  Search,
  MessageCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const API_BASE = 'http://localhost:8500';

export default function WhatsAppConnectView({ contacts = [], templates = [], onToast }) {
  // Session & Status
  const [session, setSession] = useState({
    loggedIn: false,
    phone: '',
    accountName: '',
    instanceId: 'INST-MAHAPURA-01',
    accessToken: '',
    status: 'Disconnected',
    connectedAt: null,
  });
  const [isActive, setIsActive] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [liveQr, setLiveQr] = useState(null);
  const [isQrLoading, setIsQrLoading] = useState(false);

  // Test Messenger Sandbox
  const [recipientMode, setRecipientMode] = useState('contact'); // 'contact' | 'manual'
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);

  const [targetPhone, setTargetPhone] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [messageBody, setMessageBody] = useState(
    'Namaste {name}, hope you are well. Reaching out from Mahapura Outreach team. Please let us know if you need any support!'
  );
  const [isSending, setIsSending] = useState(false);
  const [recentLogs, setRecentLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('mahapura_wa_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Fetch status from backend
  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await fetch(`${API_BASE}/api/whatsapp/status`);
      const data = await res.json();
      if (data.success) {
        setIsActive(Boolean(data.active && data.session?.loggedIn));
        if (data.session) {
          setSession(data.session);
        }
        if (data.qr) {
          setLiveQr(data.qr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch WhatsApp status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // Poll status on mount and interval
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Poll for QR Code when modal is open
  useEffect(() => {
    if (!qrModalOpen) return;

    let isMounted = true;
    setIsQrLoading(true);

    fetch(`${API_BASE}/api/whatsapp/start-session`, { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (d.qr && isMounted) {
          setLiveQr(d.qr);
          setIsQrLoading(false);
        }
      })
      .catch((err) => {
        console.error('QR start-session error:', err);
        if (isMounted) setIsQrLoading(false);
      });

    const qrInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/whatsapp/status`);
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.qr) {
            setLiveQr(data.qr);
            setIsQrLoading(false);
          }
          if (data.active && data.session?.loggedIn) {
            setIsActive(true);
            setSession(data.session);
            setQrModalOpen(false);
            if (onToast) {
              onToast(`WhatsApp Device Linked with ${data.session.phone}!`, 'success');
            }
            clearInterval(qrInterval);
          }
        }
      } catch {}
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(qrInterval);
    };
  }, [qrModalOpen]);

  // Sync logs to localStorage
  useEffect(() => {
    localStorage.setItem('mahapura_wa_logs', JSON.stringify(recentLogs));
  }, [recentLogs]);

  // Disconnect handler
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect this WhatsApp instance?')) {
      return;
    }
    try {
      await fetch(`${API_BASE}/api/whatsapp/logout`, { method: 'POST' });
      setIsActive(false);
      setSession({
        loggedIn: false,
        phone: '',
        accountName: '',
        instanceId: 'INST-MAHAPURA-01',
        accessToken: '',
        status: 'Disconnected',
        connectedAt: null,
      });
      setLiveQr(null);
      if (onToast) onToast('WhatsApp device disconnected successfully', 'info');
    } catch (err) {
      alert('Error disconnecting: ' + err.message);
    }
  };

  // Copy access token
  const copyToken = () => {
    if (session.accessToken) {
      navigator.clipboard.writeText(session.accessToken);
      if (onToast) onToast('Access Token copied to clipboard!', 'info');
    }
  };

  // Template select in sandbox
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl._id);
    let txt = tpl.text;
    if (selectedContact) {
      txt = txt.replace(/{name}/g, selectedContact.name);
    }
    setMessageBody(txt);
  };

  // Contact select in sandbox
  const handleSelectContact = (c) => {
    setSelectedContact(c);
    setTargetPhone(c.phone);
    setContactSearchQuery(c.name);
    setIsContactDropdownOpen(false);

    // Apply template with name
    if (selectedTemplateId) {
      const tpl = templates.find((t) => t._id === selectedTemplateId);
      if (tpl) {
        setMessageBody(tpl.text.replace(/{name}/g, c.name));
        return;
      }
    }
    setMessageBody((prev) => prev.replace(/{name}/g, c.name));
  };

  // Send Direct WhatsApp Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!targetPhone.trim()) {
      alert('Please enter or select a recipient mobile number');
      return;
    }
    if (!messageBody.trim()) {
      alert('Please enter a message to send');
      return;
    }

    if (!isActive) {
      alert('WhatsApp device is not linked. Please scan the QR code first!');
      setQrModalOpen(true);
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetPhone,
          message: messageBody,
          contactId: selectedContact?._id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const newLog = {
          id: data.messageId || 'msg_' + Date.now(),
          recipient: data.recipient || targetPhone,
          name: selectedContact?.name || 'Direct Number',
          message: messageBody,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Delivered',
        };
        setRecentLogs((prev) => [newLog, ...prev.slice(0, 9)]);
        if (onToast) {
          onToast(`Message delivered live to ${newLog.recipient}!`, 'success');
        }
      } else {
        alert(data.error || 'Failed to dispatch WhatsApp message');
      }
    } catch (err) {
      alert('Error connecting to backend: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="wa-connect-page">
      {/* Page Header */}
      <div className="wa-page-header glass-panel">
        <div className="wa-header-left">
          <div className="wa-header-icon">
            <Smartphone size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="wa-page-title">WhatsApp Device Connection</h2>
              <span className={`wa-status-pill ${isActive ? 'wa-status-active' : 'wa-status-standby'}`}>
                <span className="wa-pulse-dot" />
                {isActive ? 'Connected & Live' : 'Not Connected'}
              </span>
            </div>
            <p className="wa-page-subtitle">
              Link your mobile phone via QR code for automated live WhatsApp message delivery without third-party API fees.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loadingStatus}
          className="btn btn-secondary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          title="Refresh Status"
        >
          <RefreshCw size={15} className={loadingStatus ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Instance Card */}
      <div className="wa-card glass-panel">
        <div className="wa-card-header">
          <span className="wa-card-title">Connected WhatsApp Instance</span>
          {isActive && (
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
              ● Baileys Socket Engine Active
            </span>
          )}
        </div>

        {isActive ? (
          <div className="wa-instance-details">
            <div className="wa-instance-grid">
              {/* Linked Phone */}
              <div className="wa-detail-col">
                <span className="wa-detail-label">Linked Phone Number</span>
                <div className="wa-phone-badge">
                  <CheckCircle2 size={16} color="#10b981" />
                  <span className="wa-phone-number">{session.phone || '+91 Connected Phone'}</span>
                </div>
                <span className="wa-detail-sub">{session.accountName || 'Official Campaign Device'}</span>
              </div>

              {/* Instance ID */}
              <div className="wa-detail-col">
                <span className="wa-detail-label">Instance Identifier</span>
                <span className="wa-code-badge">{session.instanceId || 'INST-MAHAPURA-01'}</span>
                <span className="wa-detail-sub">Port 8500 Local Engine</span>
              </div>

              {/* Access Token */}
              <div className="wa-detail-col">
                <span className="wa-detail-label">Security Access Token</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="wa-code-badge">
                    {session.accessToken ? `${session.accessToken.slice(0, 12)}••••••` : 'wa_sec_live••••'}
                  </span>
                  <button onClick={copyToken} className="wa-icon-btn" title="Copy Token">
                    <Copy size={14} />
                  </button>
                </div>
                <span className="wa-detail-sub">Encrypted internal session</span>
              </div>

              {/* Status & Disconnect Action */}
              <div className="wa-detail-col" style={{ alignItems: 'flex-start' }}>
                <span className="wa-detail-label">Connection Action</span>
                <button onClick={handleDisconnect} className="wa-disconnect-btn">
                  <Trash2 size={14} />
                  <span>Disconnect Device</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wa-empty-state">
            <div className="wa-empty-icon-wrap">
              <Smartphone size={32} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              No WhatsApp Device Linked
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '480px', margin: '0 0 18px 0', lineHeight: 1.5 }}>
              Scan the QR code with WhatsApp on your Android or iPhone to link your official phone for instant 1-click campaign outreach.
            </p>
            <button onClick={() => setQrModalOpen(true)} className="btn btn-whatsapp wa-scan-btn">
              <QrCode size={18} />
              <span>Scan QR Code to Connect</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Direct Outreach Test Messenger Sandbox */}
      <div className="wa-card glass-panel" style={{ marginTop: '20px' }}>
        <div className="wa-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={16} color="#059669" />
            <span className="wa-card-title">Live Outreach Test Messenger</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Verify direct real-time delivery from linked phone
          </span>
        </div>

        <form onSubmit={handleSendMessage} className="wa-sandbox-body">
          {/* Quick Template Picker */}
          {templates.length > 0 && (
            <div className="wa-form-row">
              <label className="wa-field-label">1. Choose Message Template:</label>
              <div className="wa-template-chips">
                {templates.map((tpl) => (
                  <button
                    key={tpl._id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`wa-template-chip ${selectedTemplateId === tpl._id ? 'active' : ''}`}
                  >
                    <span>{tpl.icon || '💬'}</span>
                    <span className="wa-chip-title">{tpl.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Recipient Mode */}
          <div className="wa-form-row">
            <label className="wa-field-label">2. Select Recipient:</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setRecipientMode('contact');
                  setContactSearchQuery('');
                  setSelectedContact(null);
                  setTargetPhone('');
                }}
                className={`wa-tab-pill ${recipientMode === 'contact' ? 'active' : ''}`}
              >
                Pick from Contacts List ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecipientMode('manual');
                  setSelectedContact(null);
                }}
                className={`wa-tab-pill ${recipientMode === 'manual' ? 'active' : ''}`}
              >
                Direct Mobile Number
              </button>
            </div>

            {recipientMode === 'contact' && (
              <div style={{ position: 'relative', width: '100%', maxWidth: '520px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onFocus={() => setIsContactDropdownOpen(true)}
                    onChange={(e) => {
                      setContactSearchQuery(e.target.value);
                      setIsContactDropdownOpen(true);
                    }}
                    placeholder="Search voter by name or phone..."
                    className="input-field"
                    style={{ paddingLeft: '36px', width: '100%' }}
                  />
                  {selectedContact && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(null);
                        setContactSearchQuery('');
                        setTargetPhone('');
                      }}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Selected Contact Chip */}
                {selectedContact && (
                  <div className="wa-selected-chip">
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{selectedContact.name}</span>
                    <span style={{ color: '#059669', fontFamily: 'monospace', fontWeight: 600 }}>
                      +91 {selectedContact.phone}
                    </span>
                    <span className="badge badge-emerald">{selectedContact.category || 'General'}</span>
                  </div>
                )}

                {/* Dropdown Results */}
                {isContactDropdownOpen && (
                  <div className="wa-contact-dropdown">
                    {contacts
                      .filter((c) => {
                        if (!contactSearchQuery.trim()) return true;
                        const q = contactSearchQuery.toLowerCase();
                        return (
                          (c.name || '').toLowerCase().includes(q) ||
                          (c.phone || '').includes(q)
                        );
                      })
                      .slice(0, 8)
                      .map((c) => (
                        <div
                          key={c._id}
                          onClick={() => handleSelectContact(c)}
                          className="wa-dropdown-item"
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '8px' }}>
                              {c.category}
                            </span>
                          </div>
                          <span style={{ fontFamily: 'monospace', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                            {c.phone}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {recipientMode === 'manual' && (
              <div style={{ maxWidth: '320px' }}>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="input-field"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="wa-form-row">
            <label className="wa-field-label">3. Message Text (Live WhatsApp):</label>
            <textarea
              rows={4}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="input-field"
              style={{ width: '100%', lineHeight: 1.5, resize: 'vertical' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={isSending}
              className="btn btn-whatsapp"
              style={{ padding: '10px 22px', fontSize: '0.92rem' }}
            >
              <Send size={16} className={isSending ? 'animate-spin' : ''} />
              <span>{isSending ? 'Dispatching...' : '🚀 Send Live WhatsApp Message'}</span>
            </button>
          </div>
        </form>

        {/* Recent Dispatched Activity */}
        {recentLogs.length > 0 && (
          <div className="wa-logs-section">
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent Dispatches
            </h4>
            <div className="wa-logs-list">
              {recentLogs.map((log) => (
                <div key={log.id} className="wa-log-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} color="#10b981" />
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      {log.name} ({log.recipient})
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.timestamp}</span>
                    <span className="badge badge-emerald">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Scanner Modal */}
      {qrModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card wa-qr-modal animate-fade-in">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} color="#059669" />
                </div>
                <div>
                  <h3 className="modal-title">Link WhatsApp to Outreach Portal</h3>
                  <p className="modal-subtitle">Point your phone camera to scan the QR code</p>
                </div>
              </div>
              <button onClick={() => setQrModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="wa-qr-modal-body">
              {/* QR Image Frame */}
              <div className="wa-qr-box">
                {isQrLoading || !liveQr ? (
                  <div className="wa-qr-loading">
                    <RefreshCw size={32} className="animate-spin" color="#059669" />
                    <span style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '12px', fontWeight: 600 }}>
                      Generating Encrypted QR Code...
                    </span>
                  </div>
                ) : (
                  <img
                    src={liveQr}
                    alt="Scan WhatsApp QR"
                    style={{ width: '240px', height: '240px', display: 'block', borderRadius: '10px' }}
                  />
                )}
              </div>

              {/* Step by Step Instructions */}
              <div className="wa-qr-instructions">
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                  How to link your phone:
                </h4>
                <ol style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.85rem', lineHeight: 1.8 }}>
                  <li>Open <strong>WhatsApp</strong> on your phone</li>
                  <li>Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings</strong> on iPhone</li>
                  <li>Tap <strong>Linked Devices</strong> &rarr; <strong>Link a Device</strong></li>
                  <li>Point your phone camera at this QR code screen</li>
                </ol>

                <div style={{ marginTop: '16px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Safe, end-to-end encrypted local session on Port 8500.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
