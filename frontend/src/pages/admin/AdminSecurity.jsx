/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, ShieldCheck, Plus, Trash2, Lock } from 'lucide-react';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

function IpTable({ title, subtitle, icon: Icon, iconColor, items, loading, onRemove, addLabel, onAdd }) {
  const [ip, setIp] = useState('');
  const [note, setNote] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await onAdd(ip, note);
    setIp(''); setNote(''); setShowAdd(false);
  };

  return (
    <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
      className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--ec-border)' }}>
        <div className="flex items-center gap-3">
          <div style={{ background: `${iconColor}20`, borderRadius: '10px' }}
            className="w-9 h-9 flex items-center justify-center">
            <Icon size={17} style={{ color: iconColor }} />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--ec-text)' }}>{title}</div>
            <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{subtitle}</div>
          </div>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="ec-btn ec-btn-primary gap-1.5 text-xs px-3 py-1.5">
          <Plus size={13} /> {addLabel}
        </button>
      </div>

      {showAdd && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--ec-border)', background: 'var(--ec-bg-elevated)' }}>
          <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>IP ADDRESS</label>
              <input className="ec-input w-48" placeholder="e.g. 192.168.1.1" required
                value={ip} onChange={e => setIp(e.target.value)} />
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ec-text-muted)' }}>NOTE / REASON</label>
              <input className="ec-input" placeholder="Optional note"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <button type="submit" className="ec-btn ec-btn-primary">Add</button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="ec-btn" style={{ color: 'var(--ec-text-muted)' }}>Cancel</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-sm" style={{ color: 'var(--ec-text-muted)' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-sm" style={{ color: 'var(--ec-text-muted)' }}>No entries.</div>
      ) : (
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {items.map(item => (
            <div key={item.id || item.ipAddress}
              className="flex items-center justify-between px-5 py-3">
              <div>
                <div className="font-mono text-sm font-semibold" style={{ color: 'var(--ec-text)' }}>
                  {item.ipAddress}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ec-text-muted)' }}>
                  {item.reason || item.description || 'No note'}
                  {item.addedBy && <span className="ml-2">by {item.addedBy}</span>}
                </div>
              </div>
              <button onClick={() => onRemove(item.ipAddress)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                style={{ color: 'var(--ec-text-muted)' }}
                title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminSecurity() {
  const [blacklist, setBlacklist] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [bLoading, setBLoading] = useState(true);
  const [wLoading, setWLoading] = useState(true);

  const loadBlacklist = () => {
    setBLoading(true);
    authApi.listBlacklist().then(({ data }) => setBlacklist(data.content || [])).catch(() => {}).finally(() => setBLoading(false));
  };

  const loadWhitelist = () => {
    setWLoading(true);
    authApi.listWhitelist().then(({ data }) => setWhitelist(data.content || [])).catch(() => {}).finally(() => setWLoading(false));
  };

  useEffect(() => { loadBlacklist(); loadWhitelist(); }, []);

  const addToBlacklist = async (ip, reason) => {
    try {
      await authApi.blacklistIp({ ipAddress: ip, reason });
      toast.success(`${ip} blacklisted`);
      loadBlacklist();
    } catch { toast.error('Failed to blacklist IP'); }
  };

  const removeFromBlacklist = async (ip) => {
    try {
      await authApi.unblacklistIp(ip);
      toast.success(`${ip} removed from blacklist`);
      loadBlacklist();
    } catch { toast.error('Failed to remove IP'); }
  };

  const addToWhitelist = async (ip, description) => {
    try {
      await authApi.whitelistIp({ ipAddress: ip, description });
      toast.success(`${ip} whitelisted`);
      loadWhitelist();
    } catch { toast.error('Failed to whitelist IP'); }
  };

  const removeFromWhitelist = async (ip) => {
    try {
      await authApi.removeFromWhitelist(ip);
      toast.success(`${ip} removed from whitelist`);
      loadWhitelist();
    } catch { toast.error('Failed to remove IP'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--ec-text)' }}>IP Security</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ec-text-muted)' }}>
          ADMIN only. Manage IP blacklist and whitelist for system-wide access control (Req 6.7).
        </p>
      </div>

      <div className="p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <Lock size={16} style={{ color: 'var(--ec-orange)', marginTop: 2 }} className="flex-shrink-0" />
        <div className="text-sm" style={{ color: 'var(--ec-text)' }}>
          <strong>Blacklist</strong> blocks all requests from the listed IPs and is enforced at the login endpoint.
          IPs are also auto-blacklisted after 5 consecutive failed login attempts.
          <strong className="ml-1">Whitelist</strong> marks trusted IPs for bypass logic on sensitive admin operations.
        </div>
      </div>

      <IpTable
        title="IP Blacklist" subtitle="Blocked IPs — access denied at login"
        icon={ShieldOff} iconColor="var(--ec-red)"
        items={blacklist} loading={bLoading}
        addLabel="Block IP" onAdd={addToBlacklist} onRemove={removeFromBlacklist}
      />

      <IpTable
        title="IP Whitelist" subtitle="Trusted IPs — bypass additional restrictions"
        icon={ShieldCheck} iconColor="var(--ec-green)"
        items={whitelist} loading={wLoading}
        addLabel="Trust IP" onAdd={addToWhitelist} onRemove={removeFromWhitelist}
      />
    </div>
  );
}
