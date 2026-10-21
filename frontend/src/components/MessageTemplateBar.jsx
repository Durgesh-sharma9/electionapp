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
        padding: '7px 12px',
        marginBottom: '8px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '9px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        
        {/* Left: Active Template Badge & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            border: '1px solid #a7f3d0',
          }}>
            {activeTpl?.icon || '💬'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Message:
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                {activeTpl?.title || 'Greeting & Connect'}
              </span>
              <span className="badge badge-supporter" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                {activeTpl?.category || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Template Chips & Toggle Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Quick Switch Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '340px', padding: '2px 0' }}>
            {templates.slice(0, 3).map((t) => {
              const isSelected = activeTemplateId === t._id || (!activeTemplateId && t.isDefault);
              return (
                <button
                  key={t._id}
                  onClick={() => onSelectTemplate(t._id, t.text)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                    background: isSelected ? '#ecfdf5' : '#f8fafc',
                    color: isSelected ? '#047857' : '#475569',
                    fontSize: '0.76rem',
                    fontWeight: 600,
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
            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
            title="Preview message content"
          >
            <span>{expanded ? 'Hide Preview' : 'Preview'}</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* Link to Full Templates Tab */}
          {onGoToTemplatesTab && (
            <button
              onClick={onGoToTemplatesTab}
              className="btn btn-secondary"
              style={{ padding: '5px 10px', fontSize: '0.78rem', color: '#059669', borderColor: '#a7f3d0', background: '#f0fdf4' }}
              title="Open all templates"
            >
              <ExternalLink size={13} />
              <span>All Templates</span>
            </button>
          )}
        </div>

      </div>

      {/* Expandable Preview Drawer */}
      {expanded && (
        <div style={{
          marginTop: '10px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '0.82rem',
          color: '#334155',
          lineHeight: '1.5',
          fontStyle: 'italic',
        }}>
          "{customText.replace('{name}', 'Rahul Sharma')}"
        </div>
      )}
    </div>
  );
}
