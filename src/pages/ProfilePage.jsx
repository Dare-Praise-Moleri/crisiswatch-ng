import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI, authAPI, clearToken } from '../services/api';
import {
  User, Shield, Settings, Bell, MapPin, Lock,
  Eye, EyeOff, Camera, CheckCircle, LogOut,
  AlertTriangle, Activity, FileText, Clock,
  ChevronRight, Edit3, Save, X, Phone, Mail,
  Globe, Cpu, Key, Trash2, Download, Award,
  BarChart2, TrendingUp, Calendar
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
  borderFocus:  'rgba(204,34,0,0.45)',
  text:         '#E8EDF5',
  muted:        'rgba(232,237,245,0.55)',
  faint:        'rgba(232,237,245,0.28)',
};
const font = "'DM Sans', system-ui, sans-serif";

/* ─── TOGGLE ─── */
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

/* ─── INPUT ─── */
const InputField = ({ label, type = 'text', value, onChange, placeholder, disabled, icon: Icon }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: font }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none', display: 'flex' }}><Icon size={15} /></div>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', background: disabled ? C.surface : C.surface2,
          border: `1px solid ${C.border}`, borderRadius: '10px',
          padding: `11px 14px 11px ${Icon ? '38px' : '14px'}`,
          color: disabled ? C.faint : C.text,
          fontSize: '14px', fontFamily: font, outline: 'none',
          transition: 'border-color 0.2s', boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = C.borderFocus; }}
        onBlur={e => e.target.style.borderColor = C.border}
      />
    </div>
  </div>
);

/* ─── SECTION CARD ─── */
const SectionCard = ({ title, subtitle, icon: Icon, color = C.primary, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden', marginBottom: '20px' }}>
    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '16px' }}>{title}</div>
        {subtitle && <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px' }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: '24px' }}>{children}</div>
  </div>
);

