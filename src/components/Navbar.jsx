import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertTriangle, Bell, Menu, X, Shield, LogOut,
  Settings, Sun, Moon, BarChart2, Radio,
  ChevronDown, Home, LayoutDashboard, Map,
  List, FileText, Info,
} from 'lucide-react';
import { isLoggedIn, clearToken } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const font = "'DM Sans', system-ui, sans-serif";

/* ── Primary nav links (always visible in desktop bar) ── */
const PRIMARY = [
  { to: '/',          label: 'Home',      icon: Home           },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  { to: '/map',       label: 'Map',       icon: Map            },
  { to: '/incidents', label: 'Incidents', icon: List           },
  { to: '/report',    label: 'Report',    icon: FileText       },
];

/* ── "More" dropdown links ── */
const MORE = [
  { to: '/analytics', label: 'Analytics',          icon: BarChart2, desc: 'Charts & hotspot data'      },
  { to: '/responder', label: 'Response Centers',   icon: Radio,     desc: 'Units, assignments, tracking'},
  { to: '/about',     label: 'About',              icon: Info,      desc: 'About this project'          },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [open,      setOpen]      = useState(false);   // mobile menu
  const [moreOpen,  setMoreOpen]  = useState(false);   // More dropdown
  const [scrolled,  setScrolled]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 860);
  const [liveCount, setLiveCount] = useState(0);
  const { pathname } = useLocation();
  const moreRef = useRef(null);

  const isDark = theme === 'dark';
  const moreActive = MORE.some(l => pathname === l.to);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      const mobile = window.innerWidth < 860;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* Close More dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setOpen(false); setMoreOpen(false); }, [pathname]);

  /* Live count */
  useEffect(() => {
    const fetchCount = () => {
      fetch('http://localhost:5000/api/incidents/?limit=1')
        .then(r => r.json())
        .then(d => setLiveCount(d.total || 0))
        .catch(() => {});
    };
    fetchCount();
    const t = setInterval(fetchCount, 30000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { clearToken(); window.location.href = '/login'; };

  const navBg    = scrolled
    ? isDark ? 'rgba(6,12,23,0.97)' : 'rgba(255,255,255,0.97)'
    : isDark ? '#060C17'            : '#FFFFFF';
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  const textCol   = isDark ? '#E8EDF5'                : '#111827';
  const mutedCol  = isDark ? 'rgba(232,237,245,0.5)'  : '#4B5563';
  const surfCol   = isDark ? '#1A2438'                : '#F1F4F9';
  const dropBg    = isDark ? '#111827'                : '#FFFFFF';

  const linkStyle = (active) => ({
    padding: '6px 11px', borderRadius: '7px',
    fontSize: '13px', fontWeight: active ? 700 : 500,
    textDecoration: 'none', transition: 'all 0.15s',
    color:      active ? '#CC2200' : mutedCol,
    background: active ? 'rgba(204,34,0,0.1)' : 'transparent',
    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px',
  });

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 1000,
        background: navBg,
        borderBottom: `1px solid ${borderCol}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        fontFamily: font,
        transition: 'background 0.3s, border-color 0.25s',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', height: '62px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px',
        }}>

          {/* LOGO */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, background: '#CC2200', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(204,34,0,0.4)', flexShrink: 0 }}>
              <AlertTriangle size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: textCol, fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em' }}>CrisisWatch</div>
              <div style={{ color: '#CC2200', fontSize: '8px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>LAGOS</div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {PRIMARY.map(l => {
                const active = pathname === l.to;
                return (
                  <Link key={l.to} to={l.to} style={linkStyle(active)}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = textCol; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = mutedCol; e.currentTarget.style.background = 'transparent'; }}}
                  >
                    {l.label}
                  </Link>
                );
              })}

              {/* ── MORE DROPDOWN ── */}
              <div ref={moreRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMoreOpen(v => !v)}
                  style={{
                    ...linkStyle(moreActive),
                    border: 'none', cursor: 'pointer', fontFamily: font,
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                  onMouseEnter={e => { if (!moreActive) { e.currentTarget.style.color = textCol; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'; }}}
                  onMouseLeave={e => { if (!moreActive) { e.currentTarget.style.color = mutedCol; e.currentTarget.style.background = 'transparent'; }}}
                >
                  More
                  <ChevronDown size={13} style={{ transform: moreOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>

                {moreOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
                    background: dropBg, border: `1px solid ${borderCol}`,
                    borderRadius: '14px', padding: '8px', minWidth: '230px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
                    zIndex: 200,
                  }}>
                    {/* tiny arrow */}
                    <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, background: dropBg, border: `1px solid ${borderCol}`, borderBottom: 'none', borderRight: 'none', rotate: '45deg' }} />
                    {MORE.map(l => {
                      const active = pathname === l.to;
                      const Icon = l.icon;
                      return (
                        <Link key={l.to} to={l.to} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px', borderRadius: '10px', textDecoration: 'none',
                          background: active ? 'rgba(204,34,0,0.1)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ width: 34, height: 34, borderRadius: '9px', background: active ? 'rgba(204,34,0,0.15)' : surfCol, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} color={active ? '#CC2200' : mutedCol} strokeWidth={2} />
                          </div>
                          <div>
                            <div style={{ color: active ? '#CC2200' : textCol, fontWeight: 700, fontSize: '13px' }}>{l.label}</div>
                            <div style={{ color: mutedCol, fontSize: '11px', marginTop: '1px' }}>{l.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIGHT ICONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {!isMobile && (
              <>
                {liveCount > 0 && (
                  <Link to="/incidents" title={`${liveCount} active incidents`} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)', borderRadius: '999px', padding: '4px 10px', textDecoration: 'none' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC2200', display: 'inline-block', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
                    <span style={{ color: '#CC2200', fontSize: '11px', fontWeight: 700 }}>{liveCount}</span>
                  </Link>
                )}
                <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: `1px solid ${borderCol}`, borderRadius: '8px', cursor: 'pointer', color: mutedCol, transition: 'all 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'; e.currentTarget.style.color = textCol; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = borderCol; e.currentTarget.style.color = mutedCol; }}>
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
                <Link to="/alerts" title="Alerts" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mutedCol, textDecoration: 'none', flexShrink: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = textCol}
                  onMouseLeave={e => e.currentTarget.style.color = mutedCol}>
                  <Bell size={17} />
                </Link>
                <Link to="/settings" title="Settings" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: mutedCol, textDecoration: 'none', flexShrink: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = textCol}
                  onMouseLeave={e => e.currentTarget.style.color = mutedCol}>
                  <Settings size={16} />
                </Link>
                {isLoggedIn() ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link to="/profile" title="Profile" style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #CC2200, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#fff', textDecoration: 'none', flexShrink: 0 }}>DP</Link>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: `1px solid ${borderCol}`, borderRadius: '7px', padding: '5px 10px', color: mutedCol, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s', flexShrink: 0 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#CC2200'; e.currentTarget.style.borderColor = 'rgba(204,34,0,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = mutedCol; e.currentTarget.style.borderColor = borderCol; }}>
                      <LogOut size={12} /> Out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#CC2200', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
                    <Shield size={13} /> Login
                  </Link>
                )}
              </>
            )}

            {/* HAMBURGER */}
            {isMobile && (
              <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', color: mutedCol, cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}>
                {open ? <X size={22} color={textCol} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobile && open && (
        <div style={{
          position: 'fixed', top: '62px', left: 0, right: 0, bottom: 0,
          background: isDark ? 'rgba(6,12,23,0.98)' : 'rgba(238,241,247,0.98)',
          backdropFilter: 'blur(16px)', zIndex: 99,
          display: 'flex', flexDirection: 'column',
          padding: '20px', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
            {[...PRIMARY, ...MORE].map(l => {
              const active = pathname === l.to;
              const Icon = l.icon;
              return (
                <Link key={l.to} to={l.to} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderRadius: '11px', fontSize: '16px', fontWeight: active ? 700 : 500, textDecoration: 'none', color: active ? '#CC2200' : textCol, background: active ? 'rgba(204,34,0,0.1)' : 'transparent', borderLeft: `3px solid ${active ? '#CC2200' : 'transparent'}`, transition: 'all 0.15s' }}>
                  <Icon size={18} color={active ? '#CC2200' : mutedCol} strokeWidth={2} />
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div style={{ height: '1px', background: borderCol, marginBottom: '16px' }} />

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={toggleTheme} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: surfCol, border: `1px solid ${borderCol}`, borderRadius: '10px', color: mutedCol, fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link to="/settings" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px', background: surfCol, border: `1px solid ${borderCol}`, borderRadius: '10px', color: mutedCol, fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <Settings size={15} /> Settings
            </Link>
          </div>

          {liveCount > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <Link to="/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(204,34,0,0.1)', border: '1px solid rgba(204,34,0,0.3)', borderRadius: '999px', padding: '6px 14px', textDecoration: 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#CC2200', display: 'inline-block' }} />
                <span style={{ color: '#CC2200', fontSize: '13px', fontWeight: 700 }}>{liveCount} Active Right Now</span>
              </Link>
            </div>
          )}

          {isLoggedIn() ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'rgba(204,34,0,0.08)', border: '1px solid rgba(204,34,0,0.25)', borderRadius: '12px', textDecoration: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #CC2200, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>DP</div>
                <div>
                  <div style={{ color: textCol, fontWeight: 700, fontSize: '14px' }}>My Profile</div>
                  <div style={{ color: mutedCol, fontSize: '12px' }}>View & edit your account</div>
                </div>
              </Link>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(204,34,0,0.08)', border: '1px solid rgba(204,34,0,0.2)', borderRadius: '11px', padding: '13px', color: '#CC2200', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#CC2200', color: '#fff', padding: '13px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}>
              <Shield size={15} /> Login / Register
            </Link>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}
