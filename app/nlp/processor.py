import re
import string
from datetime import datetime

# ── NIGERIAN EMERGENCY KEYWORDS ──
FIRE_KEYWORDS     = ['fire','burn','burning','flame','smoke','inferno','explosion','blast','explode','kaboom']
FLOOD_KEYWORDS    = ['flood','flooding','flooded','water','rain','overflow','submerged','underwater','drainage']
CRIME_KEYWORDS    = ['robbery','robbers','armed','gunmen','thieves','kidnap','kidnapping','attack','attacked','shoot','shooting','shot','kill','killed','stabbed','cultist','cultists','hoodlums','thugs','bandit','bandits']
ACCIDENT_KEYWORDS = ['accident','crash','collision','hit','run','overturn','crushed','truck','tanker','vehicle','car crash','road crash']
MEDICAL_KEYWORDS  = ['dead','death','died','dying','injured','injury','casualties','hospital','ambulance','unconscious','bleeding','sick','epidemic','outbreak','cholera','disease']
SECURITY_KEYWORDS = ['protest','riot','unrest','shooting','gunshots','military','soldiers','police','siren','invasion','attack','bomb','explosive','terrorism','terrorist']

SEVERITY_HIGH     = ['dead','killed','fire','explosion','blast','robbery','armed','gunmen','kidnap','critical','emergency','urgent','help','sos','danger','danger','trapped']
SEVERITY_MEDIUM   = ['accident','crash','flood','injured','hospital','protest','unrest','robbery','stolen']
SEVERITY_LOW      = ['suspicious','warning','alert','watch','caution','slow','traffic','minor']

