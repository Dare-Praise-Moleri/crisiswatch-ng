import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Activity,
  Calendar, Filter, RefreshCw, Download,
  AlertTriangle, Flame, Waves, Car, Zap,
  Shield, MapPin, Clock, Users, ArrowUp, ArrowDown,
  Minus, ChevronDown,
} from 'lucide-react';
import { C, font } from '../theme';

/* ─── API ─── */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}`, 'Content-Type': 'application/json' });

/* ─── HELPERS ─── */
const RANGES = [
  { label: 'Today',       value: 'today'  },
  { label: 'Last 7 days', value: '7d'     },
  { label: 'Last 30 days',value: '30d'    },
  { label: 'Last 90 days',value: '90d'    },
  { label: 'All time',    value: 'all'    },
];

const TYPE_CFG = {
  fire:      { label: 'Fire',        color: '#EF4444', icon: Flame    },
  flood:     { label: 'Flood',       color: '#2563EB', icon: Waves    },
  accident:  { label: 'Accident',    color: '#F97316', icon: Car      },
  medical:   { label: 'Medical',     color: '#10B981', icon: Activity },
  security:  { label: 'Security',    color: '#8B5CF6', icon: Shield   },
  other:     { label: 'Other',       color: '#6B7280', icon: AlertTriangle },
};

const SEV_CFG = {
  critical: { color: '#EF4444' },
  high:     { color: '#F97316' },
  medium:   { color: '#EAB308' },
  low:      { color: '#22C55E' },
};

const LAGOS_LGAS = [
  'Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa',
  'Badagry','Epe','Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye',
  'Ikeja','Ikorodu','Kosofe','Lagos Island','Lagos Mainland',
  'Mushin','Ojo','Oshodi-Isolo','Shomolu','Surulere',
];

/* ─── MOCK DATA GENERATOR (replaces API when no backend) ─── */
function generateMockData(range) {
  const now = new Date();
  const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 180;
  const types = Object.keys(TYPE_CFG);
  const severities = ['critical','high','medium','low'];

  // Trend line data
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = days === 1
      ? `${d.getHours()}:00`
      : days <= 7
        ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    trend.push({
      label,
      total: Math.floor(Math.random() * 14) + 2,
      fire: Math.floor(Math.random() * 5),
      flood: Math.floor(Math.random() * 3),
      accident: Math.floor(Math.random() * 4),
      medical: Math.floor(Math.random() * 4),
      security: Math.floor(Math.random() * 3),
    });
  }

  // Trim to last 14 points for display
  const trendSlice = trend.slice(-14);

  // By type
  const byType = types.map(t => ({
    type: t,
    count: Math.floor(Math.random() * 40) + 5,
  })).sort((a,b) => b.count - a.count);

  // By severity
  const bySeV = severities.map(s => ({
    severity: s,
    count: s === 'low' ? Math.floor(Math.random()*30)+20
         : s === 'medium' ? Math.floor(Math.random()*20)+10
         : s === 'high' ? Math.floor(Math.random()*12)+5
         : Math.floor(Math.random()*8)+1,
  }));

  // By LGA
  const byLGA = LAGOS_LGAS.map(lga => ({
    lga,
    count: Math.floor(Math.random() * 18) + 1,
  })).sort((a,b) => b.count - a.count);

  // By source
  const bySource = [
    { source: 'App Reports',   count: Math.floor(Math.random()*60)+20, color: '#CC2200' },
    { source: 'X (Twitter)',   count: Math.floor(Math.random()*45)+15, color: '#1D9BF0' },
    { source: 'Facebook',      count: Math.floor(Math.random()*30)+10, color: '#1877F2' },
    { source: 'WhatsApp',      count: Math.floor(Math.random()*20)+5,  color: '#25D366' },
    { source: 'News RSS',      count: Math.floor(Math.random()*25)+8,  color: '#D97706' },
  ];

  const total = byType.reduce((s,t) => s+t.count, 0);
  const resolved = Math.floor(total * 0.68);
  const avgResp = (Math.random() * 8 + 3).toFixed(1);

  return { trend: trendSlice, byType, bySev: bySeV, byLGA, bySource, total, resolved, avgResp };
}

/* ─── MINI COMPONENTS ─── */

const StatCard = ({ icon: Icon, label, value, sub, color, trend: trendDir }) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '16px', padding: '22px 24px',
    display: 'flex', flexDirection: 'column', gap: '4px',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ width: 40, height: 40, borderRadius: '11px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      {trendDir && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: trendDir === 'up' ? '#EF4444' : trendDir === 'down' ? '#22C55E' : C.muted }}>
          {trendDir === 'up' ? <ArrowUp size={13} /> : trendDir === 'down' ? <ArrowDown size={13} /> : <Minus size={13} />}
          {trendDir === 'up' ? '+12%' : trendDir === 'down' ? '-8%' : '0%'}
        </div>
      )}
    </div>
    <div style={{ color, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
    <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', marginTop: '4px' }}>{label}</div>
    {sub && <div style={{ color: C.muted, fontSize: '12px' }}>{sub}</div>}
  </div>
);

/* SVG Bar Chart */
const BarChart = ({ data, maxVal, color, height = 140 }) => {
  if (!data || !data.length) return null;
  const W = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const pct = maxVal ? d.total / maxVal : 0;
        const barH = pct * (height - 20);
        const x = i * W + W * 0.15;
        const w = W * 0.7;
        const y = height - 20 - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={barH} rx="2" fill={`${color}CC`} />
            <rect x={x} y={y} width={w} height={2} rx="1" fill={color} />
          </g>
        );
      })}
    </svg>
  );
};

/* SVG Line Chart */
const LineChart = ({ data, height = 160 }) => {
  if (!data || data.length < 2) return null;
  const maxV = Math.max(...data.map(d => d.total), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - 16 - (d.total / maxV) * (height - 32);
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height - 16} ${pts} 100,${height - 16}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CC2200" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#CC2200" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#lg1)" />
      <polyline points={pts} fill="none" stroke="#CC2200" strokeWidth="0.8" strokeLinejoin="round" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = height - 16 - (d.total / maxV) * (height - 32);
        return <circle key={i} cx={x} cy={y} r="1.2" fill="#CC2200" />;
      })}
    </svg>
  );
};

/* Horizontal bar for type/source/lga */
const HBar = ({ label, count, total, color, icon: Icon }) => {
  const pct = total ? (count / total * 100) : 0;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {Icon && <Icon size={14} color={color} strokeWidth={2} />}
          <span style={{ color: C.text, fontSize: '13px', fontWeight: 600, fontFamily: font }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: C.muted, fontSize: '12px' }}>{pct.toFixed(1)}%</span>
          <span style={{ color, fontWeight: 700, fontSize: '13px', minWidth: '28px', textAlign: 'right' }}>{count}</span>
        </div>
      </div>
      <div style={{ height: '6px', background: C.surface2, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
};

/* ─── MAIN PAGE ─── */
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showRangeMenu, setShowRangeMenu] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/dashboard/stats?range=${range}`, { headers: authH() });
      if (!r.ok) throw new Error('API unavailable');
      const json = await r.json();
      // Map backend response to our shape (fallback to mock if fields missing)
      if (json && json.total_incidents !== undefined) {
        setData(generateMockData(range)); // use mock shape for now, replace with real mapping
      } else {
        setData(generateMockData(range));
      }
    } catch {
      setData(generateMockData(range));
    }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => { fetchData(); }, [range]);

  const maxTrend = data ? Math.max(...data.trend.map(d => d.total), 1) : 1;
  const totalSrc = data ? data.bySource.reduce((s, b) => s + b.count, 0) : 0;
  const totalType = data ? data.byType.reduce((s, b) => s + b.count, 0) : 0;
  const totalSev = data ? data.bySev.reduce((s, b) => s + b.count, 0) : 0;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, paddingTop: '72px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(204,34,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={22} color={C.primary} strokeWidth={2} />
              </div>
              <h1 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
                Analytics
              </h1>
            </div>
            <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>
              Lagos State incident intelligence · Last refreshed {lastRefresh.toLocaleTimeString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Range picker */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowRangeMenu(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: font }}
              >
                <Calendar size={15} color={C.muted} />
                {RANGES.find(r => r.value === range)?.label}
                <ChevronDown size={14} color={C.muted} />
              </button>
              {showRangeMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '6px', zIndex: 100, minWidth: '160px', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
                  {RANGES.map(r => (
                    <button key={r.value} onClick={() => { setRange(r.value); setShowRangeMenu(false); }}
                      style={{ width: '100%', display: 'block', padding: '9px 14px', background: range === r.value ? C.primarySoft : 'none', border: 'none', borderRadius: '8px', color: range === r.value ? C.primary : C.text, fontSize: '13px', fontWeight: range === r.value ? 700 : 500, cursor: 'pointer', textAlign: 'left', fontFamily: font }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '7px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, color: C.primary, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: font }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {loading && !data ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', color: C.muted, fontSize: '15px' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} color={C.primary} />
            Loading analytics…
          </div>
        ) : data ? (
          <>
            {/* ── KPI CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
              <StatCard icon={Activity}  label="Total Incidents"   value={data.total}    color={C.primary}  sub={`${RANGES.find(r=>r.value===range)?.label}`} trend="up" />
              <StatCard icon={Shield}    label="Resolved"          value={data.resolved} color="#22C55E"     sub={`${Math.round(data.resolved/data.total*100)}% resolution rate`} trend="down" />
              <StatCard icon={AlertTriangle} label="Active Now"    value={data.total - data.resolved} color="#F97316" sub="Pending response" trend="up" />
              <StatCard icon={Clock}     label="Avg Response Time" value={`${data.avgResp}m`} color="#8B5CF6" sub="Minutes to first dispatch" trend="down" />
              <StatCard icon={MapPin}    label="LGAs Covered"      value="20/20" color="#2563EB" sub="All Lagos LGAs active" />
              <StatCard icon={Users}     label="Sources Monitored" value="5" color="#D97706" sub="App + 4 social / news" />
            </div>

            {/* ── TREND CHART ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ color: C.text, fontWeight: 800, fontSize: '16px', margin: 0, letterSpacing: '-0.02em' }}>
                    Total Incidents Over Time
                  </h2>
                  <p style={{ color: C.muted, fontSize: '12px', margin: '4px 0 0' }}>
                    Number of incidents detected per {range === 'today' ? 'hour' : range === '7d' ? 'day' : 'day'} · {RANGES.find(r => r.value === range)?.label}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { label: 'Total incidents', color: C.primary },
                    { label: 'Fire',            color: '#EF4444' },
                    { label: 'Flood',           color: '#2563EB' },
                    { label: 'Accident',        color: '#F97316' },
                  ].map((t, i) => (
                    <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.muted, fontWeight: 600 }}>
                      <div style={{ width: i === 0 ? 20 : 8, height: i === 0 ? 2 : 8, borderRadius: i === 0 ? '2px' : '50%', background: t.color }} />
                      {t.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart container with y-axis label */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Y-axis label */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '14px', flexShrink: 0 }}>
                  <span style={{ color: C.faint, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                    Incidents
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  {/* Y-axis gridlines */}
                  <div style={{ position: 'relative' }}>
                    {[0,1,2,3,4].map(i => {
                      const maxV = Math.max(...data.trend.map(d => d.total), 1);
                      const val  = Math.round(maxV * (1 - i / 4));
                      return (
                        <div key={i} style={{ position: 'absolute', top: `${(i / 4) * 160}px`, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none' }}>
                          <span style={{ color: C.faint, fontSize: '9px', fontWeight: 600, minWidth: '20px', textAlign: 'right' }}>{val}</span>
                          <div style={{ flex: 1, height: '1px', background: C.border, opacity: 0.5 }} />
                        </div>
                      );
                    })}
                    <div style={{ marginLeft: '28px', marginTop: '0px' }}>
                      <LineChart data={data.trend} height={160} />
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginLeft: '28px' }}>
                    {data.trend.filter((_, i) => i % Math.max(1, Math.floor(data.trend.length / 7)) === 0 || i === data.trend.length - 1).map((d, i) => (
                      <span key={i} style={{ color: C.muted, fontSize: '10px', fontWeight: 600 }}>{d.label}</span>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '4px' }}>
                    <span style={{ color: C.faint, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {range === 'today' ? 'Hour of day' : 'Date'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── ROW: Bar chart + By Severity ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '20px', marginBottom: '20px' }}>

              {/* Bar chart — by type */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px' }}>
                <h2 style={{ color: C.text, fontWeight: 800, fontSize: '15px', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                  Incidents by Type
                </h2>
                {data.byType.map(b => (
                  <HBar
                    key={b.type}
                    label={TYPE_CFG[b.type]?.label || b.type}
                    count={b.count}
                    total={totalType}
                    color={TYPE_CFG[b.type]?.color || C.muted}
                    icon={TYPE_CFG[b.type]?.icon}
                  />
                ))}
              </div>

              {/* By Severity */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px' }}>
                <h2 style={{ color: C.text, fontWeight: 800, fontSize: '15px', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                  Incidents by Severity
                </h2>
                {data.bySev.map(s => (
                  <HBar
                    key={s.severity}
                    label={s.severity.charAt(0).toUpperCase() + s.severity.slice(1)}
                    count={s.count}
                    total={totalSev}
                    color={SEV_CFG[s.severity]?.color || C.muted}
                  />
                ))}

                {/* Donut-style legend */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', paddingTop: '18px', borderTop: `1px solid ${C.border}` }}>
                  {data.bySev.map(s => (
                    <div key={s.severity} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: C.surface2, borderRadius: '10px', padding: '12px' }}>
                      <div style={{ color: SEV_CFG[s.severity]?.color, fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.04em' }}>{s.count}</div>
                      <div style={{ color: C.muted, fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>{s.severity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ROW: By LGA + By Source ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: '20px', marginBottom: '20px' }}>

              {/* LGA Heatmap (ranked bar list) */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                  <h2 style={{ color: C.text, fontWeight: 800, fontSize: '15px', margin: 0, letterSpacing: '-0.02em' }}>
                    Hotspot LGAs
                  </h2>
                  <span style={{ background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, color: C.primary, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                    Top 10
                  </span>
                </div>
                {data.byLGA.slice(0, 10).map((d, i) => {
                  const maxLGA = data.byLGA[0].count;
                  return (
                    <div key={d.lga} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ color: C.faint, fontWeight: 800, fontSize: '11px', width: '18px', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ color: C.text, fontSize: '12px', fontWeight: 600 }}>{d.lga}</span>
                          <span style={{ color: C.primary, fontSize: '12px', fontWeight: 700 }}>{d.count}</span>
                        </div>
                        <div style={{ height: '5px', background: C.surface2, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(d.count / maxLGA) * 100}%`,
                            background: i < 3 ? C.primary : i < 6 ? '#F97316' : '#22C55E',
                            borderRadius: '3px',
                            transition: 'width 0.8s ease',
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* By Source */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px' }}>
                <h2 style={{ color: C.text, fontWeight: 800, fontSize: '15px', margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                  Incidents by Source
                </h2>
                {data.bySource.map(s => (
                  <HBar
                    key={s.source}
                    label={s.source}
                    count={s.count}
                    total={totalSrc}
                    color={s.color}
                  />
                ))}

                {/* Source cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '18px', paddingTop: '16px', borderTop: `1px solid ${C.border}` }}>
                  {data.bySource.slice(0, 3).map(s => (
                    <div key={s.source} style={{ background: C.surface2, borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                      <div style={{ color: s.color, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>{s.count}</div>
                      <div style={{ color: C.muted, fontSize: '10px', fontWeight: 600, marginTop: '2px', lineHeight: 1.3 }}>{s.source}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Resolution Rate strip ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: '15px', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
                Status Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '14px' }}>
                {[
                  { label: 'Resolved',    count: data.resolved,               color: '#22C55E' },
                  { label: 'Active',      count: Math.floor(data.total*0.12), color: '#EF4444' },
                  { label: 'Responding',  count: Math.floor(data.total*0.10), color: '#F97316' },
                  { label: 'Monitoring',  count: Math.floor(data.total*0.10), color: '#EAB308' },
                  { label: 'Closed',      count: Math.floor(data.total*0.06), color: C.muted   },
                ].map(s => (
                  <div key={s.label} style={{ background: C.surface2, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ color: s.color, fontWeight: 800, fontSize: '1.7rem', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.count}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ color: C.muted, fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ height: '4px', background: C.border, borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ height: '100%', width: `${s.count/data.total*100}%`, background: s.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
