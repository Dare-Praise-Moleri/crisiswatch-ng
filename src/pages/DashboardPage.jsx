import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle, LayoutDashboard, MapPin, FileText,
  Bell, Settings, User, LogOut, Plus, Flame,
  Droplets, Car, Shield, Clock, Activity,
  ChevronRight, Menu, X, Radio, Brain,
  CheckCircle, TrendingUp, Users, RefreshCw,
  Eye, Cpu, Database
} from 'lucide-react';
import { dashboardAPI, incidentsAPI } from '../services/api';

const C = {
  primary:      '#CC2200',
  primaryHover: '#A81B00',
  primarySoft:  'rgba(204,34,0,0.1)',
  primaryBorder:'rgba(204,34,0,0.3)',
  blue:         '#2563EB',
  blueSoft:     'rgba(37,99,235,0.12)',
  green:        '#10B981',
  greenSoft:    'rgba(16,185,129,0.12)',
  amber:        '#F59E0B',
  amberSoft:    'rgba(245,158,11,0.12)',
  purple:       '#8B5CF6',
  bg:           '#080E1A',
  bgAlt:        '#0D1525',
  surface:      '#111827',
  surface2:     '#1A2438',
  border:       'rgba(255,255,255,0.07)',
  text:         '#E8EDF5',
  muted:        'rgba(232,237,245,0.55)',
  faint:        'rgba(232,237,245,0.28)',
};
const font = "'DM Sans', system-ui, sans-serif";

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/incidents', icon: FileText,        label: 'Incidents', badge: true },
  { to: '/map',       icon: MapPin,          label: 'Live Map'   },
  { to: '/report',    icon: Plus,            label: 'Report'     },
  { to: '/nlp',       icon: Brain,           label: 'NLP Monitor'},
  { to: '/alerts',    icon: Bell,            label: 'Alerts'     },
  { to: '/profile',   icon: User,            label: 'Profile'    },
];

const TYPE_CONFIG = {
  fire:     { icon: Flame,         color: C.primary },
  crime:    { icon: Shield,        color: C.amber   },
  flood:    { icon: Droplets,      color: C.blue    },
  accident: { icon: Car,           color: C.purple  },
  medical:  { icon: Activity,      color: C.green   },
  security: { icon: AlertTriangle, color: C.amber   },
  protest:  { icon: Users,         color: C.purple  },
  other:    { icon: AlertTriangle, color: C.faint   },
};

const SEV_STYLE = {
  critical: { text: '#FF8A80', bg: 'rgba(255,59,48,0.18)',   border: '#FF3B30' },
  high:     { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)',    border: C.primary },
  medium:   { text: '#FFD180', bg: 'rgba(245,158,11,0.18)',  border: C.amber   },
  low:      { text: '#69F0AE', bg: 'rgba(16,185,129,0.18)',  border: C.green   },
};

const STATUS_STYLE = {
  Active:     { color: C.primary, bg: C.primarySoft  },
  Responding: { color: C.blue,    bg: C.blueSoft      },
  Monitoring: { color: C.amber,   bg: C.amberSoft     },
  Resolved:   { color: C.green,   bg: C.greenSoft     },
};

