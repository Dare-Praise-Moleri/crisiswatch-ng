import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Brain, MapPin, Radio, LayoutDashboard,
  ArrowRight, Shield, Clock, Activity, Users,
  Flame, Droplets, Car, Zap, ChevronRight,
  Siren, Eye, Cpu, Globe
} from 'lucide-react';

/* ─── DESIGN TOKENS ─── */
const C = {
  primary:      '#CC2200',
  primaryHover: '#A81B00',
  primaryGlow:  'rgba(204,34,0,0.25)',
  primarySoft:  'rgba(204,34,0,0.1)',
  accent:       '#FF6B35',
  blue:         '#2563EB',
  amber:        '#F59E0B',
  green:        '#10B981',
  bg:           '#080E1A',
  bgAlt:        '#0D1525',
  surface:      '#111827',
  surfaceHover: '#1A2438',
  border:       'rgba(255,255,255,0.07)',
  borderHover:  'rgba(255,255,255,0.15)',
  text:         '#E8EDF5',
  muted:        'rgba(232,237,245,0.55)',
  faint:        'rgba(232,237,245,0.3)',
};

const font = "'DM Sans', system-ui, sans-serif";

/* ─── HELPERS ─── */
const wrap = (children, dark = false, noPad = false) => (
  <div style={{
    background: dark ? C.bgAlt : C.bg,
    borderTop: dark ? `1px solid ${C.border}` : 'none',
    borderBottom: dark ? `1px solid ${C.border}` : 'none',
    padding: noPad ? 0 : '88px 0',
  }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
      {children}
    </div>
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: C.primarySoft, border: `1px solid rgba(204,34,0,0.3)`,
    borderRadius: '999px', padding: '5px 16px', marginBottom: '20px',
    color: C.primary, fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: font,
  }}>
    {children}
  </div>
);

const SectionHead = ({ label, title, sub, center = true }) => (
  <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '56px' }}>
    <SectionLabel>{label}</SectionLabel>
    <h2 style={{
      fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)', fontWeight: 800,
      color: C.text, letterSpacing: '-0.03em', lineHeight: 1.15,
      marginBottom: sub ? '16px' : 0, fontFamily: font,
    }}>{title}</h2>
    {sub && <p style={{ color: C.muted, fontSize: '20px', maxWidth: '540px', margin: center ? '0 auto' : 0, lineHeight: 1.75 }}>{sub}</p>}
  </div>
);

