from flask_mail import Message
from app import mail
from flask import current_app

# ── REGISTERED AGENCY EMAILS ──
# In production these come from a database of registered agencies
AGENCY_EMAILS = {
    'fire':     ['nema.alert@gmail.com'],   # Replace with real NEMA email
    'crime':    ['nema.alert@gmail.com'],
    'flood':    ['nema.alert@gmail.com'],
    'accident': ['nema.alert@gmail.com'],
    'medical':  ['nema.alert@gmail.com'],
    'security': ['nema.alert@gmail.com'],
    'other':    ['nema.alert@gmail.com'],
}

SEV_COLORS = {
    'critical': '#FF3B30',
    'high':     '#CC2200',
    'medium':   '#F59E0B',
    'low':      '#10B981',
}

def send_incident_alert(incident):
    """
    Send email alert to relevant agencies when a new
    high-severity incident is reported.
    """
    try:
        if incident.severity not in ['critical', 'high']:
            return False

        recipients = AGENCY_EMAILS.get(incident.type, AGENCY_EMAILS['other'])
        sev_color  = SEV_COLORS.get(incident.severity, '#CC2200')

        subject = f"🚨 {incident.severity.upper()} ALERT — {incident.title}"

        html_body = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080E1A; color: #E8EDF5; border-radius: 12px; overflow: hidden;">

          <!-- Header -->
          <div style="background: {sev_color}; padding: 24px 32px;">
            <h1 style="color: #fff; margin: 0; font-size: 22px;">
              🚨 Emergency Alert — CrisisWatch Nigeria
            </h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
              Severity: {incident.severity.upper()} &nbsp;|&nbsp; Type: {incident.type.upper()}
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 32px; background: #0D1525;">
            <h2 style="color: #E8EDF5; font-size: 18px; margin-top: 0;">
              {incident.title}
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; background: #111827; border-radius: 8px 8px 0 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Location</td>
                <td style="padding: 10px; background: #111827; border-radius: 8px 8px 0 0; color: #E8EDF5; font-weight: 600;">{incident.location or 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #1A2438; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">State</td>
                <td style="padding: 10px; background: #1A2438; color: #E8EDF5; font-weight: 600;">{incident.state or 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #111827; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Status</td>
                <td style="padding: 10px; background: #111827; color: #E8EDF5; font-weight: 600;">{incident.status}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #1A2438; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Source</td>
                <td style="padding: 10px; background: #1A2438; color: #E8EDF5; font-weight: 600;">{incident.source}</td>
              </tr>
              <tr>
                <td style="padding: 10px; background: #111827; border-radius: 0 0 8px 8px; color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">People Affected</td>
                <td style="padding: 10px; background: #111827; border-radius: 0 0 8px 8px; color: #E8EDF5; font-weight: 600;">~{incident.affected or 'Unknown'}</td>
              </tr>
            </table>

            <div style="background: #111827; border-radius: 10px; padding: 16px; margin: 20px 0;">
              <p style="color: #9CA3AF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px;">Description</p>
              <p style="color: #E8EDF5; margin: 0; line-height: 1.6;">{incident.description or 'No description provided.'}</p>
            </div>

            {'<div style="background: #1A2438; border-radius: 10px; padding: 14px 16px; margin: 16px 0;"><p style="color: #9CA3AF; font-size: 12px; margin: 0 0 6px;">GPS Coordinates</p><p style="color: #E8EDF5; font-weight: 600; margin: 0;">' + str(incident.latitude) + ', ' + str(incident.longitude) + '</p></div>' if incident.latitude else ''}

            <a href="http://localhost:5173/incidents"
               style="display: inline-block; background: {sev_color}; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-top: 8px;">
              View Full Incident &rarr;
            </a>
          </div>

          <!-- Footer -->
          <div style="background: #060C17; padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.08);">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              This is an automated alert from <strong style="color: #CC2200;">CrisisWatch Nigeria</strong>.
              This alert was generated at {incident.created_at.strftime('%Y-%m-%d %H:%M:%S UTC') if incident.created_at else 'Unknown time'}.
            </p>
          </div>
        </div>
        """

        msg = Message(
            subject    = subject,
            recipients = recipients,
            html       = html_body,
        )
        mail.send(msg)
        return True

    except Exception as e:
        print(f"Email send error: {e}")
        return False


def send_confirmation_to_reporter(reporter_email, incident):
    """
    Send confirmation to the person who reported the incident.
    """
    try:
        if not reporter_email:
            return False

        msg = Message(
            subject    = f"✅ Your emergency report has been received — CrisisWatch Nigeria",
            recipients = [reporter_email],
            html       = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #CC2200; padding: 24px 32px;">
                <h1 style="color: #fff; margin: 0; font-size: 20px;">✅ Report Received</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">CrisisWatch Nigeria</p>
              </div>
              <div style="padding: 32px; background: #0D1525; color: #E8EDF5;">
                <p style="font-size: 16px; line-height: 1.7;">
                  Your emergency report has been received and is being processed.
                  Relevant emergency agencies have been notified immediately.
                </p>
                <div style="background: #111827; border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <p style="color: #9CA3AF; margin: 0 0 6px; font-size: 12px; text-transform: uppercase;">Report</p>
                  <p style="color: #E8EDF5; font-weight: 600; margin: 0;">{incident.title}</p>
                </div>
                <p style="color: rgba(232,237,245,0.6); font-size: 14px; line-height: 1.7;">
                  If this is a life-threatening emergency, please also call:
                  <br><strong style="color: #CC2200;">Emergency: 112</strong>
                  <br><strong style="color: #CC2200;">NEMA: 0800-CALL-NEMA</strong>
                  <br><strong style="color: #CC2200;">Police: 07002-POLICE</strong>
                </p>
              </div>
            </div>
            """,
        )
        mail.send(msg)
        return True

    except Exception as e:
        print(f"Confirmation email error: {e}")
        return False