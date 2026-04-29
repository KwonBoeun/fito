"""
check_db.py
실행: python check_db.py

DB 상태 전체 진단
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from src.db import get_database_url
import psycopg

url = get_database_url()

with psycopg.connect(url) as conn:
    with conn.cursor() as cur:

        # ── 1. 테이블 목록 ──
        cur.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [r[0] for r in cur.fetchall()]
        print("=== 현재 테이블 목록 ===")
        for t in tables:
            print(f"  {t}")

        # ── 2. question 관련 테이블 있는지 확인 ──
        q_tables = [t for t in tables if 'question' in t or 'hashtag' in t]
        print(f"\n=== question 관련 테이블 {len(q_tables)}개 ===")
        for t in q_tables:
            cur.execute(f'SELECT COUNT(*) FROM "{t}"')
            cnt = cur.fetchone()[0]
            print(f"  {t}: {cnt}행")

        # ── 3. questions 테이블 없으면 생성 ──
        if 'questions' not in tables:
            print("\n❌ questions 테이블 없음 → 생성 시도...")
            try:
                # session.py의 Base.metadata.create_all() 호출
                from src.database.session import Base, engine
                import src.models.user       # noqa
                import src.models.question   # noqa
                import src.models.question_answer  # noqa
                import src.models.question_reply   # noqa
                import src.models.question_reactions  # noqa
                import src.models.question_image   # noqa
                import src.models.hashtag          # noqa
                Base.metadata.create_all(bind=engine)
                print("✅ 테이블 생성 완료 → 서버 재시작 후 테스트하세요")
            except Exception as e:
                print(f"❌ 테이블 생성 실패: {e}")
        else:
            print("\n✅ questions 테이블 존재")

            # ── 4. 직접 INSERT 테스트 ──
            print("\n=== 직접 INSERT 테스트 ===")
            try:
                cur.execute("""
                    INSERT INTO questions
                      (user_id, title, body, like_count, answer_count,
                       bookmark_count, view_count, is_anon, is_profile_visible,
                       reward, is_deleted)
                    VALUES
                      (1, '테스트 질문', '테스트 본문', 0, 0, 0, 0,
                       true, false, 0, false)
                    RETURNING id
                """)
                new_id = cur.fetchone()[0]
                conn.commit()
                print(f"  ✅ INSERT 성공 → id={new_id}")

                # 바로 삭제
                cur.execute("DELETE FROM questions WHERE id = %s", (new_id,))
                conn.commit()
                print(f"  ✅ 테스트 row 삭제 완료")
            except Exception as e:
                print(f"  ❌ INSERT 실패: {e}")
                conn.rollback()

        # ── 5. users 테이블 id=1 확인 ──
        if 'users' in tables:
            cur.execute("SELECT id, username, nickname FROM users LIMIT 5")
            users = cur.fetchall()
            print(f"\n=== users 현황 (최대 5개) ===")
            for u in users:
                print(f"  id={u[0]} username={u[1]} nickname={u[2]}")