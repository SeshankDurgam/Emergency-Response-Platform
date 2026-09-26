/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { motion } from 'framer-motion';
import { Siren } from 'lucide-react';

export default function LoadingSpinner({ size = 40, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <motion.div
        style={{ width: size, height: size, border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p style={{ color: 'var(--ec-text-muted)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
}

export function FullPageLoader({ text = 'Loading...' }) {
  return (
    <div style={{ background: 'var(--ec-bg)' }} className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-16 h-16">
          <motion.div
            style={{ border: '3px solid #e2e8f0', borderTopColor: '#f97316', borderRadius: '50%', width: '100%', height: '100%', position: 'absolute' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Siren size={20} style={{ color: 'var(--ec-orange)' }} />
          </div>
        </div>
        <p style={{ color: 'var(--ec-text-muted)' }} className="text-sm">{text}</p>
      </motion.div>
    </div>
  );
}
