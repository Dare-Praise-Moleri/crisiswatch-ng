import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle, LayoutDashboard, MapPin, FileText,
  Bell, User, LogOut, Plus, Flame,
  Droplets, Car, Shield, Clock, Activity,
  ChevronRight, Menu, X, Radio, Brain,
  CheckCircle, TrendingUp, Users, RefreshCw,
  BarChart2, Settings, Navigation, Zap,
  Phone, Eye, Siren,
} from 'lucide-react';
import { FaXTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa6';
import { FaRegNewspaper } from 'react-icons/fa6';
import { dashboardAPI, incidentsAPI } from '../services/api';
import { C, font, TYPE_CONFIG, SEV_STYLE, STATUS_STYLE, timeAgo, normSev, cap } from '../theme';

/* ── Role configs ── */
const ROLES = {
  public: {
    label: 'Public User',
    title: 'Public Dashboard',
    subtitle: 'Lagos emergency feed',
    color: '#1D4ED8',
    nav: [
      { to: '/incidents', icon: FileText,        label: 'Incidents'  },
      { to: '/map',       icon: MapPin,          label: 'Live Map'   },
      { to: '/report',    icon: Plus,            label: 'Report'     },
      { to: '/alerts',    icon: Bell,            label: 'Alerts'     },
      { to: '/profile',   icon: User,            label: 'Profile'    },
    ],
  },
  responder: {
    label: 'Responder',
    title: 'Responder Dashboard',
    subtitle: 'LASEMA · Lagos State',
    color: '#CC2200',
    nav: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard', badge: true },
      { to: '/incidents',  icon: FileText,        label: 'Incidents', badge: true },
      { to: '/map',        icon: MapPin,          label: 'Live Map'  },
      { to: '/responder',  icon: Radio,           label: 'Centers'   },
      { to: '/report',     icon: Plus,            label: 'Report'    },
      { to: '/alerts',     icon: Bell,            label: 'Alerts'    },
      { to: '/profile',    icon: User,            label: 'Profile'   },
      { to: '/settings',   icon: Settings,        label: 'Settings'  },
    ],
  },
  admin: {
    label: 'Administrator',
    title: 'Admin Dashboard',
    subtitle: 'System overview · All Lagos',
    color: '#6D28D9',
    nav: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard', badge: true },
      { to: '/incidents',  icon: FileText,        label: 'Incidents', badge: true },
      { to: '/map',        icon: MapPin,          label: 'Live Map'  },
      { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
      { to: '/responder',  icon: Radio,           label: 'Centers'   },
      { to: '/report',     icon: Plus,            label: 'Report'    },
      { to: '/alerts',     icon: Bell,            label: 'Alerts'    },
      { to: '/profile',    icon: User,            label: 'Profile'   },
      { to: '/settings',   icon: Settings,        label: 'Settings'  },
    ],
  },
};

/* ── Type icon (no emojis) ── */
const typeIcon = (type) => {
  const map = { fire: Flame, flood: Droplets, accident: Car, crime: Shield, medical: Activity, security: Shield, protest: AlertTriangle, other: AlertTriangle };
  return map[type] || AlertTriangle;
};

/* ── Source icon (real brand logos) ── */
const SrcIcon = ({ source, size = 12 }) => {
  if (source === 'X (Twitter)') {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return <FaXTwitter size={size} color={dark ? '#E8EDF5' : '#000000'} />;
  }  if (source === 'Facebook')     return <FaFacebook  size={size} color="#1877F2" />;
  if (source === 'WhatsApp')     return <FaWhatsapp  size={size} color="#25D366" />;
  if (source === 'User Report')  return <Bell        size={size} color="#CC2200" />;
  return <FaRegNewspaper size={size} color="#D97706" />;
};

