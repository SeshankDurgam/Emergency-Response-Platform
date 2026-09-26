/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Building2, Package, MapPin, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { resourcesApi } from '../api/resources';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EMIRATES = ['', 'Abu Dhabi', 'Al Ain', 'Dubai', 'Sharjah', 'Ajman', 'UAQ', 'RAK', 'Fujairah'];
const UNIT_STATUSES = ['', 'AVAILABLE', 'DISPATCHED', 'MAINTENANCE', 'OFF_DUTY'];
const UNIT_TYPES = ['', 'AMBULANCE', 'FIRE_TRUCK', 'POLICE', 'HAZMAT', 'RESCUE', 'HELICOPTER'];

const tabs = [
  { id: 'units', label: 'Emergency Units', icon: Truck },
  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
  { id: 'medical', label: 'Medical Resources', icon: Package },
];

function UnitsTab() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ status: '', emirate: '', type: '', page: 0 });
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['units', filters],
    queryFn: () => resourcesApi.listUnits({ ...filters, size: 15 }).then(r => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => resourcesApi.updateUnitStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['units'] }); toast.success('Unit status updated'); },
    onError: err => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const units = data?.content || [];
  const filtered = search ? units.filter(u => u.callSign?.toLowerCase().includes(search.toLowerCase()) || u.type?.toLowerCase().includes(search.toLowerCase())) : units;

  return (
    <div className="space-y-4">
      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px' }}
        className="p-4 flex flex-wrap gap-3 items-center">
        <div className="ec-search-wrapper flex-1 min-w-40">
          <span className="ec-search-icon"><Search size={14} /></span>
          <input className="ec-input" placeholder="Search units..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ec-select w-36" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 0 }))}>
          {UNIT_STATUSES.map((s, i) => <option key={i} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select className="ec-select w-36" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value, page: 0 }))}>
          {UNIT_TYPES.map((t, i) => <option key={i} value={t}>{t || 'All Types'}</option>)}
        </select>
        <select className="ec-select w-36" value={filters.emirate} onChange={e => setFilters(f => ({ ...f, emirate: e.target.value, page: 0 }))}>
          {EMIRATES.map((e, i) => <option key={i} value={e}>{e || 'All Emirates'}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner text="Loading units…" /> : (
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px', overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Emirate</th>
                  <th>Location (GPS)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(unit => (
                  <tr key={unit.id}>
                    <td>
                      <div className="font-semibold text-slate-900 text-sm">{unit.callSign || `Unit ${unit.id?.slice(0,8)}`}</div>
                      <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{unit.id?.slice(0,12)}…</div>
                    </td>
                    <td>
                      <span style={{ background: 'var(--ec-bg-elevated)', color: 'var(--ec-text-muted)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {unit.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td><StatusBadge status={unit.status} /></td>
                    <td><span className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>{unit.emirate || 'N/A'}</span></td>
                    <td>
                      {unit.currentLatitude ? (
                        <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ec-text-muted)' }}>
                          <MapPin size={10} />
                          {Number(unit.currentLatitude).toFixed(4)}, {Number(unit.currentLongitude).toFixed(4)}
                        </span>
                        ) : <span style={{ color: 'var(--ec-text-muted)', fontSize: '0.75rem' }}>No GPS</span>}
                    </td>
                    <td>
                      <select value={unit.status} onChange={e => statusMutation.mutate({ id: unit.id, status: e.target.value })}
                        className="ec-select text-xs py-1 w-36">
                        {UNIT_STATUSES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10" style={{ color: 'var(--ec-text-muted)' }}>No units found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {(data?.totalPages || 0) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--ec-border)' }}>
              <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>Page {filters.page + 1} of {data.totalPages}</span>
              <div className="flex gap-2">
                <button disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  className="ec-btn ec-btn-ghost px-2 py-1.5" style={{ opacity: filters.page === 0 ? 0.4 : 1 }}>
                  <ChevronLeft size={14} />
                </button>
                <button disabled={filters.page >= data.totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  className="ec-btn ec-btn-ghost px-2 py-1.5" style={{ opacity: filters.page >= data.totalPages - 1 ? 0.4 : 1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HospitalsTab() {
  const [emirate, setEmirate] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['hospitals', emirate],
    queryFn: () => resourcesApi.listHospitals({ emirate, size: 30 }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...form }) => resourcesApi.updateHospitalCapacity(id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hospitals'] }); toast.success('Capacity updated'); setEditId(null); },
    onError: () => toast.error('Update failed'),
  });

  const hospitals = data?.content || [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select className="ec-select w-44" value={emirate} onChange={e => setEmirate(e.target.value)}>
          {EMIRATES.map((e, i) => <option key={i} value={e}>{e || 'All Emirates'}</option>)}
        </select>
      </div>
      {isLoading ? <LoadingSpinner text="Loading hospitals…" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map(h => (
            <motion.div key={h.id} whileHover={{ y: -2 }}
              style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
              className="p-5 card-glow">
              <div className="flex items-start gap-3 mb-3">
                <div style={{ background: 'rgba(59,130,246,0.15)', borderRadius: '10px', width: 40, height: 40 }}
                  className="flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} style={{ color: '#3b82f6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm truncate">{h.name}</div>
                  <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--ec-text-muted)' }}>
                    <MapPin size={10} />{h.emirate}
                  </div>
                </div>
              </div>
              {editId === h.id ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>Available Beds</label>
                    <input className="ec-input mt-1" type="number" value={editForm.availableBeds}
                      onChange={e => setEditForm(f => ({ ...f, availableBeds: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>ICU Beds Available</label>
                    <input className="ec-input mt-1" type="number" value={editForm.icuBedsAvailable}
                      onChange={e => setEditForm(f => ({ ...f, icuBedsAvailable: Number(e.target.value) }))} />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditId(null)} className="ec-btn ec-btn-ghost flex-1 justify-center text-xs py-2">Cancel</button>
                    <button onClick={() => updateMutation.mutate({ id: h.id, ...editForm })}
                      className="ec-btn ec-btn-primary flex-1 justify-center text-xs py-2">Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'Total Beds', value: h.totalBeds, color: '#3b82f6' },
                      { label: 'Available', value: h.availableBeds, color: '#22c55e' },
                      { label: 'ICU Total', value: h.icuBeds, color: '#8b5cf6' },
                      { label: 'ICU Avail.', value: h.icuBedsAvailable, color: '#22c55e' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: 'var(--ec-bg-elevated)', borderRadius: '8px' }} className="p-2 text-center">
                        <div className="text-lg font-black" style={{ color }}>{ value ?? 'N/A'}</div>
                        <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setEditId(h.id); setEditForm({ availableBeds: h.availableBeds, icuBedsAvailable: h.icuBedsAvailable }); }}
                    className="ec-btn ec-btn-ghost w-full justify-center text-xs py-2">
                    <RefreshCw size={12} /> Update Capacity
                  </button>
                </>
              )}
            </motion.div>
          ))}
          {hospitals.length === 0 && (
            <div className="col-span-3 text-center py-12" style={{ color: 'var(--ec-text-muted)' }}>No hospitals found</div>
          )}
        </div>
      )}
    </div>
  );
}

function MedicalTab() {
  const [hospitalId, setHospitalId] = useState('');
  const qc = useQueryClient();

  const { data: hospitals } = useQuery({
    queryKey: ['hospitals-list'],
    queryFn: () => resourcesApi.listHospitals({ size: 100 }).then(r => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['medical', hospitalId],
    queryFn: () => resourcesApi.listMedicalResources({ hospitalId, size: 30 }).then(r => r.data),
  });

  const releaseMutation = useMutation({
    mutationFn: (id) => resourcesApi.releaseMedicalResource(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medical'] }); toast.success('Resource released'); },
  });

  const resources = data?.content || [];

  return (
    <div className="space-y-4">
      <select className="ec-select w-64" value={hospitalId} onChange={e => setHospitalId(e.target.value)}>
        <option value="">All Hospitals</option>
        {hospitals?.content?.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
      </select>

      {isLoading ? <LoadingSpinner text="Loading resources…" /> : (
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px', overflow: 'hidden' }}>
          <table className="ec-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned Incident</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td><div className="font-semibold text-slate-900 text-sm">{r.name || r.id?.slice(0,8)}</div></td>
                  <td><span style={{ background: 'var(--ec-bg-elevated)', color: 'var(--ec-text-muted)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>{r.type}</span></td>
                  <td><StatusBadge status={r.available ? 'AVAILABLE' : 'DISPATCHED'} /></td>
                  <td><span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{r.currentIncidentId ? r.currentIncidentId.slice(0,8) + '...' : 'None'}</span></td>
                  <td>
                    {!r.available && (
                      <button onClick={() => releaseMutation.mutate(r.id)} className="ec-btn ec-btn-ghost text-xs px-3 py-1.5">
                        Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10" style={{ color: 'var(--ec-text-muted)' }}>No medical resources found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState('units');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Resources</h1>
        <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.875rem' }}>Manage emergency units, hospitals, and medical resources</p>
      </div>

      {}
      <div className="flex gap-1" style={{ background: 'var(--ec-bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--ec-border)', width: 'fit-content' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === id ? 'var(--ec-orange)' : 'transparent',
              color: activeTab === id ? 'white' : 'var(--ec-text-muted)',
            }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {activeTab === 'units' && <UnitsTab />}
          {activeTab === 'hospitals' && <HospitalsTab />}
          {activeTab === 'medical' && <MedicalTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
