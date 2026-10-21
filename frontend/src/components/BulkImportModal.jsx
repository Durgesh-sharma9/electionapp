import React, { useState } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onBulkImport }) {
  const [rawText, setRawText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('General');
  const [parsedItems, setParsedItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Auto-parse text as user types or pastes
  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);

    const lines = text.split('\n');
    const items = [];

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Match 10-12 digit phone numbers
      const phoneMatch = cleanLine.match(/(?:\+91|91|0)?([6-9]\d{9})/);
      if (phoneMatch) {
        const phone = phoneMatch[1];
        // The rest of the line is the name
        let name = cleanLine.replace(phoneMatch[0], '').replace(/[,\-\t:|()]/g, ' ').trim();
        name = name.replace(/\s+/g, ' ');

        if (!name) {
          name = `Contact ${phone.slice(-4)}`;
        }

        items.push({
          name,
          phone,
          category: defaultCategory,
        });
      }
    });

    setParsedItems(items);
  };

  const handleImport = async () => {
    if (parsedItems.length === 0) {
      alert('Please paste at least one contact name with a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = parsedItems.map((item) => ({
        ...item,
        category: defaultCategory,
      }));
      await onBulkImport(payload);
      setRawText('');
      setParsedItems([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleExample = `Ramesh Sharma 9829012345
Suresh Verma 9414056789
Amit Singh +91 9785012345
Vikram Patel, 9876543210`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #c7d2fe',
            }}>
              <FileSpreadsheet size={20} color="#4f46e5" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Paste & Import Bulk Contacts
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Paste lines with names & numbers in any format
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          marginBottom: '14px',
          fontSize: '0.82rem',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#4f46e5" />
            <span>Format: <strong>Name + 10-digit Mobile Number</strong> on each line</span>
          </div>
          <button
            type="button"
            onClick={() => handleTextChange({ target: { value: sampleExample } })}
            style={{
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              color: '#4338ca',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Paste Sample
          </button>
        </div>

        {/* Text Area */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Paste Your List Here:
            </label>
            {parsedItems.length > 0 && (
              <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} />
                <span>{parsedItems.length} valid contacts detected</span>
              </span>
            )}
          </div>
          <textarea
            className="input-field"
            rows={6}
            placeholder={`Paste here, example:\nRamesh Sharma 9829012345\nSuresh Verma 9414056789\nAmit Singh +91 9785012345`}
            value={rawText}
            onChange={handleTextChange}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.84rem' }}
          />
        </div>

        {/* Default Category */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', color: '#334155' }}>
            Assign Tag / Category to Imported Contacts
          </label>
          <select
            className="input-field"
            value={defaultCategory}
            onChange={(e) => setDefaultCategory(e.target.value)}
          >
            <option value="General">General</option>
            <option value="Lead / Inquiry">Lead / Inquiry</option>
            <option value="VIP Contact">VIP Contact</option>
            <option value="Member / Supporter">Member / Supporter</option>
            <option value="Volunteer / Staff">Volunteer / Staff</option>
          </select>
        </div>

        {/* Live Preview Table */}
        {parsedItems.length > 0 && (
          <div style={{ marginBottom: '16px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 12px' }}>#</th>
                  <th style={{ padding: '8px 12px' }}>Name</th>
                  <th style={{ padding: '8px 12px' }}>Mobile Number</th>
                  <th style={{ padding: '8px 12px' }}>Category</th>
                </tr>
              </thead>
              <tbody>
                {parsedItems.slice(0, 10).map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '8px 12px', color: '#0284c7', fontWeight: 600 }}>+91 {item.phone}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{defaultCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedItems.length > 10 && (
              <div style={{ padding: '8px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b', background: '#f8fafc' }}>
                ...and {parsedItems.length - 10} more contacts included
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 1 }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            style={{ flex: 2 }}
            disabled={isSubmitting || parsedItems.length === 0}
          >
            {isSubmitting ? (
              'Importing...'
            ) : (
              <>
                <Check size={16} />
                <span>Import {parsedItems.length} Contacts to Database</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