/* ── Sidebar ── */
const Sidebar = ({ pathname, activeCount }) => (
  <div style={{
    width: '220px', background: '#060C17',
    borderRight: `1px solid ${C.border}`,
    display: 'flex', flexDirection: 'column',
    height: '100vh', position: 'sticky',
    top: 0, flexShrink: 0, fontFamily: font,
  }}>
    {/* Logo */}
    <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.border}` }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{ width: 36, height: 36, background: C.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 14px rgba(204,34,0,0.4)` }}>
          <AlertTriangle size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.01em', lineHeight: 1 }}>CrisisWatch</div>
          <div style={{ color: C.primary, fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '2px' }}>NIGERIA</div>
        </div>
      </Link>
    </div>

    {/* Nav */}
    <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
      {NAV.map(item => {
        const active = pathname === item.to;
        return (
          <Link key={item.to} to={item.to} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
            textDecoration: 'none', transition: 'all 0.15s',
            color: active ? C.primary : C.muted,
            background: active ? C.primarySoft : 'transparent',
            borderLeft: `2px solid ${active ? C.primary : 'transparent'}`,
            fontSize: '14px', fontWeight: active ? 700 : 500,
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.text; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}}
          >
            <item.icon size={17} strokeWidth={1.9} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && activeCount > 0 && (
              <span style={{ background: C.primary, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', minWidth: '20px', textAlign: 'center' }}>
                {activeCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>

    {/* System status */}
    <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>System Status</div>
      {[
        { label: 'Social Monitor', on: true  },
        { label: 'NLP Engine',     on: true  },
        { label: 'Email Alerts',   on: true  },
        { label: 'Database',       on: true  },
      ].map(s => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span style={{ color: C.faint, fontSize: '12px' }}>{s.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: s.on ? C.green : C.primary, display: 'inline-block' }} />
            <span style={{ color: s.on ? C.green : C.primary, fontSize: '11px', fontWeight: 600 }}>{s.on ? 'On' : 'Off'}</span>
          </div>
        </div>
      ))}
    </div>

    {/* User */}
    <div style={{ padding: '14px 16px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: C.surface, borderRadius: '10px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, ${C.blue})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>DP</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dare Praise</div>
          <div style={{ color: C.faint, fontSize: '11px' }}>Responder</div>
        </div>
        <button onClick={() => { localStorage.removeItem('crisiswatch_token'); window.location.href = '/login'; }} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '2px', display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = C.primary}
          onMouseLeave={e => e.currentTarget.style.color = C.faint}>
          <LogOut size={15} />
        </button>
      </div>
    </div>
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, color, bg, label, value, sub, trend, trendUp }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '16px', padding: '22px',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={21} color={color} strokeWidth={1.9} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: trendUp ? C.greenSoft : C.primarySoft, borderRadius: '999px', padding: '3px 10px' }}>
          <TrendingUp size={12} color={trendUp ? C.green : C.primary} style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: trendUp ? C.green : C.primary }}>{trend}</span>
        </div>
      )}
    </div>
    <div style={{ fontSize: 'clamp(1.8rem,2vw,2.4rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '6px', fontFamily: font }}>{value}</div>
    <div style={{ fontSize: '14px', color: C.muted, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: '12px', color: C.faint, marginTop: '3px' }}>{sub}</div>}
  </div>
);

