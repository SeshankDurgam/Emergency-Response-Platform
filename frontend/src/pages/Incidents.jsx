/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertTriangle, X, MapPin, ChevronLeft, ChevronRight, Radio } from 'lucide-react';
import { incidentsApi } from '../api/incidents';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import useWebSocket from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

const EMIRATES = ['', 'Abu Dhabi', 'Al Ain', 'Dubai', 'Sharjah', 'Ajman', 'UAQ', 'RAK', 'Fujairah'];
const SEVERITIES = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'];
const TYPES = ['FIRE', 'MEDICAL', 'ACCIDENT', 'FLOOD', 'HAZMAT', 'SECURITY', 'EARTHQUAKE', 'OTHER'];

function CreateModal({ onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', type: 'FIRE', severity: 'MEDIUM',
    emirate: 'Dubai', locationAddress: '', locationLatitude: '', locationLongitude: '',
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: (data) => incidentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['active-incidents'] });
      qc.invalidateQueries({ queryKey: ['incident-dashboard'] });
      toast.success('Incident created');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create incident'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      locationLatitude: form.locationLatitude ? parseFloat(form.locationLatitude) : null,
      locationLongitude: form.locationLongitude ? parseFloat(form.locationLongitude) : null,
    };
    mutation.mutate(payload);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '20px', width: '100%', maxWidth: 560 }}
        className="overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--ec-border)' }}>
          <div>
            <h2 className="text-lg font-black text-slate-900">Report Incident</h2>
            <p className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>Submit a new emergency incident</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--ec-text-muted)' }} className="p-1.5 rounded-lg hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>TITLE *</label>
            <input className="ec-input" placeholder="Brief incident title" required value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>DESCRIPTION</label>
            <textarea className="ec-input resize-none" rows={3} placeholder="Describe the incident…" value={form.description} onChange={set('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>TYPE *</label>
              <select className="ec-select" required value={form.type} onChange={set('type')}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>SEVERITY *</label>
              <select className="ec-select" required value={form.severity} onChange={set('severity')}>
                {SEVERITIES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>EMIRATE *</label>
              <select className="ec-select" required value={form.emirate} onChange={set('emirate')}>
                {EMIRATES.slice(1).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>ADDRESS</label>
              <input className="ec-input" placeholder="Street / area" value={form.locationAddress} onChange={set('locationAddress')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>LATITUDE</label>
              <input className="ec-input" type="number" step="any" placeholder="24.466667" value={form.locationLatitude} onChange={set('locationLatitude')} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>LONGITUDE</label>
              <input className="ec-input" type="number" step="any" placeholder="54.366669" value={form.locationLongitude} onChange={set('locationLongitude')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="ec-btn ec-btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="ec-btn ec-btn-primary flex-1 justify-center"
              style={{ opacity: mutation.isPending ? 0.7 : 1 }}>
              {mutation.isPending ? 'Reporting…' : 'Report Incident'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function Incidents() {
  const [filters, setFilters] = useState({ status: '', severity: '', emirate: '', page: 0 });
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const queryClient = useQueryClient();

  const setF = k => v => setFilters(f => ({ ...f, [k]: v, page: 0 }));

  // WebSocket — auto-refresh when new incident arrives
  const handleWsEvent = useCallback((data) => {
    if (data.eventType === 'INCIDENT_CREATED') {
      setNewCount(c => c + 1);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast('🚨 New incident reported!', { icon: '🔴' });
    }
    if (data.eventType === 'INCIDENT_UPDATED') {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    }
  }, [queryClient]);

  useWebSocket(handleWsEvent, true);

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => incidentsApi.list({ ...filters, size: 15 }).then(r => r.data),
    keepPreviousData: true,
  });

  const incidents = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const filtered = search
    ? incidents.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.emirate?.toLowerCase().includes(search.toLowerCase()) ||
        i.type?.toLowerCase().includes(search.toLowerCase()))
    : incidents;

  return (
    <div className="space-y-5">
      {}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">Incidents</h1>
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
              <Radio size={11} />
              <span>Live</span>
            </div>
            {newCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: '#ef4444', color: 'white' }}>
                +{newCount} new
              </span>
            )}
          </div>
          <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.875rem' }}>
            {data?.totalElements ?? 0} total incidents
          </p>
        </div>
        <button onClick={() => { setShowCreate(true); setNewCount(0); }} className="ec-btn ec-btn-primary">
          <Plus size={15} /> Report Incident
        </button>
      </div>

      {}
      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px' }}
        className="p-4 flex flex-wrap gap-3 items-center">
        <div className="ec-search-wrapper flex-1 min-w-48">
          <span className="ec-search-icon"><Search size={15} /></span>
          <input className="ec-input" placeholder="Search incidents..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ec-select w-36" value={filters.status} onChange={e => setF('status')(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="ec-select w-36" value={filters.severity} onChange={e => setF('severity')(e.target.value)}>
          <option value="">All Severity</option>
          {SEVERITIES.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="ec-select w-36" value={filters.emirate} onChange={e => setF('emirate')(e.target.value)}>
          {EMIRATES.map((e, i) => <option key={i} value={e}>{e || 'All Emirates'}</option>)}
        </select>
        {(filters.status || filters.severity || filters.emirate) && (
          <button onClick={() => setFilters({ status: '', severity: '', emirate: '', page: 0 })}
            className="ec-btn ec-btn-ghost text-sm px-3 py-2">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? (
          <LoadingSpinner text="Loading incidents…" />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle size={40} className="mx-auto mb-3" style={{ color: 'var(--ec-text-muted)' }} />
            <p className="font-semibold text-slate-900">No incidents found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--ec-text-muted)' }}>Adjust filters or report a new incident</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Reported</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => (
                  <motion.tr key={inc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="font-semibold text-slate-900 text-sm">{inc.title}</div>
                      {inc.description && (
                        <div className="text-xs mt-0.5 truncate max-w-xs" style={{ color: 'var(--ec-text-muted)' }}>
                          {inc.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ background: 'var(--ec-bg-elevated)', color: 'var(--ec-text-muted)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {inc.type}
                      </span>
                    </td>
                    <td><SeverityBadge severity={inc.severity} /></td>
                    <td><StatusBadge status={inc.status} /></td>
                    <td>
                        {inc.emirate ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                          <MapPin size={11} />{inc.emirate}
                          {inc.locationAddress && ` , ${inc.locationAddress}`}
                        </span>
                      ) : <span style={{ color: 'var(--ec-text-muted)', fontSize: '0.75rem' }}>No location</span>}
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                        {inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/incidents/${inc.id}`} className="ec-btn ec-btn-ghost text-xs px-3 py-1.5">
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--ec-border)' }}>
            <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              Page {filters.page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={filters.page === 0} className="ec-btn ec-btn-ghost px-2 py-1.5 text-xs"
                style={{ opacity: filters.page === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={filters.page >= totalPages - 1} className="ec-btn ec-btn-ghost px-2 py-1.5 text-xs"
                style={{ opacity: filters.page >= totalPages - 1 ? 0.4 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
