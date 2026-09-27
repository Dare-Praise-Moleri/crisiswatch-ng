"""
CrisisWatch Lagos — NLP Processor
===================================
Rule-based NER pipeline for emergency detection.
Every post from every source passes through this.

Pipeline:
  Raw text → clean → detect type → detect severity
           → extract location (Lagos gazetteer)
           → confidence score → structured incident dict
"""

import re
from datetime import datetime

# ══════════════════════════════════════════════════
#  EMERGENCY KEYWORDS — what the model looks for
# ══════════════════════════════════════════════════

FIRE_KEYWORDS = [
    'fire', 'burn', 'burning', 'burned', 'burnt', 'flame', 'flames',
    'smoke', 'inferno', 'explosion', 'blast', 'explode', 'exploded',
    'razed', 'gutted', 'engulfed', 'ablaze', 'wildfire', 'gas fire',
    'e don burn', 'fire don start', 'fire outbreak', 'house on fire',
    'market fire', 'building on fire', 'tanker fire',
]

FLOOD_KEYWORDS = [
    'flood', 'flooding', 'flooded', 'water rise', 'overflow',
    'submerged', 'underwater', 'drainage', 'surge', 'heavy rain',
    'water everywhere', 'road flooded', 'area don drown',
    'water don enter', 'rain water', 'flash flood',
]

ACCIDENT_KEYWORDS = [
    'accident', 'crash', 'collision', 'hit and run', 'overturn',
    'crushed', 'truck', 'tanker', 'vehicle', 'car crash', 'road crash',
    'fatal', 'wreck', 'road accident', 'motor accident',
    'bus crash', 'okada crash', 'danfo crash', 'articulated truck',
    'multiple vehicle', 'pile up',
]

MEDICAL_KEYWORDS = [
    'dead', 'death', 'died', 'dying', 'injured', 'injury', 'casualties',
    'hospital', 'ambulance', 'unconscious', 'bleeding', 'sick',
    'epidemic', 'outbreak', 'cholera', 'disease', 'cardiac', 'collapse',
    'person don collapse', 'need doctor', 'need ambulance', 'body found',
    'corpse', 'dead body', 'critical condition', 'emergency room',
]

CRIME_KEYWORDS = [
    'robbery', 'robbers', 'armed', 'gunmen', 'thieves', 'thief',
    'kidnap', 'kidnapping', 'kidnapped', 'attack', 'attacked',
    'shoot', 'shooting', 'shot', 'kill', 'killed', 'stabbed',
    'cultist', 'hoodlums', 'thugs', 'bandit', 'bandits', 'rape',
    'murder', 'assassin', 'one chance', 'car snatching', 'phone snatched',
    'bag snatched', 'boys dey operate', 'area boys', 'agberos',
    'armed robbery', 'they are shooting', 'gunshot heard',
]

SECURITY_KEYWORDS = [
    'protest', 'riot', 'unrest', 'military', 'soldiers', 'police',
    'invasion', 'bomb', 'explosive', 'terrorism', 'terrorist',
    'crisis', 'demonstration', 'EndSARS', 'occupy', 'barricade',
    'tear gas', 'water cannon', 'curfew', 'lockdown',
]

# ── Severity indicators ──
SEVERITY_CRITICAL = [
    'many dead', 'multiple casualties', 'mass casualty', 'explosion',
    'building collapse', 'trapped', 'people trapped', 'fatalities',
    'bodies recovered', 'sos', 'help us', 'no one is coming',
    'na die dem die', 'e don kill person', 'multiple dead',
]
SEVERITY_HIGH = [
    'fire', 'robbery', 'armed', 'gunmen', 'kidnap', 'urgent',
    'help', 'danger', 'critical', 'emergency', 'shoot', 'shot',
    'injured', 'blast', 'explosion', 'na serious tin', 'e don bad',
]
SEVERITY_MEDIUM = [
    'accident', 'crash', 'flood', 'hospital', 'protest',
    'robbery', 'stolen', 'flooding', 'road blocked',
]
SEVERITY_LOW = [
    'suspicious', 'warning', 'alert', 'watch', 'caution',
    'minor', 'slow traffic', 'road closed',
]

# ══════════════════════════════════════════════════
#  LAGOS GAZETTEER — 100+ locations with GPS
#  Format: 'keyword': ('Display Name', 'LGA', lat, lng)
# ══════════════════════════════════════════════════

