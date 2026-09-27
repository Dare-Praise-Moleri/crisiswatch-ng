"""
CrisisWatch Lagos — Reddit Live Monitor
=========================================
Monitors r/Lagos and r/Nigeria for emergency posts.
Uses PRAW (Python Reddit API Wrapper) — completely free,
no payment, no approval needed for read-only access.

Setup (one time):
  1. Go to https://www.reddit.com/prefs/apps
  2. Click "Create App" → choose "script"
  3. Name: CrisisWatch
  4. Redirect URI: http://localhost:8080
  5. Copy client_id and client_secret into your .env file

Add to your .env:
  REDDIT_CLIENT_ID=your_client_id_here
  REDDIT_CLIENT_SECRET=your_client_secret_here
  REDDIT_USER_AGENT=CrisisWatchLagos/1.0

Data class: CLASS C — Live Operational Data
Lag: ~30 seconds from post to detection
"""

import logging
import os
from datetime import datetime, timedelta
from app.nlp.processor import process_text

log = logging.getLogger('reddit_monitor')

# Subreddits to monitor
SUBREDDITS = [
    'Lagos',       # r/Lagos — dedicated Lagos community
    'Nigeria',     # r/Nigeria — general Nigeria, Lagos posts common
    'naija',       # r/naija — informal Nigerian community
]

# How many recent posts to check each cycle
POSTS_PER_SUBREDDIT = 25


def get_reddit_client():
    """
    Create Reddit client using environment variables.
    Returns praw.Reddit instance or None if not configured.
    """
    try:
        import praw
        client_id     = os.getenv('REDDIT_CLIENT_ID')
        client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        user_agent    = os.getenv('REDDIT_USER_AGENT', 'CrisisWatchLagos/1.0')

        if not client_id or not client_secret:
            log.warning('[Reddit] REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not set in .env')
            return None

        return praw.Reddit(
            client_id     = client_id,
            client_secret = client_secret,
            user_agent    = user_agent,
        )
    except ImportError:
        log.warning('[Reddit] praw not installed. Run: pip install praw')
        return None
    except Exception as e:
        log.error(f'[Reddit] Client error: {e}')
        return None


def fetch_reddit_posts(reddit, subreddit_name):
    """Fetch recent posts from a subreddit. Returns list of text dicts."""
    posts = []
    try:
        subreddit = reddit.subreddit(subreddit_name)
        for post in subreddit.new(limit=POSTS_PER_SUBREDDIT):
            # Skip very old posts (older than 2 hours)
            post_time = datetime.utcfromtimestamp(post.created_utc)
            if datetime.utcnow() - post_time > timedelta(hours=2):
                continue

            # Combine title + text body
            text = f"{post.title}. {post.selftext or ''}".strip()
            if len(text) < 20:
                continue

            posts.append({
                'text':       text,
                'title':      post.title,
                'url':        f"https://reddit.com{post.permalink}",
                'source':     'X (Twitter)',  # categorised as social media
                'post_id':    post.id,
                'created_at': post_time,
            })

        log.info(f"[Reddit] r/{subreddit_name}: {len(posts)} recent posts fetched")
    except Exception as e:
        log.warning(f"[Reddit] r/{subreddit_name} failed: {e}")
    return posts


def save_reddit_post(app, post):
    """Run NLP and save to database if confidence >= 0.7."""
    with app.app_context():
        from app import db
        from app.models import Incident

        result = process_text(post['text'], source='X (Twitter)')
        if not result:
            return False

        if result['confidence'] < 0.7:
            return False

        # Avoid saving same Reddit post twice (by post_id in description)
        exists = Incident.query.filter(
            Incident.description.contains(post['post_id'])
        ).first()
        if exists:
            return False

        loc = result.get('location') or {}
        description = f"{post['text'][:400]}\n\n[Reddit post: {post['url']}]\n[ID:{post['post_id']}]"

        incident = Incident(
            title       = result['suggested_title'],
            description = description,
            type        = result['event_type'],
            severity    = result['severity'],
            location    = loc.get('name', 'Lagos'),
            lga         = loc.get('lga', 'Unknown'),
            state       = 'Lagos',
            latitude    = loc.get('latitude'),
            longitude   = loc.get('longitude'),
            source      = 'X (Twitter)',
            status      = 'Active',
            confidence  = result['confidence'],
            created_at  = datetime.utcnow(),
        )
        db.session.add(incident)
        db.session.commit()
        log.info(f"[Reddit] Saved: {incident.title}")
        return True


def run_reddit_monitor(app):
    """
    Main function called by scheduler every 60 seconds.
    Checks all subreddits, runs NLP, saves qualifying posts.
    """
    reddit = get_reddit_client()
    if not reddit:
        log.info('[Reddit] Skipping — client not configured')
        return 0

    log.info('[Reddit] Starting Reddit monitor cycle...')
    saved = 0
    all_posts = []

    for subreddit in SUBREDDITS:
        all_posts.extend(fetch_reddit_posts(reddit, subreddit))

    for post in all_posts:
        try:
            if save_reddit_post(app, post):
                saved += 1
        except Exception as e:
            log.error(f'[Reddit] Save error: {e}')

    log.info(f'[Reddit] Cycle complete. Saved {saved}/{len(all_posts)} posts.')
    return saved
