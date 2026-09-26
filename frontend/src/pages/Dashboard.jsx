/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Truck, Activity, CheckCircle, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { incidentsApi } from '../api/incidents';
import { resourcesApi } from '../api/resources';
import { auditApi } from '../api/audit';
import LoadingSpinner from '../components/LoadingSpinner';
import SeverityBadge from '../components/SeverityBadge';
import StatusBadge from '../components/StatusBadge';
import LiveNotifications from '../components/LiveNotifications';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const ORANGE = '#f97316';
const RED = '#ef4444';
const GREEN = '#22c55e';
const YELLOW = '#eab308';
const BLUE = '#3b82f6';

function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
      style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
      className="p-5 card-glow">
      <div className="flex items-start justify-between mb-3">
        <div style={{ background: '#f1f5f9', borderRadius: '10px', width: 40, height: 40 }}
          className="flex items-center justify-center">
          <Icon size={18} style={{ color: '#94a3b8' }} />
        </div>
        {trend != null && (
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#94a3b8' }}>
            <TrendingUp size={11} /> {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 mb-1">{value ?? 0}</div>
      <div className="text-xs font-semibold" style={{ color: 'var(--ec-text-muted)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--ec-text-muted)' }}>{sub}</div>}
    </motion.div>
  );
}

const mockAreaData = [
  { t: '00:00', incidents: 2 }, { t: '04:00', incidents: 1 }, { t: '08:00', incidents: 5 },
  { t: '12:00', incidents: 8 }, { t: '16:00', incidents: 12 }, { t: '20:00', incidents: 7 },
  { t: 'Now', incidents: 4 },
];
const mockBarData = [
  { emirate: 'DXB', count: 14 }, { emirate: 'AUH', count: 9 },
  { emirate: 'SHJ', count: 6 }, { emirate: 'AJM', count: 3 },
  { emirate: 'RAK', count: 4 }, { emirate: 'FUJ', count: 2 },
];
const SEVERITY_COLORS = { CRITICAL: RED, HIGH: ORANGE, MEDIUM: YELLOW, LOW: GREEN };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: 'var(--ec-text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || ORANGE }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  
  const handleWsEvent = useCallback((data) => {
    const { eventType } = data;
    if (eventType === 'INCIDENT_CREATED' || eventType === 'INCIDENT_UPDATED') {
      queryClient.invalidateQueries({ queryKey: ['active-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident-dashboard'] });
    }
    if (eventType === 'RESOURCE_ASSIGNED' || eventType === 'RESOURCE_RELEASED') {
      queryClient.invalidateQueries({ queryKey: ['available-count'] });
    }
    if (eventType === 'AUTH_EVENT') {
      queryClient.invalidateQueries({ queryKey: ['audit-dashboard'] });
    }
  }, [queryClient]);

  useWebSocket(handleWsEvent, !!user);

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['incident-dashboard'],
    queryFn: () => incidentsApi.getDashboard().then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: activeIncidents, isLoading: incLoading } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: () => incidentsApi.getActive().then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: auditDash } = useQuery({
    queryKey: ['audit-dashboard'],
    queryFn: () => auditApi.getDashboard().then(r => r.data),
    refetchInterval: 60000,
  });

  const { data: availableUnits } = useQuery({
    queryKey: ['available-count'],
    queryFn: () => resourcesApi.countAvailableUnits().then(r => r.data.availableUnits),
    refetchInterval: 30000,
  });

  const d = dashboardData;
  const severityPieData = d ? [
    { name: 'Critical', value: Number(d.totalCritical || 0), color: RED },
    { name: 'High', value: Number(d.totalHigh || 0), color: ORANGE },
    { name: 'Medium', value: Number(d.totalMedium || 0), color: YELLOW },
    { name: 'Low', value: Number(d.totalLow || 0), color: GREEN },
  ].filter(x => x.value > 0) : [];

  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Operations Dashboard</h1>
          <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.875rem' }}>
            Real-time overview &nbsp;·&nbsp; Role: <span style={{ color: 'var(--ec-orange)' }}>{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveNotifications enabled={!!user} />
          <Link to="/incidents" className="ec-btn ec-btn-primary text-sm">
            New Incident <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {}
      {dashLoading ? <LoadingSpinner text="Loading stats…" /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={AlertTriangle} label="Open Incidents" value={d?.totalOpen ?? 0} color={ORANGE} trend={8} />
          <StatCard icon={Activity} label="In Progress" value={d?.totalInProgress ?? 0} color={YELLOW} />
          <StatCard icon={CheckCircle} label="Resolved Today" value={d?.totalResolved ?? 0} color={GREEN} trend={12} />
          <StatCard icon={Truck} label="Units Available" value={availableUnits ?? 0} color={BLUE} />
        </div>
      )}

      {}
      {d && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Critical', value: d.totalCritical, color: RED },
            { label: 'High', value: d.totalHigh, color: ORANGE },
            { label: 'Medium', value: d.totalMedium, color: YELLOW },
            { label: 'Low', value: d.totalLow, color: GREEN },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px' }}
              className="p-3 text-center">
              <div className="text-xl font-black" style={{ color }}>{value ?? 0}</div>
              <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{label} Severity</div>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2" style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Incident Activity (24h)</h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--ec-orange)' }}>Live</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockAreaData}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ORANGE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={ORANGE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ec-border)" />
              <XAxis dataKey="t" tick={{ fill: 'var(--ec-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--ec-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="incidents" stroke={ORANGE} fill="url(#incGrad)" strokeWidth={2} name="Incidents" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {}
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', padding: '20px' }}>
          <h3 className="font-bold text-slate-900 text-sm mb-4">Severity Breakdown</h3>
          {severityPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={severityPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {severityPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle"
                  formatter={(v) => <span style={{ color: 'var(--ec-text-muted)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center" style={{ color: 'var(--ec-text-muted)' }}>
              <p className="text-sm">No severity data</p>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', padding: '20px' }}>
          <h3 className="font-bold text-slate-900 text-sm mb-4">Incidents by Emirate</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockBarData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--ec-border)" />
              <XAxis dataKey="emirate" tick={{ fill: 'var(--ec-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--ec-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={ORANGE} radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {}
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Active Incidents</h3>
            <Link to="/incidents" className="text-xs" style={{ color: 'var(--ec-orange)' }}>View all →</Link>
          </div>
          {incLoading ? <LoadingSpinner size={24} /> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeIncidents?.length ? activeIncidents.slice(0, 6).map(inc => (
                <Link key={inc.id} to={`/incidents/${inc.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                  style={{ background: 'var(--ec-bg-elevated)' }}
                  onMouseEnter={e => e.currentTarget.style.borderLeft = '2px solid var(--ec-orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderLeft = 'none'}>
                  <div style={{ background: inc.severity === 'CRITICAL' ? `${RED}20` : `${ORANGE}20`, borderRadius: '8px', width: 32, height: 32, flexShrink: 0 }}
                    className="flex items-center justify-center">
                    <AlertTriangle size={14} style={{ color: inc.severity === 'CRITICAL' ? RED : ORANGE }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{inc.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SeverityBadge severity={inc.severity} />
                      <span className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>{inc.emirate}</span>
                    </div>
                  </div>
                  <StatusBadge status={inc.status} />
                </Link>
              )) : (
                <div className="text-center py-8" style={{ color: 'var(--ec-text-muted)' }}>
                  <CheckCircle size={32} className="mx-auto mb-2" style={{ color: GREEN }} />
                  <p className="text-sm">No active incidents</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      {auditDash && (
        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px', padding: '20px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Audit Summary</h3>
            <Link to="/audit" className="text-xs" style={{ color: 'var(--ec-orange)' }}>Full log →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(auditDash).map(([key, val]) => (
              <div key={key} style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: '10px' }}
                className="p-3 text-center">
                <div className="text-xl font-black" style={{ color: 'var(--ec-orange)' }}>{val}</div>
                <div className="text-xs mt-0.5 capitalize" style={{ color: 'var(--ec-text-muted)' }}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
