"""
CrisisWatch Lagos — Data Pipeline Test
========================================
Run this to verify each part of the data pipeline works
before starting the full server.

Usage:
    cd your project folder
    .\venv\Scripts\activate
    python test_data_pipeline.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("CrisisWatch Lagos — Data Pipeline Test")
print("=" * 60)

# ── Test 1: NLP Processor ──
print("\n[1] Testing NLP Processor...")
try:
    from app.nlp.processor import process_text, is_lagos_related

    tests = [
        ("Fire outbreak at Balogun market Lagos Island. Traders running away", "X (Twitter)"),
        ("Armed robbers in Lekki Phase 1 now, avoid that road", "WhatsApp"),
        ("Flooding in Festac Town Lagos, residents need evacuation", "Facebook"),
        ("This is a random post about food with no emergency", "X (Twitter)"),
        ("Road accident on Lagos Ibadan expressway near Berger", "Vanguard Nigeria"),
    ]

    for text, source in tests:
        result = process_text(text, source)
        if result:
            print(f"  ✓ '{text[:50]}...'")
            print(f"    → Type: {result['event_type']}, Severity: {result['severity']}, "
                  f"Location: {result['entities']['location']}, "
                  f"Confidence: {result['confidence']}")
        else:
            print(f"  ✗ Not Lagos-related (correctly filtered): '{text[:50]}'")

    print("  NLP Processor: OK")
except Exception as e:
    print(f"  NLP Processor FAILED: {e}")


# ── Test 2: RSS Feeds ──
print("\n[2] Testing RSS Feeds...")
try:
    import feedparser
    feeds = [
        ("Punch",    "https://punchng.com/feed/"),
        ("Vanguard", "https://www.vanguardngr.com/feed/"),
        ("Channels", "https://www.channelstv.com/feed/"),
    ]
    for name, url in feeds:
        try:
            f = feedparser.parse(url)
            print(f"  ✓ {name}: {len(f.entries)} articles fetched")
        except Exception as e:
            print(f"  ✗ {name}: {e}")
except ImportError:
    print("  feedparser not installed. Run: pip install feedparser")


# ── Test 3: Reddit (optional) ──
print("\n[3] Testing Reddit connection...")
try:
    import praw
    from dotenv import load_dotenv
    load_dotenv()
    client_id     = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')

    if not client_id or client_id == 'your_reddit_client_id':
        print("  ⚠ Reddit not configured in .env — skipping")
        print("    (Get free credentials at https://www.reddit.com/prefs/apps)")
    else:
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent='CrisisWatchLagos/1.0',
        )
        sub = reddit.subreddit('Lagos')
        posts = list(sub.new(limit=3))
        print(f"  ✓ Reddit connected: r/Lagos has recent posts")
        for p in posts:
            print(f"    - {p.title[:60]}")
except ImportError:
    print("  praw not installed. Run: pip install praw")
except Exception as e:
    print(f"  Reddit error: {e}")


# ── Test 4: Database ──
print("\n[4] Testing Database...")
try:
    from app import create_app, db
    from app.models import Incident

    app = create_app()
    with app.app_context():
        count = Incident.query.count()
        print(f"  ✓ Database connected: {count} incidents")
        if count == 0:
            print("    → Database is empty. Run: python seed_lagos_data.py")
        elif count < 20:
            print(f"    → Only {count} incidents. Consider running seed_lagos_data.py")
        else:
            print(f"    → Good! {count} incidents available for demo")
except Exception as e:
    print(f"  Database FAILED: {e}")


print("\n" + "=" * 60)
print("Test complete.")
print("=" * 60)
print("\nNext steps:")
print("  1. If DB is empty:     python seed_lagos_data.py")
print("  2. Start server:       python run.py")
print("  3. Start frontend:     npm run dev")
print("  4. Open browser:       http://localhost:5173")