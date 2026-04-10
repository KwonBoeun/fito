from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html')


@app.route('/upload/live')
def upload_live():
    return render_template('upload_live.html')

# ── 상세 페이지 ──
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

# ── 분석 메인 ──
@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

# ── 기록 분석 ──
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

# ── 자세 분석 ──
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

# ── PT 메인 ──
@app.route('/pt')
def pt():
    return render_template('pt.html')

# ── 트레이너 라이브 ──
@app.route('/pt/live')
def pt_live():
    trainer_id = request.args.get('id', '1')
    return render_template('pt_live.html', trainer_id=trainer_id)

# ── 그룹 목록/검색 ──
@app.route('/group')
def group():
    return render_template('group.html')

# ── 그룹 만들기 ──
@app.route('/group/create')
def group_create():
    return render_template('group_create.html')

# ── 그룹 메인 ──
@app.route('/group/main')
def group_main():
    group_id = request.args.get('id', '1')
    return render_template('group_main.html', group_id=group_id)

# ── 그룹 라이브 ──
@app.route('/group/live')
def group_live():
    live_id = request.args.get('id', '1')
    return render_template('group_live.html', live_id=live_id)

# ── 그룹 라이브 만들기 ──
@app.route('/group/live/create')
def group_live_create():
    group_id = request.args.get('group_id', '1')
    return render_template('group_live_create.html', group_id=group_id)

# ── 그룹 라이브 저장소 ──
@app.route('/group/storage')
def group_storage():
    group_id = request.args.get('group_id', '1')
    return render_template('group_storage.html', group_id=group_id)

# ── 그룹 채팅 ──
@app.route('/group/chat')
def group_chat():
    group_id = request.args.get('group_id', '1')
    chat_type = request.args.get('type', 'all')
    return render_template('group_chat.html', group_id=group_id, chat_type=chat_type)

@app.route('/notification')
def notification():
    return render_template('notification.html')

# ── MY 페이지 ──
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

# ── MY 프로필 상세 (게시물) ──
@app.route('/mypage/profile/detail')
def mypage_profile_detail():
    return render_template('mypage_profile_detail.html')

# ── MY 친구 ──
@app.route('/mypage/friends')
def mypage_friends():
    return render_template('mypage_friends.html')

# ── MY 친구 요청 ──
@app.route('/mypage/friend-request')
def mypage_friend_request():
    return render_template('mypage_friend_request.html')

@app.route('/trainer_home')
def trainer_home():
    trainer_id = request.args.get('id')
    return render_template('trainer_home.html', trainer_id=trainer_id)

if __name__ == '__main__':
    app.run(debug=True)