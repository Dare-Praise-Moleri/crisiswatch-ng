import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, saveToken } from '../services/api';
import {
  AlertTriangle, Shield, Users, Settings,
  Eye, EyeOff, Mail, Lock, User, Phone,
  ArrowRight, CheckCircle
} from 'lucide-react';

const C = {
  primary:      '#CC2200',
  primaryHover: '#A81B00',
  primarySoft:  'rgba(204,34,0,0.1)',
  primaryBorder:'rgba(204,34,0,0.3)',
  blue:         '#2563EB',
  green:        '#10B981',
  amber:        '#F59E0B',
  bg:           '#080E1A',
  bgAlt:        '#0D1525',
  surface:      '#111827',
  surface2:     '#1A2438',
  border:       'rgba(255,255,255,0.08)',
  borderFocus:  'rgba(204,34,0,0.5)',
  text:         '#E8EDF5',
  muted:        'rgba(232,237,245,0.55)',
  faint:        'rgba(232,237,245,0.3)',
};
const font = "'DM Sans', system-ui, sans-serif";

const ROLES = [
  { id: 'public',    label: 'Public User', icon: Users,    color: C.green, desc: 'Report incidents, view the live map and receive emergency alerts near you.'              },
  { id: 'responder', label: 'Responder',   icon: Shield,   color: C.blue,  desc: 'Access the full live dashboard, manage incidents and coordinate responses.'              },
  { id: 'admin',     label: 'Admin',       icon: Settings, color: C.amber, desc: 'Full system access — manage users, data feeds and NER model settings.'                   },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.24 5.35l4.037-3.082Z"/>
  </svg>
);