LAGOS_PLACES = {
    # ── MAINLAND ──
    'oshodi':                  ('Oshodi',                  'Oshodi-Isolo',    6.5480, 3.3515),
    'mushin':                  ('Mushin',                  'Mushin',          6.5354, 3.3589),
    'yaba':                    ('Yaba',                    'Lagos Mainland',  6.5095, 3.3750),
    'surulere':                ('Surulere',                'Surulere',        6.5010, 3.3603),
    'ebute metta':             ('Ebute Metta',             'Lagos Mainland',  6.4833, 3.3833),
    'apapa':                   ('Apapa',                   'Apapa',           6.4483, 3.3586),
    'ajegunle':                ('Ajegunle',                'Ajeromi-Ifelodun',6.4583, 3.3406),
    'agege':                   ('Agege',                   'Agege',           6.6166, 3.3219),
    'ikeja':                   ('Ikeja',                   'Ikeja',           6.5958, 3.3398),
    'maryland':                ('Maryland',                'Ikeja',           6.5694, 3.3578),
    'ketu':                    ('Ketu',                    'Kosofe',          6.5904, 3.3875),
    'ojota':                   ('Ojota',                   'Kosofe',          6.5975, 3.3831),
    'mile 12':                 ('Mile 12',                 'Kosofe',          6.6169, 3.3910),
    'ikorodu':                 ('Ikorodu',                 'Ikorodu',         6.6194, 3.5106),
    'bariga':                  ('Bariga',                  'Shomolu',         6.5333, 3.3833),
    'shomolu':                 ('Shomolu',                 'Shomolu',         6.5333, 3.3833),
    'kosofe':                  ('Kosofe',                  'Kosofe',          6.5667, 3.4000),
    'gbagada':                 ('Gbagada',                 'Kosofe',          6.5500, 3.3833),
    'palmgrove':               ('Palm Grove',              'Shomolu',         6.5333, 3.3667),
    'onipanu':                 ('Onipanu',                 'Shomolu',         6.5500, 3.3667),
    'anthony':                 ('Anthony Village',         'Ikeja',           6.5667, 3.3667),
    'ojuelegba':               ('Ojuelegba',               'Surulere',        6.5000, 3.3667),
    'costain':                 ('Costain',                 'Lagos Mainland',  6.4833, 3.3667),
    'orile':                   ('Orile',                   'Ajeromi-Ifelodun',6.4833, 3.3500),
    'otto':                    ('Otto',                    'Lagos Island',    6.4667, 3.3667),
    'idi araba':               ('Idi Araba',               'Surulere',        6.5104, 3.3603),

    # ── LAGOS ISLAND ──
    'lagos island':            ('Lagos Island',            'Lagos Island',    6.4550, 3.3841),
    'victoria island':         ('Victoria Island',         'Eti-Osa',         6.4281, 3.4219),
    'vi':                      ('Victoria Island',         'Eti-Osa',         6.4281, 3.4219),
    'ikoyi':                   ('Ikoyi',                   'Eti-Osa',         6.4500, 3.4333),
    'onikan':                  ('Onikan',                  'Lagos Island',    6.4500, 3.3833),
    'marina':                  ('Marina',                  'Lagos Island',    6.4500, 3.3833),
    'broad street':            ('Broad Street',            'Lagos Island',    6.4500, 3.3833),
    'tinubu':                  ('Tinubu Square',           'Lagos Island',    6.4550, 3.3841),
    'obalende':                ('Obalende',                'Eti-Osa',         6.4500, 3.4000),
    'cms':                     ('CMS',                     'Lagos Island',    6.4500, 3.3833),
    'idumota':                 ('Idumota',                 'Lagos Island',    6.4600, 3.3900),
    'balogun':                 ('Balogun Market',          'Lagos Island',    6.4550, 3.3900),

    # ── LEKKI / AJAH AXIS ──
    'lekki':                   ('Lekki',                   'Eti-Osa',         6.4345, 3.4775),
    'lekki phase 1':           ('Lekki Phase 1',           'Eti-Osa',         6.4345, 3.4775),
    'lekki phase 2':           ('Lekki Phase 2',           'Eti-Osa',         6.4500, 3.5167),
    'ajah':                    ('Ajah',                    'Eti-Osa',         6.4667, 3.5833),
    'sangotedo':               ('Sangotedo',               'Ibeju-Lekki',     6.4500, 3.6000),
    'chevron':                 ('Chevron Drive',           'Eti-Osa',         6.4333, 3.5167),
    'jakande':                 ('Jakande',                 'Eti-Osa',         6.4667, 3.5667),
    'igbo efon':               ('Igbo Efon',               'Eti-Osa',         6.4500, 3.5500),
    'orchid':                  ('Orchid Road',             'Ibeju-Lekki',     6.4167, 3.5500),
    'abraham adesanya':        ('Abraham Adesanya',        'Ibeju-Lekki',     6.4667, 3.5833),
    'badore':                  ('Badore',                  'Ibeju-Lekki',     6.4667, 3.6000),
    'epe':                     ('Epe',                     'Epe',             6.5833, 3.9833),
    'ibeju':                   ('Ibeju-Lekki',             'Ibeju-Lekki',     6.4500, 3.7167),

    # ── BADAGRY / FESTAC / OJO AXIS ──
    'festac':                  ('Festac Town',             'Amuwo-Odofin',    6.4671, 3.2742),
    'mile 2':                  ('Mile 2',                  'Amuwo-Odofin',    6.4737, 3.3018),
    'mile2':                   ('Mile 2',                  'Amuwo-Odofin',    6.4737, 3.3018),
    'badagry':                 ('Badagry',                 'Badagry',         6.4167, 2.8833),
    'satellite town':          ('Satellite Town',          'Ojo',             6.4500, 3.2833),
    'trade fair':              ('Trade Fair Complex',      'Ojo',             6.4667, 3.2833),
    'alaba':                   ('Alaba International',     'Ojo',             6.4667, 3.2500),
    'ojo':                     ('Ojo',                     'Ojo',             6.4667, 3.2167),
    'volks':                   ('Volkswagen Bus Stop',     'Ojo',             6.4500, 3.2833),
    'amje':                    ('Amje',                    'Badagry',         6.4167, 3.0000),

    # ── ALIMOSHO / IPAJA AXIS ──
    'alimosho':                ('Alimosho',                'Alimosho',        6.5718, 3.2745),
    'ipaja':                   ('Ipaja',                   'Alimosho',        6.5941, 3.2597),
    'iyana ipaja':             ('Iyana Ipaja',             'Alimosho',        6.5941, 3.2597),
    'dopemu':                  ('Dopemu',                  'Agege',           6.5843, 3.2873),
    'egbeda':                  ('Egbeda',                  'Alimosho',        6.5718, 3.2745),
    'idimu':                   ('Idimu',                   'Alimosho',        6.5500, 3.2500),
    'ikotun':                  ('Ikotun',                  'Alimosho',        6.5167, 3.2833),
    'igando':                  ('Igando',                  'Alimosho',        6.5000, 3.2833),
    'isheri':                  ('Isheri',                  'Ifako-Ijaiye',    6.6500, 3.3167),
    'abule egba':              ('Abule Egba',              'Agege',           6.6167, 3.2833),
    'meiran':                  ('Meiran',                  'Ifako-Ijaiye',    6.6333, 3.2833),
    'pen cinema':              ('Pen Cinema',              'Agege',           6.6200, 3.3100),
    'command':                 ('Command',                 'Ifako-Ijaiye',    6.6500, 3.3000),

    # ── OJODU / BERGER / NORTH ──
    'ogudu':                   ('Ogudu',                   'Kosofe',          6.5667, 3.4000),
    'ojodu':                   ('Ojodu',                   'Kosofe',          6.6373, 3.3648),
    'berger':                  ('Berger',                  'Kosofe',          6.6350, 3.3700),
    'omole':                   ('Omole',                   'Kosofe',          6.6333, 3.3333),
    'magodo':                  ('Magodo',                  'Kosofe',          6.6000, 3.3667),
    'shangisha':               ('Shangisha',               'Kosofe',          6.6333, 3.3833),
    'ojokoro':                 ('Ojokoro',                 'Ifako-Ijaiye',    6.6667, 3.3167),
    'agidingbi':               ('Agidingbi',               'Ikeja',           6.6000, 3.3333),
    'oregun':                  ('Oregun',                  'Ikeja',           6.6000, 3.3500),
    'alausa':                  ('Alausa',                  'Ikeja',           6.5833, 3.3500),
    'secretariat':             ('Lagos Secretariat',       'Ikeja',           6.5833, 3.3500),

    # ── HIGHWAYS & KEY LANDMARKS ──
    'third mainland bridge':   ('Third Mainland Bridge',   'Lagos Mainland',  6.5000, 3.3833),
    'carter bridge':           ('Carter Bridge',           'Lagos Island',    6.4667, 3.3833),
    'eko bridge':              ('Eko Bridge',              'Lagos Mainland',  6.4667, 3.3667),
    'lekki toll':              ('Lekki Toll Gate',         'Eti-Osa',         6.4333, 3.5167),
    'oshodi under bridge':     ('Oshodi Under Bridge',     'Oshodi-Isolo',    6.5480, 3.3515),
    'under bridge':            ('Oshodi Under Bridge',     'Oshodi-Isolo',    6.5480, 3.3515),
    'mile 2 bridge':           ('Mile 2 Bridge',           'Amuwo-Odofin',    6.4737, 3.3018),
    'tin can':                 ('Tin Can Island Port',     'Apapa',           6.4333, 3.3167),
    'apapa port':              ('Apapa Port',              'Apapa',           6.4333, 3.3833),
    'murtala airport':         ('Murtala Muhammed Airport','Ikeja',           6.5774, 3.3214),
    'lagos airport':           ('Lagos Airport',           'Ikeja',           6.5774, 3.3214),
    'muritala':                ('Murtala Muhammed Airport','Ikeja',           6.5774, 3.3214),
    'lagos ibadan expressway': ('Lagos-Ibadan Expressway', 'Ifako-Ijaiye',    6.7000, 3.3500),
    'long bridge':             ('Lagos-Ibadan Long Bridge','Ifako-Ijaiye',    6.7000, 3.3500),
    'ojota bus stop':          ('Ojota Bus Stop',          'Kosofe',          6.5975, 3.3831),
    'national stadium':        ('National Stadium',        'Surulere',        6.4952, 3.3676),
    'tafawa balewa':           ('Tafawa Balewa Square',    'Lagos Island',    6.4552, 3.3900),
}

