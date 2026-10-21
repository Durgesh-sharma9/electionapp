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
  'वार्ड 1 (Ward 1)',
  'वार्ड 2 (Ward 2)',
  'वार्ड 3 (Ward 3)',
  'वार्ड 4 (Ward 4)',
  'वार्ड 5 (Ward 5)',
  'वार्ड 6 (Ward 6)',
  'मुख्य क्षेत्र (Main Area)',
  'कॉलोनी क्षेत्र',
  'ग्रामीण / ढाणी क्षेत्र',
];

export default function AddContactModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('वार्ड 1 (Ward 1)');
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
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
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
            <div style={{ padding: '8px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                नया मतदाता / संपर्क जोड़ें
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Add New Contact for Election Campaign
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
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              मतदाता का नाम (Full Name) *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              मोबाइल नंबर (10 Digit Mobile No) *
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#059669" style={{ position: 'absolute', left: '12px', top: '14px' }} />
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
                श्रेणी (Category)
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ cursor: 'pointer' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              टिप्पणी / विवरण (Notes - Optional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="उदा. प्रमुख कार्यकर्ता, युवा मोर्चा, परिवार में 5 वोट"
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
              रद्द करें
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
