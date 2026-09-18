import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, RefreshCw, Activity, Users,
  CheckCircle, Radio, X
} from 'lucide-react';
import { incidentsAPI } from '../services/api';

/* ── Fix Leaflet default icon issue with Vite ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const C = {
  primary:      '#CC2200',
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

const TYPE_CONFIG = {
  fire:     { color: '#CC2200', emoji: '🔥', label: 'Fire'      },
  crime:    { color: '#F59E0B', emoji: '🔫', label: 'Crime'     },
  flood:    { color: '#2563EB', emoji: '💧', label: 'Flood'     },
  accident: { color: '#8B5CF6', emoji: '🚗', label: 'Accident'  },
  medical:  { color: '#10B981', emoji: '🏥', label: 'Medical'   },
  security: { color: '#F59E0B', emoji: '🛡️', label: 'Security' },
  protest:  { color: '#8B5CF6', emoji: '⚠️', label: 'Unrest'   },
  other:    { color: '#6B7280', emoji: '📍', label: 'Other'     },
};

const SEV_COLORS = {
  critical: '#FF3B30',
  high:     '#CC2200',
  medium:   '#F59E0B',
  low:      '#10B981',
};

/* ── Default Nigerian coordinates for incidents without GPS ── */
const NIGERIA_DEFAULTS = [
  { lat: 6.5244,  lng: 3.3792  }, // Lagos
  { lat: 9.0765,  lng: 7.3986  }, // Abuja
  { lat: 4.8156,  lng: 7.0498  }, // Port Harcourt
  { lat: 12.0022, lng: 8.5919  }, // Kano
  { lat: 7.3775,  lng: 3.9470  }, // Ibadan
  { lat: 6.3350,  lng: 5.6037  }, // Benin City
  { lat: 11.8311, lng: 13.1510 }, // Maiduguri
  { lat: 6.8399,  lng: 3.6476  }, // Sagamu
  { lat: 5.5167,  lng: 5.7500  }, // Warri
  { lat: 6.4483,  lng: 7.5136  }, // Enugu
  { lat: 10.5264, lng: 7.4382  }, // Kaduna
  { lat: 6.1428,  lng: 6.7862  }, // Onitsha
];

