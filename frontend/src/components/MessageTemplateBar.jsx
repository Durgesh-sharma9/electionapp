import React, { useState } from 'react';
import { MessageSquareText, Edit3, Check } from 'lucide-react';

export const DEFAULT_TEMPLATES = [
  {
    id: 'appeal',
    title: '🗳️ चुनाव सहयोग अपील',
    text: 'सादर प्रणाम {name} जी! महापुरा चुनाव में आपके अमूल्य सहयोग, आशीर्वाद एवं समर्थन की विनम्र अपील करते हैं। आपका साथ ही हमारी ताकत है। धन्यवाद!',
  },
  {
    id: 'development',
    title: '🌟 विकास एवं विजन',
    text: 'नमस्ते {name} जी, महापुरा के चहुंमुखी विकास, बेहतर सुविधाओं और जनसेवा हेतु अपना बहुमूल्य मत देकर विजयी बनाएं। आपका एक वोट बदलेगा भविष्य!',
  },
  {
    id: 'meeting',
    title: '📢 जनसंवाद आमंत्रण',
    text: 'सादर नमस्कार {name} जी, आज महापुरा में जनसंवाद एवं जनसंपर्क बैठक का आयोजन है। आप सादर आमंत्रित हैं, अवश्य पधारें।',
  },
  {
    id: 'reminder',
    title: '⏰ मतदान दिवस स्मरण',
    text: 'सादर प्रणाम {name} जी! आज मतदान का पावन पर्व है। कृपया अपने परिवार सहित मतदान केंद्र पहुंचकर अपना मत अवश्य दें।',
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
    <div className="glass-panel" style={{ padding: '14px 16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareText size={17} color="#10b981" />
          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>
            WhatsApp सन्देश टेम्पलेट
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {"{name}"} स्वतः बदल जाएगा
          </span>
        </div>

        <button
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
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
              <Check size={13} color="#10b981" />
              <span>सेव करें</span>
            </>
          ) : (
            <>
              <Edit3 size={13} />
              <span>एडिट करें</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Pills - scrollable on mobile */}
      <div className="template-pills-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {DEFAULT_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl.id, tmpl.text)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: activeTemplate === tmpl.id ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              background: activeTemplate === tmpl.id ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTemplate === tmpl.id ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 500,
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
          placeholder="अपना सन्देश लिखें... ({name} की जगह व्यक्ति का नाम आएगा)"
          style={{ width: '100%', resize: 'vertical' }}
        />
      ) : (
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          fontSize: '0.8rem',
          color: '#cbd5e1',
          fontStyle: 'italic',
          lineHeight: '1.4',
        }}>
          "{customText.replace('{name}', 'राजेश जी')}"
        </div>
      )}
    </div>
  );
}
