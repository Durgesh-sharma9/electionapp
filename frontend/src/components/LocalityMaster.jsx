import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  Check,
  AlertCircle,
  ExternalLink,
  Target,
  Sparkles,
  Star,
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
  wards = [],
  onRefreshWards,
  localities = [],
  onRefreshLocalities,
  onFilterByLocality,
  totalContacts = 0,
  onToast,
}) {
  const [activeTab, setActiveTab] = useState('wards'); // 'wards' | 'localities'
  const [search, setSearch] = useState('');
  const [filterWardForLocality, setFilterWardForLocality] = useState('ALL');

  // Ward Modal State
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState(null);
  const [wardName, setWardName] = useState('');
  const [wardDescription, setWardDescription] = useState('');
  const [wardTarget, setWardTarget] = useState(0);
  const [wardSubmitting, setWardSubmitting] = useState(false);
  const [wardError, setWardError] = useState('');

  // Locality Modal State
  const [isLocalityModalOpen, setIsLocalityModalOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState(null);
  const [locName, setLocName] = useState('');
  const [locWard, setLocWard] = useState('');
  const [locDescription, setLocDescription] = useState('');
  const [locColor, setLocColor] = useState('#0284c7');
  const [locSubmitting, setLocSubmitting] = useState(false);
  const [locError, setLocError] = useState('');

  // ----------------- WARD HANDLERS -----------------
  const openAddWardModal = () => {
    setEditingWard(null);
    setWardName('');
    setWardDescription('');
    setWardTarget(0);
    setWardError('');
    setIsWardModalOpen(true);
  };

  const openEditWardModal = (w) => {
    setEditingWard(w);
    setWardName(w.name || '');
    setWardDescription(w.description || '');
    setWardTarget(w.targetVoters || 0);
    setWardError('');
    setIsWardModalOpen(true);
  };

  const handleSaveWard = async (e) => {
    e.preventDefault();
    if (!wardName.trim()) {
      setWardError('Please enter ward name/number');
      return;
    }
    setWardSubmitting(true);
    setWardError('');
    try {
      const isEdit = Boolean(editingWard && editingWard._id);
      const url = isEdit ? `/api/wards/${editingWard._id}` : '/api/wards';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wardName.trim(),
          description: wardDescription.trim(),
          targetVoters: Number(wardTarget) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onToast) onToast(isEdit ? 'Ward updated! ✅' : 'Ward created! 🏛️');
        setIsWardModalOpen(false);
        if (onRefreshWards) onRefreshWards();
        if (onRefreshLocalities) onRefreshLocalities();
      } else {
        setWardError(data.error || 'Failed to save ward');
      }
    } catch (err) {
      setWardError(err.message || 'Error saving ward');
    } finally {
      setWardSubmitting(false);
    }
  };

  const handleDeleteWard = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? Localities in this ward will not be deleted.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/wards/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Ward deleted');
        if (onRefreshWards) onRefreshWards();
      } else {
        alert(data.error || 'Failed to delete ward');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // ----------------- LOCALITY HANDLERS -----------------
  const openAddLocalityModal = () => {
    setEditingLocality(null);
    setLocName('');
    setLocWard(filterWardForLocality !== 'ALL' ? filterWardForLocality : wards[0]?.name || 'Ward 1');
    setLocDescription('');
    setLocColor('#ea580c');
    setLocError('');
    setIsLocalityModalOpen(true);
  };

  const openEditLocalityModal = (loc) => {
    setEditingLocality(loc);
    setLocName(loc.name || '');
    setLocWard(loc.ward || wards[0]?.name || 'Ward 1');
    setLocDescription(loc.description || '');
    setLocColor(loc.color || '#0284c7');
    setLocError('');
    setIsLocalityModalOpen(true);
  };

  const handleSaveLocality = async (e) => {
    e.preventDefault();
    if (!locName.trim()) {
      setLocError('Please enter locality name');
      return;
    }
    setLocSubmitting(true);
    setLocError('');
    try {
      const isEdit = Boolean(editingLocality && editingLocality._id);
      const url = isEdit ? `/api/localities/${editingLocality._id}` : '/api/localities';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: locName.trim(),
          ward: locWard.trim() || 'Ward 1',
          description: locDescription.trim(),
          color: locColor,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (onToast) onToast(isEdit ? 'Locality updated! ✅' : 'Locality created! 📍');
        setIsLocalityModalOpen(false);
        if (onRefreshLocalities) onRefreshLocalities();
        if (onRefreshWards) onRefreshWards();
      } else {
        setLocError(data.error || 'Failed to save locality');
      }
    } catch (err) {
      setLocError(err.message || 'Error saving locality');
    } finally {
      setLocSubmitting(false);
    }
  };

  const handleDeleteLocality = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Contacts tagged with this locality will remain intact.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/localities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Locality removed');
        if (onRefreshLocalities) onRefreshLocalities();
        if (onRefreshWards) onRefreshWards();
      } else {
        alert(data.error || 'Failed to delete locality');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // ----------------- FILTERED DATA -----------------
  const filteredWards = useMemo(() => {
    if (!search.trim()) return wards;
    const q = search.toLowerCase().trim();
    return wards.filter(
      (w) =>
        (w.name && w.name.toLowerCase().includes(q)) ||
        (w.description && w.description.toLowerCase().includes(q))
    );
  }, [wards, search]);

  const filteredLocalities = useMemo(() => {
    let list = localities;
    if (filterWardForLocality !== 'ALL') {
      const target = filterWardForLocality.toLowerCase().trim();
      list = list.filter((l) => (l.ward || '').toLowerCase().trim() === target);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.ward && l.ward.toLowerCase().includes(q)) ||
          (l.description && l.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [localities, filterWardForLocality, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header Bar: Title + Sub-Tabs + Action Buttons */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Ward & Locality Master
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Hierarchy Management
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Manage Wards first, then assign Localities / Areas to their specific Ward
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('wards')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'wards' ? '#ffffff' : 'transparent',
                color: activeTab === 'wards' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'wards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Landmark size={15} color={activeTab === 'wards' ? '#0284c7' : '#64748b'} />
              <span>Wards ({wards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('localities')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'localities' ? '#ffffff' : 'transparent',
                color: activeTab === 'localities' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'localities' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <MapPin size={15} color={activeTab === 'localities' ? '#ea580c' : '#64748b'} />
              <span>Localities ({localities.length})</span>
            </button>
          </div>

          {/* Action Button */}
          {activeTab === 'wards' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddWardModal}
              style={{ padding: '7px 14px', fontSize: '0.82rem', gap: '6px' }}
            >
              <Plus size={15} />
              <span>+ Add Ward</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddLocalityModal}
              style={{ padding: '7px 14px', fontSize: '0.82rem', gap: '6px' }}
            >
              <Plus size={15} />
              <span>+ Add Locality</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '400px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            className="input-field"
            placeholder={activeTab === 'wards' ? 'Search wards...' : 'Search localities, wards...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem', width: '100%' }}
          />
        </div>

        {activeTab === 'localities' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Filter by Ward:</span>
            <select
              className="input-field"
              value={filterWardForLocality}
              onChange={(e) => setFilterWardForLocality(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem', padding: '4px 10px', width: 'auto' }}
            >
              <option value="ALL">🏛️ All Wards</option>
              {wards.map((w) => (
                <option key={w._id || w.name} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ----------------- TAB 1: WARDS LIST ----------------- */}
      {activeTab === 'wards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredWards.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
              <Landmark size={40} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>No Wards Found</h4>
              <p style={{ margin: '4px 0 16px 0', fontSize: '0.82rem' }}>Create a ward to group localities and voters</p>
              <button type="button" className="btn btn-primary" onClick={openAddWardModal} style={{ fontSize: '0.82rem' }}>
                <Plus size={14} /> + Create First Ward
              </button>
            </div>
          ) : (
            filteredWards.map((w) => (
              <div
                key={w._id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                        }}
                      >
                        <Landmark size={16} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                        {w.name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => openEditWardModal(w)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Edit Ward"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWard(w._id, w.name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Ward"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {w.description && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      {w.description}
                    </p>
                  )}

                  {/* Ward Stats Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Areas</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0284c7' }}>
                        {w.localityCount || 0}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Voters</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                        {w.contactCount || 0}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 600 }}>⭐ Sure</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#d97706' }}>
                        {w.sureCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterWardForLocality(w.name);
                      setActiveTab('localities');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>View Areas in {w.name}</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------- TAB 2: LOCALITIES LIST ----------------- */}
      {activeTab === 'localities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredLocalities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
              <MapPin size={40} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>No Localities Found</h4>
              <p style={{ margin: '4px 0 16px 0', fontSize: '0.82rem' }}>Add a locality under a specific ward</p>
              <button type="button" className="btn btn-primary" onClick={openAddLocalityModal} style={{ fontSize: '0.82rem' }}>
                <Plus size={14} /> + Add Locality
              </button>
            </div>
          ) : (
            filteredLocalities.map((loc) => (
              <div
                key={loc._id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: `${loc.color || '#ea580c'}15`,
                          color: loc.color || '#ea580c',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                          {loc.name}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#0284c7',
                            background: '#f0f9ff',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          🏛️ {loc.ward || 'Ward 1'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => openEditLocalityModal(loc)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Edit Locality"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocality(loc._id, loc.name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Delete Locality"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {loc.description && (
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                      {loc.description}
                    </p>
                  )}

                  {/* Locality Contact Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                    <Users size={14} color="#64748b" />
                    <span>{loc.contactCount || 0} Voters Tagged</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                  {onFilterByLocality && (
                    <button
                      type="button"
                      onClick={() => onFilterByLocality(loc.name)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ea580c',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Filter in Contacts List</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ----------------- MODAL 1: ADD/EDIT WARD ----------------- */}
      {isWardModalOpen && (
        <div className="modal-overlay" onClick={() => setIsWardModalOpen(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              {editingWard ? 'Edit Ward' : 'Create New Ward'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: '#64748b' }}>
              Define ward number / name and target voters
            </p>

            {wardError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {wardError}
              </div>
            )}

            <form onSubmit={handleSaveWard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Ward Name / Number *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ward 1, Ward 2..."
                  value={wardName}
                  onChange={(e) => setWardName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description / Landmark (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Near Community Center, Mahima area..."
                  value={wardDescription}
                  onChange={(e) => setWardDescription(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Target Voters Goal (Optional)
                </label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 500"
                  value={wardTarget || ''}
                  onChange={(e) => setWardTarget(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsWardModalOpen(false)}
                  style={{ flex: 1, padding: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={wardSubmitting}
                  style={{ flex: 1, padding: '8px' }}
                >
                  {wardSubmitting ? 'Saving...' : editingWard ? 'Update Ward' : 'Save Ward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL 2: ADD/EDIT LOCALITY ----------------- */}
      {isLocalityModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLocalityModalOpen(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '100%' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              {editingLocality ? 'Edit Locality' : 'Create New Locality'}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: '#64748b' }}>
              Assign area to a specific Ward
            </p>

            {locError && (
              <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {locError}
              </div>
            )}

            <form onSubmit={handleSaveLocality} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Assign to Ward *
                </label>
                <select
                  className="input-field"
                  value={locWard}
                  onChange={(e) => setLocWard(e.target.value)}
                  required
                >
                  {wards.map((w) => (
                    <option key={w._id || w.name} value={w.name}>
                      🏛️ {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Locality / Area Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Mahima, Shanti Nagar, Main Market..."
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description / Details (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Gate 1 to Gate 3..."
                  value={locDescription}
                  onChange={(e) => setLocDescription(e.target.value)}
                />
              </div>

              {/* Color Tag Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Color Badge
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => setLocColor(c)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: c,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        border: locColor === c ? '2px solid #0f172a' : '2px solid transparent',
                        transform: locColor === c ? 'scale(1.15)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {locColor === c && <Check size={14} />}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsLocalityModalOpen(false)}
                  style={{ flex: 1, padding: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={locSubmitting}
                  style={{ flex: 1, padding: '8px' }}
                >
                  {locSubmitting ? 'Saving...' : editingLocality ? 'Update Locality' : 'Save Locality'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
