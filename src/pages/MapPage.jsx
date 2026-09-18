import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, X, RefreshCw, Activity, Users,
  CheckCircle, Radio
} from 'lucide-react';
import { incidentsAPI } from '../services/api';

const C = {
  primary:      '#CC2200',
  primaryHover: '#A81B00',
  primarySoft:  'rgba(204,34,0,0.1)',
  primaryBorder:'rgba(204,34,0,0.3)',
  blue:         '#2563EB',
  green:        '#10B981',
  amber:        '#F59E0B',
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

const TYPE_CONFIG = {
  fire:     { icon: Flame,         color: C.primary, label: 'Fire'      },
  crime:    { icon: Shield,        color: C.amber,   label: 'Crime'     },
  flood:    { icon: Droplets,      color: C.blue,    label: 'Flood'     },
  accident: { icon: Car,           color: C.purple,  label: 'Accident'  },
  medical:  { icon: Activity,      color: C.green,   label: 'Medical'   },
  security: { icon: AlertTriangle, color: C.amber,   label: 'Security'  },
  protest:  { icon: Users,         color: C.purple,  label: 'Unrest'    },
  other:    { icon: AlertTriangle, color: C.faint,   label: 'Other'     },
};

const SEV_COLORS = {
  critical: '#FF3B30',
  high:     C.primary,
  medium:   C.amber,
  low:      C.green,
};

/* ── Convert real lat/lng to SVG coords for Nigeria map ── */
/* Nigeria bounds: lat 4.27–13.87, lng 2.69–14.68 */
const toSVG = (lat, lng, w = 500, h = 420) => {
  const x = ((lng - 2.69) / (14.68 - 2.69)) * w;
  const y = h - ((lat - 4.27) / (13.87 - 4.27)) * h;
  return { x: Math.round(x), y: Math.round(y) };
};

/* ── Default positions for incidents without GPS ── */
const DEFAULT_POSITIONS = [
  { lat: 6.5244,  lng: 3.3792  }, // Lagos
  { lat: 9.0765,  lng: 7.3986  }, // Abuja
  { lat: 4.8156,  lng: 7.0498  }, // Port Harcourt
  { lat: 12.0022, lng: 8.5919  }, // Kano
  { lat: 11.8311, lng: 13.1510 }, // Maiduguri
  { lat: 6.3350,  lng: 5.6037  }, // Benin City
  { lat: 7.3775,  lng: 3.9470  }, // Ibadan
  { lat: 6.8399,  lng: 3.6476  }, // Sagamu
  { lat: 5.5167,  lng: 5.7500  }, // Warri
  { lat: 6.4483,  lng: 7.5136  }, // Enugu
];

/* ── Incident Detail Panel ── */
const IncidentPanel = ({ inc, onClose, onRespond, onResolve }) => {
  if (!inc) return null;
  const type    = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
  const Icon    = type.icon;
  const color   = type.color;
  const sevKey  = (inc.severity || 'medium').toLowerCase();
  const sevColor = SEV_COLORS[sevKey] || C.amber;

  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1)    return 'Just now';
    if (diff < 60)   return `${diff} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
    return `${Math.floor(diff / 1440)} day(s) ago`;
  };

  return (
    <div style={{
      position: 'absolute', top: '16px', right: '16px',
      width: '300px', zIndex: 30, fontFamily: font,
      background: 'rgba(8,14,26,0.97)',
      border: `1px solid ${color}44`,
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${color}22`,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{ background: `${color}18`, padding: '16px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', lineHeight: 1.4, marginBottom: '4px' }}>{inc.title}</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ background: `${sevColor}22`, color: sevColor, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
              {inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium'}
            </span>
            <span style={{ background: C.surface2, color: C.faint, fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>
              {inc.status || 'Active'}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '2px', flexShrink: 0, display: 'flex' }}>
          <X size={16} />
        </button>
      </div>

      {/* Details */}
      <div style={{ padding: '16px' }}>
        {inc.description && (
          <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.7, marginBottom: '14px' }}>{inc.description}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {inc.location && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MapPin size={13} color={C.blue} />
              <span style={{ color: C.muted, fontSize: '13px' }}>{inc.location}{inc.state ? `, ${inc.state}` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Clock size={13} color={C.faint} />
            <span style={{ color: C.muted, fontSize: '13px' }}>{timeAgo(inc.created_at)}</span>
          </div>
          {inc.source && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Radio size={13} color={C.faint} />
              <span style={{ color: C.muted, fontSize: '13px' }}>Source: {inc.source}</span>
            </div>
          )}
          {inc.affected > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Users size={13} color={C.faint} />
              <span style={{ color: C.muted, fontSize: '13px' }}>~{inc.affected} people affected</span>
            </div>
          )}
          {inc.latitude && inc.longitude && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MapPin size={13} color={C.green} />
              <span style={{ color: C.faint, fontSize: '12px' }}>{parseFloat(inc.latitude).toFixed(4)}° N, {parseFloat(inc.longitude).toFixed(4)}° E</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {inc.status !== 'Resolved' && inc.status !== 'Responding' && (
            <button onClick={() => onRespond(inc.id)} style={{
              flex: 1, background: C.blue, border: 'none',
              borderRadius: '9px', padding: '10px',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: font,
            }}>
              🚨 Respond
            </button>
          )}
          {inc.status !== 'Resolved' && (
            <button onClick={() => onResolve(inc.id)} style={{
              flex: 1, background: C.greenSoft || 'rgba(16,185,129,0.15)',
              border: `1px solid rgba(16,185,129,0.3)`,
              borderRadius: '9px', padding: '10px',
              color: C.green, fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: font,
            }}>
              ✅ Resolved
            </button>
          )}
          {inc.status === 'Resolved' && (
            <div style={{ flex: 1, textAlign: 'center', padding: '10px', color: C.green, fontSize: '13px', fontWeight: 700 }}>
              ✅ This incident has been resolved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════
   MAIN MAP PAGE
═══════════════════════════════ */
export default function MapPage() {
  const [incidents,  setIncidents]  = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('All');
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = async () => {
    try {
      const res = await incidentsAPI.getAll({ limit: 100 });
      setIncidents(res.incidents || []);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Map load error:', e);
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
    await fetch(`http://localhost:5000/api/incidents/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` },
      body:    JSON.stringify({ status: 'Responding' }),
    });
    setSelected(prev => prev ? { ...prev, status: 'Responding' } : null);
    load();
  };

  const handleResolve = async (id) => {
    await fetch(`http://localhost:5000/api/incidents/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` },
      body:    JSON.stringify({ status: 'Resolved' }),
    });
    setSelected(prev => prev ? { ...prev, status: 'Resolved' } : null);
    load();
  };

  /* Apply filter */
  const FILTERS = ['All', 'Active', 'Responding', 'Monitoring', 'Resolved'];
  const filtered = filter === 'All'
    ? incidents
    : incidents.filter(i => i.status === filter);

  /* Map incidents to SVG coordinates */
  const mapped = filtered.map((inc, idx) => {
    let lat = parseFloat(inc.latitude);
    let lng = parseFloat(inc.longitude);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      const def = DEFAULT_POSITIONS[idx % DEFAULT_POSITIONS.length];
      lat = def.lat;
      lng = def.lng;
    }

    const pos    = toSVG(lat, lng);
    const type   = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
    const sevKey = (inc.severity || 'medium').toLowerCase();
    const color  = inc.status === 'Resolved' ? C.green : SEV_COLORS[sevKey] || C.amber;

    return { ...inc, svgX: pos.x, svgY: pos.y, pinColor: color, typeColor: type.color, typeIcon: type.icon };
  });

  const activeCount   = incidents.filter(i => i.status === 'Active').length;
  const respondCount  = incidents.filter(i => i.status === 'Responding').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', background: C.bg, fontFamily: font, overflow: 'hidden' }}>

      {/* ── LEFT PANEL — Incident List ── */}
      <div style={{
        width: '300px', flexShrink: 0,
        background: C.bgAlt, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} className="map-left">

        {/* Header */}
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '17px', letterSpacing: '-0.01em' }}>Live Incident Map</div>
              <div style={{ color: C.faint, fontSize: '12px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                {lastUpdate ? `Updated ${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : 'Loading...'}
              </div>
            </div>
            <button onClick={load} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.muted}>
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: 'Active',     value: activeCount,   color: C.primary },
              { label: 'Responding', value: respondCount,  color: C.blue    },
              { label: 'Resolved',   value: resolvedCount, color: C.green   },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, borderRadius: '9px', padding: '9px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: C.faint, fontSize: '10px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 10px', borderRadius: '7px', border: 'none',
                background: filter === f ? C.primary : C.surface,
                color: filter === f ? '#fff' : C.muted,
                fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', fontFamily: font,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Incident list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: C.faint, fontSize: '13px' }}>Loading incidents...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CheckCircle size={32} color={C.green} style={{ margin: '0 auto 10px' }} />
              <div style={{ color: C.green, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>No incidents</div>
              <div style={{ color: C.faint, fontSize: '12px' }}>System is monitoring continuously</div>
            </div>
          ) : (
            filtered.map(inc => {
              const type    = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
              const Icon    = type.icon;
              const sevKey  = (inc.severity || 'medium').toLowerCase();
              const sevColor = SEV_COLORS[sevKey] || C.amber;
              const isSelected = selected?.id === inc.id;

              const timeAgo = (d) => {
                const diff = Math.floor((Date.now() - new Date(d)) / 60000);
                if (diff < 1)    return 'Just now';
                if (diff < 60)   return `${diff}m ago`;
                if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
                return `${Math.floor(diff / 1440)}d ago`;
              };

              return (
                <div key={inc.id} onClick={() => setSelected(isSelected ? null : inc)} style={{
                  padding: '12px', borderRadius: '11px', marginBottom: '7px',
                  border: `1px solid ${isSelected ? type.color + '55' : C.border}`,
                  background: isSelected ? `${type.color}0A` : C.surface,
                  borderLeft: `3px solid ${sevColor}`,
                  cursor: 'pointer', transition: 'all 0.18s',
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.surface2; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = C.surface; }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={type.color} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px', lineHeight: 1.4 }}>{inc.title}</div>
                      <div style={{ color: C.faint, fontSize: '11px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={10} /> {inc.location || 'Location unknown'}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: `${sevColor}20`, color: sevColor, fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>
                          {inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium'}
                        </span>
                        <span style={{ color: C.faint, fontSize: '10px' }}>{timeAgo(inc.created_at)}</span>
                        <span style={{ color: C.faint, fontSize: '10px' }}>· {inc.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Report button */}
        <div style={{ padding: '12px', borderTop: `1px solid ${C.border}` }}>
          <Link to="/report" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: C.primary, color: '#fff', borderRadius: '10px',
            padding: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 4px 16px rgba(204,34,0,0.3)`,
          }}>
            <AlertTriangle size={16} /> Report an Emergency
          </Link>
        </div>
      </div>

      {/* ── RIGHT — The Map ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Source legend */}
        <div style={{
          position: 'absolute', top: '14px', left: '14px', zIndex: 20,
          background: 'rgba(8,14,26,0.92)', border: `1px solid ${C.border}`,
          borderRadius: '12px', padding: '12px 14px', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Data Sources</div>
          {[
            { color: C.text,   dot: C.primary, label: 'User Reports (CrisisWatch)'  },
            { color: C.text,   dot: C.blue,    label: 'X (Twitter) via NLP'         },
            { color: C.text,   dot: C.amber,   label: 'Facebook & WhatsApp via NLP' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0, boxShadow: `0 0 6px ${s.dot}` }} />
              <span style={{ color: C.muted, fontSize: '11px' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Severity legend */}
        <div style={{
          position: 'absolute', bottom: '14px', left: '14px', zIndex: 20,
          background: 'rgba(8,14,26,0.92)', border: `1px solid ${C.border}`,
          borderRadius: '12px', padding: '12px 14px', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Severity</div>
          {[
            { color: '#FF3B30', label: 'Critical' },
            { color: C.primary, label: 'High'     },
            { color: C.amber,   label: 'Medium'   },
            { color: C.green,   label: 'Low'       },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
              <span style={{ color: C.muted, fontSize: '11px' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Total count */}
        <div style={{
          position: 'absolute', bottom: '14px', right: '14px', zIndex: 20,
          background: 'rgba(8,14,26,0.92)', border: `1px solid ${C.border}`,
          borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(8px)',
          textAlign: 'center',
        }}>
          <div style={{ color: C.primary, fontWeight: 800, fontSize: '24px', lineHeight: 1 }}>{incidents.length}</div>
          <div style={{ color: C.faint, fontSize: '11px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Reports</div>
          <div style={{ color: C.green, fontWeight: 700, fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
            Live Monitoring
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 15, textAlign: 'center', color: C.faint }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: C.muted }}>Loading live incidents...</div>
          </div>
        )}

        {/* Incident detail panel */}
        <IncidentPanel
          inc={selected}
          onClose={() => setSelected(null)}
          onRespond={handleRespond}
          onResolve={handleResolve}
        />

        {/* SVG Map */}
        <svg
          viewBox="0 0 500 420"
          style={{ width: '100%', height: '100%', background: '#070E1C' }}
          onClick={e => { if (e.target.tagName === 'svg' || e.target.tagName === 'rect') setSelected(null); }}
        >
          <defs>
            <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0F2040" />
              <stop offset="100%" stopColor="#060C17" />
            </radialGradient>
            <filter id="pinGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="pinGlowStrong">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="500" height="420" fill="url(#mapBg)" />

          {/* Fine grid */}
          {Array.from({ length: 22 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2="500" y2={i * 20} stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          ))}
          {Array.from({ length: 26 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="420" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          ))}

          {/* Nigeria outline */}
          {/* WAIT */}
          {/* <path
            d="M 68 58 L 108 42 L 150 36 L 200 32 L 252 36 L 292 46 L 330 62 L 358 82 L 374 108 L 382 134 L 378 162 L 362 188 L 340 210 L 312 230 L 278 248 L 244 262 L 208 268 L 172 264 L 140 252 L 112 232 L 90 206 L 72 176 L 60 144 L 56 112 L 60 84 Z"
            fill="rgba(37,99,235,0.06)"
            stroke="rgba(37,99,235,0.25)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          /> */}

          {/* Nigeria label */}
          {/* WAIT */}
          {/* <text x="218" y="155" textAnchor="middle" fill="rgba(232,237,245,0.12)" fontSize="28" fontFamily="DM Sans" fontWeight="800" letterSpacing="0.05em">NIGERIA</text> */}

          {/* State region dividers */}
          <line x1="218" y1="32" x2="208" y2="268" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,6" />
          <line x1="56" y1="152" x2="382" y2="148" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4,6" />

          {/* Incident pins — REAL DATA */}
          {mapped.map((inc) => {
            const isSelected = selected?.id === inc.id;
            const isResolved = inc.status === 'Resolved';
            const pinColor   = isResolved ? C.green : inc.pinColor;
            const size       = isSelected ? 12 : (inc.severity === 'critical' || inc.severity === 'high') ? 9 : 7;

            return (
              <g key={inc.id} onClick={e => { e.stopPropagation(); setSelected(selected?.id === inc.id ? null : inc); }} style={{ cursor: 'pointer' }}>
                {/* Pulse rings for active high severity */}

                {/* WAIT */}
                {/* {!isResolved && (inc.severity === 'critical' || inc.severity === 'high') && (
                  <>
                    <circle cx={inc.svgX} cy={inc.svgY} r={size + 12} fill={pinColor} opacity="0.06" />
                    <circle cx={inc.svgX} cy={inc.svgY} r={size + 7}  fill={pinColor} opacity="0.1"  />
                  </>
                )} */}

                {/* WAIT */}
                {/* Selected ring */}
                {/* {isSelected && (
                  <circle cx={inc.svgX} cy={inc.svgY} r={size + 16} fill="none" stroke={pinColor} strokeWidth="1.5" opacity="0.6" strokeDasharray="4,3" />
                )} */}
                {/* Glow */}
                <circle cx={inc.svgX} cy={inc.svgY} r={size + 4} fill={pinColor} opacity="0.18" filter="url(#pinGlow)" />
                {/* Main pin */}
                <circle cx={inc.svgX} cy={inc.svgY} r={size} fill={pinColor} opacity={isSelected ? 1 : 0.9} filter={isSelected ? "url(#pinGlowStrong)" : "url(#pinGlow)"} />
                {/* Inner white dot */}
                <circle cx={inc.svgX} cy={inc.svgY} r={size * 0.4} fill="#fff" opacity="0.9" />
              </g>
            );
          })}

          {/* Empty state */}
          {!loading && mapped.length === 0 && (
            <text x="250" y="200" textAnchor="middle" fill="rgba(232,237,245,0.25)" fontSize="14" fontFamily="DM Sans">
              No incidents to display
            </text>
          )}
        </svg>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .map-left { width: 100% !important; position: fixed; left: 0; top: 68px; bottom: 0; z-index: 100; transform: translateX(-100%); transition: transform 0.3s; }
        }
      `}</style>
    </div>
  );
}