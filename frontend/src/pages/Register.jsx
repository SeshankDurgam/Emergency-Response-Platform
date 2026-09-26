/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import registerIllustration from '../assets/create_account_illustration.avif';

const roles = [
  { value: 'OPERATOR',   label: 'Operator',      desc: 'Report and track incidents' },
  { value: 'DISPATCHER', label: 'Dispatcher',    desc: 'Manage unit assignments' },
  { value: 'ADMIN',      label: 'Administrator', desc: 'Full system access' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ username: '', email: '', password: '', role: 'OPERATOR' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      toast.success('Account created!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 max-w-sm">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: '#f0fdf4' }}>
            <CheckCircle size={40} style={{ color: '#22c55e' }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-sm text-gray-500">Redirecting you to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f7f4' }}>

      <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <img
          src={registerIllustration}
          alt="Join EmergencyConnect UAE"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="h-px w-16 mb-5" style={{ background: '#f97316' }} />
          <p className="text-white font-semibold text-xl leading-snug mb-2">
            Join the Emergency Network
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Protecting lives across all seven UAE emirates
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#f97316' }}>
              EC
            </div>
            <span className="font-semibold text-gray-800">EmergencyConnect</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 mb-7">Join the UAE Emergency Network</p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm"
              style={{ background: '#fef2f2', color: '#dc2626' }}>
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                  placeholder="john_doe" required
                  value={form.username} onChange={set('username')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                  type="email" placeholder="you@example.ae" required
                  value={form.email} onChange={set('email')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                  type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
                  required minLength={8}
                  value={form.password} onChange={set('password')}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(({ value, label, desc }) => (
                  <button key={value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className="p-2.5 rounded-lg text-left transition-colors border"
                    style={{
                      background: form.role === value ? '#fff7ed' : '#f9fafb',
                      borderColor: form.role === value ? '#f97316' : '#e5e7eb',
                    }}>
                    <div className="text-xs font-semibold mb-0.5"
                      style={{ color: form.role === value ? '#f97316' : '#374151' }}>
                      {label}
                    </div>
                    <div className="text-gray-400 leading-tight" style={{ fontSize: '0.62rem' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
              style={{ background: '#f97316', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#f97316' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