# ══════════════════════════════════════════════════
#  LAGOS KEYWORD FILTER
#  A post must mention Lagos or a known Lagos place
#  to be saved. Keeps non-Lagos posts out.
# ══════════════════════════════════════════════════

LAGOS_KEYWORDS = [
    'lagos', 'lasgidi', 'eko', 'naija', 'nigeria',
] + list(LAGOS_PLACES.keys())


def is_lagos_related(text_lower):
    """Return True only if text mentions Lagos or a known Lagos location."""
    return any(kw in text_lower for kw in LAGOS_KEYWORDS)


# ══════════════════════════════════════════════════
#  SAMPLE POSTS — realistic Lagos Pidgin + English
#  Used as simulation fallback when DB < 10 incidents
#  These represent CLASS B seed data
# ══════════════════════════════════════════════════

SAMPLE_POSTS = [
    # Fire incidents
    {'text': 'Na fire burn for under bridge near Oshodi this morning o! Plenty smoke dey rise. Lagos Fire Service come abeg', 'source': 'X (Twitter)'},
    {'text': 'Fire outbreak for Balogun market Lagos Island. Traders running everywhere. Fire service not yet arrive', 'source': 'WhatsApp'},
    {'text': 'Tanker fire on Third Mainland Bridge Lagos. Traffic go bad. Avoid that road now', 'source': 'X (Twitter)'},
    {'text': 'Gas explosion for Apapa port area. Thick black smoke everywhere. Fire service needed urgently', 'source': 'Facebook'},
    {'text': 'Building engulfed in fire at Mushin Lagos. People shouting for help, nobody to rescue them', 'source': 'WhatsApp'},

    # Flood incidents
    {'text': 'Serious flood for Mile 2 road in Lagos. Many cars don drown for the water. LASEMA where una dey?', 'source': 'Facebook'},
    {'text': 'Heavy flooding at Festac Town Lagos. Roads completely submerged. Residents need evacuation', 'source': 'X (Twitter)'},
    {'text': 'Third Mainland Bridge approach flooded after heavy rain. Traffic standstill, road almost impassable', 'source': 'WhatsApp'},
    {'text': 'Water don enter houses for Ajah Lagos. Residents stranded. NEMA please respond', 'source': 'Facebook'},
    {'text': 'Lekki Phase 1 drainage overflow. Cars floating on the road. Avoid Admiralty Way', 'source': 'X (Twitter)'},

    # Accidents
    {'text': 'Multiple car crash on Lagos Ibadan expressway near Berger. People dey injured, FRSC not yet on ground', 'source': 'X (Twitter)'},
    {'text': 'Road accident at Ojota junction Lagos. Ambulance needed urgently, people badly injured on the road', 'source': 'WhatsApp'},
    {'text': 'Danfo bus overturn at Oshodi bus stop. Passengers trapped inside. Come and help abeg', 'source': 'Facebook'},
    {'text': 'Articulated truck crash on Apapa wharf road. Road blocked completely. Avoid that axis', 'source': 'X (Twitter)'},
    {'text': 'Okada accident on Surulere road. Rider unconscious, passenger bleeding badly. Need ambulance', 'source': 'WhatsApp'},

    # Crime / Security
    {'text': 'Armed robbers dey operate for Lekki Phase 1 junction now now! Make people avoid that road', 'source': 'WhatsApp'},
    {'text': 'Shooting for Ajegunle Lagos, hoodlums attacking people on the street. Police needed immediately', 'source': 'X (Twitter)'},
    {'text': 'Gunshots heard for Surulere area tonight. Residents should stay indoors. Police been alerted', 'source': 'Facebook'},
    {'text': 'Kidnapping attempt for Magodo estate Lagos. Security alert! Parents lock your children inside', 'source': 'WhatsApp'},
    {'text': 'One chance robbers operating along Ikorodu road. They snatching phones and bags from passengers', 'source': 'X (Twitter)'},

    # Medical
    {'text': 'Medical emergency for Yaba Lagos. Person don collapse for the road, need ambulance ASAP', 'source': 'X (Twitter)'},
    {'text': 'Multiple persons injured at Ojuelegba accident. They need blood urgently at LUTH hospital', 'source': 'Facebook'},
    {'text': 'Old woman collapsed at CMS bus stop Lagos Island. People just watching, nobody calling ambulance', 'source': 'WhatsApp'},
    {'text': 'Cholera outbreak reported in Ajegunle community. Health officials please respond urgently', 'source': 'X (Twitter)'},
    {'text': 'Man shot by stray bullet in Surulere, bleeding heavily. Please someone call LASEMA 767', 'source': 'WhatsApp'},
]


