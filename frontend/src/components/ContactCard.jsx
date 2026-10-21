import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Trash2, Edit2, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactCard({
  contact,
  onWhatsAppRedirect,
  onCallRedirect,
  onDelete,
  onEdit,
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
    const c = (cat || '').toLowerCase();
    if (c.includes('vip') || c.includes('key')) return 'badge-key';
    if (c.includes('lead')) return 'badge-undecided';
    if (c.includes('supporter') || c.includes('member')) return 'badge-supporter';
    if (c.includes('volunteer') || c.includes('staff')) return 'badge-volunteer';
    return 'badge-pending';
  };

  const getAvatarBg = (name) => {
    const colors = [
      'linear-gradient(135deg, #ea580c, #f97316)',
      'linear-gradient(135deg, #2563eb, #3b82f6)',
      'linear-gradient(135deg, #059669, #10b981)',
      'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      'linear-gradient(135deg, #db2777, #ec4899)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initial = (contact.name || 'C').charAt(0).toUpperCase();

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
          ? '2px solid #ea580c'
          : contact.contacted
          ? '1px solid #bbf7d0'
          : '1px solid var(--border-subtle)',
        background: isSelected
          ? '#fff7ed'
          : contact.contacted
          ? '#fafffc'
          : '#ffffff',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectToggle(contact._id, e.target.checked)}
          style={{ marginTop: '6px', cursor: 'pointer', accentColor: '#ea580c', width: '16px', height: '16px' }}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
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
                fontWeight: 700,
                color: '#0f172a',
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
                title="Edit Contact"
              >
                <Edit2 size={13} />
              </button>
              <button
                className="btn btn-secondary btn-icon"
                onClick={() => onDelete(contact._id)}
                style={{ width: '28px', height: '28px', padding: 0, color: '#ef4444' }}
                title="Delete Contact"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Phone row with quick copy */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '0.94rem', color: '#0369a1', fontWeight: 600 }}>
              +91 {contact.phone}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#059669' : '#94a3b8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Copy Phone Number"
            >
              {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            <span className={`badge ${getCategoryClass(contact.category)}`}>
              {contact.category || 'General'}
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
                <span>Messaged {contact.contactCount > 1 ? `(${contact.contactCount}x)` : ''}</span>
              </span>
            ) : (
              <span className="badge badge-pending">
                Pending
              </span>
            )}
          </div>

          {/* Notes if any */}
          {contact.notes && (
            <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
              📝 {contact.notes}
            </p>
          )}
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
        
        {/* WhatsApp Button */}
        <button
          className="btn btn-whatsapp"
          onClick={() => onWhatsAppRedirect(contact)}
          style={{ padding: '10px 12px', minHeight: '42px', fontSize: '0.88rem' }}
          title="Send WhatsApp Message (1-Click Redirect)"
        >
          <MessageCircle size={17} />
          <span>Send WhatsApp</span>
        </button>

        {/* Call Button */}
        <button
          className="btn btn-call"
          onClick={() => onCallRedirect(contact)}
          style={{ padding: '10px 12px', minHeight: '42px', fontSize: '0.88rem' }}
          title="Direct Phone Call"
        >
          <Phone size={16} />
          <span>Call</span>
        </button>

      </div>

    </div>
  );
}
