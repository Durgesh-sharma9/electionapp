import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const PRESET_COLORS = [
  '#ea580c', // Orange
  '#2563eb', // Blue
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#0891b2', // Cyan
  '#e11d48', // Rose
  '#475569', // Slate
];

export default function LocalityMaster({
  localities = [],
  onRefreshLocalities,
  onFilterByLocality,
  totalContacts = 0,
  onToast,
}) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [ward, setWard] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0284c7');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingLocality(null);
    setName('');
    setWard('');
    setDescription('');
    setColor('#ea580c');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditingLocality(loc);
    setName(loc.name || '');
    setWard(loc.ward || '');
    setDescription(loc.description || '');
    setColor(loc.color || '#0284c7');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocality(null);
    setFormError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter locality name');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const isEdit = Boolean(editingLocality && editingLocality._id);
      const url = isEdit ? `/api/localities/${editingLocality._id}` : '/api/localities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onToast) onToast(isEdit ? 'Locality updated! ✅' : 'Locality created! 🎉');
        closeModal();
        if (onRefreshLocalities) onRefreshLocalities();
      } else {
        setFormError(data.error || 'Failed to save locality');
      }
    } catch (err) {
      setFormError(err.message || 'Error saving locality');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (loc) => {
    const msg = loc.contactCount > 0
      ? `Delete '${loc.name}'? ${loc.contactCount} contacts currently assigned will become unassigned.`
      : `Are you sure you want to delete '${loc.name}'?`;

    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`/api/localities/${loc._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast(`Locality '${loc.name}' deleted`);
        if (onRefreshLocalities) onRefreshLocalities();
      } else {
        alert(data.error || 'Failed to delete locality');
      }
    } catch (err) {
      alert('Error deleting locality: ' + err.message);
    }
  };

  const filtered = localities.filter((loc) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      (loc.description && loc.description.toLowerCase().includes(q))
    );
  });

  const totalAssignedContacts = localities.reduce((sum, l) => sum + (l.contactCount || 0), 0);
  const unassignedContacts = Math.max(0, totalContacts - totalAssignedContacts);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '90px' }}>
      {/* Top Banner / Summary */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 16px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MapPin size={18} color="#d97706" />
              </div>
              <div>
                <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Locality Master
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Manage localities, wards, and group voters by their living areas
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={openAddModal}
              className="btn btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>+ Add Locality</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Localities
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {localities.length}
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            <span style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>
              Contacts Assigned
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#065f46', marginTop: '2px' }}>
              {totalAssignedContacts}
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>
              Unassigned Contacts
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#92400e', marginTop: '2px' }}>
              {unassignedContacts}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search locality name, ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.84rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Localities Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '12px',
        }}
      >
        {filtered.map((loc) => {
          const locColor = loc.color || '#0284c7';
          return (
            <div
              key={loc._id}
              className="glass-panel"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Left Color Accent Bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '5px',
                  backgroundColor: locColor,
                }}
              />

              <div>
                {/* Top Row: Name + Ward Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: locColor,
                        flexShrink: 0,
                      }}
                    />
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {loc.name}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {loc.description && (
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                    {loc.description}
                  </p>
                )}

                {/* Contact Count Metric */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '14px',
                    fontSize: '0.82rem',
                    color: '#334155',
                    fontWeight: 600,
                  }}
                >
                  <Users size={15} color={locColor} />
                  <span>{loc.contactCount || 0} Contacts in this area</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => onFilterByLocality && onFilterByLocality(loc.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                  }}
                  title="View contacts belonging to this locality"
                >
                  <span>View Contacts</span>
                  <ExternalLink size={12} />
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(loc)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#0284c7' }}
                    title="Edit locality details"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(loc)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.74rem', color: '#ef4444' }}
                    title="Delete locality"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '36px 20px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <MapPin size={32} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              No Localities Found
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 16px 0' }}>
              Create your first locality or area to organize voters.
            </p>
            <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              + Add Locality
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Locality Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '100%' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={17} color="#d97706" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {editingLocality ? 'Edit Locality' : 'Add New Locality'}
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Area / Mohalla master settings
                  </span>
                </div>
              </div>
            </div>

            {formError && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.8rem',
                  marginBottom: '14px',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Locality / Mohalla Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mahapura Main, Sharma Mohalla..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  style={{ height: '36px', fontSize: '0.85rem' }}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description / Landmarks (Optional)
                </label>
                <textarea
                  placeholder="e.g. Near Govt Primary School, Main Chowk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={2}
                  style={{ fontSize: '0.82rem', resize: 'vertical' }}
                />
              </div>

              {/* Color Tag Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Locality Badge Color
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: color === c ? '2px solid #0f172a' : '2px solid transparent',
                        cursor: 'pointer',
                        transform: color === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem' }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '7px 14px', fontSize: '0.84rem' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingLocality ? 'Update Locality' : 'Save Locality'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
