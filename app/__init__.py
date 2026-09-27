from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv
import os

load_dotenv()

db      = SQLAlchemy()
bcrypt  = Bcrypt()
jwt     = JWTManager()
mail    = Mail()

def create_app():
    app = Flask(__name__)

    # ── Configuration ──
    app.config['SECRET_KEY']                = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['JWT_SECRET_KEY']            = os.getenv('JWT_SECRET_KEY', 'jwt-secret')
    database_url = os.getenv('DATABASE_URL', 'sqlite:///crisiswatch.db')
    # Render uses postgres:// but SQLAlchemy needs postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'connect_args': {'timeout': 30}}
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES']  = False  # tokens don't expire during dev

    # ── Email configuration ──
    app.config['MAIL_SERVER']         = 'smtp.gmail.com'
    app.config['MAIL_PORT']           = 587
    app.config['MAIL_USE_TLS']        = True
    app.config['MAIL_USE_SSL']        = False
    app.config['MAIL_USERNAME']       = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD']       = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_DEBUG']          = True

    # ── Extensions ──
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)

    # ── CORS — allow React on any port ──
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    # ── Register Blueprints (routes) ──
    from app.routes.auth      import auth_bp
    from app.routes.incidents import incidents_bp
    from app.routes.alerts    import alerts_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.profile   import profile_bp
    from app.routes.nlp       import nlp_bp

    app.register_blueprint(auth_bp,      url_prefix='/api/auth')
    app.register_blueprint(incidents_bp, url_prefix='/api/incidents')
    app.register_blueprint(alerts_bp,    url_prefix='/api/alerts')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(profile_bp,   url_prefix='/api/profile')
    app.register_blueprint(nlp_bp,       url_prefix='/api/nlp')

    # ── Create all database tables ──
    with app.app_context():
        db.create_all()
    
    # ── Start background monitors (RSS, Reddit, Telegram) ──
        try:
            from app.scheduler import start_scheduler
            start_scheduler(app)
            print('[Init] Scheduler started OK')
        except Exception as e:
            import traceback
            print(f'[Init] Scheduler FAILED: {e}')
            traceback.print_exc()

    return app