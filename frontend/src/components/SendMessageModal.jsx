import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  MessageCircle,
  Zap,
  Sparkles,
  Send,
  RefreshCw,
  Edit3,
  CheckCircle2,
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
}) {
  if (!isOpen || !contact) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState(activeTemplateId || '');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeMode, setActiveMode] = useState('direct'); // 'direct' | 'template'

  // Helper to format text with recipient name
  const formatTextForContact = (templateText, recipientName) => {
    if (!templateText) return '';
    const cleanName = recipientName || 'Valued Member';
    return templateText.replace(/{name}/gi, cleanName);
  };

  // Initialize message text when modal opens or contact changes
  useEffect(() => {
    if (!contact) return;

    let tpl = templates.find((t) => t._id === selectedTemplateId);
    if (!tpl) {
      tpl = templates.find((t) => t.isDefault) || templates[0];
      if (tpl) setSelectedTemplateId(tpl._id);
    }

    if (tpl) {
      setMessageText(formatTextForContact(tpl.text, contact.name));
    } else {
      setMessageText(`Hello ${contact.name}, hope you are doing well! Reaching out to connect with you.`);
    }
  }, [contact, isOpen]);

  // When user clicks a different template chip
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl._id);
    setMessageText(formatTextForContact(tpl.text, contact.name));
  };

  // Direct WhatsApp Web / App redirect
  const handleDirectRedirect = (textToSend) => {
    const finalMsg = textToSend || messageText;
    if (!finalMsg.trim()) return;
    onSendWeb(contact, finalMsg.trim());
    onClose();
  };

  // Background direct send (if Baileys WA linked)
  const handleDirectEngineSend = async () => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-scale-in"
        style={{ maxWidth: '560px', width: '92%' }}
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
                WhatsApp Message
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

        {/* Two Clear Mode Tabs: 1. Redirect to WhatsApp | 2. Template / Custom */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '10px',
            padding: '3px',
            marginTop: '14px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode('direct')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: activeMode === 'direct' ? '#ffffff' : 'transparent',
              color: activeMode === 'direct' ? '#065f46' : '#64748b',
              fontWeight: activeMode === 'direct' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeMode === 'direct' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={15} color={activeMode === 'direct' ? '#10b981' : '#94a3b8'} />
            <span>1. Redirect to WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('template')}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              background: activeMode === 'template' ? '#ffffff' : 'transparent',
              color: activeMode === 'template' ? '#0f172a' : '#64748b',
              fontWeight: activeMode === 'template' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeMode === 'template' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} color={activeMode === 'template' ? '#f59e0b' : '#94a3b8'} />
            <span>2. Choose Template & Edit</span>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* OPTION 1: DIRECT REDIRECT MODE */}
          {activeMode === 'direct' ? (
            <div
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #a7f3d0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: '#065f46' }}>
                    Direct WhatsApp Redirect
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#047857' }}>
                    Click below to open chat with <strong>+91 {contact.phone}</strong>.
                  </p>
                </div>
              </div>

              {/* Message preview that will be sent */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '0.84rem',
                  color: '#334155',
                  lineHeight: '1.45',
                  maxHeight: '90px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                  Message Preview:
                </div>
                {messageText}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Primary: Direct WhatsApp Redirect */}
                <button
                  type="button"
                  onClick={() => handleDirectRedirect(messageText)}
                  className="btn btn-whatsapp"
                  style={{
                    flex: '1 1 180px',
                    padding: '11px 18px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Direct Redirect to WhatsApp ➔</span>
                </button>

                {/* If Baileys engine is connected, option for direct background send */}
                {waConnected && (
                  <button
                    type="button"
                    onClick={handleDirectEngineSend}
                    disabled={isSending}
                    className="btn btn-secondary"
                    style={{
                      padding: '11px 14px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      background: '#ffffff',
                      borderColor: '#10b981',
                      color: '#065f46',
                    }}
                    title="Send in background via linked WhatsApp"
                  >
                    {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    <span>1-Click Send ⚡</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* OPTION 2: TEMPLATE CHOOSE & BOX FILL MODE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Template Chips */}
              <div>
                <label className="form-label" style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Sparkles size={13} color="#f59e0b" style={{ display: 'inline', marginRight: '4px' }} />
                  Choose Template:
                </label>
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
                          border: `1.5px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
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

              {/* Message Box Fill / Edit */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600 }}>
                    <Edit3 size={13} color="#2563eb" style={{ display: 'inline', marginRight: '4px' }} />
                    Message Box:
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {messageText.length} characters
                  </span>
                </div>

                <textarea
                  className="form-textarea"
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type or edit your WhatsApp message here..."
                  required
                  style={{
                    width: '100%',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    💡 Name <strong>{contact.name}</strong> is inserted automatically.
                  </span>
                  {contact.notes && (
                    <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600 }}>
                      📝 Note: {contact.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button for Template Mode */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleDirectRedirect(messageText)}
                  className="btn btn-whatsapp"
                  disabled={!messageText.trim()}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Send via WhatsApp ➔</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </button>

          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
            {activeMode === 'direct' ? '⚡ 1-Click Fast Mode' : '📝 Template Edit Mode'}
          </span>
        </div>

      </div>
    </div>
  );
}
