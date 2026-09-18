import React, { useState, useEffect } from 'react';
import { incidentsAPI } from '../services/api';import { Link } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, Filter, Search, X, ChevronRight,
  Layers, ZoomIn, ZoomOut, Navigation, Radio,
  Users, Activity
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

/* ─── INCIDENT DATA ─── */

const STATES  = ['All States', 'Lagos', 'FCT', 'Rivers', 'Ogun', 'Borno', 'Delta', 'Kano'];
const TYPES   = ['All Types', 'Fire', 'Crime', 'Flood', 'Accident', 'Security', 'Protest', 'Medical'];
const SEV     = ['All', 'High', 'Medium', 'Low'];
const TIMES   = ['All Time', 'Last 1hr', 'Last 6hrs', 'Last 24hrs'];

export default function MapPage() {
  const [selectedId,   setSelectedId]   = useState(null);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [mapLoading,    setMapLoading]    = useState(true);
  const [filterState,  setFilterState]  = useState('All States');
  const [filterType,   setFilterType]   = useState('All Types');
  const [filterSev,    setFilterSev]    = useState('All');
  const [filterTime,   setFilterTime]   = useState('All Time');
  const [search,       setSearch]       = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [activeLayer,  setActiveLayer]  = useState('incidents');

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setMapLoading(true);
        const res = await incidentsAPI.getAll({ limit: 100 });
        const mapped = (res.incidents || []).map((inc, i) => {
          const iconMap = {
            fire:     { icon: Flame,         color: '#CC2200' },
            crime:    { icon: AlertTriangle, color: '#F59E0B' },
            flood:    { icon: Droplets,      color: '#2563EB' },
            accident: { icon: Car,           color: '#8B5CF6' },
            security: { icon: Shield,        color: '#10B981' },
            medical:  { icon: Activity,      color: '#F59E0B' },
            protest:  { icon: Users,         color: '#8B5CF6' },
          };
          const mapped_icon = iconMap[inc.type] || { icon: AlertTriangle, color: '#F59E0B' };

          // Use real coordinates if available, otherwise spread across Nigeria map
          const defaultPositions = [
            { cx: 172, cy: 158 }, { cx: 188, cy: 165 }, { cx: 218, cy: 108 },
            { cx: 155, cy: 148 }, { cx: 295, cy: 82  }, { cx: 210, cy: 178 },
            { cx: 195, cy: 162 }, { cx: 245, cy: 72  }, { cx: 222, cy: 112 },
            { cx: 165, cy: 162 },
          ];
          const pos = defaultPositions[i % defaultPositions.length];

          // Convert real lat/lng to SVG coordinates if available
          let cx = pos.cx;
          let cy = pos.cy;
          if (inc.latitude && inc.longitude) {
            // Nigeria bounds: lat 4-14, lng 3-15
            cx = Math.round(((inc.longitude - 3) / 12) * 280 + 70);
            cy = Math.round(((14 - inc.latitude) / 10) * 200 + 36);
          }

          const sevKey = inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium';

          return {
            id:       inc.id,
            icon:     mapped_icon.icon,
            color:    mapped_icon.color,
            type:     inc.type ? inc.type.charAt(0).toUpperCase() + inc.type.slice(1) : 'Other',
            title:    inc.title,
            location: inc.location,
            state:    inc.state,
            source:   inc.source,
            time:     new Date(inc.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }),
            severity: sevKey,
            status:   inc.status || 'Active',
            affected: inc.affected || 0,
            desc:     inc.description || 'No description provided.',
            cx,
            cy,
          };
        });
        setLiveIncidents(mapped);
      } catch (err) {
        console.error('Map fetch error:', err);
        setLiveIncidents([]);
      } finally {
        setMapLoading(false);
      }
    };

    fetchIncidents();

    // Refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  /* Filter logic */
  const filtered = liveIncidents.filter(inc => {
    if (filterState !== 'All States' && inc.state !== filterState) return false;
    if (filterType  !== 'All Types'  && inc.type  !== filterType)  return false;
    if (filterSev   !== 'All'        && inc.severity !== filterSev) return false;
    if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) &&
        !inc.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = liveIncidents.find(i => i.id === selectedId);

  const sevStyle = {
    High:     { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)'  },
    Medium:   { text: '#FFD180', bg: 'rgba(245,158,11,0.18)' },
    Low:      { text: '#69F0AE', bg: 'rgba(16,185,129,0.18)' },
    Critical: { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)'  },
    high:     { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)'  },
    medium:   { text: '#FFD180', bg: 'rgba(245,158,11,0.18)' },
    low:      { text: '#69F0AE', bg: 'rgba(16,185,129,0.18)' },
    critical: { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)'  },
  };

  const FilterPill = ({ label, options, value, onChange }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ color: C.faint, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '5px 12px', borderRadius: '999px', border: 'none',
            background: value === opt ? C.primary : C.surface2,
            color: value === opt ? '#fff' : C.muted,
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            fontFamily: font, transition: 'all 0.15s',
          }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', background: C.bg, fontFamily: font, overflow: 'hidden' }}>

      {/* ══════════════════════════════
          LEFT PANEL — Filters + List
      ══════════════════════════════ */}
      <div style={{
        width: '340px', flexShrink: 0,
        background: C.bgAlt,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        overflowY: 'hidden',
      }} className="map-left-panel">

        {/* Header */}
        <div style={{ padding: '20px 20px 0', borderBottom: `1px solid ${C.border}`, paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Live Incidents</div>
              <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                {filtered.length} showing · {liveIncidents.length} total
              </div>
            </div>
            <button onClick={() => setShowFilters(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: showFilters ? C.primarySoft : C.surface,
              border: `1px solid ${showFilters ? C.primary : C.border}`,
              borderRadius: '9px', padding: '7px 12px',
              color: showFilters ? C.primary : C.muted,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font,
            }}>
              <Filter size={14} /> Filters
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: showFilters ? '0' : '4px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search incidents or locations..."
              style={{
                width: '100%', background: C.surface2,
                border: `1px solid ${C.border}`, borderRadius: '10px',
                padding: '10px 14px 10px 36px',
                color: C.text, fontSize: '13px', fontFamily: font,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.4)'}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, background: C.surface, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <FilterPill label="Severity"   options={SEV}    value={filterSev}   onChange={setFilterSev}   />
            <FilterPill label="Type"       options={TYPES}  value={filterType}  onChange={setFilterType}  />
            <FilterPill label="State"      options={STATES} value={filterState} onChange={setFilterState} />
            <FilterPill label="Time Range" options={TIMES}  value={filterTime}  onChange={setFilterTime}  />
            <button onClick={() => { setFilterSev('All'); setFilterType('All Types'); setFilterState('All States'); setFilterTime('All Time'); setSearch(''); }} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: C.primary, fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              Clear all filters
            </button>
          </div>
        )}

        {/* Incident list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: C.faint }}>
              <MapPin size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <div style={{ fontSize: '14px' }}>No incidents match your filters</div>
            </div>
          ) : (
            filtered.map(inc => {
              const active = selectedId === inc.id;
              const S = sevStyle[inc.severity] || sevStyle['Medium'];
              return (
                <div key={inc.id} onClick={() => setSelectedId(active ? null : inc.id)} style={{
                  padding: '13px 14px', borderRadius: '12px', marginBottom: '7px',
                  border: `1px solid ${active ? inc.color + '44' : C.border}`,
                  background: active ? `${inc.color}0A` : C.surface,
                  cursor: 'pointer', transition: 'all 0.18s',
                  borderLeft: `3px solid ${active ? inc.color : C.border}`,
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.surface2; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.borderLeftColor = inc.color + '66'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderLeftColor = C.border; }}}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${inc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <inc.icon size={16} color={inc.color} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, fontWeight: 600, fontSize: '13px', marginBottom: '4px', lineHeight: 1.4 }}>{inc.title}</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {inc.location}</span>
                        <span style={{ color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {inc.time}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ background: S.bg, color: S.text, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{inc.severity}</span>
                        <span style={{ background: C.surface2, color: C.faint, fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px' }}>{inc.type}</span>
                        <span style={{ background: C.surface2, color: C.faint, fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>{inc.source}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {active && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                      <p style={{ color: C.muted, fontSize: '12px', lineHeight: 1.7, marginBottom: '10px' }}>{inc.desc}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ flex: 1, background: C.primary, border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                          Respond
                        </button>
                        <button style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px', color: C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                          Share
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          RIGHT PANEL — Map
      ══════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Map toolbar */}
        <div style={{
          position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 20, display: 'flex', gap: '8px', alignItems: 'center',
        }}>
          {/* Layer toggle */}
          {['incidents', 'heatmap', 'clusters'].map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)} style={{
              background: activeLayer === layer ? C.primary : 'rgba(13,21,37,0.9)',
              border: `1px solid ${activeLayer === layer ? C.primary : C.border}`,
              borderRadius: '8px', padding: '7px 14px',
              color: activeLayer === layer ? '#fff' : C.muted,
              fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font,
              backdropFilter: 'blur(8px)', transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}>
              {layer}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { icon: ZoomIn,     label: '+' },
            { icon: ZoomOut,    label: '−' },
            { icon: Navigation, label: '◎' },
            { icon: Layers,     label: '≡' },
          ].map((btn, i) => (
            <button key={i} style={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'rgba(13,21,37,0.9)',
              border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.15s',
              color: C.muted,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,21,37,0.9)'; e.currentTarget.style.color = C.muted; }}
            >
              <btn.icon size={16} />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px', zIndex: 20,
          background: 'rgba(13,21,37,0.92)', border: `1px solid ${C.border}`,
          borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Severity</div>
          {[
            { color: C.primary, label: 'High',   count: liveIncidents.filter(i => i.severity === 'High').length   },
            { color: C.amber,   label: 'Medium',  count: liveIncidents.filter(i => i.severity === 'Medium').length },
            { color: C.green,   label: 'Low',     count: liveIncidents.filter(i => i.severity === 'Low').length    },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
              <span style={{ color: C.muted, fontSize: '12px', flex: 1 }}>{l.label}</span>
              <span style={{ color: C.faint, fontSize: '11px', fontWeight: 700 }}>{l.count}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px', marginTop: '4px' }}>
            <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Type</div>
            {[
              { color: C.primary, label: 'Fire / Explosion' },
              { color: C.amber,   label: 'Crime / Security' },
              { color: C.blue,    label: 'Flood / Disaster' },
              { color: C.purple,  label: 'Accident / Other' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '2px', background: l.color }} />
                <span style={{ color: C.muted, fontSize: '11px' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats overlay */}
        <div style={{
          position: 'absolute', bottom: '16px', right: '64px', zIndex: 20,
          background: 'rgba(13,21,37,0.92)', border: `1px solid ${C.border}`,
          borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { label: 'Total', value: liveIncidents.length,                                              color: C.text    },
              { label: 'High',  value: liveIncidents.filter(i => i.severity==='High').length, color: C.primary },
              { label: 'Live',  value: liveIncidents.filter(i => i.status==='Active').length, color: C.green   },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ color: s.color, fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: C.faint, fontSize: '10px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THE MAP SVG ── */}
        {mapLoading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10, textAlign: 'center', color: C.faint }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: C.muted }}>Loading live incidents...</div>
          </div>
        )}
        
        <svg
          viewBox="0 0 500 380"
          style={{ width: '100%', height: '100%', background: '#070E1C' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedId(null); }}
        >
          <defs>
            <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0F2040" />
              <stop offset="100%" stopColor="#060C17" />
            </radialGradient>
            <radialGradient id="nigeriaGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="rgba(204,34,0,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="pinGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="500" height="380" fill="url(#mapBgGrad)" />

          {/* Fine grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 20} x2="500" y2={i * 20} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}
          {Array.from({ length: 26 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="380" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          ))}

          {/* Nigeria glow */}
          <ellipse cx="218" cy="128" rx="110" ry="90" fill="url(#nigeriaGlow)" />

          {/* Nigeria outline */}
          <path
            d="M 95 58 L 130 44 L 170 38 L 210 36 L 252 42 L 285 55 L 310 72 L 325 95 L 332 118 L 328 142 L 315 162 L 298 178 L 272 192 L 242 200 L 210 203 L 178 198 L 150 185 L 126 168 L 108 148 L 96 125 L 90 100 Z"
            fill="rgba(204,34,0,0.05)"
            stroke="rgba(204,34,0,0.35)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* State borders (simplified internal lines) */}
          <line x1="210" y1="36"  x2="210" y2="203" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,5" />
          <line x1="95"  y1="128" x2="332" y2="128" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3,5" />
          <line x1="170" y1="38"  x2="150" y2="185" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3,5" />
          <line x1="252" y1="42"  x2="272" y2="192" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3,5" />

          {/* State labels */}
          {[
            { label: 'LAGOS',    x: 162, y: 220 },
            { label: 'ABUJA',    x: 215, y: 95  },
            { label: 'KANO',     x: 245, y: 60  },
            { label: 'RIVERS',   x: 210, y: 200 },
            { label: 'BORNO',    x: 298, y: 70  },
            { label: 'OYO',      x: 148, y: 148 },
          ].map(l => (
            <text key={l.label} x={l.x} y={l.y} textAnchor="middle" fill="rgba(232,237,245,0.18)" fontSize="8" fontFamily="DM Sans" fontWeight="600" letterSpacing="0.12em">{l.label}</text>
          ))}

          {/* Connection lines between high-severity incidents */}
          {filtered.filter(i => i.severity === 'High').map((inc, idx, arr) => {
            if (idx === 0) return null;
            const prev = arr[idx - 1];
            return <line key={inc.id} x1={prev.cx} y1={prev.cy} x2={inc.cx} y2={inc.cy} stroke={`${inc.color}20`} strokeWidth="1" strokeDasharray="4,6" />;
          })}

          {/* Incident pins */}
          {filtered.map(inc => {
            const active = selectedId === inc.id;
            const size = active ? 10 : inc.severity === 'High' ? 8 : 6;
            return (
              <g key={inc.id} onClick={e => { e.stopPropagation(); setSelectedId(active ? null : inc.id); }} style={{ cursor: 'pointer' }}>
                {/* Pulse ring */}
                {inc.severity === 'High' && (
                  <>
                    <circle cx={inc.cx} cy={inc.cy} r={size + 10} fill={inc.color} opacity="0.06" />
                    <circle cx={inc.cx} cy={inc.cy} r={size + 6}  fill={inc.color} opacity="0.1"  />
                  </>
                )}
                {/* Active ring */}
                {active && <circle cx={inc.cx} cy={inc.cy} r={size + 14} fill="none" stroke={inc.color} strokeWidth="1.5" opacity="0.5" strokeDasharray="4,3" />}
                {/* Outer glow */}
                <circle cx={inc.cx} cy={inc.cy} r={size + 3} fill={inc.color} opacity="0.2" filter="url(#softGlow)" />
                {/* Main pin */}
                <circle cx={inc.cx} cy={inc.cy} r={size} fill={inc.color} opacity={active ? 1 : 0.88} filter="url(#pinGlow)" />
                {/* Inner dot */}
                <circle cx={inc.cx} cy={inc.cy} r={size * 0.42} fill="#fff" opacity="0.85" />
                {/* Tooltip label on hover/active */}
                {active && (
                  <g>
                    <rect x={inc.cx - 70} y={inc.cy - 36} width="140" height="22" rx="5" fill="rgba(13,21,37,0.95)" stroke={inc.color} strokeWidth="1" />
                    <text x={inc.cx} y={inc.cy - 21} textAnchor="middle" fill={C.text} fontSize="9" fontFamily="DM Sans" fontWeight="600">
                      {inc.title.substring(0, 28)}{inc.title.length > 28 ? '…' : ''}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Heatmap overlay (if selected) */}
          {activeLayer === 'heatmap' && (
            <g opacity="0.35">
              {liveIncidents.map(inc => (
                <radialGradient key={inc.id} id={`heat-${inc.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={inc.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={inc.color} stopOpacity="0" />
                </radialGradient>
              ))}
              {liveIncidents.map(inc => (
                <ellipse key={inc.id} cx={inc.cx} cy={inc.cy} rx="30" ry="22" fill={inc.color} opacity="0.18" />
              ))}
            </g>
          )}
        </svg>

        {/* Selected incident popup (top-right of map) */}
        {selected && (
          <div style={{
            position: 'absolute', top: '70px', right: '70px',
            width: '280px', zIndex: 30,
            background: 'rgba(13,21,37,0.97)',
            border: `1px solid ${selected.color}44`,
            borderRadius: '16px', padding: '18px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${selected.color}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${selected.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <selected.icon size={18} color={selected.color} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', lineHeight: 1.4 }}>{selected.title}</div>
                  <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {selected.location}</div>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ color: C.muted, fontSize: '12px', lineHeight: 1.7, marginBottom: '14px' }}>{selected.desc}</p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <span style={{ background: (sevStyle[selected.severity] || sevStyle['Medium']).bg, color: (sevStyle[selected.severity] || sevStyle['Medium']).text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>{selected.severity}</span>
              <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>{selected.type}</span>
              <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>{selected.source}</span>
              <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 10px', borderRadius: '999px' }}><Clock size={10} /> {selected.time}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, background: C.primary, border: 'none', borderRadius: '9px', padding: '9px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                Respond
              </button>
              <button style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                View Full
              </button>
            </div>
          </div>
        )}

        {/* No-incidents notice */}
        {filtered.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', color: C.faint }}>
            <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px', fontWeight: 600 }}>No incidents on map</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Adjust your filters to see more</div>
          </div>
        )}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .map-left-panel {
            position: fixed !important;
            left: 0; top: 68px; bottom: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s;
          }
        }
      `}</style>
    </div>
  );
}