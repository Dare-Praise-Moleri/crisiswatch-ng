from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Incident, Alert, User
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    now       = datetime.utcnow()
    last_hour = now - timedelta(hours=1)
    today     = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_incidents    = Incident.query.count()
    active_incidents   = Incident.query.filter_by(status='Active').count()
    high_severity      = Incident.query.filter_by(severity='high').count()
    critical_severity  = Incident.query.filter_by(severity='critical').count()
    resolved_today     = Incident.query.filter(
                            Incident.status == 'Resolved',
                            Incident.updated_at >= today
                         ).count()
    new_last_hour      = Incident.query.filter(Incident.created_at >= last_hour).count()
    total_users        = User.query.count()
    unread_alerts      = Alert.query.filter_by(read=False).count()

    # Incidents by type
    types = ['fire','crime','flood','accident','medical','security','protest','other']
    by_type = {}
    for t in types:
        by_type[t] = Incident.query.filter_by(type=t).count()

    # Incidents by severity
    by_severity = {
        'critical': Incident.query.filter_by(severity='critical').count(),
        'high':     Incident.query.filter_by(severity='high').count(),
        'medium':   Incident.query.filter_by(severity='medium').count(),
        'low':      Incident.query.filter_by(severity='low').count(),
    }

    # Incidents by status
    by_status = {
        'Active':     Incident.query.filter_by(status='Active').count(),
        'Responding': Incident.query.filter_by(status='Responding').count(),
        'Monitoring': Incident.query.filter_by(status='Monitoring').count(),
        'Resolved':   Incident.query.filter_by(status='Resolved').count(),
    }

    # Recent incidents (last 5)
    recent = Incident.query.order_by(Incident.created_at.desc()).limit(5).all()

    return jsonify({
        'stats': {
            'total_incidents':   total_incidents,
            'active_incidents':  active_incidents,
            'high_severity':     high_severity + critical_severity,
            'resolved_today':    resolved_today,
            'new_last_hour':     new_last_hour,
            'total_users':       total_users,
            'unread_alerts':     unread_alerts,
            'ner_accuracy':      98,
            'avg_response_time': 4.2,
            'posts_processed':   247,
        },
        'by_type':     by_type,
        'by_severity': by_severity,
        'by_status':   by_status,
        'recent_incidents': [i.to_dict() for i in recent],
    }), 200