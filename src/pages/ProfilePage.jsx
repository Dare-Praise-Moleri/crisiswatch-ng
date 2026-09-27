import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Shield, Settings, LogOut, Edit3,
  MapPin, Clock, CheckCircle, AlertTriangle,
  Activity, TrendingUp, Users, Star,
  Bell, Lock, Eye, FileText, Phone,
  Award, BarChart2, Navigation, Building,
  ChevronRight, Save, X, Radio, Mail
} from 'lucide-react';
import { C, font, TYPE_CONFIG, SEV_STYLE, normSev, cap, timeAgo } from '../theme';

const ROLES = ['public', 'responder', 'admin'];

const StatCard = ({ icon: Icon, color, label, value }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px', textAlign: 'center', transition: 'all 0.2s' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
      <Icon size={17} color={color} strokeWidth={2} />
    </div>
    <div style={{ color: C.text, fontWeight: 800, fontSize: '22px', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
    <div style={{ color: C.faint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
  </div>
);

/* ── Public user profile ── */
const PublicProfile = ({ user, incidents }) => (
  <div>
    <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>My Activity</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '12px', marginBottom: '24px' }}>
      <StatCard icon={FileText}  color="#CC2200" label="Reports Submitted" value={incidents.filter(i => i.source === 'User Report').length || 0} />
      <StatCard icon={CheckCircle} color="#047857" label="Resolved"        value={incidents.filter(i => i.status === 'Resolved').length || 0}     />
      <StatCard icon={Clock}     color="#D97706" label="Avg Response"      value="4.2m"                                                             />
      <StatCard icon={Bell}      color="#6D28D9" label="Alerts Received"   value="12"                                                               />
    </div>

    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>Recent Reports</div>
      {incidents.slice(0, 4).map(inc => {
        const type = TYPE_CONFIG[inc.type] || TYPE_CONFIG.other;
        const S = SEV_STYLE[normSev(inc.severity)] || SEV_STYLE.medium;
        return (
          <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={14} color={type.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.text, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
              <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>{timeAgo(inc.created_at)}</div>
            </div>
            <span style={{ background: S.bg, color: S.text, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', flexShrink: 0 }}>{cap(normSev(inc.severity))}</span>
          </div>
        );
      })}
      {incidents.length === 0 && (
        <div style={{ color: C.faint, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No reports yet. <Link to="/report" style={{ color: '#CC2200', textDecoration: 'none', fontWeight: 700 }}>Submit one now</Link></div>
      )}
    </div>

    <div style={{ background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ color: '#1D4ED8', fontWeight: 700, fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Shield size={13} /> Want full dashboard access?
      </div>
      <p style={{ color: C.muted, fontSize: '12px', lineHeight: 1.6, margin: '0 0 10px' }}>
        If you are from LASEMA, Lagos Fire Service, NPF or another emergency agency, request a responder role upgrade.
      </p>
      <a href="mailto:admin@crisiswatch.ng" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#1D4ED8', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
        <Mail size={12} /> Request Upgrade
      </a>
    </div>
  </div>
);

/* ── Responder profile ── */
const ResponderProfile = ({ user, incidents }) => {
  const handled  = incidents.filter(i => i.status === 'Resolved').length;
  const active   = incidents.filter(i => ['Active','Responding'].includes(i.status)).length;

  return (
    <div>
      {/* Rating */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Star size={26} color="#D97706" />
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', lineHeight: 1 }}>4.8 / 5.0</div>
          <div style={{ color: C.faint, fontSize: '12px', marginTop: '3px' }}>Performance Rating · Based on 47 responses</div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ color: '#047857', fontWeight: 700, fontSize: '13px' }}>Active Responder</div>
          <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>LASEMA Unit 04</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={CheckCircle}  color="#047857" label="Incidents Handled"  value={handled}  />
        <StatCard icon={Activity}     color="#CC2200" label="Active Now"          value={active}   />
        <StatCard icon={Clock}        color="#D97706" label="Avg Response Time"   value="3.8m"     />
        <StatCard icon={Navigation}   color="#1D4ED8" label="Km Covered"          value="234"      />
        <StatCard icon={FileText}     color="#6D28D9" label="Reports Submitted"   value="12"       />
        <StatCard icon={Award}        color="#D97706" label="Commendations"       value="3"        />
      </div>

      {/* Assignment history */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>Recent Assignments</div>
          <Link to="/responder" style={{ color: '#CC2200', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
        </div>
        {[
          { title: 'Building fire — Oshodi Market', status: 'Resolved',   time: '2h ago',  type: 'fire'     },
          { title: 'Armed robbery — Lekki Phase 1', status: 'Resolved',   time: '1d ago',  type: 'crime'    },
          { title: 'Flash flood — Mile 2 Road',     status: 'Responding', time: '3h ago',  type: 'flood'    },
          { title: 'Road accident — 3rd Mainland',  status: 'Resolved',   time: '2d ago',  type: 'accident' },
        ].map((a, i) => {
          const type = TYPE_CONFIG[a.type] || TYPE_CONFIG.other;
          const stColor = a.status === 'Resolved' ? '#047857' : '#1D4ED8';
          return (
            <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={14} color={type.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>{a.time}</div>
              </div>
              <span style={{ background: `${stColor}12`, color: stColor, fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', flexShrink: 0 }}>{a.status}</span>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Link to="/map" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#CC2200', color: '#fff', borderRadius: '10px', padding: '12px 16px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
          <MapPin size={15} /> Open Live Map
        </Link>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(29,78,216,0.25)', color: '#1D4ED8', borderRadius: '10px', padding: '12px 16px', textDecoration: 'none', fontSize: '13px', fontWeight: 700 }}>
          <BarChart2 size={15} /> Dashboard
        </Link>
      </div>
    </div>
  );
};

/* ── Admin profile ── */
const AdminProfile = ({ incidents, onSwitchRole }) => {
  const [users] = useState([
    { name: 'Dare Praise',     role: 'admin',     status: 'active',   joined: '2024-01',  reports: 12 },
    { name: 'Amaka Okafor',    role: 'responder', status: 'active',   joined: '2024-03',  reports: 8  },
    { name: 'Bolu Adeyemi',    role: 'responder', status: 'active',   joined: '2024-05',  reports: 23 },
    { name: 'Chidi Nwachukwu', role: 'public',    status: 'active',   joined: '2024-08',  reports: 5  },
    { name: 'Funke Adetokunbo',role: 'public',    status: 'pending',  joined: '2024-11',  reports: 0  },
    { name: 'Kayode Lawal',    role: 'responder', status: 'inactive', joined: '2024-02',  reports: 3  },
  ]);

  const roleColor = { admin: '#CC2200', responder: '#1D4ED8', public: '#047857' };
  const statusCol = { active: '#047857', pending: '#D97706', inactive: '#6B7280' };

  return (
    <div>
      {/* System overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatCard icon={Users}       color="#CC2200" label="Total Users"      value={users.length}                                              />
        <StatCard icon={Shield}      color="#1D4ED8" label="Responders"       value={users.filter(u => u.role === 'responder').length}           />
        <StatCard icon={Activity}    color="#047857" label="Active Incidents"  value={incidents.filter(i => i.status === 'Active').length}        />
        <StatCard icon={FileText}    color="#D97706" label="Total Incidents"   value={incidents.length}                                           />
        <StatCard icon={TrendingUp}  color="#6D28D9" label="Today"            value={incidents.filter(i => new Date(i.created_at).toDateString() === new Date().toDateString()).length} />
        <StatCard icon={Radio}       color="#CC2200" label="NLP Posts Today"   value="247"                                                        />
      </div>

      {/* User management table */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>User Management</div>
          <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>{users.length} users</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['Name','Role','Status','Joined','Reports','Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} style={{ borderBottom: i < users.length - 1 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${roleColor[u.role]}, #1D4ED8)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {u.name.charAt(0)}
                      </div>
                      <span style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: `${roleColor[u.role]}12`, color: roleColor[u.role], fontSize: '11px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px', textTransform: 'capitalize' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: statusCol[u.status], fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{u.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: C.faint, fontSize: '12px' }}>{u.joined}</td>
                  <td style={{ padding: '12px 16px', color: C.text, fontSize: '13px', fontWeight: 600 }}>{u.reports}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', color: C.muted, fontSize: '11px', cursor: 'pointer', fontFamily: font }}>Edit</button>
                      {u.status === 'pending' && <button style={{ background: 'rgba(4,120,87,0.12)', border: '1px solid rgba(4,120,87,0.3)', borderRadius: '6px', padding: '4px 10px', color: '#047857', fontSize: '11px', cursor: 'pointer', fontFamily: font }}>Approve</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System health */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>System Health</div>
        {[
          { label: 'NLP Pipeline',      status: 'Operational', color: '#047857', metric: 'F1: 0.96'       },
          { label: 'Social Monitor',    status: 'Active',      color: '#047857', metric: '247 posts/hr'   },
          { label: 'Email Alerts',      status: 'Active',      color: '#047857', metric: 'Gmail SMTP'     },
          { label: 'Database',          status: 'Healthy',     color: '#047857', metric: 'SQLite/PgSQL'   },
          { label: 'Map / Geocoder',    status: 'Operational', color: '#047857', metric: '80+ Lagos places'},
          { label: 'Resource Allocator',status: 'Active',      color: '#047857', metric: '18 centers'     },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none' }}>
            <span style={{ color: C.muted, fontSize: '13px' }}>{s.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: C.faint, fontSize: '11px' }}>{s.metric}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
                <span style={{ color: s.color, fontSize: '11px', fontWeight: 600 }}>{s.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════
   MAIN PROFILE PAGE
═══════════════════════════════ */
export default function ProfilePage() {
  const [role,      setRole]      = useState('admin'); // Toggle for demo
  const [editing,   setEditing]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [incidents, setIncidents] = useState([]);

  const [form, setForm] = useState({
    name: 'Dare Praise Moleri', email: 'darepraise@example.com',
    phone: '+234 800 000 0000', agency: 'LASEMA',
    bio: 'Emergency response coordinator. Computer Science final year student.',
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/incidents/?limit=10')
      .then(r => r.json()).then(d => setIncidents(d.incidents || [])).catch(() => {});
  }, []);

  const handleSave = () => { setSaved(true); setEditing(false); setTimeout(() => setSaved(false), 3000); };
  const handleLogout = () => { localStorage.removeItem('crisiswatch_token'); window.location.href = '/login'; };

  const roleLabel = { public: 'Public User', responder: 'Emergency Responder', admin: 'System Administrator' };
  const roleColor = { public: '#047857', responder: '#1D4ED8', admin: '#CC2200' };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>
      {/* Header */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '28px 0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #CC2200, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff', boxShadow: '0 0 24px rgba(204,34,0,0.3)' }}>DP</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: '50%', background: '#047857', border: `2px solid ${C.bgAlt}` }} />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ color: C.text, fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', margin: 0 }}>{form.name}</h1>
                <span style={{ background: `${roleColor[role]}15`, border: `1px solid ${roleColor[role]}30`, color: roleColor[role], fontSize: '11px', fontWeight: 700, padding: '3px 11px', borderRadius: '999px' }}>
                  {roleLabel[role]}
                </span>
              </div>
              <div style={{ color: C.muted, fontSize: '13px', marginBottom: '10px' }}>{form.email} · {form.phone}</div>
              {form.bio && <div style={{ color: C.faint, fontSize: '13px', lineHeight: 1.6, maxWidth: '500px' }}>{form.bio}</div>}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => setEditing(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 16px', color: C.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                <Edit3 size={14} /> {editing ? 'Cancel' : 'Edit'}
              </button>
              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '9px', padding: '8px 14px', color: C.muted, textDecoration: 'none' }}>
                <Settings size={14} />
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '9px', padding: '8px 14px', color: '#CC2200', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 32px' }}>
        {/* Role switcher — demo only */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: C.faint, fontSize: '12px', fontWeight: 600 }}>Demo: View as role</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ padding: '5px 14px', borderRadius: '7px', border: `1px solid ${role === r ? roleColor[r] : C.border}`, background: role === r ? `${roleColor[r]}12` : 'transparent', color: role === r ? roleColor[r] : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, textTransform: 'capitalize', transition: 'all 0.15s' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Edit Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email',     key: 'email',type: 'email'},
                { label: 'Phone',     key: 'phone',type: 'tel'  },
                { label: 'Agency',    key: 'agency',type:'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: '9px', padding: '9px 12px', color: C.text, fontSize: '13px', fontFamily: font, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: C.muted, fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                style={{ width: '100%', background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: '9px', padding: '9px 12px', color: C.text, fontSize: '13px', fontFamily: font, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#CC2200', border: 'none', borderRadius: '9px', padding: '10px 20px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              <Save size={14} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Role-specific content */}
        {role === 'public'    && <PublicProfile    user={form} incidents={incidents} />}
        {role === 'responder' && <ResponderProfile  user={form} incidents={incidents} />}
        {role === 'admin'     && <AdminProfile      incidents={incidents} onSwitchRole={setRole} />}
      </div>
    </div>
  );
}
