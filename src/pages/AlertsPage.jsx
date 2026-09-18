import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Bell, BellOff, AlertTriangle, Flame, Droplets,
  Car, Shield, Activity, CheckCircle, X, Filter,
  MapPin, Clock, Settings, Trash2, Eye, EyeOff,
  Radio, Users, ChevronRight, RefreshCw, Plus,
  ToggleLeft, ToggleRight, Siren, Info
} from 'lucide-react';

/* ─── TOKENS ─── */
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
  purpleSoft:   'rgba(139,92,246,0.12)',
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

/* ─── ALERTS DATA ─── */
const ALERTS_DATA = [
  {
    id: 1, type: 'critical', icon: Flame, color: C.primary,
    title: '🔥 CRITICAL — Building fire near Oshodi Market',
    body: 'A large building fire has been detected at Oshodi Market, Lagos. NER extracted: Location = Oshodi Market, Lagos · Event = Fire/Explosion · Severity = Critical. Fire service has been dispatched.',
    time: '2 min ago', read: false, category: 'Incident',
    location: 'Oshodi, Lagos', source: 'X (Twitter)',
    actions: ['View on Map', 'Respond'],
  },
  {
    id: 2, type: 'high', icon: Shield, color: C.amber,
    title: '🔫 HIGH — Armed robbery alert, Lekki Phase 1',
    body: 'Multiple WhatsApp posts confirm armed men sighting at Lekki Phase 1 junction. Coordinates mapped to 6.4345°N, 3.4775°E. Police notified and en route.',
    time: '8 min ago', read: false, category: 'Incident',
    location: 'Lekki, Lagos', source: 'WhatsApp',
    actions: ['View on Map', 'Respond'],
  },
  {
    id: 3, type: 'high', icon: Shield, color: C.primary,
    title: '🚨 HIGH — Security threat reported, Maiduguri Road',
    body: 'Security situation on Maiduguri Road, Borno State. Army and Police deployed. Residents advised to remain indoors until further notice.',
    time: '45 min ago', read: false, category: 'Incident',
    location: 'Maiduguri, Borno', source: 'Facebook',
    actions: ['View on Map', 'Respond'],
  },
  {
    id: 4, type: 'medium', icon: Droplets, color: C.blue,
    title: '💧 MEDIUM — Flash flood warning, Mararaba Road FCT',
    body: 'Ongoing heavy rainfall causing road flooding in Mararaba area. 4 social media posts corroborated. Several vehicles stranded. NEMA notified.',
    time: '14 min ago', read: true, category: 'Incident',
    location: 'Mararaba, FCT', source: 'Facebook',
    actions: ['View on Map'],
  },
  {
    id: 5, type: 'medium', icon: Car, color: C.purple,
    title: '🚗 MEDIUM — Road accident, Lagos-Ibadan Expressway',
    body: 'Multiple vehicle collision near Sagamu interchange. FRSC and ambulances on scene. Road partially blocked. Avoid expressway if possible.',
    time: '31 min ago', read: true, category: 'Incident',
    location: 'Sagamu, Ogun', source: 'X (Twitter)',
    actions: ['View on Map'],
  },
  {
    id: 6, type: 'system', icon: Activity, color: C.green,
    title: '⚙️ SYSTEM — NER model accuracy improved',
    body: 'Latest model evaluation completed. Precision: 0.97 · Recall: 0.95 · F1-Score: 0.96. Location mapping accuracy now within 50m radius. Model version 2.4.1 deployed.',
    time: '1 hr ago', read: true, category: 'System',
    location: null, source: 'System',
    actions: ['View Analytics'],
  },
  {
    id: 7, type: 'system', icon: Radio, color: C.blue,
    title: '📡 SYSTEM — WhatsApp monitor back online',
    body: 'WhatsApp monitoring service restored after brief downtime. 47 queued messages processed. All social media feeds now operational.',
    time: '2 hrs ago', read: true, category: 'System',
    location: null, source: 'System',
    actions: [],
  },
  {
    id: 8, type: 'low', icon: Activity, color: C.amber,
    title: '🏥 LOW — Mass casualty, National Hospital Abuja',
    body: 'Hospital emergency protocol activated following mass casualty incident. 15 people admitted. Public advised to avoid hospital area.',
    time: '4 hrs ago', read: true, category: 'Incident',
    location: 'Abuja, FCT', source: 'Facebook',
    actions: ['View on Map'],
  },
  {
    id: 9, type: 'resolved', icon: CheckCircle, color: C.green,
    title: '✅ RESOLVED — Road accident, Lagos-Ibadan Expressway',
    body: 'Incident marked as resolved by responders. Road fully cleared. Emergency services have left the scene. Normal traffic resumed.',
    time: '6 hrs ago', read: true, category: 'Update',
    location: 'Sagamu, Ogun', source: 'Responder',
    actions: [],
  },
  {
    id: 10, type: 'resolved', icon: CheckCircle, color: C.green,
    title: '✅ RESOLVED — Kidnapping attempt, Kaduna',
    body: 'Attempted kidnapping near Government Secondary School foiled. Suspects arrested. All children confirmed safe. School resumed normal activity.',
    time: '8 hrs ago', read: true, category: 'Update',
    location: 'Kaduna City', source: 'Responder',
    actions: [],
  },
  {
    id: 11, type: 'info', icon: Info, color: C.blue,
    title: '📢 INFO — New incident types added to NER model',
    body: 'System now detects and classifies 3 new incident categories: Pipeline vandalism, Electoral violence, and Industrial accidents. Model retrained on 12,000 new samples.',
    time: '1 day ago', read: true, category: 'System',
    location: null, source: 'System',
    actions: [],
  },
  {
    id: 12, type: 'info', icon: Users, color: C.purple,
    title: '👥 INFO — 3 new emergency responders joined your zone',
    body: 'Three new verified emergency responders have been assigned to Lagos State zone. Total active responders in your area: 18.',
    time: '1 day ago', read: true, category: 'Update',
    location: 'Lagos State', source: 'System',
    actions: [],
  },
];

