import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, useMap, ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle, Flame, Droplets, Car, Shield,
  MapPin, Clock, RefreshCw, Activity, Users,
  CheckCircle, Navigation, Phone, X,
  ChevronDown, Filter, Building
} from 'lucide-react';
import { incidentsAPI } from '../services/api';
import { C, font, TYPE_CONFIG, SEV_COLORS, normSev, cap, timeAgo } from '../theme';

/* ── Fix Leaflet icons ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Lagos center and bounds ── */
const LAGOS_CENTER = [6.5244, 3.3792];
const LAGOS_BOUNDS = [[6.35, 2.7], [6.75, 3.75]];

/* ── 18 Lagos response centers ── */
const LAGOS_CENTERS = [
  { id: 'lasema_hq',    name: 'LASEMA HQ',              type: ['fire','flood','medical','accident','other'], lat: 6.5833, lng: 3.3500, phone: '767',          address: 'Alausa, Ikeja'             },
  { id: 'lasema_lekki', name: 'LASEMA Lekki',            type: ['fire','flood','medical','accident','other'], lat: 6.4698, lng: 3.5852, phone: '767',          address: 'Lekki Phase 1'             },
  { id: 'fire_ikeja',   name: 'Fire Service — Ikeja',    type: ['fire'],                                      lat: 6.6018, lng: 3.3515, phone: '01-7944929',   address: 'Mobolaji Bank Anthony Way' },
  { id: 'fire_apapa',   name: 'Fire Service — Apapa',    type: ['fire'],                                      lat: 6.4477, lng: 3.3350, phone: '01-5452426',   address: 'Creek Road, Apapa'         },
  { id: 'fire_island',  name: 'Fire Service — Island',   type: ['fire'],                                      lat: 6.4541, lng: 3.3947, phone: '01-2630923',   address: 'Lagos Island'              },
  { id: 'fire_oshodi',  name: 'Fire Service — Oshodi',   type: ['fire'],                                      lat: 6.5550, lng: 3.3200, phone: '01-4523456',   address: 'Oshodi, Lagos'             },
  { id: 'police_ikeja', name: 'NPF — Ikeja Command',     type: ['crime','security'],                          lat: 6.5958, lng: 3.3200, phone: '07002-POLICE', address: 'Ikeja, Lagos'              },
  { id: 'police_vi',    name: 'NPF — Bar Beach Div.',    type: ['crime','security'],                          lat: 6.4281, lng: 3.4219, phone: '07002-POLICE', address: 'Victoria Island'           },
  { id: 'police_apapa', name: 'NPF — Apapa Division',    type: ['crime','security'],                          lat: 6.4520, lng: 3.3700, phone: '07002-POLICE', address: 'Apapa, Lagos'              },
  { id: 'luth',         name: 'LUTH',                    type: ['medical'],                                   lat: 6.5158, lng: 3.3462, phone: '01-8005677',   address: 'Idi-Araba, Surulere'       },
  { id: 'gen_island',   name: 'Lagos Island Gen. Hosp.', type: ['medical'],                                   lat: 6.4530, lng: 3.3958, phone: '01-2660100',   address: 'Broad Street, Island'      },
  { id: 'gbagada_hosp', name: 'Gbagada General Hosp.',   type: ['medical'],                                   lat: 6.5500, lng: 3.3833, phone: '01-7737882',   address: 'Gbagada, Lagos'            },
  { id: 'eko_hosp',     name: 'Eko Hospital',             type: ['medical'],                                   lat: 6.6000, lng: 3.3300, phone: '01-4931071',   address: 'GRA Ikeja, Lagos'          },
  { id: 'nema_lagos',   name: 'NEMA Lagos Office',        type: ['flood','other'],                             lat: 6.5944, lng: 3.3478, phone: '0800-CALLNEMA', address: 'Oregun, Ikeja'            },
  { id: 'frsc_lagos',   name: 'FRSC — Lagos Command',     type: ['accident'],                                  lat: 6.6500, lng: 3.3700, phone: '122',           address: 'Lagos-Ibadan Expressway'   },
  { id: 'frsc_apapa',   name: 'FRSC — Apapa Unit',        type: ['accident'],                                  lat: 6.4400, lng: 3.3800, phone: '122',           address: 'Apapa, Lagos'              },
];

