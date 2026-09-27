"""
Run this ONCE to add missing columns to your SQLite database.
Usage:
    python migrate_db.py
"""
from app import create_app, db

app = create_app()

with app.app_context():
    with db.engine.connect() as conn:

        # See what columns already exist
        rows = conn.execute(db.text("PRAGMA table_info(incidents)")).fetchall()
        existing = [row[1] for row in rows]
        print("Current columns:", existing)

        # Add each missing column
        migrations = [
            ("confidence", "REAL"),
            ("lga",        "TEXT"),
            ("state",      "TEXT"),
            ("affected",   "INTEGER"),
            ("media_urls", "TEXT"),
            ("responders", "INTEGER"),
            ("anonymous",  "INTEGER"),
            ("landmark",   "TEXT"),
        ]

        for col, dtype in migrations:
            if col not in existing:
                conn.execute(db.text(f"ALTER TABLE incidents ADD COLUMN {col} {dtype}"))
                print(f"  Added: {col} ({dtype})")
            else:
                print(f"  Already exists: {col}")

        conn.commit()

    print("\nDone. Now run: python seed_lagos_data.py")