/* ─── SETTING ROW ─── */
const SettingRow = ({ label, desc, children, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
    <div style={{ flex: 1 }}>
      <div style={{ color: C.text, fontWeight: 600, fontSize: '14px' }}>{label}</div>
      {desc && <div style={{ color: C.faint, fontSize: '12px', marginTop: '3px' }}>{desc}</div>}
    </div>
    {children}
  </div>
);

/* ─── NAV TABS ─── */
const TABS = [
  { id: 'profile',   label: 'Profile',   icon: User      },
  { id: 'activity',  label: 'Activity',  icon: Activity  },
  { id: 'security',  label: 'Security',  icon: Lock      },
  { id: 'settings',  label: 'Settings',  icon: Settings  },
];

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function ProfilePage() {
  const navigate = useNavigate();

  const [activeTab,   setActiveTab]   = useState('profile');
  const [editing,     setEditing]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [passMsg,     setPassMsg]     = useState({ text: '', error: false });

  const [profile, setProfile] = useState({
    name:     '',
    email:    '',
    phone:    '',
    role:     'public',
    zone:     'Nigeria',
    bio:      '',
    joined:   '',
    verified: false,
  });

  const [profileStats, setProfileStats] = useState({
    reports_submitted:   0,
    incidents_responded: 0,
    cases_resolved:      0,
    accuracy_score:      96,
    avg_response_time:   '4.1m',
    days_active:         0,
  });

  const [settings, setSettings] = useState({
    pushNotif:    true,
    smsAlerts:    true,
    emailDigest:  false,
    alertSound:   true,
    highOnly:     false,
    darkMode:     true,
    language:     'English (Nigerian)',
    radius:       '10km',
    twoFA:        false,
    publicProfile:false,
    showLocation:  true,
  });

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const setP = k => e => setProfile(p => ({ ...p, [k]: e.target.value }));
  const setSetting = k => setSettings(s => ({ ...s, [k]: !s[k] }));

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileAPI.update({
        name:  profile.name,
        phone: profile.phone,
        zone:  profile.zone,
        bio:   profile.bio,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const ACTIVITY = [
    { icon: FileText,      color: C.primary, title: 'Reported building fire — Oshodi Market',              time: '2 hours ago',   type: 'Report'    },
    { icon: Shield,        color: C.blue,    title: 'Responded to robbery alert — Lekki Phase 1',          time: '1 day ago',     type: 'Response'  },
    { icon: CheckCircle,   color: C.green,   title: 'Marked incident as Resolved — Sagamu accident',       time: '2 days ago',    type: 'Update'    },
    { icon: FileText,      color: C.primary, title: 'Reported flood — Mararaba Road, FCT',                 time: '3 days ago',    type: 'Report'    },
    { icon: Shield,        color: C.blue,    title: 'Responded to gas explosion — Trans Amadi, Rivers',    time: '5 days ago',    type: 'Response'  },
    { icon: FileText,      color: C.amber,   title: 'Reported civil unrest — Kano City Centre',            time: '1 week ago',    type: 'Report'    },
    { icon: CheckCircle,   color: C.green,   title: 'Marked incident as Resolved — Kidnapping, Kaduna',   time: '1 week ago',    type: 'Update'    },
    { icon: Shield,        color: C.blue,    title: 'Responded to flood — Warri, Delta State',             time: '2 weeks ago',   type: 'Response'  },
  ];

  const STATS = [
    { icon: FileText,    color: C.primary, label: 'Reports Submitted',   value: profileStats.reports_submitted   },
    { icon: Shield,      color: C.blue,    label: 'Incidents Responded',  value: profileStats.incidents_responded },
    { icon: CheckCircle, color: C.green,   label: 'Cases Resolved',       value: profileStats.cases_resolved      },
    { icon: Award,       color: C.amber,   label: 'Accuracy Score',       value: `${profileStats.accuracy_score}%`},
    { icon: Clock,       color: C.purple,  label: 'Avg Response Time',    value: profileStats.avg_response_time   },
    { icon: Calendar,    color: C.faint,   label: 'Days Active',          value: profileStats.days_active         },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileAPI.get();
        const p   = res.profile;
        setProfile({
          name:     p.name     || '',
          email:    p.email    || '',
          phone:    p.phone    || '',
          role:     p.role     || 'public',
          zone:     p.zone     || 'Nigeria',
          bio:      p.bio      || '',
          verified: p.verified || false,
          joined:   new Date(p.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' }),
        });
        if (p.stats) setProfileStats(p.stats);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={22} color={C.primary} />
            </div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '6px' }}>Loading Profile...</div>
            <div style={{ color: C.faint, fontSize: '13px' }}>Fetching your data from the server</div>
          </div>
        </div>
      )}

      {/* ── PROFILE HERO ── */}
      <div style={{
        background: `linear-gradient(160deg, #1A0500 0%, #5C0E00 45%, #0D1525 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: '48px 0 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`, backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(204,34,0,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '28px', flexWrap: 'wrap', marginBottom: '32px' }}>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.primary}, ${C.blue})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: 800, color: '#fff',
                border: '3px solid rgba(255,255,255,0.15)',
                boxShadow: `0 0 40px rgba(204,34,0,0.3)`,
              }}>
                DP
              </div>
              {/* Camera button */}
              <button style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: '50%',
                background: C.primary, border: '2px solid #080E1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <Camera size={13} color="#fff" />
              </button>
              {/* Verified badge */}
              {profile.verified && (
                <div style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: C.green, border: '2px solid #080E1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={12} color="#fff" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', letterSpacing: '-0.02em', margin: 0 }}>
                  {profile.name}
                </h1>
                {profile.verified && (
                  <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: C.green, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Shield size={13} /> {profile.role}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={13} /> {profile.zone}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} /> Joined {profile.joined}
                </span>
              </div>
            </div>

            {/* Edit button */}
            <button onClick={() => editing ? handleSave() : setEditing(true)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: editing ? C.green : 'rgba(255,255,255,0.1)',
              border: `1px solid ${editing ? C.green : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '11px', padding: '10px 20px',
              color: '#fff', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: font, transition: 'all 0.2s',
            }}>
              {saving ? 'Saving...' : editing ? <><Save size={15} /> Save Changes</> : <><Edit3 size={15} /> Edit Profile</>}            </button>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: '0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ padding: '16px 20px', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: '0', marginTop: '4px' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '14px 22px', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.id ? C.primary : 'transparent'}`,
                background: 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: '14px', fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
                marginBottom: '-1px',
              }}>
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SAVE SUCCESS TOAST ── */}
      {saved && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 999,
          background: C.green, color: '#fff',
          borderRadius: '12px', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '14px', fontWeight: 700, fontFamily: font,
          boxShadow: `0 8px 24px rgba(16,185,129,0.4)`,
        }}>
          <CheckCircle size={16} /> Profile saved successfully!
        </div>
      )}

      {/* ── TAB CONTENT ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'activity' ? '1fr' : '1fr 360px', gap: '24px', alignItems: 'start' }}>

          {/* ════ MAIN COLUMN ════ */}
          <div>

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <>
                <SectionCard title="Personal Information" subtitle="Your public profile details" icon={User} color={C.primary}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <InputField label="Full Name"     value={profile.name}  onChange={setP('name')}  icon={User}  disabled={!editing} placeholder="Your full name"     />
                    <InputField label="Email Address" value={profile.email} onChange={setP('email')} icon={Mail}  disabled={!editing} placeholder="your@email.com"      type="email" />
                    <InputField label="Phone Number"  value={profile.phone} onChange={setP('phone')} icon={Phone} disabled={!editing} placeholder="+234 800 000 0000"   />
                    <InputField label="State / Zone"  value={profile.zone}  onChange={setP('zone')}  icon={MapPin}disabled={!editing} placeholder="e.g. Lagos State"    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Bio</label>
                    <textarea
                      value={profile.bio} onChange={setP('bio')} disabled={!editing} rows={3}
                      style={{ width: '100%', background: editing ? C.surface2 : C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '11px 14px', color: editing ? C.text : C.faint, fontSize: '14px', fontFamily: font, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.65, cursor: editing ? 'text' : 'not-allowed' }}
                      onFocus={e => { if (editing) e.target.style.borderColor = C.borderFocus; }}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>
                  {editing && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, border: 'none', borderRadius: '10px', padding: '11px 24px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: `0 4px 16px rgba(204,34,0,0.3)` }}>
                        <Save size={15} /> Save Changes
                      </button>
                      <button onClick={() => setEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '11px 20px', color: C.muted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                        <X size={15} /> Cancel
                      </button>
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Role & Access" subtitle="Your account type and permissions" icon={Shield} color={C.blue}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' }}>
                    {[
                      { label: 'Account Role',   value: profile.role,     color: C.blue,   icon: Shield       },
                      { label: 'Zone Assigned',  value: profile.zone,     color: C.amber,  icon: MapPin       },
                      { label: 'Verified',       value: 'Yes — Verified', color: C.green,  icon: CheckCircle  },
                      { label: 'Access Level',   value: 'Level 2',        color: C.purple, icon: Key          },
                    ].map((item, i) => (
                      <div key={i} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <item.icon size={14} color={item.color} />
                          <span style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</span>
                        </div>
                        <div style={{ color: item.color, fontWeight: 700, fontSize: '15px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === 'activity' && (
              <>
                {/* Activity stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '24px' }}>
                  {STATS.map((s, i) => (
                    <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '11px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <s.icon size={18} color={s.color} strokeWidth={2} />
                      </div>
                      <div>
                        <div style={{ color: s.color, fontWeight: 800, fontSize: '22px', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
                        <div style={{ color: C.faint, fontSize: '11px', marginTop: '3px' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity timeline */}
                <SectionCard title="Recent Activity" subtitle="Your last 30 days of activity on CrisisWatch" icon={Activity} color={C.primary}>
                  <div style={{ position: 'relative' }}>
                    {/* Timeline line */}
                    <div style={{ position: 'absolute', left: '19px', top: '8px', bottom: '8px', width: '2px', background: C.border }} />
                    {ACTIVITY.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${item.color}18`, border: `2px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                          <item.icon size={16} color={item.color} strokeWidth={2} />
                        </div>
                        <div style={{ flex: 1, paddingTop: '6px' }}>
                          <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ color: C.faint, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> {item.time}</span>
                            <span style={{ background: `${item.color}18`, color: item.color, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{item.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <>
                <SectionCard title="Change Password" subtitle="Keep your account secure with a strong password" icon={Lock} color={C.primary}>
                  <div style={{ maxWidth: '420px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Current Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showPass ? 'text' : 'password'} value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password"
                          style={{ width: '100%', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '11px 42px 11px 14px', color: C.text, fontSize: '14px', fontFamily: font, outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = C.borderFocus}
                          onBlur={e => e.target.style.borderColor = C.border}
                        />
                        <button onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.faint, cursor: 'pointer', display: 'flex', padding: 0 }}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input type={showNewPass ? 'text' : 'password'} value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} placeholder="Create a strong password"
                          style={{ width: '100%', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '11px 42px 11px 14px', color: C.text, fontSize: '14px', fontFamily: font, outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => e.target.style.borderColor = C.borderFocus}
                          onBlur={e => e.target.style.borderColor = C.border}
                        />
                        <button onClick={() => setShowNewPass(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.faint, cursor: 'pointer', display: 'flex', padding: 0 }}>
                          {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                    <InputField label="Confirm New Password" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
                    {passMsg.text && (
                      <div style={{
                        marginBottom: '14px', padding: '10px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 500,
                        background: passMsg.error ? C.primarySoft : C.greenSoft,
                        border: `1px solid ${passMsg.error ? C.primaryBorder : 'rgba(16,185,129,0.3)'}`,
                        color: passMsg.error ? '#FF8A80' : C.green,
                      }}>
                        {passMsg.error ? '⚠️' : '✓'} {passMsg.text}
                      </div>
                    )}
                    <button
                      onClick={async () => {
                        setPassMsg({ text: '', error: false });
                        if (!passwords.current || !passwords.newPass || !passwords.confirm) {
                          setPassMsg({ text: 'All password fields are required', error: true });
                          return;
                        }
                        if (passwords.newPass !== passwords.confirm) {
                          setPassMsg({ text: 'New passwords do not match', error: true });
                          return;
                        }
                        if (passwords.newPass.length < 6) {
                          setPassMsg({ text: 'Password must be at least 6 characters', error: true });
                          return;
                        }
                        try {
                          await profileAPI.changePassword({
                            current_password: passwords.current,
                            new_password:     passwords.newPass,
                            confirm_password: passwords.confirm,
                          });
                          setPassMsg({ text: 'Password updated successfully!', error: false });
                          setPasswords({ current: '', newPass: '', confirm: '' });
                        } catch (err) {
                          setPassMsg({ text: err.message || 'Failed to update password', error: true });
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, border: 'none', borderRadius: '10px', padding: '11px 24px', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: `0 4px 14px rgba(204,34,0,0.3)` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                      onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                      <Lock size={15} /> Update Password
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account" icon={Shield} color={C.blue}>
                  <SettingRow label="Enable 2FA" desc="Use Google Authenticator or SMS verification on login" last>
                    <Toggle on={settings.twoFA} onChange={() => setSetting('twoFA')} />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Active Sessions" subtitle="Devices currently signed into your account" icon={Globe} color={C.amber}>
                  {[
                    { device: 'Chrome — Windows 11',      location: 'Lagos, Nigeria',   time: 'Active now',    current: true  },
                    { device: 'CrisisWatch Mobile App',   location: 'Lagos, Nigeria',   time: '2 hours ago',   current: false },
                    { device: 'Firefox — Windows 10',     location: 'Abuja, Nigeria',   time: '3 days ago',    current: false },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '10px', background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Globe size={18} color={C.faint} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {s.device}
                          {s.current && <span style={{ background: C.greenSoft, color: C.green, fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>Current</span>}
                        </div>
                        <div style={{ color: C.faint, fontSize: '12px' }}>{s.location} · {s.time}</div>
                      </div>
                      {!s.current && (
                        <button style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 12px', color: C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </SectionCard>

                {/* Danger zone */}
                <div style={{ background: 'rgba(204,34,0,0.05)', border: `1px solid rgba(204,34,0,0.2)`, borderRadius: '18px', padding: '24px', marginBottom: '20px' }}>
                  <div style={{ color: C.primary, fontWeight: 700, fontSize: '16px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={17} /> Danger Zone
                  </div>
                  <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                    These actions are permanent and cannot be undone. Please proceed with extreme caution.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.1)', border: `1px solid rgba(204,34,0,0.3)`, borderRadius: '9px', padding: '10px 18px', color: C.primary, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                      <Download size={14} /> Export My Data
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.1)', border: `1px solid rgba(204,34,0,0.3)`, borderRadius: '9px', padding: '10px 18px', color: C.primary, fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                      <Trash2 size={14} /> Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
              <>
                <SectionCard title="Notification Preferences" subtitle="Control how and when you receive alerts" icon={Bell} color={C.primary}>
                  <SettingRow label="Push Notifications" desc="In-app and browser notifications for new incidents">
                    <Toggle on={settings.pushNotif}   onChange={() => setSetting('pushNotif')}   />
                  </SettingRow>
                  <SettingRow label="SMS Alerts" desc="Text messages for high severity incidents only">
                    <Toggle on={settings.smsAlerts}   onChange={() => setSetting('smsAlerts')}   />
                  </SettingRow>
                  <SettingRow label="Email Digest" desc="Daily summary email of all incidents in your area">
                    <Toggle on={settings.emailDigest} onChange={() => setSetting('emailDigest')} />
                  </SettingRow>
                  <SettingRow label="Alert Sound" desc="Play notification sound for new critical alerts" last>
                    <Toggle on={settings.alertSound}  onChange={() => setSetting('alertSound')}  />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Incident Alert Filter" subtitle="Choose which alerts you want to be notified about" icon={AlertTriangle} color={C.amber}>
                  <SettingRow label="High Severity Only" desc="Only notify me for Critical and High severity incidents" last>
                    <Toggle on={settings.highOnly} onChange={() => setSetting('highOnly')} />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="Location & Privacy" subtitle="Manage your location data and visibility" icon={MapPin} color={C.blue}>
                  <SettingRow label="Alert Radius" desc="Get notified about incidents within this distance">
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['5km','10km','25km','50km'].map(r => (
                        <button key={r} onClick={() => setSettings(s => ({ ...s, radius: r }))} style={{
                            padding: '5px 10px', borderRadius: '7px',
                            background: settings.radius === r ? C.primarySoft : C.surface2,
                            color: settings.radius === r ? C.primary : C.muted,
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: font,
                            border: `1px solid ${settings.radius === r ? C.primaryBorder : C.border}`,
                        }}>{r}</button>
                        ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Public Profile" desc="Allow other users to see your profile and activity">
                    <Toggle on={settings.publicProfile} onChange={() => setSetting('publicProfile')} />
                  </SettingRow>
                  <SettingRow label="Show My Location" desc="Display your general location on your public profile" last>
                    <Toggle on={settings.showLocation} onChange={() => setSetting('showLocation')} />
                  </SettingRow>
                </SectionCard>

                <SectionCard title="App Preferences" subtitle="Customise your CrisisWatch experience" icon={Settings} color={C.purple}>
                  <SettingRow label="Dark Mode" desc="Use dark theme (recommended for emergency monitoring)">
                    <Toggle on={settings.darkMode} onChange={() => setSetting('darkMode')} />
                  </SettingRow>
                  <SettingRow label="Language" desc="Interface language" last>
                    <select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '7px 12px', color: C.text, fontSize: '13px', fontFamily: font, outline: 'none', cursor: 'pointer' }}>
                      {['English (Nigerian)','Yoruba','Hausa','Igbo','Pidgin English'].map(l => (
                        <option key={l} value={l} style={{ background: C.surface }}>{l}</option>
                      ))}
                    </select>
                  </SettingRow>
                </SectionCard>
              </>
            )}
          </div>

          {/* ════ RIGHT SIDEBAR ════ */}
          {activeTab !== 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Quick actions */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>Quick Actions</div>
                </div>
                <div style={{ padding: '8px' }}>
                  {[
                    { icon: FileText,   color: C.primary, label: 'Report an Incident',  to: '/report'    },
                    { icon: MapPin,     color: C.blue,    label: 'View Live Map',        to: '/map'       },
                    { icon: Bell,       color: C.amber,   label: 'Manage Alerts',        to: '/alerts'    },
                    { icon: BarChart2,  color: C.purple,  label: 'View Dashboard',       to: '/dashboard' },
                  ].map((item, i) => (
                    <Link key={i} to={item.to} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '11px 14px', borderRadius: '10px', marginBottom: '3px',
                      textDecoration: 'none', transition: 'background 0.15s',
                      background: 'transparent',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.surface2}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <item.icon size={16} color={item.color} strokeWidth={2} />
                      </div>
                      <span style={{ color: C.muted, fontSize: '13px', fontWeight: 600, flex: 1 }}>{item.label}</span>
                      <ChevronRight size={14} color={C.faint} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account info */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '20px' }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Account Info</div>
                {[
                  { label: 'Member since', value: profile.joined     },
                  { label: 'Account type', value: profile.role       },
                  { label: 'Reports made', value: '47 total'         },
                  { label: 'Last active',  value: '2 hours ago'      },
                  { label: 'Status',       value: 'Active & Verified'},
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ color: C.faint, fontSize: '13px' }}>{item.label}</span>
                    <span style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Sign out */}
              <button
                onClick={async () => {
                  try { await authAPI.logout(); } catch (e) { /* silent */ }
                  clearToken();
                  navigate('/login');
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                  background: 'rgba(204,34,0,0.08)', border: `1px solid rgba(204,34,0,0.2)`,
                  borderRadius: '12px', padding: '13px',
                  color: C.primary, fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', fontFamily: font, transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.primarySoft; e.currentTarget.style.borderColor = C.primaryBorder; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(204,34,0,0.08)'; e.currentTarget.style.borderColor = 'rgba(204,34,0,0.2)'; }}
              >
                <LogOut size={16} /> Sign Out of CrisisWatch
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}