/* ── Haversine distance ── */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return +(R * 2 * Math.asin(Math.sqrt(a))).toFixed(1);
};

const nearestCenter = (lat, lng, type) => {
  let best = null, bestDist = Infinity;
  LAGOS_CENTERS.forEach(c => {
    if (!c.type.includes(type) && !c.type.includes('other') && type !== 'other') return;
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < bestDist) { bestDist = d; best = { ...c, distance_km: d, eta_minutes: Math.round((d / 25) * 60) + 3 }; }
  });
  return best;
};

const etaColor = eta => eta <= 5 ? '#047857' : eta <= 15 ? '#D97706' : '#CC2200';

/* ── Map icon ── */
const createIcon = (color, severity) => {
  const size  = severity === 'critical' ? 36 : severity === 'high' ? 30 : 24;
  const pulse = severity === 'critical' || severity === 'high';
  return L.divIcon({
    className: '',
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
    html: `
      <div style="position:relative;width:${size}px;height:${size + 10}px;">
        ${pulse ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${size + 24}px;height:${size + 24}px;border-radius:50%;background:${color};opacity:0.14;animation:cpulse 1.8s ease-out infinite;"></div>` : ''}
        <div style="width:${size}px;height:${size}px;background:${color};border:2.5px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 12px ${color}88,0 2px 5px rgba(0,0,0,0.35);position:absolute;top:0;left:0;"></div>
        <div style="width:${size * 0.38}px;height:${size * 0.38}px;background:#fff;border-radius:50%;position:absolute;top:${size * 0.31}px;left:${size * 0.31}px;"></div>
      </div>
      <style>@keyframes cpulse{0%{opacity:0.35;transform:translate(-50%,-50%) scale(0.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.2)}}</style>
    `,
  });
};

/* Center type → color + symbol */
const CENTER_STYLE = {
  lasema:  { color: '#CC2200', symbol: '🚨', label: 'LASEMA'    },
  fire:    { color: '#EF4444', symbol: '🔥', label: 'Fire'      },
  police:  { color: '#2563EB', symbol: '👮', label: 'Police'    },
  medical: { color: '#10B981', symbol: '🏥', label: 'Hospital'  },
  nema:    { color: '#8B5CF6', symbol: '⛑',  label: 'NEMA'      },
  frsc:    { color: '#D97706', symbol: '🚗', label: 'FRSC'      },
};

const getCenterType = (center) => {
  if (center.id.startsWith('lasema'))  return 'lasema';
  if (center.id.startsWith('fire'))    return 'fire';
  if (center.id.startsWith('police'))  return 'police';
  if (center.id.startsWith('luth') || center.id.startsWith('gen') || center.id.startsWith('gbagada') || center.id.startsWith('eko')) return 'medical';
  if (center.id.startsWith('nema'))    return 'nema';
  if (center.id.startsWith('frsc'))    return 'frsc';
  return 'lasema';
};

const createCenterIcon = (center) => {
  const ctype = getCenterType(center);
  const style = CENTER_STYLE[ctype];
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    html: `<div style="width:28px;height:28px;background:${style.color};border:2.5px solid #fff;border-radius:8px;box-shadow:0 2px 10px ${style.color}88;display:flex;align-items:center;justify-content:center;font-size:13px;">
      ${style.symbol}
    </div>`,
  });
};

/* Incident type → which center categories can handle it */
const TYPE_TO_CENTER = {
  fire:     ['lasema','fire'],
  flood:    ['lasema','nema'],
  accident: ['frsc','lasema','medical'],
  medical:  ['medical','lasema'],
  crime:    ['police'],
  security: ['police'],
  protest:  ['police','lasema'],
  other:    ['lasema','nema'],
};

/* Enhanced nearestCenter — matches incident type to appropriate center category */
const nearestCenterForType = (lat, lng, incidentType) => {
  const allowedCategories = TYPE_TO_CENTER[incidentType] || ['lasema'];
  let best = null, bestDist = Infinity;

  LAGOS_CENTERS.forEach(c => {
    const ctype = getCenterType(c);
    if (!allowedCategories.includes(ctype)) return;
    const d = haversine(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = {
        ...c,
        centerType: ctype,
        centerLabel: CENTER_STYLE[ctype]?.label || ctype,
        distance_km: d,
        eta_minutes: Math.round((d / 25) * 60) + 3,
      };
    }
  });
  return best;
};

/* ── Lagos bounds enforcer ── */
function BoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(LAGOS_BOUNDS);
    map.on('drag', () => map.panInsideBounds(LAGOS_BOUNDS, { animate: false }));
  }, [map]);
  return null;
}

/* ── Route layer ── */
function RouteLayer({ route }) {
  if (!route || route.length < 2) return null;
  return (
    <>
      <Polyline positions={route} pathOptions={{ color: '#1D4ED8', weight: 4, opacity: 0.85, dashArray: null }} />
      <Polyline positions={route} pathOptions={{ color: '#fff', weight: 8, opacity: 0.18 }} />
    </>
  );
}

/* ═══════════════════
   MAIN MAP PAGE
═══════════════════ */
// export default function MapPage() {
//   const [incidents,    setIncidents]    = useState([]);
//   const [centers,      setCenters]      = useState(LAGOS_CENTERS);
//   const [loading,      setLoading]      = useState(true);
//   const [selected,     setSelected]     = useState(null);
//   const [showCenters,  setShowCenters]  = useState(true);
//   const [sevFilter,    setSevFilter]    = useState('all');
//   const [typeFilter,   setTypeFilter]   = useState('all');
//   const [route,        setRoute]        = useState(null);
//   const [routeInfo,    setRouteInfo]    = useState(null);
//   const [routeLoading, setRouteLoading] = useState(false);
//   const [panelOpen,    setPanelOpen]    = useState(false);
//   const [lastUpdate,   setLastUpdate]   = useState(null);
//   const [nearestState, setNearestState] = useState(null);
//   const mapRef        = useRef(null);
//   const location      = useLocation();
//   const didAutoSelect = useRef(false);

//   const load = useCallback(async () => {
//     try {
//       const res = await incidentsAPI.getAll({ limit: 100 });
//       const all = res.incidents || [];
//       setIncidents(all);
//       setLastUpdate(new Date());
//     } catch (e) {
//       console.error('Map load error:', e);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const manualRefresh = useCallback(() => {
//     setLoading(true);
//     setSelected(null);
//     setRoute(null);
//     setRouteInfo(null);
//     setNearestState(null);
//     setPanelOpen(false);
//     load();
//   }, [load]);

//   useEffect(() => {
//     load();
//     const t = setInterval(load, 30000);
//     return () => clearInterval(t);
//   }, [load]);

//   useEffect(() => {
//     const state = location.state;
//     if (!state?.incidentId || didAutoSelect.current) return;
//     if (incidents.length === 0) return;
//     didAutoSelect.current = true;
//     const inc = incidents.find(i => i.id === state.incidentId);
//     if (inc) {
//       const lat = parseFloat(inc.latitude) || state.lat;
//       const lng = parseFloat(inc.longitude) || state.lng;
//       if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
//         handlePinClick({ ...inc, lat, lng });
//       }
//     } else if (state.lat && state.lng) {
//       if (mapRef.current) mapRef.current.setView([state.lat, state.lng], 14, { animate: true });
//     }
//   }, [incidents, location.state]);

//     /* Fetch OSRM route from center to incident */
//   const fetchRoute = async (inc, center) => {
//     const incLat = inc.lat ?? parseFloat(inc.latitude);
//     const incLng = inc.lng ?? parseFloat(inc.longitude);
//     if (!incLat || !incLng || isNaN(incLat) || isNaN(incLng)) return;
//     setRouteLoading(true);
//     try {
//       const url = `https://router.project-osrm.org/route/v1/driving/${center.lng},${center.lat};${incLng},${incLat}?overview=full&geometries=geojson`;
//       const res = await fetch(url);
//       const data = await res.json();
//       if (data.routes?.[0]) {
//         const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
//         const duration = Math.round(data.routes[0].duration / 60);
//         const distance = (data.routes[0].distance / 1000).toFixed(1);
//         setRoute(coords);
//         setRouteInfo({ duration, distance });
//       }
//         } catch {
//       const fLat = inc.lat ?? parseFloat(inc.latitude);
//       const fLng = inc.lng ?? parseFloat(inc.longitude);
//       setRoute([[center.lat, center.lng], [fLat, fLng]]);
//       setRouteInfo({ duration: center.eta_minutes, distance: center.distance_km });
//     } finally { setRouteLoading(false); }
//   };

export default function MapPage() {
  const [incidents,    setIncidents]    = useState([]);
  const [centers,      setCenters]      = useState(LAGOS_CENTERS);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [nearestState, setNearestState] = useState(null);
  const [showCenters,  setShowCenters]  = useState(true);
  const [sevFilter,    setSevFilter]    = useState('all');
  const [typeFilter,   setTypeFilter]   = useState('all');
  const [route,        setRoute]        = useState(null);
  const [routeInfo,    setRouteInfo]    = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [lastUpdate,   setLastUpdate]   = useState(null);
  const mapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await incidentsAPI.getAll({ limit: 100 });
      setIncidents(res.incidents || []);
      setLastUpdate(new Date());
    } catch (e) {
      console.error('Map load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const manualRefresh = useCallback(() => {
    setLoading(true);
    setSelected(null);
    setNearestState(null);
    setRoute(null);
    setRouteInfo(null);
    setPanelOpen(false);
    load();
  }, [load]);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const fetchRoute = async (lat, lng, center) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;
    setRouteLoading(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${center.lng},${center.lat};${lng},${lat}?overview=full&geometries=geojson`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]) {
        const coords   = data.routes[0].geometry.coordinates.map(([ln, lt]) => [lt, ln]);
        const duration = Math.round(data.routes[0].duration / 60);
        const distance = (data.routes[0].distance / 1000).toFixed(1);
        setRoute(coords);
        setRouteInfo({ duration, distance });
      }
    } catch {
      setRoute([[center.lat, center.lng], [lat, lng]]);
      setRouteInfo({ duration: center.eta_minutes, distance: center.distance_km });
    } finally {
      setRouteLoading(false);
    }
  };

  const handlePinClick = (inc) => {
    // lat/lng are always present (set by withCoords from LGA centroids)
    const lat = inc.lat ?? parseFloat(inc.latitude);
    const lng = inc.lng ?? parseFloat(inc.longitude);

    setSelected({ ...inc, lat, lng });
    setRoute(null);
    setRouteInfo(null);
    setNearestState(null);
    setPanelOpen(true);

    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const nearest = nearestCenterForType(lat, lng, inc.type || 'other');
      if (nearest) {
        setNearestState(nearest);
        fetchRoute(lat, lng, nearest);
      }
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 14, { animate: true });
      }
    }
  };













  // const handlePinClick = (inc) => {
  //   setSelected(inc);
  //   setRoute(null);
  //   setRouteInfo(null);

  //   if (inc.latitude && inc.longitude) {
  //     const nearest = nearestCenterForType(parseFloat(inc.latitude), parseFloat(inc.longitude), inc.type || 'other');
  //     if (nearest) {
  //       inc._nearest = nearest;
  //       fetchRoute(inc, nearest);
  //     }
  //   }
  //   if (mapRef.current && inc.latitude && inc.longitude) {
  //     mapRef.current.setView([parseFloat(inc.latitude), parseFloat(inc.longitude)], 14, { animate: true });
  //   }
  // };











  //   const handlePinClick = (inc) => {
  //   const lat = inc.lat ?? parseFloat(inc.latitude);
  //   const lng = inc.lng ?? parseFloat(inc.longitude);
  //   setSelected({ ...inc, lat, lng });
  //   setRoute(null);
  //   setRouteInfo(null);
  //   setPanelOpen(true);

  //   if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
  //     const nearest = nearestCenterForType(lat, lng, inc.type || 'other');
  //     if (nearest) {
  //       setNearestState(nearest);
  //       fetchRoute({ ...inc, latitude: lat, longitude: lng }, nearest);
  //     }
  //     if (mapRef.current) {
  //       mapRef.current.setView([lat, lng], 14, { animate: true });
  //     }
  //   }
  // };

  /* Filter incidents */
  const filtered = incidents.filter(inc => {
    const sev  = normSev(inc.severity);
    if (sevFilter !== 'all' && sev !== sevFilter) return false;
    if (typeFilter !== 'all' && (inc.type || 'other') !== typeFilter) return false;
    return true;
  });

  /* ── LGA centroids for incidents without GPS ──
     Deliberately offset from response center coords so pins never overlap.
     Each LGA has a unique centroid + a small per-incident jitter so even
     multiple incidents in the same LGA are visually separated. */
  const LGA_CENTROIDS = {
    'Agege':             [6.6220, 3.3250], 'Ajeromi-Ifelodun': [6.4620, 3.3380],
    'Alimosho':          [6.5650, 3.2800], 'Amuwo-Odofin':     [6.4680, 3.2900],
    'Apapa':             [6.4420, 3.3620], 'Badagry':          [6.4100, 2.8900],
    'Epe':               [6.5880, 3.9800], 'Eti-Osa':          [6.4400, 3.5200],
    'Ibeju-Lekki':       [6.4450, 3.7200], 'Ifako-Ijaiye':     [6.6500, 3.3050],
    'Ikeja':             [6.5880, 3.3550], 'Ikorodu':          [6.6100, 3.5200],
    'Kosofe':            [6.5620, 3.3950], 'Lagos Island':     [6.4520, 3.3960],
    'Lagos Mainland':    [6.4980, 3.3720], 'Mushin':           [6.5300, 3.3650],
    'Ojo':               [6.4620, 3.2300], 'Oshodi-Isolo':     [6.5350, 3.3300],
    'Shomolu':           [6.5420, 3.3880], 'Surulere':         [6.5050, 3.3550],
  };
  // Deterministic jitter based on incident id so same incident always same position
  const jitter = (id, axis) => {
    const seed = (id * (axis === 0 ? 9301 : 4931) + 49297) % 233280;
    return (seed / 233280 - 0.5) * 0.018; // ±0.009 degrees ≈ ±1km
  };
  const withCoords = filtered.map((inc) => {
    if (inc.latitude && inc.longitude) {
      return { ...inc, lat: parseFloat(inc.latitude), lng: parseFloat(inc.longitude) };
    }
    // Try to match LGA
    const lgaKey = Object.keys(LGA_CENTROIDS).find(k =>
      (inc.lga || '').toLowerCase().includes(k.toLowerCase()) ||
      (inc.location || '').toLowerCase().includes(k.toLowerCase())
    );
    const base = lgaKey ? LGA_CENTROIDS[lgaKey] : [6.5244 + jitter(inc.id || 0, 0), 3.3792 + jitter(inc.id || 0, 1)];
    return {
      ...inc,
      lat: base[0] + jitter(inc.id || 0, 0),
      lng: base[1] + jitter(inc.id || 0, 1),
    };
  });

  const type   = selected ? TYPE_CONFIG[selected.type] || TYPE_CONFIG.other : null;
  const sevCol = selected ? SEV_COLORS[normSev(selected.severity)] || '#D97706' : null;
  const nearest = nearestState;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 62px)', background: C.bg, fontFamily: font, position: 'relative', zIndex: 0 }}>

      {/* Map toolbar */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', zIndex: 20, flexShrink: 0 }}>
        {/* Severity filter */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['all','All'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']].map(([v,l]) => {
            const sColor = v === 'all' ? '#CC2200' : SEV_COLORS[v] || '#CC2200';
            return (
              <button key={v} onClick={() => setSevFilter(v)} style={{ padding: '5px 11px', borderRadius: '7px', border: `1px solid ${sevFilter === v ? sColor : C.border}`, background: sevFilter === v ? `${sColor}18` : C.surface, color: sevFilter === v ? sColor : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font, transition: 'all 0.15s' }}>
                {l}
              </button>
            );
          })}
        </div>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '6px 10px', color: C.muted, fontSize: '12px', fontFamily: font, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {/* Centers toggle */}
        <button onClick={() => setShowCenters(v => !v)} style={{ padding: '5px 11px', borderRadius: '7px', border: `1px solid ${showCenters ? '#1D4ED8' : C.border}`, background: showCenters ? 'rgba(29,78,216,0.12)' : C.surface, color: showCenters ? '#1D4ED8' : C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
          <Building size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Response Centers
        </button>

        <button onClick={manualRefresh} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '7px', padding: '5px 11px', color: C.muted, fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
          <RefreshCw size={12} /> Refresh
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#047857' }} />
          <span style={{ color: C.faint, fontSize: '11px' }}>{filtered.length} incident{filtered.length !== 1 ? 's' : ''} on map · Lagos State</span>
        </div>
      </div>

      {/* Map + side panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* MAP */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            center={LAGOS_CENTER} zoom={11}
            minZoom={10} maxZoom={17}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            ref={mapRef}
          >
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <ZoomControl position="bottomright" />
            <BoundsEnforcer />
            <RouteLayer route={route} />

            {/* Incident markers */}
            {withCoords.map(inc => {
              const sev   = normSev(inc.severity);
              const color = SEV_COLORS[sev] || '#D97706';
              const icon  = createIcon(color, sev);
              return (
                <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={icon} eventHandlers={{ click: () => handlePinClick(inc) }}>
                  <Popup className="crisis-popup">
                    <div style={{ fontFamily: font, minWidth: '220px' }}>
                      <div style={{ background: color, padding: '10px 14px', margin: '-14px -14px 12px', borderRadius: '8px 8px 0 0' }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', lineHeight: 1.4 }}>{inc.title}</div>
                      </div>
                      <div style={{ color: '#374151', fontSize: '12px', marginBottom: '8px' }}>
                        {inc.location || 'Lagos State'}<br/>
                        <span style={{ color: '#6B7280' }}>{timeAgo(inc.created_at)} · {inc.source}</span>
                      </div>
                      <button onClick={() => handlePinClick(inc)} style={{ background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: font }}>
                        Show Route to Scene
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Response center markers */}
            {showCenters && centers.map(c => (
              <Marker key={c.id} position={[c.lat, c.lng]} icon={createCenterIcon(c)}>
                <Popup className="crisis-popup">
                  <div style={{ fontFamily: font, minWidth: '200px' }}>
                    <div style={{ padding: '10px 14px', margin: '-14px -14px 10px', background: CENTER_STYLE[getCenterType(c)]?.color || '#1D4ED8', borderRadius: '8px 8px 0 0' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px' }}>{c.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '10px', marginTop: '2px' }}>{CENTER_STYLE[getCenterType(c)]?.label} · {c.type.map(t => t.charAt(0).toUpperCase()+t.slice(1)).join(', ')}</div>
                    </div>
                    <div style={{ color: '#374151', fontSize: '12px', marginBottom: '6px' }}>{c.address}</div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: CENTER_STYLE[getCenterType(c)]?.color || '#1D4ED8', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                        <Phone size={12} /> {c.phone}
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* SIDE PANEL — incident detail + route */}
        {selected && (
          <div style={{ width: '320px', background: C.bgAlt, borderLeft: `1px solid ${C.border}`, overflowY: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', fontFamily: font }}>
            {/* Panel header */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, background: C.bgAlt, zIndex: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${type.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={16} color={type.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: C.text, fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</div>
                <div style={{ color: C.faint, fontSize: '11px', marginTop: '1px' }}>{cap(selected.type)} · {cap(normSev(selected.severity))}</div>
              </div>
              {/* <button onClick={() => { setSelected(null); setRoute(null); setRouteInfo(null); }} */}
              <button onClick={() => { setSelected(null); setNearestState(null); setRoute(null); setRouteInfo(null); setPanelOpen(false); }}  
                style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>

            {/* Incident details */}
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Incident Details</div>
              {[
                { label: 'Location',  value: selected.location || 'Lagos State',  icon: MapPin },
                { label: 'Reported',  value: timeAgo(selected.created_at),         icon: Clock  },
                { label: 'Source',    value: selected.source,                       icon: AlertTriangle },
                { label: 'Status',    value: selected.status || 'Active',           icon: Activity },
                { label: 'Affected',  value: selected.affected > 0 ? `~${selected.affected} people` : 'Unknown', icon: Users },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <row.icon size={13} color={C.faint} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.faint, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                    <div style={{ color: C.text, fontSize: '12px', fontWeight: 600 }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Route panel — Google Maps style */}
            <div style={{ padding: '14px 16px', flex: 1 }}>
              <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Nearest {nearest?.centerLabel || 'Response Center'} — matched to {cap(selected?.type)} incident</div>

              {routeLoading ? (
                <div style={{ textAlign: 'center', padding: '24px', color: C.faint, fontSize: '13px' }}>
                  <Navigation size={20} color={C.faint} style={{ margin: '0 auto 8px' }} />
                  Calculating route...
                </div>
              ) : nearest ? (
                <>
                  {/* From / To route display */}
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                    {/* From */}
                    <div style={{ padding: '11px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2.5px solid #1D4ED8', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.faint, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>From</div>
                        <div style={{ color: C.text, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nearest.name}</div>
                        <div style={{ color: C.faint, fontSize: '11px' }}>{nearest.address}</div>
                      </div>
                    </div>

                    {/* Route line visual */}
                    <div style={{ padding: '0 14px', display: 'flex', alignItems: 'stretch', gap: 0, height: '20px' }}>
                      <div style={{ width: 10, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: 2, background: 'linear-gradient(#1D4ED8, #CC2200)', flex: 1 }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: '10px' }}>
                        <div style={{ flex: 1, height: '1px', background: `repeating-linear-gradient(90deg, ${C.border} 0, ${C.border} 4px, transparent 4px, transparent 8px)` }} />
                      </div>
                    </div>

                    {/* To */}
                    <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#CC2200', flexShrink: 0, boxShadow: '0 0 6px rgba(204,34,0,0.5)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: C.faint, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>To (Incident Scene)</div>
                        <div style={{ color: C.text, fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.title}</div>
                        <div style={{ color: C.faint, fontSize: '11px' }}>{selected.location || 'Lagos State'}</div>
                      </div>
                    </div>
                  </div>

                  {/* ETA / Distance stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ color: etaColor(routeInfo?.duration || nearest.eta_minutes), fontWeight: 800, fontSize: '22px', lineHeight: 1, marginBottom: '3px' }}>
                        {routeInfo?.duration || nearest.eta_minutes}
                      </div>
                      <div style={{ color: C.faint, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Minutes ETA</div>
                    </div>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ color: '#1D4ED8', fontWeight: 800, fontSize: '22px', lineHeight: 1, marginBottom: '3px' }}>
                        {routeInfo?.distance || nearest.distance_km}
                      </div>
                      <div style={{ color: C.faint, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>km Away</div>
                    </div>
                  </div>

                  {/* ETA color note */}
                  <div style={{ background: `${etaColor(routeInfo?.duration || nearest.eta_minutes)}12`, border: `1px solid ${etaColor(routeInfo?.duration || nearest.eta_minutes)}30`, borderRadius: '9px', padding: '9px 12px', marginBottom: '12px' }}>
                    <div style={{ color: etaColor(routeInfo?.duration || nearest.eta_minutes), fontSize: '12px', fontWeight: 600 }}>
                      {(routeInfo?.duration || nearest.eta_minutes) <= 5 ? 'Very close — response expected imminently' :
                       (routeInfo?.duration || nearest.eta_minutes) <= 15 ? 'Route displayed on map — center dispatched' :
                       'Center is far — consider requesting additional backup'}
                    </div>
                  </div>

                  {/* Call center */}
                  {nearest.phone && (
                    <a href={`tel:${nearest.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: '#CC2200', color: '#fff', borderRadius: '10px', padding: '11px', textDecoration: 'none', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                      <Phone size={14} /> Call {nearest.name}
                    </a>
                  )}
                  <Link to="/incidents" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: '10px', padding: '10px', textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                    View Incident Details
                  </Link>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: C.faint, fontSize: '13px' }}>
                  <MapPin size={18} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  No GPS coordinates for this incident
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '24px', left: '16px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '12px 16px', zIndex: 10 }}>
        <div style={{ color: C.faint, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Legend</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {Object.entries(SEV_COLORS).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v }} />
              <span style={{ color: C.muted, fontSize: '11px', textTransform: 'capitalize' }}>{k}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D4ED8' }} />
            <span style={{ color: C.muted, fontSize: '11px' }}>Response Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}