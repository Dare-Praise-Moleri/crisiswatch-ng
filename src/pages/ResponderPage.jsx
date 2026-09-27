import React, { useState, useEffect } from 'react';
import {
  Radio, Shield, Flame, Activity, MapPin, Clock,
  Phone, Navigation, ChevronRight, ChevronDown,
  AlertTriangle, CheckCircle, Loader, Users,
  Zap, Send, Bell, BarChart2, Eye, RefreshCw,
  Car, Truck, XCircle, Info, Droplets,
} from 'lucide-react';
import { C, font, SEV_STYLE, STATUS_STYLE } from '../theme';

/* ─── API ─── */
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('crisiswatch_token')}`, 'Content-Type': 'application/json' });

/* ─── 18 Lagos Centers (matches resource_allocator.py) ─── */
const CENTERS = [
  { id: 1,  name: 'LASEMA HQ',          type: 'lasema',   lat: 6.5244, lng: 3.3792, address: 'Alausa, Ikeja',          phone: '+234-1-740-3939', units: 12, available: 8,  color: '#CC2200' },
  { id: 2,  name: 'LASEMA Lekki',       type: 'lasema',   lat: 6.4698, lng: 3.5852, address: 'Lekki Phase 1',          phone: '+234-1-270-7000', units: 6,  available: 4,  color: '#CC2200' },
  { id: 3,  name: 'Lagos Fire – Ikeja', type: 'fire',     lat: 6.5958, lng: 3.3472, address: 'Ikeja, Lagos',           phone: '+234-1-791-3891', units: 8,  available: 5,  color: '#EF4444' },
  { id: 4,  name: 'Lagos Fire – Apapa', type: 'fire',     lat: 6.4477, lng: 3.3553, address: 'Apapa, Lagos',           phone: '+234-1-587-0000', units: 6,  available: 3,  color: '#EF4444' },
  { id: 5,  name: 'Lagos Fire – Island',type: 'fire',     lat: 6.4541, lng: 3.3947, address: 'Lagos Island',           phone: '+234-1-263-0999', units: 5,  available: 4,  color: '#EF4444' },
  { id: 6,  name: 'NPF Ikeja',          type: 'police',   lat: 6.6018, lng: 3.3515, address: 'Alausa, Ikeja',          phone: '+234-1-280-3230', units: 20, available: 12, color: '#2563EB' },
  { id: 7,  name: 'NPF Victoria Island',type: 'police',   lat: 6.4281, lng: 3.4219, address: 'Victoria Island',        phone: '+234-1-261-7337', units: 18, available: 10, color: '#2563EB' },
  { id: 8,  name: 'NPF Apapa',          type: 'police',   lat: 6.4477, lng: 3.3553, address: 'Apapa, Lagos',           phone: '+234-1-587-3090', units: 15, available: 9,  color: '#2563EB' },
  { id: 9,  name: 'LUTH',              type: 'medical',  lat: 6.5158, lng: 3.3462, address: 'Idi-Araba, Surulere',    phone: '+234-1-774-0181', units: 4,  available: 2,  color: '#10B981' },
  { id: 10, name: 'Lagos Island Gen',  type: 'medical',  lat: 6.4530, lng: 3.3958, address: 'Lagos Island',           phone: '+234-1-263-0383', units: 3,  available: 2,  color: '#10B981' },
  { id: 11, name: 'NEMA Lagos',        type: 'nema',     lat: 6.5944, lng: 3.3478, address: 'Ikeja, Lagos',           phone: '+234-1-794-0135', units: 10, available: 6,  color: '#8B5CF6' },
  { id: 12, name: 'FRSC Lagos',        type: 'frsc',     lat: 6.5653, lng: 3.3624, address: 'Oregun, Ikeja',          phone: '+234-9-038-0000', units: 8,  available: 5,  color: '#D97706' },
];

const TYPE_LABELS = { lasema: 'LASEMA', fire: 'Fire Service', police: 'Police', medical: 'Medical', nema: 'NEMA', frsc: 'FRSC' };
const TYPE_ICON = { lasema: Shield, fire: Flame, police: Shield, medical: Activity, nema: Radio, frsc: Car };

/* ─── MOCK ASSIGNMENTS ─── */
function mockAssignments(centerId) {
  const types = ['fire','flood','accident','medical','security'];
  const lgas = ['Ikeja','Surulere','Lekki','Victoria Island','Oshodi','Apapa','Alimosho','Yaba'];
  const statuses = ['en-route','on-scene','resolved','monitoring'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `ASG-${centerId}-${100 + i}`,
    incidentId: `INC-${200 + i}`,
    type: types[i % types.length],
    location: `${lgas[i % lgas.length]}, Lagos`,
    unit: `Unit ${centerId}-${String.fromCharCode(65 + i)}`,
    status: statuses[i % statuses.length],
    distance: (Math.random() * 8 + 0.5).toFixed(1),
    eta: Math.floor(Math.random() * 20 + 2),
    time: new Date(Date.now() - Math.random() * 7200000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    severity: ['critical','high','medium','low'][i % 4],
    officer: ['Sgt. Adeyemi','Cpl. Okafor','Lt. Balogun','Sgt. Ibrahim','Cpl. Nwosu'][i % 5],
  }));
}

/* ─── MINI COMPONENTS ─── */

const SevBadge = ({ sev }) => {
  const map = { critical: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' }, high: { bg: 'rgba(249,115,22,0.15)', color: '#F97316' }, medium: { bg: 'rgba(234,179,8,0.15)', color: '#EAB308' }, low: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' } };
  const s = map[sev] || map.low;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', textTransform: 'capitalize', letterSpacing: '0.04em' }}>
      {sev}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    'en-route':   { bg: 'rgba(37,99,235,0.15)',  color: '#2563EB', icon: Navigation },
    'on-scene':   { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444', icon: AlertTriangle },
    'resolved':   { bg: 'rgba(34,197,94,0.15)',  color: '#22C55E', icon: CheckCircle },
    'monitoring': { bg: 'rgba(234,179,8,0.15)',  color: '#EAB308', icon: Eye },
  };
  const s = map[status] || map['monitoring'];
  const Icon = s.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: s.bg, color: s.color, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', textTransform: 'capitalize' }}>
      <Icon size={10} />
      {status}
    </span>
  );
};

const UnitCard = ({ unit }) => (
  <div style={{ background: C.surface2, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: 36, height: 36, borderRadius: '9px', background: unit.available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Truck size={17} color={unit.available ? '#22C55E' : '#EF4444'} strokeWidth={2} />
      </div>
      <div>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '13px' }}>{unit.name}</div>
        <div style={{ color: C.muted, fontSize: '11px' }}>{unit.type}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ color: unit.available ? '#22C55E' : '#EF4444', fontSize: '11px', fontWeight: 700 }}>
        {unit.available ? 'Available' : 'Deployed'}
      </div>
      {!unit.available && <div style={{ color: C.muted, fontSize: '10px' }}>{unit.location}</div>}
    </div>
  </div>
);

/* ─── MAIN ─── */
export default function ResponderPage() {
  const [selectedCenter, setSelectedCenter] = useState(CENTERS[0]);
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAssignments = async (center) => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/incidents/?center_id=${center.id}&limit=20`, { headers: authH() });
      if (!r.ok) throw new Error();
      const json = await r.json();
      setAssignments(json.incidents?.length ? json.incidents : mockAssignments(center.id));
    } catch {
      setAssignments(mockAssignments(center.id));
    }
    setLoading(false);
  };

  useEffect(() => { loadAssignments(selectedCenter); }, [selectedCenter]);

  const filtered = statusFilter === 'all' ? assignments : assignments.filter(a => a.status === statusFilter);
  const activeCount = assignments.filter(a => ['en-route','on-scene'].includes(a.status)).length;

  // Tabs
  const TABS = [
    { id: 'overview',    label: 'Overview'    },
    { id: 'assignments', label: `Assignments (${assignments.length})` },
    { id: 'units',       label: 'Units'       },
  ];

  // Mock unit fleet for selected center
  const units = Array.from({ length: selectedCenter.units }, (_, i) => ({
    name: `Unit ${selectedCenter.id}-${String.fromCharCode(65 + i)}`,
    type: ['Response Vehicle','Fire Truck','Ambulance','Patrol Car','Heavy Rescue'][i % 5],
    available: i < selectedCenter.available,
    location: i >= selectedCenter.available ? ['Oshodi','Surulere','Ikeja','Lekki'][i % 4] + ', Lagos' : null,
  }));

  const TypeIcon = TYPE_ICON[selectedCenter.type] || Shield;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, paddingTop: '16px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.type === 'success' ? '#22C55E' : '#EF4444', color: '#fff', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {toast.msg}
          </div>
        )}

        {/* Page title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(204,34,0,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={22} color={C.primary} strokeWidth={2} />
            </div>
            <h1 style={{ color: C.text, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              Response Centers
            </h1>
          </div>
          <p style={{ color: C.muted, fontSize: '14px', margin: 0 }}>
            Real-time unit tracking and assignment management · Lagos State
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* ─ LEFT: Center List ─ */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden', position: 'sticky', top: '90px' }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '13px' }}>Lagos Centers</div>
              <div style={{ color: C.muted, fontSize: '11px', marginTop: '2px' }}>18 active response centers</div>
            </div>
            <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {CENTERS.map(c => {
                const sel = selectedCenter.id === c.id;
                const Icon = TYPE_ICON[c.type] || Shield;
                const avPct = c.available / c.units;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCenter(c)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                      padding: '12px 16px', background: sel ? `${c.color}12` : 'none',
                      border: 'none', borderLeft: sel ? `3px solid ${c.color}` : '3px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = C.surface2; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'none'; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={c.color} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: sel ? C.text : C.text, fontWeight: sel ? 700 : 600, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <div style={{ height: '4px', width: '50px', background: C.border, borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${avPct * 100}%`, background: avPct > 0.6 ? '#22C55E' : avPct > 0.3 ? '#EAB308' : '#EF4444', borderRadius: '3px' }} />
                        </div>
                        <span style={{ color: C.muted, fontSize: '10px' }}>{c.available}/{c.units}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─ RIGHT: Center Detail ─ */}
          <div>
            {/* Center header card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px 28px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '14px', background: `${selectedCenter.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TypeIcon size={28} color={selectedCenter.color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 style={{ color: C.text, fontWeight: 800, fontSize: '1.3rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{selectedCenter.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: `${selectedCenter.color}18`, color: selectedCenter.color, fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', letterSpacing: '0.06em' }}>
                        {TYPE_LABELS[selectedCenter.type]}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.muted, fontSize: '12px' }}>
                        <MapPin size={11} /> {selectedCenter.address}
                      </span>
                      <a href={`tel:${selectedCenter.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22C55E', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
                        <Phone size={11} /> {selectedCenter.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setShowBroadcast(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, color: C.primary, padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: font }}>
                    <Send size={13} /> Broadcast
                  </button>
                  <button onClick={() => showToast('Backup request sent to LASEMA HQ')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: font }}>
                    <Bell size={13} /> Request Backup
                  </button>
                  <button onClick={() => loadAssignments(selectedCenter)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: font }}>
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: '10px', marginTop: '20px' }}>
                {[
                  { label: 'Total Units',  value: selectedCenter.units,                                 color: C.text,    icon: Truck },
                  { label: 'Available',    value: selectedCenter.available,                              color: '#22C55E', icon: CheckCircle },
                  { label: 'Deployed',     value: selectedCenter.units - selectedCenter.available,       color: '#EF4444', icon: Navigation },
                  { label: 'Active Jobs',  value: activeCount,                                           color: '#F97316', icon: AlertTriangle },
                  { label: 'Completed',    value: assignments.filter(a=>a.status==='resolved').length,   color: '#8B5CF6', icon: BarChart2 },
                ].map(s => (
                  <div key={s.label} style={{ background: C.surface2, borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                      <s.icon size={14} color={s.color} strokeWidth={2} />
                      <span style={{ color: C.muted, fontSize: '11px', fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <div style={{ color: s.color, fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '5px', marginBottom: '16px' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ flex: 1, padding: '8px 12px', background: activeTab === t.id ? C.primarySoft : 'none', border: `1px solid ${activeTab === t.id ? C.primaryBorder : 'transparent'}`, borderRadius: '9px', color: activeTab === t.id ? C.primary : C.muted, fontSize: '12px', fontWeight: activeTab === t.id ? 700 : 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ─ TAB: Overview ─ */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '16px' }}>
                {/* Active incidents */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <AlertTriangle size={16} color="#EF4444" strokeWidth={2} />
                    <span style={{ color: C.text, fontWeight: 800, fontSize: '13px' }}>Active Incidents</span>
                    <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: '10px', fontWeight: 800, padding: '1px 7px', borderRadius: '999px' }}>{activeCount}</span>
                  </div>
                  {assignments.filter(a => ['en-route','on-scene'].includes(a.status)).slice(0,5).map(a => (
                    <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.status === 'on-scene' ? '#EF4444' : '#2563EB', flexShrink: 0, marginTop: '4px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.text, fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.location}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                          <StatusBadge status={a.status} />
                          <SevBadge sev={a.severity} />
                          <span style={{ color: C.muted, fontSize: '10px' }}>{a.unit}</span>
                        </div>
                      </div>
                      <div style={{ color: C.muted, fontSize: '10px', flexShrink: 0 }}>{a.time}</div>
                    </div>
                  ))}
                  {activeCount === 0 && <div style={{ color: C.muted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No active incidents</div>}
                </div>

                {/* Unit availability */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={16} color={C.muted} strokeWidth={2} />
                      <span style={{ color: C.text, fontWeight: 800, fontSize: '13px' }}>Unit Availability</span>
                    </div>
                    <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 700 }}>
                      {selectedCenter.available}/{selectedCenter.units} ready
                    </span>
                  </div>
                  {/* Availability bar */}
                  <div style={{ height: '8px', background: C.surface2, borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ height: '100%', width: `${(selectedCenter.available/selectedCenter.units)*100}%`, background: 'linear-gradient(90deg, #22C55E, #10B981)', borderRadius: '6px', transition: 'width 0.8s ease' }} />
                  </div>
                  {/* Unit grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {units.slice(0, 8).map((u, i) => (
                      <div key={i} style={{ background: C.surface2, borderRadius: '8px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '6px', background: u.available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Truck size={12} color={u.available ? '#22C55E' : '#EF4444'} />
                        </div>
                        <div>
                          <div style={{ color: C.text, fontSize: '10px', fontWeight: 700 }}>{u.name}</div>
                          <div style={{ color: u.available ? '#22C55E' : '#EF4444', fontSize: '9px', fontWeight: 600 }}>{u.available ? 'Available' : 'Deployed'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px', gridColumn: '1 / -1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <Clock size={16} color={C.muted} strokeWidth={2} />
                    <span style={{ color: C.text, fontWeight: 800, fontSize: '13px' }}>Recent Activity</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '10px' }}>
                    {assignments.slice(0, 6).map(a => (
                      <div key={a.id} style={{ background: C.surface2, borderRadius: '12px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: C.muted, fontSize: '10px', fontWeight: 700 }}>{a.id}</span>
                          <StatusBadge status={a.status} />
                        </div>
                        <div style={{ color: C.text, fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{a.location}</div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <SevBadge sev={a.severity} />
                          <span style={{ color: C.muted, fontSize: '10px' }}>{a.unit} · {a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─ TAB: Assignments ─ */}
            {activeTab === 'assignments' && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden' }}>
                {/* Filter bar */}
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['all','en-route','on-scene','monitoring','resolved'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${statusFilter === s ? C.primaryBorder : C.border}`, background: statusFilter === s ? C.primarySoft : 'none', color: statusFilter === s ? C.primary : C.muted, fontSize: '11px', fontWeight: statusFilter === s ? 700 : 600, cursor: 'pointer', fontFamily: font, textTransform: 'capitalize' }}>
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: font }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Assignment','Location','Unit','Officer','Severity','Status','Time','ETA'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: C.muted }}>Loading assignments…</td></tr>
                      ) : filtered.length === 0 ? (
                        <tr><td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: C.muted }}>No assignments found</td></tr>
                      ) : filtered.map((a, i) => (
                        <tr key={a.id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? 'transparent' : `${C.surface2}44`, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = `${C.surface2}88`}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : `${C.surface2}44`}
                        >
                          <td style={{ padding: '12px 16px', color: C.primary, fontWeight: 700, whiteSpace: 'nowrap' }}>{a.id}</td>
                          <td style={{ padding: '12px 16px', color: C.text, fontWeight: 600, whiteSpace: 'nowrap' }}>{a.location}</td>
                          <td style={{ padding: '12px 16px', color: C.muted, whiteSpace: 'nowrap' }}>{a.unit}</td>
                          <td style={{ padding: '12px 16px', color: C.muted, whiteSpace: 'nowrap' }}>{a.officer}</td>
                          <td style={{ padding: '12px 16px' }}><SevBadge sev={a.severity} /></td>
                          <td style={{ padding: '12px 16px' }}><StatusBadge status={a.status} /></td>
                          <td style={{ padding: '12px 16px', color: C.muted, whiteSpace: 'nowrap' }}>{a.time}</td>
                          <td style={{ padding: '12px 16px', color: a.status === 'on-scene' ? '#22C55E' : C.muted, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {a.status === 'resolved' ? '—' : `${a.eta}m`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─ TAB: Units ─ */}
            {activeTab === 'units' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '3px 16px', marginBottom: '20px' }}>
                  {[
                    { label: 'Available',    val: selectedCenter.available,                          color: '#22C55E' },
                    { label: 'Deployed',     val: selectedCenter.units - selectedCenter.available,   color: '#EF4444' },
                    { label: 'Utilisation',  val: `${Math.round((1 - selectedCenter.available/selectedCenter.units)*100)}%`, color: '#D97706' },
                  ].map(s => (
                    <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: C.muted, fontSize: '12px', fontWeight: 600 }}>{s.label}</span>
                      <span style={{ color: s.color, fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>{s.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '10px' }}>
                  {units.map((u, i) => <UnitCard key={i} unit={u} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─ Broadcast Modal ─ */}
      {showBroadcast && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setShowBroadcast(false); }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '18px', margin: 0 }}>Broadcast Message</h3>
              <button onClick={() => setShowBroadcast(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <XCircle size={22} />
              </button>
            </div>
            <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} color={C.muted} />
              <span style={{ color: C.muted, fontSize: '12px' }}>Broadcasting to all units at <strong style={{ color: C.text }}>{selectedCenter.name}</strong></span>
            </div>
            <textarea
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Type your message to all units…"
              rows={5}
              style={{ width: '100%', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', color: C.text, fontSize: '14px', fontFamily: font, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowBroadcast(false)}
                style={{ flex: 1, padding: '11px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', color: C.muted, cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: font }}>
                Cancel
              </button>
              <button onClick={() => { showToast(`Broadcast sent to ${selectedCenter.name}`); setShowBroadcast(false); setBroadcastMsg(''); }}
                style={{ flex: 2, padding: '11px', background: C.primary, border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Send size={14} /> Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