# ── NIGERIAN LOCATIONS GAZETTEER ──
# Maps informal names → (formal name, state, lat, lng)
NIGERIAN_PLACES = {
    # Lagos
    'oshodi':           ('Oshodi',           'Lagos',  6.5480,  3.3515),
    'lekki':            ('Lekki',            'Lagos',  6.4345,  3.4775),
    'ikeja':            ('Ikeja',            'Lagos',  6.5958,  3.3398),
    'victoria island':  ('Victoria Island',  'Lagos',  6.4281,  3.4219),
    'vi':               ('Victoria Island',  'Lagos',  6.4281,  3.4219),
    'surulere':         ('Surulere',         'Lagos',  6.5010,  3.3603),
    'yaba':             ('Yaba',             'Lagos',  6.5095,  3.3750),
    'mainland':         ('Lagos Mainland',   'Lagos',  6.5095,  3.3750),
    'island':           ('Lagos Island',     'Lagos',  6.4550,  3.3841),
    'apapa':            ('Apapa',            'Lagos',  6.4483,  3.3586),
    'mile 2':           ('Mile 2',           'Lagos',  6.4737,  3.3018),
    'mile2':            ('Mile 2',           'Lagos',  6.4737,  3.3018),
    'ikorodu':          ('Ikorodu',          'Lagos',  6.6194,  3.5106),
    'mushin':           ('Mushin',           'Lagos',  6.5354,  3.3589),
    'agege':            ('Agege',            'Lagos',  6.6166,  3.3219),
    'ojota':            ('Ojota',            'Lagos',  6.5975,  3.3831),
    'ojodu':            ('Ojodu',            'Lagos',  6.6373,  3.3648),
    'berger':           ('Berger',           'Lagos',  6.6350,  3.3700),
    'maryland':         ('Maryland',         'Lagos',  6.5694,  3.3578),
    'ketu':             ('Ketu',             'Lagos',  6.5904,  3.3875),
    'mile 12':          ('Mile 12',          'Lagos',  6.6169,  3.3910),
    'iyana ipaja':      ('Iyana Ipaja',      'Lagos',  6.5941,  3.2597),
    'ipaja':            ('Ipaja',            'Lagos',  6.5941,  3.2597),
    'dopemu':           ('Dopemu',           'Lagos',  6.5843,  3.2873),
    'egbeda':           ('Egbeda',           'Lagos',  6.5718,  3.2745),
    'alimosho':         ('Alimosho',         'Lagos',  6.5718,  3.2745),
    'festac':           ('Festac Town',      'Lagos',  6.4671,  3.2742),
    'ajegunle':         ('Ajegunle',         'Lagos',  6.4583,  3.3406),
    'lagos':            ('Lagos',            'Lagos',  6.5244,  3.3792),

    # FCT / Abuja
    'abuja':            ('Abuja',            'FCT',    9.0765,  7.3986),
    'fct':              ('FCT Abuja',        'FCT',    9.0765,  7.3986),
    'wuse':             ('Wuse',             'FCT',    9.0691,  7.4836),
    'wuse 2':           ('Wuse 2',           'FCT',    9.0691,  7.4836),
    'garki':            ('Garki',            'FCT',    9.0510,  7.4827),
    'gwarinpa':         ('Gwarinpa',         'FCT',    9.1181,  7.4103),
    'maitama':          ('Maitama',          'FCT',    9.0838,  7.4892),
    'asokoro':          ('Asokoro',          'FCT',    9.0401,  7.5233),
    'kubwa':            ('Kubwa',            'FCT',    9.1481,  7.3197),
    'nyanya':           ('Nyanya',           'FCT',    8.9946,  7.4325),
    'mararaba':         ('Mararaba',         'FCT',    8.9978,  7.3786),
    'lugbe':            ('Lugbe',            'FCT',    8.9753,  7.4267),
    'bwari':            ('Bwari',            'FCT',    9.2333,  7.3833),

    # Rivers
    'port harcourt':    ('Port Harcourt',    'Rivers', 4.8156,  7.0498),
    'ph':               ('Port Harcourt',    'Rivers', 4.8156,  7.0498),
    'trans amadi':      ('Trans Amadi',      'Rivers', 4.8407,  7.0329),
    'rumuola':          ('Rumuola',          'Rivers', 4.8251,  7.0264),
    'rumuokoro':        ('Rumuokoro',        'Rivers', 4.8649,  7.0299),
    'eleme':            ('Eleme',            'Rivers', 4.7692,  7.1478),
    'bonny':            ('Bonny Island',     'Rivers', 4.4386,  7.1528),

    # Kano
    'kano':             ('Kano',             'Kano',   12.0022, 8.5919),
    'sabon gari':       ('Sabon Gari',       'Kano',   12.0022, 8.5919),
    'kofar':            ('Kofar',            'Kano',   12.0022, 8.5919),

    # Borno
    'maiduguri':        ('Maiduguri',        'Borno',  11.8311, 13.1510),
    'borno':            ('Borno',            'Borno',  11.8311, 13.1510),

    # Ogun
    'sagamu':           ('Sagamu',           'Ogun',   6.8399,  3.6476),
    'abeokuta':         ('Abeokuta',         'Ogun',   7.1557,  3.3451),
    'ota':              ('Ota',              'Ogun',   6.6862,  3.2341),
    'ijebu ode':        ('Ijebu Ode',        'Ogun',   6.8186,  3.9174),

    # Oyo
    'ibadan':           ('Ibadan',           'Oyo',    7.3775,  3.9470),
    'ojoo':             ('Ojoo',             'Oyo',    7.4355,  3.8948),
    'bodija':           ('Bodija',           'Oyo',    7.4104,  3.8966),
    'challenge':        ('Challenge',        'Oyo',    7.3610,  3.8969),
    'ring road':        ('Ring Road',        'Oyo',    7.3793,  3.8924),

    # Delta
    'warri':            ('Warri',            'Delta',  5.5167,  5.7500),
    'asaba':            ('Asaba',            'Delta',  6.1981,  6.7336),
    'sapele':           ('Sapele',           'Delta',  5.8920,  5.6788),

    # Enugu
    'enugu':            ('Enugu',            'Enugu',  6.4483,  7.5136),
    'nsukka':           ('Nsukka',           'Enugu',  6.8567,  7.3958),

    # Anambra
    'onitsha':          ('Onitsha',          'Anambra',6.1428,  6.7862),
    'awka':             ('Awka',             'Anambra',6.2097,  7.0732),
    'nnewi':            ('Nnewi',            'Anambra',6.0207,  6.9209),

    # Kaduna
    'kaduna':           ('Kaduna',           'Kaduna', 10.5264, 7.4382),
    'zaria':            ('Zaria',            'Kaduna', 11.0790, 7.7049),

    # Others
    'jos':              ('Jos',              'Plateau',9.8965,  8.8583),
    'benin city':       ('Benin City',       'Edo',    6.3350,  5.6037),
    'benin':            ('Benin City',       'Edo',    6.3350,  5.6037),
    'sokoto':           ('Sokoto',           'Sokoto', 13.0059, 5.2476),
    'owerri':           ('Owerri',           'Imo',    5.4836,  7.0333),
    'uyo':              ('Uyo',              'Akwa Ibom',5.0377,7.9128),
    'calabar':          ('Calabar',          'Cross River',4.9517,8.3220),
    'makurdi':          ('Makurdi',          'Benue',  7.7322,  8.5391),
    'lokoja':           ('Lokoja',           'Kogi',   7.7974,  6.7337),
    'ilorin':           ('Ilorin',           'Kwara',  8.5004,  4.5503),
    'akure':            ('Akure',            'Ondo',   7.2526,  5.1945),
    'ado ekiti':        ('Ado Ekiti',        'Ekiti',  7.6219,  5.2210),
}

