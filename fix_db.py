"""
fix_db.py
실행: python fix_db.py

1. question_likes / question_bookmarks / question_answers / question_replies 의
   user_id FK 제약을 DB에서 직접 제거
2. like_count / answer_count 실제 row 수로 동기화
3. 테스트용 유저 id=1 없으면 생성
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from src.db import get_database_url
import psycopg

url = get_database_url()
print(f"[DB] 연결 중: {url[:40]}...")

with psycopg.connect(url) as conn:
    with conn.cursor() as cur:

        # ── 1. 현재 FK 제약 목록 조회 ──
        cur.execute("""
            SELECT tc.table_name, tc.constraint_name, kcu.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name IN (
                'question_likes','question_bookmarks',
                'question_answers','question_replies','question_reports'
              )
              AND kcu.column_name = 'user_id'
        """)
        rows = cur.fetchall()
        print(f"\n[FK 제약 현황] user_id FK {len(rows)}개 발견:")
        for table, constraint, col in rows:
            print(f"  {table}.{col} → {constraint}")

        # ── 2. user_id FK 제약 제거 ──
        removed = 0
        for table, constraint, col in rows:
            print(f"\n  DROP CONSTRAINT {constraint} from {table}...")
            cur.execute(f'ALTER TABLE "{table}" DROP CONSTRAINT IF EXISTS "{constraint}"')
            removed += 1

        if removed == 0:
            print("\n  ℹ️  제거할 FK 제약 없음 (이미 제거됨)")
        else:
            print(f"\n  ✅ {removed}개 FK 제약 제거 완료")

        # ── 3. 테스트 유저 id=1 확인 및 생성 ──
        cur.execute("SELECT id FROM users WHERE id = 1")
        if not cur.fetchone():
            print("\n[유저] id=1 유저 없음 → 테스트 유저 생성...")
            try:
                cur.execute("""
                    INSERT INTO users (id, name, contact, username, password_hash, member_type, nickname)
                    VALUES (1, '테스트', '010-0000-0000', 'test_user',
                            'hashed_pw', 'user', '테스트유저')
                    ON CONFLICT (id) DO NOTHING
                """)
                print("  ✅ 테스트 유저 생성 완료 (id=1, nickname=테스트유저)")
            except Exception as e:
                print(f"  ⚠️  유저 생성 실패 (무시): {e}")
        else:
            print("\n[유저] id=1 유저 이미 존재 ✅")

        # ── 4. like_count / answer_count / bookmark_count 동기화 ──
        print("\n[카운터 동기화]")

        cur.execute("""
            UPDATE questions q
            SET like_count = (
                SELECT COUNT(*) FROM question_likes ql WHERE ql.question_id = q.id
            )
            WHERE q.is_deleted = false
        """)
        print(f"  like_count 동기화: {cur.rowcount}행")

        cur.execute("""
            UPDATE questions q
            SET bookmark_count = (
                SELECT COUNT(*) FROM question_bookmarks qb WHERE qb.question_id = q.id
            )
            WHERE q.is_deleted = false
        """)
        print(f"  bookmark_count 동기화: {cur.rowcount}행")

        cur.execute("""
            UPDATE questions q
            SET answer_count = (
                SELECT COUNT(*) FROM question_answers qa
                WHERE qa.question_id = q.id AND qa.is_deleted = false
            ) + (
                SELECT COUNT(*) FROM question_replies qr
                JOIN question_answers qa2 ON qr.answer_id = qa2.id
                WHERE qa2.question_id = q.id
                  AND qr.is_deleted = false
                  AND qa2.is_deleted = false
            )
            WHERE q.is_deleted = false
        """)
        print(f"  answer_count 동기화: {cur.rowcount}행")

        # ── 5. 현재 질문 상태 확인 ──
        cur.execute("""
            SELECT id, title, like_count, answer_count, bookmark_count
            FROM questions
            WHERE is_deleted = false
            ORDER BY id
            LIMIT 10
        """)
        rows = cur.fetchall()
        print(f"\n[질문 현황] {len(rows)}개:")
        for qid, title, lc, ac, bc in rows:
            print(f"  id={qid} | 좋아요={lc} 댓글={ac} 북마크={bc} | {title[:30]}")

        conn.commit()
        print("\n✅ 모든 작업 완료!")
        print("\n이제 서버 재시작 후 테스트하세요: python app.py")