import React, { useState, useEffect, useCallback } from 'react';
import { incidentsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, Search, Filter, X, ChevronDown,
  Eye, CheckCircle, Radio, Users, Activity,
  ArrowUpRight, RefreshCw, Download, SlidersHorizontal,
  TrendingUp, FileText, Bell
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

/* ─── ALL INCIDENTS DATA ─── */
// const ALL_INCIDENTS = [];

const TYPES    = ['All Types','Fire','Crime','Flood','Accident','Security','Protest','Medical'];
const STATES   = ['All States','Lagos','FCT','Rivers','Ogun','Borno','Delta','Kano','Kaduna','Kogi','Anambra'];
const SEVS     = ['All Severity','High','Medium','Low'];
const STATUSES = ['All Status','Active','Responding','Monitoring','Resolved'];
const SOURCES  = ['All Sources','X (Twitter)','WhatsApp','Facebook','User Report'];
const SORTS    = ['Newest First','Oldest First','Highest Severity','Most Affected'];

const SEV_STYLE = {
  High:   { text: '#FF8A80', bg: 'rgba(204,34,0,0.18)',   border: C.primary },
  Medium: { text: '#FFD180', bg: 'rgba(245,158,11,0.18)', border: C.amber   },
  Low:    { text: '#69F0AE', bg: 'rgba(16,185,129,0.18)', border: C.green   },
};
const STATUS_STYLE = {
  Active:     { text: '#FF8A80', bg: 'rgba(204,34,0,0.15)'   },
  Responding: { text: '#85C1E9', bg: 'rgba(37,99,235,0.15)'  },
  Monitoring: { text: '#FFD180', bg: 'rgba(245,158,11,0.15)' },
  Resolved:   { text: '#69F0AE', bg: 'rgba(16,185,129,0.15)' },
};

/* ─── INCIDENT CARD ─── */
const IncidentCard = ({ inc, expanded, onToggle }) => {
  const severityKey = inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1).toLowerCase() : 'Medium';
  const statusKey   = inc.status   ? inc.status.charAt(0).toUpperCase()   + inc.status.slice(1).toLowerCase()   : 'Active';
  const S  = SEV_STYLE[severityKey]  || SEV_STYLE['Medium'];
  const ST = STATUS_STYLE[statusKey] || STATUS_STYLE['Active'];
  return (
    <div style={{
      background: C.surface, border: `1px solid ${expanded ? inc.color + '33' : C.border}`,
      borderLeft: `3px solid ${S.border}`,
      borderRadius: '14px', overflow: 'hidden',
      transition: 'all 0.2s', marginBottom: '10px',
    }}
      onMouseEnter={e => { if (!expanded) e.currentTarget.style.borderColor = `${inc.color}22`; }}
      onMouseLeave={e => { if (!expanded) e.currentTarget.style.borderColor = C.border; }}
    >
      {/* Main row */}
      <div style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
        onClick={onToggle}>
        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${inc.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
          <inc.icon size={20} color={inc.color} strokeWidth={2} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '8px', lineHeight: 1.4 }}>
            {inc.title}
          </div>

          {/* Meta row 1 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ color: C.faint, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {inc.location}
            </span>
            <span style={{ color: C.faint, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> {inc.time}
            </span>
            <span style={{ color: C.faint, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Radio size={12} /> {inc.source}
            </span>
            <span style={{ color: C.faint, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} /> ~{inc.affected.toLocaleString()} affected
            </span>
          </div>

          {/* Tags row */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ background: S.bg, color: S.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
              {inc.severity}
            </span>
            <span style={{ background: ST.bg, color: ST.text, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: ST.text, display: 'inline-block' }} />
              {inc.status}
            </span>
            <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>
              {inc.type}
            </span>
            {inc.responders > 0 && (
              <span style={{ background: C.blueSoft, color: '#85C1E9', fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>
                {inc.responders} responder{inc.responders > 1 ? 's' : ''} assigned
              </span>
            )}
          </div>
        </div>

        {/* Right arrow */}
        <div style={{ color: C.faint, flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', marginTop: '4px' }}>
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '18px 20px', background: C.bgAlt }}>
          <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.75, marginBottom: '20px' }}>
            {inc.desc}
          </p>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'People Affected', value: inc.affected.toLocaleString(), color: C.primary   },
              { label: 'Responders',      value: inc.responders || '—',          color: C.blue      },
              { label: 'State',           value: inc.state,                      color: C.amber     },
              { label: 'Severity',        value: inc.severity,                   color: SEV_STYLE[inc.severity].text },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: '10px', padding: '12px', border: `1px solid ${C.border}` }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: C.faint, fontSize: '11px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* NER panel */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              NER Extracted Entities
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'EVENT',    value: inc.type,     color: inc.color  },
                { label: 'LOCATION', value: inc.location, color: C.blue     },
                { label: 'TIME',     value: inc.time,     color: C.amber    },
                { label: 'SOURCE',   value: inc.source,   color: C.purple   },
              ].map(tag => (
                <div key={tag.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.06em' }}>{tag.label}</span>
                  <span style={{ background: `${tag.color}18`, color: tag.color, fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${tag.color}28` }}>
                    {tag.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, border: 'none', borderRadius: '9px', padding: '9px 18px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: `0 4px 14px rgba(204,34,0,0.3)` }}
              onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
              onMouseLeave={e => e.currentTarget.style.background = C.primary}>
              <Shield size={14} /> Respond to Incident
            </button>
            <Link to="/map" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.blueSoft, border: `1px solid rgba(37,99,235,0.25)`, borderRadius: '9px', padding: '9px 18px', color: '#85C1E9', fontSize: '13px', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
              <MapPin size={14} /> View on Map
            </Link>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 18px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
              <Bell size={14} /> Subscribe to Updates
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 18px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
              <ArrowUpRight size={14} /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function IncidentsPage() {
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState('');
  const [search,       setSearch]       = useState('');
  const [filterType,   setFilterType]   = useState('All Types');
  const [filterState,  setFilterState]  = useState('All States');
  const [filterSev,    setFilterSev]    = useState('All Severity');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterSource, setFilterSource] = useState('All Sources');
  const [sortBy,       setSortBy]       = useState('Newest First');
  const [activeTab,    setActiveTab]    = useState('All');
  const [expandedId,   setExpandedId]   = useState(null);
  const [showFilters,  setShowFilters]  = useState(false);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const res = await incidentsAPI.getAll({ limit: 100 });
        setAllIncidents(res.incidents || []);
      } catch (err) {
        setApiError('Could not load incidents. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  /* ── Filter + sort ── */
  let results = allIncidents.filter(inc => {
    if (filterType   !== 'All Types'    && inc.type     !== filterType)   return false;
    if (filterState  !== 'All States'   && inc.state    !== filterState)  return false;
    if (filterSev    !== 'All Severity' && inc.severity !== filterSev)    return false;
    if (filterStatus !== 'All Status'   && inc.status   !== filterStatus) return false;
    if (filterSource !== 'All Sources'  && inc.source   !== filterSource) return false;
    if (activeTab    !== 'All'          && inc.severity !== activeTab && inc.status !== activeTab) return false;
    if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) &&
        !inc.location.toLowerCase().includes(search.toLowerCase()))       return false;
    return true;
  });

  if (sortBy === 'Oldest First')       results = [...results].reverse();
  if (sortBy === 'Highest Severity')   results = [...results].sort((a, b) => ['High','Medium','Low'].indexOf(a.severity) - ['High','Medium','Low'].indexOf(b.severity));
  if (sortBy === 'Most Affected')      results = [...results].sort((a, b) => b.affected - a.affected);

  const activeCount   = allIncidents.filter(i => i.status === 'Active').length;
  const highCount     = allIncidents.filter(i => i.severity === 'High' || i.severity === 'high').length;
  const resolvedCount = allIncidents.filter(i => i.status === 'Resolved').length;

  const clearFilters = () => {
    setFilterType('All Types'); setFilterState('All States');
    setFilterSev('All Severity'); setFilterStatus('All Status');
    setFilterSource('All Sources'); setSearch('');
  };
  const hasFilters = filterType !== 'All Types' || filterState !== 'All States' ||
    filterSev !== 'All Severity' || filterStatus !== 'All Status' ||
    filterSource !== 'All Sources' || search;

  const Dropdown = ({ label, options, value, onChange }) => (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        background: value !== options[0] ? C.primarySoft : C.surface,
        border: `1px solid ${value !== options[0] ? C.primaryBorder : C.border}`,
        borderRadius: '9px', padding: '8px 32px 8px 12px',
        color: value !== options[0] ? C.primary : C.muted,
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        fontFamily: font, appearance: 'none', outline: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(232,237,245,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
        backgroundSize: '10px',
      }}>
        {options.map(o => <option key={o} value={o} style={{ background: C.surface, color: C.text }}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '999px', padding: '5px 14px', marginBottom: '14px' }}>
                <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
                <span style={{ color: C.primary, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Feed</span>
              </div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.4rem)', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                Incident Feed
              </h1>
              <p style={{ color: C.muted, fontSize: '16px' }}>
                All detected and reported emergencies across Nigeria, updated in real time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                <Download size={15} /> Export
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                <RefreshCw size={15} /> Refresh
              </button>
              <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', borderRadius: '9px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px rgba(204,34,0,0.3)` }}>
                <AlertTriangle size={15} /> Report Incident
              </Link>
            </div>
          </div>

          {/* Summary stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px,1fr))', gap: '12px' }}>
            {[
              { icon: Activity,     color: C.primary, label: 'Total Incidents',   value: loading ? '...' : allIncidents.length,                                                      sub: 'All time'          },
              { icon: AlertTriangle,color: C.primary, label: 'Currently Active',  value: loading ? '...' : activeCount,                                                             sub: 'Needs response'    },
              { icon: TrendingUp,   color: C.amber,   label: 'High Severity',     value: loading ? '...' : highCount,                                                               sub: 'Urgent priority'   },
              { icon: CheckCircle,  color: C.green,   label: 'Resolved Today',    value: loading ? '...' : resolvedCount,                                                           sub: 'Closed incidents'  },
              { icon: Eye,          color: C.blue,    label: 'Being Monitored',   value: loading ? '...' : allIncidents.filter(i=>i.status==='Monitoring').length,                  sub: 'Watchlist'         },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <s.icon size={18} color={s.color} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ color: s.color, fontWeight: 800, fontSize: '22px', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ color: C.muted, fontSize: '12px', marginTop: '2px', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ color: C.faint, fontSize: '11px' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: `1px solid ${C.border}`, marginBottom: '24px', overflowX: 'auto' }}>
          {['All', 'High', 'Medium', 'Low', 'Active', 'Responding', 'Monitoring', 'Resolved'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 18px', borderRadius: '0', border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? C.primary : 'transparent'}`,
              background: 'transparent',
              color: activeTab === tab ? C.primary : C.muted,
              fontSize: '14px', fontWeight: activeTab === tab ? 700 : 500,
              cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
              whiteSpace: 'nowrap', marginBottom: '-1px',
            }}>
              {tab}
              <span style={{ marginLeft: '6px', background: activeTab === tab ? C.primarySoft : C.surface2, color: activeTab === tab ? C.primary : C.faint, fontSize: '11px', fontWeight: 700, padding: '1px 7px', borderRadius: '999px' }}>
                {tab === 'All' ? allIncidents.length
                  : allIncidents.filter(i => i.severity === tab || i.status === tab).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search incidents, locations, keywords..."
              style={{
                width: '100%', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: '10px',
                padding: '10px 14px 10px 36px',
                color: C.text, fontSize: '14px', fontFamily: font,
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

          {/* Dropdowns */}
          <Dropdown options={SEVS}     value={filterSev}     onChange={setFilterSev}     />
          <Dropdown options={STATUSES} value={filterStatus}  onChange={setFilterStatus}  />
          <Dropdown options={TYPES}    value={filterType}    onChange={setFilterType}    />
          <Dropdown options={STATES}   value={filterState}   onChange={setFilterState}   />
          <Dropdown options={SOURCES}  value={filterSource}  onChange={setFilterSource}  />

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <SlidersHorizontal size={14} color={C.faint} />
            <Dropdown options={SORTS} value={sortBy} onChange={setSortBy} />
          </div>

          {/* Clear */}
          {hasFilters && (
            <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: C.primary, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              <X size={13} /> Clear all
            </button>
          )}
        </div>

        {/* Results count */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: C.muted, fontSize: '14px' }}>
            Showing <strong style={{ color: C.text }}>{results.length}</strong> of{' '}
            <strong style={{ color: C.text }}>{allIncidents.length}</strong> incidents
            {hasFilters && <span style={{ color: C.primary }}> (filtered)</span>}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
            <span style={{ color: C.faint, fontSize: '12px' }}>Auto-updating every 30s</span>
          </div>
        </div>

        {/* Incident list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: C.faint }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.muted, marginBottom: '8px' }}>Loading incidents...</div>
            <div style={{ fontSize: '14px' }}>Fetching live data from backend</div>
          </div>
        ) : apiError ? (
          <div style={{ background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '12px', padding: '20px', color: '#FF8A80', fontSize: '14px' }}>
            ⚠️ {apiError}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: C.faint }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: C.muted, marginBottom: '8px' }}>No incidents found</div>
            <div style={{ fontSize: '15px', marginBottom: '20px' }}>Try adjusting your filters or search terms</div>
            <button onClick={clearFilters} style={{ background: C.primary, border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              Clear All Filters
            </button>
          </div>
        ) : (
          results.map(inc => {
            const iconMap = {
              fire:     { icon: Flame,         color: C.primary },
              crime:    { icon: AlertTriangle, color: C.amber   },
              flood:    { icon: Droplets,      color: C.blue    },
              accident: { icon: Car,           color: C.purple  },
              security: { icon: Shield,        color: C.green   },
              medical:  { icon: Activity,      color: C.amber   },
              protest:  { icon: Users,         color: C.purple  },
            };
            const mapped = iconMap[inc.type] || { icon: AlertTriangle, color: C.amber };
            const normalized = {
              ...inc,
              icon:     mapped.icon,
              color:    mapped.color,
              severity: inc.severity ? inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1) : 'Medium',
              time:     new Date(inc.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }),
            };
            return (
              <IncidentCard
                key={inc.id}
                inc={normalized}
                expanded={expandedId === inc.id}
                onToggle={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
              />
            );
          })
        )}

        {/* Load more */}
        {results.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 32px', color: C.muted, fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
              <RefreshCw size={15} /> Load More Incidents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}