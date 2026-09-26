/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import loginIllustration from '../assets/login_illustration.jpg';

export default function Login() {
  const { login, completeMfa } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]               = useState({ username: '', password: '' });
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const [mfaStep, setMfaStep]         = useState(false);
  const [mfaUserId, setMfaUserId]     = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode]               = useState('');
  const [resending, setResending]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await login(form);
      if (data.mfaRequired) {
        setMfaStep(true);
        setMfaUserId(data.userId);
        setMaskedEmail(data.maskedEmail || '');
        toast.success('Verification code sent to your email');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authApi.verifyMfa({ userId: mfaUserId, totpCode: code });
      completeMfa(data);
      toast.success('Authenticated successfully');
      navigate('/dashboard');
    } catch {
      setError('Invalid or expired code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true); setError('');
    try {
      const { data } = await authApi.sendMfaCode(mfaUserId);
      setMaskedEmail(data.maskedEmail || maskedEmail);
      toast.success('New code sent to your email');
      setCode('');
    } catch {
      toast.error('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f7f4' }}>

      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <img
          src={loginIllustration}
          alt="Emergency response"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 20%' }}
        />
        <div className="absolute bottom-10 left-10 right-10">
          <div className="h-px w-16 mb-5" style={{ background: '#f97316' }} />
          <p className="text-white font-semibold text-xl leading-snug mb-2">
            EmergencyConnect UAE
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Unified emergency coordination across all seven emirates
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#f97316' }}>
              EC
            </div>
            <span className="font-semibold text-gray-800">EmergencyConnect</span>
          </Link>

          {!mfaStep ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
              <p className="text-sm text-gray-500 mb-8">Sign in to your operator account</p>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm"
                  style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                    type="text" placeholder="your_username" required
                    value={form.username}
                    onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm text-gray-900 bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                      type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" required
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                  style={{ background: '#f97316', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Signing in...' : <><span>Sign in</span><ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-500">
                New here?{' '}
                <Link to="/register" className="font-medium hover:underline" style={{ color: '#f97316' }}>
                  Create an account
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 p-3.5 rounded-lg mb-6"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <Mail size={16} style={{ color: '#f97316', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-sm font-medium text-gray-800">Check your email</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    We sent a 6-digit code to{' '}
                    {maskedEmail && (
                      <strong className="text-gray-700">{maskedEmail}</strong>
                    )}
                    . It expires in 10 minutes.
                  </p>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify identity</h1>
              <p className="text-sm text-gray-500 mb-7">
                Enter the code from your email to complete sign-in.
              </p>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg mb-5 text-sm"
                  style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Verification code</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-lg text-center text-2xl tracking-[0.4em] font-mono bg-gray-50 border border-gray-200 outline-none focus:border-orange-400 focus:bg-white transition-colors"
                    maxLength={6} placeholder="000000"
                    autoFocus autoComplete="one-time-code" inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button
                  type="submit" disabled={loading || code.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity"
                  style={{ background: '#f97316', opacity: (loading || code.length !== 6) ? 0.5 : 1 }}
                >
                  {loading ? 'Verifying...' : <><span>Verify and sign in</span><ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between">
                <button
                  onClick={() => { setMfaStep(false); setError(''); setCode(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600">
                  Back to sign in
                </button>
                <button
                  onClick={handleResend} disabled={resending}
                  className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                  style={{ color: '#f97316', opacity: resending ? 0.6 : 1 }}>
                  <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
