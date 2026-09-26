/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, AlertTriangle, Truck, Zap,
  ClipboardList, Menu, X, LogOut,
  Bell, User, Shield, Siren, Hospital, Users, ShieldAlert, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   roles: null },
  { to: '/incidents',  icon: AlertTriangle,   label: 'Incidents',   roles: null },
  { to: '/resources',  icon: Truck,           label: 'Resources',   roles: null },
  { to: '/dispatch',   icon: Zap,             label: 'Dispatch',    roles: ['DISPATCHER', 'ADMIN'] },
  { to: '/audit',      icon: ClipboardList,   label: 'Audit Log',   roles: ['ADMIN', 'DISPATCHER'] },
];

const ADMIN_NAV = [
  { to: '/admin/hospitals', icon: Hospital,    label: 'Hospitals',   roles: ['ADMIN', 'HOSPITAL_ADMIN'] },
  { to: '/admin/users',     icon: Users,       label: 'Users',       roles: ['ADMIN'] },
  { to: '/admin/security',  icon: ShieldAlert, label: 'IP Security', roles: ['ADMIN'] },
];

function canSee(item, role) {
  return !item.roles || item.roles.includes(role);
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const visibleMain  = NAV_ITEMS.filter(i => canSee(i, user?.role));
  const visibleAdmin = ADMIN_NAV.filter(i => canSee(i, user?.role));
  const isAdmin      = user?.role === 'ADMIN' || user?.role === 'HOSPITAL_ADMIN';

  const NavLink = ({ to, icon: Icon, label }) => {
    const active = location.pathname.startsWith(to);
    return (
      <Link to={to} onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
        style={{
          color: active ? 'var(--ec-text)' : 'var(--ec-text-muted)',
          background: active ? 'var(--ec-bg-elevated)' : 'transparent',
          fontWeight: active ? 600 : 400,
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--ec-text)'; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? 'var(--ec-text)' : 'var(--ec-text-muted)'; }}>
        <Icon size={18} className="flex-shrink-0" />
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-sm whitespace-nowrap">
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--ec-border)' }}>
        <div style={{ background: 'var(--ec-orange)', borderRadius: '10px' }}
          className="w-9 h-9 flex items-center justify-center flex-shrink-0">
          <Siren size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="font-bold text-base leading-tight" style={{ color: 'var(--ec-text)' }}>EmergencyConnect</div>
              <div style={{ color: 'var(--ec-orange)', fontSize: '0.65rem', letterSpacing: '0.1em' }} className="font-semibold uppercase">UAE</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {visibleMain.map(item => <NavLink key={item.to} {...item} />)}

        {isAdmin && visibleAdmin.length > 0 && (
          <>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-3 pt-4 pb-1">
                  <div className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: 'var(--ec-orange)' }}>Admin</div>
                </motion.div>
              )}
            </AnimatePresence>
            {visibleAdmin.map(item => <NavLink key={item.to} {...item} />)}
          </>
        )}

        {(user?.role === 'DISPATCHER' || user?.role === 'ADMIN') && (
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="px-3 pt-4 pb-1">
                <div className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: 'var(--ec-text-muted)' }}>Security</div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {(user?.role === 'DISPATCHER' || user?.role === 'ADMIN') && (
          <NavLink to="/mfa-setup" icon={KeyRound} label="Setup MFA" />
        )}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--ec-border)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg" style={{ background: 'var(--ec-bg-elevated)' }}>
          <div style={{ background: 'var(--ec-orange-dark)', borderRadius: '50%' }}
            className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--ec-text)' }}>{user?.role}</div>
                <div style={{ color: 'var(--ec-text-muted)', fontSize: '0.65rem' }} className="truncate">
                  ID: {user?.id?.toString().slice(0, 8)}...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button onClick={handleLogout} title="Logout"
              className="p-1 rounded transition-colors hover:text-orange-600"
              style={{ color: 'var(--ec-text-muted)' }}>
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--ec-bg)' }}>
      <motion.aside
        animate={{ width: sidebarOpen ? 224 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col flex-shrink-0 border-r"
        style={{ background: 'var(--ec-bg-card)', borderColor: 'var(--ec-border)', overflow: 'hidden' }}>
        <SidebarContent />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-56 border-r flex flex-col md:hidden"
              style={{ background: 'var(--ec-bg-card)', borderColor: 'var(--ec-border)' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ background: 'var(--ec-bg-card)', borderColor: 'var(--ec-border)', height: '56px' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => { setSidebarOpen(v => !v); setMobileOpen(v => !v); }}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--ec-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ec-orange)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ec-text-muted)'}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="hidden sm:block text-sm" style={{ color: 'var(--ec-text-muted)' }}>
              {[...NAV_ITEMS, ...ADMIN_NAV].find(i => location.pathname.startsWith(i.to))?.label || 'EmergencyConnect'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>
                <Shield size={11} /> Admin
              </div>
            )}
            {user?.role === 'DISPATCHER' && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(249,115,22,0.12)', color: 'var(--ec-orange)' }}>
                <Zap size={11} /> Dispatcher
              </div>
            )}
            <button className="p-2 rounded-lg relative" style={{ color: 'var(--ec-text-muted)' }}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'var(--ec-orange)' }} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
