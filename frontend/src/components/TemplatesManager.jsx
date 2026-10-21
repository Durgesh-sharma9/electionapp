import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, Sparkles, Copy, MessageSquare, Star } from 'lucide-react';

export default function TemplatesManager({
  templates,
  activeTemplate,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onSetDefaultTemplate,
  loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    icon: '💬',
    category: 'General',
    text: '',
  });
  const [previewName, setPreviewName] = useState('Rahul Sharma');
  const [copiedId, setCopiedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [messageNotice, setMessageNotice] = useState(null);

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      title: '',
      icon: '💬',
      category: 'General',
      text: 'Hello {name},\n\n',
    });
  };

  const startEdit = (tpl) => {
    setIsCreating(false);
    setEditingId(tpl._id);
    setFormData({
      title: tpl.title,
      icon: tpl.icon || '💬',
      category: tpl.category || 'General',
      text: tpl.text,
    });
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', icon: '💬', category: 'General', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('Please fill in both title and template message text');
      return;
    }

    setSaving(true);
    try {
      if (isCreating) {
        await onSaveTemplate(null, formData);
        setMessageNotice('Template created and saved successfully!');
      } else {
        await onSaveTemplate(editingId, formData);
        setMessageNotice('Template updated successfully!');
      }
      cancelEdit();
      setTimeout(() => setMessageNotice(null), 3000);
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

  const iconsList = ['💬', '👋', '📢', '🤝', '⏰', '✨', '🗳️', '🎯', '📌', '🔔'];

  return (
    <div className="templates-manager">
      {/* Top Header */}
      <div className="section-card tm-header">
        <div className="tm-header-content">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-lg">📝</span>
              <h2 className="text-xl font-bold text-slate-800">WhatsApp Message Templates</h2>
              <span className="badge badge-emerald">{templates.length} Saved</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Create, edit, and save reusable WhatsApp messages. Use <code className="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-bold text-xs">{'{name}'}</code> to automatically insert the recipient's name.
            </p>
          </div>

          {!isCreating && !editingId && (
            <button onClick={startCreate} className="btn btn-primary shadow-sm">
              <Plus size={18} />
              <span>Create New Template</span>
            </button>
          )}
        </div>

        {messageNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
            <Check size={16} className="text-emerald-600" />
            <span>{messageNotice}</span>
          </div>
        )}
      </div>

      {/* Create / Edit Form Drawer */}
      {(isCreating || editingId) && (
        <div className="section-card tm-form-card border-2 border-emerald-500/30 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-600" />
              <span>{isCreating ? 'Create New Template' : 'Edit Template'}</span>
            </h3>
            <span className="text-xs text-slate-400">All changes save permanently to database</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Friendly Greeting, Event Reminder"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. General, Follow-up"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Choose Emoji Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconsList.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: ic })}
                    className={`px-3 py-1.5 text-lg rounded-lg border transition-all ${
                      formData.icon === ic
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600">
                  Message Content *
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, text: formData.text + '{name}' })}
                  className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium hover:bg-emerald-100"
                >
                  + Insert {'{name}'}
                </button>
              </div>
              <textarea
                rows={5}
                placeholder="Type your WhatsApp message here. Use {name} where you want recipient's name to appear..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="input-field font-sans"
                required
              />
            </div>

            {/* Live Preview Inside Form */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <span>📱 Live Message Preview:</span>
                </span>
                <span className="italic">Testing with recipient: <strong>{previewName}</strong></span>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-lg text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                {formData.text ? formData.text.replace(/{name}/g, previewName) : <em className="text-slate-400">Message preview will appear here...</em>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                <Check size={16} />
                <span>{saving ? 'Saving...' : isCreating ? 'Save New Template' : 'Update Template'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Saved Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {templates.map((tpl) => {
          const isSelected = activeTemplate?._id === tpl._id || activeTemplate?.title === tpl.title;
          const formattedPreview = tpl.text.replace(/{name}/g, previewName);

          return (
            <div
              key={tpl._id}
              className={`section-card template-card transition-all ${
                isSelected
                  ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-200'
                  : 'hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-1 bg-white rounded shadow-xs border border-slate-100">
                    {tpl.icon || '💬'}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-800 text-base">{tpl.title}</h4>
                      {tpl.isDefault && (
                        <span className="badge badge-emerald text-[10px] py-0.5">Default</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Category: {tpl.category || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectTemplate(tpl)}
                    className={`btn btn-sm ${
                      isSelected ? 'btn-success' : 'btn-secondary text-xs'
                    }`}
                    title="Select as active message template"
                  >
                    {isSelected ? <Check size={14} /> : <MessageSquare size={14} />}
                    <span>{isSelected ? 'Active' : 'Use'}</span>
                  </button>

                  <button
                    onClick={() => startEdit(tpl)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                    title="Edit Template"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => onDeleteTemplate(tpl._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Delete Template"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Message Content Preview */}
              <div className="my-3 p-3 bg-white border border-slate-200/80 rounded-lg text-slate-700 text-sm whitespace-pre-wrap leading-relaxed shadow-xs">
                {formattedPreview}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-500">Preview:</span> {previewName}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(tpl)}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium hover:underline"
                  >
                    {copiedId === tpl._id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedId === tpl._id ? 'Copied' : 'Copy'}</span>
                  </button>

                  {!tpl.isDefault && onSetDefaultTemplate && (
                    <button
                      onClick={() => onSetDefaultTemplate(tpl._id)}
                      className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium hover:underline"
                    >
                      <Star size={13} />
                      <span>Set Default</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
