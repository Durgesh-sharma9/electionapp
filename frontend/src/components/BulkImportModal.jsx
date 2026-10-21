import React, { useState } from 'react';
import { X, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onBulkImport }) {
  const [rawText, setRawText] = useState('');
  const [defaultWard, setDefaultWard] = useState('वार्ड 1 (Ward 1)');
  const [defaultCategory, setDefaultCategory] = useState('समर्थक (Supporter)');
  const [parsedItems, setParsedItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Auto-parse lines into { name, phone }
  const handleParse = (text) => {
    setRawText(text);
    if (!text.trim()) {
      setParsedItems([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    const results = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const phoneMatch = line.match(/(?:\+?91[\s-]?)?[6-9]\d{9}/);

      if (phoneMatch) {
        const fullMatchedPhone = phoneMatch[0];
        const cleanDigits = fullMatchedPhone.replace(/\D/g, '').slice(-10);

        let name = line.replace(fullMatchedPhone, '').trim();
        name = name.replace(/^[-–—:,.\t\s]+|[-–—:,.\t\s]+$/g, '').trim();

        if (name && cleanDigits.length === 10) {
          results.push({ name, phone: cleanDigits });
        }
      } else {
        const parts = line.split(/[,\t|]/).map((p) => p.trim());
        if (parts.length >= 2) {
          const possiblePhone = parts[1].replace(/\D/g, '').slice(-10);
          if (possiblePhone.length === 10) {
            results.push({ name: parts[0], phone: possiblePhone });
          }
        }
      }
    }

    setParsedItems(results);
  };

  const handleImport = async () => {
    if (parsedItems.length === 0) {
      setError('कोई मान्य नाम और 10-अंकों का नंबर नहीं मिला');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onBulkImport({
        contacts: parsedItems.map((item) => ({
          name: item.name,
          phone: item.phone,
          ward: defaultWard,
          category: defaultCategory,
        })),
        defaultWard,
        defaultCategory,
      });
      setRawText('');
      setParsedItems([]);
      onClose();
    } catch (err) {
      setError(err.message || 'इम्पोर्ट करने में त्रुटि हुई');
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
      <div className="glass-modal animate-fade-in" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5' }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#0f172a' }}>
                बल्क मतदाता लिस्ट पेस्ट करें (Bulk Paste List)
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                WhatsApp, Excel या डायरी से नाम और नंबर सीधे यहाँ पेस्ट करें
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ borderRadius: '50%' }}>
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
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Example format helper */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          fontSize: '0.82rem',
          color: '#9a3412',
          marginBottom: '14px',
        }}>
          💡 <strong>कोई भी फॉर्मेट चलेगा:</strong> उदा.<br />
          <code>राजेश शर्मा 9829012345</code> या <code>सुरेश कुमार, 9829098765</code> या <code>मुकेश - 9829054321</code>
        </div>

        {/* Textarea */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
            <span>मतदाता सूची यहाँ पेस्ट करें (Paste Lines Here)</span>
            {parsedItems.length > 0 && (
              <span style={{ color: '#059669', fontWeight: 700 }}>
                ✓ {parsedItems.length} संपर्क पहचाने गए
              </span>
            )}
          </label>
          <textarea
            className="input-field"
            rows={7}
            placeholder={`सुनील कुमार 9829011111\nरमेश जी 9829022222\nकविता शर्मा, 9829033333`}
            value={rawText}
            onChange={(e) => handleParse(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}
          />
        </div>

        {/* Default Ward & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>
              डिफ़ॉल्ट वार्ड / क्षेत्र
            </label>
            <input
              type="text"
              className="input-field"
              value={defaultWard}
              onChange={(e) => setDefaultWard(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>
              डिफ़ॉल्ट श्रेणी (Category)
            </label>
            <select
              className="input-field"
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
            >
              <option value="समर्थक (Supporter)">समर्थक (Supporter)</option>
              <option value="तटस्थ (Undecided)">तटस्थ (Undecided)</option>
              <option value="प्रमुख व्यक्ति (Key Person)">प्रमुख व्यक्ति (Key Person)</option>
              <option value="कार्यकर्ता (Volunteer)">कार्यकर्ता (Volunteer)</option>
            </select>
          </div>
        </div>

        {/* Live Preview Table */}
        {parsedItems.length > 0 && (
          <div style={{ marginBottom: '16px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 12px' }}>#</th>
                  <th style={{ padding: '8px 12px' }}>नाम (Name)</th>
                  <th style={{ padding: '8px 12px' }}>मोबाइल (Phone)</th>
                  <th style={{ padding: '8px 12px' }}>वार्ड (Ward)</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.slice(0, 10).map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '8px 12px', color: '#0284c7', fontWeight: 600 }}>+91 {item.phone}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{defaultWard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedItems.length > 10 && (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b', background: '#f8fafc' }}>
                ...और {parsedItems.length - 10} अन्य संपर्क भी सम्मिलित हैं
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            रद्द करें
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={submitting || parsedItems.length === 0}
            style={{ flex: 2 }}
          >
            {submitting ? 'इम्पोर्ट हो रहा है...' : `MongoDB में ${parsedItems.length} संपर्क जोड़ें`}
          </button>
        </div>

      </div>
    </div>
  );
}
