import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import { C, font, TYPE_CONFIG, SEV_COLORS, timeAgo } from '../theme';

/* ── Global toast queue ── */
let _addToast = null;
export const showToast = (toast) => { if (_addToast) _addToast(toast); };

export const notifyNewIncident = (incident) => {
  showToast({
    type:     incident.severity === 'critical' || incident.severity === 'high' ? 'critical' : 'info',
    title:    `🚨 New ${incident.severity?.toUpperCase()} Incident`,
    body:     incident.title,
    sub:      incident.location || 'Lagos',
    source:   incident.source,
    incidentId: incident.id,
  });
  // Play sound
  playAlertSound(incident.severity);
};

const playAlertSound = (severity) => {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const time = ctx.currentTime;
    const isCritical = severity === 'critical' || severity === 'high';

    if (isCritical) {
      [0, 0.28, 0.56].forEach(offset => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 880; osc.type = 'sine';
        gain.gain.setValueAtTime(0, time + offset);
        gain.gain.linearRampToValueAtTime(0.35, time + offset + 0.04);
        gain.gain.linearRampToValueAtTime(0, time + offset + 0.2);
        osc.start(time + offset); osc.stop(time + offset + 0.3);
      });
    } else {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 523; osc.type = 'sine';
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.25, time + 0.05);
      gain.gain.linearRampToValueAtTime(0, time + 0.4);
      osc.start(time); osc.stop(time + 0.5);
    }
  } catch (e) {}
};

/* ── Toast item ── */
const Toast = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, toast.duration || 6000);
    return () => clearTimeout(t);
  }, []);

  const borderColors = {
    critical: '#FF3B30',
    high:     '#CC2200',
    medium:   '#F59E0B',
    low:      '#10B981',
    info:     '#2563EB',
    success:  '#10B981',
  };
  const borderColor = borderColors[toast.type] || borderColors.info;

  return (
    <div style={{
      display: 'flex', gap: '12px', alignItems: 'flex-start',
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '14px',
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: '340px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(20px)',
      transition: 'opacity 0.3s, transform 0.3s',
      fontFamily: font,
    }}>
      {/* Icon */}
      <div style={{ width: 36, height: 36, borderRadius: '9px', background: `${borderColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <AlertTriangle size={18} color={borderColor} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', marginBottom: '3px', lineHeight: 1.4 }}>{toast.title}</div>
        {toast.body && <div style={{ color: C.muted, fontSize: '12px', lineHeight: 1.5, marginBottom: '4px' }}>{toast.body}</div>}
        {toast.sub && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.faint, fontSize: '11px' }}><span>&#9679;</span> {toast.sub}</div>}
        {toast.source && <div style={{ color: C.faint, fontSize: '11px', marginTop: '2px' }}>📡 {toast.source}</div>}
      </div>

      {/* Dismiss */}
      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', padding: '2px', display: 'flex', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = C.text}
        onMouseLeave={e => e.currentTarget.style.color = C.faint}>
        <X size={14} />
      </button>
    </div>
  );
};

/* ── Toast container — mount in App.jsx ── */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts(t => [...t, { ...toast, id: Date.now() }]);
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(toast => toast.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      gap: '10px', alignItems: 'flex-end',
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}
