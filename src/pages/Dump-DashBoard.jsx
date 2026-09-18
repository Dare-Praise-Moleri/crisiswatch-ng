import React, { useState, useEffect } from 'react';
import { dashboardAPI, incidentsAPI, isLoggedIn } from '../services/api';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle, LayoutDashboard, MapPin, FileText,
  Bell, BarChart2, Database, Settings, User, LogOut,
  RefreshCw, Plus, Flame, Droplets, Car, Shield,
  Clock, TrendingUp, TrendingDown, Activity, Eye,
  ChevronRight, Menu, X, Cpu, Radio, Users,
} from 'lucide-react';

/* ─── TOKENS ─── */
const C = {
  primary:     '#CC2200',
  primaryHover:'#A81B00',
  primarySoft: 'rgba(204,34,0,0.1)',
  blue:        '#2563EB',
  blueSoft:    'rgba(37,99,235,0.12)',
  green:       '#10B981',
  greenSoft:   'rgba(16,185,129,0.12)',
  amber:       '#F59E0B',
  amberSoft:   'rgba(245,158,11,0.12)',
  purple:      '#8B5CF6',
  purpleSoft:  'rgba(139,92,246,0.12)',
  bg:          '#080E1A',
  bgAlt:       '#0D1525',
  surface:     '#111827',
  surface2:    '#1A2438',
  border:      'rgba(255,255,255,0.07)',
  text:        '#E8EDF5',
  muted:       'rgba(232,237,245,0.55)',
  faint:       'rgba(232,237,245,0.28)',
};
const font = "'DM Sans', system-ui, sans-serif";

