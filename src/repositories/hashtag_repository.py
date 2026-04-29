from src.database.session import SessionLocal
from src.models.hashtag import Hashtag, QuestionHashtag


def get_or_create(session, name: str) -> Hashtag:
    """# 제거 후 소문자 저장. 없으면 생성. session은 외부에서 전달."""
    clean = name.lstrip("#").strip().lower()
    tag = session.query(Hashtag).filter_by(name=clean).first()
    if not tag:
        tag = Hashtag(name=clean)
        session.add(tag)
        session.flush()
    return tag


def link_to_question(question_id: int, tag_names: list[str]) -> None:
    """기존 연결 삭제 후 재연결. 최대 5개는 service에서 검증."""
    with SessionLocal() as session:
        session.query(QuestionHashtag).filter_by(question_id=question_id).delete()
        for order, name in enumerate(tag_names):
            tag = get_or_create(session, name)
            session.add(QuestionHashtag(
                question_id=question_id,
                hashtag_id=tag.id,
                order=order,
            ))
        session.commit()


def autocomplete(q: str, limit: int = 10) -> list[str]:
    clean = q.lstrip("#").strip().lower()
    with SessionLocal() as session:
        tags = session.query(Hashtag).filter(
            Hashtag.name.ilike(f"{clean}%")
        ).limit(limit).all()
        return [f"#{t.name}" for t in tags]