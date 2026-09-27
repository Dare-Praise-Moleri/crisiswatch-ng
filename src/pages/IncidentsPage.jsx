import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, Search, X, ChevronDown, ChevronUp,
  CheckCircle, Users, Activity, FileText,
  RefreshCw, Bell, Filter, Phone, Navigation,
} from 'lucide-react';
import { FaXTwitter, FaFacebook, FaWhatsapp, FaRegNewspaper } from 'react-icons/fa6';
import { incidentsAPI } from '../services/api';
import { C, font, SEV_STYLE, STATUS_STYLE, TYPE_CONFIG, SOURCE_CONFIG, timeAgo, normSev, cap } from '../theme';

const NEWS_SOURCES = ['Channels TV', 'Punch Newspapers', 'Vanguard Nigeria', 'Premium Times', 'The Nation'];
const isManual = i => i.source === 'User Report';
const isSocial = i => ['X (Twitter)', 'Facebook', 'WhatsApp'].includes(i.source);
const isNews   = i => NEWS_SOURCES.includes(i.source);

/* ── Real brand icons ── */
const SourceIcon = ({ source, size = 12 }) => {
  if (source === 'X (Twitter)') {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return <FaXTwitter size={size} color={dark ? '#E8EDF5' : '#000000'} />;
  }
  if (source === 'Facebook')     return <FaFacebook      size={size} color="#1877F2" />;
  if (source === 'WhatsApp')     return <FaWhatsapp      size={size} color="#25D366" />;
  if (source === 'User Report')  return <Bell            size={size} color="#CC2200" />;
  return <FaRegNewspaper size={size} color="#D97706" />;
};

const SourceBadge = ({ source }) => {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const rawCfg = SOURCE_CONFIG[source] || { color: '#6B7280', label: source };
  const cfg = source === 'X (Twitter)'
    ? { ...rawCfg, color: isDark ? '#E8EDF5' : '#000000' }
    : rawCfg;  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: `${cfg.color}14`, color: cfg.color, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', border: `1px solid ${cfg.color}28` }}>
      <SourceIcon source={source} size={10} /> {cfg.label}
    </span>
  );
};

