/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Shield, RefreshCw } from 'lucide-react';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  ADMIN:        { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
  DISPATCHER:   { bg: 'rgba(249,115,22,0.12)', color: 'var(--ec-orange)' },
  RESPONDER:    { bg: 'rgba(34,197,94,0.12)',  color: 'var(--ec-green)' },
  HOSPITAL_ADMIN: { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa' },
  OPERATOR:     { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = (p = 0) => {
    setLoading(true);
    authApi.listUsers(p, 15)
      .then(({ data }) => { setUsers(data.content); setTotalPages(data.totalPages); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const toggleActive = async (user) => {
    try {
      if (user.active) {
        await authApi.deactivateUser(user.id);
        toast.success(`${user.username} deactivated`);
      } else {
        await authApi.activateUser(user.id);
        toast.success(`${user.username} activated`);
      }
      load(page);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    mfaEnabled: users.filter(u => u.mfaEnabled).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--ec-text)' }}>User Management</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ec-text-muted)' }}>
            ADMIN only. Activate, deactivate and review all registered operators.
          </p>
        </div>
        <button onClick={() => load(page)}
          className="ec-btn gap-2" style={{ color: 'var(--ec-text-muted)' }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'var(--ec-orange)' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: 'var(--ec-green)' },
          { label: 'MFA Enabled', value: stats.mfaEnabled, icon: Shield, color: '#a78bfa' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '12px' }}
            className="p-4 flex items-center gap-3">
            <div style={{ background: `${color}20`, borderRadius: '10px' }}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div className="text-xl font-black" style={{ color: 'var(--ec-text)' }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
        className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--ec-text-muted)' }}>Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ec-border)', background: 'var(--ec-bg-elevated)' }}>
                  {['Username', 'Email', 'Role', 'MFA', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold"
                      style={{ color: 'var(--ec-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.OPERATOR;
                  return (
                    <motion.tr key={u.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ borderBottom: '1px solid var(--ec-border)' }}
                      className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--ec-text)' }}>
                        {u.username}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--ec-text-muted)' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: roleStyle.bg, color: roleStyle.color }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.mfaEnabled
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--ec-green)' }}>
                              Enabled
                            </span>
                          : <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>Off</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: u.active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: u.active ? 'var(--ec-green)' : 'var(--ec-red)',
                          }}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--ec-text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(u)}
                          title={u.active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color: u.active ? 'var(--ec-red)' : 'var(--ec-green)',
                            background: u.active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                          }}>
                          {u.active ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
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