/* ─── SIDEBAR CONFIG ─── */
const NAV = [
  { section: 'MAIN' },
  { to: '/',          icon: LayoutDashboard, label: 'Home'       },
  { to: '/dashboard', icon: Activity,        label: 'Dashboard'  },
  { to: '/map',       icon: MapPin,          label: 'Live Map'   },
  { to: '/incidents', icon: FileText,        label: 'Incidents', badge: 12 },
  { section: 'TOOLS' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts',    badge: 3  },
  { to: '/report',    icon: Plus,            label: 'Report'     },
  { to: '/about',     icon: BarChart2,       label: 'Analytics'  },
  { section: 'ACCOUNT' },
  { to: '/profile',   icon: User,            label: 'Profile'    },
  { to: '/login',     icon: LogOut,          label: 'Sign Out'   },
];

/* ─── MINI CHART (SVG sparkline) ─── */
const Sparkline = ({ data, color, height = 40 }) => {
  const w = 120, h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  }).join(' ');
  const fill = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const fillPath = `M ${fill[0]} L ${fill.slice(1).join(' L ')} L ${w},${h} L 0,${h} Z`;

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${color})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─── BAR CHART (SVG) ─── */
const BarChart = ({ bars }) => {
  const max = Math.max(...bars.map(b => b.value));
  return (
    <svg viewBox="0 0 320 120" style={{ width: '100%', height: '120px' }}>
      {bars.map((b, i) => {
        const bw = 32, gap = 14;
        const x = i * (bw + gap) + 10;
        const bh = (b.value / max) * 90;
        const y = 100 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="5" fill={b.color} opacity="0.85" />
            <text x={x + bw / 2} y="116" textAnchor="middle" fill={C.faint} fontSize="10" fontFamily="DM Sans">{b.label}</text>
            <text x={x + bw / 2} y={y - 5} textAnchor="middle" fill={b.color} fontSize="11" fontWeight="700" fontFamily="DM Sans">{b.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── LINE CHART (SVG) ─── */
const LineChart = ({ lines, labels }) => {
  const allVals = lines.flatMap(l => l.data);
  const max = Math.max(...allVals);
  const w = 320, h = 110;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: '100%', height: '130px' }}>
      <defs>
        {lines.map(l => (
          <linearGradient key={l.color} id={`lg-${l.color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={l.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={l.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid lines */}
      {[0,25,50,75,100].map(pct => {
        const y = h - (pct / 100) * h;
        return <line key={pct} x1="0" y1={y} x2={w} y2={y} stroke={C.border} strokeWidth="1" />;
      })}
      {lines.map(l => {
        const pts = l.data.map((v, i) => {
          const x = (i / (l.data.length - 1)) * w;
          const y = h - (v / max) * (h - 8) - 4;
          return [x, y];
        });
        const polyPts = pts.map(p => p.join(',')).join(' ');
        const fillPath = `M ${pts[0].join(',')} L ${pts.slice(1).map(p => p.join(',')).join(' L ')} L ${w},${h} L 0,${h} Z`;
        return (
          <g key={l.color}>
            <path d={fillPath} fill={`url(#lg-${l.color.replace('#','')})`} />
            <polyline points={polyPts} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={l.color} />)}
          </g>
        );
      })}
      {labels.map((label, i) => {
        const x = (i / (labels.length - 1)) * w;
        return <text key={i} x={x} y={h + 16} textAnchor="middle" fill={C.faint} fontSize="10" fontFamily="DM Sans">{label}</text>;
      })}
    </svg>
  );
};

/* ─── STAT CARD ─── */
const StatCard = ({ icon: Icon, iconColor, iconBg, label, value, trend, trendUp, sub }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '16px', padding: '22px',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${iconColor}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={21} color={iconColor} strokeWidth={1.9} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trendUp ? 'rgba(16,185,129,0.12)' : 'rgba(204,34,0,0.12)', borderRadius: '999px', padding: '3px 10px' }}>
          {trendUp ? <TrendingUp size={13} color={C.green} /> : <TrendingDown size={13} color={C.primary} />}
          <span style={{ fontSize: '12px', fontWeight: 700, color: trendUp ? C.green : C.primary }}>{trend}</span>
        </div>
      )}
    </div>
    <div style={{ fontSize: 'clamp(1.8rem,2.5vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px', fontFamily: font }}>{value}</div>
    <div style={{ fontSize: '14px', color: C.muted, fontWeight: 500, marginBottom: sub ? '4px' : 0 }}>{label}</div>
    {sub && <div style={{ fontSize: '12px', color: C.faint }}>{sub}</div>}
  </div>
);