const SevBadge = ({ severity }) => {
  const k = cap(normSev(severity));
  const S = SEV_STYLE[k] || SEV_STYLE.Medium;
  return <span style={{ background: S.bg, color: S.text, border: `1px solid ${S.border}30`, fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px' }}>{k}</span>;
};

const StatusBadge = ({ status }) => {
  const S = STATUS_STYLE[status] || STATUS_STYLE.Active;
  return <span style={{ background: S.bg, color: S.color, fontSize: '11px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px' }}>{status}</span>;
};

/* ── Type icon ── */
const TypeIcon = ({ type }) => {
  const icons = { fire: Flame, flood: Droplets, accident: Car, crime: Shield, medical: Activity, security: Shield, protest: Users, other: AlertTriangle };
  const Ico = icons[type] || AlertTriangle;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
  return (
    <div style={{ width: 40, height: 40, borderRadius: '11px', background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Ico size={18} color={cfg.color} strokeWidth={2} />
    </div>
  );
};

/* ── INCIDENT CARD ── */
const IncidentCard = ({ inc, expanded, onToggle, onRespond, onResolve }) => {
  const type  = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
  const sevK  = normSev(inc.severity);
  const S     = SEV_STYLE[sevK] || SEV_STYLE.medium;

  return (
    <div style={{ background: C.surface, borderRadius: '14px', border: `1px solid ${expanded ? type.color + '40' : C.border}`, borderLeft: `3px solid ${S.border}`, transition: 'all 0.2s', marginBottom: '8px' }}>
      <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }} onClick={onToggle}>
        <TypeIcon type={inc.type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.4 }}>{inc.title}</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {inc.location && <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={10} /> {inc.location}</span>}
            <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {timeAgo(inc.created_at)}</span>
          </div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <SevBadge severity={inc.severity} />
            <StatusBadge status={inc.status || 'Active'} />
            <SourceBadge source={inc.source} />
          </div>
        </div>
        <div style={{ color: C.faint, flexShrink: 0, marginTop: '2px', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <ChevronDown size={16} />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: '14px' }}>
            {inc.description && <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.75, marginBottom: '14px' }}>{inc.description}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '8px', marginBottom: '14px' }}>
              {[
                { label: 'Type',     value: cap(inc.type)             },
                { label: 'LGA',      value: inc.lga || inc.state || 'Lagos' },
                { label: 'Affected', value: inc.affected > 0 ? `~${inc.affected}` : 'Unknown' },
                { label: 'Reported', value: new Date(inc.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) },
              ].map((row, i) => row.value && (
                <div key={i} style={{ background: C.surface2, borderRadius: '8px', padding: '9px 12px' }}>
                  <div style={{ color: C.faint, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '3px' }}>{row.label}</div>
                  <div style={{ color: C.text, fontSize: '12px', fontWeight: 600 }}>{row.value}</div>
                </div>
              ))}
            </div>
            {inc.latitude && inc.longitude && (
              <div style={{ background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '9px', padding: '9px 13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={12} color="#1D4ED8" />
                <span style={{ color: '#1D4ED8', fontSize: '12px', fontWeight: 600 }}>GPS: {parseFloat(inc.latitude).toFixed(4)}° N, {parseFloat(inc.longitude).toFixed(4)}° E</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {inc.status !== 'Resolved' && inc.status !== 'Responding' && (
                <button onClick={() => onRespond(inc.id)} style={{ background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(29,78,216,0.3)', borderRadius: '8px', padding: '8px 16px', color: '#1D4ED8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                  Respond
                </button>
              )}
              {inc.status !== 'Resolved' && (
                <button onClick={() => onResolve(inc.id)} style={{ background: 'rgba(4,120,87,0.1)', border: '1px solid rgba(4,120,87,0.3)', borderRadius: '8px', padding: '8px 16px', color: '#047857', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                  Mark Resolved
                </button>
              )}
              <Link to="/map" 
                state={{ incidentId: inc.id, lat: parseFloat(inc.latitude), lng: parseFloat(inc.longitude) }} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 16px', color: C.muted, fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                <MapPin size={12} /> Map
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── FILTER PANEL — collapsed by default ── */
const FilterPanel = ({ statusFilter, setStatusFilter, sevFilter, setSevFilter, sortBy, setSortBy, search, setSearch, onClear, resultCount, total }) => {
  const [open, setOpen] = useState(false);

  const STATUSES = ['All', 'Active', 'Responding', 'Monitoring', 'Resolved'];
  const SEVS     = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const SORTS    = [['newest', 'Newest First'], ['oldest', 'Oldest First'], ['severity', 'Highest Severity'], ['affected', 'Most Affected']];

  const activeCount = [
    statusFilter !== 'All' ? 1 : 0,
    sevFilter !== 'All' ? 1 : 0,
    search.trim() ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
      {/* Filter header — always visible */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: open ? `1px solid ${C.border}` : 'none' }} onClick={() => setOpen(v => !v)}>
        <Filter size={15} color={activeCount > 0 ? '#CC2200' : C.muted} />
        <span style={{ color: C.text, fontWeight: 600, fontSize: '13px', flex: 1 }}>
          Filters & Sort
          {activeCount > 0 && <span style={{ background: '#CC2200', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '999px', marginLeft: '8px' }}>{activeCount}</span>}
        </span>
        <span style={{ color: C.faint, fontSize: '12px' }}>{resultCount} of {total}</span>
        {open ? <ChevronUp size={15} color={C.faint} /> : <ChevronDown size={15} color={C.faint} />}
      </div>

      {/* Expandable filter body */}
      {open && (
        <div style={{ padding: '16px' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <Search size={14} color={C.faint} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
            <input placeholder="Search incidents, locations..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '9px 11px 9px 34px', color: C.text, fontSize: '13px', fontFamily: font, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.4)'}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.faint, display: 'flex' }}>
                <X size={13} />
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            {/* Status */}
            <div>
              <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 10px', borderRadius: '7px', border: `1px solid ${statusFilter === s ? '#CC2200' : C.border}`, background: statusFilter === s ? '#CC2200' : 'transparent', color: statusFilter === s ? '#fff' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, textAlign: 'left', transition: 'all 0.15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Severity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {SEVS.map(s => {
                  const SK = SEV_STYLE[s] || null;
                  return (
                    <button key={s} onClick={() => setSevFilter(s)} style={{ padding: '6px 10px', borderRadius: '7px', border: `1px solid ${sevFilter === s ? (SK ? SK.border : '#CC2200') : C.border}`, background: sevFilter === s ? (SK ? SK.bg : C.primarySoft) : 'transparent', color: sevFilter === s ? (SK ? SK.text : '#CC2200') : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, textAlign: 'left', transition: 'all 0.15s' }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort */}
            <div>
              <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Sort By</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {SORTS.map(([v, l]) => (
                  <button key={v} onClick={() => setSortBy(v)} style={{ padding: '6px 10px', borderRadius: '7px', border: `1px solid ${sortBy === v ? '#CC2200' : C.border}`, background: sortBy === v ? '#CC2200' : 'transparent', color: sortBy === v ? '#fff' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, textAlign: 'left', transition: 'all 0.15s' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <button onClick={onClear} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 14px', color: C.faint, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
              <X size={12} /> Clear {activeCount} filter{activeCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function IncidentsPage() {
  const [allIncidents, setAll]        = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [error,        setError]      = useState('');
  const [expandedId,   setExpanded]   = useState(null);
  const [lastUpdate,   setLastUpdate] = useState(null);

  // Feed tab
  const [feedTab,    setFeedTab]    = useState('all');
  const [socialSub,  setSocialSub]  = useState('all');
  const [newsSub,    setNewsSub]    = useState('all');

  // Nested filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [sevFilter,    setSevFilter]    = useState('All');
  const [sortBy,       setSortBy]       = useState('newest');
  const [search,       setSearch]       = useState('');

  const load = useCallback(async () => {
    try {
      const res = await incidentsAPI.getAll({ limit: 200 });
      setAll(res.incidents || []);
      setLastUpdate(new Date());
    } catch { setError('Could not load incidents.'); }
    finally   { setLoading(false); }
  }, []);

  const manualRefresh = useCallback(() => {
    setLoading(true);
    setAll([]);
    load();
  }, [load]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const handleRespond = async id => {
    await fetch(`http://localhost:5000/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` }, body: JSON.stringify({ status: 'Responding' }) });
    load();
  };
  const handleResolve = async id => {
    await fetch(`http://localhost:5000/api/incidents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}` }, body: JSON.stringify({ status: 'Resolved' }) });
    load();
  };

  // Apply feed tab
  let results = [...allIncidents];
  if (feedTab === 'manual') results = results.filter(isManual);
  else if (feedTab === 'social') {
    results = results.filter(isSocial);
    if (socialSub !== 'all') results = results.filter(i => i.source === socialSub);
  }
  else if (feedTab === 'news') {
    results = results.filter(isNews);
    if (newsSub !== 'all') results = results.filter(i => i.source === newsSub);
  }

  // Apply nested filters
  if (statusFilter !== 'All') results = results.filter(i => i.status === statusFilter);
  if (sevFilter !== 'All')    results = results.filter(i => normSev(i.severity) === sevFilter.toLowerCase());
  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(i => i.title?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
  }

  // Sort
  if (sortBy === 'oldest')   results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  else if (sortBy === 'newest') results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else if (sortBy === 'severity') {
    const ord = { critical: 0, high: 1, medium: 2, low: 3 };
    results.sort((a, b) => (ord[normSev(a.severity)] ?? 4) - (ord[normSev(b.severity)] ?? 4));
  }
  else if (sortBy === 'affected') results.sort((a, b) => (b.affected || 0) - (a.affected || 0));

  const FEED_TABS = [
    { id: 'all',    label: 'All',          Icon: () => <Filter size={14} />    },
    { id: 'manual', label: 'App Reports',  Icon: () => <Bell size={14} />      },
    { id: 'social', label: 'Social Media', Icon: () => <FaXTwitter size={13} />},
    { id: 'news',   label: 'News',         Icon: () => <FaRegNewspaper size={13} /> },
  ];

  const SOCIAL_FILTERS = [
    { id: 'all',         label: 'All Social',    Icon: null },
    { id: 'X (Twitter)', label: 'X (Twitter)',   Icon: () => <FaXTwitter size={12} color="#000000" /> },
    { id: 'Facebook',    label: 'Facebook',      Icon: () => <FaFacebook size={12} color="#1877F2" /> },
    { id: 'WhatsApp',    label: 'WhatsApp',      Icon: () => <FaWhatsapp size={12} color="#25D366" /> },
  ];

  const NEWS_FILTERS = [
    { id: 'all',              label: 'All News',      Icon: null },
    { id: 'Channels TV',      label: 'Channels TV',   Icon: () => <FaRegNewspaper size={12} color="#6D28D9" /> },
    { id: 'Punch Newspapers', label: 'Punch',         Icon: () => <FaRegNewspaper size={12} color="#D97706" /> },
    { id: 'Vanguard Nigeria', label: 'Vanguard',      Icon: () => <FaRegNewspaper size={12} color="#059669" /> },
    { id: 'Premium Times',    label: 'Premium Times', Icon: () => <FaRegNewspaper size={12} color="#1D4ED8" /> },
    { id: 'The Nation',       label: 'The Nation',    Icon: () => <FaRegNewspaper size={12} color="#6B7280" /> },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* Header */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '4px' }}>Incident Feed</h1>
              <div style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#047857' }} />
                {lastUpdate ? `Updated ${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : 'Loading...'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={manualRefresh} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 14px', color: C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                <RefreshCw size={13} /> Refresh
              </button>
              <Link to="/report" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#CC2200', color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                <AlertTriangle size={13} /> Report
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',        value: allIncidents.length,                                                                color: C.text    },
              { label: 'Active',       value: allIncidents.filter(i => i.status === 'Active').length,                             color: '#CC2200' },
              { label: 'High Priority',value: allIncidents.filter(i => ['critical','high'].includes(normSev(i.severity))).length, color: '#D97706' },
              { label: 'Resolved',     value: allIncidents.filter(i => i.status === 'Resolved').length,                           color: '#047857' },
              { label: 'From Social',  value: allIncidents.filter(i => isSocial(i) || isNews(i)).length,                          color: '#1D4ED8' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '10px 16px' }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '20px', lineHeight: 1 }}>{loading ? '...' : s.value}</div>
                <div style={{ color: C.faint, fontSize: '10px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 28px' }}>

        {/* FEED TABS */}
        <div style={{ display: 'flex', gap: '3px', background: C.surface, borderRadius: '12px', padding: '4px', border: `1px solid ${C.border}`, marginBottom: '14px' }}>
          {FEED_TABS.map(tab => (
            <button key={tab.id} onClick={() => { setFeedTab(tab.id); setSocialSub('all'); setNewsSub('all'); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 12px', borderRadius: '9px', border: 'none', background: feedTab === tab.id ? '#CC2200' : 'transparent', color: feedTab === tab.id ? '#fff' : C.muted, fontSize: '13px', fontWeight: feedTab === tab.id ? 700 : 500, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
              <tab.Icon /> {tab.label}
            </button>
          ))}
        </div>

        {/* Social sub-filters */}
        {feedTab === 'social' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {SOCIAL_FILTERS.map(f => (
              <button key={f.id} onClick={() => setSocialSub(f.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', border: `1px solid ${socialSub === f.id ? '#CC2200' : C.border}`, background: socialSub === f.id ? 'rgba(204,34,0,0.1)' : C.surface, color: socialSub === f.id ? '#CC2200' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                {f.Icon && <f.Icon />} {f.label}
              </button>
            ))}
          </div>
        )}

        {/* News source sub-filters */}
        {feedTab === 'news' && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {NEWS_FILTERS.map(f => (
              <button key={f.id} onClick={() => setNewsSub(f.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '7px', border: `1px solid ${newsSub === f.id ? '#D97706' : C.border}`, background: newsSub === f.id ? 'rgba(217,119,6,0.1)' : C.surface, color: newsSub === f.id ? '#D97706' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                {f.Icon && <f.Icon />} {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Nested filter panel */}
        <FilterPanel
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          sevFilter={sevFilter}       setSevFilter={setSevFilter}
          sortBy={sortBy}             setSortBy={setSortBy}
          search={search}             setSearch={setSearch}
          resultCount={results.length} total={allIncidents.length}
          onClear={() => { setStatusFilter('All'); setSevFilter('All'); setSearch(''); setSortBy('newest'); }}
        />

        {/* Results */}
        {error && (
          <div style={{ background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '10px', padding: '14px', marginBottom: '14px', color: '#FF8A80', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', color: C.muted, fontSize: '14px' }}>Loading incidents...</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <FileText size={40} color={C.faint} style={{ margin: '0 auto 14px', opacity: 0.4 }} />
            <div style={{ color: C.muted, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>No incidents found</div>
            <div style={{ color: C.faint, fontSize: '13px' }}>Try adjusting your filters</div>
          </div>
        ) : (
          results.map(inc => (
            <IncidentCard key={inc.id} inc={inc} expanded={expandedId === inc.id}
              onToggle={() => setExpanded(expandedId === inc.id ? null : inc.id)}
              onRespond={handleRespond} onResolve={handleResolve} />
          ))
        )}
      </div>
    </div>
  );
}
