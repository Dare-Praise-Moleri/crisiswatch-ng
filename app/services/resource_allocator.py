from datetime import datetime

# ── ALL LAGOS EMERGENCY RESPONSE CENTERS ──
LAGOS_CENTERS = {

  # ── LASEMA (Lagos State Emergency Management Agency) ──
  'lasema_hq': {
    'name':     'LASEMA Headquarters',
    'type':     ['fire','flood','medical','accident','other'],
    'address':  '1 Secretariat Road, Alausa, Ikeja',
    'lat':       6.5833, 'lng': 3.3500,
    'phone':    '767',
    'whatsapp': '08060907333',
    'capacity':  10,
    'available': 10,
  },
  'lasema_lekki': {
    'name':     'LASEMA Lekki Response Team',
    'type':     ['fire','flood','medical','accident','other'],
    'address':  'Lekki Phase 1, Lagos',
    'lat':       6.4345, 'lng': 3.4775,
    'phone':    '767',
    'whatsapp': '08060907333',
    'capacity':  5,
    'available': 5,
  },

  # ── LAGOS FIRE SERVICE ──
  'fire_ikeja': {
    'name':     'Lagos Fire Service — Ikeja',
    'type':     ['fire','explosion'],
    'address':  'Mobolaji Bank Anthony Way, Ikeja',
    'lat':       6.5958, 'lng': 3.3398,
    'phone':    '01-7944929',
    'whatsapp': None,
    'capacity':  6,
    'available': 6,
  },
  'fire_apapa': {
    'name':     'Lagos Fire Service — Apapa',
    'type':     ['fire','explosion'],
    'address':  'Creek Road, Apapa',
    'lat':       6.4483, 'lng': 3.3586,
    'phone':    '01-5452426',
    'whatsapp': None,
    'capacity':  4,
    'available': 4,
  },
  'fire_isale_eko': {
    'name':     'Lagos Fire Service — Isale Eko',
    'type':     ['fire','explosion'],
    'address':  'Lagos Island',
    'lat':       6.4550, 'lng': 3.3841,
    'phone':    '01-2630923',
    'whatsapp': None,
    'capacity':  4,
    'available': 4,
  },
  'fire_oshodi': {
    'name':     'Lagos Fire Service — Oshodi',
    'type':     ['fire','explosion'],
    'address':  'Oshodi, Lagos',
    'lat':       6.5480, 'lng': 3.3515,
    'phone':    '01-7944929',
    'whatsapp': None,
    'capacity':  4,
    'available': 4,
  },
  'fire_badagry': {
    'name':     'Lagos Fire Service — Badagry',
    'type':     ['fire','explosion'],
    'address':  'Badagry, Lagos',
    'lat':       6.4167, 'lng': 2.8833,
    'phone':    '01-7944929',
    'whatsapp': None,
    'capacity':  3,
    'available': 3,
  },

  # ── NIGERIA POLICE FORCE — LAGOS ──
  'police_ikeja': {
    'name':     'NPF — Ikeja Area Command',
    'type':     ['crime','security','protest'],
    'address':  '10 Mobolaji Bank Anthony Way, Ikeja',
    'lat':       6.5958, 'lng': 3.3398,
    'phone':    '07002-POLICE',
    'whatsapp': None,
    'capacity':  20,
    'available': 20,
  },
  'police_bar_beach': {
    'name':     'NPF — Bar Beach Division',
    'type':     ['crime','security'],
    'address':  'Bar Beach, Victoria Island',
    'lat':       6.4281, 'lng': 3.4219,
    'phone':    '07002-POLICE',
    'whatsapp': None,
    'capacity':  10,
    'available': 10,
  },
  'police_apapa': {
    'name':     'NPF — Apapa Division',
    'type':     ['crime','security'],
    'address':  'Apapa, Lagos',
    'lat':       6.4483, 'lng': 3.3586,
    'phone':    '07002-POLICE',
    'whatsapp': None,
    'capacity':  10,
    'available': 10,
  },
  'police_surulere': {
    'name':     'NPF — Surulere Division',
    'type':     ['crime','security'],
    'address':  'Surulere, Lagos',
    'lat':       6.5010, 'lng': 3.3603,
    'phone':    '07002-POLICE',
    'whatsapp': None,
    'capacity':  10,
    'available': 10,
  },

  # ── HOSPITALS / MEDICAL ──
  'luth': {
    'name':     'Lagos University Teaching Hospital (LUTH)',
    'type':     ['medical'],
    'address':  'Ishaga Road, Idi-Araba, Surulere',
    'lat':       6.5104, 'lng': 3.3603,
    'phone':    '01-8005677',
    'whatsapp': None,
    'capacity':  15,
    'available': 15,
  },
  'general_hospital_lagos': {
    'name':     'Lagos Island General Hospital',
    'type':     ['medical'],
    'address':  '1-5 Broad Street, Lagos Island',
    'lat':       6.4550, 'lng': 3.3841,
    'phone':    '01-2660100',
    'whatsapp': None,
    'capacity':  12,
    'available': 12,
  },
  'gbagada_general': {
    'name':     'Gbagada General Hospital',
    'type':     ['medical'],
    'address':  'Hospital Road, Gbagada',
    'lat':       6.5500, 'lng': 3.3833,
    'phone':    '01-7737882',
    'whatsapp': None,
    'capacity':  10,
    'available': 10,
  },
  'eko_hospital': {
    'name':     'Eko Hospital',
    'type':     ['medical'],
    'address':  '31 Mobolaji Bank Anthony Way, Ikeja',
    'lat':       6.5833, 'lng': 3.3500,
    'phone':    '01-4931071',
    'whatsapp': None,
    'capacity':  8,
    'available': 8,
  },

  # ── NEMA LAGOS ──
  'nema_lagos': {
    'name':     'NEMA — Lagos Territorial Office',
    'type':     ['flood','disaster','other'],
    'address':  'Oregun Road, Ikeja',
    'lat':       6.6000, 'lng': 3.3500,
    'phone':    '0800-CALL-NEMA',
    'whatsapp': None,
    'capacity':  8,
    'available': 8,
  },

  # ── FRSC (Road accidents) ──
  'frsc_lagos': {
    'name':     'FRSC — Lagos Sector Command',
    'type':     ['accident'],
    'address':  'Lagos Ibadan Expressway',
    'lat':       6.6500, 'lng': 3.3500,
    'phone':    '122',
    'whatsapp': None,
    'capacity':  10,
    'available': 10,
  },
  'frsc_apapa': {
    'name':     'FRSC — Apapa Unit',
    'type':     ['accident'],
    'address':  'Apapa, Lagos',
    'lat':       6.4483, 'lng': 3.3586,
    'phone':    '122',
    'whatsapp': None,
    'capacity':  6,
    'available': 6,
  },
}

