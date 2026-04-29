from sqlalchemy import SmallInteger, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.database.session import Base


class Hashtag(Base):
    """해시태그 마스터. name = # 제외, 소문자 저장. 최대 15자."""
    __tablename__ = "hashtags"

    id   : Mapped[int] = mapped_column(primary_key=True)
    name : Mapped[str] = mapped_column(String(15), unique=True, nullable=False)


class QuestionHashtag(Base):
    """질문-해시태그 다대다. order로 입력 순서 유지."""
    __tablename__ = "question_hashtags"

    question_id : Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    hashtag_id  : Mapped[int] = mapped_column(ForeignKey("hashtags.id", ondelete="CASCADE"), primary_key=True)
    order       : Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)

    hashtag = relationship("Hashtag")