/* ── Sidebar ── */
const Sidebar = ({ pathname, activeCount, role, demoRole, setDemoRole }) => {
  const cfg = ROLES[demoRole];
  const handleLogout = () => { localStorage.removeItem('crisiswatch_token'); window.location.href = '/login'; };

  return (
    <div style={{ width: '210px', background: C.bg, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, fontFamily: font }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, background: '#CC2200', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(204,34,0,0.4)' }}>
            <AlertTriangle size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: '14px', lineHeight: 1 }}>CrisisWatch</div>
            <div style={{ color: '#CC2200', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '2px' }}>LAGOS</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {cfg.nav.map(item => {
          const active = pathname === item.to;
          return (
            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '9px', marginBottom: '2px', textDecoration: 'none', transition: 'all 0.15s', color: active ? '#CC2200' : C.muted, background: active ? 'rgba(204,34,0,0.1)' : 'transparent', borderLeft: `2px solid ${active ? '#CC2200' : 'transparent'}`, fontSize: '13px', fontWeight: active ? 700 : 500 }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.text; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}}
            >
              <item.icon size={16} strokeWidth={1.9} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && activeCount > 0 && (
                <span style={{ background: '#CC2200', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '999px' }}>{activeCount}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Demo role switcher */}
      <div style={{ padding: '10px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ color: C.faint, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', paddingLeft: '4px' }}>Demo: View as</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Object.entries(ROLES).map(([key, r]) => (
            <button key={key} onClick={() => setDemoRole(key)} style={{ flex: 1, padding: '5px 4px', borderRadius: '7px', border: `1px solid ${demoRole === key ? r.color : C.border}`, background: demoRole === key ? `${r.color}18` : 'transparent', color: demoRole === key ? r.color : C.faint, fontSize: '9px', fontWeight: demoRole === key ? 800 : 600, cursor: 'pointer', fontFamily: font, textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* User card */}
      <div style={{ padding: '10px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', background: C.surface, borderRadius: '9px', border: `1px solid ${C.border}` }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, ${cfg.color}, #2563EB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>DP</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: '12px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dare Praise</div>
            <div style={{ color: cfg.color, fontSize: '10px', fontWeight: 600 }}>{cfg.label}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = '#CC2200'}
            onMouseLeave={e => e.currentTarget.style.color = C.faint}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, color, label, value, sub, trend, trendUp }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', transition: 'all 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
      <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: trendUp ? 'rgba(5,150,105,0.1)' : 'rgba(204,34,0,0.1)', borderRadius: '999px', padding: '3px 9px' }}>
          <TrendingUp size={11} color={trendUp ? '#059669' : '#CC2200'} style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: trendUp ? '#059669' : '#CC2200' }}>{trend}</span>
        </div>
      )}
    </div>
    <div style={{ fontSize: 'clamp(1.6rem,2vw,2.2rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '5px', fontFamily: font }}>{value}</div>
    <div style={{ fontSize: '13px', color: C.muted, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: '11px', color: C.faint, marginTop: '2px' }}>{sub}</div>}
  </div>
);

