/**
 * CSC408 - Spring 2026
 * Section: 104 | Group: 6
 * Members: Yohannis-1093892, Indalu-1093915, Biniam-1093887
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Shield, Zap, MapPin, AlertTriangle, Clock, CheckCircle, Phone, Mail, ChevronDown } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

function AnimatedSection({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={stagger} className={className}>
      {children}
    </motion.div>
  );
}

function CounterCard({ value, label, suffix = '' }) {
  return (
    <motion.div variants={fadeUp} className="text-center">
      <div className="text-4xl font-black mb-1" style={{ color: 'white' }}>
        {value}{suffix}
      </div>
      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</div>
    </motion.div>
  );
}

const features = [
  { icon: AlertTriangle, title: 'Real-Time Incident Tracking', desc: 'Monitor and manage every emergency across all 7 UAE emirates from a single unified dashboard.' },
  { icon: Zap, title: 'Smart Dispatch Engine', desc: 'AI-powered unit scoring using proximity, severity, and SLA metrics for fastest possible response.' },
  { icon: Shield, title: 'Secure & Resilient', desc: 'JWT authentication, MFA, IP blacklisting, and database sharding for maximum security and uptime.' },
  { icon: MapPin, title: 'Emirates-Aware Routing', desc: 'Geo-sharded data architecture covering Abu Dhabi, Dubai, Sharjah, and all northern emirates.' },
  { icon: Clock, title: 'Audit & Compliance', desc: 'Complete event audit trail with real-time WebSocket streaming and downloadable reports.' },
  { icon: CheckCircle, title: 'Resource Intelligence', desc: 'Live hospital bed counts, ambulance GPS tracking, and automatic unit availability management.' },
];

const steps = [
  { n: '01', title: 'Report Incident', desc: 'A citizen or operator reports an emergency with location, severity, and type details.' },
  { n: '02', title: 'Smart Assessment', desc: 'The system instantly categorizes and scores the incident based on severity and available resources.' },
  { n: '03', title: 'Dispatch Resources', desc: 'The Smart Dispatch Engine recommends the nearest qualified units with ETA calculations.' },
  { n: '04', title: 'Real-Time Tracking', desc: 'All stakeholders track the incident lifecycle until resolution with full audit logging.' },
];

const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'UAQ', 'RAK', 'Fujairah'];

export default function Landing() {
  return (
    <div style={{ background: 'var(--ec-bg)', color: 'var(--ec-text)' }} className="min-h-screen">
      {}
      <div style={{ background: 'var(--ec-orange)' }} className="py-2 px-6 hidden md:flex items-center justify-between text-sm text-white">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><Clock size={13} /> 24/7 Emergency Operations</span>
          <span className="flex items-center gap-2"><Mail size={13} /> ops@emergencyconnect.ae</span>
        </div>
        <div className="flex items-center gap-2"><Phone size={13} /> Emergency: 999 | Police: 998</div>
      </div>

      {}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--ec-border)', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }} className="sticky top-0 z-40 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div style={{ background: 'var(--ec-orange)', borderRadius: '50%', width: 36, height: 36 }}
              className="flex items-center justify-center text-white font-black text-sm">EC</div>
            <span className="font-black text-lg" style={{ color: 'var(--ec-text)' }}>EmergencyConnect<span style={{ color: 'var(--ec-orange)' }}>.</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: 'var(--ec-text-muted)' }}>
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-orange-600 transition-colors">How It Works</a>
            <a href="#coverage" className="hover:text-orange-600 transition-colors">Coverage</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
              style={{ color: 'var(--ec-text)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c2410c'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ec-text)'}>
              Sign In
            </Link>
            <Link to="/register" className="ec-btn ec-btn-primary text-sm rounded-full px-5 py-2">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {}
      <section style={{ background: 'var(--ec-bg-card)', borderRadius: '0 0 40px 40px' }}
        className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div style={{ background: 'radial-gradient(circle at 70% 50%, rgba(249,115,22,0.12), transparent 60%)' }} className="absolute inset-0" />
          <div style={{ position: 'absolute', right: '5%', top: '10%', width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(239,68,68,0.06), transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="section-label mb-6">
              UAE Emergency Management System
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }}
              className="text-5xl md:text-7xl font-black leading-none mb-6">
              Protecting Lives<br />
              <span style={{ color: 'var(--ec-orange)' }}>Across Every</span><br />
              Emirate
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg mb-10 max-w-xl" style={{ color: 'var(--ec-text-muted)', lineHeight: 1.7 }}>
              A distributed, real-time emergency coordination platform connecting first responders,
              dispatch centers, and hospitals across the UAE — built for speed, scale, and safety.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4">
              <Link to="/register" className="ec-btn ec-btn-primary text-base rounded-full px-7 py-3">
                Launch Operations <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="ec-btn ec-btn-ghost text-base rounded-full px-7 py-3">
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>

        {}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="max-w-7xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: '7', s: '', l: 'Emirates Covered' },
            { v: '< 3', s: 'min', l: 'Avg. Dispatch Time' },
            { v: '99.9', s: '%', l: 'System Uptime' },
            { v: '24', s: '/7', l: 'Operations' },
          ].map(({ v, s, l }) => (
            <div key={l} style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
              className="px-5 py-4 text-center">
              <div className="text-3xl font-black" style={{ color: 'var(--ec-orange)' }}>{v}<span className="text-lg">{s}</span></div>
              <div className="text-xs mt-1" style={{ color: 'var(--ec-text-muted)' }}>{l}</div>
            </div>
          ))}
        </motion.div>

        <div className="flex justify-center mt-12">
          <motion.a href="#features" animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
            style={{ color: 'var(--ec-text-muted)' }}>
            <ChevronDown size={24} />
          </motion.a>
        </div>
      </section>

      {}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label justify-center mb-4">Core Capabilities</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black mb-4">
              Built for Emergency Scale
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--ec-text-muted)' }}>
              Every feature designed around the single most critical requirement: saving lives faster.
            </motion.p>
          </AnimatedSection>
          <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp}
                style={{ background: 'var(--ec-bg-card)', border: '1px solid var(--ec-border)', borderRadius: '20px' }}
                className="p-6 card-glow transition-all duration-300">
                <div style={{ background: 'rgba(249,115,22,0.15)', borderRadius: '12px', width: 48, height: 48 }}
                  className="flex items-center justify-center mb-4">
                  <Icon size={22} style={{ color: 'var(--ec-orange)' }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ec-text-muted)' }}>{desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {}
      <section style={{ background: 'var(--ec-orange)' }} className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <CounterCard value="15,000" suffix="+" label="Incidents Managed" />
            <CounterCard value="98.7" suffix="%" label="Response Success Rate" />
            <CounterCard value="3" label="Database Shards" />
            <CounterCard value="5" label="Microservices" />
          </AnimatedSection>
        </div>
      </section>

      {}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <motion.div variants={fadeUp} className="section-label justify-center mb-4">The Process</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black">
              How We Ensure Every Step<br />of the Emergency Response
            </motion.h2>
          </AnimatedSection>
          <AnimatedSection className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px" style={{ background: 'var(--ec-border)' }} />
            {steps.map(({ n, title, desc }, i) => (
              <motion.div key={n} variants={fadeUp} className="relative flex flex-col items-center text-center p-6">
                <div style={{ background: i === 0 ? 'var(--ec-orange)' : 'var(--ec-bg-elevated)',
                  border: `2px solid ${i === 0 ? 'var(--ec-orange)' : 'var(--ec-border)'}`,
                  borderRadius: '50%', width: 56, height: 56, zIndex: 1 }}
                  className="flex items-center justify-center font-black text-lg mb-5">
                  <span style={{ color: i === 0 ? 'white' : 'var(--ec-orange)' }}>{n}</span>
                </div>
                <h3 className="text-base font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--ec-text-muted)' }}>{desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {}
      <section id="coverage" style={{ background: 'var(--ec-bg-card)' }} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <motion.div variants={fadeUp} className="section-label justify-center mb-4">Full Coverage</motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl font-black mb-4">
              All 7 UAE Emirates, One Platform
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'var(--ec-text-muted)' }}>
              Geographically sharded database ensures low-latency operations in every emirate.
            </motion.p>
          </AnimatedSection>
          <AnimatedSection className="flex flex-wrap justify-center gap-3">
            {emirates.map((e, i) => (
              <motion.div key={e} variants={fadeUp}
                style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: '12px' }}
                className="px-5 py-3 flex items-center gap-2 card-glow">
                <div style={{ background: 'var(--ec-orange)', borderRadius: '50%', width: 8, height: 8 }} />
                <span className="font-semibold text-sm">{e}</span>
                <span style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--ec-orange)', fontSize: '0.65rem', borderRadius: '4px', padding: '1px 6px' }}
                  className="font-semibold uppercase">
                  Shard {i < 2 ? '0' : i < 4 ? '1' : '2'}
                </span>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <motion.div variants={fadeUp}
              style={{ background: 'var(--ec-orange)', borderRadius: '28px' }}
              className="p-12">
              <div className="section-label justify-center mb-4" style={{ color: 'white' }}>
                <span className="section-label-override" style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  • READY TO DEPLOY
                </span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                Join UAE's Emergency Network Today
              </h2>
              <p className="text-orange-100 mb-8 text-lg max-w-xl mx-auto">
                Connect your team to the most advanced emergency coordination system in the region.
              </p>
              <Link to="/register"
                className="inline-flex items-center gap-2 bg-white font-bold px-8 py-3.5 rounded-full text-base transition-all hover:shadow-lg"
                style={{ color: 'var(--ec-orange-dark)' }}>
                Create Account <ArrowRight size={16} />
              </Link>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {}
      <footer style={{ background: 'var(--ec-bg-card)', borderTop: '1px solid var(--ec-border)' }} className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div style={{ background: 'var(--ec-bg-elevated)', border: '1px solid var(--ec-border)', borderRadius: '16px' }}
            className="flex flex-wrap items-center justify-between gap-4 p-5 mb-10">
            <div className="flex items-center gap-3">
              <div style={{ background: 'var(--ec-orange)', borderRadius: '10px', width: 40, height: 40 }}
                className="flex items-center justify-center text-white font-black">EC</div>
              <span className="font-bold">EmergencyConnect UAE</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--ec-text-muted)' }}>
              <span className="flex items-center gap-2"><Phone size={14} /> 999 (Emergency)</span>
              <span className="flex items-center gap-2"><Mail size={14} /> ops@emergencyconnect.ae</span>
              <span className="flex items-center gap-2"><MapPin size={14} /> UAE Coverage: All Emirates</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-between items-center gap-4 text-sm" style={{ color: 'var(--ec-text-muted)' }}>
            <p>© 2026 EmergencyConnect UAE. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              <Link to="/login" className="hover:text-orange-400 transition-colors">Operator Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
