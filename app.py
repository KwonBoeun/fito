import os
import uuid
from datetime import timedelta

from flask import Flask, jsonify, render_template, request

from src.database.session import init_db
from src.routes.auth_routes import register_auth_routes
from src.routes.group_routes import register_group_routes
from src.db import check_db_connection, get_database_url
from src.routes.workout_routes import register_workout_routes
from src.routes.question_routes import register_question_routes

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
app.config['DATABASE_URL'] = get_database_url()
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fito-dev-secret-key')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
init_db()
register_auth_routes(app)
register_group_routes(app)
register_workout_routes(app)
register_question_routes(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def main():
    return render_template('login.html')


@app.route('/home')
def home():
    return render_template('main.html')


@app.route('/upload/live')
def upload_live():
    return render_template('upload_live.html')


@app.route('/upload/vod')
def upload_vod():
    return render_template('upload_vod.html')


@app.route('/api/upload/vod', methods=['POST'])
def api_upload_vod():
    video = request.files.get('video')
    if not video:
        return jsonify({'error': '파일이 없습니다'}), 400
    ext = os.path.splitext(video.filename)[1].lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    video.save(os.path.join(UPLOAD_FOLDER, filename))
    return jsonify({'ok': True, 'videoUrl': f'/static/uploads/{filename}'})


@app.route('/upload/fits')
def upload_fits():
    return render_template('upload_fits.html')


@app.route('/api/upload/fits', methods=['POST'])
def api_upload_fits():
    video = request.files.get('video')
    if not video:
        return jsonify({'error': '파일이 없습니다'}), 400
    ext = os.path.splitext(video.filename)[1].lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    video.save(os.path.join(UPLOAD_FOLDER, filename))
    return jsonify({'ok': True, 'videoUrl': f'/static/uploads/{filename}'})


@app.route('/upload/community')
def upload_community():
    return render_template('upload_community.html')


@app.route('/upload/question')
def upload_question():
    return render_template('upload_question.html')


@app.route('/live/<int:content_id>')
def live_detail(content_id):
    return render_template('live_detail.html', content_id=content_id)


@app.route('/vod/<int:content_id>')
def vod_detail(content_id):
    return render_template('vod_detail.html', content_id=content_id)


@app.route('/fits/<int:content_id>')
def fits_detail(content_id):
    return render_template('fits_detail.html', content_id=content_id)


@app.route('/community/<int:content_id>')
def community_detail(content_id):
    return render_template('community_detail.html', content_id=content_id)


@app.route('/question/<int:content_id>')
def question_detail(content_id):
    return render_template('question_detail.html', content_id=content_id)


@app.route('/analyze')
def analyze():
    return render_template('analyze.html')


@app.route('/analyze/record')
def analyze_record():
    return render_template('analyze_record.html')


@app.route('/analyze/record/history')
def analyze_record_history():
    return render_template('analyze_record_history.html')


@app.route('/analyze/record/workout')
def analyze_record_workout():
    return render_template('analyze_record_workout.html')


@app.route('/analyze/record/balance')
def analyze_record_balance():
    return render_template('analyze_record_balance.html')


@app.route('/analyze/record/strength')
def analyze_record_strength():
    return render_template('analyze_record_strength.html')


@app.route('/analyze/posture')
def analyze_posture():
    return render_template('analyze_posture.html')


@app.route('/analyze/posture/loading')
def analyze_posture_loading():
    mode = request.args.get('mode', 'upload')
    return render_template('analyze_posture_loading.html', mode=mode)


@app.route('/analyze/posture/realtime')
def analyze_posture_realtime():
    return render_template('analyze_posture_realtime.html')


@app.route('/analyze/posture/report')
def analyze_posture_report():
    mode = request.args.get('mode', 'upload')
    return render_template('analyze_posture_report.html', mode=mode)


@app.route('/pt')
def pt():
    return render_template('pt.html')


@app.route('/pt/live')
def pt_live():
    trainer_id = request.args.get('id', '1')
    return render_template('pt_live.html', trainer_id=trainer_id)


@app.route('/group')
def group():
    return render_template('group.html')


@app.route('/group/create')
def group_create():
    return render_template('group_create.html')


@app.route('/group/main')
def group_main():
    group_id = request.args.get('id', '1')
    return render_template('group_main.html', group_id=group_id)


@app.route('/group/live')
def group_live():
    live_id = request.args.get('id', '1')
    return render_template('group_live.html', live_id=live_id)


@app.route('/group/live/create')
def group_live_create():
    group_id = request.args.get('group_id', '1')
    return render_template('group_live_create.html', group_id=group_id)


@app.route('/group/storage')
def group_storage():
    group_id = request.args.get('group_id', '1')
    return render_template('group_storage.html', group_id=group_id)


@app.route('/group/chat')
def group_chat():
    group_id = request.args.get('group_id', '1')
    chat_type = request.args.get('type', 'all')
    return render_template('group_chat.html', group_id=group_id, chat_type=chat_type)


@app.route('/notification')
def notification():
    return render_template('notification.html')


@app.route('/mypage')
def mypage():
    return render_template('mypage.html')


@app.route('/mypage/detail')
def mypage_detail():
    return render_template('mypage_profile_detail.html')


@app.route('/mypage/friend')
def mypage_friend():
    return render_template('mypage_friends.html')


@app.route('/mypage/friendrequest')
def mypage_friendrequest():
    return render_template('mypage_friend_request.html')


@app.route('/mypage/profile/detail')
def mypage_profile_detail():
    return render_template('mypage_profile_detail.html')


@app.route('/mypage/friends')
def mypage_friends():
    return render_template('mypage_friends.html')


@app.route('/mypage/friend-request')
def mypage_friend_request():
    return render_template('mypage_friend_request.html')


@app.route('/trainer_home')
def trainer_home():
    trainer_id = request.args.get('id')
    return render_template('trainer_home.html', trainer_id=trainer_id)


@app.route('/trainer/chat')
def trainer_chat():
    return render_template('trainer_chat.html')


@app.route('/reward')
def reward():
    return render_template('mypage_reward.html')


@app.route('/reward/earn')
def reward_earn():
    return render_template('mypage_reward_earn.html')


@app.route('/reward/history')
def reward_history():
    return render_template('mypage_reward_history.html')


@app.route('/health/db')
def health_db():
    ok, message = check_db_connection(app.config['DATABASE_URL'])
    status_code = 200 if ok else 500
    return jsonify({'ok': ok, 'message': message}), status_code


if __name__ == '__main__':
    ok, message = check_db_connection(app.config['DATABASE_URL'])
    print(f"[DB] {message}")
    app.run(debug=True)
