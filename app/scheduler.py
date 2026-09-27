"""
CrisisWatch Lagos - Background Scheduler
Runs RSS, Reddit, Telegram and simulation monitors.
Called once from app/__init__.py on Flask startup.
"""
import logging
import threading
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

log       = logging.getLogger('crisiswatch.scheduler')
scheduler = BackgroundScheduler(timezone='Africa/Lagos')


# ── Runner wrappers (import inside function to avoid circular imports) ──

def run_rss(app):
    try:
        from app.nlp.rss_monitor import run_rss_monitor
        run_rss_monitor(app)
    except Exception as e:
        log.error(f'[RSS] Error: {e}')


# def run_reddit(app):
#     try:
#         from app.nlp.reddit_monitor import run_reddit_monitor
#         run_reddit_monitor(app)
#     except Exception as e:
#         log.error(f'[Reddit] Error: {e}')


def run_telegram(app):
    try:
        from app.nlp.telegram_monitor import run_telegram_monitor
        run_telegram_monitor(app)
    except Exception as e:
        log.error(f'[Telegram] Error: {e}')


def run_simulation(app):
    """
    Fallback — picks a random sample post, runs NLP, saves it.
    Only fires when DB has fewer than 10 incidents.
    """
    try:
        with app.app_context():
            from app import db
            from app.models import Incident
            from app.nlp.processor import process_text, SAMPLE_POSTS
            import random
            from datetime import datetime

            count = Incident.query.count()
            if count >= 10:
                return  # DB has enough data, simulation not needed

            post   = random.choice(SAMPLE_POSTS)
            result = process_text(post['text'], source=post['source'])
            if not result:
                return

            loc = result.get('location') or {}
            inc_fields = dict(
                title       = result['suggested_title'],
                description = post['text'],
                type        = result['event_type'],
                severity    = result['severity'],
                location    = loc.get('name', 'Lagos'),
                source      = post['source'],
                status      = 'Active',
                created_at  = datetime.utcnow(),
            )
            # Add optional columns if they exist
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
            log.info(f'[Sim] Added: {incident.title}')
    except Exception as e:
        log.error(f'[Sim] Error: {e}')


def start_scheduler(app):
    """
    Start all background jobs.
    Called once from app/__init__.py when Flask starts.
    """
    log.info('[Scheduler] Starting up...')

    # ── Run RSS and simulation immediately on startup ──
    threading.Thread(target=run_rss,        args=[app], daemon=True).start()
    threading.Thread(target=run_simulation, args=[app], daemon=True).start()

    # Reddit runs on startup too (gracefully skips if not configured)
    # threading.Thread(target=run_reddit,  args=[app], daemon=True).start()
    # threading.Thread(target=run_telegram, args=[app], daemon=True).start()

    # ── RSS — every 60 seconds ──
    scheduler.add_job(
        func=run_rss,
        trigger=IntervalTrigger(seconds=60),
        args=[app],
        id='rss_monitor',
        name='RSS News Monitor',
        replace_existing=True,
        misfire_grace_time=30,
    )

    # ── Reddit — every 60 seconds ──
    # scheduler.add_job(
    #     func=run_reddit,
    #     trigger=IntervalTrigger(seconds=60),
    #     args=[app],
    #     id='reddit_monitor',
    #     name='Reddit Monitor',
    #     replace_existing=True,
    #     misfire_grace_time=30,
    # )

    # ── Telegram — every 30 seconds ──
    scheduler.add_job(
        func=run_telegram,
        trigger=IntervalTrigger(seconds=30),
        args=[app],
        id='telegram_monitor',
        name='Telegram Monitor',
        replace_existing=True,
        misfire_grace_time=15,
    )

    # ── Simulation fallback — every 3 minutes ──
    scheduler.add_job(
        func=run_simulation,
        trigger=IntervalTrigger(minutes=3),
        args=[app],
        id='simulation',
        name='Simulation Fallback',
        replace_existing=True,
        misfire_grace_time=60,
    )

    if not scheduler.running:
        scheduler.start()

    log.info('[Scheduler] All monitors active:')
    log.info('  RSS        -> every 60s')
    # log.info('  Reddit     -> every 60s (skips if not configured)')
    log.info('  Telegram   -> every 30s (skips if not configured)')
    log.info('  Simulation -> every 3min (only when DB < 10 incidents)')