/* ── Create custom colored marker icon ── */
const createIcon = (color, severity) => {
  const size   = severity === 'critical' ? 36 : severity === 'high' ? 32 : 28;
  const pulse  = severity === 'critical' || severity === 'high';

  return L.divIcon({
    className: '',
    iconSize:  [size, size],
    iconAnchor:[size / 2, size],
    popupAnchor:[0, -size],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse ? `
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:${size + 16}px;height:${size + 16}px;
            border-radius:50%;background:${color};
            opacity:0.2;
            animation:pulse 2s ease-out infinite;
          "></div>
        ` : ''}
        <div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:3px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 14px ${color}88;
        "></div>
        <style>
          @keyframes pulse {
            0%   { transform:translate(-50%,-50%) scale(0.5); opacity:0.3; }
            100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; }
          }
        </style>
      </div>
    `,
  });
};

/* ── Fly to selected incident ── */
const FlyTo = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 13, { duration: 1.2 });
  }, [lat, lng]);
  return null;
};

/* ── Incident List Item ── */
const IncidentItem = ({ inc, isSelected, onClick }) => {
  const type     = TYPE_CONFIG[inc.type]  || TYPE_CONFIG.other;
  const sevColor = SEV_COLORS[(inc.severity || 'medium').toLowerCase()] || C.amber;

  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1)    return 'Just now';
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div onClick={onClick} style={{
      padding: '12px', borderRadius: '11px', marginBottom: '7px',
      border: `1px solid ${isSelected ? type.color + '55' : C.border}`,
      background: isSelected ? `${type.color}0D` : C.surface,
      borderLeft: `3px solid ${sevColor}`,
      cursor: 'pointer', transition: 'all 0.18s',
    }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.surface2; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = C.surface; }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1 }}>{type.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px', lineHeight: 1.4 }}>{inc.title}</div>
          <div style={{ color: C.faint, fontSize: '11px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={10} /> {inc.location || 'Location unknown'}
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: `${sevColor}20`, color: sevColor, fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>
              {inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium'}
            </span>
            <span style={{ background: C.surface2, color: C.faint, fontSize: '10px', padding: '2px 7px', borderRadius: '999px' }}>
              {inc.status}
            </span>
            <span style={{ color: C.faint, fontSize: '10px' }}>{timeAgo(inc.created_at)}</span>
          </div>
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
      const res = await incidentsAPI.getAll({ limit: 200 });
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
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${localStorage.getItem('crisiswatch_token')}`,
      },
      body: JSON.stringify({ status: 'Responding' }),
    });
    load();
  };

  const handleResolve = async (id) => {
    await fetch(`http://localhost:5000/api/incidents/${id}`, {
      method:  'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${localStorage.getItem('crisiswatch_token')}`,
      },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    load();
  };

  const FILTERS = ['All', 'Active', 'Responding', 'Resolved'];

  const filtered = filter === 'All'
    ? incidents
    : incidents.filter(i => i.status === filter);

  /* Assign coordinates to each incident */
  const withCoords = filtered.map((inc, idx) => {
    let lat = parseFloat(inc.latitude);
    let lng = parseFloat(inc.longitude);
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      const def = NIGERIA_DEFAULTS[idx % NIGERIA_DEFAULTS.length];
      lat = def.lat;
      lng = def.lng;
    }
    return { ...inc, lat, lng };
  });

  /* Selected incident coordinates */
  const selCoords = selected
    ? withCoords.find(i => i.id === selected.id)
    : null;

  const activeCount   = incidents.filter(i => i.status === 'Active').length;
  const respondCount  = incidents.filter(i => i.status === 'Responding').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  const timeAgo = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1)    return 'Just now';
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', background: C.bg, fontFamily: font, overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        width: '300px', flexShrink: 0,
        background: C.bgAlt, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '17px' }}>Live Incident Map</div>
              <div style={{ color: C.faint, fontSize: '11px', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                {lastUpdate ? `Updated ${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : 'Loading...'}
              </div>
            </div>
            <button onClick={load} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.muted, transition: 'color 0.15s' }}
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
                <div style={{ color: s.color, fontWeight: 800, fontSize: '20px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: C.faint, fontSize: '10px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flex: 1, padding: '6px 4px', borderRadius: '7px', border: 'none',
                background: filter === f ? C.primary : C.surface,
                color: filter === f ? '#fff' : C.muted,
                fontSize: '11px', fontWeight: 600,
                cursor: 'pointer', fontFamily: font,
                transition: 'all 0.15s',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Incident list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: C.faint, fontSize: '13px' }}>
              Loading incidents...
            </div>
          ) : withCoords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <CheckCircle size={32} color={C.green} style={{ margin: '0 auto 10px' }} />
              <div style={{ color: C.green, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>No incidents</div>
              <div style={{ color: C.faint, fontSize: '12px' }}>System is monitoring continuously</div>
            </div>
          ) : (
            withCoords.map(inc => (
              <IncidentItem
                key={inc.id}
                inc={inc}
                isSelected={selected?.id === inc.id}
                onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
              />
            ))
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

      {/* ── RIGHT — Real Leaflet Map ── */}
      <div style={{ flex: 1, position: 'relative' }}>

        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1000,
            background: 'rgba(8,14,26,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Loading map...</div>
              <div style={{ color: C.faint, fontSize: '13px' }}>Fetching live incidents from database</div>
            </div>
          </div>
        )}

        <MapContainer
          center={[9.0820, 8.6753]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          {/* Dark OpenStreetMap tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />

          {/* Fly to selected */}
          {selCoords && <FlyTo lat={selCoords.lat} lng={selCoords.lng} />}

          {/* Incident markers */}
          {withCoords.map(inc => {
            const type     = TYPE_CONFIG[inc.type]  || TYPE_CONFIG.other;
            const sevKey   = (inc.severity || 'medium').toLowerCase();
            const color    = inc.status === 'Resolved' ? C.green : SEV_COLORS[sevKey] || C.amber;
            const icon     = createIcon(color, sevKey);

            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelected(selected?.id === inc.id ? null : inc),
                }}
              >
                <Popup
                  maxWidth={280}
                  className="crisis-popup"
                >
                  <div style={{ fontFamily: font, padding: '4px' }}>
                    {/* Popup header */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{type.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0D1525', lineHeight: 1.3, marginBottom: '4px' }}>{inc.title}</div>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          <span style={{ background: `${color}20`, color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', border: `1px solid ${color}30` }}>
                            {inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium'}
                          </span>
                          <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>
                            {inc.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {inc.description && (
                      <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, marginBottom: '10px' }}>
                        {inc.description.length > 120 ? inc.description.slice(0, 120) + '...' : inc.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                      {inc.location && (
                        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '5px', alignItems: 'center' }}>
                          📍 {inc.location}{inc.state ? `, ${inc.state}` : ''}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        🕐 {timeAgo(inc.created_at)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '5px', alignItems: 'center' }}>
                        📡 Source: {inc.source}
                      </div>
                      {inc.affected > 0 && (
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          👥 ~{inc.affected} people affected
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {inc.status !== 'Resolved' && inc.status !== 'Responding' && (
                        <button
                          onClick={() => handleRespond(inc.id)}
                          style={{
                            flex: 1, background: '#2563EB', border: 'none',
                            borderRadius: '8px', padding: '9px',
                            color: '#fff', fontSize: '12px', fontWeight: 700,
                            cursor: 'pointer', fontFamily: font,
                          }}
                        >
                          🚨 Respond
                        </button>
                      )}
                      {inc.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(inc.id)}
                          style={{
                            flex: 1, background: '#10B981', border: 'none',
                            borderRadius: '8px', padding: '9px',
                            color: '#fff', fontSize: '12px', fontWeight: 700,
                            cursor: 'pointer', fontFamily: font,
                          }}
                        >
                          ✅ Resolved
                        </button>
                      )}
                      {inc.status === 'Resolved' && (
                        <div style={{ flex: 1, textAlign: 'center', padding: '9px', color: '#10B981', fontSize: '12px', fontWeight: 700, background: '#D1FAE5', borderRadius: '8px' }}>
                          ✅ Resolved
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* CSS for popup */}
        <style>{`
          .crisis-popup .leaflet-popup-content-wrapper {
            border-radius: 14px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            border: 1px solid rgba(0,0,0,0.08);
            padding: 0;
          }
          .crisis-popup .leaflet-popup-content {
            margin: 14px;
          }
          .crisis-popup .leaflet-popup-tip {
            background: white;
          }
        `}</style>
      </div>
    </div>
  );
}