# ══════════════════════════════════════════════════
#  CORE NLP FUNCTIONS
# ══════════════════════════════════════════════════

def clean_text(text):
    """Remove URLs, handles, hashtag symbols, emojis, extra whitespace."""
    text = re.sub(r'http\S+|www\.\S+', '', text)       # URLs
    text = re.sub(r'@\w+', '', text)                    # @handles
    text = re.sub(r'#(\w+)', r'\1', text)               # #hashtags → word
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)         # non-ASCII (emojis)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def detect_event_type(text_lower):
    """
    Score each category by keyword matches.
    Returns the highest-scoring category.
    Falls back to 'other' if nothing matches.
    """
    scores = {
        'fire':     sum(1 for k in FIRE_KEYWORDS     if k in text_lower),
        'flood':    sum(1 for k in FLOOD_KEYWORDS     if k in text_lower),
        'accident': sum(1 for k in ACCIDENT_KEYWORDS  if k in text_lower),
        'medical':  sum(1 for k in MEDICAL_KEYWORDS   if k in text_lower),
        'crime':    sum(1 for k in CRIME_KEYWORDS     if k in text_lower),
        'security': sum(1 for k in SECURITY_KEYWORDS  if k in text_lower),
    }
    best_type  = max(scores, key=scores.get)
    best_score = scores[best_type]
    return best_type if best_score > 0 else 'other'


