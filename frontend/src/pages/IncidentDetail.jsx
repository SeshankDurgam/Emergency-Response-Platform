/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, User, Zap, X, AlertTriangle, CheckCircle, XCircle, History } from 'lucide-react';
import { incidentsApi } from '../api/incidents';
import { dispatchApi } from '../api/dispatch';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function UpdateStatusModal({ incident, onClose }) {
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');

  const validTransitions = {
    OPEN: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  };
  const options = validTransitions[incident.status] || [];

  const mutation = useMutation({
    mutationFn: () => incidentsApi.updateStatus(incident.id, { newStatus, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incident', incident.id] });
      qc.invalidateQueries({ queryKey: ['incident-dashboard'] });
      toast.success(`Status updated to ${newStatus}`);
      onClose();
    },
    onError: err => toast.error(err.response?.data?.message || 'Update failed'),
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', width: '100%', maxWidth: 400 }}
        className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-slate-900">Update Status</h3>
          <button onClick={onClose} style={{ color: 'var(--ec-text-muted)' }}><X size={18} /></button>
        </div>
        {options.length === 0 ? (
          <p style={{ color: 'var(--ec-text-muted)' }}>No status transitions available for <strong>{incident.status}</strong>.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>NEW STATUS</label>
              <div className="flex gap-2 flex-wrap">
                {options.map(s => (
                  <button key={s} type="button" onClick={() => setNewStatus(s)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      background: newStatus === s ? 'rgba(249,115,22,0.15)' : 'var(--ec-bg-elevated)',
                      borderColor: newStatus === s ? 'var(--ec-orange)' : 'var(--ec-border)',
                      color: newStatus === s ? 'var(--ec-orange)' : 'var(--ec-text)',
                    }}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ec-text-muted)' }}>REASON (optional)</label>
              <input className="ec-input" placeholder="Reason for status change…" value={reason}
                onChange={e => setReason(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="ec-btn ec-btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => mutation.mutate()} disabled={!newStatus || mutation.isPending}
                className="ec-btn ec-btn-primary flex-1 justify-center"
                style={{ opacity: !newStatus ? 0.5 : 1 }}>
                {mutation.isPending ? 'Updating…' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DispatchPanel({ incident }) {
  const [topN, setTopN] = useState(3);
  const qc = useQueryClient();

  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['dispatch-recommend', incident.id],
    queryFn: () => dispatchApi.recommend({
      incidentId: incident.id,
      incidentLat: incident.locationLatitude,
      incidentLon: incident.locationLongitude,
      severity: incident.severity,
      emirate: incident.emirate,
      topN,
    }).then(r => r.data),
    enabled: !!(incident.locationLatitude && incident.locationLongitude),
  });

  const assignMutation = useMutation({
    mutationFn: ({ unitId }) => dispatchApi.assign({ incidentId: incident.id, unitId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incident', incident.id] });
      toast.success('Unit dispatched successfully!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Dispatch failed'),
  });

  if (!incident.locationLatitude || !incident.locationLongitude) {
    return (
      <div style={{ background: 'var(--ec-bg-elevated)', borderRadius: '12px' }} className="p-4 text-center">
        <MapPin size={24} className="mx-auto mb-2" style={{ color: 'var(--ec-text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>No GPS coordinates. Dispatch unavailable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>Smart recommendations based on proximity &amp; severity</p>
        <div className="flex items-center gap-2">
          <label className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>Top</label>
          <select className="ec-select w-16 text-xs py-1" value={topN} onChange={e => setTopN(Number(e.target.value))}>
            {[3,5,10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button onClick={() => refetch()} className="ec-btn ec-btn-ghost text-xs px-3 py-1.5">Refresh</button>
        </div>
      </div>

      {isLoading && <LoadingSpinner text="Computing recommendations…" />}

      {recommendations?.map((rec, i) => (
        <motion.div key={rec.unit?.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: '12px' }}
          className="p-4">
          <div className="flex items-start gap-3">
            <div style={{ background: i === 0 ? 'rgba(249,115,22,0.2)' : 'var(--ec-bg-card)', borderRadius: '10px',
              width: 36, height: 36, border: `1px solid ${i === 0 ? 'var(--ec-orange)' : 'var(--ec-border)'}` }}
              className="flex items-center justify-center text-sm font-black flex-shrink-0">
              <span style={{ color: i === 0 ? 'var(--ec-orange)' : 'var(--ec-text-muted)' }}>#{rec.rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">{rec.unit?.callSign || `Unit ${rec.unit?.id?.slice(0,8)}`}</span>
                <span style={{ background: 'var(--ec-bg-card)', color: 'var(--ec-text-muted)', borderRadius: '4px', padding: '1px 6px', fontSize: '0.7rem' }}>
                  {rec.unit?.type}
                </span>
                {i === 0 && <span style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--ec-orange)', borderRadius: '4px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 700 }}>BEST MATCH</span>}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                <span><MapPin size={11} style={{ display: 'inline', marginRight: 3 }} /> {rec.distanceKm} km away</span>
                <span><Clock size={11} style={{ display: 'inline', marginRight: 3 }} /> ETA ~{rec.estimatedArrivalMinutes} min</span>
                <span>Score: <strong style={{ color: 'var(--ec-orange)' }}>{(rec.score * 100).toFixed(0)}%</strong></span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                <span>Severity: {(rec.scoreBreakdown?.severityScore * 100).toFixed(0)}%</span>
                <span>Proximity: {(rec.scoreBreakdown?.proximityScore * 100).toFixed(0)}%</span>
                <span>SLA: {(rec.scoreBreakdown?.slaScore * 100).toFixed(0)}%</span>
              </div>
            </div>
            <button onClick={() => assignMutation.mutate({ unitId: rec.unit?.id })}
              disabled={assignMutation.isPending || incident.status === 'RESOLVED' || incident.status === 'CANCELLED'}
              className="ec-btn ec-btn-primary text-xs px-3 py-2 flex-shrink-0"
              style={{ opacity: (incident.status === 'RESOLVED' || incident.status === 'CANCELLED') ? 0.4 : 1 }}>
              {assignMutation.isPending ? '…' : 'Dispatch'}
            </button>
          </div>
        </motion.div>
      ))}

      {recommendations?.length === 0 && !isLoading && (
        <p className="text-center py-4 text-sm" style={{ color: 'var(--ec-text-muted)' }}>No available units in this emirate</p>
      )}
    </div>
  );
}

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showStatus, setShowStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsApi.get(id).then(r => r.data),
  });

  const { data: history } = useQuery({
    queryKey: ['incident-history', id],
    queryFn: () => incidentsApi.getHistory(id).then(r => r.data),
    enabled: activeTab === 'history',
  });

  const cancelMutation = useMutation({
    mutationFn: () => incidentsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incident', id] });
      toast.success('Incident cancelled');
    },
    onError: err => toast.error(err.response?.data?.message || 'Cancel failed'),
  });

  if (isLoading) return <LoadingSpinner text="Loading incident…" />;
  if (!incident) return <div className="p-8 text-center" style={{ color: 'var(--ec-text-muted)' }}>Incident not found</div>;

  const canEdit = incident.status === 'OPEN' || incident.status === 'IN_PROGRESS';

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'dispatch', label: 'Dispatch', icon: Zap },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm transition-colors"
        style={{ color: 'var(--ec-text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--ec-orange)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--ec-text-muted)'}>
        <ArrowLeft size={16} /> Back to incidents
      </button>

      {}
      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '20px' }}
        className="p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div style={{ background: incident.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
            borderRadius: '14px', width: 52, height: 52 }}
            className="flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={24} style={{ color: incident.severity === 'CRITICAL' ? '#ef4444' : 'var(--ec-orange)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-xl font-black text-slate-900">{incident.title}</h1>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              <span className="flex items-center gap-1"><MapPin size={11} />{incident.emirate}{incident.locationAddress ? ` · ${incident.locationAddress}` : ''}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{new Date(incident.createdAt).toLocaleString()}</span>
              {incident.resolvedAt && <span className="flex items-center gap-1"><CheckCircle size={11} style={{ color: '#22c55e' }} />Resolved {new Date(incident.resolvedAt).toLocaleString()}</span>}
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowStatus(true)} className="ec-btn ec-btn-primary text-sm">
                Update Status
              </button>
              {incident.status === 'OPEN' && (
                <button onClick={() => window.confirm('Cancel this incident?') && cancelMutation.mutate()}
                  className="ec-btn ec-btn-danger text-sm">
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex gap-1" style={{ background: 'var(--ec-bg-card)', borderRadius: '12px', padding: '4px', border: '1px solid var(--ec-border)' }}>
        {tabs.map(({ id: tid, label }) => (
          <button key={tid} onClick={() => setActiveTab(tid)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: activeTab === tid ? 'var(--ec-orange)' : 'transparent',
              color: activeTab === tid ? 'white' : 'var(--ec-text-muted)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
          className="p-6">

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Incident Details</h3>
                {[
                  { label: 'ID', value: incident.id },
                  { label: 'Type', value: incident.type },
                  { label: 'Severity', value: <SeverityBadge severity={incident.severity} /> },
                  { label: 'Status', value: <StatusBadge status={incident.status} /> },
                  { label: 'Reported By', value: incident.reportedBy },
                  { label: 'Dispatcher', value: incident.assignedDispatcher || 'Not assigned' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-xs font-semibold w-28 flex-shrink-0 pt-0.5" style={{ color: 'var(--ec-text-muted)' }}>{label}</span>
                    <span className="text-sm text-slate-900 break-all">{value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Location</h3>
                {[
                  { label: 'Emirate', value: incident.emirate },
                  { label: 'Address', value: incident.locationAddress || 'Not set' },
                  { label: 'Latitude', value: incident.locationLatitude ?? 'Not set' },
                  { label: 'Longitude', value: incident.locationLongitude ?? 'Not set' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-xs font-semibold w-28 flex-shrink-0 pt-0.5" style={{ color: 'var(--ec-text-muted)' }}>{label}</span>
                    <span className="text-sm text-slate-900">{value}</span>
                  </div>
                ))}
                {incident.description && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--ec-border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ec-text-muted)' }}>DESCRIPTION</p>
                    <p className="text-sm text-slate-900 leading-relaxed">{incident.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4">Smart Dispatch Engine</h3>
              <DispatchPanel incident={incident} />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-4">Status History</h3>
              {!history ? <LoadingSpinner size={24} /> : history.content?.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--ec-text-muted)' }}>No history yet</p>
              ) : (
                <div className="space-y-3">
                  {history.content?.map((h, i) => (
                    <div key={h.id || i} className="flex items-start gap-3">
                      <div style={{ background: 'var(--ec-orange)', borderRadius: '50%', width: 8, height: 8, marginTop: 6, flexShrink: 0 }} />
                      <div style={{ background: 'var(--ec-bg-elevated)', borderRadius: '10px' }} className="flex-1 p-3 text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={h.oldStatus} />
                          <ArrowRight size={12} style={{ color: 'var(--ec-text-muted)', flexShrink: 0 }} />
                          <StatusBadge status={h.newStatus} />
                          <span className="text-xs ml-auto" style={{ color: 'var(--ec-text-muted)' }}>{new Date(h.changedAt).toLocaleString()}</span>
                        </div>
                        {h.changeReason && <p className="text-xs mt-1.5" style={{ color: 'var(--ec-text-muted)' }}>{h.changeReason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showStatus && <UpdateStatusModal incident={incident} onClose={() => setShowStatus(false)} />}
      </AnimatePresence>
    </div>
  );
}
