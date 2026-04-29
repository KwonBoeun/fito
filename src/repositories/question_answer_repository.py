from sqlalchemy import update
from sqlalchemy.orm import joinedload

from src.database.session import SessionLocal
from src.models.question import Question
from src.models.question_answer import QuestionAnswer
from src.models.question_reply import QuestionReply
from src.models.question_answer_like import QuestionAnswerLike


# ── 답변 생성 ──────────────────────────────────────────
def create_answer(question_id: int, user_id: int, body: str) -> dict:
    with SessionLocal() as session:
        answer = QuestionAnswer(question_id=question_id, user_id=user_id, body=body)
        session.add(answer)
        session.flush()
        session.execute(update(Question).where(Question.id == question_id)
                        .values(answer_count=Question.answer_count + 1))
        session.commit()
        ans = session.query(QuestionAnswer).options(
            joinedload(QuestionAnswer.user)
        ).filter_by(id=answer.id).first()
        return _answer_to_raw(ans)


# ── 답변 소프트 삭제 ───────────────────────────────────
def soft_delete_answer(answer_id: int) -> None:
    with SessionLocal() as session:
        answer = session.get(QuestionAnswer, answer_id)
        if not answer:
            return
        live_replies = session.query(QuestionReply).filter_by(
            answer_id=answer_id, is_deleted=False).count()
        total = 1 + live_replies
        session.execute(update(Question).where(Question.id == answer.question_id)
                        .values(answer_count=Question.answer_count - total))
        answer.is_deleted = True
        session.commit()


# ── 대댓글 생성 ────────────────────────────────────────
def create_reply(answer_id: int, user_id: int, body: str) -> dict:
    with SessionLocal() as session:
        answer = session.get(QuestionAnswer, answer_id)
        question_id = answer.question_id
        reply = QuestionReply(answer_id=answer_id, user_id=user_id, body=body)
        session.add(reply)
        session.flush()
        session.execute(update(QuestionAnswer).where(QuestionAnswer.id == answer_id)
                        .values(reply_count=QuestionAnswer.reply_count + 1))
        session.execute(update(Question).where(Question.id == question_id)
                        .values(answer_count=Question.answer_count + 1))
        session.commit()
        r = session.query(QuestionReply).options(
            joinedload(QuestionReply.user)
        ).filter_by(id=reply.id).first()
        return _reply_to_raw(r)


# ── 대댓글 소프트 삭제 ─────────────────────────────────
def soft_delete_reply(reply_id: int) -> None:
    with SessionLocal() as session:
        reply = session.get(QuestionReply, reply_id)
        if not reply:
            return
        answer = session.get(QuestionAnswer, reply.answer_id)
        session.execute(update(QuestionAnswer).where(QuestionAnswer.id == reply.answer_id)
                        .values(reply_count=QuestionAnswer.reply_count - 1))
        session.execute(update(Question).where(Question.id == answer.question_id)
                        .values(answer_count=Question.answer_count - 1))
        reply.is_deleted = True
        session.commit()


# ── 답변 단건 조회 ─────────────────────────────────────
def get_answer(answer_id: int) -> dict | None:
    with SessionLocal() as session:
        ans = session.query(QuestionAnswer).options(
            joinedload(QuestionAnswer.user)
        ).filter_by(id=answer_id, is_deleted=False).first()
        return _answer_to_raw(ans) if ans else None


# ── 대댓글 단건 조회 ───────────────────────────────────
def get_reply(reply_id: int) -> dict | None:
    with SessionLocal() as session:
        r = session.query(QuestionReply).options(
            joinedload(QuestionReply.user)
        ).filter_by(id=reply_id, is_deleted=False).first()
        return _reply_to_raw(r) if r else None


# ── 답변 채택 토글 ───────────────────────────────────
def toggle_accept_answer(answer_id: int) -> bool:
    """채택 토글. 이미 채택이면 취소. 반환: 채택 여부"""
    with SessionLocal() as session:
        answer = session.get(QuestionAnswer, answer_id)
        if not answer:
            return False
        answer.accepted = not answer.accepted
        session.commit()
        return answer.accepted


# ── 답변 좋아요 토글 ───────────────────────────────────
def toggle_answer_like(answer_id: int, user_id: int) -> tuple:
    with SessionLocal() as session:
        existing = session.query(QuestionAnswerLike).filter_by(
            answer_id=answer_id, user_id=user_id).first()
        if existing:
            session.delete(existing)
            is_liked = False
        else:
            session.add(QuestionAnswerLike(answer_id=answer_id, user_id=user_id))
            is_liked = True
        session.commit()
        count = session.query(QuestionAnswerLike).filter_by(answer_id=answer_id).count()
        return is_liked, count


# ── 답변 좋아요 여부 일괄 조회 ────────────────────────
def get_answer_likes(answer_ids: list, user_id: int) -> dict:
    """{ answer_id: (is_liked, like_count) }"""
    if not user_id or not answer_ids:
        return {}
    with SessionLocal() as session:
        liked_set = {
            row.answer_id
            for row in session.query(QuestionAnswerLike.answer_id)
            .filter(QuestionAnswerLike.answer_id.in_(answer_ids),
                    QuestionAnswerLike.user_id == user_id).all()
        }
        counts = {
            row.answer_id: row.cnt
            for row in session.execute(
                __import__('sqlalchemy').select(
                    QuestionAnswerLike.answer_id,
                    __import__('sqlalchemy').func.count().label('cnt')
                )
                .where(QuestionAnswerLike.answer_id.in_(answer_ids))
                .group_by(QuestionAnswerLike.answer_id)
            ).all()
        }
        return {
            aid: (aid in liked_set, counts.get(aid, 0))
            for aid in answer_ids
        }


# ── 내부 직렬화 ───────────────────────────────────────
def _answer_to_raw(ans: QuestionAnswer) -> dict:
    user = ans.user
    return {
        "id":          ans.id,
        "question_id": ans.question_id,
        "user_id":     ans.user_id,
        "body":        ans.body,
        "reply_count": ans.reply_count,
        "accepted":    ans.accepted,
        "created_at":  ans.created_at,
        "_nickname":   user.nickname if user else None,
    }


def _reply_to_raw(r: QuestionReply) -> dict:
    user = r.user
    return {
        "id":         r.id,
        "answer_id":  r.answer_id,
        "user_id":    r.user_id,
        "body":       r.body,
        "created_at": r.created_at,
        "_nickname":  user.nickname if user else None,
    }