/* ─── SVG MAP OF NIGERIA (simplified) ─── */
const NigeriaMapSVG = () => (
  <svg viewBox="0 0 400 380" style={{ width: '100%', height: '100%', opacity: 0.55 }}>
    <defs>
      <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#CC2200" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#CC2200" stopOpacity="0" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Nigeria outline — simplified path */}
    <path
      d="M 80 80 L 120 60 L 160 55 L 200 50 L 240 58 L 280 65 L 310 80 L 330 110 L 340 140 L 335 170 L 320 195 L 310 220 L 300 250 L 285 270 L 260 285 L 235 295 L 210 300 L 185 298 L 160 290 L 135 275 L 115 255 L 100 230 L 88 205 L 78 178 L 72 150 L 70 120 Z"
      fill="rgba(204,34,0,0.06)"
      stroke="rgba(204,34,0,0.4)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Grid lines */}
    {[100,150,200,250,300].map(y => (
      <line key={y} x1="50" y1={y} x2="370" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
    ))}
    {[80,140,200,260,320].map(x => (
      <line key={x} x1={x} y1="40" x2={x} y2="330" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
    ))}
    {/* Incident pins */}
    {[
      { cx: 175, cy: 255, r: 6, color: '#CC2200', label: 'Lagos' },
      { cx: 220, cy: 165, r: 5, color: '#CC2200', label: 'Abuja' },
      { cx: 255, cy: 200, r: 4, color: '#F59E0B', label: 'Enugu' },
      { cx: 145, cy: 200, r: 4, color: '#F59E0B', label: 'Ibadan' },
      { cx: 280, cy: 155, r: 4, color: '#2563EB', label: 'Kaduna' },
      { cx: 195, cy: 285, r: 3, color: '#10B981', label: 'PH' },
    ].map((pin, i) => (
      <g key={i} filter="url(#glow)">
        <circle cx={pin.cx} cy={pin.cy} r={pin.r + 8} fill={pin.color} opacity="0.12"/>
        <circle cx={pin.cx} cy={pin.cy} r={pin.r + 4} fill={pin.color} opacity="0.2"/>
        <circle cx={pin.cx} cy={pin.cy} r={pin.r} fill={pin.color} opacity="0.9"/>
        <circle cx={pin.cx} cy={pin.cy} r={pin.r - 2} fill="#fff" opacity="0.6"/>
      </g>
    ))}
    {/* Connection lines */}
    <line x1="175" y1="255" x2="220" y2="165" stroke="rgba(204,34,0,0.25)" strokeWidth="1" strokeDasharray="4,4"/>
    <line x1="220" y1="165" x2="255" y2="200" stroke="rgba(245,158,11,0.25)" strokeWidth="1" strokeDasharray="4,4"/>
    <line x1="220" y1="165" x2="280" y2="155" stroke="rgba(37,99,235,0.25)" strokeWidth="1" strokeDasharray="4,4"/>
    <text x="220" y="145" textAnchor="middle" fill="rgba(232,237,245,0.6)" fontSize="9" fontFamily="DM Sans">FCT • ABUJA</text>
    <text x="155" y="270" textAnchor="middle" fill="rgba(232,237,245,0.6)" fontSize="9" fontFamily="DM Sans">LAGOS</text>
  </svg>
);

/* ─── STAT CARD ─── */
const HeroStat = ({ value, label }) => (
  <div style={{ textAlign: 'center', padding: '0 8px' }}>
    <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: C.primary, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: font }}>{value}</div>
    <div style={{ fontSize: '11px', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px', fontFamily: font }}>{label}</div>
  </div>
);

/* ─── FEATURE CARD ─── */
const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '16px', padding: '28px 26px',
    transition: 'all 0.25s', cursor: 'default', fontFamily: font,
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = C.surfaceHover;
      e.currentTarget.style.borderColor = `${color}44`;
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.4)`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = C.surface;
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: 50, height: 50, borderRadius: '13px',
      background: `${color}18`, border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
    }}>
      <Icon size={22} color={color} strokeWidth={1.8} />
    </div>
    <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '10px', letterSpacing: '-0.01em' }}>{title}</div>
    <div style={{ color: C.muted, fontSize: '17px', lineHeight: 1.75 }}>{desc}</div>
  </div>
);

/* ─── INCIDENT ROW ─── */
const IncidentRow = ({ icon: Icon, color, title, location, source, time, severity }) => {
  const S = {
    High:   { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)',   border: C.primary },
    Medium: { text: '#FFD180', bg: 'rgba(245,158,11,0.18)', border: C.amber  },
    Low:    { text: '#69F0AE', bg: 'rgba(16,185,129,0.18)', border: C.green  },
  }[severity];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '16px 20px', borderRadius: '12px',
      borderLeft: `3px solid ${S.border}`,
      background: C.surface, marginBottom: '8px',
      transition: 'all 0.2s', cursor: 'pointer', fontFamily: font,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = C.surfaceHover; e.currentTarget.style.transform = 'translateX(4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ width: 42, height: 42, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '17px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ color: C.faint, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={11}/> {location}</span>
          <span style={{ color: C.faint, fontSize: '15px' }}>{source}</span>
          <span style={{ color: C.faint, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11}/> {time}</span>
        </div>
      </div>
      <span style={{ background: S.bg, color: S.text, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', flexShrink: 0 }}>{severity}</span>
    </div>
  );
};

/* ─── STEP CARD ─── */
const StepCard = ({ number, title, desc }) => (
  <div style={{ display: 'flex', gap: '18px', fontFamily: font }}>
    <div style={{
      width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
      background: C.primarySoft, border: `1px solid rgba(204,34,0,0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color: C.primary, fontWeight: 800, fontSize: '13px' }}>{number}</span>
    </div>
    <div style={{ paddingTop: '4px' }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '6px', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.75 }}>{desc}</div>
    </div>
  </div>
);

