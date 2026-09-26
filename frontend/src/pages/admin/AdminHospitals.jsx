/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit3, Hospital, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const UAE_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

const EMPTY_FORM = {
  name: '', emirate: 'Dubai', totalBeds: '', availableBeds: '',
  icuBedsTotal: '', icuBedsAvailable: '', latitude: '', longitude: '',
  acceptsTrauma: true, active: true,
};

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p = 0) => {
    setLoading(true);
    apiClient.get(`/api/v1/resources/hospitals?page=${p}&size=10`)
      .then(({ data }) => { setHospitals(data.content); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/api/v1/resources/hospitals', {
        ...form,
        totalBeds: Number(form.totalBeds),
        availableBeds: Number(form.availableBeds),
        icuBedsTotal: Number(form.icuBedsTotal),
        icuBedsAvailable: Number(form.icuBedsAvailable),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });
      toast.success('Hospital created');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create hospital');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/v1/resources/hospitals/${id}`);
      toast.success('Hospital deleted');
      load(page);
    } catch {
      toast.error('Failed to delete hospital');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--ec-text)' }}>Hospital Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ec-text-muted)' }}>
            ADMIN only. Register, update and remove hospital records system-wide.
          </p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="ec-btn ec-btn-primary gap-2">
          <Plus size={16} /> Add Hospital
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
          className="p-6">
          <h2 className="font-bold mb-4 text-base" style={{ color: 'var(--ec-text)' }}>New Hospital</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>HOSPITAL NAME</label>
              <input className="ec-input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dubai Hospital" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>EMIRATE</label>
              <select className="ec-input" value={form.emirate} onChange={e => set('emirate', e.target.value)}>
                {UAE_EMIRATES.map(em => <option key={em}>{em}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>TOTAL BEDS</label>
              <input className="ec-input" type="number" min="0" required value={form.totalBeds} onChange={e => set('totalBeds', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>AVAILABLE BEDS</label>
              <input className="ec-input" type="number" min="0" required value={form.availableBeds} onChange={e => set('availableBeds', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>TOTAL ICU BEDS</label>
              <input className="ec-input" type="number" min="0" value={form.icuBedsTotal} onChange={e => set('icuBedsTotal', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>AVAILABLE ICU BEDS</label>
              <input className="ec-input" type="number" min="0" value={form.icuBedsAvailable} onChange={e => set('icuBedsAvailable', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>LATITUDE</label>
              <input className="ec-input" type="number" step="any" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="e.g. 25.2048" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>LONGITUDE</label>
              <input className="ec-input" type="number" step="any" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="e.g. 55.2708" />
            </div>
            <div className="sm:col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ec-text)' }}>
                <input type="checkbox" checked={form.acceptsTrauma} onChange={e => set('acceptsTrauma', e.target.checked)} />
                Accepts Trauma Cases
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--ec-text)' }}>
                <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
                Active
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="ec-btn" style={{ color: 'var(--ec-text-muted)' }}>Cancel</button>
              <button type="submit" disabled={saving} className="ec-btn ec-btn-primary">
                {saving ? 'Saving...' : 'Create Hospital'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
        className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--ec-text-muted)' }}>Loading...</div>
        ) : hospitals.length === 0 ? (
          <div className="p-8 text-center">
            <Hospital size={32} style={{ color: 'var(--ec-text-muted)' }} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>No hospitals registered yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ec-border)', background: 'var(--ec-bg-elevated)' }}>
                  {['Hospital', 'Emirate', 'Beds (Avail/Total)', 'ICU', 'Trauma', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                      style={{ color: 'var(--ec-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hospitals.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--ec-border)' }}
                    className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--ec-text)' }}>{h.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--ec-text-muted)' }}>{h.emirate}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold" style={{ color: 'var(--ec-green)' }}>{h.availableBeds}</span>
                      <span style={{ color: 'var(--ec-text-muted)' }}> / {h.totalBeds}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--ec-text-muted)' }}>
                      {h.icuBedsAvailable}/{h.icuBedsTotal}
                    </td>
                    <td className="px-4 py-3">
                      {h.acceptsTrauma
                        ? <CheckCircle size={16} style={{ color: 'var(--ec-green)' }} />
                        : <XCircle size={16} style={{ color: 'var(--ec-red)' }} />}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: h.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: h.active ? 'var(--ec-green)' : 'var(--ec-red)',
                        }}>
                        {h.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(h.id, h.name)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: 'var(--ec-text-muted)' }}
                        title="Delete hospital">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: page === i ? 'var(--ec-orange)' : 'var(--ec-bg-elevated)',
                  color: page === i ? 'white' : 'var(--ec-text)',
                }}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
