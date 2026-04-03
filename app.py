from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('main.html')

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

if __name__ == '__main__':
    app.run(debug=True)