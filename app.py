from flask import Flask, render_template, jsonify, request
from src.mock_data import get_popular_contents, get_recommend_contents, get_search_suggests

app = Flask(__name__)

# ──────────────────────────────────────────
# 페이지 라우트
# ──────────────────────────────────────────

@app.route('/')
def home():
    """메인 홈 화면"""
    return render_template('home.html')


# ──────────────────────────────────────────
# API 라우트
# ──────────────────────────────────────────

@app.route('/api/popular')
def api_popular():
    """인기 콘텐츠 반환
    Query param:
        category (str): all | live | vod | fits | community | question
    """
    category = request.args.get('category', 'all')
    data = get_popular_contents(category)
    return jsonify({'status': 'ok', 'data': data})


@app.route('/api/recommend')
def api_recommend():
    """추천 피드 반환
    Query param:
        category (str): all | live | vod | fits | community | question
        page      (int): 페이지 번호 (기본 1)
    """
    category = request.args.get('category', 'all')
    page = int(request.args.get('page', 1))
    data = get_recommend_contents(category, page)
    return jsonify({'status': 'ok', 'data': data})


@app.route('/api/search/suggest')
def api_search_suggest():
    """연관 검색어 반환
    Query param:
        q (str): 검색어
    """
    query = request.args.get('q', '').strip()
    results = get_search_suggests(query)
    return jsonify({'status': 'ok', 'data': results})


# ──────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)
