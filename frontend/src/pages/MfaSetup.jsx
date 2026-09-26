/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';

export default function MfaSetup() {
  const { user, completeMfa } = useAuth();
  const navigate = useNavigate();
  const codeRef = useRef(null);

  const [step, setStep] = useState('loading');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user?.id) { navigate('/login'); return; }
    authApi.setupMfa(user.id)
      .then(({ data }) => {
        setMaskedEmail(data.maskedEmail || '');
        setStep('verify');
        setTimeout(() => codeRef.current?.focus(), 100);
      })
      .catch(() => {
        toast.error('Failed to enable MFA. Please try again.');
        setStep('error');
      });
  }, [user, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const { data } = await authApi.verifyMfa({ userId: user.id, totpCode: code });
      completeMfa(data);
      setDone(true);
      toast.success('MFA enabled successfully');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch {
      setError('Invalid or expired code. Request a new one and try again.');
      setCode('');
      setTimeout(() => codeRef.current?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setCode('');
    try {
      const { data } = await authApi.sendMfaCode(user.id);
      setMaskedEmail(data.maskedEmail || maskedEmail);
      toast.success('New verification code sent');
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch {
      toast.error('Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--ec-bg)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <div className="flex items-center gap-3 mb-8">
          <div style={{ background: 'var(--ec-orange)', borderRadius: '12px' }}
            className="w-11 h-11 flex items-center justify-center">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <div className="font-black text-xl" style={{ color: 'var(--ec-text)' }}>
              Set Up Two-Factor Auth
            </div>
            <div className="text-xs" style={{ color: 'var(--ec-text-muted)' }}>
              Required for DISPATCHER and ADMIN accounts
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
          className="p-6">

          {done ? (
            <div className="text-center py-8">
              <CheckCircle size={52} style={{ color: '#22c55e' }} className="mx-auto mb-4" />
              <div className="text-lg font-bold mb-1" style={{ color: 'var(--ec-text)' }}>
                MFA Activated
              </div>
              <div className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>
                Redirecting to dashboard...
              </div>
            </div>
          ) : step === 'loading' ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--ec-orange)', borderTopColor: 'transparent' }} />
              <div className="text-sm" style={{ color: 'var(--ec-text-muted)' }}>
                Enabling MFA on your account...
              </div>
            </div>
          ) : step === 'error' ? (
            <div className="text-center py-8">
              <AlertCircle size={48} style={{ color: '#dc2626' }} className="mx-auto mb-4" />
              <div className="text-base font-semibold mb-2" style={{ color: 'var(--ec-text)' }}>
                Something went wrong
              </div>
              <div className="text-sm mb-6" style={{ color: 'var(--ec-text-muted)' }}>
                We could not enable MFA on your account. Please refresh the page and try again.
              </div>
              <button onClick={() => window.location.reload()}
                className="ec-btn ec-btn-primary px-6 py-2 rounded-lg text-sm">
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <Mail size={20} style={{ color: 'var(--ec-orange)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--ec-text)' }}>
                    Check your email
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--ec-text-muted)' }}>
                    A 6-digit verification code was sent to{' '}
                    <span className="font-semibold" style={{ color: 'var(--ec-text)' }}>
                      {maskedEmail || 'your registered email'}
                    </span>
                    . Enter it below to confirm MFA is working.
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#dc2626' }}>
                  <AlertCircle size={14} className="flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--ec-text-muted)' }}>
                    Verification Code
                  </label>
                  <input
                    ref={codeRef}
                    className="ec-input text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="ec-btn ec-btn-primary w-full justify-center py-3 rounded-xl text-base"
                  style={{ opacity: (verifying || code.length !== 6) ? 0.6 : 1 }}>
                  {verifying ? 'Verifying...' : 'Activate MFA'}
                  {!verifying && <ArrowRight size={16} />}
                </button>
              </form>

              <div className="flex items-center justify-center mt-5">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="flex items-center gap-2 text-xs font-medium transition-colors"
                  style={{ color: resending ? 'var(--ec-text-muted)' : 'var(--ec-orange)' }}>
                  <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
                  {resending ? 'Sending...' : 'Resend code'}
                </button>
              </div>

              <div className="mt-5 p-3 rounded-lg text-xs text-center"
                style={{ background: 'var(--ec-bg-elevated)', color: 'var(--ec-text-muted)' }}>
                Codes expire after 10 minutes. Once activated, you will receive a code by email on every login.
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
