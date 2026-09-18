from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Alert

alerts_bp = Blueprint('alerts', __name__)

# ── GET ALL ALERTS ──
@alerts_bp.route('/', methods=['GET'])
@jwt_required()
def get_alerts():
    user_id  = get_jwt_identity()
    category = request.args.get('category')
    unread   = request.args.get('unread')

    query = Alert.query.filter(
        db.or_(Alert.user_id == int(user_id), Alert.user_id == None)
    )

    if category and category != 'All':
        query = query.filter_by(category=category)
    if unread == 'true':
        query = query.filter_by(read=False)

    alerts = query.order_by(Alert.created_at.desc()).all()

    return jsonify({
        'alerts':       [a.to_dict() for a in alerts],
        'total':        len(alerts),
        'unread_count': sum(1 for a in alerts if not a.read),
    }), 200


# ── MARK ALERT AS READ ──
@alerts_bp.route('/<int:alert_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    alert.read = True
    db.session.commit()
    return jsonify({'message': 'Alert marked as read'}), 200


# ── MARK ALL AS READ ──
@alerts_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Alert.query.filter(
        db.or_(Alert.user_id == int(user_id), Alert.user_id == None)
    ).update({'read': True})
    db.session.commit()
    return jsonify({'message': 'All alerts marked as read'}), 200


# ── DELETE ALERT ──
@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@jwt_required()
def delete_alert(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    db.session.delete(alert)
    db.session.commit()
    return jsonify({'message': 'Alert deleted'}), 200


# ── CLEAR ALL ALERTS ──
@alerts_bp.route('/clear-all', methods=['DELETE'])
@jwt_required()
def clear_all():
    user_id = get_jwt_identity()
    Alert.query.filter(
        db.or_(Alert.user_id == int(user_id), Alert.user_id == None)
    ).delete()
    db.session.commit()
    return jsonify({'message': 'All alerts cleared'}), 200