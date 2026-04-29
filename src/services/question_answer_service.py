from datetime import datetime, timezone

from src.repositories import question_answer_repository as ans_repo

MAX_BODY_LEN = 1000


def _validate_body(body: str) -> str | None:
    if not body or not body.strip():
        return "내용을 입력해주세요."
    if len(body) > MAX_BODY_LEN:
        return f"내용은 최대 {MAX_BODY_LEN}자입니다."
    return None


def _time_str(created_at: datetime) -> str:
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    h = (datetime.now(timezone.utc) - created_at).total_seconds() / 3600
    if h < 1:
        m = int(h * 60)
        return f"{m}분 전" if m > 0 else "방금 전"
    if h < 24:
        return f"{int(h)}시간 전"
    if h < 168:
        return f"{int(h / 24)}일 전"
    return f"{int(h / 168)}주 전"


# ── 답변 작성 ─────────────────────────────────────────
def create_answer(question_id: int, user_id: int, body: str) -> dict:
    err = _validate_body(body)
    if err:
        raise ValueError(err)
    raw = ans_repo.create_answer(question_id, user_id, body.strip())
    return _format_answer(raw, current_user_id=user_id)


# ── 답변 삭제 ─────────────────────────────────────────
def delete_answer(answer_id: int, current_user_id: int) -> None:
    raw = ans_repo.get_answer(answer_id)
    if not raw:
        raise LookupError("답변을 찾을 수 없습니다.")
    if raw["user_id"] != current_user_id:
        raise PermissionError("삭제 권한이 없습니다.")
    ans_repo.soft_delete_answer(answer_id)


# ── 대댓글 작성 ───────────────────────────────────────
def create_reply(answer_id: int, user_id: int, body: str) -> dict:
    err = _validate_body(body)
    if err:
        raise ValueError(err)
    raw = ans_repo.create_reply(answer_id, user_id, body.strip())
    return _format_reply(raw, current_user_id=user_id)


# ── 대댓글 삭제 ───────────────────────────────────────
def delete_reply(reply_id: int, current_user_id: int) -> None:
    raw = ans_repo.get_reply(reply_id)
    if not raw:
        raise LookupError("대댓글을 찾을 수 없습니다.")
    if raw["user_id"] != current_user_id:
        raise PermissionError("삭제 권한이 없습니다.")
    ans_repo.soft_delete_reply(reply_id)


# ── 직렬화 ────────────────────────────────────────────
# 프론트 renderAnswer: { name, text, likes, time, accepted, replies }
def _format_answer(raw: dict, current_user_id: int = None) -> dict:
    return {
        "name":     raw["_nickname"] or "(탈퇴한 사용자)",
        "text":     raw["body"],
        "likes":    0,
        "time":     _time_str(raw["created_at"]),
        "accepted": raw["accepted"],
        "replies":  [],
        "_id":      raw["id"],
        "_is_mine": raw["user_id"] == current_user_id if current_user_id else False,
    }


# 프론트 reply: { name, text, likes, time }
def _format_reply(raw: dict, current_user_id: int = None) -> dict:
    return {
        "name":     raw["_nickname"] or "(탈퇴한 사용자)",
        "text":     raw["body"],
        "likes":    0,
        "time":     _time_str(raw["created_at"]),
        "_id":      raw["id"],
        "_is_mine": raw["user_id"] == current_user_id if current_user_id else False,
    }