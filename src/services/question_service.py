import os
import uuid
from datetime import datetime, timezone

from src.models.question import Question
from src.models.question_image import QuestionImage
from src.database.session import SessionLocal
from src.repositories import question_repository as q_repo
from src.repositories import question_answer_repository as ans_repo
from src.repositories import hashtag_repository as tag_repo

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"}
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "static/uploads/questions")
MAX_TAGS = 5
MAX_TAG_LEN = 15
VALID_REASONS = {"spam", "adult", "abuse", "other"}


def _hours_elapsed(created_at: datetime) -> float:
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - created_at).total_seconds() / 3600


def _author_name(user, is_anon: bool = False) -> str:
    if is_anon:
        return "익명"
    if not user:
        return "(탈퇴한 사용자)"
    return user.nickname or "알 수 없음"


def _time_str(created_at: datetime) -> str:
    h = _hours_elapsed(created_at)
    if h < 1:
        m = int(h * 60)
        return f"{m}분 전" if m > 0 else "방금 전"
    if h < 24:
        return f"{int(h)}시간 전"
    if h < 168:
        return f"{int(h / 24)}일 전"
    return f"{int(h / 168)}주 전"


# ── 질문 brief 직렬화 ─────────────────────────────────
def build_question_brief(question: Question) -> dict:
    tags = [f"#{qh.hashtag.name}" for qh in sorted(question.hashtags, key=lambda x: x.order)]
    return {
        "id":        question.id,
        "author":    _author_name(question.user, question.is_anon),
        "title":     question.title,
        "body":      question.body,
        "tags":      tags,
        "likes":     question.like_count,
        "comments":  question.answer_count,
        "bookmarks": question.bookmark_count,
        "hasImg":    len(question.images) > 0,
        "h":         _hours_elapsed(question.created_at),
    }


# ── 질문 detail 직렬화 ────────────────────────────────
def build_question_detail(question: Question, current_user_id=None) -> dict:
    reactions = q_repo.get_user_reactions(question.id, current_user_id)
    tags = [f"#{qh.hashtag.name}" for qh in sorted(question.hashtags, key=lambda x: x.order)]

    # 답변 좋아요 일괄 조회
    answer_ids = [ans.id for ans in question.answers if not ans.is_deleted]
    answer_likes = ans_repo.get_answer_likes(answer_ids, current_user_id) if current_user_id else {}

    answers_data = []
    for ans in question.answers:
        if ans.is_deleted:
            continue
        is_liked_ans, like_cnt_ans = answer_likes.get(ans.id, (False, 0))

        replies_data = []
        for r in ans.replies:
            if r.is_deleted:
                continue
            replies_data.append({
                "name":     _author_name(r.user),
                "text":     r.body,
                "likes":    0,
                "time":     _time_str(r.created_at),
                "_id":      r.id,
                "_is_mine": r.user_id == current_user_id if current_user_id else False,
            })

        answers_data.append({
            "name":         _author_name(ans.user),
            "text":         ans.body,
            "likes":        like_cnt_ans,
            "time":         _time_str(ans.created_at),
            "accepted":     ans.accepted,
            "replies":      replies_data,
            "_id":          ans.id,
            "_is_mine":     ans.user_id == current_user_id if current_user_id else False,
            "_is_liked":    is_liked_ans,
        })

    actual_count = sum(1 + len(a["replies"]) for a in answers_data)

    return {
        "id":            question.id,
        "author":        _author_name(question.user, question.is_anon),
        "title":         question.title,
        "body":          question.body,
        "tags":          tags,
        "likes":         question.like_count,
        "comments":      actual_count,
        "bookmarks":     question.bookmark_count,
        "hasImg":        len(question.images) > 0,
        "h":             _hours_elapsed(question.created_at),
        "images":        [img.to_dict() for img in question.images],
        "answers":       answers_data,
        "is_liked":      reactions["is_liked"],
        "is_bookmarked": reactions["is_bookmarked"],
        "is_author":     question.user_id == current_user_id if current_user_id else False,
        "reward":        question.reward,
    }


# ── 유효성 검사 ───────────────────────────────────────
def validate_question(title: str, body: str, tags: list) -> str | None:
    if not title or not title.strip():
        return "제목을 입력해주세요."
    if len(title) > 50:
        return "제목은 최대 50자입니다."
    if not body or not body.strip():
        return "본문을 입력해주세요."
    if len(body) > 500:
        return "본문은 최대 500자입니다."
    if len(tags) > MAX_TAGS:
        return f"해시태그는 최대 {MAX_TAGS}개입니다."
    for tag in tags:
        if len(tag.lstrip("#").strip()) > MAX_TAG_LEN:
            return f"해시태그는 각 {MAX_TAG_LEN}자 이하입니다."
    return None


# ── 질문 생성 ─────────────────────────────────────────
def create_question(user_id: int, title: str, body: str,
                    tags: list, image_files: list,
                    is_anon: bool = True, is_profile: bool = False,
                    reward: int = 0) -> dict:
    error = validate_question(title, body, tags)
    if error:
        raise ValueError(error)

    question = q_repo.create(
        user_id=user_id, title=title.strip(), body=body.strip(),
        is_anon=is_anon, is_profile_visible=is_profile,
        reward=max(0, int(reward)),
    )

    if tags:
        tag_repo.link_to_question(question.id, tags)

    if image_files:
        with SessionLocal() as session:
            for order, file in enumerate(image_files):
                url = _save_image(file)
                session.add(QuestionImage(
                    question_id=question.id, image_url=url,
                    original_filename=file.filename, order=order,
                ))
            session.commit()

    fresh = q_repo.get_by_id(question.id)
    return build_question_brief(fresh)


# ── 질문 삭제 ─────────────────────────────────────────
def delete_question(question_id: int, current_user_id: int) -> None:
    question = q_repo.get_by_id(question_id)
    if not question:
        raise LookupError("질문을 찾을 수 없습니다.")
    if question.user_id != current_user_id:
        raise PermissionError("삭제 권한이 없습니다.")
    q_repo.soft_delete(question_id)


# ── 좋아요 / 북마크 ───────────────────────────────────
def toggle_like(question_id: int, user_id: int) -> dict:
    is_liked, count = q_repo.toggle_like(question_id, user_id)
    return {"is_liked": is_liked, "likes": count}


def toggle_bookmark(question_id: int, user_id: int) -> dict:
    is_bookmarked, count = q_repo.toggle_bookmark(question_id, user_id)
    return {"is_bookmarked": is_bookmarked, "bookmarks": count}


# ── 신고 ──────────────────────────────────────────────
def report_question(question_id: int, user_id: int, reason: str) -> None:
    if not q_repo.get_by_id(question_id):
        raise LookupError("질문을 찾을 수 없습니다.")
    if reason not in VALID_REASONS:
        raise ValueError("reason은 spam/adult/abuse/other 중 하나여야 합니다.")
    if q_repo.check_duplicate_report(question_id, user_id):
        raise ValueError("이미 신고한 질문입니다.")
    q_repo.create_report(question_id, user_id, reason)


# ── 이미지 저장 ───────────────────────────────────────
def _save_image(file) -> str:
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"허용되지 않는 이미지 형식입니다. ({ext})")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    return f"/static/uploads/questions/{filename}"