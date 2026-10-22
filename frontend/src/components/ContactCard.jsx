import React, { useState, useEffect } from 'react';
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
  Users,
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
  onStatusChange,
  isSendingDirect = false,
  waConnected = false,
}) {
  const [copied, setCopied] = useState(false);
  const [copiedSec, setCopiedSec] = useState(false);
  const [openCardMenu, setOpenCardMenu] = useState(null); // 'wa' | 'call' | null

  useEffect(() => {
    if (!openCardMenu) return;
    const handleCardOutsideClick = (e) => {
      if (!e.target.closest('.card-dropdown-popover') && !e.target.closest('.btn-card-action-trigger')) {
        setOpenCardMenu(null);
      }
    };
    window.addEventListener('click', handleCardOutsideClick);
    return () => window.removeEventListener('click', handleCardOutsideClick);
  }, [openCardMenu]);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopySec = (e) => {
    e.stopPropagation();
    if (!contact.secondaryPhone) return;
    navigator.clipboard.writeText(contact.secondaryPhone);
    setCopiedSec(true);
    setTimeout(() => setCopiedSec(false), 2000);
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', width: '100%', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
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
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: getAvatarBg(contact.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.10)',
            }}
          >
            {initial}
          </div>

          {/* Name & Serial No */}
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, width: '100%' }}>
              {(Boolean(contact.displaySerial) || Boolean(contact.serialNo && contact.serialNo > 0)) && (
                <span
                  style={{
                    background: '#e0f2fe',
                    color: '#0284c7',
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                  }}
                >
                  #{contact.displaySerial || contact.serialNo}
                </span>
              )}
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                  minWidth: 0,
                  flex: 1,
                }}
                title={contact.name}
              >
                {contact.name}
              </h4>
            </div>

            {/* Phone Numbers with Click to Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                  title="Copy Main Number"
                >
                  {copied ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                </button>
              </div>

              {contact.secondaryPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      color: '#6366f1',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    +91 {contact.secondaryPhone}
                  </span>
                  <span style={{ fontSize: '0.62rem', background: '#e0e7ff', color: '#4338ca', padding: '0 4px', borderRadius: '4px', fontWeight: 700 }}>2nd</span>
                  <button
                    type="button"
                    onClick={handleCopySec}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '1px',
                      color: copiedSec ? '#059669' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Copy 2nd Number"
                  >
                    {copiedSec ? <Check size={11} color="#059669" /> : <Copy size={11} />}
                  </button>
                </div>
              )}
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

        {/* House / Flat No Badge */}
        {contact.houseNo && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="House / Flat No."
          >
            🏠 {contact.houseNo}
          </span>
        )}

        {/* Sub-Locality / Apartment Badge */}
        {contact.subLocality && (
          <span
            style={{
              fontSize: '0.72rem',
              padding: '2px 7px',
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
            title="Apartment / Sub-Locality / Road"
          >
            🏢 {contact.subLocality}
          </span>
        )}

        {/* Family Votes Badge */}
        <span
          style={{
            fontSize: '0.72rem',
            padding: '2px 7px',
            background: (contact.voterCount || 1) > 1 ? '#e0f2fe' : '#f8fafc',
            color: (contact.voterCount || 1) > 1 ? '#0369a1' : '#475569',
            border: `1px solid ${(contact.voterCount || 1) > 1 ? '#bae6fd' : '#e2e8f0'}`,
            borderRadius: '6px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
          title={`${contact.voterCount || 1} voters in this family`}
        >
          👥 {contact.voterCount || 1} {(contact.voterCount || 1) > 1 ? 'Votes' : 'Vote'}
        </span>

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
          title={contact.isSureVoter ? `Confirmed: ${contact.voterCount || 1} Sure Votes (Click to toggle)` : `Mark as Sure (+${contact.voterCount || 1} Votes)`}
        >
          <span>{contact.isSureVoter ? `⭐ ${contact.voterCount || 1} Sure` : `☆ Mark Sure (${contact.voterCount || 1})`}</span>
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

        {/* Status Dropdown */}
        <select
          value={contact.status || (contact.contacted ? 'Contacted' : 'Pending')}
          onChange={(e) => {
            e.stopPropagation();
            if (onStatusChange) {
              onStatusChange(contact._id, e.target.value);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            outline: 'none',
            border: '1px solid',
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
          title="Change outreach status"
        >
          <option value="Pending">⏳ Pending</option>
          <option value="Contacted">✅ Contacted</option>
          <option value="Symbol Sent">🗳️ Symbol Sent</option>
        </select>

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

      {/* Row 3: Native App Action Buttons Toolbar (Equal 3-column layout) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '5px',
          paddingTop: '6px',
          borderTop: '1px solid #f1f5f9',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* 1. Direct WhatsApp */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-whatsapp btn-card-action-trigger"
            onClick={(e) => {
              e.stopPropagation();
              if (contact.secondaryPhone) {
                setOpenCardMenu((prev) => (prev === 'wa' ? null : 'wa'));
              } else {
                onWhatsAppRedirect(contact, contact.phone);
              }
            }}
            style={{
              width: '100%',
              padding: '6px 4px',
              height: '35px',
              fontSize: '0.76rem',
              fontWeight: 700,
              gap: '4px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.22)',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
            title={contact.secondaryPhone ? 'Choose WhatsApp Number' : 'Direct WhatsApp Chat'}
          >
            <Zap size={12} fill="#ffffff" />
            <span>WhatsApp</span>
            {contact.secondaryPhone && (
              <span style={{ fontSize: '0.58rem', background: 'rgba(255,255,255,0.28)', padding: '0 3px', borderRadius: '3px', fontWeight: 800 }}>
                2
              </span>
            )}
          </button>

          {/* WhatsApp Popup */}
          {openCardMenu === 'wa' && (
            <div
              className="card-dropdown-popover"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '6px',
                zIndex: 10000,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                minWidth: '190px',
                maxWidth: 'calc(100vw - 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '2px 6px', borderBottom: '1px solid #f1f5f9' }}>
                Send WhatsApp to:
              </div>
              <button
                type="button"
                onClick={() => {
                  onWhatsAppRedirect(contact, contact.phone);
                  setOpenCardMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '7px',
                  border: '1px solid #a7f3d0',
                  background: '#ecfdf5',
                  color: '#047857',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📱 Main: +91 {contact.phone}</span>
                <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onWhatsAppRedirect(contact, contact.secondaryPhone);
                  setOpenCardMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '7px',
                  border: '1px solid #c7d2fe',
                  background: '#eef2ff',
                  color: '#4338ca',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📱 2nd: +91 {contact.secondaryPhone}</span>
                <span style={{ fontSize: '0.62rem', background: '#e0e7ff', color: '#3730a3', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>2</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Choose Template */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => (onOpenTemplateModal ? onOpenTemplateModal(contact) : onWhatsAppRedirect(contact))}
          style={{
            padding: '6px 4px',
            height: '35px',
            fontSize: '0.74rem',
            background: '#ffffff',
            borderColor: '#f59e0b',
            color: '#b45309',
            fontWeight: 700,
            gap: '3px',
            borderRadius: '8px',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
          title="Choose Template / Edit Message"
        >
          <Sparkles size={11} color="#f59e0b" />
          <span>Template</span>
        </button>

        {/* 3. Direct Phone Call */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-call btn-card-action-trigger"
            onClick={(e) => {
              e.stopPropagation();
              if (contact.secondaryPhone) {
                setOpenCardMenu((prev) => (prev === 'call' ? null : 'call'));
              } else {
                onCallRedirect(contact, contact.phone);
              }
            }}
            style={{
              width: '100%',
              padding: '6px 4px',
              height: '35px',
              fontSize: '0.74rem',
              fontWeight: 700,
              gap: '3px',
              borderRadius: '8px',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
            }}
            title={contact.secondaryPhone ? 'Choose Number to Call' : `Call: +91 ${contact.phone}`}
          >
            <Phone size={12} />
            <span>Call</span>
            {contact.secondaryPhone && (
              <span style={{ fontSize: '0.58rem', background: 'rgba(255,255,255,0.25)', padding: '0 3px', borderRadius: '3px', fontWeight: 800 }}>
                2
              </span>
            )}
          </button>

          {/* Call Popup */}
          {openCardMenu === 'call' && (
            <div
              className="card-dropdown-popover"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '6px',
                zIndex: 1000,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                minWidth: '190px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', padding: '2px 6px', borderBottom: '1px solid #f1f5f9' }}>
                Call Phone:
              </div>
              <button
                type="button"
                onClick={() => {
                  onCallRedirect(contact, contact.phone);
                  setOpenCardMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '7px',
                  border: '1px solid #bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📞 Main: +91 {contact.phone}</span>
                <span style={{ fontSize: '0.62rem', background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>1</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCallRedirect(contact, contact.secondaryPhone);
                  setOpenCardMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 9px',
                  borderRadius: '7px',
                  border: '1px solid #c7d2fe',
                  background: '#eef2ff',
                  color: '#4338ca',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📞 2nd: +91 {contact.secondaryPhone}</span>
                <span style={{ fontSize: '0.62rem', background: '#e0e7ff', color: '#3730a3', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>2</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
