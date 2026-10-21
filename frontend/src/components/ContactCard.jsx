import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  Trash2,
  Edit2,
  CheckCircle2,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function ContactCard({
  contact,
  onDirectWhatsAppSend,
  onWhatsAppRedirect,
  onOpenTemplateModal,
  onCallRedirect,
  onDelete,
  onEdit,
  isSelected,
  onSelectToggle,
  onToggleSureVoter,
  isSendingDirect = false,
  waConnected = false,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAvatarBg = (name) => {
    const colors = [
      'linear-gradient(135deg, #ea580c, #f97316)',
      'linear-gradient(135deg, #0284c7, #2563eb)',
      'linear-gradient(135deg, #059669, #10b981)',
      'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      'linear-gradient(135deg, #db2777, #ec4899)',
      'linear-gradient(135deg, #d97706, #f59e0b)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initial = (contact.name || 'V').charAt(0).toUpperCase();

  return (
    <div
      className="mobile-app-contact-card"
      style={{
        padding: '12px 14px',
        borderRadius: '14px',
        background: isSelected
          ? '#fff7ed'
          : contact.isSureVoter
          ? '#fffdf5'
          : '#ffffff',
        border: isSelected
          ? '2px solid #ea580c'
          : contact.isSureVoter
          ? '1.5px solid #fde68a'
          : '1px solid #e2e8f0',
        boxShadow: isSelected
          ? '0 2px 8px rgba(234, 88, 12, 0.15)'
          : contact.isSureVoter
          ? '0 2px 8px rgba(245, 158, 11, 0.12)'
          : '0 1px 4px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Row 1: Checkbox + Avatar + Name + Serial + Edit/Delete */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectToggle(contact._id, e.target.checked)}
            style={{
              cursor: 'pointer',
              accentColor: '#ea580c',
              width: '17px',
              height: '17px',
              flexShrink: 0,
            }}
          />

          {/* Compact Modern Avatar */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: getAvatarBg(contact.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            }}
          >
            {initial}
          </div>

          {/* Name & Serial No */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {contact.serialNo && (
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '5px',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}
                >
                  #{contact.serialNo}
                </span>
              )}
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}
                title={contact.name}
              >
                {contact.name}
              </h4>
            </div>

            {/* Phone Number with Click to Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '0.84rem',
                  color: '#0369a1',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                +91 {contact.phone}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '1px',
                  color: copied ? '#059669' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Copy number"
              >
                {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>

        {/* Edit & Delete Mini Buttons */}
        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onEdit(contact)}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
            title="Edit Contact"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(contact._id)}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              border: '1px solid #fee2e2',
              background: '#fff5f5',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
            title="Delete Contact"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Row 2: Badges (Ward, Locality, Sure Toggle, Reference, Status) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
        {/* Ward Badge */}
        {contact.ward && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            🏛️ {contact.ward}
          </span>
        )}

        {/* Locality Badge */}
        {contact.locality && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            📍 {contact.locality}
          </span>
        )}

        {/* ⭐ Sure Voter Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleSureVoter && onToggleSureVoter(contact._id, contact.isSureVoter)}
          style={{
            padding: '2px 8px',
            fontSize: '0.72rem',
            fontWeight: 800,
            borderRadius: '6px',
            border: contact.isSureVoter ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
            background: contact.isSureVoter ? '#fef3c7' : '#ffffff',
            color: contact.isSureVoter ? '#b45309' : '#64748b',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.15s ease',
            boxShadow: contact.isSureVoter ? '0 1px 3px rgba(245, 158, 11, 0.25)' : 'none',
          }}
          title={contact.isSureVoter ? 'Confirmed Sure Voter (Click to toggle)' : 'Click to mark as Confirmed Sure Voter'}
        >
          <span>{contact.isSureVoter ? '⭐ Sure Voter' : '☆ Make Sure'}</span>
        </button>

        {/* Reference Person if any */}
        {contact.reference && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              background: '#ede9fe',
              color: '#5b21b6',
              border: '1px solid #ddd6fe',
              borderRadius: '6px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            👤 {contact.reference}
          </span>
        )}

        {/* Contacted / Pending Status */}
        {contact.contacted ? (
          <span
            className="badge badge-contacted"
            style={{
              fontSize: '0.68rem',
              padding: '2px 6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <CheckCircle2 size={10} />
            <span>Messaged {contact.contactCount > 1 ? `(${contact.contactCount}x)` : ''}</span>
          </span>
        ) : (
          <span
            className="badge badge-pending"
            style={{ fontSize: '0.68rem', padding: '2px 6px' }}
          >
            ⏳ Pending
          </span>
        )}

        {/* Notes if any */}
        {contact.notes && (
          <span
            style={{
              fontSize: '0.68rem',
              color: '#b45309',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '4px',
              padding: '1px 6px',
              fontWeight: 600,
            }}
          >
            ⚠️ {contact.notes}
          </span>
        )}
      </div>

      {/* Row 3: Native App Action Buttons Toolbar (34px height) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.25fr 1.15fr 0.85fr',
          gap: '6px',
          paddingTop: '6px',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        {/* 1. Direct WhatsApp */}
        <button
          type="button"
          className="btn btn-whatsapp"
          onClick={() => onWhatsAppRedirect(contact)}
          style={{
            padding: '6px 8px',
            height: '34px',
            fontSize: '0.78rem',
            fontWeight: 700,
            gap: '4px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.22)',
          }}
          title="Direct WhatsApp Chat"
        >
          <Zap size={12} fill="#ffffff" />
          <span>Direct WA</span>
        </button>

        {/* 2. Choose Template */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => (onOpenTemplateModal ? onOpenTemplateModal(contact) : onWhatsAppRedirect(contact))}
          style={{
            padding: '6px 8px',
            height: '34px',
            fontSize: '0.78rem',
            background: '#ffffff',
            borderColor: '#f59e0b',
            color: '#b45309',
            fontWeight: 700,
            gap: '4px',
            borderRadius: '8px',
          }}
          title="Choose Template / Edit Message"
        >
          <Sparkles size={12} color="#f59e0b" />
          <span>Template</span>
        </button>

        {/* 3. Direct Phone Call */}
        <button
          type="button"
          className="btn btn-call"
          onClick={() => onCallRedirect(contact)}
          style={{
            padding: '6px 8px',
            height: '34px',
            fontSize: '0.78rem',
            gap: '3px',
            borderRadius: '8px',
          }}
          title="Direct Phone Call"
        >
          <Phone size={12} />
          <span>Call</span>
        </button>
      </div>
    </div>
  );
}
