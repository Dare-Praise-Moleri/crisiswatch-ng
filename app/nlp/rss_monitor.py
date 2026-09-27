"""
CrisisWatch Lagos — RSS Live Monitor
======================================
Monitors Nigerian news RSS feeds every 60 seconds.
Saves articles that mention Lagos emergencies.

Sources (all free, no API key):
  - Punch Newspapers
  - Vanguard Nigeria
  - Channels TV
  - Premium Times
  - The Nation
  - GDELT (global aggregator, filtered to Nigeria)

Data class: CLASS C — Live Operational Data
"""

import logging
import feedparser
import requests
from datetime import datetime, timedelta
from app.nlp.processor import process_text, is_lagos_related

log = logging.getLogger('rss_monitor')

# ══════════════════════════════════════════════════
#  RSS FEED URLS — all free, no API key needed
# ══════════════════════════════════════════════════

RSS_FEEDS = [
    {
        'name':   'Punch Newspapers',
        'url':    'https://punchng.com/feed/',
        'source': 'Punch Newspapers',
    },
    {
        'name':   'Vanguard Nigeria',
        'url':    'https://www.vanguardngr.com/feed/',
        'source': 'Vanguard Nigeria',
    },
    {
        'name':   'Channels TV',
        'url':    'https://www.channelstv.com/feed/',
        'source': 'Channels TV',
    },
    {
        'name':   'Premium Times',
        'url':    'https://www.premiumtimesng.com/feed',
        'source': 'Premium Times',
    },
    {
        'name':   'The Nation',
        'url':    'https://thenationonlineng.net/feed/',
        'source': 'The Nation',
    },
]

# GDELT — global event database, free, no key
# Returns Lagos news in last 15 minutes
GDELT_URL = (
    'https://api.gdeltproject.org/api/v2/doc/doc'
    '?query=Lagos+emergency&mode=artlist&maxrecords=5&timespan=30min&format=json'
)

# ── Lagos + Emergency filter ──
EMERGENCY_WORDS = [
    'fire', 'flood', 'accident', 'crash', 'robbery', 'shooting',
    'explosion', 'collapse', 'emergency', 'casualty', 'dead',
    'killed', 'injured', 'rescue', 'missing', 'trapped', 'burn',
    'attack', 'kidnap', 'armed', 'riot', 'protest', 'medical',
    'ambulance', 'hospital', 'outbreak', 'disaster',
]

LAGOS_WORDS = [
    'lagos', 'lekki', 'ikeja', 'surulere', 'apapa', 'yaba',
    'mushin', 'oshodi', 'ikorodu', 'badagry', 'victoria island',
    'festac', 'gbagada', 'maryland', 'mile 2', 'ajegunle',
    'alimosho', 'agege', 'shomolu', 'kosofe',
]


def is_emergency_article(title, summary=''):
    """Return True if article is Lagos-related and about an emergency."""
    text = (title + ' ' + summary).lower()
    has_lagos     = any(w in text for w in LAGOS_WORDS)
    has_emergency = any(w in text for w in EMERGENCY_WORDS)
    return has_lagos and has_emergency


def fetch_rss_feed(feed_config):
    """Fetch and parse one RSS feed. Returns list of article dicts."""
    articles = []
    try:
        parsed = feedparser.parse(feed_config['url'])
        for entry in parsed.entries[:20]:  # only last 20 articles
            title   = getattr(entry, 'title',   '') or ''
            summary = getattr(entry, 'summary', '') or ''
            link    = getattr(entry, 'link',    '') or ''
            text    = f"{title}. {summary}"

            if not is_emergency_article(title, summary):
                continue

            articles.append({
                'text':   text,
                'title':  title,
                'link':   link,
                'source': feed_config['source'],
            })

        log.info(f"[RSS] {feed_config['name']}: {len(articles)} emergency articles")
    except Exception as e:
        log.warning(f"[RSS] {feed_config['name']} failed: {e}")
    return articles


def fetch_gdelt():
    """Fetch latest Lagos emergency news from GDELT."""
    articles = []
    try:
        url = (
            # 'https://api.gdeltproject.org/api/v2/doc/doc'
            # '?query=Lagos+Nigeria+fire+flood+accident+robbery+emergency'
            # '&mode=artlist&maxrecords=10&timespan=15min&format=json'

            
            'https://api.gdeltproject.org/api/v2/doc/doc'
            '?query=Lagos+emergency&mode=artlist&maxrecords=5&timespan=30min&format=json'
        )
        resp = requests.get(GDELT_URL, timeout=20)
        if resp.status_code == 200:
            data = resp.json()
            for item in (data.get('articles') or []):
                title = item.get('title', '')
                url   = item.get('url', '')
                text  = title
                if is_emergency_article(title):
                    articles.append({
                        'text':   text,
                        'title':  title,
                        'link':   url,
                        'source': 'Punch Newspapers',  # GDELT aggregates news
                    })
        log.info(f"[GDELT] {len(articles)} Lagos emergency articles")
    except Exception as e:
        log.warning(f"[GDELT] Failed: {e}")
    return articles


def save_article(app, article):
    """
    Run NLP on article text and save to database if confidence >= 0.7.
    Returns True if saved.
    """
    with app.app_context():
        from app import db
        from app.models import Incident

        result = process_text(article['text'], source=article['source'])
        if not result:
            return False

        if result['confidence'] < 0.7:
            return False

        # Avoid duplicates — check if same title exists in last 24h
        cutoff = datetime.utcnow() - timedelta(hours=24)
        exists = Incident.query.filter(
            Incident.title.ilike(f"%{result['entities']['location']}%"),
            Incident.type == result['event_type'],
            Incident.created_at >= cutoff,
        ).first()
        if exists:
            return False

        loc = result.get('location') or {}
        inc_fields = dict(
            title       = result['suggested_title'],
            description = article['text'][:500],
            type        = result['event_type'],
            severity    = result['severity'],
            location    = loc.get('name', 'Lagos'),
            source      = article['source'],
            status      = 'Active',
            created_at  = datetime.utcnow(),
        )
        model_cols = {c.name for c in Incident.__table__.columns}
        if 'lga'        in model_cols: inc_fields['lga']        = loc.get('lga', 'Unknown')
        if 'state'      in model_cols: inc_fields['state']      = 'Lagos'
        if 'latitude'   in model_cols: inc_fields['latitude']   = loc.get('latitude')
        if 'longitude'  in model_cols: inc_fields['longitude']  = loc.get('longitude')
        if 'confidence' in model_cols: inc_fields['confidence'] = result['confidence']
        if 'affected'   in model_cols: inc_fields['affected']   = 0
        incident = Incident(**inc_fields)
        db.session.add(incident)
        db.session.commit()
        log.info(f"[RSS] Saved: {incident.title}")
        return True


def run_rss_monitor(app):
    """
    Main function called by scheduler every 60 seconds.
    Fetches all feeds, runs NLP, saves qualifying incidents.
    """
    log.info('[RSS] Starting RSS monitor cycle...')
    saved = 0

    # Fetch all RSS feeds
    all_articles = []
    for feed in RSS_FEEDS:
        all_articles.extend(fetch_rss_feed(feed))

    # Fetch GDELT
        # GDELT disabled — connection blocked on this network
        # all_articles.extend(fetch_gdelt())

    # Save each qualifying article
    for article in all_articles:
        try:
            if save_article(app, article):
                saved += 1
        except Exception as e:
            log.error(f"[RSS] Save error: {e}")

    log.info(f'[RSS] Cycle complete. Saved {saved}/{len(all_articles)} articles.')
    return saved