from flask import Flask, request, jsonify

from src.repositories import question_repository as q_repo
from src.repositories import question_answer_repository as ans_repo
from src.repositories import hashtag_repository as tag_repo
from src.services import question_service as q_svc
from src.services import question_answer_service as ans_svc


# ── 공통 헬퍼 ─────────────────────────────────────────
def ok(data, code: int = 200):
    return jsonify({"status": "ok", "data": data}), code


def err(message: str, code: int = 400):
    return jsonify({"status": "error", "message": message, "code": code}), code


def _current_user_id() -> int | None:
    """
    임시: 헤더 X-User-Id 로 user_id 전달.
    추후 session/JWT 방식으로 교체.
    """
    uid = request.headers.get("X-User-Id")
    return int(uid) if uid else None


def _require_login():
    uid = _current_user_id()
    if not uid:
        return None, err("로그인이 필요합니다.", 401)
    return uid, None


# ── 라우트 등록 함수 (기존 패턴과 동일) ──────────────
def register_question_routes(app: Flask) -> None:

    # ── #1  GET /api/questions/popular ─────────────────
    @app.route("/api/questions/popular", methods=["GET"])
    def questions_popular():
        questions = q_repo.get_popular(limit=10)
        return ok([q_svc.build_question_brief(q) for q in questions])

    # ── #2  GET /api/questions/popular/brief ───────────
    @app.route("/api/questions/popular/brief", methods=["GET"])
    def questions_popular_brief():
        questions = q_repo.get_popular_brief(limit=2)
        return ok([q_svc.build_question_brief(q) for q in questions])

    # ── #3  GET /api/questions/recommended ─────────────
    @app.route("/api/questions/recommended", methods=["GET"])
    def questions_recommended():
        uid = _current_user_id()
        questions = q_repo.get_recommended(user_id=uid, limit=15)
        return ok([q_svc.build_question_brief(q) for q in questions])

    # ── #4  GET /api/questions/recommended/brief ───────
    @app.route("/api/questions/recommended/brief", methods=["GET"])
    def questions_recommended_brief():
        uid = _current_user_id()
        questions = q_repo.get_recommended_brief(user_id=uid, limit=2)
        return ok([q_svc.build_question_brief(q) for q in questions])

    # ── #5  GET /api/questions/search?q=&sort= ─────────
    @app.route("/api/questions/search", methods=["GET"])
    def questions_search():
        q     = request.args.get("q", "").strip()
        sort  = request.args.get("sort", "popular")
        if not q:
            return err("검색어를 입력해주세요.")
        if sort not in ("popular", "recent"):
            sort = "popular"
        results = q_repo.search(q, sort=sort)
        return ok([q_svc.build_question_brief(item) for item in results])

    # ── #6  GET /api/questions/<id> ────────────────────
    @app.route("/api/questions/<int:question_id>", methods=["GET"])
    def questions_detail(question_id):
        question = q_repo.get_by_id(question_id)
        if not question:
            return err("질문을 찾을 수 없습니다.", 404)
        q_repo.increment_view(question_id)
        uid = _current_user_id()
        return ok(q_svc.build_question_detail(question, current_user_id=uid))

    # ── #7  POST /api/questions ────────────────────────
    @app.route("/api/questions", methods=["POST"])
    def questions_create():
        uid, error = _require_login()
        if error:
            return error

        if request.content_type and "application/json" in request.content_type:
            data       = request.get_json() or {}
            title      = data.get("title", "")
            body       = data.get("body", "")
            tags       = data.get("tags", [])
            is_anon    = bool(data.get("isAnon", True))
            is_profile = bool(data.get("isProfile", False))
            reward     = int(data.get("reward", 0) or 0)
            files      = []
        else:
            title      = request.form.get("title", "")
            body       = request.form.get("body", "")
            tags       = request.form.getlist("tags")
            is_anon    = request.form.get("isAnon", "true").lower() != "false"
            is_profile = request.form.get("isProfile", "false").lower() == "true"
            reward     = int(request.form.get("reward", 0) or 0)
            files      = request.files.getlist("images")

        try:
            result = q_svc.create_question(
                uid, title, body, tags, files,
                is_anon=is_anon, is_profile=is_profile, reward=reward,
            )
            return ok(result, 201)
        except ValueError as e:
            return err(str(e))

    # ── #8  DELETE /api/questions/<id> ─────────────────
    @app.route("/api/questions/<int:question_id>", methods=["DELETE"])
    def questions_delete(question_id):
        uid, error = _require_login()
        if error:
            return error
        try:
            q_svc.delete_question(question_id, uid)
            return ok({"message": "삭제되었습니다."})
        except LookupError as e:
            return err(str(e), 404)
        except PermissionError as e:
            return err(str(e), 403)

    # ── #9  POST /api/questions/<id>/like ──────────────
    @app.route("/api/questions/<int:question_id>/like", methods=["POST"])
    def questions_like(question_id):
        uid, error = _require_login()
        if error:
            return error
        if not q_repo.get_by_id(question_id):
            return err("질문을 찾을 수 없습니다.", 404)
        return ok(q_svc.toggle_like(question_id, uid))

    # ── #10 POST /api/questions/<id>/bookmark ──────────
    @app.route("/api/questions/<int:question_id>/bookmark", methods=["POST"])
    def questions_bookmark(question_id):
        uid, error = _require_login()
        if error:
            return error
        if not q_repo.get_by_id(question_id):
            return err("질문을 찾을 수 없습니다.", 404)
        return ok(q_svc.toggle_bookmark(question_id, uid))

    # ── #11 POST /api/questions/<id>/report ────────────
    @app.route("/api/questions/<int:question_id>/report", methods=["POST"])
    def questions_report(question_id):
        uid, error = _require_login()
        if error:
            return error
        if not q_repo.get_by_id(question_id):
            return err("질문을 찾을 수 없습니다.", 404)
        data   = request.get_json() or {}
        reason = data.get("reason", "")
        try:
            q_svc.report_question(question_id, uid, reason)
            return ok({"message": "신고가 접수되었습니다."})
        except ValueError as e:
            return err(str(e))

    # ── #12 POST /api/questions/<id>/answers ───────────
    @app.route("/api/questions/<int:question_id>/answers", methods=["POST"])
    def questions_create_answer(question_id):
        uid, error = _require_login()
        if error:
            return error
        if not q_repo.get_by_id(question_id):
            return err("질문을 찾을 수 없습니다.", 404)
        data = request.get_json() or {}
        body = data.get("body", "")
        try:
            return ok(ans_svc.create_answer(question_id, uid, body), 201)
        except ValueError as e:
            return err(str(e))

    # ── #13 DELETE /api/questions/<id>/answers/<aid> ───
    @app.route("/api/questions/<int:question_id>/answers/<int:answer_id>", methods=["DELETE"])
    def questions_delete_answer(question_id, answer_id):
        uid, error = _require_login()
        if error:
            return error
        try:
            ans_svc.delete_answer(answer_id, uid)
            return ok({"message": "답변이 삭제되었습니다."})
        except LookupError as e:
            return err(str(e), 404)
        except PermissionError as e:
            return err(str(e), 403)

    # ── #14 POST /api/questions/<id>/answers/<aid>/replies
    @app.route("/api/questions/<int:question_id>/answers/<int:answer_id>/replies", methods=["POST"])
    def questions_create_reply(question_id, answer_id):
        uid, error = _require_login()
        if error:
            return error
        data = request.get_json() or {}
        body = data.get("body", "")
        try:
            return ok(ans_svc.create_reply(answer_id, uid, body), 201)
        except ValueError as e:
            return err(str(e))

    # ── #15 DELETE /api/questions/<id>/answers/<aid>/replies/<rid>
    @app.route("/api/questions/<int:question_id>/answers/<int:answer_id>/replies/<int:reply_id>", methods=["DELETE"])
    def questions_delete_reply(question_id, answer_id, reply_id):
        uid, error = _require_login()
        if error:
            return error
        try:
            ans_svc.delete_reply(reply_id, uid)
            return ok({"message": "대댓글이 삭제되었습니다."})
        except LookupError as e:
            return err(str(e), 404)
        except PermissionError as e:
            return err(str(e), 403)

    # ── #16 GET /api/hashtags/autocomplete?q= ──────────
    @app.route("/api/hashtags/autocomplete", methods=["GET"])
    def hashtags_autocomplete():
        q = request.args.get("q", "").strip()
        if not q:
            return ok([])
        return ok(tag_repo.autocomplete(q))

    # ── #18 POST /api/questions/<id>/answers/<aid>/accept ──
    @app.route("/api/questions/<int:question_id>/answers/<int:answer_id>/accept", methods=["POST"])
    def questions_accept_answer(question_id, answer_id):
        uid, error = _require_login()
        if error:
            return error
        question = q_repo.get_by_id(question_id)
        if not question:
            return err("질문을 찾을 수 없습니다.", 404)
        if question.user_id != uid:
            return err("질문 작성자만 채택할 수 있습니다.", 403)
        raw = ans_repo.get_answer(answer_id)
        if not raw:
            return err("답변을 찾을 수 없습니다.", 404)
        is_accepted = ans_repo.toggle_accept_answer(answer_id)
        return ok({"accepted": is_accepted})

    # ── #17 POST /api/questions/<id>/answers/<aid>/like ──
    @app.route("/api/questions/<int:question_id>/answers/<int:answer_id>/like", methods=["POST"])
    def questions_answer_like(question_id, answer_id):
        uid, error = _require_login()
        if error:
            return error
        raw = ans_repo.get_answer(answer_id)
        if not raw:
            return err("답변을 찾을 수 없습니다.", 404)
        is_liked, count = ans_repo.toggle_answer_like(answer_id, uid)
        return ok({"is_liked": is_liked, "likes": count})