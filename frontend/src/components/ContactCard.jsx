import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Trash2, Edit2, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactCard({
  contact,
  onWhatsAppRedirect,
  onCallRedirect,
  onDelete,
  onEdit,
  onToggleContacted,
  isSelected,
  onSelectToggle,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryClass = (cat) => {
    if (cat?.includes('समर्थक')) return 'badge-supporter';
    if (cat?.includes('तटस्थ')) return 'badge-undecided';
    if (cat?.includes('प्रमुख')) return 'badge-key';
    if (cat?.includes('कार्यकर्ता')) return 'badge-volunteer';
    return 'badge-pending';
  };

  // Generate avatar gradient based on name
  const getAvatarBg = (name) => {
    const colors = [
      'linear-gradient(135deg, #f97316, #ea580c)',
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #ec4899, #be185d)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initial = (contact.name || 'म').charAt(0).toUpperCase();

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        border: isSelected
          ? '1px solid rgba(249, 115, 22, 0.7)'
          : contact.contacted
          ? '1px solid rgba(16, 185, 129, 0.25)'
          : '1px solid var(--border-subtle)',
        background: isSelected
          ? 'rgba(249, 115, 22, 0.08)'
          : contact.contacted
          ? 'rgba(16, 185, 129, 0.04)'
          : 'var(--bg-card)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
      }}
    >
      {/* Top row: Checkbox, Avatar, Name & Badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectToggle(contact._id, e.target.checked)}
          style={{ marginTop: '6px', cursor: 'pointer', accentColor: '#f97316' }}
        />

        {/* Avatar */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: getAvatarBg(contact.name),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#ffffff',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          {initial}
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <h4
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={contact.name}
            >
              {contact.name}
            </h4>

            {/* Delete & Edit Buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => onEdit(contact)}
                style={{ width: '28px', height: '28px', padding: 0 }}
                title="एडिट करें"
              >
                <Edit2 size={13} />
              </button>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => onDelete(contact._id)}
                style={{ width: '28px', height: '28px', padding: 0, color: '#f87171' }}
                title="डिलीट करें"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Phone row with quick copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '0.92rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.02em' }}>
              +91 {contact.phone}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#34d399' : 'var(--text-dim)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="नंबर कॉपी करें"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            <span className={`badge ${getCategoryClass(contact.category)}`}>
              {contact.category || 'समर्थक'}
            </span>

            {contact.ward && (
              <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} />
                <span>{contact.ward}</span>
              </span>
            )}

            {contact.contacted ? (
              <span className="badge badge-contacted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} />
                <span>संपर्क पूर्ण {contact.contactCount > 1 ? `(${contact.contactCount} बार)` : ''}</span>
              </span>
            ) : (
              <span className="badge badge-pending">
                बाकी (Pending)
              </span>
            )}
          </div>

          {/* Notes if any */}
          {contact.notes && (
            <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              📝 {contact.notes}
            </p>
          )}
        </div>

      </div>

      {/* Action Redirect Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        
        {/* WhatsApp Button (Primary Requirement!) */}
        <button
          className="btn btn-whatsapp"
          onClick={() => onWhatsAppRedirect(contact)}
          style={{ padding: '10px 12px', minHeight: '42px', fontSize: '0.88rem' }}
          title="WhatsApp पर सन्देश भेजें (1-Click Redirect)"
        >
          <MessageCircle size={17} />
          <span>WhatsApp भेजें</span>
        </button>

        {/* Call Button */}
        <button
          className="btn btn-call"
          onClick={() => onCallRedirect(contact)}
          style={{ padding: '10px 12px', minHeight: '42px', fontSize: '0.88rem' }}
          title="सीधा कॉल करें (Direct Call)"
        >
          <Phone size={16} />
          <span>कॉल करें</span>
        </button>

      </div>

    </div>
  );
}
