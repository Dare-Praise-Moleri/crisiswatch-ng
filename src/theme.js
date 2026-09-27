/**
 * CrisisWatch Theme — CSS variables drive dark/light mode.
 * No emojis anywhere. Icons are handled per-component via lucide/react-icons.
 */

export const font = "'DM Sans', system-ui, sans-serif";

export const C = {
  primary:       '#CC2200',
  primaryHover:  '#A81B00',
  primarySoft:   'var(--primary-soft)',
  primaryBorder: 'var(--primary-border)',
  blue:          'var(--blue)',
  blueSoft:      'var(--blue-soft)',
  green:         'var(--green)',
  greenSoft:     'var(--green-soft)',
  amber:         'var(--amber)',
  amberSoft:     'var(--amber-soft)',
  purple:        'var(--purple)',
  purpleSoft:    'var(--purple-soft)',
  bg:            'var(--bg)',
  bgAlt:         'var(--bg-alt)',
  surface:       'var(--surface)',
  surface2:      'var(--surface2)',
  surfaceHover:  'var(--surface-hover)',
  border:        'var(--border)',
  borderHover:   'var(--border-hover)',
  borderStrong:  'var(--border-strong)',
  text:          'var(--text)',
  textStrong:    'var(--text-strong)',
  muted:         'var(--muted)',
  faint:         'var(--faint)',
  inputBg:       'var(--input-bg)',
  inputBorder:   'var(--input-border)',
  cardShadow:    'var(--card-shadow)',
};

export const SEV_COLORS = {
  critical: '#FF3B30',
  high:     '#CC2200',
  medium:   '#D97706',
  low:      '#059669',
};

export const SEV_STYLE = {
  critical: { text: '#FF3B30', bg: 'rgba(255,59,48,0.12)',  border: '#FF3B30' },
  high:     { text: '#CC2200', bg: 'rgba(204,34,0,0.12)',   border: '#CC2200' },
  medium:   { text: '#D97706', bg: 'rgba(217,119,6,0.12)',  border: '#D97706' },
  low:      { text: '#059669', bg: 'rgba(5,150,105,0.12)',  border: '#059669' },
  Critical: { text: '#FF3B30', bg: 'rgba(255,59,48,0.12)',  border: '#FF3B30' },
  High:     { text: '#CC2200', bg: 'rgba(204,34,0,0.12)',   border: '#CC2200' },
  Medium:   { text: '#D97706', bg: 'rgba(217,119,6,0.12)',  border: '#D97706' },
  Low:      { text: '#059669', bg: 'rgba(5,150,105,0.12)',  border: '#059669' },
};

export const STATUS_STYLE = {
  Active:     { color: '#CC2200', bg: 'rgba(204,34,0,0.08)'  },
  Responding: { color: '#1D4ED8', bg: 'rgba(29,78,216,0.1)'  },
  Monitoring: { color: '#D97706', bg: 'rgba(217,119,6,0.1)'  },
  Resolved:   { color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
};

/** No emojis — lucide icon names are referenced per-component */
export const TYPE_CONFIG = {
  fire:     { color: '#CC2200', label: 'Fire'      },
  crime:    { color: '#D97706', label: 'Crime'     },
  flood:    { color: '#1D4ED8', label: 'Flood'     },
  accident: { color: '#6D28D9', label: 'Accident'  },
  medical:  { color: '#059669', label: 'Medical'   },
  security: { color: '#D97706', label: 'Security'  },
  protest:  { color: '#6D28D9', label: 'Unrest'    },
  other:    { color: '#6B7280', label: 'Other'     },
};

/** Brand colors only — actual icons come from SocialIcons.jsx (react-icons) */
export const SOURCE_CONFIG = {
  'X (Twitter)':      { color: '#E8EDF5', label: 'X (Twitter)'   },  
  'WhatsApp':         { color: '#25D366', label: 'WhatsApp'       },
  'Facebook':         { color: '#1877F2', label: 'Facebook'       },
  'User Report':      { color: '#CC2200', label: 'App Report'     },
  'Channels TV':      { color: '#6D28D9', label: 'Channels TV'    },
  'Punch Newspapers': { color: '#D97706', label: 'Punch'          },
  'Vanguard Nigeria': { color: '#059669', label: 'Vanguard'       },
  'Premium Times':    { color: '#1D4ED8', label: 'Premium Times'  },
  'The Nation':       { color: '#6B7280', label: 'The Nation'     },
};

export const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
};

export const normSev = (s) => s ? s.toLowerCase() : 'medium';
export const cap     = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export const LAGOS_AREAS = [
  'Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin',
  'Apapa','Badagry','Epe','Eti-Osa','Ibeju-Lekki',
  'Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island',
  'Lagos Mainland','Mushin','Ojo','Oshodi-Isolo','Shomolu','Surulere',
];
