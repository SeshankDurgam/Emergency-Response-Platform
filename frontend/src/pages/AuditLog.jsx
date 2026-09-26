/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, ChevronLeft, ChevronRight, RefreshCw,
  ShieldCheck, ShieldAlert, Shield, Link2, GitBranch,
  CheckCircle2, XCircle, Loader2, Hash, Lock
} from 'lucide-react';
import { auditApi } from '../api/audit';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EVENT_TYPES = ['', 'INCIDENT_CREATED', 'INCIDENT_UPDATED', 'RESOURCE_ASSIGNED', 'RESOURCE_RELEASED', 'AUTH_EVENT', 'IP_BLACKLISTED'];

const eventColors = {
  INCIDENT_CREATED:  { bg: 'rgba(59,130,246,0.15)',  text: '#93c5fd', dot: '#3b82f6' },
  INCIDENT_UPDATED:  { bg: 'rgba(249,115,22,0.15)',  text: '#fdba74', dot: '#f97316' },
  RESOURCE_ASSIGNED: { bg: 'rgba(139,92,246,0.15)', text: '#c4b5fd', dot: '#8b5cf6' },
  RESOURCE_RELEASED: { bg: 'rgba(34,197,94,0.15)',  text: '#86efac', dot: '#22c55e' },
  AUTH_EVENT:        { bg: 'rgba(234,179,8,0.15)',   text: '#fde047', dot: '#eab308' },
  IP_BLACKLISTED:    { bg: 'rgba(239,68,68,0.15)',   text: '#fca5a5', dot: '#ef4444' },
};

function EventTypeBadge({ type }) {
  const c = eventColors[type] || { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', dot: '#6b7280' };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}
      className="inline-flex items-center gap-1.5">
      <span style={{ background: c.dot, borderRadius: '50%', width: 5, height: 5, display: 'inline-block' }} />
      {type?.replace(/_/g, ' ')}
    </span>
  );
}

function HashChip({ hash }) {
  if (!hash) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(107,114,128,0.15)', color: '#6b7280' }}>
        <Shield size={10} /> no hash
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded"
      title={hash}
      style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
      <Lock size={10} />
      {hash.slice(0, 6)}...{hash.slice(-4)}
    </span>
  );
}

