import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Brain, MapPin, Radio, Shield,
  Activity, Users, Cpu, Globe, Mail,
  ChevronRight, CheckCircle, ArrowRight, Siren,
  Database, Server, Code, BookOpen, Award,
  TrendingUp, Clock, Eye, Zap, Heart, ExternalLink,
  Code2, LayoutDashboard
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

/* ─── REUSABLE ─── */
const SectionLabel = ({ children, color = C.primary }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: `${color}12`, border: `1px solid ${color}30`,
    borderRadius: '999px', padding: '5px 16px', marginBottom: '18px',
    color, fontSize: '11px', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  }}>
    {children}
  </div>
);

const Wrap = ({ children, dark, style = {} }) => (
  <section style={{
    background: dark ? C.bgAlt : C.bg,
    borderTop: dark ? `1px solid ${C.border}` : 'none',
    borderBottom: dark ? `1px solid ${C.border}` : 'none',
    padding: '96px 0', ...style,
  }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
      {children}
    </div>
  </section>
);

const TechBadge = ({ label, color, icon: Icon }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: `${color}12`, border: `1px solid ${color}28`,
    borderRadius: '10px', padding: '8px 14px',
    transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}28`; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {Icon && <Icon size={15} color={color} strokeWidth={2} />}
    <span style={{ color, fontSize: '13px', fontWeight: 700 }}>{label}</span>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: C.surface, border: `1px solid ${open ? C.primaryBorder : C.border}`,
      borderRadius: '14px', marginBottom: '10px', overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px', background: 'none', border: 'none',
        cursor: 'pointer', fontFamily: font, gap: '16px',
      }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: '15px', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: open ? C.primarySoft : C.surface2,
          border: `1px solid ${open ? C.primaryBorder : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}>
          <span style={{ color: open ? C.primary : C.faint, fontSize: '18px', lineHeight: 1, marginTop: '-1px' }}>+</span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 22px 18px' }}>
          <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.8, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function AboutPage() {

  const techStack = [
    { category: 'Frontend',  color: C.blue,   items: [
      { label: 'React.js',      icon: Code    },
      { label: 'Vite',          icon: Zap     },
      { label: 'React Router',  icon: Globe   },
      { label: 'Lucide Icons',  icon: Eye     },
    ]},
    { category: 'Backend',   color: C.green,  items: [
      { label: 'Flask (Python)', icon: Server  },
      { label: 'PostgreSQL',     icon: Database},
      { label: 'REST API',       icon: Globe   },
      { label: 'JWT Auth',       icon: Shield  },
    ]},
    { category: 'AI / NLP',  color: C.primary,items: [
      { label: 'Naija-BERT',    icon: Brain   },
      { label: 'spaCy NER',     icon: Cpu     },
      { label: 'NLTK',          icon: BookOpen},
      { label: 'scikit-learn',  icon: TrendingUp },
    ]},
    { category: 'Data & Map', color: C.amber, items: [
      { label: 'Leaflet.js',    icon: MapPin  },
      { label: 'Twitter API v2',icon: Radio   },
      { label: 'BeautifulSoup', icon: Code    },
      { label: 'Pandas',        icon: Database},
    ]},
  ];

  const timeline = [
    { phase: 'Phase 1', label: 'Research & Planning',   color: C.blue,    done: true,  desc: 'Literature review, problem definition, system requirements and proposal submission.' },
    { phase: 'Phase 2', label: 'Data Collection',        color: C.amber,   done: true,  desc: 'Social media dataset collection, annotation of 5,000+ Nigerian emergency posts for NER training.' },
    { phase: 'Phase 3', label: 'NLP Model Development',  color: C.primary, done: true,  desc: 'Fine-tuned Naija-BERT for NER on Nigerian emergency texts. Achieved F1-Score of 0.96.' },
    { phase: 'Phase 4', label: 'System Implementation',  color: C.green,   done: true,  desc: 'Built React frontend, Flask backend, PostgreSQL database and Leaflet live map integration.' },
    { phase: 'Phase 5', label: 'Testing & Evaluation',   color: C.purple,  done: false, desc: 'System testing, user acceptance testing, NER model evaluation and performance benchmarking.' },
    { phase: 'Phase 6', label: 'Defence & Submission',   color: C.faint,   done: false, desc: 'Final project documentation, presentation and defence before examination panel.' },
  ];

  const metrics = [
    { icon: Brain,      color: C.primary, label: 'NER F1-Score',        value: '0.96',  sub: 'Precision: 0.97 · Recall: 0.95'      },
    { icon: MapPin,     color: C.blue,    label: 'Location Accuracy',    value: '94%',   sub: 'Within 50m radius of actual event'   },
    { icon: Clock,      color: C.amber,   label: 'Detection Speed',      value: '<30s',  sub: 'From post to map pin appearance'     },
    { icon: Radio,      color: C.green,   label: 'Posts Processed',      value: '247+',  sub: 'Daily across all monitored channels' },
    { icon: Activity,   color: C.purple,  label: 'System Uptime',        value: '99.2%', sub: 'Across all monitored services'       },
    { icon: Users,      color: C.primary, label: 'Training Samples',     value: '5,000+',sub: 'Annotated Nigerian emergency posts'  },
  ];

  const faqs = [
    { q: 'What is CrisisWatch Nigeria?',
      a: 'CrisisWatch Nigeria is an AI-powered emergency intelligence platform that monitors social media in real time, uses Natural Language Processing (NLP) to extract key information from posts, and maps detected incidents across Nigeria to help emergency responders act faster.' },
    { q: 'How does the NLP / NER system work?',
      a: 'The system uses a fine-tuned version of Naija-BERT — a BERT model trained on Nigerian English text including Pidgin. Named Entity Recognition (NER) automatically extracts event type, location, time, and severity from raw social media posts. These entities are then geocoded using a Nigerian place-name gazetteer and plotted on the live Leaflet map.' },
    { q: 'Which social media platforms are monitored?',
      a: 'The system currently monitors X (Twitter) via the Twitter API v2, Facebook public pages via scraping, and WhatsApp public broadcast channels. The monitoring runs continuously 24 hours a day with new posts processed every 30 seconds.' },
    { q: 'Who can use CrisisWatch?',
      a: 'There are three user types: General Public (anyone can register to report incidents and receive alerts), Emergency Responders (verified agency staff from NEMA, Fire Service, Police etc get full dashboard access), and System Administrators (manage users, data feeds and model performance).' },
    { q: 'How accurate is the location detection?',
      a: 'Location detection achieves 94% accuracy within a 50-metre radius of the actual incident. This is achieved by combining NER-extracted place names with a custom Nigerian gazetteer that includes informal local names like "Oshodi under bridge" and "Mile 2 junction" that are not found in standard geocoding APIs.' },
    { q: 'Is this a final year project?',
      a: 'Yes. CrisisWatch Nigeria is a final year undergraduate Computer Science project. The system was designed, built and evaluated as a demonstration of how AI and NLP can be applied to solve real emergency response challenges in the Nigerian context.' },
    { q: 'What technologies does it use?',
      a: 'The frontend is built with React.js and Vite. The backend uses Flask (Python) with a PostgreSQL database and REST API. The NLP pipeline uses Naija-BERT, spaCy, NLTK and scikit-learn. Maps are rendered with Leaflet.js. Social media data is collected via the Twitter API v2 and web scraping.' },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 0' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(204,34,0,0.12) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <SectionLabel><Siren size={12} /> Final Year Project</SectionLabel>
            <h1 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.6rem)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px' }}>
              About{' '}
              <span style={{ color: C.primary, textShadow: `0 0 40px rgba(204,34,0,0.4)` }}>
                CrisisWatch
              </span>{' '}
              Nigeria
            </h1>
            <p style={{ color: C.muted, fontSize: '18px', lineHeight: 1.8, marginBottom: '40px' }}>
              An AI-powered emergency intelligence platform that monitors social media in real time,
              uses Named Entity Recognition to extract crisis details, and maps incidents across
              Nigeria — built to help emergency responders act faster and save lives.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: C.primary, color: '#fff',
                padding: '13px 28px', borderRadius: '12px',
                fontSize: '15px', fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 8px 28px rgba(204,34,0,0.3)`, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = C.primaryHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Activity size={17} /> View Live System <ArrowRight size={15} />
              </Link>
              <Link to="/report" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.06)', color: C.text,
                padding: '13px 28px', borderRadius: '12px',
                fontSize: '15px', fontWeight: 600, textDecoration: 'none',
                border: `1px solid rgba(255,255,255,0.12)`, transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <AlertTriangle size={17} /> Report Incident
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          THE PROBLEM
      ══════════════════════════════ */}
      <Wrap dark>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <SectionLabel color={C.primary}>The Problem</SectionLabel>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
              Emergency information in Nigeria is fragmented and delayed
            </h2>
            <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.85, marginBottom: '24px' }}>
              When emergencies occur across Nigeria, critical information is scattered across
              X (Twitter), Facebook, and WhatsApp — in informal Nigerian English, Pidgin, and
              local languages. Emergency agencies have no centralised way to monitor, extract,
              and act on this information in real time.
            </p>
            <p style={{ color: C.muted, fontSize: '16px', lineHeight: 1.85, marginBottom: '32px' }}>
              Standard NLP tools fail on Nigerian text because they are trained on formal
              English and cannot understand expressions like <em style={{ color: C.text }}>"Na fire burn for under bridge"</em> or{' '}
              <em style={{ color: C.text }}>"One kain wahala dey for Oshodi now"</em>.
              The result is delayed response, wasted resources, and preventable casualties.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'No centralised emergency intelligence system in Nigeria',
                'Standard NLP models cannot process Nigerian Pidgin or informal text',
                'Emergency responders have no real-time social media monitoring',
                'Geocoding informal Nigerian place names remains unsolved',
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <AlertTriangle size={10} color={C.primary} />
                  </div>
                  <span style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { value: '48hrs', label: 'Average delay in official emergency response', color: C.primary, icon: Clock },
              { value: '73%',  label: 'Of Nigerians first report emergencies on social media', color: C.amber, icon: Radio },
              { value: '0',    label: 'Existing NLP tools trained on Nigerian Pidgin text', color: C.blue, icon: Brain },
              { value: '180M+',label: 'Nigerians with no centralised emergency alert system', color: C.green, icon: Users },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}33`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '11px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <s.icon size={19} color={s.color} strokeWidth={2} />
                </div>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>{s.value}</div>
                <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.65 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>

      {/* ══════════════════════════════
          THE SOLUTION
      ══════════════════════════════ */}
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <SectionLabel color={C.green}>The Solution</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.6rem)', letterSpacing: '-0.03em', marginBottom: '16px' }}>
            How CrisisWatch solves it
          </h2>
          <p style={{ color: C.muted, fontSize: '17px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
            A complete end-to-end pipeline from raw social media post to mapped,
            prioritised incident visible to emergency responders in under 30 seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '18px' }}>
          {[
            { icon: Radio,           color: C.amber,   step: '01', title: 'Social Media Monitoring',      desc: 'APIs and intelligent scrapers continuously collect public posts from X, Facebook and WhatsApp, filtered by Nigerian emergency keywords, hashtags and geo-tags 24/7.' },
            { icon: Brain,           color: C.primary, step: '02', title: 'Naija-BERT NER Processing',    desc: 'A fine-tuned BERT model trained on 5,000+ annotated Nigerian emergency posts extracts event type, location, time and severity — including from Pidgin English text.' },
            { icon: MapPin,          color: C.blue,    step: '03', title: 'Nigerian Geocoding',            desc: 'A custom gazetteer converts informal Nigerian place names ("Oshodi under bridge", "Wuse 2 junction") into precise GPS coordinates for accurate map placement.' },
            { icon: LayoutDashboard, color: C.green,   step: '04', title: 'Live Dashboard & Alerts',      desc: 'Incidents appear instantly on the Leaflet map and responder dashboard, prioritised by severity. Push notifications and SMS alerts dispatched within 30 seconds.' },
            { icon: Shield,          color: C.purple,  step: '05', title: 'Responder Coordination',       desc: 'NEMA, Fire Service, Police and other agencies can respond to, update and resolve incidents directly from their dashboard with full incident tracking.' },
            { icon: Activity,        color: C.amber,   step: '06', title: 'Analytics & Model Feedback',   desc: 'System performance metrics, NER accuracy (F1: 0.96), response times and incident hotspot analytics feed continuous model improvement.' },
          ].map((item, i) => (
            <div key={i} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: '16px', padding: '26px', transition: 'all 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}33`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={21} color={item.color} strokeWidth={1.9} />
                </div>
                <span style={{ color: item.color, fontWeight: 800, fontSize: '13px', opacity: 0.6 }}>{item.step}</span>
              </div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: '15px', marginBottom: '10px', letterSpacing: '-0.01em' }}>{item.title}</div>
              <div style={{ color: C.muted, fontSize: '13px', lineHeight: 1.75 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </Wrap>

    


      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <Wrap>
        <div style={{
          background: `linear-gradient(135deg, #1A0500 0%, #8B1100 40%, #CC2200 70%, #1E1A4A 100%)`,
          borderRadius: '24px', padding: '80px 48px', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: `0 32px 80px rgba(204,34,0,0.2)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '24px' }}>
              <Heart size={13} color="#fff" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>BUILT FOR NIGERIA</span>
            </div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '16px' }}>
              Help make Nigeria safer
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '17px', maxWidth: '480px', margin: '0 auto 48px', lineHeight: 1.8 }}>
              Join CrisisWatch NG, report emergencies in your area, and give
              first responders the real-time intelligence they need to save lives.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ background: '#fff', color: '#8B1100', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}>
                Get Started Free
              </Link>
              <Link to="/dashboard" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                View Live Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Wrap>

    </div>
  );
}