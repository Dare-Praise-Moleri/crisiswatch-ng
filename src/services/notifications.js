/* ── CrisisWatch Notification Service ── */

// Create audio context for notification sounds
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

// Play emergency alert sound
export const playAlertSound = (severity = 'medium') => {
  try {
    const ctx  = getAudioCtx();
    const time = ctx.currentTime;

    if (severity === 'critical' || severity === 'high') {
      // Urgent beeping — 3 fast beeps
      [0, 0.3, 0.6].forEach(offset => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type            = 'sine';
        gain.gain.setValueAtTime(0, time + offset);
        gain.gain.linearRampToValueAtTime(0.4, time + offset + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + offset + 0.2);
        osc.start(time + offset);
        osc.stop(time + offset + 0.3);
      });
    } else {
      // Single soft chime for medium/low
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 523;
      osc.type            = 'sine';
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
      gain.gain.linearRampToValueAtTime(0, time + 0.4);
      osc.start(time);
      osc.stop(time + 0.5);
    }
  } catch (e) {
    console.log('Audio not available:', e);
  }
};

// Show browser notification
export const showBrowserNotification = (title, body, severity = 'medium') => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    const icons = {
      critical: '🔴',
      high:     '🟠',
      medium:   '🟡',
      low:      '🟢',
    };
    new Notification(`${icons[severity] || '🔴'} CrisisWatch Alert`, {
      body,
      icon:  '/vite.svg',
      badge: '/vite.svg',
      tag:   'crisiswatch-alert',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showBrowserNotification(title, body, severity);
      }
    });
  }
};

// Request notification permission on load
export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

// Main function — call this when new incident detected
export const notifyNewIncident = (incident) => {
  playAlertSound(incident.severity);
  showBrowserNotification(
    'New Emergency Detected',
    `${incident.title} — ${incident.location || 'Lagos'}`,
    incident.severity,
  );
};