/* ─── ROLE CARD ─── */
const RoleCard = ({ icon: Icon, color, title, desc, actions }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '20px', padding: '32px', transition: 'all 0.25s', fontFamily: font,
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 24px 64px rgba(0,0,0,0.4)`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 54, height: 54, borderRadius: '15px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
      <Icon size={25} color={color} strokeWidth={1.8} />
    </div>
    <div style={{ color: C.text, fontWeight: 800, fontSize: '19px', marginBottom: '12px', letterSpacing: '-0.02em' }}>{title}</div>
    <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.8, marginBottom: '22px' }}>{desc}</div>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {actions.map((a, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'rgba(232,237,245,0.65)', fontSize: '14px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
          {a}
        </li>
      ))}
    </ul>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function HomePage() {

  const features = [
    { icon: Brain,           color: C.primary, title: 'NLP Entity Extraction',        desc: 'Naija-BERT reads informal Nigerian English and Pidgin to extract locations, event types and timestamps from social media posts with high accuracy.' },
    { icon: MapPin,          color: C.blue,    title: 'Live Incident Mapping',         desc: 'Every detected crisis is geocoded and pinned on a live Leaflet map. Nearby events cluster automatically so responders see the full picture instantly.' },
    { icon: Radio,           color: C.amber,   title: 'Social Media Aggregation',      desc: 'Monitors X (Twitter), Facebook and WhatsApp public channels 24/7 via APIs and intelligent scraping — filtering by Nigerian emergency keywords.' },
    { icon: LayoutDashboard, color: '#8B5CF6', title: 'Responder Dashboard',           desc: 'Emergency agencies like NEMA and the Fire Service get a dedicated real-time dashboard with severity prioritisation and response tracking.' },
    { icon: Eye,             color: C.primary, title: 'Verified Community Reporting',  desc: 'Citizens submit structured incident reports that are cross-referenced with social media signals to verify and enrich each detected crisis.' },
    { icon: Activity,        color: C.green,   title: 'Real-Time Analytics',           desc: 'Live charts and metrics track incident volume, type distribution, processing throughput and NER model performance including F1-Score.' },
  ];

  const incidents = [
    { icon: Flame,         color: C.primary, title: 'Building fire near Oshodi Market — heavy black smoke visible from the bridge',   location: 'Oshodi, Lagos',  source: 'X (Twitter)', time: '2 min ago',  severity: 'High'   },
    { icon: AlertTriangle, color: C.amber,   title: 'Armed men spotted at Lekki Phase 1 junction — residents urged to avoid area',    location: 'Lekki, Lagos',   source: 'WhatsApp',    time: '8 min ago',  severity: 'High'   },
    { icon: Droplets,      color: C.blue,    title: 'Flash flood on Mararaba Road — several vehicles completely stranded in water',   location: 'Mararaba, FCT',  source: 'Facebook',    time: '14 min ago', severity: 'Medium' },
    { icon: Car,           color: '#8B5CF6', title: 'Multiple vehicle collision on Lagos-Ibadan Expressway near Sagamu interchange',  location: 'Sagamu, Ogun',   source: 'X (Twitter)', time: '31 min ago', severity: 'Medium' },
  ];

  const steps = [
    { number: '01', title: 'Social media is monitored 24/7',      desc: 'APIs and scrapers collect public posts from X, Facebook and WhatsApp in real time, filtered by Nigerian emergency keywords and geo-tags.' },
    { number: '02', title: 'NLP processes and extracts entities',  desc: 'Naija-BERT cleans informal Nigerian text and our NER model extracts location names, event type, time, and estimated severity automatically.' },
    { number: '03', title: 'Incidents are geocoded and mapped',    desc: 'A Nigerian gazetteer converts informal names like "Oshodi under bridge" into GPS coordinates displayed instantly on the live map.' },
    { number: '04', title: 'Agencies respond in real time',        desc: 'Emergency organisations see all incidents prioritised by severity and can assign responders, update status, and track resolution from the dashboard.' },
  ];

  const roles = [
    { icon: Users,  color: C.primary, title: 'General Public',        desc: 'Sign up, submit incident reports from your location, view live emergencies near you, and receive personalised alerts in real time.',           actions: ['Submit incident reports', 'View the live map', 'Get location-based alerts'] },
    { icon: Shield, color: C.blue,    title: 'Emergency Responders',  desc: 'NEMA, Fire Service, Police and partner agencies get full dashboard access with live feeds, severity rankings and coordination tools.',          actions: ['Full live dashboard', 'Priority incident ranking', 'Response & status tracking'] },
    { icon: Cpu,    color: C.amber,   title: 'System Administrators', desc: 'Manage incoming data pipelines, monitor NER model health, audit user activity, and maintain system configurations and permissions.',          actions: ['User & role management', 'System health monitoring', 'Data pipeline control'] },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, fontSize: '20px' }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Deep red glow top-center */}
          <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(204,34,0,0.15) 0%, transparent 68%)', }} />
          {/* Subtle blue accent right */}
          <div style={{ position: 'absolute', top: 80, right: -80, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 65%)', }} />
          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '220px', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '100px 32px 80px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
            {/* LEFT — Text */}
            <div>
              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)',
                borderRadius: '999px', padding: '7px 18px', marginBottom: '32px',
              }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
                <span style={{ color: C.primary, fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>Live Monitoring Active — Nigeria</span>
              </div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)', fontWeight: 800,
                color: C.text, lineHeight: 1.1, letterSpacing: '-0.03em',
                marginBottom: '24px', fontFamily: font,
              }}>
                Real-Time Crisis &amp;{' '}
                <span style={{
                  color: C.primary,
                  textShadow: `0 0 40px rgba(204,34,0,0.5)`,
                }}>
                  Emergency Intelligence
                </span>
                {' '}for Nigeria
              </h1>

              {/* Sub */}
              <p style={{ color: C.muted, fontSize: '19px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '520px' }}>
                AI-powered social media monitoring that aggregates emergency reports, extracts key details using NLP &amp; Named Entity Recognition, and maps incidents live — helping responders reach people faster.
              </p>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '56px' }}>
                <Link to="/dashboard" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: C.primary, color: '#fff',
                  padding: '14px 28px', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                  boxShadow: `0 8px 32px rgba(204,34,0,0.35)`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(204,34,0,0.45)`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(204,34,0,0.35)`; }}>
                  <LayoutDashboard size={18} /> View Live Dashboard <ArrowRight size={16} />
                </Link>
                <Link to="/report" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.06)', color: C.text,
                  padding: '14px 28px', borderRadius: '12px',
                  fontSize: '15px', fontWeight: 600, textDecoration: 'none',
                  border: `1px solid rgba(255,255,255,0.12)`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <AlertTriangle size={17} /> Report an Incident
                </Link>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                paddingTop: '32px', borderTop: `1px solid ${C.border}`, gap: '8px',
              }}>
                <HeroStat value="247"  label="Posts Analysed"   />
                <HeroStat value="12"   label="Live Incidents"    />
                <HeroStat value="98%"  label="NER Accuracy"      />
                <HeroStat value="3"    label="States Covered"    />
              </div>
            </div>

            {/* RIGHT — Map visual */}
            <div style={{ position: 'relative' }}>
              {/* Outer glow ring */}
              <div style={{
                position: 'absolute', inset: -20,
                background: 'radial-gradient(ellipse, rgba(204,34,0,0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }} />
              {/* Map panel */}
              <div style={{
                background: C.bgAlt, border: `1px solid ${C.border}`,
                borderRadius: '24px', overflow: 'hidden',
                boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,34,0,0.1)`,
              }}>
                {/* Panel header */}
                <div style={{
                  background: C.surface, borderBottom: `1px solid ${C.border}`,
                  padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={15} color={C.primary} />
                    <span style={{ color: C.text, fontSize: '13px', fontWeight: 700 }}>Live Incident Map — Nigeria</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[C.primary, C.amber, C.blue].map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                        <span style={{ color: C.faint, fontSize: '10px' }}>{['High','Med','Low'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map area */}
                <div style={{ height: '280px', position: 'relative', padding: '16px' }}>
                  <NigeriaMapSVG />
                </div>

                {/* Live feed strip */}
                <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
                  {[
                    { color: C.primary, text: 'Fire — Oshodi Market, Lagos',    time: '2m' },
                    { color: C.amber,   text: 'Robbery alert — Lekki Phase 1',  time: '8m' },
                    { color: C.blue,    text: 'Flood — Mararaba Road, FCT',     time: '14m' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 20px', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                        <span style={{ color: C.muted, fontSize: '12px', fontWeight: 500 }}>{item.text}</span>
                      </div>
                      <span style={{ color: C.faint, fontSize: '11px' }}>{item.time} ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ BREAKING TICKER ══════════════════ */}
      <div style={{ background: '#0A0F1E', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
            background: 'rgba(204,34,0,0.15)', border: '1px solid rgba(204,34,0,0.4)',
            borderRadius: '6px', padding: '4px 12px',
          }}>
            <Siren size={13} color={C.primary} />
            <span style={{ color: C.primary, fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>BREAKING</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div className="ticker-inner" style={{ display: 'flex', gap: '48px', width: 'max-content' }}>
              {[
                '🔥 Building fire at Oshodi Market, Lagos State',
                '🔫 Armed robbery alert — Lekki Phase 1, Lagos',
                '💧 Flash flood — Mararaba Road, FCT Abuja',
                '🚗 Multiple vehicle crash — Lagos-Ibadan Expressway',
                '⚡ Power explosion reported — Trans Amadi, Port Harcourt',
                '🏥 Medical emergency — National Hospital, Abuja',
              ].concat([
                '🔥 Building fire at Oshodi Market, Lagos State',
                '🔫 Armed robbery alert — Lekki Phase 1, Lagos',
                '💧 Flash flood — Mararaba Road, FCT Abuja',
                '🚗 Multiple vehicle crash — Lagos-Ibadan Expressway',
              ]).map((text, i) => (
                <span key={i} style={{ color: C.muted, fontSize: '13px', whiteSpace: 'nowrap' }}>
                  {text}
                  <span style={{ color: C.border, margin: '0 24px' }}>|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ FEATURES ══════════════════ */}
      {wrap(
        <>
          <SectionHead
            label="Platform Capabilities"
            title="Everything emergency response needs"
            sub="Built specifically for Nigeria — understanding local languages, place names, and how crises unfold on the ground."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '18px' }}>
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </>
      )}

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      {wrap(
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '72px', alignItems: 'center' }}>

          {/* Steps */}
          <div>
            <SectionHead label="How It Works" title={<>From social media post<br />to emergency response</>} sub="The pipeline runs end-to-end automatically — collecting, processing, mapping and alerting so no emergency goes unnoticed." center={false} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {steps.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>

          {/* NER Engine Panel */}
          <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            {/* Title bar */}
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[C.primary, C.amber, C.green].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ color: C.faint, fontSize: '12px', fontWeight: 500 }}>NER Processing Engine</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                <span style={{ color: C.green, fontSize: '11px', fontWeight: 700 }}>Running</span>
              </div>
            </div>

            {/* Raw post */}
            <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Raw Input — X (Twitter)</div>
              <div style={{ background: '#0A1020', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'rgba(232,237,245,0.75)', lineHeight: 1.7, border: `1px solid ${C.border}` }}>
                "Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up. LASG do something abeg 🔥🔥"
              </div>
            </div>

            {/* Entities */}
            <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Extracted Entities (NER)</div>
              {[
                { label: 'EVENT',    value: 'Fire / Explosion',       color: C.primary },
                { label: 'LOCATION', value: 'Mile 2, Lagos State',     color: C.blue    },
                { label: 'TIME',     value: 'This morning (today)',    color: C.amber   },
                { label: 'SEVERITY', value: 'High — Act Immediately', color: C.primary },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.08em', width: '72px', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ background: `${item.color}18`, color: item.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', border: `1px solid ${item.color}28` }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div style={{ padding: '20px' }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Model Performance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {[['Precision','0.97'],['Recall','0.95'],['F1-Score','0.96']].map(([label, val]) => (
                  <div key={label} style={{ background: C.surface, borderRadius: '12px', padding: '16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <div style={{ color: C.green, fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>{val}</div>
                    <div style={{ color: C.faint, fontSize: '11px', marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        true
      )}

      {/* ══════════════════ LIVE INCIDENTS ══════════════════ */}
      {wrap(
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
            <div>
              <SectionLabel>Live Feed</SectionLabel>
              <h2 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: font }}>Recent Incidents</h2>
            </div>
            <Link to="/incidents" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.primary, fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          {incidents.map((inc, i) => <IncidentRow key={i} {...inc} />)}
        </>
      )}

      {/* ══════════════════ USER ROLES ══════════════════ */}
      {wrap(
        <>
          <SectionHead label="Who It Serves" title="Built for everyone in the chain" sub="From citizens on the ground to agency commanders — every user gets tools designed for their exact role." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '22px' }}>
            {roles.map((r, i) => <RoleCard key={i} {...r} />)}
          </div>
        </>,
        true
      )}

      {/* ══════════════════ CTA BANNER ══════════════════ */}
      {wrap(
        <div style={{
          background: `linear-gradient(135deg, #1A0500 0%, #8B1100 40%, #CC2200 70%, #1E1A4A 100%)`,
          borderRadius: '24px', padding: '80px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 32px 80px rgba(204,34,0,0.25)`,
        }}>
          {/* Grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
          {/* Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '24px' }}>
              <Siren size={14} color="#fff" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>EMERGENCY INTELLIGENCE PLATFORM</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.15, fontFamily: font }}>
              Every second counts<br />in an emergency
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.8 }}>
              Join CrisisWatch NG — report incidents from your location, help your community, and give emergency responders the real-time intelligence they need to save lives.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ background: '#fff', color: '#8B1100', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}>
                Create Free Account
              </Link>
              <Link to="/about" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer style={{ background: '#060C17', borderTop: `1px solid ${C.border}`, padding: '64px 0 32px', fontFamily: font }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: 42, height: 42, background: C.primary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${C.primary}44` }}>
                  <AlertTriangle size={20} color="white" strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>CrisisWatch</div>
                  <div style={{ color: C.primary, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>NIGERIA</div>
                </div>
              </div>
              <p style={{ color: 'rgba(232,237,245,0.4)', fontSize: '14px', lineHeight: 1.8, maxWidth: '300px' }}>
                AI-powered emergency intelligence platform for Nigeria. Built with React.js, Flask, Naija-BERT NER, Leaflet.js and PostgreSQL.
              </p>
            </div>

            {[
              { title: 'Platform', links: [['/', 'Home'], ['/dashboard', 'Dashboard'], ['/map', 'Live Map'], ['/incidents', 'Incidents'], ['/report', 'Report'], ['/alerts', 'Alerts']] },
              { title: 'Info', links: [['/about', 'About'], ['/about', 'Privacy Policy'], ['/about', 'Terms of Use'], ['/about', 'Contact']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: C.faint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '20px', fontWeight: 600 }}>{col.title}</div>
                {col.links.map(([to, label]) => (
                  <div key={label} style={{ marginBottom: '12px' }}>
                    <Link to={to} style={{ color: 'rgba(232,237,245,0.5)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = C.text}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,245,0.5)'}>
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ color: 'rgba(232,237,245,0.2)', fontSize: '12px' }}>© 2025 CrisisWatch Nigeria · Final Year Project — Computer Science</span>
            <span style={{ color: 'rgba(232,237,245,0.2)', fontSize: '12px' }}>React.js · Flask · Naija-BERT · Leaflet · PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}