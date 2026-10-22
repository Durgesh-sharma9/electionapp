import React, { useState, useEffect, useMemo } from 'react';
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
  ArrowLeft,
  Building2,
  Home,
  TrendingUp,
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
  onFilterBySubLocality,
  onBack,
  totalContacts = 0,
  onToast,
}) {
  const [activeTab, setActiveTab] = useState('wards'); // 'wards' | 'localities' | 'sublocalities'
  const [search, setSearch] = useState('');
  const [filterWardForLocality, setFilterWardForLocality] = useState('ALL');
  const [filterLocalityForSub, setFilterLocalityForSub] = useState('ALL');

  // Sub-Localities Detailed State (with voter analytics)
  const [subLocalities, setSubLocalities] = useState([]);
  const [loadingSubLocalities, setLoadingSubLocalities] = useState(false);

  // Sub-Locality Modal State
  const [isSubLocModalOpen, setIsSubLocModalOpen] = useState(false);
  const [subLocName, setSubLocName] = useState('');
  const [subLocLocality, setSubLocLocality] = useState('');
  const [subLocSubmitting, setSubLocSubmitting] = useState(false);
  const [subLocError, setSubLocError] = useState('');

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

  // Fetch detailed sub-localities
  const fetchSubLocalities = async () => {
    try {
      setLoadingSubLocalities(true);
      const res = await fetch('/api/sub-localities?detailed=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSubLocalities(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch sub-localities:', err);
    } finally {
      setLoadingSubLocalities(false);
    }
  };

  useEffect(() => {
    fetchSubLocalities();
  }, []);

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
    setLocWard(filterWardForLocality !== 'ALL' ? filterWardForLocality : '');
    setLocDescription('');
    setLocColor('#ea580c');
    setLocError('');
    setIsLocalityModalOpen(true);
  };

  const openEditLocalityModal = (loc) => {
    setEditingLocality(loc);
    setLocName(loc.name || '');
    setLocWard(loc.ward || '');
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
          ward: locWard ? locWard.trim() : '',
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

  // ----------------- SUB-LOCALITY HANDLERS & DATA -----------------
  const openAddSubLocModal = (defaultLoc = '') => {
    setSubLocName('');
    const initialLoc = defaultLoc || (filterLocalityForSub !== 'ALL' ? filterLocalityForSub : (localities[0]?.name || ''));
    setSubLocLocality(initialLoc);
    setSubLocError('');
    setIsSubLocModalOpen(true);
  };

  const handleSaveSubLocality = async (e) => {
    e.preventDefault();
    if (!subLocName.trim()) {
      setSubLocError('Please enter Apartment / Sub-Locality name');
      return;
    }
    if (!subLocLocality.trim()) {
      setSubLocError('Please select a Locality');
      return;
    }
    setSubLocSubmitting(true);
    setSubLocError('');
    try {
      const res = await fetch('/api/sub-localities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subLocName.trim(),
          locality: subLocLocality.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Apartment / Sub-Locality added! 🏢');
        setIsSubLocModalOpen(false);
        setSubLocName('');
        fetchSubLocalities();
        if (onRefreshLocalities) onRefreshLocalities();
      } else {
        setSubLocError(data.error || 'Failed to add sub-locality');
      }
    } catch (err) {
      setSubLocError(err.message || 'Error adding sub-locality');
    } finally {
      setSubLocSubmitting(false);
    }
  };

  const handleDeleteSubLocality = async (name, locality) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from ${locality}? (Contacts tagged with this will remain intact)`)) {
      return;
    }
    try {
      const res = await fetch('/api/sub-localities', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, locality }),
      });
      const data = await res.json();
      if (data.success) {
        if (onToast) onToast('Sub-locality removed 🗑️');
        fetchSubLocalities();
        if (onRefreshLocalities) onRefreshLocalities();
      } else {
        alert(data.error || 'Failed to remove sub-locality');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filteredSubLocalities = useMemo(() => {
    let list = subLocalities;
    if (filterLocalityForSub !== 'ALL') {
      const target = filterLocalityForSub.toLowerCase().trim();
      list = list.filter((s) => (s.locality || '').toLowerCase().trim() === target);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.locality && s.locality.toLowerCase().includes(q)) ||
          (s.ward && s.ward.toLowerCase().includes(q))
      );
    }
    return list;
  }, [subLocalities, filterLocalityForSub, search]);

  const subLocStats = useMemo(() => {
    const totalApartments = subLocalities.length;
    const totalVoters = subLocalities.reduce((sum, s) => sum + (s.voterCount || 0), 0);
    const totalSure = subLocalities.reduce((sum, s) => sum + (s.sureCount || 0), 0);
    const totalContacted = subLocalities.reduce((sum, s) => sum + (s.contactedCount || 0), 0);
    return { totalApartments, totalVoters, totalSure, totalContacted };
  }, [subLocalities]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header Bar: Title + 3 Tabs + Action Buttons */}
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
              Hierarchy & Analytics
            </span>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Wards 🏛️ → Localities 📍 → Sub-Localities & Apartments 🏢 (with voter analytics)
          </p>
        </div>

        {/* Tab Switcher & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                gap: '5px',
                background: '#ffffff',
                borderColor: '#cbd5e1',
                color: '#334155',
              }}
              title="Back to Contacts Directory"
            >
              <ArrowLeft size={14} />
              <span>Back to Contacts</span>
            </button>
          )}

          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('wards')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'wards' ? '#ffffff' : 'transparent',
                color: activeTab === 'wards' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: activeTab === 'wards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Landmark size={14} color={activeTab === 'wards' ? '#0284c7' : '#64748b'} />
              <span>Wards ({wards.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('localities')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'localities' ? '#ffffff' : 'transparent',
                color: activeTab === 'localities' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: activeTab === 'localities' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <MapPin size={14} color={activeTab === 'localities' ? '#ea580c' : '#64748b'} />
              <span>Localities ({localities.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sublocalities')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'sublocalities' ? '#ffffff' : 'transparent',
                color: activeTab === 'sublocalities' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: activeTab === 'sublocalities' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={14} color={activeTab === 'sublocalities' ? '#059669' : '#64748b'} />
              <span>Apartments / Sub-Localities ({subLocalities.length})</span>
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
              <span>Add Ward</span>
            </button>
          ) : activeTab === 'localities' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddLocalityModal}
              style={{ padding: '7px 14px', fontSize: '0.82rem', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Add Locality</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openAddSubLocModal()}
              style={{ padding: '7px 14px', fontSize: '0.82rem', gap: '6px', background: '#059669', borderColor: '#047857' }}
            >
              <Plus size={15} />
              <span>Add Apartment</span>
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
            placeholder={
              activeTab === 'wards'
                ? 'Search wards...'
                : activeTab === 'localities'
                ? 'Search localities, wards...'
                : 'Search apartments, sub-localities, wards...'
            }
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

        {activeTab === 'sublocalities' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>Filter by Locality:</span>
            <select
              className="input-field"
              value={filterLocalityForSub}
              onChange={(e) => setFilterLocalityForSub(e.target.value)}
              style={{ height: '34px', fontSize: '0.8rem', padding: '4px 10px', width: 'auto' }}
            >
              <option value="ALL">📍 All Localities</option>
              {localities.map((l) => (
                <option key={l._id || l.name} value={l.name}>
                  {l.name}
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
                <Plus size={14} /> Add Locality
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
                          🏛️ {loc.ward || 'General'}
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

                  {loc.subLocalities && loc.subLocalities.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                        🏢 Sub-Localities / Apartments ({loc.subLocalities.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {loc.subLocalities.map((sub, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.68rem',
                              background: '#f0f9ff',
                              color: '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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

      {/* ----------------- TAB 3: SUB-LOCALITIES / APARTMENTS LIST & ANALYTICS ----------------- */}
      {activeTab === 'sublocalities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Quick Summary Metrics Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
            }}
          >
            <div className="glass-panel" style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={13} color="#059669" />
                <span>Total Apartments</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {subLocStats.totalApartments}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={13} color="#0284c7" />
                <span>Mapped Voters</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                {subLocStats.totalVoters}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} color="#d97706" />
                <span>⭐ Sure Voters</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                {subLocStats.totalSure}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '12px 16px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} color="#10b981" />
                <span>Contacted</span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                {subLocStats.totalContacted}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {filteredSubLocalities.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
                <Building2 size={40} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>No Apartments / Sub-Localities Found</h4>
                <p style={{ margin: '4px 0 16px 0', fontSize: '0.82rem' }}>
                  Add apartments, towers or rows (e.g. Dream Avenue in Manglam Grand City)
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openAddSubLocModal()}
                  style={{ fontSize: '0.82rem', background: '#059669', borderColor: '#047857' }}
                >
                  <Plus size={14} /> + Add Apartment / Society
                </button>
              </div>
            ) : (
              filteredSubLocalities.map((item, idx) => {
                const percentContacted = item.contactCount > 0 ? Math.round((item.contactedCount / item.contactCount) * 100) : 0;
                return (
                  <div
                    key={`${item.locality}-${item.name}-${idx}`}
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
                      {/* Card Header: Icon, Name, Locality/Ward tags & Delete */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.name}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '0.70rem',
                                  fontWeight: 700,
                                  color: '#b45309',
                                  background: '#fef3c7',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #fde68a',
                                }}
                              >
                                📍 {item.locality}
                              </span>
                              {item.ward && (
                                <span
                                  style={{
                                    fontSize: '0.70rem',
                                    fontWeight: 700,
                                    color: '#0284c7',
                                    background: '#f0f9ff',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #bae6fd',
                                  }}
                                >
                                  🏛️ {item.ward}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubLocality(item.name, item.locality)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          title="Remove Sub-locality"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Analytics Metrics Box */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '4px',
                          background: '#f8fafc',
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                          marginTop: '10px',
                          textAlign: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>VOTERS</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>{item.voterCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>FAMILIES</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#334155' }}>{item.contactCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.64rem', color: '#b45309', fontWeight: 600 }}>⭐ SURE</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#d97706' }}>{item.sureCount}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.64rem', color: '#047857', fontWeight: 600 }}>DONE</div>
                          <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#059669' }}>{item.contactedCount}</div>
                        </div>
                      </div>

                      {/* Outreach Progress Bar */}
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', fontWeight: 600, marginBottom: '3px' }}>
                          <span>Outreach Progress</span>
                          <span style={{ color: percentContacted >= 50 ? '#059669' : '#d97706', fontWeight: 700 }}>
                            {percentContacted}% ({item.contactedCount}/{item.contactCount || 0})
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${percentContacted}%`,
                              height: '100%',
                              background: percentContacted >= 50 ? '#10b981' : '#f59e0b',
                              borderRadius: '3px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Filter Contacts */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onFilterBySubLocality) {
                            onFilterBySubLocality(item.name, item.locality);
                          } else if (onFilterByLocality) {
                            onFilterByLocality(item.locality);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#059669',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>View Voters in {item.name}</span>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
                  Assign to Ward (Optional)
                </label>
                <select
                  className="input-field"
                  value={locWard}
                  onChange={(e) => setLocWard(e.target.value)}
                >
                  <option value="">Select Ward (Optional)</option>
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

      {/* ----------------- MODAL 3: ADD SUB-LOCALITY / APARTMENT ----------------- */}
      {isSubLocModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSubLocModalOpen(false)}>
          <div className="glass-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Add Apartment / Sub-Locality
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: '#64748b' }}>
              Add a building, apartment, society, row or road under an area
            </p>

            {subLocError && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  color: '#b91c1c',
                  fontSize: '0.78rem',
                  marginBottom: '14px',
                }}
              >
                {subLocError}
              </div>
            )}

            <form onSubmit={handleSaveSubLocality} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#334155' }}>
                  Parent Locality / Area *
                </label>
                <select
                  className="input-field"
                  value={subLocLocality}
                  onChange={(e) => setSubLocLocality(e.target.value)}
                  required
                  style={{ height: '38px', fontSize: '0.84rem' }}
                >
                  <option value="">Select Area</option>
                  {localities.map((l) => (
                    <option key={l._id || l.name} value={l.name}>
                      📍 {l.name} {l.ward ? `(${l.ward})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, marginBottom: '5px', color: '#334155' }}>
                  Apartment / Sub-Locality / Row Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Dream Avenue, Block B, Tower 2, Row 4"
                  value={subLocName}
                  onChange={(e) => setSubLocName(e.target.value)}
                  required
                  style={{ height: '38px', fontSize: '0.84rem' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsSubLocModalOpen(false)}
                  disabled={subLocSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={subLocSubmitting}
                  style={{ background: '#059669', borderColor: '#047857' }}
                >
                  {subLocSubmitting ? 'Saving...' : 'Add Apartment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
