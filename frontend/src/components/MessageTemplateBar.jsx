import React, { useState } from 'react';
import { MessageSquareText, Edit3, Check } from 'lucide-react';

export const DEFAULT_TEMPLATES = [
  {
    id: 'appeal',
    title: '🗳️ चुनाव सहयोग अपील',
    text: 'सादर प्रणाम {name} जी! आगामी चुनाव में आपके अमूल्य सहयोग, आशीर्वाद एवं समर्थन की विनम्र अपील करते हैं। आपका साथ ही हमारी ताकत है। धन्यवाद!',
  },
  {
    id: 'development',
    title: '🌟 विकास एवं विजन',
    text: 'नमस्ते {name} जी, क्षेत्र के चहुंमुखी विकास, जनसेवा और बेहतर सुविधाओं के लिए अपना बहुमूल्य मत देकर विजयी बनाएं। आपका एक वोट बदलेगा भविष्य!',
  },
  {
    id: 'meeting',
    title: '📢 जनसंवाद आमंत्रण',
    text: 'सादर नमस्कार {name} जी, आज क्षेत्र में जनसंवाद एवं जनसंपर्क बैठक का आयोजन है। आप सादर आमंत्रित हैं, अवश्य पधारें।',
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
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareText size={18} color="#059669" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            WhatsApp सन्देश टेम्पलेट
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            ({" {name} "} उस व्यक्ति के नाम से स्वतः बदल जाएगा)
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
              <span>सेव करें</span>
            </>
          ) : (
            <>
              <Edit3 size={14} />
              <span>कस्टम संदेश लिखें</span>
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
          placeholder="अपना संदेश यहाँ लिखें... ({name} व्यक्ति के नाम से बदल जाएगा)"
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
          "{customText.replace('{name}', 'राम शर्मा')}"
        </div>
      )}
    </div>
  );
}
