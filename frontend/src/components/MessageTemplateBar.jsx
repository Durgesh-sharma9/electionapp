import React, { useState } from 'react';
import { MessageSquareText, Edit3, Check } from 'lucide-react';

export const DEFAULT_TEMPLATES = [
  {
    id: 'greeting',
    title: '👋 Greeting & Connect',
    text: 'Hello {name}, hope you are doing well! Reaching out to connect with you regarding our latest update. Please let us know if you have any questions. Thank you!',
  },
  {
    id: 'update',
    title: '📢 Important Update',
    text: 'Hi {name}, we have an important announcement to share with you. Please review and feel free to reach out anytime. Best regards!',
  },
  {
    id: 'meeting',
    title: '🤝 Meeting Invitation',
    text: 'Dear {name}, you are cordially invited to our upcoming meeting and discussion. Looking forward to your valuable presence!',
  },
  {
    id: 'followup',
    title: '⏰ Quick Follow-up',
    text: 'Hello {name}, following up on our previous conversation. Please let us know a convenient time to connect. Thank you!',
  },
];

export default function MessageTemplateBar({ activeTemplate, onSelectTemplate, customText, onUpdateCustomText }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(customText);

  const handleSaveCustom = () => {
    onUpdateCustomText(tempText);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareText size={18} color="#059669" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            WhatsApp Message Template
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            ({" {name} "} is dynamically replaced with the recipient's name)
          </span>
        </div>

        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={() => {
            if (isEditing) {
              handleSaveCustom();
            } else {
              setTempText(customText);
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <>
              <Check size={14} color="#059669" />
              <span>Save Message</span>
            </>
          ) : (
            <>
              <Edit3 size={14} />
              <span>Edit Custom Message</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Pills */}
      <div className="template-pills-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {DEFAULT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl.id, tmpl.text)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: activeTemplate === tmpl.id ? '1.5px solid #10b981' : '1px solid #cbd5e1',
              background: activeTemplate === tmpl.id ? '#ecfdf5' : '#f8fafc',
              color: activeTemplate === tmpl.id ? '#047857' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tmpl.title}</span>
          </button>
        ))}
      </div>

      {/* Message Preview */}
      {isEditing ? (
        <textarea
          className="input-field"
          rows={3}
          value={tempText}
          onChange={(e) => setTempText(e.target.value)}
          placeholder="Write your custom message here... ({name} will be replaced with recipient's name)"
          style={{ width: '100%', resize: 'vertical' }}
        />
      ) : (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          fontSize: '0.84rem',
          color: '#334155',
          fontStyle: 'italic',
          lineHeight: '1.5',
        }}>
          "{customText.replace('{name}', 'John Doe')}"
        </div>
      )}
    </div>
  );
}
