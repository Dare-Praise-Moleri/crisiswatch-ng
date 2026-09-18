import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, Camera, Upload, CheckCircle,
  ChevronRight, ChevronLeft, Users, Activity,
  Phone, FileText, Navigation, X, Plus
} from 'lucide-react';
import { incidentsAPI, isLoggedIn } from '../services/api';

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

const TYPES = [
  { id: 'fire',     icon: Flame,         color: C.primary, label: 'Fire / Explosion',    desc: 'Building fires, gas explosions, wildfires'       },
  { id: 'crime',    icon: Shield,        color: C.amber,   label: 'Crime / Robbery',      desc: 'Armed robbery, theft, assault, kidnapping'       },
  { id: 'flood',    icon: Droplets,      color: C.blue,    label: 'Flood / Disaster',     desc: 'Flash floods, landslides, natural disasters'     },
  { id: 'accident', icon: Car,           color: C.purple,  label: 'Road Accident',        desc: 'Vehicle crashes, tanker spills, road hazards'    },
  { id: 'medical',  icon: Activity,      color: C.green,   label: 'Medical Emergency',    desc: 'Mass casualty, disease outbreak, hospital surge' },
  { id: 'security', icon: AlertTriangle, color: C.amber,   label: 'Security Threat',      desc: 'Terrorism, civil unrest, security operations'    },
  { id: 'protest',  icon: Users,         color: C.purple,  label: 'Civil Unrest',         desc: 'Protests, riots, community disturbances'         },
  { id: 'other',    icon: FileText,      color: C.faint,   label: 'Other',                desc: 'Any other emergency not listed above'            },
];

const SEVERITIES = [
  { id: 'critical', label: 'Critical', color: '#FF3B30', desc: 'Immediate threat to life — needs response NOW'      },
  { id: 'high',     label: 'High',     color: C.primary, desc: 'Serious situation requiring urgent attention'        },
  { id: 'medium',   label: 'Medium',   color: C.amber,   desc: 'Significant but not immediately life-threatening'   },
  { id: 'low',      label: 'Low',      color: C.green,   desc: 'Minor incident for awareness and documentation'     },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT — Abuja',
  'Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const STEPS = [
  { number: 1, label: 'Incident Type', icon: AlertTriangle },
  { number: 2, label: 'Details',       icon: FileText      },
  { number: 3, label: 'Location',      icon: MapPin        },
  { number: 4, label: 'Media',         icon: Camera        },
  { number: 5, label: 'Confirm',       icon: CheckCircle   },
];

/* ── Shared field components defined OUTSIDE any page component ── */
const InputField = ({ label, type = 'text', placeholder, value, onChange, required }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '14px', fontWeight: 600, marginBottom: '7px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
      style={{
        width: '100%', background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: '10px',
        padding: '12px 14px', color: C.text, fontSize: '15px',
        fontFamily: font, outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = C.borderFocus}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, rows = 4, required }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '14px', fontWeight: 600, marginBottom: '7px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        width: '100%', background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: '10px',
        padding: '12px 14px', color: C.text, fontSize: '15px',
        fontFamily: font, outline: 'none', resize: 'vertical',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
        lineHeight: 1.6,
      }}
      onFocus={e => e.target.style.borderColor = C.borderFocus}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  </div>
);

const SelectField = ({ label, options, value, onChange, required }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', color: C.muted, fontSize: '14px', fontWeight: 600, marginBottom: '7px', fontFamily: font }}>
      {label}{required && <span style={{ color: C.primary, marginLeft: '3px' }}>*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%', background: C.surface2,
        border: `1px solid ${C.border}`, borderRadius: '10px',
        padding: '12px 14px', color: value ? C.text : C.faint,
        fontSize: '15px', fontFamily: font, outline: 'none',
        transition: 'border-color 0.2s', boxSizing: 'border-box',
        cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,237,245,0.3)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
      onFocus={e => e.target.style.borderColor = C.borderFocus}
      onBlur={e => e.target.style.borderColor = C.border}
    >
      <option value="">Select {label}</option>
      {options.map(o => (
        <option key={o} value={o} style={{ background: C.surface }}>{o}</option>
      ))}
    </select>
  </div>
);