# Track which centers are currently dispatched
DISPATCHED = {}  # center_id → incident_id

def haversine_distance(lat1, lng1, lat2, lng2):
    """Calculate distance in km between two GPS points."""
    import math
    R    = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a    = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def estimate_response_time(distance_km):
    """Estimate response time in minutes based on distance."""
    # Lagos traffic — average 20 km/h in traffic, 40 km/h at night
    avg_speed = 25  # km/h conservative estimate
    time_min  = (distance_km / avg_speed) * 60
    return round(time_min + 3)  # +3 min for deployment

def allocate_responder(incident):
    """
    Find the best available response center for an incident.
    Considers:
    1. Incident type — only matching centers
    2. Availability — center must have capacity
    3. Distance — nearest matching available center
    4. Not already dispatched to another incident
    Returns allocation dict or None.
    """
    if not incident.get('latitude') or not incident.get('longitude'):
        return None

    inc_lat  = float(incident['latitude'])
    inc_lng  = float(incident['longitude'])
    inc_type = incident.get('type', 'other')

    best_center   = None
    best_distance = float('inf')
    best_time     = None

    for center_id, center in LAGOS_CENTERS.items():
        # Skip if no capacity
        if center['available'] <= 0:
            continue

        # Skip if already dispatched to another incident
        if center_id in DISPATCHED:
            continue

        # Check if center handles this incident type
        handles = (
            inc_type in center['type'] or
            'other' in center['type']
        )
        if not handles:
            continue

        # Calculate distance
        dist = haversine_distance(
            inc_lat, inc_lng,
            center['lat'], center['lng']
        )

        if dist < best_distance:
            best_distance = dist
            best_center   = (center_id, center)
            best_time     = estimate_response_time(dist)

    if not best_center:
        return None

    center_id, center = best_center
    return {
        'center_id':     center_id,
        'center_name':   center['name'],
        'center_type':   center['type'][0],
        'address':       center['address'],
        'phone':         center['phone'],
        'whatsapp':      center['whatsapp'],
        'lat':           center['lat'],
        'lng':           center['lng'],
        'distance_km':   round(best_distance, 1),
        'eta_minutes':   best_time,
        'allocated_at':  datetime.utcnow().isoformat(),
    }

def dispatch_center(center_id, incident_id):
    """Mark a center as dispatched to an incident."""
    if center_id in LAGOS_CENTERS:
        LAGOS_CENTERS[center_id]['available'] -= 1
        DISPATCHED[center_id] = incident_id

def release_center(center_id):
    """Release a center when incident is resolved."""
    if center_id in LAGOS_CENTERS:
        center = LAGOS_CENTERS[center_id]
        if center['available'] < center['capacity']:
            center['available'] += 1
    if center_id in DISPATCHED:
        del DISPATCHED[center_id]

def get_all_centers():
    """Return all centers with their current availability."""
    result = []
    for center_id, center in LAGOS_CENTERS.items():
        result.append({
            'id':        center_id,
            'name':      center['name'],
            'type':      center['type'],
            'address':   center['address'],
            'lat':       center['lat'],
            'lng':       center['lng'],
            'phone':     center['phone'],
            'whatsapp':  center['whatsapp'],
            'capacity':  center['capacity'],
            'available': center['available'],
            'dispatched': center_id in DISPATCHED,
            'incident_id': DISPATCHED.get(center_id),
        })
    return result