def clean_text(text):
    """Remove links, emojis, extra spaces from raw social media text."""
    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    # Remove @mentions
    text = re.sub(r'@\w+', '', text)
    # Remove hashtags symbol but keep the word
    text = re.sub(r'#(\w+)', r'\1', text)
    # Remove emojis
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def detect_event_type(text_lower):
    """Detect the type of emergency from text."""
    scores = {
        'fire':     sum(1 for k in FIRE_KEYWORDS     if k in text_lower),
        'crime':    sum(1 for k in CRIME_KEYWORDS     if k in text_lower),
        'flood':    sum(1 for k in FLOOD_KEYWORDS     if k in text_lower),
        'accident': sum(1 for k in ACCIDENT_KEYWORDS  if k in text_lower),
        'medical':  sum(1 for k in MEDICAL_KEYWORDS   if k in text_lower),
        'security': sum(1 for k in SECURITY_KEYWORDS  if k in text_lower),
    }
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else 'other'

def detect_severity(text_lower):
    """Detect severity level from text."""
    high_score   = sum(1 for k in SEVERITY_HIGH   if k in text_lower)
    medium_score = sum(1 for k in SEVERITY_MEDIUM if k in text_lower)
    low_score    = sum(1 for k in SEVERITY_LOW    if k in text_lower)

    if high_score >= 2:   return 'critical'
    if high_score >= 1:   return 'high'
    if medium_score >= 1: return 'medium'
    if low_score >= 1:    return 'low'
    return 'medium'

def extract_location(text_lower):
    """
    Extract Nigerian location from text using the gazetteer.
    Returns (formal_name, state, lat, lng) or None.
    """
    # Sort by length descending so "victoria island" matches before "island"
    sorted_places = sorted(NIGERIAN_PLACES.keys(), key=len, reverse=True)
    for place in sorted_places:
        if place in text_lower:
            data = NIGERIAN_PLACES[place]
            return {
                'name':      data[0],
                'state':     data[1],
                'latitude':  data[2],
                'longitude': data[3],
            }
    return None

def extract_time(text_lower):
    """Extract time references from text."""
    time_patterns = [
        r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b',
        r'\b(this morning)\b',
        r'\b(this afternoon)\b',
        r'\b(this evening)\b',
        r'\b(tonight)\b',
        r'\b(last night)\b',
        r'\b(just now)\b',
        r'\b(few minutes ago)\b',
        r'\b(yesterday)\b',
        r'\b(now)\b',
    ]
    for pattern in time_patterns:
        match = re.search(pattern, text_lower)
        if match:
            return match.group(1)
    return 'Not specified'

