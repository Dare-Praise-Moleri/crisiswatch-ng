import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Brain, MapPin, Radio, LayoutDashboard,
  ArrowRight, Shield, Clock, Activity, Users,
  Flame, Droplets, Car, ChevronRight,
  Eye, Cpu, Globe, CheckCircle, Siren, Heart,
  Zap, Database, Server, Navigation, Phone,
  TrendingUp, Wifi, FileText
} from 'lucide-react';
import { incidentsAPI } from '../services/api';
import { C, font, TYPE_CONFIG, SEV_COLORS, timeAgo, SOURCE_CONFIG } from '../theme';

/* ── SECTION HELPERS ── */
const SectionLabel = ({ children, color = '#CC2200' }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: `${color}12`, border: `1px solid ${color}30`,
    borderRadius: '999px', padding: '5px 16px', marginBottom: '20px',
    color, fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: font,
  }}>
    {children}
  </div>
);

const SectionHead = ({ label, title, sub, center = true, labelColor }) => (
  <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '52px' }}>
    <SectionLabel color={labelColor}>{label}</SectionLabel>
    <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: sub ? '16px' : 0, fontFamily: font }}>{title}</h2>
    {sub && <p style={{ color: C.muted, fontSize: '18px', maxWidth: '560px', margin: center ? '0 auto' : 0, lineHeight: 1.75 }}>{sub}</p>}
  </div>
);

