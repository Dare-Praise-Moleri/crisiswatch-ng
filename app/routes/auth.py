from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User

auth_bp = Blueprint('auth', __name__)

# ── REGISTER ──
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    required = ['name', 'email', 'password']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409

    hashed = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    user = User(
        name     = data['name'],
        email    = data['email'],
        phone    = data.get('phone', ''),
        password = hashed,
        role     = data.get('role', 'public'),
        zone     = data.get('zone', 'Nigeria'),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Account created successfully',
        'token':   token,
        'user':    user.to_dict(),
    }), 201


# ── LOGIN ──
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token':   token,
        'user':    user.to_dict(),
    }), 200


# ── GET CURRENT USER ──
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


# ── LOGOUT ──
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200





























# from app import db
# from datetime import datetime

# class User(db.Model):
#     __tablename__ = 'users'

#     id         = db.Column(db.Integer, primary_key=True)
#     name       = db.Column(db.String(120), nullable=False)
#     email      = db.Column(db.String(120), unique=True, nullable=False)
#     phone      = db.Column(db.String(20))
#     password   = db.Column(db.String(255), nullable=False)
#     role       = db.Column(db.String(20), default='public')   # public | responder | admin
#     zone       = db.Column(db.String(100), default='Nigeria')
#     bio        = db.Column(db.Text, default='')
#     verified   = db.Column(db.Boolean, default=False)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)

#     incidents  = db.relationship('Incident', backref='reporter', lazy=True)
#     alerts     = db.relationship('Alert', backref='user', lazy=True)

#     def to_dict(self):
#         return {
#             'id':         self.id,
#             'name':       self.name,
#             'email':      self.email,
#             'phone':      self.phone,
#             'role':       self.role,
#             'zone':       self.zone,
#             'bio':        self.bio,
#             'verified':   self.verified,
#             'created_at': self.created_at.isoformat(),
#         }


# class Incident(db.Model):
#     __tablename__ = 'incidents'

#     id          = db.Column(db.Integer, primary_key=True)
#     title       = db.Column(db.String(255), nullable=False)
#     description = db.Column(db.Text)
#     type        = db.Column(db.String(50))         # fire | crime | flood | accident | medical | security | protest | other
#     severity    = db.Column(db.String(20))         # critical | high | medium | low
#     status      = db.Column(db.String(20), default='Active')  # Active | Responding | Monitoring | Resolved
#     source      = db.Column(db.String(50))         # X (Twitter) | WhatsApp | Facebook | User Report
#     location    = db.Column(db.String(255))
#     state       = db.Column(db.String(100))
#     lga         = db.Column(db.String(100))
#     landmark    = db.Column(db.String(255))
#     latitude    = db.Column(db.Float)
#     longitude   = db.Column(db.Float)
#     affected    = db.Column(db.Integer, default=0)
#     responders  = db.Column(db.Integer, default=0)
#     media_urls  = db.Column(db.Text, default='')   # comma-separated URLs
#     anonymous   = db.Column(db.Boolean, default=False)
#     user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
#     created_at  = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

#     def to_dict(self):
#         return {
#             'id':          self.id,
#             'title':       self.title,
#             'description': self.description,
#             'type':        self.type,
#             'severity':    self.severity,
#             'status':      self.status,
#             'source':      self.source,
#             'location':    self.location,
#             'state':       self.state,
#             'lga':         self.lga,
#             'landmark':    self.landmark,
#             'latitude':    self.latitude,
#             'longitude':   self.longitude,
#             'affected':    self.affected,
#             'responders':  self.responders,
#             'anonymous':   self.anonymous,
#             'user_id':     self.user_id,
#             'created_at':  self.created_at.isoformat(),
#             'updated_at':  self.updated_at.isoformat(),
#         }


# class Alert(db.Model):
#     __tablename__ = 'alerts'

#     id          = db.Column(db.Integer, primary_key=True)
#     title       = db.Column(db.String(255), nullable=False)
#     body        = db.Column(db.Text)
#     type        = db.Column(db.String(30))    # critical | high | medium | low | system | info | resolved
#     category    = db.Column(db.String(30))    # Incident | System | Update
#     location    = db.Column(db.String(255))
#     source      = db.Column(db.String(50))
#     read        = db.Column(db.Boolean, default=False)
#     user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
#     incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=True)
#     created_at  = db.Column(db.DateTime, default=datetime.utcnow)

#     def to_dict(self):
#         return {
#             'id':          self.id,
#             'title':       self.title,
#             'body':        self.body,
#             'type':        self.type,
#             'category':    self.category,
#             'location':    self.location,
#             'source':      self.source,
#             'read':        self.read,
#             'user_id':     self.user_id,
#             'incident_id': self.incident_id,
#             'time':        self.created_at.isoformat(),
#             'created_at':  self.created_at.isoformat(),
#         }