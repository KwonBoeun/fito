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

if __name__ == '__main__':
    app.run(debug=True)