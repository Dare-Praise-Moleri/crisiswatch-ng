from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Incident, Alert
from app.services.email_service import send_incident_alert
from datetime import datetime

incidents_bp = Blueprint('incidents', __name__)

# ── GET ALL INCIDENTS ──
@incidents_bp.route('/', methods=['GET'])
def get_incidents():
    # Query params for filtering
    severity  = request.args.get('severity')
    status    = request.args.get('status')
    type_     = request.args.get('type')
    state     = request.args.get('state')
    source    = request.args.get('source')
    search    = request.args.get('search')
    limit     = request.args.get('limit', 50, type=int)
    offset    = request.args.get('offset', 0, type=int)

    query = Incident.query

    if severity: query = query.filter_by(severity=severity)
    if status:   query = query.filter_by(status=status)
    if type_:    query = query.filter_by(type=type_)
    if state:    query = query.filter_by(state=state)
    if source:   query = query.filter_by(source=source)
    if search:
        query = query.filter(
            db.or_(
                Incident.title.ilike(f'%{search}%'),
                Incident.location.ilike(f'%{search}%'),
                Incident.description.ilike(f'%{search}%'),
            )
        )

    total     = query.count()
    incidents = query.order_by(Incident.created_at.desc()).limit(limit).offset(offset).all()

    return jsonify({
        'incidents': [i.to_dict() for i in incidents],
        'total':     total,
        'limit':     limit,
        'offset':    offset,
    }), 200


# ── GET SINGLE INCIDENT ──
@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    return jsonify({'incident': incident.to_dict()}), 200


# ── CREATE INCIDENT ──
@incidents_bp.route('/', methods=['POST'])
@jwt_required()
def create_incident():
    user_id = get_jwt_identity()
    data    = request.get_json()

    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    incident = Incident(
        title       = data.get('title'),
        description = data.get('description', ''),
        type        = data.get('type', 'other'),
        severity    = data.get('severity', 'medium'),
        status      = data.get('status', 'Active'),
        source      = data.get('source', 'User Report'),
        location    = data.get('location', ''),
        state       = data.get('state', ''),
        lga         = data.get('lga', ''),
        landmark    = data.get('landmark', ''),
        latitude    = data.get('latitude'),
        longitude   = data.get('longitude'),
        affected    = data.get('affected', 0),
        anonymous   = data.get('anonymous', False),
        user_id     = int(user_id),
    )
    db.session.add(incident)
    db.session.flush()  # get the id before committing

    # Auto-create alert for high severity
    if incident.severity in ['critical', 'high']:
        alert = Alert(
            title       = f'🚨 {incident.severity.upper()} — {incident.title}',
            body        = incident.description,
            type        = incident.severity,
            category    = 'Incident',
            location    = incident.location,
            source      = incident.source,
            incident_id = incident.id,
        )
        db.session.add(alert)

    db.session.commit()

    # Send email alert to agencies for high severity incidents
    email_sent = send_incident_alert(incident)

    return jsonify({
        'message':    'Incident reported successfully',
        'incident':   incident.to_dict(),
        'alert_sent': email_sent,
    }), 201


# ── UPDATE INCIDENT STATUS ──
@incidents_bp.route('/<int:incident_id>', methods=['PUT'])
@jwt_required()
def update_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    data     = request.get_json()

    updatable = ['title','description','type','severity','status','location','state','lga','landmark','latitude','longitude','affected','responders']
    for field in updatable:
        if field in data:
            setattr(incident, field, data[field])

    incident.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message':  'Incident updated successfully',
        'incident': incident.to_dict(),
    }), 200


# ── DELETE INCIDENT ──
@incidents_bp.route('/<int:incident_id>', methods=['DELETE'])
@jwt_required()
def delete_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    db.session.delete(incident)
    db.session.commit()
    return jsonify({'message': 'Incident deleted'}), 200


# ── SEED DEMO INCIDENTS (for testing) ──
@incidents_bp.route('/seed', methods=['POST'])
def seed_incidents():
    demo = [
        { 'title': 'Building fire near Oshodi Market', 'type': 'fire',     'severity': 'high',   'status': 'Active',     'source': 'X (Twitter)', 'location': 'Oshodi, Lagos',       'state': 'Lagos',  'affected': 40,   'latitude': 6.5480,  'longitude': 3.3515, 'description': 'Heavy black smoke visible from the bridge. Multiple eyewitness reports.' },
        { 'title': 'Armed robbery alert — Lekki Phase 1', 'type': 'crime', 'severity': 'high',   'status': 'Active',     'source': 'WhatsApp',    'location': 'Lekki, Lagos',        'state': 'Lagos',  'affected': 12,   'latitude': 6.4345,  'longitude': 3.4775, 'description': 'Armed men spotted at junction. Police alerted.' },
        { 'title': 'Flash flood — Mararaba Road',     'type': 'flood',      'severity': 'medium', 'status': 'Active',     'source': 'Facebook',    'location': 'Mararaba, FCT',       'state': 'FCT',    'affected': 25,   'latitude': 8.9978,  'longitude': 7.3786, 'description': 'Road completely blocked. Vehicles stranded.' },
        { 'title': 'Vehicle crash — Lagos-Ibadan Expressway', 'type': 'accident', 'severity': 'medium', 'status': 'Responding', 'source': 'X (Twitter)', 'location': 'Sagamu, Ogun', 'state': 'Ogun', 'affected': 8, 'latitude': 6.8399,  'longitude': 3.6476, 'description': 'Three vehicles involved. FRSC on scene.' },
        { 'title': 'Security alert — Maiduguri Road', 'type': 'security',   'severity': 'high',   'status': 'Active',     'source': 'Facebook',    'location': 'Maiduguri, Borno',    'state': 'Borno',  'affected': 200,  'latitude': 11.8311, 'longitude': 13.1510,'description': 'Security situation being monitored. Army deployed.' },
        { 'title': 'Gas explosion — Trans Amadi',     'type': 'fire',       'severity': 'high',   'status': 'Responding', 'source': 'X (Twitter)', 'location': 'Trans Amadi, Rivers', 'state': 'Rivers', 'affected': 60,   'latitude': 4.8156,  'longitude': 7.0498, 'description': 'Industrial gas explosion. Evacuation ongoing.' },
    ]
    for d in demo:
        existing = Incident.query.filter_by(title=d['title']).first()
        if not existing:
            incident = Incident(**d)
            db.session.add(incident)
    db.session.commit()
    return jsonify({'message': f'Demo incidents seeded'}), 201