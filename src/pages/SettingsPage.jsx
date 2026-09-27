import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings, Bell, Shield, Globe, User,
  Moon, Sun, Volume2, VolumeX, Mail,
  Phone, Lock, Eye, EyeOff, ChevronRight,
  CheckCircle, AlertTriangle, Smartphone,
  MapPin, RefreshCw, Clock, Heart, Info,
  Database, Server, Code
} from 'lucide-react';
import { C, font } from '../theme';
import { useTheme } from '../context/ThemeContext';

const Toggle = ({ value, onChange, color = '#CC2200' }) => (
  <div onClick={() => onChange(!value)} style={{
    width: 44, height: 24, borderRadius: '999px', cursor: 'pointer',
    background: value ? color : C.surface2,
    border: `2px solid ${value ? color : C.border}`,
    position: 'relative', transition: 'all 0.2s', flexShrink: 0,
  }}>
    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
      <div style={{ color: C.text, fontWeight: 700, fontSize: '14px' }}>{title}</div>
    </div>
    <div style={{ padding: '4px 0' }}>{children}</div>
  </div>
);

const Row = ({ icon: Icon, iconColor = '#CC2200', label, desc, right, onClick }) => (
  <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', transition: 'background 0.15s', cursor: onClick ? 'pointer' : 'default', borderBottom: `1px solid ${C.border}` }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = C.surface2; }}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
  >
    <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} color={iconColor} strokeWidth={2} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ color: C.text, fontWeight: 600, fontSize: '14px' }}>{label}</div>
      {desc && <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px' }}>{desc}</div>}
    </div>
    <div style={{ flexShrink: 0 }}>{right}</div>
  </div>
);

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  const [notif, setNotif] = useState({
    sound: true, browser: true, email: false,
    criticalOnly: false, newIncident: true, statusUpdate: true,
  });
  const [priv, setPriv] = useState({
    showProfile: true, showActivity: false, anonymousReport: false,
  });
  const [sys, setSys] = useState({
    autoRefresh: true, refreshInterval: '30', language: 'English', radius: '10km',
  });

  const setN = k => v => setNotif(s => ({ ...s, [k]: v }));
  const setP = k => v => setPriv(s => ({ ...s, [k]: v }));
  const setS = k => v => setSys(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    localStorage.setItem('cw_settings', JSON.stringify({ notif, priv, sys }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isDark = theme === 'dark';

  const selectStyle = {
    background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px',
    padding: '5px 10px', color: C.text, fontSize: '13px', fontFamily: font,
    outline: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>
      {/* Header */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '28px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 46, height: 46, background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} color="#CC2200" />
            </div>
            <div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
              <p style={{ color: C.muted, fontSize: '14px', marginTop: '3px' }}>Manage your account, notifications and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>

        <Section title="Account">
          <Row icon={User}   iconColor="#1D4ED8" label="Edit Profile"     desc="Update your name, phone and bio"        right={<ChevronRight size={16} color={C.faint} />} onClick={() => window.location.href='/profile'} />
          <Row icon={Lock}   iconColor="#D97706" label="Change Password"  desc="Update your account password"           right={<ChevronRight size={16} color={C.faint} />} onClick={() => window.location.href='/profile'} />
          <Row icon={Shield} iconColor="#047857" label="Account Verified" desc="Your account is active and verified"    right={<CheckCircle size={16} color="#047857" />} />
          <Row icon={User}   iconColor="#6D28D9" label="Role"             desc="Public user — request upgrade to Responder" right={<span style={{ color: C.faint, fontSize: '12px' }}>Public</span>} />
        </Section>

        <Section title="Appearance">
          <Row
            icon={isDark ? Moon : Sun}
            iconColor={isDark ? '#6D28D9' : '#D97706'}
            label={isDark ? 'Dark Mode Active' : 'Light Mode Active'}
            desc="Toggle between dark and light interface"
            right={
              <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 12px', color: C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            }
          />
          <Row icon={Globe} iconColor="#1D4ED8" label="Language" desc="Interface language"
            right={
              <select value={sys.language} onChange={e => setS('language')(e.target.value)} style={selectStyle}>
                <option>English</option><option>Yoruba</option><option>Hausa</option><option>Igbo</option><option>Pidgin</option>
              </select>
            }
          />
        </Section>

        <Section title="Notifications">
          <Row icon={Volume2}       iconColor="#CC2200" label="Sound Alerts"           desc="Play alert sound when new emergency is detected"   right={<Toggle value={notif.sound}        onChange={setN('sound')} />} />
          <Row icon={Bell}          iconColor="#1D4ED8" label="Browser Notifications"  desc="Show pop-up alerts in your browser"                 right={<Toggle value={notif.browser}      onChange={setN('browser')} color="#1D4ED8" />} />
          <Row icon={Mail}          iconColor="#D97706" label="Email Alerts"           desc="Receive email for high severity incidents"           right={<Toggle value={notif.email}        onChange={setN('email')} color="#D97706" />} />
          <Row icon={AlertTriangle} iconColor="#FF3B30" label="Critical Alerts Only"   desc="Only notify for critical and high severity"          right={<Toggle value={notif.criticalOnly} onChange={setN('criticalOnly')} color="#FF3B30" />} />
          <Row icon={Bell}          iconColor="#047857" label="New Incident Alerts"    desc="Alert when a new incident is reported"               right={<Toggle value={notif.newIncident}  onChange={setN('newIncident')} color="#047857" />} />
          <Row icon={RefreshCw}     iconColor="#6D28D9" label="Status Update Alerts"  desc="Alert when an incident status changes"               right={<Toggle value={notif.statusUpdate} onChange={setN('statusUpdate')} color="#6D28D9" />} />
        </Section>

        <Section title="Privacy">
          <Row icon={Eye}    iconColor="#1D4ED8" label="Public Profile"       desc="Allow others to see your profile"                 right={<Toggle value={priv.showProfile}     onChange={setP('showProfile')} color="#1D4ED8" />} />
          <Row icon={Eye}    iconColor="#D97706" label="Show Activity"        desc="Show your incident history to responders"         right={<Toggle value={priv.showActivity}    onChange={setP('showActivity')} color="#D97706" />} />
          <Row icon={EyeOff} iconColor="#047857" label="Anonymous Reports"   desc="Submit reports anonymously by default"             right={<Toggle value={priv.anonymousReport} onChange={setP('anonymousReport')} color="#047857" />} />
        </Section>

        <Section title="System Preferences">
          <Row icon={Smartphone} iconColor="#1D4ED8" label="Auto Refresh"      desc="Automatically refresh incident data"
            right={<Toggle value={sys.autoRefresh} onChange={setS('autoRefresh')} color="#1D4ED8" />} />
          <Row icon={Clock}      iconColor="#D97706" label="Refresh Interval"  desc="How often to check for new incidents"
            right={
              <select value={sys.refreshInterval} onChange={e => setS('refreshInterval')(e.target.value)} style={selectStyle}>
                <option value="15">Every 15s</option>
                <option value="30">Every 30s</option>
                <option value="60">Every 60s</option>
                <option value="120">Every 2min</option>
              </select>
            }
          />
          <Row icon={MapPin}     iconColor="#047857" label="Alert Radius"      desc="Distance for nearby incident alerts"
            right={
              <select value={sys.radius} onChange={e => setS('radius')(e.target.value)} style={selectStyle}>
                {['1km','2km','5km','10km','25km','50km'].map(r => <option key={r}>{r}</option>)}
              </select>
            }
          />
          <Row icon={Globe}      iconColor="#6D28D9" label="Timezone"          desc="Your local timezone for timestamps"
            right={<span style={{ color: C.faint, fontSize: '13px' }}>Africa/Lagos</span>} />
        </Section>

        <Section title="About CrisisWatch Lagos">
          <Row icon={Shield}   iconColor="#CC2200" label="CrisisWatch Lagos"   desc="Emergency Reporting and Response Platform"         right={<span style={{ color: C.faint, fontSize: '12px' }}>v1.0.0</span>} />
          <Row icon={MapPin}   iconColor="#1D4ED8" label="Coverage Area"       desc="Currently covers Lagos State only"                  right={<span style={{ color: '#047857', fontSize: '12px', fontWeight: 700 }}>Lagos State</span>} />
          <Row icon={Code}     iconColor="#D97706" label="Tech Stack"          desc="React.js · Flask · Naija-BERT · Leaflet · PostgreSQL" right={null} />
          <Row icon={User}     iconColor="#6D28D9" label="Developer"           desc="Final Year Project — Computer Science, 2025"        right={<span style={{ color: C.faint, fontSize: '12px' }}>Dare Praise</span>} />
        </Section>

        <button onClick={handleSave} style={{ width: '100%', background: saved ? '#047857' : '#CC2200', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: font, transition: 'all 0.2s', boxShadow: saved ? '0 6px 20px rgba(4,120,87,0.3)' : '0 6px 20px rgba(204,34,0,0.3)' }}>
          {saved ? 'Settings Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
