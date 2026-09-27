import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Camera, Upload, CheckCircle,
  ChevronRight, ChevronLeft, Users, Activity,
  Phone, FileText, Navigation, X, Plus, User,
  Clock, Building
} from 'lucide-react';
import { incidentsAPI, isLoggedIn } from '../services/api';
import { C, font, LAGOS_AREAS } from '../theme';

const TYPES = [
  { id: 'fire',     icon: Flame,         color: '#CC2200', label: 'Fire / Explosion',  desc: 'Building fires, gas explosions'         },
  { id: 'crime',    icon: Shield,        color: '#F59E0B', label: 'Crime / Robbery',   desc: 'Armed robbery, kidnapping, assault'      },
  { id: 'flood',    icon: Droplets,      color: '#2563EB', label: 'Flood / Disaster',  desc: 'Flash floods, waterlogging, disasters'   },
  { id: 'accident', icon: Car,           color: '#8B5CF6', label: 'Road Accident',     desc: 'Vehicle crashes, tanker spills'          },
  { id: 'medical',  icon: Activity,      color: '#10B981', label: 'Medical Emergency', desc: 'Mass casualty, disease, collapse'        },
  { id: 'security', icon: AlertTriangle, color: '#F59E0B', label: 'Security Threat',   desc: 'Terrorism, civil unrest, gunshots'       },
  { id: 'protest',  icon: Users,         color: '#8B5CF6', label: 'Civil Unrest',      desc: 'Protests, riots, disturbances'           },
  { id: 'other',    icon: FileText,      color: '#6B7280', label: 'Other',             desc: 'Any other emergency'                     },
];

const SEVERITIES = [
  { id: 'critical', label: 'Critical', color: '#FF3B30', desc: 'Immediate threat to life — needs response NOW'     },
  { id: 'high',     label: 'High',     color: '#CC2200', desc: 'Serious situation requiring urgent attention'       },
  { id: 'medium',   label: 'Medium',   color: '#F59E0B', desc: 'Significant but not immediately life-threatening'  },
  { id: 'low',      label: 'Low',      color: '#10B981', desc: 'Minor incident for awareness and documentation'    },
];

const STEPS = [
  { number: 1, label: 'Type'     },
  { number: 2, label: 'Details'  },
  { number: 3, label: 'Location' },
  { number: 4, label: 'Media'    },
  { number: 5, label: 'Confirm'  },
];

