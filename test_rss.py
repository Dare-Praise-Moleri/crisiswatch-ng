"""
Quick RSS test — run this first to confirm feeds work.
Usage:
    python test_rss.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing RSS feeds...\n")

import feedparser

FEEDS = [
    ("Punch Newspapers",  "https://punchng.com/feed/"),
    ("Vanguard Nigeria",  "https://www.vanguardngr.com/feed/"),
    ("Channels TV",       "https://www.channelstv.com/feed/"),
    ("Premium Times",     "https://www.premiumtimesng.com/feed"),
    ("The Nation",        "https://thenationonlineng.net/feed/"),
]

EMERGENCY_WORDS = [
    'fire', 'flood', 'accident', 'crash', 'robbery', 'shooting',
    'explosion', 'collapse', 'emergency', 'casualty', 'dead',
    'killed', 'injured', 'rescue', 'trapped', 'attack', 'kidnap',
    'armed', 'riot', 'outbreak', 'disaster',
]

LAGOS_WORDS = [
    'lagos', 'lekki', 'ikeja', 'surulere', 'apapa', 'yaba',
    'mushin', 'oshodi', 'ikorodu', 'victoria island', 'festac',
    'gbagada', 'maryland', 'mile 2', 'ajegunle', 'alimosho',
    'nigeria', 'abuja', 'nigerian', 'naija',
]

total_articles = 0
lagos_emergency = 0

for name, url in FEEDS:
    try:
        f = feedparser.parse(url)
        count = len(f.entries)
        total_articles += count

        matches = []
        for entry in f.entries[:20]:
            title   = (entry.get('title', '') or '').lower()
            summary = (entry.get('summary', '') or '').lower()
            text    = title + ' ' + summary

            has_lagos     = any(w in text for w in LAGOS_WORDS)
            has_emergency = any(w in text for w in EMERGENCY_WORDS)

            if has_lagos and has_emergency:
                matches.append(entry.get('title', 'No title'))
                lagos_emergency += 1

        status = "OK" if count > 0 else "EMPTY"
        print(f"  [{status}] {name}: {count} articles, {len(matches)} Lagos emergencies")
        for m in matches[:3]:
            print(f"    MATCH -> {m[:80]}")
        # Show first 3 articles regardless so you can see what's coming in
        for entry in f.entries[:3]:
            title = (entry.get('title','') or '')
            print(f"    FEED  -> {title[:80]}")

    except Exception as e:
        print(f"  [FAIL] {name}: {e}")

print(f"\nTotal: {total_articles} articles fetched, {lagos_emergency} Lagos emergency matches")

if total_articles == 0:
    print("\nNo articles fetched. Check your internet connection.")
elif lagos_emergency == 0:
    print("\nNo Lagos emergencies right now — this is normal.")
    print("The RSS monitor will catch them when they happen.")
else:
    print("\nRSS is working. These will be saved automatically when you run the backend.")