import React, { useState } from 'react';
import { X, UserPlus, Phone, User, MapPin, Tag, FileText } from 'lucide-react';

const CATEGORIES = [
  'समर्थक (Supporter)',
  'तटस्थ (Undecided)',
  'प्रमुख व्यक्ति (Key Person)',
  'कार्यकर्ता (Volunteer)',
  'अन्य (Other)',
];

const COMMON_WARDS = [
  'महापुरा (मुख्य गाँव)',
  'महापुरा वार्ड 1',
  'महापुरा वार्ड 2',
  'महापुरा वार्ड 3',
  'महापुरा वार्ड 4',
  'महापुरा कॉलोनी',
  'महापुरा ढाणी क्षेत्र',
];

export default function AddContactModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('महापुरा (मुख्य गाँव)');
  const [category, setCategory] = useState('समर्थक (Supporter)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया नाम दर्ज करें');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        phone: cleanDigits.slice(-10),
        ward: ward.trim(),
        category,
        notes: notes.trim(),
      });
      // Reset
      setName('');
      setPhone('');
      setNotes('');
      onClose();
    } catch (err) {
      setError(err.message || 'त्रुटि हुई');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="glass-modal animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                नया मतदाता / संपर्क जोड़ें
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Add New Contact for Mahapura Campaign
              </p>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-icon" 
            onClick={onClose}
            style={{ borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              मतदाता का नाम (Full Name) *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="text"
                className="input-field"
                placeholder="उदा. राजेश कुमार शर्मा"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '38px' }}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              मोबाइल नंबर (10 Digit Mobile No) *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#10b981" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type="tel"
                className="input-field"
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          {/* Ward & Category in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Ward */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
                वार्ड / क्षेत्र (Ward/Area)
              </label>
              <input
                list="ward-list"
                className="input-field"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="वार्ड चुनें या लिखें"
              />
              <datalist id="ward-list">
                {COMMON_WARDS.map((w) => (
                  <option key={w} value={w} />
                ))}
              </datalist>
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
                श्रेणी (Category)
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} style={{ background: '#1e293b' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              टिप्पणी / विवरण (Notes - Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="उदा. वार्ड अध्यक्ष, युवा मोर्चा, परिवार में 5 वोट आदि"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {submitting ? 'सेव हो रहा है...' : 'MongoDB में सेव करें'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
