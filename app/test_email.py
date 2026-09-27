import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, mail
from flask_mail import Message

app = create_app()

with app.app_context():
    try:
        msg = Message(
            subject    = '🚨 CrisisWatch Email Test',
            recipients = [app.config['MAIL_USERNAME']],
            html       = '<h2>CrisisWatch email is working!</h2>',
        )
        mail.send(msg)
        print('✅ Email sent successfully! Check your inbox.')
    except Exception as e:
        print(f'❌ Email failed: {e}')