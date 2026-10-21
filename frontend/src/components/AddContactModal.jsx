import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, User, Edit2, MapPin, UserCheck } from 'lucide-react';

const CATEGORIES = [
  'General',
  'Lead / Inquiry',
  'VIP Contact',
  'Member / Supporter',
  'Volunteer / Staff',
  'Senior Citizen',
  'Other',
];

export default function AddContactModal({
  isOpen,
  onClose,
  onSave,
  contact = null,
  localities = [],
  references = [],
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(contact && contact._id);

  // Sync state when modal opens or contact changes
  useEffect(() => {
    if (contact) {
      setName(contact.name || '');
      setPhone(contact.phone || '');
      setLocality(contact.locality || '');
      setReference(contact.reference || '');
      setCategory(contact.category || 'General');
      setNotes(contact.notes || '');
    } else {
      setName('');
      setPhone('');
      setLocality('');
      setReference('');
      setCategory('General');
      setNotes('');
    }
    setError('');
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter contact name');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave({
        ...(contact?._id ? { _id: contact._id } : {}),
        name: name.trim(),
        phone: cleanDigits.slice(-10),
        locality: locality.trim(),
        reference: reference.trim(),
        category,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '9px',
              background: isEditing ? '#f0f9ff' : '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${isEditing ? '#bae6fd' : '#a7f3d0'}`,
            }}>
              {isEditing ? (
                <Edit2 size={18} color="#0284c7" />
              ) : (
                <UserPlus size={19} color="#059669" />
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Contact Details' : 'Add New Contact'}
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {isEditing ? 'Update name, locality, reference, or phone' : 'Enter contact details with locality & reference'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div style={{
            padding: '9px 12px',
            borderRadius: '6px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.82rem',
            marginBottom: '14px',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          
          {/* Name & Phone in 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#059669" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9829012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Locality & Reference in 2 Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Locality (Dropdown) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Locality / क्षेत्र (Mohalla)
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="#ea580c" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <select
                  className="input-field"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="">— Unassigned (None) —</option>
                  {localities.map((loc) => (
                    <option key={loc._id || loc.name} value={loc.name}>
                      📍 {loc.name} {loc.ward ? `(${loc.ward})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reference (Input with Datalist) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Reference (किसके संदर्भ से)
              </label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={15} color="#7c3aed" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                <input
                  type="text"
                  list="references-datalist"
                  className="input-field"
                  placeholder="e.g. Sarita Ma'am, Self..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
                />
                <datalist id="references-datalist">
                  {references.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
              Tag / Category
            </label>
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ height: '36px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
              Notes / Remarks (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g. Contact remarks, specific instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ fontSize: '0.82rem', resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.84rem' }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                flex: 2,
                padding: '8px 14px',
                fontSize: '0.86rem',
                background: isEditing ? 'linear-gradient(135deg, #0284c7, #0369a1)' : undefined,
              }}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
