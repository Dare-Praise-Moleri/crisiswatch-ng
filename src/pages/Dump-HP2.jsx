import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, MapPin, Shield,
  Clock, CheckCircle, ChevronRight, Flame,
  Droplets, Car, Users, Activity,
  Brain
} from 'lucide-react';
import { incidentsAPI } from '../services/api';

const font = "'DM Sans', system-ui, sans-serif";

const C = {
  primary:     '#CC2200',
  primarySoft: 'rgba(204,34,0,0.1)',
  blue:        '#2563EB',
  green:       '#10B981',
  amber:       '#F59E0B',
  purple:      '#8B5CF6',
  bg:          '#080E1A',
  bgAlt:       '#0D1525',
  surface:     '#111827',
  surface2:    '#1A2438',
  border:      'rgba(255,255,255,0.07)',
  text:        '#E8EDF5',
  muted:       'rgba(232,237,245,0.55)',
  faint:       'rgba(232,237,245,0.28)',
};

const TYPE_ICONS = {
  fire:     { icon: Flame,         color: C.primary },
  crime:    { icon: Shield,        color: C.amber   },
  flood:    { icon: Droplets,      color: C.blue    },
  accident: { icon: Car,           color: C.purple  },
  medical:  { icon: Activity,      color: C.green   },
  security: { icon: AlertTriangle, color: C.amber   },
  protest:  { icon: Users,         color: C.purple  },
  other:    { icon: AlertTriangle, color: C.faint   },
};

const SEV_COLORS = {
  critical: '#FF3B30',
  high:     C.primary,
  medium:   C.amber,
  low:      C.green,
};

/* ── LIVE INCIDENT CARD ── */
const LiveCard = ({ inc }) => {
  const mapped   = TYPE_ICONS[inc.type] || TYPE_ICONS.other;
  const Icon     = mapped.icon;
  const sevColor = SEV_COLORS[inc.severity] || C.amber;
  const timeAgo  = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1)  return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };
  return (
    <div style={{
      background: C.surface, borderRadius: '12px',
      borderLeft: `3px solid ${mapped.color}`,
      padding: '14px 16px', display: 'flex',
      gap: '12px', alignItems: 'flex-start',
      border: `1px solid ${C.border}`,
      borderLeftColor: mapped.color,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.surface2}
      onMouseLeave={e => e.currentTarget.style.background = C.surface}
    >
      <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${mapped.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={mapped.color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {inc.location && <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {inc.location}</span>}
          <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {timeAgo(inc.created_at)}</span>
          <span style={{ color: C.faint, fontSize: '12px' }}>{inc.source}</span>
        </div>
      </div>
      <span style={{ background: `${sevColor}20`, color: sevColor, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', flexShrink: 0 }}>
        {inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium'}
      </span>
    </div>
  );
};

/* ── HOW IT WORKS STEP ── */
const Step = ({ num, color, title, desc }) => (
  <div style={{ display: 'flex', gap: '18px' }}>
    <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color, fontWeight: 800, fontSize: '16px' }}>{num}</span>
    </div>
    <div style={{ paddingTop: '6px' }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>{title}</div>
      <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.75 }}>{desc}</div>
    </div>
  </div>
);

/* ── SOCIAL PLATFORM CARD ── */
const PlatformCard = ({ emoji, name, desc, color, stats }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '14px', padding: '22px',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ fontSize: '28px', marginBottom: '12px' }}>{emoji}</div>
    <div style={{ color, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>{name}</div>
    <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.65, marginBottom: '14px' }}>{desc}</div>
    <div style={{ color: C.faint, fontSize: '12px', borderTop: `1px solid ${C.border}`, paddingTop: '12px' }}>{stats}</div>
  </div>
);

