from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User, Incident

profile_bp = Blueprint('profile', __name__)

# ── GET PROFILE ──
@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(int(user_id))

    reports_count   = Incident.query.filter_by(user_id=int(user_id)).count()
    resolved_count  = Incident.query.filter_by(user_id=int(user_id), status='Resolved').count()

    profile = user.to_dict()
    profile['stats'] = {
        'reports_submitted':  reports_count,
        'incidents_responded': 0,
        'cases_resolved':     resolved_count,
        'accuracy_score':     96,
        'avg_response_time':  '4.1m',
        'days_active':        (
            __import__('datetime').datetime.utcnow() - user.created_at
        ).days,
    }
    return jsonify({'profile': profile}), 200


# ── UPDATE PROFILE ──
@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(int(user_id))
    data    = request.get_json()

    updatable = ['name', 'phone', 'zone', 'bio']
    for field in updatable:
        if field in data:
            setattr(user, field, data[field])

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user':    user.to_dict(),
    }), 200


# ── CHANGE PASSWORD ──
@profile_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user    = User.query.get_or_404(int(user_id))
    data    = request.get_json()

    if not bcrypt.check_password_hash(user.password, data.get('current_password', '')):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if data.get('new_password') != data.get('confirm_password'):
        return jsonify({'error': 'Passwords do not match'}), 400

    if len(data.get('new_password', '')) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    user.password = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200