function ChainIntegrityPanel() {
  const [chainResult, setChainResult] = useState(null);
  const [merkleResult, setMerkleResult] = useState(null);
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [committingMerkle, setCommittingMerkle] = useState(false);
  const [showEntries, setShowEntries] = useState(false);

  const { data: merkleRootsData, refetch: refetchRoots } = useQuery({
    queryKey: ['merkle-roots'],
    queryFn: () => auditApi.getMerkleRoots().then(r => r.data),
  });

  const latestRoot = merkleRootsData?.content?.[0];

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    setChainResult(null);
    try {
      const { data } = await auditApi.verifyChain(100);
      setChainResult(data);
      if (data.chainIntact) {
        toast.success('Chain integrity verified — all entries are authentic');
      } else {
        toast.error(`Chain integrity FAILED — ${data.tampered} tampered, ${data.missing} without hash`);
      }
    } catch {
      toast.error('Verification request failed');
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleCommitMerkle = async () => {
    setCommittingMerkle(true);
    try {
      const { data } = await auditApi.commitMerkle(100);
      setMerkleResult(data);
      refetchRoots();
      toast.success(`Merkle root committed — ${data.entryCount} entries, depth ${data.treeDepth}`);
    } catch {
      toast.error('Failed to commit Merkle root');
    } finally {
      setCommittingMerkle(false);
    }
  };

  return (
    <div className="rounded-2xl border overflow-hidden mb-5"
      style={{ background: 'var(--ec-bg-card)', borderColor: 'var(--ec-border)' }}>

      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--ec-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--ec-orange-glow)' }}>
            <GitBranch size={16} style={{ color: 'var(--ec-orange)' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Cryptographic Audit Chain</p>
            <p className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              SHA-256 hash chain + Merkle tree — tamper-evident log integrity
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={verifyingChain}
            className="ec-btn ec-btn-ghost text-xs font-semibold"
          >
            {verifyingChain
              ? <><Loader2 size={12} className="animate-spin" /> Verifying...</>
              : <><ShieldCheck size={12} /> Verify Chain</>}
          </button>
          <button
            onClick={handleCommitMerkle}
            disabled={committingMerkle}
            className="ec-btn ec-btn-primary text-xs font-semibold"
          >
            {committingMerkle
              ? <><Loader2 size={12} className="animate-spin" /> Committing...</>
              : <><Hash size={12} /> Commit Merkle Root</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x" style={{ divideColor: 'var(--ec-border)' }}>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--ec-text-muted)' }}>
            <Link2 size={11} /> CHAIN STATUS
          </p>
          {chainResult ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                {chainResult.chainIntact
                  ? <CheckCircle2 size={20} style={{ color: 'var(--ec-green)' }} />
                  : <XCircle size={20} style={{ color: 'var(--ec-red)' }} />}
                <span className="text-base font-bold"
                  style={{ color: chainResult.chainIntact ? 'var(--ec-green)' : 'var(--ec-red)' }}>
                  {chainResult.chainIntact ? 'INTACT' : 'COMPROMISED'}
                </span>
              </div>
              <div className="space-y-1 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                <div className="flex justify-between">
                  <span>Entries checked</span>
                  <span className="font-mono text-slate-900">{chainResult.totalChecked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tampered</span>
                  <span className="font-mono" style={{ color: chainResult.tampered > 0 ? 'var(--ec-red)' : 'var(--ec-green)' }}>
                    {chainResult.tampered}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>No hash (legacy)</span>
                  <span className="font-mono" style={{ color: 'var(--ec-text-muted)' }}>{chainResult.missing}</span>
                </div>
              </div>
              {chainResult.entries?.length > 0 && (
                <button
                  onClick={() => setShowEntries(v => !v)}
                  className="mt-2 text-xs underline"
                  style={{ color: 'var(--ec-text-muted)' }}>
                  {showEntries ? 'Hide' : 'Show'} entry details
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              Click "Verify Chain" to re-compute SHA-256 hashes for the 100 most recent entries and check the chain.
            </p>
          )}
        </div>

        <div className="px-5 py-4" style={{ borderColor: 'var(--ec-border)' }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--ec-text-muted)' }}>
            <Hash size={11} /> MERKLE ROOT
          </p>
          {merkleResult ? (
            <div>
              <div className="text-xs font-mono mb-2 break-all"
                style={{ color: 'var(--ec-orange)' }}>
                {merkleResult.rootHash}
              </div>
              <div className="space-y-1 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                <div className="flex justify-between">
                  <span>Entries in batch</span>
                  <span className="font-mono text-slate-900">{merkleResult.entryCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tree depth</span>
                  <span className="font-mono text-slate-900">{merkleResult.treeDepth} layers</span>
                </div>
                <div className="flex justify-between">
                  <span>Proof size</span>
                  <span className="font-mono text-slate-900">O(log {merkleResult.entryCount}) = {merkleResult.treeDepth} hashes</span>
                </div>
              </div>
            </div>
          ) : latestRoot ? (
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--ec-text-muted)' }}>Latest committed root:</p>
              <div className="text-xs font-mono break-all mb-2" style={{ color: 'var(--ec-orange)' }}>
                {latestRoot.rootHash}
              </div>
              <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                {latestRoot.entryCount} entries ·{' '}
                {new Date(latestRoot.committedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              No Merkle root committed yet. Click "Commit Merkle Root" to create a cryptographic commitment to the current batch of entries.
            </p>
          )}
        </div>

        <div className="px-5 py-4" style={{ borderColor: 'var(--ec-border)' }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--ec-text-muted)' }}>
            <ShieldCheck size={11} /> HOW IT WORKS
          </p>
          <div className="space-y-2 text-xs" style={{ color: 'var(--ec-text-muted)', lineHeight: 1.5 }}>
            <p>
              Each log entry is hashed with SHA-256 over all its fields plus the
              previous entry's hash, forming an unbreakable chain — identical to Bitcoin blocks.
            </p>
            <p>
              The Merkle tree groups entries into a binary tree. Any single
              entry can be verified in O(log n) without checking the full set.
            </p>
            <p style={{ color: 'var(--ec-text-muted)' }}>
              Even changing one character in any historical record produces a completely
              different hash, breaking every entry that follows it.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEntries && chainResult?.entries?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t overflow-hidden"
            style={{ borderColor: 'var(--ec-border)' }}>
            <div className="px-5 py-3 max-h-64 overflow-y-auto">
              {chainResult.entries.slice(0, 20).map((e, i) => (
                <div key={e.entryId} className="flex items-center gap-3 py-1.5 border-b text-xs"
                  style={{ borderColor: 'var(--ec-border)' }}>
                  <span className="w-5 text-right font-mono" style={{ color: 'var(--ec-text-muted)' }}>{i + 1}</span>
                  {e.verified
                    ? <CheckCircle2 size={13} style={{ color: 'var(--ec-green)', flexShrink: 0 }} />
                    : <XCircle size={13} style={{ color: 'var(--ec-red)', flexShrink: 0 }} />}
                  <span className="font-mono w-24 truncate" style={{ color: 'var(--ec-orange)' }}>
                    {e.entryId?.slice(0, 8)}...
                  </span>
                  <span className="font-mono flex-1 truncate" style={{ color: 'var(--ec-green)' }}>
                    {e.storedHash ? `${e.storedHash.slice(0, 16)}...` : 'no hash'}
                  </span>
                  {!e.verified && (
                    <span style={{ color: 'var(--ec-red)' }}>{e.failureReason}</span>
                  )}
                </div>
              ))}
              {chainResult.entries.length > 20 && (
                <p className="text-center py-2 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                  Showing 20 of {chainResult.entries.length} entries
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AuditLog() {
  const [filters, setFilters] = useState({ eventType: '', from: '', to: '', page: 0 });
  const [search, setSearch] = useState('');

  const setF = k => v => setFilters(f => ({ ...f, [k]: v, page: 0 }));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit', filters],
    queryFn: () => auditApi.getLogs({ ...filters, size: 20 }).then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: dashData } = useQuery({
    queryKey: ['audit-dashboard'],
    queryFn: () => auditApi.getDashboard().then(r => r.data),
  });

  const logs = data?.content || [];
  const totalPages = data?.totalPages || 1;

  const filtered = search
    ? logs.filter(l =>
        l.eventType?.toLowerCase().includes(search.toLowerCase()) ||
        l.actorId?.toLowerCase().includes(search.toLowerCase()) ||
        l.incidentId?.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(l.payload)?.toLowerCase().includes(search.toLowerCase()))
    : logs;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audit Log</h1>
          <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.875rem' }}>
            {data?.totalElements ?? 0} events recorded — cryptographic hash chain active
          </p>
        </div>
        <button onClick={() => refetch()} className="ec-btn ec-btn-ghost text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <ChainIntegrityPanel />

      {dashData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(dashData).map(([key, val]) => {
            const type = key === 'incidentsCreated' ? 'INCIDENT_CREATED'
              : key === 'incidentsUpdated' ? 'INCIDENT_UPDATED'
              : key === 'resourcesAssigned' ? 'RESOURCE_ASSIGNED'
              : key === 'resourcesReleased' ? 'RESOURCE_RELEASED'
              : 'AUTH_EVENT';
            const c = eventColors[type];
            return (
              <div key={key} style={{ background: c?.bg || 'var(--ec-bg-elevated)', border: `1px solid ${c?.dot || 'var(--ec-orange)'}30`, borderRadius: '12px' }}
                className="p-3 text-center">
                <div className="text-2xl font-black" style={{ color: c?.dot || 'var(--ec-orange)' }}>{val}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ec-text-muted)' }}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px' }}
        className="p-4 flex flex-wrap gap-3 items-center">
        <div className="ec-search-wrapper flex-1 min-w-40">
          <span className="ec-search-icon"><Search size={14} /></span>
          <input className="ec-input" placeholder="Search events, actors, IDs..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="ec-select w-48" value={filters.eventType} onChange={e => setF('eventType')(e.target.value)}>
          {EVENT_TYPES.map((t, i) => <option key={i} value={t}>{t ? t.replace(/_/g, ' ') : 'All Event Types'}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input className="ec-input w-40 text-xs" type="datetime-local" value={filters.from}
            onChange={e => setF('from')(e.target.value)} title="From date" />
          <span style={{ color: 'var(--ec-text-muted)' }} className="text-xs">to</span>
          <input className="ec-input w-40 text-xs" type="datetime-local" value={filters.to}
            onChange={e => setF('to')(e.target.value)} title="To date" />
        </div>
        {(filters.eventType || filters.from || filters.to) && (
          <button onClick={() => setFilters({ eventType: '', from: '', to: '', page: 0 })}
            className="ec-btn ec-btn-ghost text-xs px-3 py-2">Clear</button>
        )}
      </div>

      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '14px', overflow: 'hidden' }}>
        {isLoading ? <LoadingSpinner text="Loading audit logs…" /> : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList size={40} className="mx-auto mb-3" style={{ color: 'var(--ec-text-muted)' }} />
            <p className="font-semibold text-slate-900">No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ec-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Actor</th>
                  <th>Incident ID</th>
                  <th>Chain Hash</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <motion.tr key={log.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}>
                    <td>
                      <div className="text-xs text-slate-900">
                        {log.occurredAt ? new Date(log.occurredAt).toLocaleDateString() : 'Unknown'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                        {log.occurredAt ? new Date(log.occurredAt).toLocaleTimeString() : ''}
                      </div>
                    </td>
                    <td><EventTypeBadge type={log.eventType} /></td>
                    <td>
                      <span className="text-xs font-mono text-slate-900">
                        {log.actorId ? log.actorId.slice(0, 12) + '...' : 'System'}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-mono" style={{ color: 'var(--ec-text-muted)' }}>
                        {log.incidentId ? log.incidentId.slice(0, 12) + '...' : 'None'}
                      </span>
                    </td>
                    <td>
                      <HashChip hash={log.entryHash} />
                    </td>
                    <td>
                      {log.payload ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs" style={{ color: 'var(--ec-orange)' }}>View payload</summary>
                          <pre className="text-xs mt-1 p-2 rounded overflow-x-auto max-w-xs"
                            style={{ background: 'var(--ec-bg-elevated)', color: 'var(--ec-text-muted)' }}>
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </details>
                      ) : <span style={{ color: 'var(--ec-text-muted)', fontSize: '0.75rem' }}>No payload</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--ec-border)' }}>
            <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              Page {filters.page + 1} of {totalPages} ({data?.totalElements} events)
            </span>
            <div className="flex gap-2">
              <button disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                className="ec-btn ec-btn-ghost px-2 py-1.5" style={{ opacity: filters.page === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                className="ec-btn ec-btn-ghost px-2 py-1.5" style={{ opacity: filters.page >= totalPages - 1 ? 0.4 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