/* ─── PREFERENCE SETTINGS ─── */
const PREFS_DEFAULT = {
  push:      true,
  sms:       true,
  email:     false,
  sound:     true,
  highOnly:  false,
  radius:    '10km',
  fire:      true,
  crime:     true,
  flood:     true,
  accident:  true,
  medical:   true,
  security:  true,
  protest:   false,
};

const TYPE_COLORS = {
  critical: C.primary,
  high:     C.primary,
  medium:   C.amber,
  low:      C.green,
  resolved: C.green,
  system:   C.blue,
  info:     C.blue,
};

const CATEGORY_TABS = ['All', 'Incident', 'System', 'Update'];

/* ─── TOGGLE SWITCH ─── */
const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{
    width: 44, height: 24, borderRadius: '999px', cursor: 'pointer',
    background: on ? C.primary : C.surface2,
    border: `2px solid ${on ? C.primary : C.border}`,
    position: 'relative', transition: 'all 0.2s', flexShrink: 0,
  }}>
    <div style={{
      width: 16, height: 16, borderRadius: '50%', background: '#fff',
      position: 'absolute', top: '2px',
      left: on ? '22px' : '2px',
      transition: 'left 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    }} />
  </div>
);

/* ─── ALERT CARD ─── */
const AlertCard = ({ alert, onRead, onDelete }) => {
  const borderColor = TYPE_COLORS[alert.type] || C.blue;
  const isUnread    = !alert.read;
  const actions     = alert.actions || [];

  /* Map type string to a fallback icon */
  const iconMap = {
    critical: Siren,
    high:     AlertTriangle,
    medium:   Bell,
    low:      Info,
    resolved: CheckCircle,
    system:   Activity,
    info:     Info,
  };
  const IconComponent = alert.icon || iconMap[alert.type] || Bell;

  return (
    <div style={{
      background:   isUnread ? `${borderColor}06` : C.surface,
      border:       `1px solid ${isUnread ? borderColor + '30' : C.border}`,
      borderLeft:   `3px solid ${isUnread ? borderColor : 'transparent'}`,
      borderRadius: '14px', padding: '18px 20px',
      marginBottom: '8px', transition: 'all 0.2s',
      position: 'relative',
    }}
      onMouseEnter={e => e.currentTarget.style.background = isUnread ? `${borderColor}0A` : C.surface2}
      onMouseLeave={e => e.currentTarget.style.background = isUnread ? `${borderColor}06` : C.surface}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', width: 8, height: 8, borderRadius: '50%', background: borderColor, boxShadow: `0 0 8px ${borderColor}` }} />
      )}

      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{ width: 42, height: 42, borderRadius: '11px', background: `${borderColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IconComponent size={20} color={borderColor} strokeWidth={2} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: isUnread ? C.text : C.muted, fontWeight: isUnread ? 700 : 600, fontSize: '15px', marginBottom: '6px', lineHeight: 1.4, paddingRight: isUnread ? '16px' : '0' }}>
            {alert.title}
          </div>
          <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.7, marginBottom: '10px' }}>
            {alert.body}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: actions.length > 0 ? '12px' : '0' }}>
            <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> {alert.time || alert.created_at ? new Date(alert.created_at || alert.time).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }) : ''}
            </span>
            {alert.location && (
              <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} /> {alert.location}
              </span>
            )}
            <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>
              {alert.category || 'System'}
            </span>
            <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '2px 8px', borderRadius: '999px' }}>
              {alert.source || 'System'}
            </span>
          </div>

          {/* Action buttons */}
          {actions.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {actions.map((action, i) => (
                <Link key={i} to={action === 'View on Map' ? '/map' : action === 'Respond' ? '/incidents' : '/dashboard'} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: i === 0 && isUnread ? borderColor : C.surface2,
                  color: i === 0 && isUnread ? '#fff' : C.muted,
                  border: `1px solid ${i === 0 && isUnread ? borderColor : C.border}`,
                  borderRadius: '8px', padding: '6px 14px',
                  fontSize: '12px', fontWeight: 700, textDecoration: 'none',
                  transition: 'all 0.15s',
                }}>
                  {action} {i === 0 && <ChevronRight size={12} />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
          {isUnread && (
            <button onClick={() => onRead(alert.id)} title="Mark as read" style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.green; e.currentTarget.style.background = C.greenSoft; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.faint; e.currentTarget.style.background = 'none'; }}>
              <Eye size={15} />
            </button>
          )}
          <button onClick={() => onDelete(alert.id)} title="Delete" style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '4px', display: 'flex', borderRadius: '6px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primarySoft; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.faint; e.currentTarget.style.background = 'none'; }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function AlertsPage() {
  const [alerts,   setAlerts]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState('');
  const [activeTab,   setActiveTab]   = useState('All');
  const [activePanel, setActivePanel] = useState('alerts'); // 'alerts' | 'preferences'
  const [prefs,       setPrefs]       = useState(PREFS_DEFAULT);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await alertsAPI.getAll();
        if (res.alerts && res.alerts.length > 0) {
          setAlerts(res.alerts);
        } else {
          // Fallback to demo data if backend has no alerts yet
          setAlerts(ALERTS_DATA);
        }
      } catch (err) {
        // Backend not reachable — use demo data
        setAlerts(ALERTS_DATA);
        setApiError('Using demo data — backend not reachable');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  /* Handlers */
  const markRead = async (id) => {
    setAlerts(a => a.map(al => al.id === id ? { ...al, read: true } : al));
    try { await alertsAPI.markRead(id); } catch (e) { /* silent */ }
  };  
  const deleteAlert = async (id) => {
    setAlerts(a => a.filter(al => al.id !== id));
    try { await alertsAPI.delete(id); } catch (e) { /* silent */ }
  };
  const markAllRead = async () => {
    setAlerts(a => a.map(al => ({ ...al, read: true })));
    try { await alertsAPI.markAllRead(); } catch (e) { /* silent */ }
  };  
  const clearAll = async () => {
    setAlerts([]);
    try { await alertsAPI.clearAll(); } catch (e) { /* silent */ }
  };  
  const setPref     = k  => setPrefs(p => ({ ...p, [k]: !p[k] }));

  /* Filter */
  const filtered = alerts.filter(a => {
    if (activeTab !== 'All' && a.category !== activeTab) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) &&
        !a.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const PrefRow = ({ label, desc, k, color = C.primary }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: '15px' }}>{label}</div>
        {desc && <div style={{ color: C.faint, fontSize: '13px', marginTop: '3px' }}>{desc}</div>}
      </div>
      <Toggle on={prefs[k]} onChange={() => setPref(k)} />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '999px', padding: '5px 14px', marginBottom: '14px' }}>
                <Siren size={12} color={C.primary} />
                <span style={{ color: C.primary, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Notifications</span>
              </div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.4rem)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                Alerts &amp; Notifications
              </h1>
              <p style={{ color: C.muted, fontSize: '16px' }}>
                Stay informed about emergencies near you and system updates.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                  <Eye size={15} /> Mark all read
                </button>
              )}
              <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.borderColor = C.primaryBorder; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                <Trash2 size={15} /> Clear All
              </button>
              <button onClick={() => setActivePanel(p => p === 'preferences' ? 'alerts' : 'preferences')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: activePanel === 'preferences' ? C.primarySoft : C.surface, border: `1px solid ${activePanel === 'preferences' ? C.primaryBorder : C.border}`, borderRadius: '9px', padding: '9px 16px', color: activePanel === 'preferences' ? C.primary : C.muted, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
                <Settings size={15} /> Preferences
              </button>
            </div>
          </div>

          {/* Summary pills */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '24px' }}>
            {[
              { label: 'Unread',    value: unreadCount,                                    color: C.primary },
              { label: 'Incidents', value: alerts.filter(a=>a.category==='Incident').length,color: C.amber  },
              { label: 'System',    value: alerts.filter(a=>a.category==='System').length,  color: C.blue   },
              { label: 'Updates',   value: alerts.filter(a=>a.category==='Update').length,  color: C.green  },
              { label: 'Total',     value: alerts.length,                                   color: C.muted  },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '8px 14px' }}>
                <span style={{ color: s.color, fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{s.value}</span>
                <span style={{ color: C.faint, fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: activePanel === 'preferences' ? '1fr 400px' : '1fr', gap: '24px', alignItems: 'start' }}>

          {/* ══ LEFT: ALERTS LIST ══ */}
          <div>
            {/* Tabs + Search */}
            <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid ${C.border}`, marginBottom: '20px', overflowX: 'auto' }}>
              {CATEGORY_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: '10px 20px', border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? C.primary : 'transparent'}`,
                  background: 'transparent',
                  color: activeTab === tab ? C.primary : C.muted,
                  fontSize: '14px', fontWeight: activeTab === tab ? 700 : 500,
                  cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
                  whiteSpace: 'nowrap', marginBottom: '-1px',
                }}>
                  {tab}
                  <span style={{ marginLeft: '6px', background: activeTab === tab ? C.primarySoft : C.surface2, color: activeTab === tab ? C.primary : C.faint, fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px' }}>
                    {tab === 'All' ? alerts.length : alerts.filter(a => a.category === tab).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts..."
                style={{ width: '100%', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 14px 10px 34px', color: C.text, fontSize: '14px', fontFamily: font, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.4)'}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            {/* Results count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: C.muted, fontSize: '14px' }}>
                <strong style={{ color: C.text }}>{filtered.length}</strong> alert{filtered.length !== 1 ? 's' : ''}
                {unreadCount > 0 && <span style={{ color: C.primary, marginLeft: '8px' }}>· {unreadCount} unread</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                <span style={{ color: C.faint, fontSize: '12px' }}>Auto-updating</span>
              </div>
            </div>

            {/* Alert list */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', color: C.faint }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: C.muted }}>Loading alerts...</div>
              </div>
            ) : apiError ? (
              <div style={{ background: C.amberSoft, border: `1px solid rgba(245,158,11,0.3)`, borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', color: C.amber, fontSize: '13px' }}>
                ℹ️ {apiError}
              </div>
            ) : null}
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <BellOff size={48} style={{ margin: '0 auto 16px', color: C.faint, opacity: 0.4 }} />
                <div style={{ color: C.muted, fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                  {alerts.length === 0 ? 'No alerts' : 'No alerts match your search'}
                </div>
                <div style={{ color: C.faint, fontSize: '15px' }}>
                  {alerts.length === 0 ? "You're all caught up!" : 'Try a different search term'}
                </div>
              </div>
            ) : (
              filtered.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onRead={markRead}
                  onDelete={deleteAlert}
                />
              ))
            )}
          </div>

          {/* ══ RIGHT: PREFERENCES PANEL ══ */}
          {activePanel === 'preferences' && (
            <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px', position: 'sticky', top: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Alert Preferences</div>
                  <div style={{ color: C.faint, fontSize: '13px', marginTop: '3px' }}>Customise how you receive alerts</div>
                </div>
                <button onClick={() => setActivePanel('alerts')} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Delivery channels */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Delivery Channels</div>
                <PrefRow label="Push Notifications" desc="In-app and browser notifications"       k="push"  />
                <PrefRow label="SMS Alerts"          desc="Text messages for high severity only"   k="sms"   />
                <PrefRow label="Email Digest"        desc="Daily summary of all incidents"         k="email" />
                <PrefRow label="Alert Sound"         desc="Play sound for new notifications"       k="sound" />
              </div>

              {/* Severity filter */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Severity Filter</div>
                <PrefRow label="High Severity Only" desc="Only get alerted for critical and high incidents" k="highOnly" />
              </div>

              {/* Alert radius */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Alert Radius</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['5km','10km','25km','50km','State-wide'].map(r => (
                    <button key={r} onClick={() => setPrefs(p => ({ ...p, radius: r }))} style={{
                        padding: '7px 14px', borderRadius: '9px',
                        background: prefs.radius === r ? C.primarySoft : C.surface2,
                        color: prefs.radius === r ? C.primary : C.muted,
                        fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font,
                        border: `1px solid ${prefs.radius === r ? C.primaryBorder : C.border}`,
                    }}>
                        {r}
                    </button>
                    
                    // <button key={r} onClick={() => setPrefs(p => ({ ...p, radius: r }))} style={{
                    //   padding: '7px 14px', borderRadius: '9px', 
                    //   background: prefs.radius === r ? C.primarySoft : C.surface2,
                    //   color: prefs.radius === r ? C.primary : C.muted,
                    //   fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font,
                    //   border: `1px solid ${prefs.radius === r ? C.primaryBorder : C.border}`,
                    // }}>
                    //   {r}
                    // </button>
                  ))}
                </div>
              </div>

              {/* Incident types */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Incident Types to Track</div>
                {[
                  { k: 'fire',     label: '🔥 Fire & Explosions',  color: C.primary },
                  { k: 'crime',    label: '🔫 Crime & Robbery',    color: C.amber   },
                  { k: 'flood',    label: '💧 Floods & Disasters', color: C.blue    },
                  { k: 'accident', label: '🚗 Road Accidents',     color: C.purple  },
                  { k: 'medical',  label: '🏥 Medical Emergencies',color: C.green   },
                  { k: 'security', label: '🛡️ Security Threats',   color: C.amber   },
                  { k: 'protest',  label: '👥 Civil Unrest',       color: C.purple  },
                ].map(item => (
                  <div key={item.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.muted, fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                    <Toggle on={prefs[item.k]} onChange={() => setPref(item.k)} />
                  </div>
                ))}
              </div>

              {/* Save button */}
              <button style={{ width: '100%', background: C.primary, border: 'none', borderRadius: '11px', padding: '13px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: `0 6px 20px rgba(204,34,0,0.3)`, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}