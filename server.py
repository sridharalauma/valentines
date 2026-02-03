from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, json, datetime, smtplib
from email.message import EmailMessage

app = Flask(__name__, static_folder='.', static_url_path='/')
CORS(app)

RESPONSES_FILE = 'responses.json'

def save_response(data):
    try:
        if os.path.exists(RESPONSES_FILE):
            with open(RESPONSES_FILE, 'r', encoding='utf-8') as f:
                arr = json.load(f)
        else:
            arr = []
    except Exception:
        arr = []
    arr.append(data)
    with open(RESPONSES_FILE, 'w', encoding='utf-8') as f:
        json.dump(arr, f, indent=2)

def send_email(subject, body):
    host = os.environ.get('EMAIL_HOST')
    port = int(os.environ.get('EMAIL_PORT', '587'))
    user = os.environ.get('EMAIL_USER')
    password = os.environ.get('EMAIL_PASSWORD')
    to_addr = os.environ.get('EMAIL_TO')
    if not all([host, user, password, to_addr]):
        print('Email credentials not set, skipping email.')
        return False, 'email not configured'
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = user
    msg['To'] = to_addr
    msg.set_content(body)
    try:
        if port == 465:
            smtp = smtplib.SMTP_SSL(host, port)
            smtp.login(user, password)
        else:
            smtp = smtplib.SMTP(host, port)
            smtp.starttls()
            smtp.login(user, password)
        smtp.send_message(msg)
        smtp.quit()
        return True, 'sent'
    except Exception as e:
        return False, str(e)


@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'no json'}), 400
    entry = {'data': data, 'received_at': datetime.datetime.utcnow().isoformat()}
    save_response(entry)
    subject = f"New responses received at {entry['received_at']}"
    body = json.dumps(entry, indent=2)
    ok, info = send_email(subject, body)
    msg = 'saved'
    if ok:
        msg += ' and emailed'
    else:
        msg += ' (email failed: ' + info + ')'
    return jsonify({'success': ok, 'message': msg})


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