/* ═══════════════════════════
   MAIN PAGE
═══════════════════════════ */
export default function HomePage() {
  const [incidents, setIncidents] = useState([]);
  const [stats,     setStats]     = useState({ total: 0, active: 0, resolved: 0 });
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await incidentsAPI.getAll({ limit: 4 });
        const all = res.incidents || [];
        setIncidents(all);
        setStats({
          total:    res.total || 0,
          active:   all.filter(i => ['Active','Responding'].includes(i.status)).length,
          resolved: all.filter(i => i.status === 'Resolved').length,
        });
      } catch { setIncidents([]); }
      finally  { setLoading(false); }
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* ══════════════════════════════
          1. HERO
      ══════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '88px 0 72px' }}>
        {/* Glows */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(204,34,0,0.13) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* Live badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)', borderRadius: '999px', padding: '7px 18px', marginBottom: '28px' }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
                <span style={{ color: C.primary, fontSize: '13px', fontWeight: 700 }}>
                  {loading ? 'Connecting...' : `${stats.active} Active Emergency${stats.active !== 1 ? 'ies' : 'y'} Right Now`}
                </span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.5rem)', fontWeight: 800, color: C.text, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '22px' }}>
                Nigeria's Emergency<br />
                <span style={{ color: C.primary }}>Reporting & Response</span><br />
                Platform
              </h1>

              <p style={{ color: C.muted, fontSize: '17px', lineHeight: 1.8, marginBottom: '36px', maxWidth: '480px' }}>
                In an emergency, every second counts. Report any crisis in under 60 seconds and get connected to NEMA, Police, Fire Service and emergency responders immediately. Our AI monitors social media 24/7 so no emergency goes unnoticed.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link to="/report" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: C.primary, color: '#fff',
                  padding: '15px 32px', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 800, textDecoration: 'none',
                  boxShadow: '0 8px 28px rgba(204,34,0,0.35)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#A81B00'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <AlertTriangle size={19} /> Report Emergency Now
                </Link>
                <Link to="/dashboard" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.07)', color: C.text,
                  padding: '15px 28px', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 600, textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.14)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Shield size={17} /> Agency Dashboard
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {[
                  { value: loading ? '...' : stats.total,    label: 'Total Reports',      color: C.text    },
                  { value: loading ? '...' : stats.active,   label: 'Active Now',          color: C.primary },
                  { value: loading ? '...' : stats.resolved, label: 'Resolved',            color: C.green   },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: i === 1 ? 'center' : i === 2 ? 'right' : 'left' }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '12px', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Live feed panel */}
            <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              {/* Panel header */}
              <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                  <span style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>Live Incident Feed</span>
                </div>
                <Link to="/incidents" style={{ color: C.primary, fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
              </div>

              {/* Live incidents */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: C.faint, fontSize: '14px' }}>Loading live incidents...</div>
                ) : incidents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px' }}>
                    <CheckCircle size={36} color={C.green} style={{ margin: '0 auto 12px' }} />
                    <div style={{ color: C.green, fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>No active emergencies</div>
                    <div style={{ color: C.faint, fontSize: '13px' }}>Nigeria is calm right now</div>
                  </div>
                ) : (
                  incidents.map(inc => <LiveCard key={inc.id} inc={inc} />)
                )}
              </div>

              {/* Report CTA */}
              <div style={{ borderTop: `1px solid ${C.border}`, padding: '14px 16px' }}>
                <Link to="/report" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: C.primary, color: '#fff', borderRadius: '10px',
                  padding: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                }}>
                  <AlertTriangle size={15} /> Report an Emergency
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          2. SOCIAL MEDIA MONITORING
      ══════════════════════════════ */}
      <section style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            {/* Left — NLP panel */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', overflow: 'hidden' }}>
              {/* Terminal bar */}
              <div style={{ background: '#060C17', borderBottom: `1px solid ${C.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '7px' }}>
                  {['#FF5F57','#FFBD2E','#28C840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                </div>
                <span style={{ color: C.faint, fontSize: '12px' }}>NLP Processing Engine</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                  <span style={{ color: C.green, fontSize: '11px', fontWeight: 600 }}>Running</span>
                </div>
              </div>

              {/* Raw input */}
              <div style={{ padding: '18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Raw Post — X (Twitter)</div>
                <div style={{ background: '#060C17', borderRadius: '10px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'rgba(232,237,245,0.75)', lineHeight: 1.7, border: `1px solid ${C.border}` }}>
                  "Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up. LASG do something abeg 🔥🔥"
                </div>
              </div>

              {/* Extracted entities */}
              <div style={{ padding: '18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>NER Extracted Entities</div>
                {[
                  { label: 'EVENT TYPE', value: 'Fire / Explosion',      color: C.primary },
                  { label: 'LOCATION',   value: 'Mile 2, Lagos State',   color: C.blue    },
                  { label: 'TIME',       value: 'This morning (today)',   color: C.amber   },
                  { label: 'SEVERITY',   value: 'High — Act Now',        color: C.primary },
                ].map(e => (
                  <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '9px' }}>
                    <span style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.08em', width: '80px', flexShrink: 0 }}>{e.label}</span>
                    <span style={{ background: `${e.color}18`, color: e.color, fontSize: '12px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', border: `1px solid ${e.color}28` }}>{e.value}</span>
                  </div>
                ))}
              </div>

              {/* GPS */}
              <div style={{ padding: '18px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Geocoded Location</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color={C.blue} />
                  <span style={{ color: C.blue, fontWeight: 700, fontSize: '14px' }}>6.4737° N, 3.3018° E</span>
                  <span style={{ color: C.faint, fontSize: '12px' }}>— Mile 2, Lagos</span>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ padding: '18px' }}>
                <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>Model Performance</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {[['Precision','0.91'],['Recall','0.87'],['F1-Score','0.89']].map(([label, val]) => (
                    <div key={label} style={{ background: C.surface2, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ color: C.green, fontWeight: 800, fontSize: '20px', marginBottom: '3px' }}>{val}</div>
                      <div style={{ color: C.faint, fontSize: '11px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — explanation */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.primarySoft, border: '1px solid rgba(204,34,0,0.3)', borderRadius: '999px', padding: '5px 16px', marginBottom: '20px' }}>
                <Brain size={13} color={C.primary} />
                <span style={{ color: C.primary, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Social Media Monitoring</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.7rem,2.5vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '18px' }}>
                We monitor social media so no emergency goes unnoticed
              </h2>

              <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.85, marginBottom: '28px' }}>
                Every minute, thousands of Nigerians post about emergencies on social media before they call any hotline. CrisisWatch monitors these platforms continuously and uses Named Entity Recognition (NER) to automatically extract the location, incident type and severity from each post — then maps it instantly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {[
                  { icon: '🐦', platform: 'X (Twitter)',  desc: 'Real-time keyword monitoring on public tweets mentioning emergencies, accidents, fires, floods and security threats across Nigeria.' },
                  { icon: '📘', platform: 'Facebook',     desc: 'Public page and group monitoring for community emergency reports, accident updates and disaster alerts.' },
                  { icon: '💬', platform: 'WhatsApp',     desc: 'Public broadcast channel monitoring for community safety alerts and neighbourhood emergency reports.' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>{p.icon}</span>
                    <div>
                      <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{p.platform}</div>
                      <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.65 }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/nlp" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: C.primarySoft, border: '1px solid rgba(204,34,0,0.3)',
                color: C.primary, padding: '12px 22px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(204,34,0,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = C.primarySoft}
              >
                <Brain size={16} /> See NLP Monitor Live <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          3. HOW IT WORKS
      ══════════════════════════════ */}
      <section style={{ padding: '88px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,2.5vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '14px' }}>
              From emergency to response in seconds
            </h2>
            <p style={{ color: C.muted, fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.8 }}>
              Here is exactly what happens from the moment an emergency is detected to when help arrives.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '40px 64px', maxWidth: '900px', margin: '0 auto' }}>
            <Step num="1" color={C.primary} title="Emergency is detected"
              desc="A citizen reports on CrisisWatch, or our system automatically detects the crisis from a social media post on X, Facebook or WhatsApp." />
            <Step num="2" color={C.blue} title="NLP extracts the details"
              desc="Our Named Entity Recognition model reads the text and extracts the location, incident type, severity and time — even from Nigerian Pidgin English." />
            <Step num="3" color={C.amber} title="Incident is geocoded & mapped"
              desc="The extracted location name (e.g. 'Oshodi under bridge') is matched to real GPS coordinates using our Nigerian places database and plotted on the live map." />
            <Step num="4" color={C.green} title="Agencies are alerted instantly"
              desc="NEMA, Fire Service, Police and relevant agencies receive an immediate email alert with full incident details, location and severity level." />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          4. WHAT CAN YOU REPORT
      ══════════════════════════════ */}
      <section style={{ background: C.bgAlt, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,2.5vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              What can you report?
            </h2>
            <p style={{ color: C.muted, fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>
              Any emergency that needs a response from security, fire, medical or disaster management services.
            </p>
          </div>

          {/* 3 x 2 even grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', maxWidth: '860px', margin: '0 auto' }}>
            {[
              { emoji: '🔥', label: 'Fire & Explosions',   desc: 'Building fires, gas explosions, wildfires'    },
              { emoji: '🔫', label: 'Crime & Robbery',     desc: 'Armed robbery, kidnapping, assault'           },
              { emoji: '💧', label: 'Floods & Disasters',  desc: 'Flash floods, landslides, natural disasters'  },
              { emoji: '🚗', label: 'Road Accidents',      desc: 'Crashes, tanker spills, road hazards'         },
              { emoji: '🏥', label: 'Medical Emergencies', desc: 'Mass casualties, disease outbreak'            },
              { emoji: '🛡️', label: 'Security Threats',   desc: 'Terrorism, civil unrest, operations'         },
            ].map((item, i) => (
              <Link to="/report" key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: '14px', padding: '22px 18px',
                textAlign: 'center', textDecoration: 'none',
                display: 'block', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,34,0,0.4)'; e.currentTarget.style.background = C.primarySoft; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{item.emoji}</div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ color: C.faint, fontSize: '12px', lineHeight: 1.55 }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          5. WHO IS IT FOR
      ══════════════════════════════ */}
      <section style={{ padding: '88px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,2.5vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Who is CrisisWatch for?
            </h2>
          </div>

          {/* Exactly 3 equal columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              {
                emoji:  '🧑‍🤝‍🧑',
                color:  C.primary,
                title:  'Nigerian Citizens',
                desc:   'Anyone who witnesses or is caught in an emergency. Report in under 60 seconds — no technical knowledge needed. Your report goes directly to emergency responders.',
                action: { label: 'Report an Emergency', to: '/report' },
              },
              {
                emoji:  '🚨',
                color:  C.blue,
                title:  'Emergency Agencies',
                desc:   'NEMA, Fire Service, Police, Red Cross and partner agencies. Get real-time alerts, see all incidents on the live map and assign responders instantly.',
                action: { label: 'Open Agency Dashboard', to: '/dashboard' },
              },
              {
                emoji:  '🔬',
                color:  C.green,
                title:  'Researchers & Government',
                desc:   'Analyse emergency patterns across Nigeria, identify high-risk zones, study response times and use real data to improve emergency infrastructure planning.',
                action: { label: 'View Analytics', to: '/dashboard' },
              },
            ].map((u, i) => (
              <div key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: '18px', padding: '28px',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${u.color}44`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '36px', marginBottom: '16px' }}>{u.emoji}</div>
                <div style={{ color: u.color, fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>{u.title}</div>
                <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.8, flex: 1, marginBottom: '22px' }}>{u.desc}</p>
                <Link to={u.action.to} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: `${u.color}15`, border: `1px solid ${u.color}30`,
                  color: u.color, padding: '10px 18px', borderRadius: '9px',
                  fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                  alignSelf: 'flex-start',
                }}>
                  {u.action.label} <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          6. EMERGENCY CTA
      ══════════════════════════════ */}
      <section style={{ padding: '0 32px 88px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1A0500 0%, #8B1100 45%, #CC2200 100%)',
            borderRadius: '24px', padding: '72px 48px',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(204,34,0,0.2)',
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
              <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.8rem)', letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.15 }}>
                In an emergency right now?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', lineHeight: 1.8, maxWidth: '480px', margin: '0 auto 40px' }}>
                Don't wait. Report immediately and get connected to emergency responders who can help you right now.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link to="/report" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#fff', color: '#8B1100',
                  padding: '15px 36px', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 800,
                  textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <AlertTriangle size={19} /> Report Emergency Now
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.12)', color: '#fff',
                  padding: '15px 28px', borderRadius: '12px',
                  fontSize: '16px', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s',
                  border: '1px solid rgba(255,255,255,0.25)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Create Account
                </Link>
              </div>

              {/* Emergency numbers */}
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Emergency Line', number: '112'            },
                  { label: 'NEMA',           number: '0800-CALL-NEMA' },
                  { label: 'Police',         number: '07002-POLICE'   },
                  { label: 'Fire Service',   number: '01-7944929'     },
                ].map(c => (
                  <div key={c.label} style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{c.number}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{ background: '#060C17', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 32px 32px' }}>

          {/* 4-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '48px' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: 38, height: 38, background: C.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px rgba(204,34,0,0.35)` }}>
                  <AlertTriangle size={18} color="white" strokeWidth={2.2} />
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>CrisisWatch</div>
                  <div style={{ color: C.primary, fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '2px' }}>NIGERIA</div>
                </div>
              </div>
              <p style={{ color: 'rgba(232,237,245,0.4)', fontSize: '14px', lineHeight: 1.8, maxWidth: '260px', margin: '0 0 16px' }}>
                Nigeria's emergency reporting and response platform — connecting citizens to emergency services faster through AI and social media monitoring.
              </p>
            </div>

            {/* Platform */}
            <div>
              <div style={{ color: 'rgba(232,237,245,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontWeight: 600 }}>Platform</div>
              {[
                ['/report',    'Report Emergency'],
                ['/incidents', 'Live Incidents'  ],
                ['/map',       'Incident Map'    ],
                ['/dashboard', 'Agency Dashboard'],
                ['/nlp',       'NLP Monitor'     ],
                ['/alerts',    'Alerts'          ],
              ].map(([to, label]) => (
                <div key={to} style={{ marginBottom: '10px' }}>
                  <Link to={to} style={{ color: 'rgba(232,237,245,0.5)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,245,0.5)'}
                  >{label}</Link>
                </div>
              ))}
            </div>

            {/* Info */}
            <div>
              <div style={{ color: 'rgba(232,237,245,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontWeight: 600 }}>Info</div>
              {[
                ['/about',   'About'         ],
                ['/about',   'How it Works'  ],
                ['/about',   'Privacy Policy'],
                ['/about',   'Terms of Use'  ],
                ['/about',   'Contact'       ],
              ].map(([to, label]) => (
                <div key={label} style={{ marginBottom: '10px' }}>
                  <Link to={to} style={{ color: 'rgba(232,237,245,0.5)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.text}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,237,245,0.5)'}
                  >{label}</Link>
                </div>
              ))}
            </div>

            {/* Emergency contacts */}
            <div>
              <div style={{ color: 'rgba(232,237,245,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '18px', fontWeight: 600 }}>Emergency Contacts</div>
              {[
                { name: 'Emergency',   number: '112'            },
                { name: 'NEMA',        number: '0800-CALL-NEMA' },
                { name: 'Police',      number: '07002-POLICE'   },
                { name: 'Fire Service',number: '01-7944929'     },
                { name: 'Ambulance',   number: '0700-999-0099'  },
              ].map(c => (
                <div key={c.name} style={{ marginBottom: '12px' }}>
                  <div style={{ color: 'rgba(232,237,245,0.4)', fontSize: '12px' }}>{c.name}</div>
                  <div style={{ color: C.primary, fontWeight: 700, fontSize: '14px' }}>{c.number}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar — full width, properly separated */}
          <div style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <span style={{ color: 'rgba(232,237,245,0.22)', fontSize: '13px' }}>
              © 2025 CrisisWatch Nigeria · Final Year Project — Computer Science
            </span>
            <span style={{ color: 'rgba(232,237,245,0.22)', fontSize: '13px' }}>
              Built with React.js · Flask · NLP · Leaflet.js
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}