/**
 * SocialIcons.jsx
 * ─────────────────────────────────────────────────────────
 * Real brand icons via react-icons (FaXTwitter, FaFacebook, FaWhatsapp)
 * plus a newspaper icon for news sources.
 *
 * INSTALL (run once in your project root):
 *   npm install react-icons
 *
 * Usage:
 *   import { TwitterIcon, FacebookIcon, WhatsAppIcon, NewsIcon, SourceIcon } from '../components/SocialIcons';
 *
 *   <TwitterIcon size={20} />
 *   <FacebookIcon size={20} />
 *   <WhatsAppIcon size={20} />
 *   <NewsIcon size={20} />
 *
 *   // Or pass a source string and get the right icon automatically:
 *   <SourceIcon source="twitter" size={18} />
 *   <SourceIcon source="facebook" size={18} />
 *   <SourceIcon source="whatsapp" size={18} />
 *   <SourceIcon source="news" size={18} />
 *   <SourceIcon source="app" size={18} />   ← falls back to lucide Bell
 */

import React from 'react';

// ── react-icons brand icons ──────────────────────────────
// X (Twitter)  — FaXTwitter  (added in Font Awesome 6.5 / react-icons 5)
// Facebook     — FaFacebook
// WhatsApp     — FaWhatsapp
import { FaXTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa6';

// Newspaper for news/RSS — using Font Awesome 6 regular set
import { FaRegNewspaper } from 'react-icons/fa6';

// App reports fallback — lucide Bell
import { Bell } from 'lucide-react';

/* ── Colour constants (matches the app palette) ── */
export const BRAND_COLORS = {
  twitter:   '#000000',   // X is black now
  facebook:  '#1877F2',
  whatsapp:  '#25D366',
  news:      '#D97706',   // amber — matches theme
  app:       '#CC2200',   // CrisisWatch red
};

/* ── Individual named exports ── */

export function TwitterIcon({ size = 20, color, style = {} }) {
  return <FaXTwitter size={size} color={color || BRAND_COLORS.twitter} style={style} />;
}

export function FacebookIcon({ size = 20, color, style = {} }) {
  return <FaFacebook size={size} color={color || BRAND_COLORS.facebook} style={style} />;
}

export function WhatsAppIcon({ size = 20, color, style = {} }) {
  return <FaWhatsapp size={size} color={color || BRAND_COLORS.whatsapp} style={style} />;
}

export function NewsIcon({ size = 20, color, style = {} }) {
  return <FaRegNewspaper size={size} color={color || BRAND_COLORS.news} style={style} />;
}

export function AppIcon({ size = 20, color, style = {} }) {
  return <Bell size={size} color={color || BRAND_COLORS.app} strokeWidth={2} style={style} />;
}

/**
 * SourceIcon — auto-picks the right icon given a source string.
 * Handles all the naming variants that come from the backend.
 *
 * @param {string}  source  — 'twitter'|'x'|'facebook'|'whatsapp'|'news'|'rss'|'app'|'report'
 * @param {number}  size
 * @param {string}  color   — override; default is the brand colour
 */
export function SourceIcon({ source = '', size = 18, color }) {
  const s = source.toLowerCase();

  if (s === 'twitter' || s === 'x' || s === 'x (twitter)') {
    return <TwitterIcon size={size} color={color} />;
  }
  if (s === 'facebook') {
    return <FacebookIcon size={size} color={color} />;
  }
  if (s === 'whatsapp') {
    return <WhatsAppIcon size={size} color={color} />;
  }
  if (s === 'news' || s === 'rss' || s === 'news rss' || s === 'channels tv' || s === 'punch' || s === 'vanguard' || s === 'premium times' || s === 'the nation') {
    return <NewsIcon size={size} color={color} />;
  }
  // Default — app report
  return <AppIcon size={size} color={color} />;
}

/**
 * SourceBadge — icon + label in a coloured pill, ready to drop anywhere.
 *
 * <SourceBadge source="twitter" />
 * <SourceBadge source="facebook" label="Facebook" />
 */
export function SourceBadge({ source = '', label, size = 13 }) {
  const s = source.toLowerCase();
  const color =
    s.includes('twitter') || s === 'x'   ? BRAND_COLORS.twitter  :
    s.includes('facebook')                ? BRAND_COLORS.facebook :
    s.includes('whatsapp')                ? BRAND_COLORS.whatsapp :
    s.includes('news') || s.includes('rss') || s.includes('channels') || s.includes('punch') || s.includes('vanguard') || s.includes('premium') || s.includes('nation') ? BRAND_COLORS.news :
    BRAND_COLORS.app;

  const displayLabel = label || (
    s.includes('twitter') || s === 'x' ? 'X'         :
    s.includes('facebook')              ? 'Facebook'  :
    s.includes('whatsapp')              ? 'WhatsApp'  :
    s.includes('news') || s.includes('rss') ? 'News' :
    'App'
  );

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: `${color}15`,
      border: `1px solid ${color}30`,
      borderRadius: '999px', padding: '3px 9px',
    }}>
      <SourceIcon source={source} size={size - 1} color={color} />
      <span style={{ color, fontSize: `${size}px`, fontWeight: 700, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {displayLabel}
      </span>
    </span>
  );
}
