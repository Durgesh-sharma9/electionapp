import React, { useState } from 'react';
import { MessageSquareText, ChevronDown, ChevronUp, ExternalLink, Check, Sparkles } from 'lucide-react';

export default function MessageTemplateBar({
  templates = [],
  activeTemplateId,
  onSelectTemplate,
  customText,
  onUpdateCustomText,
  onGoToTemplatesTab,
}) {
  const [expanded, setExpanded] = useState(false);
  const activeTpl = templates.find((t) => t._id === activeTemplateId || t.id === activeTemplateId) || templates[0];

  return (
    <div
      className="glass-panel"
      style={{
        padding: '8px 12px',
        marginBottom: '10px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        
        {/* Left: Active Template Badge & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            border: '1px solid #a7f3d0',
            flexShrink: 0,
          }}>
            {activeTpl?.icon || '💬'}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="hide-on-mobile" style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Message:
              </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeTpl?.title || 'Greeting & Connect'}
              </span>
              <span className="badge badge-supporter hide-on-mobile" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>
                {activeTpl?.category || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Template Chips & Toggle Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%' }}>
          {/* Quick Switch Pills (Desktop only - mobile has dedicated Templates tab) */}
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            {templates.slice(0, 3).map((t) => {
              const isSelected = activeTemplateId === t._id || (!activeTemplateId && t.isDefault);
              return (
                <button
                  key={t._id}
                  onClick={() => onSelectTemplate(t._id, t.text)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                    background: isSelected ? '#ecfdf5' : '#f8fafc',
                    color: isSelected ? '#047857' : '#475569',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.icon || '💬'} {t.title}
                </button>
              );
            })}
          </div>

          {/* Toggle Text Preview */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-secondary"
            style={{ padding: '3px 8px', fontSize: '0.72rem', height: '26px', flexShrink: 0 }}
            title="Preview message content"
          >
            <span>{expanded ? 'Hide' : 'Preview'}</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Link to Full Templates Tab (Desktop only) */}
          {onGoToTemplatesTab && (
            <button
              onClick={onGoToTemplatesTab}
              className="btn btn-secondary hide-on-mobile"
              style={{ padding: '3px 8px', fontSize: '0.72rem', height: '26px', flexShrink: 0 }}
              title="Manage All Message Templates"
            >
              <span>All</span>
              <ExternalLink size={11} />
            </button>
          )}
        </div>

      </div>

      {/* Expanded Message Preview & Quick Custom Editor */}
      {expanded && (
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
              Preview (Supports {'{name}'} & {'{locality}'}):
            </span>
            <button
              onClick={() => {
                if (activeTpl?.text) onUpdateCustomText(activeTpl.text);
              }}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset to original
            </button>
          </div>
          <textarea
            value={customText}
            onChange={(e) => onUpdateCustomText(e.target.value)}
            rows={3}
            className="input-field"
            style={{ width: '100%', fontSize: '0.8rem', resize: 'vertical', fontFamily: 'inherit', padding: '6px 10px', background: '#f8fafc' }}
          />
        </div>
      )}
    </div>
  );
}