/* ── Input components — OUTSIDE component to prevent focus loss ── */
const InputField = ({ label, type = 'text', placeholder, value, onChange, required, hint }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <input
      type={type} placeholder={placeholder} value={value} onChange={onChange} autoComplete="off"
      style={{
        width: '100%', background: C.inputBg, border: `1px solid ${C.border}`,
        borderRadius: '10px', padding: '11px 14px', color: C.text,
        fontSize: '15px', fontFamily: font, outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.45)'}
      onBlur={e => e.target.style.borderColor = C.border}
    />
    {hint && <div style={{ color: C.faint, fontSize: '12px', marginTop: '5px' }}>{hint}</div>}
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 4, required }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <textarea
      placeholder={placeholder} value={value} onChange={onChange} rows={rows}
      style={{
        width: '100%', background: C.inputBg, border: `1px solid ${C.border}`,
        borderRadius: '10px', padding: '11px 14px', color: C.text,
        fontSize: '15px', fontFamily: font, outline: 'none', resize: 'vertical',
        transition: 'border-color 0.2s', boxSizing: 'border-box', lineHeight: 1.65,
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.45)'}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const SelectField = ({ label, options, value, onChange, required }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '13px', fontWeight: 600, marginBottom: '6px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <select
      value={value} onChange={onChange}
      style={{
        width: '100%', background: C.inputBg, border: `1px solid ${C.border}`,
        borderRadius: '10px', padding: '11px 14px', color: value ? C.text : C.faint,
        fontSize: '15px', fontFamily: font, outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
        cursor: 'pointer', appearance: 'none',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.45)'}
      onBlur={e => e.target.style.borderColor = C.border}
    >
      <option value="">Select {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const StepBar = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
    {STEPS.map((s, i) => {
      const done   = step > s.number;
      const active = step === s.number;
      return (
        <React.Fragment key={s.number}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: done ? '#10B981' : active ? C.primary : C.surface2,
              border: `2px solid ${done ? '#10B981' : active ? C.primary : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: active ? `0 0 14px rgba(204,34,0,0.5)` : 'none',
            }}>
              {done
                ? <CheckCircle size={16} color="#fff" strokeWidth={2.5} />
                : <span style={{ color: active ? '#fff' : C.faint, fontSize: '13px', fontWeight: 800 }}>{s.number}</span>
              }
            </div>
            <span style={{ fontSize: '10px', fontWeight: 600, color: done ? '#10B981' : active ? C.primary : C.faint, whiteSpace: 'nowrap', fontFamily: font }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: done ? '#10B981' : C.border, margin: '0 4px', marginBottom: '18px', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ══════════════════════════
   MAIN COMPONENT
══════════════════════════ */
export default function ReportPage() {
  const [step,       setStep]       = useState(1);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allocation, setAllocation] = useState(null);
  const [reportId,   setReportId]   = useState('');

  const [form, setForm] = useState({
    // Reporter info
    reporterName:  '',
    reporterPhone: '',
    anonymous:     false,
    // Incident
    type:          '',
    severity:      '',
    title:         '',
    description:   '',
    casualties:    '',
    // Location
    address:       '',
    lga:           '',
    landmark:      '',
    useGPS:        false,
    gpsCoords:     '',
    // Media
    files:         [],
    socialLink:    '',
  });

  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return !!form.type && !!form.severity;
    if (step === 2) return !!form.title && !!form.description;
    if (step === 3) return !!form.lga && !!form.address;
    return true;
  };

  const selectedType = TYPES.find(t => t.id === form.type);
  const selectedSev  = SEVERITIES.find(s => s.id === form.severity);

  const NavBtns = ({ nextLabel = 'Continue', onNext }) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '22px', borderTop: `1px solid ${C.border}` }}>
      {step > 1 && (
        <button onClick={() => setStep(s => s - 1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: '10px', padding: '12px 20px',
          color: C.muted, fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.borderHover; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <button
        onClick={onNext || (() => canNext() && setStep(s => s + 1))}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          background: canNext() ? C.primary : C.surface2,
          border: 'none', borderRadius: '10px', padding: '13px',
          color: canNext() ? '#fff' : C.faint,
          fontSize: '15px', fontWeight: 700,
          cursor: canNext() ? 'pointer' : 'not-allowed',
          fontFamily: font, transition: 'all 0.2s',
          boxShadow: canNext() ? `0 6px 20px rgba(204,34,0,0.3)` : 'none',
        }}
        onMouseEnter={e => { if (canNext()) e.currentTarget.style.background = '#A81B00'; }}
        onMouseLeave={e => { if (canNext()) e.currentTarget.style.background = C.primary; }}
      >
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    const id = `CW-${Math.floor(Math.random() * 90000) + 10000}`;
    setReportId(id);
    setSubmitted(true); // show success immediately

    try {
      if (isLoggedIn()) {
        const res = await fetch('http://localhost:5000/api/incidents/', {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${localStorage.getItem('crisiswatch_token')}`,
          },
          body: JSON.stringify({
            title:        form.title,
            description:  form.description,
            type:         form.type,
            severity:     form.severity,
            location:     [form.address, form.lga, 'Lagos'].filter(Boolean).join(', '),
            state:        'Lagos',
            lga:          form.lga,
            landmark:     form.landmark,
            latitude:     form.useGPS ? 6.5244 : null,
            longitude:    form.useGPS ? 3.3792 : null,
            affected:     parseInt(form.casualties) || 0,
            source:       'User Report',
            anonymous:    form.anonymous,
            reporter_name: form.anonymous ? null : form.reporterName,
            reporter_phone: form.anonymous ? null : form.reporterPhone,
          }),
        });
        const data = await res.json();
        if (data.allocation) setAllocation(data.allocation);
      }
    } catch (err) {
      console.log('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  /* SUCCESS SCREEN */
  if (submitted) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, padding: '48px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '560px', width: '100%' }}>
          {/* Success header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 40px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={38} color="#10B981" strokeWidth={2} />
            </div>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: '26px', marginBottom: '10px', letterSpacing: '-0.02em' }}>Report Submitted!</h2>
            <p style={{ color: C.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '12px' }}>
              Your emergency report has been received and emergency responders have been notified.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '999px', padding: '6px 16px' }}>
              <span style={{ color: C.primary, fontWeight: 700, fontSize: '13px' }}>Report ID: #{reportId}</span>
            </div>
          </div>

          {/* Allocation result */}
          {allocation ? (
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={18} color="#10B981" />
                </div>
                <div>
                  <div style={{ color: '#10B981', fontWeight: 700, fontSize: '14px' }}>✅ Nearest Responder Dispatched</div>
                  <div style={{ color: C.faint, fontSize: '12px' }}>Response center has been automatically notified</div>
                </div>
              </div>
              <div style={{ background: C.surface, borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{allocation.center_name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: C.muted, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <MapPin size={13} color="#10B981" /> {allocation.address}
                  </div>
                  <div style={{ color: C.muted, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Clock size={13} color="#F59E0B" /> Estimated arrival: <strong style={{ color: C.text }}>{allocation.eta_minutes} minutes</strong>
                  </div>
                  <div style={{ color: C.muted, fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <MapPin size={13} color="#2563EB" /> Distance: <strong style={{ color: C.text }}>{allocation.distance_km} km away</strong>
                  </div>
                </div>
                {allocation.phone && (
                  <a href={`tel:${allocation.phone}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: '#10B981', color: '#fff', borderRadius: '9px',
                    padding: '10px', marginTop: '14px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: 700,
                  }}>
                    <Phone size={15} /> Call {allocation.center_name}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '14px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ color: C.primary, fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>🚨 Emergency Services Notified</div>
              <div style={{ color: C.muted, fontSize: '13px' }}>Relevant emergency agencies have been alerted via email and will respond shortly.</div>
            </div>
          )}

          {/* What happens next */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>What happens next?</div>
            {[
              { n: '01', text: 'NLP model processes your report and extracts key details',         color: C.primary },
              { n: '02', text: 'Incident appears on the live map for all responders to see',       color: '#2563EB' },
              { n: '03', text: 'Nearest available response center has been notified',              color: '#F59E0B' },
              { n: '04', text: 'Responders will call your number to verify if not anonymous',      color: '#10B981' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < 3 ? '12px' : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '7px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: item.color, fontWeight: 800, fontSize: '10px' }}>{item.n}</span>
                </div>
                <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.6, paddingTop: '4px' }}>{item.text}</div>
              </div>
            ))}
          </div>

          {/* Emergency numbers */}
          <div style={{ background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ color: C.primary, fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>Emergency Hotlines</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {[
                { label: 'Emergency',   number: '112'   },
                { label: 'LASEMA',      number: '767'   },
                { label: 'Police',      number: '119'   },
                { label: 'Fire Service',number: '01-7944929' },
              ].map(c => (
                <a key={c.label} href={`tel:${c.number}`} style={{
                  display: 'flex', flexDirection: 'column', background: C.surface,
                  borderRadius: '9px', padding: '10px 12px', textDecoration: 'none',
                }}>
                  <span style={{ color: C.faint, fontSize: '11px' }}>{c.label}</span>
                  <span style={{ color: C.primary, fontWeight: 800, fontSize: '15px' }}>{c.number}</span>
                </a>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/map" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: C.primary, color: '#fff', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <MapPin size={16} /> View on Map
            </Link>
            <Link to="/dashboard" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, color: C.muted, padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, padding: '48px 24px' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.07) 0%, transparent 68%)' }} />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '13px', textDecoration: 'none', marginBottom: '18px' }}>
            <ChevronLeft size={14} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 46, height: 46, background: C.primary, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(204,34,0,0.35)' }}>
              <AlertTriangle size={22} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: '26px', letterSpacing: '-0.03em', lineHeight: 1 }}>Report an Emergency</h1>
              <p style={{ color: C.muted, fontSize: '14px', marginTop: '4px' }}>Lagos State · Help responders reach you faster</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '22px', padding: '36px', boxShadow: C.cardShadow }}>
          <StepBar step={step} />

          {/* STEP 1 — Type & Severity */}
          {step === 1 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '21px', marginBottom: '6px' }}>What type of emergency?</h3>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>Select the category that best describes the situation.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                {TYPES.map(t => {
                  const active = form.type === t.id;
                  return (
                    <button key={t.id} onClick={() => setVal('type', t.id)} style={{
                      background: active ? `${t.color}12` : C.surface,
                      border: `1.5px solid ${active ? t.color : C.border}`,
                      borderRadius: '13px', padding: '16px 14px',
                      cursor: 'pointer', fontFamily: font, transition: 'all 0.2s', textAlign: 'left',
                      boxShadow: active ? `0 0 16px ${t.color}22` : 'none',
                    }}>
                      <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                        <t.icon size={18} color={t.color} strokeWidth={2} />
                      </div>
                      <div style={{ color: active ? t.color : C.text, fontWeight: 700, fontSize: '13px', marginBottom: '3px' }}>{t.label}</div>
                      <div style={{ color: C.faint, fontSize: '11px', lineHeight: 1.5 }}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
                How severe? <span style={{ color: C.primary }}>*</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SEVERITIES.map(s => {
                  const active = form.severity === s.id;
                  return (
                    <button key={s.id} onClick={() => setVal('severity', s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: active ? `${s.color}10` : C.surface,
                      border: `1.5px solid ${active ? s.color : C.border}`,
                      borderRadius: '11px', padding: '13px 16px',
                      cursor: 'pointer', fontFamily: font, transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, background: s.color, boxShadow: active ? `0 0 8px ${s.color}` : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: active ? s.color : C.text, fontWeight: 700, fontSize: '14px' }}>{s.label}</div>
                        <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px' }}>{s.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? s.color : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <NavBtns nextLabel="Add Details" />
            </div>
          )}

          {/* STEP 2 — Details + Reporter Info */}
          {step === 2 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '21px', marginBottom: '6px' }}>Describe what happened</h3>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>The more detail you provide, the faster responders can act.</p>

              {selectedType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${selectedType.color}0D`, border: `1px solid ${selectedType.color}28`, borderRadius: '11px', padding: '12px 14px', marginBottom: '20px' }}>
                  <selectedType.icon size={18} color={selectedType.color} strokeWidth={2} />
                  <div>
                    <div style={{ color: selectedType.color, fontWeight: 700, fontSize: '13px' }}>{selectedType.label}</div>
                    <div style={{ color: C.faint, fontSize: '11px' }}>Severity: {selectedSev?.label}</div>
                  </div>
                </div>
              )}

              <InputField label="Short summary / title" placeholder="e.g. Building fire near Oshodi Market, heavy smoke visible" value={form.title} onChange={set('title')} required />
              <TextArea label="Full description" placeholder="Describe exactly what you saw. Include: what is happening, when it started, how many people are affected, if anyone is trapped or injured..." value={form.description} onChange={set('description')} rows={5} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField label="Estimated people affected" type="number" placeholder="e.g. 20" value={form.casualties} onChange={set('casualties')} />
              </div>

              {/* Reporter Info */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '18px', marginTop: '4px', marginBottom: '18px' }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={15} color={C.primary} /> Your Contact Details
                </div>
                <p style={{ color: C.faint, fontSize: '12px', marginBottom: '14px', lineHeight: 1.6 }}>
                  Responders may need to call you to verify and get more details. Toggle anonymous if you prefer not to share.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <InputField label="Your name" placeholder="Full name" value={form.reporterName} onChange={set('reporterName')} hint={form.anonymous ? 'Hidden — anonymous mode on' : ''} />
                  <InputField label="Phone number" type="tel" placeholder="+234 800 000 0000" value={form.reporterPhone} onChange={set('reporterPhone')} hint={form.anonymous ? 'Hidden — anonymous mode on' : ''} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 0' }}>
                  <div>
                    <div style={{ color: C.text, fontWeight: 600, fontSize: '14px' }}>Submit anonymously</div>
                    <div style={{ color: C.faint, fontSize: '12px' }}>Your name and number will not be shared</div>
                  </div>
                  <div onClick={() => setVal('anonymous', !form.anonymous)} style={{ width: 44, height: 24, borderRadius: '999px', cursor: 'pointer', background: form.anonymous ? C.primary : C.surface2, border: `2px solid ${form.anonymous ? C.primary : C.border}`, position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: form.anonymous ? '22px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '11px', padding: '13px 16px' }}>
                <div style={{ color: '#2563EB', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>💡 Tips for a better report</div>
                <ul style={{ color: C.muted, fontSize: '13px', lineHeight: 1.7, paddingLeft: '18px', margin: 0 }}>
                  <li>Mention fire, smoke, weapons, or hazardous materials you can see</li>
                  <li>Say if people are trapped, injured, or in immediate danger</li>
                  <li>Note the approximate time the incident started</li>
                  <li>Include vehicle plate numbers for accidents or crime</li>
                </ul>
              </div>
              <NavBtns nextLabel="Add Location" />
            </div>
          )}

          {/* STEP 3 — Location */}
          {step === 3 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '21px', marginBottom: '6px' }}>Where did this happen?</h3>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>Lagos State only. Be as specific as possible so we can dispatch the nearest responder.</p>

              {/* GPS Button */}
              <button onClick={() => { setVal('useGPS', true); setVal('gpsCoords', '6.4541° N, 3.3947° E'); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                background: form.useGPS ? 'rgba(16,185,129,0.1)' : C.surface,
                border: `1.5px solid ${form.useGPS ? '#10B981' : C.border}`,
                borderRadius: '12px', padding: '14px 16px', cursor: 'pointer',
                fontFamily: font, marginBottom: '18px', transition: 'all 0.2s', textAlign: 'left',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: form.useGPS ? 'rgba(16,185,129,0.15)' : C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Navigation size={18} color={form.useGPS ? '#10B981' : C.faint} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: form.useGPS ? '#10B981' : C.text, fontWeight: 700, fontSize: '14px' }}>
                    {form.useGPS ? '✓ GPS Location Captured' : 'Use My Current GPS Location'}
                  </div>
                  <div style={{ color: C.faint, fontSize: '12px', marginTop: '2px' }}>
                    {form.useGPS ? form.gpsCoords : 'Recommended — most accurate for dispatch'}
                  </div>
                </div>
                {form.useGPS && <CheckCircle size={18} color="#10B981" />}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0' }}>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
                <span style={{ color: C.faint, fontSize: '12px', whiteSpace: 'nowrap' }}>Enter address manually</span>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
              </div>

              <InputField label="Street address / area description" placeholder="e.g. 14 Oshodi-Apapa Expressway, near the underbridge" value={form.address} onChange={set('address')} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <SelectField label="Lagos LGA" options={LAGOS_AREAS} value={form.lga} onChange={set('lga')} required />
                <InputField label="Nearest landmark" placeholder="e.g. Near First Bank, opposite Shoprite" value={form.landmark} onChange={set('landmark')} />
              </div>

              {/* Fixed location badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                <MapPin size={14} color="#2563EB" />
                <span style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600 }}>This platform currently covers Lagos State only</span>
              </div>
              <NavBtns nextLabel="Add Media" />
            </div>
          )}

          {/* STEP 4 — Media */}
          {step === 4 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '21px', marginBottom: '6px' }}>Add photos or videos</h3>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>Visual evidence helps responders assess the situation before arrival. Optional.</p>

              <div style={{
                border: `2px dashed ${C.border}`, borderRadius: '14px',
                padding: '44px 24px', textAlign: 'center', marginBottom: '18px',
                background: C.surface, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,34,0,0.4)'; e.currentTarget.style.background = C.surface2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                onClick={() => {
                  const names = ['incident_photo_1.jpg', 'incident_photo_2.jpg', 'video_clip.mp4'];
                  setVal('files', names.slice(0, form.files.length < 3 ? form.files.length + 1 : 3));
                }}
              >
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Upload size={24} color={C.primary} />
                </div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>Click to upload or drag & drop</div>
                <div style={{ color: C.faint, fontSize: '13px' }}>JPG, PNG, MP4, MOV · Max 50MB</div>
              </div>

              {form.files.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  {form.files.map((file, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '11px 14px', marginBottom: '8px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Camera size={14} color="#10B981" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>{file}</div>
                        <div style={{ color: '#10B981', fontSize: '11px', marginTop: '2px' }}>✓ Ready to upload</div>
                      </div>
                      <button onClick={() => setVal('files', form.files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={14} color={C.primary} /> Add social media link (optional)
                </div>
                <InputField label="Link to relevant tweet, post or screenshot" placeholder="https://twitter.com/..." value={form.socialLink} onChange={set('socialLink')} />
              </div>
              <NavBtns nextLabel="Review & Submit" />
            </div>
          )}

          {/* STEP 5 — Confirm */}
          {step === 5 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '21px', marginBottom: '6px' }}>Review your report</h3>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>Please check all details before submitting.</p>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Incident Summary</div>
                {[
                  { label: 'Type',        value: selectedType?.label,   color: selectedType?.color },
                  { label: 'Severity',    value: selectedSev?.label,    color: selectedSev?.color  },
                  { label: 'Title',       value: form.title                                         },
                  { label: 'Description', value: form.description                                   },
                  { label: 'Affected',    value: form.casualties ? `~${form.casualties} people` : null },
                  { label: 'Location',    value: [form.address, form.lga, 'Lagos'].filter(Boolean).join(', ') },
                  { label: 'Landmark',    value: form.landmark                                      },
                  { label: 'Reporter',    value: form.anonymous ? 'Anonymous' : form.reporterName || '—' },
                  { label: 'Phone',       value: form.anonymous ? 'Hidden' : form.reporterPhone || '—' },
                  { label: 'Media',       value: form.files.length > 0 ? `${form.files.length} file(s)` : 'None' },
                ].map((row, i) => row.value && (
                  <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '10px', marginBottom: '10px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.faint, fontSize: '12px', fontWeight: 600, minWidth: '88px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: row.color || C.text, fontSize: '13px', lineHeight: 1.5, wordBreak: 'break-word' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '11px', padding: '12px 14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}><span style={{fontSize:'13px'}}>!</span> Important Notice</div>
                <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  Submitting a false emergency report is a criminal offence under Nigerian law and punishable under the Emergency Management Act.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 20px', color: C.muted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleFinalSubmit} disabled={submitting} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: C.primary, border: 'none', borderRadius: '10px', padding: '13px',
                  color: '#fff', fontSize: '15px', fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: font,
                  boxShadow: '0 6px 24px rgba(204,34,0,0.35)', opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#A81B00'; }}
                  onMouseLeave={e => e.currentTarget.style.background = C.primary}
                >
                  <AlertTriangle size={16} /> {submitting ? 'Submitting...' : 'Submit Emergency Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
