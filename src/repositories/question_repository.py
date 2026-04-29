import math
from datetime import datetime, timezone

from sqlalchemy import or_, update
from sqlalchemy.orm import joinedload

from src.database.session import SessionLocal
from src.models.question import Question
from src.models.question_answer import QuestionAnswer
from src.models.question_reply import QuestionReply
from src.models.question_reactions import QuestionLike, QuestionBookmark, QuestionReport
from src.models.hashtag import Hashtag, QuestionHashtag
from src.models.user import User


def _popularity_score(like_count: int, created_at: datetime) -> float:
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    t = (datetime.now(timezone.utc) - created_at).total_seconds() / 3600
    return math.log(like_count + 1) * math.exp(-t / 24)


def _load_question(session, question_id: int = None, filter_expr=None):
    """questions + 관계 전체 조인 (문자열 금지 → 클래스 직접 참조)"""
    q = session.query(Question).options(
        joinedload(Question.user),
        joinedload(Question.images),
        joinedload(Question.hashtags).joinedload(QuestionHashtag.hashtag),
        joinedload(Question.answers).joinedload(QuestionAnswer.user),
        joinedload(Question.answers).joinedload(QuestionAnswer.replies).joinedload(QuestionReply.user),
    )
    if question_id is not None:
        q = q.filter(Question.id == question_id, Question.is_deleted == False)
    if filter_expr is not None:
        q = q.filter(filter_expr)
    return q


def get_popular(limit: int = 10) -> list:
    with SessionLocal() as session:
        questions = (
            session.query(Question)
            .options(
                joinedload(Question.user),
                joinedload(Question.images),
                joinedload(Question.hashtags).joinedload(QuestionHashtag.hashtag),
            )
            .filter(Question.is_deleted == False)
            .all()
        )
        questions.sort(key=lambda q: _popularity_score(q.like_count, q.created_at), reverse=True)
        return questions[:limit]


def get_popular_brief(limit: int = 2) -> list:
    return get_popular(limit=limit)


def get_recommended(user_id=None, limit: int = 15) -> list:
    return get_popular(limit=limit)


def get_recommended_brief(user_id=None, limit: int = 2) -> list:
    return get_popular(limit=limit)


def get_by_id(question_id: int):
    with SessionLocal() as session:
        return _load_question(session, question_id=question_id).first()


def create(user_id: int, title: str, body: str,
           is_anon: bool = True, is_profile_visible: bool = False,
           reward: int = 0) -> Question:
    with SessionLocal() as session:
        q = Question(user_id=user_id, title=title, body=body,
                     is_anon=is_anon, is_profile_visible=is_profile_visible,
                     reward=reward)
        session.add(q)
        session.commit()
        session.refresh(q)
        return q


def soft_delete(question_id: int) -> None:
    with SessionLocal() as session:
        session.execute(update(Question).where(Question.id == question_id).values(is_deleted=True))
        session.commit()


def search(q: str, sort: str = "popular", limit: int = 30) -> list:
    keyword = f"%{q}%"
    with SessionLocal() as session:
        base = (
            session.query(Question)
            .options(
                joinedload(Question.user),
                joinedload(Question.images),
                joinedload(Question.hashtags).joinedload(QuestionHashtag.hashtag),
            )
            .join(User, Question.user_id == User.id)
            .outerjoin(QuestionHashtag, QuestionHashtag.question_id == Question.id)
            .outerjoin(Hashtag, Hashtag.id == QuestionHashtag.hashtag_id)
            .filter(
                Question.is_deleted == False,
                or_(Question.title.ilike(keyword), Question.body.ilike(keyword),
                    User.nickname.ilike(keyword), Hashtag.name.ilike(keyword)),
            )
            .distinct()
        )
        if sort == "recent":
            results = base.order_by(Question.created_at.desc()).limit(limit).all()
        else:
            results = base.all()
            results.sort(key=lambda x: _popularity_score(x.like_count, x.created_at), reverse=True)
            results = results[:limit]
        return results


def toggle_like(question_id: int, user_id: int) -> tuple:
    with SessionLocal() as session:
        try:
            existing = session.query(QuestionLike).filter_by(
                question_id=question_id, user_id=user_id).first()
            if existing:
                session.delete(existing)
                session.execute(update(Question).where(Question.id == question_id)
                                .values(like_count=Question.like_count - 1))
                is_liked = False
            else:
                session.add(QuestionLike(question_id=question_id, user_id=user_id))
                session.execute(update(Question).where(Question.id == question_id)
                                .values(like_count=Question.like_count + 1))
                is_liked = True
            session.commit()
        except Exception:
            session.rollback()
            raise
        session.expire_all()
        q = session.get(Question, question_id)
        return is_liked, q.like_count


def toggle_bookmark(question_id: int, user_id: int) -> tuple:
    with SessionLocal() as session:
        try:
            existing = session.query(QuestionBookmark).filter_by(
                question_id=question_id, user_id=user_id).first()
            if existing:
                session.delete(existing)
                session.execute(update(Question).where(Question.id == question_id)
                                .values(bookmark_count=Question.bookmark_count - 1))
                is_bookmarked = False
            else:
                session.add(QuestionBookmark(question_id=question_id, user_id=user_id))
                session.execute(update(Question).where(Question.id == question_id)
                                .values(bookmark_count=Question.bookmark_count + 1))
                is_bookmarked = True
            session.commit()
        except Exception:
            session.rollback()
            raise
        session.expire_all()
        q = session.get(Question, question_id)
        return is_bookmarked, q.bookmark_count


def check_duplicate_report(question_id: int, user_id: int) -> bool:
    with SessionLocal() as session:
        return session.query(QuestionReport).filter_by(
            question_id=question_id, user_id=user_id).first() is not None


def create_report(question_id: int, user_id: int, reason: str) -> None:
    with SessionLocal() as session:
        session.add(QuestionReport(question_id=question_id, user_id=user_id, reason=reason))
        session.commit()


def get_user_reactions(question_id: int, user_id) -> dict:
    if not user_id:
        return {"is_liked": False, "is_bookmarked": False}
    with SessionLocal() as session:
        is_liked = session.query(QuestionLike).filter_by(
            question_id=question_id, user_id=user_id).first() is not None
        is_bookmarked = session.query(QuestionBookmark).filter_by(
            question_id=question_id, user_id=user_id).first() is not None
        return {"is_liked": is_liked, "is_bookmarked": is_bookmarked}


def increment_view(question_id: int) -> None:
    with SessionLocal() as session:
        session.execute(update(Question).where(Question.id == question_id)
                        .values(view_count=Question.view_count + 1))
        session.commit()