"""
CrisisWatch Lagos — Telegram Monitor
=======================================
Monitors public Telegram channels for Lagos emergency posts.
Uses Telethon (MTProto) — completely free, no payment needed.

Setup (one time — 10 minutes):
  1. Go to https://my.telegram.org
  2. Log in with your phone number
  3. Click "API Development Tools"
  4. Create new application:
       App title: CrisisWatch
       Short name: crisiswatch
  5. Copy api_id and api_hash into your .env file
  6. First run will ask for your phone number (one time SMS verification)

Add to your .env:
  TELEGRAM_API_ID=12345678
  TELEGRAM_API_HASH=abcdefghijklmnop1234567890abcdef
  TELEGRAM_PHONE=+2348012345678

Public Lagos Channels monitored (no need to join):
  @Instablog9ja     — Largest Nigerian news aggregator
  @LasemaNG         — Official LASEMA alerts (if available)
  @channelstv       — Channels TV breaking news
  @vanguardnews     — Vanguard newspaper
  @PunchOnTheGo     — Punch newspaper

Data class: CLASS C — Live Operational Data
Lag: Seconds from post to detection
"""

import logging
import os
import asyncio
from datetime import datetime, timedelta
from app.nlp.processor import process_text

log = logging.getLogger('telegram_monitor')

# Public Telegram channels to monitor (no membership needed)
CHANNELS = [
    'Instablog9jaofficial',      # Works — largest Nigerian news aggregator
    'channelstvnews',    # Channels TV correct username
    'Vanguardngrnewss',    # Vanguard correct username
    'PremiumTimesChannel',    # Premium Times correct username
    # 'thenationonnigeria',   # The Nation correct username
    'PunchNewspaper',
    'crisiswatchlagos',
    'tvcnews_nigeria',
]

# How many recent messages to check per channel per cycle
MESSAGES_PER_CHANNEL = 20


async def fetch_channel_messages(client, channel_name):
    """Fetch recent messages from one Telegram channel."""
    messages = []
    try:
        from telethon.tl.types import Channel
        entity  = await client.get_entity(channel_name)
        cutoff  = datetime.utcnow() - timedelta(hours=1)

        async for msg in client.iter_messages(entity, limit=MESSAGES_PER_CHANNEL):
            if not msg.text:
                continue
            if msg.date.replace(tzinfo=None) < cutoff:
                break  # Messages are newest-first; stop when too old

            messages.append({
                'text':       msg.text,
                'message_id': msg.id,
                'channel':    channel_name,
                'source':     'Channels TV' if 'channel' in channel_name.lower()
                              else 'Vanguard Nigeria' if 'vanguard' in channel_name.lower()
                              else 'Punch Newspapers' if 'punch' in channel_name.lower()
                              else 'Premium Times' if 'premium' in channel_name.lower()
                              else 'X (Twitter)',   # Instablog → social
                'created_at': msg.date.replace(tzinfo=None),
            })

        log.info(f"[Telegram] @{channel_name}: {len(messages)} recent messages")
        for m in messages[:3]:
            log.info(f"  SAMPLE: {m['text'][:100]}")
    except Exception as e:
        log.warning(f"[Telegram] @{channel_name} failed: {e}")
    return messages


def save_telegram_message(app, message):
    """Run NLP and save to database if confidence >= 0.7."""
    with app.app_context():
        from app import db
        from app.models import Incident

        result = process_text(message['text'], source=message['source'])
        if not result:
            return False

        if result['confidence'] < 0.7:
            return False

        # Deduplicate by Telegram message ID stored in description
        tg_id = f"[TG:{message['channel']}:{message['message_id']}]"
        exists = Incident.query.filter(
            Incident.description.contains(tg_id)
        ).first()
        if exists:
            return False

        loc = result.get('location') or {}
        description = f"{message['text'][:400]}\n\n{tg_id}"

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
            source      = message['source'],
            status      = 'Active',
            confidence  = result['confidence'],
            created_at  = datetime.utcnow(),
        )
        db.session.add(incident)
        db.session.commit()
        log.info(f"[Telegram] Saved: {incident.title}")
        return True


async def telegram_cycle(app):
    """One monitoring cycle — async, fetches all channels."""
    try:
        from telethon import TelegramClient

        api_id   = os.getenv('TELEGRAM_API_ID')
        api_hash = os.getenv('TELEGRAM_API_HASH')
        phone    = os.getenv('TELEGRAM_PHONE')

        if not api_id or not api_hash:
            log.info('[Telegram] API credentials not set — skipping')
            return 0

        session_file = 'crisiswatch_telegram'
        saved        = 0

        async with TelegramClient(session_file, int(api_id), api_hash) as client:
            if not await client.is_user_authorized():
                # First time only — sends SMS, interactive
                await client.start(phone=phone)

            all_messages = []
            for channel in CHANNELS:
                msgs = await fetch_channel_messages(client, channel)
                all_messages.extend(msgs)

            for message in all_messages:
                try:
                    result_saved = save_telegram_message(app, message)
                    if result_saved:
                        saved += 1
                    else:
                        from app.nlp.processor import process_text
                        r = process_text(message['text'], source=message['source'])
                        if r:
                            log.info(f"  REJECTED: conf={r['confidence']} lagos={r.get('location')} type={r['event_type']}")
                        else:
                            log.info(f"  REJECTED: process_text returned None for: {message['text'][:60]}")
                except Exception as e:
                    log.error(f'[Telegram] Save error: {e}')

        log.info(f'[Telegram] Cycle complete. Saved {saved}/{len(all_messages)}.')
        return saved

    except ImportError:
        log.warning('[Telegram] telethon not installed. Run: pip install telethon')
        return 0
    except Exception as e:
        log.error(f'[Telegram] Cycle error: {e}')
        return 0


def run_telegram_monitor(app):
    """Synchronous wrapper called by APScheduler."""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(telegram_cycle(app))
        loop.close()
        return result
    except Exception as e:
        log.error(f'[Telegram] Runner error: {e}')
        return 0
