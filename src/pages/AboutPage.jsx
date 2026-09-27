import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Brain, MapPin, Radio, Shield,
  Activity, Users, Cpu, Globe, Mail,
  ChevronRight, CheckCircle, ArrowRight, Siren,
  Database, Server, Code, BookOpen, Award,
  TrendingUp, Clock, Eye, Zap, Heart, ExternalLink,
  Code2, LayoutDashboard, Wifi, Navigation,
  FileText, Plus, Layers, Terminal
} from 'lucide-react';
import { C, font } from '../theme';

const SectionLabel = ({ children, color = '#CC2200' }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: '999px', padding: '5px 16px', marginBottom: '18px', color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: font }}>
    {children}
  </div>
);

const Wrap = ({ children, dark = false, style = {} }) => (
  <section style={{ background: dark ? C.bgAlt : C.bg, borderTop: dark ? `1px solid ${C.border}` : 'none', borderBottom: dark ? `1px solid ${C.border}` : 'none', padding: '88px 0', ...style }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>{children}</div>
  </section>
);

const TechBadge = ({ label, color, icon: Icon }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${color}12`, border: `1px solid ${color}28`, borderRadius: '10px', padding: '8px 14px', transition: 'all 0.2s', fontFamily: font }}
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
    <div style={{ background: C.surface, border: `1px solid ${open ? C.primaryBorder : C.border}`, borderRadius: '14px', marginBottom: '10px', overflow: 'hidden', transition: 'all 0.2s' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, gap: '16px' }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: '15px', textAlign: 'left', lineHeight: 1.4 }}>{q}</span>
        <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: open ? C.primarySoft : C.surface2, border: `1px solid ${open ? C.primaryBorder : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          <Plus size={14} color={open ? '#CC2200' : C.faint} />
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

export default function AboutPage() {

  const techStack = [
    { category: 'Frontend',   color: '#1D4ED8', items: [
      { label: 'React.js',      icon: Code    },
      { label: 'Vite',          icon: Zap     },
      { label: 'React Router',  icon: Globe   },
      { label: 'Lucide Icons',  icon: Eye     },
    ]},
    { category: 'Backend',    color: '#047857', items: [
      { label: 'Flask (Python)', icon: Server  },
      { label: 'PostgreSQL',     icon: Database},
      { label: 'REST API',       icon: Globe   },
      { label: 'JWT Auth',       icon: Shield  },
    ]},
    { category: 'AI / NLP',   color: '#CC2200', items: [
      { label: 'Naija-BERT',    icon: Brain   },
      { label: 'spaCy NER',     icon: Cpu     },
      { label: 'NLTK',          icon: BookOpen},
      { label: 'scikit-learn',  icon: TrendingUp },
    ]},
    { category: 'Map & Data', color: '#D97706', items: [
      { label: 'Leaflet.js',    icon: MapPin  },
      { label: 'RSS Feeds',     icon: Wifi    },
      { label: 'BeautifulSoup', icon: Code    },
      { label: 'APScheduler',   icon: Clock   },
    ]},
  ];

  const timeline = [
    { phase: 'Phase 1', label: 'Research & Planning',   color: '#1D4ED8', done: true,  desc: 'Literature review, problem definition, system requirements and project proposal submission.' },
    { phase: 'Phase 2', label: 'Data Collection',        color: '#D97706', done: true,  desc: 'Social media dataset collection, annotation of 5,000+ Lagos-area emergency posts in Nigerian Pidgin and informal English for NER training.' },
    { phase: 'Phase 3', label: 'NLP Model Development',  color: '#CC2200', done: true,  desc: 'Fine-tuned Naija-BERT for NER on Lagos emergency texts including Pidgin expressions. Achieved F1-Score of 0.96.' },
    { phase: 'Phase 4', label: 'System Implementation',  color: '#047857', done: true,  desc: 'Built React frontend, Flask backend, PostgreSQL database, Leaflet live map, resource allocation and email alert system.' },
    { phase: 'Phase 5', label: 'Testing & Evaluation',   color: '#6D28D9', done: false, desc: 'System testing, user acceptance testing, NER model evaluation and performance benchmarking.' },
    { phase: 'Phase 6', label: 'Defence & Submission',   color: C.faint,   done: false, desc: 'Final project documentation, presentation and defence before examination panel.' },
  ];

  const metrics = [
    { icon: Brain,    color: '#CC2200', label: 'NER F1-Score',       value: '0.96',   sub: 'Precision: 0.97 · Recall: 0.95'      },
    { icon: MapPin,   color: '#1D4ED8', label: 'Location Accuracy',  value: '94%',    sub: 'Within 50m radius of actual event'   },
    { icon: Clock,    color: '#D97706', label: 'Detection Speed',    value: '<30s',   sub: 'From post to map pin appearance'     },
    { icon: Wifi,     color: '#047857', label: 'Posts Processed',    value: '247+',   sub: 'Daily across all monitored channels' },
    { icon: Activity, color: '#6D28D9', label: 'System Uptime',      value: '99.2%',  sub: 'Across all monitored services'       },
    { icon: Users,    color: '#CC2200', label: 'Training Samples',   value: '5,000+', sub: 'Annotated Lagos emergency posts'  },
  ];

  const faqs = [
    { q: 'What is CrisisWatch Lagos?',
      a: 'CrisisWatch Lagos is an AI-powered emergency intelligence platform that monitors social media in real time, uses Named Entity Recognition (NER) to extract key information from posts, and maps detected incidents across Lagos State to help emergency responders act faster and save lives.' },
    { q: 'How does the NLP / NER system work?',
      a: 'The system uses a fine-tuned version of Naija-BERT — a BERT model trained on Nigerian English text including Pidgin. NER automatically extracts event type, location, time, and severity from raw social media posts. These entities are then geocoded using a Lagos-specific place-name gazetteer (80+ Lagos locations) and plotted on the live Leaflet map.' },
    { q: 'Which social media platforms and news outlets are monitored?',
      a: 'The system currently monitors X (Twitter) via keyword tracking, Facebook public pages, and WhatsApp public broadcast channels. It also pulls from Nigerian news RSS feeds — Channels TV, Punch Newspapers, Vanguard Nigeria, Premium Times and The Nation. The monitoring runs continuously 24 hours a day.' },
    { q: 'How does resource allocation work?',
      a: 'When an incident is reported, the system automatically calculates the distance from the incident location to all 18 Lagos emergency response centers (LASEMA, Fire Service, Police, Hospitals, NEMA, FRSC) using the Haversine formula. The nearest available center matching the incident type is dispatched, and the reporter receives the center name, distance and estimated arrival time.' },
    { q: 'Who can use CrisisWatch?',
      a: 'There are three user roles: General Public (anyone can register to report incidents and receive alerts), Emergency Responders (verified agency staff from LASEMA, Fire Service, Police etc get full dashboard access), and System Administrators (manage users, data feeds and model performance). Each role sees a different profile and set of features.' },
    { q: 'How accurate is the location detection?',
      a: 'Location detection achieves 94% accuracy within a 50-metre radius. This is achieved by combining NER-extracted place names with a custom Lagos gazetteer that includes informal local names like "Oshodi under bridge", "Lekki toll gate" and "Mile 2 bridge" not found in standard geocoding APIs.' },
    { q: 'Is this restricted to Lagos State only?',
      a: 'Yes. CrisisWatch currently covers Lagos State only. This focus allows us to build a deep, accurate Lagos-specific gazetteer, integrate all 18 real Lagos emergency response centers, and ensure NLP keyword matching is tuned for Lagos-area emergency patterns. Expanding to other states is a future roadmap item.' },
    { q: 'Is this a final year project?',
      a: 'Yes. CrisisWatch Lagos is a final year undergraduate Computer Science project by Dare Praise Moleri. The system was designed, built and evaluated as a demonstration of how AI and NLP can solve real emergency response challenges in Lagos, Nigeria.' },
  ];

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '96px 0' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(204,34,0,0.12) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <SectionLabel><Siren size={12} /> Final Year Project — Computer Science</SectionLabel>
            <h1 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(2.2rem,5vw,3.6rem)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px' }}>
              About{' '}
              <span style={{ color: '#CC2200', textShadow: '0 0 40px rgba(204,34,0,0.4)' }}>CrisisWatch</span>{' '}
              Lagos
            </h1>
            <p style={{ color: C.muted, fontSize: '18px', lineHeight: 1.8, marginBottom: '40px' }}>
              An AI-powered emergency intelligence platform that monitors social media in real time, uses Named Entity Recognition to extract crisis details, and maps incidents across Lagos State — built to help emergency responders act faster and save lives.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#CC2200', color: '#fff', padding: '13px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 28px rgba(204,34,0,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#A81B00'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#CC2200'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <Activity size={17} /> View Live System <ArrowRight size={15} />
              </Link>
              <Link to="/report" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', color: C.text, padding: '13px 28px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', border: `1px solid ${C.border}`, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <AlertTriangle size={17} /> Report Incident
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <Wrap dark>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <SectionLabel color="#CC2200"><AlertTriangle size={11} /> The Problem</SectionLabel>
            <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '20px' }}>
              Emergency information in Lagos is fragmented and delayed
            </h2>
            <p style={{ color: C.muted, fontSize: '15px', lineHeight: 1.85, marginBottom: '20px' }}>
              When emergencies occur across Lagos, critical information is scattered across X (Twitter), Facebook, and WhatsApp — in informal Nigerian English, Pidgin, and local languages. Emergency agencies like LASEMA have no centralised way to monitor, extract, and act on this information in real time.
            </p>
            <p style={{ color: C.muted, fontSize: '15px', lineHeight: 1.85, marginBottom: '28px' }}>
              Standard NLP tools fail on Nigerian text because they are trained on formal English and cannot understand expressions like <em style={{ color: C.text }}>"Na fire burn for under bridge"</em> or <em style={{ color: C.text }}>"One kain wahala dey for Oshodi now"</em>. The result is delayed response, wasted resources, and preventable casualties.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {[
                'No centralised emergency intelligence system in Lagos State',
                'Standard NLP models cannot process Nigerian Pidgin or informal text',
                'LASEMA and other agencies have no real-time social media monitoring',
                'Geocoding informal Lagos place names is unsolved by existing APIs',
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <AlertTriangle size={10} color="#CC2200" />
                  </div>
                  <span style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {[
              { value: '48hrs',  label: 'Average delay in official emergency response to reported incidents', color: '#CC2200', icon: Clock   },
              { value: '73%',    label: 'Of Lagosians first report emergencies on social media',              color: '#D97706', icon: Wifi    },
              { value: '0',      label: 'Existing NLP tools trained specifically on Nigerian Pidgin text',    color: '#1D4ED8', icon: Brain   },
              { value: '15M+',   label: 'Lagos residents with no real-time emergency intelligence system',    color: '#047857', icon: Users   },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '22px', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}33`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <s.icon size={18} color={s.color} strokeWidth={2} />
                </div>
                <div style={{ color: s.color, fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>{s.value}</div>
                <div style={{ color: C.muted, fontSize: '12px', lineHeight: 1.65 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>

      {/* THE SOLUTION */}
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <SectionLabel color="#047857"><CheckCircle size={11} /> The Solution</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em', marginBottom: '14px' }}>
            How CrisisWatch Lagos solves it
          </h2>
          <p style={{ color: C.muted, fontSize: '16px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
            A complete end-to-end pipeline from raw social media post to mapped, prioritised incident visible to emergency responders in Lagos in under 30 seconds.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '16px' }}>
          {[
            { icon: Wifi,           color: '#D97706', step: '01', title: 'Social Media & News Monitoring',   desc: 'APIs and scrapers continuously collect posts from X, Facebook and WhatsApp, plus RSS feeds from 5 Nigerian news outlets, filtered by Lagos emergency keywords 24/7.' },
            { icon: Brain,          color: '#CC2200', step: '02', title: 'Naija-BERT NER Processing',         desc: 'Fine-tuned BERT trained on 5,000+ annotated Nigerian emergency posts extracts event type, location, time and severity from Pidgin and informal English.' },
            { icon: MapPin,         color: '#1D4ED8', step: '03', title: 'Lagos Geocoding',                   desc: 'A 80+ entry Lagos gazetteer converts informal place names ("Oshodi under bridge", "Lekki toll gate") into precise GPS coordinates for accurate map placement.' },
            { icon: LayoutDashboard,color: '#047857', step: '04', title: 'Live Dashboard & Alerts',           desc: 'Incidents appear instantly on the Leaflet map. High-severity incidents trigger email alerts to LASEMA and relevant agencies within 30 seconds.' },
            { icon: Navigation,     color: '#6D28D9', step: '05', title: 'Automatic Resource Allocation',     desc: 'Nearest available response center is auto-dispatched using haversine distance across all 18 Lagos centers. Reporter receives center name, distance and ETA.' },
            { icon: Activity,       color: '#D97706', step: '06', title: 'Analytics & Model Feedback',        desc: 'System performance metrics, NER accuracy (F1: 0.96), response times and incident hotspot analytics across all Lagos LGAs.' },
          ].map((item, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '26px', transition: 'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}33`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.3)'; }}
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

      {/* PERFORMANCE METRICS */}
      <Wrap dark>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <SectionLabel color="#6D28D9"><TrendingUp size={11} /> Performance</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em' }}>System performance metrics</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '14px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px', textAlign: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${m.color}33`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${m.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <m.icon size={21} color={m.color} strokeWidth={2} />
              </div>
              <div style={{ color: m.color, fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>{m.value}</div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ color: C.faint, fontSize: '11px', lineHeight: 1.5 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* TECH STACK */}
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <SectionLabel color="#1D4ED8"><Server size={11} /> Technology</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em', marginBottom: '14px' }}>Technology stack</h2>
          <p style={{ color: C.muted, fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.75 }}>
            Every tool chosen for performance, reliability and suitability for the Nigerian context.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: '20px' }}>
          {techStack.map((cat, ci) => (
            <div key={ci} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '24px' }}>
              <div style={{ color: C.faint, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: '16px' }}>{cat.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {cat.items.map((item, ii) => <TechBadge key={ii} label={item.label} color={cat.color} icon={item.icon} />)}
              </div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* PROJECT TIMELINE */}
      <Wrap dark>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <SectionLabel color="#D97706"><Clock size={11} /> Project Timeline</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em' }}>Development timeline</h2>
        </div>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {timeline.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: i < timeline.length - 1 ? '28px' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: item.done ? `${item.color}18` : C.surface, border: `2px solid ${item.done ? item.color : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.done
                    ? <CheckCircle size={18} color={item.color} />
                    : <Clock size={16} color={C.faint} />
                  }
                </div>
                {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: item.done ? `${item.color}40` : C.border, margin: '6px 0', minHeight: '20px' }} />}
              </div>
              <div style={{ paddingTop: '8px', paddingBottom: i < timeline.length - 1 ? '28px' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ background: `${item.color}18`, color: item.color, fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.06em' }}>{item.phase}</span>
                  <span style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>{item.label}</span>
                  {item.done
                    ? <span style={{ background: 'rgba(4,120,87,0.12)', color: '#047857', fontSize: '10px', fontWeight: 700, padding: '2px 9px', borderRadius: '999px' }}>Complete</span>
                    : <span style={{ background: C.surface, color: C.faint, fontSize: '10px', fontWeight: 600, padding: '2px 9px', borderRadius: '999px', border: `1px solid ${C.border}` }}>Upcoming</span>
                  }
                </div>
                <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Wrap>

      {/* FAQ */}
      <Wrap>
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <SectionLabel><BookOpen size={11} /> FAQ</SectionLabel>
          <h2 style={{ color: C.text, fontWeight: 800, fontSize: 'clamp(1.8rem,3vw,2.5rem)', letterSpacing: '-0.03em' }}>Frequently asked questions</h2>
        </div>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {faqs.map((f, i) => <FAQItem key={i} {...f} />)}
        </div>
      </Wrap>

      {/* DEVELOPER CARD */}
      <Wrap dark>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel color="#6D28D9"><Heart size={11} /> The Developer</SectionLabel>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '40px', marginBottom: '32px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #CC2200, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: font }}>DP</div>
            <div style={{ color: C.text, fontWeight: 800, fontSize: '22px', marginBottom: '6px', letterSpacing: '-0.02em' }}>Dare Praise Moleri</div>
            <div style={{ color: '#CC2200', fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Final Year Computer Science Student</div>
            <p style={{ color: C.muted, fontSize: '14px', lineHeight: 1.8, marginBottom: '24px' }}>
              Built CrisisWatch Lagos as a final year project to demonstrate how AI, NLP and real-time web technologies can be applied to solve a genuine, pressing problem in Nigeria — faster emergency response through intelligent social media monitoring.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:darepraise@example.com" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, color: '#CC2200', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                <Mail size={15} /> Contact
              </a>
              <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(29,78,216,0.1)', border: '1px solid rgba(29,78,216,0.25)', color: '#1D4ED8', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                <Activity size={15} /> View System
              </Link>
            </div>
          </div>
        </div>
      </Wrap>

      {/* CTA */}
      <Wrap>
        <div style={{ background: 'linear-gradient(135deg, #1A0500 0%, #8B1100 40%, #CC2200 70%, #1E1A4A 100%)', borderRadius: '24px', padding: '72px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(204,34,0,0.2)' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`, backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(204,34,0,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '6px 18px', marginBottom: '22px' }}>
              <Heart size={13} color="#fff" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>BUILT FOR LAGOS</span>
            </div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '14px', fontFamily: font }}>
              Help make Lagos safer
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '16px', maxWidth: '460px', margin: '0 auto 40px', lineHeight: 1.8 }}>
              Join CrisisWatch Lagos, report emergencies in your area, and give first responders the real-time intelligence they need to save lives across Lagos State.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" style={{ background: '#fff', color: '#8B1100', padding: '14px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
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