/* ─── INCIDENT ROW ─── */
const IncidentRow = ({ icon: Icon, color, title, location, source, time, severity }) => {
  const sevKey = severity ? severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase() : 'Medium';
  const S = {
    High:   { text: '#FF8A80', bg: 'rgba(204,34,0,0.15)',   border: C.primary },
    Medium: { text: '#FFD180', bg: 'rgba(245,158,11,0.15)', border: C.amber   },
    Low:    { text: '#69F0AE', bg: 'rgba(16,185,129,0.15)', border: C.green   },
  }[sevKey] || { text: '#FFD180', bg: 'rgba(245,158,11,0.15)', border: C.amber };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '13px 16px', borderRadius: '12px',
      borderLeft: `3px solid ${S.border}`,
      background: C.surface2, marginBottom: '8px',
      transition: 'all 0.15s', cursor: 'pointer',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#1E2D45'}
      onMouseLeave={e => e.currentTarget.style.background = C.surface2}
    >
      <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {location}</span>
          <span style={{ color: C.faint, fontSize: '12px' }}>{source}</span>
          <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {time}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        <span style={{ background: S.bg, color: S.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{severity}</span>
        <button style={{ background: 'rgba(37,99,235,0.12)', border: 'none', color: C.blue, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontFamily: font }}>
          Respond →
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════ */
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,      setStats]      = useState(null);
  const [incidents,  setIncidents]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, incRes] = await Promise.all([
          dashboardAPI.getStats(),
          incidentsAPI.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.stats);
        setIncidents(incRes.incidents);
      } catch (err) {
        setError('Could not load dashboard data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const { pathname } = useLocation();

  // const incidents = [  ];

  const barData = [
    { label: 'Fire',     value: 8,  color: C.primary },
    { label: 'Crime',    value: 5,  color: C.amber   },
    { label: 'Flood',    value: 3,  color: C.blue    },
    { label: 'Accident', value: 6,  color: C.purple  },
    { label: 'Medical',  value: 4,  color: C.green   },
    { label: 'Other',    value: 2,  color: C.faint   },
  ];

  const lineData = {
    labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','Now'],
    lines: [
      { color: C.primary, data: [2, 5, 8, 12, 9, 14, 18, 12] },
      { color: C.blue,    data: [1, 3, 5,  8, 6,  9, 11,  8] },
    ],
  };

  const sparkData = {
    incidents: [4, 7, 5, 9, 12, 8, 11, 14, 10, 12],
    posts:     [20, 35, 28, 45, 60, 38, 52, 70, 55, 65],
    response:  [6.2, 5.8, 5.1, 4.9, 4.7, 4.5, 4.3, 4.1, 4.2, 4.2],
    accuracy:  [92, 93, 94, 95, 96, 97, 97, 98, 98, 98],
  };

  /* ── SIDEBAR ── */
  const Sidebar = ({ mobile = false }) => (
    <div style={{
      width: mobile ? '260px' : '220px',
      background: '#060C17',
      borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      position: mobile ? 'fixed' : 'sticky',
      top: 0, left: 0, zIndex: mobile ? 200 : 'auto',
      overflowY: 'auto', flexShrink: 0,
      fontFamily: font,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 16px', borderBottom: `1px solid ${C.border}` }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: C.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px rgba(204,34,0,0.4)` }}>
            <AlertTriangle size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em' }}>CrisisWatch</div>
            <div style={{ color: C.primary, fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>NIGERIA</div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{ color: C.faint, fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px 10px 6px', fontFamily: font }}>
              {item.section}
            </div>
          );
          const active = pathname === item.to;
          return (
            <Link key={i} to={item.to} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              marginBottom: '2px', textDecoration: 'none',
              color: active ? C.primary : C.muted,
              background: active ? C.primarySoft : 'transparent',
              borderLeft: `2px solid ${active ? C.primary : 'transparent'}`,
              fontSize: '14px', fontWeight: active ? 700 : 500,
              transition: 'all 0.15s', fontFamily: font,
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.text; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}}
            >
              <item.icon size={17} strokeWidth={1.9} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: C.primary, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', minWidth: '20px', textAlign: 'center' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom user card */}
      <div style={{ padding: '16px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: C.surface, borderRadius: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>DP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dare Praise</div>
            <div style={{ color: C.faint, fontSize: '11px' }}>Responder</div>
          </div>
          <Settings size={15} color={C.faint} style={{ cursor: 'pointer', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* Desktop Sidebar */}
      <div className="dash-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }} />
          <Sidebar mobile />
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          background: C.bgAlt, borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setSidebarOpen(true)} className="dash-mob-menu" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, display: 'none' }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>Live Dashboard</div>
              <div style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                Last updated 2 seconds ago · Monitoring X, Facebook, WhatsApp
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', borderRadius: '9px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px rgba(204,34,0,0.3)`, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = C.primary}>
              <Plus size={15} /> New Report
            </Link>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <StatCard icon={AlertTriangle} iconColor={C.primary} iconBg={C.primarySoft} label="Active Incidents"   value={loading ? '...' : stats?.active_incidents ?? 0}  trend={`+${stats?.new_last_hour ?? 0}`} trendUp={false} sub="In the last hour" />
            <StatCard icon={Clock}         iconColor={C.amber}   iconBg={C.amberSoft}   label="Avg Response Time"  value={loading ? '...' : `${stats?.avg_response_time ?? 0}m`} trend="12%" trendUp={true}  sub="Faster than yesterday" />
            <StatCard icon={Radio}         iconColor={C.blue}    iconBg={C.blueSoft}    label="Posts Processed"    value={loading ? '...' : stats?.posts_processed ?? 0}   trend="+18" trendUp={true}  sub="Today so far" />
            <StatCard icon={Cpu}           iconColor={C.green}   iconBg={C.greenSoft}   label="NER Accuracy"       value={loading ? '...' : `${stats?.ner_accuracy ?? 0}%`} trend="↑1%" trendUp={true}  sub="F1-Score: 0.96" />
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '28px' }}>

            {/* Incidents by type */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '3px' }}>Incidents by Type</div>
                  <div style={{ color: C.faint, fontSize: '12px' }}>Today's breakdown</div>
                </div>
                <BarChart2 size={18} color={C.faint} />
              </div>
              <BarChart bars={barData} />
            </div>

            {/* Post volume over time */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '3px' }}>Post Volume — 24hrs</div>
                  <div style={{ color: C.faint, fontSize: '12px' }}>Social media posts processed</div>
                </div>
                <Activity size={18} color={C.faint} />
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 3, background: C.primary, borderRadius: '2px' }} />
                  <span style={{ color: C.faint, fontSize: '12px' }}>Total posts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 10, height: 3, background: C.blue, borderRadius: '2px' }} />
                  <span style={{ color: C.faint, fontSize: '12px' }}>Crisis-related</span>
                </div>
              </div>
              <LineChart lines={lineData.lines} labels={lineData.labels} />
            </div>
          </div>

          {/* ── MINI METRIC CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Incidents Today',     color: C.primary, data: sparkData.incidents, value: '12',   unit: ''   },
              { label: 'Posts Monitored',     color: C.blue,    data: sparkData.posts,     value: '247',  unit: ''   },
              { label: 'Avg Response (min)',  color: C.amber,   data: sparkData.response,  value: '4.2',  unit: 'min'},
              { label: 'NER Accuracy',        color: C.green,   data: sparkData.accuracy,  value: '98%',  unit: ''   },
            ].map((m, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ color: C.faint, fontSize: '12px', marginBottom: '6px' }}>{m.label}</div>
                  <div style={{ color: m.color, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.value}</div>
                </div>
                <Sparkline data={m.data} color={m.color} />
              </div>
            ))}
          </div>

          {/* ── BOTTOM ROW: Incidents + Map ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

            {/* Recent incidents */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '3px' }}>Recent Incidents</div>
                  <div style={{ color: C.faint, fontSize: '12px' }}>Live updates</div>
                </div>
                <Link to="/incidents" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.primary, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              {/* {incidents.map((inc, i) => <IncidentRow key={i} {...inc} />)} */}
              
              {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: C.faint, fontSize: '14px' }}>
                Loading incidents...
              </div>
              ) : error ? (
              <div style={{ padding: '16px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '10px', color: '#FF8A80', fontSize: '13px' }}>
                ⚠️ {error}
              </div>
              ) : incidents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: C.faint, fontSize: '14px' }}>
                No incidents yet. <Link to="/report" style={{ color: C.primary }}>Report one</Link>
              </div>
              ) : (
                incidents.map((inc, i) => {
                  const iconMap = {
                    fire:     { icon: Flame,         color: C.primary },
                    crime:    { icon: AlertTriangle, color: C.amber   },
                    flood:    { icon: Droplets,      color: C.blue    },
                    accident: { icon: Car,           color: C.purple  },
                    security: { icon: Shield,        color: C.green   },
                    medical:  { icon: Activity,      color: C.green   },
                    protest:  { icon: Users,         color: C.purple  },
                  };
                  const mapped = iconMap[inc.type] || { icon: AlertTriangle, color: C.amber };
                  return (
                    <IncidentRow
                      key={inc.id}
                      icon={mapped.icon}
                      color={mapped.color}
                      title={inc.title}
                      location={inc.location}
                      source={inc.source}
                      time={new Date(inc.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      severity={inc.severity?.charAt(0).toUpperCase() + inc.severity?.slice(1) || 'Medium'}
                    />
                  );
                })
              )}
            </div>

            {/* Map + System health */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Mini map */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>Live Incident Map</div>
                  <Link to="/map" style={{ color: C.primary, fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Full map <ChevronRight size={14} />
                  </Link>
                </div>
                {/* SVG Map */}
                <div style={{ background: '#0A1020', borderRadius: '12px', border: `1px solid ${C.border}`, height: '220px', position: 'relative', overflow: 'hidden' }}>
                  <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <radialGradient id="mapBg" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="#0F2040" />
                        <stop offset="100%" stopColor="#060C17" />
                      </radialGradient>
                    </defs>
                    <rect width="400" height="220" fill="url(#mapBg)" />
                    {/* Grid */}
                    {[40,80,120,160,200].map(y => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
                    {[60,120,180,240,300,360].map(x => <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
                    {/* Nigeria simplified */}
                    <path d="M 80 50 L 130 38 L 190 35 L 240 40 L 290 52 L 320 72 L 330 100 L 325 130 L 305 155 L 275 172 L 240 180 L 200 182 L 165 175 L 135 160 L 108 138 L 90 112 L 80 82 Z" fill="rgba(204,34,0,0.06)" stroke="rgba(204,34,0,0.3)" strokeWidth="1.5" />
                    {/* Pins */}
                    {[
                      { cx: 175, cy: 158, color: C.primary, label: 'Lagos'  },
                      { cx: 218, cy: 110, color: C.primary, label: 'Abuja'  },
                      { cx: 252, cy: 135, color: C.amber,   label: 'Enugu'  },
                      { cx: 148, cy: 130, color: C.amber,   label: 'Ibadan' },
                      { cx: 278, cy: 100, color: C.blue,    label: 'Kaduna' },
                    ].map((pin, i) => (
                      <g key={i}>
                        <circle cx={pin.cx} cy={pin.cy} r="12" fill={pin.color} opacity="0.12" />
                        <circle cx={pin.cx} cy={pin.cy} r="7"  fill={pin.color} opacity="0.2"  />
                        <circle cx={pin.cx} cy={pin.cy} r="4"  fill={pin.color} opacity="0.9"  />
                        <circle cx={pin.cx} cy={pin.cy} r="2"  fill="#fff"      opacity="0.8"  />
                        <text x={pin.cx} y={pin.cy - 14} textAnchor="middle" fill="rgba(232,237,245,0.5)" fontSize="8" fontFamily="DM Sans">{pin.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  {[{ color: C.primary, label: 'High' }, { color: C.amber, label: 'Medium' }, { color: C.blue, label: 'Low' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                      <span style={{ color: C.faint, fontSize: '12px' }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* System health */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>System Health</div>
                {[
                  { label: 'NER Model',        status: 'Operational', color: C.green  },
                  { label: 'Twitter API',       status: 'Active',      color: C.green  },
                  { label: 'Facebook Scraper',  status: 'Active',      color: C.green  },
                  { label: 'WhatsApp Monitor',  status: 'Delayed',     color: C.amber  },
                  { label: 'PostgreSQL DB',     status: 'Operational', color: C.green  },
                  { label: 'Geocoding Service', status: 'Operational', color: C.green  },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ color: C.muted, fontSize: '13px', fontWeight: 500 }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                      <span style={{ color: s.color, fontSize: '12px', fontWeight: 600 }}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .dash-sidebar-desktop { display: none !important; }
          .dash-mob-menu { display: flex !important; }
        }
        @media (min-width: 901px) {
          .dash-sidebar-desktop { display: flex !important; }
          .dash-mob-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}