/* ── Input field ── */
const InputField = ({ label, type = 'text', placeholder, icon: Icon, value, onChange, showToggle, onToggle, showPass }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '14px', fontWeight: 600, marginBottom: '7px', fontFamily: font }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: C.faint, pointerEvents: 'none', display: 'flex' }}>
          <Icon size={16} />
        </div>
      )}
      <input
        type={showToggle ? (showPass ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', background: C.surface2,
          border: `1px solid ${C.border}`,
          borderRadius: '10px',
          padding: `12px 14px 12px ${Icon ? '40px' : '14px'}`,
          paddingRight: showToggle ? '42px' : '14px',
          color: C.text, fontSize: '15px', fontFamily: font,
          outline: 'none', transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={e => e.target.style.borderColor = C.borderFocus}
        onBlur={e => e.target.style.borderColor = C.border}
      />
      {showToggle && (
        <button onClick={onToggle} type="button" style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: C.faint, cursor: 'pointer',
          padding: 0, display: 'flex', alignItems: 'center',
        }}>
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  </div>
);

/* ── Password strength ── */
const getStrength = (p) => {
  if (!p) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (p.length >= 8)            score++;
  if (/[A-Z]/.test(p))          score++;
  if (/[0-9]/.test(p))          score++;
  if (/[^A-Za-z0-9]/.test(p))  score++;
  return [
    { label: '',        color: C.faint   },
    { label: 'Weak',    color: C.primary },
    { label: 'Fair',    color: C.amber   },
    { label: 'Good',    color: C.blue    },
    { label: 'Strong',  color: C.green   },
  ][score];
};

export default function LoginPage() {
  const navigate = useNavigate();

  const [mode, setMode]           = useState('login');
  const [role, setRole]           = useState('public');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({ name: '', email: '', phone: '', password: '', confirm: '' });

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const strength = getStrength(form.password);
  const activeRole = ROLES.find(r => r.id === role);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (mode === 'forgot') { setSubmitted(true); return; }

    setLoading(true);
    setError('');

    try {
      let result;

      if (mode === 'login') {
        result = await authAPI.login({
          email:    form.email,
          password: form.password,
        });
      } else {
        if (form.password !== form.confirm) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await authAPI.register({
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          password: form.password,
          role:     role,
        });
      }

      saveToken(result.token);
      navigate('/dashboard');

    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* shared styles */
  const primaryBtn = {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
    background: C.primary, color: '#fff',
    border: 'none', borderRadius: '11px',
    padding: '13px', fontSize: '16px', fontWeight: 700,
    cursor: 'pointer', fontFamily: font,
    transition: 'all 0.2s',
    boxShadow: `0 6px 24px rgba(204,34,0,0.3)`,
    marginTop: '4px',
  };

  const googleBtn = {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '10px',
    background: C.surface2, color: C.muted,
    border: `1px solid ${C.border}`, borderRadius: '11px',
    padding: '12px', fontSize: '15px', fontWeight: 600,
    cursor: 'pointer', fontFamily: font,
    transition: 'all 0.2s', marginTop: '10px',
  };

  const divider = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
      <div style={{ flex: 1, height: '1px', background: C.border }} />
      <span style={{ color: C.faint, fontSize: '13px' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: C.border }} />
    </div>
  );

  /* Role tabs */
  const RoleTabs = () => (
    <div style={{ marginBottom: '24px' }}>
      <label style={{ color: C.muted, fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
        {mode === 'login' ? 'Sign in as' : 'Registering as'}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '10px' }}>
        {ROLES.map(r => {
          const active = role === r.id;
          return (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              background: active ? `${r.color}15` : C.surface,
              border: `1.5px solid ${active ? r.color : C.border}`,
              borderRadius: '10px', padding: '11px 6px',
              cursor: 'pointer', fontFamily: font,
              transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '6px',
            }}>
              <r.icon size={19} color={active ? r.color : C.faint} strokeWidth={1.8} />
              <span style={{ color: active ? r.color : C.muted, fontSize: '12px', fontWeight: 600 }}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
      <div style={{
        padding: '9px 13px',
        background: `${activeRole.color}0D`,
        border: `1px solid ${activeRole.color}25`,
        borderRadius: '8px',
      }}>
        <span style={{ color: activeRole.color, fontSize: '13px', fontWeight: 500 }}>
          {activeRole.desc}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{
      background: C.bg, minHeight: '100vh',
      fontFamily: font, position: 'relative',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px',
    }}>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -150, left: '50%', transform: 'translateX(-50%)', width: 700, height: 600, background: 'radial-gradient(ellipse, rgba(204,34,0,0.12) 0%, transparent 68%)' }} />
        <div style={{ position: 'absolute', bottom: -100, right: '10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      {/* ── CENTERED CARD ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '480px',
        background: C.bgAlt,
        border: `1px solid ${C.border}`,
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
      }}>

        {/* Logo at top of card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '24px' }}>
            <div style={{ width: 44, height: 44, background: C.primary, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px rgba(204,34,0,0.4)` }}>
              <AlertTriangle size={22} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '19px', letterSpacing: '-0.02em' }}>CrisisWatch</div>
              <div style={{ color: C.primary, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>NIGERIA</div>
            </div>
          </Link>

          {/* Mode tabs — Login / Register */}
          <div style={{
            display: 'flex', background: C.surface,
            borderRadius: '12px', padding: '4px', gap: '4px',
            width: '100%',
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setSubmitted(false); }} style={{
                flex: 1, padding: '10px',
                borderRadius: '9px', border: 'none',
                background: mode === m ? C.primary : 'transparent',
                color: mode === m ? '#fff' : C.muted,
                fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', fontFamily: font,
                transition: 'all 0.2s',
                boxShadow: mode === m ? `0 4px 16px rgba(204,34,0,0.3)` : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        </div>

        {/* ════ FORGOT PASSWORD ════ */}
        {mode === 'forgot' && (
          submitted ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: `2px solid rgba(16,185,129,0.35)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color={C.green} />
              </div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '10px' }}>Check your email</h3>
              <p style={{ color: C.muted, fontSize: '15px', lineHeight: 1.75, marginBottom: '28px' }}>
                We sent a reset link to <strong style={{ color: C.text }}>{form.email || 'your email'}</strong>. Click it to set a new password.
              </p>
              <button style={primaryBtn} onClick={() => { setMode('login'); setSubmitted(false); }}>
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '14px', fontFamily: font, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '24px', padding: 0 }}>
                ← Back
              </button>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '24px', marginBottom: '8px', letterSpacing: '-0.02em' }}>Reset your password</h3>
              <p style={{ color: C.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>Enter your email and we'll send you a reset link.</p>
              <InputField label="Email address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} />
              {error && (
                <div style={{ background: 'rgba(204,34,0,0.12)', border: '1px solid rgba(204,34,0,0.3)', borderRadius: '9px', padding: '10px 14px', marginBottom: '14px', color: '#FF8A80', fontSize: '13px', fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}
              <button style={primaryBtn}
                onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                onMouseLeave={e => e.currentTarget.style.background = C.primary}
                onClick={handleSubmit}>
                {/* Send Reset Link <ArrowRight size={16} /> */}
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </>
          )
        )}

        {/* ════ LOGIN ════ */}
        {mode === 'login' && (
          <>
            <RoleTabs />
            <InputField label="Email address" type="email"    placeholder="you@example.com"      icon={Mail} value={form.email}    onChange={set('email')} />
            <InputField label="Password"      type="password" placeholder="Enter your password"   icon={Lock} value={form.password} onChange={set('password')} showToggle showPass={showPass} onToggle={() => setShowPass(v => !v)} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: C.primary, width: 15, height: 15 }} />
                <span style={{ color: C.muted, fontSize: '14px' }}>Remember me</span>
              </label>
              <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                Forgot password?
              </button>
            </div>

            <button style={primaryBtn}
              onMouseEnter={e => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)'; }}
              onClick={handleSubmit}>
              Sign In <ArrowRight size={16} />
            </button>

            {divider}

            <button style={googleBtn}
              onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.muted; }}>
              <GoogleIcon /> Continue with Google
            </button>

            <p style={{ textAlign: 'center', color: C.muted, fontSize: '14px', marginTop: '20px' }}>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                Create one free
              </button>
            </p>
          </>
        )}

        {/* ════ REGISTER ════ */}
        {mode === 'register' && (
          <>
            <RoleTabs />
            <InputField label="Full name"       placeholder="e.g. Dare Praise Moleri"    icon={User}  value={form.name}     onChange={set('name')}     />
            <InputField label="Email address"   type="email" placeholder="you@example.com" icon={Mail}  value={form.email}    onChange={set('email')}    />
            <InputField label="Phone number"    placeholder="+234 800 000 0000"           icon={Phone} value={form.phone}    onChange={set('phone')}    />
            <InputField label="Password"        type="password" placeholder="Create a strong password" icon={Lock}  value={form.password} onChange={set('password')} showToggle showPass={showPass} onToggle={() => setShowPass(v => !v)} />

            {/* Password strength bar */}
            {form.password.length > 0 && (
              <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '4px', borderRadius: '4px',
                      background: i <= (getStrength(form.password).score || 0) ? strength.color : C.surface2,
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '12px', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}

            <InputField label="Confirm password" type="password" placeholder="Repeat your password" icon={Lock} value={form.confirm} onChange={set('confirm')} showToggle showPass={showConf} onToggle={() => setShowConf(v => !v)} />

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '20px', marginTop: '4px' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: C.primary, width: 15, height: 15, marginTop: '3px', flexShrink: 0 }} />
              <span style={{ color: C.muted, fontSize: '14px', lineHeight: 1.6 }}>
                I agree to the{' '}
                <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: C.primary, fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>

            <button
              style={{ ...primaryBtn, opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
              onMouseEnter={e => { if (agreed) { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)'; }}
              onClick={() => agreed && handleSubmit()}>
              Create Account <ArrowRight size={16} />
            </button>

            {divider}

            <button style={googleBtn}
              onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface2; e.currentTarget.style.color = C.muted; }}>
              <GoogleIcon /> Sign up with Google
            </button>

            <p style={{ textAlign: 'center', color: C.muted, fontSize: '14px', marginTop: '20px' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}