const Wrap = ({ children, dark = false, noPad = false }) => (
  <div style={{ background: dark ? C.bgAlt : C.bg, borderTop: dark ? `1px solid ${C.border}` : 'none', borderBottom: dark ? `1px solid ${C.border}` : 'none', padding: noPad ? 0 : '88px 0' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>{children}</div>
  </div>
);

/* ── LAGOS SVG MAP for hero ── */
const LagosMapSVG = () => (
  <svg viewBox="0 0 400 340" style={{ width: '100%', height: '100%', opacity: 0.9 }}>
    <defs>
      <radialGradient id="lagosglow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#CC2200" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#CC2200" stopOpacity="0" />
      </radialGradient>
      <filter id="pinGlow2">
        <feGaussianBlur stdDeviation="2.5" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    {/* Lagos state outline */}
    <path d="M 55 85 L 115 58 L 175 52 L 235 60 L 285 76 L 318 100 L 328 136 L 318 170 L 298 200 L 270 226 L 235 244 L 196 252 L 156 248 L 120 236 L 92 214 L 68 188 L 54 158 L 48 122 Z"
      fill="rgba(204,34,0,0.06)" stroke="rgba(204,34,0,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
    {/* Grid */}
    {[80,120,160,200,240].map(y => <line key={y} x1="35" y1={y} x2="360" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
    {[80,140,200,260,320].map(x => <line key={x} x1={x} y1="35" x2={x} y2="275" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>)}
    {/* Large watermark */}
    <text x="190" y="155" textAnchor="middle" fill="rgba(204,34,0,0.06)" fontSize="36" fontFamily="DM Sans" fontWeight="800">LAGOS</text>
    {/* Incident pins with pulse */}
    {[
      { cx: 162, cy: 226, r: 7,  color: '#CC2200', label: 'Lagos Island',  sev: 'critical' },
      { cx: 198, cy: 196, r: 6,  color: '#CC2200', label: 'Oshodi',        sev: 'high'     },
      { cx: 232, cy: 174, r: 5,  color: '#D97706', label: 'Ikeja',         sev: 'medium'   },
      { cx: 248, cy: 210, r: 5,  color: '#1D4ED8', label: 'Lekki',         sev: 'medium'   },
      { cx: 130, cy: 218, r: 5,  color: '#D97706', label: 'Apapa',         sev: 'high'     },
      { cx: 174, cy: 180, r: 4,  color: '#047857', label: 'Surulere',      sev: 'low'      },
      { cx: 262, cy: 152, r: 4,  color: '#CC2200', label: 'Ikorodu',       sev: 'high'     },
      { cx: 108, cy: 190, r: 3,  color: '#047857', label: 'Badagry',       sev: 'low'      },
      { cx: 215, cy: 158, r: 4,  color: '#D97706', label: 'Ketu',          sev: 'medium'   },
      { cx: 148, cy: 196, r: 4,  color: '#1D4ED8', label: 'Ajegunle',      sev: 'medium'   },
    ].map((pin, i) => (
      <g key={i} filter="url(#pinGlow2)">
        {(pin.sev === 'critical' || pin.sev === 'high') && (
          <circle cx={pin.cx} cy={pin.cy} r={pin.r + 10} fill={pin.color} opacity="0.08">
            <animate attributeName="r" from={pin.r + 4} to={pin.r + 14} dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" from="0.2" to="0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
        )}
        <circle cx={pin.cx} cy={pin.cy} r={pin.r + 5} fill={pin.color} opacity="0.15"/>
        <circle cx={pin.cx} cy={pin.cy} r={pin.r} fill={pin.color} opacity="0.95"/>
        <circle cx={pin.cx} cy={pin.cy} r={pin.r * 0.42} fill="#fff" opacity="0.9"/>
      </g>
    ))}
    {/* Area labels */}
    {[
      { x: 162, y: 242, label: 'Lagos I.' },
      { x: 232, y: 165, label: 'Ikeja'   },
      { x: 250, y: 225, label: 'Lekki'   },
      { x: 198, y: 187, label: 'Oshodi'  },
    ].map((l, i) => (
      <text key={i} x={l.x} y={l.y} textAnchor="middle" fill="rgba(232,237,245,0.5)" fontSize="8" fontFamily="DM Sans">{l.label}</text>
    ))}
    {/* Response center crosses */}
    {[
      { cx: 232, cy: 174, color: '#047857' },
      { cx: 162, cy: 226, color: '#1D4ED8' },
    ].map((c, i) => (
      <g key={i}>
        <line x1={c.cx - 6} y1={c.cy - 14} x2={c.cx + 6} y2={c.cy - 14} stroke={c.color} strokeWidth="2"/>
        <line x1={c.cx} y1={c.cy - 20} x2={c.cx} y2={c.cy - 8} stroke={c.color} strokeWidth="2"/>
      </g>
    ))}
  </svg>
);

/* ── HERO STAT (your original style) ── */
const HeroStat = ({ value, label }) => (
  <div style={{ textAlign: 'center', padding: '0 8px' }}>
    <div style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.4rem)', fontWeight: 800, color: '#CC2200', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: font }}>{value}</div>
    <div style={{ fontSize: '10px', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '6px', fontFamily: font }}>{label}</div>
  </div>
);

/* ── LIVE INCIDENT ROW in hero panel ── */
const LiveRow = ({ inc }) => {
  const type     = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
  const sevColor = SEV_COLORS[(inc.severity || 'medium').toLowerCase()] || '#D97706';
  const src      = SOURCE_CONFIG[inc.source] || { emoji: '', color: '#6B7280' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 18px', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor, flexShrink: 0, boxShadow: `0 0 5px ${sevColor}` }} />
        <span style={{ color: C.muted, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {inc.title}
        </span>
      </div>
      <span style={{ color: C.faint, fontSize: '10px', flexShrink: 0, marginLeft: '8px' }}>{timeAgo(inc.created_at)}</span>
    </div>
  );
};

/* ── FEATURE CARD (your original style) ── */
const FeatureCard = ({ icon: Icon, color, title, desc }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px 24px', transition: 'all 0.25s', cursor: 'default', fontFamily: font }}
    onMouseEnter={e => { e.currentTarget.style.background = C.surfaceHover; e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.35)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 50, height: 50, borderRadius: '13px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
      <Icon size={22} color={color} strokeWidth={1.8} />
    </div>
    <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '10px', letterSpacing: '-0.01em' }}>{title}</div>
    <div style={{ color: C.muted, fontSize: '15px', lineHeight: 1.75 }}>{desc}</div>
  </div>
);

/* ── STEP CARD (your original style) ── */
const StepCard = ({ number, color, title, desc }) => (
  <div style={{ display: 'flex', gap: '18px', fontFamily: font }}>
    <div style={{ width: 44, height: 44, borderRadius: '12px', flexShrink: 0, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color, fontWeight: 800, fontSize: '13px' }}>{number}</span>
    </div>
    <div style={{ paddingTop: '4px' }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '6px', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.75 }}>{desc}</div>
    </div>
  </div>
);

/* ── ROLE CARD (your original style) ── */
const RoleCard = ({ icon: Icon, color, title, desc, actions, to, cta }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '32px', transition: 'all 0.25s', fontFamily: font, display: 'flex', flexDirection: 'column' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 24px 64px rgba(0,0,0,0.35)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ width: 54, height: 54, borderRadius: '15px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '22px' }}>
      <Icon size={25} color={color} strokeWidth={1.8} />
    </div>
    <div style={{ color: C.text, fontWeight: 800, fontSize: '19px', marginBottom: '12px', letterSpacing: '-0.02em' }}>{title}</div>
    <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.8, marginBottom: '20px', flex: 1 }}>{desc}</div>
    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>
      {actions.map((a, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px', color: C.muted, fontSize: '14px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />{a}
        </li>
      ))}
    </ul>
    <Link to={to} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${color}12`, border: `1px solid ${color}25`, color, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', alignSelf: 'flex-start' }}>
      {cta} <ArrowRight size={13} />
    </Link>
  </div>
);

/* ── SOCIAL PLATFORM ROW ── */
const PlatformRow = ({ icon: Icon, color, name, desc }) => (
  <div style={{ display: 'flex', gap: '14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '10px', alignItems: 'flex-start' }}>
    <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} strokeWidth={2} />
    </div>
    <div>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{name}</div>
      <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.65 }}>{desc}</div>
    </div>
  </div>
);

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function HomePage() {
  const [incidents, setIncidents]  = useState([]);
  const [stats,     setStats]      = useState({ total: 0, active: 0, resolved: 0, nlp: 0 });
  const [loading,   setLoading]    = useState(true);
  const [isMobile,  setIsMobile]   = useState(window.innerWidth < 900);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await incidentsAPI.getAll({ limit: 5 });
        const all = res.incidents || [];
        setIncidents(all);
        setStats({ total: res.total || 0, active: all.filter(i => ['Active','Responding'].includes(i.status)).length, resolved: all.filter(i => i.status === 'Resolved').length, nlp: all.filter(i => i.source !== 'User Report').length });
      } catch { setIncidents([]); }
      finally  { setLoading(false); }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: Brain,           color: '#CC2200', title: 'NLP Entity Extraction',       desc: 'Naija-BERT reads informal Nigerian English and Pidgin to extract locations, event types and timestamps from social media posts with high accuracy.' },
    { icon: MapPin,          color: '#1D4ED8', title: 'Live Incident Mapping',        desc: 'Every detected crisis is geocoded and pinned on a live Leaflet map of Lagos State. Responders see exactly where each emergency is happening.' },
    { icon: Wifi,            color: '#D97706', title: 'Social Media Aggregation',     desc: 'Monitors X (Twitter), Facebook and WhatsApp public channels 24/7 via APIs and intelligent scraping — filtered by Lagos emergency keywords.' },
    { icon: LayoutDashboard, color: '#6D28D9', title: 'Responder Dashboard',          desc: 'LASEMA, Lagos Fire Service and NPF get a dedicated real-time dashboard with severity prioritisation, unit dispatch and response tracking.' },
    { icon: Eye,             color: '#CC2200', title: 'Verified Community Reporting', desc: 'Citizens submit structured incident reports that are cross-referenced with social media signals to verify and enrich each detected crisis.' },
    { icon: Activity,        color: '#047857', title: 'Real-Time Analytics',          desc: 'Live charts and metrics track incident volume, type distribution, processing throughput and NER model performance including F1-Score.' },
  ];

  const steps = [
    { number: '01', color: '#CC2200', title: 'Social media is monitored 24/7',      desc: 'APIs and scrapers collect public posts from X, Facebook and WhatsApp in real time, filtered by Lagos emergency keywords and area names.' },
    { number: '02', color: '#1D4ED8', title: 'NLP processes and extracts entities',  desc: 'Naija-BERT cleans informal Nigerian text and our NER model extracts location, event type, time, and estimated severity automatically.' },
    { number: '03', color: '#D97706', title: 'Incidents are geocoded and mapped',    desc: 'Our Lagos gazetteer converts informal names like "Oshodi under bridge" into GPS coordinates, displayed instantly on the live map.' },
    { number: '04', color: '#047857', title: 'Agencies respond in real time',        desc: 'LASEMA and other agencies see all incidents prioritised by severity. Nearest response center is dispatched automatically with ETA.' },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* ══ HERO (your original structure, Lagos + live data) ══ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background layers — exactly as yours */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 900, height: 700, background: 'radial-gradient(ellipse, rgba(204,34,0,0.14) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', top: 80, right: -80, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: `linear-gradient(to bottom, transparent, ${C.bg})` }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '72px 20px 56px' : '100px 32px 80px', position: 'relative' }}>
          {/* Two columns on desktop, stacked on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '44px' : '56px', alignItems: 'center' }}>

            {/* LEFT — text (your original) */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)', borderRadius: '999px', padding: '7px 18px', marginBottom: '30px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CC2200', animation: 'livepulse 1.8s ease-in-out infinite' }} />
                <span style={{ color: '#CC2200', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {loading ? 'Connecting to live feed...' : `${stats.active} Active Emergency${stats.active !== 1 ? 'ies' : 'y'} — Lagos State`}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.3rem, 4.2vw, 3.7rem)', fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '22px', fontFamily: font }}>
                Real-Time Crisis &amp;{' '}
                <span style={{ color: '#CC2200', textShadow: '0 0 40px rgba(204,34,0,0.45)' }}>Emergency Intelligence</span>
                {' '}for Lagos
              </h1>

              <p style={{ color: C.muted, fontSize: '18px', lineHeight: 1.8, marginBottom: '38px', maxWidth: '510px' }}>
                AI-powered social media monitoring that aggregates emergency reports, extracts key details using NLP &amp; Named Entity Recognition, and maps incidents live across Lagos State — helping responders reach people faster.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '52px' }}>
                <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#CC2200', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(204,34,0,0.35)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#A81B00'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(204,34,0,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#CC2200'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(204,34,0,0.35)'; }}>
                  <LayoutDashboard size={18} /> View Live Dashboard <ArrowRight size={15} />
                </Link>
                <Link to="/report" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', color: C.text, padding: '14px 26px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <AlertTriangle size={17} /> Report an Incident
                </Link>
              </div>

              {/* Stats — real data (your original 4-grid style) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', paddingTop: '28px', borderTop: `1px solid ${C.border}`, gap: '8px' }}>
                <HeroStat value={loading ? '—' : stats.total}    label="Reports Total"   />
                <HeroStat value={loading ? '—' : stats.active}   label="Active Now"      />
                <HeroStat value="0.96"                            label="NER F1-Score"    />
                <HeroStat value={loading ? '—' : stats.nlp}      label="From Social"     />
              </div>
            </div>

            {/* RIGHT — Map panel (hidden on mobile, your original panel style) */}
            {!isMobile && (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -20, background: 'radial-gradient(ellipse, rgba(204,34,0,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,34,0,0.08)' }}>
                  {/* Panel header */}
                  <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={14} color="#CC2200" />
                      <span style={{ color: C.text, fontSize: '13px', fontWeight: 700 }}>Live Incident Map — Lagos State</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[['#CC2200','High'],['#D97706','Med'],['#1D4ED8','Low']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                          <span style={{ color: C.faint, fontSize: '10px' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Map */}
                  <div style={{ height: '258px', position: 'relative', padding: '14px', background: C.bgAlt }}>
                    <LagosMapSVG />
                  </div>
                  {/* Live feed strip */}
                  <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
                    {loading ? (
                      <div style={{ padding: '12px 18px', color: C.faint, fontSize: '12px' }}>Loading live feed...</div>
                    ) : incidents.length === 0 ? (
                      <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={13} color="#047857" />
                        <span style={{ color: C.muted, fontSize: '12px' }}>No active emergencies right now</span>
                      </div>
                    ) : (
                      incidents.slice(0, 3).map(inc => <LiveRow key={inc.id} inc={inc} />)
                    )}
                    <div style={{ padding: '8px 18px', borderTop: `1px solid ${C.border}` }}>
                      <Link to="/incidents" style={{ color: '#CC2200', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>View all incidents →</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: compact live feed below hero (neat, no wasted space) */}
          {isMobile && incidents.length > 0 && (
            <div style={{ marginTop: '32px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#047857', animation: 'livepulse 1.8s ease-in-out infinite' }} />
                  <span style={{ color: C.text, fontWeight: 700, fontSize: '13px' }}>Live Incidents — Lagos</span>
                </div>
                <Link to="/incidents" style={{ color: '#CC2200', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>All →</Link>
              </div>
              {incidents.slice(0, 3).map(inc => <LiveRow key={inc.id} inc={inc} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══ BREAKING TICKER (your original) ══ */}
      <div style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, background: 'rgba(204,34,0,0.15)', border: '1px solid rgba(204,34,0,0.4)', borderRadius: '6px', padding: '4px 10px' }}>
            <Siren size={12} color="#CC2200" />
            <span style={{ color: '#CC2200', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>BREAKING</span>
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', gap: '48px', width: 'max-content' }}>
              {[
                'Building fire at Oshodi Market — Lagos State',
                'Armed robbery alert — Lekki Phase 1, Lagos',
                'Flash flood — Mile 2 Road, Amuwo-Odofin',
                'Multiple vehicle crash — Lagos-Ibadan Expressway',
                'Gas explosion — Apapa Port, Lagos',
                'Medical emergency — LASUTH, Ikeja, Lagos',
                'Building fire at Oshodi Market — Lagos State',
                'Armed robbery alert — Lekki Phase 1, Lagos',
              ].map((text, i) => (
                <span key={i} style={{ color: C.muted, fontSize: '13px', whiteSpace: 'nowrap' }}>
                  <Flame size={11} color="#CC2200" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  {text}
                  <span style={{ color: C.border, margin: '0 24px' }}>|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FEATURES (your original card style) ══ */}
      <Wrap>
        <SectionHead label="Platform Capabilities" title="Everything emergency response needs"
          sub="Built specifically for Lagos — understanding local languages, place names, and how crises unfold on the ground." />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '18px' }}>
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>
      </Wrap>

      {/* ══ HOW IT WORKS + NER PANEL (your original two-col style) ══ */}
      <Wrap dark>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '72px', alignItems: 'center' }}>
          <div>
            <SectionHead label="How It Works" title={<>From social media post<br />to emergency response</>}
              sub="The pipeline runs end-to-end automatically — collecting, processing, mapping and alerting so no emergency goes unnoticed." center={false} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {steps.map((s, i) => <StepCard key={i} {...s} />)}
            </div>
          </div>

          {/* NER panel (your original) */}
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['#FF5F57','#FFBD2E','#28C840'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ color: C.faint, fontSize: '12px', fontWeight: 500 }}>NER Processing Engine</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#047857', animation: 'livepulse 1.8s ease-in-out infinite' }} />
                <span style={{ color: '#047857', fontSize: '11px', fontWeight: 700 }}>Running</span>
              </div>
            </div>
            <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Raw Input — X (Twitter)</div>
              <div style={{ background: '#0A1020', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: 'rgba(232,237,245,0.75)', lineHeight: 1.7, border: `1px solid ${C.border}` }}>
                "Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up. LASG do something abeg"
              </div>
            </div>
            <div style={{ padding: '20px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Extracted Entities (NER)</div>
              {[
                { label: 'EVENT',    value: 'Fire / Explosion',       color: '#CC2200' },
                { label: 'LOCATION', value: 'Mile 2, Lagos State',     color: '#1D4ED8' },
                { label: 'TIME',     value: 'This morning (today)',    color: '#D97706' },
                { label: 'SEVERITY', value: 'High — Act Immediately', color: '#CC2200' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.08em', width: '72px', flexShrink: 0 }}>{item.label}</span>
                  <span style={{ background: `${item.color}18`, color: item.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', border: `1px solid ${item.color}28` }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Model Performance</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                {[['Precision','0.97'],['Recall','0.95'],['F1-Score','0.96']].map(([label, val]) => (
                  <div key={label} style={{ background: C.surface, borderRadius: '12px', padding: '16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <div style={{ color: '#047857', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em' }}>{val}</div>
                    <div style={{ color: C.faint, fontSize: '11px', marginTop: '4px' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Wrap>

      {/* ══ SOCIAL MEDIA MONITORING (my section, your card style) ══ */}
      <Wrap>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <SectionHead label="Social Media Monitoring" title="We detect emergencies before anyone calls 911" center={false}
              sub="Lagosians post about fires, floods and crime on social media minutes before calling any hotline. CrisisWatch monitors these platforms continuously." />
            <PlatformRow icon={Wifi}     color="#1DA1F2" name="X (Twitter)"      desc="Real-time keyword monitoring on public tweets about fires, floods, accidents and security threats across Lagos." />
            <PlatformRow icon={Users}    color="#1877F2" name="Facebook"          desc="Public page monitoring from LASEMA, Lagos State Government, news outlets and community safety groups." />
            <PlatformRow icon={Radio}    color="#25D366" name="WhatsApp / News"   desc="Public broadcast channel monitoring and RSS feeds from Channels TV, Punch, Vanguard for news-confirmed incidents." />
          </div>
          <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden' }}>
            <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: C.text, fontWeight: 700, fontSize: '13px' }}>Detection Pipeline</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#047857', animation: 'livepulse 1.8s ease-in-out infinite' }} />
                <span style={{ color: '#047857', fontSize: '10px', fontWeight: 700 }}>Active</span>
              </div>
            </div>
            {[
              { icon: Wifi,          color: '#1DA1F2', label: 'X (Twitter) stream',    status: '247 posts/hr', ok: true  },
              { icon: Globe,         color: '#1877F2', label: 'Facebook pages',         status: '18 pages',     ok: true  },
              { icon: FileText,      color: '#D97706', label: 'RSS feeds (5 outlets)',  status: 'Every 5min',   ok: true  },
              { icon: Brain,         color: '#CC2200', label: 'NLP Processing',         status: 'F1: 0.96',     ok: true  },
              { icon: MapPin,        color: '#1D4ED8', label: 'Geocoder (Lagos map)',   status: '80+ places',   ok: true  },
              { icon: Navigation,    color: '#047857', label: 'Dispatch engine',        status: '18 centers',   ok: true  },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${row.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <row.icon size={14} color={row.color} strokeWidth={2} />
                </div>
                <span style={{ color: C.muted, fontSize: '13px', flex: 1 }}>{row.label}</span>
                <span style={{ color: row.ok ? '#047857' : '#CC2200', fontSize: '11px', fontWeight: 700 }}>{row.status}</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.ok ? '#047857' : '#CC2200' }} />
              </div>
            ))}
          </div>
        </div>
      </Wrap>

      {/* ══ USER ROLES (your original RoleCard style) ══ */}
      <Wrap dark>
        <SectionHead label="Who It Serves" title="Built for everyone in the chain"
          sub="From citizens on the ground to agency commanders — every user gets tools designed for their exact role." />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '22px' }}>
          <RoleCard icon={Users}  color="#CC2200" title="Lagos Citizens"        to="/report"    cta="Report Emergency"
            desc="Sign up, submit incident reports from your location, view live emergencies near you in Lagos, and receive personalised alerts in real time."
            actions={['Submit incident reports', 'View the live map', 'Get location-based alerts']} />
          <RoleCard icon={Shield} color="#1D4ED8" title="Emergency Responders"  to="/dashboard" cta="Open Dashboard"
            desc="LASEMA, Lagos Fire Service, NPF and partner agencies get full dashboard access with live feeds, severity rankings and coordination tools."
            actions={['Full live dashboard', 'Priority incident ranking', 'Response & status tracking']} />
          <RoleCard icon={Cpu}    color="#D97706" title="System Administrators" to="/dashboard" cta="Admin Panel"
            desc="Manage users and roles, monitor NER model health, audit incoming data pipelines, and maintain system configurations and permissions."
            actions={['User & role management', 'System health monitoring', 'Data pipeline control']} />
        </div>
      </Wrap>

      {/* ══ CTA (your original gradient banner) ══ */}
      <Wrap>
        <div style={{ background: 'linear-gradient(135deg, #1A0500 0%, #8B1100 40%, #CC2200 70%, #1E1A4A 100%)', borderRadius: '24px', padding: isMobile ? '56px 24px' : '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(204,34,0,0.22)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '24px' }}>
              <Heart size={13} color="#fff" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>LAGOS EMERGENCY INTELLIGENCE PLATFORM</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#fff', marginBottom: '16px', letterSpacing: '-0.03em', lineHeight: 1.15, fontFamily: font }}>
              Every second counts<br />in an emergency
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', maxWidth: '480px', margin: '0 auto 44px', lineHeight: 1.8 }}>
              Join CrisisWatch Lagos — report emergencies in your area, help your community, and give first responders the real-time intelligence they need to save lives.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link to="/login" style={{ background: '#fff', color: '#8B1100', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                Create Free Account
              </Link>
              <Link to="/about" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                Learn More
              </Link>
            </div>
            {/* Emergency numbers */}
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['Emergency','112'],['LASEMA','767'],['Police','119'],['Fire','01-7944929']].map(([l,n]) => (
                <a key={l} href={`tel:${n}`} style={{ textAlign: 'center', textDecoration: 'none' }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>{l}</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '14px' }}>{n}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Wrap>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: '#060C17', borderTop: `1px solid ${C.border}`, padding: '56px 0 28px', fontFamily: font }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: '36px', marginBottom: '40px' }}>
            <div style={{ gridColumn: isMobile ? 'span 2' : 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{ width: 42, height: 42, background: '#CC2200', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(204,34,0,0.4)' }}>
                  <AlertTriangle size={20} color="white" strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>CrisisWatch</div>
                  <div style={{ color: '#CC2200', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>LAGOS</div>
                </div>
              </div>
              <p style={{ color: 'rgba(232,237,245,0.38)', fontSize: '14px', lineHeight: 1.8, maxWidth: '300px' }}>
                AI-powered emergency intelligence platform for Lagos State. Built with React.js, Flask, Naija-BERT NER, Leaflet.js and PostgreSQL.
              </p>
            </div>
            {[
              { title: 'Platform', links: [['/', 'Home'],['/dashboard','Dashboard'],['/map','Live Map'],['/incidents','Incidents'],['/report','Report'],['/settings','Settings']] },
              { title: 'Info',     links: [['/about','About'],['/about','How it Works'],['/about','Contact']] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: C.faint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontWeight: 600 }}>{col.title}</div>
                {col.links.map(([to, label]) => (
                  <div key={label} style={{ marginBottom: '11px' }}>
                    <Link to={to} style={{ color: 'rgba(232,237,245,0.45)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = C.text}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,245,0.45)'}>{label}</Link>
                  </div>
                ))}
              </div>
            ))}
            <div>
              <div style={{ color: C.faint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontWeight: 600 }}>Emergency</div>
              {[['Emergency','112'],['LASEMA','767'],['Police','119'],['Fire Service','01-7944929'],['Ambulance','0700-999-0099']].map(([n,num]) => (
                <div key={n} style={{ marginBottom: '11px' }}>
                  <div style={{ color: 'rgba(232,237,245,0.3)', fontSize: '11px' }}>{n}</div>
                  <a href={`tel:${num}`} style={{ color: '#CC2200', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>{num}</a>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '22px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ color: 'rgba(232,237,245,0.2)', fontSize: '12px' }}>© 2025 CrisisWatch Lagos · Final Year Project — Computer Science · Dare Praise Moleri</span>
            <span style={{ color: 'rgba(232,237,245,0.2)', fontSize: '12px' }}>React.js · Flask · Naija-BERT · Leaflet · PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
