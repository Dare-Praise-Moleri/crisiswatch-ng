import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, AlertTriangle, MapPin, Clock,
  CheckCircle, RefreshCw, Send, Activity,
  Radio, Zap, Shield, Flame, Droplets,
  Car, Users, ChevronRight, BarChart2
} from 'lucide-react';

const C = {
  primary:      '#CC2200',
  primarySoft:  'rgba(204,34,0,0.1)',
  primaryBorder:'rgba(204,34,0,0.3)',
  blue:         '#2563EB',
  green:        '#10B981',
  amber:        '#F59E0B',
  purple:       '#8B5CF6',
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

const TYPE_ICONS = {
  fire:     { icon: Flame,         color: C.primary },
  crime:    { icon: Shield,        color: C.amber   },
  flood:    { icon: Droplets,      color: C.blue    },
  accident: { icon: Car,           color: C.purple  },
  medical:  { icon: Activity,      color: C.green   },
  security: { icon: AlertTriangle, color: C.amber   },
  protest:  { icon: Users,         color: C.purple  },
  other:    { icon: AlertTriangle, color: C.faint   },
};

const SEV_COLORS = {
  critical: '#FF3B30',
  high:     C.primary,
  medium:   C.amber,
  low:      C.green,
};

export default function NLPPage() {
  const [text,      setText]      = useState('');
  const [source,    setSource]    = useState('X (Twitter)');
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [feedItems, setFeedItems] = useState([]);
  const [feedRunning, setFeedRunning] = useState(false);
  const [stats,     setStats]     = useState(null);
  const [saveMsg,   setSaveMsg]   = useState('');

  /* Load model stats */
  useEffect(() => {
    fetch('http://localhost:5000/api/nlp/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, []);

  /* Process single text */
  const processText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setSaveMsg('');
    try {
      const token = localStorage.getItem('crisiswatch_token');
      const res   = await fetch('http://localhost:5000/api/nlp/process-and-save', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text, source }),
      });
      const data = await res.json();
      setResult(data.result);
      if (data.saved) setSaveMsg('✅ Incident automatically saved to the database and agencies notified');
      else setSaveMsg('ℹ️ Confidence too low to auto-save — review and submit manually if needed');
    } catch (e) {
      setSaveMsg('❌ Could not connect to backend');
    } finally {
      setLoading(false);
    }
  };

  /* Run simulated feed */
  const runFeed = async () => {
    setFeedRunning(true);
    try {
      const res  = await fetch('http://localhost:5000/api/nlp/simulate-feed', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ count: 5 }),
      });
      const data = await res.json();
      setFeedItems(prev => [...data.results, ...prev].slice(0, 20));
    } catch (e) {
      console.error(e);
    } finally {
      setFeedRunning(false);
    }
  };

  const EntityTag = ({ label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
      <span style={{ color: C.faint, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', width: '76px', flexShrink: 0 }}>{label}</span>
      <span style={{ background: `${color}18`, color, fontSize: '13px', fontWeight: 700, padding: '4px 14px', borderRadius: '999px', border: `1px solid ${color}28` }}>{value}</span>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: font }}>

      {/* Header */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ width: 48, height: 48, background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} color={C.primary} />
            </div>
            <div>
              <h1 style={{ color: C.text, fontWeight: 800, fontSize: '28px', letterSpacing: '-0.02em', margin: 0 }}>
                NLP Monitor
              </h1>
              <p style={{ color: C.muted, fontSize: '15px', margin: '4px 0 0' }}>
                Named Entity Recognition — process social media text and extract emergency details
              </p>
            </div>
          </div>

          {/* Model stats strip */}
          {stats && (
            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
              {[
                { label: 'Model',     value: stats.model,                    color: C.text    },
                { label: 'Precision', value: `${(stats.metrics.precision * 100).toFixed(0)}%`, color: C.green  },
                { label: 'Recall',    value: `${(stats.metrics.recall * 100).toFixed(0)}%`,    color: C.blue   },
                { label: 'F1-Score',  value: stats.metrics.f1_score,         color: C.amber   },
                { label: 'Accuracy',  value: `${(stats.metrics.accuracy * 100).toFixed(0)}%`, color: C.green  },
                { label: 'Places DB', value: `${stats.gazetteer_size} Nigerian locations`,     color: C.muted  },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ color: C.faint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  <div style={{ color: s.color, fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* ── LEFT: Text Input ── */}
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ color: C.text, fontWeight: 800, fontSize: '18px', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                Process a Social Media Post
              </h2>
              <p style={{ color: C.muted, fontSize: '14px', marginBottom: '20px', lineHeight: 1.7 }}>
                Paste any tweet, Facebook post, or WhatsApp message below. The NLP engine will extract the emergency type, location, severity and time.
              </p>

              {/* Source selector */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ color: C.muted, fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Source Platform</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['X (Twitter)', 'WhatsApp', 'Facebook', 'Manual Input'].map(s => (
                    <button key={s} onClick={() => setSource(s)} style={{
                        padding: '6px 14px', borderRadius: '8px',
                        background: source === s ? C.primarySoft : C.surface2,
                        color: source === s ? C.primary : C.muted,
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font,
                        border: `1px solid ${source === s ? C.primaryBorder : C.border}`,
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Paste a social media post here...\n\nExample: "Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up. LASG do something abeg 🔥🔥"`}
                rows={6}
                style={{
                  width: '100%', background: C.surface2,
                  border: `1px solid ${C.border}`, borderRadius: '12px',
                  padding: '14px', color: C.text, fontSize: '14px',
                  fontFamily: font, outline: 'none', resize: 'vertical',
                  lineHeight: 1.7, boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(204,34,0,0.4)'}
                onBlur={e => e.target.style.borderColor = C.border}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button onClick={processText} disabled={loading || !text.trim()} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: text.trim() ? C.primary : C.surface2,
                  border: 'none', borderRadius: '10px', padding: '13px',
                  color: text.trim() ? '#fff' : C.faint,
                  fontSize: '15px', fontWeight: 700,
                  cursor: text.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: font, transition: 'all 0.2s',
                  boxShadow: text.trim() ? `0 4px 16px rgba(204,34,0,0.3)` : 'none',
                }}>
                  {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><Brain size={16} /> Extract Entities</>}
                </button>
                <button onClick={() => { setText(''); setResult(null); setSaveMsg(''); }} style={{
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: '10px', padding: '13px 18px',
                  color: C.muted, fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', fontFamily: font,
                }}>Clear</button>
              </div>

              {/* Save message */}
              {saveMsg && (
                <div style={{
                  marginTop: '14px', padding: '12px 14px',
                  background: saveMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : saveMsg.startsWith('ℹ️') ? 'rgba(37,99,235,0.1)' : 'rgba(204,34,0,0.1)',
                  border: `1px solid ${saveMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : saveMsg.startsWith('ℹ️') ? 'rgba(37,99,235,0.3)' : 'rgba(204,34,0,0.3)'}`,
                  borderRadius: '10px',
                  color: saveMsg.startsWith('✅') ? C.green : saveMsg.startsWith('ℹ️') ? C.blue : C.primary,
                  fontSize: '13px', fontWeight: 500, lineHeight: 1.6,
                }}>
                  {saveMsg}
                </div>
              )}
            </div>

            {/* Example posts */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px' }}>
              <h3 style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '14px' }}>Try these example posts</h3>
              {[
                { text: 'Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up', source: 'X (Twitter)'  },
                { text: 'Armed robbers dey operate for Lekki Phase 1 junction now now! Make people avoid that road', source: 'WhatsApp' },
                { text: 'Serious flood for Mararaba road in Abuja. Many cars don drown for the water', source: 'Facebook'   },
                { text: 'Multiple car crash on Lagos Ibadan expressway near Sagamu. People dey injured', source: 'X (Twitter)'  },
              ].map((ex, i) => (
                <button key={i} onClick={() => { setText(ex.text); setSource(ex.source); }} style={{
                  width: '100%', textAlign: 'left',
                  background: C.surface2, border: `1px solid ${C.border}`,
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
                  cursor: 'pointer', fontFamily: font, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(204,34,0,0.3)'; e.currentTarget.style.background = 'rgba(204,34,0,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface2; }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>
                    {ex.source === 'X (Twitter)' ? '🐦' : ex.source === 'WhatsApp' ? '💬' : '📘'}
                  </span>
                  <div>
                    <div style={{ color: C.text, fontSize: '13px', lineHeight: 1.5, marginBottom: '4px' }}>"{ex.text}"</div>
                    <div style={{ color: C.faint, fontSize: '11px' }}>{ex.source}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: NER Results ── */}
          <div>
            {result ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', overflow: 'hidden', marginBottom: '20px' }}>

                {/* Result header */}
                <div style={{
                  background: `${SEV_COLORS[result.severity] || C.primary}18`,
                  borderBottom: `1px solid ${SEV_COLORS[result.severity] || C.primary}28`,
                  padding: '20px 24px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  {(() => {
                    const mapped = TYPE_ICONS[result.event_type] || TYPE_ICONS.other;
                    const Icon   = mapped.icon;
                    return (
                      <div style={{ width: 46, height: 46, borderRadius: '12px', background: `${mapped.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={22} color={mapped.color} strokeWidth={2} />
                      </div>
                    );
                  })()}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>
                      {result.suggested_title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: `${SEV_COLORS[result.severity]}22`, color: SEV_COLORS[result.severity], fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                        {result.severity?.toUpperCase()}
                      </span>
                      <span style={{ background: C.surface2, color: C.faint, fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>
                        Confidence: {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '24px' }}>

                  {/* Cleaned text */}
                  <div style={{ background: C.surface2, borderRadius: '10px', padding: '14px', marginBottom: '20px', border: `1px solid ${C.border}` }}>
                    <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Cleaned Input</div>
                    <div style={{ color: C.text, fontSize: '14px', lineHeight: 1.7, fontStyle: 'italic' }}>"{result.cleaned_text}"</div>
                  </div>

                  {/* Extracted entities */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700 }}>
                      Extracted Entities (NER)
                    </div>
                    <EntityTag label="Event Type" value={result.entities.event}    color={TYPE_ICONS[result.event_type]?.color || C.primary} />
                    <EntityTag label="Location"   value={result.entities.location} color={C.blue}    />
                    <EntityTag label="State"      value={result.entities.state}    color={C.blue}    />
                    <EntityTag label="Time"       value={result.entities.time}     color={C.amber}   />
                    <EntityTag label="Severity"   value={result.entities.severity} color={SEV_COLORS[result.severity] || C.primary} />
                  </div>

                  {/* Location coordinates */}
                  {result.location && (
                    <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                      <div style={{ color: C.faint, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>GPS Coordinates</div>
                      <div style={{ color: C.blue, fontWeight: 700, fontSize: '15px' }}>
                        {result.location.latitude}° N, {result.location.longitude}° E
                      </div>
                      <div style={{ color: C.muted, fontSize: '13px', marginTop: '4px' }}>
                        {result.location.name}, {result.location.state}
                      </div>
                    </div>
                  )}

                  {/* Confidence bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: C.faint, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Extraction Confidence</span>
                      <span style={{ color: result.confidence >= 0.7 ? C.green : C.amber, fontWeight: 700, fontSize: '13px' }}>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div style={{ height: '8px', background: C.surface2, borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${result.confidence * 100}%`, background: result.confidence >= 0.7 ? C.green : C.amber, borderRadius: '999px', transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ color: C.faint, fontSize: '12px', marginTop: '6px' }}>
                      {result.confidence >= 0.7 ? '✅ High confidence — automatically saved as incident' : '⚠️ Low confidence — manual review recommended'}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${C.border}` }}>
                    <Link to="/incidents" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', padding: '10px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
                      View Incidents <ChevronRight size={14} />
                    </Link>
                    <Link to="/map" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, padding: '10px 18px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      <MapPin size={14} /> View on Map
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '48px 28px', textAlign: 'center', marginBottom: '20px' }}>
                <Brain size={48} color={C.faint} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
                <div style={{ color: C.muted, fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>NER Results will appear here</div>
                <div style={{ color: C.faint, fontSize: '14px' }}>Paste a social media post on the left and click Extract Entities</div>
              </div>
            )}

            {/* Simulated Feed */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: C.text, fontWeight: 700, fontSize: '16px', margin: '0 0 4px' }}>Simulated Social Media Feed</h3>
                  <p style={{ color: C.faint, fontSize: '13px', margin: 0 }}>Demonstrates the automated NLP pipeline on realistic Nigerian posts</p>
                </div>
                <button onClick={runFeed} disabled={feedRunning} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: C.primarySoft, border: `1px solid ${C.primaryBorder}`,
                  borderRadius: '9px', padding: '9px 16px',
                  color: C.primary, fontSize: '13px', fontWeight: 700,
                  cursor: feedRunning ? 'not-allowed' : 'pointer', fontFamily: font,
                }}>
                  {feedRunning
                    ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                    : <><Radio size={14} /> Run Feed</>
                  }
                </button>
              </div>

              {feedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: C.faint, fontSize: '14px' }}>
                  Click "Run Feed" to process a batch of simulated social media posts
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {feedItems.map((item, i) => {
                    const mapped = TYPE_ICONS[item.event_type] || TYPE_ICONS.other;
                    const Icon   = mapped.icon;
                    return (
                      <div key={i} style={{
                        background: C.surface2, border: `1px solid ${C.border}`,
                        borderLeft: `3px solid ${mapped.color}`,
                        borderRadius: '10px', padding: '12px 14px', marginBottom: '8px',
                      }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${mapped.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={15} color={mapped.color} strokeWidth={2} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: C.text, fontSize: '13px', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.suggested_title}
                            </div>
                            <div style={{ color: C.faint, fontSize: '11px', fontStyle: 'italic', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{item.original_text}"
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ background: `${SEV_COLORS[item.severity]}20`, color: SEV_COLORS[item.severity], fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>{item.severity}</span>
                              {item.location && <span style={{ background: 'rgba(37,99,235,0.15)', color: C.blue, fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>📍 {item.location.name}</span>}
                              <span style={{ background: C.surface, color: C.faint, fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>{Math.round(item.confidence * 100)}% confidence</span>
                              <span style={{ background: C.surface, color: C.faint, fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>{item.source}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}