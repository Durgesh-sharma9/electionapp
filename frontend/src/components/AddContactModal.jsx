import React, { useState, useEffect, useMemo } from 'react';
import { X, UserPlus, Phone, User, Edit2, MapPin, UserCheck, Check, Plus, Landmark, Star, Users } from 'lucide-react';

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
  wards = [],
  localities = [],
  references = [],
  onLocalityCreated,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('');
  const [locality, setLocality] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState('General');
  const [notes, setNotes] = useState('');
  const [isSureVoter, setIsSureVoter] = useState(false);
  const [voterCount, setVoterCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Inline Direct Locality Creation State
  const [isAddingNewLocality, setIsAddingNewLocality] = useState(false);
  const [newLocalityInput, setNewLocalityInput] = useState('');
  const [creatingLocality, setCreatingLocality] = useState(false);

  const isEditing = Boolean(contact && contact._id);

  // Sync state when modal opens or contact changes
  useEffect(() => {
    setIsAddingNewLocality(false);
    setNewLocalityInput('');
    if (contact) {
      setName(contact.name || '');
      setPhone(contact.phone || '');
      setWard(contact.ward || '');
      setLocality(contact.locality || '');
      setReference(contact.reference || '');
      setCategory(contact.category || 'General');
      setNotes(contact.notes || '');
      setIsSureVoter(Boolean(contact.isSureVoter));
      setVoterCount(contact.voterCount || 1);
    } else {
      setName('');
      setPhone('');
      setWard('');
      setLocality('');
      setReference('');
      setCategory('General');
      setNotes('');
      setIsSureVoter(false);
      setVoterCount(1);
    }
    setError('');
  }, [contact, isOpen, wards]);

  // Dynamically filter localities: show localities for this ward + unassigned general localities
  const filteredLocalities = useMemo(() => {
    if (!ward) return localities;
    const targetWard = ward.trim().toLowerCase();
    return localities.filter(
      (loc) => !loc.ward || loc.ward.trim() === '' || loc.ward.trim().toLowerCase() === targetWard
    );
  }, [localities, ward]);

  // When ward changes, ensure locality is still compatible
  const handleWardChange = (newWard) => {
    setWard(newWard);
    setIsAddingNewLocality(false);
    setNewLocalityInput('');
    if (newWard) {
      const target = newWard.trim().toLowerCase();
      const currentLocObj = localities.find((l) => l.name === locality);
      if (currentLocObj && currentLocObj.ward && currentLocObj.ward.trim().toLowerCase() !== target) {
        setLocality('');
      }
    }
  };

  // Handle direct inline locality creation for this ward
  const handleCreateDirectLocality = async () => {
    const trimmed = newLocalityInput.trim();
    if (!trimmed) return;
    setCreatingLocality(true);
    try {
      const res = await fetch('/api/localities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, ward: ward || '' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (onLocalityCreated) {
          onLocalityCreated(data.data);
        }
        setLocality(data.data.name);
        setIsAddingNewLocality(false);
        setNewLocalityInput('');
      } else {
        alert(data.error || 'Failed to add locality');
      }
    } catch (err) {
      setLocality(trimmed);
      setIsAddingNewLocality(false);
      setNewLocalityInput('');
    } finally {
      setCreatingLocality(false);
    }
  };

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
        ward: ward.trim(),
        locality: locality.trim(),
        reference: reference.trim(),
        category,
        notes: notes.trim(),
        isSureVoter,
        voterCount: Math.max(1, Number(voterCount) || 1),
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
              color: isEditing ? '#0284c7' : '#059669',
            }}>
              {isEditing ? <Edit2 size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                {isEditing ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b' }}>
                {isEditing ? 'Update contact & ward details' : 'Enter voter info with assigned ward & area'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            padding: '9px 12px',
            marginBottom: '14px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Row 1: Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: '0 12px 0 34px', height: '40px', fontSize: '0.85rem' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Mobile Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="#059669" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="tel"
                  className="input-field"
                  placeholder="9829012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: '0 12px 0 34px', height: '40px', fontSize: '0.85rem' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Row 2: Ward & Locality Hierarchy */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Step 1: Choose Ward */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Ward (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Landmark size={15} color="#0284c7" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <select
                  className="input-field"
                  value={ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  style={{ padding: '0 24px 0 34px', height: '40px', fontSize: '0.84rem', cursor: 'pointer', fontWeight: 600, color: '#0369a1' }}
                >
                  <option value="">Select Ward</option>
                  {wards.length > 0 ? (
                    wards.map((w) => (
                      <option key={w._id || w.name} value={w.name}>
                        🏛️ {w.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ward 1">🏛️ Ward 1</option>
                      <option value="Ward 2">🏛️ Ward 2</option>
                      <option value="Ward 3">🏛️ Ward 3</option>
                      <option value="Ward 4">🏛️ Ward 4</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Step 2: Locality (Filtered strictly by selected Ward) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: isAddingNewLocality ? '#ea580c' : '#334155' }}>
                  {isAddingNewLocality ? `+ Add to ${ward || 'Ward'}` : 'Locality / Area'}
                </label>
                {!isAddingNewLocality ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewLocality(true)}
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#ea580c',
                      borderRadius: '5px',
                      padding: '1px 7px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    title={`Add a new locality for ${ward || 'this ward'}`}
                  >
                    <Plus size={11} />
                    <span>New</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewLocality(false);
                      setNewLocalityInput('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isAddingNewLocality ? (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <MapPin size={15} color="#ea580c" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder={`New area for ${ward || 'ward'}...`}
                      value={newLocalityInput}
                      onChange={(e) => setNewLocalityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateDirectLocality();
                        }
                      }}
                      style={{ padding: '0 12px 0 34px', height: '40px', fontSize: '0.84rem' }}
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateDirectLocality}
                    disabled={creatingLocality || !newLocalityInput.trim()}
                    style={{ height: '40px', padding: '0 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    title="Save locality"
                  >
                    {creatingLocality ? '...' : <Check size={14} />}
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} color="#ea580c" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <select
                    className="input-field"
                    value={locality}
                    onChange={(e) => {
                      if (e.target.value === '__NEW__') {
                        setIsAddingNewLocality(true);
                      } else {
                        setLocality(e.target.value);
                      }
                    }}
                    style={{ padding: '0 24px 0 34px', height: '40px', fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    <option value="">Select Area</option>
                    <option value="__NEW__" style={{ fontWeight: 600, color: '#ea580c' }}>
                      + Add New Area in {ward || 'this ward'}...
                    </option>
                    {filteredLocalities.map((loc) => (
                      <option key={loc._id || loc.name} value={loc.name}>
                        📍 {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Reference & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Reference Person (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <UserCheck size={15} color="#7c3aed" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  list="references-datalist"
                  className="input-field"
                  placeholder="e.g. Sarita Ma'am, Self..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  style={{ padding: '0 12px 0 34px', height: '40px', fontSize: '0.84rem' }}
                />
                <datalist id="references-datalist">
                  {references.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
                Voter Category
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ padding: '0 12px', height: '40px', fontSize: '0.84rem', cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Number of Family Voters (घर में कुल वोट) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#0284c7" />
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  Total Voters in Family / House
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>(घर में कुल वोट)</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: isSureVoter ? '#b45309' : '#64748b', marginTop: '2px', fontWeight: isSureVoter ? 600 : 400 }}>
                {isSureVoter
                  ? `⭐ Sure karne par poore ${voterCount || 1} votes tally me judenge`
                  : `Is parivaar ke kul kitne vote milenge (Default: 1)`}
              </div>
            </div>

            {/* Stepper with +/- and number input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setVoterCount((prev) => Math.max(1, (Number(prev) || 1) - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={voterCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setVoterCount(isNaN(val) ? '' : Math.max(1, val));
                }}
                onBlur={() => {
                  if (!voterCount || voterCount < 1) setVoterCount(1);
                }}
                style={{
                  width: '46px',
                  height: '32px',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '1.5px solid #0284c7',
                  background: '#f0f9ff',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  color: '#0369a1',
                }}
              />
              <button
                type="button"
                onClick={() => setVoterCount((prev) => (Number(prev) || 1) + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Row 5: Sure Voter Toggle (Prominent) */}
          <div
            onClick={() => setIsSureVoter(!isSureVoter)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1.5px solid ${isSureVoter ? '#f59e0b' : '#e2e8f0'}`,
              background: isSureVoter ? '#fef3c7' : '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isSureVoter ? '#f59e0b' : '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSureVoter ? '#ffffff' : '#94a3b8',
                }}
              >
                <Star size={16} fill={isSureVoter ? '#ffffff' : 'none'} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isSureVoter ? '#92400e' : '#1e293b' }}>
                  Confirmed Sure Voter ⭐ {isSureVoter && `(+${voterCount || 1} Sure Votes)`}
                </div>
                <div style={{ fontSize: '0.72rem', color: isSureVoter ? '#b45309' : '#64748b' }}>
                  {isSureVoter
                    ? `Marked as guaranteed: poore ${voterCount || 1} votes campaign tally me judenge`
                    : `Click to mark as confirmed supporter (+${voterCount || 1} Votes)`}
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={isSureVoter}
              onChange={(e) => setIsSureVoter(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          {/* Row 5: Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: '#334155' }}>
              Notes / Remarks (Optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="e.g. Specific request, family head, remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ fontSize: '0.82rem', resize: 'vertical' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
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
