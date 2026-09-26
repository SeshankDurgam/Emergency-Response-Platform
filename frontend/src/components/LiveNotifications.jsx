/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Truck, Shield, X, Radio } from 'lucide-react';
import useWebSocket from '../hooks/useWebSocket';

const EVENT_CONFIG = {
  INCIDENT_CREATED: { icon: AlertTriangle, color: '#ef4444', label: 'New Incident',       bg: '#fef2f2' },
  INCIDENT_UPDATED: { icon: AlertTriangle, color: '#f97316', label: 'Incident Updated',    bg: '#fff7ed' },
  RESOURCE_ASSIGNED:{ icon: Truck,         color: '#3b82f6', label: 'Resource Assigned',   bg: '#eff6ff' },
  RESOURCE_RELEASED:{ icon: Truck,         color: '#22c55e', label: 'Resource Released',   bg: '#f0fdf4' },
  AUTH_EVENT:       { icon: Shield,        color: '#8b5cf6', label: 'Auth Event',          bg: '#faf5ff' },
};

function parsePayload(payload) {
  try {
    const obj = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return obj?.title || obj?.unitCode || obj?.username || obj?.message || '';
  } catch {
    return '';
  }
}

export default function LiveNotifications({ enabled = true }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected]         = useState(false);

  const handleConnect = useCallback(() => {
    setConnected(true);
  }, []);

  const handleMessage = useCallback((data) => {
    const { eventType, payload } = data;
    const cfg = EVENT_CONFIG[eventType] || EVENT_CONFIG.INCIDENT_UPDATED;
    const detail = parsePayload(payload);

    const note = {
      id:        Date.now() + Math.random(),
      eventType,
      label:     cfg.label,
      detail,
      color:     cfg.color,
      bg:        cfg.bg,
      IconComp:  cfg.icon,
      ts:        new Date().toLocaleTimeString(),
    };

    setNotifications(prev => [note, ...prev].slice(0, 5));

    // auto-dismiss after 6 s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== note.id));
    }, 6000);
  }, []);

  useWebSocket(handleMessage, enabled, handleConnect);

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <>
      {/* Connection indicator */}
      <div className="flex items-center gap-1.5 text-xs"
           style={{ color: connected ? '#22c55e' : '#94a3b8' }}>
        <Radio size={12} />
        <span>{connected ? 'Live' : 'Connecting…'}</span>
      </div>

      {}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
        <AnimatePresence>
          {notifications.map(n => {
            const Icon = n.IconComp;
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{    opacity: 0, x: 80, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                style={{ background: n.bg, border: `1px solid ${n.color}30`,
                         borderRadius: 12, padding: '10px 14px',
                         boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                         display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {}
                <div style={{ background: `${n.color}20`, borderRadius: 8,
                              width: 32, height: 32, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} style={{ color: n.color }} />
                </div>
                {}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{n.label}</div>
                  {n.detail && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.detail}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{n.ts}</div>
                </div>
                {}
                <button onClick={() => dismiss(n.id)}
                        style={{ color: '#94a3b8', flexShrink: 0, marginTop: 2,
                                 background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