/* ── Incident Row ── */
const IncidentRow = ({ inc, onRespond, onResolve }) => {
  const type   = TYPE_CONFIG[inc.type]  || TYPE_CONFIG.other;
  const Icon   = type.icon;
  const sevKey = inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1).toLowerCase() : 'Medium';
  const S      = SEV_STYLE[inc.severity?.toLowerCase()] || SEV_STYLE.medium;
  const stKey  = inc.status || 'Active';
  const ST     = STATUS_STYLE[stKey] || STATUS_STYLE.Active;

  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1)  return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '14px',
      padding: '16px', borderRadius: '12px',
      borderLeft: `3px solid ${S.border}`,
      background: C.surface2, marginBottom: '8px',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#1E2D45'}
      onMouseLeave={e => e.currentTarget.style.background = C.surface2}
    >
      <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={type.color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {inc.location && <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {inc.location}</span>}
          <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {timeAgo(inc.created_at)}</span>
          <span style={{ color: C.faint, fontSize: '12px' }}>{inc.source}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ background: S.bg, color: S.text, fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px' }}>{sevKey}</span>
          <span style={{ background: ST.bg, color: ST.color, fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px' }}>{stKey}</span>
          <span style={{ background: C.surface, color: C.faint, fontSize: '11px', padding: '2px 9px', borderRadius: '999px' }}>{inc.type}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {inc.status !== 'Responding' && inc.status !== 'Resolved' && (
          <button onClick={() => onRespond(inc.id)} style={{
            background: C.blueSoft, border: `1px solid rgba(37,99,235,0.3)`,
            borderRadius: '8px', padding: '6px 12px',
            color: C.blue, fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap',
          }}>
            Respond
          </button>
        )}
        {inc.status !== 'Resolved' && (
          <button onClick={() => onResolve(inc.id)} style={{
            background: C.greenSoft, border: `1px solid rgba(16,185,129,0.3)`,
            borderRadius: '8px', padding: '6px 12px',
            color: C.green, fontSize: '12px', fontWeight: 700,
            cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap',
          }}>
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════ */
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,       setStats]       = useState(null);
  const [incidents,   setIncidents]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter,      setFilter]      = useState('All');
  const { pathname }                  = useLocation();

  const load = async () => {
    try {
      const [sRes, iRes] = await Promise.all([
        dashboardAPI.getStats(),
        incidentsAPI.getAll({ limit: 20 }),
      ]);
      setStats(sRes.stats);
      setIncidents(iRes.incidents || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const handleRespond = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/incidents/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` },
        body:    JSON.stringify({ status: 'Responding' }),
      });
      load();
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/incidents/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` },
        body:    JSON.stringify({ status: 'Resolved' }),
      });
      load();
    } catch (e) { console.error(e); }
  };

  const activeCount = incidents.filter(i => i.status === 'Active').length;

  const FILTERS = ['All', 'Active', 'Responding', 'Monitoring', 'Resolved'];

  const filtered = filter === 'All'
    ? incidents
    : incidents.filter(i => i.status === filter);

  /* ── SVG Bar Chart ── */
  const BarChart = () => {
    const types = ['fire','crime','flood','accident','medical','security'];
    const counts = types.map(t => incidents.filter(i => i.type === t).length);
    const max = Math.max(...counts, 1);
    const colors = [C.primary, C.amber, C.blue, C.purple, C.green, C.amber];
    return (
      <svg viewBox="0 0 300 120" style={{ width: '100%', height: '120px' }}>
        {types.map((t, i) => {
          const bw  = 28;
          const gap = 16;
          const x   = i * (bw + gap) + 10;
          const bh  = Math.max((counts[i] / max) * 90, counts[i] > 0 ? 8 : 0);
          const y   = 100 - bh;
          return (
            <g key={t}>
              <rect x={x} y={y} width={bw} height={bh} rx="5" fill={colors[i]} opacity="0.85" />
              <text x={x + bw / 2} y="115" textAnchor="middle" fill={C.faint} fontSize="9" fontFamily="DM Sans">{t.charAt(0).toUpperCase() + t.slice(1)}</text>
              {counts[i] > 0 && <text x={x + bw / 2} y={y - 4} textAnchor="middle" fill={colors[i]} fontSize="11" fontWeight="700" fontFamily="DM Sans">{counts[i]}</text>}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* Desktop sidebar */}
      <div className="dash-sidebar">
        <Sidebar pathname={pathname} activeCount={activeCount} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 199 }} />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200 }}>
            <Sidebar pathname={pathname} activeCount={activeCount} />
          </div>
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          background: C.bgAlt, borderBottom: `1px solid ${C.border}`,
          padding: '0 28px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button onClick={() => setSidebarOpen(true)} className="dash-mob-menu" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0 }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>Agency Dashboard</div>
              <div style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                {lastUpdated ? `Updated ${Math.floor((Date.now() - lastUpdated) / 1000)}s ago · Auto-refreshes every 30s` : 'Loading...'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', borderRadius: '9px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px rgba(204,34,0,0.3)` }}
              onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = C.primary}>
              <Plus size={15} /> New Report
            </Link>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '16px', marginBottom: '28px' }}>
            <StatCard icon={AlertTriangle} color={C.primary} bg={C.primarySoft} label="Active Incidents"    value={loading ? '...' : stats?.active_incidents   ?? 0} trend={`+${stats?.new_last_hour ?? 0}`}  trendUp={false} sub="Needs response now"      />
            <StatCard icon={Clock}         color={C.amber}   bg={C.amberSoft}   label="Avg Response Time"  value={loading ? '...' : `${stats?.avg_response_time ?? 0}m`}                                        sub="Time to first response" />
            <StatCard icon={Radio}         color={C.blue}    bg={C.blueSoft}    label="Posts Monitored"    value={loading ? '...' : stats?.posts_processed     ?? 0} trend="+24" trendUp={true}                 sub="From social media today" />
            <StatCard icon={Cpu}           color={C.green}   bg={C.greenSoft}   label="NER Accuracy"       value={loading ? '...' : `${stats?.ner_accuracy     ?? 0}%`}                                         sub="F1-Score: 0.89"         />
            <StatCard icon={CheckCircle}   color={C.green}   bg={C.greenSoft}   label="Resolved Today"     value={loading ? '...' : stats?.resolved_today      ?? 0} trend="Good" trendUp={true}                sub="Successfully closed"    />
            <StatCard icon={Users}         color={C.purple}  bg={C.purpleSoft}  label="Total Reports"      value={loading ? '...' : stats?.total_incidents     ?? 0}                                             sub="All time"               />
          </div>

          {/* ── INCIDENT TYPE BREAKDOWN + QUICK ACTIONS ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '28px' }}>

            {/* Chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '16px' }}>Incidents by Type</div>
                  <div style={{ color: C.faint, fontSize: '12px', marginTop: '3px' }}>All reported incidents</div>
                </div>
              </div>
              {loading ? (
                <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.faint, fontSize: '13px' }}>Loading...</div>
              ) : (
                <BarChart />
              )}
            </div>

            {/* Quick actions */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
              <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '18px' }}>Quick Actions</div>
              {[
                { icon: Plus,    color: C.primary, label: 'Report New Incident',    sub: 'Submit a field report',     to: '/report'    },
                { icon: MapPin,  color: C.blue,    label: 'Open Live Map',          sub: 'View all incidents',        to: '/map'       },
                { icon: Brain,   color: C.green,   label: 'NLP Monitor',            sub: 'Process social media',      to: '/nlp'       },
                { icon: Bell,    color: C.amber,   label: 'View Alerts',            sub: 'Check notifications',       to: '/alerts'    },
              ].map((item, i) => (
                <Link key={i} to={item.to} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 12px', borderRadius: '10px', marginBottom: '4px',
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={17} color={item.color} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ color: C.faint, fontSize: '11px' }}>{item.sub}</div>
                  </div>
                  <ChevronRight size={14} color={C.faint} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>

          {/* ── INCIDENT LIST ── */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '16px' }}>All Incidents</div>
                <div style={{ color: C.faint, fontSize: '12px', marginTop: '3px' }}>
                  {filtered.length} incident{filtered.length !== 1 ? 's' : ''} {filter !== 'All' ? `· ${filter}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '6px 14px', borderRadius: '9px', border: 'none',
                    background: filter === f ? C.primary : C.surface2,
                    color: filter === f ? '#fff' : C.muted,
                    fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: font,
                    transition: 'all 0.15s',
                  }}>
                    {f}
                    {f !== 'All' && (
                      <span style={{ marginLeft: '5px', opacity: 0.7 }}>
                        ({incidents.filter(i => i.status === f).length})
                      </span>
                    )}
                  </button>
                ))}
                <Link to="/incidents" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.primary, fontSize: '12px', fontWeight: 700, textDecoration: 'none', padding: '6px 12px' }}>
                  Full List <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: C.faint, fontSize: '14px' }}>Loading incidents...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <CheckCircle size={36} color={C.green} style={{ margin: '0 auto 12px' }} />
                <div style={{ color: C.green, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>
                  {filter === 'All' ? 'No incidents reported yet' : `No ${filter} incidents`}
                </div>
                <div style={{ color: C.faint, fontSize: '13px' }}>
                  {filter === 'All' ? 'The social media monitor is running and will detect incidents automatically' : `All incidents are being handled`}
                </div>
              </div>
            ) : (
              filtered.map(inc => (
                <IncidentRow
                  key={inc.id}
                  inc={inc}
                  onRespond={handleRespond}
                  onResolve={handleResolve}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dash-sidebar    { display: none !important; }
          .dash-mob-menu   { display: flex !important; }
        }
        @media (min-width: 901px) {
          .dash-sidebar    { display: flex !important; }
          .dash-mob-menu   { display: none !important; }
        }
      `}</style>
    </div>
  );
}