def calculate_confidence(event_type, location, text_lower):
    """Calculate confidence score for extraction."""
    score = 0.5  # base
    if event_type != 'other':   score += 0.2
    if location:                score += 0.2
    if len(text_lower) > 50:    score += 0.1
    return round(min(score, 1.0), 2)

def process_text(text, source='User Report'):
    """
    Main NLP function. Takes raw social media text,
    returns structured incident data.
    """
    if not text or not text.strip():
        return None

    # Step 1: Clean
    cleaned   = clean_text(text)
    text_lower = cleaned.lower()

    # Step 2: Extract entities
    event_type = detect_event_type(text_lower)
    severity   = detect_severity(text_lower)
    location   = extract_location(text_lower)
    time_ref   = extract_time(text_lower)
    confidence = calculate_confidence(event_type, location, text_lower)

    # Step 3: Build result
    result = {
        'original_text': text,
        'cleaned_text':  cleaned,
        'event_type':    event_type,
        'severity':      severity,
        'time_ref':      time_ref,
        'confidence':    confidence,
        'source':        source,
        'entities': {
            'event':    event_type.upper(),
            'location': location['name']  if location else 'Unknown',
            'state':    location['state'] if location else 'Unknown',
            'time':     time_ref,
            'severity': severity.upper(),
        },
        'location': location,
        'processed_at': datetime.utcnow().isoformat(),
    }

    # Step 4: Build incident title from extraction
    if location:
        result['suggested_title'] = f"{event_type.capitalize()} incident — {location['name']}, {location['state']}"
    else:
        result['suggested_title'] = f"{event_type.capitalize()} incident reported"

    return result


# ── SIMULATED SOCIAL MEDIA POSTS ──
# These are realistic Nigerian emergency posts
# used to demonstrate the pipeline
SAMPLE_POSTS = [
    { 'text': 'Na fire burn for under bridge near Mile 2 this morning o! Plenty smoke dey rise up. LASG do something abeg', 'source': 'X (Twitter)' },
    { 'text': 'Armed robbers dey operate for Lekki Phase 1 junction now now! Make people avoid that road', 'source': 'WhatsApp' },
    { 'text': 'Serious flood for Mararaba road in Abuja. Many cars don drown for the water. NEMA where una dey?', 'source': 'Facebook' },
    { 'text': 'Multiple car crash on Lagos Ibadan expressway near Sagamu. People dey injured, FRSC not yet on ground', 'source': 'X (Twitter)' },
    { 'text': 'Gas explosion in Trans Amadi Port Harcourt. The whole area don scatter. Fire service come quick!', 'source': 'X (Twitter)' },
    { 'text': 'Gunshots heard in Maiduguri road, Borno state. Residents should stay indoors. Military has been alerted', 'source': 'Facebook' },
    { 'text': 'Building collapse in Kano city, people trapped inside. Rescue team needed urgently', 'source': 'WhatsApp' },
    { 'text': 'Flooding in Warri, Delta state. Several communities cut off from access. Boats needed', 'source': 'Facebook' },
    { 'text': 'Road accident at Wuse 2 junction Abuja. Ambulance needed urgently, people badly injured', 'source': 'X (Twitter)' },
    { 'text': 'Fire outbreak at Ibadan market, ring road area. Fire service not yet arrive, things burning', 'source': 'WhatsApp' },
    { 'text': 'Shooting at Surulere Lagos, hoodlums attacking people. Police needed immediately please', 'source': 'X (Twitter)' },
    { 'text': 'Heavy flood don overtake Sagamu interchange on Lagos Ibadan expressway. Traffic jam everywhere', 'source': 'Facebook' },
    { 'text': 'Kidnapping attempt at Gwarinpa Abuja. Parents lock your children inside. Very dangerous now', 'source': 'WhatsApp' },
    { 'text': 'Medical emergency at Onitsha Anambra. Tanker accident, chemical spill, people coughing and sick', 'source': 'X (Twitter)' },
    { 'text': 'Explosion and fire at Apapa port Lagos. Thick black smoke. Area don be closed by police', 'source': 'Facebook' },
]