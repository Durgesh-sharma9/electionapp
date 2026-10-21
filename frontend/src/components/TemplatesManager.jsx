import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Copy,
  Star,
  MessageSquare,
  Sparkles,
  X,
  Send,
  CheckCheck,
} from 'lucide-react';

export default function TemplatesManager({
  templates = [],
  activeTemplateId,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onSetDefaultTemplate,
  loading,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '💬',
    category: 'General',
    text: '',
  });
  const [previewName, setPreviewName] = useState('Rahul Sharma');
  const [copiedId, setCopiedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const iconsList = ['💬', '👋', '📢', '🤝', '⏰', '✨', '🗳️', '🎯', '📌', '🔔'];
  const categoriesList = ['General', 'Supporter', 'Meeting', 'Announcement', 'Volunteer', 'Follow-up'];

  const startCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      icon: '💬',
      category: 'General',
      text: 'Hello {name}, hope you are doing well! Reaching out to connect with you.',
    });
    setModalOpen(true);
  };

  const startEdit = (tpl) => {
    setEditingId(tpl._id);
    setFormData({
      title: tpl.title,
      icon: tpl.icon || '💬',
      category: tpl.category || 'General',
      text: tpl.text,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', icon: '💬', category: 'General', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please fill in both title and template text');
      return;
    }

    setSaving(true);
    try {
      await onSaveTemplate(editingId, formData);
      closeModal();
    } catch (err) {
      alert('Error saving template: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (tpl) => {
    const formatted = tpl.text.replace(/{name}/g, previewName);
    navigator.clipboard.writeText(formatted);
    setCopiedId(tpl._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="tm-container" style={{ paddingBottom: '90px' }}>
      {/* Action Toolbar */}
      <div className="tm-toolbar glass-panel">
        <div className="tm-toolbar-left">
          <div className="tm-preview-name-box">
            <span className="tm-preview-label">Live Preview Name:</span>
            <input
              type="text"
              value={previewName}
              onChange={(e) => setPreviewName(e.target.value)}
              placeholder="Test Recipient Name"
              className="input-field tm-preview-input"
            />
          </div>
          <span className="tm-token-hint">
            Token <code className="tm-code-tag">{'{name}'}</code> will be dynamically replaced for each voter.
          </span>
        </div>

        <button onClick={startCreate} className="btn btn-primary" style={{ padding: '9px 18px' }}>
          <Plus size={16} />
          <span>+ Create New Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="tm-grid">
        {templates.map((tpl) => {
          const isActive = activeTemplateId === tpl._id;
          const formattedMessage = tpl.text.replace(/{name}/g, previewName);

          return (
            <div key={tpl._id} className={`tm-card ${isActive ? 'active' : ''}`}>
              {/* Card Header */}
              <div className="tm-card-header">
                <div className="tm-card-title-group">
                  <span className="tm-card-icon">{tpl.icon || '💬'}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 className="tm-card-title">{tpl.title}</h3>
                      {tpl.isDefault && (
                        <span className="tm-default-badge" title="Default Active Template">
                          <Star size={11} fill="#eab308" color="#eab308" />
                          <span>Default</span>
                        </span>
                      )}
                    </div>
                    <span className="badge badge-category">{tpl.category || 'General'}</span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="tm-card-actions">
                  <button
                    onClick={() => startEdit(tpl)}
                    className="tm-icon-btn"
                    title="Edit Template"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete template "${tpl.title}"?`)) {
                        onDeleteTemplate(tpl._id);
                      }
                    }}
                    className="tm-icon-btn tm-delete-btn"
                    title="Delete Template"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* WhatsApp Chat Preview Bubble */}
              <div className="tm-chat-preview-box">
                <div className="tm-chat-bubble">
                  <p className="tm-chat-text">{formattedMessage}</p>
                  <div className="tm-chat-meta">
                    <span className="tm-chat-time">10:30 AM</span>
                    <CheckCheck size={14} color="#38bdf8" />
                  </div>
                </div>
              </div>

              {/* Card Footer Toolbar */}
              <div className="tm-card-footer">
                <button
                  onClick={() => onSelectTemplate(tpl)}
                  className={`btn ${isActive ? 'btn-whatsapp' : 'btn-secondary'} tm-select-btn`}
                >
                  {isActive ? (
                    <>
                      <Check size={14} />
                      <span>Currently Active</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare size={14} />
                      <span>Use for Outreach</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {!tpl.isDefault && (
                    <button
                      onClick={() => onSetDefaultTemplate(tpl._id)}
                      className="btn btn-secondary tm-sub-btn"
                      title="Set as Default"
                    >
                      <Star size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(tpl)}
                    className="btn btn-secondary tm-sub-btn"
                    title="Copy formatted text"
                  >
                    {copiedId === tpl._id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card animate-fade-in" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{formData.icon || '📝'}</span>
                <div>
                  <h3 className="modal-title">
                    {editingId ? 'Edit Message Template' : 'Create New Message Template'}
                  </h3>
                  <p className="modal-subtitle">Save reusable WhatsApp messages to MongoDB</p>
                </div>
              </div>
              <button onClick={closeModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Template Title */}
              <div className="form-group">
                <label className="form-label">Template Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supporter Outreach, Event Invitation..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Icon & Category Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pick Emoji Icon</label>
                  <div className="tm-emoji-selector">
                    {iconsList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`tm-emoji-btn ${formData.icon === emoji ? 'active' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Template Text */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Message Content</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, text: formData.text + '{name}' })}
                    className="tm-insert-token-btn"
                  >
                    + Insert {'{name}'}
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter message text... Type {name} to personalize recipient name."
                  className="input-field"
                  style={{ lineHeight: 1.5, resize: 'vertical' }}
                />
              </div>

              {/* Live Preview Inside Modal */}
              <div className="tm-modal-preview">
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Recipient Preview with "{previewName}":
                </span>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {formData.text ? formData.text.replace(/{name}/g, previewName) : 'Your message will appear here...'}
                </p>
              </div>

              {/* Form Buttons */}
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : editingId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