/* ── Incident Row ── */
const IncidentRow = ({ inc, onRespond, onResolve, demoRole }) => {
  const type   = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
  const TypeIco = typeIcon(inc.type);
  const sevKey = normSev(inc.severity);
  const S      = SEV_STYLE[sevKey] || SEV_STYLE.medium;
  const stKey  = inc.status || 'Active';
  const ST     = STATUS_STYLE[stKey] || STATUS_STYLE.Active;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', borderRadius: '11px', background: C.surface2, marginBottom: '7px', transition: 'background 0.15s', borderLeft: `3px solid ${S.border}` }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = C.surface2}
    >
      <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TypeIco size={17} color={type.color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
          {inc.location && <span style={{ color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={9} /> {inc.location}</span>}
          <span style={{ color: C.faint, fontSize: '11px' }}>{timeAgo(inc.created_at)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: C.faint, fontSize: '11px' }}>
            <SrcIcon source={inc.source} size={10} /> {inc.source}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{ background: S.bg, color: S.text, fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px', border: `1px solid ${S.border}30` }}>{cap(sevKey)}</span>
          <span style={{ background: ST.bg, color: ST.color, fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px' }}>{stKey}</span>
        </div>
      </div>
      {/* Only responder/admin can action incidents */}
      {(demoRole === 'responder' || demoRole === 'admin') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
          {inc.status !== 'Responding' && inc.status !== 'Resolved' && (
            <button onClick={() => onRespond(inc.id)} style={{ background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(29,78,216,0.3)', borderRadius: '7px', padding: '5px 10px', color: '#1D4ED8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap' }}>Respond</button>
          )}
          {inc.status !== 'Resolved' && (
            <button onClick={() => onResolve(inc.id)} style={{ background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)', borderRadius: '7px', padding: '5px 10px', color: '#059669', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap' }}>Resolve</button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Type Bar Chart (no emojis) ── */
const TypeBarChart = ({ incidents }) => {
  const types  = ['fire','flood','accident','medical','security','crime'];
  const colors = ['#CC2200','#1D4ED8','#6D28D9','#059669','#D97706','#F97316'];
  const labels = ['Fire','Flood','Accident','Medical','Security','Crime'];
  const counts = types.map(t => incidents.filter(i => i.type === t).length);
  const max    = Math.max(...counts, 1);
  return (
    <div>
      <svg viewBox="0 0 320 90" style={{ width: '100%', height: '90px' }}>
        {types.map((t, i) => {
          const bw = 34, gap = 18, x = i * (bw + gap) + 6;
          const bh = Math.max((counts[i] / max) * 72, counts[i] > 0 ? 6 : 0);
          const y  = 78 - bh;
          return (
            <g key={t}>
              <rect x={x} y={y} width={bw} height={bh} rx="4" fill={colors[i]} opacity="0.9" />
              {counts[i] > 0 && <text x={x + bw/2} y={y - 3} textAnchor="middle" fill={colors[i]} fontSize="9" fontWeight="700" fontFamily="DM Sans">{counts[i]}</text>}
              <text x={x + bw/2} y="88" textAnchor="middle" fill="currentColor" fontSize="7.5" fontFamily="DM Sans" opacity="0.6">{labels[i]}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
        {types.map((t, i) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '2px', background: colors[i] }} />
            <span style={{ color: C.faint, fontSize: '10px' }}>{labels[i]} ({counts[i]})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Role-specific panels ── */
const PublicPanel = ({ incidents, loading }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      <Bell size={16} color="#D97706" strokeWidth={2} />
      <div style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>Safety Alerts Near You</div>
    </div>
    <p style={{ color: C.muted, fontSize: '12px', lineHeight: 1.7, marginBottom: '12px' }}>
      Stay informed about emergencies happening across Lagos State in real time.
      Enable alerts to get notified of incidents near your area.
    </p>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#CC2200', color: '#fff', padding: '9px 16px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
        <Plus size={14} /> Report Incident
      </Link>
      <Link to="/alerts" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)', color: '#D97706', padding: '9px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
        <Bell size={14} /> Manage Alerts
      </Link>
    </div>
  </div>
);

const ResponderPanel = ({ incidents, stats }) => {
  const critical = incidents.filter(i => normSev(i.severity) === 'critical');
  const high     = incidents.filter(i => normSev(i.severity) === 'high');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Dispatch queue */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Siren size={15} color="#CC2200" strokeWidth={2} />
          <div style={{ color: C.text, fontWeight: 700, fontSize: '13px' }}>Dispatch Queue</div>
          {critical.length > 0 && <span style={{ background: 'rgba(204,34,0,0.15)', color: '#CC2200', fontSize: '10px', fontWeight: 800, padding: '1px 7px', borderRadius: '999px' }}>{critical.length} CRITICAL</span>}
        </div>
        {critical.concat(high).slice(0, 4).map(inc => {
          const TypeIco = typeIcon(inc.type);
          const type    = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
          return (
            <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', background: C.surface2, marginBottom: '5px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '7px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TypeIco size={13} color={type.color} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontSize: '11px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
                <div style={{ color: C.faint, fontSize: '10px' }}>{inc.location} · {timeAgo(inc.created_at)}</div>
              </div>
              <Link to="/responder" style={{ background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(29,78,216,0.25)', color: '#1D4ED8', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>Dispatch</Link>
            </div>
          );
        })}
        {critical.concat(high).length === 0 && <div style={{ color: C.faint, fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>No critical/high incidents</div>}
      </div>

      {/* Quick links */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px' }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Quick Actions</div>
        {[
          { icon: Navigation, color: '#1D4ED8', label: 'Open Response Centers', to: '/responder' },
          { icon: MapPin,     color: '#059669', label: 'View Live Map',          to: '/map'       },
          { icon: Plus,       color: '#CC2200', label: 'Log Manual Report',      to: '/report'    },
        ].map((item, i) => (
          <Link key={i} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px', marginBottom: '3px', textDecoration: 'none', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = C.surface2}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ width: 30, height: 30, borderRadius: '7px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <item.icon size={14} color={item.color} strokeWidth={2} />
            </div>
            <span style={{ color: C.text, fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
            <ChevronRight size={13} color={C.faint} style={{ marginLeft: 'auto' }} />
          </Link>
        ))}
      </div>
    </div>
  );
};

const AdminPanel = ({ stats, incidents }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
      <Brain size={15} color="#6D28D9" strokeWidth={2} />
      <div style={{ color: C.text, fontWeight: 700, fontSize: '13px' }}>System Overview</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
      {[
        { label: 'NLP Engine',     status: true,  color: '#059669' },
        { label: 'Social Monitor', status: true,  color: '#059669' },
        { label: 'Email Alerts',   status: true,  color: '#059669' },
        { label: 'RSS Feeds',      status: true,  color: '#059669' },
      ].map(s => (
        <div key={s.label} style={{ background: C.surface2, borderRadius: '9px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: C.muted, fontSize: '11px' }}>{s.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, animation: 'pulse 2s infinite' }} />
            <span style={{ color: s.color, fontSize: '10px', fontWeight: 700 }}>Live</span>
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Link to="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.25)', color: '#6D28D9', padding: '8px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
        <BarChart2 size={13} /> Full Analytics
      </Link>
      <Link to="/responder" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.25)', color: '#CC2200', padding: '8px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
        <Radio size={13} /> Manage Centers
      </Link>
    </div>
  </div>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats,       setStats]       = useState(null);
  const [incidents,   setIncidents]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter,      setFilter]      = useState('All');
  const [demoRole,    setDemoRole]    = useState('responder');
  const { pathname }                  = useLocation();

  const load = useCallback(async () => {
    try {
      const [sRes, iRes] = await Promise.all([
        dashboardAPI.getStats(),
        incidentsAPI.getAll({ limit: 50 }),
      ]);
      setStats(sRes?.stats || sRes || null);
      setIncidents(iRes?.incidents || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const manualRefresh = useCallback(() => {
    setRefreshing(true);
    setStats(null);
    load();
  }, [load]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const handleRespond = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` }, body: JSON.stringify({ status: 'Responding' }) });
      load();
    } catch(e) { console.error(e); }
  };
  const handleResolve = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` }, body: JSON.stringify({ status: 'Resolved' }) });
      load();
    } catch(e) { console.error(e); }
  };

  const activeCount = incidents.filter(i => i.status === 'Active').length;
  const FILTERS     = ['All', 'Active', 'Responding', 'Monitoring', 'Resolved'];
  const filtered    = filter === 'All' ? incidents : incidents.filter(i => i.status === filter);
  const cfg         = ROLES[demoRole];

  /* Role-specific stats */
  const statCards = demoRole === 'public' ? [
    { icon: AlertTriangle, color: '#CC2200', label: 'Active Incidents',  value: loading ? '…' : stats?.active_incidents ?? activeCount,         sub: 'Lagos State right now'      },
    { icon: CheckCircle,   color: '#059669', label: 'Resolved Today',    value: loading ? '…' : stats?.resolved_today ?? 0,                      sub: 'Successfully closed'        },
    { icon: Radio,         color: '#1D4ED8', label: 'Sources Monitored', value: '5',                                                              sub: 'Social + news feeds'        },
    { icon: MapPin,        color: '#6D28D9', label: 'LGAs Covered',      value: '20',                                                             sub: 'All Lagos LGAs'             },
  ] : demoRole === 'responder' ? [
    { icon: AlertTriangle, color: '#CC2200', label: 'Active Now',         value: loading ? '…' : stats?.active_incidents ?? activeCount,          sub: 'Needs response',    trend: `+${stats?.new_last_hour ?? 0}`, trendUp: false },
    { icon: Clock,         color: '#D97706', label: 'Avg Response Time',  value: loading ? '…' : `${stats?.avg_response_time ?? '—'}m`,           sub: 'Time to first dispatch'     },
    { icon: Navigation,    color: '#1D4ED8', label: 'Units Deployed',     value: loading ? '…' : stats?.units_deployed ?? 8,                      sub: 'Across Lagos centers'       },
    { icon: CheckCircle,   color: '#059669', label: 'Resolved Today',     value: loading ? '…' : stats?.resolved_today ?? 0,                      sub: 'Closed this shift'          },
  ] : [
    { icon: AlertTriangle, color: '#CC2200', label: 'Active Incidents',   value: loading ? '…' : stats?.active_incidents ?? activeCount,          sub: 'Needs response now',trend: `+${stats?.new_last_hour ?? 0}`, trendUp: false },
    { icon: Activity,      color: '#D97706', label: 'Total Today',        value: loading ? '…' : stats?.total_today ?? incidents.length,          sub: 'Incidents detected'         },
    { icon: Radio,         color: '#1D4ED8', label: 'Posts Monitored',    value: loading ? '…' : stats?.posts_processed ?? 0,                     sub: 'Social + news today',trend: '+24', trendUp: true },
    { icon: CheckCircle,   color: '#059669', label: 'Resolved Today',     value: loading ? '…' : stats?.resolved_today ?? 0,                      sub: 'Successfully closed'        },
    { icon: Users,         color: '#6D28D9', label: 'Total (All Time)',    value: loading ? '…' : stats?.total_incidents ?? incidents.length,      sub: 'Since system launch'        },
    { icon: Brain,         color: '#CC2200', label: 'NER Accuracy',       value: '96%',                                                            sub: 'F1-Score: 0.96'             },
  ];

  return (
    <div style={{ display: 'flex', background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* Sidebar */}
      <div className="dash-sidebar" style={{ display: 'flex' }}>
        <Sidebar pathname={pathname} activeCount={activeCount} demoRole={demoRole} setDemoRole={setDemoRole} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199 }} />
          <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200 }}>
            <Sidebar pathname={pathname} activeCount={activeCount} demoRole={demoRole} setDemoRole={setDemoRole} />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>

        {/* Top bar */}
        <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(true)} className="dash-mob-menu" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0 }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>{cfg.title}</div>
              <div style={{ color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#059669', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                {cfg.subtitle} · {lastUpdated ? `Updated ${Math.round((Date.now() - lastUpdated) / 1000)}s ago` : 'Loading…'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={manualRefresh}
              disabled={refreshing}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 14px', color: refreshing ? C.faint : C.muted, fontSize: '12px', fontWeight: 600, cursor: refreshing ? 'not-allowed' : 'pointer', fontFamily: font, transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!refreshing) { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#CC220055'; }}}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#CC2200', color: '#fff', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(204,34,0,0.3)' }}>
              <Plus size={14} /> Report
            </Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Stat cards — even grid, always 4 per row for admin (6 stats = 3+3), 4 for others */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${demoRole === 'admin' ? 3 : 4}, 1fr)`, gap: '14px', marginBottom: '24px' }}>
            {statCards.map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>

          {/* Middle row: chart + role panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '20px' }}>
            {/* Incidents by type chart */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>Incidents by Type</div>
                  <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>Current data · Lagos State</div>
                </div>
                <Link to="/analytics" style={{ color: '#CC2200', fontSize: '11px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Full Analytics <ChevronRight size={12} />
                </Link>
              </div>
              {loading
                ? <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.faint, fontSize: '13px' }}>Loading…</div>
                : <TypeBarChart incidents={incidents} />
              }
            </div>

            {/* Role-specific right panel */}
            {demoRole === 'public'    && <PublicPanel    incidents={incidents} loading={loading} />}
            {demoRole === 'responder' && <ResponderPanel incidents={incidents} stats={stats} />}
            {demoRole === 'admin'     && <AdminPanel     stats={stats} incidents={incidents} />}
          </div>

          {/* Live incident feed */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>
                  {demoRole === 'public' ? 'Lagos Emergency Feed' : demoRole === 'responder' ? 'Active Incident Feed' : 'All Incidents'}
                </div>
                <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>
                  {filtered.length} incident{filtered.length !== 1 ? 's' : ''} {filter !== 'All' ? `· ${filter}` : '· Lagos State'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${filter === f ? '#CC2200' : C.border}`, background: filter === f ? '#CC2200' : C.surface2, color: filter === f ? '#fff' : C.muted, fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
                    {f} {f !== 'All' && `(${incidents.filter(i => i.status === f).length})`}
                  </button>
                ))}
                <Link to="/incidents" style={{ color: '#CC2200', fontSize: '11px', fontWeight: 700, textDecoration: 'none', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Full list <ChevronRight size={12} />
                </Link>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: C.faint, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} color={C.primary} />
                Loading incidents…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <CheckCircle size={32} color="#059669" style={{ margin: '0 auto 10px' }} />
                <div style={{ color: '#059669', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                  {filter === 'All' ? 'No incidents yet' : `No ${filter} incidents`}
                </div>
                <div style={{ color: C.faint, fontSize: '13px' }}>The social media monitor and NLP engine are running</div>
              </div>
            ) : (
              filtered.slice(0, demoRole === 'public' ? 8 : 20).map(inc => (
                <IncidentRow key={inc.id} inc={inc} onRespond={handleRespond} onResolve={handleResolve} demoRole={demoRole} />
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.3); } }
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
