"""
diagnose.py
실행: python diagnose.py

API 라우트 등록 여부 + 실제 질문 작성/좋아요 동작 전체 테스트
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))

# ── 1. app 임포트해서 라우트 등록 확인 ──
print("=== 1. 라우트 등록 확인 ===")
try:
    from app import app
    rules = [str(r) for r in app.url_map.iter_rules()]
    q_rules = [r for r in rules if 'question' in r or 'hashtag' in r]
    if q_rules:
        print(f"✅ 질문 관련 라우트 {len(q_rules)}개 등록됨:")
        for r in sorted(q_rules):
            print(f"  {r}")
    else:
        print("❌ 질문 관련 라우트 없음!")
        print("   → app.py에 아래 두 줄이 있는지 확인하세요:")
        print("   from src.routes.question_routes import register_question_routes")
        print("   register_question_routes(app)")
        sys.exit(1)
except Exception as e:
    print(f"❌ app 임포트 실패: {e}")
    import traceback; traceback.print_exc()
    sys.exit(1)

# ── 2. 테스트 클라이언트로 실제 API 호출 ──
print("\n=== 2. API 실제 호출 테스트 ===")
client = app.test_client()
app.config['TESTING'] = True

# 2-1. 질문 작성
print("\n[2-1] POST /api/questions")
res = client.post('/api/questions',
    json={'title': '진단 테스트 질문', 'body': '테스트 본문입니다', 'tags': ['#테스트']},
    headers={'X-User-Id': '1'})
print(f"  status: {res.status_code}")
data = json.loads(res.data)
print(f"  body: {json.dumps(data, ensure_ascii=False, indent=2)}")

if data.get('status') != 'ok':
    print("  ❌ 질문 작성 실패!")
    sys.exit(1)

q_id = data['data']['id']
print(f"  ✅ 질문 작성 성공 → id={q_id}")

# 2-2. 질문 조회
print(f"\n[2-2] GET /api/questions/{q_id}")
res = client.get(f'/api/questions/{q_id}', headers={'X-User-Id': '1'})
data = json.loads(res.data)
print(f"  status: {res.status_code}")
if data.get('status') == 'ok':
    d = data['data']
    print(f"  ✅ 조회 성공 → likes={d['likes']} comments={d['comments']} bookmarks={d['bookmarks']}")
else:
    print(f"  ❌ 조회 실패: {data}")

# 2-3. 좋아요
print(f"\n[2-3] POST /api/questions/{q_id}/like")
res = client.post(f'/api/questions/{q_id}/like', headers={'X-User-Id': '1'})
data = json.loads(res.data)
print(f"  status: {res.status_code}")
if data.get('status') == 'ok':
    print(f"  ✅ 좋아요 성공 → is_liked={data['data']['is_liked']} likes={data['data']['likes']}")
else:
    print(f"  ❌ 좋아요 실패: {data}")

# 2-4. 다시 조회해서 likes=1 확인
res = client.get(f'/api/questions/{q_id}', headers={'X-User-Id': '1'})
data = json.loads(res.data)
if data.get('status') == 'ok':
    d = data['data']
    print(f"\n[2-4] 재조회 → likes={d['likes']} (1이어야 정상)")
    if d['likes'] == 1:
        print("  ✅ 좋아요 DB 저장 정상!")
    else:
        print(f"  ❌ likes={d['likes']} — DB에 저장 안 됨")

# 2-5. 답변 작성
print(f"\n[2-5] POST /api/questions/{q_id}/answers")
res = client.post(f'/api/questions/{q_id}/answers',
    json={'body': '테스트 답변'},
    headers={'X-User-Id': '1', 'Content-Type': 'application/json'})
data = json.loads(res.data)
print(f"  status: {res.status_code}")
if data.get('status') == 'ok':
    a_id = data['data']['_id']
    print(f"  ✅ 답변 작성 성공 → id={a_id}")
else:
    print(f"  ❌ 답변 실패: {data}")

# 2-6. 인기 목록에 테스트 질문 보이는지
print(f"\n[2-6] GET /api/questions/popular")
res = client.get('/api/questions/popular')
data = json.loads(res.data)
ids = [d['id'] for d in data.get('data', [])]
if q_id in ids:
    print(f"  ✅ 인기 목록에 id={q_id} 포함")
else:
    print(f"  ℹ️  인기 목록: {ids} (방금 만든 질문은 좋아요 적어서 하위일 수 있음)")

# ── 3. 테스트 데이터 정리 ──
print(f"\n=== 3. 테스트 데이터 정리 ===")
res = client.delete(f'/api/questions/{q_id}', headers={'X-User-Id': '1'})
data = json.loads(res.data)
if data.get('status') == 'ok':
    print(f"  ✅ 테스트 질문 id={q_id} 삭제 완료")
else:
    print(f"  ⚠️  삭제 실패: {data}")

print("\n=== 진단 완료 ===")
print("모든 항목 ✅면 API는 정상 → 브라우저에서 X-User-Id 헤더 확인 필요")
print("❌ 항목 있으면 해당 에러 메시지 공유해주세요")