def detect_severity(text_lower, event_type):
    """
    Determine severity. Critical overrides everything.
    Event type gives a baseline (fire/crime default to high).
    """
    crit_hits = sum(1 for k in SEVERITY_CRITICAL if k in text_lower)
    high_hits = sum(1 for k in SEVERITY_HIGH     if k in text_lower)
    med_hits  = sum(1 for k in SEVERITY_MEDIUM   if k in text_lower)
    low_hits  = sum(1 for k in SEVERITY_LOW      if k in text_lower)

    if crit_hits >= 1:                         return 'critical'
    if high_hits >= 2:                         return 'high'
    if event_type in ('fire', 'crime'):        return 'high'
    if high_hits >= 1:                         return 'high'
    if med_hits  >= 1:                         return 'medium'
    if low_hits  >= 1:                         return 'low'
    return 'medium'


def extract_location(text_lower):
    """
    Scan text for Lagos place names using the gazetteer.
    Matches longest names first to avoid partial matches
    (e.g. 'lekki phase 1' before 'lekki').
    Returns dict with name, LGA, latitude, longitude — or None.
    """
    sorted_places = sorted(LAGOS_PLACES.keys(), key=len, reverse=True)
    for place_key in sorted_places:
        if place_key in text_lower:
            name, lga, lat, lng = LAGOS_PLACES[place_key]
            return {
                'name':      name,
                'lga':       lga,
                'state':     'Lagos',
                'latitude':  lat,
                'longitude': lng,
            }
    return None