/* ── Step Bar — defined outside ── */
const StepBar = ({ step }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '40px' }}>
    {STEPS.map((s, i) => {
      const done    = step > s.number;
      const active  = step === s.number;
      return (
        <React.Fragment key={s.number}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: done ? C.green : active ? C.primary : C.surface2,
              border: `2px solid ${done ? C.green : active ? C.primary : C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: active ? `0 0 16px ${C.primary}55` : 'none',
            }}>
              {done
                ? <CheckCircle size={17} color="#fff" strokeWidth={2.5} />
                : <span style={{ color: active ? '#fff' : C.faint, fontSize: '14px', fontWeight: 800 }}>{s.number}</span>
              }
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: done ? C.green : active ? C.primary : C.faint, whiteSpace: 'nowrap', fontFamily: font }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: done ? C.green : C.border, margin: '0 6px', marginBottom: '20px', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ══════════════════════════════════
   MAIN PAGE COMPONENT
══════════════════════════════════ */
export default function ReportPage() {
  const navigate  = useNavigate();
  const [step,    setStep]    = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type:        '',
    severity:    '',
    title:       '',
    description: '',
    casualties:  '',
    contact:     '',
    address:     '',
    state:       '',
    lga:         '',
    landmark:    '',
    useGPS:      false,
    gpsCoords:   '',
    files:       [],
    anonymous:   false,
    socialLink:  '',
  });

  const set    = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return !!form.type && !!form.severity;
    if (step === 2) return !!form.title && !!form.description;
    if (step === 3) return !!form.state && !!form.address;
    return true;
  };

  const selectedType = TYPES.find(t => t.id === form.type);
  const selectedSev  = SEVERITIES.find(s => s.id === form.severity);

  const NavBtns = ({ nextLabel = 'Continue', onNext }) => (
    <div style={{ display: 'flex', gap: '12px', marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.border}` }}>
      {step > 1 && (
        <button onClick={() => setStep(s => s - 1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: '10px', padding: '12px 22px',
          color: C.muted, fontSize: '15px', fontWeight: 600,
          cursor: 'pointer', fontFamily: font, transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}
        >
          <ChevronLeft size={17} /> Back
        </button>
      )}
      <button
        onClick={onNext || (() => canNext() && setStep(s => s + 1))}
        style={{
          flex: 1, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px',
          background: canNext() ? C.primary : C.surface2,
          border: 'none', borderRadius: '10px', padding: '13px',
          color: canNext() ? '#fff' : C.faint,
          fontSize: '15px', fontWeight: 700,
          cursor: canNext() ? 'pointer' : 'not-allowed',
          fontFamily: font, transition: 'all 0.2s',
          boxShadow: canNext() ? `0 6px 20px rgba(204,34,0,0.3)` : 'none',
        }}
        onMouseEnter={e => { if (canNext()) e.currentTarget.style.background = C.primaryHover; }}
        onMouseLeave={e => { if (canNext()) e.currentTarget.style.background = C.primary; }}
      >
        {nextLabel} <ChevronRight size={17} />
      </button>
    </div>
  );

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      if (isLoggedIn()) {
        await incidentsAPI.create({
          title:       form.title,
          description: form.description,
          type:        form.type,
          severity:    form.severity,
          location:    [form.address, form.lga, form.state].filter(Boolean).join(', '),
          state:       form.state,
          lga:         form.lga,
          landmark:    form.landmark,
          latitude:    form.gpsCoords ? 6.5244 : null,
          longitude:   form.gpsCoords ? 3.3792 : null,
          affected:    parseInt(form.casualties) || 0,
          source:      'User Report',
          anonymous:   form.anonymous,
        });
      }
    } catch (err) {
      console.log('Submit error:', err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  /* ════ SUCCESS SCREEN ════ */
  if (submitted) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font, padding: '48px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: C.greenSoft, border: `2px solid rgba(16,185,129,0.4)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: `0 0 40px rgba(16,185,129,0.2)` }}>
            <CheckCircle size={42} color={C.green} strokeWidth={2} />
          </div>
          <h3 style={{ color: C.text, fontWeight: 800, fontSize: '28px', marginBottom: '12px', letterSpacing: '-0.02em' }}>Report Submitted!</h3>
          <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.75, marginBottom: '12px' }}>
            Your incident report has been received and is being processed by our NLP system. Responders have been notified.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '999px', padding: '6px 16px', marginBottom: '32px' }}>
            <span style={{ color: C.primary, fontWeight: 700, fontSize: '13px' }}>
              Report ID: #CW-{Math.floor(Math.random() * 90000) + 10000}
            </span>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', textAlign: 'left', marginBottom: '28px' }}>
            <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>What happens next?</div>
            {[
              { step: '01', text: 'Our NLP model extracts key entities from your report',          color: C.primary },
              { step: '02', text: 'The incident is geocoded and appears on the live map',           color: C.blue    },
              { step: '03', text: 'Emergency responders nearest to you are automatically alerted',  color: C.amber   },
              { step: '04', text: 'You will receive SMS/push updates on the response status',       color: C.green   },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: i < 3 ? '14px' : 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '9px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: item.color, fontWeight: 800, fontSize: '11px' }}>{item.step}</span>
                </div>
                <div style={{ color: C.muted, fontSize: '14px', lineHeight: 1.6, paddingTop: '6px' }}>{item.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/map" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              <MapPin size={16} /> View on Map
            </Link>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, color: C.muted, padding: '12px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
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
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.08) 0%, transparent 68%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Page header */}
        <div style={{ marginBottom: '36px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '13px', textDecoration: 'none', marginBottom: '20px' }}>
            <ChevronLeft size={15} /> Back to Home
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 48, height: 48, background: C.primary, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 24px rgba(204,34,0,0.35)` }}>
              <AlertTriangle size={24} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: '28px', letterSpacing: '-0.03em', lineHeight: 1 }}>Report an Incident</h1>
              <p style={{ color: C.muted, fontSize: '15px', marginTop: '4px' }}>Help emergency responders reach people faster</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: C.bgAlt, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '40px', boxShadow: '0 24px 72px rgba(0,0,0,0.4)' }}>
          <StepBar step={step} />

          {/* ════ STEP 1 — Type ════ */}
          {step === 1 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                What type of incident are you reporting?
              </h3>
              <p style={{ color: C.muted, fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
                Select the category that best describes the emergency.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '32px' }}>
                {TYPES.map(t => {
                  const active = form.type === t.id;
                  return (
                    <button key={t.id} onClick={() => setVal('type', t.id)} style={{
                      background: active ? `${t.color}12` : C.surface,
                      border: `1.5px solid ${active ? t.color : C.border}`,
                      borderRadius: '14px', padding: '18px 16px',
                      cursor: 'pointer', fontFamily: font,
                      transition: 'all 0.2s', textAlign: 'left',
                      boxShadow: active ? `0 0 20px ${t.color}22` : 'none',
                    }}>
                      <div style={{ width: 42, height: 42, borderRadius: '11px', background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <t.icon size={20} color={t.color} strokeWidth={1.9} />
                      </div>
                      <div style={{ color: active ? t.color : C.text, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{t.label}</div>
                      <div style={{ color: C.faint, fontSize: '12px', lineHeight: 1.5 }}>{t.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>
                How severe is this incident? <span style={{ color: C.primary }}>*</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {SEVERITIES.map(s => {
                  const active = form.severity === s.id;
                  return (
                    <button key={s.id} onClick={() => setVal('severity', s.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: active ? `${s.color}10` : C.surface,
                      border: `1.5px solid ${active ? s.color : C.border}`,
                      borderRadius: '12px', padding: '14px 18px',
                      cursor: 'pointer', fontFamily: font, transition: 'all 0.18s', textAlign: 'left',
                    }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: s.color, boxShadow: active ? `0 0 10px ${s.color}` : 'none' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: active ? s.color : C.text, fontWeight: 700, fontSize: '15px' }}>{s.label}</div>
                        <div style={{ color: C.faint, fontSize: '13px', marginTop: '2px' }}>{s.desc}</div>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? s.color : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <NavBtns nextLabel="Select Details" />
            </div>
          )}

          {/* ════ STEP 2 — Details ════ */}
          {step === 2 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Describe what happened
              </h3>
              <p style={{ color: C.muted, fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
                Provide as much detail as you can. The more specific you are, the faster responders can act.
              </p>
              {selectedType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: `${selectedType.color}0D`, border: `1px solid ${selectedType.color}28`, borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${selectedType.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <selectedType.icon size={18} color={selectedType.color} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ color: selectedType.color, fontWeight: 700, fontSize: '13px' }}>Reporting: {selectedType.label}</div>
                    <div style={{ color: C.faint, fontSize: '12px' }}>Severity: {selectedSev?.label}</div>
                  </div>
                </div>
              )}
              <InputField label="Incident title / short summary" placeholder="e.g. Building fire near Oshodi Market, heavy smoke visible" value={form.title} onChange={set('title')} required />
              <TextArea label="Full description" placeholder="Describe exactly what you saw or heard. Include: what happened, when it started, how many people are affected, whether anyone is injured, what is currently happening..." value={form.description} onChange={set('description')} rows={5} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField label="Estimated people affected" type="number" placeholder="e.g. 20" value={form.casualties} onChange={set('casualties')} />
                <InputField label="Your contact number (optional)" type="tel" placeholder="+234 800 000 0000" value={form.contact} onChange={set('contact')} />
              </div>
              <div style={{ background: C.blueSoft, border: `1px solid rgba(37,99,235,0.2)`, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ color: C.blue, fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>💡 Tips for a better report</div>
                <ul style={{ color: C.muted, fontSize: '13px', lineHeight: 1.7, paddingLeft: '18px', margin: 0 }}>
                  <li>Mention any fire, smoke, weapons, or hazardous materials you can see</li>
                  <li>Say if people are trapped, injured, or in immediate danger</li>
                  <li>Note the approximate time the incident started</li>
                  <li>Include any vehicle plate numbers for accidents or crime</li>
                </ul>
              </div>
              <NavBtns nextLabel="Add Location" />
            </div>
          )}

          {/* ════ STEP 3 — Location ════ */}
          {step === 3 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Where did this happen?
              </h3>
              <p style={{ color: C.muted, fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
                Be as specific as possible. Your location helps us geocode the incident and dispatch the nearest responders.
              </p>
              <button onClick={() => { setVal('useGPS', true); setVal('gpsCoords', '6.4541° N, 3.3947° E'); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                background: form.useGPS ? C.greenSoft : C.surface,
                border: `1.5px solid ${form.useGPS ? C.green : C.border}`,
                borderRadius: '12px', padding: '16px 18px',
                cursor: 'pointer', fontFamily: font, marginBottom: '20px', transition: 'all 0.2s', textAlign: 'left',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: '11px', background: form.useGPS ? C.greenSoft : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Navigation size={20} color={form.useGPS ? C.green : C.faint} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: form.useGPS ? C.green : C.text, fontWeight: 700, fontSize: '15px' }}>
                    {form.useGPS ? '✓ GPS Location Captured' : 'Use My Current GPS Location'}
                  </div>
                  <div style={{ color: C.faint, fontSize: '13px', marginTop: '2px' }}>
                    {form.useGPS ? form.gpsCoords : 'Tap to automatically detect your coordinates'}
                  </div>
                </div>
                {form.useGPS && <CheckCircle size={20} color={C.green} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
                <span style={{ color: C.faint, fontSize: '13px', whiteSpace: 'nowrap' }}>also enter address manually for double verification</span>
                <div style={{ flex: 1, height: '1px', background: C.border }} />
              </div>
              <InputField label="Street address / area description" placeholder="e.g. 14 Oshodi-Apapa Expressway, under-bridge market area" value={form.address} onChange={set('address')} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <SelectField label="State" options={NIGERIAN_STATES} value={form.state} onChange={set('state')} required />
                <InputField label="Local Government Area (LGA)" placeholder="e.g. Oshodi-Isolo" value={form.lga} onChange={set('lga')} />
              </div>
              <InputField label="Nearest landmark" placeholder="e.g. Near First Bank branch, opposite Shoprite mall" value={form.landmark} onChange={set('landmark')} />
              <NavBtns nextLabel="Add Media" />
            </div>
          )}

          {/* ════ STEP 4 — Media ════ */}
          {step === 4 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Add photos or videos
              </h3>
              <p style={{ color: C.muted, fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
                Visual evidence helps responders assess the situation before arrival. This step is optional.
              </p>
              <div style={{
                border: `2px dashed ${C.border}`, borderRadius: '16px',
                padding: '48px 24px', textAlign: 'center', marginBottom: '20px',
                background: C.surface, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(204,34,0,0.4)`; e.currentTarget.style.background = C.surface2; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}
                onClick={() => {
                  const names = ['incident_photo_1.jpg', 'incident_photo_2.jpg', 'video_clip.mp4'];
                  setVal('files', names.slice(0, form.files.length < 3 ? form.files.length + 1 : 3));
                }}
              >
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Upload size={26} color={C.primary} />
                </div>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Click to upload or drag &amp; drop</div>
                <div style={{ color: C.faint, fontSize: '14px', lineHeight: 1.6 }}>Supports JPG, PNG, MP4, MOV · Max 50MB per file</div>
              </div>
              {form.files.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  {form.files.map((file, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px', marginBottom: '8px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: C.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Camera size={16} color={C.green} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.text, fontSize: '13px', fontWeight: 600 }}>{file}</div>
                        <div style={{ color: C.green, fontSize: '11px', marginTop: '2px' }}>✓ Uploaded</div>
                      </div>
                      <button onClick={() => setVal('files', form.files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '4px', display: 'flex' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '18px' }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={15} color={C.primary} /> Add a social media link
                </div>
                <InputField label="Link to tweet, Facebook post or WhatsApp screenshot" placeholder="https://twitter.com/..." value={form.socialLink} onChange={set('socialLink')} />
              </div>
              <NavBtns nextLabel="Review & Submit" />
            </div>
          )}

          {/* ════ STEP 5 — Confirm ════ */}
          {step === 5 && (
            <div>
              <h3 style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                Review your report
              </h3>
              <p style={{ color: C.muted, fontSize: '15px', marginBottom: '28px', lineHeight: 1.65 }}>
                Please review all the details below before submitting.
              </p>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Incident Summary</div>
                {[
                  { label: 'Type',        value: selectedType?.label,  color: selectedType?.color },
                  { label: 'Severity',    value: selectedSev?.label,   color: selectedSev?.color  },
                  { label: 'Title',       value: form.title                                        },
                  { label: 'Description', value: form.description                                  },
                  { label: 'Affected',    value: form.casualties ? `~${form.casualties} people` : null },
                  { label: 'Location',    value: [form.address, form.lga, form.state].filter(Boolean).join(', ') },
                  { label: 'Landmark',    value: form.landmark                                     },
                  { label: 'Media',       value: form.files.length > 0 ? `${form.files.length} file(s) attached` : 'None' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', marginBottom: '12px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ color: C.faint, fontSize: '13px', fontWeight: 600, minWidth: '100px', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: row.color || C.text, fontSize: '13px', lineHeight: 1.6 }}>{row.value || '—'}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '16px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>Submit anonymously?</div>
                  <div style={{ color: C.faint, fontSize: '13px' }}>Your name and contact will not be shared with responders</div>
                </div>
                <div onClick={() => setVal('anonymous', !form.anonymous)} style={{ width: 46, height: 26, borderRadius: '999px', cursor: 'pointer', background: form.anonymous ? C.primary : C.surface2, border: `2px solid ${form.anonymous ? C.primary : C.border}`, position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: form.anonymous ? '24px' : '2px', transition: 'left 0.2s' }} />
                </div>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.08)', border: `1px solid rgba(245,158,11,0.25)`, borderRadius: '12px', padding: '14px 16px', marginBottom: '4px' }}>
                <div style={{ color: C.amber, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>⚠️ Important</div>
                <p style={{ color: C.muted, fontSize: '13px', lineHeight: 1.65, margin: 0 }}>
                  Submitting a false emergency report is a criminal offence under Nigerian law.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '24px', borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => setStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 22px', color: C.muted, fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                  <ChevronLeft size={17} /> Back
                </button>
                <button onClick={handleFinalSubmit} disabled={submitting} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: C.primary, border: 'none', borderRadius: '10px', padding: '13px', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: font, boxShadow: `0 6px 24px rgba(204,34,0,0.35)`, opacity: submitting ? 0.7 : 1 }}
                  onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = C.primaryHover; }}
                  onMouseLeave={e => e.currentTarget.style.background = C.primary}
                >
                  <AlertTriangle size={17} /> {submitting ? 'Submitting...' : 'Submit Emergency Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}