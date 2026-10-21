import React, { useState } from 'react';
import { MessageSquareText, Edit3, Check, Settings2, Plus } from 'lucide-react';

export default function MessageTemplateBar({
  templates = [],
  activeTemplateId,
  onSelectTemplate,
  customText,
  onUpdateCustomText,
  onGoToTemplatesTab,
  onSaveActiveToDb,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempText, setTempText] = useState(customText);

  const handleSaveCustom = async () => {
    onUpdateCustomText(tempText);
    setIsEditing(false);
    if (onSaveActiveToDb) {
      onSaveActiveToDb(tempText);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareText size={18} color="#059669" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
            Active WhatsApp Message Template
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            ({" {name} "} is dynamically replaced with the recipient's name)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onGoToTemplatesTab && (
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}
              onClick={onGoToTemplatesTab}
              title="Open Templates Manager to create, edit and permanently save templates"
            >
              <Settings2 size={14} color="#059669" />
              <span>Manage & Save Templates</span>
            </button>
          )}

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
                <span>Edit Current</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Pills from DB */}
      <div className="template-pills-scroll" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {templates.map((tmpl) => {
          const isSelected = activeTemplateId === tmpl._id || activeTemplateId === tmpl.id;
          return (
            <button
              key={tmpl._id || tmpl.id}
              onClick={() => onSelectTemplate(tmpl._id || tmpl.id, tmpl.text)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: isSelected ? '1.5px solid #10b981' : '1px solid #cbd5e1',
                background: isSelected ? '#ecfdf5' : '#f8fafc',
                color: isSelected ? '#047857' : '#475569',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>{tmpl.icon || '💬'}</span>
              <span>{tmpl.title}</span>
            </button>
          );
        })}

        {onGoToTemplatesTab && (
          <button
            onClick={onGoToTemplatesTab}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px dashed #cbd5e1',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={13} />
            <span>New Template</span>
          </button>
        )}
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
          "{customText.replace('{name}', 'Rahul Sharma')}"
        </div>
      )}
    </div>
  );
}
