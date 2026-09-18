import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Bell, Menu, X, Shield, LogOut } from 'lucide-react';
import { isLoggedIn, clearToken } from '../services/api';

const font = "'DM Sans', system-ui, sans-serif";
const C = {
  primary:      '#CC2200',
  primaryHover: '#A81B00',
  primarySoft:  'rgba(204,34,0,0.1)',
  primaryBorder:'rgba(204,34,0,0.3)',
  bg:           '#060C17',
  border:       'rgba(255,255,255,0.08)',
  text:         '#E8EDF5',
  muted:        'rgba(232,237,245,0.5)',
};

const links = [
  { to: '/',          label: 'Home'      },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/map',       label: 'Live Map'  },
  { to: '/incidents', label: 'Incidents' },
  { to: '/report',    label: 'Report'    },
  { to: '/nlp',       label: 'NLP'       },
  { to: '/about',     label: 'About'     },
];

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (window.innerWidth >= 900) setOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(6,12,23,0.98)' : C.bg,
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        fontFamily: font,
        transition: 'background 0.3s',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 24px', height: '68px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>

          {/* ── LOGO ── */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, background: C.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px rgba(204,34,0,0.4)` }}>
              <AlertTriangle size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: C.text, fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>CrisisWatch</div>
              <div style={{ color: C.primary, fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>NIGERIA</div>
            </div>
          </Link>

          {/* ── DESKTOP LINKS — perfectly centered ── */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {links.map(l => {
                const active = pathname === l.to;
                return (
                  <Link key={l.to} to={l.to} style={{
                    padding: '7px 14px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: active ? 600 : 500,
                    textDecoration: 'none', transition: 'all 0.15s',
                    color: active ? C.primary : C.muted,
                    background: active ? `${C.primary}15` : 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── RIGHT ACTIONS ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>

            {!isMobile && (
              <>
                {/* Live badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.12)', border: '1px solid rgba(204,34,0,0.35)', borderRadius: '999px', padding: '5px 12px' }}>
                  <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
                  <span style={{ color: C.primary, fontSize: '12px', fontWeight: 700 }}>3 Live</span>
                </div>

                {/* Bell */}
                <Link to="/alerts" style={{ position: 'relative', color: C.muted, textDecoration: 'none', display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = C.text}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                  <Bell size={20} />
                  <span style={{ position: 'absolute', top: -5, right: -5, background: C.primary, color: '#fff', fontSize: '9px', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</span>
                </Link>

              {/* Theme toggle */}
              <button
                onClick={() => document.body.classList.toggle('light')}
                title="Toggle light/dark mode"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px', width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.muted, transition: 'all 0.15s',
                  fontSize: '16px',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              >
                ☀️
              </button>

                {/* Auth buttons */}
                {isLoggedIn() ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/profile" style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, #2563EB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', textDecoration: 'none' }}>
                      DP
                    </Link>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: C.primarySoft, color: C.primary, border: `1px solid ${C.primaryBorder}`, padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: C.primary, color: '#fff', padding: '8px 18px', borderRadius: '9px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px rgba(204,34,0,0.35)` }}
                    onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                    onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                    <Shield size={14} /> Login
                  </Link>
                )}
              </>
            )}

            {/* ── HAMBURGER — mobile only ── */}
            {isMobile && (
              <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {open ? <X size={24} color={C.text} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE MENU — full overlay ── */}
      {isMobile && open && (
        <div style={{
          position: 'fixed', top: '68px', left: 0, right: 0, bottom: 0,
          background: 'rgba(6,12,23,0.98)',
          backdropFilter: 'blur(16px)',
          zIndex: 99,
          display: 'flex', flexDirection: 'column',
          padding: '24px',
          overflowY: 'auto',
        }}>
          {/* Nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
            {links.map(l => {
              const active = pathname === l.to;
              return (
                <Link key={l.to} to={l.to} style={{
                  display: 'block', padding: '14px 16px',
                  borderRadius: '12px', fontSize: '18px',
                  fontWeight: active ? 700 : 500,
                  textDecoration: 'none', transition: 'all 0.15s',
                  color: active ? C.primary : C.text,
                  background: active ? `${C.primary}15` : 'transparent',
                  borderLeft: `3px solid ${active ? C.primary : 'transparent'}`,
                }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: C.border, marginBottom: '24px' }} />

          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.12)', border: '1px solid rgba(204,34,0,0.35)', borderRadius: '999px', padding: '6px 14px' }}>
              <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
              <span style={{ color: C.primary, fontSize: '13px', fontWeight: 700 }}>3 Live Incidents</span>
            </div>
          </div>

          {/* Theme toggle mobile */}
          <button
            onClick={() => document.body.classList.toggle('light')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '12px', color: C.muted, fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: font, marginBottom: '12px', width: '100%' }}
          >
            ☀️ Toggle Light / Dark Mode
          </button>

          {/* Auth */}
          {isLoggedIn() ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: C.primarySoft, border: `1px solid ${C.primaryBorder}`, borderRadius: '12px', textDecoration: 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${C.primary}, #2563EB)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#fff' }}>DP</div>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>My Profile</div>
                  <div style={{ color: C.muted, fontSize: '12px' }}>View & edit your account</div>
                </div>
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(204,34,0,0.08)', border: `1px solid rgba(204,34,0,0.2)`, borderRadius: '12px', padding: '14px', color: C.primary, fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: C.primary, color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '16px', fontWeight: 700, textDecoration: 'none', boxShadow: `0 6px 20px rgba(204,34,0,0.3)` }}>
              <Shield size={16} /> Login / Register
            </Link>
          )}
        </div>
      )}
    </>
  );
}