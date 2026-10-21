import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ExternalLink,
  MessageCircle,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

export default function SendMessageModal({
  isOpen,
  onClose,
  contact,
  templates = [],
  activeTemplateId,
  waConnected = false,
  waSession = null,
  onSendDirect,
  onSendWeb,
  onNavigateToWhatsAppLink,
}) {
  if (!isOpen || !contact) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState(activeTemplateId || '');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Helper to format text with recipient name
  const formatTextForContact = (templateText, recipientName) => {
    if (!templateText) return '';
    const cleanName = recipientName || 'Valued Member';
    return templateText.replace(/{name}/gi, cleanName);
  };

  // Initialize message text when modal opens or contact changes
  useEffect(() => {
    if (!contact) return;

    // Find current template
    let tpl = templates.find((t) => t._id === selectedTemplateId);
    if (!tpl) {
      tpl = templates.find((t) => t.isDefault) || templates[0];
      if (tpl) setSelectedTemplateId(tpl._id);
    }

    if (tpl) {
      setMessageText(formatTextForContact(tpl.text, contact.name));
    } else {
      setMessageText(`Hello ${contact.name}, hope you are doing well! Reaching out to connect and stay in touch.`);
    }
  }, [contact, isOpen]);

  // When user clicks a different template chip
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl._id);
    setMessageText(formatTextForContact(tpl.text, contact.name));
  };

  // Direct send handler
  const handleDirectSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setIsSending(true);
    try {
      await onSendDirect(contact, messageText.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp Web redirect handler
  const handleWebSubmit = () => {
    if (!messageText.trim()) return;
    onSendWeb(contact, messageText.trim());
    onClose();
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
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Send WhatsApp Message
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {contact.serialNo ? <span style={{ fontWeight: 700, color: '#0284c7' }}>#{contact.serialNo} </span> : null}
                <strong>{contact.name}</strong> • <span style={{ fontFamily: 'monospace' }}>+91 {contact.phone}</span>
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDirectSubmit}>
          <div className="modal-body" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Live WhatsApp Connection Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '10px',
                background: waConnected ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${waConnected ? '#bbf7d0' : '#fde68a'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {waConnected ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <AlertTriangle size={16} color="#d97706" />
                )}
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: waConnected ? '#166534' : '#92400e' }}>
                    {waConnected ? '🟢 WhatsApp Connected & Active' : '🔴 WhatsApp Not Linked Yet'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: waConnected ? '#15803d' : '#b45309' }}>
                    {waConnected
                      ? `Linked: ${waSession?.phone || 'Your Device'} • Direct background send ready`
                      : 'Scan QR in "WhatsApp Link" tab for 1-click direct sending'}
                  </div>
                </div>
              </div>

              {!waConnected && onNavigateToWhatsAppLink && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    onClose();
                    onNavigateToWhatsAppLink();
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    background: '#ffffff',
                    borderColor: '#f59e0b',
                    color: '#b45309',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Smartphone size={12} />
                  <span>Link QR</span>
                </button>
              )}
            </div>

            {/* Template Selector Chips */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>
                  <Sparkles size={13} color="#f59e0b" style={{ display: 'inline', marginRight: '4px' }} />
                  Select Message Template:
                </label>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Click chip to fill message</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin',
                }}
              >
                {templates.map((tpl) => {
                  const isSelected = tpl._id === selectedTemplateId;
                  return (
                    <button
                      key={tpl._id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        border: `1px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                        background: isSelected ? '#ecfdf5' : '#ffffff',
                        color: isSelected ? '#065f46' : '#475569',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{tpl.icon || '💬'}</span>
                      <span>{tpl.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Box (Textarea) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>
                  Message to Send:
                </label>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {messageText.length} characters
                </span>
              </div>

              <textarea
                className="form-textarea"
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your WhatsApp message here..."
                required
                style={{
                  width: '100%',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  💡 Recipient name <strong>{contact.name}</strong> is dynamically populated.
                </span>
                {contact.notes && (
                  <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>
                    📝 Note: {contact.notes}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Modal Actions */}
          <div
            className="modal-footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSending}>
              Cancel
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* WhatsApp Web Redirect Option */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleWebSubmit}
                disabled={isSending || !messageText.trim()}
                style={{
                  background: '#f0fdf4',
                  borderColor: '#a7f3d0',
                  color: '#065f46',
                  padding: '9px 14px',
                  fontSize: '0.84rem',
                }}
                title="Open WhatsApp Web in browser tab"
              >
                <ExternalLink size={15} color="#059669" />
                <span>WA Web</span>
              </button>

              {/* Direct Background Send Option */}
              <button
                type="submit"
                className="btn btn-whatsapp"
                disabled={isSending || !messageText.trim()}
                style={{
                  padding: '9px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                }}
                title="Send directly using linked WhatsApp account"
              >
                {isSending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="#ffffff" />
                    <span>Direct Send ⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