def extract_time_reference(text_lower):
    """Extract informal time references from social media text."""
    patterns = [
        (r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b', '{}'),
        (r'\b(this morning)\b',   'This morning'),
        (r'\b(this afternoon)\b', 'This afternoon'),
        (r'\b(this evening)\b',   'This evening'),
        (r'\b(tonight)\b',        'Tonight'),
        (r'\b(last night)\b',     'Last night'),
        (r'\b(just now)\b',       'Just now'),
        (r'\b(now now)\b',        'Right now'),
        (r'\b(few minutes ago)\b','Few minutes ago'),
        (r'\b(yesterday)\b',      'Yesterday'),
    ]
    for pattern, fmt in patterns:
        m = re.search(pattern, text_lower)
        if m:
            return fmt.format(m.group(1)) if '{}' in fmt else fmt
    return 'Not specified'


def calculate_confidence(event_type, location, text_lower, source):
    """
    Confidence score 0.0–1.0.
    Higher = more likely to be a real emergency.
    Threshold for auto-save: 0.7
    """
    score = 0.35  # base

    if event_type != 'other':
        score += 0.25  # clear emergency type detected

    if location:
        score += 0.20  # location extracted

    if len(text_lower) > 50:
        score += 0.10  # longer text = more context

    if source in ('User Report',):
        score += 0.10  # direct user reports get boost

    # Urgency words push confidence up
    urgency = ['help', 'urgent', 'abeg', 'sos', 'please', 'now', 'emergency']
    if any(u in text_lower for u in urgency):
        score += 0.05

    return round(min(score, 1.0), 2)


def build_title(event_type, location, text):
    """Generate a clean incident title."""
    type_labels = {
        'fire':     'Fire Incident',
        'flood':    'Flood Emergency',
        'accident': 'Road Accident',
        'medical':  'Medical Emergency',
        'crime':    'Security Incident',
        'security': 'Security Alert',
        'other':    'Emergency Report',
    }
    label = type_labels.get(event_type, 'Emergency Report')
    if location:
        return f"{label} — {location['name']}, Lagos"
    return f"{label} — Lagos State"


# ══════════════════════════════════════════════════
#  MAIN ENTRY POINT
# ══════════════════════════════════════════════════

def process_text(text, source='User Report'):
    """
    Main NLP function. Takes raw text from any source,
    returns structured incident dict or None.

    Called by:
    - RSS monitor      (news articles)
    - Reddit monitor   (posts from r/Lagos)
    - Telegram monitor (channel messages)
    - Report API       (direct user submissions)
    - NLP demo page    (manual testing)
    """
    if not text or not text.strip():
        return None

    cleaned    = clean_text(text)
    text_lower = cleaned.lower()

    # Lagos filter — only process Lagos-related content
    if not is_lagos_related(text_lower):
        return None

    event_type = detect_event_type(text_lower)
    severity   = detect_severity(text_lower, event_type)
    location   = extract_location(text_lower)
    time_ref   = extract_time_reference(text_lower)
    confidence = calculate_confidence(event_type, location, text_lower, source)
    title      = build_title(event_type, location, cleaned)

    return {
        'original_text':   text,
        'cleaned_text':    cleaned,
        'suggested_title': title,
        'event_type':      event_type,
        'severity':        severity,
        'time_ref':        time_ref,
        'confidence':      confidence,
        'source':          source,
        'location':        location,
        'entities': {
            'event':    event_type.upper(),
            'location': location['name']  if location else 'Lagos',
            'lga':      location['lga']   if location else 'Unknown',
            'state':    'Lagos',
            'time':     time_ref,
            'severity': severity.upper(),
        },
        'processed_at': datetime.utcnow().isoformat(),
    }
